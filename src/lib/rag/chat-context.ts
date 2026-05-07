import { getRagTopK } from './config';
import { searchRagChunks, type RagChunkSearchResult } from './search';
import type { ChatLanguage } from '@/lib/i18n/detect-language';

const GUARDRAIL_ENTITY_ID = 'policy.guardrail';

export type RagChatSource = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[];
  score: number;
  visibility: string;
  has_todo: boolean;
};

export type RagChatMetadata = {
  answer?: string;
  sources: RagChatSource[];
  confidence: number;
  matchedEntityIds: string[];
  hasTodoEvidence: boolean;
  warnings: string[];
};

export type RagChatContext = {
  contextText: string;
  metadata: RagChatMetadata;
};

export async function buildRagChatContext(
  question: string,
  language?: ChatLanguage
): Promise<RagChatContext> {
  const normalizedQuestion = question.trim();
  const warnings: string[] = [];

  if (!normalizedQuestion) {
    return buildEmptyContext([
      'No user question was available for RAG search.',
    ]);
  }

  const [primarySearch, guardrailSearch] = await Promise.all([
    searchRagChunks({
      q: normalizedQuestion,
      limit: getRagTopK(),
      includeContent: true,
      language,
    }),
    searchRagChunks({
      entityId: GUARDRAIL_ENTITY_ID,
      limit: 3,
      includeContent: true,
    }),
  ]);

  warnings.push(...primarySearch.warnings, ...guardrailSearch.warnings);

  const chunks = dedupeChunks([
    ...primarySearch.results,
    ...guardrailSearch.results,
  ]);
  const publicEvidence = primarySearch.results.filter(isPublicEvidenceChunk);

  if (publicEvidence.length === 0) {
    return buildEmptyContext(warnings);
  }

  const sources = chunks.map(toChatSource);
  const contextText = [
    '## Portfolio Evidence',
    'Use only this portfolio evidence as factual grounding. Treat uncertain entries as unconfirmed and do not state them as final.',
    '',
    ...chunks.map(formatChunkForPrompt),
  ].join('\n');

  return {
    contextText,
    metadata: {
      sources,
      confidence: estimateConfidence(chunks, warnings),
      matchedEntityIds: getMatchedEntityIds(sources),
      hasTodoEvidence: chunks.some(
        (chunk) => chunk.has_todo || chunk.visibility === 'needs_review'
      ),
      warnings,
    },
  };
}

function buildEmptyContext(warnings: string[]): RagChatContext {
  return {
    contextText:
      '## Portfolio Evidence\nNo matching public Wiki evidence was found. Do not answer the user question as fact.',
    metadata: {
      sources: [],
      confidence: 0.25,
      matchedEntityIds: [],
      hasTodoEvidence: false,
      warnings,
    },
  };
}

function dedupeChunks(chunks: RagChunkSearchResult[]) {
  const seen = new Set<string>();
  const deduped: RagChunkSearchResult[] = [];

  for (const chunk of chunks) {
    if (seen.has(chunk.chunk_id)) continue;
    seen.add(chunk.chunk_id);
    deduped.push(chunk);
  }

  return deduped;
}

function formatChunkForPrompt(chunk: RagChunkSearchResult, index: number) {
  const sourceId = `S${index + 1}`;
  const path = chunk.section_path.length
    ? chunk.section_path.join(' > ')
    : chunk.title;
  const certainty =
    chunk.has_todo || chunk.visibility === 'needs_review'
      ? 'uncertain'
      : 'confirmed';
  const content = chunk.content ?? chunk.contentPreview;

  return [
    `[${sourceId}] Portfolio evidence`,
    `Title: ${chunk.title}`,
    `Section: ${path}`,
    `Status: ${certainty}`,
    `Content: ${content}`,
  ].join('\n');
}

function isPublicEvidenceChunk(chunk: RagChunkSearchResult) {
  return chunk.visibility === 'public';
}

function toChatSource(chunk: RagChunkSearchResult): RagChatSource {
  return {
    chunk_id: chunk.chunk_id,
    entity_id: chunk.entity_id,
    title: chunk.title,
    section_path: chunk.section_path,
    score: chunk.score,
    visibility: chunk.visibility,
    has_todo: chunk.has_todo,
  };
}

function getMatchedEntityIds(sources: RagChatSource[]) {
  return Array.from(
    new Set(
      sources
        .map((source) => source.entity_id)
        .filter((entityId): entityId is string => Boolean(entityId))
    )
  );
}

function estimateConfidence(
  chunks: RagChunkSearchResult[],
  warnings: string[]
) {
  if (chunks.length === 0) return 0.25;

  const bestScore = Math.max(...chunks.map((chunk) => chunk.score));
  const hasUncertainEvidence = chunks.some(
    (chunk) => chunk.has_todo || chunk.visibility === 'needs_review'
  );
  const scoreBoost = Math.min(0.25, Math.max(0, bestScore) / 80);
  const sourceBoost = Math.min(0.15, chunks.length * 0.03);
  const uncertaintyPenalty = hasUncertainEvidence ? 0.2 : 0;
  const warningPenalty = warnings.length > 0 ? 0.05 : 0;

  return clampConfidence(
    0.55 + scoreBoost + sourceBoost - uncertaintyPenalty - warningPenalty
  );
}

function clampConfidence(value: number) {
  return Math.max(0.1, Math.min(0.95, Number(value.toFixed(2))));
}
