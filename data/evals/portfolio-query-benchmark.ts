export type PortfolioQueryDifficulty = 'easy' | 'medium' | 'adversarial';

export type PortfolioQueryCategory =
  | 'entity_specific'
  | 'ambiguous'
  | 'no_evidence'
  | 'multi_turn_resolved'
  | 'typo_colloquial_ko'
  | 'english';

export type PortfolioQueryCase = {
  id: string;
  difficulty: PortfolioQueryDifficulty;
  category: PortfolioQueryCategory;
  query: string;
  priorTurn?: string;
  expectedEntityIds: string[];
  relevanceHints: string[];
  expectEvidence: boolean;
};

type EvidenceSeed = {
  entityId: string;
  relevanceHints: string[];
  easy: [string, string, string, string];
  medium: [string, string, string, string];
  adversarial: [string, string];
};

const EVIDENCE_SEEDS: EvidenceSeed[] = [
  {
    entityId: 'project.askoosu',
    relevanceHints: ['askoosu'],
    easy: [
      'AskOosu 프로젝트를 설명해줘',
      'AskOosu의 RAG 구조는 어떻게 되어 있어?',
      'What is the AskOosu project?',
      'How does AskOosu use PostgreSQL and RAG?',
    ],
    medium: [
      '포트폴리오에서 대화형 AI 프로젝트의 검색 구조를 알려줘',
      'FAQ 라우팅과 검색 근거를 같이 쓰는 프로젝트가 뭐야?',
      'Which portfolio project combines deterministic routing with retrieval evidence?',
      '앞에서 말한 AskOosu에서 검색 결과를 답변 근거로 쓰는 방식은?',
    ],
    adversarial: [
      '애스크오수 rag 어케함?',
      'askoosoo retrival postgres 구조 알려줘',
    ],
  },
  {
    entityId: 'project.instagram_clone',
    relevanceHints: ['aigram', 'instagram clone'],
    easy: [
      'Instagram Clone 프로젝트를 설명해줘',
      '인스타그램 클론은 어떤 프로젝트야?',
      'Tell me about the Instagram Clone project',
      'What stack was used for the Instagram clone?',
    ],
    medium: [
      '소셜 피드 UI를 구현한 포트폴리오 프로젝트는?',
      '인스타그램 같은 경험을 만든 프로젝트의 역할을 설명해줘',
      'Which project recreated a social-media product experience?',
      '앞에서 말한 인스타 클론 프로젝트의 구현 포인트는?',
    ],
    adversarial: ['인스타 클론 뭐로 만듬?', 'insta clon project stack?'],
  },
  {
    entityId: 'project.sticks_and_stones',
    relevanceHints: ['sticks & stones', 'sticks and stones'],
    easy: [
      'Sticks and Stones 프로젝트를 설명해줘',
      'Sticks & Stones는 어떤 프로젝트야?',
      'Tell me about Sticks and Stones',
      'What did Oosu build in Sticks and Stones?',
    ],
    medium: [
      'Sticks라는 이름이 들어간 프로젝트의 핵심을 알려줘',
      'stones 프로젝트에서 맡은 구현을 요약해줘',
      'Which portfolio entry is named Sticks and Stones?',
      '앞에서 말한 Sticks and Stones의 기술 구성을 설명해줘',
    ],
    adversarial: ['스틱스앤스톤즈 머임?', 'stiks n stones project?'],
  },
  {
    entityId: 'project.portfoli_oh',
    relevanceHints: ['portfoli-oh'],
    easy: [
      'Portfoli-Oh 프로젝트를 설명해줘',
      '예전 포트폴리오 프로젝트는 어떤 거야?',
      'Tell me about Portfoli-Oh',
      'What was the Portfoli-Oh project?',
    ],
    medium: [
      '인터랙션과 시각 실험에 집중한 이전 포트폴리오는?',
      '포트폴리오 자체를 제품처럼 만든 과거 프로젝트를 알려줘',
      'Which earlier project focused on portfolio interactions and visual experiments?',
      '앞에서 말한 이전 포트폴리오의 특징은?',
    ],
    adversarial: ['포폴리오 옛날거 뭐였지?', 'portfoli oh old site?'],
  },
  {
    entityId: 'project.ez_air',
    relevanceHints: ['ez air'],
    easy: [
      'EZ Air 프로젝트를 설명해줘',
      'EZ-Air는 어떤 프로젝트야?',
      'Tell me about EZ Air',
      'What did Oosu build for EZ Air?',
    ],
    medium: [
      '항공과 관련된 포트폴리오 프로젝트가 있어?',
      'Air라는 이름의 프로젝트에서 어떤 문제를 풀었어?',
      'Which portfolio project is related to air travel?',
      '앞에서 말한 EZ Air 프로젝트의 구현 내용을 알려줘',
    ],
    adversarial: ['이지에어 프로젝트 머야?', 'ezair proj detail pls'],
  },
  {
    entityId: 'project.uncorked',
    relevanceHints: ['uncorked'],
    easy: [
      'Uncorked 프로젝트를 설명해줘',
      '언코르크드 프로젝트는 뭐야?',
      'Tell me about Uncorked',
      'What is the Uncorked portfolio project?',
    ],
    medium: [
      'Uncorked라는 이름의 제품 프로젝트에서 한 일을 알려줘',
      '포트폴리오의 Uncorked 구현을 요약해줘',
      'Which project is called Uncorked?',
      '앞에서 말한 Uncorked의 기술 구성을 알려줘',
    ],
    adversarial: ['언코크드 머임?', 'uncorkd project info'],
  },
  {
    entityId: 'profile.identity',
    relevanceHints: ['oosu profile', 'profile.identity', '자기소개'],
    easy: [
      'Oosu는 어떤 개발자야?',
      '자기소개를 해줘',
      'Who is Oosu?',
      'Give me Oosu’s developer profile',
    ],
    medium: [
      '이 포트폴리오 주인의 개발자 정체성을 요약해줘',
      '제품을 만드는 방식까지 포함해서 소개해줘',
      'How does the portfolio describe Oosu as an engineer?',
      '앞에서 소개한 사람의 개발 성향은?',
    ],
    adversarial: ['오수 어떤 개발자임?', 'who r u oosu dev?'],
  },
  {
    entityId: 'profile.career',
    relevanceHints: ['profile.career', 'career', '경력'],
    easy: [
      'Oosu의 경력을 알려줘',
      '개발 경력은 어떻게 돼?',
      'Tell me about Oosu’s career',
      'What is Oosu’s work experience?',
    ],
    medium: [
      '지금까지 어떤 일을 해왔는지 커리어 관점에서 설명해줘',
      '프로젝트 말고 경력 이력을 요약해줘',
      'Summarize the career history rather than the project list',
      '앞에서 말한 개발자의 경력 흐름을 알려줘',
    ],
    adversarial: ['경력 대충 뭐임?', 'oosu carrer experince?'],
  },
  {
    entityId: 'career.oosu_salon',
    relevanceHints: ['oosu salon', 'career.oosu_salon'],
    easy: [
      'Oosu Salon 경력을 설명해줘',
      'Oosu Salon에서 무슨 일을 했어?',
      'Tell me about the Oosu Salon experience',
      'What was Oosu’s role at Oosu Salon?',
    ],
    medium: [
      'Salon이라는 이름의 경력 항목을 구체적으로 알려줘',
      '사업과 개발이 만나는 경력 사례가 있어?',
      'Which career entry combines entrepreneurship and product work?',
      '앞에서 말한 Salon 경험에서 맡은 역할은?',
    ],
    adversarial: ['오수살롱서 뭐함?', 'oosu saloon carrer?'],
  },
  {
    entityId: 'skill.ai_usage',
    relevanceHints: ['ai usage', 'ai workflow', 'ai 활용'],
    easy: [
      'Oosu는 AI를 개발에 어떻게 활용해?',
      'AI 활용 역량을 설명해줘',
      'How does Oosu use AI in engineering?',
      'What are Oosu’s AI development skills?',
    ],
    medium: [
      '코딩 도구 이름 말고 AI를 제품 개발에 쓰는 방식을 알려줘',
      'AI를 단순 챗봇이 아니라 엔지니어링에 활용한 근거가 있어?',
      'How is AI used as part of the product-engineering workflow?',
      '앞에서 말한 AI 활용 방식의 강점은?',
    ],
    adversarial: ['ai로 개발 어케함?', 'ai eng skillz evidence?'],
  },
];

