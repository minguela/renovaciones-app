export const E2E_USER = {
  id: 'e2e-test-user-id',
  email: 'e2e@test.com',
};

export function injectMockSession(page: any) {
  return page.addInitScript(() => {
    const mockSession = {
      access_token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: 'e2e-test-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'e2e@test.com',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmation_sent_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    localStorage.setItem('sb-grgmuqaigqgrbjvzjecn-auth-token', JSON.stringify(mockSession));
  });
}
