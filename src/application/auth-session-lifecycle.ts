export async function clearAuthSessions(dependencies: {
  clearLegacyToken: () => Promise<void>;
  signOutClerk: () => Promise<void>;
}): Promise<void> {
  await dependencies.clearLegacyToken();
  await dependencies.signOutClerk();
}

/** Runs only from the explicit account-link action, never from auth startup. */
export async function submitExplicitLegacyLink(dependencies: {
  getStoredLegacyToken: () => Promise<string | null>;
  verifyLegacyCredentials: () => Promise<string>;
  hasLegacyCredentials: boolean;
  getClerkToken: () => Promise<string>;
  sendLink: (legacyToken: string, clerkToken: string) => Promise<void>;
  clearLegacyToken: () => Promise<void>;
}): Promise<void> {
  const legacyToken = dependencies.hasLegacyCredentials
    ? await dependencies.verifyLegacyCredentials()
    : await dependencies.getStoredLegacyToken();
  if (!legacyToken) throw new Error('Inicia sesión con la cuenta anterior o introduce sus credenciales para verificarla.');

  const clerkToken = await dependencies.getClerkToken();
  await dependencies.sendLink(legacyToken, clerkToken);
  await dependencies.clearLegacyToken();
}
