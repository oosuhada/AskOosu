import {
  findSuggestedQuestionId,
  getSuggestedQuestionMeta,
  type SuggestedQuestionId,
} from '@/lib/suggested-questions';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import { normalizeQuestionForMatch } from '@/lib/chat/text';
import { FAQ_ANSWERS, type FaqAnswer } from './answers';

export type FaqMatch = {
  answer: FaqAnswer;
  score: number;
};

const MIN_FUZZY_SCORE = 0.72;

export function matchFaqAnswer({
  question,
  language,
  starterQuestionId,
}: {
  question: string;
  language: ChatLanguage;
  starterQuestionId?: string | null;
}): FaqMatch | null {
  const normalizedQuestion = normalizeQuestionForMatch(question);
  if (!normalizedQuestion) return null;

  const suggestedQuestionId =
    normalizeSuggestedQuestionId(starterQuestionId) ??
    findSuggestedQuestionId(question);

  if (suggestedQuestionId) {
    const exactIntentMatch = findByIntentId(suggestedQuestionId, language);
    if (exactIntentMatch) {
      return {
        answer: exactIntentMatch,
        score: 1,
      };
    }
  }

  let bestMatch: FaqMatch | null = null;

  for (const answer of FAQ_ANSWERS) {
    if (answer.language !== language) continue;

    const score = Math.max(
      ...answer.patterns.map((pattern) =>
        scorePatternMatch(
          normalizedQuestion,
          normalizeQuestionForMatch(pattern)
        )
      )
    );

    if (score >= MIN_FUZZY_SCORE && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer, score };
    }
  }

  return bestMatch;
}

function findByIntentId(
  intentId: SuggestedQuestionId | string,
  language: ChatLanguage
) {
  const faqIntentId = getSuggestedQuestionMeta(intentId)?.intentId ?? intentId;

  return (
    FAQ_ANSWERS.find(
      (answer) =>
        answer.intentId === faqIntentId && answer.language === language
    ) ??
    FAQ_ANSWERS.find(
      (answer) =>
        answer.intentId === faqIntentId && answer.language !== language
    )
  );
}

function scorePatternMatch(question: string, pattern: string) {
  if (!question || !pattern) return 0;
  if (question === pattern) return 1;
  if (question.includes(pattern) || pattern.includes(question)) return 0.94;

  const questionTokens = toTokenSet(question);
  const patternTokens = toTokenSet(pattern);
  if (questionTokens.size === 0 || patternTokens.size === 0) return 0;

  const overlap = [...questionTokens].filter((token) =>
    patternTokens.has(token)
  ).length;
  const denominator = Math.max(questionTokens.size, patternTokens.size);

  return overlap / denominator;
}

function toTokenSet(value: string) {
  return new Set(
    value
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
  );
}

function normalizeSuggestedQuestionId(
  value: string | null | undefined
): SuggestedQuestionId | null {
  const id = value?.trim();
  if (!id) return null;

  const knownId = findSuggestedQuestionId(id);
  if (knownId) return knownId;

  const suggestedIds: SuggestedQuestionId[] = [
    'bestProjects',
    'developerType',
    'nowBuilding',
    'techStack',
    'aiUsage',
    'fullstackAiGrowth',
    'conversationalPortfolio',
    'contactCollab',
  ];

  return suggestedIds.includes(id as SuggestedQuestionId)
    ? (id as SuggestedQuestionId)
    : null;
}
