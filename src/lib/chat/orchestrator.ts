import type { UIMessage } from 'ai';
import {
  getContextualQuote,
  type ContextualQuoteCategory,
} from '@/data/contextual-quotes';
import { detectLanguage, type ChatLanguage } from '@/lib/i18n/detect-language';
import {
  buildAnswerConfidenceSignals,
  buildRagChatContext,
  type RagChatContext,
} from '@/lib/rag/chat-context';
import {
  buildAnswerParts,
  findFaqAnswerById,
  type FaqAnswer,
} from '@/lib/faq/answers';
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
import { interpretAmbiguousPortfolioIntent } from './intent-interpreter';
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

type FaqEvidenceFallback = {
  primaryFaqId: string;
  sourceChunkIds: string[];
  matchedEntityIds: string[];
  confidence: number;
};

const MAX_FAQ_EVIDENCE_FALLBACK_SOURCES = 8;

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
  if (
    !requestContext.answerVariant &&
    shouldUseDetailedVariantForFollowUp(question, conversationIntent)
  ) {
    requestContext.answerVariant = 'detailed';
  }
  const shouldBypassIntentDirectAnswer =
    requestContext.source === 'quick_question' &&
    Boolean(requestContext.triggerId);
  const repeatedQuestion = getRepeatedQuestionSignal({
    messages,
    normalizedQuestion,
    requestContext,
  });
  const collaborationFollowUpClarifier = buildCollaborationFollowUpClarifier({
    question,
    messages,
    language,
    normalizedQuestion,
    conversationIntent,
    requestContext,
  });

  if (collaborationFollowUpClarifier) {
    return collaborationFollowUpClarifier;
  }

  if (repeatedQuestion) {
    return buildRepeatedQuestionOrchestration({
      question,
      language,
      normalizedQuestion,
      requestContext,
      repeatedQuestion,
    });
  }

  const aiIntentInterpretation = await interpretAmbiguousPortfolioIntent({
    question,
    messages,
    language,
    ruleIntent: conversationIntent,
    source: requestContext.source,
  });
  const effectiveConversationIntent: ConversationIntentResult =
    aiIntentInterpretation
      ? {
          intent: 'portfolio_factual',
          reason: `ai_intent_${aiIntentInterpretation.reason}`,
          modifiers: conversationIntent.modifiers,
        }
      : conversationIntent;
  const routingQuestion =
    aiIntentInterpretation?.rewrittenQuestion?.trim() || question;

  if (
    !shouldBypassIntentDirectAnswer &&
    !aiIntentInterpretation &&
    (shouldAnswerIntentDirectly(effectiveConversationIntent.intent) ||
      effectiveConversationIntent.reason === 'follow_up_without_context')
  ) {
    return buildConversationDirectOrchestration({
      question,
      language,
      normalizedQuestion,
      conversationIntent: effectiveConversationIntent,
      requestContext,
      messages,
    });
  }

  const intentStarterQuestionId = getStarterQuestionIdForConversationIntent(
    effectiveConversationIntent,
    messages
  );
  const faqRoute = await routeFaqIntent({
    question: routingQuestion,
    language,
    starterQuestionId:
      requestContext.triggerId ??
      aiIntentInterpretation?.starterQuestionId ??
      intentStarterQuestionId,
    source:
      requestContext.triggerId && requestContext.source
        ? requestContext.source
        : aiIntentInterpretation?.starterQuestionId || intentStarterQuestionId
          ? 'quick_question'
          : requestContext.source,
  });

  if (
    faqRoute.routeDecision.mode === 'direct' &&
    faqRoute.answer?.cacheMode === 'direct_cache' &&
    !shouldBypassCurrentFaqDirectAnswer({
      faqRoute,
      conversationIntent: effectiveConversationIntent,
    })
  ) {
    const faqAnswer = faqRoute.answer;
    const effectiveAnswerVariant = getEffectiveAnswerVariant({
      question,
      messages,
      faqAnswer,
      requestContext,
    });
    const effectiveRequestContext = {
      ...requestContext,
      answerVariant: effectiveAnswerVariant,
    };
    const confidence = Math.min(
      faqAnswer.confidence,
      faqRoute.intentScore || 1
    );
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: faqAnswer.answerSource,
      matchedFaqId: faqAnswer.id,
      matchedEntityIds: faqAnswer.matchedEntityIds,
      sourceChunkIds: faqAnswer.sourceChunkIds,
      confidence,
      routeDecision: buildFaqDirectRouteDecision({
        faqRoute,
        faqAnswer,
        confidence,
      }),
      conversationIntent: effectiveConversationIntent,
      faqAnswer,
      requestContext: effectiveRequestContext,
      faqRoute,
    });

    const answerText = getFaqAnswerText(faqAnswer, effectiveAnswerVariant);
    const answerWithConversationContext = prefixRepeatedConcernAnswer({
      answer: answerText,
      messages,
      faqAnswer,
      language,
    });

    return {
      mode: 'direct',
      question,
      language,
      routeDecision: metadata.routeDecision,
      directAnswer: {
        answer: appendFaqContextualQuote({
          answer: answerWithConversationContext,
          faqAnswer,
          question,
          language,
          messages,
        }),
        metadata,
      },
    };
  }

  const cachedAnswer =
    !shouldBypassAnswerCache(effectiveConversationIntent) && normalizedQuestion
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
      conversationIntent: effectiveConversationIntent,
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

  const ragContext = await buildRagChatContext(routingQuestion, language);
  const conversationEntityHints = getConversationEntityHints(routingQuestion);
  const faqEvidenceFallback = getFaqEvidenceFallback({
    faqRoute,
    conversationIntent: effectiveConversationIntent,
    question: routingQuestion,
    language,
    hasRagSources: ragContext.metadata.sources.length > 0,
  });
  const effectiveSources =
    ragContext.metadata.sources.length > 0
      ? ragContext.metadata.sources
      : buildFaqEvidenceFallbackSources(faqEvidenceFallback);
  const effectiveWarnings =
    effectiveSources.length > 0 && ragContext.metadata.sources.length === 0
      ? []
      : ragContext.metadata.warnings;

  if (
    effectiveSources.length === 0 &&
    shouldFallbackWhenNoEvidence(effectiveConversationIntent)
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
      conversationIntent: effectiveConversationIntent,
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
    sources: effectiveSources,
    warnings: effectiveWarnings,
    intent:
      faqEvidenceFallback?.confidence ?? getIntentConfidenceSignal(faqRoute),
    usesGroundedSources: effectiveSources.length > 0,
  });

  const metadata: ChatAnswerMetadata = {
    ...ragContext.metadata,
    sources: effectiveSources,
    warnings: effectiveWarnings,
    matchedEntityIds: uniqueValues([
      ...ragContext.metadata.matchedEntityIds,
      ...conversationEntityHints,
      ...(faqEvidenceFallback?.matchedEntityIds ?? []),
    ]),
    confidence: confidenceSignals.final,
    confidenceSignals,
    language,
    normalizedQuestion,
    answerSource: 'fallback',
    conversationIntent: effectiveConversationIntent.intent,
    conversationModifiers: effectiveConversationIntent.modifiers,
    showEvidence: effectiveSources.length > 0,
    skippedGroq: false,
    sourceChunkIds: effectiveSources.map((source) => source.chunk_id),
    requestId: requestContext.requestId ?? undefined,
    faqId: requestContext.faqId ?? undefined,
    intentId: requestContext.intentId ?? undefined,
    originalQuickLabel: requestContext.originalQuickLabel ?? undefined,
    displayQuestion: requestContext.displayQuestion ?? undefined,
    answerVariant: requestContext.answerVariant ?? undefined,
    renderSpecKey: requestContext.renderSpec ?? undefined,
    matchedFaqId: faqRoute.matchedFaqId ?? faqEvidenceFallback?.primaryFaqId,
    intentScore: faqRoute.intentScore,
    intentSecondScore: faqRoute.intentSecondScore,
    intentMargin: faqRoute.intentMargin,
    routeDecision: buildRagGenerateRouteDecision({
      question: routingQuestion,
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

function getFaqEvidenceFallback({
  faqRoute,
  conversationIntent,
  question,
  language,
  hasRagSources,
}: {
  faqRoute: FaqIntentRouteResult;
  conversationIntent: ConversationIntentResult;
  question: string;
  language: ChatLanguage;
  hasRagSources: boolean;
}): FaqEvidenceFallback | null {
  if (hasRagSources) return null;
  if (
    conversationIntent.intent !== 'recruiter_evaluation' &&
    conversationIntent.intent !== 'portfolio_factual'
  ) {
    return null;
  }

  const candidateAnswers = getFaqEvidenceCandidateAnswers({
    faqRoute,
    question,
    language,
  });
  if (candidateAnswers.length === 0) return null;

  const sourceChunkIds = uniqueValues(
    candidateAnswers.flatMap((answer) => answer.sourceChunkIds)
  ).slice(0, MAX_FAQ_EVIDENCE_FALLBACK_SOURCES);
  if (sourceChunkIds.length === 0) return null;

  return {
    primaryFaqId: candidateAnswers[0].id,
    sourceChunkIds,
    matchedEntityIds: uniqueValues(
      candidateAnswers.flatMap((answer) => answer.matchedEntityIds)
    ),
    confidence: Math.max(...candidateAnswers.map((answer) => answer.confidence)),
  };
}

function getFaqEvidenceCandidateAnswers({
  faqRoute,
  question,
  language,
}: {
  faqRoute: FaqIntentRouteResult;
  question: string;
  language: ChatLanguage;
}) {
  const candidateIds = getAdaptationEvidenceFaqIds(question);
  const faqRouteAnswer = faqRoute.answer;
  const answers = [
    ...candidateIds
      .map((id) => findFaqAnswerById(id, language))
      .filter((answer): answer is FaqAnswer => Boolean(answer)),
    ...(faqRouteAnswer ? [faqRouteAnswer] : []),
  ];

  return uniqueFaqAnswers(answers).filter(
    (answer) => answer.sourceChunkIds.length > 0
  );
}

function getAdaptationEvidenceFaqIds(question: string) {
  if (
    /(신입|주니어|입사|회사|팀|조직|온보딩|적응|합류|첫\s*(달|30일|90일)|new\s+hire|junior|onboard|adapt|first\s+(30|90)\s+days|fit\s+into\s+(the\s+)?team)/i.test(
      question
    )
  ) {
    return [
      'faq.recruiter.first_30_days.default',
      'faq.recruiter.onboarding_questions.default',
      'faq.recruiter.collaboration_experience.default',
      'faq.recruiter.age_career_timing.default',
    ];
  }

  return [];
}

function uniqueFaqAnswers(answers: FaqAnswer[]) {
  const seen = new Set<string>();
  return answers.filter((answer) => {
    if (seen.has(`${answer.language}:${answer.id}`)) return false;
    seen.add(`${answer.language}:${answer.id}`);
    return true;
  });
}

function buildFaqEvidenceFallbackSources(
  fallback: FaqEvidenceFallback | null
): RagChatContext['metadata']['sources'] {
  if (!fallback) return [];

  return fallback.sourceChunkIds.map((chunkId) => ({
    chunk_id: chunkId,
    entity_id: fallback.matchedEntityIds[0] ?? null,
    title: 'Oosu Wiki',
    section_path: ['Oosu Wiki'],
    score: fallback.confidence * 100,
    visibility: 'public',
    freshness: 'current',
    has_todo: false,
  }));
}

function shouldBypassCurrentFaqDirectAnswer({
  faqRoute,
  conversationIntent,
}: {
  faqRoute: FaqIntentRouteResult;
  conversationIntent: ConversationIntentResult;
}) {
  if (!shouldBypassFaqDirectAnswer(conversationIntent)) return false;

  return faqRoute.routeDecision.router !== 'quick_question';
}

type RepeatedQuestionSignal = {
  kind: 'quick_question' | 'same_question';
  count: number;
  label: string | null;
};

function getRepeatedQuestionSignal({
  messages,
  normalizedQuestion,
  requestContext,
}: {
  messages: UIMessage[];
  normalizedQuestion: string;
  requestContext: RequestContext;
}): RepeatedQuestionSignal | null {
  const previousUserMessages = getPreviousUserMessages(messages);
  if (previousUserMessages.length === 0) return null;

  const label =
    requestContext.originalQuickLabel ??
    requestContext.displayQuestion ??
    requestContext.triggerId;

  if (requestContext.source === 'quick_question' && requestContext.triggerId) {
    const sameQuickQuestionCount = previousUserMessages.filter((message) =>
      hasMatchingQuestionText(message, [
        requestContext.displayQuestion,
        requestContext.originalQuickLabel,
      ])
    ).length;

    if (sameQuickQuestionCount > 0) {
      return {
        kind: 'quick_question',
        count: sameQuickQuestionCount,
        label,
      };
    }
  }

  if (!normalizedQuestion) return null;

  const sameQuestionCount = previousUserMessages.filter(
    (message) => normalizeQuestion(getMessageText(message)) === normalizedQuestion
  ).length;

  if (sameQuestionCount === 0) return null;

  return {
    kind: 'same_question',
    count: sameQuestionCount,
    label,
  };
}

function getPreviousUserMessages(messages: UIMessage[]) {
  const latestUserIndex = messages.findLastIndex(
    (message) => message.role === 'user'
  );
  if (latestUserIndex <= 0) return [];

  return messages
    .slice(0, latestUserIndex)
    .filter((message) => message.role === 'user');
}

function getPreviousAssistantMessages(messages: UIMessage[]) {
  const latestUserIndex = messages.findLastIndex(
    (message) => message.role === 'user'
  );
  const endIndex = latestUserIndex >= 0 ? latestUserIndex : messages.length;
  if (endIndex <= 0) return [];

  return messages
    .slice(0, endIndex)
    .filter((message) => message.role === 'assistant');
}

function hasMatchingQuestionText(
  message: UIMessage,
  candidateTexts: Array<string | null>
) {
  const normalizedMessage = normalizeQuestion(getMessageText(message));
  return candidateTexts.some((text) => {
    if (!text) return false;
    return normalizeQuestion(text) === normalizedMessage;
  });
}

function buildRepeatedQuestionOrchestration({
  question,
  language,
  normalizedQuestion,
  requestContext,
  repeatedQuestion,
}: {
  question: string;
  language: ChatLanguage;
  normalizedQuestion: string;
  requestContext: RequestContext;
  repeatedQuestion: RepeatedQuestionSignal;
}): Extract<ChatOrchestration, { mode: 'direct' }> {
  const routeDecision: AnswerRouteDecision = {
    mode: 'portfolio_clarify',
    confidence: 0.9,
    reason: 'follow_up_without_context',
  };
  const metadata = buildDirectMetadata({
    language,
    normalizedQuestion,
    answerSource: 'clarify',
    matchedEntityIds: [],
    sourceChunkIds: [],
    confidence: 0.9,
    routeDecision,
    showEvidence: false,
    requestContext: {
      ...requestContext,
      answerVariant: 'short',
      renderSpec: null,
    },
  });

  return {
    mode: 'direct',
    question,
    language,
    routeDecision,
    directAnswer: {
      answer: buildRepeatedQuestionAnswer({
        language,
        repeatedQuestion,
      }),
      metadata,
    },
  };
}

function buildRepeatedQuestionAnswer({
  language,
  repeatedQuestion,
}: {
  language: ChatLanguage;
  repeatedQuestion: RepeatedQuestionSignal;
}) {
  const label =
    repeatedQuestion.label && repeatedQuestion.label.length <= 30
      ? ` "${repeatedQuestion.label}"`
      : '';

  if (language === 'ko') {
    return `이 대화 안에서는${label} 질문을 이미 다뤘어요. 같은 카드를 다시 반복하기보다, 이번엔 다른 각도로 이어가볼게요.\n\n더 자연스럽게 보려면 이렇게 물어보면 좋아요:\n- 이 내용을 프로젝트 사례와 연결해서 설명해줘\n- 기술 스택 근거 중심으로 다시 정리해줘\n- 채용/협업 관점에서 더 날카롭게 말해줘`;
  }

  return `We already covered${label} in this conversation, so I will avoid repeating the same card again.\n\nA better next angle would be:\n- connect this to project examples\n- reframe it around technical evidence\n- make it sharper for hiring or collaboration context`;
}

function buildConversationDirectOrchestration({
  question,
  language,
  normalizedQuestion,
  conversationIntent,
  requestContext,
  messages,
}: {
  question: string;
  language: ChatLanguage;
  normalizedQuestion: string;
  conversationIntent: ConversationIntentResult;
  requestContext: RequestContext;
  messages: UIMessage[];
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
        avoidText: messages
          .filter((message) => message.role === 'assistant')
          .map(getMessageText)
          .join('\n'),
      }),
      metadata,
    },
  };
}

