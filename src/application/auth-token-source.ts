export type AuthMode = 'clerk' | 'legacy';

/** Keeps explicit legacy recovery functional even if an unrelated Clerk session exists. */
export function createAuthTokenSource(
  getMode: () => AuthMode,
  getClerkToken: () => Promise<string | null | undefined>,
  getLegacyToken: () => Promise<string | null>,
) {
  return async (): Promise<string | null> => {
    if (getMode() === 'clerk') {
      const clerkToken = await getClerkToken();
      if (clerkToken !== undefined) return clerkToken;
    }
    return getLegacyToken();
  };
}
