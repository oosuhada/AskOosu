import type { UIMessage } from 'ai';
import { detectLanguage, type ChatLanguage } from '@/lib/i18n/detect-language';
import {
  buildAnswerConfidenceSignals,
  buildRagChatContext,
  type RagChatContext,
} from '@/lib/rag/chat-context';
import { buildAnswerParts, type FaqAnswer } from '@/lib/faq/answers';
import type { AnswerVariant } from '@/data/question-surfaces.shared';
import {
  routeFaqIntent,
  type FaqIntentRouteResult,
} from '@/lib/faq/semantic-router';
import { getCachedAnswer } from './database';
import { buildInsufficientEvidenceAnswer } from './output-guardrails';
import { normalizeQuestion } from './text';
import type {
  AnswerRouteDecision,
  ChatAnswerMetadata,
  DirectChatAnswer,
} from './types';

export type ChatOrchestrationInput = {
  messages: UIMessage[];
  preferredLanguage?: ChatLanguage | null;
  starterQuestionId?: string | null;
  faqId?: string | null;
  intentId?: string | null;
  displayQuestion?: string | null;
  originalQuickLabel?: string | null;
  answerVariant?: string | null;
  renderSpec?: string | null;
  source?: string | null;
};

export type ChatOrchestration =
  | {
      mode: 'direct';
      question: string;
      language: ChatLanguage;
      routeDecision: AnswerRouteDecision;
      directAnswer: DirectChatAnswer;
    }
  | {
      mode: 'generate';
      question: string;
      language: ChatLanguage;
      routeDecision: AnswerRouteDecision;
      normalizedQuestion: string;
      ragContext: RagChatContext;
      metadata: ChatAnswerMetadata;
    };

