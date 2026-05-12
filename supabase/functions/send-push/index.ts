import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { tokens, title, body, data } = await req.json()

  // Expo Push
  const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN')

  if (EXPO_ACCESS_TOKEN && tokens.some((t: string) => t.startsWith('ExponentPushToken'))) {
    const expoTokens = tokens.filter((t: string) => t.startsWith('ExponentPushToken'))
    const messages = expoTokens.map((token: string) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }))

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await res.json()
    return new Response(JSON.stringify({ success: true, expo: result }), { status: 200 })
  }

  // Web Push (VAPID)
  const webTokens = tokens.filter((t: string) => !t.startsWith('ExponentPushToken'))
  if (webTokens.length > 0) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Web Push requires service worker implementation on the client. Use the web-push library in your frontend.',
    }), { status: 501 })
  }

  return new Response(JSON.stringify({ error: 'No valid push tokens provided' }), { status: 400 })
})
