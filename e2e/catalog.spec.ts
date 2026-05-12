import { test, expect } from '@playwright/test';
import { injectMockSession } from './helpers/auth';

test.describe('Catalog Autocomplete', () => {
  test('catalog picker opens and autocomplete works', async ({ page }) => {
    await injectMockSession(page);
    await page.goto('/renewal/new');
    await page.waitForTimeout(2000);
    
    // Wait for the form to load (not the auth screen)
    const nameInput = page.locator('input[placeholder="Ej: Seguro de coche"]').first();
    await expect(nameInput).toBeVisible();
    
    // Verify initial state: name field is empty
    const initialName = await nameInput.inputValue();
    expect(initialName).toBe('');
    
    // Click "Elegir del catalogo"
    const catalogBtn = page.locator('text=Elegir del catálogo');
    await expect(catalogBtn).toBeVisible();
    await catalogBtn.click();
    
    // Wait for catalog picker to open
    await page.waitForTimeout(500);
    
    // Verify catalog picker header is visible
    const catalogHeader = page.locator('text=Elegir del catálogo').nth(1);
    await expect(catalogHeader).toBeVisible();
    
    // Click on a category (e.g., Streaming)
    const streamingCategory = page.locator('text=Streaming y entretenimiento');
    await expect(streamingCategory).toBeVisible();
    await streamingCategory.click();
    
    // Wait for options to load
    await page.waitForTimeout(500);
    
    // Click on an option (e.g., Netflix)
    const netflixOption = page.locator('text=Netflix').first();
    await expect(netflixOption).toBeVisible();
    await netflixOption.click();
    
    // Wait for picker to close and form to update
    await page.waitForTimeout(1000);
    
    // Verify form fields are auto-filled
    const finalName = await nameInput.inputValue();
    expect(finalName).toBe('Netflix');
    
    // Check provider field
    const providerInput = page.locator('input[placeholder="Ej: Mapfre"]').first();
    const providerValue = await providerInput.inputValue();
    expect(providerValue).toBe('Netflix');
    
    // Check cost field
    const costInput = page.locator('input[placeholder="0.00"]').first();
    const costValue = await costInput.inputValue();
    expect(costValue).toBe('12.99');
  });
});
