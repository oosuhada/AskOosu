import { githubPortfolioSnapshot } from '@/data/github-portfolio-snapshot';

const GITHUB_OWNER = 'oosuhada';
const DEFAULT_REPOSITORY_LIMIT = 12;
const MAX_REPOSITORY_LIMIT = 45;
const GITHUB_REVALIDATE_SECONDS = 60 * 60;
const MAX_README_EVIDENCE_CHARS = 12_000;

type GithubRepositoryApi = {
  name: string;
  full_name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  private: boolean;
  default_branch: string;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
};

type GithubLanguagesApi = Record<string, number>;

type GithubCommitApi = {
  commit: {
    author: {
      date: string;
    };
  };
};

type GithubRepositoryWithStart = {
  repository: GithubRepositoryApi;
  firstCommitAt: string | null;
};

export type GithubLanguageShare = {
  name: string;
  bytes: number;
  percentage: number;
};

export type GithubReadmeImage = {
  url: string;
  alt: string;
};

export type GithubPortfolioRepository = {
  name: string;
  fullName: string;
  url: string;
  homepage: string | null;
  description: string | null;
  defaultBranch: string;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  createdAt: string;
  firstCommitAt: string | null;
  updatedAt: string;
  pushedAt: string;
  languages: GithubLanguageShare[];
  readmeImages: GithubReadmeImage[];
};

export type GithubRepositoryEvidence = {
  name: string;
  url: string;
  homepage: string | null;
  description: string | null;
  defaultBranch: string;
  createdAt: string | null;
  firstCommitAt: string | null;
  languages: GithubLanguageShare[];
  readmeText: string | null;
};

export type GithubRepositorySyncManifest = {
  live: boolean;
  repositories: Array<{
    name: string;
    fullName: string;
    defaultBranch: string;
    createdAt: string;
    firstCommitAt: string | null;
    updatedAt: string;
    pushedAt: string;
  }>;
};

export type GithubRagRepository = GithubPortfolioRepository & {
  readmeText: string | null;
};

export async function getGithubPortfolioRepositories(): Promise<
  GithubPortfolioRepository[]
> {
  const limit = getRepositoryLimit();

  try {
    const repositories = await fetchGithubJson<GithubRepositoryApi[]>(
      `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=100&sort=created&direction=desc&type=owner`
    );
    const rankedCandidates = await getFirstCommitRankedCandidates(repositories);
    return Promise.all(
      rankedCandidates
        .slice(0, limit)
        .map((candidate) =>
          enrichRepository(candidate.repository, candidate.firstCommitAt)
        )
    );
  } catch (error) {
    console.warn('Unable to refresh GitHub portfolio repositories.', error);
    return [...githubPortfolioSnapshot]
      .sort(compareEnrichedRepositories)
      .slice(0, limit);
  }
}

export async function getGithubRepositorySyncManifest(): Promise<GithubRepositorySyncManifest> {
  const limit = getRepositoryLimit();

  try {
    const repositories = await fetchGithubJson<GithubRepositoryApi[]>(
      `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=100&sort=created&direction=desc&type=owner`
    );
    const rankedCandidates = await getFirstCommitRankedCandidates(repositories);
    return {
      live: true,
      repositories: rankedCandidates
        .slice(0, limit)
        .map(({ repository, firstCommitAt }) => ({
          name: repository.name,
          fullName: repository.full_name,
          defaultBranch: repository.default_branch,
          createdAt: repository.created_at,
          firstCommitAt,
          updatedAt: repository.updated_at,
          pushedAt: repository.pushed_at,
        })),
    };
  } catch (error) {
    console.warn('Unable to refresh GitHub sync manifest.', error);
    return {
      live: false,
      repositories: [...githubPortfolioSnapshot]
        .sort(compareEnrichedRepositories)
        .slice(0, limit)
        .map((repository) => ({
          name: repository.name,
          fullName: repository.fullName,
          defaultBranch: repository.defaultBranch,
          createdAt: repository.createdAt,
          firstCommitAt: repository.firstCommitAt,
          updatedAt: repository.updatedAt,
          pushedAt: repository.pushedAt,
        })),
    };
  }
}

