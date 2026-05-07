import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';

type PostgresRateLimitInput = {
  key: string;
  scope: string;
  windowMs: number;
  max: number;
};

type PostgresRateLimitRow = {
  count: number | string;
  window_start: Date;
  server_now: Date;
};

const DB_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let rateLimitSchemaPromise: Promise<void> | null = null;
let lastDbCleanupAt = 0;

export { hasPostgresDatabaseUrl };

export async function ensureRateLimitSchema() {
  rateLimitSchemaPromise ??= ensureRateLimitSchemaOnce().catch((error) => {
    rateLimitSchemaPromise = null;
    throw error;
  });

  return rateLimitSchemaPromise;
}

export async function checkPostgresRateLimit({
  key,
  scope,
  windowMs,
  max,
}: PostgresRateLimitInput) {
  await ensureRateLimitSchema();

  const pool = await getPostgresPool();
  const result = await pool.query<PostgresRateLimitRow>(
    `
      INSERT INTO rate_limit_buckets (
        key,
        scope,
        count,
        window_start,
        updated_at
      )
      VALUES ($1, $2, 1, now(), now())
      ON CONFLICT (key, scope)
      DO UPDATE SET
        count = CASE
          WHEN rate_limit_buckets.window_start <= now() - ($3::bigint * interval '1 millisecond')
            THEN 1
          ELSE rate_limit_buckets.count + 1
        END,
        window_start = CASE
          WHEN rate_limit_buckets.window_start <= now() - ($3::bigint * interval '1 millisecond')
            THEN now()
          ELSE rate_limit_buckets.window_start
        END,
        updated_at = now()
      RETURNING count, window_start, now() AS server_now
    `,
    [key, scope, String(windowMs)]
  );
  const row = result.rows[0];
  const count = normalizeCount(row?.count);
  const now = row?.server_now?.getTime() ?? Date.now();
  const resetAt = (row?.window_start?.getTime() ?? now) + windowMs;
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));

  maybeCleanupExpiredBuckets({ scope, windowMs }).catch((error) => {
    console.warn('Unable to cleanup rate limit buckets:', getSafeError(error));
  });

  return {
    allowed: count <= max,
    limit: max,
    remaining: Math.max(0, max - count),
    resetAt,
    retryAfter: count <= max ? 0 : retryAfter,
  };
}

async function ensureRateLimitSchemaOnce() {
  const pool = await getPostgresPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rate_limit_buckets (
      key text NOT NULL,
      scope text NOT NULL,
      count integer NOT NULL DEFAULT 1,
      window_start timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (key, scope)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS rate_limit_buckets_updated_at_idx
      ON rate_limit_buckets (updated_at)
  `);
}

async function maybeCleanupExpiredBuckets({
  scope,
  windowMs,
}: {
  scope: string;
  windowMs: number;
}) {
  const now = Date.now();
  if (now - lastDbCleanupAt < DB_CLEANUP_INTERVAL_MS) return;
  lastDbCleanupAt = now;

  const pool = await getPostgresPool();
  await pool.query(
    `
      DELETE FROM rate_limit_buckets
      WHERE scope = $1
        AND window_start <= now() - ($2::bigint * interval '1 millisecond')
    `,
    [scope, String(windowMs)]
  );
}

function normalizeCount(value: number | string | undefined) {
  const count = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 1;
}

function getSafeError(error: unknown) {
  return error instanceof Error
    ? { name: error.name, message: error.message }
    : { message: 'Unknown error' };
}
