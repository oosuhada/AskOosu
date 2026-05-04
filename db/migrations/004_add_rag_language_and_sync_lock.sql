CREATE TABLE IF NOT EXISTS rag_sync_locks (
  id text PRIMARY KEY,
  locked_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rag_sources
  ADD COLUMN IF NOT EXISTS language text CHECK (language IS NULL OR language IN ('ko', 'en'));

ALTER TABLE rag_chunks
  ADD COLUMN IF NOT EXISTS language text CHECK (language IS NULL OR language IN ('ko', 'en'));

CREATE INDEX IF NOT EXISTS rag_sources_language_idx
  ON rag_sources (language);

CREATE INDEX IF NOT EXISTS rag_chunks_language_idx
  ON rag_chunks (language);

CREATE INDEX IF NOT EXISTS rag_sync_locks_locked_until_idx
  ON rag_sync_locks (locked_until);
