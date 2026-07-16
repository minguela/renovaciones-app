import { query } from './db';
import { getUserIdFromRequest } from './auth-helpers';

export default async function handler(req: any, res: any) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { rows } = await query(
        'SELECT * FROM user_catalogs WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
      );
      return res.json(rows.map(mapCatalog));
    }

    if (req.method === 'POST') {
      const c = req.body;
      const { rows } = await query(
        `INSERT INTO user_catalogs (user_id, name, icon, color, options)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [userId, c.name, c.icon || 'tag.fill', c.color || '#007AFF', JSON.stringify(c.options || [])]
      );
      return res.status(201).json(mapCatalog(rows[0]));
    }

    if (req.method === 'PUT') {
      const c = req.body;
      const { rows } = await query(
        `UPDATE user_catalogs SET name = $3, icon = $4, color = $5, options = $6, updated_at = now()
         WHERE id = $1 AND user_id = $2 RETURNING *`,
        [c.id, userId, c.name, c.icon, c.color, JSON.stringify(c.options || [])]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.json(mapCatalog(rows[0]));
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || req.query || {};
      const { rowCount } = await query(
        'DELETE FROM user_catalogs WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Catalogs error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function mapCatalog(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
