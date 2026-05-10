// Telegram notifications using Bot API

const TELEGRAM_API = 'https://api.telegram.org/bot';

interface TelegramNotificationParams {
  botToken: string;
  chatId: string;
  message: string;
}

/**
 * Send Telegram message via Bot API
 * 
 * Setup:
 * 1. Create bot with @BotFather
 * 2. Get bot token
 * 3. Send message to bot
 * 4. Get chat ID from https://api.telegram.org/bot<TOKEN>/getUpdates
 */
export async function sendTelegramMessage({
  botToken,
  chatId,
  message,
}: TelegramNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${TELEGRAM_API}${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return { success: true };
    } else {
      return { success: false, error: data.description };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Get chat ID for a user who has messaged the bot
 */
export async function getChatId(botToken: string): Promise<string | null> {
  try {
    const url = `${TELEGRAM_API}${botToken}/getUpdates`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      // Get chat ID from most recent message
      const lastUpdate = data.result[data.result.length - 1];
      return lastUpdate.message?.chat?.id?.toString() || null;
    }
    return null;
  } catch {
    return null;
  }
}
