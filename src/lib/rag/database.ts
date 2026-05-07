import type { PoolClient } from 'pg';
import { getEmbeddingDimensions } from './config';
import {
  getPostgresPool,
  hasPostgresDatabaseUrl,
  withPostgresTransaction,
} from '@/lib/db/postgres';
import {
  detectEntityId,
  hasTodoMarker,
  notionResultToDatabaseChunks,
  type NotionDatabaseChunk,
} from './notion-chunks';
import type { NotionRagSyncResult } from './notion';
import type {
  RagChunk,
  RagChunkMetadata,
  RagChunkMetadataValue,
  RagSearchResult,
  RagStatus,
} from './types';

type RagSourceInput = {
  type: RagChunk['source'];
  sourceKey: string;
  title: string;
  url?: string | null;
  language?: 'ko' | 'en' | null;
};

type RagDatabaseChunkInput = NotionDatabaseChunk & {
  embedding?: number[];
};

export type StoredRagChunkEmbeddingSearchRow = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[] | null;
  content: string;
  metadata: RagChunkMetadata | null;
  has_todo: boolean;
  visibility: string;
  freshness: string;
  confidence: number | string;
  updated_at: Date;
  embedding_score: number | string;
  score: number | string;
};

type RagChunkGroup = RagSourceInput & {
  chunks: RagChunk[];
};

type RagSyncRunStatus = 'running' | 'success' | 'failed';

export type PersistedNotionRagSync = {
  sourceId: string;
  syncRunId: string;
  chunkCount: number;
  inserted: number;
  updated: number;
  deleted: number;
  skipped: number;
  changedEntityIds: string[];
  changedSourceChunkIds: string[];
};

type RagChunkMutationStats = {
  inserted: number;
  updated: number;
  deleted: number;
  skipped: number;
  changedEntityIds: Set<string>;
  changedSourceChunkIds: Set<string>;
};

type RagChunkMutationResult = {
  status: 'inserted' | 'updated' | 'skipped';
  entityIds: string[];
  sourceChunkIds: string[];
};

export class RagSyncPersistenceError extends Error {
  sourceId: string;
  syncRunId: string;
  blockCount: number;
  chunkCount: number;

  constructor({
    message,
    sourceId,
    syncRunId,
    blockCount,
    chunkCount,
  }: {
    message: string;
    sourceId: string;
    syncRunId: string;
    blockCount: number;
    chunkCount: number;
  }) {
    super(message);
    this.name = 'RagSyncPersistenceError';
    this.sourceId = sourceId;
    this.syncRunId = syncRunId;
    this.blockCount = blockCount;
    this.chunkCount = chunkCount;
  }
}

export { hasPostgresDatabaseUrl };