export async function getGithubRagRepositories(): Promise<GithubRagRepository[]> {
  const limit = getRepositoryLimit();

  try {
    const repositories = await fetchGithubJson<GithubRepositoryApi[]>(
      `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=100&sort=created&direction=desc&type=owner`
    );
    const rankedCandidates = await getFirstCommitRankedCandidates(repositories);
    return Promise.all(
      rankedCandidates
        .slice(0, limit)
        .map((candidate) =>
          enrichRepositoryForRag(candidate.repository, candidate.firstCommitAt)
        )
    );
  } catch (error) {
    console.warn('Unable to refresh live GitHub RAG repositories.', error);
    const repositories = [...githubPortfolioSnapshot]
      .sort(compareEnrichedRepositories)
      .slice(0, limit);

    return Promise.all(
      repositories.map(async (repository) => {
        const readme = await fetchRepositoryReadmeByName(repository.name, [
          repository.defaultBranch,
          'main',
          'master',
        ]);
        return {
          ...repository,
          readmeText: readme ? normalizeReadmeEvidence(readme) : null,
        };
      })
    );
  }
}

export async function getGithubRepositoryEvidence(
  repositoryName: string
): Promise<GithubRepositoryEvidence | null> {
  const normalizedName = repositoryName.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(normalizedName)) {
    return null;
  }

  const snapshot = githubPortfolioSnapshot.find(
    (repository) => repository.name.toLowerCase() === normalizedName.toLowerCase()
  );
  let repository: GithubRepositoryApi | null = null;

  try {
    repository = await fetchGithubJson<GithubRepositoryApi>(
      `https://api.github.com/repos/${GITHUB_OWNER}/${encodeURIComponent(normalizedName)}`
    );
  } catch {
    // The public GitHub API may be rate-limited. README retrieval below uses
    // raw.githubusercontent.com so project-specific evidence still works.
  }

  const defaultBranch =
    repository?.default_branch ?? snapshot?.defaultBranch ?? 'main';
  const readme = await fetchRepositoryReadmeByName(normalizedName, [
    defaultBranch,
    snapshot?.defaultBranch,
    'main',
    'master',
  ]);
  const firstCommitAt = repository
    ? await fetchRepositoryFirstCommitAt(repository)
    : snapshot?.firstCommitAt ?? null;

  let languages = snapshot?.languages ?? [];
  if (repository) {
    try {
      languages = toLanguageShares(
        await fetchGithubJson<GithubLanguagesApi>(
          `https://api.github.com/repos/${GITHUB_OWNER}/${encodeURIComponent(normalizedName)}/languages`
        )
      );
    } catch {
      if (languages.length === 0 && repository.language) {
        languages = [
          { name: repository.language, bytes: 0, percentage: 100 },
        ];
      }
    }
  }

  if (!repository && !snapshot && !readme) return null;

  return {
    name: repository?.name ?? snapshot?.name ?? normalizedName,
    url:
      repository?.html_url ??
      snapshot?.url ??
      `https://github.com/${GITHUB_OWNER}/${encodeURIComponent(normalizedName)}`,
    homepage:
      normalizeHomepage(repository?.homepage ?? snapshot?.homepage ?? null),
    description: repository?.description ?? snapshot?.description ?? null,
    defaultBranch,
    createdAt: repository?.created_at ?? snapshot?.createdAt ?? null,
    firstCommitAt,
    languages,
    readmeText: readme ? normalizeReadmeEvidence(readme) : null,
  };
}

async function enrichRepository(
  repository: GithubRepositoryApi,
  knownFirstCommitAt?: string | null
): Promise<GithubPortfolioRepository> {
  const [languages, readme, firstCommitAt] = await Promise.all([
    fetchRepositoryLanguages(repository),
    fetchRepositoryReadme(repository),
    knownFirstCommitAt ?? fetchRepositoryFirstCommitAt(repository),
  ]);

  return {
    name: repository.name,
    fullName: repository.full_name,
    url: repository.html_url,
    homepage: normalizeHomepage(repository.homepage),
    description: repository.description,
    defaultBranch: repository.default_branch,
    primaryLanguage: repository.language,
    topics: repository.topics ?? [],
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    createdAt: repository.created_at,
    firstCommitAt,
    updatedAt: repository.updated_at,
    pushedAt: repository.pushed_at,
    languages,
    readmeImages: readme
      ? extractReadmeImages({
          markdown: readme,
          repository: repository.name,
          defaultBranch: repository.default_branch,
        })
      : [],
  };
}

async function enrichRepositoryForRag(
  repository: GithubRepositoryApi,
  knownFirstCommitAt?: string | null
): Promise<GithubRagRepository> {
  const [languages, readme, firstCommitAt] = await Promise.all([
    fetchRepositoryLanguages(repository),
    fetchRepositoryReadme(repository),
    knownFirstCommitAt ?? fetchRepositoryFirstCommitAt(repository),
  ]);

  return {
    name: repository.name,
    fullName: repository.full_name,
    url: repository.html_url,
    homepage: normalizeHomepage(repository.homepage),
    description: repository.description,
    defaultBranch: repository.default_branch,
    primaryLanguage: repository.language,
    topics: repository.topics ?? [],
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    createdAt: repository.created_at,
    firstCommitAt,
    updatedAt: repository.updated_at,
    pushedAt: repository.pushed_at,
    languages,
    readmeImages: readme
      ? extractReadmeImages({
          markdown: readme,
          repository: repository.name,
          defaultBranch: repository.default_branch,
        })
      : [],
    readmeText: readme ? normalizeReadmeEvidence(readme) : null,
  };
}

