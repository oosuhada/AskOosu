import {
  getGithubRagRepositories,
  type GithubPortfolioRepository,
} from '@/lib/github-portfolio';
import { githubPortfolioSnapshot } from '@/data/github-portfolio-snapshot';
import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
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
    defaultBranch: repository.defaultBranch,
    primaryLanguage: repository.primaryLanguage,
    description: repository.description,
    url: repository.url,
    homepage: repository.homepage,
    languages: repository.languages,
    readmeImages: repository.readmeImages,
    topics: repository.topics,
    stars: repository.stars,
    forks: repository.forks,
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

export async function getIndexedGithubProjects(
  limit = 12
): Promise<GithubPortfolioRepository[]> {
  if (!hasPostgresDatabaseUrl()) return getSnapshotProjects(limit);

  try {
    const pool = await getPostgresPool();
    const result = await pool.query<{
      metadata: Record<string, unknown>;
    }>(
      `
        SELECT c.metadata
        FROM rag_chunks c
        JOIN rag_sources s ON s.id = c.source_id
        WHERE s.type = 'static'
          AND s.source_key LIKE 'github:%'
          AND c.chunk_id LIKE 'github-project-%-overview'
          AND c.visibility = 'public'
        ORDER BY c.metadata->>'createdAt' DESC, c.title ASC
        LIMIT $1
      `,
      [limit]
    );

    if (result.rows.length === 0) return getSnapshotProjects(limit);
    return result.rows.map(({ metadata }) => ({
      name: getMetadataString(metadata, 'repository').split('/').at(-1) ?? '',
      fullName: getMetadataString(metadata, 'repository'),
      description: getMetadataNullableString(metadata, 'description'),
      url: getMetadataString(metadata, 'url'),
      homepage: getMetadataNullableString(metadata, 'homepage'),
      defaultBranch: getMetadataString(metadata, 'defaultBranch') || 'main',
      primaryLanguage: getMetadataNullableString(metadata, 'primaryLanguage'),
      topics: getMetadataStringArray(metadata, 'topics'),
      stars: getMetadataNumber(metadata, 'stars'),
      forks: getMetadataNumber(metadata, 'forks'),
      createdAt: getMetadataString(metadata, 'createdAt'),
      updatedAt: getMetadataString(metadata, 'updatedAt'),
      pushedAt: getMetadataString(metadata, 'pushedAt'),
      languages: getMetadataArray(metadata, 'languages') as GithubPortfolioRepository['languages'],
      readmeImages: getMetadataArray(metadata, 'readmeImages') as GithubPortfolioRepository['readmeImages'],
    }));
  } catch (error) {
    console.warn('Unable to read indexed GitHub projects; using snapshot.', error);
    return getSnapshotProjects(limit);
  }
}

function getSnapshotProjects(limit: number) {
  return [...githubPortfolioSnapshot]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit) as GithubPortfolioRepository[];
}

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'string' ? value : '';
}

function getMetadataNullableString(
  metadata: Record<string, unknown>,
  key: string
) {
  const value = metadata[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

function getMetadataArray(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return Array.isArray(value) ? value : [];
}

function getMetadataStringArray(metadata: Record<string, unknown>, key: string) {
  return getMetadataArray(metadata, key).filter(
    (value): value is string => typeof value === 'string'
  );
}

function getMetadataNumber(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
