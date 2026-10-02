import { test, expect } from '@playwright/test';

test.describe('Catalog Autocomplete', () => {
  test('requires authentication before showing the catalog picker', async ({ page }) => {
    await page.goto('/renewal/new');

    await expect(page.getByText('Continuar con Google').last()).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com').last()).toBeVisible();
    await expect(page.getByText('Elegir del catálogo')).toHaveCount(0);
    await expect(page.locator('input[placeholder="Ej: Seguro de coche"]')).toHaveCount(0);
  });
});