export async function prepareChatOrchestration({
  messages,
  preferredLanguage,
  starterQuestionId,
  faqId,
  intentId,
  displayQuestion,
  originalQuickLabel,
  answerVariant,
  renderSpec,
  source,
}: ChatOrchestrationInput): Promise<ChatOrchestration> {
  const question = getLatestUserText(messages);
  const normalizedQuestion = normalizeQuestion(question);
  const language = detectLanguage(question, preferredLanguage);
  const requestContext = {
    triggerId: normalizeOptionalString(starterQuestionId),
    faqId: normalizeOptionalString(faqId),
    intentId: normalizeOptionalString(intentId),
    displayQuestion: normalizeOptionalString(displayQuestion),
    originalQuickLabel: normalizeOptionalString(originalQuickLabel),
    answerVariant: normalizeAnswerVariant(answerVariant),
    renderSpec: normalizeOptionalString(renderSpec),
    source: normalizeOptionalString(source),
  };

  const faqRoute = await routeFaqIntent({
    question,
    language,
    starterQuestionId: requestContext.triggerId,
    source: requestContext.source,
  });

  if (
    faqRoute.routeDecision.mode === 'direct' &&
    faqRoute.answer?.cacheMode === 'direct_cache'
  ) {
    const faqAnswer = faqRoute.answer;
    const confidence = Math.min(
      faqAnswer.confidence,
      faqRoute.intentScore || 1
    );
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: 'faq_cache',
      matchedFaqId: faqAnswer.id,
      matchedEntityIds: faqAnswer.matchedEntityIds,
      sourceChunkIds: faqAnswer.sourceChunkIds,
      confidence,
      routeDecision: buildFaqDirectRouteDecision({
        faqRoute,
        faqAnswer,
        confidence,
      }),
      faqAnswer,
      requestContext,
      faqRoute,
    });

    return {
      mode: 'direct',
      question,
      language,
      routeDecision: metadata.routeDecision,
      directAnswer: {
        answer: getFaqAnswerText(faqAnswer, requestContext.answerVariant),
        metadata,
      },
    };
  }

  const cachedAnswer = normalizedQuestion
    ? await getCachedAnswer({
        normalizedQuestion,
        language,
      }).catch(() => null)
    : null;

  if (cachedAnswer) {
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: 'answer_cache',
      matchedEntityIds: cachedAnswer.matchedEntityIds,
      sourceChunkIds: cachedAnswer.sourceChunkIds,
      confidence: cachedAnswer.confidence,
      provider: cachedAnswer.provider ?? undefined,
      model: cachedAnswer.model ?? undefined,
      routeDecision: {
        mode: 'answer_cache',
        confidence: cachedAnswer.confidence,
        reason: 'fresh_cache_hit',
      },
      faqRoute,
    });

    return {
      mode: 'direct',
      question,
      language,
      routeDecision: metadata.routeDecision,
      directAnswer: {
        answer: cachedAnswer.answer,
        metadata,
      },
    };
  }

  const ragContext = await buildRagChatContext(question, language);

  if (ragContext.metadata.sources.length === 0) {
    const routeDecision: AnswerRouteDecision = {
      mode: 'safe_fallback',
      reason: 'no_public_evidence',
      confidence: 0.25,
    };

    return {
      mode: 'direct',
      question,
      language,
      routeDecision,
      directAnswer: {
        answer: buildNoRagFallbackAnswer(language),
        metadata: buildDirectMetadata({
          language,
          normalizedQuestion,
          answerSource: 'insufficient_evidence',
          matchedEntityIds: [],
          sourceChunkIds: [],
          confidence: 0.25,
          routeDecision,
          requestContext,
          faqRoute,
        }),
      },
    };
  }

  const confidenceSignals = buildAnswerConfidenceSignals({
    sources: ragContext.metadata.sources,
    warnings: ragContext.metadata.warnings,
    intent: getIntentConfidenceSignal(faqRoute),
    usesGroundedSources: true,
  });

  const metadata: ChatAnswerMetadata = {
    ...ragContext.metadata,
    confidence: confidenceSignals.final,
    confidenceSignals,
    language,
    normalizedQuestion,
    answerSource: 'fallback',
    skippedGroq: false,
    sourceChunkIds: ragContext.metadata.sources.map(
      (source) => source.chunk_id
    ),
    faqId: requestContext.faqId ?? undefined,
    intentId: requestContext.intentId ?? undefined,
    originalQuickLabel: requestContext.originalQuickLabel ?? undefined,
    displayQuestion: requestContext.displayQuestion ?? undefined,
    answerVariant: requestContext.answerVariant ?? undefined,
    renderSpecKey: requestContext.renderSpec ?? undefined,
    matchedFaqId: faqRoute.matchedFaqId,
    intentScore: faqRoute.intentScore,
    intentSecondScore: faqRoute.intentSecondScore,
    intentMargin: faqRoute.intentMargin,
    routeDecision: buildRagGenerateRouteDecision({
      question,
      faqRoute,
      ragContext,
      confidence: confidenceSignals.final,
    }),
  };

  return {
    mode: 'generate',
    question,
    language,
    routeDecision: metadata.routeDecision,
    normalizedQuestion,
    ragContext,
    metadata,
  };
}

function buildNoRagFallbackAnswer(language: ChatLanguage) {
  return buildInsufficientEvidenceAnswer(language);
}

function buildFaqDirectRouteDecision({
  faqRoute,
  faqAnswer,
  confidence,
}: {
  faqRoute: FaqIntentRouteResult;
  faqAnswer: FaqAnswer;
  confidence: number;
}): AnswerRouteDecision {
  return {
    mode: 'faq_direct',
    faqId: faqAnswer.id,
    confidence,
    reason: getFaqDirectReason(faqRoute),
  };
}

function getFaqDirectReason(
  faqRoute: FaqIntentRouteResult
): Extract<AnswerRouteDecision, { mode: 'faq_direct' }>['reason'] {
  if (faqRoute.routeDecision.router === 'quick_question') {
    return 'verified_quick_question';
  }

  if (faqRoute.routeDecision.router === 'token_fallback') {
    return 'legacy_exact_match';
  }

  return 'high_semantic_match';
}

function buildRagGenerateRouteDecision({
  question,
  faqRoute,
  ragContext,
  confidence,
}: {
  question: string;
  faqRoute: FaqIntentRouteResult;
  ragContext: RagChatContext;
  confidence: number;
}): AnswerRouteDecision {
  const isMediumIntentMatch = faqRoute.routeDecision.mode === 'rewrite';
  const expectedEntityIds =
    isMediumIntentMatch && faqRoute.answer
      ? faqRoute.answer.matchedEntityIds
      : ragContext.metadata.matchedEntityIds;

  return {
    mode: 'rag_generate',
    query: question,
    expectedEntityIds,
    confidence,
    reason: isMediumIntentMatch
      ? 'medium_intent_match'
      : faqRoute.matchedFaqId
        ? 'no_direct_faq'
        : 'custom_question',
  };
}

