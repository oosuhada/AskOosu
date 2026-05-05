import {
  findSuggestedQuestionId,
  getSuggestedQuestionMeta,
  type SuggestedQuestionId,
} from '@/lib/suggested-questions';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { AnswerRouteDecision } from '@/lib/chat/types';
import { normalizeQuestionForMatch } from '@/lib/chat/text';
import { FAQ_ANSWERS, findFaqAnswerById, type FaqAnswer } from './answers';

export type FaqMatch = {
  answer: FaqAnswer;
  score: number;
  matchedFaqId?: string;
  intentScore?: number;
  intentSecondScore?: number;
  intentMargin?: number;
  routeDecision?: AnswerRouteDecision;
};

const MIN_TOKEN_REWRITE_SCORE = 0.76;
const MIN_TOKEN_DIRECT_SCORE = 0.9;
const MIN_TOKEN_MARGIN = 0.12;

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
        matchedFaqId: exactIntentMatch.id,
        intentScore: 1,
        intentSecondScore: 0,
        intentMargin: 1,
        routeDecision: {
          mode: 'faq_direct',
          faqId: exactIntentMatch.id,
          confidence: 1,
          reason: 'legacy_exact_match',
        },
      };
    }
  }

  const matches = FAQ_ANSWERS.filter((answer) => answer.language === language)
    .map((answer) => {
      const candidatePatterns = [
        answer.id,
        ...(answer.legacyIds ?? []),
        answer.intentId,
        answer.entityId,
        answer.displayQuestion,
        ...(answer.alternativeDisplayQuestions ?? []),
        ...answer.patterns,
        answer.quickLabel,
      ];

      const score = Math.max(
        ...candidatePatterns.map((pattern) =>
          scorePatternMatch(
            normalizedQuestion,
            normalizeQuestionForMatch(pattern)
          )
        )
      );

      return { answer, score };
    })
    .sort((left, right) => right.score - left.score);

  const [topMatch, secondMatch] = matches;
  if (!topMatch || topMatch.score < MIN_TOKEN_REWRITE_SCORE) return null;

  const topScore = roundScore(topMatch.score);
  const secondScore = roundScore(secondMatch?.score ?? 0);
  const margin = roundScore(topScore - secondScore);
  const direct =
    topScore >= MIN_TOKEN_DIRECT_SCORE && margin >= MIN_TOKEN_MARGIN;

  // Token overlap is intentionally kept as a fallback only. It cannot reliably
  // understand Korean particles, typos, aliases, or paraphrases, so callers
  // should prefer the async semantic router when embeddings are available.
  return {
    answer: topMatch.answer,
    score: topScore,
    matchedFaqId: topMatch.answer.id,
    intentScore: topScore,
    intentSecondScore: secondScore,
    intentMargin: margin,
    routeDecision: direct
      ? {
          mode: 'faq_direct',
          faqId: topMatch.answer.id,
          confidence: topScore,
          reason: 'legacy_exact_match',
        }
      : {
          mode: 'faq_rewrite',
          faqId: topMatch.answer.id,
          confidence: topScore,
          reason: 'legacy_medium_match',
        },
  };
}

function findByIntentId(
  intentId: SuggestedQuestionId | string,
  language: ChatLanguage
) {
  const suggestedQuestion = getSuggestedQuestionMeta(intentId);
  const faqIdMatch = suggestedQuestion?.faqId
    ? findFaqAnswerById(suggestedQuestion.faqId, language)
    : null;

  if (faqIdMatch) return faqIdMatch;

  const faqIntentId = intentId;

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

export function scorePatternMatch(question: string, pattern: string) {
  question = normalizeForTokenFallback(question);
  pattern = normalizeForTokenFallback(pattern);

  if (!question || !pattern) return 0;
  if (question === pattern) return 1;

  const questionTokens = toTokenSet(question);
  const patternTokens = toTokenSet(pattern);
  if (questionTokens.size === 0 || patternTokens.size === 0) return 0;
  if (question.includes(pattern) || pattern.includes(question)) {
    return Math.min(questionTokens.size, patternTokens.size) <= 1 ? 0.68 : 0.94;
  }

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
      .map(stripKoreanParticle)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
  );
}

function normalizeForTokenFallback(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/뭐가\s*달라요?/g, '차이')
    .replace(/뭐가\s*다른가요?/g, '차이')
    .replace(/무엇이\s*다른가요?/g, '차이')
    .replace(/어떻게\s*달라요?/g, '차이')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function stripKoreanParticle(token: string) {
  if (!/[\p{Script=Hangul}]/u.test(token) || token.length <= 2) return token;

  const particles = [
    '으로는',
    '으로도',
    '에서는',
    '에게는',
    '한테는',
    '이랑',
    '이나',
    '랑',
    '나',
    '은',
    '는',
    '이',
    '가',
    '을',
    '를',
    '에',
    '의',
    '도',
    '만',
    '와',
    '과',
    '으로',
    '로',
  ];

  for (const particle of particles) {
    if (token.endsWith(particle) && token.length > particle.length + 1) {
      token = token.slice(0, -particle.length);
      break;
    }
  }

  return stripKoreanEnding(stripKoreanHonorific(token));
}

function stripKoreanHonorific(token: string) {
  if (token.endsWith('님') && token.length > 2) {
    return token.slice(0, -1);
  }

  return token;
}

function stripKoreanEnding(token: string) {
  const endings = ['인가요', '인가', '이에요', '예요', '에요', '입니다'];

  for (const ending of endings) {
    if (token.endsWith(ending) && token.length > ending.length + 1) {
      return token.slice(0, -ending.length);
    }
  }

  return token;
}

function roundScore(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(4)) : 0;
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
