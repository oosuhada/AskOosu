CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

CREATE INDEX IF NOT EXISTS ask_events_created_at_idx
  ON ask_events (created_at DESC);
CREATE INDEX IF NOT EXISTS ask_events_session_id_idx
  ON ask_events (session_id);
CREATE INDEX IF NOT EXISTS ask_events_answer_mode_idx
  ON ask_events (answer_mode);
CREATE INDEX IF NOT EXISTS ask_events_language_idx
  ON ask_events (language);
CREATE INDEX IF NOT EXISTS ask_events_user_feedback_idx
  ON ask_events (user_feedback);
CREATE INDEX IF NOT EXISTS ask_events_normalized_intent_idx
  ON ask_events (normalized_intent);
CREATE INDEX IF NOT EXISTS ask_events_source_doc_ids_gin_idx
  ON ask_events USING gin (source_doc_ids);
