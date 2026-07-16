import { query } from './db';
import { getUserIdFromRequest } from './auth-helpers';

export default async function handler(req: any, res: any) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { rows } = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      return res.json(rows[0] || null);
    }

    if (req.method === 'PUT') {
      const p = req.body;
      const { rows } = await query(
        `INSERT INTO profiles (user_id, email, whatsapp_number, telegram_chat_id, sms_number, email_address, notifications_enabled, notification_method, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())
         ON CONFLICT (user_id) DO UPDATE SET
           email = EXCLUDED.email,
           whatsapp_number = EXCLUDED.whatsapp_number,
           telegram_chat_id = EXCLUDED.telegram_chat_id,
           sms_number = EXCLUDED.sms_number,
           email_address = EXCLUDED.email_address,
           notifications_enabled = EXCLUDED.notifications_enabled,
           notification_method = EXCLUDED.notification_method,
           updated_at = now()
         RETURNING *`,
        [userId, p.email || null, p.whatsapp_number || null, p.telegram_chat_id || null,
         p.sms_number || null, p.email_address || null, p.notifications_enabled !== false,
         p.notification_method || 'none']
      );
      return res.json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Profiles error:', err);
    return res.status(500).json({ error: err.message });
  }
}
