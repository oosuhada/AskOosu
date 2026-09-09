import type { FaqAnswer, FaqMediaRef, FaqVisualBlock } from './answers';
import type { GithubPortfolioRepository } from '@/lib/github-portfolio';
import { getIndexedGithubProjects } from '@/lib/rag/github-source';

const MAX_SELECTED_PROJECTS = 15;

export async function hydrateDynamicProjectAnswer(
  faqAnswer: FaqAnswer
): Promise<FaqAnswer> {
  if (faqAnswer.intentId !== 'project.representative') return faqAnswer;

  const repositories = await getIndexedGithubProjects(MAX_SELECTED_PROJECTS);
  if (repositories.length === 0) return faqAnswer;

  const selectedRepositories = repositories.slice(0, MAX_SELECTED_PROJECTS);
  const selectedItems = selectedRepositories.map((repository) =>
    toDynamicProjectItem(repository, faqAnswer.language)
  );
  const dynamicMediaRefs = selectedRepositories
    .map(toDynamicMediaRef)
    .filter((media): media is FaqMediaRef => Boolean(media));
  const visualBlocks = replaceLegacyMoreProjects(
    faqAnswer.visualBlocks,
    selectedItems,
    faqAnswer.language
  );
  const githubSourceChunkIds = selectedRepositories.map(
    (repository) => `github-project-${repository.name}`
  );
  const matchedEntityIds = selectedRepositories.map(
    (repository) => `github:${repository.name}`
  );
  const defaultAnswer = buildDynamicAnswerText(
    selectedRepositories,
    faqAnswer.language
  );

  return {
    ...faqAnswer,
    shortAnswer:
      faqAnswer.language === 'ko'
        ? 'AskOosu, Aigram, Sticks & Stones를 중심으로 보면 우수의 흐름은 프론트엔드에서 풀스택, AI·시스템 문제까지 점점 넓어지는 방향입니다.'
        : 'AskOosu, Aigram, and Sticks & Stones show a progression from frontend work into fullstack products and broader AI/system problems.',
    defaultAnswer,
    answer: defaultAnswer,
    visualBlocks,
    mediaRefs: dedupeMediaRefs([
      ...(faqAnswer.mediaRefs ?? []),
      ...dynamicMediaRefs,
    ]),
    sourceChunkIds: Array.from(
      new Set([...faqAnswer.sourceChunkIds, ...githubSourceChunkIds])
    ),
    matchedEntityIds: Array.from(
      new Set([...faqAnswer.matchedEntityIds, ...matchedEntityIds])
    ),
    freshness: 'time_sensitive',
  };
}

function replaceLegacyMoreProjects(
  blocks: FaqVisualBlock[] | undefined,
  items: unknown[],
  language: 'ko' | 'en'
) {
  const dynamicBlock: FaqVisualBlock = {
    type: 'projectCards',
    title: language === 'ko' ? '선별 GitHub 프로젝트' : 'Selected GitHub Projects',
    dataKey: 'projects.github.selected',
    items,
  };

  if (!blocks?.length) return [dynamicBlock];

  const withoutLegacyMore = blocks.filter(
    (block) => block.dataKey !== 'projects.more'
  );
  const featuredIndex = withoutLegacyMore.findIndex(
    (block) => block.dataKey === 'projects.representative'
  );

  if (featuredIndex < 0) return [dynamicBlock, ...withoutLegacyMore];
  return [
    ...withoutLegacyMore.slice(0, featuredIndex + 1),
    dynamicBlock,
    ...withoutLegacyMore.slice(featuredIndex + 1),
  ];
}

