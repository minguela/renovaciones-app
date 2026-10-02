import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/api',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
});
