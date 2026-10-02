import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createServerActorResolver } from '../../api/server-actor';
import { createHistoryHandler } from '../../api/history-handler';

test('resolves a legacy actor from the verified bearer token, not a body userId', async () => {
  const resolveActor = createServerActorResolver({
    verifyLegacyToken: async (token) => token === 'valid-legacy-token' ? { sub: 'legacy-owner' } : null,
  });

  const actor = await resolveActor({
    headers: { authorization: 'Bearer valid-legacy-token' },
    body: { userId: 'attacker-selected-user' },
  });

  expect(actor).toEqual({ userId: 'legacy-owner', identityProvider: 'legacy-jwt' });
});

test('maps a verified Clerk subject to an existing legacy owner', async () => {
  const resolveActor = createServerActorResolver({
    verifyClerkToken: async (token) => token === 'valid-clerk-token' ? { sub: 'clerk-user-123' } : null,
    findLegacyUserIdByClerkId: async (clerkUserId) => clerkUserId === 'clerk-user-123' ? 'legacy-owner' : null,
    verifyLegacyToken: async () => null,
  });

  const actor = await resolveActor({ headers: { authorization: 'Bearer valid-clerk-token' } });

  expect(actor).toEqual({ userId: 'legacy-owner', identityProvider: 'clerk' });
});

test('fails closed when a valid Clerk identity has no explicit legacy link', async () => {
  const resolveActor = createServerActorResolver({
    verifyClerkToken: async () => ({ sub: 'clerk-user-unlinked' }),
    findLegacyUserIdByClerkId: async () => null,
    verifyLegacyToken: async () => ({ sub: 'must-not-fallback' }),
  });

  const actor = await resolveActor({ headers: { authorization: 'Bearer token' } });

  expect(actor).toBeNull();
});

test('does not write renewal history for a renewal owned by another user', async () => {
  const calls: { text: string; params?: unknown[] }[] = [];
  const handler = createHistoryHandler({
    getActor: async () => ({ userId: 'user-a', identityProvider: 'legacy-jwt' }),
    query: async (text: string, params?: unknown[]) => {
      calls.push({ text, params });
      if (text.includes('INSERT INTO renewal_history')) {
        return { rows: [{ id: 'history-unauthorized', renewal_id: params?.[0], old_cost: 10, new_cost: 12 }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    },
  });
  const response = createResponse();

  await handler({
    method: 'POST',
    body: { renewalId: 'renewal-owned-by-user-b', oldCost: 10, newCost: 12 },
  }, response);

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({ error: 'Renewal not found' });
  expect(calls).toHaveLength(1);
  expect(calls[0].text).toContain('FROM renewals WHERE id = $1 AND user_id = $2');
  expect(calls[0].params).toEqual(['renewal-owned-by-user-b', 'user-a']);
});

test('allows history creation only after confirming the renewal belongs to the actor', async () => {
  const calls: { text: string; params?: unknown[] }[] = [];
  const handler = createHistoryHandler({
    getActor: async () => ({ userId: 'user-a', identityProvider: 'legacy-jwt' }),
    query: async (text: string, params?: unknown[]) => {
      calls.push({ text, params });
      if (text.includes('FROM renewals WHERE id = $1 AND user_id = $2')) {
        return { rows: [{ id: 'renewal-owned-by-user-a' }], rowCount: 1 };
      }
      return { rows: [{ id: 'history-1', renewal_id: 'renewal-owned-by-user-a', old_cost: 10, new_cost: 12 }], rowCount: 1 };
    },
  });
  const response = createResponse();

  await handler({
    method: 'POST',
    body: { renewalId: 'renewal-owned-by-user-a', oldCost: 10, newCost: 12 },
  }, response);

  expect(response.statusCode).toBe(201);
  expect(calls).toHaveLength(2);
  expect(calls[1].text).toContain('INSERT INTO renewal_history');
  expect(calls[1].params?.[0]).toBe('renewal-owned-by-user-a');
});

test('keeps the versioned identity migration additive and reversible by leaving legacy owners untouched', async () => {
  const migration = await readFile('migrations/20261001_auth_identity_links.sql', 'utf8');

  expect(migration).toContain('CREATE TABLE auth_identity_links');
  expect(migration).toMatch(/clerk_user_id\s+TEXT\s+PRIMARY KEY/i);
  expect(migration).toMatch(/owner_user_id\s+UUID\s+NOT NULL\s+UNIQUE/i);
  expect(migration).toMatch(/password_hash DROP NOT NULL/i);
  expect(migration).toMatch(/lower\(email\)/i);
  expect(migration).toMatch(/REFERENCES\s+users\s*\(id\)\s+ON DELETE RESTRICT/i);
  expect(migration).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE)\s+(TABLE|FROM|users|renewals|profiles)\b/i);
});

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}
