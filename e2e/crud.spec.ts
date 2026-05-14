import { test, expect } from '@playwright/test';
import { injectMockSession, isValidUUIDv4 } from './helpers/auth';

// Schema constraints from Supabase
const ALLOWED_PAYMENT_METHODS = ['card', 'direct_debit', 'paypal', 'bizum', 'other'];
const ALLOWED_FREQUENCIES = ['monthly', 'quarterly', 'biannual', 'annual', 'one-time'];
const ALLOWED_STATUSES = ['active', 'pending_cancellation', 'cancelled', 'renewed'];

test.describe('CRUD Renewals', () => {
  test('create renewal generates valid UUID v4 and respects DB constraints', async ({ page }) => {
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

    // Select payment method "Tarjeta" (card)
    await page.locator('text=Tarjeta').first().click();

    // Submit form
    await page.getByText('Crear renovación').click();

    // Wait for interception
    await page.waitForTimeout(2000);

    // Assert request was captured
    expect(capturedBody).toBeTruthy();

    // Supabase insert sends an array or object depending on version
    const payload = Array.isArray(capturedBody) ? capturedBody[0] : capturedBody;
    expect(payload).toBeTruthy();

    // Critical assertion: ID must be a valid UUID v4
    expect(payload.id).toBeTruthy();
    expect(isValidUUIDv4(payload.id)).toBe(true);

    // Validate DB constraints
    expect(payload.name).toBe('Suscripción E2E');
    expect(payload.provider).toBe('Proveedor E2E');
    expect(payload.cost).toBe(99.99);
    expect(payload.user_id).toBe('e2e-test-user-id');

    // payment_method must be in allowed list or null
    if (payload.payment_method !== null && payload.payment_method !== undefined) {
      expect(ALLOWED_PAYMENT_METHODS).toContain(payload.payment_method);
    }

    // frequency must be in allowed list
    expect(ALLOWED_FREQUENCIES).toContain(payload.frequency);

    // status must be in allowed list (or rely on DB default)
    if (payload.status) {
      expect(ALLOWED_STATUSES).toContain(payload.status);
    }

    // currency should be a valid string
    expect(typeof payload.currency).toBe('string');
    expect(payload.currency.length).toBeGreaterThan(0);

    // type should be a valid string
    expect(typeof payload.type).toBe('string');
    expect(payload.type.length).toBeGreaterThan(0);
  });

  test('create renewal without payment method still works (NULL is allowed)', async ({ page }) => {
    await injectMockSession(page);

    let capturedBody: any = null;
    await page.route('**/rest/v1/renewals*', async (route, request) => {
      if (request.method() === 'POST') {
        capturedBody = request.postDataJSON();
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

    // Fill only required fields, do NOT select payment method
    await page.locator('input[placeholder="Ej: Seguro de coche"]').first().fill('Sin método de pago');
    await page.locator('input[placeholder="0.00"]').first().fill('10');

    await page.getByText('Crear renovación').click();
    await page.waitForTimeout(2000);

    expect(capturedBody).toBeTruthy();
    const payload = Array.isArray(capturedBody) ? capturedBody[0] : capturedBody;

    // payment_method should be null/undefined (acceptable by DB)
    expect(payload.payment_method === null || payload.payment_method === undefined).toBe(true);
    expect(isValidUUIDv4(payload.id)).toBe(true);
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
