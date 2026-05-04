import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

type EvalQuestion = {
  id: number;
  question: string;
  expectedEntityIds: string[];
  expectedEvidence: string;
};

type SearchResult = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[];
  score: number;
  contentPreview?: string;
  has_todo: boolean;
  visibility: string;
};

type SearchPayload = {
  ok: boolean;
  results: SearchResult[];
  warnings?: string[];
  error?: string;
  searchMode?: string;
};

type EvalArgs = {
  baseUrl: string;
  limit: number;
  chat: boolean;
  json: boolean;
  strict: boolean;
  help: boolean;
};

type EvalResult = {
  id: number;
  question: string;
  ok: boolean;
  expectedEntityIds: string[];
  matchedEntityIds: string[];
  matchedExpectedEntityIds: string[];
  hasTodo: boolean;
  visibilityWarnings: string[];
  searchWarnings: string[];
  topChunks: Array<{
    chunkId: string;
    title: string;
    entityId: string | null;
    score: number;
    sectionPath: string;
    hasTodo: boolean;
    visibility: string;
  }>;
  chatAnswerPreview?: string;
  error?: string;
};

const EVAL_QUESTIONS: EvalQuestion[] = [
  {
    id: 1,
    question: '우수는 어떤 개발자예요?',
    expectedEntityIds: ['profile.identity', 'profile.career'],
    expectedEvidence:
      'Profile, current title, growth direction, AI-connected fullstack positioning',
  },
  {
    id: 2,
    question: 'AskOosu 프로젝트를 설명해줘.',
    expectedEntityIds: ['project.askoosu'],
    expectedEvidence:
      'AskOosu project story, RAG/Notion/Groq architecture, conversational portfolio intent',
  },
  {
    id: 3,
    question: 'Instagram Clone은 어떤 풀스택 경험을 보여주나요?',
    expectedEntityIds: ['project.instagram_clone'],
    expectedEvidence: 'Fullstack SNS practice and product loop evidence',
  },
  {
    id: 4,
    question: 'Sticks & Stones 프로젝트에서 가장 어려웠던 점은?',
    expectedEntityIds: ['project.sticks_and_stones'],
    expectedEvidence:
      'Real service migration, WordPress/legacy constraints, frontend renewal',
  },
  {
    id: 5,
    question: 'Portfoli-Oh!와 AskOosu의 차이는?',
    expectedEntityIds: ['project.portfoli_oh', 'project.askoosu'],
    expectedEvidence:
      'Portfoli-Oh! static/interactive portfolio vs AskOosu RAG conversation',
  },
  {
    id: 6,
    question: '우수살롱 경험이 개발과 어떻게 연결되나요?',
    expectedEntityIds: ['career.oosu_salon'],
    expectedEvidence:
      'OOSU SALON, customer empathy, product thinking, service design',
  },
  {
    id: 7,
    question: '비즈니스 전공이 개발에 어떤 도움이 되나요?',
    expectedEntityIds: ['profile.identity', 'profile.career'],
    expectedEvidence: 'Business major, marketing, branding, planning',
  },
  {
    id: 8,
    question: '협업 스타일은 어떤가요?',
    expectedEntityIds: ['profile.career'],
    expectedEvidence: 'Collaboration, communication, iteration, delivery style',
  },
  {
    id: 9,
    question: 'AI 도구를 어떻게 활용하나요?',
    expectedEntityIds: ['project.askoosu', 'policy.guardrail'],
    expectedEvidence: 'AI workflow, RAG design, guardrails, verification',
  },
  {
    id: 10,
    question: '현재 관심 있는 포지션은?',
    expectedEntityIds: ['profile.career', 'profile.identity'],
    expectedEvidence:
      'Current target role and AI-connected fullstack direction',
  },
  {
    id: 11,
    question: '이력서 URL 알려줘.',
    expectedEntityIds: ['profile.identity', 'policy.guardrail'],
    expectedEvidence: 'Resume TODO handling and fallback contact guidance',
  },
  {
    id: 12,
    question: '라이브 URL이 없는 프로젝트는 어떻게 답해야 하나요?',
    expectedEntityIds: ['policy.guardrail'],
    expectedEvidence:
      'Guardrail, TODO handling, private/unavailable URL policy',
  },
];

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const adminToken = getRagAdminToken();
  const canRunChat = args.chat && hasGroqCredentials();
  const results: EvalResult[] = [];

  if (args.chat && !canRunChat) {
    console.log(
      'Chat mode requested, but GROQ_API_KEY/GROQ_API_KEYS is not configured. Running search-only mode.'
    );
  }

  console.log(`AskOosu RAG eval: ${EVAL_QUESTIONS.length} questions`);
  console.log(`Base URL: ${args.baseUrl}`);
  console.log(`Mode: ${canRunChat ? 'search + chat' : 'search-only'}`);
  console.log(`Limit: ${args.limit}`);
  console.log('');

  for (const item of EVAL_QUESTIONS) {
    const result = await evaluateQuestion({
      item,
      baseUrl: args.baseUrl,
      limit: args.limit,
      adminToken,
      includeChat: canRunChat,
    });

    results.push(result);

    if (!args.json) {
      printHumanResult(result);
    }
  }

  const summary = summarizeResults(results);

  if (args.json) {
    console.log(JSON.stringify({ summary, results }, null, 2));
  } else {
    console.log('Summary');
    console.log(
      `- search ok: ${summary.okCount}/${summary.total}, expected entity matched: ${summary.expectedMatchedCount}/${summary.total}`
    );
    console.log(
      `- questions with TODO evidence: ${summary.todoCount}, visibility warnings: ${summary.visibilityWarningCount}`
    );
    console.log(`- search warnings: ${summary.searchWarningCount}`);
  }

  if (
    args.strict &&
    (summary.okCount !== summary.total ||
      summary.expectedMatchedCount !== summary.total ||
      summary.visibilityWarningCount > 0)
  ) {
    process.exitCode = 1;
  }
}

