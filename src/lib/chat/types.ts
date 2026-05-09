import type { ChatLanguage } from '@/lib/i18n/detect-language';
import type { AnswerConfidence, RagChatMetadata } from '@/lib/rag/chat-context';
import type {
  ConversationIntent,
  ConversationModifier,
} from './conversation-intent';

export type { AnswerConfidence };

export type ChatAnswerSource =
  | 'faq_cache'
  | 'faq_rewrite'
  | 'answer_cache'
  | 'deterministic_rule'
  | 'smalltalk'
  | 'off_topic_redirect'
  | 'clarify'
  | 'private_guardrail'
  | 'prompt_guardrail'
  | 'rag_generation'
  | 'rag_groq'
  | 'rag_google'
  | 'rag_openai'
  | 'rag_xai'
  | 'insufficient_evidence'
  | 'fallback';

export type AnswerRouteDecision =
  | {
      mode: 'faq_direct';
      faqId: string;
      confidence: number;
      reason:
        | 'verified_quick_question'
        | 'high_semantic_match'
        | 'legacy_exact_match';
    }
  | {
      mode: 'faq_rewrite';
      faqId: string;
      confidence: number;
      reason: 'semantic_match_needs_adaptation' | 'legacy_medium_match';
    }
  | {
      mode: 'answer_cache';
      confidence: number;
      reason: 'fresh_cache_hit';
    }
  | {
      mode: 'smalltalk';
      confidence: number;
      reason: 'greeting_or_light_smalltalk';
    }
  | {
      mode: 'off_topic_redirect';
      confidence: number;
      reason:
        | 'off_topic_light'
        | 'playful_probe'
        | 'hostile_or_sharp_feedback'
        | 'no_portfolio_intent_detected';
    }
  | {
      mode: 'portfolio_clarify';
      confidence: number;
      reason: 'short_or_ambiguous_portfolio_input' | 'follow_up_without_context';
    }
  | {
      mode: 'private_guardrail';
      confidence: number;
      reason: 'private_or_sensitive_request';
    }
  | {
      mode: 'prompt_guardrail';
      confidence: number;
      reason: 'prompt_or_internal_request';
    }
  | {
      mode: 'rag_generate';
      query: string;
      expectedEntityIds: string[];
      confidence: number;
      reason: 'no_direct_faq' | 'medium_intent_match' | 'custom_question';
    }
  | {
      mode: 'safe_fallback';
      reason:
        | 'no_public_evidence'
        | 'provider_unavailable'
        | 'prompt_leak_detected'
        | 'private_or_todo_only'
        | 'rate_limited';
      confidence: number;
    };

export type ChatAnswerMetadata = RagChatMetadata & {
  requestId?: string;
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
  conversationIntent?: ConversationIntent;
  conversationModifiers?: ConversationModifier[];
  showEvidence?: boolean;
  matchedFaqId?: string;
  intentScore?: number;
  intentSecondScore?: number;
  intentMargin?: number;
  routeDecision: AnswerRouteDecision;
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
