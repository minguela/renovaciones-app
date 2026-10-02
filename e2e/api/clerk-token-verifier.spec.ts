import { test, expect } from '@playwright/test';
import { createClerkSessionTokenVerifier } from '../../api/clerk-token-verifier';
import { createServerActorResolver } from '../../api/server-actor';

const NOW = 1_798_876_800_000;

test('verifies Clerk tokens with the configured party allowlist and returns only the verified subject', async () => {
  let receivedOptions: unknown;
  const verifyToken = createClerkSessionTokenVerifier({
    secretKey: 'test-secret',
    authorizedParties: ['https://renovaciones.example'],
    now: () => NOW,
    verifyToken: async (_token, options) => {
      receivedOptions = options;
      return { data: { sub: 'clerk-user-a', exp: NOW / 1000 + 30, nbf: NOW / 1000 - 5 } };
    },
  });

  await expect(verifyToken('signed-token')).resolves.toEqual({ sub: 'clerk-user-a' });
  expect(receivedOptions).toEqual({
    secretKey: 'test-secret',
    authorizedParties: ['https://renovaciones.example'],
  });
});

test('rejects expired Clerk session tokens even when a verifier returns their claims', async () => {
  const verifyToken = createClerkSessionTokenVerifier({
    secretKey: 'test-secret',
    authorizedParties: ['https://renovaciones.example'],
    now: () => NOW,
    verifyToken: async () => ({ data: { sub: 'clerk-user-a', exp: NOW / 1000 - 1 } }),
  });

  await expect(verifyToken('expired-token')).resolves.toBeNull();
});

test('rejects not-yet-valid or incomplete Clerk claims and verifier errors', async () => {
  const invalidClaims = createClerkSessionTokenVerifier({
    secretKey: 'test-secret',
    authorizedParties: ['https://renovaciones.example'],
    now: () => NOW,
    verifyToken: async (token) => token === 'early'
      ? { data: { sub: 'clerk-user-a', exp: NOW / 1000 + 30, nbf: NOW / 1000 + 1 } }
      : { data: { sub: 'clerk-user-a' } },
  });
  const failedVerifier = createClerkSessionTokenVerifier({
    secretKey: 'test-secret',
    authorizedParties: ['https://renovaciones.example'],
    now: () => NOW,
    verifyToken: async () => { throw new Error('signature mismatch'); },
  });

  await expect(invalidClaims('early')).resolves.toBeNull();
  await expect(invalidClaims('no-expiry')).resolves.toBeNull();
  await expect(failedVerifier('bad-signature')).resolves.toBeNull();
});

test('derives two distinct owners from the verified Clerk subject and ignores spoofed request identities', async () => {
  const owners: Record<string, string> = {
    'clerk-token-a': 'legacy-owner-a',
    'clerk-token-b': 'legacy-owner-b',
  };
  const resolver = createServerActorResolver({
    verifyClerkToken: async (token) => ({ sub: token.replace('clerk-token-', 'clerk-user-') }),
    findLegacyUserIdByClerkId: async (subject) => owners[subject.replace('clerk-user-', 'clerk-token-')] || null,
    verifyLegacyToken: async () => null,
  });

  const ownerA = await resolver({
    headers: { authorization: 'Bearer clerk-token-a' },
    body: { userId: 'legacy-owner-b' },
    query: { userId: 'legacy-owner-b' },
  });
  const ownerB = await resolver({
    headers: { authorization: 'Bearer clerk-token-b' },
    body: { userId: 'legacy-owner-a' },
    query: { userId: 'legacy-owner-a' },
  });

  expect(ownerA).toEqual({ userId: 'legacy-owner-a', identityProvider: 'clerk' });
  expect(ownerB).toEqual({ userId: 'legacy-owner-b', identityProvider: 'clerk' });
});

test('does not fall back to legacy authentication when a Clerk token was verified but has no account link', async () => {
  const resolver = createServerActorResolver({
    verifyClerkToken: async () => ({ sub: 'clerk-user-unlinked' }),
    findLegacyUserIdByClerkId: async () => null,
    verifyLegacyToken: async () => ({ sub: 'attacker-selected-legacy-user' }),
  });

  await expect(resolver({ headers: { authorization: 'Bearer clerk-token' } })).resolves.toBeNull();
});
