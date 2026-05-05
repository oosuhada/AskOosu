import { convertToModelMessages, stepCountIs } from 'ai';
import type { UIMessage } from 'ai';
import { z } from 'zod';
import {
  getChatModel,
  getFallbackChatModel,
  getChatProviderErrorCode,
  isChatModelRateLimitError,
} from './model-provider';
import { SYSTEM_PROMPT_TEXT } from './prompt';
import { getCrazy } from './tools/getCrazy';
import { getContact } from './tools/getContact';
import { getInternship } from './tools/getIntership';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';
import { getSports } from './tools/getSport';
import { createDirectAnswerResponse } from '@/lib/chat/direct-response';
import {
  prepareChatOrchestration,
  getLatestUserText,
} from '@/lib/chat/orchestrator';
import type { ChatOrchestration } from '@/lib/chat/orchestrator';
import type { AnswerRouteDecision, ChatAnswerMetadata } from '@/lib/chat/types';
import {
  recordAiProviderUsage,
  shouldCacheAnswer,
  upsertCachedAnswer,
} from '@/lib/chat/database';
import {
  buildInsufficientEvidenceAnswer,
  detectPromptLeakage,
  PROMPT_LEAK_DETECTED_ERROR_CODE,
} from '@/lib/chat/output-guardrails';
import { generateAnswerWithFallback } from '@/lib/ai/fallback';
import {
  detectLanguage,
  parsePreferredLanguage,
  type ChatLanguage,
} from '@/lib/i18n/detect-language';
import { buildAnswerConfidenceSignals } from '@/lib/rag/chat-context';
import { getSuggestedQuestionRoutingMeta } from '@/lib/suggested-questions';
import { normalizeQuestion } from '@/lib/chat/text';
import {
  checkRateLimit,
  checkRateLimitForKey,
  rateLimitHeaders,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 30;

type ChatRequestBody = {
  messages?: UIMessage[];
  message?: string;
  locale?: unknown;
  language?: unknown;
  starterQuestionId?: string | null;
  faqId?: string | null;
  intentId?: string | null;
  displayQuestion?: string | null;
  originalQuickLabel?: string | null;
  answerVariant?: string | null;
  renderSpec?: string | null;
  source?: string | null;
  conversationId?: string | null;
};

type ValidatedChatRequestBody = Omit<
  ChatRequestBody,
  'messages' | 'message' | 'language' | 'locale' | 'source'
> & {
  messages: UIMessage[];
  preferredLanguage: ChatLanguage | null;
  source: 'quick_question' | 'typed_question' | null;
};

const DEFAULT_MAX_CHAT_REQUEST_BYTES = 32 * 1024;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_PARTS = 80;
const MAX_LATEST_USER_TEXT_LENGTH = 2000;
const MAX_DISPLAY_TEXT_LENGTH = 500;
const MAX_QUICK_LABEL_LENGTH = 240;
const MAX_SAFE_ID_LENGTH = 160;
const MAX_CONVERSATION_ID_LENGTH = 160;
const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_.:-]+$/;

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  let messages: UIMessage[] = [];
  let body: ValidatedChatRequestBody | null = null;
  let orchestration: ChatOrchestration | null = null;
  let responseLanguage = getRequestFallbackLanguage(req);

  try {
    const rateLimit = await checkRateLimit(req, {
      scope: 'api:chat',
      windowMs: 60 * 1000,
      max: getPositiveIntegerEnv('ASKOOSU_CHAT_RATE_LIMIT_PER_MINUTE', 60),
    });

    if (!rateLimit.allowed) {
      return createRateLimitedJsonResponse({
        requestId,
        language: responseLanguage,
        retryAfter: rateLimit.retryAfter,
        headers: rateLimitHeaders(rateLimit),
      });
    }

    body = await readChatRequestBody(req);
    messages = body.messages;
    responseLanguage = detectLanguage(
      getLatestUserText(messages),
      body.preferredLanguage
    );
    const sessionRateLimit = body.conversationId
      ? await checkRateLimitForKey(body.conversationId, {
          scope: 'api:chat:session',
          windowMs: 60 * 1000,
          max: getPositiveIntegerEnv(
            'ASKOOSU_CHAT_SESSION_RATE_LIMIT_PER_MINUTE',
            30
          ),
        })
      : null;

    if (sessionRateLimit && !sessionRateLimit.allowed) {
      return createRateLimitedJsonResponse({
        requestId,
        language: responseLanguage,
        retryAfter: sessionRateLimit.retryAfter,
        headers: rateLimitHeaders(sessionRateLimit),
      });
    }

    orchestration = await prepareChatOrchestration({
      messages,
      requestId,
      preferredLanguage: body.preferredLanguage,
      starterQuestionId: body.starterQuestionId,
      faqId: body.faqId,
      intentId: body.intentId,
      displayQuestion: body.displayQuestion,
      originalQuickLabel: body.originalQuickLabel,
      answerVariant: body.answerVariant,
      renderSpec: body.renderSpec,
      source: body.source,
    });

    if (orchestration.mode === 'direct') {
      const isCacheHit =
        orchestration.routeDecision.mode === 'faq_direct' ||
        orchestration.routeDecision.mode === 'answer_cache';
      logChatRouteEvent({
        requestId,
        triggerId: body.starterQuestionId,
        faqId: body.faqId ?? orchestration.directAnswer.metadata.faqId,
        lang: orchestration.language,
        cacheHit: isCacheHit,
        skippedGroq: true,
        renderSpec:
          body.renderSpec ?? orchestration.directAnswer.metadata.renderSpecKey,
        routeDecision: orchestration.routeDecision,
      });

      void recordAiProviderUsage({
        provider: isCacheHit ? 'cache' : 'guardrail',
        model: orchestration.directAnswer.metadata.answerSource,
        route: 'api/chat',
        answerSource: orchestration.directAnswer.metadata.answerSource,
        metadata: toUsageMetadata(orchestration.directAnswer.metadata),
        latencyMs: 0,
        success: true,
      }).catch((error) => {
        console.warn('Unable to record cache usage:', {
          requestId,
          error: getSafeErrorLog(error),
        });
      });

      return createDirectAnswerResponse({
        messages,
        answer: orchestration.directAnswer.answer,
        metadata: orchestration.directAnswer.metadata,
      });
    }

    logChatRouteEvent({
      requestId,
      triggerId: body.starterQuestionId,
      faqId: body.faqId ?? orchestration.metadata.faqId,
      lang: orchestration.language,
      cacheHit: false,
      skippedGroq: false,
      renderSpec: body.renderSpec ?? orchestration.metadata.renderSpecKey,
      routeDecision: orchestration.routeDecision,
    });

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
      getSkills,
      getInternship,
      getCrazy,
      getSports,
    };

    const promptMessages = await convertToModelMessages(messages, {
      tools,
      ignoreIncompleteToolCalls: true,
    });
    const generation = await generateAnswerWithFallback({
      primaryModel: getPrimaryChatModelWithSelectionFallback(),
      system: [
        SYSTEM_PROMPT_TEXT,
        RAG_CHAT_SYSTEM_PROMPT,
        orchestration.ragContext.contextText,
      ]
        .filter(Boolean)
        .join('\n\n'),
      messages: promptMessages,
      tools,
      stopWhen: stepCountIs(2),
      usageMetadata: toUsageMetadata(orchestration.metadata),
    });

    if (detectPromptLeakage(generation.answer)) {
      const safeAnswer = buildInsufficientEvidenceAnswer(
        orchestration.language
      );
      const confidenceSignals = buildAnswerConfidenceSignals({
        sources: [],
        warnings: [
          ...orchestration.metadata.warnings,
          PROMPT_LEAK_DETECTED_ERROR_CODE,
        ],
        intent: orchestration.metadata.confidenceSignals?.intent ?? 0.5,
        usesGroundedSources: false,
      });
      const responseMetadata = {
        ...orchestration.metadata,
        sources: [],
        matchedEntityIds: [],
        sourceChunkIds: [],
        confidence: confidenceSignals.final,
        confidenceSignals,
        hasTodoEvidence: false,
        warnings: [
          ...orchestration.metadata.warnings,
          PROMPT_LEAK_DETECTED_ERROR_CODE,
        ],
        answerSource: 'insufficient_evidence' as const,
        skippedGroq: true,
        requestId,
        answer: safeAnswer,
        routeDecision: {
          mode: 'safe_fallback' as const,
          reason: 'prompt_leak_detected' as const,
          confidence: confidenceSignals.final,
        },
        errorCode: PROMPT_LEAK_DETECTED_ERROR_CODE,
      };

      logChatRouteEvent({
        requestId,
        triggerId: body.starterQuestionId,
        faqId: body.faqId ?? orchestration.metadata.faqId,
        lang: orchestration.language,
        cacheHit: false,
        skippedGroq: true,
        renderSpec: body.renderSpec ?? orchestration.metadata.renderSpecKey,
        routeDecision: responseMetadata.routeDecision,
        errorCode: PROMPT_LEAK_DETECTED_ERROR_CODE,
      });

      return createDirectAnswerResponse({
        messages,
        answer: safeAnswer,
        metadata: responseMetadata,
      });
    }

    const responseMetadata = {
      ...orchestration.metadata,
      answerSource: generation.answerSource,
      provider: generation.provider,
      model: generation.model,
      requestId,
      skippedGroq: generation.provider !== 'groq',
      answer: generation.answer,
    };

    const cacheInput = {
      normalizedQuestion: orchestration.normalizedQuestion,
      language: orchestration.language,
      answer: generation.answer,
      answerSource: generation.answerSource,
      matchedEntityIds: responseMetadata.matchedEntityIds,
      sourceChunkIds: responseMetadata.sourceChunkIds,
      confidence: responseMetadata.confidence,
      provider: generation.provider,
      model: generation.model,
      hasTodoEvidence: responseMetadata.hasTodoEvidence,
      warnings: responseMetadata.warnings,
      routeDecision: responseMetadata.routeDecision,
      errorCode: responseMetadata.errorCode,
    };

    if (shouldCacheAnswer(cacheInput)) {
      void upsertCachedAnswer(cacheInput).catch((error) => {
        console.warn('Unable to write answer cache:', {
          requestId,
          error: getSafeErrorLog(error),
        });
      });
    }

    return createDirectAnswerResponse({
      messages,
      answer: generation.answer,
      metadata: responseMetadata,
    });
  } catch (err) {
    if (err instanceof ChatRequestError) {
      return Response.json(
        {
          ok: false,
          error: err.message,
          requestId,
        },
        { status: err.status }
      );
    }

    const errorCode = getChatProviderErrorCode(err);
    const fallbackMetadata = buildErrorFallbackMetadata({
      requestId,
      orchestration,
      messages,
      language: responseLanguage,
      error: err,
      errorCode,
    });
    logChatRouteEvent({
      requestId,
      triggerId: body?.starterQuestionId,
      faqId: body?.faqId ?? fallbackMetadata.faqId,
      lang: fallbackMetadata.language,
      cacheHit: false,
      skippedGroq: true,
      renderSpec: body?.renderSpec ?? fallbackMetadata.renderSpecKey,
      routeDecision: fallbackMetadata.routeDecision,
      errorCode,
    });
    console.error('[api/chat] unhandled error', {
      requestId,
      error: getSafeErrorLog(err),
    });

    return createDirectAnswerResponse({
      messages,
      answer: buildModelUnavailableAnswer(fallbackMetadata.language),
      metadata: fallbackMetadata,
    });
  }
}

function toUsageMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  const record = metadata as Record<string, unknown>;
  const allowedKeys = [
    'requestId',
    'faqId',
    'triggerId',
    'matchedFaqId',
    'intentId',
    'quickLabel',
    'originalQuickLabel',
    'displayQuestion',
    'answerVariant',
    'renderSpecKey',
    'language',
    'answerSource',
    'skippedGroq',
    'intentScore',
    'intentSecondScore',
    'intentMargin',
    'routeDecision',
    'errorCode',
    'usedVisualBlocks',
    'mediaReadyCount',
    'mediaTodoCount',
  ];

  return Object.fromEntries(
    allowedKeys
      .map((key) => [key, record[key]] as const)
      .filter(([, value]) => value !== undefined)
  );
}

const RAG_CHAT_SYSTEM_PROMPT = `
## Wiki Grounding Rules
- Answer from the portfolio evidence whenever it is available.
- Do not guess facts that are not present in the portfolio evidence or the stable portfolio prompt.
- Treat TODO, needs_review, private, or uncertain chunks as unconfirmed. Mention uncertainty instead of stating them as final.
- Be natural, warm, and helpful for a portfolio visitor.
- Answer in Korean when the user asks in Korean, and in English when the user asks in English.
- Do not output raw JSON metadata. Metadata is attached by the API separately.
`;

