import { query } from './db';
import { getUserIdFromRequest } from './auth-helpers';

export default async function handler(req: any, res: any) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    switch (req.method) {
      case 'GET':
        return listRenewals(userId, req, res);
      case 'POST':
        return createRenewal(userId, req, res);
      case 'PUT':
        return updateRenewal(userId, req, res);
      case 'DELETE':
        return deleteRenewal(userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err: any) {
    console.error('Renewals error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function listRenewals(userId: string, req: any, res: any) {
  const { rows } = await query(
    'SELECT * FROM renewals WHERE user_id = $1 ORDER BY renewal_date ASC',
    [userId]
  );
  return res.json(rows.map(mapRenewal));
}

async function createRenewal(userId: string, req: any, res: any) {
  const r = req.body;
  const { rows } = await query(
    `INSERT INTO renewals (
      id, user_id, name, type, frequency, cost, currency, renewal_date,
      provider, notes, color, icon, notification_enabled, notification_days_before,
      status, payment_method, bank_account, tags, auto_renew, contract_end_date, attachments
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
    RETURNING *`,
    [
      r.id, userId, r.name, r.type || 'other', r.frequency || 'monthly',
      r.cost || 0, r.currency || 'EUR', r.renewalDate,
      r.provider || null, r.notes || null, r.color || null, r.icon || null,
      r.notificationEnabled !== false, r.notificationDaysBefore || 7,
      r.status || 'active', r.paymentMethod || null, r.bankAccount || null,
      JSON.stringify(r.tags || []), r.autoRenew || false,
      r.contractEndDate || null, JSON.stringify(r.attachments || [])
    ]
  );
  return res.status(201).json(mapRenewal(rows[0]));
}

async function updateRenewal(userId: string, req: any, res: any) {
  const r = req.body;
  const { rows } = await query(
    `UPDATE renewals SET
      name = $3, type = $4, frequency = $5, cost = $6, currency = $7,
      renewal_date = $8, provider = $9, notes = $10, color = $11, icon = $12,
      notification_enabled = $13, notification_days_before = $14,
      status = $15, payment_method = $16, bank_account = $17,
      tags = $18, auto_renew = $19, contract_end_date = $20,
      attachments = $21, updated_at = now()
    WHERE id = $1 AND user_id = $2
    RETURNING *`,
    [
      r.id, userId, r.name, r.type || 'other', r.frequency || 'monthly',
      r.cost || 0, r.currency || 'EUR', r.renewalDate,
      r.provider || null, r.notes || null, r.color || null, r.icon || null,
      r.notificationEnabled !== false, r.notificationDaysBefore || 7,
      r.status || 'active', r.paymentMethod || null, r.bankAccount || null,
      JSON.stringify(r.tags || []), r.autoRenew || false,
      r.contractEndDate || null, JSON.stringify(r.attachments || [])
    ]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  return res.json(mapRenewal(rows[0]));
}

async function deleteRenewal(userId: string, req: any, res: any) {
  const { id } = req.body || req.query || {};
  const { rowCount } = await query(
    'DELETE FROM renewals WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
  return res.json({ success: true });
}

function mapRenewal(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    frequency: row.frequency,
    cost: Number(row.cost),
    currency: row.currency,
    renewalDate: row.renewal_date,
    provider: row.provider,
    notes: row.notes,
    color: row.color,
    icon: row.icon,
    notificationEnabled: row.notification_enabled,
    notificationDaysBefore: row.notification_days_before,
    status: row.status,
    paymentMethod: row.payment_method,
    bankAccount: row.bank_account,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    autoRenew: row.auto_renew,
    contractEndDate: row.contract_end_date,
    attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
