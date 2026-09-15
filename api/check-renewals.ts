import { query } from './db';
import { deliverNotification } from '../lib/notifications/delivery';
import { daysBetween, nextOccurrence, shouldRemind } from '../lib/notifications/reminders';

function todayInMadrid(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find(part => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = todayInMadrid();
  const details: any[] = [];
  let sent = 0;
  let failed = 0;

  try {
    const profiles = (await query(
      `SELECT p.*, u.email AS user_email FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.notifications_enabled = true AND p.notification_method IN ('telegram', 'email', 'whatsapp')`
    )).rows;

    for (const profile of profiles) {
      const renewals = (await query(
        `SELECT *, renewal_date::text AS renewal_date FROM renewals
         WHERE user_id = $1 AND notification_enabled = true AND status <> 'cancelled'`,
        [profile.user_id]
      )).rows;

      for (const renewal of renewals) {
        const occurrence = nextOccurrence(renewal.renewal_date, renewal.frequency, today);
        if (!occurrence) continue;
        const daysUntil = daysBetween(today, occurrence);
        const lead = Math.max(0, Number(renewal.notification_days_before ?? 7));
        if (!shouldRemind(daysUntil, lead)) continue;

        const daysText = daysUntil === 0 ? 'hoy' : daysUntil === 1 ? 'mañana' : `en ${daysUntil} días`;
        const date = new Date(`${occurrence}T12:00:00Z`).toLocaleDateString('es-ES', { timeZone: 'UTC' });
        const message = `🔔 Recordatorio de renovación\n\n${renewal.name} vence ${daysText}.\n📅 Fecha: ${date}\n💰 Importe: ${Number(renewal.cost).toFixed(2)} ${renewal.currency}\n\nGestionar: https://renovaciones.dminguela.es`;
        const outcome = await deliverNotification(profile, message, `🔔 ${renewal.name} vence ${daysText}`, true);
        if (outcome.success) sent++;
        else {
          failed++;
          console.error('Reminder delivery failed', { userId: profile.user_id, renewalId: renewal.id, channel: profile.notification_method, error: outcome.error });
        }
        details.push({ renewalId: renewal.id, channel: outcome.channel || profile.notification_method, daysUntil, sent: outcome.success, error: outcome.error });
      }
    }

    return res.status(failed ? 502 : 200).json({ success: failed === 0, date: today, checked: profiles.length, sent, failed, details });
  } catch (error: any) {
    console.error('check-renewals error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