const uiMessageSchema = z
  .object({
    id: optionalSafeIdentifierSchema().optional(),
    role: z.enum(['system', 'user', 'assistant']),
    parts: z.array(z.unknown()).max(MAX_MESSAGE_PARTS),
  })
  .passthrough();

const chatRequestBodySchema = z
  .object({
    messages: z.array(uiMessageSchema).max(MAX_MESSAGES).optional(),
    message: z.string().max(MAX_LATEST_USER_TEXT_LENGTH).optional(),
    locale: z.unknown().optional(),
    language: z.unknown().optional(),
    starterQuestionId: optionalSafeIdentifierSchema().optional(),
    faqId: optionalSafeIdentifierSchema().optional(),
    intentId: optionalSafeIdentifierSchema().optional(),
    renderSpec: optionalSafeIdentifierSchema().optional(),
    conversationId: optionalSafeIdentifierSchema(
      MAX_CONVERSATION_ID_LENGTH
    ).optional(),
    displayQuestion: optionalTrimmedStringSchema(
      MAX_DISPLAY_TEXT_LENGTH
    ).optional(),
    originalQuickLabel: optionalTrimmedStringSchema(
      MAX_QUICK_LABEL_LENGTH
    ).optional(),
    answerVariant: optionalAnswerVariantSchema().optional(),
    source: optionalSourceSchema().optional(),
  })
  .passthrough();

