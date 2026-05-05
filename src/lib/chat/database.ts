import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { AnswerRouteDecision, ChatAnswerSource } from './types';
import { hashQuestion, truncateText } from './text';

const DEFAULT_ANSWER_CACHE_TTL_HOURS = 24;
const MIN_CACHEABLE_CONFIDENCE = 0.7;
const MAX_ANSWER_CACHE_TEXT_LENGTH = 8000;
const MAX_MODEL_LENGTH = 120;
const MAX_PROVIDER_LENGTH = 80;
const MAX_ERROR_CODE_LENGTH = 120;
const MAX_INVALIDATION_REASON_LENGTH = 160;
const PROMPT_LEAK_DETECTED_ERROR_CODE = 'prompt_leak_detected';

const UNSAFE_CACHE_ANSWER_SOURCES: ChatAnswerSource[] = [
  'fallback',
  'insufficient_evidence',
];

let chatRuntimeSchemaPromise: Promise<void> | null = null;

export type AnswerCacheRecord = {
  answer: string;
  answerSource: ChatAnswerSource;
  matchedEntityIds: string[];
  sourceChunkIds: string[];
  confidence: number;
  provider: string | null;
  model: string | null;
};

export type AnswerCacheInput = {
  normalizedQuestion: string;
  language: ChatLanguage;
  answer: string;
  answerSource: ChatAnswerSource;
  matchedEntityIds: string[];
  sourceChunkIds: string[];
  confidence: number;
  provider?: string;
  model?: string;
  hasTodoEvidence?: boolean;
  warnings?: string[];
  routeDecision?: AnswerRouteDecision;
  errorCode?: string | null;
};

export type AiProviderUsageInput = {
  provider: string;
  model?: string;
  route: string;
  answerSource?: ChatAnswerSource;
  metadata?: Record<string, unknown>;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  latencyMs?: number | null;
  success: boolean;
  errorCode?: string | null;
};

export type AiProviderDailyUsage = {
  callCount: number;
  successCount: number;
  failureCount: number;
};

export type AiProviderStatusRecord = {
  provider: string;
  status: 'ok' | 'cooldown' | 'error';
  lastErrorCode: string | null;
  cooldownUntil: Date | null;
};

export { hasPostgresDatabaseUrl };

export async function ensureChatRuntimeSchema() {
  chatRuntimeSchemaPromise ??= ensureChatRuntimeSchemaOnce().catch((error) => {
    chatRuntimeSchemaPromise = null;
    throw error;
  });

  return chatRuntimeSchemaPromise;
}

