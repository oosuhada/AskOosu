import type { PoolClient } from 'pg';
import {
  getEmbeddingDimensions,
  getPositiveIntEnv,
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
} from './config';
import {
  getPostgresPool,
  hasPostgresDatabaseUrl,
  withPostgresTransaction,
} from '@/lib/db/postgres';
import { hashString } from './text';
import type { NotionRagSection, NotionRagSyncResult } from './notion';
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
};

type RagDatabaseChunkInput = {
  chunkId: string;
  entityId?: string | null;
  title: string;
  sectionPath: string[];
  content: string;
  contentHash: string;
  metadata: RagChunkMetadata;
  visibility: string;
  freshness: string;
  hasTodo: boolean;
  confidence: number;
  embedding?: number[];
};

type RagChunkGroup = RagSourceInput & {
  chunks: RagChunk[];
};

type RagSyncRunStatus = 'running' | 'success' | 'failed';

export type PersistedNotionRagSync = {
  sourceId: string;
  syncRunId: string;
  chunkCount: number;
};

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
      error_message text,
      started_at timestamptz NOT NULL DEFAULT now(),
      finished_at timestamptz
    )
  `);
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
    'CREATE INDEX IF NOT EXISTS rag_sync_runs_source_id_idx ON rag_sync_runs (source_id)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sync_runs_status_idx ON rag_sync_runs (status)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS rag_sync_runs_started_at_idx ON rag_sync_runs (started_at DESC)'
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
  };
  const chunks = notionResultToDatabaseChunks(result);

  return withPostgresTransaction(async (client) => {
    const sourceId = await upsertRagSource(client, source);
    const syncRunId = await createRagSyncRun(client, {
      sourceId,
      status: 'running',
      blockCount: result.blockCount,
      chunkCount: 0,
    });

    await replaceChunksForSource(client, {
      sourceId,
      chunks,
    });
    await markRagSourceSynced(client, sourceId);
    await finishRagSyncRun(client, {
      syncRunId,
      status: 'success',
      blockCount: result.blockCount,
      chunkCount: chunks.length,
    });

    return {
      sourceId,
      syncRunId,
      chunkCount: chunks.length,
    };
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
      await replaceChunksForSource(client, {
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

async function upsertRagSource(client: PoolClient, source: RagSourceInput) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO rag_sources
        (type, source_key, title, url, last_synced_at, updated_at)
      VALUES
        ($1, $2, $3, $4, now(), now())
      ON CONFLICT (type, source_key) DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        updated_at = now()
      RETURNING id
    `,
    [source.type, source.sourceKey, source.title, source.url ?? null]
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
  }
) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO rag_sync_runs
        (source_id, status, block_count, chunk_count, started_at)
      VALUES
        ($1, $2, $3, $4, now())
      RETURNING id
    `,
    [input.sourceId, input.status, input.blockCount, input.chunkCount]
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
        error_message = $5,
        finished_at = now()
      WHERE id = $1
    `,
    [
      input.syncRunId,
      input.status,
      input.blockCount,
      input.chunkCount,
      input.errorMessage ?? null,
    ]
  );
}

async function replaceChunksForSource(
  client: PoolClient,
  input: {
    sourceId: string;
    chunks: RagDatabaseChunkInput[];
  }
) {
  for (const chunk of input.chunks) {
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
            visibility,
            freshness,
            has_todo,
            confidence,
            embedding,
            updated_at
          )
        VALUES
          ($1, $2, $3, $4, $5::text[], $6, $7, $8::jsonb, $9, $10, $11, $12, $13::vector, now())
        ON CONFLICT (source_id, chunk_id) DO UPDATE SET
          entity_id = EXCLUDED.entity_id,
          title = EXCLUDED.title,
          section_path = EXCLUDED.section_path,
          content = EXCLUDED.content,
          content_hash = EXCLUDED.content_hash,
          metadata = EXCLUDED.metadata,
          visibility = EXCLUDED.visibility,
          freshness = EXCLUDED.freshness,
          has_todo = EXCLUDED.has_todo,
          confidence = EXCLUDED.confidence,
          embedding = EXCLUDED.embedding,
          updated_at = now()
      `,
      [
        input.sourceId,
        chunk.chunkId,
        chunk.entityId ?? null,
        chunk.title,
        chunk.sectionPath,
        chunk.content,
        chunk.contentHash,
        JSON.stringify(chunk.metadata),
        chunk.visibility,
        chunk.freshness,
        chunk.hasTodo,
        chunk.confidence,
        chunk.embedding ? toVectorLiteral(chunk.embedding) : null,
      ]
    );
  }

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
  };
}

function notionResultToDatabaseChunks(result: NotionRagSyncResult) {
  return result.sections.flatMap((section, sectionIndex) =>
    sectionToDatabaseChunks({
      pageId: result.pageId,
      pageUrl: result.pageUrl,
      section,
      sectionIndex,
    })
  );
}

function sectionToDatabaseChunks({
  pageId,
  pageUrl,
  section,
  sectionIndex,
}: {
  pageId: string;
  pageUrl?: string;
  section: NotionRagSection;
  sectionIndex: number;
}) {
  const parts = splitChunkContent(section.text);

  return parts.map((content, partIndex) => {
    const chunkId = ['notion', pageId, section.id, partIndex + 1].join(':');
    const hasTodo = hasTodoMarker(content);
    const metadata: RagChunkMetadata = {
      notionPageId: pageId,
      notionBlockId: section.id,
      pageUrl,
      sectionLevel: section.level,
      sectionIndex,
      sectionPath: section.sectionPath,
      sourceBlockIds: section.blockIds,
      sourceBlockCount: section.blockCount,
      sourceTextLength: section.textLength,
      chunkPart: partIndex + 1,
      chunkPartCount: parts.length,
    };

    return {
      chunkId,
      entityId: detectEntityId(`${section.title}\n${content}`),
      title:
        parts.length > 1 ? `${section.title} ${partIndex + 1}` : section.title,
      sectionPath: section.sectionPath,
      content,
      contentHash: hashString(`${chunkId}:${content}`),
      metadata,
      visibility: 'public',
      freshness: hasTodo ? 'needs_review' : 'current',
      hasTodo,
      confidence: hasTodo ? 0.6 : 1,
    };
  });
}

function splitChunkContent(content: string) {
  const maxLength = getPositiveIntEnv(
    'ASKOOSU_RAG_CHUNK_SIZE',
    DEFAULT_CHUNK_SIZE
  );
  const overlap = getPositiveIntEnv(
    'ASKOOSU_RAG_CHUNK_OVERLAP',
    DEFAULT_CHUNK_OVERLAP
  );

  if (content.length <= maxLength) return [content];

  const chunks: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + maxLength, content.length);
    chunks.push(content.slice(start, end).trim());

    if (end === content.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks.filter(Boolean);
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

function hasTodoMarker(value: string) {
  return /\bTODO\b|확인 필요|채워야|미정/i.test(value);
}

function detectEntityId(value: string) {
  const match = value.match(
    /\b(?:person|project|career|skill|knowledge|policy|audience|question)\.[a-z0-9_.-]+\b/i
  );

  return match?.[0] ?? null;
}

function toVectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}
