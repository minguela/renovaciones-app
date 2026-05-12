// Demo local: muestra como se verian los mensajes reales de renovacion
// Sin enviar nada. Para probar el envio real, usa la Edge Function send-notification.

const renewal = {
  service_name: 'Netflix',
  amount: 12.99,
  currency: 'EUR',
  due_date: '15 de mayo de 2026',
  category: 'Entretenimiento',
  days_remaining: 3,
  url: 'https://renovaciones-app.vercel.app/renewal/netflix-123',
}

function buildEmail(r) {
  const subject = r.days_remaining <= 0
    ? `Tu suscripcion a ${r.service_name} vence hoy`
    : `Tu suscripcion a ${r.service_name} vence en ${r.days_remaining} dias`
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;color:#222">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #ebebeb">
        <h2 style="margin-top:0;font-size:20px;font-weight:600">${subject}</h2>
        <p style="color:#717171;font-size:15px;line-height:1.5">
          Hola,<br><br>
          Te recordamos que tu suscripcion a <strong>${r.service_name}</strong> (${r.category})
          ${r.days_remaining <= 0 ? 'vence <strong style="color:#ff385c">hoy</strong>' : `vence en <strong>${r.days_remaining} dias</strong>`}.
        </p>
        <div style="background:#f7f7f7;border-radius:8px;padding:16px;margin:20px 0">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#717171">Importe</span>
            <strong>${r.amount.toFixed(2)} ${r.currency}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#717171">Fecha de cargo</span>
            <strong>${r.due_date}</strong>
          </div>
        </div>
        <a href="${r.url}" style="display:inline-block;background:#222;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:500;margin-top:8px">Gestionar renovacion</a>
        <p style="color:#b0b0b0;font-size:12px;margin-top:24px">Recibes este mensaje porque tienes activadas las notificaciones en RenovacionesApp.</p>
      </div>
    </div>`
  const text = `${subject}\n\nHola,\n\nTe recordamos que tu suscripcion a ${r.service_name} (${r.category}) ${r.days_remaining <= 0 ? 'vence HOY' : `vence en ${r.days_remaining} dias`}.\n\nImporte: ${r.amount.toFixed(2)} ${r.currency}\nFecha de cargo: ${r.due_date}\n\nGestionar: ${r.url}\n\n---\nRenovacionesApp`
  return { subject, html, text }
}

function buildSMS(r) {
  return r.days_remaining <= 0
    ? `[RenovacionesApp] Tu suscripcion a ${r.service_name} (${r.amount.toFixed(2)}${r.currency}) vence HOY (${r.due_date}). Abre la app para gestionarla.`
    : `[RenovacionesApp] Tu suscripcion a ${r.service_name} (${r.amount.toFixed(2)}${r.currency}) vence en ${r.days_remaining} dias (${r.due_date}). Abre la app para gestionarla.`
}

function buildTelegram(r) {
  const emoji = r.days_remaining <= 0 ? '\ud83d\udd34' : r.days_remaining <= 3 ? '\ud83d\udfe0' : '\ud83d\udfe1'
  return `${emoji} <b>Recordatorio de Renovacion</b>\n\nHola,\n\nTu suscripcion a <b>${r.service_name}</b> (${r.category}) ${r.days_remaining <= 0 ? '<b>vence HOY</b>' : `vence en <b>${r.days_remaining} dias</b>`}.\n\n\ud83d\udcb3 Importe: ${r.amount.toFixed(2)} ${r.currency}\n\ud83d\udcc5 Fecha: ${r.due_date}\n\n\ud83d\udc49 <a href="${r.url}">Gestionar renovacion</a>`
}

function buildPush(r) {
  return {
    title: r.days_remaining <= 0
      ? `Tu suscripcion a ${r.service_name} vence hoy`
      : `Tu suscripcion a ${r.service_name} vence en ${r.days_remaining} dias`,
    body: 'Toca para gestionar tu renovacion.',
    data: { type: 'renewal_reminder', service_name: r.service_name, days_remaining: r.days_remaining },
  }
}

function buildWhatsApp(r) {
  return `*Recordatorio de Renovacion*\n\nHola,\n\nTu suscripcion a *${r.service_name}* (${r.category}) ${r.days_remaining <= 0 ? '*vence HOY*' : `vence en *${r.days_remaining} dias*`}.\n\n\ud83d\udcb3 Importe: ${r.amount.toFixed(2)} ${r.currency}\n\ud83d\udcc5 Fecha: ${r.due_date}\n\n\ud83d\udc49 ${r.url}`
}

console.log('='.repeat(60))
console.log('DEMO: Mensajes reales de RenovacionesApp')
console.log('Suscripcion:', JSON.stringify(renewal, null, 2))
console.log('='.repeat(60))

console.log('\n--- EMAIL (texto plano) ---')
const email = buildEmail(renewal)
console.log('Asunto:', email.subject)
console.log('Cuerpo:\n', email.text)

console.log('\n--- SMS ---')
console.log(buildSMS(renewal))

console.log('\n--- TELEGRAM ---')
console.log(buildTelegram(renewal))

console.log('\n--- PUSH ---')
console.log(JSON.stringify(buildPush(renewal), null, 2))

console.log('\n--- WHATSAPP ---')
console.log(buildWhatsApp(renewal))

console.log('\n' + '='.repeat(60))
console.log('Para enviar reales, usa la Edge Function send-notification:')
console.log(`
curl -X POST https://grgmuqaigqgrbjvzjecn.supabase.co/functions/v1/send-notification \\
  -H "Authorization: Bearer <JWT_USUARIO>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "email",
    "to": "tu@email.com",
    "renewal": {
      "service_name": "Netflix",
      "amount": 12.99,
      "currency": "EUR",
      "due_date": "15 de mayo de 2026",
      "category": "Entretenimiento",
      "days_remaining": 3,
      "url": "https://renovaciones-app.vercel.app"
    }
  }'
`)
console.log('='.repeat(60))
