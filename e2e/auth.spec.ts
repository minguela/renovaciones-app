import { test, expect } from '@playwright/test';

test.describe('Auth / Login Screen', () => {
  test('renders login with light theme and readable inputs', async ({ page }) => {
    await page.goto('/');

    // Wait for hydration
    await page.waitForTimeout(800);

    // Main elements visible
    await expect(page.getByText('Bienvenido')).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('******')).toBeVisible();
    await expect(page.getByText('Continuar con Google')).toBeVisible();

    // Verify inputs are dark (not white-on-white)
    const emailInput = page.getByPlaceholder('tu@email.com');
    const emailColor = await emailInput.evaluate((el) => window.getComputedStyle(el).color);
    expect(emailColor).not.toBe('rgb(255, 255, 255)');
  });

  test('shows validation error on empty submit', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);

    // Click login without filling fields
    await page.getByText('Iniciar sesión').click();
    await expect(page.getByText('Por favor completa todos los campos')).toBeVisible();
  });
});
