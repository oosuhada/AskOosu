import { oosuProfile } from '@/lib/oosu-profile';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { ChatAnswerSource } from '@/lib/chat/types';

export type FaqCacheMode = 'direct_cache' | 'cache_rewrite' | 'rag_required';

export type FaqRenderLayout =
  | 'profile_hero'
  | 'project_showcase'
  | 'project_deep_dive'
  | 'skill_cloud'
  | 'experience_bridge'
  | 'timeline'
  | 'comparison_grid'
  | 'ai_workflow'
  | 'contact_card'
  | 'text_only';

export type FaqRenderSpec = {
  layout: FaqRenderLayout;
  density: 'compact' | 'standard' | 'immersive';
  leadVisual?: string;
  components: string[];
};

export type FaqVisualBlockType =
  | 'profileCard'
  | 'projectCards'
  | 'skillChips'
  | 'timeline'
  | 'comparisonTable'
  | 'statelessDiagram'
  | 'imageCard'
  | 'contactCard'
  | 'ctaButtons'
  | 'sourceBadges';

export type FaqVisualBlock = {
  type: FaqVisualBlockType;
  title?: string;
  dataKey?: string;
  items?: unknown[];
};

export type FaqMediaRef = {
  assetKey: string;
  kind: 'profile' | 'project' | 'screenshot' | 'diagram' | 'gallery';
  src: string;
  alt: string;
  caption?: string;
  status: 'ready' | 'todo' | 'optional';
};

export type FaqAnswerPart =
  | {
      type: 'markdown';
      contentKey: 'shortAnswer' | 'defaultAnswer' | 'detailedAnswer';
      content?: string;
    }
  | {
      type: 'component';
      component: string;
      dataKey?: string;
      blockType?: FaqVisualBlockType;
    }
  | {
      type: 'sourceBadges';
      sourceChunkIds: string[];
    };

export type FaqAnswer = {
  id: string;
  legacyIds?: string[];
  intentId: string;
  entityId: string;
  language: ChatLanguage;
  quickLabel: string;
  displayQuestion: string;
  alternativeDisplayQuestions?: string[];
  patterns: string[];
  cacheMode: FaqCacheMode;
  answerSource: ChatAnswerSource;
  skippedGroq: boolean;
  shortAnswer: string;
  defaultAnswer: string;
  detailedAnswer?: string;
  answer: string;
  renderSpec?: FaqRenderSpec;
  visualBlocks?: FaqVisualBlock[];
  mediaRefs?: FaqMediaRef[];
  sourceChunkIds: string[];
  visibility: 'public' | 'limited' | 'private';
  hasTodo: boolean;
  freshness: 'stable' | 'needs_update' | 'time_sensitive';
  guardrails?: string[];
  matchedEntityIds: string[];
  confidence: number;
};

type FaqAnswerInput = Omit<
  FaqAnswer,
  'answer' | 'cacheMode' | 'answerSource' | 'skippedGroq' | 'visibility'
> & {
  cacheMode?: FaqCacheMode;
  answerSource?: ChatAnswerSource;
  skippedGroq?: boolean;
  visibility?: FaqAnswer['visibility'];
};

const mediaRefs: FaqMediaRef[] = [
  {
    assetKey: 'profile.oosu.portrait',
    kind: 'profile',
    src: 'TODO_ASSET',
    alt: 'Oosu profile portrait',
    status: 'todo',
  },
  {
    assetKey: 'project.askoosu.cover',
    kind: 'project',
    src: 'TODO_ASSET',
    alt: 'AskOosu project cover',
    status: 'todo',
  },
  {
    assetKey: 'project.instagram.cover',
    kind: 'project',
    src: 'TODO_ASSET',
    alt: 'Instagram Clone project cover',
    status: 'todo',
  },
  {
    assetKey: 'project.sticks.cover',
    kind: 'project',
    src: 'TODO_ASSET',
    alt: 'Sticks and Stones project cover',
    status: 'todo',
  },
  {
    assetKey: 'project.portfoliooh.cover',
    kind: 'project',
    src: 'TODO_ASSET',
    alt: 'Portfoli-Oh 2025 portfolio preview',
    status: 'todo',
  },
];

const representativeProjectsKo = [
  {
    id: 'askoosu',
    title: 'AskOosu 2026',
    subtitle: 'AI-connected 대화형 포트폴리오',
    description:
      'Next.js 채팅 UI, Notion Wiki, RAG, Groq, PostgreSQL 검색 캐시를 연결한 현재 대표 프로젝트입니다.',
    image: 'project.askoosu.cover',
    tags: ['Next.js', 'RAG', 'Groq', 'Notion', 'PostgreSQL'],
    href: oosuProfile.currentPortfolioUrl,
  },
  {
    id: 'instagram_clone',
    title: 'Instagram Clone',
    subtitle: '1인 풀스택 SNS 프로젝트',
    description:
      'Spring Boot, PostgreSQL, React/Next.js, 검색과 AI 기능까지 연결하며 SNS 데이터 흐름을 익힌 프로젝트입니다.',
    image: 'project.instagram.cover',
    tags: ['Spring Boot', 'PostgreSQL', 'React', 'Search', 'AI'],
    href: 'https://aigram.oosu.dev',
  },
  {
    id: 'sticks_and_stones',
    title: 'Sticks & Stones',
    subtitle: '실서비스 레거시 리빌드',
    description:
      '기존 WordPress/PHP 기반 홈페이지를 TypeScript/Vite 기반으로 재구성한 실제 브랜드 사이트 작업입니다.',
    image: 'project.sticks.cover',
    tags: ['Vite', 'TypeScript', 'UX', 'Legacy rebuild'],
    href: 'https://stks.oosu.dev',
  },
];

const representativeProjectsEn = [
  {
    id: 'askoosu',
    title: 'AskOosu 2026',
    subtitle: 'AI-connected conversational portfolio',
    description:
      'The current flagship project connecting a Next.js chat UI, Notion Wiki, RAG, Groq, and PostgreSQL search cache.',
    image: 'project.askoosu.cover',
    tags: ['Next.js', 'RAG', 'Groq', 'Notion', 'PostgreSQL'],
    href: oosuProfile.currentPortfolioUrl,
  },
  {
    id: 'instagram_clone',
    title: 'Instagram Clone',
    subtitle: 'Solo fullstack SNS project',
    description:
      'A project for learning SNS data flow across Spring Boot, PostgreSQL, React/Next.js, search, and AI features.',
    image: 'project.instagram.cover',
    tags: ['Spring Boot', 'PostgreSQL', 'React', 'Search', 'AI'],
    href: 'https://aigram.oosu.dev',
  },
  {
    id: 'sticks_and_stones',
    title: 'Sticks & Stones',
    subtitle: 'Real-service website rebuild',
    description:
      'A real brand-site rebuild that moved an older WordPress/PHP structure into a TypeScript/Vite frontend.',
    image: 'project.sticks.cover',
    tags: ['Vite', 'TypeScript', 'UX', 'Legacy rebuild'],
    href: 'https://stks.oosu.dev',
  },
];

