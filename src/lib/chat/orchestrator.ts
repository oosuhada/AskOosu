import type { UIMessage } from 'ai';
import { detectLanguage, type ChatLanguage } from '@/lib/i18n/detect-language';
import {
  buildRagChatContext,
  type RagChatContext,
} from '@/lib/rag/chat-context';
import { matchFaqAnswer } from '@/lib/faq/match';
import { getCachedAnswer } from './database';
import { normalizeQuestion } from './text';
import type { ChatAnswerMetadata, DirectChatAnswer } from './types';

export type ChatOrchestrationInput = {
  messages: UIMessage[];
  preferredLanguage?: ChatLanguage | null;
  starterQuestionId?: string | null;
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
}: ChatOrchestrationInput): Promise<ChatOrchestration> {
  const question = getLatestUserText(messages);
  const normalizedQuestion = normalizeQuestion(question);
  const language = detectLanguage(question, preferredLanguage);

  const faqMatch = matchFaqAnswer({
    question,
    language,
    starterQuestionId,
  });

  if (faqMatch) {
    const metadata = buildDirectMetadata({
      language,
      normalizedQuestion,
      answerSource: faqMatch.answer.answerSource,
      matchedFaqId: faqMatch.answer.id,
      matchedEntityIds: faqMatch.answer.matchedEntityIds,
      sourceChunkIds: faqMatch.answer.sourceChunkIds,
      confidence: Math.min(faqMatch.answer.confidence, faqMatch.score),
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

  const ragContext = await buildRagChatContext(question);
  const metadata: ChatAnswerMetadata = {
    ...ragContext.metadata,
    language,
    normalizedQuestion,
    answerSource: 'fallback',
    skippedGroq: false,
    sourceChunkIds: ragContext.metadata.sources.map(
      (source) => source.chunk_id
    ),
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
}): ChatAnswerMetadata {
  return {
    sources: sourceChunkIds.map((chunkId) => ({
      chunk_id: chunkId,
      entity_id: matchedEntityIds[0] ?? null,
      title: toSourceTitle(answerSource),
      section_path: [toSourceTitle(answerSource)],
      score: confidence * 100,
      visibility: 'public',
      has_todo: false,
    })),
    confidence,
    matchedEntityIds,
    hasTodoEvidence: false,
    warnings: [],
    language,
    answerSource,
    matchedFaqId,
    normalizedQuestion,
    skippedGroq: true,
    provider,
    model,
    sourceChunkIds,
  };
}

function toSourceTitle(answerSource: ChatAnswerMetadata['answerSource']) {
  if (answerSource === 'faq_cache') return 'FAQ answer bank';
  if (answerSource === 'answer_cache') return 'Answer cache';
  if (answerSource === 'deterministic_rule') return 'Public policy rule';
  return 'AskOosu answer source';
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
