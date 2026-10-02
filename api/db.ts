import { Pool } from '@neondatabase/serverless';
import type { PoolClient, QueryResult } from '@neondatabase/serverless';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    if (!url) throw new Error('DATABASE_URL not configured');
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await run(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Keep the original transaction error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export type DatabaseQueryResult = QueryResult<Record<string, unknown>>;
