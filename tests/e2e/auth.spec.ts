import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('shows login screen when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Bienvenido')).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('******')).toBeVisible();
    await expect(page.getByText('Continuar con Google')).toBeVisible();
  });

  test('shows validation error on empty submit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await expect(page.getByText('Por favor completa todos los campos')).toBeVisible();
  });

  test('toggles between login and signup', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Bienvenido')).toBeVisible();
    await page.getByText('Regístrate').click();
    await expect(page.getByText('Crear cuenta')).toBeVisible();
    await page.getByText('Inicia sesión').click();
    await expect(page.getByText('Bienvenido')).toBeVisible();
  });

  test('login form is visible and styled dark on web', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(5, 6, 15)');
  });
});