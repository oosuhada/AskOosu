import { convertToModelMessages, stepCountIs } from 'ai';
import type { UIMessage } from 'ai';
import {
  getChatModel,
  getFallbackChatModel,
  getChatProviderErrorCode,
  isChatModelRateLimitError,
} from './model-provider';
import { SYSTEM_PROMPT_TEXT } from './prompt';
import { createStaticFallbackResponse } from './static-fallback';
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
import type { AnswerRouteDecision } from '@/lib/chat/types';
import { recordAiProviderUsage, upsertCachedAnswer } from '@/lib/chat/database';
import {
  buildInsufficientEvidenceAnswer,
  detectPromptLeakage,
  PROMPT_LEAK_DETECTED_ERROR_CODE,
} from '@/lib/chat/output-guardrails';
import { generateAnswerWithFallback } from '@/lib/ai/fallback';
import { parsePreferredLanguage } from '@/lib/i18n/detect-language';
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

const DEFAULT_MAX_CHAT_REQUEST_BYTES = 32 * 1024;

export async function POST(req: Request) {
  let messages: UIMessage[] = [];
  let body: ChatRequestBody = {};

  try {
    const rateLimit = checkRateLimit(req, {
      scope: 'api:chat',
      windowMs: 60 * 1000,
      max: getPositiveIntegerEnv('ASKOOSU_CHAT_RATE_LIMIT_PER_MINUTE', 60),
    });

    if (!rateLimit.allowed) {
      return Response.json(
        {
          ok: false,
          error: 'Too many chat requests. Please wait and try again.',
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    body = await readChatRequestBody(req);
    messages = Array.isArray(body.messages) ? body.messages : [];
    const sessionRateLimit = body.conversationId
      ? checkRateLimitForKey(body.conversationId, {
          scope: 'api:chat:session',
          windowMs: 60 * 1000,
          max: getPositiveIntegerEnv(
            'ASKOOSU_CHAT_SESSION_RATE_LIMIT_PER_MINUTE',
            30
          ),
        })
      : null;

    if (sessionRateLimit && !sessionRateLimit.allowed) {
      return Response.json(
        {
          ok: false,
          error:
            'Too many chat requests in this session. Please wait and try again.',
          retryAfter: sessionRateLimit.retryAfter,
        },
        {
          status: 429,
          headers: rateLimitHeaders(sessionRateLimit),
        }
      );
    }

    const orchestration = await prepareChatOrchestration({
      messages,
      preferredLanguage:
        parsePreferredLanguage(body.language) ??
        parsePreferredLanguage(body.locale),
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
        console.warn('Unable to record cache usage:', error);
      });

      return createDirectAnswerResponse({
        messages,
        answer: orchestration.directAnswer.answer,
        metadata: orchestration.directAnswer.metadata,
      });
    }

    logChatRouteEvent({
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
    });

    if (detectPromptLeakage(generation.answer)) {
      const safeAnswer = buildInsufficientEvidenceAnswer(
        orchestration.language
      );
      const responseMetadata = {
        ...orchestration.metadata,
        sources: [],
        matchedEntityIds: [],
        sourceChunkIds: [],
        confidence: 0.2,
        hasTodoEvidence: false,
        warnings: [
          ...orchestration.metadata.warnings,
          PROMPT_LEAK_DETECTED_ERROR_CODE,
        ],
        answerSource: 'insufficient_evidence' as const,
        skippedGroq: true,
        answer: safeAnswer,
        routeDecision: {
          mode: 'safe_fallback' as const,
          reason: 'prompt_leak_detected' as const,
          confidence: 0.2,
        },
        errorCode: PROMPT_LEAK_DETECTED_ERROR_CODE,
      };

      logChatRouteEvent({
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
      skippedGroq: generation.provider !== 'groq',
      answer: generation.answer,
    };

    void upsertCachedAnswer({
      normalizedQuestion: orchestration.normalizedQuestion,
      language: orchestration.language,
      answer: generation.answer,
      answerSource: generation.answerSource,
      matchedEntityIds: responseMetadata.matchedEntityIds,
      sourceChunkIds: responseMetadata.sourceChunkIds,
      confidence: responseMetadata.confidence,
      provider: generation.provider,
      model: generation.model,
    }).catch((error) => {
      console.warn('Unable to write answer cache:', error);
    });

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
        },
        { status: err.status }
      );
    }

    const errorCode = getChatProviderErrorCode(err);
    logChatRouteEvent({
      triggerId: body.starterQuestionId,
      faqId: body.faqId,
      cacheHit: false,
      skippedGroq: true,
      renderSpec: body.renderSpec,
      routeDecision: buildSafeFallbackRouteDecision({
        error: err,
        confidence: 0.3,
      }),
      errorCode,
    });
    console.error('Global error:', err);

    const cachedFaqResponse = await createCachedFaqRecoveryResponse({
      body,
      messages,
      errorCode,
    }).catch((recoveryError) => {
      console.warn('Unable to recover direct FAQ answer:', recoveryError);
      return null;
    });

    if (cachedFaqResponse) return cachedFaqResponse;

    const latestUserText = getLatestUserText(messages);
    const orchestration = await prepareChatOrchestration({
      messages,
      preferredLanguage:
        parsePreferredLanguage(body.language) ??
        parsePreferredLanguage(body.locale),
      starterQuestionId: body.starterQuestionId,
      faqId: body.faqId,
      intentId: body.intentId,
      displayQuestion: body.displayQuestion,
      originalQuickLabel: body.originalQuickLabel,
      answerVariant: body.answerVariant,
      renderSpec: body.renderSpec,
      source: body.source,
    });
    const retrievedContext =
      orchestration.mode === 'generate'
        ? orchestration.ragContext.contextText
        : '';
    const metadata =
      orchestration.mode === 'generate'
        ? orchestration.metadata
        : orchestration.directAnswer.metadata;
    const routeDecision = buildSafeFallbackRouteDecision({
      error: err,
      confidence: metadata.confidence,
    });

    return createStaticFallbackResponse({
      messages,
      query: latestUserText,
      retrievedContext,
      reason: isChatModelRateLimitError(err)
        ? 'rate_limit'
        : 'model_unavailable',
      metadata: {
        ...metadata,
        answerSource: 'fallback',
        skippedGroq: true,
        routeDecision,
        errorCode,
      },
    });
  }
}

async function createCachedFaqRecoveryResponse({
  body,
  messages,
  errorCode,
}: {
  body: ChatRequestBody;
  messages: UIMessage[];
  errorCode: string;
}) {
  if (!body.faqId) return null;

  const orchestration = await prepareChatOrchestration({
    messages,
    preferredLanguage:
      parsePreferredLanguage(body.language) ??
      parsePreferredLanguage(body.locale),
    starterQuestionId: body.starterQuestionId,
    faqId: body.faqId,
    intentId: body.intentId,
    displayQuestion: body.displayQuestion,
    originalQuickLabel: body.originalQuickLabel,
    answerVariant: body.answerVariant,
    renderSpec: body.renderSpec,
    source: body.source,
  });

  if (orchestration.mode !== 'direct') return null;

  logChatRouteEvent({
    triggerId: body.starterQuestionId,
    faqId: body.faqId ?? orchestration.directAnswer.metadata.faqId,
    lang: orchestration.language,
    cacheHit: true,
    skippedGroq: true,
    renderSpec:
      body.renderSpec ?? orchestration.directAnswer.metadata.renderSpecKey,
    routeDecision: orchestration.routeDecision,
    errorCode,
  });

  return createDirectAnswerResponse({
    messages,
    answer: orchestration.directAnswer.answer,
    metadata: {
      ...orchestration.directAnswer.metadata,
      skippedGroq: true,
      errorCode,
    },
  });
}

function toUsageMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  const record = metadata as Record<string, unknown>;
  const allowedKeys = [
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

async function readChatRequestBody(req: Request): Promise<ChatRequestBody> {
  const rawBody = await req.text();
  const maxBytes = getMaxChatRequestBytes();
  const byteLength = new TextEncoder().encode(rawBody).length;

  if (byteLength > maxBytes) {
    throw new ChatRequestError(
      `Chat request is too large. Maximum size is ${maxBytes} bytes.`,
      413
    );
  }

  try {
    return JSON.parse(rawBody || '{}') as ChatRequestBody;
  } catch {
    throw new ChatRequestError('Invalid JSON body.', 400);
  }
}

class ChatRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatRequestError';
    this.status = status;
  }
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
  triggerId,
  faqId,
  lang,
  cacheHit,
  skippedGroq,
  renderSpec,
  routeDecision,
  errorCode,
}: {
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
