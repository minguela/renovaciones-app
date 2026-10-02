import { test, expect } from '@playwright/test';
import { createCatalogsGetHandler } from '../../server/api/catalogs-get-handler';
import { createNeonCustomCatalogRepository } from '../../server/api/adapters/neon-custom-catalog-repository';
import { listCustomCatalogsUseCase } from '../../src/application/list-custom-catalogs';
import { createServerActorResolver } from '../../server/api/server-actor';

const databaseRows = {
  'user-a': [{
    id: 'catalog-a', user_id: 'user-a', name: 'A', icon: 'tag.fill', color: '#123456',
    options: '[{"name":"A option"}]', created_at: '2026-10-01T00:00:00.000Z', updated_at: '2026-10-01T00:00:00.000Z',
  }],
  'user-b': [{
    id: 'catalog-b', user_id: 'user-b', name: 'B', icon: 'tag.fill', color: '#654321',
    options: [{ name: 'B option' }], created_at: '2026-10-01T00:00:00.000Z', updated_at: '2026-10-01T00:00:00.000Z',
  }],
};

function createSystem() {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const repository = createNeonCustomCatalogRepository(async (sql, params) => {
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
  const handler = createCatalogsGetHandler({
    getActor,
    listCatalogs: (userId) => listCustomCatalogsUseCase(userId, repository),
  });
  return { handler, calls };
}

test('rejects a catalog list request without a verified actor before reading Neon', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'GET', headers: {}, query: { userId: 'user-b' }, body: { userId: 'user-b' } }, response);

  expect(response.statusCode).toBe(401);
  expect(response.body).toEqual({ error: 'Unauthorized' });
  expect(calls).toHaveLength(0);
});

test('lists only the verified actor catalogs and ignores spoofed userId values', async () => {
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
    id: 'catalog-a', userId: 'user-a', name: 'A', icon: 'tag.fill', color: '#123456',
    options: [{ name: 'A option' }], createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  }]);
  expect(calls).toHaveLength(1);
  expect(calls[0].sql).toContain('WHERE user_id = $1 ORDER BY created_at ASC');
  expect(calls[0].params).toEqual(['user-a']);
});

test('returns a different owner’s catalog only to that owner', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'GET', headers: { authorization: 'Bearer token-b' } }, response);

  expect(response.statusCode).toBe(200);
  expect((response.body as Array<{ id: string }>).map((catalog) => catalog.id)).toEqual(['catalog-b']);
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