function getStarterQuestionIdForConversationIntent(
  { intent, reason }: ConversationIntentResult,
  messages: UIMessage[]
) {
  if (reason === 'broad_project_request') return 'home.projects.top3';
  if (reason === 'broad_skill_request') return 'home.skills.level';
  if (reason === 'ai_usage_request') return 'home.ai.workflow';
  if (reason === 'collaboration_request') return 'home.contact';
  if (reason === 'follow_up_with_conversation_context') {
    return getStarterQuestionIdFromRecentConversation(messages);
  }
  if (reason === 'public_life_notes_request') return 'fun.public_notes';
  if (reason === 'site_purpose_request') return 'project.askoosu.overview';
  if (reason === 'profile_intro_request') return 'home.profile.intro';
  if (intent === 'contact_or_link_request') return 'home.contact';

  return null;
}

function buildCollaborationFollowUpClarifier({
  question,
  messages,
  language,
  normalizedQuestion,
  conversationIntent,
  requestContext,
}: {
  question: string;
  messages: UIMessage[];
  language: ChatLanguage;
  normalizedQuestion: string;
  conversationIntent: ConversationIntentResult;
  requestContext: RequestContext;
}): Extract<ChatOrchestration, { mode: 'direct' }> | null {
  if (
    !isShortCollaborationQuestion(question) ||
    !hasRecentCollaborationBrief(messages)
  ) {
    return null;
  }

  const routeDecision: AnswerRouteDecision = {
    mode: 'portfolio_clarify',
    reason: 'short_or_ambiguous_portfolio_input',
    confidence: 0.55,
  };
  const metadata = buildDirectMetadata({
    language,
    normalizedQuestion,
    answerSource: 'clarify',
    matchedEntityIds: ['contact', 'collaboration'],
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
      answer: getCollaborationFollowUpClarifier(language),
      metadata,
    },
  };
}

