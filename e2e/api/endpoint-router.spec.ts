import { test, expect } from '@playwright/test';
import { createGetAndWriteRouter } from '../../server/api/endpoint-router';

test('keeps GET on its existing handler and sends mutation methods to the write handler', async () => {
  const calls: string[] = [];
  const router = createGetAndWriteRouter(
    (_req, res) => { calls.push('get'); return res.json({ source: 'get' }); },
    (_req, res) => { calls.push('write'); return res.json({ source: 'write' }); },
  );
  const getResponse = createResponse();
  const postResponse = createResponse();

  await router({ method: 'GET' }, getResponse);
  await router({ method: 'POST' }, postResponse);

  expect(calls).toEqual(['get', 'write']);
  expect(getResponse.body).toEqual({ source: 'get' });
  expect(postResponse.body).toEqual({ source: 'write' });
});

function createResponse() {
  return {
    body: undefined as unknown,
    json(body: unknown) { this.body = body; return this; },
  };
}