export async function ensureRagDatabaseSchema() {
  const pool = await getPostgresPool();
  const dimensions = getEmbeddingDimensions();

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_sources (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      type text NOT NULL CHECK (type <> ''),
      source_key text NOT NULL CHECK (source_key <> ''),
      title text NOT NULL DEFAULT '',
      url text,
      language text CHECK (language IS NULL OR language IN ('ko', 'en')),
      last_synced_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (type, source_key)
    )
  `);
  await pool.query(`
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
      language text CHECK (language IS NULL OR language IN ('ko', 'en')),
      visibility text NOT NULL DEFAULT 'public',
      freshness text NOT NULL DEFAULT 'current',
      has_todo boolean NOT NULL DEFAULT false,
      confidence numeric(4, 3) NOT NULL DEFAULT 1.000 CHECK (confidence >= 0 AND confidence <= 1),
      embedding vector(${dimensions}),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (source_id, chunk_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_sync_runs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source_id uuid REFERENCES rag_sources(id) ON DELETE SET NULL,
      status text NOT NULL CHECK (status IN ('running', 'success', 'failed')),
      block_count integer NOT NULL DEFAULT 0 CHECK (block_count >= 0),
      chunk_count integer NOT NULL DEFAULT 0 CHECK (chunk_count >= 0),
      inserted_count integer NOT NULL DEFAULT 0 CHECK (inserted_count >= 0),
      updated_count integer NOT NULL DEFAULT 0 CHECK (updated_count >= 0),
      deleted_count integer NOT NULL DEFAULT 0 CHECK (deleted_count >= 0),
      skipped_count integer NOT NULL DEFAULT 0 CHECK (skipped_count >= 0),
      warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
      error_message text,
      started_at timestamptz NOT NULL DEFAULT now(),
      finished_at timestamptz
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_sync_locks (
      id text PRIMARY KEY,
      locked_until timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    "ALTER TABLE rag_sources ADD COLUMN IF NOT EXISTS language text CHECK (language IS NULL OR language IN ('ko', 'en'))"
  );
  await pool.query(
    "ALTER TABLE rag_chunks ADD COLUMN IF NOT EXISTS language text CHECK (language IS NULL OR language IN ('ko', 'en'))"
  );
  await pool.query(
    'ALTER TABLE rag_sync_runs ADD COLUMN IF NOT EXISTS inserted_count integer NOT NULL DEFAULT 0 CHECK (inserted_count >= 0)'
  );
  await pool.query(
    'ALTER TABLE rag_sync_runs ADD COLUMN IF NOT EXISTS updated_count integer NOT NULL DEFAULT 0 CHECK (updated_count >= 0)'
  );
  await pool.query(
    'ALTER TABLE rag_sync_runs ADD COLUMN IF NOT EXISTS deleted_count integer NOT NULL DEFAULT 0 CHECK (deleted_count >= 0)'
  );
  await pool.query(
    'ALTER TABLE rag_sync_runs ADD COLUMN IF NOT EXISTS skipped_count integer NOT NULL DEFAULT 0 CHECK (skipped_count >= 0)'
  );
  await pool.query(
    "ALTER TABLE rag_sync_runs ADD COLUMN IF NOT EXISTS warnings jsonb NOT NULL DEFAULT '[]'::jsonb"
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_chunks_chunk_id_idx ON rag_chunks (chunk_id)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_chunks_entity_id_idx ON rag_chunks (entity_id)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_chunks_source_id_idx ON rag_chunks (source_id)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_chunks_has_todo_idx ON rag_chunks (has_todo)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_chunks_language_idx ON rag_chunks (language)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_chunks_metadata_idx ON rag_chunks USING gin (metadata)'
  );
  await pool.query(`
    CREATE INDEX IF NOT EXISTS rag_chunks_search_idx
      ON rag_chunks USING gin (to_tsvector('simple', coalesce(title, '') || ' ' || content))
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
      ON rag_chunks
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
      WHERE embedding IS NOT NULL
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sources_type_source_key_idx ON rag_sources (type, source_key)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sources_language_idx ON rag_sources (language)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sync_runs_source_id_idx ON rag_sync_runs (source_id)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sync_runs_status_idx ON rag_sync_runs (status)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sync_runs_started_at_idx ON rag_sync_runs (started_at DESC)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sync_locks_locked_until_idx ON rag_sync_locks (locked_until)'
  );
  await pool.query(`
    CREATE OR REPLACE FUNCTION set_rag_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);
  await pool.query(
    'DROP TRIGGER IF EXISTS rag_sources_set_updated_at ON rag_sources'
  );
  await pool.query(`
    CREATE TRIGGER rag_sources_set_updated_at
      BEFORE UPDATE ON rag_sources
      FOR EACH ROW
      EXECUTE FUNCTION set_rag_updated_at()
  `);
  await pool.query(
    'DROP TRIGGER IF EXISTS rag_chunks_set_updated_at ON rag_chunks'
  );
  await pool.query(`
    CREATE TRIGGER rag_chunks_set_updated_at
      BEFORE UPDATE ON rag_chunks
      FOR EACH ROW
      EXECUTE FUNCTION set_rag_updated_at()
  `);
}

export async function persistNotionRagSyncResult(
  result: NotionRagSyncResult
): Promise<PersistedNotionRagSync> {
  await ensureRagDatabaseSchema();

  const source: RagSourceInput = {
    type: 'notion',
    sourceKey: result.pageId,
    title: result.pageTitle,
    url: result.pageUrl,
    language: result.language ?? null,
  };
  const chunks = notionResultToDatabaseChunks(result);

  const { sourceId, syncRunId } = await withPostgresTransaction(
    async (client) => {
      const sourceId = await upsertRagSource(client, source);
      const syncRunId = await createRagSyncRun(client, {
        sourceId,
        status: 'running',
        blockCount: result.blockCount,
        chunkCount: 0,
        warnings: result.warnings,
      });

      return {
        sourceId,
        syncRunId,
      };
    }
  );

  try {
    const stats = await withPostgresTransaction(async (client) => {
      const upsertStats = await upsertChunksForSource(client, {
        sourceId,
        chunks,
      });

      await markRagSourceSynced(client, sourceId);
      await finishRagSyncRun(client, {
        syncRunId,
        status: 'success',
        blockCount: result.blockCount,
        chunkCount: chunks.length,
        inserted: upsertStats.inserted,
        updated: upsertStats.updated,
        deleted: upsertStats.deleted,
        skipped: upsertStats.skipped,
        warnings: result.warnings,
      });

      return upsertStats;
    });

    return {
      sourceId,
      syncRunId,
      chunkCount: chunks.length,
      inserted: stats.inserted,
      updated: stats.updated,
      deleted: stats.deleted,
      skipped: stats.skipped,
      changedEntityIds: Array.from(stats.changedEntityIds),
      changedSourceChunkIds: Array.from(stats.changedSourceChunkIds),
    };
  } catch (error) {
    await markNotionRagSyncFailed({
      syncRunId,
      blockCount: result.blockCount,
      chunkCount: chunks.length,
      warnings: result.warnings,
      errorMessage:
        error instanceof Error ? error.message : 'RAG sync persistence failed.',
    });

    throw new RagSyncPersistenceError({
      sourceId,
      syncRunId,
      blockCount: result.blockCount,
      chunkCount: chunks.length,
      message:
        error instanceof Error ? error.message : 'RAG sync persistence failed.',
    });
  }
}

export async function recordFailedNotionRagSyncRun({
  pageId,
  errorMessage,
  warnings = [],
  blockCount = 0,
  chunkCount = 0,
}: {
  pageId: string;
  errorMessage: string;
  warnings?: string[];
  blockCount?: number;
  chunkCount?: number;
}) {
  await ensureRagDatabaseSchema();

  const source: RagSourceInput = {
    type: 'notion',
    sourceKey: pageId,
    title: `Notion source ${pageId.slice(0, 12)}`,
  };

  return withPostgresTransaction(async (client) => {
    const sourceId = await upsertRagSource(client, source);
    const syncRunId = await createRagSyncRun(client, {
      sourceId,
      status: 'running',
      blockCount,
      chunkCount,
      warnings,
    });

    await finishRagSyncRun(client, {
      syncRunId,
      status: 'failed',
      blockCount,
      chunkCount,
      inserted: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      warnings,
      errorMessage,
    });

    return { sourceId, syncRunId };
  });
}

export async function replaceStoredRagChunks(chunks: RagChunk[]) {
  await ensureRagDatabaseSchema();

  const groups = groupChunksBySource(chunks);

  await withPostgresTransaction(async (client) => {
    if (groups.length === 0) {
      await client.query('DELETE FROM rag_chunks');
      return;
    }

    for (const group of groups) {
      const sourceId = await upsertRagSource(client, group);
      await upsertChunksForSource(client, {
        sourceId,
        chunks: group.chunks.map(ragChunkToDatabaseChunk),
      });
      await markRagSourceSynced(client, sourceId);
    }
  });
}

export async function getStoredRagChunks() {
  await ensureRagDatabaseSchema();

  const pool = await getPostgresPool();
  const result = await pool.query(`
    SELECT
      c.chunk_id,
      s.type AS source,
      c.title,
      c.content,
      s.url,
      c.content_hash,
      c.metadata
    FROM rag_chunks c
    JOIN rag_sources s ON s.id = c.source_id
    ORDER BY c.updated_at DESC, c.title ASC
  `);

  return result.rows.map(rowToChunk);
}

export async function getRagDatabaseStatus(): Promise<RagStatus> {
  await ensureRagDatabaseSchema();

  const pool = await getPostgresPool();
  const result = await pool.query<{
    chunk_count: string;
    embedding_count: string;
    last_synced_at: Date | null;
  }>(`
    SELECT
      COUNT(*)::text AS chunk_count,
      COUNT(embedding)::text AS embedding_count,
      MAX(updated_at) AS last_synced_at
    FROM rag_chunks
  `);
  const row = result.rows[0];

  return {
    store: 'postgres',
    chunkCount: Number.parseInt(row.chunk_count, 10),
    embeddingCount: Number.parseInt(row.embedding_count, 10),
    lastSyncedAt: row.last_synced_at?.toISOString(),
  };
}

export async function acquireRagSyncLock({
  lockId,
  ttlSeconds,
}: {
  lockId: string;
  ttlSeconds: number;
}) {
  await ensureRagDatabaseSchema();

  const pool = await getPostgresPool();
  const result = await pool.query<{ id: string }>(
    `
      INSERT INTO rag_sync_locks (id, locked_until, created_at)
      VALUES ($1, now() + ($2::text || ' seconds')::interval, now())
      ON CONFLICT (id)
      DO UPDATE SET
        locked_until = EXCLUDED.locked_until,
        created_at = now()
      WHERE rag_sync_locks.locked_until <= now()
      RETURNING id
    `,
    [lockId, String(ttlSeconds)]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function releaseRagSyncLock(lockId: string) {
  if (!hasPostgresDatabaseUrl()) return;

  const pool = await getPostgresPool();
  await pool.query('DELETE FROM rag_sync_locks WHERE id = $1', [lockId]);
}

export async function searchStoredRagChunksByEmbedding(
  embedding: number[],
  limit: number
): Promise<RagSearchResult[]> {
  await ensureRagDatabaseSchema();

  const pool = await getPostgresPool();
  const result = await pool.query(
    `
      SELECT
        c.chunk_id,
        s.type AS source,
        c.title,
        c.content,
        s.url,
        c.content_hash,
        c.metadata,
        1 - (c.embedding <=> $1::vector) AS score
      FROM rag_chunks c
      JOIN rag_sources s ON s.id = c.source_id
      WHERE c.embedding IS NOT NULL
      ORDER BY c.embedding <=> $1::vector
      LIMIT $2
    `,
    [toVectorLiteral(embedding), limit]
  );

  return result.rows.map((row) => ({
    chunk: rowToChunk(row),
    score: Number(row.score),
  }));
}

export async function searchStoredRagChunkRowsByEmbedding({
  embedding,
  limit,
  includePrivate = false,
  entityId,
  language,
}: {
  embedding: number[];
  limit: number;
  includePrivate?: boolean;
  entityId?: string | null;
  language?: 'ko' | 'en' | null;
}): Promise<StoredRagChunkEmbeddingSearchRow[]> {
  await ensureRagDatabaseSchema();

  const pool = await getPostgresPool();
  const result = await pool.query<StoredRagChunkEmbeddingSearchRow>(
    `
      SELECT
        c.chunk_id,
        c.entity_id,
        c.title,
        c.section_path,
        c.content,
        c.metadata,
        c.has_todo,
        c.visibility,
        c.freshness,
        c.confidence,
        c.updated_at,
        (1 - (c.embedding <=> $1::vector))::double precision AS embedding_score,
        (
          (1 - (c.embedding <=> $1::vector)) * 20
          + CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END
          + CASE WHEN c.freshness = 'current' THEN 1 ELSE 0 END
          + CASE WHEN c.has_todo THEN -2 ELSE 0 END
        )::double precision AS score
      FROM rag_chunks c
      WHERE
        c.embedding IS NOT NULL
        AND ($3::boolean OR c.visibility = 'public')
        AND ($4::text IS NULL OR c.entity_id = $4)
        AND ($5::text IS NULL OR c.language IS NULL OR c.language = $5)
      ORDER BY c.embedding <=> $1::vector, c.updated_at DESC, c.title ASC
      LIMIT $2
    `,
    [
      toVectorLiteral(embedding),
      limit,
      includePrivate,
      entityId ?? null,
      language ?? null,
    ]
  );

  return result.rows;
}

async function upsertRagSource(client: PoolClient, source: RagSourceInput) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO rag_sources
        (type, source_key, title, url, language, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, now())
      ON CONFLICT (type, source_key) DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        language = EXCLUDED.language,
        updated_at = now()
      RETURNING id
    `,
    [
      source.type,
      source.sourceKey,
      source.title,
      source.url ?? null,
      source.language ?? null,
    ]
  );

  return result.rows[0].id;
}

async function markRagSourceSynced(client: PoolClient, sourceId: string) {
  await client.query(
    `
      UPDATE rag_sources
      SET last_synced_at = now(), updated_at = now()
      WHERE id = $1
    `,
    [sourceId]
  );
}

async function createRagSyncRun(
  client: PoolClient,
  input: {
    sourceId: string;
    status: RagSyncRunStatus;
    blockCount: number;
    chunkCount: number;
    warnings?: string[];
  }
) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO rag_sync_runs
        (source_id, status, block_count, chunk_count, warnings, started_at)
      VALUES
        ($1, $2, $3, $4, $5::jsonb, now())
      RETURNING id
    `,
    [
      input.sourceId,
      input.status,
      input.blockCount,
      input.chunkCount,
      JSON.stringify(input.warnings ?? []),
    ]
  );

  return result.rows[0].id;
}

async function finishRagSyncRun(
  client: PoolClient,
  input: {
    syncRunId: string;
    status: Exclude<RagSyncRunStatus, 'running'>;
    blockCount: number;
    chunkCount: number;
    inserted: number;
    updated: number;
    deleted: number;
    skipped: number;
    warnings?: string[];
    errorMessage?: string;
  }
) {
  await client.query(
    `
      UPDATE rag_sync_runs
      SET
        status = $2,
        block_count = $3,
        chunk_count = $4,
        inserted_count = $5,
        updated_count = $6,
        deleted_count = $7,
        skipped_count = $8,
        warnings = $9::jsonb,
        error_message = $10,
        finished_at = now()
      WHERE id = $1
    `,
    [
      input.syncRunId,
      input.status,
      input.blockCount,
      input.chunkCount,
      input.inserted,
      input.updated,
      input.deleted,
      input.skipped,
      JSON.stringify(input.warnings ?? []),
      input.errorMessage ?? null,
    ]
  );
}

async function markNotionRagSyncFailed({
  syncRunId,
  blockCount,
  chunkCount,
  warnings,
  errorMessage,
}: {
  syncRunId: string;
  blockCount: number;
  chunkCount: number;
  warnings: string[];
  errorMessage: string;
}) {
  await withPostgresTransaction(async (client) => {
    await finishRagSyncRun(client, {
      syncRunId,
      status: 'failed',
      blockCount,
      chunkCount,
      inserted: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      warnings,
      errorMessage,
    });
  });
}

async function upsertChunksForSource(
  client: PoolClient,
  input: {
    sourceId: string;
    chunks: RagDatabaseChunkInput[];
  }
) {
  const stats = {
    inserted: 0,
    updated: 0,
    deleted: 0,
    skipped: 0,
    changedEntityIds: new Set<string>(),
    changedSourceChunkIds: new Set<string>(),
  } satisfies RagChunkMutationStats;
  const currentChunkIds = new Set<string>();
  const matchedContentHashes = new Set<string>();

  for (const chunk of input.chunks) {
    if (currentChunkIds.has(chunk.chunkId)) {
      stats.skipped += 1;
      continue;
    }

    const result = await upsertChunkForSource(client, {
      sourceId: input.sourceId,
      chunk,
      allowContentHashMatch: !matchedContentHashes.has(chunk.contentHash),
    });

    currentChunkIds.add(chunk.chunkId);
    matchedContentHashes.add(chunk.contentHash);
    stats[result.status] += 1;
    addChangedEntityIds(stats, result.entityIds);
    addChangedSourceChunkIds(stats, result.sourceChunkIds);
  }

  const staleChunks = await getStaleChunksForSource(client, {
    sourceId: input.sourceId,
    currentChunkIds: input.chunks.map((chunk) => chunk.chunkId),
  });

  if (input.chunks.length > 0) {
    await client.query(
      `
        DELETE FROM rag_chunks
        WHERE source_id = $1 AND NOT chunk_id = ANY($2::text[])
      `,
      [input.sourceId, input.chunks.map((chunk) => chunk.chunkId)]
    );
  } else {
    await client.query('DELETE FROM rag_chunks WHERE source_id = $1', [
      input.sourceId,
    ]);
  }

  stats.deleted += staleChunks.length;
  addChangedEntityIds(
    stats,
    staleChunks.map((chunk) => chunk.entity_id)
  );
  addChangedSourceChunkIds(
    stats,
    staleChunks.map((chunk) => chunk.chunk_id)
  );

  return stats;
}

async function getStaleChunksForSource(
  client: PoolClient,
  input: {
    sourceId: string;
    currentChunkIds: string[];
  }
) {
  const hasCurrentChunks = input.currentChunkIds.length > 0;
  const result = await client.query<{
    chunk_id: string;
    entity_id: string | null;
  }>(
    hasCurrentChunks
      ? `
        SELECT chunk_id, entity_id
        FROM rag_chunks
        WHERE source_id = $1 AND NOT chunk_id = ANY($2::text[])
      `
      : `
        SELECT chunk_id, entity_id
        FROM rag_chunks
        WHERE source_id = $1
      `,
    hasCurrentChunks
      ? [input.sourceId, input.currentChunkIds]
      : [input.sourceId]
  );

  return result.rows;
}

function addChangedEntityIds(
  stats: RagChunkMutationStats,
  entityIds: Array<string | null | undefined>
) {
  for (const entityId of compactTextArray(entityIds)) {
    stats.changedEntityIds.add(entityId);
  }
}

function addChangedSourceChunkIds(
  stats: RagChunkMutationStats,
  sourceChunkIds: Array<string | null | undefined>
) {
  for (const sourceChunkId of compactTextArray(sourceChunkIds)) {
    stats.changedSourceChunkIds.add(sourceChunkId);
  }
}

function compactTextArray(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter(Boolean))
  ) as string[];
}

