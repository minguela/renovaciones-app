import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
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
