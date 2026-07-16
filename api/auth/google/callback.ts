// GET /api/auth/google/callback — OAuth redirect callback for web
// Google redirects here with ?code=... after user consents
import { query } from '../../db';
import { generateToken } from '../../auth-helpers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const SITE_URL = process.env.SITE_URL || 'https://renovaciones.dminguela.es';

export default async function handler(req: any, res: any) {
  const { code, error: googleError } = req.query || {};

  if (googleError) {
    return res.redirect(`${SITE_URL}/?error=${encodeURIComponent(googleError)}`);
  }

  if (!code) {
    return res.redirect(`${SITE_URL}/?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SITE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.redirect(`${SITE_URL}/?error=${encodeURIComponent(tokenData.error_description || 'token_exchange_failed')}`);
    }

    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();
    const email = (googleUser.email || '').toLowerCase().trim();

    if (!email) {
      return res.redirect(`${SITE_URL}/?error=no_email`);
    }

    // Find or create user
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

    let userId: string;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await query('UPDATE users SET google_id = $1, avatar_url = $2, updated_at = now() WHERE id = $3 AND google_id IS NULL',
        [googleUser.id, googleUser.picture || null, userId]);
    } else {
      const { rows } = await query(
        'INSERT INTO users (email, google_id, avatar_url) VALUES ($1, $2, $3) RETURNING id',
        [email, googleUser.id, googleUser.picture || null]
      );
      userId = rows[0].id;
      await query(
        'INSERT INTO profiles (user_id, email, notifications_enabled, notification_method) VALUES ($1, $2, true, $3)',
        [userId, email, 'email']
      );
    }

    const token = generateToken(userId);
    // Redirect to home with token — frontend stores it and refreshes
    return res.redirect(`${SITE_URL}/?token=${token}&auth=google`);
  } catch (err: any) {
    console.error('Google callback error:', err);
    return res.redirect(`${SITE_URL}/?error=server_error`);
  }
}
