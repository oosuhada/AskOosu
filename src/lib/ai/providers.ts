import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { APICallError, RetryError, type LanguageModel } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { logInfo, logWarn } from '@/lib/observability/logger';

export type ChatProviderName =
  | 'openai'
  | 'xai'
  | 'groq'
  | 'google_vertex'
  | 'openrouter';
type XaiApiMode = 'responses' | 'chat';

export type ChatModelSelection = {
  model: LanguageModel;
  provider: ChatProviderName;
  modelName: string;
  groqKeyId?: string;
};

type GroqCredential = {
  id: string;
  label: string;
  apiKey: string;
};

type GroqKeyRuntimeState = {
  failureCount: number;
  disabledUntil: number;
  disabledReason?: 'failures' | 'quota';
};

type GroqKeyPoolState = {
  cursor: number;
  keys: Map<string, GroqKeyRuntimeState>;
};

declare global {
  // SINGLE-PROCESS ONLY: this key pool state is process-local and is acceptable
  // for the current Mac mini Docker single-instance deployment. If AskOosu is
  // scaled to multiple app instances or serverless, move provider status to
  // Postgres or another shared store.
  // eslint-disable-next-line no-var
  var askOosuGroqKeyPool: GroqKeyPoolState | undefined;
}

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_XAI_MODEL = 'grok-4';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_GOOGLE_VERTEX_MODEL = 'gemini-2.5-flash';
const DEFAULT_GOOGLE_VERTEX_LOCATION = 'us-central1';
const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash';
const DEFAULT_GROQ_FAILURE_THRESHOLD = 3;
const DEFAULT_GROQ_COOLDOWN_MS = 15 * 60 * 1000;
const DEFAULT_GROQ_QUOTA_COOLDOWN_MS = 60 * 60 * 1000;
const XAI_BASE_URL = 'https://api.x.ai/v1';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export function getChatModel(): ChatModelSelection {
  return getChatModelForProvider(getChatProviderName());
}

export function getFallbackChatModel() {
  const primaryProvider = getChatProviderName();
  const configuredFallbackProvider = getFallbackChatProviderName();

  if (
    configuredFallbackProvider &&
    configuredFallbackProvider !== primaryProvider &&
    hasProviderCredentials(configuredFallbackProvider)
  ) {
    return getChatModelForProvider(configuredFallbackProvider);
  }

  if (
    primaryProvider !== 'google_vertex' &&
    isGoogleAiEnabled() &&
    hasGoogleVertexCredentials()
  ) {
    return getGoogleVertexChatModel();
  }

  if (primaryProvider !== 'openrouter' && hasOpenRouterCredentials()) {
    return getOpenRouterChatModel();
  }

  return null;
}

export function hasChatModelCredentials() {
  const provider = getChatProviderName();

  if (provider === 'groq') return getGroqCredentials().length > 0;
  if (provider === 'xai') return Boolean(process.env.XAI_API_KEY);
  if (provider === 'google_vertex') return hasGoogleVertexCredentials();
  if (provider === 'openrouter') return hasOpenRouterCredentials();

  return Boolean(process.env.OPENAI_API_KEY);
}

export function getChatProviderName(): ChatProviderName {
  if (isGoogleVertexProviderName(process.env.ASKOOSU_AI_PROVIDER)) {
    return 'google_vertex';
  }
  if (process.env.ASKOOSU_AI_PROVIDER === 'groq') return 'groq';
  if (process.env.ASKOOSU_AI_PROVIDER === 'xai') return 'xai';
  if (process.env.ASKOOSU_AI_PROVIDER === 'openrouter') return 'openrouter';
  if (process.env.ASKOOSU_AI_PROVIDER === 'openai') return 'openai';
  if (getGroqCredentials().length > 0) return 'groq';
  if (process.env.XAI_API_KEY) return 'xai';
  if (hasOpenRouterCredentials()) return 'openrouter';
  if (hasGoogleVertexCredentials()) return 'google_vertex';
  return 'openai';
}

export function getXaiApiMode(): XaiApiMode {
  if (process.env.XAI_API_MODE === 'chat') return 'chat';
  return 'responses';
}

export function recordChatModelSuccess(selection: ChatModelSelection) {
  if (selection.provider !== 'groq' || !selection.groqKeyId) return;

  const state = getGroqKeyPoolState().keys.get(selection.groqKeyId);
  if (!state) return;

  state.failureCount = 0;
  state.disabledUntil = 0;
  state.disabledReason = undefined;
}

