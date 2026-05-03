import { openai } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';

type ChatProviderName = 'openai' | 'xai';
type XaiApiMode = 'responses' | 'chat';

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_XAI_MODEL = 'grok-4';
const XAI_BASE_URL = 'https://api.x.ai/v1';

export function getChatModel() {
  const provider = getChatProviderName();

  if (provider === 'xai') {
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      throw new Error('XAI_API_KEY is required when ASKOOSU_AI_PROVIDER=xai.');
    }

    const xai = createXai({
      apiKey,
      baseURL: process.env.XAI_BASE_URL ?? XAI_BASE_URL,
    });

    const model = process.env.XAI_MODEL ?? DEFAULT_XAI_MODEL;

    if (getXaiApiMode() === 'chat') {
      return xai.chat(model);
    }

    return xai.responses(model);
  }

  return openai(process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL);
}

export function hasChatModelCredentials() {
  const provider = getChatProviderName();

  if (provider === 'xai') return Boolean(process.env.XAI_API_KEY);

  return Boolean(process.env.OPENAI_API_KEY);
}

export function getChatProviderName(): ChatProviderName {
  if (process.env.ASKOOSU_AI_PROVIDER === 'xai') return 'xai';
  return 'openai';
}

export function getXaiApiMode(): XaiApiMode {
  if (process.env.XAI_API_MODE === 'chat') return 'chat';
  return 'responses';
}
