import type { useSSO } from '@clerk/expo/experimental';

type ClerkSsoResult = Awaited<ReturnType<ReturnType<typeof useSSO>['startSSOFlow']>>;

/** The experimental Clerk Expo hook finalizes completed SSO sessions internally. */
export function hasCompletedClerkSsoFlow(result: ClerkSsoResult): boolean {
  return result.authSessionResult?.type === 'success' && Boolean(result.authSessionResult.url);
}