async function readChatRequestBody(
  req: Request
): Promise<ValidatedChatRequestBody> {
  const rawBody = await req.text();
  const maxBytes = getMaxChatRequestBytes();
  const byteLength = new TextEncoder().encode(rawBody).length;

  if (byteLength > maxBytes) {
    throw new ChatRequestError(
      `Chat request is too large. Maximum size is ${maxBytes} bytes.`,
      413
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody || '{}');
  } catch {
    throw new ChatRequestError('Invalid JSON body.', 400);
  }

  return validateChatRequestBody(parsedBody);
}

function validateChatRequestBody(value: unknown): ValidatedChatRequestBody {
  const parsedBody = chatRequestBodySchema.safeParse(value);
  if (!parsedBody.success) {
    throw new ChatRequestError('Malformed chat request.', 400);
  }

  const body = parsedBody.data;
  const preferredLanguage =
    parseMappedLanguage(body.language, 'language') ??
    parseMappedLanguage(body.locale, 'locale');
  const messages = normalizeRequestMessages(body);
  const latestUserText = getLatestUserText(messages).trim();

  if (!latestUserText) {
    throw new ChatRequestError('Chat request is missing a user message.', 400);
  }

  if (latestUserText.length > MAX_LATEST_USER_TEXT_LENGTH) {
    throw new ChatRequestError(
      `Latest user message is too long. Maximum length is ${MAX_LATEST_USER_TEXT_LENGTH} characters.`,
      400
    );
  }

  const routing = resolveRequestRouting({
    body,
    preferredLanguage,
  });

  return {
    messages,
    preferredLanguage,
    conversationId: body.conversationId ?? null,
    ...routing,
  };
}

function normalizeRequestMessages(
  body: z.infer<typeof chatRequestBodySchema>
): UIMessage[] {
  const messages = (body.messages ?? []).map((message, index) => ({
    ...message,
    id: message.id ?? `message-${index}-${crypto.randomUUID()}`,
  })) as unknown as UIMessage[];
  const messageText = body.message?.trim();

  if (getLatestUserText(messages).trim()) return messages;
  if (messageText) return [createUserMessage(messageText)];

  return messages;
}

function createUserMessage(text: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text }],
  } as UIMessage;
}

