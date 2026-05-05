import {
  findSuggestedQuestionId,
  getSuggestedQuestionMeta,
} from '@/lib/suggested-questions';
import type { ChatLanguage } from '@/lib/i18n/detect-language';
import { normalizeQuestionForMatch, truncateText } from '@/lib/chat/text';
import {
  embedText,
  embedTexts,
  hasEmbeddingCredentials,
} from '@/lib/rag/embeddings';
import { FAQ_ANSWERS, findFaqAnswerById, type FaqAnswer } from './answers';
import { scorePatternMatch } from './match';

export type FaqIntentRouteMode = 'direct' | 'rewrite' | 'rag_required';

export type FaqIntentRouterKind =
  | 'quick_question'
  | 'semantic'
  | 'token_fallback';

export type FaqIntentRouteDecision = {
  mode: FaqIntentRouteMode;
  reason: string;
  router: FaqIntentRouterKind;
};

export type FaqIntentRouteResult = {
  answer: FaqAnswer | null;
  matchedFaqId?: string;
  intentScore: number;
  intentSecondScore: number;
  intentMargin: number;
  routeDecision: FaqIntentRouteDecision;
};

export type FaqEmbeddingProvider = {
  name: string;
  isAvailable: () => boolean;
  embedTexts: (values: string[]) => Promise<number[][]>;
  embedText: (value: string) => Promise<number[]>;
};

type FaqSemanticCandidate = {
  answer: FaqAnswer;
  parts: string[];
  text: string;
};

type FaqEmbeddingCache = {
  candidates: FaqSemanticCandidate[];
  embeddings: number[][];
};

type SemanticRouterConfig = {
  enabled: boolean;
  directMin: number;
  rewriteMin: number;
  marginMin: number;
};

const DEFAULT_FAQ_SEMANTIC_DIRECT_MIN = 0.88;
const DEFAULT_FAQ_SEMANTIC_REWRITE_MIN = 0.76;
const DEFAULT_FAQ_SEMANTIC_MARGIN_MIN = 0.12;
const FALLBACK_DIRECT_MIN = 0.9;
const SHORT_ANSWER_MATCH_LIMIT = 360;
const AMBIGUOUS_SHORT_HANGUL_LENGTH = 2;
const AMBIGUOUS_SHORT_LATIN_LENGTH = 4;

let embeddingCachePromise: Promise<FaqEmbeddingCache> | null = null;

const openAiEmbeddingProvider: FaqEmbeddingProvider = {
  name: 'openai',
  isAvailable: hasEmbeddingCredentials,
  embedTexts,
  embedText,
};

export async function routeFaqIntent({
  question,
  language,
  starterQuestionId,
  source,
  provider = openAiEmbeddingProvider,
}: {
  question: string;
  language: ChatLanguage;
  starterQuestionId?: string | null;
  source?: string | null;
  provider?: FaqEmbeddingProvider;
}): Promise<FaqIntentRouteResult> {
  const normalizedQuestion = normalizeQuestionForMatch(question);
  const config = getSemanticRouterConfig();

  if (!normalizedQuestion) {
    return emptyRouteResult('empty_question', 'token_fallback');
  }

  const quickQuestionMatch =
    source === 'quick_question'
      ? getTrustedQuickQuestionMatch({ starterQuestionId, language })
      : null;

  if (quickQuestionMatch) {
    return {
      answer: quickQuestionMatch,
      matchedFaqId: quickQuestionMatch.id,
      intentScore: 1,
      intentSecondScore: 0,
      intentMargin: 1,
      routeDecision: {
        mode: 'direct',
        reason: 'trusted_quick_question',
        router: 'quick_question',
      },
    };
  }

  if (isAmbiguousShortQuestion(normalizedQuestion)) {
    return emptyRouteResult('ambiguous_short_input', 'semantic');
  }

  if (!config.enabled || !provider.isAvailable()) {
    return routeWithTokenFallback({
      question,
      language,
      config,
      reason: config.enabled
        ? 'embeddings_unavailable'
        : 'semantic_router_disabled',
    });
  }

  try {
    const cache = await getEmbeddingCache(provider);
    const queryEmbedding = await provider.embedText(question);
    const rankedCandidates = rankByEmbedding({
      cache,
      queryEmbedding,
      language,
    });

    return decideRoute({
      rankedCandidates,
      config,
      router: 'semantic',
      reasonPrefix: 'semantic',
    });
  } catch (error) {
    console.warn(
      'FAQ semantic router unavailable; using token fallback:',
      error
    );
    return routeWithTokenFallback({
      question,
      language,
      config,
      reason: 'embedding_error',
    });
  }
}

