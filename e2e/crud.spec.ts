import { test, expect } from '@playwright/test';
import { injectMockSession, isValidUUIDv4 } from './helpers/auth';

test.describe('CRUD Renewals', () => {
  test('create renewal generates valid UUID v4', async ({ page }) => {
    await injectMockSession(page);

    // Intercept Supabase insert call
    let capturedBody: any = null;
    await page.route('**/rest/v1/renewals*', async (route, request) => {
      if (request.method() === 'POST') {
        capturedBody = request.postDataJSON();
        // Mock success response
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(capturedBody),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/renewal/new');
    await page.waitForTimeout(1500);

    // Fill basic fields
    await page.locator('input[placeholder="Ej: Seguro de coche"]').first().fill('Suscripción E2E');
    await page.locator('input[placeholder="Ej: Mapfre"]').first().fill('Proveedor E2E');
    await page.locator('input[placeholder="0.00"]').first().fill('99.99');

    // Submit form
    await page.getByText('Crear renovación').click();

    // Wait for interception
    await page.waitForTimeout(2000);

    // Assert request was captured
    expect(capturedBody).toBeTruthy();

    // Supabase insert sends an array or object depending on version
    const payload = Array.isArray(capturedBody) ? capturedBody[0] : capturedBody;
    expect(payload).toBeTruthy();
    expect(payload.id).toBeTruthy();

    // Critical assertion: ID must be a valid UUID v4
    expect(isValidUUIDv4(payload.id)).toBe(true);

    // Verify other required fields
    expect(payload.name).toBe('Suscripción E2E');
    expect(payload.provider).toBe('Proveedor E2E');
    expect(payload.cost).toBe(99.99);
    expect(payload.user_id).toBe('e2e-test-user-id');
  });

  test('catalog picker populates form fields', async ({ page }) => {
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
});
