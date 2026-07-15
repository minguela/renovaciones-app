// api/check-renewals.ts
// Scheduled endpoint — called daily by cron/Uptime-Kuma/n8n
// Checks all users with notifications enabled and sends reminders
// for renewals approaching within their configured notification window.
//
// GET /api/check-renewals?secret=<NOTIFICATION_FUNCTION_SECRET>
//
// This is a serverless function; must be called with the shared secret.

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const INTERNAL_SECRET = process.env.NOTIFICATION_FUNCTION_SECRET || '';

export default async function handler(req: any, res: any) {
  // Only GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth via shared secret in query param
  const { secret } = req.query;
  if (!INTERNAL_SECRET || secret !== INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server not configured — missing Supabase env vars' });
  }

  const results: any[] = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  try {
    // 1. Fetch all profiles with notifications enabled
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?notifications_enabled=eq.true&select=*`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const profiles = await profilesRes.json();

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.json({ success: true, checked: 0, sent: 0, message: 'No profiles with notifications enabled' });
    }

    let sent = 0;

    for (const profile of profiles) {
      // 2. Fetch active renewals for this user
      const renewalsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/renewals?user_id=eq.${profile.id}&select=*`,
        { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      const renewals = await renewalsRes.json();

      if (!Array.isArray(renewals)) continue;

      for (const renewal of renewals) {
        // Skip if notifications disabled for this renewal
        if (!renewal.notification_enabled) continue;
        // Skip cancelled
        if (renewal.status === 'cancelled') continue;

        const renewalDate = new Date(renewal.renewal_date);
        const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const notifyBefore = renewal.notification_days_before || 7;

        // Only notify if within the notification window
        if (daysUntil < 0 || daysUntil > notifyBefore) continue;

        const cost = `${Number(renewal.cost).toFixed(2)} ${renewal.currency}`;
        const dateStr = renewalDate.toLocaleDateString('es-ES');
        const daysText = daysUntil === 0 ? 'hoy' : daysUntil === 1 ? 'mañana' : `en ${daysUntil} días`;

        const method = profile.notification_method || 'none';
        let sentOk = false;

        try {
          switch (method) {
            case 'email': {
              const to = profile.email_address || profile.email;
              if (!to || !RESEND_API_KEY) break;
              const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'Renovaciones <notificaciones@dminguela.es>',
                  to,
                  subject: `🔔 ${renewal.name} vence ${daysText}`,
                  html: `<h2>🔔 Recordatorio de Renovación</h2><p><strong>${renewal.name}</strong> vence <strong>${daysText}</strong>.</p><p>📅 Fecha: ${dateStr}<br>💰 Importe: ${cost}</p><p><a href="https://renovaciones.dminguela.es">Gestionar en Renovaciones</a></p>`,
                }),
              });
              if (emailRes.ok) sentOk = true;
              break;
            }
            case 'whatsapp': {
              const phone = profile.whatsapp_number;
              if (!phone || !CALLMEBOT_API_KEY) break;
              const msg = `🔔 *Recordatorio de Renovación*%0A%0A*${renewal.name}* vence ${daysText}%0A%0A📅 Fecha: ${dateStr}%0A💰 Importe: ${cost}`;
              const waRes = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${msg}&apikey=${CALLMEBOT_API_KEY}`);
              if (waRes.ok) sentOk = true;
              break;
            }
            case 'telegram': {
              const chatId = profile.telegram_chat_id;
              if (!chatId || !TELEGRAM_BOT_TOKEN) break;
              const tgMsg = `<b>🔔 Recordatorio de Renovación</b>%0A%0A<b>${renewal.name}</b> vence ${daysText}%0A%0A📅 Fecha: ${dateStr}%0A💰 Importe: ${cost}`;
              const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${tgMsg}&parse_mode=HTML`);
              if (tgRes.ok) sentOk = true;
              break;
            }
            case 'sms':
              // SMS disabled — would need Twilio or similar
              break;
            case 'push':
              // Push handled locally by expo-notifications on device
              break;
          }
        } catch (e: any) {
          console.error(`Notification error for ${profile.id}/${renewal.id}:`, e.message);
        }

        results.push({
          userId: profile.id,
          renewalId: renewal.id,
          renewal: renewal.name,
          channel: method,
          daysUntil,
          sent: sentOk,
        });

        if (sentOk) sent++;
      }
    }

    return res.json({
      success: true,
      date: today,
      checked: profiles.length,
      sent,
      details: results,
    });
  } catch (error: any) {
    console.error('check-renewals error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
