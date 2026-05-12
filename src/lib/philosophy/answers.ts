import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { FaqAnswer } from '@/lib/faq/answers';

type PhilosophySourceDocument = {
  path: string;
  language: ChatLanguage;
  author: 'claude' | 'gpt';
};

type PhilosophyAnswerInput = Omit<
  FaqAnswer,
  'answer' | 'cacheMode' | 'answerSource' | 'skippedGroq' | 'visibility'
> & {
  cacheMode?: FaqAnswer['cacheMode'];
  visibility?: FaqAnswer['visibility'];
};

const PHILOSOPHY_SOURCE_DOCUMENTS: PhilosophySourceDocument[] = [
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-visionary-claude.md',
    language: 'ko',
    author: 'claude',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-visionary-claude.md',
    language: 'en',
    author: 'claude',
  },
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-visionary-gpt.md',
    language: 'ko',
    author: 'gpt',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-visionary-gpt.md',
    language: 'en',
    author: 'gpt',
  },
];

const BASE_GUARDRAILS = [
  'Serve only after recruiter-risk matching has had priority.',
  "Frame this as Oosu's working thesis, not a universal industry claim.",
  'Do not say teams disappear, people are replaced, or one person is always better than a team.',
  'Keep human judgment, collaboration, and verification central.',
];

export const PHILOSOPHY_ANSWERS: FaqAnswer[] = loadPhilosophyAnswers();

export function findPhilosophyAnswerById(
  id: string | null | undefined,
  language: ChatLanguage
) {
  if (!id) return null;
  return (
    PHILOSOPHY_ANSWERS.find(
      (answer) => answer.id === id && answer.language === language
    ) ??
    PHILOSOPHY_ANSWERS.find(
      (answer) => answer.intentId === id && answer.language === language
    ) ??
    PHILOSOPHY_ANSWERS.find(
      (answer) => answer.legacyIds?.includes(id) && answer.language === language
    ) ??
    null
  );
}

