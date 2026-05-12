import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('/renewal/new loads without 404', async ({ page }) => {
    const response = await page.goto('/renewal/new');
    console.log('status:', response?.status());
    console.log('url:', page.url());
    const html = await page.content();
    console.log('html snippet:', html.substring(0, 500));
    expect(response?.status()).toBe(200);
    expect(html).not.toContain('+not-found');
    expect(html).not.toContain('404');
  });

  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