async function ensureChatRuntimeSchemaOnce() {
  const pool = await getPostgresPool();

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS answer_cache (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      normalized_question text NOT NULL CHECK (normalized_question <> ''),
      question_hash text NOT NULL CHECK (question_hash <> ''),
      language text NOT NULL CHECK (language IN ('ko', 'en')),
      answer text NOT NULL CHECK (answer <> ''),
      answer_source text NOT NULL,
      matched_entity_ids text[] NOT NULL DEFAULT '{}'::text[],
      source_chunk_ids text[] NOT NULL DEFAULT '{}'::text[],
      confidence numeric(4, 3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
      provider text,
      model text,
      wiki_version text NOT NULL DEFAULT '',
      expires_at timestamptz,
      invalidated_at timestamptz,
      invalidation_reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (question_hash, language, wiki_version)
    )
  `);
  await pool.query(`
    ALTER TABLE answer_cache
      ADD COLUMN IF NOT EXISTS matched_entity_ids text[] NOT NULL DEFAULT '{}'::text[],
      ADD COLUMN IF NOT EXISTS source_chunk_ids text[] NOT NULL DEFAULT '{}'::text[],
      ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS invalidated_at timestamptz,
      ADD COLUMN IF NOT EXISTS invalidation_reason text
  `);
  await pool.query(`
    UPDATE answer_cache
    SET
      matched_entity_ids = COALESCE(matched_entity_ids, '{}'::text[]),
      source_chunk_ids = COALESCE(source_chunk_ids, '{}'::text[]),
      created_at = COALESCE(created_at, now()),
      updated_at = COALESCE(updated_at, now())
    WHERE
      matched_entity_ids IS NULL
      OR source_chunk_ids IS NULL
      OR created_at IS NULL
      OR updated_at IS NULL
  `);
  await pool.query(`
    ALTER TABLE answer_cache
      ALTER COLUMN matched_entity_ids SET DEFAULT '{}'::text[],
      ALTER COLUMN matched_entity_ids SET NOT NULL,
      ALTER COLUMN source_chunk_ids SET DEFAULT '{}'::text[],
      ALTER COLUMN source_chunk_ids SET NOT NULL,
      ALTER COLUMN created_at SET DEFAULT now(),
      ALTER COLUMN created_at SET NOT NULL,
      ALTER COLUMN updated_at SET DEFAULT now(),
      ALTER COLUMN updated_at SET NOT NULL
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_provider_usage (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      provider text NOT NULL,
      model text,
      route text NOT NULL DEFAULT 'api/chat',
      answer_source text,
      input_tokens integer CHECK (input_tokens IS NULL OR input_tokens >= 0),
      output_tokens integer CHECK (output_tokens IS NULL OR output_tokens >= 0),
      total_tokens integer CHECK (total_tokens IS NULL OR total_tokens >= 0),
      latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
      success boolean NOT NULL,
      error_code text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    ALTER TABLE ai_provider_usage
      ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_provider_status (
      provider text PRIMARY KEY,
      status text NOT NULL CHECK (status IN ('ok', 'cooldown', 'error')),
      last_error_code text,
      cooldown_until timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_question_hash_language_idx
      ON answer_cache (question_hash, language)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_expires_at_idx
      ON answer_cache (expires_at)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_matched_entity_ids_gin_idx
      ON answer_cache USING gin (matched_entity_ids)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_source_chunk_ids_gin_idx
      ON answer_cache USING gin (source_chunk_ids)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_created_at_idx
      ON answer_cache (created_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_updated_at_idx
      ON answer_cache (updated_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_cache_invalidated_at_idx
      ON answer_cache (invalidated_at)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS ai_provider_usage_created_at_idx
      ON ai_provider_usage (created_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS ai_provider_usage_provider_created_at_idx
      ON ai_provider_usage (provider, created_at DESC)
  `);
}

export async function getCachedAnswer({
  normalizedQuestion,
  language,
}: {
  normalizedQuestion: string;
  language: ChatLanguage;
}): Promise<AnswerCacheRecord | null> {
  if (!hasPostgresDatabaseUrl()) return null;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const ttlHours = getAnswerCacheTtlHours();
  const result = await pool.query<{
    answer: string;
    answer_source: ChatAnswerSource;
    matched_entity_ids: string[] | null;
    source_chunk_ids: string[] | null;
    confidence: number | string | null;
    provider: string | null;
    model: string | null;
  }>(
    `
      SELECT
        answer,
        answer_source,
        matched_entity_ids,
        source_chunk_ids,
        confidence,
        provider,
        model
      FROM answer_cache
      WHERE question_hash = $1
        AND language = $2
        AND wiki_version = $3
        AND invalidated_at IS NULL
        AND confidence >= $4
        AND answer_source <> ALL($5::text[])
        AND created_at > now() - ($6::text || ' hours')::interval
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [
      hashQuestion(normalizedQuestion),
      language,
      getWikiVersion(),
      MIN_CACHEABLE_CONFIDENCE,
      UNSAFE_CACHE_ANSWER_SOURCES,
      String(ttlHours),
    ]
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    answer: row.answer,
    answerSource: row.answer_source,
    matchedEntityIds: row.matched_entity_ids ?? [],
    sourceChunkIds: row.source_chunk_ids ?? [],
    confidence: normalizeConfidence(row.confidence),
    provider: row.provider,
    model: row.model,
  };
}

export async function upsertCachedAnswer(input: AnswerCacheInput) {
  if (!shouldCacheAnswer(input)) return false;
  if (!hasPostgresDatabaseUrl()) return false;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const ttlHours = getAnswerCacheTtlHours();
  const expiresAtSql = `now() + ($12::text || ' hours')::interval`;

  await pool.query(
    `
      INSERT INTO answer_cache (
        normalized_question,
        question_hash,
        language,
        answer,
        answer_source,
        matched_entity_ids,
        source_chunk_ids,
        confidence,
        provider,
        model,
        wiki_version,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::text[], $7::text[], $8, $9, $10, $11, ${expiresAtSql})
      ON CONFLICT (question_hash, language, wiki_version)
      DO UPDATE SET
        normalized_question = EXCLUDED.normalized_question,
        answer = EXCLUDED.answer,
        answer_source = EXCLUDED.answer_source,
        matched_entity_ids = EXCLUDED.matched_entity_ids,
        source_chunk_ids = EXCLUDED.source_chunk_ids,
        confidence = EXCLUDED.confidence,
        provider = EXCLUDED.provider,
        model = EXCLUDED.model,
        expires_at = EXCLUDED.expires_at,
        invalidated_at = NULL,
        invalidation_reason = NULL,
        created_at = now(),
        updated_at = now()
    `,
    [
      input.normalizedQuestion,
      hashQuestion(input.normalizedQuestion),
      input.language,
      truncateText(input.answer, MAX_ANSWER_CACHE_TEXT_LENGTH),
      input.answerSource,
      normalizeCacheTextArray(input.matchedEntityIds),
      normalizeCacheTextArray(input.sourceChunkIds),
      normalizeConfidence(input.confidence),
      input.provider ? truncateText(input.provider, MAX_PROVIDER_LENGTH) : null,
      input.model ? truncateText(input.model, MAX_MODEL_LENGTH) : null,
      getWikiVersion(),
      String(ttlHours),
    ]
  );

  return true;
}

export async function invalidateCachedAnswersForEntities(
  entityIds: string[],
  reason: string
) {
  const normalizedEntityIds = normalizeCacheTextArray(entityIds);
  if (normalizedEntityIds.length === 0 || !hasPostgresDatabaseUrl()) return 0;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const result = await pool.query(
    `
      UPDATE answer_cache
      SET
        invalidated_at = now(),
        invalidation_reason = $2,
        updated_at = now()
      WHERE invalidated_at IS NULL
        AND matched_entity_ids && $1::text[]
    `,
    [
      normalizedEntityIds,
      truncateText(reason, MAX_INVALIDATION_REASON_LENGTH),
    ]
  );

  return result.rowCount ?? 0;
}

export async function invalidateCachedAnswersForSourceChunks(
  sourceChunkIds: string[],
  reason: string
) {
  const normalizedSourceChunkIds = normalizeCacheTextArray(sourceChunkIds);
  if (normalizedSourceChunkIds.length === 0 || !hasPostgresDatabaseUrl()) {
    return 0;
  }

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const result = await pool.query(
    `
      UPDATE answer_cache
      SET
        invalidated_at = now(),
        invalidation_reason = $2,
        updated_at = now()
      WHERE invalidated_at IS NULL
        AND source_chunk_ids && $1::text[]
    `,
    [
      normalizedSourceChunkIds,
      truncateText(reason, MAX_INVALIDATION_REASON_LENGTH),
    ]
  );

  return result.rowCount ?? 0;
}

export async function recordAiProviderUsage(input: AiProviderUsageInput) {
  if (!hasPostgresDatabaseUrl()) return;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();

  await pool.query(
    `
      INSERT INTO ai_provider_usage (
        provider,
        model,
        route,
        answer_source,
        input_tokens,
        output_tokens,
        total_tokens,
        latency_ms,
        success,
        error_code,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
    `,
    [
      truncateText(input.provider, MAX_PROVIDER_LENGTH),
      input.model ? truncateText(input.model, MAX_MODEL_LENGTH) : null,
      truncateText(input.route, 120),
      input.answerSource ?? null,
      normalizeInteger(input.inputTokens),
      normalizeInteger(input.outputTokens),
      normalizeInteger(input.totalTokens),
      normalizeInteger(input.latencyMs),
      input.success,
      input.errorCode
        ? truncateText(input.errorCode, MAX_ERROR_CODE_LENGTH)
        : null,
      JSON.stringify(input.metadata ?? {}),
    ]
  );
}

export async function recordAiProviderStatus({
  provider,
  status,
  errorCode,
  cooldownUntil,
}: {
  provider: string;
  status: 'ok' | 'cooldown' | 'error';
  errorCode?: string | null;
  cooldownUntil?: Date | null;
}) {
  if (!hasPostgresDatabaseUrl()) return;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();

  await pool.query(
    `
      INSERT INTO ai_provider_status (
        provider,
        status,
        last_error_code,
        cooldown_until,
        updated_at
      )
      VALUES ($1, $2, $3, $4, now())
      ON CONFLICT (provider)
      DO UPDATE SET
        status = EXCLUDED.status,
        last_error_code = EXCLUDED.last_error_code,
        cooldown_until = EXCLUDED.cooldown_until,
        updated_at = now()
    `,
    [
      truncateText(provider, MAX_PROVIDER_LENGTH),
      status,
      errorCode ? truncateText(errorCode, MAX_ERROR_CODE_LENGTH) : null,
      cooldownUntil ?? null,
    ]
  );
}

export async function getAiProviderDailyUsage(
  provider: string
): Promise<AiProviderDailyUsage> {
  if (!hasPostgresDatabaseUrl()) {
    return {
      callCount: 0,
      successCount: 0,
      failureCount: 0,
    };
  }

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const result = await pool.query<{
    call_count: string;
    success_count: string;
    failure_count: string;
  }>(
    `
      SELECT
        COUNT(*)::text AS call_count,
        COUNT(*) FILTER (WHERE success)::text AS success_count,
        COUNT(*) FILTER (WHERE NOT success)::text AS failure_count
      FROM ai_provider_usage
      WHERE provider = $1
        AND created_at >= date_trunc('day', now())
    `,
    [truncateText(provider, MAX_PROVIDER_LENGTH)]
  );
  const row = result.rows[0];

  return {
    callCount: parseCount(row?.call_count),
    successCount: parseCount(row?.success_count),
    failureCount: parseCount(row?.failure_count),
  };
}

export async function getAiProviderStatus(
  provider: string
): Promise<AiProviderStatusRecord | null> {
  if (!hasPostgresDatabaseUrl()) return null;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const result = await pool.query<{
    provider: string;
    status: 'ok' | 'cooldown' | 'error';
    last_error_code: string | null;
    cooldown_until: Date | null;
  }>(
    `
      SELECT
        provider,
        status,
        last_error_code,
        cooldown_until
      FROM ai_provider_status
      WHERE provider = $1
      LIMIT 1
    `,
    [truncateText(provider, MAX_PROVIDER_LENGTH)]
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    provider: row.provider,
    status: row.status,
    lastErrorCode: row.last_error_code,
    cooldownUntil: row.cooldown_until,
  };
}

function getWikiVersion() {
  return process.env.ASKOOSU_WIKI_VERSION || 'v10';
}

function getAnswerCacheTtlHours() {
  const value = process.env.ASKOOSU_ANSWER_CACHE_TTL_HOURS;
  if (!value) return DEFAULT_ANSWER_CACHE_TTL_HOURS;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : DEFAULT_ANSWER_CACHE_TTL_HOURS;
}

export function shouldCacheAnswer(input: AnswerCacheInput) {
  if (normalizeConfidence(input.confidence) < MIN_CACHEABLE_CONFIDENCE) {
    return false;
  }

  if (input.hasTodoEvidence) return false;
  if ((input.warnings?.length ?? 0) > 0) return false;
  if (UNSAFE_CACHE_ANSWER_SOURCES.includes(input.answerSource)) return false;
  if (input.routeDecision?.mode === 'safe_fallback') return false;
  if (input.errorCode === PROMPT_LEAK_DETECTED_ERROR_CODE) return false;

  return true;
}

function normalizeCacheTextArray(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function normalizeConfidence(value: unknown) {
  const parsedValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsedValue)) return 0.25;
  return Math.max(0, Math.min(1, parsedValue));
}

function normalizeInteger(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.floor(value));
}

function parseCount(value: string | undefined) {
  const parsedValue = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}
