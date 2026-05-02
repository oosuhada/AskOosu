import { embed, embedMany, cosineSimilarity } from 'ai';
import { openai } from '@ai-sdk/openai';
import { oosuProfile, oosuProjects } from '@/lib/oosu-profile';

type RagChunk = {
  id: string;
  title: string;
  source: 'notion' | 'static';
  text: string;
  url?: string;
};

type CachedChunks = {
  expiresAt: number;
  chunks: RagChunk[];
};

type CachedEmbeddings = {
  signature: string;
  embeddings: number[][];
};

const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const DEFAULT_TOP_K = 5;
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 10;
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

let chunkCache: CachedChunks | null = null;
let embeddingCache: CachedEmbeddings | null = null;

export async function retrievePortfolioContext(query: string) {
  const chunks = await getPortfolioChunks();
  const topK = getPositiveIntEnv('ASKOOSU_RAG_TOP_K', DEFAULT_TOP_K);
  const rankedChunks = await rankChunks({ query, chunks });

  const selectedChunks = rankedChunks
    .filter((chunk) => chunk.score > 0)
    .slice(0, topK);

  if (selectedChunks.length === 0) return '';

  const body = selectedChunks
    .map(
      ({ chunk }, index) =>
        `[${index + 1}] ${chunk.title} (${chunk.source})\n${chunk.text}${
          chunk.url ? `\nSource: ${chunk.url}` : ''
        }`
    )
    .join('\n\n');

  return `## Retrieved Portfolio Context\nUse this retrieved context when it is relevant to the visitor's question. If it conflicts with older static prompt details, prefer this context.\n\n${body}`;
}

async function getPortfolioChunks() {
  const now = Date.now();

  if (chunkCache && chunkCache.expiresAt > now) {
    return chunkCache.chunks;
  }

  const staticChunks = getStaticChunks();
  const notionChunks = await fetchNotionChunks();
  const chunks = dedupeChunks([...notionChunks, ...staticChunks]);

  chunkCache = {
    chunks,
    expiresAt: now + getPositiveIntEnv('ASKOOSU_RAG_CACHE_TTL_MS', DEFAULT_CACHE_TTL_MS),
  };
  embeddingCache = null;

  return chunks;
}

async function fetchNotionChunks() {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) return [];

  const pageInputs = getListEnv('ASKOOSU_NOTION_PAGE_IDS');
  const databaseInputs = getListEnv('ASKOOSU_NOTION_DATABASE_IDS');
  const pageIds =
    pageInputs.length > 0
      ? pageInputs.map(parseNotionId).filter(Boolean)
      : [parseNotionId(oosuProfile.notionSourceUrl)].filter(Boolean);
  const databaseIds = databaseInputs.map(parseNotionId).filter(Boolean);

  try {
    const [pageChunks, databaseChunks] = await Promise.all([
      Promise.all(pageIds.map((pageId) => fetchPageChunks({ apiKey, pageId }))),
      Promise.all(
        databaseIds.map((databaseId) =>
          fetchDatabaseChunks({ apiKey, databaseId })
        )
      ),
    ]);

    return [...pageChunks.flat(), ...databaseChunks.flat()];
  } catch (error) {
    console.warn('Notion RAG fetch failed. Falling back to static profile context.', error);
    return [];
  }
}

async function fetchPageChunks({
  apiKey,
  pageId,
}: {
  apiKey: string;
  pageId: string;
}) {
  const page = await notionRequest<NotionPage>({
    apiKey,
    path: `/pages/${pageId}`,
  });
  const title = getPageTitle(page) || 'Notion page';
  const blocks = await fetchBlockTexts({ apiKey, blockId: pageId });
  const text = normalizeText([getPagePropertiesText(page), ...blocks].join('\n'));

  return chunkLongText({
    id: `notion-page-${pageId}`,
    title,
    source: 'notion',
    text,
    url: page.url,
  });
}

async function fetchDatabaseChunks({
  apiKey,
  databaseId,
}: {
  apiKey: string;
  databaseId: string;
}) {
  const pages = await fetchDatabasePages({ apiKey, databaseId });
  const chunks = await Promise.all(
    pages.map(async (page) => {
      const title = getPageTitle(page) || 'Notion database item';
      const blocks = await fetchBlockTexts({ apiKey, blockId: page.id });
      const text = normalizeText([getPagePropertiesText(page), ...blocks].join('\n'));

      return chunkLongText({
        id: `notion-page-${page.id}`,
        title,
        source: 'notion',
        text,
        url: page.url,
      });
    })
  );

  return chunks.flat();
}

