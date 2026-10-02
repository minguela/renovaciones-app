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

test('retains legacy recovery when Clerk is selected but there is no active Clerk session', async () => {
  const source = createAuthTokenSource(
    () => 'clerk',
    async () => undefined,
    async () => 'legacy-session-token',
  );

  await expect(source()).resolves.toBe('legacy-session-token');
});
