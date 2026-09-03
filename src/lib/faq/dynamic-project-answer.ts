import type { FaqAnswer, FaqMediaRef, FaqVisualBlock } from './answers';
import {
  getGithubPortfolioRepositories,
  type GithubPortfolioRepository,
} from '@/lib/github-portfolio';

const MAX_LATEST_PROJECTS = 12;

export async function hydrateDynamicProjectAnswer(
  faqAnswer: FaqAnswer
): Promise<FaqAnswer> {
  if (faqAnswer.intentId !== 'project.representative') return faqAnswer;

  const repositories = await getGithubPortfolioRepositories();
  if (repositories.length === 0) return faqAnswer;

  const latestRepositories = repositories.slice(0, MAX_LATEST_PROJECTS);
  const latestItems = latestRepositories.map((repository) =>
    toDynamicProjectItem(repository, faqAnswer.language)
  );
  const dynamicMediaRefs = latestRepositories
    .map(toDynamicMediaRef)
    .filter((media): media is FaqMediaRef => Boolean(media));
  const visualBlocks = replaceLegacyMoreProjects(
    faqAnswer.visualBlocks,
    latestItems,
    faqAnswer.language
  );
  const githubSourceChunkIds = latestRepositories.map(
    (repository) => `github-project-${repository.name}`
  );
  const matchedEntityIds = latestRepositories.map(
    (repository) => `github:${repository.name}`
  );
  const defaultAnswer = buildDynamicAnswerText(
    latestRepositories,
    faqAnswer.language
  );

  return {
    ...faqAnswer,
    shortAnswer:
      faqAnswer.language === 'ko'
        ? `대표 프로젝트와 함께 최근 GitHub 프로젝트 ${latestRepositories.length}개를 실시간 카탈로그에서 불러왔습니다.`
        : `The curated flagship projects are followed by ${latestRepositories.length} recent GitHub projects loaded from the live portfolio catalog.`,
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
    title: language === 'ko' ? '최신 GitHub 프로젝트' : 'Latest GitHub Projects',
    dataKey: 'projects.github.latest',
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
  const updatedDate = repository.updatedAt.slice(0, 10);

  return {
    id: `github:${repository.name}`,
    title: repository.name,
    label:
      language === 'ko'
        ? `GitHub · ${updatedDate} 업데이트`
        : `GitHub · Updated ${updatedDate}`,
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
        ? 'GitHub에서 자동 수집된 최신 공개 프로젝트입니다.'
        : 'A recent public project collected automatically from GitHub.'),
    image: imageKey,
    tags: repository.topics.slice(0, 4),
    languages: repository.languages.slice(0, 6).map((item) => ({
      name: item.name,
      percentage: item.percentage,
    })),
    href: repository.homepage ?? repository.url,
    githubHref: repository.url,
    updatedAt: repository.updatedAt,
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
  const newest = repositories.slice(0, 3).map((repository) => repository.name);

  if (language === 'ko') {
    return [
      '대표 프로젝트는 여전히 AskOosu, Aigram, Sticks & Stones로 큐레이션해서 보여줍니다.',
      '',
      `그 아래에는 GitHub에서 자동 수집한 최신 프로젝트가 이어집니다. 현재 최근 항목은 ${newest.join(', ')}이며, 각 카드의 언어 비율은 GitHub Linguist byte 통계를 사용합니다. README에 실제 스크린샷이나 데모 이미지가 있으면 카드 미리보기에도 자동 반영됩니다.`,
      '',
      '새 공개 저장소를 올리거나 기존 저장소를 업데이트하면 이 목록과 AskOosu의 프로젝트 근거가 주기적으로 갱신됩니다.',
    ].join('\n');
  }

  return [
    'AskOosu, Aigram, and Sticks & Stones remain intentionally curated as the flagship projects.',
    '',
    `Below them, the project rail now comes from the live GitHub catalog. The newest entries currently include ${newest.join(', ')}. Each card shows GitHub Linguist language percentages, and README screenshots or demo images are used automatically when available.`,
    '',
    'New public repositories and repository updates flow into this view and the AskOosu project evidence on the refresh cycle.',
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
