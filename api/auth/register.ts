import { query } from '../db';
import { generateToken, hashPassword } from '../auth-helpers';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [cleanEmail, passwordHash]
    );
    const user = rows[0];

    // Create profile
    await query(
      'INSERT INTO profiles (user_id, email, notifications_enabled, notification_method) VALUES ($1, $2, true, $3)',
      [user.id, user.email, 'email']
    );

    const token = generateToken(user.id);
    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