async function upsertChunkForSource(
  client: PoolClient,
  input: {
    sourceId: string;
    chunk: RagDatabaseChunkInput;
    allowContentHashMatch: boolean;
  }
) {
  const existing = await client.query<{
    id: string;
    chunk_id: string;
    content_hash: string;
    entity_id: string | null;
  }>(
    `
      SELECT id, chunk_id, content_hash, entity_id
      FROM rag_chunks
      WHERE source_id = $1
        AND (
          chunk_id = $2
          OR ($4 = true AND content_hash = $3)
        )
      ORDER BY
        CASE WHEN chunk_id = $2 THEN 0 ELSE 1 END,
        updated_at DESC
      LIMIT 1
    `,
    [
      input.sourceId,
      input.chunk.chunkId,
      input.chunk.contentHash,
      input.allowContentHashMatch,
    ]
  );

  if (existing.rowCount === 0) {
    await insertRagChunk(client, input.sourceId, input.chunk);
    return {
      status: 'inserted',
      entityIds: compactTextArray([input.chunk.entityId]),
      sourceChunkIds: [input.chunk.chunkId],
    } satisfies RagChunkMutationResult;
  }

  const existingChunk = existing.rows[0];
  if (
    existingChunk.chunk_id === input.chunk.chunkId &&
    existingChunk.content_hash === input.chunk.contentHash
  ) {
    return {
      status: 'skipped',
      entityIds: [],
      sourceChunkIds: [],
    } satisfies RagChunkMutationResult;
  }

  await updateRagChunk(client, existingChunk.id, input.chunk);
  return {
    status: 'updated',
    entityIds: compactTextArray([
      existingChunk.entity_id,
      input.chunk.entityId,
    ]),
    sourceChunkIds: compactTextArray([
      existingChunk.chunk_id,
      input.chunk.chunkId,
    ]),
  } satisfies RagChunkMutationResult;
}