export function recordChatModelFailure(
  selection: ChatModelSelection,
  error: unknown
) {
  if (selection.provider !== 'groq' || !selection.groqKeyId) return;

  const providerFailure = getProviderFailure(error);
  if (!providerFailure.shouldCount) return;

  const pool = getGroqKeyPoolState();
  const state = getOrCreateGroqRuntimeState(selection.groqKeyId);
  const now = Date.now();

  if (providerFailure.isQuotaOrRateLimit) {
    state.failureCount = getGroqFailureThreshold();
    state.disabledUntil = now + getGroqQuotaCooldownMs();
    state.disabledReason = 'quota';
    logGroqKeyDisabled({
      groqKeyId: selection.groqKeyId,
      reason: state.disabledReason,
      disabledUntil: state.disabledUntil,
      failureCount: state.failureCount,
      errorCode: getChatProviderErrorCode(error),
    });
  } else {
    state.failureCount += 1;

    if (state.failureCount >= getGroqFailureThreshold()) {
      state.disabledUntil = now + getGroqCooldownMs();
      state.disabledReason = 'failures';
      logGroqKeyDisabled({
        groqKeyId: selection.groqKeyId,
        reason: state.disabledReason,
        disabledUntil: state.disabledUntil,
        failureCount: state.failureCount,
        errorCode: getChatProviderErrorCode(error),
      });
    }
  }

  pool.keys.set(selection.groqKeyId, state);
}

export function isChatModelRateLimitError(error: unknown) {
  return getProviderFailure(error).isQuotaOrRateLimit;
}

export function getChatProviderErrorCode(error: unknown) {
  if (isChatModelRateLimitError(error)) return 'rate_limit_or_quota';
  const message = errorHandler(error).toLowerCase();
  if (isNetworkErrorMessage(message)) return 'network_error';
  return 'provider_error';
}

function getGroqChatModel(): ChatModelSelection {
  const credential = selectGroqCredential();
  const groq = createGroq({
    apiKey: credential.apiKey,
    baseURL: process.env.GROQ_BASE_URL ?? GROQ_BASE_URL,
  });
  const modelName = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;

  return {
    model: groq(modelName),
    provider: 'groq',
    modelName,
    groqKeyId: credential.id,
  };
}

function getXaiChatModel(): ChatModelSelection {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    throw new Error('XAI_API_KEY is required when ASKOOSU_AI_PROVIDER=xai.');
  }

  const xai = createXai({
    apiKey,
    baseURL: process.env.XAI_BASE_URL ?? XAI_BASE_URL,
  });

  const modelName = process.env.XAI_MODEL ?? DEFAULT_XAI_MODEL;
  const model =
    getXaiApiMode() === 'chat' ? xai.chat(modelName) : xai.responses(modelName);

  return { model, provider: 'xai', modelName };
}

function getOpenRouterChatModel(): ChatModelSelection {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is required when ASKOOSU_AI_PROVIDER=openrouter.'
    );
  }

  const openrouter = createOpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL ?? OPENROUTER_BASE_URL,
    name: 'openrouter',
    headers: {
      'HTTP-Referer':
        process.env.OPENROUTER_SITE_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        'https://oosu.dev',
      'X-Title': process.env.OPENROUTER_SITE_NAME ?? 'AskOosu',
    },
  });
  const modelName = process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

  return {
    model: openrouter.chat(modelName),
    provider: 'openrouter',
    modelName,
  };
}

function getGoogleVertexChatModel(): ChatModelSelection {
  const apiKey = process.env.GOOGLE_VERTEX_API_KEY;
  const modelName =
    process.env.GOOGLE_VERTEX_MODEL ?? DEFAULT_GOOGLE_VERTEX_MODEL;
  const vertex = createVertex({
    ...(apiKey ? { apiKey } : {}),
    ...getGoogleAuthOptions(),
    project: getGoogleVertexProject(),
    location:
      process.env.GOOGLE_VERTEX_LOCATION ?? DEFAULT_GOOGLE_VERTEX_LOCATION,
  });

  return {
    model: vertex(modelName),
    provider: 'google_vertex',
    modelName,
  };
}

function hasGoogleVertexCredentials() {
  return Boolean(
    process.env.GOOGLE_VERTEX_API_KEY ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      hasGoogleAuthEnvCredentials() ||
      hasApplicationDefaultCredentialsFile() ||
      process.env.GOOGLE_VERTEX_USE_METADATA_SERVER === 'true'
  );
}

