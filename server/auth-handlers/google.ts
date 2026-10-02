// /api/auth/google — Google OAuth sign-in
// GET: OAuth callback redirect (web flow)
// POST: Exchange authorization code for JWT (native flow)
import { generateToken } from '../api/auth-helpers';
import { findOrCreateGoogleUser, GoogleAccountLinkRequiredError } from '../api/google-identity';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const SITE_URL = process.env.SITE_URL || 'https://renovaciones.dminguela.es';
const GOOGLE_CALLBACK_PATH = '/api/auth/google/callback';

async function exchangeCodeForUser(code: string, redirectUri: string) {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    throw new Error(tokenData.error_description || 'Google auth failed');
  }

  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  return userRes.json();
}

export async function handler(req: any, res: any) {
  // --- GET: OAuth callback (web flow) ---
  if (req.method === 'GET') {
    const { code, error: googleError } = req.query || {};
    if (googleError) return res.redirect(`${SITE_URL}/?error=${encodeURIComponent(googleError)}`);
    if (!code) return res.redirect(`${SITE_URL}/?error=no_code`);

    try {
      const googleUser = await exchangeCodeForUser(String(code), `${SITE_URL}${GOOGLE_CALLBACK_PATH}`);
      const { userId } = await findOrCreateGoogleUser(googleUser);
      const token = generateToken(userId);
      return res.redirect(`${SITE_URL}/?token=${token}&auth=google`);
    } catch (err: any) {
      console.error('Google callback error:', err);
      const error = err instanceof GoogleAccountLinkRequiredError ? err.code : err.message;
      return res.redirect(`${SITE_URL}/?error=${encodeURIComponent(error)}`);
    }
  }

  // --- POST: Native flow ---
  if (req.method === 'POST') {
    try {
      const { code, redirectUri } = req.body || {};
      if (!code) return res.status(400).json({ error: 'Authorization code required' });

      const googleUser = await exchangeCodeForUser(code, redirectUri || `${SITE_URL}${GOOGLE_CALLBACK_PATH}`);
      const { userId, email } = await findOrCreateGoogleUser(googleUser);
      const token = generateToken(userId);
      return res.json({ token, user: { id: userId, email } });
    } catch (err: any) {
      console.error('Google auth error:', err);
      const status = err instanceof GoogleAccountLinkRequiredError ? 409 : 400;
      return res.status(status).json({ error: err.message, ...(err instanceof GoogleAccountLinkRequiredError ? { code: err.code } : {}) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
