import { cosineSimilarity } from 'ai';
import {
  getRagAutoSyncDefault,
  getRagCacheTtlMs,
  getRagTopK,
  shouldUseEmbeddings,
} from './config';
import { embedRagChunks, embedRagQuery } from './embeddings';
import { fetchLocalMarkdownRagChunks } from './markdown-source';
import { fetchNotionChunks } from './notion-source';
import { getStaticChunks } from './static-source';
import { getRagStore } from './stores';
import { dedupeChunks, normalizeText, tokenize } from './text';
import type {
  RagChunk,
  RagSearchResult,
  RagStatus,
  RagSyncSummary,
} from './types';

type SearchOptions = {
  limit?: number;
};

type SyncOptions = {
  force?: boolean;
};

let syncInFlight: Promise<RagSyncSummary> | null = null;

export async function retrievePortfolioContext(query: string) {
  const topK = getRagTopK();
  const selectedChunks = await searchPortfolioKnowledge(query, { limit: topK });

  if (selectedChunks.length === 0) return '';

  const body = selectedChunks
    .map(
      ({ chunk }, index) =>
        `[${index + 1}] ${chunk.title} (${chunk.source})\n${chunk.text}${
          chunk.url ? `\nSource: ${chunk.url}` : ''
        }`
    )
    .join('\n\n');

  return `## Retrieved Portfolio Context\nUse this retrieved context when it is relevant to the visitor's question. If it conflicts with older static prompt details, prefer this context.\n\n${body}`;
}

export async function searchPortfolioKnowledge(
  query: string,
  options: SearchOptions = {}
) {
  const limit = options.limit ?? getRagTopK();
  const trimmedQuery = normalizeText(query);
  if (!trimmedQuery) return [];

  try {
    const store = await getRagStore();
    await ensureRagIndexReady();

    if (shouldUseEmbeddings()) {
      const vectorResults = await searchWithEmbeddings({
        query: trimmedQuery,
        limit,
      });

      if (vectorResults.length > 0) return vectorResults;
    }

    const chunks = await store.getAll();
    if (chunks.length > 0) {
      return rankChunksLexically({ query: trimmedQuery, chunks }).slice(
        0,
        limit
      );
    }
  } catch (error) {
    console.warn(
      'RAG search failed. Falling back to static profile context.',
      error
    );
  }

  return rankChunksLexically({
    query: trimmedQuery,
    chunks: getStaticChunks(),
  }).slice(0, limit);
}

export async function syncPortfolioKnowledgeBase(
  options: SyncOptions = {}
): Promise<RagSyncSummary> {
  if (syncInFlight && !options.force) return syncInFlight;

  syncInFlight = syncPortfolioKnowledgeBaseOnce().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

export async function getPortfolioKnowledgeStatus(): Promise<RagStatus> {
  const store = await getRagStore();
  return store.getStatus();
}

async function syncPortfolioKnowledgeBaseOnce(): Promise<RagSyncSummary> {
  const startedAt = Date.now();
  const warnings: string[] = [];
  const store = await getRagStore();
  const localMarkdown = await fetchLocalMarkdownRagChunks();
  warnings.push(...localMarkdown.warnings);
  const sourceChunks = dedupeChunks([
    ...(await fetchNotionChunks()),
    ...localMarkdown.chunks,
    ...getStaticChunks(),
  ]);
  let chunks = sourceChunks;
  let skippedEmbeddings = !shouldUseEmbeddings();

  if (shouldUseEmbeddings()) {
    try {
      chunks = await embedRagChunks(sourceChunks);
      skippedEmbeddings = false;
    } catch (error) {
      skippedEmbeddings = true;
      warnings.push(
        'Embedding generation failed; stored chunks without vectors.'
      );
      console.warn('Embedding generation failed during RAG sync.', error);
    }
  }

  await store.replaceAll(chunks);

  return {
    store: store.kind,
    sourceChunkCount: sourceChunks.length,
    storedChunkCount: chunks.length,
    embeddedChunkCount: chunks.filter((chunk) => chunk.embedding).length,
    skippedEmbeddings,
    syncedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    warnings,
  };
}

async function ensureRagIndexReady() {
  const store = await getRagStore();
  const status = await store.getStatus();
  const shouldAutoSync = getRagAutoSyncDefault(store.kind);

  if (!shouldAutoSync) return;

  const isEmpty = status.chunkCount === 0;
  const isStale = status.lastSyncedAt
    ? Date.now() - new Date(status.lastSyncedAt).getTime() > getRagCacheTtlMs()
    : true;

  if (isEmpty || isStale) {
    await syncPortfolioKnowledgeBase();
  }
}

async function searchWithEmbeddings({
  query,
  limit,
}: {
  query: string;
  limit: number;
}) {
  const store = await getRagStore();
  const queryEmbedding = await embedRagQuery(query);

  if (store.searchByEmbedding) {
    return store.searchByEmbedding(queryEmbedding, limit);
  }

  const chunks = await store.getAll();
  const chunksWithEmbeddings = chunks.filter(
    (chunk): chunk is RagChunk & { embedding: number[] } =>
      Array.isArray(chunk.embedding)
  );

  return chunksWithEmbeddings
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function rankChunksLexically({
  query,
  chunks,
}: {
  query: string;
  chunks: RagChunk[];
}): RagSearchResult[] {
  const normalizedQuery = normalizeText(query).toLowerCase();
  const queryTokens = expandQueryTokens(tokenize(normalizedQuery));

  return chunks
    .map((chunk) => {
      const haystack = `${chunk.title}\n${chunk.text}`.toLowerCase();
      const tokenScore = queryTokens.reduce((score, token) => {
        if (haystack.includes(token)) return score + 1;
        return score;
      }, 0);
      const phraseScore =
        normalizedQuery && haystack.includes(normalizedQuery) ? 3 : 0;

      return {
        chunk,
        score: tokenScore + phraseScore,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

function expandQueryTokens(tokens: string[]) {
  const aliases: Record<string, string[]> = {
    개발자: ['developer'],
    경력: ['career', 'experience'],
    노션: ['notion'],
    대표: ['best', 'featured'],
    연락: ['contact', 'email'],
    위키: ['wiki'],
    이력서: ['resume', 'cv'],
    자기소개: ['profile', 'about'],
    기술: ['tech', 'stack', 'skills'],
    스택: ['tech', 'stack'],
    포트폴리오: ['portfolio'],
    프로젝트: ['project', 'projects'],
    협업: ['collaboration', 'contact'],
  };

  return Array.from(
    new Set(tokens.flatMap((token) => [token, ...(aliases[token] ?? [])]))
  );
}
