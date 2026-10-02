import { expect, test } from '@playwright/test';
import { signOutAndClearUser } from '../../src/application/auth-sign-out';

test('keeps the current user when the API returns a sign-out error', async () => {
  let cleared = false;
  const error = new Error('No se pudo limpiar la sesión de Clerk.');

  const result = await signOutAndClearUser(async () => ({ error }), () => { cleared = true; });

  expect(result).toBe(error);
  expect(cleared).toBe(false);
});

test('keeps the current user when sign-out throws', async () => {
  let cleared = false;

  const result = await signOutAndClearUser(async () => { throw new Error('storage unavailable'); }, () => { cleared = true; });

  expect(result?.message).toBe('storage unavailable');
  expect(cleared).toBe(false);
});

test('clears the current user only after sign-out succeeds', async () => {
  let cleared = false;

  const result = await signOutAndClearUser(async () => ({ error: null }), () => { cleared = true; });

  expect(result).toBeNull();
  expect(cleared).toBe(true);
});
