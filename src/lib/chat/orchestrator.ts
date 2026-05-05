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
import {
  buildConversationIntentAnswer,
  classifyConversationIntent,
  getConversationEntityHints,
  shouldAnswerIntentDirectly,
  shouldBypassAnswerCache,
  shouldBypassFaqDirectAnswer,
  shouldFallbackWhenNoEvidence,
  type ConversationIntentResult,
} from './conversation-intent';
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
  requestId?: string | null;
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

type RequestContext = {
  requestId: string | null;
  triggerId: string | null;
  faqId: string | null;
  intentId: string | null;
  displayQuestion: string | null;
  originalQuickLabel: string | null;
  answerVariant: AnswerVariant | null;
  renderSpec: string | null;
  source: string | null;
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
  requestId,
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
    requestId: normalizeOptionalString(requestId),
    triggerId: normalizeOptionalString(starterQuestionId),
    faqId: normalizeOptionalString(faqId),
    intentId: normalizeOptionalString(intentId),
    displayQuestion: normalizeOptionalString(displayQuestion),
    originalQuickLabel: normalizeOptionalString(originalQuickLabel),
    answerVariant: normalizeAnswerVariant(answerVariant),
    renderSpec: normalizeOptionalString(renderSpec),
    source: normalizeOptionalString(source),
  };
  const conversationIntent = classifyConversationIntent({
    question,
    messages,
  });
  const shouldBypassIntentDirectAnswer =
    requestContext.source === 'quick_question' && Boolean(requestContext.triggerId);

  if (
    !shouldBypassIntentDirectAnswer &&
    (shouldAnswerIntentDirectly(conversationIntent.intent) ||
      conversationIntent.reason === 'follow_up_without_context')
  ) {
    return buildConversationDirectOrchestration({
      question,
      language,
      normalizedQuestion,
      conversationIntent,
      requestContext,
    });
  }

  const faqRoute = await routeFaqIntent({
    question,
    language,
    starterQuestionId: requestContext.triggerId,
    source: requestContext.source,
  });

  if (
    faqRoute.routeDecision.mode === 'direct' &&
    faqRoute.answer?.cacheMode === 'direct_cache' &&
    !shouldBypassFaqDirectAnswer(conversationIntent)
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
      conversationIntent,
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

  const cachedAnswer = !shouldBypassAnswerCache(conversationIntent) && normalizedQuestion
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
      conversationIntent,
      requestContext,
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
  const conversationEntityHints = getConversationEntityHints(question);

  if (
    ragContext.metadata.sources.length === 0 &&
    shouldFallbackWhenNoEvidence(conversationIntent)
  ) {
    const routeDecision: AnswerRouteDecision = {
      mode: 'safe_fallback',
      reason: 'no_public_evidence',
      confidence: 0.25,
    };
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: 'insufficient_evidence',
      matchedEntityIds: [],
      sourceChunkIds: [],
      confidence: 0.25,
      routeDecision,
      conversationIntent,
      showEvidence: false,
      requestContext,
      faqRoute,
    });

    return {
      mode: 'direct',
      question,
      language,
      routeDecision,
      directAnswer: {
        answer: buildInsufficientEvidenceAnswer(language),
        metadata,
      },
    };
  }

  const confidenceSignals = buildAnswerConfidenceSignals({
    sources: ragContext.metadata.sources,
    warnings: ragContext.metadata.warnings,
    intent: getIntentConfidenceSignal(faqRoute),
    usesGroundedSources: ragContext.metadata.sources.length > 0,
  });

  const metadata: ChatAnswerMetadata = {
    ...ragContext.metadata,
    matchedEntityIds: uniqueValues([
      ...ragContext.metadata.matchedEntityIds,
      ...conversationEntityHints,
    ]),
    confidence: confidenceSignals.final,
    confidenceSignals,
    language,
    normalizedQuestion,
    answerSource: 'fallback',
    conversationIntent: conversationIntent.intent,
    conversationModifiers: conversationIntent.modifiers,
    showEvidence: ragContext.metadata.sources.length > 0,
    skippedGroq: false,
    sourceChunkIds: ragContext.metadata.sources.map(
      (source) => source.chunk_id
    ),
    requestId: requestContext.requestId ?? undefined,
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
      entityHints: conversationEntityHints,
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

function buildConversationDirectOrchestration({
  question,
  language,
  normalizedQuestion,
  conversationIntent,
  requestContext,
}: {
  question: string;
  language: ChatLanguage;
  normalizedQuestion: string;
  conversationIntent: ConversationIntentResult;
  requestContext: RequestContext;
}): Extract<ChatOrchestration, { mode: 'direct' }> {
  const routeDecision = buildConversationRouteDecision(conversationIntent);
  const metadata = buildDirectMetadata({
    language,
    normalizedQuestion,
    answerSource: getConversationAnswerSource(conversationIntent),
    matchedEntityIds: [],
    sourceChunkIds: [],
    confidence: routeDecision.confidence,
    routeDecision,
    conversationIntent,
    showEvidence: false,
    requestContext,
  });

  return {
    mode: 'direct',
    question,
    language,
    routeDecision,
    directAnswer: {
      answer: buildConversationIntentAnswer({
        intent:
          conversationIntent.reason === 'follow_up_without_context'
            ? 'portfolio_ambiguous'
            : conversationIntent.intent,
        language,
        question,
      }),
      metadata,
    },
  };
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

function buildConversationRouteDecision({
  intent,
  reason,
}: ConversationIntentResult): AnswerRouteDecision {
  if (intent === 'greeting_smalltalk') {
    return {
      mode: 'smalltalk',
      reason: 'greeting_or_light_smalltalk',
      confidence: 0.35,
    };
  }

  if (intent === 'portfolio_ambiguous' || reason === 'follow_up_without_context') {
    return {
      mode: 'portfolio_clarify',
      reason:
        reason === 'follow_up_without_context'
          ? 'follow_up_without_context'
          : 'short_or_ambiguous_portfolio_input',
      confidence: 0.35,
    };
  }

  if (intent === 'private_or_unsafe') {
    return {
      mode: 'private_guardrail',
      reason: 'private_or_sensitive_request',
      confidence: 0.2,
    };
  }

  if (intent === 'prompt_attack') {
    return {
      mode: 'prompt_guardrail',
      reason: 'prompt_or_internal_request',
      confidence: 0.2,
    };
  }

  return {
    mode: 'off_topic_redirect',
    reason:
      intent === 'hostile_feedback'
        ? 'hostile_or_sharp_feedback'
        : intent === 'playful_probe'
          ? 'playful_probe'
          : reason === 'no_portfolio_intent_detected'
            ? 'no_portfolio_intent_detected'
            : 'off_topic_light',
    confidence: 0.3,
  };
}

function getConversationAnswerSource({
  intent,
  reason,
}: ConversationIntentResult): ChatAnswerMetadata['answerSource'] {
  if (intent === 'greeting_smalltalk') return 'smalltalk';
  if (intent === 'portfolio_ambiguous' || reason === 'follow_up_without_context') {
    return 'clarify';
  }
  if (intent === 'private_or_unsafe') return 'private_guardrail';
  if (intent === 'prompt_attack') return 'prompt_guardrail';
  return 'off_topic_redirect';
}

function buildRagGenerateRouteDecision({
  question,
  faqRoute,
  ragContext,
  confidence,
  entityHints,
}: {
  question: string;
  faqRoute: FaqIntentRouteResult;
  ragContext: RagChatContext;
  confidence: number;
  entityHints: string[];
}): AnswerRouteDecision {
  const isMediumIntentMatch = faqRoute.routeDecision.mode === 'rewrite';
  const expectedEntityIds =
    isMediumIntentMatch && faqRoute.answer
      ? faqRoute.answer.matchedEntityIds
      : uniqueValues([...ragContext.metadata.matchedEntityIds, ...entityHints]);

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
  conversationIntent,
  showEvidence,
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
  requestContext?: RequestContext;
  conversationIntent?: ConversationIntentResult;
  showEvidence?: boolean;
}): ChatAnswerMetadata {
  const mediaCounts = countMediaRefs(faqAnswer?.mediaRefs);
  const usedVisualBlocks = faqAnswer?.visualBlocks?.map((block) => block.type);
  const resolvedMatchedFaqId = matchedFaqId ?? faqRoute?.matchedFaqId;
  const shouldShowEvidence = showEvidence ?? sourceChunkIds.length > 0;
  const sources = shouldShowEvidence
    ? sourceChunkIds.map((chunkId) => ({
        chunk_id: chunkId,
        entity_id: matchedEntityIds[0] ?? null,
        title: toSourceTitle(answerSource),
        section_path: [toSourceTitle(answerSource)],
        score: confidence * 100,
        visibility: 'public',
        freshness: 'current',
        has_todo: faqAnswer?.hasTodo ?? false,
      }))
    : [];
  const warnings = faqAnswer?.hasTodo ? [getTodoWarning(language)] : [];
  const confidenceSignals = buildAnswerConfidenceSignals({
    sources,
    warnings,
    intent: getIntentConfidenceSignal(faqRoute, confidence),
    usesGroundedSources:
      shouldShowEvidence &&
      answerSource !== 'insufficient_evidence' &&
      sourceChunkIds.length > 0,
  });

  return {
    sources,
    confidence: confidenceSignals.final,
    confidenceSignals,
    matchedEntityIds,
    hasTodoEvidence: faqAnswer?.hasTodo ?? false,
    warnings,
    requestId: requestContext?.requestId ?? undefined,
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
    conversationIntent: conversationIntent?.intent,
    conversationModifiers: conversationIntent?.modifiers,
    showEvidence: shouldShowEvidence,
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

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toSourceTitle(answerSource: ChatAnswerMetadata['answerSource']) {
  if (answerSource === 'faq_cache') return 'Oosu Wiki';
  if (answerSource === 'faq_rewrite') return 'Portfolio answer';
  if (answerSource === 'answer_cache') return 'Portfolio answer cache';
  if (answerSource === 'deterministic_rule') return 'Portfolio policy';
  if (answerSource === 'smalltalk') return 'Small talk';
  if (answerSource === 'off_topic_redirect') return 'Portfolio redirect';
  if (answerSource === 'clarify') return 'Portfolio clarification';
  if (answerSource === 'private_guardrail') return 'Public safety policy';
  if (answerSource === 'prompt_guardrail') return 'Prompt safety policy';
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
    smalltalk: {
      ko: '가벼운 대화',
      en: 'Small talk',
    },
    off_topic_redirect: {
      ko: '포트폴리오 안내',
      en: 'Portfolio redirect',
    },
    clarify: {
      ko: '질문 확인',
      en: 'Clarifying question',
    },
    private_guardrail: {
      ko: '공개 불가 안내',
      en: 'Public safety notice',
    },
    prompt_guardrail: {
      ko: '내부 정보 보호 안내',
      en: 'Internal safety notice',
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
