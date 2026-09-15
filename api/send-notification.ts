import { query } from './db';
import { getUserIdFromRequest } from './auth-helpers';
import { deliverNotification } from '../lib/notifications/delivery';
import { daysBetween, nextOccurrence } from '../lib/notifications/reminders';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const profile = (await query(
      `SELECT p.*, u.email AS user_email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1`,
      [userId]
    )).rows[0];
    if (!profile?.notifications_enabled) return res.status(400).json({ error: 'Los recordatorios están desactivados' });

    const { type, renewalId } = req.body || {};
    let message = '🔔 Esta es una notificación de prueba de RenovacionesApp';
    let subject = 'Prueba de avisos de RenovacionesApp';

    if (type === 'reminder') {
      if (!renewalId) return res.status(400).json({ error: 'Falta la renovación' });
      const renewal = (await query(
        `SELECT *, renewal_date::text AS renewal_date FROM renewals WHERE id = $1 AND user_id = $2`,
        [renewalId, userId]
      )).rows[0];
      if (!renewal) return res.status(404).json({ error: 'Renewal not found' });
      const today = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('/').reverse().join('-');
      const occurrence = nextOccurrence(renewal.renewal_date, renewal.frequency, today) || renewal.renewal_date;
      const days = daysBetween(today, occurrence);
      const daysText = days === 0 ? 'hoy' : days === 1 ? 'mañana' : days < 0 ? `hace ${Math.abs(days)} días` : `en ${days} días`;
      const date = new Date(`${occurrence}T12:00:00Z`).toLocaleDateString('es-ES', { timeZone: 'UTC' });
      message = `🔔 Recordatorio de renovación\n\n${renewal.name} vence ${daysText}.\n📅 Fecha: ${date}\n💰 Importe: ${Number(renewal.cost).toFixed(2)} ${renewal.currency}`;
      subject = `🔔 ${renewal.name} vence ${daysText}`;
    } else if (type !== 'test') {
      return res.status(400).json({ error: 'Tipo de aviso no válido' });
    }

    const result = await deliverNotification(profile, message, subject);
    return res.status(result.success ? 200 : 502).json(result);
  } catch (error: any) {
    console.error('send-notification error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
