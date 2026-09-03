export type GithubProjectQuestionIntent =
  | 'overview'
  | 'readme'
  | 'languages'
  | 'growth';

export type GithubProjectQuestion = {
  id: string;
  intent: GithubProjectQuestionIntent;
  quickLabel: string;
  displayQuestion: string;
  dynamic: true;
};

export function buildGithubProjectQuestions(
  projectName: string | null,
  language: 'ko' | 'en'
): GithubProjectQuestion[] {
  if (!projectName) return [];

  if (language === 'ko') {
    return [
      {
        id: `dynamic:${projectName}:overview`,
        intent: 'overview',
        quickLabel: '프로젝트 개요',
        displayQuestion: `${projectName} 프로젝트는 무엇을 만드는 프로젝트인가요?`,
        dynamic: true,
      },
      {
        id: `dynamic:${projectName}:readme`,
        intent: 'readme',
        quickLabel: 'README / 구조',
        displayQuestion: `${projectName}의 README 근거를 바탕으로 핵심 기능과 구조를 설명해 주세요.`,
        dynamic: true,
      },
      {
        id: `dynamic:${projectName}:languages`,
        intent: 'languages',
        quickLabel: '언어 / 기술',
        displayQuestion: `${projectName}에서 사용한 언어 비율과 주요 기술 선택을 설명해 주세요.`,
        dynamic: true,
      },
      {
        id: `dynamic:${projectName}:growth`,
        intent: 'growth',
        quickLabel: '성장 포인트',
        displayQuestion: `${projectName}이 우수님의 개발 성장 흐름에서 어떤 의미가 있나요?`,
        dynamic: true,
      },
    ];
  }

  return [
    {
      id: `dynamic:${projectName}:overview`,
      intent: 'overview',
      quickLabel: 'Overview',
      displayQuestion: `What does the ${projectName} project build?`,
      dynamic: true,
    },
    {
      id: `dynamic:${projectName}:readme`,
      intent: 'readme',
      quickLabel: 'README / Architecture',
      displayQuestion: `Explain the core features and architecture of ${projectName} using its README evidence.`,
      dynamic: true,
    },
    {
      id: `dynamic:${projectName}:languages`,
      intent: 'languages',
      quickLabel: 'Languages / Stack',
      displayQuestion: `Explain the language breakdown and main technology choices in ${projectName}.`,
      dynamic: true,
    },
    {
      id: `dynamic:${projectName}:growth`,
      intent: 'growth',
      quickLabel: 'Growth',
      displayQuestion: `How does ${projectName} fit into Oosu's growth as a developer?`,
      dynamic: true,
    },
  ];
}
