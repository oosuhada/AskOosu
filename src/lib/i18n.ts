import type { DisplayLanguage } from '@/lib/preferences';

export const localizedQuestions = {
  ko: {
    Portfolio: '대표 프로젝트 보여줘',
    Me: 'Oosu Jang은 어떤 개발자인가요?',
    Skills: '기술 스택과 강점을 알려줘',
    Process: '이 포트폴리오는 어떻게 업데이트되나요?',
    Contact: '연락처를 알려줘',
  },
  en: {
    Portfolio: 'Show featured projects',
    Me: 'What kind of developer is Oosu Jang?',
    Skills: "Show Oosu's skills and strengths",
    Process: 'How is this portfolio kept up to date?',
    Contact: 'How can I contact Oosu?',
  },
} as const;

export const uiText = {
  ko: {
    askAnything: 'Oosu에게 무엇이든 물어보세요...',
    thinking: '생각 중...',
    hideQuickQuestions: '빠른 질문 숨기기',
    showQuickQuestions: '빠른 질문 보기',
    moreQuestions: '질문 더보기',
    chatLoading: '채팅을 불러오는 중...',
    close: '닫기',
    startChatting: '대화 시작하기',
    feedback: '좋게 보셨다면 공유해 주세요. 피드백도 언제든 환영합니다.',
    contactMe: '연락하기',
    welcomeTitle: 'AskOosu 소개',
    welcomeDescription: 'Oosu Jang의 AI-connected 포트폴리오',
    whatIsAskOosu: 'AskOosu는 무엇인가요?',
    whatIsAskOosuBody:
      'AskOosu는 Oosu Jang의 2026 포트폴리오를 대화형 AI 인터페이스로 재구성한 프로젝트입니다. 방문자는 정적인 섹션을 훑는 대신 프로젝트, 기술 스택, 연락처, 업데이트 방식에 대해 자연어로 질문할 수 있습니다.',
    whyThisFormat: '왜 대화형 포트폴리오인가요?',
    whyThisFormatBody:
      '2025년 Portfoli-Oh!는 프론트엔드와 인터랙션 기반을 보여준 포트폴리오였습니다. AskOosu는 그 다음 단계로, 프론트엔드 경험과 백엔드 로직, AI 응답, 향후 지식 소스를 하나의 시스템으로 연결합니다.',
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
    presentationDescription:
      'AskOosu는 Oosu Jang의 2026 포트폴리오 인터페이스입니다. 프론트엔드 경험, 백엔드 로직, LLM 응답이 하나의 제품처럼 연결되는 풀스택 경험을 만들고 있습니다.',
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
    thinking: 'Thinking...',
    hideQuickQuestions: 'Hide quick questions',
    showQuickQuestions: 'Show quick questions',
    moreQuestions: 'More questions',
    chatLoading: 'Loading chat...',
    close: 'Close',
    startChatting: 'Start chatting',
    feedback: 'If this was useful, sharing and feedback are always welcome.',
    contactMe: 'Contact me',
    welcomeTitle: 'Welcome to AskOosu',
    welcomeDescription: "Oosu Jang's AI-connected portfolio",
    whatIsAskOosu: 'What is AskOosu?',
    whatIsAskOosuBody:
      'AskOosu rebuilds Oosu Jang’s 2026 portfolio as a conversational AI interface. Visitors can ask natural-language questions about projects, skills, contact links, and how the portfolio will stay up to date.',
    whyThisFormat: 'Why this format?',
    whyThisFormatBody:
      'Portfoli-Oh! 2025 showed Oosu’s frontend and interaction foundation. AskOosu moves that into a system where frontend experience, backend logic, AI responses, and future knowledge sources work together.',
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
    presentationDescription:
      'AskOosu is my 2026 portfolio interface: a conversational portfolio connected to an AI backend. I build fullstack experiences where frontend interaction, backend logic, and LLM responses work together as one product.',
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