const skillGroupsKo = [
  {
    group: 'Frontend',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    evidence: ['AskOosu', 'Sticks & Stones', 'Portfoli-Oh!'],
  },
  {
    group: 'Backend / Data',
    skills: ['Spring Boot', 'PostgreSQL', 'REST API', 'JWT', 'Meilisearch'],
    evidence: ['Instagram Clone', 'AskOosu RAG cache'],
  },
  {
    group: 'AI / RAG',
    skills: ['Notion API', 'Groq', 'RAG', 'AI SDK', 'Provider fallback'],
    evidence: ['AskOosu'],
  },
  {
    group: 'UX / Business',
    skills: ['고객 경험', '데이터 분석', '브랜드 운영', '문제 정의'],
    evidence: ['GfK Korea', 'OOSU SALON', 'UX/UI projects'],
  },
];

const skillGroupsEn = [
  {
    group: 'Frontend',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    evidence: ['AskOosu', 'Sticks & Stones', 'Portfoli-Oh!'],
  },
  {
    group: 'Backend / Data',
    skills: ['Spring Boot', 'PostgreSQL', 'REST API', 'JWT', 'Meilisearch'],
    evidence: ['Instagram Clone', 'AskOosu RAG cache'],
  },
  {
    group: 'AI / RAG',
    skills: ['Notion API', 'Groq', 'RAG', 'AI SDK', 'Provider fallback'],
    evidence: ['AskOosu'],
  },
  {
    group: 'UX / Business',
    skills: [
      'Customer experience',
      'Data analysis',
      'Brand operation',
      'Problem framing',
    ],
    evidence: ['GfK Korea', 'OOSU SALON', 'UX/UI projects'],
  },
];

const aiWorkflowKo = [
  {
    title: 'Plan',
    description:
      '요구사항을 작은 단위로 쪼개고, 답변 기준과 금지할 추측을 먼저 정리합니다.',
  },
  {
    title: 'Generate',
    description:
      'Claude Code, Codex, Gemini 같은 도구로 구현 초안과 대안을 빠르게 만듭니다.',
  },
  {
    title: 'Review',
    description:
      'AI가 만든 코드 흐름을 직접 읽고, 모르는 부분은 설명과 근거를 다시 확인합니다.',
  },
  {
    title: 'Test',
    description:
      '타입 체크, 빌드, 실행 로그, 문서 대조로 실제 동작을 검증합니다.',
  },
  {
    title: 'Ship',
    description:
      '사용자 경험과 운영 흐름 안에서 기능이 자연스럽게 작동하는지 확인합니다.',
  },
];

const aiWorkflowEn = [
  {
    title: 'Plan',
    description:
      'Break requirements into smaller steps and define answer rules and no-guess boundaries first.',
  },
  {
    title: 'Generate',
    description:
      'Use tools such as Claude Code, Codex, and Gemini to draft implementation options quickly.',
  },
  {
    title: 'Review',
    description:
      'Read generated code directly and ask for explanations or evidence where the flow is unclear.',
  },
  {
    title: 'Test',
    description:
      'Validate behavior with type checks, builds, logs, and documentation comparisons.',
  },
  {
    title: 'Ship',
    description:
      'Check whether the feature works naturally inside the user experience and operating flow.',
  },
];

const ragWorkflowKo = [
  {
    title: 'Chat UI',
    description: '방문자는 스크롤 대신 질문으로 포트폴리오 정보를 탐색합니다.',
  },
  {
    title: 'FAQ Cache',
    description: '반복 질문은 faqId와 intentId로 바로 캐시 답변을 반환합니다.',
  },
  {
    title: 'RAG Search',
    description:
      'FAQ로 충분하지 않은 질문은 Notion Wiki chunk와 PostgreSQL 검색 캐시를 조회합니다.',
  },
  {
    title: 'Model Layer',
    description:
      '필요한 경우에만 Groq 등 모델 생성을 사용하고, fallback과 근거 메타데이터를 남깁니다.',
  },
  {
    title: 'Rich Answer',
    description:
      '텍스트, 카드, 칩, 근거 badge를 함께 보여주는 포트폴리오형 답변으로 렌더링합니다.',
  },
];

const ragWorkflowEn = [
  {
    title: 'Chat UI',
    description:
      'Visitors explore portfolio information by asking instead of scrolling.',
  },
  {
    title: 'FAQ Cache',
    description:
      'Repeated questions return cached answers directly through faqId and intentId.',
  },
  {
    title: 'RAG Search',
    description:
      'Questions beyond FAQ coverage search Notion Wiki chunks and the PostgreSQL retrieval cache.',
  },
  {
    title: 'Model Layer',
    description:
      'Groq or another model is used only when needed, with fallback and evidence metadata.',
  },
  {
    title: 'Rich Answer',
    description:
      'Answers render as portfolio UI using text, cards, chips, and evidence badges.',
  },
];

const contactActionsKo = [
  { label: 'Email', href: `mailto:${oosuProfile.email}`, kind: 'email' },
  { label: 'GitHub', href: oosuProfile.github, kind: 'github' },
  { label: 'LinkedIn', href: oosuProfile.linkedin, kind: 'linkedin' },
  {
    label: 'Portfolio',
    href: oosuProfile.currentPortfolioUrl,
    kind: 'portfolio',
  },
];

const contactActionsEn = contactActionsKo;

const sharedGuardrails = [
  'Do not invent resume URLs',
  'Do not invent private repository links',
  'Do not invent performance metrics',
  'Treat TODO assets as unavailable until a real public file exists',
];

