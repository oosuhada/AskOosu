import { convertToModelMessages, streamText, stepCountIs } from 'ai';
import type { UIMessage } from 'ai';
import {
  getChatModel,
  getChatProviderErrorCode,
  getFallbackChatModel,
  isChatModelRateLimitError,
  recordChatModelFailure,
  recordChatModelSuccess,
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
import {
  recordAiProviderStatus,
  recordAiProviderUsage,
  upsertCachedAnswer,
} from '@/lib/chat/database';
import type { ChatAnswerSource } from '@/lib/chat/types';
import { parsePreferredLanguage } from '@/lib/i18n/detect-language';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 30;

type ChatRequestBody = {
  messages?: UIMessage[];
  locale?: unknown;
  language?: unknown;
  starterQuestionId?: string | null;
  conversationId?: string | null;
};

function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  let messages: UIMessage[] = [];

  try {
    const rateLimit = checkRateLimit(req, {
      scope: 'api:chat',
      windowMs: 60 * 1000,
      max: 20,
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

    const body = (await req.json()) as ChatRequestBody;
    messages = Array.isArray(body.messages) ? body.messages : [];
    const orchestration = await prepareChatOrchestration({
      messages,
      preferredLanguage:
        parsePreferredLanguage(body.language) ??
        parsePreferredLanguage(body.locale),
      starterQuestionId: body.starterQuestionId,
    });

    if (orchestration.mode === 'direct') {
      void recordAiProviderUsage({
        provider: 'cache',
        model: orchestration.directAnswer.metadata.answerSource,
        route: 'api/chat',
        answerSource: orchestration.directAnswer.metadata.answerSource,
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
    const chatModel = selectChatModelWithFallback();
    const answerSource = getGeneratedAnswerSource(chatModel.provider);
    const responseMetadata = {
      ...orchestration.metadata,
      answerSource,
      provider: chatModel.provider,
      model: chatModel.modelName,
      skippedGroq: chatModel.provider !== 'groq',
    };
    const startedAt = Date.now();
    let generatedAnswer = '';

    const result = streamText({
      model: chatModel.model,
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
      maxRetries: chatModel.provider === 'groq' ? 0 : undefined,
      onError: ({ error }) => {
        recordChatModelFailure(chatModel, error);
        void recordAiProviderUsage({
          provider: chatModel.provider,
          model: chatModel.modelName,
          route: 'api/chat',
          answerSource,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode: getChatProviderErrorCode(error),
        }).catch((usageError) => {
          console.warn('Unable to record provider failure:', usageError);
        });
        void recordAiProviderStatus({
          provider: chatModel.provider,
          status: isChatModelRateLimitError(error) ? 'cooldown' : 'error',
          errorCode: getChatProviderErrorCode(error),
        }).catch((statusError) => {
          console.warn('Unable to record provider status:', statusError);
        });
      },
      onFinish: ({ text, usage }) => {
        generatedAnswer = text;
        recordChatModelSuccess(chatModel);
        const usageValues = normalizeUsage(usage);
        void recordAiProviderUsage({
          provider: chatModel.provider,
          model: chatModel.modelName,
          route: 'api/chat',
          answerSource,
          inputTokens: usageValues.inputTokens,
          outputTokens: usageValues.outputTokens,
          totalTokens: usageValues.totalTokens,
          latencyMs: Date.now() - startedAt,
          success: true,
        }).catch((error) => {
          console.warn('Unable to record provider usage:', error);
        });
        void recordAiProviderStatus({
          provider: chatModel.provider,
          status: 'ok',
        }).catch((error) => {
          console.warn('Unable to record provider status:', error);
        });
        void upsertCachedAnswer({
          normalizedQuestion: orchestration.normalizedQuestion,
          language: orchestration.language,
          answer: text,
          answerSource,
          matchedEntityIds: responseMetadata.matchedEntityIds,
          sourceChunkIds: responseMetadata.sourceChunkIds,
          confidence: responseMetadata.confidence,
          provider: chatModel.provider,
          model: chatModel.modelName,
        }).catch((error) => {
          console.warn('Unable to write answer cache:', error);
        });
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) =>
        getSafeChatErrorMessage(error, orchestration.question),
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            ...responseMetadata,
            answer: generatedAnswer,
          };
        }
      },
    });
  } catch (err) {
    console.error('Global error:', err);
    const latestUserText = getLatestUserText(messages);
    const orchestration = await prepareChatOrchestration({
      messages,
    });
    const retrievedContext =
      orchestration.mode === 'generate'
        ? orchestration.ragContext.contextText
        : '';
    const metadata =
      orchestration.mode === 'generate'
        ? orchestration.metadata
        : orchestration.directAnswer.metadata;

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
      },
    });
  }
}

const RAG_CHAT_SYSTEM_PROMPT = `
## Wiki Grounding Rules
- Answer from the retrieved Wiki context whenever it is available.
- Do not guess facts that are not present in the Wiki context or the stable portfolio prompt.
- Treat TODO, needs_review, private, or uncertain chunks as unconfirmed. Mention uncertainty instead of stating them as final.
- Be natural, warm, and helpful for a portfolio visitor.
- Answer in Korean when the user asks in Korean, and in English when the user asks in English.
- Do not output raw JSON metadata. Metadata is attached by the API separately.
`;

function getSafeChatErrorMessage(error: unknown, query: string) {
  if (isChatModelRateLimitError(error)) {
    return [
      'Groq 무료 API 사용량 또는 속도 제한에 걸려 지금은 실시간 답변을 완료하지 못했어요.',
      '잠시 후 다시 시도하거나, GitHub/LinkedIn/이메일 링크로 우수에게 직접 문의해 주세요.',
      query ? `질문: ${query}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return errorHandler(error);
}

function selectChatModelWithFallback() {
  try {
    return getChatModel();
  } catch (error) {
    const fallbackModel = getFallbackChatModel();
    if (fallbackModel) return fallbackModel;
    throw error;
  }
}

function getGeneratedAnswerSource(provider: string): ChatAnswerSource {
  if (provider === 'groq') return 'rag_groq';
  if (provider === 'google_vertex') return 'rag_google';
  if (provider === 'xai') return 'rag_xai';
  if (provider === 'openai') return 'rag_openai';
  return 'fallback';
}

function normalizeUsage(usage: unknown) {
  if (!usage || typeof usage !== 'object') {
    return {};
  }

  const usageRecord = usage as Record<string, unknown>;
  return {
    inputTokens: parseUsageNumber(
      usageRecord.inputTokens ?? usageRecord.promptTokens
    ),
    outputTokens: parseUsageNumber(
      usageRecord.outputTokens ?? usageRecord.completionTokens
    ),
    totalTokens: parseUsageNumber(usageRecord.totalTokens),
  };
}

function parseUsageNumber(value: unknown) {
  const parsedValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}
