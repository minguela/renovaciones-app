export type AuthMode = 'clerk' | 'legacy';

export interface AuthModeStorage {
  getMode(): Promise<string | null>;
  setMode(mode: AuthMode): Promise<void>;
}

export function createAuthModePreference(initialMode: AuthMode, storage?: AuthModeStorage) {
  let mode = initialMode;
  let selectionRevision = 0;

  const ready = storage
    ? storage.getMode()
        .then((stored) => {
          if (selectionRevision === 0 && (stored === 'clerk' || stored === 'legacy')) mode = stored;
        })
        .catch(() => undefined)
    : Promise.resolve();

  return {
    async getMode(): Promise<AuthMode> {
      await ready;
      return mode;
    },
    async setMode(nextMode: AuthMode): Promise<void> {
      selectionRevision += 1;
      mode = nextMode;
      await ready;
      await storage?.setMode(nextMode);
    },
  };
}

/** Never sends a stored legacy JWT while Clerk mode is selected. */
export function createAuthTokenSource(
  getMode: () => AuthMode,
  getClerkToken: () => Promise<string | null | undefined>,
  getLegacyToken: () => Promise<string | null>,
) {
  return async (): Promise<string | null> => {
    if (getMode() === 'clerk') {
      const clerkToken = await getClerkToken();
      return clerkToken ?? null;
    }
    return getLegacyToken();
  };
}
