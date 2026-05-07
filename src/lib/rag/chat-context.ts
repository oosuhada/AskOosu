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
  freshness?: string;
  has_todo: boolean;
};

export type AnswerConfidence = {
  retrieval: number;
  intent: number;
  freshness: number;
  grounding: number;
  final: number;
};

export type RagChatMetadata = {
  answer?: string;
  sources: RagChatSource[];
  confidence: number;
  confidenceSignals: AnswerConfidence;
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

  const publicEvidence = primarySearch.results.filter(isPublicEvidenceChunk);

  if (publicEvidence.length === 0) {
    return buildEmptyContext(warnings);
  }

  const guardrailLimit = Math.min(
    2,
    Math.max(1, Math.floor(publicEvidence.length / 2))
  );
  const guardrailEvidence = guardrailSearch.results.slice(0, guardrailLimit);
  const chunks = dedupeChunks([...primarySearch.results, ...guardrailEvidence]);

  const sources = chunks.map(toChatSource);
  const confidenceSignals = buildAnswerConfidenceSignals({
    sources,
    warnings,
    intent: 0.5,
    usesGroundedSources: true,
  });
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
      confidence: confidenceSignals.final,
      confidenceSignals,
      matchedEntityIds: getMatchedEntityIds(sources),
      hasTodoEvidence: chunks.some(
        (chunk) => chunk.has_todo || chunk.visibility === 'needs_review'
      ),
      warnings,
    },
  };
}

function buildEmptyContext(warnings: string[]): RagChatContext {
  const confidenceSignals = buildAnswerConfidenceSignals({
    sources: [],
    warnings,
    intent: 0.5,
    usesGroundedSources: false,
  });

  return {
    contextText:
      '## Portfolio Evidence\nNo matching public Wiki evidence was found. Do not answer the user question as fact.',
    metadata: {
      sources: [],
      confidence: confidenceSignals.final,
      confidenceSignals,
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
    freshness:
      typeof chunk.metadata.freshness === 'string'
        ? chunk.metadata.freshness
        : undefined,
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

export function buildAnswerConfidenceSignals({
  sources,
  warnings = [],
  intent = 0.5,
  usesGroundedSources = sources.length > 0,
}: {
  sources: RagChatSource[];
  warnings?: string[];
  intent?: number;
  usesGroundedSources?: boolean;
}): AnswerConfidence {
  const retrieval = estimateRetrievalConfidence(sources);
  const freshness = estimateFreshnessConfidence(sources);
  const grounding = estimateGroundingConfidence({
    sources,
    warnings,
    usesGroundedSources,
  });
  const normalizedIntent = clampConfidence(intent);
  const final = clampConfidence(
    retrieval * 0.3 + normalizedIntent * 0.2 + freshness * 0.2 + grounding * 0.3
  );

  return {
    retrieval,
    intent: normalizedIntent,
    freshness,
    grounding,
    final,
  };
}

function estimateRetrievalConfidence(sources: RagChatSource[]) {
  if (sources.length === 0) return 0.15;

  const bestScore = Math.max(...sources.map((source) => source.score));
  const normalizedTopScore = normalizeRetrievalScore(bestScore);
  const sourceCountScore = Math.min(1, sources.length / getRagTopK());

  return clampConfidence(normalizedTopScore * 0.7 + sourceCountScore * 0.3);
}

function estimateFreshnessConfidence(sources: RagChatSource[]) {
  if (sources.length === 0) return 0.25;

  const total = sources.reduce((sum, source) => {
    if (source.has_todo || source.visibility === 'needs_review') {
      return sum + 0.45;
    }

    if (source.visibility !== 'public') {
      return sum + 0.3;
    }

    if (source.freshness === 'stale') {
      return sum + 0.7;
    }

    if (source.freshness === 'needs_review') {
      return sum + 0.45;
    }

    return sum + 1;
  }, 0);

  return clampConfidence(total / sources.length);
}

function estimateGroundingConfidence({
  sources,
  warnings,
  usesGroundedSources,
}: {
  sources: RagChatSource[];
  warnings: string[];
  usesGroundedSources: boolean;
}) {
  if (sources.length === 0) return 0.15;

  const sourceCoverage = Math.min(1, sources.length / getRagTopK());
  const warningPenalty = Math.min(0.25, warnings.length * 0.05);
  const groundedBase = usesGroundedSources ? 0.65 : 0.35;

  return clampConfidence(groundedBase + sourceCoverage * 0.25 - warningPenalty);
}

function normalizeRetrievalScore(score: number) {
  if (!Number.isFinite(score) || score <= 0) return 0.1;
  if (score <= 1) return score;
  return Math.min(1, score / 30);
}

function clampConfidence(value: number) {
  return Math.max(0.1, Math.min(0.95, Number(value.toFixed(2))));
}
