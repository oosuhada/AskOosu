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
  {
    text: {
      ko: '넓게 보는 힘은 깊이를 피하는 것이 아니라, 문제의 연결부를 놓치지 않기 위한 태도입니다.',
      en: 'Breadth is not avoiding depth. It is a way to keep the connections in sight.',
    },
    category: 'positioning',
  },
  {
    text: {
      ko: '좋은 제품 판단은 기술, 문장, 화면, 운영 맥락이 같은 방향을 볼 때 생깁니다.',
      en: 'Good product judgment appears when code, copy, interface, and operations point in the same direction.',
    },
    category: 'product',
  },
  {
    text: {
      ko: '사용자가 던진 질문을 정확히 이해하는 것부터 제품 경험은 시작됩니다.',
      en: "Product experience starts with understanding the user's question accurately.",
    },
    category: 'ux',
  },
  {
    text: {
      ko: 'AI가 많은 선택지를 줄수록, 과장하지 않는 기준이 더 중요해집니다.',
      en: 'As AI offers more options, the discipline not to overclaim matters more.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '포트폴리오는 결과물 목록이 아니라, 어떤 문제를 어떻게 풀어왔는지 보여주는 흐름입니다.',
      en: 'A portfolio is not a list of outputs. It is a path through how problems were understood and solved.',
    },
    category: 'product',
  },
  {
    text: {
      ko: '사용자와 운영을 직접 겪은 경험은 화면 뒤의 현실을 보게 합니다.',
      en: 'Experience with users and operations helps you see the reality behind the screen.',
    },
    category: 'positioning',
  },
  {
    text: {
      ko: '빠르게 만드는 것보다 중요한 건, 빠르게 만들고도 책임 있게 고치는 능력입니다.',
      en: 'More important than building fast is building fast and still correcting responsibly.',
    },
    category: 'learning',
  },
  {
    text: {
      ko: 'RAG는 답을 멋있게 꾸미는 장치가 아니라, 근거로 돌아오게 만드는 안전장치입니다.',
      en: 'RAG is not decoration for answers. It is a guardrail that brings answers back to evidence.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '작은 제품도 질문, 근거, 피드백이 이어지면 학습하는 시스템이 됩니다.',
      en: 'Even a small product becomes a learning system when questions, evidence, and feedback connect.',
    },
    category: 'product',
  },
  {
    text: {
      ko: '좋은 인터페이스는 사용자가 다음 행동을 망설이지 않게 합니다.',
      en: 'A good interface keeps the next action from feeling uncertain.',
    },
    category: 'ux',
  },
  {
    text: {
      ko: 'AI 시대의 개발자는 코드를 더 빨리 쓰는 사람을 넘어, 더 정확한 문제를 붙잡는 사람이어야 합니다.',
      en: 'In the AI era, a developer should not only write code faster but hold onto the right problem more clearly.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '전환의 시간은 지워야 할 공백이 아니라, 제품을 보는 렌즈가 될 수 있습니다.',
      en: 'A career transition does not have to be a gap to erase. It can become a lens for product judgment.',
    },
    category: 'positioning',
  },
  {
    text: {
      ko: '문서를 잘 쓰는 이유는 AI를 믿어서가 아니라, AI가 틀렸을 때 돌아갈 기준을 만들기 위해서입니다.',
      en: 'Documentation matters not because AI is always right, but because it gives us a place to return when AI is wrong.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '배운 것을 결과물로 연결할 때, 학습은 이력서 문장이 아니라 제품의 일부가 됩니다.',
      en: 'When learning becomes output, it stops being a resume line and becomes part of the product.',
    },
    category: 'learning',
  },
  {
    text: {
      ko: '신뢰감 있는 AI UX는 답변보다 먼저, 경계와 근거를 어떻게 보여주는지에서 드러납니다.',
      en: 'Trustworthy AI UX appears not only in the answer, but in how boundaries and evidence are shown.',
    },
    category: 'ux',
  },
  {
    text: {
      ko: '제품을 만든다는 것은 기능을 쌓는 일이 아니라, 사용자의 막힌 지점을 줄이는 일입니다.',
      en: 'Building a product is not stacking features. It is reducing the places where users get stuck.',
    },
    category: 'product',
  },
  {
    text: {
      ko: 'AI Director는 직함이 아니라, 문제 정의부터 배포 이후 피드백까지 연결하려는 작업 방식입니다.',
      en: 'AI Director is not a title. It is a working style that connects problem definition through post-deployment feedback.',
    },
    category: 'ai_era',
  },
  {
    text: {
      ko: '좋은 개발자는 구현 속도와 함께, 무엇을 구현하지 않을지 판단하는 감각도 키워야 합니다.',
      en: 'A good developer grows not only implementation speed, but judgment about what not to build.',
    },
    category: 'learning',
  },
  {
    text: {
      ko: '풀스택의 가치는 모든 것을 혼자 한다는 말보다, 레이어 사이 책임을 이해한다는 말에 가깝습니다.',
      en: 'The value of fullstack is less about doing everything alone and more about understanding responsibility across layers.',
    },
    category: 'positioning',
  },
  {
    text: {
      ko: '운영을 겪어본 사람은 기능 하나가 실제 비즈니스 흐름에서 어디에 걸리는지 더 민감하게 봅니다.',
      en: 'Someone who has operated a service can more readily see where a feature meets real business friction.',
    },
    category: 'product',
  },
  {
    text: {
      ko: '질문을 잘 분류하는 일은 챗봇 기능이 아니라, 포트폴리오의 신뢰를 지키는 일입니다.',
      en: 'Classifying questions well is not just a chatbot feature. It protects the trust of the portfolio.',
    },
    category: 'ux',
  },
];

export function getContextualQuote({
  category,
  language,
  seed,
  avoidText,
}: {
  category?: ContextualQuoteCategory;
  language: ChatLanguage;
  seed: string;
  avoidText?: string;
}) {
  const pool = category
    ? contextualQuotes.filter((quote) => quote.category === category)
    : contextualQuotes;
  const candidates = pool.length > 0 ? pool : contextualQuotes;
  const unusedCandidates = avoidText
    ? candidates.filter((quote) => !avoidText.includes(quote.text[language]))
    : candidates;
  const activeCandidates =
    unusedCandidates.length > 0 ? unusedCandidates : candidates;

  return activeCandidates[stableIndex(seed, activeCandidates.length)].text[
    language
  ];
}

function stableIndex(value: string, modulo: number) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % modulo;
}
