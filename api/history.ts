import { query } from './db';
import { getUserIdFromRequest } from './auth-helpers';

export default async function handler(req: any, res: any) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { renewalId } = req.query || {};
      if (!renewalId) {
        return res.status(400).json({ error: 'renewalId required' });
      }
      // Verify renewal belongs to user
      const renewal = await query(
        'SELECT id FROM renewals WHERE id = $1 AND user_id = $2',
        [renewalId, userId]
      );
      if (renewal.rows.length === 0) return res.status(404).json({ error: 'Renewal not found' });

      const { rows } = await query(
        'SELECT * FROM renewal_history WHERE renewal_id = $1 ORDER BY changed_at DESC',
        [renewalId]
      );
      return res.json(rows.map(mapHistory));
    }

    if (req.method === 'POST') {
      const h = req.body;
      const { rows } = await query(
        `INSERT INTO renewal_history (renewal_id, old_cost, new_cost, old_frequency, new_frequency)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [h.renewalId, h.oldCost, h.newCost, h.oldFrequency, h.newFrequency]
      );
      return res.status(201).json(mapHistory(rows[0]));
    }

    if (req.method === 'DELETE') {
      const { historyId, renewalId } = req.body || req.query || {};
      // Verify renewal belongs to user
      const renewal = await query(
        'SELECT id FROM renewals WHERE id = $1 AND user_id = $2',
        [renewalId, userId]
      );
      if (renewal.rows.length === 0) return res.status(404).json({ error: 'Renewal not found' });

      await query(
        'DELETE FROM renewal_history WHERE id = $1 AND renewal_id = $2',
        [historyId, renewalId]
      );
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('History error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function mapHistory(row: any) {
  return {
    id: row.id,
    renewalId: row.renewal_id,
    oldCost: Number(row.old_cost),
    newCost: Number(row.new_cost),
    oldFrequency: row.old_frequency,
    newFrequency: row.new_frequency,
    changedAt: row.changed_at,
  };
}
