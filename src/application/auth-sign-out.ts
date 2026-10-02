export async function signOutAndClearUser(
  signOut: () => Promise<{ error: Error | null }>,
  clearUser: () => void,
): Promise<Error | null> {
  try {
    const { error } = await signOut();
    if (error) return error;
    clearUser();
    return null;
  } catch (cause) {
    return cause instanceof Error ? cause : new Error('Error al cerrar sesión');
  }
}
