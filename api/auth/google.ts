// /api/auth/google — Google OAuth sign-in
// GET: OAuth callback redirect (web flow)
// POST: Exchange authorization code for JWT (native flow)
import { query } from '../db';
import { generateToken } from '../auth-helpers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const SITE_URL = process.env.SITE_URL || 'https://renovaciones.dminguela.es';

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

async function findOrCreateUser(googleUser: any) {
  const email = (googleUser.email || '').toLowerCase().trim();
  if (!email) throw new Error('No email from Google');

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    const userId = existing.rows[0].id;
    await query('UPDATE users SET google_id = $1, avatar_url = $2, updated_at = now() WHERE id = $3 AND google_id IS NULL',
      [googleUser.id, googleUser.picture || null, userId]);
    return { userId, email };
  }

  const { rows } = await query(
    'INSERT INTO users (email, google_id, avatar_url) VALUES ($1, $2, $3) RETURNING id',
    [email, googleUser.id, googleUser.picture || null]
  );
  await query(
    'INSERT INTO profiles (user_id, email, notifications_enabled, notification_method) VALUES ($1, $2, true, $3)',
    [rows[0].id, email, 'email']
  );
  return { userId: rows[0].id, email };
}

export default async function handler(req: any, res: any) {
  // --- GET: OAuth callback (web flow) ---
  if (req.method === 'GET') {
    const { code, error: googleError } = req.query || {};
    if (googleError) return res.redirect(`${SITE_URL}/?error=${encodeURIComponent(googleError)}`);
    if (!code) return res.redirect(`${SITE_URL}/?error=no_code`);

    try {
      const googleUser = await exchangeCodeForUser(String(code), `${SITE_URL}/api/auth/google`);
      const { userId } = await findOrCreateUser(googleUser);
      const token = generateToken(userId);
      return res.redirect(`${SITE_URL}/?token=${token}&auth=google`);
    } catch (err: any) {
      console.error('Google callback error:', err);
      return res.redirect(`${SITE_URL}/?error=${encodeURIComponent(err.message)}`);
    }
  }

  // --- POST: Native flow ---
  if (req.method === 'POST') {
    try {
      const { code, redirectUri } = req.body || {};
      if (!code) return res.status(400).json({ error: 'Authorization code required' });

      const googleUser = await exchangeCodeForUser(code, redirectUri || `${SITE_URL}/api/auth/google`);
      const { userId, email } = await findOrCreateUser(googleUser);
      const token = generateToken(userId);
      return res.json({ token, user: { id: userId, email } });
    } catch (err: any) {
      console.error('Google auth error:', err);
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
