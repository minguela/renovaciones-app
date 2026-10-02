import { Pool } from '@neondatabase/serverless';
import { test, expect } from '@playwright/test';
import { IdentityConflictError, linkClerkToLegacyOwner, provisionClerkOwner } from '../../api/clerk-identity-service';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test.skip(!testDatabaseUrl, 'Set TEST_DATABASE_URL to run isolated Postgres identity integration checks.');

test('Postgres enforces atomic owner/profile/link creation and rejects case-insensitive identity collisions', async () => {
  const pool = new Pool({ connectionString: testDatabaseUrl! });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NULL
      ) ON COMMIT DROP`);
    await client.query('CREATE UNIQUE INDEX users_test_email_ci ON users (lower(email))');
    await client.query(`CREATE TEMP TABLE profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        notifications_enabled BOOLEAN NOT NULL,
        notification_method TEXT NOT NULL
      ) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE auth_identity_links (
        clerk_user_id TEXT PRIMARY KEY,
        owner_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
        linked_by TEXT NOT NULL
      ) ON COMMIT DROP`);

    const owner = await provisionClerkOwner(client, 'clerk_new_1', 'Fresh@Example.test');
    expect(owner.email).toBe('fresh@example.test');
    const state = await client.query(`
      SELECT
        (SELECT count(*)::int FROM users) AS users,
        (SELECT count(*)::int FROM profiles) AS profiles,
        (SELECT count(*)::int FROM auth_identity_links) AS links
    `);
    expect(state.rows[0]).toEqual({ users: 1, profiles: 1, links: 1 });

    await expect(provisionClerkOwner(client, 'clerk_new_2', 'FRESH@example.test'))
      .rejects.toBeInstanceOf(IdentityConflictError);
    const afterCollision = await client.query('SELECT count(*)::int AS count FROM auth_identity_links');
    expect(afterCollision.rows[0].count).toBe(1);

    const legacy = await client.query(
      `INSERT INTO users (email, password_hash) VALUES ('legacy@example.test', 'legacy-hash') RETURNING id`,
    );
    const legacyId = legacy.rows[0].id as string;
    const linked = await linkClerkToLegacyOwner(client, 'clerk_existing_legacy', legacyId);
    expect(linked.id).toBe(legacyId);
    const owners = await client.query(
      `SELECT clerk_user_id, owner_user_id FROM auth_identity_links ORDER BY clerk_user_id`,
    );
    expect(owners.rows).toEqual([
      { clerk_user_id: 'clerk_existing_legacy', owner_user_id: legacyId },
      { clerk_user_id: 'clerk_new_1', owner_user_id: owner.id },
    ]);

    await client.query('SAVEPOINT profile_failure');
    await client.query("ALTER TABLE profiles ADD CONSTRAINT test_reject_profile CHECK (email <> 'rollback@example.test')");
    await expect(provisionClerkOwner(client, 'clerk_rollback', 'rollback@example.test')).rejects.toThrow();
    await client.query('ROLLBACK TO SAVEPOINT profile_failure');
    const rollbackState = await client.query(`
      SELECT
        (SELECT count(*)::int FROM users WHERE lower(email) = 'rollback@example.test') AS users,
        (SELECT count(*)::int FROM profiles WHERE lower(email) = 'rollback@example.test') AS profiles,
        (SELECT count(*)::int FROM auth_identity_links WHERE clerk_user_id = 'clerk_rollback') AS links
    `);
    expect(rollbackState.rows[0]).toEqual({ users: 0, profiles: 0, links: 0 });
    await client.query('ROLLBACK');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* keep first failure */ }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
});
