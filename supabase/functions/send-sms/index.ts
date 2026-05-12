import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { to, body } = await req.json()
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return new Response(JSON.stringify({ error: 'Twilio credentials not configured' }), { status: 500 })
  }

  try {
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER || '',
        Body: body,
      }).toString(),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Twilio error')

    return new Response(JSON.stringify({ success: true, sid: data.sid }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
