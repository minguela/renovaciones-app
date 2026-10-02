import { test, expect } from '@playwright/test';

async function expectSignedOutRenewalGate(page: import('@playwright/test').Page) {
  await expect(page.getByText('Continuar con Google').last()).toBeVisible();
  await expect(page.getByPlaceholder('tu@email.com').last()).toBeVisible();
  await expect(page.locator('input[placeholder="Ej: Seguro de coche"]')).toHaveCount(0);
  await expect(page.getByText('Crear renovación')).toHaveCount(0);
}

test.describe('Renewals require an authenticated session', () => {
  test('keeps the new renewal form behind the sign-in screen', async ({ page }) => {
    await page.goto('/renewal/new');

    await expectSignedOutRenewalGate(page);
  });

  test('does not expose the payment-method form while signed out', async ({ page }) => {
    await page.goto('/renewal/new');

    await expectSignedOutRenewalGate(page);
    await expect(page.locator('input[placeholder="0.00"]')).toHaveCount(0);
  });

  test('keeps an existing renewal editor behind the sign-in screen', async ({ page }) => {
    await page.goto('/renewal/2f4f2d34-99ae-4f8c-917c-f07063d22740');

    await expectSignedOutRenewalGate(page);
  });
});
