import { test, expect } from '@playwright/test';
import { createCatalogMutationsHandler } from '../../server/api/catalog-mutations-handler';
import { createNeonCustomCatalogRepository } from '../../server/api/adapters/neon-custom-catalog-repository';
import { createCustomCatalogUseCase } from '../../src/application/create-custom-catalog';
import { updateCustomCatalogUseCase } from '../../src/application/update-custom-catalog';
import { deleteCustomCatalogUseCase } from '../../src/application/delete-custom-catalog';
import { createServerActorResolver } from '../../server/api/server-actor';

function createSystem() {
  const calls: { sql: string; params?: unknown[] }[] = [];
  const repository = createNeonCustomCatalogRepository(async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith('INSERT INTO user_catalogs')) {
      return { rows: [catalogRow('catalog-new', String(params?.[0]), String(params?.[1]), String(params?.[4] ?? '[]'))] };
    }
    if (sql.startsWith('UPDATE user_catalogs')) {
      const [id, userId, name, icon, color, options] = params || [];
      if (id === 'catalog-a' && userId === 'user-a') return { rows: [catalogRow(String(id), String(userId), String(name), options, icon as string | null, color as string | null)] };
      return { rows: [] };
    }
    if (sql.startsWith('DELETE FROM user_catalogs')) {
      const [id, userId] = params || [];
      return { rows: [], rowCount: id === 'catalog-a' && userId === 'user-a' ? 1 : 0 };
    }
    throw new Error(`Unexpected query: ${sql}`);
  });
  const handler = createCatalogMutationsHandler({
    getActor: createServerActorResolver({
      verifyClerkToken: async (token) => token.startsWith('clerk-') ? { sub: `subject-${token}` } : null,
      findLegacyUserIdByClerkId: async (subject) => subject === 'subject-clerk-a' ? 'user-a' : subject === 'subject-clerk-b' ? 'user-b' : null,
      verifyLegacyToken: async (token) => ['user-a', 'user-b'].includes(token) ? { sub: token } : null,
    }),
    createCatalog: (userId, input) => createCustomCatalogUseCase(userId, input, repository),
    updateCatalog: (userId, id, input) => updateCustomCatalogUseCase(userId, id, input, repository),
    deleteCatalog: (userId, id) => deleteCustomCatalogUseCase(userId, id, repository),
  });
  return { handler, calls };
}

test('rejects catalog writes without a legacy actor before accessing the repository', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'POST', headers: {}, body: { userId: 'user-b', name: 'Spoof' } }, response);

  expect(response.statusCode).toBe(401);
  expect(response.body).toEqual({ error: 'Unauthorized' });
  expect(calls).toHaveLength(0);
});

test('creates a catalog for the authenticated owner with legacy defaults and response DTO', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'POST', headers: { authorization: 'Bearer user-a' }, body: { userId: 'user-b', name: 'A' } }, response);

  expect(response.statusCode).toBe(201);
  expect(response.body).toEqual({
    id: 'catalog-new', userId: 'user-a', name: 'A', icon: 'tag.fill', color: '#007AFF',
    options: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
  });
  expect(calls[0].sql).toContain('INSERT INTO user_catalogs');
  expect(calls[0].params).toEqual(['user-a', 'A', 'tag.fill', '#007AFF', '[]']);
});

test('creates a catalog under the linked owner from a Clerk token and ignores spoofed IDs', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'POST', headers: { authorization: 'Bearer clerk-a' },
    body: { userId: 'user-b', name: 'Linked' }, query: { userId: 'user-b' },
  }, response);

  expect(response.statusCode).toBe(201);
  expect((response.body as any).userId).toBe('user-a');
  expect(calls[0].params?.[0]).toBe('user-a');
});

test('updates only an owner catalog and retains the existing mutation route contract', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({
    method: 'PUT', headers: { authorization: 'Bearer user-a' },
    body: { id: 'catalog-a', userId: 'user-b', name: 'Updated', icon: 'star', color: '#123456', options: [{ name: 'x' }] },
  }, response);

  expect(response.statusCode).toBe(200);
  expect((response.body as any).name).toBe('Updated');
  expect(calls[0].sql).toContain('WHERE id = $1 AND user_id = $2');
  expect(calls[0].params).toEqual(['catalog-a', 'user-a', 'Updated', 'star', '#123456', '[{"name":"x"}]']);
});

test('does not reveal or update another owner catalog', async () => {
  const { handler, calls } = createSystem();
  const response = createResponse();

  await handler({ method: 'PUT', headers: { authorization: 'Bearer user-a' }, body: { id: 'catalog-b', userId: 'user-b' } }, response);

  expect(response.statusCode).toBe(404);
  expect(response.body).toEqual({ error: 'Not found' });
  expect(calls[0].params?.slice(0, 2)).toEqual(['catalog-b', 'user-a']);
});

test('preserves nullable icon and color values in the legacy mutation DTO', async () => {
  const { handler } = createSystem();
  const response = createResponse();

  await handler({
    method: 'PUT', headers: { authorization: 'Bearer user-a' },
    body: { id: 'catalog-a', name: 'A', icon: null, color: null, options: [] },
  }, response);

  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({ icon: null, color: null });
});

test('deletes only the authenticated owner catalog and preserves success and 404 responses', async () => {
  const { handler, calls } = createSystem();
  const success = createResponse();

  await handler({ method: 'DELETE', headers: { authorization: 'Bearer user-a' }, body: { id: 'catalog-a', userId: 'user-b' } }, success);

  expect(success.statusCode).toBe(200);
  expect(success.body).toEqual({ success: true });
  expect(calls[0].params).toEqual(['catalog-a', 'user-a']);

  const missing = createResponse();
  await handler({ method: 'DELETE', headers: { authorization: 'Bearer user-a' }, query: { id: 'catalog-b' } }, missing);
  expect(missing.statusCode).toBe(404);
  expect(missing.body).toEqual({ error: 'Not found' });
});

function catalogRow(id: string, userId: string, name: string, options: unknown, icon: string | null = 'tag.fill', color: string | null = '#007AFF') {
  return {
    id, user_id: userId, name, icon, color,
    options: typeof options === 'string' ? options : JSON.stringify(options ?? []),
    created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-02T00:00:00.000Z',
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
