import type { DisplayLanguage } from '@/lib/preferences';
import { getSuggestedQuestionText } from '@/lib/suggested-questions';

export const localizedQuestions = {
  ko: {
    Portfolio: getSuggestedQuestionText('ko', 'bestProjects'),
    Me: getSuggestedQuestionText('ko', 'developerType'),
    Skills: getSuggestedQuestionText('ko', 'techStack'),
    Process: getSuggestedQuestionText('ko', 'conversationalPortfolio'),
    Contact: getSuggestedQuestionText('ko', 'contactCollab'),
  },
  en: {
    Portfolio: getSuggestedQuestionText('en', 'bestProjects'),
    Me: getSuggestedQuestionText('en', 'developerType'),
    Skills: getSuggestedQuestionText('en', 'techStack'),
    Process: getSuggestedQuestionText('en', 'conversationalPortfolio'),
    Contact: getSuggestedQuestionText('en', 'contactCollab'),
  },
} as const;

export const uiText = {
  ko: {
    askAnything: 'Oosu에게 무엇이든 물어보세요...',
    thinking: '질문을 나눠 근거를 확인하는 중...',
    chatLoadingMessages: [
      'Wiki에서 관련 근거를 찾는 중...',
      '질문을 나눠 근거를 확인하는 중...',
      '근거를 확인하고 있어요...',
    ],
    hideQuickQuestions: '빠른 질문 숨기기',
    showQuickQuestions: '빠른 질문 보기',
    moreQuestions: '질문 더보기',
    chatLoading: '채팅을 불러오는 중...',
    aiResponseUnavailable:
      '응답 연결 상태를 확인하고 있어요. 잠시 뒤 다시 시도해 주세요.',
    close: '닫기',
    startChatting: '대화 시작하기',
    feedback: '좋게 보셨다면 공유해 주세요. 피드백도 언제든 환영합니다.',
    contactMe: '연락하기',
    welcomeTitle: 'AskOosu 소개',
    welcomeDescription: 'Oosu Jang의 AI-connected 포트폴리오',
    whatIsAskOosu: 'AskOosu는 무엇인가요?',
    whatIsAskOosuBody:
      '우수에게 뭐든 물어보세요. 프로젝트가 궁금해도, 기술 스택이 궁금해도, 그냥 어떤 사람인지 궁금해도 — 스크롤 대신 대화로 알아가는 포트폴리오예요.',
    whyThisFormat: '왜 대화형 포트폴리오인가요?',
    whyThisFormatBody:
      '2025년 Portfoli-Oh!에서 우수는 인터랙션과 프론트엔드로 자신을 소개했어요. AskOosu는 그 다음 챕터 — 프론트엔드, 백엔드, AI를 하나로 연결한 시스템을 포트폴리오 자체로 증명합니다.',
    visitorProcessQuestion: localizedQuestions.ko.Process,
    internalWikiQuestion: 'Notion API 기반 지식 연결 구조를 설명해줘',
    englishIntroQuestion: 'Can you introduce Oosu in English?',
    portfolioDiffQuestion: '2025 포트폴리오와 2026 AskOosu의 차이를 보여줘',
    serviceDirectionQuestion: 'Oosu가 만드는 서비스의 방향성을 알려줘',
    conceptQuestion: 'AskOosu의 2026 포트폴리오 컨셉을 설명해줘',
    currentProjectsQuestion: '현재 등록된 프로젝트를 보여줘',
    legacyPortfolioQuestion: 'Portfoli-Oh! 2025 프로젝트 설명해줘',
    askOosuProjectQuestion: 'AskOosu 2026 프로젝트 설명해줘',
    titleExplanationQuestion:
      'AI-connected Fullstack Developer라는 타이틀을 풀어서 설명해줘',
    frontendAiQuestion: '프론트엔드와 AI를 어떻게 연결할 수 있어?',
    githubNotionQuestion:
      'GitHub 공부 기록을 Notion으로 자동 관리하려면 어떻게 설계하면 돼?',
    notionStructureQuestion:
      'Notion API를 포트폴리오 답변 지식으로 쓰는 구조를 알려줘',
    githubLinkQuestion: 'GitHub 링크 알려줘',
    socialLinkQuestion: 'LinkedIn과 Instagram 링크 알려줘',
    resumeQuestion: '이력서 링크는 어디에 연결될 예정이야?',
    contactQuery: localizedQuestions.ko.Contact,
    contactTitle: '연락처',
    menu: '메뉴',
    menuDescription: '대화, 설정, 링크를 한곳에서 관리합니다.',
    newChat: '새 채팅',
    chatHistory: '대화 목록',
    emptyChatHistory: '아직 저장된 대화가 없어요.',
    settings: '설정',
    languageSetting: '언어',
    themeSetting: '테마',
    korean: '한국어',
    english: 'English',
    lightMode: '라이트',
    darkMode: '다크',
    links: '링크',
    github: 'GitHub',
    resume: 'Resume',
    resumeComingSoon: '준비 중',
    help: '도움말',
    siteStackQuestion: '이 사이트 구현에 어떤 기술 스택 사용했는지',
    siteStackTitle: 'AskOosu 구현 스택',
    siteStackBody:
      '현재 화면은 Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK로 구성되어 있어요. API는 스트리밍 응답과 툴 호출을 사용하고, Groq API 전환 및 Notion/RAG 지식 연결을 고려한 구조로 정리 중입니다.',
    presentationDescription:
      'AskOosu는 우수의 2026 포트폴리오 인터페이스입니다. 우수는 프론트엔드 경험, 백엔드 로직, LLM 응답이 하나의 제품처럼 연결되는 풀스택 경험을 만들고 있습니다.',
    resumeTitle: 'Oosu Jang 이력서',
    resumeUpdated: 'Notion 이력서 링크는 추후 연결 예정',
    resumeKorean: '국문 이력서',
    resumeEnglish: '영문 이력서',
    skillsTitle: '기술 스택과 강점',
    skillCategories: {
      frontend: '프론트엔드 개발',
      backend: '백엔드 & 제품 개발',
      ai: 'AI-connected 인터페이스',
      design: '디자인 & 크리에이티브 도구',
      soft: '소프트 스킬',
    },
  },
  en: {
    askAnything: 'Ask Oosu anything...',
    thinking: 'Splitting the question and checking evidence...',
    chatLoadingMessages: [
      'Looking up relevant Wiki evidence...',
      'Splitting the question and checking evidence...',
      'Checking the sources...',
    ],
    hideQuickQuestions: 'Hide quick questions',
    showQuickQuestions: 'Show quick questions',
    moreQuestions: 'More questions',
    chatLoading: 'Loading chat...',
    aiResponseUnavailable:
      'The response connection is being checked. Please retry shortly.',
    close: 'Close',
    startChatting: 'Start chatting',
    feedback: 'If this was useful, sharing and feedback are always welcome.',
    contactMe: 'Contact me',
    welcomeTitle: 'Welcome to AskOosu',
    welcomeDescription: "Oosu Jang's AI-connected portfolio",
    whatIsAskOosu: 'What is AskOosu?',
    whatIsAskOosuBody:
      'Ask Oosu anything. Whether visitors are curious about projects, the tech stack, or the person behind the work, this portfolio lets them learn through conversation instead of scrolling.',
    whyThisFormat: 'Why this format?',
    whyThisFormatBody:
      'In Portfoli-Oh! 2025, Oosu introduced himself through frontend interaction. AskOosu is the next chapter: a portfolio that proves frontend, backend, and AI can work together as one system.',
    visitorProcessQuestion: localizedQuestions.en.Process,
    internalWikiQuestion:
      'Explain the future Notion API knowledge architecture',
    englishIntroQuestion: 'Can you introduce Oosu in English?',
    portfolioDiffQuestion:
      'Show the difference between Portfoli-Oh! 2025 and AskOosu 2026',
    serviceDirectionQuestion: 'What kind of services does Oosu want to build?',
    conceptQuestion: 'Explain the AskOosu 2026 portfolio concept',
    currentProjectsQuestion: 'Show the current project list',
    legacyPortfolioQuestion: 'Explain the Portfoli-Oh! 2025 project',
    askOosuProjectQuestion: 'Explain the AskOosu 2026 project',
    titleExplanationQuestion:
      'What does AI-connected Fullstack Developer mean?',
    frontendAiQuestion: 'How can frontend work connect with AI?',
    githubNotionQuestion:
      'How could GitHub learning logs be organized in Notion automatically?',
    notionStructureQuestion:
      'How could Notion API become portfolio answer knowledge?',
    githubLinkQuestion: 'Share the GitHub link',
    socialLinkQuestion: 'Share the LinkedIn and Instagram links',
    resumeQuestion: 'Where will resume links be connected?',
    contactQuery: localizedQuestions.en.Contact,
    contactTitle: 'Contacts',
    menu: 'Menu',
    menuDescription: 'Manage chats, settings, and links in one place.',
    newChat: 'New chat',
    chatHistory: 'Chat history',
    emptyChatHistory: 'No saved chats yet.',
    settings: 'Settings',
    languageSetting: 'Language',
    themeSetting: 'Theme',
    korean: '한국어',
    english: 'English',
    lightMode: 'Light',
    darkMode: 'Dark',
    links: 'Links',
    github: 'GitHub',
    resume: 'Resume',
    resumeComingSoon: 'Coming soon',
    help: 'Help',
    siteStackQuestion: 'What tech stack was used to build this site?',
    siteStackTitle: 'AskOosu Tech Stack',
    siteStackBody:
      'The current interface uses Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, and the Vercel AI SDK. The API uses streaming responses and tool calls, with a structure prepared for Groq API switching and future Notion/RAG knowledge retrieval.',
    presentationDescription:
      'AskOosu is Oosu’s 2026 portfolio interface: a conversational portfolio connected to an AI backend. Oosu builds fullstack experiences where frontend interaction, backend logic, and LLM responses work together as one product.',
    resumeTitle: "Oosu Jang's Resume",
    resumeUpdated: 'Notion resume links will be connected later',
    resumeKorean: 'Korean resume',
    resumeEnglish: 'English resume',
    skillsTitle: 'Skills & Expertise',
    skillCategories: {
      frontend: 'Frontend Development',
      backend: 'Backend & Product Engineering',
      ai: 'AI-connected Interfaces',
      design: 'Design & Creative Tools',
      soft: 'Soft Skills',
    },
  },
} as const;

export function getLocalizedQuestions(language: DisplayLanguage) {
  return localizedQuestions[language];
}

export function getUiText(language: DisplayLanguage) {
  return uiText[language];
}
