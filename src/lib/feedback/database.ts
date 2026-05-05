import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';

const MAX_SESSION_ID_LENGTH = 128;
const MAX_MESSAGE_ID_LENGTH = 128;
const MAX_TEXT_LENGTH = 4000;
const MAX_QUESTION_LENGTH = 1000;
const MAX_REASON_LENGTH = 1000;
const MAX_IDS = 50;
const MAX_ID_LENGTH = 160;

export type AnswerFeedbackRating = 'up' | 'down';

export type AnswerFeedbackInput = {
  sessionId?: string;
  messageId: string;
  question?: string;
  answer?: string;
  rating: AnswerFeedbackRating;
  reason?: string | null;
  matchedEntityIds?: string[];
  sourceChunkIds?: string[];
  confidence?: number | null;
};

export type StoredAnswerFeedback = {
  id: string;
  createdAt: string;
};

export { hasPostgresDatabaseUrl };

export async function ensureAnswerFeedbackSchema() {
  const pool = await getPostgresPool();

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS answer_feedback (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id text NOT NULL DEFAULT '' CHECK (char_length(session_id) <= 128),
      message_id text NOT NULL CHECK (message_id <> '' AND char_length(message_id) <= 128),
      question text NOT NULL DEFAULT '',
      answer text NOT NULL DEFAULT '',
      rating text NOT NULL CHECK (rating IN ('up', 'down')),
      reason text,
      matched_entity_ids text[] NOT NULL DEFAULT '{}'::text[],
      source_chunk_ids text[] NOT NULL DEFAULT '{}'::text[],
      confidence numeric(4, 3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_feedback_session_id_idx
      ON answer_feedback (session_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_feedback_message_id_idx
      ON answer_feedback (message_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_feedback_rating_idx
      ON answer_feedback (rating)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS answer_feedback_created_at_idx
      ON answer_feedback (created_at DESC)
  `);
}

export async function createAnswerFeedback(
  input: AnswerFeedbackInput
): Promise<StoredAnswerFeedback> {
  await ensureAnswerFeedbackSchema();

  const feedback = normalizeAnswerFeedback(input);
  const pool = await getPostgresPool();
  const result = await pool.query<{ id: string; created_at: Date | string }>(
    `
      INSERT INTO answer_feedback (
        session_id,
        message_id,
        question,
        answer,
        rating,
        reason,
        matched_entity_ids,
        source_chunk_ids,
        confidence
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8::text[], $9)
      RETURNING id, created_at
    `,
    [
      feedback.sessionId,
      feedback.messageId,
      feedback.question,
      feedback.answer,
      feedback.rating,
      feedback.reason,
      feedback.matchedEntityIds,
      feedback.sourceChunkIds,
      feedback.confidence,
    ]
  );
  const row = result.rows[0];

  if (!row) {
    throw new Error('Failed to store answer feedback.');
  }

  return {
    id: row.id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  };
}

function normalizeAnswerFeedback(input: AnswerFeedbackInput) {
  const messageId = truncateText(input.messageId, MAX_MESSAGE_ID_LENGTH);

  if (!messageId) {
    throw new Error('messageId is required.');
  }

  return {
    sessionId: truncateText(input.sessionId ?? '', MAX_SESSION_ID_LENGTH),
    messageId,
    question: truncateText(input.question ?? '', MAX_QUESTION_LENGTH),
    answer: truncateText(input.answer ?? '', MAX_TEXT_LENGTH),
    rating: input.rating,
    reason: normalizeOptionalText(input.reason, MAX_REASON_LENGTH),
    matchedEntityIds: normalizeIds(input.matchedEntityIds),
    sourceChunkIds: normalizeIds(input.sourceChunkIds),
    confidence: normalizeConfidence(input.confidence),
  };
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

function normalizeOptionalText(value: string | null | undefined, max: number) {
  const text = truncateText(value ?? '', max);
  return text || null;
}

function truncateText(value: string, max: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

function normalizeConfidence(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;

  const normalizedValue = value > 1 ? value / 100 : value;
  return Math.max(0, Math.min(1, normalizedValue));
}
