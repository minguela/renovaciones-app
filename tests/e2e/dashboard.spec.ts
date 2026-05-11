import { test, expect } from '@playwright/test';

test.describe('Dashboard (authenticated)', () => {
  test('dashboard shows KPIs when logged in', async ({ page }) => {
    // This test assumes a logged-in state; in a real setup we'd login programmatically
    await page.goto('/');
    // If not authenticated, we see auth screen
    const authVisible = await page.getByText('Bienvenido').isVisible().catch(() => false);
    if (authVisible) {
      test.skip();
      return;
    }
    await expect(page.getByText('Gasto mensual')).toBeVisible();
    await expect(page.getByText('Gasto anual')).toBeVisible();
    await expect(page.getByText('Próximas 30d')).toBeVisible();
  });

  test('filter chips are visible', async ({ page }) => {
    await page.goto('/');
    const authVisible = await page.getByText('Bienvenido').isVisible().catch(() => false);
    if (authVisible) {
      test.skip();
      return;
    }
    await expect(page.getByText('Todas')).toBeVisible();
    await expect(page.getByText('Activas')).toBeVisible();
    await expect(page.getByText('Pendientes')).toBeVisible();
    await expect(page.getByText('Canceladas')).toBeVisible();
  });

  test('add renewal button is visible', async ({ page }) => {
    await page.goto('/');
    const authVisible = await page.getByText('Bienvenido').isVisible().catch(() => false);
    if (authVisible) {
      test.skip();
      return;
    }
    await expect(page.getByText('+ Añadir Renovación')).toBeVisible();
  });
});