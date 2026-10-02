import { test, expect } from '@playwright/test';
import { createAuthTokenSource } from '../../src/application/auth-token-source';

test('uses Clerk tokens for the Clerk session and the stored legacy token only when switching to legacy auth', async () => {
  let mode: 'clerk' | 'legacy' = 'clerk';
  const source = createAuthTokenSource(
    () => mode,
    async () => 'clerk-session-token',
    async () => 'legacy-session-token',
  );

  await expect(source()).resolves.toBe('clerk-session-token');
  mode = 'legacy';
  await expect(source()).resolves.toBe('legacy-session-token');
});

test('does not send a stored legacy JWT when Clerk mode has no active Clerk session', async () => {
  let legacyReads = 0;
  const source = createAuthTokenSource(
    () => 'clerk',
    async () => undefined,
    async () => { legacyReads += 1; return 'legacy-session-token'; },
  );

  await expect(source()).resolves.toBeNull();
  expect(legacyReads).toBe(0);
});
