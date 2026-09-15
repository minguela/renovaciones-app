import test from 'node:test';
import assert from 'node:assert/strict';
import { sendTelegramMessage } from '../lib/notifications/telegram.ts';

test('Telegram message uses JSON POST so names and tokens are not put in query parameters', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.match(url, /\/sendMessage$/);
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { chat_id: '123', text: 'Renovación: R&D + música' });
    return { ok: true, json: async () => ({ ok: true }) };
  };
  try {
    assert.deepEqual(await sendTelegramMessage({ botToken: 'token', chatId: '123', message: 'Renovación: R&D + música' }), { success: true });
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('Telegram API rejection is reported as a failed delivery', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 403, json: async () => ({ ok: false, description: 'Forbidden: bot was blocked by the user' }) });
  try {
    const result = await sendTelegramMessage({ botToken: 'token', chatId: '123', message: 'test' });
    assert.equal(result.success, false);
    assert.match(result.error, /blocked/);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