function toDynamicProjectItem(
  repository: GithubPortfolioRepository,
  language: 'ko' | 'en'
) {
  const imageKey = repository.readmeImages[0]
    ? `github.${repository.name}.readme`
    : undefined;
  const firstCommitDate = (repository.firstCommitAt ?? repository.createdAt).slice(
    0,
    10
  );

  return {
    id: `github:${repository.name}`,
    title: repository.name,
    label:
      language === 'ko'
        ? `GitHub · ${firstCommitDate} 첫 커밋`
        : `GitHub · First commit ${firstCommitDate}`,
    subtitle: repository.homepage
      ? language === 'ko'
        ? '공개 배포 프로젝트'
        : 'Publicly deployed project'
      : language === 'ko'
        ? '공개 GitHub 저장소'
        : 'Public GitHub repository',
    description:
      repository.description ??
      (language === 'ko'
        ? '최근 공개 GitHub 프로젝트입니다.'
        : 'A recent public GitHub project.'),
    image: imageKey,
    tags: repository.topics.slice(0, 4),
    languages: repository.languages.slice(0, 6).map((item) => ({
      name: item.name,
      percentage: item.percentage,
    })),
    href: repository.homepage ?? repository.url,
    githubHref: repository.url,
    createdAt: repository.firstCommitAt ?? repository.createdAt,
  };
}

function toDynamicMediaRef(
  repository: GithubPortfolioRepository
): FaqMediaRef | null {
  const image = repository.readmeImages[0];
  if (!image) return null;

  return {
    assetKey: `github.${repository.name}.readme`,
    kind: 'project',
    src: image.url,
    alt: image.alt || `${repository.name} README preview`,
    status: 'ready',
  };
}

function buildDynamicAnswerText(
  repositories: GithubPortfolioRepository[],
  language: 'ko' | 'en'
) {
  const selected = repositories.slice(0, 3).map((repository) => repository.name);

  if (language === 'ko') {
    return [
      'AskOosu의 RAG와 포트폴리오 구조를 처음 잡던 시점의 대표 축을 세 개로 압축하면 AskOosu, Aigram, Sticks & Stones였습니다.',
      '',
      'AskOosu는 프론트엔드·백엔드·AI를 하나의 서비스 흐름으로 묶은 현재의 방향을 보여주고, Aigram은 Spring Boot와 PostgreSQL까지 직접 연결한 풀스택 경험을, Sticks & Stones는 실제 운영 중인 사이트를 새 스택으로 옮긴 마이그레이션 경험을 보여줍니다.',
      '',
      `지금은 실시간 GitHub 연동으로 확인되는 선별 프로젝트까지 함께 보면 ${selected.join(', ')} 같은 작업이 흐름의 앞쪽에 올라옵니다. 한 가지 프레임워크에 머무르기보다 문제에 따라 웹, AI, 성능, 시스템 쪽으로 구현 범위를 넓혀 온 흐름입니다. 전체적으로는 “화면을 만드는 개발”에서 시작해 “서비스 전체를 설계하고 끝까지 운영하는 개발”로 확장해 온 과정에 가깝습니다.`,
    ].join('\n');
  }

  return [
    'When the AskOosu RAG and portfolio structure was first framed, the clearest three representative anchors were AskOosu, Aigram, and Sticks & Stones.',
    '',
    'AskOosu shows his current direction: connecting frontend, backend, and AI into one product flow. Aigram demonstrates fullstack ownership with Spring Boot and PostgreSQL, while Sticks & Stones shows the practical side of migrating a real service to a new stack.',
    '',
    `Current projects surfaced through the live GitHub integration now put work such as ${selected.join(', ')} near the front of the story, extending that trajectory beyond a single framework and into a wider mix of web, AI, performance, and systems problems. The overall pattern is a move from building interfaces toward owning the structure, delivery, and operation of complete products.`,
  ].join('\n');
}

function dedupeMediaRefs(mediaRefs: FaqMediaRef[]) {
  const seen = new Set<string>();
  return mediaRefs.filter((mediaRef) => {
    if (seen.has(mediaRef.assetKey)) return false;
    seen.add(mediaRef.assetKey);
    return true;
  });
}
