// Email notifications using Resend API
// Alternative: SendGrid, AWS SES

const RESEND_API = 'https://api.resend.com/emails';

interface EmailNotificationParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  apiKey: string;
}

/**
 * Send email using Resend API
 * 
 * Setup:
 * 1. Create account at https://resend.com
 * 2. Get API key
 * 3. Verify domain or use onboarding@resend.dev for testing
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'onboarding@resend.dev',
  apiKey,
}: EmailNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (response.ok) {
      const data = await response.json();
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

// Email templates
export function createRenewalReminderEmail(
  renewalName: string,
  renewalDate: string,
  daysUntil: number,
  cost: string
): string {
  const daysText = daysUntil === 0 
    ? 'hoy' 
    : daysUntil === 1 
    ? 'mañana' 
    : `en ${daysUntil} días`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #007AFF;">🔔 Recordatorio de Renovación</h2>
      <p>Tu renovación <strong>${renewalName}</strong> vence ${daysText}.</p>
      <div style="background: #F2F2F7; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Fecha:</strong> ${renewalDate}</p>
        <p style="margin: 8px 0 0;"><strong>Importe:</strong> ${cost}</p>
      </div>
      <p style="color: #666; font-size: 14px;">
        Gestiona todas tus renovaciones en RenovacionesApp
      </p>
    </div>
  `;
}
