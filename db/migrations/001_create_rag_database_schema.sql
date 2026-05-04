CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type <> ''),
  source_key text NOT NULL CHECK (source_key <> ''),
  title text NOT NULL DEFAULT '',
  url text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type, source_key)
);

CREATE TABLE IF NOT EXISTS rag_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES rag_sources(id) ON DELETE CASCADE,
  chunk_id text NOT NULL,
  entity_id text,
  title text NOT NULL,
  section_path text[] NOT NULL DEFAULT '{}'::text[],
  content text NOT NULL,
  content_hash text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'public',
  freshness text NOT NULL DEFAULT 'current',
  has_todo boolean NOT NULL DEFAULT false,
  confidence numeric(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence >= 0 AND confidence <= 1),
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, chunk_id)
);

CREATE TABLE IF NOT EXISTS rag_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES rag_sources(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  block_count integer NOT NULL DEFAULT 0 CHECK (block_count >= 0),
  chunk_count integer NOT NULL DEFAULT 0 CHECK (chunk_count >= 0),
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS rag_chunks_chunk_id_idx ON rag_chunks (chunk_id);
CREATE INDEX IF NOT EXISTS rag_chunks_entity_id_idx ON rag_chunks (entity_id);
CREATE INDEX IF NOT EXISTS rag_chunks_source_id_idx ON rag_chunks (source_id);
CREATE INDEX IF NOT EXISTS rag_chunks_has_todo_idx ON rag_chunks (has_todo);
CREATE INDEX IF NOT EXISTS rag_chunks_metadata_idx ON rag_chunks USING gin (metadata);
CREATE INDEX IF NOT EXISTS rag_chunks_search_idx
  ON rag_chunks USING gin (to_tsvector('simple', coalesce(title, '') || ' ' || content));
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
  ON rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS rag_sources_type_source_key_idx ON rag_sources (type, source_key);
CREATE INDEX IF NOT EXISTS rag_sync_runs_source_id_idx ON rag_sync_runs (source_id);
CREATE INDEX IF NOT EXISTS rag_sync_runs_status_idx ON rag_sync_runs (status);
CREATE INDEX IF NOT EXISTS rag_sync_runs_started_at_idx ON rag_sync_runs (started_at DESC);

CREATE OR REPLACE FUNCTION set_rag_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rag_sources_set_updated_at ON rag_sources;
CREATE TRIGGER rag_sources_set_updated_at
  BEFORE UPDATE ON rag_sources
  FOR EACH ROW
  EXECUTE FUNCTION set_rag_updated_at();

DROP TRIGGER IF EXISTS rag_chunks_set_updated_at ON rag_chunks;
CREATE TRIGGER rag_chunks_set_updated_at
  BEFORE UPDATE ON rag_chunks
  FOR EACH ROW
  EXECUTE FUNCTION set_rag_updated_at();
