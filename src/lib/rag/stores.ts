import { getDatabaseUrl, getRagStoreKind } from './config';
import {
  getRagDatabaseStatus,
  getStoredRagChunks,
  replaceStoredRagChunks,
  searchStoredRagChunksByEmbedding,
} from './database';
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
}

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
      await replaceStoredRagChunks(chunks);
    },
    async getAll() {
      return getStoredRagChunks();
    },
    async getStatus() {
      return getRagDatabaseStatus();
    },
    async searchByEmbedding(embedding, limit) {
      return searchStoredRagChunksByEmbedding(embedding, limit);
    },
  };
}
