import { questionSurfacesEn } from '@/data/question-surfaces.en';
import { questionSurfacesKo } from '@/data/question-surfaces.ko';
import {
  sortQuestionTriggers,
  type AnswerVariant,
  type QuestionSurface,
  type QuestionTrigger,
} from '@/data/question-surfaces.shared';
import type { DisplayLanguage } from '@/lib/preferences';

export const suggestedQuestionIds = [
  ...new Set(
    [...questionSurfacesKo, ...questionSurfacesEn].map((question) => question.id)
  ),
];

export type SuggestedQuestionId = string;

export type SuggestedQuestion = QuestionTrigger & {
  text: string;
  intentId: string;
  answerVariant: AnswerVariant;
  renderSpec?: string;
};

const legacySuggestedQuestionIds: Record<string, string> = {
  bestProjects: 'home.projects.top3',
  developerType: 'home.profile.intro',
  nowBuilding: 'home.projects.top3',
  techStack: 'home.skills.level',
  aiUsage: 'home.ai.workflow',
  fullstackAiGrowth: 'home.profile.intro',
  conversationalPortfolio: 'home.ai.workflow',
  contactCollab: 'home.contact',
};

const questionSurfaces: Record<DisplayLanguage, QuestionTrigger[]> = {
  ko: questionSurfacesKo,
  en: questionSurfacesEn,
};

const faqIntentIds: Record<string, string> = {
  'faq.profile.intro.default': 'profile.intro',
  'faq.projects.top3.summary': 'project.representative',
  'faq.tech_stack.level.default': 'skills.tech_stack',
  'faq.ai_usage.default': 'ai_usage.workflow',
  'faq.contact.default': 'contact.collaboration',
  'faq.project.askoosu.overview.default': 'project.askoosu.overview',
  'faq.project.askoosu.rag.default': 'project.askoosu.rag',
  'faq.project.askoosu.visual_ui.default': 'project.askoosu.visual_ui',
  'faq.project.askoosu.deployment.default': 'project.askoosu.deployment',
  'faq.project.portfoliooh_vs_askoosu.default':
    'project.portfoliooh_vs_askoosu',
  'faq.project.instagram.learned.default': 'project.instagram.learned',
  'faq.project.sticks.importance.default': 'project.sticks.importance',
  'faq.tech.rag_vs_faq_cache.default': 'tech.rag_vs_faq_cache',
  'faq.tech.springboot.postgresql.default': 'tech.springboot_postgresql',
  'faq.profile.public_life_notes.default': 'profile.public_life_notes',
  'faq.recruiter.first_30_days.default': 'recruiter.first_30_days',
  'faq.collaboration.project_yes.default': 'collaboration.project_yes',
};

export function getSuggestedQuestions(
  language: DisplayLanguage,
  surface: QuestionSurface = 'home'
): SuggestedQuestion[] {
  return getQuestionTriggers(language, surface)
    .filter((question) =>
      surface === 'home' ? question.visibleByDefault : true
    )
    .map(toSuggestedQuestion);
}

export function getQuestionTriggers(
  language: DisplayLanguage,
  surface: QuestionSurface
): QuestionTrigger[] {
  return sortQuestionTriggers(
    questionSurfaces[language].filter(
      (question) => question.surface === surface
    )
  );
}

export function getSuggestedQuestionText(
  language: DisplayLanguage,
  id: SuggestedQuestionId
) {
  return (
    getSuggestedQuestionMeta(id, language)?.quickLabel ??
    questionSurfaces[language][0]?.quickLabel ??
    ''
  );
}

export function getSuggestedQuestionMeta(
  id: string | null | undefined,
  language?: DisplayLanguage
) {
  if (!id) return null;
  const normalizedId = legacySuggestedQuestionIds[id.trim()] ?? id.trim();
  if (!normalizedId) return null;

  const languages = language ? [language] : (['ko', 'en'] as const);

  for (const displayLanguage of languages) {
    const question = questionSurfaces[displayLanguage].find(
      (candidate) =>
        candidate.id === normalizedId ||
        candidate.faqId === normalizedId ||
        candidate.displayQuestion === normalizedId ||
        candidate.quickLabel === normalizedId
    );

    if (question) return question;
  }

  return null;
}

export function getSuggestedQuestionRoutingMeta(
  id: string | null | undefined,
  language?: DisplayLanguage
) {
  const question = getSuggestedQuestionMeta(id, language);
  if (!question) return null;

  return {
    ...question,
    intentId: faqIntentIds[question.faqId] ?? question.faqId,
    text: question.quickLabel,
  };
}

export function getRelatedSuggestedQuestionIds(id: string | null | undefined) {
  const question = getSuggestedQuestionMeta(id);
  if (!question) return id ? [id] : [];

  const relatedIds = new Set<string>([question.id]);
  for (const surfaceQuestion of [...questionSurfacesKo, ...questionSurfacesEn]) {
    if (surfaceQuestion.faqId === question.faqId) {
      relatedIds.add(surfaceQuestion.id);
    }
  }

  return [...relatedIds];
}

export function findSuggestedQuestionId(query: string) {
  const normalizedQuery = normalizeQuestion(query);

  for (const language of ['ko', 'en'] as const) {
    const match = questionSurfaces[language].find((question) => {
      const candidates = [
        question.id,
        question.quickLabel,
        question.displayQuestion,
        question.faqId,
      ];

      return candidates.some(
        (candidate) => normalizeQuestion(candidate) === normalizedQuery
      );
    });

    if (match) return match.id;
  }

  return undefined;
}

function toSuggestedQuestion(question: QuestionTrigger): SuggestedQuestion {
  return {
    ...question,
    text: question.quickLabel,
    intentId: faqIntentIds[question.faqId] ?? question.faqId,
  };
}

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, ' ').toLowerCase();
}
