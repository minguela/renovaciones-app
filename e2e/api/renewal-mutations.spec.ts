import { test, expect } from '@playwright/test';
import { createRenewalMutationsHandler } from '../../api/renewal-mutations-handler';
import { createNeonRenewalRepository } from '../../api/adapters/neon-renewal-repository';
import { createRenewalUseCase } from '../../src/application/create-renewal';
import { updateRenewalUseCase } from '../../src/application/update-renewal';
import { deleteRenewalUseCase } from '../../src/application/delete-renewal';
import { createServerActorResolver } from '../../api/server-actor';

const rowsByOwner = {
  'user-a': [renewalRow('renewal-a', 'user-a')],
  'user-b': [renewalRow('renewal-b', 'user-b')],
};

function createSystem() {
  const calls: { sql: string; params?: unknown[] }[] = [];
  const repository = createNeonRenewalRepository(async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith('INSERT INTO renewals')) {
      const ownerId = String(params?.[1]);
      return { rows: [renewalRow(String(params?.[0]), ownerId, String(params?.[2] ?? 'Renewal'))] };
    }
    if (sql.startsWith('UPDATE renewals')) {
      const [id, ownerId] = params || [];
      const row = rowsByOwner[String(ownerId) as keyof typeof rowsByOwner]?.find((item) => item.id === id);
      return { rows: row ? [{ ...row, name: params?.[2] }] : [] };
    }
    if (sql.startsWith('DELETE FROM renewals')) {
      const [id, ownerId] = params || [];
      const exists = rowsByOwner[String(ownerId) as keyof typeof rowsByOwner]?.some((item) => item.id === id);
      return { rows: [], rowCount: exists ? 1 : 0 };
    }
    throw new Error(`Unexpected query: ${sql}`);
  });
  const handler = createRenewalMutationsHandler({
    getActor: createServerActorResolver({
      verifyClerkToken: async (token) => token.startsWith('clerk-') ? { sub: `subject-${token}` } : null,
      findLegacyUserIdByClerkId: async (subject) => subject === 'subject-clerk-a' ? 'user-a' : subject === 'subject-clerk-b' ? 'user-b' : null,
      verifyLegacyToken: async (token) => ['user-a', 'user-b'].includes(token) ? { sub: token } : null,
    }),
    createRenewal: (userId, input) => createRenewalUseCase(userId, input, repository),
    updateRenewal: (userId, input) => updateRenewalUseCase(userId, input, repository),
    deleteRenewal: (userId, id) => deleteRenewalUseCase(userId, id, repository),
  });
  return { handler, calls };
}

test('rejects renewal writes without a legacy actor before accessing the repository', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'POST', headers: {}, body: { userId: 'user-b', id: 'spoofed' } }, response);

  expect(response.statusCode).toBe(401);
  expect(response.body).toEqual({ error: 'Unauthorized' });
  expect(calls).toHaveLength(0);
});

test('creates a renewal for the authenticated owner, ignores body userId, and preserves legacy defaults and DTO', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'POST', headers: { authorization: 'Bearer user-a' },
    body: { id: 'renewal-new', userId: 'user-b', name: 'New' },
  }, response);

  expect(response.statusCode).toBe(201);
  expect((response.body as any).userId).toBe('user-a');
  expect((response.body as any).cost).toBe(12.5);
  expect((response.body as any).currency).toBe('EUR');
  expect(calls[0].sql).toContain('INSERT INTO renewals');
  expect(calls[0].params).toEqual([
    'renewal-new', 'user-a', 'New', 'other', 'monthly', 0, 'EUR', undefined,
    null, null, null, null, true, 7, 'active', null, null, '[]', false, null, '[]',
  ]);
});

test('creates a renewal under the linked owner from a Clerk token and ignores spoofed IDs', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'POST', headers: { authorization: 'Bearer clerk-a' },
    body: { id: 'renewal-new', userId: 'user-b', name: 'New' }, query: { userId: 'user-b' },
  }, response);

  expect(response.statusCode).toBe(201);
  expect((response.body as any).userId).toBe('user-a');
  expect(calls[0].params?.[1]).toBe('user-a');
});

test('updates only the authenticated owner renewal and keeps the legacy response contract', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'PUT', headers: { authorization: 'Bearer user-a' },
    body: { id: 'renewal-a', userId: 'user-b', name: 'Updated' },
  }, response);

  expect(response.statusCode).toBe(200);
  expect((response.body as any).name).toBe('Updated');
  expect(calls[0].sql).toContain('WHERE id = $1 AND user_id = $2');
  expect(calls[0].params?.slice(0, 3)).toEqual(['renewal-a', 'user-a', 'Updated']);
});

test('does not reveal or update a renewal owned by another user', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'PUT', headers: { authorization: 'Bearer user-a' },
    body: { id: 'renewal-b', userId: 'user-b', name: 'Hijack' },
  }, response);

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({ error: 'Not found' });
  expect(calls[0].params?.slice(0, 2)).toEqual(['renewal-b', 'user-a']);
});

test('deletes only the authenticated owner renewal and returns the legacy success DTO', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'DELETE', headers: { authorization: 'Bearer user-a' }, body: { id: 'renewal-a', userId: 'user-b' } }, response);

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ success: true });
  expect(calls[0].sql).toContain('DELETE FROM renewals WHERE id = $1 AND user_id = $2');
  expect(calls[0].params).toEqual(['renewal-a', 'user-a']);
});

test('preserves the existing 404 for deleting another owner renewal', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'DELETE', headers: { authorization: 'Bearer user-a' }, query: { id: 'renewal-b' } }, response);

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({ error: 'Not found' });
  expect(calls[0].params).toEqual(['renewal-b', 'user-a']);
});

function renewalRow(id: string, userId: string, name = 'Renewal') {
  return {
    id, user_id: userId, name, type: 'other', frequency: 'monthly', cost: '12.50',
    currency: 'EUR', renewal_date: '2026-11-01', provider: null, notes: null, color: null,
    icon: null, notification_enabled: true, notification_days_before: 7, status: 'active',
    payment_method: null, bank_account: null, tags: '[]', auto_renew: false,
    contract_end_date: null, attachments: '[]', created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
}
