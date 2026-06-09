import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

function isAuthorized(req: Request) {
  const expected = Deno.env.get('NOTIFICATION_FUNCTION_SECRET')
  return Boolean(expected && req.headers.get('x-notification-secret') === expected)
}

serve(async (req) => {
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { chatId, text, parseMode } = await req.json()
  const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')

  if (!TELEGRAM_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not configured' }), { status: 500 })
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode || 'HTML',
      }),
    })

    const data = await res.json()
    if (!data.ok) throw new Error(data.description || 'Telegram error')

    return new Response(JSON.stringify({ success: true, messageId: data.result.message_id }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Telegram send failed' }), { status: 500 })
  }
})