function resolveRequestRouting({
  body,
  preferredLanguage,
}: {
  body: z.infer<typeof chatRequestBodySchema>;
  preferredLanguage: ChatLanguage | null;
}): Omit<ValidatedChatRequestBody, 'messages' | 'preferredLanguage'> {
  if (body.source !== 'quick_question') {
    return {
      conversationId: body.conversationId ?? null,
      starterQuestionId: body.starterQuestionId ?? null,
      faqId: body.faqId ?? null,
      intentId: body.intentId ?? null,
      displayQuestion: body.displayQuestion ?? null,
      originalQuickLabel: body.originalQuickLabel ?? null,
      answerVariant: body.answerVariant ?? null,
      renderSpec: body.renderSpec ?? null,
      source: body.source ?? null,
    };
  }

  if (!body.starterQuestionId) {
    throw new ChatRequestError('Unknown quick question.', 400);
  }

  const suggestedQuestion =
    getSuggestedQuestionRoutingMeta(
      body.starterQuestionId,
      preferredLanguage ?? undefined
    ) ?? getSuggestedQuestionRoutingMeta(body.starterQuestionId);

  if (!suggestedQuestion) {
    throw new ChatRequestError('Unknown quick question.', 400);
  }

  return {
    conversationId: body.conversationId ?? null,
    starterQuestionId: suggestedQuestion.id,
    faqId: suggestedQuestion.faqId,
    intentId: suggestedQuestion.intentId,
    displayQuestion: suggestedQuestion.displayQuestion,
    originalQuickLabel: suggestedQuestion.quickLabel,
    answerVariant: suggestedQuestion.answerVariant,
    renderSpec: suggestedQuestion.renderSpec ?? null,
    source: 'quick_question',
  };
}

function optionalSafeIdentifierSchema(maxLength = MAX_SAFE_ID_LENGTH) {
  return z.preprocess(
    normalizeOptionalInputString,
    z
      .string()
      .trim()
      .max(maxLength)
      .regex(SAFE_IDENTIFIER_PATTERN)
      .nullable()
  );
}

function optionalTrimmedStringSchema(maxLength: number) {
  return z.preprocess(
    normalizeOptionalInputString,
    z.string().trim().max(maxLength).nullable()
  );
}

function optionalAnswerVariantSchema() {
  return z.preprocess(
    normalizeOptionalInputString,
    z.enum(['short', 'default', 'detailed']).nullable()
  );
}

function optionalSourceSchema() {
  return z.preprocess(
    normalizeOptionalInputString,
    z.enum(['quick_question', 'typed_question']).nullable()
  );
}

function normalizeOptionalInputString(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

class ChatRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatRequestError';
    this.status = status;
  }
}

function parseMappedLanguage(
  value: unknown,
  fieldName: 'language' | 'locale'
): ChatLanguage | null {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value !== 'string') {
    throw new ChatRequestError(`Invalid ${fieldName}.`, 400);
  }

  const normalizedValue = value.trim().toLowerCase().replace('_', '-');
  if (!normalizedValue) return null;
  if (normalizedValue === 'ko' || normalizedValue.startsWith('ko-')) {
    return 'ko';
  }
  if (normalizedValue === 'en' || normalizedValue.startsWith('en-')) {
    return 'en';
  }

  throw new ChatRequestError(`Invalid ${fieldName}.`, 400);
}

function getRequestFallbackLanguage(req: Request): ChatLanguage {
  const primaryAcceptedLanguage = req.headers
    .get('accept-language')
    ?.split(',')[0]
    ?.trim()
    .slice(0, 2);

  return parsePreferredLanguage(primaryAcceptedLanguage) ?? 'ko';
}

function createRateLimitedJsonResponse({
  requestId,
  language,
  retryAfter,
  headers,
}: {
  requestId: string;
  language: ChatLanguage;
  retryAfter: number;
  headers: Headers;
}) {
  return Response.json(
    {
      ok: false,
      error: getRateLimitedErrorCopy(language),
      retryAfter,
      requestId,
    },
    { status: 429, headers }
  );
}

function getRateLimitedErrorCopy(language: ChatLanguage) {
  return language === 'ko'
    ? '지금 질문이 잠깐 몰렸어요. 잠시 후 다시 말을 걸어주세요.'
    : 'I’m getting a lot of questions right now. Please try again shortly.';
}

