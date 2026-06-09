import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

function isAuthorized(req: Request) {
  const expected = Deno.env.get('NOTIFICATION_FUNCTION_SECRET')
  return Boolean(expected && req.headers.get('x-notification-secret') === expected)
}

serve(async (req) => {
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { to, body, templateName, languageCode } = await req.json()
  const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return new Response(JSON.stringify({ error: 'WhatsApp credentials not configured' }), { status: 500 })
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`
    const payload = templateName
      ? {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: { name: templateName, language: { code: languageCode || 'es' } },
        }
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body },
        }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'WhatsApp API error')

    return new Response(JSON.stringify({ success: true, messageId: data.messages?.[0]?.id }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'WhatsApp send failed' }), { status: 500 })
  }
})
