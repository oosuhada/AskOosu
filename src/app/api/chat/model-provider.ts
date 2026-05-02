import { createOpenAI, openai } from '@ai-sdk/openai';

type ChatProviderName = 'openai' | 'xai';

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_XAI_MODEL = 'grok-4.3';
const XAI_BASE_URL = 'https://api.x.ai/v1';

let xaiKeyCursor = 0;

export function getChatModel() {
  const provider = getChatProviderName();

  if (provider === 'xai') {
    const apiKey = getNextXaiApiKey();

    if (!apiKey) {
      throw new Error(
        'XAI_API_KEY or XAI_API_KEYS is required when ASKOOSU_AI_PROVIDER=xai.'
      );
    }

    const xai = createOpenAI({
      apiKey,
      baseURL: process.env.XAI_BASE_URL ?? XAI_BASE_URL,
      compatibility: 'compatible',
    });

    return xai(process.env.XAI_MODEL ?? DEFAULT_XAI_MODEL);
  }

  return openai(process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL);
}

export function getChatProviderName(): ChatProviderName {
  if (process.env.ASKOOSU_AI_PROVIDER === 'xai') return 'xai';
  return 'openai';
}

function getNextXaiApiKey() {
  const apiKeys = parseXaiApiKeys();
  if (apiKeys.length === 0) return undefined;
  if (apiKeys.length === 1) return apiKeys[0];

  const apiKey = apiKeys[xaiKeyCursor % apiKeys.length];
  xaiKeyCursor += 1;

  return apiKey;
}

function parseXaiApiKeys() {
  const rawValue = process.env.XAI_API_KEYS ?? process.env.XAI_API_KEY ?? '';

  return rawValue
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}
