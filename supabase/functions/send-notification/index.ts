import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

interface Renewal {
  service_name: string
  amount: number
  currency: string
  due_date: string
  category: string
  days_remaining: number
  url?: string
}

interface Payload {
  channel: 'email' | 'sms' | 'telegram' | 'push' | 'whatsapp'
  to: string
  renewal: Renewal
}

/* ---------- Templates ---------- */
function buildEmail(renewal: Renewal) {
  const { service_name, amount, currency, due_date, category, days_remaining, url } = renewal
  const subject = days_remaining <= 0
    ? `Tu suscripción a ${service_name} vence hoy`
    : `Tu suscripción a ${service_name} vence en ${days_remaining} días`

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;color:#222">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #ebebeb">
        <h2 style="margin-top:0;font-size:20px;font-weight:600">${subject}</h2>
        <p style="color:#717171;font-size:15px;line-height:1.5">
          Hola,<br><br>
          Te recordamos que tu suscripción a <strong>${service_name}</strong> (${category})
          ${days_remaining <= 0 ? 'vence <strong style="color:#ff385c">hoy</strong>' : `vence en <strong>${days_remaining} días</strong>`}.
        </p>
        <div style="background:#f7f7f7;border-radius:8px;padding:16px;margin:20px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#717171">Importe</span>
            <strong>${amount.toFixed(2)} ${currency}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#717171">Fecha de cargo</span>
            <strong>${due_date}</strong>
          </div>
        </div>
        ${url ? `<a href="${url}" style="display:inline-block;background:#222;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:500;margin-top:8px">Gestionar renovación</a>` : ''}
        <p style="color:#b0b0b0;font-size:12px;margin-top:24px">Recibes este mensaje porque tienes activadas las notificaciones en RenovacionesApp.</p>
      </div>
    </div>`

  const text = `${subject}\n\nHola,\n\nTe recordamos que tu suscripción a ${service_name} (${category}) ${days_remaining <= 0 ? 'vence HOY' : `vence en ${days_remaining} días`}.\n\nImporte: ${amount.toFixed(2)} ${currency}\nFecha de cargo: ${due_date}\n\n${url ? `Gestionar: ${url}` : ''}\n\n---\nRenovacionesApp`

  return { subject, html, text }
}

function buildSMS(renewal: Renewal) {
  const { service_name, amount, currency, due_date, days_remaining } = renewal
  return days_remaining <= 0
    ? `[RenovacionesApp] Tu suscripción a ${service_name} (${amount.toFixed(2)}${currency}) vence HOY (${due_date}). Abre la app para gestionarla.`
    : `[RenovacionesApp] Tu suscripción a ${service_name} (${amount.toFixed(2)}${currency}) vence en ${days_remaining} días (${due_date}). Abre la app para gestionarla.`
}

function buildTelegram(renewal: Renewal) {
  const { service_name, amount, currency, due_date, category, days_remaining, url } = renewal
  const emoji = days_remaining <= 0 ? '🔴' : days_remaining <= 3 ? '🟠' : '🟡'
  return `${emoji} <b>Recordatorio de Renovación</b>\n\nHola,\n\nTu suscripción a <b>${service_name}</b> (${category}) ${days_remaining <= 0 ? '<b>vence HOY</b>' : `vence en <b>${days_remaining} días</b>`}.\n\n💳 Importe: ${amount.toFixed(2)} ${currency}\n📅 Fecha: ${due_date}\n\n${url ? `👉 <a href="${url}">Gestionar renovación</a>` : 'Abre la app para gestionarla.'}`
}

function buildPush(renewal: Renewal) {
  const { service_name, days_remaining } = renewal
  return {
    title: days_remaining <= 0
      ? `Tu suscripción a ${service_name} vence hoy`
      : `Tu suscripción a ${service_name} vence en ${days_remaining} días`,
    body: 'Toca para gestionar tu renovación.',
    data: { type: 'renewal_reminder', service_name, days_remaining },
  }
}

function buildWhatsApp(renewal: Renewal) {
  const { service_name, amount, currency, due_date, category, days_remaining, url } = renewal
  return `*Recordatorio de Renovación*\n\nHola,\n\nTu suscripción a *${service_name}* (${category}) ${days_remaining <= 0 ? '*vence HOY*' : `vence en *${days_remaining} días*`}.\n\n💳 Importe: ${amount.toFixed(2)} ${currency}\n📅 Fecha: ${due_date}\n\n${url ? `👉 ${url}` : 'Abre la app para gestionarla.'}`
}

/* ---------- Senders ---------- */
async function sendEmail(to: string, renewal: Renewal) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')

  const { subject, html, text } = buildEmail(renewal)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, text, html }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Resend error')
  return data
}

async function sendSMS(to: string, renewal: Renewal) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const token = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_PHONE_NUMBER')
  if (!sid || !token || !from) throw new Error('Twilio credentials not configured')

  const body = buildSMS(renewal)
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + btoa(`${sid}:${token}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Twilio error')
  return data
}

async function sendTelegram(chatId: string, renewal: Renewal) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not configured')

  const text = buildTelegram(renewal)
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.description || 'Telegram error')
  return data.result
}

async function sendPush(to: string, renewal: Renewal) {
  const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN')
  if (!expoToken) throw new Error('EXPO_ACCESS_TOKEN not configured')

  const push = buildPush(renewal)
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${expoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      to,
      title: push.title,
      body: push.body,
      data: push.data,
      sound: 'default',
    }]),
  })
  const data = await res.json()
  if (data.errors) throw new Error(data.errors[0].message || 'Expo error')
  return data.data
}

async function sendWhatsApp(to: string, renewal: Renewal) {
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  if (!accessToken || !phoneNumberId) throw new Error('WhatsApp credentials not configured')

  const body = buildWhatsApp(renewal)
  const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body },
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'WhatsApp error')
  return data
}

/* ---------- Handler ---------- */
serve(async (req) => {
  const payload: Payload = await req.json()
  const { channel, to, renewal } = payload

  try {
    let result: unknown
    switch (channel) {
      case 'email': result = await sendEmail(to, renewal); break
      case 'sms': result = await sendSMS(to, renewal); break
      case 'telegram': result = await sendTelegram(to, renewal); break
      case 'push': result = await sendPush(to, renewal); break
      case 'whatsapp': result = await sendWhatsApp(to, renewal); break
      default:
        return new Response(JSON.stringify({ error: 'Unknown channel' }), { status: 400 })
    }
    return new Response(JSON.stringify({ success: true, channel, result }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, channel }), { status: 500 })
  }
})
