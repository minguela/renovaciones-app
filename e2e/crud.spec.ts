import { test, expect } from '@playwright/test';
import { injectMockSession } from './helpers/auth';

test.describe('CRUD Renewals', () => {
  test('create a new renewal from catalog', async ({ page }) => {
    await injectMockSession(page);
    await page.goto('/renewal/new');
    await page.waitForTimeout(1500);

    // Open catalog
    await page.locator('text=Elegir del catálogo').click();
    await page.waitForTimeout(600);

    // Select category and option
    await page.locator('text=Streaming y entretenimiento').click();
    await page.waitForTimeout(600);
    await page.locator('text=Netflix').first().click();
    await page.waitForTimeout(800);

    // Verify fields populated by catalog
    await expect(page.locator('input[placeholder="Ej: Seguro de coche"]').first()).toHaveValue('Netflix');
    await expect(page.locator('input[placeholder="Ej: Mapfre"]').first()).toHaveValue('Netflix');
    await expect(page.locator('input[placeholder="0.00"]').first()).toHaveValue('12.99');
    await expect(page.locator('text=Mensual').first()).toBeVisible();
  });

  test('create a custom renewal manually', async ({ page }) => {
    await injectMockSession(page);
    await page.goto('/renewal/new');
    await page.waitForTimeout(1500);

    // Fill form manually
    await page.locator('input[placeholder="Ej: Seguro de coche"]').first().fill('Seguro de coche');
    await page.locator('input[placeholder="Ej: Mapfre"]').first().fill('Mapfre');
    await page.locator('input[placeholder="0.00"]').first().fill('450');

    // Select type Seguro
    const seguroBtn = page.locator('div:has-text("Seguro")').filter({ hasNotText: 'suscripciones' }).filter({ hasNotText: 'Seguros' }).first();
    await seguroBtn.click();

    // Select frequency Anual
    await page.locator('text=Anual').first().click();

    // Verify fields
    await expect(page.locator('input[placeholder="Ej: Seguro de coche"]').first()).toHaveValue('Seguro de coche');
  });
});
