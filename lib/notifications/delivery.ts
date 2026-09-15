import { sendTelegramMessage } from './telegram';
import { sendWhatsAppMessage } from './whatsapp';
import { sendEmail } from './email';

export interface NotificationProfile {
  notification_method: string;
  telegram_chat_id?: string | null;
  whatsapp_number?: string | null;
  email_address?: string | null;
  email?: string | null;
  user_email?: string | null;
}

export interface DeliveryResult { success: boolean; error?: string; channel?: string }

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

export async function deliverNotification(profile: NotificationProfile, message: string, subject: string, allowEmailFallback = false): Promise<DeliveryResult> {
  switch (profile.notification_method) {
    case 'telegram':
      if (!profile.telegram_chat_id || !process.env.TELEGRAM_BOT_TOKEN) {
        if (allowEmailFallback) {
          const email = await deliverNotification({ ...profile, notification_method: 'email' }, message, subject);
          if (email.success) return email;
        }
        return { success: false, error: 'Telegram no está configurado en el perfil o el servidor' };
      }
      const telegram = await sendTelegramMessage({
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: profile.telegram_chat_id,
        message,
      });
      if (telegram.success) return { success: true, channel: 'telegram' };
      if (allowEmailFallback) {
        const email = await deliverNotification({ ...profile, notification_method: 'email' }, message, subject);
        if (email.success) {
          console.error('Telegram failed; email fallback sent', { telegramError: telegram.error });
          return { success: true, channel: 'email' };
        }
      }
      return telegram;
    case 'email': {
      const to = profile.email_address || profile.email || profile.user_email;
      if (!to || !process.env.RESEND_API_KEY) {
        return { success: false, error: 'Email no está configurado en el perfil o el servidor' };
      }
      const email = await sendEmail({
        to, subject, html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
        from: process.env.FROM_EMAIL || 'Renovaciones <notificaciones@dminguela.es>',
        apiKey: process.env.RESEND_API_KEY,
      });
      return email.success ? { success: true, channel: 'email' } : email;
    }
    case 'whatsapp':
      if (!profile.whatsapp_number || !process.env.CALLMEBOT_API_KEY) {
        return { success: false, error: 'WhatsApp no está configurado en el perfil o el servidor' };
      }
      const whatsapp = await sendWhatsAppMessage({
        phoneNumber: profile.whatsapp_number,
        apiKey: process.env.CALLMEBOT_API_KEY,
        message,
      });
      return whatsapp.success ? { success: true, channel: 'whatsapp' } : whatsapp;
    default:
      return { success: false, error: 'Elige un canal de aviso disponible' };
  }
}
