import { query } from './db';
import { getUserIdFromRequest } from './auth-helpers';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { type, renewalId } = req.body || {};

    // Fetch user profile
    const profileRes = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0];

    if (!profile || !profile.notifications_enabled) {
      return res.status(400).json({ error: 'Notifications disabled' });
    }

    if (type === 'test') {
      const message = '🔔 Esta es una notificación de prueba de RenovacionesApp';

      switch (profile.notification_method) {
        case 'whatsapp':
          if (profile.whatsapp_number && CALLMEBOT_API_KEY) {
            const encoded = encodeURIComponent(message);
            await fetch(`https://api.callmebot.com/whatsapp.php?phone=${profile.whatsapp_number}&text=${encoded}&apikey=${CALLMEBOT_API_KEY}`);
            return res.json({ success: true });
          }
          break;
        case 'telegram':
          if (profile.telegram_chat_id && TELEGRAM_BOT_TOKEN) {
            const encoded = encodeURIComponent(message);
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${profile.telegram_chat_id}&text=${encoded}`);
            return res.json({ success: true });
          }
          break;
        case 'email': {
          const email = profile.email_address || profile.email;
          if (email && RESEND_API_KEY) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Renovaciones <notificaciones@dminguela.es>',
                to: email,
                subject: 'Notificación de prueba - RenovacionesApp',
                html: `<p>${message}</p>`,
              }),
            });
            return res.json({ success: true });
          }
          break;
        }
      }
      return res.json({ success: false, error: 'Notification method not configured' });
    }

    if (type === 'reminder' && renewalId) {
      const renewalRes = await query(
        'SELECT * FROM renewals WHERE id = $1 AND user_id = $2',
        [renewalId, userId]
      );
      const renewal = renewalRes.rows[0];
      if (!renewal) return res.status(404).json({ error: 'Renewal not found' });

      const daysUntil = Math.ceil(
        (new Date(renewal.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const cost = `${Number(renewal.cost).toFixed(2)} ${renewal.currency}`;
      const dateStr = new Date(renewal.renewal_date).toLocaleDateString('es-ES');
      const daysText = daysUntil <= 0
        ? (daysUntil === 0 ? 'hoy' : `hace ${Math.abs(daysUntil)} días`)
        : daysUntil === 1 ? 'mañana' : `en ${daysUntil} días`;

      switch (profile.notification_method) {
        case 'telegram':
          if (profile.telegram_chat_id && TELEGRAM_BOT_TOKEN) {
            const msg = `<b>🔔 Recordatorio de Renovación</b>\n\n<b>${renewal.name}</b> vence ${daysText}\n\n📅 Fecha: ${dateStr}\n💰 Importe: ${cost}`;
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${profile.telegram_chat_id}&text=${encodeURIComponent(msg)}&parse_mode=HTML`);
            return res.json({ success: true });
          }
          break;
        case 'whatsapp':
          if (profile.whatsapp_number && CALLMEBOT_API_KEY) {
            const msg = `🔔 *Recordatorio de Renovación*\n\n*${renewal.name}* vence ${daysText}\n\n📅 Fecha: ${dateStr}\n💰 Importe: ${cost}`;
            await fetch(`https://api.callmebot.com/whatsapp.php?phone=${profile.whatsapp_number}&text=${encodeURIComponent(msg)}&apikey=${CALLMEBOT_API_KEY}`);
            return res.json({ success: true });
          }
          break;
        case 'email': {
          const email = profile.email_address || profile.email;
          if (email && RESEND_API_KEY) {
            const html = `<h2>🔔 Recordatorio de Renovación</h2><p><strong>${renewal.name}</strong> vence <strong>${daysText}</strong>.</p><p>📅 Fecha: ${dateStr}<br>💰 Importe: ${cost}</p>`;
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Renovaciones <notificaciones@dminguela.es>',
                to: email,
                subject: `🔔 Recordatorio: ${renewal.name} vence ${daysText}`,
                html,
              }),
            });
            return res.json({ success: true });
          }
          break;
        }
      }
    }

    return res.json({ success: false, error: 'Invalid notification type or not configured' });
  } catch (error: any) {
    console.error('Notification error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