function buildDirectMetadata({
  language,
  normalizedQuestion,
  answerSource,
  matchedFaqId,
  matchedEntityIds,
  sourceChunkIds,
  confidence,
  routeDecision,
  provider,
  model,
  faqAnswer,
  requestContext,
  faqRoute,
}: {
  language: ChatLanguage;
  normalizedQuestion: string;
  answerSource: ChatAnswerMetadata['answerSource'];
  matchedFaqId?: string;
  matchedEntityIds: string[];
  sourceChunkIds: string[];
  confidence: number;
  routeDecision: AnswerRouteDecision;
  provider?: string;
  model?: string;
  faqAnswer?: FaqAnswer;
  faqRoute?: FaqIntentRouteResult;
  requestContext?: {
    faqId: string | null;
    triggerId: string | null;
    intentId: string | null;
    displayQuestion: string | null;
    originalQuickLabel: string | null;
    answerVariant: AnswerVariant | null;
    renderSpec: string | null;
    source: string | null;
  };
}): ChatAnswerMetadata {
  const mediaCounts = countMediaRefs(faqAnswer?.mediaRefs);
  const usedVisualBlocks = faqAnswer?.visualBlocks?.map((block) => block.type);
  const resolvedMatchedFaqId = matchedFaqId ?? faqRoute?.matchedFaqId;
  const sources = sourceChunkIds.map((chunkId) => ({
    chunk_id: chunkId,
    entity_id: matchedEntityIds[0] ?? null,
    title: toSourceTitle(answerSource),
    section_path: [toSourceTitle(answerSource)],
    score: confidence * 100,
    visibility: 'public',
    freshness: 'current',
    has_todo: faqAnswer?.hasTodo ?? false,
  }));
  const warnings = faqAnswer?.hasTodo ? [getTodoWarning(language)] : [];
  const confidenceSignals = buildAnswerConfidenceSignals({
    sources,
    warnings,
    intent: getIntentConfidenceSignal(faqRoute, confidence),
    usesGroundedSources:
      answerSource !== 'insufficient_evidence' && sourceChunkIds.length > 0,
  });

  return {
    sources,
    confidence: confidenceSignals.final,
    confidenceSignals,
    matchedEntityIds,
    hasTodoEvidence: faqAnswer?.hasTodo ?? false,
    warnings,
    language,
    answerSource,
    matchedFaqId: resolvedMatchedFaqId,
    faqId: faqAnswer?.id ?? resolvedMatchedFaqId,
    triggerId: requestContext?.triggerId ?? undefined,
    intentId: getResolvedIntentId({
      requestIntentId: requestContext?.intentId,
      requestFaqId: faqAnswer?.id ?? resolvedMatchedFaqId,
      faqAnswer,
      matchedFaqId: resolvedMatchedFaqId,
    }),
    quickLabel: faqAnswer?.quickLabel,
    originalQuickLabel:
      requestContext?.originalQuickLabel ?? faqAnswer?.quickLabel,
    displayQuestion:
      requestContext?.displayQuestion ?? faqAnswer?.displayQuestion,
    answerVariant: requestContext?.answerVariant ?? 'default',
    badge: getAnswerSourceBadge(answerSource, language),
    todoBadge: faqAnswer?.hasTodo ? getTodoBadge(language) : undefined,
    cacheMode: faqAnswer?.cacheMode,
    renderSpec: faqAnswer?.renderSpec,
    renderSpecKey:
      requestContext?.renderSpec ?? faqAnswer?.renderSpec?.leadVisual,
    richAnswerData: faqAnswer
      ? {
          faqId: faqAnswer.id,
          renderSpec: requestContext?.renderSpec,
          visualBlocks: faqAnswer.visualBlocks,
          mediaRefs: faqAnswer.mediaRefs,
          sourceChunkIds: faqAnswer.sourceChunkIds,
        }
      : undefined,
    visualBlocks: faqAnswer?.visualBlocks,
    mediaRefs: faqAnswer?.mediaRefs,
    answerParts: faqAnswer
      ? buildAnswerParts(faqAnswer, requestContext?.answerVariant ?? 'default')
      : undefined,
    usedVisualBlocks,
    mediaReadyCount: mediaCounts.ready,
    mediaTodoCount: mediaCounts.todo,
    intentScore: faqRoute?.intentScore,
    intentSecondScore: faqRoute?.intentSecondScore,
    intentMargin: faqRoute?.intentMargin,
    routeDecision,
    normalizedQuestion,
    skippedGroq: true,
    provider,
    model,
    sourceChunkIds,
  };
}

