import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { FaqAnswer } from './answers';

type RecruiterRiskSourceDocument = {
  path: string;
  language: 'ko' | 'en';
};

type RecruiterRiskFaqInput = Omit<
  FaqAnswer,
  'answer' | 'cacheMode' | 'answerSource' | 'skippedGroq' | 'visibility'
> & {
  cacheMode?: FaqAnswer['cacheMode'];
  visibility?: FaqAnswer['visibility'];
};

const RECRUITER_RISK_SOURCE_DOCUMENTS: RecruiterRiskSourceDocument[] = [
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-claude.md',
    language: 'ko',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-claude.md',
    language: 'en',
  },
];

export const RECRUITER_RISK_FAQ_ANSWERS: FaqAnswer[] = [
  ...createCompositeRetentionStartupAnswers(),
  ...loadRecruiterRiskFaqAnswers(),
];

function loadRecruiterRiskFaqAnswers() {
  return RECRUITER_RISK_SOURCE_DOCUMENTS.flatMap((document) => {
    try {
      const content = readFileSync(
        path.join(process.cwd(), document.path),
        'utf8'
      );

      return parseFaqSections(content).flatMap((section) =>
        sectionToFaqAnswer({ section, language: document.language })
      );
    } catch (error) {
      console.warn('Recruiter-risk FAQ source was not loaded.', {
        path: document.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  });
}

function sectionToFaqAnswer({
  section,
  language,
}: {
  section: string;
  language: 'ko' | 'en';
}) {
  const id = extractField(section, 'FAQ ID');
  const intentId = extractField(section, 'Intent ID');
  const entityId = extractField(section, 'Entity ID') || 'recruiter';
  const visibility = normalizeVisibility(extractField(section, 'Visibility'));
  const patterns = extractBacktickValues(extractField(section, 'Patterns'));
  const sourceChunkIds = extractBacktickValues(
    extractField(section, 'Source Chunk IDs')
  );
  const displayQuestion = extractFaqHeading(section);
  const shortAnswer = extractAnswerBlock(section, 'Short Answer');
  const defaultAnswer = extractAnswerBlock(section, 'Default Answer');
  const detailedAnswer = extractAnswerBlock(section, 'Detailed Answer');

  if (!id || !intentId || !displayQuestion || !shortAnswer || !defaultAnswer) {
    return [];
  }

  return [
    createRecruiterRiskAnswer({
      id,
      intentId,
      entityId,
      language,
      quickLabel: getQuickLabel(intentId, language),
      displayQuestion,
      alternativeDisplayQuestions: patterns,
      patterns: enhanceRecruiterRiskPatterns({ id, patterns, language }),
      shortAnswer,
      defaultAnswer,
      detailedAnswer: detailedAnswer || undefined,
      renderSpec: {
        layout: 'text_only',
        density: 'standard',
        components: ['SourceBadgeList'],
      },
      visualBlocks: [{ type: 'sourceBadges' }],
      sourceChunkIds: sourceChunkIds.length > 0 ? sourceChunkIds : [id],
      visibility,
      hasTodo: false,
      freshness: 'stable',
      guardrails: [
        'Treat recruiter-risk answers as direct responses only; do not expose them as recommended quick questions.',
        'Frame concerns honestly without overstating tenure, seniority, or private intent.',
      ],
      matchedEntityIds: uniqueText([
        entityId,
        'recruiter',
        'profile',
        'career',
      ]),
      confidence: 0.95,
    }),
  ];
}

function createCompositeRetentionStartupAnswers() {
  return [
    createRecruiterRiskAnswer({
      id: 'faq.recruiter.retention_startup_risk.default',
      intentId: 'recruiter.retention_startup_risk',
      entityId: 'recruiter',
      language: 'ko',
      quickLabel: 'Retention risk',
      displayQuestion:
        '오래 근무하지 못하고 배울 것만 배운 뒤 창업 쪽으로 빠질 위험은 없나요?',
      alternativeDisplayQuestions: [
        '회사에 오래 못 머물고 금방 그만둘 것 같은데 어떻게 생각해?',
        '배울 것만 빠르게 배우고 창업 쪽으로 빠질 수도 있지 않나요?',
      ],
      patterns: [
        '오래 못머물고 금방 그만둘거 같은데',
        '회사에 오래 못머물고 금방 그만둘거 같은데',
        '회사에 오래 못 머물고 금방 그만둘 것 같은데',
        '배울거만 뽑아먹고 창업쪽으로 빠질수도',
        '배울 것만 빠르게 배우고 창업 쪽으로 빠질 수도',
        '배울 것만 배우고 창업쪽으로 빠질 것 같은데',
        '오래 근무 리스크와 창업 리스크',
        '장기 근속과 창업 우려',
      ],
      shortAnswer:
        '현실적인 우려입니다. 다만 핵심은 무조건 오래 붙잡을 수 있는 사람인가보다, 책임 있는 제품 문제를 맡겼을 때 끝까지 소유하고 기여할 사람인가에 더 가깝습니다.',
      defaultAnswer: [
        '그 우려는 자연스럽습니다. 우수는 좁고 반복적인 역할에 오래 머무르는 타입이라기보다는, 배운 것을 실제 제품과 시스템으로 연결하고 싶어 하는 사람에 가깝습니다. 그래서 역할이 너무 좁거나 성장과 책임 범위가 막혀 있으면 답답함을 느낄 가능성은 있습니다.',
        '',
        '다만 그것이 곧 "배울 것만 얻고 떠난다"는 뜻은 아닙니다. 창업 경험과 관심은 회사를 연습 무대로 본다는 신호라기보다, 실제 사용자와 운영, 제품의 책임을 중요하게 보는 배경에 가깝습니다. 회사 안에서 UI, API, 데이터, AI, 배포를 연결하는 책임 있는 문제를 맡는다면 오히려 더 강한 소유감으로 오래 기여할 가능성이 큽니다.',
        '',
        '채용 관점에서는 "떠날 사람인가" 하나로 판단하기보다, 이 역할이 충분히 깊은 제품 문제와 성장 방향을 주는지, 첫 90일에 어떤 책임을 맡겼을 때 끝까지 가져가는지를 확인하는 편이 더 정확합니다.',
      ].join('\n'),
      detailedAnswer: [
        '리스크를 인정하되, 평가 기준을 조금 바꾸는 것이 좋습니다.',
        '',
        '우수의 커리어 전환은 단순한 이탈이라기보다 더 직접적인 문제 소유권으로 이동해 온 흐름입니다. 마케팅, 데이터, 컨설팅, 서비스 운영, UX, 풀스택, AI 서비스 설계가 모두 "실제로 작동하는 결과물을 만들고 싶다"는 방향으로 이어져 있습니다.',
        '',
        '따라서 장기 근속 가능성은 성향 하나보다 환경 적합성에 더 좌우됩니다. 제품과 사용자 문제가 충분히 깊고, 기여에 따라 책임이 확장되며, AI와 데이터와 UI를 연결하는 과제가 있다면 오래 몰입할 가능성이 높습니다. 반대로 반복 업무만 있고 성장 경로가 막힌 환경이라면 리스크가 커집니다.',
      ].join('\n'),
      renderSpec: {
        layout: 'text_only',
        density: 'standard',
        components: ['SourceBadgeList'],
      },
      visualBlocks: [{ type: 'sourceBadges' }],
      sourceChunkIds: [
        'faq.recruiter.retention_risk.default',
        'faq.recruiter.startup_intent.default',
        'profile.work_style',
        'career.oosu_salon',
        'career.target_role',
      ],
      hasTodo: false,
      freshness: 'stable',
      guardrails: [
        'Answer only when the user directly raises recruiter-risk concerns.',
        'Do not turn this concern bank into visible recommended questions.',
      ],
      matchedEntityIds: ['recruiter', 'profile', 'career', 'career.oosu_salon'],
      confidence: 0.98,
    }),
    createRecruiterRiskAnswer({
      id: 'faq.recruiter.retention_startup_risk.default',
      intentId: 'recruiter.retention_startup_risk',
      entityId: 'recruiter',
      language: 'en',
      quickLabel: 'Retention risk',
      displayQuestion:
        'Is Oosu likely to leave quickly after learning enough, or move toward a startup?',
      alternativeDisplayQuestions: [
        'Will Oosu stay long-term?',
        'Will Oosu just learn enough and leave to start something?',
      ],
      patterns: [
        'retention risk startup risk',
        'will Oosu just learn and leave',
        'will Oosu leave quickly',
        'will Oosu leave to start a company',
        'learn enough and leave for a startup',
        'job hopping founder mindset',
      ],
      shortAnswer:
        'It is a fair concern. The better question is not whether Oosu can be kept in place at all costs, but whether the role gives him a real product problem to own and finish.',
      defaultAnswer: [
        'That concern is reasonable. Oosu does not look like someone who would thrive for long in a very narrow, repetitive role. He tends to connect what he learns into working products and systems, so a role with no room for responsibility or growth could become frustrating.',
        '',
        'That does not mean he would simply learn enough and leave. His founder/operator background is better read as a product ownership signal: he cares whether the thing actually works for users. If a company gives him problems that connect UI, APIs, data, AI, and deployment, that same energy can become focus and ownership inside the company.',
        '',
        'From a hiring perspective, the useful question is not "will he ever think about startups?" It is "does this role give him a deep enough product problem to own, and can we define a first-90-days responsibility he can carry through?"',
      ].join('\n'),
      detailedAnswer: [
        'The risk should be acknowledged, but the evaluation frame matters.',
        '',
        'Oosu has repeatedly moved toward more direct ownership of problems: marketing, data, consulting, operating a service, UX, full-stack development, and AI product design. That pattern is less about leaving and more about wanting to work closer to real product outcomes.',
        '',
        'The retention signal is therefore environment-dependent. If the work has real user impact, room to grow responsibility, and cross-functional product/AI/data problems, the fit is stronger. If the role is narrow, repetitive, and disconnected from product impact, the risk becomes higher.',
      ].join('\n'),
      renderSpec: {
        layout: 'text_only',
        density: 'standard',
        components: ['SourceBadgeList'],
      },
      visualBlocks: [{ type: 'sourceBadges' }],
      sourceChunkIds: [
        'faq.recruiter.retention_risk.default',
        'faq.recruiter.startup_intent.default',
        'profile.work_style',
        'career.oosu_salon',
        'career.target_role',
      ],
      hasTodo: false,
      freshness: 'stable',
      guardrails: [
        'Answer only when the user directly raises recruiter-risk concerns.',
        'Do not turn this concern bank into visible recommended questions.',
      ],
      matchedEntityIds: ['recruiter', 'profile', 'career', 'career.oosu_salon'],
      confidence: 0.98,
    }),
  ];
}

function createRecruiterRiskAnswer(
  input: RecruiterRiskFaqInput
): FaqAnswer {
  return {
    ...input,
    answer: input.defaultAnswer,
    cacheMode: input.cacheMode ?? 'direct_cache',
    answerSource: 'faq_cache',
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
    String.raw`\*\*${escapeRegExp(label)}\*\*\s*([\s\S]*?)(?=\n\*\*(?:Short Answer|Default Answer|Detailed Answer)\*\*|\n---|\n###\s+FAQ|$)`,
    'i'
  );
  const match = section.match(pattern);

  return cleanMarkdownAnswer(match?.[1] ?? '');
}

function cleanMarkdownAnswer(value: string) {
  return value
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
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

function enhanceRecruiterRiskPatterns({
  id,
  patterns,
  language,
}: {
  id: string;
  patterns: string[];
  language: 'ko' | 'en';
}) {
  const additions: Record<string, string[]> = {
    'faq.recruiter.retention_risk.default':
      language === 'ko'
        ? [
            '오래 못머물고 금방 그만둘거 같은데',
            '회사에 오래 못 머물 것 같은데',
            '금방 퇴사할 것 같은데',
            '배울거만 배우고 나갈 것 같은데',
          ]
        : [
            'will Oosu leave quickly',
            'will Oosu just learn and leave',
            'retention concern',
          ],
    'faq.recruiter.startup_intent.default':
      language === 'ko'
        ? [
            '배울거만 뽑아먹고 창업쪽으로 빠질수도',
            '창업 쪽으로 빠질 것 같은데',
            '회사에 집중 못 하는 것 아닌가',
          ]
        : [
            'will Oosu leave to start a company',
            'founder mindset risk',
            'startup concern',
          ],
    'faq.recruiter.ai_dependency.default':
      language === 'ko'
        ? ['AI 없으면 개발 못 하는 것 아닌가', '프롬프트만 잘하는 것 아닌가']
        : ['is Oosu just prompting', 'can Oosu code without AI'],
  };

  return uniqueText([...patterns, ...(additions[id] ?? [])]);
}

function getQuickLabel(intentId: string, language: 'ko' | 'en') {
  const label = intentId.split('.').at(-1)?.replaceAll('_', ' ') ?? intentId;
  if (language === 'en') return label;

  const labels: Record<string, string> = {
    retention_risk: '장기 근속',
    startup_intent: '창업 우려',
    depth_concern: '개발 깊이',
    ai_dependency: 'AI 의존도',
    project_breadth_vs_depth: '프로젝트 깊이',
    collaboration_experience: '협업 경험',
    role_ambiguity: '포지션 명확성',
    weaknesses_risks: '단점과 리스크',
    role_recommendation: '역할 추천',
    career_switcher_value: '전환형 가치',
    ambiguity_handling: '모호함 처리',
    growth_potential: '성장 가능성',
    business_in_code: '비즈니스 감각',
    ideal_environment: '이상적 환경',
    onboarding_questions: '첫 질문',
  };

  return labels[label.replaceAll(' ', '_')] ?? label;
}

function normalizeVisibility(value: string): FaqAnswer['visibility'] {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'limited') return 'limited';
  if (normalized === 'private') return 'private';
  return 'public';
}

function uniqueText(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
