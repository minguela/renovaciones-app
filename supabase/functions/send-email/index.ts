import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { to, subject, body, html } = await req.json()
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev'

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        text: body,
        html: html || body,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Resend error')

    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
