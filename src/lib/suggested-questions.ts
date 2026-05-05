import type { DisplayLanguage } from '@/lib/preferences';

export const suggestedQuestionIds = [
  'bestProjects',
  'techStack',
  'contactCollab',
  'aiUsage',
  'fullstackAiGrowth',
  'developerType',
  'nowBuilding',
  'conversationalPortfolio',
] as const;

export type SuggestedQuestionId = (typeof suggestedQuestionIds)[number];

export type SuggestedQuestion = {
  id: SuggestedQuestionId;
  text: string;
  quickLabel: string;
  displayQuestion: string;
  faqId: string;
  intentId: string;
};

type SuggestedQuestionCopy = {
  quickLabel: string;
  displayQuestion: string;
  faqId: string;
  intentId: string;
  legacyTexts: string[];
};

const suggestedQuestionCopies: Record<
  DisplayLanguage,
  Record<SuggestedQuestionId, SuggestedQuestionCopy>
> = {
  ko: {
    bestProjects: {
      quickLabel: '대표 프로젝트',
      displayQuestion:
        '우수님의 대표 프로젝트 3개를 한눈에 볼 수 있게 소개해줄래요?',
      faqId: 'faq.project.top_three.default',
      intentId: 'project.top_three',
      legacyTexts: ['AskOosu 프로젝트를 설명해줘'],
    },
    techStack: {
      quickLabel: '기술 스택',
      displayQuestion:
        '우수님은 어떤 기술 스택을 다루고, 각 기술은 어떤 프로젝트에서 써봤나요?',
      faqId: 'faq.skills.tech_stack.default',
      intentId: 'skills.tech_stack',
      legacyTexts: ['Sticks & Stones 프로젝트가 왜 중요한가요?'],
    },
    contactCollab: {
      quickLabel: '연락/협업',
      displayQuestion:
        '우수님에게 어떻게 연락할 수 있고, 어떤 협업을 열어두고 있나요?',
      faqId: 'faq.contact.collaboration.default',
      intentId: 'contact.collaboration',
      legacyTexts: ['협업하거나 연락하려면 어떻게 해요?'],
    },
    aiUsage: {
      quickLabel: 'AI 활용',
      displayQuestion:
        '우수님은 Claude Code, Codex, Gemini 같은 AI 도구를 실제 개발에 어떻게 활용하나요?',
      faqId: 'faq.ai_usage.workflow.default',
      intentId: 'ai_usage.workflow',
      legacyTexts: ['비즈니스 경험이 개발에 어떻게 연결되나요?'],
    },
    fullstackAiGrowth: {
      quickLabel: 'RAG 구조',
      displayQuestion:
        'AskOosu 안에서 Notion, RAG, Groq, PostgreSQL은 어떻게 연결되나요?',
      faqId: 'faq.project.askoosu.rag.default',
      intentId: 'project.askoosu.rag',
      legacyTexts: ['프론트엔드에서 풀스택·AI로 어떻게 확장했나요?'],
    },
    developerType: {
      quickLabel: '우수 소개',
      displayQuestion: '우수님은 어떤 사람이고, 어떤 개발자로 성장하고 있나요?',
      faqId: 'faq.profile.intro.default',
      intentId: 'profile.intro',
      legacyTexts: ['우수는 어떤 개발자예요?'],
    },
    nowBuilding: {
      quickLabel: 'AskOosu',
      displayQuestion:
        'AskOosu는 어떤 문제의식에서 시작했고, 왜 대화형 포트폴리오로 만들었나요?',
      faqId: 'faq.project.askoosu.overview.default',
      intentId: 'project.askoosu.overview',
      legacyTexts: ['Instagram Clone에서 뭘 배웠나요?'],
    },
    conversationalPortfolio: {
      quickLabel: '비즈니스 → 개발',
      displayQuestion:
        '비즈니스와 고객 경험은 우수님의 개발 방식에 어떻게 연결되나요?',
      faqId: 'faq.profile.business_to_dev.default',
      intentId: 'profile.business_to_dev',
      legacyTexts: ['포트폴리오를 왜 대화형으로 만들었어요?'],
    },
  },
  en: {
    bestProjects: {
      quickLabel: 'Top projects',
      displayQuestion: "Can you show Oosu's top three projects at a glance?",
      faqId: 'faq.project.top_three.default',
      intentId: 'project.top_three',
      legacyTexts: ['Explain the AskOosu project'],
    },
    techStack: {
      quickLabel: 'Tech stack',
      displayQuestion:
        'What technologies does Oosu use, and where has he applied them?',
      faqId: 'faq.skills.tech_stack.default',
      intentId: 'skills.tech_stack',
      legacyTexts: ['Why does the Sticks & Stones project matter?'],
    },
    contactCollab: {
      quickLabel: 'Contact',
      displayQuestion:
        'How can I reach Oosu, and what kind of collaboration is he open to?',
      faqId: 'faq.contact.collaboration.default',
      intentId: 'contact.collaboration',
      legacyTexts: ['How can I get in touch or collaborate?'],
    },
    aiUsage: {
      quickLabel: 'AI workflow',
      displayQuestion:
        'How does Oosu actually use tools like Claude Code, Codex, and Gemini in development?',
      faqId: 'faq.ai_usage.workflow.default',
      intentId: 'ai_usage.workflow',
      legacyTexts: ['How does business experience connect to development?'],
    },
    fullstackAiGrowth: {
      quickLabel: 'RAG system',
      displayQuestion:
        'How do Notion, RAG, Groq, and PostgreSQL work together inside AskOosu?',
      faqId: 'faq.project.askoosu.rag.default',
      intentId: 'project.askoosu.rag',
      legacyTexts: ['How did you expand from frontend into fullstack and AI?'],
    },
    developerType: {
      quickLabel: 'About Oosu',
      displayQuestion:
        'Who is Oosu, and what kind of developer is he becoming?',
      faqId: 'faq.profile.intro.default',
      intentId: 'profile.intro',
      legacyTexts: ['What kind of developer is Oosu?'],
    },
    nowBuilding: {
      quickLabel: 'AskOosu',
      displayQuestion:
        'What problem led to AskOosu, and why did Oosu build it as a conversational portfolio?',
      faqId: 'faq.project.askoosu.overview.default',
      intentId: 'project.askoosu.overview',
      legacyTexts: ['What did you learn from Instagram Clone?'],
    },
    conversationalPortfolio: {
      quickLabel: 'Business to dev',
      displayQuestion:
        "How does Oosu's business and customer experience background shape the way he builds products?",
      faqId: 'faq.profile.business_to_dev.default',
      intentId: 'profile.business_to_dev',
      legacyTexts: ['Why build this portfolio as a conversation?'],
    },
  },
};