async function evaluateQuestion({
  item,
  baseUrl,
  limit,
  adminToken,
  includeChat,
}: {
  item: EvalQuestion;
  baseUrl: string;
  limit: number;
  adminToken: string | null;
  includeChat: boolean;
}): Promise<EvalResult> {
  try {
    const payload = await searchQuestion({
      baseUrl,
      question: item.question,
      limit,
      adminToken,
    });
    const matchedEntityIds = getMatchedEntityIds(payload.results);
    const matchedExpectedEntityIds = item.expectedEntityIds.filter((entityId) =>
      matchedEntityIds.includes(entityId)
    );
    const visibilityWarnings = payload.results
      .filter((result) => result.visibility && result.visibility !== 'public')
      .map((result) => `${result.chunk_id}:${result.visibility}`);
    const hasTodo = payload.results.some((result) => result.has_todo);
    const topChunks = payload.results.slice(0, 5).map((result) => ({
      chunkId: result.chunk_id,
      title: result.title,
      entityId: result.entity_id,
      score: Number(result.score),
      sectionPath: result.section_path.join(' > '),
      hasTodo: result.has_todo,
      visibility: result.visibility,
    }));
    const chatAnswerPreview = includeChat
      ? await requestChatAnswerPreview({ baseUrl, question: item.question })
      : undefined;

    return {
      id: item.id,
      question: item.question,
      ok: payload.ok,
      expectedEntityIds: item.expectedEntityIds,
      matchedEntityIds,
      matchedExpectedEntityIds,
      hasTodo,
      visibilityWarnings,
      searchWarnings: payload.warnings ?? [],
      topChunks,
      chatAnswerPreview,
      error: payload.error,
    };
  } catch (error) {
    return {
      id: item.id,
      question: item.question,
      ok: false,
      expectedEntityIds: item.expectedEntityIds,
      matchedEntityIds: [],
      matchedExpectedEntityIds: [],
      hasTodo: false,
      visibilityWarnings: [],
      searchWarnings: [],
      topChunks: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function searchQuestion({
  baseUrl,
  question,
  limit,
  adminToken,
}: {
  baseUrl: string;
  question: string;
  limit: number;
  adminToken: string | null;
}) {
  const url = new URL('/api/rag/search', baseUrl);
  url.searchParams.set('q', question);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('debug', 'true');

  const response = await fetch(url, {
    headers: buildAdminHeaders(adminToken),
  });
  const payload = (await response.json().catch(() => ({}))) as SearchPayload;

  if (!response.ok && !payload.error) {
    payload.error = `HTTP ${response.status}`;
  }

  return {
    ok: payload.ok,
    results: Array.isArray(payload.results) ? payload.results : [],
    warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
    error: payload.error,
    searchMode: payload.searchMode,
  };
}

async function requestChatAnswerPreview({
  baseUrl,
  question,
}: {
  baseUrl: string;
  question: string;
}) {
  const response = await fetch(new URL('/api/chat', baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          id: `eval-${Date.now()}`,
          role: 'user',
          parts: [{ type: 'text', text: question }],
        },
      ],
    }),
  });
  const rawStream = await response.text();

  if (!response.ok) {
    return `chat HTTP ${response.status}: ${rawStream.slice(0, 240)}`;
  }

  return extractTextFromUiMessageStream(rawStream).slice(0, 500);
}

function extractTextFromUiMessageStream(rawStream: string) {
  let text = '';

  for (const line of rawStream.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith('data:')) continue;

    const rawData = trimmedLine.replace(/^data:\s*/, '');
    if (!rawData || rawData === '[DONE]') continue;

    try {
      const chunk = JSON.parse(rawData) as { type?: string; delta?: string };
      if (chunk.type === 'text-delta' && typeof chunk.delta === 'string') {
        text += chunk.delta;
      }
    } catch {
      // Ignore non-JSON stream control frames.
    }
  }

  return text.trim() || rawStream.slice(0, 500);
}