function loadPhilosophyAnswers() {
  return PHILOSOPHY_SOURCE_DOCUMENTS.flatMap((document) => {
    try {
      const content = readFileSync(
        path.join(process.cwd(), document.path),
        'utf8'
      );

      return parseFaqSections(content).flatMap((section) =>
        sectionToPhilosophyAnswer({ section, document })
      );
    } catch (error) {
      console.warn('Philosophy answer source was not loaded.', {
        path: document.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  });
}

function sectionToPhilosophyAnswer({
  section,
  document,
}: {
  section: string;
  document: PhilosophySourceDocument;
}) {
  const id = extractField(section, 'FAQ ID');
  const intentId = extractField(section, 'Intent ID');
  const visibility = normalizeVisibility(extractField(section, 'Visibility'));
  const patterns = extractBacktickValues(extractField(section, 'Patterns'));
  const sourceChunkIds = extractBacktickValues(
    extractField(section, 'Source Chunk IDs')
  );
  const displayQuestion = extractFaqHeading(section);
  const shortAnswer = appendSourceFooter(
    normalizePortfolioVoice(
      extractAnswerBlock(section, 'Short Answer'),
      document.language
    )
  );
  const defaultAnswer = appendSourceFooter(
    normalizePortfolioVoice(
      extractAnswerBlock(section, 'Default Answer'),
      document.language
    )
  );
  const detailedAnswer = appendSourceFooter(
    normalizePortfolioVoice(
      extractAnswerBlock(section, 'Detailed Answer'),
      document.language
    )
  );
  const doNotSayItems = extractListBlock(section, 'Do Not Say');

  if (
    !id ||
    !intentId ||
    visibility !== 'public' ||
    !displayQuestion ||
    !shortAnswer ||
    !defaultAnswer
  ) {
    return [];
  }

  return [
    createPhilosophyAnswer({
      id,
      intentId,
      entityId: getEntityId(id, intentId),
      language: document.language,
      quickLabel: getQuickLabel(intentId, displayQuestion, document.language),
      displayQuestion,
      alternativeDisplayQuestions: patterns,
      patterns: enhancePhilosophyPatterns({
        id,
        intentId,
        patterns,
        language: document.language,
      }),
      shortAnswer,
      defaultAnswer,
      detailedAnswer: detailedAnswer || undefined,
      renderSpec: {
        layout: 'text_only',
        density: 'standard',
        leadVisual: 'vision_card',
        components: ['SourceBadgeList'],
      },
      visualBlocks: [{ type: 'sourceBadges' }],
      sourceChunkIds: uniqueText([intentId, id, ...sourceChunkIds]),
      visibility,
      hasTodo: false,
      freshness: 'stable',
      guardrails: uniqueText([
        ...BASE_GUARDRAILS,
        ...doNotSayItems.map((item) => `Do not say: ${item}`),
      ]),
      matchedEntityIds: uniqueText([
        'oosu_philosophy',
        'ai_thesis',
        'profile',
        getEntityId(id, intentId),
      ]),
      confidence: document.author === 'gpt' ? 0.96 : 0.93,
    }),
  ];
}

function createPhilosophyAnswer(input: PhilosophyAnswerInput): FaqAnswer {
  return {
    ...input,
    answer: input.defaultAnswer,
    cacheMode: input.cacheMode ?? 'direct_cache',
    answerSource: 'philosophy_docs',
    skippedGroq: true,
    visibility: input.visibility ?? 'public',
  };
}

function parseFaqSections(content: string) {
  const matches = Array.from(content.matchAll(/^###\s+FAQ\s+.+$/gm));

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? content.length;
    return content.slice(start, end).trim();
  });
}

function extractFaqHeading(section: string) {
  const heading = section.match(/^###\s+FAQ\s+[^.]+[.]\s*(.+)$/m)?.[1] ?? '';
  return heading.trim();
}

function extractField(section: string, field: string) {
  const pattern = new RegExp(
    String.raw`\|\s*${escapeRegExp(field)}\s*\|\s*([^|]+?)\s*\|`,
    'i'
  );
  const match = section.match(pattern);
  return match?.[1]?.trim().replace(/^`|`$/g, '') ?? '';
}

function extractAnswerBlock(section: string, label: string) {
  const pattern = new RegExp(
    String.raw`\*\*${escapeRegExp(label)}\*\*\s*([\s\S]*?)(?=\n\*\*(?:Short Answer|Default Answer|Detailed Answer|Do Not Say)\*\*|\n---|\n###\s+FAQ|$)`,
    'i'
  );
  const match = section.match(pattern);

  return cleanMarkdownAnswer(match?.[1] ?? '');
}

function extractListBlock(section: string, label: string) {
  const pattern = new RegExp(
    String.raw`\*\*${escapeRegExp(label)}\*\*\s*([\s\S]*?)(?=\n\*\*(?:Short Answer|Default Answer|Detailed Answer|Do Not Say)\*\*|\n---|\n###\s+FAQ|$)`,
    'i'
  );
  const match = section.match(pattern);
  const block = match?.[1] ?? '';

  return block
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^[-*]\s+/, '')
        .trim()
    )
    .filter(Boolean);
}

function cleanMarkdownAnswer(value: string) {
  return value
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function normalizePortfolioVoice(value: string, language: ChatLanguage) {
  if (!value) return value;
  if (language === 'ko') return normalizeKoreanPortfolioVoice(value);
  return normalizeEnglishPortfolioVoice(value);
}

function normalizeKoreanPortfolioVoice(value: string) {
  return value
    .replace(
      /이 질문에 대한 제 생각은 이래요\./g,
      '이 질문에 대한 우수의 관점은 이렇습니다.'
    )
    .replace(/저는/g, '우수는')
    .replace(/제가/g, '우수가')
    .replace(/제게/g, '우수에게')
    .replace(/저에게/g, '우수에게')
    .replace(/저를/g, '우수를')
    .replace(/저의/g, '우수의')
    .replace(/제\s/g, '우수의 ');
}

function normalizeEnglishPortfolioVoice(value: string) {
  return value
    .replace(/\bHonestly,\s*/g, '')
    .replace(/\bI am\b/g, 'Oosu is')
    .replace(/\bI'm\b/g, 'Oosu is')
    .replace(/\bI've\b/g, 'Oosu has')
    .replace(/\bI have\b/g, 'Oosu has')
    .replace(/\bI think\b/g, 'Oosu thinks')
    .replace(/\bI believe\b/g, 'Oosu believes')
    .replace(/\bI use\b/g, 'Oosu uses')
    .replace(/\bI can\b/g, 'Oosu can')
    .replace(/\bI want\b/g, 'Oosu wants')
    .replace(/\bI\b/g, 'Oosu')
    .replace(/\bmy\b/gi, "Oosu's")
    .replace(/\bme\b/gi, 'Oosu');
}

function appendSourceFooter(value: string) {
  if (!value || /Source:\s*oosu\.dev Visionary Builder Docs/i.test(value)) {
    return value;
  }

  return `${value}\n\nSource: oosu.dev Visionary Builder Docs`;
}

function extractBacktickValues(value: string) {
  const values = Array.from(value.matchAll(/`([^`]+)`/g), (match) =>
    match[1].trim()
  );

  if (values.length > 0) return values;

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function enhancePhilosophyPatterns({
  id,
  intentId,
  patterns,
  language,
}: {
  id: string;
  intentId: string;
  patterns: string[];
  language: ChatLanguage;
}) {
  const shared =
    language === 'ko'
      ? [
          'AI 시대',
          '우수의 관점',
          '우수의 철학',
          '미래 전망',
          'AI 에이전트',
          'AI-connected product builder',
        ]
      : [
          'AI era',
          "Oosu's perspective",
          "Oosu's philosophy",
          'future of teams',
          'AI agents',
          'AI-connected product builder',
        ];
  const additions: Record<string, string[]> = {
    'vision.team_future':
      language === 'ko'
        ? ['팀 프로젝트 미래', 'AI 시대 팀', '팀은 사라지나']
        : ['future of teams', 'will teams disappear', 'AI era teams'],
    'ai_thesis.future_of_teams':
      language === 'ko'
        ? ['팀 프로젝트 미래', 'AI 시대 팀', '팀은 사라지나']
        : ['future of teams', 'will teams disappear', 'AI era teams'],
    'ai_thesis.solo_vs_team':
      language === 'ko'
        ? ['혼자 일하나', '팀에서도 괜찮나', '협업을 싫어하나']
        : ['solo builder', 'work in a team', 'does Oosu dislike collaboration'],
    'ai_thesis.ai_dependency':
      language === 'ko'
        ? ['AI 의존', 'AI 없으면 개발 못하나', '프롬프트만']
        : ['AI dependency', 'code without AI', 'just prompting'],
    'ai_thesis.pm_or_developer':
      language === 'ko'
        ? ['PM인가 개발자인가', 'PO인가 개발자인가', '포지션']
        : ['PM or developer', 'product owner or developer', 'role fit'],
  };

  return uniqueText([
    id,
    intentId,
    ...patterns,
    ...shared,
    ...(additions[intentId] ?? []),
  ]);
}

function getEntityId(id: string, intentId: string) {
  if (id.startsWith('faq.vision')) return 'oosu_philosophy';
  if (intentId.includes('team')) return 'ai_thesis.team';
  if (intentId.includes('role') || intentId.includes('pm')) {
    return 'ai_thesis.role_fit';
  }
  return 'ai_thesis';
}

function getQuickLabel(
  intentId: string,
  displayQuestion: string,
  language: ChatLanguage
) {
  const key = intentId.split('.').at(-1)?.replaceAll('_', ' ') ?? intentId;
  const labels: Record<string, Record<ChatLanguage, string>> = {
    ai_developer_future: { ko: 'AI 시대 경쟁력', en: 'AI-era edge' },
    team_future: { ko: '팀의 미래', en: 'Team future' },
    ai_workflow_origin: { ko: 'AI 워크플로', en: 'AI workflow' },
    pm_or_developer: { ko: 'PM/개발자', en: 'PM or developer' },
    learning_dev_now: { ko: '개발 학습', en: 'Learning dev now' },
    ai_philosophy_summary: { ko: 'AI 철학', en: 'AI philosophy' },
    solo_ai_work: { ko: '혼자 AI와 일하기', en: 'Solo with AI' },
    why_chatbot_portfolio: { ko: '챗봇 포트폴리오', en: 'Chatbot portfolio' },
    five_year_future: { ko: '5년 후', en: 'Five-year future' },
    competitive_edge: { ko: 'AI 시대 경쟁력', en: 'AI-era edge' },
    future_of_teams: { ko: '팀의 미래', en: 'Team future' },
    solo_vs_team: { ko: '팀과 1인 작업', en: 'Solo vs team' },
    ai_dependency: { ko: 'AI 의존도', en: 'AI dependency' },
    agent_workflow: { ko: 'AI 에이전트', en: 'AI agents' },
    one_sentence: { ko: '한 문장 요약', en: 'One sentence' },
  };

  return (
    labels[key.replaceAll(' ', '_')]?.[language] ??
    displayQuestion.slice(0, language === 'ko' ? 18 : 28)
  );
}

function normalizeVisibility(value: string): FaqAnswer['visibility'] {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'public') return 'public';
  if (normalized === 'private') return 'private';
  return 'limited';
}

function uniqueText(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
