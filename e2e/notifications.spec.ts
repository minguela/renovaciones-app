import { test, expect } from '@playwright/test';

test('Telegram settings persist the selected channel and report a failed test delivery', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('auth_token', 'test-token'));
  await page.route('**/api/auth/me', route => route.fulfill({ json: { id: 'owner', email: 'owner@example.com' } }));
  await page.route('**/api/profiles', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { notifications_enabled: false, notification_method: 'none', telegram_chat_id: null } });
    } else {
      const payload = route.request().postDataJSON();
      expect(payload).toMatchObject({ notifications_enabled: true, notification_method: 'telegram', telegram_chat_id: '123456789' });
      await route.fulfill({ json: payload });
    }
  });
  await page.route('**/api/send-notification', route => route.fulfill({ status: 502, json: { success: false, error: 'Bad Request: chat not found' } }));

  await page.goto('/settings');
  await expect(page.getByRole('radio', { name: 'Telegram' })).toBeVisible();
  await page.getByPlaceholder('123456789').fill('123456789');
  await page.getByRole('switch').check();
  await page.getByText('Guardar ajustes').click();
  await expect(page.getByText('Ajustes guardados correctamente')).toBeVisible();

  await page.getByText('Probar aviso').click();
  await expect(page.getByText(/chat not found/)).toBeVisible();
  await expect(page.getByText('Aviso de prueba enviado')).not.toBeVisible();
});