function isGoogleAiEnabled() {
  const value = process.env.GOOGLE_AI_ENABLED?.toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

function getGoogleVertexProject() {
  return (
    process.env.GOOGLE_VERTEX_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    getApplicationDefaultCredentialsProject()
  );
}

function getChatModelForProvider(provider: ChatProviderName): ChatModelSelection {
  if (provider === 'groq') return getGroqChatModel();
  if (provider === 'xai') return getXaiChatModel();
  if (provider === 'google_vertex') return getGoogleVertexChatModel();
  if (provider === 'openrouter') return getOpenRouterChatModel();

  const modelName = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;
  return {
    model: openai(modelName),
    provider,
    modelName,
  };
}

function getFallbackChatProviderName(): ChatProviderName | null {
  return parseProviderName(process.env.ASKOOSU_FALLBACK_AI_PROVIDER);
}

function parseProviderName(value: string | undefined): ChatProviderName | null {
  if (isGoogleVertexProviderName(value)) return 'google_vertex';
  if (value === 'groq' || value === 'xai' || value === 'openai') return value;
  if (value === 'openrouter') return 'openrouter';
  return null;
}

function hasProviderCredentials(provider: ChatProviderName) {
  if (provider === 'groq') return getGroqCredentials().length > 0;
  if (provider === 'xai') return Boolean(process.env.XAI_API_KEY);
  if (provider === 'google_vertex') return hasGoogleVertexCredentials();
  if (provider === 'openrouter') return hasOpenRouterCredentials();
  return Boolean(process.env.OPENAI_API_KEY);
}

function hasOpenRouterCredentials() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function getGoogleAuthOptions() {
  if (!hasGoogleAuthEnvCredentials()) return {};

  return {
    googleAuthOptions: {
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      },
    },
  };
}

function hasGoogleAuthEnvCredentials() {
  return Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
}

function hasApplicationDefaultCredentialsFile() {
  const credentialsPath = getApplicationDefaultCredentialsPath();
  return Boolean(credentialsPath && existsSync(credentialsPath));
}

function getApplicationDefaultCredentialsProject() {
  const credentialsPath = getApplicationDefaultCredentialsPath();
  if (!credentialsPath || !existsSync(credentialsPath)) return undefined;

  try {
    const rawCredentials = readFileSync(credentialsPath, 'utf8');
    const credentials = JSON.parse(rawCredentials) as {
      quota_project_id?: unknown;
      project_id?: unknown;
    };
    const project =
      typeof credentials.quota_project_id === 'string'
        ? credentials.quota_project_id
        : credentials.project_id;

    return typeof project === 'string' && project.trim()
      ? project.trim()
      : undefined;
  } catch {
    return undefined;
  }
}

function getApplicationDefaultCredentialsPath() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const homeDirectory = process.env.HOME || homedir();
  if (!homeDirectory) return undefined;
  return path.join(
    homeDirectory,
    '.config',
    'gcloud',
    'application_default_credentials.json'
  );
}

function isGoogleVertexProviderName(value: string | undefined) {
  return value === 'google_vertex' || value === 'vertex' || value === 'google';
}

function selectGroqCredential() {
  const credentials = getGroqCredentials();

  if (credentials.length === 0) {
    throw new Error(
      'GROQ_API_KEYS or GROQ_API_KEY is required when ASKOOSU_AI_PROVIDER=groq.'
    );
  }

  const pool = getGroqKeyPoolState();
  const now = Date.now();

  for (const credential of credentials) {
    const state = getOrCreateGroqRuntimeState(credential.id);

    if (state.disabledUntil > 0 && state.disabledUntil <= now) {
      state.failureCount = 0;
      state.disabledUntil = 0;
      state.disabledReason = undefined;
      logInfo('ai.groq_key_reactivated', {
        route: 'api/chat',
        provider: 'groq',
        groqKeyId: credential.id,
      });
    }
  }

  for (let offset = 0; offset < credentials.length; offset += 1) {
    const index = (pool.cursor + offset) % credentials.length;
    const credential = credentials[index];
    const state = getOrCreateGroqRuntimeState(credential.id);

    if (state.disabledUntil <= now) {
      pool.cursor = (index + 1) % credentials.length;
      return credential;
    }
  }

  const nextReactivation = Math.min(
    ...credentials.map((credential) => {
      const state = getOrCreateGroqRuntimeState(credential.id);
      return state.disabledUntil;
    })
  );

  const nextReactivationAt = new Date(nextReactivation).toISOString();
  logWarn('ai.groq_key_pool_exhausted', {
    route: 'api/chat',
    provider: 'groq',
    keyCount: credentials.length,
    nextReactivationAt,
  });

  throw new Error(
    `All configured Groq keys are cooling down. Next key reactivates at ${nextReactivationAt}.`
  );
}

function getGroqCredentials(): GroqCredential[] {
  const apiKeys = process.env.GROQ_API_KEYS;

  if (apiKeys) {
    return apiKeys
      .split(/[\n,]+/)
      .map((entry, index) => parseGroqCredential(entry, index))
      .filter((credential): credential is GroqCredential =>
        Boolean(credential)
      );
  }

  const singleApiKey = process.env.GROQ_API_KEY?.trim();
  if (!singleApiKey) return [];

  return [
    {
      id: getGroqCredentialId(singleApiKey),
      label: 'default',
      apiKey: singleApiKey,
    },
  ];
}

