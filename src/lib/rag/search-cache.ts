import { hashString } from './text';
import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import type { RagChunkSearchPayload, RagChunkSearchQuery } from './search';

const DEFAULT_RAG_SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

export async function getCachedRagSearch(
  query: RagChunkSearchQuery
): Promise<RagChunkSearchPayload | null> {
  if (!shouldUseRagSearchCache(query)) return null;
  if (!hasPostgresDatabaseUrl()) return null;

  await ensureRagSearchCacheSchema();
  const pool = await getPostgresPool();
  const result = await pool.query<{ result_payload: RagChunkSearchPayload }>(
    `
      SELECT result_payload
      FROM rag_search_cache
      WHERE cache_key = $1
        AND expires_at > now()
      LIMIT 1
    `,
    [createRagSearchCacheKey(query)]
  );

  return result.rows[0]?.result_payload ?? null;
}

export async function upsertCachedRagSearch({
  query,
  payload,
}: {
  query: RagChunkSearchQuery;
  payload: RagChunkSearchPayload;
}) {
  if (!shouldUseRagSearchCache(query)) return;
  if (!hasPostgresDatabaseUrl()) return;

  const ttlMs = getRagSearchCacheTtlMs();
  if (ttlMs <= 0) return;

  await ensureRagSearchCacheSchema();
  const pool = await getPostgresPool();
  const topChunkIds = payload.results.map((result) => result.chunk_id);
  const scores = payload.results.map((result) => ({
    chunk_id: result.chunk_id,
    score: result.score,
  }));

  await pool.query(
    `
      INSERT INTO rag_search_cache (
        cache_key,
        query_hash,
        normalized_query,
        language,
        entity_id,
        include_private,
        include_content,
        limit_value,
        top_chunk_ids,
        scores,
        result_payload,
        expires_at,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9::text[],
        $10::jsonb,
        $11::jsonb,
        now() + ($12::text || ' milliseconds')::interval,
        now()
      )
      ON CONFLICT (cache_key)
      DO UPDATE SET
        query_hash = EXCLUDED.query_hash,
        normalized_query = EXCLUDED.normalized_query,
        language = EXCLUDED.language,
        entity_id = EXCLUDED.entity_id,
        include_private = EXCLUDED.include_private,
        include_content = EXCLUDED.include_content,
        limit_value = EXCLUDED.limit_value,
        top_chunk_ids = EXCLUDED.top_chunk_ids,
        scores = EXCLUDED.scores,
        result_payload = EXCLUDED.result_payload,
        expires_at = EXCLUDED.expires_at,
        created_at = now()
    `,
    [
      createRagSearchCacheKey(query),
      hashString(query.q || query.entityId || ''),
      query.q,
      query.language ?? null,
      query.entityId ?? null,
      query.includePrivate,
      query.includeContent,
      query.limit,
      topChunkIds,
      JSON.stringify(scores),
      JSON.stringify(payload),
      String(ttlMs),
    ]
  );
}

export async function ensureRagSearchCacheSchema() {
  const pool = await getPostgresPool();

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_search_cache (
      cache_key text PRIMARY KEY,
      query_hash text NOT NULL,
      normalized_query text NOT NULL DEFAULT '',
      language text CHECK (language IS NULL OR language IN ('ko', 'en')),
      entity_id text,
      include_private boolean NOT NULL DEFAULT false,
      include_content boolean NOT NULL DEFAULT false,
      limit_value integer NOT NULL DEFAULT 5 CHECK (limit_value > 0),
      top_chunk_ids text[] NOT NULL DEFAULT '{}'::text[],
      scores jsonb NOT NULL DEFAULT '[]'::jsonb,
      result_payload jsonb NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS rag_search_cache_expires_at_idx
      ON rag_search_cache (expires_at)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS rag_search_cache_query_hash_language_idx
      ON rag_search_cache (query_hash, language)
  `);
}

function shouldUseRagSearchCache(query: RagChunkSearchQuery) {
  if (query.debug) return false;
  return getRagSearchCacheTtlMs() > 0;
}

function createRagSearchCacheKey(query: RagChunkSearchQuery) {
  return hashString(
    JSON.stringify({
      q: query.q,
      limit: query.limit,
      entityId: query.entityId ?? null,
      language: query.language ?? null,
      includePrivate: query.includePrivate,
      includeContent: query.includeContent,
    })
  );
}

function getRagSearchCacheTtlMs() {
  const value = process.env.ASKOOSU_RAG_SEARCH_CACHE_TTL_MS;
  if (!value) return DEFAULT_RAG_SEARCH_CACHE_TTL_MS;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : DEFAULT_RAG_SEARCH_CACHE_TTL_MS;
}
