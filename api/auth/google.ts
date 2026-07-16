// POST /api/auth/google — Google OAuth sign-in
// Exchanges Google authorization code for tokens, creates/finds user, returns JWT
import { query } from '../db';
import { generateToken } from '../auth-helpers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { code, redirectUri } = req.body || {};
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri || `https://renovaciones.dminguela.es/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('Google token exchange failed:', tokenData.error, tokenData.error_description);
      return res.status(400).json({ error: tokenData.error_description || 'Google auth failed' });
    }

    // Get user info from Google
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return res.status(400).json({ error: 'Could not get email from Google' });
    }

    const email = googleUser.email.toLowerCase().trim();

    // Find or create user
    const existing = await query('SELECT id, email FROM users WHERE email = $1', [email]);

    let userId: string;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      // Update google_id if not set
      await query('UPDATE users SET google_id = $1, updated_at = now() WHERE id = $2 AND google_id IS NULL',
        [googleUser.id, userId]);
    } else {
      const { rows } = await query(
        'INSERT INTO users (email, google_id, avatar_url) VALUES ($1, $2, $3) RETURNING id, email',
        [email, googleUser.id, googleUser.picture || null]
      );
      userId = rows[0].id;

      // Create profile
      await query(
        'INSERT INTO profiles (user_id, email, notifications_enabled, notification_method) VALUES ($1, $2, true, $3)',
        [userId, email, 'email']
      );
    }

    const token = generateToken(userId);
    return res.json({ token, user: { id: userId, email } });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