export function getSuggestedQuestions(
  language: DisplayLanguage
): SuggestedQuestion[] {
  return suggestedQuestionIds.map((id) => {
    const copy = suggestedQuestionCopies[language][id];

    return {
      id,
      text: copy.quickLabel,
      quickLabel: copy.quickLabel,
      displayQuestion: copy.displayQuestion,
      faqId: copy.faqId,
      intentId: copy.intentId,
    };
  });
}

export function getSuggestedQuestionText(
  language: DisplayLanguage,
  id: SuggestedQuestionId
) {
  return suggestedQuestionCopies[language][id].quickLabel;
}

export function getSuggestedQuestionMeta(
  id: string | null | undefined,
  language?: DisplayLanguage
) {
  if (!id) return null;
  const normalizedId = id.trim();
  if (!normalizedId) return null;

  if (language) {
    const copy =
      suggestedQuestionCopies[language][normalizedId as SuggestedQuestionId];
    if (copy) return copy;
  }

  for (const displayLanguage of ['ko', 'en'] as const) {
    const copy =
      suggestedQuestionCopies[displayLanguage][
        normalizedId as SuggestedQuestionId
      ];
    if (copy) return copy;
  }

  return null;
}

export function findSuggestedQuestionId(query: string) {
  const normalizedQuery = normalizeQuestion(query);

  return suggestedQuestionIds.find((id) =>
    (['ko', 'en'] as const).some((language) => {
      const copy = suggestedQuestionCopies[language][id];
      const candidates = [
        copy.quickLabel,
        copy.displayQuestion,
        copy.faqId,
        copy.intentId,
        ...copy.legacyTexts,
      ];

      return candidates.some(
        (candidate) => normalizeQuestion(candidate) === normalizedQuery
      );
    })
  );
}

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, ' ').toLowerCase();
}
