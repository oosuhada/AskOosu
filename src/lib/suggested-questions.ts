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
    bestProjects: 'AskOosu 프로젝트를 설명해줘',
    developerType: '우수는 어떤 개발자예요?',
    nowBuilding: 'Instagram Clone에서 뭘 배웠나요?',
    techStack: 'Sticks & Stones 프로젝트가 왜 중요한가요?',
    aiUsage: '비즈니스 경험이 개발에 어떻게 연결되나요?',
    fullstackAiGrowth: '프론트엔드에서 풀스택·AI로 어떻게 확장했나요?',
    conversationalPortfolio: '포트폴리오를 왜 대화형으로 만들었어요?',
    contactCollab: '협업하거나 연락하려면 어떻게 해요?',
  },
  en: {
    bestProjects: 'Explain the AskOosu project',
    developerType: 'What kind of developer is Oosu?',
    nowBuilding: 'What did you learn from Instagram Clone?',
    techStack: 'Why does the Sticks & Stones project matter?',
    aiUsage: 'How does business experience connect to development?',
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
