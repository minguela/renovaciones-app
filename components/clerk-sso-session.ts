export interface ClerkSsoSessionResult {
  createdSessionId?: string | null;
  setActive?: (params: { session: string }) => Promise<unknown> | unknown;
}

/** Activates a completed Clerk SSO session; incomplete/MFA flows stay unauthenticated. */
export async function activateClerkSsoSession(result: ClerkSsoSessionResult): Promise<boolean> {
  if (!result.createdSessionId) return false;
  if (!result.setActive) throw new Error('Clerk no devolvió el activador de sesión.');
  await result.setActive({ session: result.createdSessionId });
  return true;
}
