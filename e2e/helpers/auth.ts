export const E2E_USER = {
  id: 'e2e-test-user-id',
  email: 'e2e@test.com',
};

export function injectMockSession(page: any) {
  return page.addInitScript(() => {
    // Post-Supabase migration: auth_token is used instead of Supabase session
    localStorage.setItem('auth_token', 'mock-jwt-token');
  });
}

export function isValidUUIDv4(id: string): boolean {
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(id);
}
