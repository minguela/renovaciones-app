import { expect, test } from '@playwright/test';
import { activateClerkSsoSession } from '../../components/clerk-sso-session';

test('activates the Clerk session returned by Google SSO', async () => {
  const calls: { session: string }[] = [];
  const activated = await activateClerkSsoSession({
    createdSessionId: 'sess_123',
    setActive: async (params) => { calls.push(params); },
  });

  expect(activated).toBe(true);
  expect(calls).toEqual([{ session: 'sess_123' }]);
});

test('does not activate or treat an incomplete SSO challenge as signed in', async () => {
  const activated = await activateClerkSsoSession({ createdSessionId: null });

  expect(activated).toBe(false);
});

test('fails closed if Clerk returns a session without an activation function', async () => {
  await expect(activateClerkSsoSession({ createdSessionId: 'sess_123' }))
    .rejects.toThrow('Clerk no devolvió el activador de sesión.');
});