const NO_EVIDENCE_QUERIES = [
  '오늘 서울 날씨 알려줘',
  '비트코인 현재 가격은 얼마야?',
  '2026 월드컵 우승팀을 예측해줘',
  '파리에서 가장 맛있는 식당 추천해줘',
  '내 건강검진 결과를 해석해줘',
  'What is the current USD KRW exchange rate?',
  'Who won the latest Formula 1 race?',
  'Recommend a hotel in New York for tonight',
  'Summarize today’s Korean stock market',
  'Tell me the current temperature on Mars',
];

function buildCases(): PortfolioQueryCase[] {
  const cases: PortfolioQueryCase[] = [];

  EVIDENCE_SEEDS.forEach((seed, seedIndex) => {
    seed.easy.forEach((query, queryIndex) => {
      cases.push({
        id: `easy-${String(seedIndex + 1).padStart(2, '0')}-${queryIndex + 1}`,
        difficulty: 'easy',
        category: queryIndex >= 2 ? 'english' : 'entity_specific',
        query,
        expectedEntityIds: [seed.entityId],
        relevanceHints: seed.relevanceHints,
        expectEvidence: true,
      });
    });

    seed.medium.forEach((query, queryIndex) => {
      cases.push({
        id: `medium-${String(seedIndex + 1).padStart(2, '0')}-${queryIndex + 1}`,
        difficulty: 'medium',
        category:
          queryIndex === 3
            ? 'multi_turn_resolved'
            : queryIndex === 2
              ? 'english'
              : 'ambiguous',
        query,
        ...(queryIndex === 3 ? { priorTurn: seed.easy[0] } : {}),
        expectedEntityIds: [seed.entityId],
        relevanceHints: seed.relevanceHints,
        expectEvidence: true,
      });
    });

    seed.adversarial.forEach((query, queryIndex) => {
      cases.push({
        id: `adversarial-evidence-${String(seedIndex + 1).padStart(2, '0')}-${queryIndex + 1}`,
        difficulty: 'adversarial',
        category: queryIndex === 0 ? 'typo_colloquial_ko' : 'english',
        query,
        expectedEntityIds: [seed.entityId],
        relevanceHints: seed.relevanceHints,
        expectEvidence: true,
      });
    });
  });

  NO_EVIDENCE_QUERIES.forEach((query, index) => {
    for (let variant = 0; variant < 2; variant += 1) {
      cases.push({
        id: `adversarial-no-evidence-${String(index + 1).padStart(2, '0')}-${variant + 1}`,
        difficulty: 'adversarial',
        category: 'no_evidence',
        query:
          variant === 0 ? query : `${query} 포트폴리오 근거만 사용해서 답해줘`,
        expectedEntityIds: [],
        relevanceHints: [],
        expectEvidence: false,
      });
    }
  });

  return cases;
}

export const PORTFOLIO_QUERY_BENCHMARK = buildCases();

if (PORTFOLIO_QUERY_BENCHMARK.length !== 120) {
  throw new Error(
    `Expected 120 benchmark queries, got ${PORTFOLIO_QUERY_BENCHMARK.length}`
  );
}
