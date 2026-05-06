import type { UIMessage } from 'ai';
import { detectLanguage, type ChatLanguage } from '@/lib/i18n/detect-language';
import {
  buildRagChatContext,
  type RagChatContext,
} from '@/lib/rag/chat-context';
import {
  buildAnswerParts,
  findFaqAnswerById,
  type FaqAnswer,
} from '@/lib/faq/answers';
import { matchFaqAnswer } from '@/lib/faq/match';
import { getCachedAnswer } from './database';
import { normalizeQuestion } from './text';
import type { ChatAnswerMetadata, DirectChatAnswer } from './types';

export type ChatOrchestrationInput = {
  messages: UIMessage[];
  preferredLanguage?: ChatLanguage | null;
  starterQuestionId?: string | null;
  faqId?: string | null;
  intentId?: string | null;
  displayQuestion?: string | null;
  originalQuickLabel?: string | null;
  source?: string | null;
};

export type ChatOrchestration =
  | {
      mode: 'direct';
      question: string;
      language: ChatLanguage;
      directAnswer: DirectChatAnswer;
    }
  | {
      mode: 'generate';
      question: string;
      language: ChatLanguage;
      normalizedQuestion: string;
      ragContext: RagChatContext;
      metadata: ChatAnswerMetadata;
    };

export async function prepareChatOrchestration({
  messages,
  preferredLanguage,
  starterQuestionId,
  faqId,
  intentId,
  displayQuestion,
  originalQuickLabel,
  source,
}: ChatOrchestrationInput): Promise<ChatOrchestration> {
  const question = getLatestUserText(messages);
  const normalizedQuestion = normalizeQuestion(question);
  const language = detectLanguage(question, preferredLanguage);
  const requestContext = {
    faqId: normalizeOptionalString(faqId),
    intentId: normalizeOptionalString(intentId),
    displayQuestion: normalizeOptionalString(displayQuestion),
    originalQuickLabel: normalizeOptionalString(originalQuickLabel),
    source: normalizeOptionalString(source),
  };

  if (requestContext.faqId) {
    const faqAnswer = findFaqAnswerById(requestContext.faqId, language);

    if (faqAnswer?.cacheMode === 'direct_cache') {
      const metadata = buildDirectMetadata({
        language,
        normalizedQuestion,
        answerSource: 'faq_cache',
        matchedFaqId: faqAnswer.id,
        matchedEntityIds: faqAnswer.matchedEntityIds,
        sourceChunkIds: faqAnswer.sourceChunkIds,
        confidence: faqAnswer.confidence,
        faqAnswer,
        requestContext,
      });

      return {
        mode: 'direct',
        question,
        language,
        directAnswer: {
          answer: faqAnswer.defaultAnswer,
          metadata,
        },
      };
    }
  }

  const faqMatch = matchFaqAnswer({
    question,
    language,
    starterQuestionId,
  });

  if (faqMatch?.answer.cacheMode === 'direct_cache') {
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: faqMatch.answer.answerSource,
      matchedFaqId: faqMatch.answer.id,
      matchedEntityIds: faqMatch.answer.matchedEntityIds,
      sourceChunkIds: faqMatch.answer.sourceChunkIds,
      confidence: Math.min(faqMatch.answer.confidence, faqMatch.score),
      faqAnswer: faqMatch.answer,
      requestContext,
    });

    return {
      mode: 'direct',
      question,
      language,
      directAnswer: {
        answer: faqMatch.answer.answer,
        metadata,
      },
    };
  }

  const cachedAnswer = normalizedQuestion
    ? await getCachedAnswer({
        normalizedQuestion,
        language,
      }).catch(() => null)
    : null;

  if (cachedAnswer) {
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: 'answer_cache',
      matchedEntityIds: cachedAnswer.matchedEntityIds,
      sourceChunkIds: cachedAnswer.sourceChunkIds,
      confidence: cachedAnswer.confidence,
      provider: cachedAnswer.provider ?? undefined,
      model: cachedAnswer.model ?? undefined,
    });

    return {
      mode: 'direct',
      question,
      language,
      directAnswer: {
        answer: cachedAnswer.answer,
        metadata,
      },
    };
  }

  const ragContext = await buildRagChatContext(question, language);
  const metadata: ChatAnswerMetadata = {
    ...ragContext.metadata,
    language,
    normalizedQuestion,
    answerSource: 'fallback',
    skippedGroq: false,
    sourceChunkIds: ragContext.metadata.sources.map(
      (source) => source.chunk_id
    ),
    faqId: requestContext.faqId ?? undefined,
    intentId: requestContext.intentId ?? undefined,
    originalQuickLabel: requestContext.originalQuickLabel ?? undefined,
    displayQuestion: requestContext.displayQuestion ?? undefined,
  };

  return {
    mode: 'generate',
    question,
    language,
    normalizedQuestion,
    ragContext,
    metadata,
  };
}

