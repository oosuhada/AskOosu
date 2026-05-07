ALTER TABLE answer_cache
  ADD COLUMN IF NOT EXISTS matched_entity_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS source_chunk_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS invalidated_at timestamptz,
  ADD COLUMN IF NOT EXISTS invalidation_reason text;

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
  OR updated_at IS NULL;

ALTER TABLE answer_cache
  ALTER COLUMN matched_entity_ids SET DEFAULT '{}'::text[],
  ALTER COLUMN matched_entity_ids SET NOT NULL,
  ALTER COLUMN source_chunk_ids SET DEFAULT '{}'::text[],
  ALTER COLUMN source_chunk_ids SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS answer_cache_matched_entity_ids_gin_idx
  ON answer_cache USING gin (matched_entity_ids);
CREATE INDEX IF NOT EXISTS answer_cache_source_chunk_ids_gin_idx
  ON answer_cache USING gin (source_chunk_ids);
CREATE INDEX IF NOT EXISTS answer_cache_created_at_idx
  ON answer_cache (created_at DESC);
CREATE INDEX IF NOT EXISTS answer_cache_updated_at_idx
  ON answer_cache (updated_at DESC);
CREATE INDEX IF NOT EXISTS answer_cache_invalidated_at_idx
  ON answer_cache (invalidated_at);

ALTER TABLE rag_sync_runs
  ADD COLUMN IF NOT EXISTS deleted_count integer NOT NULL DEFAULT 0 CHECK (deleted_count >= 0);
