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
      const p = req.body || {};
      const method = p.notification_method || 'none';
      if (!['none', 'email', 'telegram', 'whatsapp'].includes(method)) {
        return res.status(400).json({ error: 'Canal de aviso no disponible' });
      }
      const chatId = String(p.telegram_chat_id || '').trim();
      if (chatId && !/^-?\d+$/.test(chatId)) {
        return res.status(400).json({ error: 'El Chat ID de Telegram debe ser numérico' });
      }
      if (p.notifications_enabled && (
        method === 'none' ||
        (method === 'telegram' && !chatId) ||
        (method === 'email' && !p.email_address) ||
        (method === 'whatsapp' && !p.whatsapp_number)
      )) {
        return res.status(400).json({ error: 'Configura el destino del canal elegido' });
      }

      const values = [p.whatsapp_number || null, chatId || null, p.email_address || null,
        p.notifications_enabled === true, method, userId];
      const updated = await query(
        `UPDATE profiles SET whatsapp_number = $1, telegram_chat_id = $2,
         email_address = $3, notifications_enabled = $4, notification_method = $5,
         updated_at = now() WHERE user_id = $6 RETURNING *`, values
      );
      if (updated.rows[0]) return res.json(updated.rows[0]);

      const inserted = await query(
        `INSERT INTO profiles (user_id, whatsapp_number, telegram_chat_id, email_address,
         notifications_enabled, notification_method)
         VALUES ($6,$1,$2,$3,$4,$5) RETURNING *`, values
      );
      return res.json(inserted.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Profiles error:', err);
    return res.status(500).json({ error: err.message });
  }
}
