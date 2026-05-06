CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

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
);

CREATE TABLE IF NOT EXISTS ai_provider_status (
  provider text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('ok', 'cooldown', 'error')),
  last_error_code text,
  cooldown_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS answer_cache_question_hash_language_idx
  ON answer_cache (question_hash, language);
CREATE INDEX IF NOT EXISTS answer_cache_expires_at_idx
  ON answer_cache (expires_at);
CREATE INDEX IF NOT EXISTS ai_provider_usage_created_at_idx
  ON ai_provider_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS ai_provider_usage_provider_created_at_idx
  ON ai_provider_usage (provider, created_at DESC);
