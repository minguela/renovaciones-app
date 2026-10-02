import { test, expect } from '@playwright/test';
import { createClerkProvisionHandler } from '../../server/auth-handlers/clerk/provision';
import { createClerkLegacyLinkHandler } from '../../server/auth-handlers/clerk/link-legacy';
import { createLegacyLoginHandler } from '../../server/auth-handlers/login';
import { clearAuthSessions, submitExplicitLegacyLink } from '../../src/application/auth-session-lifecycle';
import {
  IdentityConflictError,
  IdentityOwnerNotFoundError,
  linkClerkToLegacyOwner,
  provisionClerkOwner,
} from '../../server/api/clerk-identity-service';

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
}

function createProvisionHarness() {
  const calls: unknown[][] = [];
  const handler = createClerkProvisionHandler({
    verifyClerk: async (token) => token === 'clerk-token' ? { sub: 'user_clerk_1' } : null,
    findOwner: async (clerkUserId) => {
      calls.push(['findOwner', clerkUserId]);
      return clerkUserId === 'user_linked' ? { id: 'legacy-a', email: 'a@example.test' } : null;
    },
    getVerifiedPrimaryEmail: async (clerkUserId) => {
      calls.push(['getEmail', clerkUserId]);
      return clerkUserId === 'user_clerk_1' ? 'New@Example.test' : null;
    },
    provision: async (clerkUserId, email) => {
      calls.push(['provision', clerkUserId, email]);
      return { id: 'owner-new', email };
    },
  });
  return { handler, calls };
}

test('Clerk provisioning rejects missing/invalid tokens before reading identities', async () => {
  const { handler, calls } = createProvisionHarness();
  const response = responseRecorder();

  await handler({ method: 'POST', headers: {} }, response);
  expect(response.statusCode).toBe(401);
  expect(calls).toHaveLength(0);
});

test('Clerk provisioning reuses only its explicit owner link, without fetching email', async () => {
  const { handler, calls } = createProvisionHarness();
  const response = responseRecorder();

  await handler({ method: 'POST', headers: { authorization: 'Bearer clerk-token' } }, response);
  expect(response.statusCode).toBe(201);
  expect(response.body).toEqual({ id: 'owner-new', email: 'New@Example.test' });
  expect(calls).toEqual([
    ['findOwner', 'user_clerk_1'],
    ['getEmail', 'user_clerk_1'],
    ['provision', 'user_clerk_1', 'New@Example.test'],
  ]);
});

test('existing Clerk mapping works even if Clerk email lookup is unavailable', async () => {
  const { handler, calls } = createProvisionHarness();
  const response = responseRecorder();

  await handler({ method: 'POST', headers: { authorization: 'Bearer clerk-token' } }, response);
  expect(response.statusCode).toBe(201);

  const linkedHandler = createClerkProvisionHandler({
    verifyClerk: async () => ({ sub: 'user_linked' }),
    findOwner: async () => ({ id: 'legacy-a', email: 'a@example.test' }),
    getVerifiedPrimaryEmail: async () => { throw new Error('must not fetch'); },
    provision: async () => { throw new Error('must not provision'); },
  });
  const linkedResponse = responseRecorder();
  await linkedHandler({ method: 'POST', headers: { authorization: 'Bearer clerk-token' } }, linkedResponse);
  expect(linkedResponse.statusCode).toBe(200);
  expect(linkedResponse.body).toEqual({ id: 'legacy-a', email: 'a@example.test' });
  expect(calls).toHaveLength(3);
});

test('missing verified primary email and existing-email collisions fail closed', async () => {
  const noEmail = createClerkProvisionHandler({
    verifyClerk: async () => ({ sub: 'user_clerk_1' }), findOwner: async () => null,
    getVerifiedPrimaryEmail: async () => null, provision: async () => { throw new Error('must not provision'); },
  });
  const noEmailResponse = responseRecorder();
  await noEmail({ method: 'POST', headers: { authorization: 'Bearer clerk-token' } }, noEmailResponse);
  expect(noEmailResponse.statusCode).toBe(422);

  const collision = createClerkProvisionHandler({
    verifyClerk: async () => ({ sub: 'user_clerk_1' }), findOwner: async () => null,
    getVerifiedPrimaryEmail: async () => 'existing@example.test',
    provision: async () => { throw new IdentityConflictError('collision'); },
  });
  const collisionResponse = responseRecorder();
  await collision({ method: 'POST', headers: { authorization: 'Bearer clerk-token' } }, collisionResponse);
  expect(collisionResponse.statusCode).toBe(409);
  expect((collisionResponse.body as { code: string }).code).toBe('identity_conflict');
});

