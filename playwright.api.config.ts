import { defineConfig } from '@playwright/test';

// API unit tests import the legacy JWT helpers; use a deterministic test-only key.
process.env.JWT_SECRET ??= 'playwright-api-tests-only-secret';

export default defineConfig({
  testDir: './e2e/api',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
});