function parseGroqCredential(entry: string, index: number) {
  const trimmed = entry.trim();
  if (!trimmed) return null;

  const separatorIndex = getGroqCredentialSeparatorIndex(trimmed);
  if (separatorIndex === -1) {
    return {
      id: getGroqCredentialId(trimmed),
      label: `groq-${index + 1}`,
      apiKey: trimmed,
    };
  }

  const label = trimmed.slice(0, separatorIndex).trim() || `groq-${index + 1}`;
  const apiKey = trimmed.slice(separatorIndex + 1).trim();
  if (!apiKey) return null;

  return {
    id: getGroqCredentialId(apiKey),
    label,
    apiKey,
  };
}

function getGroqCredentialSeparatorIndex(value: string) {
  const separators = ['=', ':', '|']
    .map((separator) => value.indexOf(separator))
    .filter((index) => index > -1);

  if (separators.length === 0) return -1;
  return Math.min(...separators);
}

function getGroqCredentialId(apiKey: string) {
  return `groq-${hashString(apiKey)}`;
}

function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function getGroqKeyPoolState() {
  globalThis.askOosuGroqKeyPool ??= {
    cursor: 0,
    keys: new Map<string, GroqKeyRuntimeState>(),
  };

  return globalThis.askOosuGroqKeyPool;
}

function getOrCreateGroqRuntimeState(keyId: string) {
  const pool = getGroqKeyPoolState();
  const state = pool.keys.get(keyId);

  if (state) return state;

  const nextState: GroqKeyRuntimeState = {
    failureCount: 0,
    disabledUntil: 0,
  };

  pool.keys.set(keyId, nextState);
  return nextState;
}

function logGroqKeyDisabled({
  groqKeyId,
  reason,
  disabledUntil,
  failureCount,
  errorCode,
}: {
  groqKeyId: string;
  reason: 'failures' | 'quota';
  disabledUntil: number;
  failureCount: number;
  errorCode: string;
}) {
  logWarn('ai.groq_key_disabled', {
    route: 'api/chat',
    provider: 'groq',
    groqKeyId,
    reason,
    disabledUntil: new Date(disabledUntil).toISOString(),
    failureCount,
    errorCode,
  });
}

function getProviderFailure(error: unknown) {
  const providerErrors = getNestedProviderErrors(error);
  const message = errorHandler(error);
  const messageIndicatesQuotaOrRateLimit = isQuotaOrRateLimitMessage(message);
  const shouldCount =
    providerErrors.length > 0 ||
    isNetworkErrorMessage(message) ||
    messageIndicatesQuotaOrRateLimit;
  const isQuotaOrRateLimit =
    messageIndicatesQuotaOrRateLimit ||
    providerErrors.some(isQuotaOrRateLimitError);

  return { shouldCount, isQuotaOrRateLimit };
}

function getNestedProviderErrors(error: unknown, seen = new Set<unknown>()) {
  if (error == null || seen.has(error)) return [];
  seen.add(error);

  const errors: unknown[] = [];

  if (APICallError.isInstance(error)) {
    errors.push(error);
  }

  if (RetryError.isInstance(error)) {
    for (const nestedError of error.errors) {
      errors.push(...getNestedProviderErrors(nestedError, seen));
    }
  }

  const maybeError = error as { cause?: unknown; lastError?: unknown };
  if (maybeError.cause) {
    errors.push(...getNestedProviderErrors(maybeError.cause, seen));
  }
  if (maybeError.lastError) {
    errors.push(...getNestedProviderErrors(maybeError.lastError, seen));
  }

  return errors;
}

function isQuotaOrRateLimitError(error: unknown) {
  const statusCode = APICallError.isInstance(error)
    ? error.statusCode
    : undefined;

  if (statusCode === 429) return true;

  return isQuotaOrRateLimitMessage(errorHandler(error));
}

function isQuotaOrRateLimitMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('quota') ||
    normalized.includes('rate limit') ||
    normalized.includes('rate_limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('insufficient_quota')
  );
}

function isNetworkErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('fetch failed') ||
    normalized.includes('network') ||
    normalized.includes('econnreset') ||
    normalized.includes('etimedout') ||
    normalized.includes('timeout')
  );
}

function errorHandler(error: unknown) {
  if (error == null) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

function getGroqFailureThreshold() {
  return getPositiveIntegerEnv(
    'GROQ_KEY_FAILURE_THRESHOLD',
    DEFAULT_GROQ_FAILURE_THRESHOLD
  );
}

function getGroqCooldownMs() {
  return getPositiveIntegerEnv(
    'GROQ_KEY_COOLDOWN_MS',
    DEFAULT_GROQ_COOLDOWN_MS
  );
}

function getGroqQuotaCooldownMs() {
  return getPositiveIntegerEnv(
    'GROQ_KEY_QUOTA_COOLDOWN_MS',
    DEFAULT_GROQ_QUOTA_COOLDOWN_MS
  );
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
