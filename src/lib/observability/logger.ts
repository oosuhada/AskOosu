type LogLevel = 'info' | 'warn' | 'error';
type LogData = Record<string, unknown>;

const SERVICE_NAME = 'askoosu';
const MAX_LOG_STRING_LENGTH = 500;
const MAX_LOG_ARRAY_LENGTH = 25;
const MAX_LOG_DEPTH = 5;
const REDACTED = '[redacted]';

const FORBIDDEN_LOG_KEYS = new Set([
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'context',
  'contexttext',
  'fullanswer',
  'message',
  'messagemetadata',
  'messages',
  'modelmessages',
  'password',
  'prompt',
  'promptmessages',
  'question',
  'rawcontext',
  'rawanswer',
  'rawprompt',
  'rawretrievedcontext',
  'rawuserquestion',
  'retrievedcontext',
  'retrievedwikicontext',
  'section_path',
  'secret',
  'sourcechunkids',
  'source_chunk_ids',
  'system',
  'systemprompt',
  'token',
  'userquestion',
  'answer',
]);

export function logInfo(eventName: string, data: LogData = {}) {
  writeLog('info', eventName, data);
}

export function logWarn(eventName: string, data: LogData = {}) {
  writeLog('warn', eventName, data);
}

export function logError(eventName: string, data: LogData = {}) {
  writeLog('error', eventName, data);
}

export function getLocalQuestionPreview(
  question: string,
  maxLength = 120
): string | undefined {
  if (!shouldLogQuestionPreview()) return undefined;

  const normalizedQuestion = question.trim().replace(/\s+/g, ' ');
  if (!normalizedQuestion) return undefined;

  return truncateLogString(normalizedQuestion, maxLength);
}

export function toLogError(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: truncateLogString(error.message),
    };
  }

  return {
    errorMessage:
      typeof error === 'string'
        ? truncateLogString(error)
        : 'Unknown non-error throw',
  };
}

function writeLog(level: LogLevel, eventName: string, data: LogData) {
  const sanitizedData = sanitizeLogValue(data);
  const record =
    sanitizedData && typeof sanitizedData === 'object' && !Array.isArray(sanitizedData)
      ? { ...(sanitizedData as LogData) }
      : {};

  delete record.ts;
  delete record.level;
  delete record.svc;
  delete record.event;

  const payload = {
    ts: new Date().toISOString(),
    level,
    svc: SERVICE_NAME,
    event: eventName,
    ...record,
  };
  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.info(line);
}

function sanitizeLogValue(value: unknown, depth = 0, key?: string): unknown {
  if (key && isForbiddenLogKey(key)) return REDACTED;
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value === 'string') return truncateLogString(value);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return toLogError(value);

  if (depth >= MAX_LOG_DEPTH) return '[max_depth]';

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_LOG_ARRAY_LENGTH)
      .map((item) => sanitizeLogValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const sanitizedRecord: LogData = {};

    for (const [entryKey, entryValue] of Object.entries(value)) {
      const sanitizedValue = sanitizeLogValue(entryValue, depth + 1, entryKey);
      if (sanitizedValue !== undefined) {
        sanitizedRecord[entryKey] = sanitizedValue;
      }
    }

    return sanitizedRecord;
  }

  return String(value);
}

function isForbiddenLogKey(key: string) {
  const normalizedKey = key.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  return FORBIDDEN_LOG_KEYS.has(normalizedKey);
}

function truncateLogString(value: string, maxLength = MAX_LOG_STRING_LENGTH) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

function shouldLogQuestionPreview() {
  const explicitValue = process.env.ASKOOSU_LOG_QUESTION_PREVIEW?.toLowerCase();
  if (explicitValue === 'true' || explicitValue === '1') return true;
  if (explicitValue === 'false' || explicitValue === '0') return false;

  return process.env.NODE_ENV !== 'production';
}