function shouldUseDetailedVariantForFollowUp(
  question: string,
  { reason }: ConversationIntentResult
) {
  return (
    reason === 'follow_up_with_conversation_context' &&
    isDetailRequest(question)
  );
}

function getEffectiveAnswerVariant({
  question,
  messages,
  faqAnswer,
  requestContext,
}: {
  question: string;
  messages: UIMessage[];
  faqAnswer: FaqAnswer;
  requestContext: RequestContext;
}): AnswerVariant | null {
  if (requestContext.answerVariant) return requestContext.answerVariant;
  if (!faqAnswer.detailedAnswer) return null;

  if (isDetailRequest(question)) return 'detailed';

  if (
    faqAnswer.intentId === 'ai_usage.workflow' &&
    hasRecentAiWorkflowAnswer(messages)
  ) {
    return 'detailed';
  }

  return null;
}

function isDetailRequest(question: string) {
  return /(더\s*(자세히|상세히|구체적으로|깊게|설명|알려)|자세히|상세히|구체적으로|more detail|tell me more|details?)/i.test(
    question
  );
}

function hasRecentAiWorkflowAnswer(messages: UIMessage[]) {
  const recentText = messages.slice(-8, -1).map(getMessageText).join('\n');

  return /(AI-assisted Development Workflow|Plan\s*Generate\s*Review|Claude Code|Gemini CLI|Codex|AI를\s*단순\s*질문\s*도구|개발\s*파트너)/i.test(
    recentText
  );
}

