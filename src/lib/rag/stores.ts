import type { Pool } from 'pg';
import {
  getDatabaseUrl,
  getEmbeddingDimensions,
  getRagStoreKind,
} from './config';
import type {
  RagChunk,
  RagSearchResult,
  RagStatus,
  RagStoreKind,
} from './types';

type RagStore = {
  kind: RagStoreKind;
  replaceAll: (chunks: RagChunk[]) => Promise<void>;
  getAll: () => Promise<RagChunk[]>;
  getStatus: () => Promise<RagStatus>;
  searchByEmbedding?: (
    embedding: number[],
    limit: number
  ) => Promise<RagSearchResult[]>;
};

type MemoryRagState = {
  chunks: RagChunk[];
  lastSyncedAt?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var askOosuMemoryRagState: MemoryRagState | undefined;
  // eslint-disable-next-line no-var
  var askOosuPgPool: Pool | undefined;
}

const TABLE_NAME = 'ask_oosu_rag_chunks';

export async function getRagStore(): Promise<RagStore> {
  const kind = getRagStoreKind();
  if (kind === 'postgres') return createPostgresStore();
  return createMemoryStore();
}

function createMemoryStore(): RagStore {
  globalThis.askOosuMemoryRagState ??= { chunks: [] };
  const state = globalThis.askOosuMemoryRagState;

  return {
    kind: 'memory',
    async replaceAll(chunks) {
      state.chunks = chunks;
      state.lastSyncedAt = new Date().toISOString();
    },
    async getAll() {
      return state.chunks;
    },
    async getStatus() {
      return {
        store: 'memory',
        chunkCount: state.chunks.length,
        embeddingCount: state.chunks.filter((chunk) => chunk.embedding).length,
        lastSyncedAt: state.lastSyncedAt,
      };
    },
  };
}

function createPostgresStore(): RagStore {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL or POSTGRES_URL is required when ASKOOSU_RAG_STORE=postgres.'
    );
  }

  return {
    kind: 'postgres',
    async replaceAll(chunks) {
      await ensurePostgresSchema();

      const pool = await getPostgresPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        for (const chunk of chunks) {
          await client.query(
            `
              INSERT INTO ${TABLE_NAME}
                (id, source, title, text, url, content_hash, metadata, embedding, updated_at)
              VALUES
                ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::vector, now())
              ON CONFLICT (id) DO UPDATE SET
                source = EXCLUDED.source,
                title = EXCLUDED.title,
                text = EXCLUDED.text,
                url = EXCLUDED.url,
                content_hash = EXCLUDED.content_hash,
                metadata = EXCLUDED.metadata,
                embedding = EXCLUDED.embedding,
                updated_at = now()
            `,
            [
              chunk.id,
              chunk.source,
              chunk.title,
              chunk.text,
              chunk.url ?? null,
              chunk.contentHash,
              JSON.stringify(chunk.metadata ?? {}),
              chunk.embedding ? toVectorLiteral(chunk.embedding) : null,
            ]
          );
        }

        if (chunks.length > 0) {
          await client.query(
            `DELETE FROM ${TABLE_NAME} WHERE NOT id = ANY($1::text[])`,
            [chunks.map((chunk) => chunk.id)]
          );
        } else {
          await client.query(`DELETE FROM ${TABLE_NAME}`);
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async getAll() {
      await ensurePostgresSchema();

      const pool = await getPostgresPool();
      const result = await pool.query(
        `
          SELECT id, source, title, text, url, content_hash, metadata
          FROM ${TABLE_NAME}
          ORDER BY updated_at DESC, title ASC
        `
      );

      return result.rows.map(rowToChunk);
    },
    async getStatus() {
      await ensurePostgresSchema();

      const pool = await getPostgresPool();
      const result = await pool.query<{
        chunk_count: string;
        embedding_count: string;
        last_synced_at: Date | null;
      }>(
        `
          SELECT
            COUNT(*)::text AS chunk_count,
            COUNT(embedding)::text AS embedding_count,
            MAX(updated_at) AS last_synced_at
          FROM ${TABLE_NAME}
        `
      );
      const row = result.rows[0];

      return {
        store: 'postgres',
        chunkCount: Number.parseInt(row.chunk_count, 10),
        embeddingCount: Number.parseInt(row.embedding_count, 10),
        lastSyncedAt: row.last_synced_at?.toISOString(),
      };
    },
    async searchByEmbedding(embedding, limit) {
      await ensurePostgresSchema();

      const pool = await getPostgresPool();
      const result = await pool.query(
        `
          SELECT
            id,
            source,
            title,
            text,
            url,
            content_hash,
            metadata,
            1 - (embedding <=> $1::vector) AS score
          FROM ${TABLE_NAME}
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> $1::vector
          LIMIT $2
        `,
        [toVectorLiteral(embedding), limit]
      );

      return result.rows.map((row) => ({
        chunk: rowToChunk(row),
        score: Number(row.score),
      }));
    },
  };
}

async function ensurePostgresSchema() {
  const pool = await getPostgresPool();
  const dimensions = getEmbeddingDimensions();

  await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id text PRIMARY KEY,
      source text NOT NULL,
      title text NOT NULL,
      text text NOT NULL,
      url text,
      content_hash text NOT NULL,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      embedding vector(${dimensions}),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS ${TABLE_NAME}_embedding_idx
      ON ${TABLE_NAME}
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
  `);
}

async function getPostgresPool() {
  if (globalThis.askOosuPgPool) return globalThis.askOosuPgPool;

  const { Pool: PgPool } = await import('pg');
  globalThis.askOosuPgPool = new PgPool({
    connectionString: getDatabaseUrl(),
  });

  return globalThis.askOosuPgPool;
}

function rowToChunk(row: {
  id: string;
  source: RagChunk['source'];
  title: string;
  text: string;
  url?: string | null;
  content_hash: string;
  metadata?: RagChunk['metadata'];
}): RagChunk {
  return {
    id: row.id,
    source: row.source,
    title: row.title,
    text: row.text,
    url: row.url ?? undefined,
    contentHash: row.content_hash,
    metadata: row.metadata ?? {},
  };
}

function toVectorLiteral(embedding: number[]) {
  return `[${embedding.join(',')}]`;
}