function buildDirectMetadata({
  language,
  normalizedQuestion,
  answerSource,
  matchedFaqId,
  matchedEntityIds,
  sourceChunkIds,
  confidence,
  provider,
  model,
  faqAnswer,
  requestContext,
}: {
  language: ChatLanguage;
  normalizedQuestion: string;
  answerSource: ChatAnswerMetadata['answerSource'];
  matchedFaqId?: string;
  matchedEntityIds: string[];
  sourceChunkIds: string[];
  confidence: number;
  provider?: string;
  model?: string;
  faqAnswer?: FaqAnswer;
  requestContext?: {
    faqId: string | null;
    intentId: string | null;
    displayQuestion: string | null;
    originalQuickLabel: string | null;
    source: string | null;
  };
}): ChatAnswerMetadata {
  const mediaCounts = countMediaRefs(faqAnswer?.mediaRefs);
  const usedVisualBlocks = faqAnswer?.visualBlocks?.map((block) => block.type);

  return {
    sources: sourceChunkIds.map((chunkId) => ({
      chunk_id: chunkId,
      entity_id: matchedEntityIds[0] ?? null,
      title: toSourceTitle(answerSource),
      section_path: [toSourceTitle(answerSource)],
      score: confidence * 100,
      visibility: 'public',
      has_todo: faqAnswer?.hasTodo ?? false,
    })),
    confidence,
    matchedEntityIds,
    hasTodoEvidence: faqAnswer?.hasTodo ?? false,
    warnings: faqAnswer?.hasTodo ? [getTodoWarning(language)] : [],
    language,
    answerSource,
    matchedFaqId,
    faqId: faqAnswer?.id ?? requestContext?.faqId ?? matchedFaqId,
    intentId:
      requestContext?.intentId ??
      faqAnswer?.intentId ??
      matchedFaqId ??
      undefined,
    quickLabel: faqAnswer?.quickLabel,
    originalQuickLabel:
      requestContext?.originalQuickLabel ?? faqAnswer?.quickLabel,
    displayQuestion:
      requestContext?.displayQuestion ?? faqAnswer?.displayQuestion,
    badge: getAnswerSourceBadge(answerSource, language),
    todoBadge: faqAnswer?.hasTodo ? getTodoBadge(language) : undefined,
    cacheMode: faqAnswer?.cacheMode,
    renderSpec: faqAnswer?.renderSpec,
    visualBlocks: faqAnswer?.visualBlocks,
    mediaRefs: faqAnswer?.mediaRefs,
    answerParts: faqAnswer ? buildAnswerParts(faqAnswer) : undefined,
    usedVisualBlocks,
    mediaReadyCount: mediaCounts.ready,
    mediaTodoCount: mediaCounts.todo,
    normalizedQuestion,
    skippedGroq: true,
    provider,
    model,
    sourceChunkIds,
  };
}

function toSourceTitle(answerSource: ChatAnswerMetadata['answerSource']) {
  if (answerSource === 'faq_cache') return 'FAQ answer bank';
  if (answerSource === 'faq_rewrite') return 'Model answer bank';
  if (answerSource === 'answer_cache') return 'Answer cache';
  if (answerSource === 'deterministic_rule') return 'Public policy rule';
  if (answerSource === 'rag_generation') return 'Wiki search answer';
  return 'AskOosu answer source';
}

function getAnswerSourceBadge(
  answerSource: ChatAnswerMetadata['answerSource'],
  language: ChatLanguage
) {
  const labels: Record<string, Record<ChatLanguage, string>> = {
    faq_cache: {
      ko: '자주 묻는 답변',
      en: 'Frequently asked answer',
    },
    faq_rewrite: {
      ko: '모범 답안 기반 응답',
      en: 'Model-answer based response',
    },
    rag_generation: {
      ko: 'Wiki 기준 답변',
      en: 'Wiki search-based answer',
    },
    fallback: {
      ko: '기본 프로필 기준 답변',
      en: 'Basic profile-based response',
    },
  };

  return labels[answerSource]?.[language];
}

function getTodoBadge(language: ChatLanguage) {
  return language === 'ko' ? '일부 정보 정리 중' : 'Needs confirmation';
}

function getTodoWarning(language: ChatLanguage) {
  return language === 'ko'
    ? '일부 정보가 정리 중입니다.'
    : 'Some information still needs confirmation.';
}

function countMediaRefs(mediaRefs: FaqAnswer['mediaRefs']) {
  return {
    ready: mediaRefs?.filter((media) => media.status === 'ready').length ?? 0,
    todo: mediaRefs?.filter((media) => media.status === 'todo').length ?? 0,
  };
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function getLatestUserText(messages: UIMessage[]) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');

  return (
    latestUserMessage?.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('\n') ?? ''
  );
}
