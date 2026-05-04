CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
);

CREATE INDEX IF NOT EXISTS rag_search_cache_expires_at_idx
  ON rag_search_cache (expires_at);

CREATE INDEX IF NOT EXISTS rag_search_cache_query_hash_language_idx
  ON rag_search_cache (query_hash, language);
