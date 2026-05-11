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
import {
  PHILOSOPHY_ANSWERS,
  findPhilosophyAnswerById,
} from '@/lib/philosophy/answers';
import { FAQ_ANSWERS, findFaqAnswerById, type FaqAnswer } from './answers';
import { scorePatternMatch } from './match';

export type FaqIntentRouteMode = 'direct' | 'rewrite' | 'rag_required';

export type FaqIntentRouterKind =
  | 'quick_question'
  | 'philosophy'
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

  const aiEraCompetitivenessMatch = getAiEraCompetitivenessMatch({
    question: normalizedQuestion,
    language,
  });

  if (aiEraCompetitivenessMatch) {
    return {
      answer: aiEraCompetitivenessMatch,
      matchedFaqId: aiEraCompetitivenessMatch.id,
      intentScore: 0.99,
      intentSecondScore: 0,
      intentMargin: 0.99,
      routeDecision: {
        mode: 'direct',
        reason: 'ai_era_competitiveness_phrase_match',
        router: 'token_fallback',
      },
    };
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

  const hiddenRecruiterRiskMatch = getHiddenRecruiterRiskMatch({
    question: normalizedQuestion,
    language,
  });

  if (hiddenRecruiterRiskMatch) {
    return {
      answer: hiddenRecruiterRiskMatch,
      matchedFaqId: hiddenRecruiterRiskMatch.id,
      intentScore: 0.99,
      intentSecondScore: 0,
      intentMargin: 0.99,
      routeDecision: {
        mode: 'direct',
        reason: 'hidden_recruiter_risk_phrase_match',
        router: 'token_fallback',
      },
    };
  }

  const philosophyMatch = getPhilosophyIntentMatch({
    question: normalizedQuestion,
    language,
  });

  if (philosophyMatch) {
    return philosophyMatch;
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

function getHiddenRecruiterRiskMatch({
  question,
  language,
}: {
  question: string;
  language: ChatLanguage;
}) {
  const hasRetentionConcern =
    /(오래\s*(근무|다니|못\s*다니|머물|못\s*머물)|장기\s*근속|금방\s*(그만|퇴사)|퇴사\s*리스크|이직\s*리스크|retention|stay\s+long|leave\s+quickly|job\s*hopp|learn\s+and\s+leave)/i.test(
      question
    );
  const hasStartupConcern =
    /(창업|스타트업|사업\s*하|founder|startup|entrepreneur|own\s+company)/i.test(
      question
    );
  const hasLearnOnlyConcern =
    /(배울\s*(것|거)?만|뽑아\s*먹|뽑아먹|learn\s+enough|just\s+learn)/i.test(
      question
    );
  const hasAiDependencyConcern =
    /(ai\s*(의존|없이|못|포장|wrapper)|프롬프트만|prompting|code\s+without\s+ai|rely\s+too\s+much\s+on\s+ai)/i.test(
      question
    );
  const hasDepthConcern =
    /(비전공|전환형|개발\s*깊이|깊이가\s*부족|cs\s*fundamental|non[-\s]?cs|career\s+changer\s+depth)/i.test(
      question
    );
  const hasCollaborationConcern =
    /(협업\s*(싫|회피|못|약|부족|괜찮)|팀\s*(경험|워크|협업|에서도\s*괜찮|못\s*하|안\s*맞)|혼자\s*(일|만)|solo\s*(builder|only)|work\s+(well\s+)?in\s+a\s+team|team\s*(fit|work|experience)|dislike\s+collaboration|avoid\s+collaboration|collaboration\s+(risk|concern|weak))/i.test(
      question
    );
  const hasRoleConcern =
    /(포지션\s*(애매|모호|불명확)|역할\s*(애매|모호)|pm\s*인지|개발자\s*인지|product\s*owner|role\s*(ambiguity|unclear)|pm\s+or\s+developer)/i.test(
      question
    );

  if (
    (hasRetentionConcern && (hasStartupConcern || hasLearnOnlyConcern)) ||
    (hasStartupConcern && hasLearnOnlyConcern)
  ) {
    return findFaqAnswerById(
      'faq.recruiter.retention_startup_risk.default',
      language
    );
  }

  if (hasRetentionConcern || hasLearnOnlyConcern) {
    return findFaqAnswerById('faq.recruiter.retention_risk.default', language);
  }

  if (hasStartupConcern) {
    return findFaqAnswerById('faq.recruiter.startup_intent.default', language);
  }

  if (hasAiDependencyConcern) {
    return findFaqAnswerById('faq.recruiter.ai_dependency.default', language);
  }

  if (hasDepthConcern) {
    return findFaqAnswerById('faq.recruiter.depth_concern.default', language);
  }

  if (hasCollaborationConcern) {
    return findFaqAnswerById(
      'faq.recruiter.collaboration_experience.default',
      language
    );
  }

  if (
    hasRoleConcern &&
    /채용|면접|리크루터|recruit|hire|hiring|risk|concern|리스크|우려/i.test(
      question
    )
  ) {
    return findFaqAnswerById('faq.recruiter.role_ambiguity.default', language);
  }

  return null;
}

function getAiEraCompetitivenessMatch({
  question,
  language,
}: {
  question: string;
  language: ChatLanguage;
}) {
  if (
    /(ai\s*(replace|replacing|obsolete)|replace\s+developers?|developers?.*(obsolete|replace)|why\s+hire\s+(a\s+)?(junior|developer)|developer\s+job\s+security|AI가\s*(개발자|사람|주니어).*(대체|필요\s*없)|개발자\s*(필요\s*없|안\s*뽑|살아남)|AI\s*때문에\s*개발자|AI가\s*코드.*다\s*짜)/i.test(
      question
    )
  ) {
    return findFaqAnswerById('faq.ai_era.replace_developer.default', language);
  }

  if (
    /(skill\s*atrophy|real\s+skills?|can\s+you\s+code\s+without\s+ai|does.*actually\s+code|ai\s*(dependency|too\s+much)|AI\s*(많이\s*쓰|의존|없이|기본기|진짜\s*실력)|코드.*직접|직접.*코드|실력\s*안\s*늘)/i.test(
      question
    )
  ) {
    return findFaqAnswerById('faq.ai_era.skill_atrophy.default', language);
  }

  if (
    /(ai\s+fluency|using\s+ai\s+well|dependency|AI를\s*잘\s*쓰|AI\s*fluency|의존.*차이|잘\s*쓰는\s*것.*의존)/i.test(
      question
    )
  ) {
    return findFaqAnswerById(
      'faq.ai_competitiveness.ai_fluency_vs_dependency.default',
      language
    );
  }

  if (
    /(competitive\s+advantage|why\s+hire\s+oosu|what\s+makes\s+oosu\s+different|competitor|competing\s+with\s+ai|AI\s*시대.*(경쟁력|차별점|강점)|왜\s*우수를\s*뽑|우수.*(경쟁력|강점|차별점)|경쟁자.*AI|AI와\s*경쟁|본인.*경쟁자)/i.test(
      question
    )
  ) {
    return findFaqAnswerById(
      'faq.ai_era.competitiveness_source.default',
      language
    );
  }

  return null;
}

function getPhilosophyIntentMatch({
  question,
  language,
}: {
  question: string;
  language: ChatLanguage;
}): FaqIntentRouteResult | null {
  const answers = PHILOSOPHY_ANSWERS.filter(
    (answer) => answer.language === language
  );
  if (answers.length === 0) return null;

  const rankedCandidates = answers
    .map((answer) => ({
      answer,
      score: getPhilosophyPatternScore(question, answer),
    }))
    .sort((left, right) => right.score - left.score);
  const [topCandidate, secondCandidate] = rankedCandidates;
  if (!topCandidate) return null;

  const topScore = roundScore(topCandidate.score);
  const secondScore = roundScore(secondCandidate?.score ?? 0);
  const margin = roundScore(topScore - secondScore);
  const isTriggered = isPhilosophyTriggeredQuestion(question);
  const hasConfidentMatch =
    topScore >= 0.88 && (margin >= 0.08 || topScore >= 0.96);
  const hasGoodTriggeredMatch =
    isTriggered && topScore >= 0.72 && margin >= 0.08;

  if (hasConfidentMatch || hasGoodTriggeredMatch) {
    return {
      answer: topCandidate.answer,
      matchedFaqId: topCandidate.answer.id,
      intentScore: topScore,
      intentSecondScore: secondScore,
      intentMargin: margin,
      routeDecision: {
        mode: 'direct',
        reason: 'philosophy_pattern_match',
        router: 'philosophy',
      },
    };
  }

  const fallbackAnswer = getFallbackPhilosophyAnswer({
    question,
    language,
    isTriggered,
  });
  if (!fallbackAnswer) return null;

  return {
    answer: fallbackAnswer,
    matchedFaqId: fallbackAnswer.id,
    intentScore: 0.82,
    intentSecondScore: secondScore,
    intentMargin: 0.18,
    routeDecision: {
      mode: 'direct',
      reason: 'philosophy_keyword_fallback',
      router: 'philosophy',
    },
  };
}

function getPhilosophyPatternScore(question: string, answer: FaqAnswer) {
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

  return Math.max(
    ...candidatePatterns.map((pattern) =>
      scorePatternMatch(question, normalizeQuestionForMatch(pattern))
    )
  );
}

function getFallbackPhilosophyAnswer({
  question,
  language,
  isTriggered,
}: {
  question: string;
  language: ChatLanguage;
  isTriggered: boolean;
}) {
  if (!isTriggered) return null;

  if (
    /(팀|협업|team|teams|collaboration|solo|혼자|1인|one\s+person|small(er)?\s+team)/i.test(
      question
    )
  ) {
    return (
      findPhilosophyAnswerById(
        'faq.ai_thesis.future_of_teams.default',
        language
      ) ?? findPhilosophyAnswerById('faq.vision.team_future.default', language)
    );
  }

  if (
    /(pm|po|product\s*owner|개발자|developer|role|포지션|역할)/i.test(question)
  ) {
    return (
      findPhilosophyAnswerById(
        'faq.ai_thesis.pm_or_developer.default',
        language
      ) ??
      findPhilosophyAnswerById('faq.vision.pm_or_developer.default', language)
    );
  }

  if (/(에이전트|agent|workflow|워크플로|how.*ai|ai.*work)/i.test(question)) {
    return (
      findPhilosophyAnswerById(
        'faq.ai_thesis.agent_workflow.default',
        language
      ) ??
      findPhilosophyAnswerById(
        'faq.vision.ai_workflow_origin.default',
        language
      )
    );
  }

  if (
    /(한\s*문장|요약|철학|관점|생각|point\s+of\s+view|perspective|philosophy|what\s+do\s+you\s+think)/i.test(
      question
    )
  ) {
    return (
      findPhilosophyAnswerById(
        'faq.ai_thesis.one_sentence.default',
        language
      ) ??
      findPhilosophyAnswerById(
        'faq.vision.ai_philosophy_summary.default',
        language
      )
    );
  }

  return (
    findPhilosophyAnswerById(
      'faq.ai_thesis.competitive_edge.default',
      language
    ) ??
    findPhilosophyAnswerById('faq.vision.ai_developer_future.default', language)
  );
}

function isPhilosophyTriggeredQuestion(question: string) {
  return /(ai\s*era|future|five\s*years?|philosophy|perspective|point\s+of\s+view|what\s+do\s+you\s+think|orchestrator|product\s*owner|\bpm\b\s+or\s+(a\s+)?developer|developer\s+or\s+\bpm\b|teams?.*(disappear|future)|solo\s*builder|ai[-\s]?native|ai[-\s]?connected|team\s+future|AI 시대|5년|철학|관점|생각|오케스트레이터|프로덕트\s*오너|팀의\s*미래|팀에서도|혼자\s*일|AI\s*에이전트|AI\s*연결|AI-connected|PM\s*(이야|인가|인지)?.*개발자|개발자.*PM|포지션.*(PM|PO|개발자|developer)|역할.*(PM|PO|개발자|developer))/i.test(
    question
  );
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
