import { query } from '../api/db';
import { generateToken, verifyPassword } from '../api/auth-helpers';

export function createLegacyLoginHandler(dependencies: {
  findUser: (email: string) => Promise<{ id: string; email: string; password_hash: string | null } | null>;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
  ensureProfile: (user: { id: string; email: string }) => Promise<void>;
  generateToken: (userId: string) => string;
}) {
  return async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await dependencies.findUser(String(email).toLowerCase().trim());
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      // Clerk-only owners have no password credential and cannot authenticate here.
      if (user.password_hash == null) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await dependencies.verifyPassword(String(password), user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      await dependencies.ensureProfile(user);
      const token = dependencies.generateToken(user.id);
      return res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export const handler = createLegacyLoginHandler({
  findUser: async (email) => {
    const { rows } = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },
  verifyPassword,
  ensureProfile: async (user) => {
    await query(
      'INSERT INTO profiles (user_id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user.id, user.email],
    );
  },
  generateToken,
});