async function insertRagChunk(
  client: PoolClient,
  sourceId: string,
  chunk: RagDatabaseChunkInput
) {
  await client.query(
    `
      INSERT INTO rag_chunks
        (
          source_id,
          chunk_id,
          entity_id,
          title,
          section_path,
          content,
          content_hash,
          metadata,
          language,
          visibility,
          freshness,
          has_todo,
          confidence,
          embedding,
          updated_at
        )
      VALUES
        ($1, $2, $3, $4, $5::text[], $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14::vector, now())
    `,
    [
      sourceId,
      chunk.chunkId,
      chunk.entityId ?? null,
      chunk.title,
      chunk.sectionPath,
      chunk.content,
      chunk.contentHash,
      JSON.stringify(chunk.metadata),
      chunk.language ?? null,
      chunk.visibility,
      chunk.freshness,
      chunk.hasTodo,
      chunk.confidence,
      chunk.embedding ? toVectorLiteral(chunk.embedding) : null,
    ]
  );
}

async function updateRagChunk(
  client: PoolClient,
  rowId: string,
  chunk: RagDatabaseChunkInput
) {
  await client.query(
    `
      UPDATE rag_chunks
      SET
        chunk_id = $2,
        entity_id = $3,
        title = $4,
        section_path = $5::text[],
        content = $6,
        content_hash = $7,
        metadata = $8::jsonb,
        language = $9,
        visibility = $10,
        freshness = $11,
        has_todo = $12,
        confidence = $13,
        embedding = $14::vector,
        updated_at = now()
      WHERE id = $1
    `,
    [
      rowId,
      chunk.chunkId,
      chunk.entityId ?? null,
      chunk.title,
      chunk.sectionPath,
      chunk.content,
      chunk.contentHash,
      JSON.stringify(chunk.metadata),
      chunk.language ?? null,
      chunk.visibility,
      chunk.freshness,
      chunk.hasTodo,
      chunk.confidence,
      chunk.embedding ? toVectorLiteral(chunk.embedding) : null,
    ]
  );
}

