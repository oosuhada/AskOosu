import { getRagTopK } from './config';
import { searchRagChunks, type RagChunkSearchResult } from './search';

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
  question: string
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

  if (chunks.length === 0) {
    return buildEmptyContext(warnings);
  }

  const sources = chunks.map(toChatSource);
  const contextText = [
    '## Retrieved Wiki Context',
    'Use only these retrieved Wiki chunks as factual evidence. Treat chunks with TODO or needs_review as uncertain and do not state them as confirmed.',
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
      '## Retrieved Wiki Context\nNo matching Wiki chunks were found. Answer only from stable portfolio prompt facts and say when the Wiki does not contain enough evidence.',
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
    `[${sourceId}] chunk_id=${chunk.chunk_id}`,
    `title=${chunk.title}`,
    `entity_id=${chunk.entity_id ?? 'none'}`,
    `section_path=${path}`,
    `visibility=${chunk.visibility}`,
    `has_todo=${chunk.has_todo}`,
    `certainty=${certainty}`,
    content,
  ].join('\n');
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