export const FAQ_ANSWERS: FaqAnswer[] = [
  createFaqAnswer({
    id: 'faq.project.top_three.default',
    intentId: 'project.top_three',
    entityId: 'projects.representative',
    language: 'ko',
    quickLabel: '대표 프로젝트',
    displayQuestion:
      '우수님의 대표 프로젝트 3개를 한눈에 볼 수 있게 소개해줄래요?',
    patterns: [
      '대표 프로젝트',
      '대표 프로젝트 3개',
      '우수님의 대표 프로젝트 3개를 한눈에 볼 수 있게 소개해줄래요?',
      '우수 대표 프로젝트',
      'AskOosu Instagram Clone Sticks & Stones',
    ],
    shortAnswer:
      '대표 프로젝트는 AskOosu, Instagram Clone, Sticks & Stones입니다.',
    defaultAnswer: [
      '대표 프로젝트는 AskOosu, Instagram Clone, Sticks & Stones입니다.',
      '',
      'AskOosu는 AI/RAG 기반 대화형 포트폴리오, Instagram Clone은 1인 풀스택 SNS 구현, Sticks & Stones는 실제 브랜드 사이트의 레거시 리빌드 경험을 보여줍니다. 세 프로젝트를 함께 보면 우수가 AI 서비스 설계, 풀스택 구현, 실서비스 웹 개선을 어떻게 연결해왔는지 한눈에 볼 수 있습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_showcase',
      density: 'immersive',
      leadVisual: 'ProjectShowcaseCards',
      components: ['ProjectShowcaseCards', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Representative Projects',
        dataKey: 'projects.representative',
        items: representativeProjectsKo,
      },
      {
        type: 'skillChips',
        title: 'Core Stack',
        dataKey: 'skills.core',
        items: skillGroupsKo.slice(0, 3),
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.askoosu.overview',
      'project.instagram_clone.overview',
      'project.sticks_and_stones.overview',
      'faq.project.top_three.default',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'instagram_clone', 'sticks_and_stones'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.project.top_three.default',
    intentId: 'project.top_three',
    entityId: 'projects.representative',
    language: 'en',
    quickLabel: 'Top projects',
    displayQuestion: "Can you show Oosu's top three projects at a glance?",
    patterns: [
      'top projects',
      "Can you show Oosu's top three projects at a glance?",
      'representative projects',
      'best projects',
      'AskOosu Instagram Clone Sticks & Stones',
    ],
    shortAnswer:
      'The top three projects are AskOosu, Instagram Clone, and Sticks & Stones.',
    defaultAnswer: [
      'The top three projects are AskOosu, Instagram Clone, and Sticks & Stones.',
      '',
      'AskOosu shows AI/RAG portfolio design, Instagram Clone shows solo fullstack SNS implementation, and Sticks & Stones shows real-service legacy rebuild work. Together, they show how Oosu connects AI service thinking, fullstack implementation, and practical web delivery.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_showcase',
      density: 'immersive',
      leadVisual: 'ProjectShowcaseCards',
      components: ['ProjectShowcaseCards', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Representative Projects',
        dataKey: 'projects.representative',
        items: representativeProjectsEn,
      },
      {
        type: 'skillChips',
        title: 'Core Stack',
        dataKey: 'skills.core',
        items: skillGroupsEn.slice(0, 3),
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.askoosu.overview',
      'project.instagram_clone.overview',
      'project.sticks_and_stones.overview',
      'faq.project.top_three.default',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'instagram_clone', 'sticks_and_stones'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.skills.tech_stack.default',
    intentId: 'skills.tech_stack',
    entityId: 'skills.core',
    language: 'ko',
    quickLabel: '기술 스택',
    displayQuestion:
      '우수님은 어떤 기술 스택을 다루고, 각 기술은 어떤 프로젝트에서 써봤나요?',
    patterns: [
      '기술 스택',
      '우수님은 어떤 기술 스택을 다루고, 각 기술은 어떤 프로젝트에서 써봤나요?',
      '프론트엔드 백엔드 AI 기술',
      '쓸 줄 아는 기술',
      'tech stack',
    ],
    shortAnswer:
      '우수는 React/Next.js/TypeScript 기반 프론트엔드, Spring Boot/PostgreSQL 기반 백엔드, Notion RAG/Groq 같은 AI 연결 구조를 프로젝트로 쌓고 있습니다.',
    defaultAnswer: [
      '우수는 React, Next.js, TypeScript, Tailwind CSS 기반 프론트엔드와 Spring Boot, PostgreSQL, REST API 기반 백엔드, 그리고 Notion API, Groq, RAG 같은 AI 연결 구조를 프로젝트로 쌓고 있습니다.',
      '',
      '가장 중요한 포인트는 모든 기술을 독립적으로 나열하기보다 실제 서비스 흐름으로 연결해봤다는 점입니다. AskOosu에서는 채팅 UI, API, RAG, provider fallback을 연결했고, Instagram Clone에서는 SNS 데이터/API 흐름을, Sticks & Stones에서는 실서비스 프론트엔드 리빌드를 경험했습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'skill_cloud',
      density: 'standard',
      leadVisual: 'SkillChipGroup',
      components: ['SkillChipGroup', 'ProjectShowcaseCards', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'skillChips',
        title: 'Stack by Evidence',
        dataKey: 'skills.core',
        items: skillGroupsKo,
      },
      {
        type: 'projectCards',
        title: 'Where the stack appears',
        dataKey: 'projects.representative',
        items: representativeProjectsKo,
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: ['skills.current_stack', 'project.askoosu.overview'],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: [
      'skills',
      'askoosu',
      'instagram_clone',
      'sticks_and_stones',
    ],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.skills.tech_stack.default',
    intentId: 'skills.tech_stack',
    entityId: 'skills.core',
    language: 'en',
    quickLabel: 'Tech stack',
    displayQuestion:
      'What technologies does Oosu use, and where has he applied them?',
    patterns: [
      'tech stack',
      'What technologies does Oosu use, and where has he applied them?',
      'frontend backend AI skills',
      'technical skills',
    ],
    shortAnswer:
      'Oosu is building project-based capability with React/Next.js/TypeScript, Spring Boot/PostgreSQL, and Notion RAG/Groq structures.',
    defaultAnswer: [
      'Oosu works with React, Next.js, TypeScript, and Tailwind CSS on the frontend; Spring Boot, PostgreSQL, and REST APIs on the backend; and Notion API, Groq, and RAG for AI-connected product flows.',
      '',
      'The important point is that these tools are tied to project evidence rather than presented as isolated keywords. AskOosu connects chat UI, API routes, RAG, and provider fallback; Instagram Clone connects SNS data/API flow; Sticks & Stones shows real-service frontend rebuild work.',
    ].join('\n'),
    renderSpec: {
      layout: 'skill_cloud',
      density: 'standard',
      leadVisual: 'SkillChipGroup',
      components: ['SkillChipGroup', 'ProjectShowcaseCards', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'skillChips',
        title: 'Stack by Evidence',
        dataKey: 'skills.core',
        items: skillGroupsEn,
      },
      {
        type: 'projectCards',
        title: 'Where the stack appears',
        dataKey: 'projects.representative',
        items: representativeProjectsEn,
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: ['skills.current_stack', 'project.askoosu.overview'],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: [
      'skills',
      'askoosu',
      'instagram_clone',
      'sticks_and_stones',
    ],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.contact.collaboration.default',
    legacyIds: ['contact.collab.ko'],
    intentId: 'contact.collaboration',
    entityId: 'contact.public',
    language: 'ko',
    quickLabel: '연락/협업',
    displayQuestion:
      '우수님에게 어떻게 연락할 수 있고, 어떤 협업을 열어두고 있나요?',
    patterns: [
      '연락/협업',
      '우수님에게 어떻게 연락할 수 있고, 어떤 협업을 열어두고 있나요?',
      '협업하거나 연락하려면 어떻게 해요?',
      '연락처',
      'contact',
      'github',
    ],
    shortAnswer:
      '우수에게 연락하려면 이메일, LinkedIn, GitHub를 사용할 수 있습니다.',
    defaultAnswer: [
      '우수에게 연락하거나 작업을 확인하려면 이메일, LinkedIn, GitHub가 가장 안전한 공개 채널입니다.',
      '',
      `- Email: ${oosuProfile.email}`,
      `- GitHub: ${oosuProfile.github}`,
      `- LinkedIn: ${oosuProfile.linkedin}`,
      `- Portfolio: ${oosuProfile.currentPortfolioUrl}`,
      '',
      '협업은 포트폴리오 피드백, 사이드 프로젝트, 사용자 문제 정의, 프론트엔드 구현, RAG/AI 기능 설계처럼 우수의 경험이 연결될 수 있는 영역과 잘 맞습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'contact_card',
      density: 'standard',
      leadVisual: 'ContactCard',
      components: ['ContactCard', 'CtaButtons', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'contactCard',
        title: 'Contact Oosu',
        dataKey: 'contact.public',
        items: contactActionsKo,
      },
      {
        type: 'ctaButtons',
        items: contactActionsKo,
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'profile.basic_info',
      'profile.faq.contact',
      'connect.overview',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['profile', 'contact'],
    confidence: 0.99,
  }),
  createFaqAnswer({
    id: 'faq.contact.collaboration.default',
    legacyIds: ['contact.collab.en'],
    intentId: 'contact.collaboration',
    entityId: 'contact.public',
    language: 'en',
    quickLabel: 'Contact',
    displayQuestion:
      'How can I reach Oosu, and what kind of collaboration is he open to?',
    patterns: [
      'contact',
      'How can I reach Oosu, and what kind of collaboration is he open to?',
      'How can I get in touch or collaborate?',
      'contact oosu',
      'github link',
    ],
    shortAnswer:
      'The safest public contact channels are email, LinkedIn, and GitHub.',
    defaultAnswer: [
      'The safest public channels for contacting Oosu or reviewing his work are email, LinkedIn, and GitHub.',
      '',
      `- Email: ${oosuProfile.email}`,
      `- GitHub: ${oosuProfile.github}`,
      `- LinkedIn: ${oosuProfile.linkedin}`,
      `- Portfolio: ${oosuProfile.currentPortfolioUrl}`,
      '',
      'Good collaboration fits include portfolio feedback, side projects, user problem framing, frontend implementation, and RAG/AI feature design.',
    ].join('\n'),
    renderSpec: {
      layout: 'contact_card',
      density: 'standard',
      leadVisual: 'ContactCard',
      components: ['ContactCard', 'CtaButtons', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'contactCard',
        title: 'Contact Oosu',
        dataKey: 'contact.public',
        items: contactActionsEn,
      },
      {
        type: 'ctaButtons',
        items: contactActionsEn,
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'profile.basic_info',
      'profile.faq.contact',
      'connect.overview',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['profile', 'contact'],
    confidence: 0.99,
  }),
  createFaqAnswer({
    id: 'faq.ai_usage.workflow.default',
    legacyIds: ['ai.usage.ko'],
    intentId: 'ai_usage.workflow',
    entityId: 'ai.workflow',
    language: 'ko',
    quickLabel: 'AI 활용',
    displayQuestion:
      '우수님은 Claude Code, Codex, Gemini 같은 AI 도구를 실제 개발에 어떻게 활용하나요?',
    patterns: [
      'AI 활용',
      'AI 도구를 어떻게 활용하나요?',
      '우수님은 Claude Code, Codex, Gemini 같은 AI 도구를 실제 개발에 어떻게 활용하나요?',
      'Claude Code Gemini CLI Codex',
      'ai 실제 개발 활용',
    ],
    shortAnswer:
      '우수는 AI를 기획, 구현, 디버깅, 문서화를 빠르게 연결하는 개발 파트너처럼 사용합니다.',
    defaultAnswer: [
      '우수는 AI를 단순 질문 도구가 아니라 개발 파트너에 가깝게 사용합니다.',
      '',
      'Claude Code, Gemini CLI, Codex 같은 도구로 요구사항을 쪼개고, 코드 구조를 탐색하고, 구현·검증·문서화를 반복합니다. 다만 AI 결과물을 그대로 믿기보다 코드 흐름을 직접 읽고, 타입 체크와 빌드, 로그, 공식 문서 대조로 검증하는 방식을 중요하게 봅니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'ai_workflow',
      density: 'standard',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'AI-assisted Development Workflow',
        dataKey: 'ai.workflow',
        items: aiWorkflowKo,
      },
      {
        type: 'skillChips',
        title: 'AI Tooling Context',
        dataKey: 'skills.ai',
        items: [skillGroupsKo[2]],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'ai.tools.current',
      'ai.workflow.validation',
      'project.askoosu.overview',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['ai.workflow', 'askoosu'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.ai_usage.workflow.default',
    legacyIds: ['ai.usage.en'],
    intentId: 'ai_usage.workflow',
    entityId: 'ai.workflow',
    language: 'en',
    quickLabel: 'AI workflow',
    displayQuestion:
      'How does Oosu actually use tools like Claude Code, Codex, and Gemini in development?',
    patterns: [
      'AI workflow',
      'How does Oosu actually use tools like Claude Code, Codex, and Gemini in development?',
      'How do you actually use AI in development?',
      'ai tools development',
    ],
    shortAnswer:
      'Oosu uses AI to connect planning, implementation, debugging, and documentation faster while keeping human review in charge.',
    defaultAnswer: [
      'Oosu uses AI less like a search box and more like a development partner.',
      '',
      'Tools such as Claude Code, Gemini CLI, and Codex help break down requirements, inspect code structure, implement changes, verify behavior, and document decisions. The important habit is not trusting generated output automatically: Oosu still reads code flow, runs checks, compares logs, and verifies against documentation.',
    ].join('\n'),
    renderSpec: {
      layout: 'ai_workflow',
      density: 'standard',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'AI-assisted Development Workflow',
        dataKey: 'ai.workflow',
        items: aiWorkflowEn,
      },
      {
        type: 'skillChips',
        title: 'AI Tooling Context',
        dataKey: 'skills.ai',
        items: [skillGroupsEn[2]],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'ai.tools.current',
      'ai.workflow.validation',
      'project.askoosu.overview',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['ai.workflow', 'askoosu'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.rag.default',
    intentId: 'project.askoosu.rag',
    entityId: 'askoosu',
    language: 'ko',
    quickLabel: 'RAG 구조',
    displayQuestion:
      'AskOosu 안에서 Notion, RAG, Groq, PostgreSQL은 어떻게 연결되나요?',
    patterns: [
      'RAG 구조',
      'AskOosu 안에서 Notion, RAG, Groq, PostgreSQL은 어떻게 연결되나요?',
      'AskOosu RAG',
      'Notion RAG Groq PostgreSQL',
      '포트폴리오를 왜 대화형으로 만들었어요?',
    ],
    shortAnswer:
      'AskOosu는 채팅 UI, FAQ 캐시, Notion Wiki/RAG, PostgreSQL 검색 캐시, Groq 생성 모델을 질문 성격에 따라 연결합니다.',
    defaultAnswer: [
      'AskOosu는 방문자의 질문을 먼저 FAQ Answer Cache로 확인하고, 반복 질문이면 Groq 호출 없이 바로 답변합니다.',
      '',
      'FAQ로 충분하지 않은 질문은 Notion Wiki 기반 chunk와 PostgreSQL 검색 캐시를 통해 근거를 찾고, 필요한 경우에만 Groq 같은 모델 생성으로 넘어갑니다. 답변에는 source chunk id, confidence, TODO 여부 같은 메타데이터를 붙여 UI에서 근거와 fallback 상태를 확인할 수 있게 합니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'ai_workflow',
      density: 'immersive',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'AskOosu Answer Flow',
        dataKey: 'askoosu.rag.workflow',
        items: ragWorkflowKo,
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'project.askoosu.architecture',
      'rag.routing',
      'faq.answer_cache',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'rag'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.rag.default',
    intentId: 'project.askoosu.rag',
    entityId: 'askoosu',
    language: 'en',
    quickLabel: 'RAG system',
    displayQuestion:
      'How do Notion, RAG, Groq, and PostgreSQL work together inside AskOosu?',
    patterns: [
      'RAG system',
      'How do Notion, RAG, Groq, and PostgreSQL work together inside AskOosu?',
      'AskOosu RAG',
      'Notion RAG Groq PostgreSQL',
      'Why build this portfolio as a conversation?',
    ],
    shortAnswer:
      'AskOosu connects chat UI, FAQ cache, Notion Wiki/RAG, PostgreSQL retrieval cache, and Groq generation depending on the question type.',
    defaultAnswer: [
      'AskOosu checks the FAQ Answer Cache first, so repeated questions can return a grounded answer without calling Groq.',
      '',
      'When the FAQ is not enough, it searches Notion Wiki chunks through a PostgreSQL-backed retrieval cache and only then uses a model such as Groq when generation is needed. The answer carries metadata such as source chunk IDs, confidence, and TODO state so the UI can show evidence and fallback status.',
    ].join('\n'),
    renderSpec: {
      layout: 'ai_workflow',
      density: 'immersive',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'AskOosu Answer Flow',
        dataKey: 'askoosu.rag.workflow',
        items: ragWorkflowEn,
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'project.askoosu.architecture',
      'rag.routing',
      'faq.answer_cache',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'rag'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.profile.intro.default',
    legacyIds: ['profile.intro.ko'],
    intentId: 'profile.intro',
    entityId: 'profile.summary',
    language: 'ko',
    quickLabel: '우수 소개',
    displayQuestion: '우수님은 어떤 사람이고, 어떤 개발자로 성장하고 있나요?',
    patterns: [
      '우수 소개',
      '우수님은 어떤 사람이고, 어떤 개발자로 성장하고 있나요?',
      '우수는 어떤 개발자예요?',
      '우수는 어떤 개발자',
      '장우수 소개',
    ],
    shortAnswer:
      '우수는 고객 경험, 비즈니스 인사이트, 프론트엔드, 백엔드, AI를 실제 서비스 흐름으로 연결하려는 AI-connected Fullstack Developer입니다.',
    defaultAnswer: [
      '우수는 프론트엔드에서 출발해 백엔드, 데이터베이스, AI 연결까지 확장하고 있는 AI-connected Fullstack Developer입니다.',
      '',
      '강점은 새 도메인을 빠르게 구조화하고, 배운 내용을 실제 서비스 흐름으로 연결하는 쪽에 있습니다. AskOosu 자체도 그 방향을 보여주는 프로젝트로, Next.js UI, API Route Handler, Notion RAG, PostgreSQL, Groq를 하나로 묶어 포트폴리오가 직접 질문에 답하게 만들고 있습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'profile_hero',
      density: 'standard',
      leadVisual: 'ProfileHeroCard',
      components: ['ProfileHeroCard', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      { type: 'profileCard', title: 'Oosu Jang', dataKey: 'profile.summary' },
      {
        type: 'skillChips',
        title: 'Core Direction',
        dataKey: 'skills.core',
        items: skillGroupsKo.slice(0, 4),
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'profile.summary',
      'profile.strengths',
      'project.askoosu.overview',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['profile', 'career'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.profile.intro.default',
    legacyIds: ['profile.intro.en'],
    intentId: 'profile.intro',
    entityId: 'profile.summary',
    language: 'en',
    quickLabel: 'About Oosu',
    displayQuestion: 'Who is Oosu, and what kind of developer is he becoming?',
    patterns: [
      'About Oosu',
      'Who is Oosu, and what kind of developer is he becoming?',
      'What kind of developer is Oosu?',
      'who is oosu',
    ],
    shortAnswer:
      'Oosu is an AI-connected fullstack developer connecting customer experience, business insight, frontend, backend, and AI into service flows.',
    defaultAnswer: [
      'Oosu is an AI-connected fullstack developer who started from frontend work and is expanding into backend systems, databases, and AI-powered product flows.',
      '',
      'His strength is turning new domains into practical service structures. AskOosu demonstrates that directly by connecting a Next.js chat UI, API Route Handlers, Notion RAG, PostgreSQL, and Groq into a conversational portfolio.',
    ].join('\n'),
    renderSpec: {
      layout: 'profile_hero',
      density: 'standard',
      leadVisual: 'ProfileHeroCard',
      components: ['ProfileHeroCard', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      { type: 'profileCard', title: 'Oosu Jang', dataKey: 'profile.summary' },
      {
        type: 'skillChips',
        title: 'Core Direction',
        dataKey: 'skills.core',
        items: skillGroupsEn.slice(0, 4),
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'profile.summary',
      'profile.strengths',
      'project.askoosu.overview',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['profile', 'career'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.overview.default',
    legacyIds: ['project.askoosu.ko'],
    intentId: 'project.askoosu.overview',
    entityId: 'askoosu',
    language: 'ko',
    quickLabel: 'AskOosu',
    displayQuestion:
      'AskOosu는 어떤 문제의식에서 시작했고, 왜 대화형 포트폴리오로 만들었나요?',
    patterns: [
      'AskOosu',
      'AskOosu 프로젝트를 설명해줘',
      'AskOosu는 어떤 문제의식에서 시작했고, 왜 대화형 포트폴리오로 만들었나요?',
      'askoosu 설명',
      'ask oosu 프로젝트',
    ],
    shortAnswer:
      'AskOosu는 방문자가 스크롤 대신 질문으로 우수의 프로젝트와 기술 스택을 탐색하는 AI-connected 대화형 포트폴리오입니다.',
    defaultAnswer: [
      'AskOosu는 우수의 2026 대화형 AI 포트폴리오입니다.',
      '',
      `방문자는 ${oosuProfile.currentPortfolioUrl}에서 스크롤 대신 질문으로 프로젝트와 경험을 탐색할 수 있습니다. 구조는 Next.js App Router 기반 프론트엔드와 API Route Handler, Notion Wiki, PostgreSQL RAG cache, Groq 생성 모델을 연결한 형태입니다.`,
      '',
      '핵심 의도는 포트폴리오가 단순 소개 페이지가 아니라, 프론트엔드·백엔드·DB·AI orchestration·홈서버 배포 역량을 한 화면에서 증명하는 것입니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'ProjectDeepDivePanel',
      components: [
        'ProjectDeepDivePanel',
        'AIWorkflowSteps',
        'SourceBadgeList',
      ],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'AskOosu',
        dataKey: 'project.askoosu',
        items: [representativeProjectsKo[0]],
      },
      {
        type: 'statelessDiagram',
        title: 'Answer Flow',
        dataKey: 'askoosu.rag.workflow',
        items: ragWorkflowKo,
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.askoosu.overview',
      'project.askoosu.architecture',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.overview.default',
    legacyIds: ['project.askoosu.en'],
    intentId: 'project.askoosu.overview',
    entityId: 'askoosu',
    language: 'en',
    quickLabel: 'AskOosu',
    displayQuestion:
      'What problem led to AskOosu, and why did Oosu build it as a conversational portfolio?',
    patterns: [
      'AskOosu',
      'Explain the AskOosu project',
      'What problem led to AskOosu, and why did Oosu build it as a conversational portfolio?',
      'what is askoosu',
    ],
    shortAnswer:
      'AskOosu is an AI-connected conversational portfolio where visitors explore projects and skills by asking questions instead of scrolling.',
    defaultAnswer: [
      'AskOosu is Oosu’s 2026 conversational AI portfolio.',
      '',
      `At ${oosuProfile.currentPortfolioUrl}, visitors can explore projects and experience by asking questions instead of scrolling through a static portfolio. The system connects a Next.js App Router frontend, API Route Handlers, a Notion Wiki, PostgreSQL-backed RAG cache, and Groq generation.`,
      '',
      'The point is to make the portfolio itself demonstrate frontend, backend, database, AI orchestration, and home-server deployment ability.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'ProjectDeepDivePanel',
      components: [
        'ProjectDeepDivePanel',
        'AIWorkflowSteps',
        'SourceBadgeList',
      ],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'AskOosu',
        dataKey: 'project.askoosu',
        items: [representativeProjectsEn[0]],
      },
      {
        type: 'statelessDiagram',
        title: 'Answer Flow',
        dataKey: 'askoosu.rag.workflow',
        items: ragWorkflowEn,
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.askoosu.overview',
      'project.askoosu.architecture',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.project.instagram.learned.default',
    legacyIds: ['project.instagram.ko'],
    intentId: 'project.instagram.learned',
    entityId: 'instagram_clone',
    language: 'ko',
    quickLabel: 'Instagram Clone',
    displayQuestion:
      'Instagram Clone을 혼자 만들면서 풀스택 개발에 대해 무엇을 배웠나요?',
    patterns: [
      'Instagram Clone',
      'Instagram Clone에서 뭘 배웠나요?',
      'Instagram Clone을 혼자 만들면서 풀스택 개발에 대해 무엇을 배웠나요?',
      'instagram clone 배운 점',
      '인스타그램 클론',
    ],
    shortAnswer:
      'Instagram Clone은 우수가 SNS의 데이터/API/UI 흐름을 풀스택으로 직접 연결해본 프로젝트입니다.',
    defaultAnswer: [
      'Instagram Clone은 우수가 SNS의 핵심 흐름을 풀스택으로 직접 연결해 본 프로젝트입니다.',
      '',
      '피드, 팔로우, 댓글 같은 기능을 만들면서 React UI만이 아니라 Spring Boot API, PostgreSQL 데이터 구조, 배포된 프론트와 백엔드의 연결까지 경험했습니다. 그래서 “화면을 잘 만드는 개발자”에서 “데이터와 API 흐름까지 생각하는 개발자”로 확장하는 근거가 됩니다.',
      '',
      'Live: https://aigram.oosu.dev',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'ProjectDeepDivePanel',
      components: ['ProjectDeepDivePanel', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Instagram Clone',
        dataKey: 'project.instagram_clone',
        items: [representativeProjectsKo[1]],
      },
      {
        type: 'skillChips',
        title: 'Fullstack Evidence',
        dataKey: 'skills.fullstack',
        items: [skillGroupsKo[1]],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.instagram_clone.overview',
      'project.instagram_clone.learned',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['instagram_clone'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.project.instagram.learned.default',
    legacyIds: ['project.instagram.en'],
    intentId: 'project.instagram.learned',
    entityId: 'instagram_clone',
    language: 'en',
    quickLabel: 'Instagram Clone',
    displayQuestion:
      'What did building Instagram Clone teach Oosu about fullstack development?',
    patterns: [
      'Instagram Clone',
      'What did you learn from Instagram Clone?',
      'What did building Instagram Clone teach Oosu about fullstack development?',
      'instagram clone learning',
    ],
    shortAnswer:
      'Instagram Clone shows Oosu connecting SNS data, API, and UI flows as a solo fullstack project.',
    defaultAnswer: [
      'Instagram Clone shows Oosu’s fullstack practice around core SNS flows.',
      '',
      'By building feed, follow, and comment features, he worked across React UI, Spring Boot APIs, PostgreSQL data structure, and deployed frontend/backend connectivity. It is evidence that he is moving beyond frontend-only work into product and system flow.',
      '',
      'Live: https://aigram.oosu.dev',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'ProjectDeepDivePanel',
      components: ['ProjectDeepDivePanel', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Instagram Clone',
        dataKey: 'project.instagram_clone',
        items: [representativeProjectsEn[1]],
      },
      {
        type: 'skillChips',
        title: 'Fullstack Evidence',
        dataKey: 'skills.fullstack',
        items: [skillGroupsEn[1]],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.instagram_clone.overview',
      'project.instagram_clone.learned',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['instagram_clone'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.project.sticks.importance.default',
    legacyIds: ['project.sticks.ko'],
    intentId: 'project.sticks.importance',
    entityId: 'sticks_and_stones',
    language: 'ko',
    quickLabel: 'Sticks & Stones',
    displayQuestion:
      'Sticks & Stones 프로젝트가 우수님의 포트폴리오에서 중요한 이유는 무엇인가요?',
    patterns: [
      'Sticks & Stones',
      'Sticks & Stones 프로젝트가 왜 중요한가요?',
      'Sticks & Stones 프로젝트가 우수님의 포트폴리오에서 중요한 이유는 무엇인가요?',
      'sticks stones 중요',
      '스틱스앤스톤스',
    ],
    shortAnswer:
      'Sticks & Stones는 실서비스 브랜드 사이트를 현대적인 프론트엔드로 옮긴 경험이라는 점에서 중요합니다.',
    defaultAnswer: [
      'Sticks & Stones는 실서비스 마이그레이션 경험이라는 점에서 중요합니다.',
      '',
      '단순 연습 프로젝트가 아니라 기존 WordPress 기반 홈페이지를 TypeScript/Vite 기반으로 옮기며, 실제 브랜드 사이트의 구조와 배포를 다룬 작업입니다. 그래서 우수가 “실제 사용자와 운영 맥락이 있는 웹사이트”를 다뤄봤다는 근거가 됩니다.',
      '',
      'Live: https://stks.oosu.dev',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'ProjectDeepDivePanel',
      components: ['ProjectDeepDivePanel', 'ImageCard', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Sticks & Stones',
        dataKey: 'project.sticks_and_stones',
        items: [representativeProjectsKo[2]],
      },
      {
        type: 'imageCard',
        title: 'Project image',
        items: [
          {
            image: 'project.sticks.cover',
            caption: 'Project screenshot asset pending',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: ['project.sticks_and_stones.overview'],
    hasTodo: true,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['sticks_and_stones'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.project.sticks.importance.default',
    legacyIds: ['project.sticks.en'],
    intentId: 'project.sticks.importance',
    entityId: 'sticks_and_stones',
    language: 'en',
    quickLabel: 'Sticks & Stones',
    displayQuestion:
      "Why does the Sticks & Stones project matter in Oosu's portfolio?",
    patterns: [
      'Sticks & Stones',
      'Why does the Sticks & Stones project matter?',
      "Why does the Sticks & Stones project matter in Oosu's portfolio?",
      'sticks and stones project',
    ],
    shortAnswer:
      'Sticks & Stones matters because it is real-service migration work, not just a practice project.',
    defaultAnswer: [
      'Sticks & Stones matters because it is real service migration work, not just a practice project.',
      '',
      'Oosu migrated a WordPress-based company homepage into a TypeScript/Vite frontend, handling the structure and deployment of a real brand site. It shows practical web delivery in an operational context.',
      '',
      'Live: https://stks.oosu.dev',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'ProjectDeepDivePanel',
      components: ['ProjectDeepDivePanel', 'ImageCard', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Sticks & Stones',
        dataKey: 'project.sticks_and_stones',
        items: [representativeProjectsEn[2]],
      },
      {
        type: 'imageCard',
        title: 'Project image',
        items: [
          {
            image: 'project.sticks.cover',
            caption: 'Project screenshot asset pending',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: ['project.sticks_and_stones.overview'],
    hasTodo: true,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['sticks_and_stones'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.profile.business_to_dev.default',
    legacyIds: ['business.connection.ko'],
    intentId: 'profile.business_to_dev',
    entityId: 'career.business_to_dev',
    language: 'ko',
    quickLabel: '비즈니스 → 개발',
    displayQuestion:
      '비즈니스와 고객 경험은 우수님의 개발 방식에 어떻게 연결되나요?',
    patterns: [
      '비즈니스 → 개발',
      '비즈니스와 고객 경험은 우수님의 개발 방식에 어떻게 연결되나요?',
      '비즈니스 경험이 개발에 어떻게 연결되나요?',
      '경영학 개발 도움',
      '우수살롱 개발 연결',
    ],
    shortAnswer:
      '비즈니스 경험은 우수가 무엇을 만들지, 왜 그렇게 설계해야 하는지 판단하는 데 연결됩니다.',
    defaultAnswer: [
      '우수의 비즈니스 경험은 개발에서 “무엇을 만들지”와 “왜 그렇게 설계해야 하는지”를 판단하는 데 연결됩니다.',
      '',
      '경영학 배경, GfK Korea의 POS 데이터 분석 컨설팅, 우수살롱 운영 경험은 사용자·시장·운영 관점에서 문제를 보는 힘을 줬습니다. 그래서 기능 구현만 보는 것이 아니라 서비스 구조, 우선순위, 실제 사용 맥락을 함께 생각하는 편입니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'experience_bridge',
      density: 'standard',
      leadVisual: 'ExperienceBridgeDiagram',
      components: [
        'ExperienceBridgeDiagram',
        'SkillChipGroup',
        'SourceBadgeList',
      ],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'Experience Bridge',
        dataKey: 'career.bridge',
        items: [
          {
            title: 'Customer / Market',
            description: '고객과 시장을 읽는 관점',
          },
          { title: 'UX / Service', description: '경험 흐름과 우선순위 정리' },
          {
            title: 'Fullstack / AI',
            description: '질문, 데이터, API, 답변을 연결',
          },
        ],
      },
      {
        type: 'skillChips',
        title: 'Bridge Skills',
        dataKey: 'skills.business',
        items: [skillGroupsKo[3]],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'career.business_background',
      'career.oosu_salon',
      'profile.strengths',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['career', 'oosu_salon'],
    confidence: 0.94,
  }),
  createFaqAnswer({
    id: 'faq.profile.business_to_dev.default',
    legacyIds: ['business.connection.en'],
    intentId: 'profile.business_to_dev',
    entityId: 'career.business_to_dev',
    language: 'en',
    quickLabel: 'Business to dev',
    displayQuestion:
      "How does Oosu's business and customer experience background shape the way he builds products?",
    patterns: [
      'Business to dev',
      "How does Oosu's business and customer experience background shape the way he builds products?",
      'How does business experience connect to development?',
      'business background development',
    ],
    shortAnswer:
      "Oosu's business background helps him decide what to build and why a product should be structured that way.",
    defaultAnswer: [
      'Oosu’s business background helps him think about what to build and why a product should be structured a certain way.',
      '',
      'His business major, POS data consulting experience at GfK Korea, and Oosu Salon operation experience give him a user, market, and operations lens. That makes him look beyond implementation details toward service structure, priority, and real usage context.',
    ].join('\n'),
    renderSpec: {
      layout: 'experience_bridge',
      density: 'standard',
      leadVisual: 'ExperienceBridgeDiagram',
      components: [
        'ExperienceBridgeDiagram',
        'SkillChipGroup',
        'SourceBadgeList',
      ],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'Experience Bridge',
        dataKey: 'career.bridge',
        items: [
          {
            title: 'Customer / Market',
            description: 'Understanding people and market context',
          },
          {
            title: 'UX / Service',
            description: 'Structuring journeys and priorities',
          },
          {
            title: 'Fullstack / AI',
            description: 'Connecting questions, data, APIs, and answers',
          },
        ],
      },
      {
        type: 'skillChips',
        title: 'Bridge Skills',
        dataKey: 'skills.business',
        items: [skillGroupsEn[3]],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'career.business_background',
      'career.oosu_salon',
      'profile.strengths',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['career', 'oosu_salon'],
    confidence: 0.94,
  }),
  createFaqAnswer({
    id: 'faq.link.resume.default',
    legacyIds: ['resume.url.ko'],
    intentId: 'link.resume',
    entityId: 'contact.resume',
    language: 'ko',
    quickLabel: '이력서',
    displayQuestion: '이력서나 경력 정보를 볼 수 있는 링크가 준비되어 있나요?',
    patterns: [
      '이력서',
      '이력서나 경력 정보를 볼 수 있는 링크가 준비되어 있나요?',
      '이력서 URL 알려줘',
      '이력서 링크',
      'resume url',
      'cv',
    ],
    shortAnswer: '현재 공개 이력서 URL은 아직 준비 중입니다.',
    defaultAnswer:
      '현재 공개 이력서 URL은 아직 준비 중입니다. 공개 가능한 한국어/영어 이력서 링크가 준비되면 AskOosu와 Notion Wiki에 연결할 예정입니다.',
    renderSpec: {
      layout: 'contact_card',
      density: 'compact',
      leadVisual: 'ContactCard',
      components: ['ContactCard', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'contactCard',
        title: 'Public contact only',
        dataKey: 'contact.public',
        items: contactActionsKo,
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: ['profile.links.resume_policy'],
    hasTodo: true,
    freshness: 'needs_update',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['profile', 'career'],
    confidence: 0.99,
  }),
  createFaqAnswer({
    id: 'faq.link.resume.default',
    legacyIds: ['resume.url.en'],
    intentId: 'link.resume',
    entityId: 'contact.resume',
    language: 'en',
    quickLabel: 'Resume',
    displayQuestion:
      "Is Oosu's resume or detailed career profile ready to share?",
    patterns: [
      'resume',
      "Is Oosu's resume or detailed career profile ready to share?",
      'resume URL',
      'resume link',
      'CV link',
    ],
    shortAnswer: 'The public resume URL is not available yet.',
    defaultAnswer:
      'The public resume URL is not available yet. Once Korean and English resume links are ready, they will be connected to AskOosu and the Notion Wiki.',
    renderSpec: {
      layout: 'contact_card',
      density: 'compact',
      leadVisual: 'ContactCard',
      components: ['ContactCard', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'contactCard',
        title: 'Public contact only',
        dataKey: 'contact.public',
        items: contactActionsEn,
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: ['profile.links.resume_policy'],
    hasTodo: true,
    freshness: 'needs_update',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['profile', 'career'],
    confidence: 0.99,
  }),
  createFaqAnswer({
    id: 'faq.link.live_url.default',
    legacyIds: ['live-url.policy.ko'],
    intentId: 'link.live_url',
    entityId: 'links.public',
    language: 'ko',
    quickLabel: '라이브 URL',
    displayQuestion:
      '지금 바로 확인할 수 있는 포트폴리오나 프로젝트 링크가 있나요?',
    patterns: [
      '라이브 URL',
      '지금 바로 확인할 수 있는 포트폴리오나 프로젝트 링크가 있나요?',
      '라이브 URL이 없는 프로젝트는 어떻게 답해야 하나요?',
      '라이브 URL 없는 프로젝트',
      'private 프로젝트',
    ],
    shortAnswer:
      '바로 확인 가능한 공개 링크는 AskOosu, Instagram Clone, Sticks & Stones, Portfoli-Oh! 중심으로 안내할 수 있습니다.',
    defaultAnswer: [
      '바로 확인할 수 있는 공개 링크는 확인된 것만 안내합니다.',
      '',
      `- AskOosu: ${oosuProfile.currentPortfolioUrl}`,
      '- Instagram Clone: https://aigram.oosu.dev',
      '- Sticks & Stones: https://stks.oosu.dev',
      `- Portfoli-Oh!: ${oosuProfile.legacyPortfolioUrl}`,
      '',
      '라이브 URL이 없는 프로젝트는 배포된 것처럼 단정하지 않고, 공개 여부나 준비 중 상태를 그대로 말하는 것이 원칙입니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'contact_card',
      density: 'standard',
      leadVisual: 'ProjectShowcaseCards',
      components: ['ProjectShowcaseCards', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Live links',
        dataKey: 'projects.public_links',
        items: representativeProjectsKo,
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: ['project.links.public', 'policy.live_url'],
    hasTodo: false,
    freshness: 'time_sensitive',
    guardrails: sharedGuardrails,
    matchedEntityIds: [
      'askoosu',
      'instagram_clone',
      'sticks_and_stones',
      'policy.guardrail',
    ],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.link.live_url.default',
    legacyIds: ['live-url.policy.en'],
    intentId: 'link.live_url',
    entityId: 'links.public',
    language: 'en',
    quickLabel: 'Live links',
    displayQuestion: 'Which portfolio or project links can I open right now?',
    patterns: [
      'Live links',
      'Which portfolio or project links can I open right now?',
      'How should you answer projects without live URLs?',
      'project without live url',
      'private project',
    ],
    shortAnswer:
      'Verified public links can be shared for AskOosu, Instagram Clone, Sticks & Stones, and Portfoli-Oh!.',
    defaultAnswer: [
      'Only verified public links should be shown as live.',
      '',
      `- AskOosu: ${oosuProfile.currentPortfolioUrl}`,
      '- Instagram Clone: https://aigram.oosu.dev',
      '- Sticks & Stones: https://stks.oosu.dev',
      `- Portfoli-Oh!: ${oosuProfile.legacyPortfolioUrl}`,
      '',
      'Projects without live URLs should not be described as deployed. TODO, needs_review, or private evidence should stay unconfirmed.',
    ].join('\n'),
    renderSpec: {
      layout: 'contact_card',
      density: 'standard',
      leadVisual: 'ProjectShowcaseCards',
      components: ['ProjectShowcaseCards', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Live links',
        dataKey: 'projects.public_links',
        items: representativeProjectsEn,
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: ['project.links.public', 'policy.live_url'],
    hasTodo: false,
    freshness: 'time_sensitive',
    guardrails: sharedGuardrails,
    matchedEntityIds: [
      'askoosu',
      'instagram_clone',
      'sticks_and_stones',
      'policy.guardrail',
    ],
    confidence: 0.98,
  }),
];

export function findFaqAnswerById(
  faqId: string,
  language: ChatLanguage
): FaqAnswer | null {
  const normalizedFaqId = faqId.trim();
  if (!normalizedFaqId) return null;

  return (
    FAQ_ANSWERS.find(
      (answer) =>
        answer.language === language &&
        (answer.id === normalizedFaqId ||
          answer.legacyIds?.includes(normalizedFaqId))
    ) ??
    FAQ_ANSWERS.find(
      (answer) =>
        answer.id === normalizedFaqId ||
        answer.legacyIds?.includes(normalizedFaqId)
    ) ??
    null
  );
}

export function buildAnswerParts(faq: FaqAnswer): FaqAnswerPart[] {
  const visualBlocks = faq.visualBlocks ?? [];
  const leadVisual = faq.renderSpec?.leadVisual;
  const leadBlock = leadVisual
    ? visualBlocks.find((block) => componentNameForBlock(block) === leadVisual)
    : null;
  const otherBlocks = visualBlocks.filter(
    (block) => block !== leadBlock && block.type !== 'sourceBadges'
  );
  const sourceBlock = visualBlocks.find(
    (block) => block.type === 'sourceBadges'
  );

  return [
    ...(leadBlock ? [componentPartForBlock(leadBlock)] : []),
    { type: 'markdown' as const, contentKey: 'defaultAnswer' as const },
    ...otherBlocks.map(componentPartForBlock),
    ...(sourceBlock
      ? [
          {
            type: 'sourceBadges' as const,
            sourceChunkIds: faq.sourceChunkIds,
          },
        ]
      : []),
  ];
}

function createFaqAnswer(input: FaqAnswerInput): FaqAnswer {
  return {
    ...input,
    answer: input.defaultAnswer,
    cacheMode: input.cacheMode ?? 'direct_cache',
    answerSource: input.answerSource ?? 'faq_cache',
    skippedGroq: input.skippedGroq ?? true,
    visibility: input.visibility ?? 'public',
  };
}

function componentPartForBlock(block: FaqVisualBlock): FaqAnswerPart {
  return {
    type: 'component',
    component: componentNameForBlock(block),
    dataKey: block.dataKey,
    blockType: block.type,
  };
}

function componentNameForBlock(block: FaqVisualBlock) {
  const componentByType: Record<FaqVisualBlockType, string> = {
    profileCard: 'ProfileHeroCard',
    projectCards: 'ProjectShowcaseCards',
    skillChips: 'SkillChipGroup',
    timeline: 'CareerTimeline',
    comparisonTable: 'ComparisonGrid',
    statelessDiagram: 'AIWorkflowSteps',
    imageCard: 'ImageCard',
    contactCard: 'ContactCard',
    ctaButtons: 'CtaButtons',
    sourceBadges: 'SourceBadgeList',
  };

  return componentByType[block.type];
}
