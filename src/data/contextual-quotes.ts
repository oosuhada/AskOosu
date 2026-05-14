import type { ChatLanguage } from '@/lib/i18n/detect-language';

export type ContextualQuoteCategory =
  | 'ai_era'
  | 'ux'
  | 'learning'
  | 'product'
  | 'positioning';

export type ContextualQuote = {
  text: Record<ChatLanguage, string>;
  category: ContextualQuoteCategory;
};

export const contextualQuotes: ContextualQuote[] = [
  {
    text: {
      ko: 'AI가 실행을 빠르게 만들수록, 무엇을 만들지 판단하는 눈이 더 중요해집니다.',
      en: 'As AI makes execution faster, the eye for what to build becomes more important.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '좋은 UX는 예쁜 게 아니라 막히지 않는 겁니다.',
      en: 'Good UX is not just pretty. It is frictionless.',
    },
    category: 'ux',
  },
  {
    text: {
      ko: '읽기만 한 기술과 직접 배포까지 해본 기술은 다릅니다.',
      en: 'A technology you only read about and one you have shipped are different things.',
    },
    category: 'learning',
  },
  {
    text: {
      ko: 'AI를 잘 검토할 수 있어야 잘 쓸 수 있습니다.',
      en: 'You can only use AI well if you can review it well.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '기능이 아니라 질문이 출발점입니다.',
      en: 'Questions, not features, are the starting point.',
    },
    category: 'product',
  },
  {
    text: {
      ko: 'AI는 옵션을 제안하지만, 그 선택의 무게를 지는 건 사람입니다.',
      en: 'AI can propose options, but the weight of the choice still belongs to a person.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: 'AI 코드는 초안이고, 제품에 들어가는 판단은 사람이 책임집니다.',
      en: 'AI code is a draft; the judgment that enters the product is human responsibility.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '경쟁자는 AI 자체가 아니라, AI를 잘 활용하는 사람들입니다.',
      en: 'The competitor is not AI itself. It is people who use AI well.',
    },
    category: 'positioning',
  },
];

export function getContextualQuote({
  category,
  language,
  seed,
}: {
  category?: ContextualQuoteCategory;
  language: ChatLanguage;
  seed: string;
}) {
  const pool = category
    ? contextualQuotes.filter((quote) => quote.category === category)
    : contextualQuotes;
  const candidates = pool.length > 0 ? pool : contextualQuotes;

  return candidates[stableIndex(seed, candidates.length)].text[language];
}

function stableIndex(value: string, modulo: number) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % modulo;
}
