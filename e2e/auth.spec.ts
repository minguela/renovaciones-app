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

    const hasLightCanvas = await page.locator('#root').evaluate((root) =>
      Array.from(root.querySelectorAll('*')).some(
        (element) => window.getComputedStyle(element).backgroundColor === 'rgb(246, 247, 249)',
      ),
    );
    expect(hasLightCanvas).toBe(true);
  });

  test('keeps the web login light when the browser prefers dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForTimeout(800);

    const hasLightCanvas = await page.locator('#root').evaluate((root) =>
      Array.from(root.querySelectorAll('*')).some(
        (element) => window.getComputedStyle(element).backgroundColor === 'rgb(246, 247, 249)',
      ),
    );
    expect(hasLightCanvas).toBe(true);
  });

  test('uses the registered Google OAuth callback path', async ({ page }) => {
    let googleUrl = '';
    await page.route('https://accounts.google.com/**', async (route) => {
      googleUrl = route.request().url();
      await route.abort();
    });

    await page.goto('/');
    await page.waitForTimeout(800);
    await page.getByText('Continuar con Google').click();

    expect(googleUrl).toContain('redirect_uri=https%3A%2F%2Frenovaciones.dminguela.es%2Fapi%2Fauth%2Fgoogle%2Fcallback');
  });

  test('shows validation error on empty submit', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);

    // Click login without filling fields
    await page.getByText('Iniciar sesión').click();
    await expect(page.getByText('Por favor completa todos los campos')).toBeVisible();
  });
});