async function fetchDatabasePages({
  apiKey,
  databaseId,
}: {
  apiKey: string;
  databaseId: string;
}) {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notionRequest<{
      results: NotionPage[];
      has_more: boolean;
      next_cursor?: string;
    }>({
      apiKey,
      path: `/databases/${databaseId}/query`,
      init: {
        method: 'POST',
        body: JSON.stringify(startCursor ? { start_cursor: startCursor } : {}),
      },
    });

    pages.push(...response.results);
    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return pages;
}

async function fetchBlockTexts({
  apiKey,
  blockId,
  depth = 0,
}: {
  apiKey: string;
  blockId: string;
  depth?: number;
}) {
  if (depth > 3) return [];

  const texts: string[] = [];
  let startCursor: string | undefined;

  do {
    const searchParams = new URLSearchParams({ page_size: '100' });
    if (startCursor) searchParams.set('start_cursor', startCursor);

    const response = await notionRequest<{
      results: NotionBlock[];
      has_more: boolean;
      next_cursor?: string;
    }>({
      apiKey,
      path: `/blocks/${blockId}/children?${searchParams.toString()}`,
    });

    for (const block of response.results) {
      const blockText = getBlockText(block);
      if (blockText) texts.push(blockText);

      if (block.has_children) {
        texts.push(
          ...(await fetchBlockTexts({
            apiKey,
            blockId: block.id,
            depth: depth + 1,
          }))
        );
      }
    }

    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return texts;
}

async function notionRequest<T>({
  apiKey,
  path,
  init,
}: {
  apiKey: string;
  path: string;
  init?: RequestInit;
}) {
  const response = await fetch(`${NOTION_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Notion API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function rankChunks({
  query,
  chunks,
}: {
  query: string;
  chunks: RagChunk[];
}) {
  if (shouldUseEmbeddings()) {
    try {
      return await rankChunksWithEmbeddings({ query, chunks });
    } catch (error) {
      console.warn('Embedding RAG ranking failed. Falling back to lexical ranking.', error);
    }
  }

  return rankChunksLexically({ query, chunks });
}

async function rankChunksWithEmbeddings({
  query,
  chunks,
}: {
  query: string;
  chunks: RagChunk[];
}) {
  const signature = chunks.map((chunk) => `${chunk.id}:${chunk.text.length}`).join('|');
  const model = openai.embedding(
    process.env.ASKOOSU_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL
  );

  if (!embeddingCache || embeddingCache.signature !== signature) {
    const { embeddings } = await embedMany({
      model,
      values: chunks.map((chunk) => `${chunk.title}\n${chunk.text}`),
    });

    embeddingCache = { signature, embeddings };
  }

  const { embedding: queryEmbedding } = await embed({
    model,
    value: query,
  });

  return chunks
    .map((chunk, index) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, embeddingCache!.embeddings[index]),
    }))
    .sort((a, b) => b.score - a.score);
}

function rankChunksLexically({
  query,
  chunks,
}: {
  query: string;
  chunks: RagChunk[];
}) {
  const normalizedQuery = normalizeText(query).toLowerCase();
  const queryTokens = tokenize(normalizedQuery);

  return chunks
    .map((chunk) => {
      const haystack = `${chunk.title}\n${chunk.text}`.toLowerCase();
      const tokenScore = queryTokens.reduce((score, token) => {
        if (haystack.includes(token)) return score + 1;
        return score;
      }, 0);
      const phraseScore = normalizedQuery && haystack.includes(normalizedQuery) ? 3 : 0;

      return {
        chunk,
        score: tokenScore + phraseScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function shouldUseEmbeddings() {
  return (
    process.env.ASKOOSU_RAG_RETRIEVAL === 'embedding' &&
    Boolean(process.env.OPENAI_API_KEY)
  );
}

function getStaticChunks(): RagChunk[] {
  const profileText = normalizeText(`
Name: ${oosuProfile.name}
Title: ${oosuProfile.title}
Location: ${oosuProfile.location}
Residence: ${oosuProfile.residence}
Education: ${oosuProfile.education}
GitHub: ${oosuProfile.github}
LinkedIn: ${oosuProfile.linkedin}
Instagram: ${oosuProfile.instagram}
AskOosu Wiki: ${oosuProfile.notionWikiUrl}
Notion source: ${oosuProfile.notionSourceUrl}
  `);

  return [
    {
      id: 'static-profile',
      title: 'Oosu profile',
      source: 'static',
      text: profileText,
      url: oosuProfile.notionSourceUrl,
    },
    ...oosuProjects.map((project) => ({
      id: `static-project-${project.title}`,
      title: project.title,
      source: 'static' as const,
      text: normalizeText(
        [
          project.category,
          project.date,
          project.description,
          project.techStack.join(', '),
          project.links.map((link) => `${link.name}: ${link.url}`).join('\n'),
        ].join('\n')
      ),
      url: project.links[0]?.url,
    })),
  ];
}

function chunkLongText(chunk: RagChunk) {
  if (!chunk.text) return [];

  const maxLength = getPositiveIntEnv('ASKOOSU_RAG_CHUNK_SIZE', 1200);
  const overlap = 180;

  if (chunk.text.length <= maxLength) return [chunk];

  const chunks: RagChunk[] = [];
  let start = 0;
  let index = 1;

  while (start < chunk.text.length) {
    const end = Math.min(start + maxLength, chunk.text.length);
    chunks.push({
      ...chunk,
      id: `${chunk.id}-${index}`,
      title: `${chunk.title} ${index}`,
      text: chunk.text.slice(start, end),
    });

    if (end === chunk.text.length) break;
    start = Math.max(0, end - overlap);
    index += 1;
  }

  return chunks;
}

function dedupeChunks(chunks: RagChunk[]) {
  const seen = new Set<string>();

  return chunks.filter((chunk) => {
    const key = `${chunk.title}:${chunk.text.slice(0, 80)}`;
    if (seen.has(key) || !chunk.text.trim()) return false;
    seen.add(key);
    return true;
  });
}

function getBlockText(block: NotionBlock) {
  const value = block[block.type];

  if (!value || typeof value !== 'object') return '';

  if ('rich_text' in value && Array.isArray(value.rich_text)) {
    const text = richTextToPlainText(value.rich_text);
    return block.type.startsWith('heading') ? `# ${text}` : text;
  }

  if (block.type === 'child_page' && 'title' in value) {
    return `Page: ${String(value.title)}`;
  }

  return '';
}

function getPageTitle(page: NotionPage) {
  for (const property of Object.values(page.properties ?? {})) {
    if (property.type === 'title') {
      return richTextToPlainText((property as { title: NotionRichText[] }).title);
    }
  }

  return '';
}

function getPagePropertiesText(page: NotionPage) {
  return Object.entries(page.properties ?? {})
    .map(([name, property]) => {
      const value = getPropertyText(property);
      return value ? `${name}: ${value}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

function getPropertyText(property: NotionProperty) {
  switch (property.type) {
    case 'title':
      return richTextToPlainText((property as { title: NotionRichText[] }).title);
    case 'rich_text':
      return richTextToPlainText(
        (property as { rich_text: NotionRichText[] }).rich_text
      );
    case 'select':
      return (property as { select?: { name: string } | null }).select?.name ?? '';
    case 'multi_select':
      return (property as { multi_select: Array<{ name: string }> }).multi_select
        .map((item) => item.name)
        .join(', ');
    case 'status':
      return (property as { status?: { name: string } | null }).status?.name ?? '';
    case 'date':
      return [
        (property as { date?: { start?: string; end?: string } | null }).date
          ?.start,
        (property as { date?: { start?: string; end?: string } | null }).date
          ?.end,
      ]
        .filter(Boolean)
        .join(' - ');
    case 'url':
      return (property as { url?: string | null }).url ?? '';
    case 'email':
      return (property as { email?: string | null }).email ?? '';
    case 'phone_number':
      return (property as { phone_number?: string | null }).phone_number ?? '';
    case 'number':
      return (property as { number?: number | null }).number == null
        ? ''
        : String((property as { number?: number | null }).number);
    case 'checkbox':
      return (property as { checkbox: boolean }).checkbox ? 'true' : 'false';
    default:
      return '';
  }
}

function richTextToPlainText(richText: NotionRichText[]) {
  return richText.map((item) => item.plain_text).join('');
}

function parseNotionId(input: string) {
  const normalizedInput = input.trim();
  const matches = normalizedInput.match(/[0-9a-fA-F]{32}/g);
  const id = matches?.at(-1) ?? normalizedInput.replaceAll('-', '');

  if (!/^[0-9a-fA-F]{32}$/.test(id)) return '';

  return id.replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    '$1-$2-$3-$4-$5'
  );
}

function getListEnv(name: string) {
  return (process.env[name] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function getPositiveIntEnv(name: string, fallback: number) {
  const rawValue = process.env[name];
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function tokenize(value: string) {
  return Array.from(new Set(value.match(/[a-z0-9가-힣]{2,}/gi) ?? []));
}

type NotionRichText = {
  plain_text: string;
};

type NotionPage = {
  id: string;
  url?: string;
  properties?: Record<string, NotionProperty>;
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

type NotionProperty =
  | { type: 'title'; title: NotionRichText[] }
  | { type: 'rich_text'; rich_text: NotionRichText[] }
  | { type: 'select'; select?: { name: string } | null }
  | { type: 'multi_select'; multi_select: Array<{ name: string }> }
  | { type: 'status'; status?: { name: string } | null }
  | { type: 'date'; date?: { start?: string; end?: string } | null }
  | { type: 'url'; url?: string | null }
  | { type: 'email'; email?: string | null }
  | { type: 'phone_number'; phone_number?: string | null }
  | { type: 'number'; number?: number | null }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: string };