test('explicit link requires both independently verified tokens and passes no email or client owner ID', async () => {
  const calls: unknown[][] = [];
  const handler = createClerkLegacyLinkHandler({
    verifyClerk: async (token) => token === 'clerk-token' ? { sub: 'clerk-subject' } : null,
    verifyLegacy: async (token) => token === 'legacy-token' ? { sub: 'legacy-owner' } : null,
    link: async (clerkId, legacyId) => { calls.push([clerkId, legacyId]); return { id: legacyId, email: 'owner@example.test' }; },
  });
  const response = responseRecorder();

  await handler({
    method: 'POST', headers: { authorization: 'Bearer clerk-token' },
    body: { legacyToken: 'legacy-token', email: 'other@example.test', userId: 'attacker-owner' },
  }, response);
  expect(response.statusCode).toBe(200);
  expect(calls).toEqual([['clerk-subject', 'legacy-owner']]);
});

test('link is denied if either token is invalid and surfaces identity conflicts as 409', async () => {
  let linkCalls = 0;
  const handler = createClerkLegacyLinkHandler({
    verifyClerk: async () => ({ sub: 'clerk-subject' }), verifyLegacy: async () => null,
    link: async () => { linkCalls += 1; throw new IdentityConflictError(); },
  });
  const denied = responseRecorder();
  await handler({ method: 'POST', headers: { authorization: 'Bearer clerk-token' }, body: { legacyToken: 'bad' } }, denied);
  expect(denied.statusCode).toBe(401);
  expect(linkCalls).toBe(0);

  const conflict = createClerkLegacyLinkHandler({
    verifyClerk: async () => ({ sub: 'clerk-subject' }), verifyLegacy: async () => ({ sub: 'legacy-owner' }),
    link: async () => { throw new IdentityConflictError(); },
  });
  const conflictResponse = responseRecorder();
  await conflict({ method: 'POST', headers: { authorization: 'Bearer clerk-token' }, body: { legacyToken: 'legacy-token' } }, conflictResponse);
  expect(conflictResponse.statusCode).toBe(409);
});

test('link reports a missing exact owner without attempting email matching', async () => {
  const handler = createClerkLegacyLinkHandler({
    verifyClerk: async () => ({ sub: 'clerk-subject' }), verifyLegacy: async () => ({ sub: 'legacy-missing' }),
    link: async () => { throw new IdentityOwnerNotFoundError(); },
  });
  const response = responseRecorder();
  await handler({ method: 'POST', headers: { authorization: 'Bearer clerk-token' }, body: { legacyToken: 'legacy-token' } }, response);
  expect(response.statusCode).toBe(404);
});

test('legacy password login rejects Clerk-only rows and preserves existing password accounts', async () => {
  let passwordChecks = 0;
  let profileWrites = 0;
  const handler = createLegacyLoginHandler({
    findUser: async (email) => email === 'clerk@example.test'
      ? { id: 'clerk-owner', email, password_hash: null }
      : { id: 'legacy-owner', email, password_hash: 'hash' },
    verifyPassword: async (_password, hash) => { passwordChecks += 1; return hash === 'hash'; },
    ensureProfile: async () => { profileWrites += 1; },
    generateToken: (userId) => `jwt-${userId}`,
  });
  const clerkOnly = responseRecorder();
  await handler({ method: 'POST', body: { email: 'clerk@example.test', password: 'anything' } }, clerkOnly);
  expect(clerkOnly.statusCode).toBe(401);
  expect(passwordChecks).toBe(0);
  expect(profileWrites).toBe(0);

  const legacy = responseRecorder();
  await handler({ method: 'POST', body: { email: 'Legacy@Example.test', password: 'valid' } }, legacy);
  expect(legacy.statusCode).toBe(200);
  expect(legacy.body).toEqual({ token: 'jwt-legacy-owner', user: { id: 'legacy-owner', email: 'legacy@example.test' } });
  expect(passwordChecks).toBe(1);
  expect(profileWrites).toBe(1);
});

test('legacy JWT is sent only by explicit link submission and is cleared only after a successful link', async () => {
  const sent: string[][] = [];
  let clears = 0;
  const submit = () => submitExplicitLegacyLink({
    getStoredLegacyToken: async () => 'already-active-legacy-jwt',
    verifyLegacyCredentials: async () => 'fresh-legacy-jwt',
    hasLegacyCredentials: false,
    getClerkToken: async () => 'active-clerk-jwt',
    sendLink: async (legacyToken, clerkToken) => { sent.push([legacyToken, clerkToken]); },
    clearLegacyToken: async () => { clears += 1; },
  });

  expect(sent).toEqual([]);
  expect(clears).toBe(0);
  await submit();
  expect(sent).toEqual([['already-active-legacy-jwt', 'active-clerk-jwt']]);
  expect(clears).toBe(1);

  await expect(submitExplicitLegacyLink({
    getStoredLegacyToken: async () => 'already-active-legacy-jwt', verifyLegacyCredentials: async () => 'unused',
    hasLegacyCredentials: false, getClerkToken: async () => 'active-clerk-jwt',
    sendLink: async () => { throw new Error('link conflict'); }, clearLegacyToken: async () => { clears += 1; },
  })).rejects.toThrow('link conflict');
  expect(clears).toBe(1);
});

