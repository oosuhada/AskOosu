import { getGithubRagRepositories } from '@/lib/github-portfolio';
import { chunkLongText, createRagChunk, normalizeText } from './text';
import type { RagChunk } from './types';

const README_HEADING_PATTERN = /^(#{1,4})\s+(.+)$/gm;

export async function fetchGithubRagChunks() {
  const repositories = await getGithubRagRepositories();
  const chunks = repositories.flatMap(buildRepositoryChunks);

  return {
    repositories,
    chunks,
    sourceKeys: repositories.map((repository) =>
      getGithubSourceKey(repository.fullName)
    ),
  };
}

function buildRepositoryChunks(
  repository: Awaited<ReturnType<typeof getGithubRagRepositories>>[number]
): RagChunk[] {
  const sourceKey = getGithubSourceKey(repository.fullName);
  const baseMetadata = {
    sourceKey,
    sourceTitle: `GitHub ${repository.fullName}`,
    sourceKind: 'github_project',
    entityId: `github:${repository.name}`,
    repository: repository.fullName,
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    pushedAt: repository.pushedAt,
    freshness: 'current',
    visibility: 'public',
  } as const;
  const overview = normalizeText(
    [
      repository.description ?? '',
      `GitHub: ${repository.url}`,
      repository.homepage ? `Live: ${repository.homepage}` : '',
      `Created: ${repository.createdAt}`,
      `Updated: ${repository.updatedAt}`,
      `Languages: ${repository.languages
        .map((language) => `${language.name} ${language.percentage}%`)
        .join(', ')}`,
      `Topics: ${repository.topics.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n')
  );
  const chunks: RagChunk[] = [
    createRagChunk({
      id: `github-project-${repository.name}-overview`,
      title: `${repository.name} overview`,
      source: 'static',
      text: overview,
      url: repository.url,
      metadata: {
        ...baseMetadata,
        sectionPath: ['GitHub', repository.name, 'Overview'],
      },
    }),
  ];

  if (!repository.readmeText?.trim()) return chunks;

  const readmeSections = splitReadmeSections(repository.readmeText);
  for (const [index, section] of readmeSections.entries()) {
    chunks.push(
      ...chunkLongText({
        id: `github-project-${repository.name}-readme-${index + 1}`,
        title: `${repository.name} README · ${section.title}`,
        source: 'static',
        text: section.text,
        url: repository.url,
        metadata: {
          ...baseMetadata,
          sectionPath: ['GitHub', repository.name, 'README', section.title],
          readmeSection: section.title,
        },
      })
    );
  }

  return chunks;
}

function splitReadmeSections(markdown: string) {
  const matches = Array.from(markdown.matchAll(README_HEADING_PATTERN));
  if (matches.length === 0) {
    return [{ title: 'README', text: markdown }];
  }

  const sections: Array<{ title: string; text: string }> = [];
  const preamble = markdown.slice(0, matches[0].index ?? 0).trim();
  if (preamble) sections.push({ title: 'Introduction', text: preamble });

  for (const [index, match] of matches.entries()) {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    const title = (match[2] ?? 'README').replace(/[#`*_]/g, '').trim();
    const text = markdown.slice(start, end).trim();
    if (text) sections.push({ title: title || 'README', text });
  }

  return sections;
}

export function getGithubSourceKey(fullName: string) {
  return `github:${fullName}`;
}
