import { test, expect } from '@playwright/test';
import { injectMockSession } from './helpers/auth';

test('debug form structure', async ({ page }) => {
  await injectMockSession(page);
  await page.goto('/renewal/new');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/screenshots/form.png', fullPage: true });
  const html = await page.content();
  console.log('HTML length:', html.length);
  // Find all buttons containing "Seguro"
  const seguroElements = await page.locator('text=Seguro').all();
  console.log('Seguro elements count:', seguroElements.length);
  for (let i = 0; i < seguroElements.length; i++) {
    const el = seguroElements[i];
    const tag = await el.evaluate(e => e.tagName);
    const text = await el.textContent();
    const visible = await el.isVisible();
    console.log(`[${i}] tag=${tag} text=${text} visible=${visible}`);
  }
});
