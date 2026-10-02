import { test, expect } from '@playwright/test';
import { createRenewalsGetHandler } from '../../server/api/renewals-get-handler';
import { createNeonRenewalRepository } from '../../server/api/adapters/neon-renewal-repository';
import { listRenewalsUseCase } from '../../src/application/list-renewals';
import { createServerActorResolver } from '../../server/api/server-actor';

const databaseRows = {
  'user-a': [{
    id: 'renewal-a', user_id: 'user-a', name: 'A', type: 'subscription', frequency: 'monthly',
    cost: '12.50', currency: 'EUR', renewal_date: '2026-11-01', provider: 'Provider A',
    notes: null, color: '#123456', icon: 'creditcard', notification_enabled: true,
    notification_days_before: 7, status: 'active', payment_method: 'card', bank_account: null,
    tags: '[{"name":"home"}]', auto_renew: true, contract_end_date: null,
    attachments: '[{"name":"invoice.pdf"}]', created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  }],
  'user-b': [{
    id: 'renewal-b', user_id: 'user-b', name: 'B', type: 'other', frequency: 'yearly',
    cost: 30, currency: 'EUR', renewal_date: '2026-12-01', provider: null, notes: null,
    color: null, icon: null, notification_enabled: false, notification_days_before: 14,
    status: 'active', payment_method: null, bank_account: null, tags: [], auto_renew: false,
    contract_end_date: null, attachments: [], created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  }],
};

function createSystem() {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const repository = createNeonRenewalRepository(async (sql, params) => {
    calls.push({ sql, params });
    const ownerId = String(params?.[0] || '');
    return { rows: databaseRows[ownerId as keyof typeof databaseRows] || [], rowCount: 0 };
  });
  const getActor = createServerActorResolver({
    verifyLegacyToken: async (token) => {
      if (token === 'token-a') return { sub: 'user-a' };
      if (token === 'token-b') return { sub: 'user-b' };
      return null;
    },
  });
  const handler = createRenewalsGetHandler({
    getActor,
    listRenewals: (userId) => listRenewalsUseCase(userId, repository),
  });
  return { handler, calls };
}

test('rejects renewal list requests without a verified actor before reading Neon', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'GET', headers: {}, query: { userId: 'user-b' }, body: { userId: 'user-b' } }, response);

  expect(response.statusCode).toBe(401);
  expect(response.body).toEqual({ error: 'Unauthorized' });
  expect(calls).toHaveLength(0);
});

test('lists only the verified actor renewals and ignores spoofed userId values', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'GET',
    headers: { authorization: 'Bearer token-a' },
    query: { userId: 'user-b' },
    body: { userId: 'user-b' },
  }, response);

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([{
    id: 'renewal-a', userId: 'user-a', name: 'A', type: 'subscription', frequency: 'monthly',
    cost: 12.5, currency: 'EUR', renewalDate: '2026-11-01', provider: 'Provider A',
    notes: null, color: '#123456', icon: 'creditcard', notificationEnabled: true,
    notificationDaysBefore: 7, status: 'active', paymentMethod: 'card', bankAccount: null,
    tags: [{ name: 'home' }], autoRenew: true, contractEndDate: null,
    attachments: [{ name: 'invoice.pdf' }], createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  }]);
  expect(calls).toHaveLength(1);
  expect(calls[0].sql).toContain('WHERE user_id = $1 ORDER BY renewal_date ASC');
  expect(calls[0].params).toEqual(['user-a']);
});

test('returns another owner’s renewals only to that owner', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'GET', headers: { authorization: 'Bearer token-b' } }, response);

  expect(response.statusCode).toBe(200);
  expect((response.body as Array<{ id: string }>).map((renewal) => renewal.id)).toEqual(['renewal-b']);
  expect(calls[0].params).toEqual(['user-b']);
});

function createResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };
}
