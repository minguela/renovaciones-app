import { query } from '../db';
import { getUserIdFromRequest } from '../auth-helpers';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { rows } = await query('SELECT id, email, created_at, updated_at FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
