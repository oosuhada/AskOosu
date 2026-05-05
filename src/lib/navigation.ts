import type { AnswerVariant } from '@/data/question-surfaces.shared';
import type { DisplayLanguage, DisplayTheme } from '@/lib/preferences';

export function buildChatHref({
  query,
  language,
  theme,
  starterQuestionId,
  faqId,
  intentId,
  displayQuestion,
  originalQuickLabel,
  answerVariant,
  renderSpec,
  source,
}: {
  query: string;
  language: DisplayLanguage;
  theme: DisplayTheme;
  starterQuestionId?: string;
  faqId?: string;
  intentId?: string;
  displayQuestion?: string;
  originalQuickLabel?: string;
  answerVariant?: AnswerVariant;
  renderSpec?: string;
  source?: 'quick_question' | 'typed_question';
}) {
  const params = new URLSearchParams({
    query,
    lang: language,
    theme,
  });

  const optionalParams = {
    starterQuestionId,
    faqId,
    intentId,
    displayQuestion,
    originalQuickLabel,
    answerVariant,
    renderSpec,
    source,
  };

  Object.entries(optionalParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return `/chat?${params.toString()}`;
}
