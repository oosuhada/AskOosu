import type { RagHybridWeights, RagRetrievalMode, RagStoreKind } from './types';

export const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
export const DEFAULT_NOTION_VERSION = '2026-03-11';
export const DEFAULT_TOP_K = 5;
export const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 10;
export const DEFAULT_CHUNK_SIZE = 1200;
export const DEFAULT_CHUNK_OVERLAP = 180;
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
export const DEFAULT_RAG_HYBRID_WEIGHTS: RagHybridWeights = {
  lexical: 0.35,
  vector: 0.35,
  entity: 0.15,
  intent: 0.1,
  freshness: 0.05,
};

export function getRagRetrievalMode(): RagRetrievalMode {
  const value = process.env.ASKOOSU_RAG_RETRIEVAL;
  if (value === 'lexical' || value === 'embedding' || value === 'hybrid') {
    return value;
  }
  return 'hybrid';
}

export function getRagStoreKind(): RagStoreKind {
  const value = process.env.ASKOOSU_RAG_STORE;
  if (value === 'postgres') return 'postgres';
  return 'memory';
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

export function getNotionVersion() {
  return process.env.NOTION_VERSION || DEFAULT_NOTION_VERSION;
}

export function getEmbeddingModelName() {
  return process.env.ASKOOSU_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}

export function getEmbeddingDimensions() {
  return getPositiveIntEnv(
    'ASKOOSU_EMBEDDING_DIMENSIONS',
    DEFAULT_EMBEDDING_DIMENSIONS
  );
}

export function getRagTopK() {
  return getPositiveIntEnv('ASKOOSU_RAG_TOP_K', DEFAULT_TOP_K);
}

export function getRagHybridWeights(): RagHybridWeights {
  return {
    lexical: getNumberEnv(
      'ASKOOSU_RAG_HYBRID_LEXICAL_WEIGHT',
      DEFAULT_RAG_HYBRID_WEIGHTS.lexical
    ),
    vector: getNumberEnv(
      'ASKOOSU_RAG_HYBRID_VECTOR_WEIGHT',
      DEFAULT_RAG_HYBRID_WEIGHTS.vector
    ),
    entity: getNumberEnv(
      'ASKOOSU_RAG_HYBRID_ENTITY_WEIGHT',
      DEFAULT_RAG_HYBRID_WEIGHTS.entity
    ),
    intent: getNumberEnv(
      'ASKOOSU_RAG_HYBRID_INTENT_WEIGHT',
      DEFAULT_RAG_HYBRID_WEIGHTS.intent
    ),
    freshness: getNumberEnv(
      'ASKOOSU_RAG_HYBRID_FRESHNESS_WEIGHT',
      DEFAULT_RAG_HYBRID_WEIGHTS.freshness
    ),
  };
}

export function getRagCacheTtlMs() {
  return getPositiveIntEnv('ASKOOSU_RAG_CACHE_TTL_MS', DEFAULT_CACHE_TTL_MS);
}

export function getRagAutoSyncDefault(store: RagStoreKind) {
  return getBooleanEnv('ASKOOSU_RAG_AUTO_SYNC', store === 'memory');
}

export function shouldUseEmbeddings() {
  return (
    (getRagRetrievalMode() === 'embedding' ||
      getRagRetrievalMode() === 'hybrid') &&
    Boolean(process.env.OPENAI_API_KEY)
  );
}

export function getListEnv(name: string) {
  return (process.env[name] ?? '')
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getPositiveIntEnv(name: string, fallback: number) {
  const rawValue = process.env[name];
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

export function getNumberEnv(name: string, fallback: number) {
  const rawValue = process.env[name];
  const parsedValue = rawValue ? Number.parseFloat(rawValue) : Number.NaN;

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function getBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name]?.toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  return fallback;
}
