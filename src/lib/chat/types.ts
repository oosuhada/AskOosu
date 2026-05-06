import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { RagChatMetadata } from '@/lib/rag/chat-context';

export type ChatAnswerSource =
  | 'faq_cache'
  | 'faq_rewrite'
  | 'answer_cache'
  | 'deterministic_rule'
  | 'rag_generation'
  | 'rag_groq'
  | 'rag_google'
  | 'rag_openai'
  | 'rag_xai'
  | 'fallback';

export type ChatAnswerMetadata = RagChatMetadata & {
  language: ChatLanguage;
  answerSource: ChatAnswerSource;
  triggerId?: string;
  faqId?: string;
  intentId?: string;
  quickLabel?: string;
  originalQuickLabel?: string;
  displayQuestion?: string;
  answerVariant?: 'short' | 'default' | 'detailed';
  badge?: string;
  todoBadge?: string;
  cacheMode?: string;
  renderSpec?: unknown;
  renderSpecKey?: string;
  richAnswerData?: unknown;
  visualBlocks?: unknown[];
  mediaRefs?: unknown[];
  answerParts?: unknown[];
  usedVisualBlocks?: string[];
  mediaReadyCount?: number;
  mediaTodoCount?: number;
  matchedFaqId?: string;
  normalizedQuestion: string;
  skippedGroq: boolean;
  provider?: string;
  model?: string;
  errorCode?: string;
  sourceChunkIds: string[];
};

export type DirectChatAnswer = {
  answer: string;
  metadata: ChatAnswerMetadata;
};