test('logout clears the stored legacy token and signs out of Clerk in sequence', async () => {
  const calls: string[] = [];
  await clearAuthSessions({
    clearLegacyToken: async () => { calls.push('clear-legacy'); },
    signOutClerk: async () => { calls.push('signout-clerk'); },
  });
  expect(calls).toEqual(['clear-legacy', 'signout-clerk']);
});

function createMemoryTransaction() {
  const owners = new Map<string, { id: string; email: string; password_hash: string | null }>();
  const profiles = new Set<string>();
  const links = new Map<string, { owner_user_id: string; linked_by: string }>();
  let nextId = 1;
  const tx = {
    async query(sql: string, params: unknown[] = []) {
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [] };
      if (sql.includes('WHERE l.clerk_user_id = $1')) {
        const link = links.get(String(params[0]));
        const owner = link && owners.get(link.owner_user_id);
        return { rows: owner ? [{ id: owner.id, email: owner.email }] : [] };
      }
      if (sql.includes('lower(email) = $1')) {
        return { rows: [...owners.values()].some((owner) => owner.email.toLowerCase() === params[0]) ? [{ id: 'existing' }] : [] };
      }
      if (sql.startsWith('INSERT INTO users')) {
        const email = String(params[0]);
        const row = { id: `owner-${nextId++}`, email, password_hash: null };
        owners.set(row.id, row);
        return { rows: [{ id: row.id, email: row.email }] };
      }
      if (sql.startsWith('INSERT INTO profiles')) {
        profiles.add(String(params[0]));
        return { rows: [] };
      }
      if (sql.startsWith('INSERT INTO auth_identity_links')) {
        const clerkId = String(params[0]);
        const ownerId = String(params[1]);
        if (links.has(clerkId) || [...links.values()].some((link) => link.owner_user_id === ownerId)) {
          throw Object.assign(new Error('unique conflict'), { code: '23505' });
        }
        links.set(clerkId, { owner_user_id: ownerId, linked_by: sql.includes('clerk-self-signup') ? 'clerk-self-signup' : 'verified-legacy-session' });
        return { rows: [] };
      }
      if (sql.startsWith('SELECT id, email FROM users WHERE id = $1')) {
        const owner = owners.get(String(params[0]));
        return { rows: owner ? [{ id: owner.id, email: owner.email }] : [] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
    owners,
    profiles,
    links,
    addLegacyOwner(id: string, email: string) { owners.set(id, { id, email, password_hash: 'legacy-hash' }); },
  };
  return tx;
}

test('provision creates one owner/profile/map; repeated calls reuse the owner and email conflicts do not link', async () => {
  const tx = createMemoryTransaction();
  const first = await provisionClerkOwner(tx, 'clerk-a', 'Owner@Example.test');
  const repeated = await provisionClerkOwner(tx, 'clerk-a', 'different@example.test');
  expect(repeated).toEqual(first);
  expect(tx.owners.size).toBe(1);
  expect(tx.profiles.size).toBe(1);
  expect(tx.links.get('clerk-a')).toEqual({ owner_user_id: first.id, linked_by: 'clerk-self-signup' });
  await expect(provisionClerkOwner(tx, 'clerk-b', 'OWNER@example.test')).rejects.toBeInstanceOf(IdentityConflictError);
  expect(tx.owners.size).toBe(1);
  expect(tx.links.size).toBe(1);
});

test('explicit account link maps the proved UUID, is idempotent, and never uses email to select ownership', async () => {
  const tx = createMemoryTransaction();
  tx.addLegacyOwner('legacy-owner', 'owner@example.test');
  const linked = await linkClerkToLegacyOwner(tx, 'clerk-b', 'legacy-owner');
  const repeated = await linkClerkToLegacyOwner(tx, 'clerk-b', 'legacy-owner');
  expect(linked.id).toBe('legacy-owner');
  expect(repeated.id).toBe('legacy-owner');
  expect(tx.links.get('clerk-b')).toEqual({ owner_user_id: 'legacy-owner', linked_by: 'verified-legacy-session' });
  await expect(linkClerkToLegacyOwner(tx, 'clerk-c', 'legacy-owner')).rejects.toBeInstanceOf(IdentityConflictError);
});
