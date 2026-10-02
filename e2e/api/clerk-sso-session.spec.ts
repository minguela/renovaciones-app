import { expect, test } from '@playwright/test';
import { hasCompletedClerkSsoFlow } from '../../components/clerk-sso-session';
import type { useSSO } from '@clerk/expo/experimental';

type ExperimentalSsoResult = Awaited<ReturnType<ReturnType<typeof useSSO>['startSSOFlow']>>;

test('accepts the installed experimental useSSO result after it finalizes the session internally', async () => {
  const result = {
    createdSessionId: 'sess_123',
    authSessionResult: { type: 'success', url: 'renovacionesapp://sso-callback?rotating_token_nonce=nonce' },
  } satisfies ExperimentalSsoResult;

  expect(hasCompletedClerkSsoFlow(result)).toBe(true);
});

test('keeps a cancelled or incomplete SSO result unauthenticated', async () => {
  const result = {
    createdSessionId: null,
    authSessionResult: { type: 'cancel' } as NonNullable<ExperimentalSsoResult['authSessionResult']>,
  } satisfies ExperimentalSsoResult;

  expect(hasCompletedClerkSsoFlow(result)).toBe(false);
});

test('requires an auth session callback even when a session id is present', async () => {
  const result = {
    createdSessionId: 'sess_123',
    authSessionResult: null,
  } satisfies ExperimentalSsoResult;

  expect(hasCompletedClerkSsoFlow(result)).toBe(false);
});
