import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { ChatAnswerSource } from './types';
import { hashQuestion, truncateText } from './text';

const DEFAULT_ANSWER_CACHE_TTL_HOURS = 24;
const MAX_ANSWER_CACHE_TEXT_LENGTH = 8000;
const MAX_MODEL_LENGTH = 120;
const MAX_PROVIDER_LENGTH = 80;
const MAX_ERROR_CODE_LENGTH = 120;

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
};

export type AiProviderUsageInput = {
  provider: string;
  model?: string;
  route: string;
  answerSource?: ChatAnswerSource;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  latencyMs?: number | null;
  success: boolean;
  errorCode?: string | null;
};

export { hasPostgresDatabaseUrl };

export async function ensureChatRuntimeSchema() {
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
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (question_hash, language, wiki_version)
    )
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
      created_at timestamptz NOT NULL DEFAULT now()
    )
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
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [hashQuestion(normalizedQuestion), language, getWikiVersion()]
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
  if (!hasPostgresDatabaseUrl()) return;

  await ensureChatRuntimeSchema();
  const pool = await getPostgresPool();
  const ttlHours = getAnswerCacheTtlHours();
  const expiresAtSql =
    ttlHours > 0 ? `now() + ($12::text || ' hours')::interval` : 'NULL';

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
        updated_at = now()
    `,
    [
      input.normalizedQuestion,
      hashQuestion(input.normalizedQuestion),
      input.language,
      truncateText(input.answer, MAX_ANSWER_CACHE_TEXT_LENGTH),
      input.answerSource,
      input.matchedEntityIds,
      input.sourceChunkIds,
      normalizeConfidence(input.confidence),
      input.provider ? truncateText(input.provider, MAX_PROVIDER_LENGTH) : null,
      input.model ? truncateText(input.model, MAX_MODEL_LENGTH) : null,
      getWikiVersion(),
      String(ttlHours),
    ]
  );
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
        error_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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

function getWikiVersion() {
  return process.env.ASKOOSU_WIKI_VERSION || 'v10';
}

function getAnswerCacheTtlHours() {
  const value = process.env.ASKOOSU_ANSWER_CACHE_TTL_HOURS;
  if (!value) return DEFAULT_ANSWER_CACHE_TTL_HOURS;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : DEFAULT_ANSWER_CACHE_TTL_HOURS;
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