function getStarterQuestionIdFromRecentConversation(messages: UIMessage[]) {
  const recentText = messages.slice(-6, -1).map(getMessageText).join('\n');

  if (
    /(AI\s*활용|AI-assisted Development Workflow|Claude Code|Gemini CLI|Codex|AI workflow|AI 도구|AI를.*개발)/i.test(
      recentText
    )
  ) {
    return 'home.ai.workflow';
  }

  if (
    /(대표 프로젝트|Featured Projects|AskOosu 2026|Aigram|Sticks)/i.test(
      recentText
    )
  ) {
    return 'home.projects.top3';
  }

  if (/(기술 스택|Tech stack|Skills|숙련도)/i.test(recentText)) {
    return 'home.skills.level';
  }

  if (/(연락|Contact Oosu|Email|GitHub|LinkedIn|협업)/i.test(recentText)) {
    return 'home.contact';
  }

  return null;
}

function isShortCollaborationQuestion(question: string) {
  return /^(협업|팀워크|collaboration|teamwork)$/i.test(
    normalizeQuestion(question)
  );
}

function hasRecentCollaborationBrief(messages: UIMessage[]) {
  const recentText = messages.slice(-8, -1).map(getMessageText).join('\n');

  return /(협업\s*브리프|연락\/협업|우수님에게\s*어떻게\s*연락|어떤\s*협업을\s*열어두고|Contact Oosu|Email|GitHub|LinkedIn|AI\s*웹\s*제품|RAG\/검색\s*UX|풀스택\s*프로토타입|collaboration brief|open to collaboration)/i.test(
    recentText
  );
}