async function fetchRepositoryFirstCommitAt(repository: GithubRepositoryApi) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${encodeURIComponent(
    repository.name
  )}/commits?sha=${encodeURIComponent(repository.default_branch)}&per_page=1`;

  try {
    const response = await fetchGithubResponse(url);
    const firstPage = (await response.json()) as GithubCommitApi[];
    const lastPageUrl = getLastPageUrl(response.headers.get('link'));
    if (!lastPageUrl) return firstPage[0]?.commit.author.date ?? repository.created_at;

    const lastPageResponse = await fetchGithubResponse(lastPageUrl);
    const lastPage = (await lastPageResponse.json()) as GithubCommitApi[];
    return lastPage.at(-1)?.commit.author.date ?? repository.created_at;
  } catch (error) {
    console.warn(
      `Unable to load first commit for ${repository.full_name}.`,
      error
    );
    return repository.created_at;
  }
}

async function fetchRepositoryLanguages(repository: GithubRepositoryApi) {
  try {
    const languages = await fetchGithubJson<GithubLanguagesApi>(
      `https://api.github.com/repos/${GITHUB_OWNER}/${encodeURIComponent(repository.name)}/languages`
    );
    return toLanguageShares(languages);
  } catch (error) {
    console.warn(
      `Unable to load languages for ${repository.full_name}.`,
      error
    );
    return repository.language
      ? [{ name: repository.language, bytes: 0, percentage: 100 }]
      : [];
  }
}

async function fetchRepositoryReadme(repository: GithubRepositoryApi) {
  return fetchRepositoryReadmeByName(repository.name, [
    repository.default_branch,
  ]);
}

async function fetchRepositoryReadmeByName(
  repositoryName: string,
  branches: Array<string | null | undefined>
) {
  const encodedRepository = encodeURIComponent(repositoryName);
  const candidates = ['README.md', 'README.MD', 'readme.md'];
  const uniqueBranches = Array.from(
    new Set(branches.map((branch) => branch?.trim()).filter(Boolean))
  ) as string[];

  for (const branch of uniqueBranches) {
    const encodedBranch = encodeURIComponent(branch);
    for (const filename of candidates) {
      const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${encodedRepository}/${encodedBranch}/${filename}`;
      try {
        const response = await fetch(url, {
          next: { revalidate: GITHUB_REVALIDATE_SECONDS },
        });
        if (response.ok) return response.text();
      } catch {
        // Try the next branch/README filename.
      }
    }
  }

  return null;
}

async function fetchGithubJson<T>(url: string): Promise<T> {
  const response = await fetchGithubResponse(url);
  return (await response.json()) as T;
}

async function fetchGithubResponse(url: string) {
  const token = (
    process.env.GITHUB_API_TOKEN ?? process.env.GITHUB_TOKEN
  )?.trim();
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: GITHUB_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${url}`);
  }

  return response;
}

async function getFirstCommitRankedCandidates(
  repositories: GithubRepositoryApi[]
): Promise<GithubRepositoryWithStart[]> {
  const candidates = repositories
    .filter(isPortfolioCandidate)
    .sort(compareRepositories)
    .slice(0, MAX_REPOSITORY_LIMIT);

  const withStartDates = await Promise.all(
    candidates.map(async (repository) => ({
      repository,
      firstCommitAt: await fetchRepositoryFirstCommitAt(repository),
    }))
  );

  return withStartDates.sort(compareRepositoryStarts);
}

function isPortfolioCandidate(repository: GithubRepositoryApi) {
  if (
    repository.private ||
    repository.fork ||
    repository.archived ||
    repository.disabled
  ) {
    return false;
  }

  if (repository.name.toLowerCase() === GITHUB_OWNER) return false;
  return !(repository.topics ?? []).includes('portfolio-hidden');
}

function compareRepositories(
  left: GithubRepositoryApi,
  right: GithubRepositoryApi
) {
  const createdOrder = right.created_at.localeCompare(left.created_at);
  if (createdOrder !== 0) return createdOrder;
  return right.updated_at.localeCompare(left.updated_at);
}

