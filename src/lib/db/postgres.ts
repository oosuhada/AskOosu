import type { Pool, PoolClient } from 'pg';
import { getDatabaseUrl } from '@/lib/rag/config';

declare global {
  // eslint-disable-next-line no-var
  var askOosuPgPool: Pool | undefined;
}

export function hasPostgresDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

export async function getPostgresPool() {
  if (globalThis.askOosuPgPool) return globalThis.askOosuPgPool;

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required.');
  }

  const { Pool: PgPool } = await import('pg');
  globalThis.askOosuPgPool = new PgPool({
    connectionString: databaseUrl,
  });

  return globalThis.askOosuPgPool;
}

export async function withPostgresTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
) {
  const pool = await getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
