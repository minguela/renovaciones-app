// API endpoint for sending notifications
// Compatible with Vercel serverless functions

import { sendWhatsAppMessage } from '../lib/notifications/whatsapp';
import { sendTelegramMessage } from '../lib/notifications/telegram';
import { sendEmail, createRenewalReminderEmail } from '../lib/notifications/email';

// Supabase service key for server-side operations
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, type, renewalId } = req.body;

    // Fetch user profile
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    const profiles = await profileRes.json();
    const profile = profiles[0];

    if (!profile || !profile.notifications_enabled) {
      return res.status(400).json({ error: 'Notifications disabled' });
    }

    // Test notification
    if (type === 'test') {
      const message = '🔔 Esta es una notificación de prueba de RenovacionesApp';
      
      switch (profile.notification_method) {
        case 'whatsapp':
          if (profile.whatsapp_number) {
            const result = await sendWhatsAppMessage({
              phoneNumber: profile.whatsapp_number,
              message,
              apiKey: process.env.CALLMEBOT_API_KEY,
            });
            return res.json(result);
          }
          break;

        case 'telegram':
          if (profile.telegram_chat_id) {
            const result = await sendTelegramMessage({
              botToken: process.env.TELEGRAM_BOT_TOKEN || '',
              chatId: profile.telegram_chat_id,
              message,
            });
            return res.json(result);
          }
          break;

        case 'email':
          const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=email`, {
            headers: {
              apikey: SUPABASE_SERVICE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
          });
          const users = await userRes.json();
          const email = users[0]?.email;
          
          if (email) {
            const result = await sendEmail({
              to: email,
              subject: 'Notificación de prueba - RenovacionesApp',
              html: `<p>${message}</p>`,
              apiKey: process.env.RESEND_API_KEY || '',
            });
            return res.json(result);
          }
          break;
      }

      return res.json({ success: false, error: 'Notification method not configured' });
    }

    // Renewal reminder notification
    if (type === 'reminder' && renewalId) {
      // Fetch renewal details
      const renewalRes = await fetch(
        `${SUPABASE_URL}/rest/v1/renewals?id=eq.${renewalId}&select=*`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );
      const renewals = await renewalRes.json();
      const renewal = renewals[0];

      if (!renewal) {
        return res.status(404).json({ error: 'Renewal not found' });
      }

      const daysUntil = Math.ceil(
        (new Date(renewal.renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const cost = `${renewal.cost.toFixed(2)} ${renewal.currency}`;
      const dateStr = new Date(renewal.renewal_date).toLocaleDateString('es-ES');

      switch (profile.notification_method) {
        case 'whatsapp':
          if (profile.whatsapp_number) {
            const daysText = daysUntil <= 0 
              ? (daysUntil === 0 ? 'hoy' : `hace ${Math.abs(daysUntil)} días`)
              : daysUntil === 1 
                ? 'mañana' 
                : `en ${daysUntil} días`;
            
            const message = `🔔 *Recordatorio de Renovación*\n\n` +
              `*${renewal.name}* vence ${daysText}\n\n` +
              `📅 Fecha: ${dateStr}\n` +
              `💰 Importe: ${cost}`;

            const result = await sendWhatsAppMessage({
              phoneNumber: profile.whatsapp_number,
              message,
              apiKey: process.env.CALLMEBOT_API_KEY,
            });
            return res.json(result);
          }
          break;

        case 'telegram':
          if (profile.telegram_chat_id) {
            const daysText = daysUntil <= 0
              ? (daysUntil === 0 ? 'hoy' : `hace ${Math.abs(daysUntil)} días`)
              : daysUntil === 1
                ? 'mañana'
                : `en ${daysUntil} días`;

            const message = `<b>🔔 Recordatorio de Renovación</b>\n\n` +
              `<b>${renewal.name}</b> vence ${daysText}\n\n` +
              `📅 Fecha: ${dateStr}\n` +
              `💰 Importe: ${cost}`;

            const result = await sendTelegramMessage({
              botToken: process.env.TELEGRAM_BOT_TOKEN || '',
              chatId: profile.telegram_chat_id,
              message,
            });
            return res.json(result);
          }
          break;

        case 'email':
          const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=email`, {
            headers: {
              apikey: SUPABASE_SERVICE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
          });
          const users = await userRes.json();
          const email = users[0]?.email;

          if (email) {
            const html = createRenewalReminderEmail(
              renewal.name,
              dateStr,
              daysUntil,
              cost
            );
            const result = await sendEmail({
              to: email,
              subject: `🔔 Recordatorio: ${renewal.name} vence ${daysUntil <= 0 ? 'hoy' : daysUntil === 1 ? 'mañana' : `en ${daysUntil} días`}`,
              html,
              apiKey: process.env.RESEND_API_KEY || '',
            });
            return res.json(result);
          }
          break;
      }
    }

    return res.json({ success: false, error: 'Invalid notification type' });
  } catch (error) {
    console.error('Notification error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
