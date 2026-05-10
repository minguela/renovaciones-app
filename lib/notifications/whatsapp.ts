// WhatsApp notifications using CallMeBot (free for personal use)
// Alternative: Twilio (paid but more reliable)

const CALLMEBOT_API = 'https://api.callmebot.com/whatsapp.php';

interface WhatsAppNotificationParams {
  phoneNumber: string;
  message: string;
  apiKey?: string;
}

/**
 * Send WhatsApp message using CallMeBot API
 * User needs to:
 * 1. Add +34 644 16 71 91 to their contacts
 * 2. Send "I allow callmebot to send me messages" to that number
 * 3. Get API key from https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendWhatsAppMessage({
  phoneNumber,
  message,
  apiKey,
}: WhatsAppNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key no configurada. Obtén una en https://www.callmebot.com/',
      };
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = phoneNumber.replace(/[+\s]/g, '');

    const url = `${CALLMEBOT_API}?phone=${formattedPhone}&text=${encodeURIComponent(
      message
    )}&apikey=${apiKey}`;

    const response = await fetch(url);
    const text = await response.text();

    if (response.ok && text.includes('Message queued')) {
      return { success: true };
    } else {
      return { success: false, error: text };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// Twilio alternative (more reliable, paid)
const TWILIO_API = 'https://api.twilio.com/2010-04-01';

interface TwilioParams {
  to: string;
  message: string;
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export async function sendWhatsAppTwilio({
  to,
  message,
  accountSid,
  authToken,
  fromNumber,
}: TwilioParams): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${TWILIO_API}/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${fromNumber}`,
        Body: message,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