export function buildFaqCandidateText(answer: FaqAnswer) {
  return createFaqCandidate(answer).text;
}

function getTrustedQuickQuestionMatch({
  starterQuestionId,
  language,
}: {
  starterQuestionId?: string | null;
  language: ChatLanguage;
}) {
  const suggestedQuestion = getSuggestedQuestionMeta(
    starterQuestionId,
    language
  );
  if (!suggestedQuestion?.faqId) return null;

  return findFaqAnswerById(suggestedQuestion.faqId, language);
}

function routeWithTokenFallback({
  question,
  language,
  config,
  reason,
}: {
  question: string;
  language: ChatLanguage;
  config: SemanticRouterConfig;
  reason: string;
}) {
  const rankedCandidates = rankByTokenFallback({ question, language });

  return decideRoute({
    rankedCandidates,
    config: {
      ...config,
      directMin: Math.max(config.directMin, FALLBACK_DIRECT_MIN),
    },
    router: 'token_fallback',
    reasonPrefix: reason,
  });
}

function decideRoute({
  rankedCandidates,
  config,
  router,
  reasonPrefix,
}: {
  rankedCandidates: Array<{ answer: FaqAnswer; score: number }>;
  config: SemanticRouterConfig;
  router: FaqIntentRouterKind;
  reasonPrefix: string;
}): FaqIntentRouteResult {
  const [topCandidate, secondCandidate] = rankedCandidates;
  const topScore = roundScore(topCandidate?.score ?? 0);
  const secondScore = roundScore(secondCandidate?.score ?? 0);
  const margin = roundScore(topScore - secondScore);

  if (!topCandidate) {
    return emptyRouteResult(`${reasonPrefix}_no_candidate`, router);
  }

  if (topScore >= config.directMin && margin >= config.marginMin) {
    return {
      answer: topCandidate.answer,
      matchedFaqId: topCandidate.answer.id,
      intentScore: topScore,
      intentSecondScore: secondScore,
      intentMargin: margin,
      routeDecision: {
        mode: 'direct',
        reason: `${reasonPrefix}_high_confidence`,
        router,
      },
    };
  }

  if (topScore >= config.rewriteMin) {
    return {
      answer: topCandidate.answer,
      matchedFaqId: topCandidate.answer.id,
      intentScore: topScore,
      intentSecondScore: secondScore,
      intentMargin: margin,
      routeDecision: {
        mode: 'rewrite',
        reason:
          margin < config.marginMin
            ? `${reasonPrefix}_ambiguous_margin`
            : `${reasonPrefix}_medium_confidence`,
        router,
      },
    };
  }

  return {
    answer: topCandidate.answer,
    matchedFaqId: topCandidate.answer.id,
    intentScore: topScore,
    intentSecondScore: secondScore,
    intentMargin: margin,
    routeDecision: {
      mode: 'rag_required',
      reason: `${reasonPrefix}_low_confidence`,
      router,
    },
  };
}

function rankByEmbedding({
  cache,
  queryEmbedding,
  language,
}: {
  cache: FaqEmbeddingCache;
  queryEmbedding: number[];
  language: ChatLanguage;
}) {
  return cache.candidates
    .map((candidate, index) => ({
      answer: candidate.answer,
      score:
        candidate.answer.language === language
          ? cosineSimilarity(queryEmbedding, cache.embeddings[index])
          : cosineSimilarity(queryEmbedding, cache.embeddings[index]) - 0.08,
    }))
    .filter((candidate) => candidate.answer.language === language)
    .sort((left, right) => right.score - left.score);
}

function rankByTokenFallback({
  question,
  language,
}: {
  question: string;
  language: ChatLanguage;
}) {
  const normalizedQuestion = normalizeQuestionForMatch(question);
  const suggestedQuestionId = findSuggestedQuestionId(question);
  const suggestedQuestion = getSuggestedQuestionMeta(
    suggestedQuestionId,
    language
  );

  return FAQ_ANSWERS.filter((answer) => answer.language === language)
    .map((answer) => {
      if (suggestedQuestion?.faqId) {
        const suggestedAnswer = findFaqAnswerById(
          suggestedQuestion.faqId,
          language
        );
        if (suggestedAnswer?.id === answer.id) {
          return { answer, score: 1 };
        }
      }

      const candidate = createFaqCandidate(answer);
      const score = Math.max(
        ...candidate.parts.map((part) =>
          scorePatternMatch(normalizedQuestion, normalizeQuestionForMatch(part))
        )
      );

      return { answer, score };
    })
    .sort((left, right) => right.score - left.score);
}

