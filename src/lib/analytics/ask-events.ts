import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { AnswerRouteDecision, ChatAnswerMetadata } from '@/lib/chat/types';
import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import { redactSensitiveText } from '@/lib/privacy/redact';
import {
  normalizeCountry,
  normalizeOptionalText,
  normalizePath,
  normalizeReferrer,
  parseRequestAnalyticsContext,
  truncateText,
} from './request-context';

export type AskEventAnswerMode =
  | 'direct_cache'
  | 'rag'
  | 'fallback'
  | 'smalltalk'
  | 'safety'
  | 'unknown';

export type AskEventFeedback = 'helpful' | 'not_helpful' | 'unclear' | 'incorrect' | 'empty';

export type AskEventContext = {
  sessionId?: string | null;
  pagePath?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type AskEventInput = AskEventContext & {
  language?: ChatLanguage | null;
  question: string;
  answerPreview?: string | null;
  normalizedIntent?: string | null;
  answerMode: AskEventAnswerMode;
  confidence?: number | null;
  sourceDocIds?: string[];
  modelProvider?: string | null;
  latencyMs?: number | null;
  country?: string | null;
  ipHash?: string | null;
  cfRay?: string | null;
  geoCity?: string | null;
  geoRegion?: string | null;
  geoRegionCode?: string | null;
  geoPostalCode?: string | null;
  geoTimezone?: string | null;
  geoLatitude?: number | null;
  geoLongitude?: number | null;
  userAgentHash?: string | null;
  acceptLanguage?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
};

const MAX_SESSION_ID_LENGTH = 128;
const MAX_TEXT_LENGTH = 2000;
const MAX_ANSWER_PREVIEW_LENGTH = 120;
const MAX_SHORT_TEXT_LENGTH = 500;
const MAX_ID_LENGTH = 160;
const MAX_IDS = 50;

let askEventsSchemaReady: Promise<void> | null = null;

export { hasPostgresDatabaseUrl };

export async function createAskEvent(input: AskEventInput) {
  if (!hasPostgresDatabaseUrl()) return null;

  await ensureAskEventsSchema();

  const event = normalizeAskEvent(input);
  const pool = await getPostgresPool();
  const result = await pool.query<{ id: string }>(
    `
      INSERT INTO ask_events (
        session_id,
        language,
        question,
        question_redacted,
        answer_preview,
        normalized_intent,
        answer_mode,
        confidence,
        source_doc_ids,
        model_provider,
        latency_ms,
        page_path,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        ip_hash,
        cf_ray,
        country,
        geo_city,
        geo_region,
        geo_region_code,
        geo_postal_code,
        geo_timezone,
        geo_latitude,
        geo_longitude,
        user_agent_hash,
        accept_language,
        device_type,
        browser,
        os
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      )
      RETURNING id
    `,
    [
      event.sessionId,
      event.language,
      event.question,
      event.questionRedacted,
      event.answerPreview,
      event.normalizedIntent,
      event.answerMode,
      event.confidence,
      event.sourceDocIds,
      event.modelProvider,
      event.latencyMs,
      event.pagePath,
      event.referrer,
      event.utmSource,
      event.utmMedium,
      event.utmCampaign,
      event.ipHash,
      event.cfRay,
      event.country,
      event.geoCity,
      event.geoRegion,
      event.geoRegionCode,
      event.geoPostalCode,
      event.geoTimezone,
      event.geoLatitude,
      event.geoLongitude,
      event.userAgentHash,
      event.acceptLanguage,
      event.deviceType,
      event.browser,
      event.os,
    ]
  );

  return result.rows[0]?.id ?? null;
}

export async function updateLatestAskEventFeedback({
  sessionId,
  question,
  feedback,
}: {
  sessionId?: string | null;
  question?: string | null;
  feedback: AskEventFeedback;
}) {
  if (!hasPostgresDatabaseUrl() || !sessionId || !question) return;

  await ensureAskEventsSchema();

  const sanitizedQuestion = redactSensitiveText(question, MAX_TEXT_LENGTH);
  if (!sanitizedQuestion) return;

  const pool = await getPostgresPool();
  await pool.query(
    `
      UPDATE ask_events
      SET user_feedback = $1
      WHERE id = (
        SELECT id
        FROM ask_events
        WHERE session_id = $2
          AND question_redacted = $3
          AND created_at >= now() - interval '1 day'
        ORDER BY created_at DESC
        LIMIT 1
      )
    `,
    [feedback, truncateText(sessionId, MAX_SESSION_ID_LENGTH), sanitizedQuestion]
  );
}

export function getAnswerModeFromMetadata(metadata: ChatAnswerMetadata): AskEventAnswerMode {
  const routeMode = metadata.routeDecision.mode;

  if (routeMode === 'smalltalk') return 'smalltalk';
  if (
    routeMode === 'private_guardrail' ||
    routeMode === 'prompt_guardrail' ||
    metadata.answerSource === 'private_guardrail' ||
    metadata.answerSource === 'prompt_guardrail'
  ) {
    return 'safety';
  }
  if (routeMode === 'safe_fallback' || metadata.answerSource === 'fallback') {
    return 'fallback';
  }
  if (
    routeMode === 'faq_direct' ||
    routeMode === 'answer_cache' ||
    metadata.cacheMode === 'direct_cache' ||
    metadata.answerSource === 'faq_cache' ||
    metadata.answerSource === 'answer_cache'
  ) {
    return 'direct_cache';
  }
  if (
    routeMode === 'rag_generate' ||
    routeMode === 'faq_rewrite' ||
    metadata.answerSource.startsWith('rag_') ||
    metadata.answerSource === 'faq_rewrite'
  ) {
    return 'rag';
  }

  return 'unknown';
}

export function getNormalizedIntentFromMetadata(metadata: ChatAnswerMetadata) {
  return (
    metadata.intentId ??
    metadata.matchedFaqId ??
    metadata.conversationIntent ??
    getRouteDecisionName(metadata.routeDecision) ??
    null
  );
}

export function parseRequestEventContext(req: Request, context?: AskEventContext) {
  const requestContext = parseRequestAnalyticsContext(req);

  return {
    ...requestContext,
    pagePath: normalizePath(context?.pagePath),
    referrer: normalizeReferrer(context?.referrer),
    utmSource: normalizeOptionalText(context?.utmSource, MAX_SHORT_TEXT_LENGTH),
    utmMedium: normalizeOptionalText(context?.utmMedium, MAX_SHORT_TEXT_LENGTH),
    utmCampaign: normalizeOptionalText(context?.utmCampaign, MAX_SHORT_TEXT_LENGTH),
  };
}

function ensureAskEventsSchema() {
  if (!askEventsSchemaReady) {
    askEventsSchemaReady = createAskEventsSchema();
  }

  return askEventsSchemaReady;
}

async function createAskEventsSchema() {
  const pool = await getPostgresPool();

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ask_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz NOT NULL DEFAULT now(),
      session_id text NOT NULL DEFAULT '' CHECK (char_length(session_id) <= 128),
      language text CHECK (language IS NULL OR language IN ('ko', 'en')),
      question text NOT NULL DEFAULT '',
      question_redacted text NOT NULL DEFAULT '',
      answer_preview text,
      normalized_intent text,
      answer_mode text NOT NULL DEFAULT 'unknown'
        CHECK (answer_mode IN ('direct_cache', 'rag', 'fallback', 'smalltalk', 'safety', 'unknown')),
      confidence numeric(4, 3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
      source_doc_ids text[] NOT NULL DEFAULT '{}'::text[],
      model_provider text,
      latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
      user_feedback text CHECK (
        user_feedback IS NULL
        OR user_feedback IN ('helpful', 'not_helpful', 'unclear', 'incorrect', 'empty')
      ),
      page_path text,
      referrer text,
      utm_source text,
      utm_medium text,
      utm_campaign text,
      ip_hash text,
      cf_ray text,
      country text,
      geo_city text,
      geo_region text,
      geo_region_code text,
      geo_postal_code text,
      geo_timezone text,
      geo_latitude numeric(9, 6),
      geo_longitude numeric(9, 6),
      user_agent_hash text,
      accept_language text,
      device_type text,
      browser text,
      os text
    )
  `);
  await pool.query(
    'ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS answer_preview text'
  );
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS ip_hash text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS cf_ray text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_city text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_region text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_region_code text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_postal_code text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_timezone text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_latitude numeric(9, 6)');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS geo_longitude numeric(9, 6)');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS user_agent_hash text');
  await pool.query('ALTER TABLE ask_events ADD COLUMN IF NOT EXISTS accept_language text');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_created_at_idx ON ask_events (created_at DESC)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_session_id_idx ON ask_events (session_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_ip_hash_idx ON ask_events (ip_hash)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_answer_mode_idx ON ask_events (answer_mode)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_language_idx ON ask_events (language)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_user_feedback_idx ON ask_events (user_feedback)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_normalized_intent_idx ON ask_events (normalized_intent)');
  await pool.query('CREATE INDEX IF NOT EXISTS ask_events_source_doc_ids_gin_idx ON ask_events USING gin (source_doc_ids)');
}

function normalizeAskEvent(input: AskEventInput) {
  const redactedQuestion = redactSensitiveText(input.question, MAX_TEXT_LENGTH);
  const answerPreview = createAnswerPreview(input.answerPreview);

  return {
    sessionId: truncateText(input.sessionId ?? '', MAX_SESSION_ID_LENGTH),
    language: input.language ?? null,
    question: redactedQuestion,
    questionRedacted: redactedQuestion,
    answerPreview,
    normalizedIntent: normalizeOptionalText(input.normalizedIntent, MAX_ID_LENGTH),
    answerMode: input.answerMode,
    confidence: normalizeConfidence(input.confidence),
    sourceDocIds: normalizeIds(input.sourceDocIds),
    modelProvider: normalizeOptionalText(input.modelProvider, MAX_ID_LENGTH),
    latencyMs: normalizeLatency(input.latencyMs),
    pagePath: normalizePath(input.pagePath),
    referrer: normalizeReferrer(input.referrer),
    utmSource: normalizeOptionalText(input.utmSource, MAX_SHORT_TEXT_LENGTH),
    utmMedium: normalizeOptionalText(input.utmMedium, MAX_SHORT_TEXT_LENGTH),
    utmCampaign: normalizeOptionalText(input.utmCampaign, MAX_SHORT_TEXT_LENGTH),
    ipHash: normalizeOptionalText(input.ipHash, 128),
    cfRay: normalizeOptionalText(input.cfRay, 128),
    country: normalizeCountry(input.country),
    geoCity: normalizeOptionalText(input.geoCity, 120),
    geoRegion: normalizeOptionalText(input.geoRegion, 120),
    geoRegionCode: normalizeOptionalText(input.geoRegionCode, 40),
    geoPostalCode: normalizeOptionalText(input.geoPostalCode, 40),
    geoTimezone: normalizeOptionalText(input.geoTimezone, 80),
    geoLatitude: normalizeCoordinate(input.geoLatitude, -90, 90),
    geoLongitude: normalizeCoordinate(input.geoLongitude, -180, 180),
    userAgentHash: normalizeOptionalText(input.userAgentHash, 128),
    acceptLanguage: normalizeOptionalText(input.acceptLanguage, 200),
    deviceType: normalizeOptionalText(input.deviceType, 80),
    browser: normalizeOptionalText(input.browser, 80),
    os: normalizeOptionalText(input.os, 80),
  };
}

function createAnswerPreview(value: string | null | undefined) {
  const redactedAnswer = redactSensitiveText(value ?? '', MAX_TEXT_LENGTH);
  const singleLineAnswer = redactedAnswer.replace(/\s+/g, ' ').trim();
  if (!singleLineAnswer) return null;
  return truncateText(singleLineAnswer, MAX_ANSWER_PREVIEW_LENGTH);
}

function getRouteDecisionName(routeDecision: AnswerRouteDecision) {
  if ('mode' in routeDecision) return routeDecision.mode;
  return null;
}

function normalizeIds(value: string[] | undefined) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => truncateText(item, MAX_ID_LENGTH))
        .filter((item) => item.length > 0)
    )
  ).slice(0, MAX_IDS);
}

function normalizeConfidence(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(1, value));
}

function normalizeLatency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeCoordinate(value: number | null | undefined, min: number, max: number) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(min, Math.min(max, value));
}