function printHumanResult(result: EvalResult) {
  const expectedSummary =
    result.matchedExpectedEntityIds.length > 0
      ? result.matchedExpectedEntityIds.join(', ')
      : 'none';

  console.log(`[${result.id}] ${result.question}`);
  console.log(`  ok: ${result.ok}`);
  console.log(`  expected matched: ${expectedSummary}`);
  console.log(
    `  matched entity ids: ${result.matchedEntityIds.join(', ') || 'none'}`
  );
  console.log(`  has_todo: ${result.hasTodo}`);
  console.log(
    `  visibility warnings: ${result.visibilityWarnings.join(', ') || 'none'}`
  );

  if (result.error) {
    console.log(`  error: ${result.error}`);
  }

  for (const [index, chunk] of result.topChunks.entries()) {
    console.log(
      `  ${index + 1}. ${chunk.chunkId} | ${chunk.entityId ?? 'none'} | ${chunk.score.toFixed(2)} | ${chunk.visibility}${chunk.hasTodo ? ' | TODO' : ''}`
    );
    console.log(
      `     ${chunk.title}${chunk.sectionPath ? ` > ${chunk.sectionPath}` : ''}`
    );
  }

  if (result.searchWarnings.length > 0) {
    console.log(`  warnings: ${result.searchWarnings.join(' | ')}`);
  }

  if (result.chatAnswerPreview) {
    console.log(`  chat preview: ${result.chatAnswerPreview}`);
  }

  console.log('');
}

function summarizeResults(results: EvalResult[]) {
  return {
    total: results.length,
    okCount: results.filter((result) => result.ok).length,
    expectedMatchedCount: results.filter(
      (result) => result.matchedExpectedEntityIds.length > 0
    ).length,
    todoCount: results.filter((result) => result.hasTodo).length,
    visibilityWarningCount: results.filter(
      (result) => result.visibilityWarnings.length > 0
    ).length,
    searchWarningCount: results.filter(
      (result) => result.searchWarnings.length > 0
    ).length,
  };
}

function getMatchedEntityIds(results: SearchResult[]) {
  return Array.from(
    new Set(
      results
        .map((result) => result.entity_id)
        .filter((entityId): entityId is string => Boolean(entityId))
    )
  );
}

function buildAdminHeaders(adminToken: string | null) {
  const headers = new Headers();

  if (adminToken) {
    headers.set('Authorization', `Bearer ${adminToken}`);
  }

  return headers;
}

function parseArgs(argv: string[]): EvalArgs {
  const result: EvalArgs = {
    baseUrl: normalizeBaseUrl(
      process.env.ASKOOSU_EVAL_BASE_URL || 'http://localhost:3000'
    ),
    limit: parsePositiveInt(process.env.ASKOOSU_EVAL_LIMIT, 5),
    chat: false,
    json: false,
    strict: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') result.help = true;
    if (arg === '--chat') result.chat = true;
    if (arg === '--json') result.json = true;
    if (arg === '--strict') result.strict = true;
    if (arg === '--base-url') {
      result.baseUrl = normalizeBaseUrl(argv[index + 1] ?? result.baseUrl);
      index += 1;
    }
    if (arg === '--limit') {
      result.limit = parsePositiveInt(argv[index + 1], result.limit);
      index += 1;
    }
  }

  return result;
}

function printHelp() {
  console.log(`AskOosu RAG eval

Usage:
  pnpm rag:eval
  pnpm rag:eval -- --base-url http://localhost:3001 --limit 8
  pnpm rag:eval -- --chat
  pnpm rag:eval -- --json
  pnpm rag:eval -- --strict

Options:
  --base-url <url>  App URL to call. Defaults to ASKOOSU_EVAL_BASE_URL or http://localhost:3000.
  --limit <n>       Number of chunks to retrieve per question. Defaults to 5.
  --chat            Also call /api/chat when Groq credentials are configured.
  --json            Print machine-readable JSON.
  --strict          Exit non-zero when a question fails, expected entities are missing, or visibility warnings appear.
`);
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsedValue = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function getRagAdminToken() {
  return (
    process.env.RAG_SYNC_SECRET?.trim() ||
    process.env.ASKOOSU_RAG_ADMIN_TOKEN?.trim() ||
    null
  );
}

function hasGroqCredentials() {
  return Boolean(
    process.env.GROQ_API_KEY?.trim() || process.env.GROQ_API_KEYS?.trim()
  );
}

function loadEnvFile(path: string) {
  const envPath = resolve(process.cwd(), path);
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = unquoteEnvValue(trimmedLine.slice(separatorIndex + 1).trim());

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
