import { query } from '../db';
import { generateToken, verifyPassword } from '../auth-helpers';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { rows } = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure profile exists
    await query(
      'INSERT INTO profiles (user_id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user.id, user.email]
    );

    const token = generateToken(user.id);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