function groupChunksBySource(chunks: RagChunk[]): RagChunkGroup[] {
  const groups = new Map<string, RagChunkGroup>();

  for (const chunk of chunks) {
    const source = getRagChunkSource(chunk);
    const groupKey = `${source.type}:${source.sourceKey}`;
    const existingGroup = groups.get(groupKey);

    if (existingGroup) {
      existingGroup.chunks.push(chunk);
      if (!existingGroup.url && source.url) existingGroup.url = source.url;
      continue;
    }

    groups.set(groupKey, {
      ...source,
      chunks: [chunk],
    });
  }

  return Array.from(groups.values());
}

function getRagChunkSource(chunk: RagChunk): RagSourceInput {
  const sourceKey =
    getMetadataString(chunk.metadata, 'notionPageId') ||
    getMetadataString(chunk.metadata, 'parentId') ||
    chunk.url ||
    chunk.source;

  return {
    type: chunk.source,
    sourceKey,
    title:
      chunk.source === 'notion'
        ? `Notion source ${sourceKey.slice(0, 12)}`
        : 'Static portfolio fallback',
    url: chunk.url,
    language: getMetadataLanguage(chunk.metadata),
  };
}

function ragChunkToDatabaseChunk(chunk: RagChunk): RagDatabaseChunkInput {
  const hasTodo = hasTodoMarker(chunk.text);

  return {
    chunkId: chunk.id,
    entityId:
      getMetadataString(chunk.metadata, 'entityId') ||
      detectEntityId(chunk.text),
    title: chunk.title,
    sectionPath: getMetadataStringArray(chunk.metadata, 'sectionPath') || [
      chunk.title,
    ],
    content: chunk.text,
    contentHash: chunk.contentHash,
    metadata: chunk.metadata ?? {},
    visibility: getMetadataString(chunk.metadata, 'visibility') || 'public',
    freshness:
      getMetadataString(chunk.metadata, 'freshness') ||
      (hasTodo ? 'needs_review' : 'current'),
    hasTodo,
    confidence:
      getMetadataNumber(chunk.metadata, 'confidence') ?? (hasTodo ? 0.6 : 1),
    embedding: chunk.embedding,
    language: getMetadataLanguage(chunk.metadata),
  };
}

function rowToChunk(row: {
  chunk_id: string;
  source: RagChunk['source'];
  title: string;
  content: string;
  url?: string | null;
  content_hash: string;
  metadata?: RagChunkMetadata;
}): RagChunk {
  return {
    id: row.chunk_id,
    source: row.source,
    title: row.title,
    text: row.content,
    url: row.url ?? undefined,
    contentHash: row.content_hash,
    metadata: row.metadata ?? {},
  };
}

function getMetadataString(
  metadata: RagChunkMetadata | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function getMetadataNumber(
  metadata: RagChunkMetadata | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : undefined;
}

function getMetadataLanguage(metadata: RagChunkMetadata | undefined) {
  const language = getMetadataString(metadata, 'language');
  return language === 'ko' || language === 'en' ? language : null;
}

function getMetadataStringArray(
  metadata: RagChunkMetadata | undefined,
  key: string
) {
  const value = metadata?.[key];
  if (!Array.isArray(value)) return null;

  const strings = value.filter(
    (item: RagChunkMetadataValue): item is string => typeof item === 'string'
  );

  return strings.length > 0 ? strings : null;
}

function toVectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}