function getCollaborationFollowUpClarifier(language: ChatLanguage) {
  return language === 'ko'
    ? '위 협업 브리프만으로 원하는 정보가 부족했을 수 있어요. 협업 방식, 팀 적응, 역할 범위, 연락/제안 방식 중 어떤 쪽이 더 궁금한지 조금만 더 좁혀주시면 그 기준으로 이어서 설명할게요.'
    : 'The collaboration brief above may not have covered the part you wanted. Tell me whether you mean working style, team fit, role scope, or how to reach out, and I’ll continue from that angle.';
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

  if (
    intent === 'portfolio_ambiguous' ||
    reason === 'follow_up_without_context'
  ) {
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
  if (
    intent === 'portfolio_ambiguous' ||
    reason === 'follow_up_without_context'
  ) {
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
  if (answerSource === 'philosophy_docs') {
    return 'oosu.dev Visionary Builder Docs';
  }
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
    philosophy_docs: {
      ko: 'Visionary Builder Docs 기반',
      en: 'From Visionary Builder Docs',
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

function prefixRepeatedConcernAnswer({
  answer,
  messages,
  faqAnswer,
  language,
}: {
  answer: string;
  messages: UIMessage[];
  faqAnswer: FaqAnswer;
  language: ChatLanguage;
}) {
  const concern = getRecruiterConcernKey(faqAnswer.id);
  if (!concern) return answer;

  const previousAssistantMessages = getPreviousAssistantMessages(messages);
  const hasPreviousAnswerForConcern = previousAssistantMessages.some((message) =>
    assistantMessageAddressesRecruiterConcern(message, concern)
  );

  if (!hasPreviousAnswerForConcern) return answer;

  const prefix =
    language === 'ko'
      ? '위에서 이미 언급 드렸지만, 표현을 조금 바꿔 다시 정리하면:'
      : 'As mentioned above, reframed slightly:';

  if (answer.startsWith(prefix)) return answer;
  return `${prefix}\n\n${answer}`;
}

function appendFaqContextualQuote({
  answer,
  faqAnswer,
  question,
  language,
  messages,
}: {
  answer: string;
  faqAnswer: FaqAnswer;
  question: string;
  language: ChatLanguage;
  messages: UIMessage[];
}) {
  if (hasMarkdownQuote(answer)) return answer;
  const recentAssistantText = messages
    .filter((message) => message.role === 'assistant')
    .map(getMessageText)
    .join('\n');

  const quote = getContextualQuote({
    category: getQuoteCategoryForFaq(faqAnswer),
    language,
    seed: `${faqAnswer.id}:${question}`,
    avoidText: recentAssistantText,
  });

  return `${answer}\n\n---\n> ${quote}`;
}

function hasMarkdownQuote(answer: string) {
  return /(^|\n)>\s+\S/.test(answer);
}

function getQuoteCategoryForFaq(faqAnswer: FaqAnswer): ContextualQuoteCategory {
  if (/ux|product|role|recruiter|career|profile/i.test(faqAnswer.intentId)) {
    return 'product';
  }

  if (/ai|rag|workflow|director/i.test(faqAnswer.intentId)) {
    return 'ai_era';
  }

  return 'ux';
}

function getRecruiterConcernKey(faqId: string) {
  if (faqId.includes('age_career_timing')) return 'age';
  if (faqId.includes('role_ambiguity')) return 'role';
  if (faqId.includes('role_recommendation')) return 'role';
  if (faqId.includes('non_cs_background')) return 'non_cs';
  if (faqId.includes('ai_dependency')) return 'ai_dependency';
  if (faqId.includes('retention')) return 'retention';

  return null;
}

function assistantMessageAddressesRecruiterConcern(
  message: UIMessage,
  concern: string
) {
  const metadata = getMessageMetadataRecord(message);
  const candidateIds = [
    metadata?.matchedFaqId,
    metadata?.faqId,
    metadata?.intentId,
  ].filter((value): value is string => typeof value === 'string');

  if (
    candidateIds.some(
      (candidateId) => getRecruiterConcernKey(candidateId) === concern
    )
  ) {
    return true;
  }

  const text = getMessageText(message);
  if (!text || isOffTopicRedirectText(text)) return false;

  return answerTextMatchesRecruiterConcern(text, concern);
}

function getMessageMetadataRecord(message: UIMessage) {
  return isRecord(message.metadata) ? message.metadata : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOffTopicRedirectText(text: string) {
  return /(AskOosu에서는 우수의 프로젝트와 기술 경험을 소개하는 데 집중|포트폴리오에서는 우수의 작업 방식이나 프로젝트 맥락|keep the spotlight on Oosu's work|keep us close to the portfolio)/i.test(
    text
  );
}

function answerTextMatchesRecruiterConcern(text: string, concern: string) {
  const patterns: Record<string, RegExp> = {
    age: /(상대적으로\s*늦게\s*개발\s*커리어|그\s*시간을\s*공백|나이를\s*방어|older\s+than\s+typical\s+junior|does\s+not\s+see\s+that\s+time\s+as\s+a\s+gap)/i,
    role:
      /(AI-connected\s+Fullstack|AI\s*연결\s*풀스택|레이어.*연결|product\/UX|포지셔닝)/i,
    non_cs: /(비전공|non[-\s]?CS|CS\s+degree|learn\s+faster)/i,
    ai_dependency:
      /(AI\s*의존|AI\s*없이|AI\s*코드|review\s+AI-generated|AI-generated\s+code)/i,
    retention: /(오래\s*근무|장기\s*근속|retention|leave\s+quickly|startup)/i,
  };

  return patterns[concern]?.test(text) ?? false;
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
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
