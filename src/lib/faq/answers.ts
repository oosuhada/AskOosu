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
  mobileSrc?: string;
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
    src: '/images/profile/oosu-profile-desktop.webp',
    mobileSrc: '/images/profile/oosu-profile-mobile.webp',
    alt: 'Oosu profile portrait',
    status: 'ready',
  },
  {
    assetKey: 'project.askoosu.cover',
    kind: 'project',
    src: '/images/projects/askoosu-cover-desktop.webp',
    mobileSrc: '/images/projects/askoosu-cover-mobile.webp',
    alt: 'AskOosu project cover',
    status: 'ready',
  },
  {
    assetKey: 'project.aigram.cover',
    kind: 'project',
    src: '/images/projects/aigram-cover-desktop.webp',
    mobileSrc: '/images/projects/aigram-cover-mobile.webp',
    alt: 'Aigram project cover',
    status: 'ready',
  },
  {
    assetKey: 'project.sticks.cover',
    kind: 'project',
    src: '/images/projects/sticks-stones-cover-desktop.webp',
    mobileSrc: '/images/projects/sticks-stones-cover-mobile.webp',
    alt: 'Sticks and Stones project cover',
    status: 'ready',
  },
  {
    assetKey: 'project.portfoliooh.cover',
    kind: 'project',
    src: '/images/projects/portfolio-oh-cover-desktop.webp',
    mobileSrc: '/images/projects/portfolio-oh-cover-mobile.webp',
    alt: 'Portfoli-Oh 2025 portfolio preview',
    status: 'ready',
  },
  {
    assetKey: 'life.oosu_salon.cover',
    kind: 'gallery',
    src: '/images/life/oosu-salon-desktop.webp',
    mobileSrc: '/images/life/oosu-salon-mobile.webp',
    alt: 'Oosu Salon visual memory',
    status: 'ready',
  },
  {
    assetKey: 'life.sensory_interests.cover',
    kind: 'gallery',
    src: '/images/life/sensory-interests-desktop.webp',
    mobileSrc: '/images/life/sensory-interests-mobile.webp',
    alt: 'Sensory interests visual reference',
    status: 'ready',
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
    title: 'Aigram',
    subtitle: 'Instagram Clone 기반 1인 풀스택 SNS 프로젝트',
    description:
      'Spring Boot, PostgreSQL, React/Next.js, 검색과 AI 기능까지 연결하며 SNS 데이터 흐름을 익힌 프로젝트입니다.',
    image: 'project.aigram.cover',
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
    title: 'Aigram',
    subtitle: 'Solo fullstack SNS project inspired by Instagram Clone',
    description:
      'A project for learning SNS data flow across Spring Boot, PostgreSQL, React/Next.js, search, and AI features.',
    image: 'project.aigram.cover',
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
    legacyIds: ['faq.projects.top3.summary'],
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
    legacyIds: ['faq.projects.top3.summary'],
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
    legacyIds: ['faq.tech_stack.level.default'],
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
    legacyIds: ['faq.tech_stack.level.default'],
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
    legacyIds: ['contact.collab.ko', 'faq.contact.default'],
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
    legacyIds: ['contact.collab.en', 'faq.contact.default'],
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
    legacyIds: ['ai.usage.ko', 'faq.ai_usage.default'],
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
    legacyIds: ['ai.usage.en', 'faq.ai_usage.default'],
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
    quickLabel: 'Aigram',
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
        title: 'Aigram',
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
    quickLabel: 'Aigram',
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
        title: 'Aigram',
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
    id: 'faq.project.portfoliooh_vs_askoosu.default',
    intentId: 'project.portfoliooh_vs_askoosu',
    entityId: 'portfoli_oh',
    language: 'ko',
    quickLabel: 'Portfoli-Oh! vs AskOosu',
    displayQuestion: 'Portfoli-Oh!와 AskOosu는 어떤 점이 다른가요?',
    patterns: [
      'Portfoli-Oh!와 AskOosu는 어떤 점이 다른가요?',
      'Portfoli-Oh!의 한계가 AskOosu로 어떻게 이어졌나요?',
      'portfoli-oh askoosu 차이',
      'old portfolio vs AskOosu',
      'before after portfolio',
    ],
    shortAnswer:
      'Portfoli-Oh!는 인터랙션 중심의 프론트엔드 아카이브였고, AskOosu는 질문 중심의 AI/RAG 포트폴리오입니다.',
    defaultAnswer: [
      'Portfoli-Oh!는 우수가 프론트엔드 인터랙션을 많이 실험했던 2025 포트폴리오이고, AskOosu는 그 경험을 바탕으로 만든 2026 대화형 AI 포트폴리오입니다.',
      '',
      'Portfoli-Oh!에서는 GSAP, Three.js, Lottie, 커스텀 커서, JSON 키워드 매칭 챗봇처럼 “보여줄 수 있는 것”을 많이 넣었습니다. 배운 점은 컸지만 기능이 늘수록 방문자가 무엇을 봐야 하는지 흐름이 흐려질 수 있다는 한계도 보였습니다.',
      '',
      'AskOosu는 그 반성에서 출발해 “더 많이 보여주기”보다 “더 빨리 묻고 찾게 하기”를 우선합니다. 그래서 FAQ cache, Notion Wiki, RAG, source badge, contextual quick question처럼 정보 구조와 답변 신뢰도를 중심에 둡니다.',
    ].join('\n'),
    detailedAnswer: [
      'Portfoli-Oh!와 AskOosu의 차이는 단순히 2025 포트폴리오와 2026 포트폴리오의 차이가 아니라, 우수의 제품 사고가 어떻게 바뀌었는지를 보여줍니다.',
      '',
      'Portfoli-Oh!는 프론트엔드 학습 아카이브에 가까웠습니다. 애니메이션, 3D, 하이라이터, JSON 챗봇 등 여러 인터랙션을 넣으면서 구현 경험을 쌓았지만, 데이터가 커질수록 JSON 기반 챗봇 유지보수가 어려워지고 방문자 입장에서는 탐색 방향이 흐려지는 문제가 생겼습니다.',
      '',
      'AskOosu는 그 문제를 정보 구조로 다시 푼 프로젝트입니다. 방문자가 특정 섹션을 오래 스크롤하지 않아도 질문으로 바로 들어가고, FAQ cache와 RAG가 질문 성격에 맞게 답변을 라우팅합니다. 그래서 AskOosu는 “인터랙션을 많이 만든 포트폴리오”가 아니라 “질문과 근거로 탐색하는 포트폴리오”에 가깝습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'comparison_grid',
      density: 'standard',
      leadVisual: 'ComparisonGrid',
      components: ['ComparisonGrid', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'comparisonTable',
        title: 'Portfoli-Oh! → AskOosu',
        dataKey: 'project.portfoliooh_vs_askoosu',
        items: [
          {
            leftTitle: 'Portfoli-Oh! 2025',
            rightTitle: 'AskOosu 2026',
            rows: [
              {
                label: '중심',
                left: '인터랙션과 프론트엔드 실험',
                right: '질문 중심 정보 탐색',
              },
              {
                label: '답변 구조',
                left: 'JSON 키워드 매칭 챗봇',
                right: 'FAQ cache + Notion RAG',
              },
              {
                label: '배운 점',
                left: '기능이 많아질수록 흐름이 흐려질 수 있음',
                right: '맥락형 질문과 근거 표시가 더 중요함',
              },
            ],
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.portfolio_oh.story',
      'project.askoosu.fact',
      'rag.answer_routing',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['portfoli_oh', 'askoosu'],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.project.portfoliooh_vs_askoosu.default',
    intentId: 'project.portfoliooh_vs_askoosu',
    entityId: 'portfoli_oh',
    language: 'en',
    quickLabel: 'Portfoli-Oh! vs AskOosu',
    displayQuestion: 'What is the difference between Portfoli-Oh! and AskOosu?',
    patterns: [
      'What is the difference between Portfoli-Oh! and AskOosu?',
      'How did the limits of Portfoli-Oh! lead to AskOosu?',
      'portfoli-oh askoosu difference',
      'old portfolio vs AskOosu',
      'before after portfolio',
    ],
    shortAnswer:
      'Portfoli-Oh! was an interaction-heavy frontend archive; AskOosu is a question-first AI/RAG portfolio.',
    defaultAnswer: [
      'Portfoli-Oh! was Oosu’s 2025 portfolio for experimenting with frontend interactions, while AskOosu is the 2026 conversational AI portfolio built from those lessons.',
      '',
      'Portfoli-Oh! included GSAP, Three.js, Lottie, a custom cursor, highlighting, and a JSON keyword-matching chatbot. It was valuable as a learning archive, but it also showed that too many features can make visitors lose direction.',
      '',
      'AskOosu starts from that reflection. Instead of adding more visual effects, it focuses on helping visitors ask, find, and trust answers faster through FAQ cache, Notion Wiki, RAG, source badges, and contextual quick questions.',
    ].join('\n'),
    detailedAnswer: [
      'The difference between Portfoli-Oh! and AskOosu is also a difference in product thinking.',
      '',
      'Portfoli-Oh! was closer to a frontend learning archive. Oosu tried animation, 3D, highlighting, and a JSON chatbot, which created useful implementation experience. But as the content grew, the JSON chatbot became harder to maintain and the visitor journey became less clear.',
      '',
      'AskOosu reframes that problem as information architecture. Visitors can ask instead of scrolling through every section, and the system routes questions through FAQ cache and RAG depending on the intent. That makes AskOosu less about showing every possible interaction and more about conversational discovery with evidence.',
    ].join('\n'),
    renderSpec: {
      layout: 'comparison_grid',
      density: 'standard',
      leadVisual: 'ComparisonGrid',
      components: ['ComparisonGrid', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'comparisonTable',
        title: 'Portfoli-Oh! → AskOosu',
        dataKey: 'project.portfoliooh_vs_askoosu',
        items: [
          {
            leftTitle: 'Portfoli-Oh! 2025',
            rightTitle: 'AskOosu 2026',
            rows: [
              {
                label: 'Center',
                left: 'Interaction and frontend experiments',
                right: 'Question-first information discovery',
              },
              {
                label: 'Answer model',
                left: 'JSON keyword-matching chatbot',
                right: 'FAQ cache + Notion RAG',
              },
              {
                label: 'Lesson',
                left: 'Too many features can blur the visitor flow',
                right: 'Contextual questions and evidence matter more',
              },
            ],
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.portfolio_oh.story',
      'project.askoosu.fact',
      'rag.answer_routing',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['portfoli_oh', 'askoosu'],
    confidence: 0.97,
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
  createFaqAnswer({
    id: 'faq.project.askoosu.visual_ui.default',
    intentId: 'project.askoosu.visual_ui',
    entityId: 'askoosu',
    language: 'ko',
    quickLabel: 'UI/UX 방향',
    displayQuestion: 'AskOosu의 UI/UX는 어떤 방향으로 설계했나요?',
    patterns: [
      'AskOosu의 UI는 어떻게 설계했나요?',
      'AskOosu UI UX 방향',
      '대화형 포트폴리오 UX 설명',
      'AskOosu visual ui',
      'AskOosu design direction',
    ],
    shortAnswer:
      'AskOosu의 UI/UX는 긴 포트폴리오를 읽게 하기보다 궁금한 것을 바로 묻게 하는 방향으로 설계했습니다.',
    defaultAnswer: [
      'AskOosu의 UI/UX는 정적인 포트폴리오를 대화형 정보 탐색 경험으로 바꾸는 방향으로 설계되었습니다.',
      '',
      '핵심은 사용자가 긴 스크롤 페이지를 읽는 대신, 궁금한 것을 바로 질문하고 빠르게 답에 도달하게 만드는 것입니다. 그래서 중심 인터페이스는 채팅이지만, 답변이 전부 텍스트로만 끝나지 않도록 추천 질문, 프로젝트 카드, source/confidence badge, quick action 같은 시각 블록을 함께 두는 방향으로 보고 있습니다.',
      '',
      'Portfoli-Oh!를 만들면서 인터랙션이 많아질수록 사용자가 길을 잃을 수 있다는 점을 배웠기 때문에, AskOosu에서는 “더 화려하게”보다 “더 빨리 이해되게”를 우선합니다.',
    ].join('\n'),
    detailedAnswer: [
      'AskOosu의 UI/UX 방향은 세 가지 원칙으로 정리할 수 있습니다.',
      '',
      '첫째, 질문 중심 탐색입니다. 방문자가 About, Projects, Skills를 순서대로 읽지 않아도 궁금한 질문 하나로 바로 원하는 맥락에 들어갈 수 있어야 합니다.',
      '',
      '둘째, 텍스트와 시각 블록을 섞은 답변입니다. 대표 프로젝트, 기술 스택, 연락/협업, AskOosu 구조 같은 질문은 카드, 칩, 단계형 다이어그램으로 보여줄 때 이해가 더 빠릅니다.',
      '',
      '셋째, 과한 인터랙션보다 명확한 정보 위계입니다. AskOosu는 “보기 좋은 포트폴리오”보다 “질문하기 쉬운 포트폴리오”에 가깝습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'AskOosu UI Principles',
        dataKey: 'askoosu.ui_principles',
        items: [
          {
            title: '질문 중심 탐색',
            description: '긴 스크롤 대신 질문 하나로 원하는 맥락에 진입합니다.',
          },
          {
            title: '텍스트 + 시각 블록',
            description:
              '답변마다 카드, 칩, badge를 조합해 이해 속도를 높입니다.',
          },
          {
            title: '정보 위계 우선',
            description: '효과보다 빠른 이해와 명확한 탐색 흐름을 우선합니다.',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'project.askoosu.fact',
      'project.askoosu.story',
      'project.askoosu.rag_principles',
      'project.portfolio_oh.story',
      'ui.answer_experience',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'portfoli_oh'],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.visual_ui.default',
    intentId: 'project.askoosu.visual_ui',
    entityId: 'askoosu',
    language: 'en',
    quickLabel: 'UI/UX direction',
    displayQuestion: 'What was the UI/UX direction behind AskOosu?',
    patterns: [
      'What was the UI direction of AskOosu?',
      'AskOosu UI UX',
      'conversational portfolio UX',
      'AskOosu visual ui',
      'AskOosu design direction',
    ],
    shortAnswer:
      'AskOosu is designed around letting people ask immediately rather than making them read a long portfolio.',
    defaultAnswer: [
      'AskOosu’s UI/UX is designed to turn a static portfolio into a conversational information-discovery experience.',
      '',
      'The goal is to help visitors reach answers quickly by asking natural questions instead of scrolling through long sections. Chat is the main interface, but the answer experience should not be text-only: recommended questions, project cards, source/confidence badges, and quick actions should support understanding.',
      '',
      'Portfoli-Oh! taught that too many interactions can make people lose their way, so AskOosu prioritizes “easier to understand faster” over “more flashy.”',
    ].join('\n'),
    detailedAnswer: [
      'The UI/UX direction of AskOosu has three principles.',
      '',
      'First, question-first navigation. Visitors should not need to read About, Projects, and Skills in a fixed order.',
      '',
      'Second, blended text and visual answer blocks. High-value answers are easier to understand as cards, chips, badges, or step diagrams.',
      '',
      'Third, clear information hierarchy over excessive interaction. AskOosu is meant to be a portfolio that is easy to ask, not just easy to look at.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_deep_dive',
      density: 'standard',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'AskOosu UI Principles',
        dataKey: 'askoosu.ui_principles',
        items: [
          {
            title: 'Question-first navigation',
            description:
              'A visitor can enter the right context through one question.',
          },
          {
            title: 'Text + visual blocks',
            description:
              'Cards, chips, and badges make answers easier to scan.',
          },
          {
            title: 'Hierarchy first',
            description:
              'The interface prioritizes understanding over visual spectacle.',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'project.askoosu.fact',
      'project.askoosu.story',
      'project.askoosu.rag_principles',
      'project.portfolio_oh.story',
      'ui.answer_experience',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'portfoli_oh'],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.deployment.default',
    intentId: 'project.askoosu.deployment',
    entityId: 'askoosu',
    language: 'ko',
    quickLabel: '배포 / 운영',
    displayQuestion: 'AskOosu는 어떻게 배포하고 운영하나요?',
    patterns: [
      'AskOosu 배포',
      'AskOosu는 어디서 돌아가나요?',
      '포트폴리오 운영 구조',
      'deployment of AskOosu',
      'home server 배포',
    ],
    shortAnswer:
      'AskOosu는 oosu.dev를 canonical live URL로 두고, Notion Wiki 원본과 Next.js 앱, RAG 캐시, 답변 생성을 연결하는 구조를 지향합니다.',
    defaultAnswer: [
      'AskOosu는 `https://oosu.dev`를 canonical live URL로 두고 운영하는 방향입니다.',
      '',
      '콘텐츠 원본은 Notion Wiki이고, 서비스 레이어에서는 Next.js 기반 프론트엔드와 API route handler, RAG 검색 캐시용 데이터 저장소, Groq 기반 답변 생성을 연결합니다. 운영 관점에서는 Notion 내용을 주기적으로 sync해 chunk를 갱신하고, 자주 묻는 질문은 FAQ cache로 먼저 처리해 API 비용과 응답 지연을 줄입니다.',
    ].join('\n'),
    detailedAnswer: [
      'AskOosu의 배포/운영 구조는 네 층으로 볼 수 있습니다.',
      '',
      '첫째, Notion Wiki를 편집 가능한 콘텐츠 원본으로 둡니다. 둘째, Next.js 앱이 채팅 UI, 추천 질문, 시각 답변 블록, API route handler를 담당합니다.',
      '',
      '셋째, `/api/rag/sync`, `/api/rag/search`, `/api/chat`이 FAQ cache, RAG, Groq 흐름을 조립합니다. 넷째, 외부에는 `oosu.dev` 같은 canonical URL을 우선 노출하고 홈서버와 Cloudflare Tunnel 구조를 기준으로 접근성을 확보합니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'ai_workflow',
      density: 'standard',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'Deployment / Ops Layers',
        dataKey: 'askoosu.deployment',
        items: [
          {
            title: 'Content source',
            description: 'Notion Wiki를 원본 CMS로 사용합니다.',
          },
          {
            title: 'App layer',
            description: 'Next.js UI와 API route handler가 요청을 처리합니다.',
          },
          {
            title: 'Data / RAG',
            description:
              'PostgreSQL 검색 캐시와 source chunk metadata를 활용합니다.',
          },
          {
            title: 'Domain / Infra',
            description:
              'oosu.dev canonical URL과 홈서버 운영 원칙을 따릅니다.',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'links.public',
      'rag.frontend_backend_db',
      'rag.notion_sync.rules',
      'rag.groq.guardrails',
      'project.askoosu.fact',
    ],
    hasTodo: false,
    freshness: 'time_sensitive',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'rag'],
    confidence: 0.94,
  }),
  createFaqAnswer({
    id: 'faq.project.askoosu.deployment.default',
    intentId: 'project.askoosu.deployment',
    entityId: 'askoosu',
    language: 'en',
    quickLabel: 'Deployment',
    displayQuestion: 'How is AskOosu deployed and operated?',
    patterns: [
      'How is AskOosu deployed?',
      'Where does AskOosu run?',
      'portfolio deployment',
      'deployment of AskOosu',
      'home server deployment',
    ],
    shortAnswer:
      'AskOosu uses oosu.dev as the canonical public URL and connects Notion Wiki, the Next.js app, retrieval cache, and answer generation around it.',
    defaultAnswer: [
      'AskOosu is intended to run with `https://oosu.dev` as the canonical live URL.',
      '',
      'The original content lives in Notion Wiki, while the service layer connects a Next.js frontend, route handlers, a retrieval/cache data layer, and Groq-based answer generation. Operationally, Notion content should be synced into chunks, and frequently asked questions should be handled by the FAQ cache first to reduce cost and latency.',
    ].join('\n'),
    detailedAnswer: [
      'The deployment and operations model of AskOosu can be understood in four layers.',
      '',
      'First, Notion Wiki is the editable source of truth. Second, the Next.js app handles chat UI, suggested questions, visual answer blocks, and route handlers.',
      '',
      'Third, `/api/rag/sync`, `/api/rag/search`, and `/api/chat` assemble FAQ cache, RAG, and Groq. Fourth, the public experience should prioritize a canonical domain such as `oosu.dev`, with a home-server and Cloudflare Tunnel style approach for clean access.',
    ].join('\n'),
    renderSpec: {
      layout: 'ai_workflow',
      density: 'standard',
      leadVisual: 'AIWorkflowSteps',
      components: ['AIWorkflowSteps', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'statelessDiagram',
        title: 'Deployment / Ops Layers',
        dataKey: 'askoosu.deployment',
        items: [
          {
            title: 'Content source',
            description: 'Notion Wiki acts as the editable CMS.',
          },
          {
            title: 'App layer',
            description: 'Next.js UI and route handlers process requests.',
          },
          {
            title: 'Data / RAG',
            description:
              'PostgreSQL retrieval cache and source metadata support answers.',
          },
          {
            title: 'Domain / Infra',
            description:
              'The public experience centers on the oosu.dev canonical URL.',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'links.public',
      'rag.frontend_backend_db',
      'rag.notion_sync.rules',
      'rag.groq.guardrails',
      'project.askoosu.fact',
    ],
    hasTodo: false,
    freshness: 'time_sensitive',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['askoosu', 'rag'],
    confidence: 0.94,
  }),
  createFaqAnswer({
    id: 'faq.tech.rag_vs_faq_cache.default',
    intentId: 'tech.rag_vs_faq_cache',
    entityId: 'rag',
    language: 'ko',
    quickLabel: 'RAG vs Cache',
    displayQuestion: 'FAQ cache와 RAG는 어떻게 역할이 다른가요?',
    patterns: [
      'FAQ cache와 RAG 차이',
      'cache랑 rag는 뭐가 달라요?',
      '왜 둘 다 필요해요?',
      'faq cache vs rag',
      'retrieval vs cache',
    ],
    shortAnswer:
      'FAQ cache는 반복 질문에 검증된 답을 바로 반환하고, RAG는 고정하기 어려운 질문에 관련 chunk를 검색해 답을 조립합니다.',
    defaultAnswer: [
      'FAQ cache와 RAG는 역할이 다릅니다.',
      '',
      'FAQ cache는 반복적으로 자주 들어오고 답변 형태가 안정적인 질문에 대해 Groq 호출 없이 바로 모범답안을 반환하는 구조입니다. 반면 RAG는 질문이 더 구체적이거나 조합형일 때 Notion Wiki chunk를 검색해 근거를 모은 뒤 답을 조립합니다.',
      '',
      '즉, FAQ cache는 속도와 비용 절감, RAG는 유연성과 근거 검색을 담당합니다.',
    ].join('\n'),
    detailedAnswer: [
      'AskOosu에서 FAQ cache와 RAG는 경쟁 관계가 아니라 역할 분담 관계입니다.',
      '',
      'FAQ cache는 모범답안 뱅크에 가깝습니다. FAQ ID, intent, patterns, short/default/detailed answer를 미리 관리하고 높은 confidence로 매칭되면 바로 반환합니다.',
      '',
      'RAG는 근거 검색 기반 설명 엔진에 가깝습니다. 질문이 길거나 여러 개념을 엮으면 관련 source chunk를 먼저 찾고 그 근거를 기반으로 답을 만듭니다. 그래서 실제 라우팅은 FAQ cache first, RAG next가 적절합니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'comparison_grid',
      density: 'standard',
      leadVisual: 'ComparisonGrid',
      components: ['ComparisonGrid', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'comparisonTable',
        title: 'FAQ cache vs RAG',
        dataKey: 'tech.rag_vs_cache',
        items: [
          {
            leftTitle: 'FAQ cache',
            rightTitle: 'RAG',
            rows: [
              {
                label: '역할',
                left: '반복 질문의 모범답안 반환',
                right: '관련 chunk 검색 후 답변 조립',
              },
              {
                label: '강점',
                left: '빠름, 저비용, 톤 안정',
                right: '유연함, 근거 기반, 조합 질문 대응',
              },
              {
                label: '사용 시점',
                left: '대표 프로젝트, 연락, 자기소개',
                right: '상세 기술, 비교, follow-up',
              },
            ],
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'rag.architecture.overview',
      'faq.cache.rules',
      'rag.answer_routing',
      'rag.groq.guardrails',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['rag', 'faq_cache'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.tech.rag_vs_faq_cache.default',
    intentId: 'tech.rag_vs_faq_cache',
    entityId: 'rag',
    language: 'en',
    quickLabel: 'RAG vs Cache',
    displayQuestion: 'What is the difference between FAQ cache and RAG?',
    patterns: [
      'Difference between FAQ cache and RAG',
      'cache vs rag',
      'Why do you need both?',
      'faq cache vs rag',
      'retrieval vs cache',
    ],
    shortAnswer:
      'FAQ cache returns verified answers for repeated questions, while RAG retrieves chunks and composes grounded answers for flexible questions.',
    defaultAnswer: [
      'FAQ cache and RAG serve different roles.',
      '',
      'FAQ cache is for repeated, stable questions and can return a prepared answer directly without calling Groq. RAG is used when a question is more specific or compositional: it retrieves relevant Notion Wiki chunks first and then assembles the answer.',
      '',
      'Cache is mainly for speed and cost reduction; RAG is for flexibility and evidence retrieval.',
    ].join('\n'),
    detailedAnswer: [
      'In AskOosu, FAQ cache and RAG are complementary.',
      '',
      'FAQ cache is closer to a model answer bank. Each cached item has an FAQ ID, intent, patterns, and answer variants. When a user question matches with high confidence, the system returns it immediately.',
      '',
      'RAG is closer to an evidence-driven explanation engine. Longer or compositional questions retrieve relevant source chunks before answer assembly. The best routing rule is therefore FAQ cache first, RAG next.',
    ].join('\n'),
    renderSpec: {
      layout: 'comparison_grid',
      density: 'standard',
      leadVisual: 'ComparisonGrid',
      components: ['ComparisonGrid', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'comparisonTable',
        title: 'FAQ cache vs RAG',
        dataKey: 'tech.rag_vs_cache',
        items: [
          {
            leftTitle: 'FAQ cache',
            rightTitle: 'RAG',
            rows: [
              {
                label: 'Role',
                left: 'Returns prepared answers for repeated questions',
                right: 'Retrieves chunks and assembles grounded answers',
              },
              {
                label: 'Strength',
                left: 'Fast, low-cost, stable tone',
                right: 'Flexible, evidence-based, handles follow-ups',
              },
              {
                label: 'Best for',
                left: 'Top projects, contact, intro',
                right: 'Technical detail, comparison, contextual questions',
              },
            ],
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'rag.architecture.overview',
      'faq.cache.rules',
      'rag.answer_routing',
      'rag.groq.guardrails',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['rag', 'faq_cache'],
    confidence: 0.98,
  }),
  createFaqAnswer({
    id: 'faq.tech.springboot.postgresql.default',
    intentId: 'tech.springboot_postgresql',
    entityId: 'tech',
    language: 'ko',
    quickLabel: 'Spring/PostgreSQL',
    displayQuestion: 'Spring Boot와 PostgreSQL은 어떤 프로젝트에서 사용했나요?',
    patterns: [
      'Spring Boot 어디에 썼어요?',
      'PostgreSQL 사용 프로젝트',
      'Spring Boot와 PostgreSQL',
      'backend stack',
      'what projects used spring boot and postgresql',
    ],
    shortAnswer:
      'Spring Boot와 PostgreSQL은 Instagram Clone에서 함께 사용했고, AskOosu에서는 PostgreSQL을 RAG 검색 캐시 구조로 활용합니다.',
    defaultAnswer: [
      'Spring Boot와 PostgreSQL을 가장 본격적으로 다룬 프로젝트는 Instagram Clone입니다.',
      '',
      '이 프로젝트에서 Spring Boot 백엔드와 PostgreSQL을 기반으로 사용자, 게시글, 댓글, 팔로우, 검색 같은 SNS의 관계형 데이터 흐름을 설계하고 구현했습니다.',
      '',
      'PostgreSQL은 AskOosu에서도 중요합니다. AskOosu에서는 Notion Wiki에서 가져온 chunk를 저장하고 검색하는 RAG 캐시 구조를 PostgreSQL/pgvector 확장 가능 구조로 연결하는 방향을 보고 있습니다.',
    ].join('\n'),
    detailedAnswer: [
      'Spring Boot와 PostgreSQL은 우수의 백엔드 성장 흐름을 보여주는 기술 조합입니다.',
      '',
      'Instagram Clone에서는 Spring Boot, PostgreSQL, REST API를 기반으로 SNS 서비스의 핵심 도메인을 다뤘습니다. 사용자 계정, 게시물, 댓글, 팔로우 관계, 검색, 인증 같은 기능을 연결하면서 데이터 모델링과 API 설계가 얼마나 중요한지 체감한 프로젝트입니다.',
      '',
      'AskOosu에서는 PostgreSQL이 전통적인 CRUD보다 지식 chunk, metadata, source id, feedback log를 저장하고 retrieval cache로 활용하는 역할에 가깝습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_showcase',
      density: 'standard',
      leadVisual: 'ProjectShowcaseCards',
      components: ['ProjectShowcaseCards', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Backend / DB Usage',
        dataKey: 'tech.springboot_postgresql.projects',
        items: [
          representativeProjectsKo[1],
          {
            ...representativeProjectsKo[0],
            subtitle: 'PostgreSQL 기반 RAG 검색 캐시',
          },
        ],
      },
      {
        type: 'skillChips',
        title: 'Backend / Data Stack',
        dataKey: 'skills.backend',
        items: [skillGroupsKo[1], skillGroupsKo[2]],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.instagram_clone.fact',
      'project.instagram_clone.story',
      'project.askoosu.fact',
      'rag.db.blueprint',
      'skills.backend',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['instagram_clone', 'askoosu', 'tech'],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.tech.springboot.postgresql.default',
    intentId: 'tech.springboot_postgresql',
    entityId: 'tech',
    language: 'en',
    quickLabel: 'Spring/PostgreSQL',
    displayQuestion: 'Which projects used Spring Boot and PostgreSQL?',
    patterns: [
      'Where did you use Spring Boot?',
      'PostgreSQL projects',
      'Spring Boot and PostgreSQL',
      'backend stack',
      'what projects used spring boot and postgresql',
    ],
    shortAnswer:
      'The clearest Spring Boot and PostgreSQL project is Instagram Clone. PostgreSQL also matters in AskOosu as a retrieval/cache data layer.',
    defaultAnswer: [
      'The project where Spring Boot and PostgreSQL were used together most clearly is Instagram Clone.',
      '',
      'In that project, Spring Boot and PostgreSQL were used to design and implement the relational flow behind users, posts, comments, follows, and search. PostgreSQL is also important in AskOosu, where it supports a retrieval/cache-oriented data structure for RAG.',
    ].join('\n'),
    detailedAnswer: [
      'Spring Boot and PostgreSQL together show an important part of Oosu’s backend growth.',
      '',
      'In Instagram Clone, Spring Boot, PostgreSQL, and REST API were used to build the core domain of an SNS product. Users, posts, comments, follows, search, and auth required data modeling and API design.',
      '',
      'In AskOosu, PostgreSQL plays a different role: storing knowledge chunks, metadata, source IDs, and feedback logs for retrieval-oriented AI architecture.',
    ].join('\n'),
    renderSpec: {
      layout: 'project_showcase',
      density: 'standard',
      leadVisual: 'ProjectShowcaseCards',
      components: ['ProjectShowcaseCards', 'SkillChipGroup', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'projectCards',
        title: 'Backend / DB Usage',
        dataKey: 'tech.springboot_postgresql.projects',
        items: [
          representativeProjectsEn[1],
          {
            ...representativeProjectsEn[0],
            subtitle: 'PostgreSQL-backed RAG retrieval cache',
          },
        ],
      },
      {
        type: 'skillChips',
        title: 'Backend / Data Stack',
        dataKey: 'skills.backend',
        items: [skillGroupsEn[1], skillGroupsEn[2]],
      },
      { type: 'sourceBadges' },
    ],
    mediaRefs,
    sourceChunkIds: [
      'project.instagram_clone.fact',
      'project.instagram_clone.story',
      'project.askoosu.fact',
      'rag.db.blueprint',
      'skills.backend',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['instagram_clone', 'askoosu', 'tech'],
    confidence: 0.97,
  }),
  createFaqAnswer({
    id: 'faq.recruiter.first_30_days.default',
    intentId: 'recruiter.first_30_days',
    entityId: 'recruiter',
    language: 'ko',
    quickLabel: 'First 30 days',
    displayQuestion: '입사 후 첫 30일 동안 어떻게 기여할 수 있나요?',
    patterns: [
      '입사 후 30일',
      '첫 달에 어떻게 기여할 수 있나요?',
      'onboarding plan',
      'first 30 days contribution',
      '처음 합류하면 뭘 할 수 있어요',
    ],
    shortAnswer:
      '첫 30일에는 도메인과 제품 흐름을 빠르게 이해하고, 작은 개선부터 바로 실행에 옮기는 방식으로 기여할 수 있습니다.',
    defaultAnswer: [
      '입사 후 첫 30일에는 무리하게 큰 변화를 만들기보다, 팀의 제품 맥락과 사용자 흐름을 빠르게 이해하고 바로 개선 가능한 지점을 찾는 방식으로 기여할 수 있습니다.',
      '',
      '우수는 새로운 도구나 구조를 빠르게 익히고 작은 기능이나 UX 개선, 문서화, 문제 구조화부터 실행하는 데 강점이 있습니다. 첫 달의 역할은 “모든 걸 바꾸는 사람”이라기보다 “빠르게 이해하고 바로 도움이 되는 사람”에 가깝습니다.',
    ].join('\n'),
    detailedAnswer: [
      '첫 30일 기여 방식은 세 단계입니다.',
      '',
      '0-10일에는 제품을 직접 써보고 사용자 여정, 핵심 지표, 팀이 중요하게 보는 문제를 파악합니다.',
      '',
      '10-20일에는 정보 구조, 마이크로카피, 작은 프론트엔드 개선, 간단한 API 연동, 문서화 같은 작은 결과물을 만듭니다.',
      '',
      '20-30일에는 AI, 검색, 추천, 운영 효율화와 연결될 수 있는 확장 포인트를 제안합니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'timeline',
      density: 'standard',
      leadVisual: 'CareerTimeline',
      components: ['CareerTimeline', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'timeline',
        title: 'First 30 days',
        dataKey: 'recruiter.first_30_days',
        items: [
          {
            title: '0-10일',
            description: '제품과 도메인, 사용자 흐름을 빠르게 흡수합니다.',
          },
          {
            title: '10-20일',
            description: '작은 UX/프론트엔드/문서화 개선을 바로 실행합니다.',
          },
          {
            title: '20-30일',
            description:
              'AI/search/운영 효율화 확장 포인트를 구조화해 제안합니다.',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'profile.strengths',
      'profile.collaboration',
      'career.target_role',
      'project.askoosu.fact',
      'project.instagram_clone.fact',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['recruiter', 'profile', 'career'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.recruiter.first_30_days.default',
    intentId: 'recruiter.first_30_days',
    entityId: 'recruiter',
    language: 'en',
    quickLabel: 'First 30 days',
    displayQuestion: 'How could you contribute in your first 30 days?',
    patterns: [
      'First 30 days',
      'How would you contribute in your first month?',
      'onboarding plan',
      'first 30 days contribution',
      'what would you do first',
    ],
    shortAnswer:
      'In the first 30 days, Oosu could learn the product and domain quickly, then ship small improvements right away.',
    defaultAnswer: [
      'In the first 30 days, the best contribution would not be trying to change everything at once, but understanding the product context and user flow quickly, then finding areas that can be improved immediately.',
      '',
      'Oosu is strong at learning new tools and structures fast, and turning that understanding into small execution such as UX fixes, documentation, FAQ/help structure, or a small feature.',
    ].join('\n'),
    detailedAnswer: [
      'Oosu’s contribution in the first 30 days can be divided into three stages.',
      '',
      '0-10 days: absorb context by using the product, understanding the user journey, and learning the team’s important problems.',
      '',
      '10-20 days: ship small improvements such as microcopy, layout, information hierarchy, frontend components, simple API integration, or documentation.',
      '',
      '20-30 days: propose extension points around AI, search, recommendation, or operational efficiency.',
    ].join('\n'),
    renderSpec: {
      layout: 'timeline',
      density: 'standard',
      leadVisual: 'CareerTimeline',
      components: ['CareerTimeline', 'SourceBadgeList'],
    },
    visualBlocks: [
      {
        type: 'timeline',
        title: 'First 30 days',
        dataKey: 'recruiter.first_30_days',
        items: [
          {
            title: '0-10 days',
            description: 'Absorb product, domain, and user-flow context.',
          },
          {
            title: '10-20 days',
            description:
              'Ship small UX, frontend, API, or documentation improvements.',
          },
          {
            title: '20-30 days',
            description: 'Propose AI/search/operations extension points.',
          },
        ],
      },
      { type: 'sourceBadges' },
    ],
    sourceChunkIds: [
      'profile.strengths',
      'profile.collaboration',
      'career.target_role',
      'project.askoosu.fact',
      'project.instagram_clone.fact',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['recruiter', 'profile', 'career'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.collaboration.project_yes.default',
    intentId: 'collaboration.project_yes',
    entityId: 'collaboration',
    language: 'ko',
    quickLabel: 'Say yes project',
    displayQuestion: '어떤 프로젝트라면 바로 함께하고 싶나요?',
    patterns: [
      '어떤 프로젝트에 관심 있어요?',
      '바로 하고 싶은 프로젝트',
      'what projects would make you say yes',
      '어떤 팀과 잘 맞나요?',
    ],
    shortAnswer:
      'AI가 실제 사용자 경험 안에 들어가고, 문제 정의와 구현이 함께 필요한 프로젝트라면 바로 관심이 갑니다.',
    defaultAnswer: [
      '바로 함께하고 싶어지는 프로젝트는 “AI가 실제로 사용자 경험을 바꾸는 프로젝트”입니다.',
      '',
      '단순히 모델을 붙여보는 데서 끝나는 게 아니라, 사용자가 더 빨리 찾고, 덜 헤매고, 더 나은 결정을 하게 만드는 흐름이 있는 제품에 특히 끌립니다. 그래서 RAG/search, AI application development, 풀스택 웹서비스, 사용자 질문이 많은 제품, 운영 효율을 높이는 도구형 서비스에 관심이 큽니다.',
    ].join('\n'),
    detailedAnswer: [
      '바로 yes 하고 싶은 프로젝트에는 세 가지 공통점이 있습니다.',
      '',
      '첫째, AI가 실제 서비스 경험 안에 들어가 있어야 합니다. 둘째, 문제 정의와 구현이 동시에 중요해야 합니다. 셋째, 산업/제조 데이터, 고객 경험, 검색/지식관리, 내부 도구처럼 현실 문제와 연결되어 있으면 더 좋습니다.',
    ].join('\n'),
    renderSpec: {
      layout: 'contact_card',
      density: 'standard',
      leadVisual: 'ContactCard',
      components: ['ContactCard', 'SkillChipGroup', 'CtaButtons'],
    },
    visualBlocks: [
      {
        type: 'contactCard',
        title: 'Collaboration Fit',
        dataKey: 'collaboration.project_yes',
        items: contactActionsKo,
      },
      {
        type: 'skillChips',
        title: 'Project types',
        dataKey: 'collaboration.project_types',
        items: [
          {
            group: 'Say yes areas',
            skills: [
              'RAG/Search',
              'AI Application',
              'Fullstack Web',
              'Industrial AI',
              'Internal tools',
            ],
            evidence: ['AskOosu', 'Instagram Clone', 'Business/UX background'],
          },
        ],
      },
      { type: 'ctaButtons', items: contactActionsKo },
    ],
    sourceChunkIds: [
      'career.target_role',
      'profile.current_focus',
      'profile.contact',
      'project.askoosu.fact',
      'profile.business_to_dev',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['collaboration', 'career', 'askoosu'],
    confidence: 0.96,
  }),
  createFaqAnswer({
    id: 'faq.collaboration.project_yes.default',
    intentId: 'collaboration.project_yes',
    entityId: 'collaboration',
    language: 'en',
    quickLabel: 'Say yes project',
    displayQuestion: 'What kind of project would make you say yes immediately?',
    patterns: [
      'What kind of project interests you?',
      'Projects you would say yes to',
      'what projects would make you say yes',
      'what teams fit you well',
    ],
    shortAnswer:
      'Projects where AI becomes part of the real user experience, and where problem definition and implementation both matter, are the most exciting.',
    defaultAnswer: [
      'The kind of project that would make Oosu say yes immediately is one where AI genuinely improves the user experience.',
      '',
      'Not just attaching a model for the sake of it, but creating a flow where users can find faster, get less lost, or make better decisions. RAG/search, AI application development, fullstack web services, knowledge-heavy products, and operational efficiency tools are especially interesting.',
    ].join('\n'),
    detailedAnswer: [
      'There are a few common traits in the projects Oosu would say yes to immediately.',
      '',
      'First, AI should live inside the real service experience. Second, problem definition and implementation should both matter. Third, the work should connect to real-world problems such as industrial data, customer experience, knowledge management, or internal productivity.',
    ].join('\n'),
    renderSpec: {
      layout: 'contact_card',
      density: 'standard',
      leadVisual: 'ContactCard',
      components: ['ContactCard', 'SkillChipGroup', 'CtaButtons'],
    },
    visualBlocks: [
      {
        type: 'contactCard',
        title: 'Collaboration Fit',
        dataKey: 'collaboration.project_yes',
        items: contactActionsEn,
      },
      {
        type: 'skillChips',
        title: 'Project types',
        dataKey: 'collaboration.project_types',
        items: [
          {
            group: 'Say yes areas',
            skills: [
              'RAG/Search',
              'AI Application',
              'Fullstack Web',
              'Industrial AI',
              'Internal tools',
            ],
            evidence: ['AskOosu', 'Instagram Clone', 'Business/UX background'],
          },
        ],
      },
      { type: 'ctaButtons', items: contactActionsEn },
    ],
    sourceChunkIds: [
      'career.target_role',
      'profile.current_focus',
      'profile.contact',
      'project.askoosu.fact',
      'profile.business_to_dev',
    ],
    hasTodo: false,
    freshness: 'stable',
    guardrails: sharedGuardrails,
    matchedEntityIds: ['collaboration', 'career', 'askoosu'],
    confidence: 0.96,
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

export function buildAnswerParts(
  faq: FaqAnswer,
  answerVariant: 'short' | 'default' | 'detailed' = 'default'
): FaqAnswerPart[] {
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
    {
      type: 'markdown' as const,
      contentKey: toContentKey(answerVariant, faq),
    },
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

function toContentKey(
  answerVariant: 'short' | 'default' | 'detailed',
  faq: FaqAnswer
) {
  if (answerVariant === 'short') return 'shortAnswer' as const;
  if (answerVariant === 'detailed' && faq.detailedAnswer) {
    return 'detailedAnswer' as const;
  }

  return 'defaultAnswer' as const;
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
