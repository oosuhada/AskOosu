import type { DisplayLanguage } from '@/lib/preferences';

export const suggestedQuestionIds = [
  'bestProjects',
  'developerType',
  'nowBuilding',
  'techStack',
  'aiUsage',
  'fullstackAiGrowth',
  'conversationalPortfolio',
  'contactCollab',
] as const;

export type SuggestedQuestionId = (typeof suggestedQuestionIds)[number];

export type SuggestedQuestion = {
  id: SuggestedQuestionId;
  text: string;
};

const suggestedQuestionLabels: Record<
  DisplayLanguage,
  Record<SuggestedQuestionId, string>
> = {
  ko: {
    bestProjects: '우수의 대표 프로젝트 보여줘',
    developerType: '우수는 어떤 개발자예요?',
    nowBuilding: '요즘 어떤 걸 만들고 있어요?',
    techStack: '기술 스택과 숙련도가 궁금해요',
    aiUsage: 'AI를 실제 개발에 어떻게 활용하나요?',
    fullstackAiGrowth: '프론트엔드에서 풀스택·AI로 어떻게 확장했나요?',
    conversationalPortfolio: '포트폴리오를 왜 대화형으로 만들었어요?',
    contactCollab: '협업하거나 연락하려면 어떻게 해요?',
  },
  en: {
    bestProjects: "Show me Oosu's best projects",
    developerType: 'What kind of developer is Oosu?',
    nowBuilding: 'What are you building these days?',
    techStack: "What's your tech stack and expertise?",
    aiUsage: 'How do you actually use AI in development?',
    fullstackAiGrowth:
      'How did you expand from frontend into fullstack and AI?',
    conversationalPortfolio: 'Why build this portfolio as a conversation?',
    contactCollab: 'How can I get in touch or collaborate?',
  },
};

export function getSuggestedQuestions(
  language: DisplayLanguage
): SuggestedQuestion[] {
  return suggestedQuestionIds.map((id) => ({
    id,
    text: suggestedQuestionLabels[language][id],
  }));
}

export function getSuggestedQuestionText(
  language: DisplayLanguage,
  id: SuggestedQuestionId
) {
  return suggestedQuestionLabels[language][id];
}

export function findSuggestedQuestionId(query: string) {
  const normalizedQuery = normalizeQuestion(query);

  return suggestedQuestionIds.find((id) =>
    (['ko', 'en'] as const).some(
      (language) =>
        normalizeQuestion(suggestedQuestionLabels[language][id]) ===
        normalizedQuery
    )
  );
}

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, ' ').toLowerCase();
}