function buildErrorFallbackMetadata({
  requestId,
  orchestration,
  messages,
  language,
  error,
  errorCode,
}: {
  requestId: string;
  orchestration: ChatOrchestration | null;
  messages: UIMessage[];
  language: ChatLanguage;
  error: unknown;
  errorCode: string;
}): ChatAnswerMetadata {
  const baseMetadata = getOrchestrationMetadata(orchestration);
  const warnings = uniqueWarnings([
    ...(baseMetadata?.warnings ?? []),
    errorCode,
  ]);
  const rawConfidenceSignals = buildAnswerConfidenceSignals({
    sources: baseMetadata?.sources ?? [],
    warnings,
    intent: baseMetadata?.confidenceSignals?.intent ?? 0.5,
    usesGroundedSources: false,
  });
  const confidenceSignals = {
    ...rawConfidenceSignals,
    final: Math.min(rawConfidenceSignals.final, 0.3),
  };
  const routeDecision = buildSafeFallbackRouteDecision({
    error,
    confidence: confidenceSignals.final,
  });

  return {
    ...(baseMetadata ?? {}),
    requestId,
    sources: baseMetadata?.sources ?? [],
    confidence: confidenceSignals.final,
    confidenceSignals,
    matchedEntityIds: baseMetadata?.matchedEntityIds ?? [],
    hasTodoEvidence: false,
    warnings,
    language: baseMetadata?.language ?? language,
    answerSource: 'fallback',
    routeDecision,
    normalizedQuestion:
      baseMetadata?.normalizedQuestion ??
      normalizeQuestion(getLatestUserText(messages)),
    skippedGroq: true,
    errorCode,
    sourceChunkIds: baseMetadata?.sourceChunkIds ?? [],
  };
}

function getOrchestrationMetadata(
  orchestration: ChatOrchestration | null
): ChatAnswerMetadata | null {
  if (!orchestration) return null;
  return orchestration.mode === 'generate'
    ? orchestration.metadata
    : orchestration.directAnswer.metadata;
}

function buildModelUnavailableAnswer(language: ChatLanguage) {
  return language === 'ko'
    ? '답변 엔진이 잠깐 쉬는 중이에요. 잠시 후 다시 시도해 주세요.'
    : 'The answer engine is taking a short break. Please try again soon.';
}

function uniqueWarnings(warnings: string[]) {
  return Array.from(
    new Set(warnings.map((warning) => warning.trim()).filter(Boolean))
  );
}

function getSafeErrorLog(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    message:
      typeof error === 'string'
        ? error.slice(0, 240)
        : 'Unknown non-error throw',
  };
}

function getMaxChatRequestBytes() {
  const rawValue = process.env.ASKOOSU_CHAT_MAX_REQUEST_BYTES;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : DEFAULT_MAX_CHAT_REQUEST_BYTES;
}

function getPrimaryChatModelWithSelectionFallback() {
  try {
    return getChatModel();
  } catch (error) {
    const fallbackModel = getFallbackChatModel();
    if (!fallbackModel) throw error;
    return fallbackModel;
  }
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function buildSafeFallbackRouteDecision({
  error,
  confidence,
}: {
  error: unknown;
  confidence: number;
}): AnswerRouteDecision {
  return {
    mode: 'safe_fallback',
    reason: isChatModelRateLimitError(error)
      ? 'rate_limited'
      : 'provider_unavailable',
    confidence,
  };
}

function logChatRouteEvent({
  requestId,
  triggerId,
  faqId,
  lang,
  cacheHit,
  skippedGroq,
  renderSpec,
  routeDecision,
  errorCode,
}: {
  requestId: string;
  triggerId?: string | null;
  faqId?: string | null;
  lang?: string | null;
  cacheHit: boolean;
  skippedGroq: boolean;
  renderSpec?: string | null;
  routeDecision?: AnswerRouteDecision | null;
  errorCode?: string | null;
}) {
  console.info('[api/chat]', {
    requestId,
    triggerId: triggerId ?? null,
    faqId: faqId ?? null,
    lang: lang ?? null,
    cacheHit,
    skippedGroq,
    renderSpec: renderSpec ?? null,
    routeMode: routeDecision?.mode ?? null,
    routeReason: routeDecision?.reason ?? null,
    errorCode: errorCode ?? null,
  });
}
