import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { RagChatMetadata } from '@/lib/rag/chat-context';

export type ChatAnswerSource =
  | 'faq_cache'
  | 'answer_cache'
  | 'deterministic_rule'
  | 'rag_groq'
  | 'rag_google'
  | 'rag_openai'
  | 'rag_xai'
  | 'fallback';

export type ChatAnswerMetadata = RagChatMetadata & {
  language: ChatLanguage;
  answerSource: ChatAnswerSource;
  matchedFaqId?: string;
  normalizedQuestion: string;
  skippedGroq: boolean;
  provider?: string;
  model?: string;
  sourceChunkIds: string[];
};

export type DirectChatAnswer = {
  answer: string;
  metadata: ChatAnswerMetadata;
};
