CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

CREATE INDEX IF NOT EXISTS answer_feedback_session_id_idx
  ON answer_feedback (session_id);
CREATE INDEX IF NOT EXISTS answer_feedback_message_id_idx
  ON answer_feedback (message_id);
CREATE INDEX IF NOT EXISTS answer_feedback_rating_idx
  ON answer_feedback (rating);
CREATE INDEX IF NOT EXISTS answer_feedback_created_at_idx
  ON answer_feedback (created_at DESC);