function compareRepositoryStarts(
  left: GithubRepositoryWithStart,
  right: GithubRepositoryWithStart
) {
  const leftStartedAt = left.firstCommitAt || left.repository.created_at;
  const rightStartedAt = right.firstCommitAt || right.repository.created_at;
  const startedOrder = rightStartedAt.localeCompare(leftStartedAt);
  if (startedOrder !== 0) return startedOrder;
  return right.repository.updated_at.localeCompare(left.repository.updated_at);
}

function compareEnrichedRepositories(
  left: Pick<GithubPortfolioRepository, 'createdAt' | 'firstCommitAt' | 'updatedAt'>,
  right: Pick<GithubPortfolioRepository, 'createdAt' | 'firstCommitAt' | 'updatedAt'>
) {
  const leftStartedAt = left.firstCommitAt || left.createdAt;
  const rightStartedAt = right.firstCommitAt || right.createdAt;
  const startedOrder = rightStartedAt.localeCompare(leftStartedAt);
  if (startedOrder !== 0) return startedOrder;
  return right.updatedAt.localeCompare(left.updatedAt);
}

function getLastPageUrl(linkHeader: string | null) {
  if (!linkHeader) return null;
  const lastLink = linkHeader
    .split(',')
    .map((part) => part.trim())
    .find((part) => /rel="last"/.test(part));
  return lastLink?.match(/<([^>]+)>/)?.[1] ?? null;
}

function getRepositoryLimit() {
  const parsed = Number.parseInt(
    process.env.GITHUB_PORTFOLIO_REPO_LIMIT ?? '',
    10
  );
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_REPOSITORY_LIMIT;
  return Math.min(parsed, MAX_REPOSITORY_LIMIT);
}

function normalizeHomepage(homepage: string | null) {
  const trimmed = homepage?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function toLanguageShares(
  languages: GithubLanguagesApi
): GithubLanguageShare[] {
  const entries = Object.entries(languages).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) return [];

  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

function extractReadmeImages({
  markdown,
  repository,
  defaultBranch,
}: {
  markdown: string;
  repository: string;
  defaultBranch: string;
}): GithubReadmeImage[] {
  const images: GithubReadmeImage[] = [];
  const seen = new Set<string>();

  const pushImage = (source: string, alt: string) => {
    const normalizedUrl = resolveReadmeImageUrl({
      source,
      repository,
      defaultBranch,
    });
    if (!normalizedUrl || isBadgeLikeImage(normalizedUrl, alt)) return;
    if (seen.has(normalizedUrl)) return;
    seen.add(normalizedUrl);
    images.push({
      url: normalizedUrl,
      alt: alt.trim() || `${repository} README image`,
    });
  };

  const markdownImagePattern =
    /!\[([^\]]*)\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/g;
  for (const match of markdown.matchAll(markdownImagePattern)) {
    pushImage(match[2] ?? match[3] ?? '', match[1] ?? '');
  }

  const htmlImagePattern =
    /<img\b[^>]*?src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  for (const match of markdown.matchAll(htmlImagePattern)) {
    pushImage(match[1] ?? '', match[2] ?? '');
  }

  return images.sort(compareReadmeImages).slice(0, 3);
}

function resolveReadmeImageUrl({
  source,
  repository,
  defaultBranch,
}: {
  source: string;
  repository: string;
  defaultBranch: string;
}) {
  const trimmed = source.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed || trimmed.startsWith('data:')) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('#')) return null;

  const cleanPath = trimmed
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .split('#')[0]
    .split('?')[0];
  if (!cleanPath) return null;

  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${encodeURIComponent(repository)}/${encodeURIComponent(defaultBranch)}/${cleanPath
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

function isBadgeLikeImage(url: string, alt: string) {
  const value = `${url} ${alt}`.toLowerCase();
  return /shields\.io|badge|build status|coverage|codecov|coveralls|actions\/workflows|license\.svg|npm version|pypi/.test(
    value
  );
}

function compareReadmeImages(
  left: GithubReadmeImage,
  right: GithubReadmeImage
) {
  return imagePriority(right) - imagePriority(left);
}

function imagePriority(image: GithubReadmeImage) {
  const value = `${image.alt} ${image.url}`.toLowerCase();
  if (/screenshot|preview|demo|cover|hero|architecture/.test(value)) return 3;
  if (/\.gif(?:$|\?)/.test(value)) return 2;
  if (/image|screen|ui|dashboard|app/.test(value)) return 1;
  return 0;
}

function normalizeReadmeEvidence(markdown: string) {
  return markdown
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<picture\b[\s\S]*?<\/picture>/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_README_EVIDENCE_CHARS);
}
