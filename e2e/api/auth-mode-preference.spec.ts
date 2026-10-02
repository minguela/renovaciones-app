import { expect, test } from '@playwright/test';
import { createAuthModePreference, type AuthMode, type AuthModeStorage } from '../../src/application/auth-token-source';

function createMemoryStorage(initial: string | null = null): AuthModeStorage & { value: string | null } {
  return {
    value: initial,
    async getMode() { return this.value; },
    async setMode(mode) { this.value = mode; },
  };
}

test('restores the selected legacy mode after app reload without persisting a token', async () => {
  const storage = createMemoryStorage();
  const firstLaunch = createAuthModePreference('clerk', storage);
  await firstLaunch.setMode('legacy');

  const reloadedApp = createAuthModePreference('clerk', storage);

  await expect(reloadedApp.getMode()).resolves.toBe('legacy');
  expect(storage.value).toBe('legacy');
});

test('a successful legacy authentication persists legacy mode for the next launch', async () => {
  const storage = createMemoryStorage();
  const preference = createAuthModePreference('clerk', storage);

  await preference.setMode('legacy');

  const nextLaunch = createAuthModePreference('clerk', storage);
  const selectedMode: AuthMode = await nextLaunch.getMode();
  expect(selectedMode).toBe('legacy');
});

test('a current mode selection wins over a slower persisted preference read', async () => {
  let resolveStored!: (value: string | null) => void;
  const storage: AuthModeStorage = {
    getMode: () => new Promise((resolve) => { resolveStored = resolve; }),
    async setMode() {},
  };
  const preference = createAuthModePreference('clerk', storage);

  const loading = preference.getMode();
  const choosingLegacy = preference.setMode('legacy');
  resolveStored('clerk');
  await Promise.all([loading, choosingLegacy]);

  await expect(preference.getMode()).resolves.toBe('legacy');
});
