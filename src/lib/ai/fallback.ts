import { generateText } from 'ai';
import type { ModelMessage } from 'ai';
import {
  getAiProviderDailyUsage,
  recordAiProviderStatus,
  recordAiProviderUsage,
} from '@/lib/chat/database';
import type { ChatAnswerSource } from '@/lib/chat/types';
import {
  getChatProviderErrorCode,
  getFallbackChatModel,
  isChatModelRateLimitError,
  recordChatModelFailure,
  recordChatModelSuccess,
  type ChatModelSelection,
} from './providers';

type GenerateTextOptions = Parameters<typeof generateText>[0];

export type AiAnswerResult = {
  answer: string;
  provider: ChatModelSelection['provider'];
  model: string;
  answerSource: ChatAnswerSource;
  latencyMs: number;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
};

export async function generateAnswerWithFallback({
  primaryModel,
  system,
  messages,
  tools,
  stopWhen,
}: {
  primaryModel: ChatModelSelection;
  system: string;
  messages: ModelMessage[];
  tools: GenerateTextOptions['tools'];
  stopWhen: GenerateTextOptions['stopWhen'];
}): Promise<AiAnswerResult> {
  try {
    return await generateWithModel({
      selection: primaryModel,
      system,
      messages,
      tools,
      stopWhen,
    });
  } catch (error) {
    await recordProviderFailure(primaryModel, error);

    const fallbackModel = getFallbackChatModel();
    if (
      !fallbackModel ||
      fallbackModel.provider === primaryModel.provider ||
      !(await canUseFallbackModel(fallbackModel))
    ) {
      throw error;
    }

    try {
      return await generateWithModel({
        selection: fallbackModel,
        system,
        messages,
        tools,
        stopWhen,
      });
    } catch (fallbackError) {
      await recordProviderFailure(fallbackModel, fallbackError);
      throw fallbackError;
    }
  }
}

async function generateWithModel({
  selection,
  system,
  messages,
  tools,
  stopWhen,
}: {
  selection: ChatModelSelection;
  system: string;
  messages: ModelMessage[];
  tools: GenerateTextOptions['tools'];
  stopWhen: GenerateTextOptions['stopWhen'];
}) {
  const startedAt = Date.now();
  const result = await generateText({
    model: selection.model,
    system,
    messages,
    tools,
    stopWhen,
    maxRetries: selection.provider === 'groq' ? 0 : undefined,
  });
  const latencyMs = Date.now() - startedAt;
  const usage = normalizeUsage(result.usage);
  const answerSource = getGeneratedAnswerSource(selection.provider);

  recordChatModelSuccess(selection);
  await Promise.allSettled([
    recordAiProviderUsage({
      provider: selection.provider,
      model: selection.modelName,
      route: 'api/chat',
      answerSource,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      latencyMs,
      success: true,
    }),
    recordAiProviderStatus({
      provider: selection.provider,
      status: 'ok',
    }),
  ]);

  return {
    answer: result.text,
    provider: selection.provider,
    model: selection.modelName,
    answerSource,
    latencyMs,
    ...usage,
  };
}

async function recordProviderFailure(
  selection: ChatModelSelection,
  error: unknown
) {
  recordChatModelFailure(selection, error);
  const errorCode = getChatProviderErrorCode(error);
  const isRateLimit = isChatModelRateLimitError(error);

  await Promise.allSettled([
    recordAiProviderUsage({
      provider: selection.provider,
      model: selection.modelName,
      route: 'api/chat',
      answerSource: getGeneratedAnswerSource(selection.provider),
      success: false,
      errorCode,
    }),
    recordAiProviderStatus({
      provider: selection.provider,
      status: isRateLimit ? 'cooldown' : 'error',
      errorCode,
      cooldownUntil: isRateLimit ? new Date(Date.now() + 60_000) : null,
    }),
  ]);
}

async function canUseFallbackModel(selection: ChatModelSelection) {
  if (selection.provider !== 'google_vertex') return true;
  if (process.env.GOOGLE_AI_ENABLED === 'false') return false;

  const maxCalls = getPositiveIntegerEnv('GOOGLE_AI_MAX_CALLS_PER_DAY', 100);
  if (maxCalls <= 0) return false;

  try {
    const usage = await getAiProviderDailyUsage(selection.provider);
    return usage.callCount < maxCalls;
  } catch (error) {
    console.warn('Unable to read Google fallback daily usage:', error);
    return true;
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

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallback;
}
