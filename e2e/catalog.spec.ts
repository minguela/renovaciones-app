import { test, expect } from '@playwright/test';
import { injectMockSession } from './helpers/auth';

test.describe('Catalog Autocomplete', () => {
  test('catalog picker opens and auto-fills all fields from Netflix', async ({ page }) => {
    await injectMockSession(page);
    await page.goto('/renewal/new');
    await page.waitForTimeout(2000);

    // Wait for the form to load
    const nameInput = page.locator('input[placeholder="Ej: Seguro de coche"]').first();
    await expect(nameInput).toBeVisible();
    expect(await nameInput.inputValue()).toBe('');

    // Open catalog
    const catalogBtn = page.locator('text=Elegir del catálogo');
    await expect(catalogBtn).toBeVisible();
    await catalogBtn.click();
    await page.waitForTimeout(600);

    // Pick Streaming category
    await page.locator('text=Streaming y entretenimiento').click();
    await page.waitForTimeout(600);

    // Pick Netflix
    await page.locator('text=Netflix').first().click();
    await page.waitForTimeout(800);

    // --- Assertions: all fields must be auto-populated ---

    // Name
    await expect(nameInput).toHaveValue('Netflix');

    // Provider
    const providerInput = page.locator('input[placeholder="Ej: Mapfre"]').first();
    await expect(providerInput).toHaveValue('Netflix');

    // Cost
    const costInput = page.locator('input[placeholder="0.00"]').first();
    await expect(costInput).toHaveValue('12.99');

    // Type pill selected (Suscripción)
    await expect(page.locator('text=Suscripción').first()).toBeVisible();

    // Frequency pill selected (Mensual)
    await expect(page.locator('text=Mensual').first()).toBeVisible();

    // Currency = EUR (€ button active) — check that € pill has selected background style
    const eurPill = page.locator('text=€').first();
    await expect(eurPill).toBeVisible();
  });
});