async function getEmbeddingCache(provider: FaqEmbeddingProvider) {
  embeddingCachePromise ??= buildEmbeddingCache(provider);
  try {
    return await embeddingCachePromise;
  } catch (error) {
    embeddingCachePromise = null;
    throw error;
  }
}

async function buildEmbeddingCache(provider: FaqEmbeddingProvider) {
  const candidates = FAQ_ANSWERS.map(createFaqCandidate);
  const embeddings = await provider.embedTexts(
    candidates.map((candidate) => candidate.text)
  );

  return { candidates, embeddings };
}

function createFaqCandidate(answer: FaqAnswer): FaqSemanticCandidate {
  const parts = uniqueStrings([
    answer.id,
    ...(answer.legacyIds ?? []),
    answer.intentId,
    answer.entityId,
    identifierToWords(answer.id),
    identifierToWords(answer.intentId),
    identifierToWords(answer.entityId),
    answer.quickLabel,
    answer.displayQuestion,
    ...(answer.alternativeDisplayQuestions ?? []),
    ...answer.patterns,
    ...(isSafeShortAnswerForMatching(answer)
      ? [truncateText(answer.shortAnswer, SHORT_ANSWER_MATCH_LIMIT)]
      : []),
  ]);

  return {
    answer,
    parts,
    text: parts.join('\n'),
  };
}

function isSafeShortAnswerForMatching(answer: FaqAnswer) {
  if (answer.visibility !== 'public' || answer.hasTodo) return false;
  return !/TODO_ASSET|private|비공개|needs_review/i.test(answer.shortAnswer);
}

function identifierToWords(value: string) {
  return value
    .replace(/^faq[._-]/, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAmbiguousShortQuestion(value: string) {
  const compact = value.replace(/\s+/g, '');
  if (!compact) return true;
  if (/^[\p{Script=Hangul}]+$/u.test(compact)) {
    return compact.length <= AMBIGUOUS_SHORT_HANGUL_LENGTH;
  }
  if (/^[a-z0-9]+$/i.test(compact)) {
    return compact.length <= AMBIGUOUS_SHORT_LATIN_LENGTH;
  }
  return false;
}

function emptyRouteResult(
  reason: string,
  router: FaqIntentRouterKind
): FaqIntentRouteResult {
  return {
    answer: null,
    intentScore: 0,
    intentSecondScore: 0,
    intentMargin: 0,
    routeDecision: {
      mode: 'rag_required',
      reason,
      router,
    },
  };
}

function getSemanticRouterConfig(): SemanticRouterConfig {
  return {
    enabled: getBooleanEnv('ASKOOSU_FAQ_SEMANTIC_ROUTER_ENABLED', true),
    directMin: getNumberEnv(
      'ASKOOSU_FAQ_SEMANTIC_DIRECT_MIN',
      DEFAULT_FAQ_SEMANTIC_DIRECT_MIN
    ),
    rewriteMin: getNumberEnv(
      'ASKOOSU_FAQ_SEMANTIC_REWRITE_MIN',
      DEFAULT_FAQ_SEMANTIC_REWRITE_MIN
    ),
    marginMin: getNumberEnv(
      'ASKOOSU_FAQ_SEMANTIC_MARGIN_MIN',
      DEFAULT_FAQ_SEMANTIC_MARGIN_MIN
    ),
  };
}

function getBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name]?.toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  return fallback;
}

function getNumberEnv(name: string, fallback: number) {
  const value = process.env[name];
  const parsedValue = value ? Number.parseFloat(value) : Number.NaN;
  if (!Number.isFinite(parsedValue)) return fallback;
  return Math.max(0, Math.min(1, parsedValue));
}

function cosineSimilarity(left: number[], right: number[]) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function roundScore(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(4)) : 0;
}

function uniqueStrings(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const uniqueValues: string[] = [];

  for (const value of values) {
    const normalizedValue = value?.trim();
    if (!normalizedValue || seen.has(normalizedValue)) continue;
    seen.add(normalizedValue);
    uniqueValues.push(normalizedValue);
  }

  return uniqueValues;
}
