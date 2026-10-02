import { test, expect } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAuthRouter } from '../../api/auth-router';

function response() {
  const result: { statusCode?: number; body?: unknown } = {};
  return {
    result,
    status(code: number) { result.statusCode = code; return this; },
    json(body: unknown) { result.body = body; return this; },
  };
}

test('dispatches every public auth path to its existing handler', async () => {
  const received: string[] = [];
  const handler = (name: string) => async () => { received.push(name); };
  const route = createAuthRouter({
    google: handler('google'),
    login: handler('login'),
    me: handler('me'),
    register: handler('register'),
    linkLegacy: handler('linkLegacy'),
    provision: handler('provision'),
  });

  for (const name of ['google', 'login', 'me', 'register', 'linkLegacy', 'provision']) {
    await route({ query: { route: name } }, response());
  }

  expect(received).toEqual(['google', 'login', 'me', 'register', 'linkLegacy', 'provision']);
});

test('rejects an unknown auth route without invoking another handler', async () => {
  let invoked = false;
  const route = createAuthRouter({
    google: async () => { invoked = true; },
    login: async () => { invoked = true; },
    me: async () => { invoked = true; },
    register: async () => { invoked = true; },
    linkLegacy: async () => { invoked = true; },
    provision: async () => { invoked = true; },
  });
  const res = response();

  await route({ query: { route: 'unknown' } }, res);

  expect(invoked).toBe(false);
  expect(res.result).toEqual({ statusCode: 404, body: { error: 'Not found' } });
});

test('rewrites every public auth URL through the shared handler and preserves the Google callback path', () => {
  const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
  const rewrites = new Map(config.rewrites
    .filter((rewrite: { source: string }) => rewrite.source.startsWith('/api/auth/'))
    .map((rewrite: { source: string; destination: string }) => [rewrite.source, rewrite.destination]));

  expect(rewrites).toEqual(new Map([
    ['/api/auth/google/callback', '/api/auth-router?route=google'],
    ['/api/auth/google', '/api/auth-router?route=google'],
    ['/api/auth/login', '/api/auth-router?route=login'],
    ['/api/auth/me', '/api/auth-router?route=me'],
    ['/api/auth/register', '/api/auth-router?route=register'],
    ['/api/auth/clerk/link-legacy', '/api/auth-router?route=linkLegacy'],
    ['/api/auth/clerk/provision', '/api/auth-router?route=provision'],
  ]));
});

test('keeps auth handler implementations outside Vercel’s api function directory', () => {
  const oldAuthDirectory = resolve(process.cwd(), 'api/auth');
  const serverAuthDirectory = resolve(process.cwd(), 'server/auth-handlers');
  const apiDirectory = resolve(process.cwd(), 'api');
  const listRuntimeFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return listRuntimeFiles(path);
      return /\.(?:ts|js)$/u.test(entry.name) ? [path.slice(apiDirectory.length + 1)] : [];
    })
    .sort();

  expect(existsSync(oldAuthDirectory)).toBe(false);
  expect(readdirSync(serverAuthDirectory, { withFileTypes: true })
    .filter(entry => entry.isFile()).map(entry => entry.name).sort())
    .toEqual(['google.ts', 'login.ts', 'me.ts', 'register.ts']);
  expect(readdirSync(resolve(serverAuthDirectory, 'clerk')).sort())
    .toEqual(['link-legacy.ts', 'provision.ts']);
  expect(listRuntimeFiles(apiDirectory)).toEqual([
    'auth-router.ts',
    'catalogs.ts',
    'check-renewals.ts',
    'history.ts',
    'profiles.ts',
    'renewals.ts',
    'send-notification.ts',
  ]);
});