function getIntentConfidenceSignal(
  faqRoute: FaqIntentRouteResult | undefined,
  fallback = 0.5
) {
  const intentScore = faqRoute?.intentScore;
  return typeof intentScore === 'number' &&
    Number.isFinite(intentScore) &&
    intentScore > 0
    ? intentScore
    : fallback;
}

function toSourceTitle(answerSource: ChatAnswerMetadata['answerSource']) {
  if (answerSource === 'faq_cache') return 'Oosu Wiki';
  if (answerSource === 'faq_rewrite') return 'Portfolio answer';
  if (answerSource === 'answer_cache') return 'Portfolio answer cache';
  if (answerSource === 'deterministic_rule') return 'Portfolio policy';
  if (answerSource === 'rag_generation') return 'Portfolio data';
  if (answerSource === 'insufficient_evidence') return 'Insufficient evidence';
  return 'Oosu portfolio data';
}

function getAnswerSourceBadge(
  answerSource: ChatAnswerMetadata['answerSource'],
  language: ChatLanguage
) {
  const labels: Record<string, Record<ChatLanguage, string>> = {
    faq_cache: {
      ko: 'Oosu Wiki 기반',
      en: 'From Oosu Wiki',
    },
    faq_rewrite: {
      ko: '포트폴리오 답변',
      en: 'Portfolio answer',
    },
    rag_generation: {
      ko: '포트폴리오 데이터 기반',
      en: 'Based on portfolio data',
    },
    fallback: {
      ko: '기본 포트폴리오 답변',
      en: 'Basic portfolio answer',
    },
    insufficient_evidence: {
      ko: '근거 부족',
      en: 'Insufficient evidence',
    },
  };

  return labels[answerSource]?.[language];
}

function getTodoBadge(language: ChatLanguage) {
  return language === 'ko' ? '일부 정보 정리 중' : 'Needs confirmation';
}

function getTodoWarning(language: ChatLanguage) {
  return language === 'ko'
    ? '일부 정보가 정리 중입니다.'
    : 'Some information still needs confirmation.';
}

function countMediaRefs(mediaRefs: FaqAnswer['mediaRefs']) {
  return {
    ready: mediaRefs?.filter((media) => media.status === 'ready').length ?? 0,
    todo: mediaRefs?.filter((media) => media.status === 'todo').length ?? 0,
  };
}

function getResolvedIntentId({
  requestIntentId,
  requestFaqId,
  faqAnswer,
  matchedFaqId,
}: {
  requestIntentId?: string | null;
  requestFaqId?: string | null;
  faqAnswer?: FaqAnswer;
  matchedFaqId?: string;
}) {
  if (
    requestIntentId &&
    requestIntentId !== requestFaqId &&
    requestIntentId !== matchedFaqId &&
    requestIntentId !== faqAnswer?.id &&
    !faqAnswer?.legacyIds?.includes(requestIntentId)
  ) {
    return requestIntentId;
  }

  return faqAnswer?.intentId ?? matchedFaqId ?? undefined;
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function normalizeAnswerVariant(value: string | null | undefined) {
  if (value === 'short' || value === 'default' || value === 'detailed') {
    return value as AnswerVariant;
  }

  return null;
}

function getFaqAnswerText(faqAnswer: FaqAnswer, variant: AnswerVariant | null) {
  if (variant === 'short') return faqAnswer.shortAnswer;
  if (variant === 'detailed') {
    return faqAnswer.detailedAnswer ?? faqAnswer.defaultAnswer;
  }

  return faqAnswer.defaultAnswer;
}

export function getLatestUserText(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');

  return (
    latestUserMessage?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n') ?? ''
  );
}
