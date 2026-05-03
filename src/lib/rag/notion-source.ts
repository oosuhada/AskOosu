import { oosuProfile } from '@/lib/oosu-profile';
import { getListEnv, getNotionVersion, NOTION_API_BASE_URL } from './config';
import { chunkLongText, normalizeText, parseNotionId } from './text';
import type {
  NotionBlock,
  NotionPage,
  NotionProperty,
  NotionRichText,
  RagChunk,
} from './types';

export async function fetchNotionChunks() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return [];

  const pageInputs = getListEnv('ASKOOSU_NOTION_PAGE_IDS');
  const databaseInputs = getListEnv('ASKOOSU_NOTION_DATABASE_IDS');
  const dataSourceInputs = getListEnv('ASKOOSU_NOTION_DATA_SOURCE_IDS');
  const pageIds =
    pageInputs.length > 0
      ? pageInputs.map(parseNotionId).filter(Boolean)
      : [parseNotionId(oosuProfile.notionSourceUrl)].filter(Boolean);
  const databaseIds = databaseInputs.map(parseNotionId).filter(Boolean);
  const dataSourceIds = dataSourceInputs.map(parseNotionId).filter(Boolean);

  const chunkGroups = await Promise.all([
    ...pageIds.map((pageId) =>
      safelyFetchNotionChunks(() => fetchPageChunks({ apiKey, pageId }))
    ),
    ...databaseIds.map((databaseId) =>
      safelyFetchNotionChunks(() => fetchDatabaseChunks({ apiKey, databaseId }))
    ),
    ...dataSourceIds.map((dataSourceId) =>
      safelyFetchNotionChunks(() =>
        fetchDataSourceChunks({ apiKey, dataSourceId })
      )
    ),
  ]);

  return chunkGroups.flat();
}

async function safelyFetchNotionChunks(fetcher: () => Promise<RagChunk[]>) {
  try {
    return await fetcher();
  } catch (error) {
    console.warn(
      'Notion RAG source fetch failed. Continuing with available sources.',
      error
    );
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
  const text = normalizeText(
    [getPagePropertiesText(page), ...blocks].join('\n')
  );

  return chunkLongText({
    id: `notion-page-${pageId}`,
    title,
    source: 'notion',
    text,
    url: page.url,
    metadata: {
      notionPageId: pageId,
      sourceKind: 'page',
    },
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
  return fetchPagesAsChunks({
    apiKey,
    pages,
    sourceKind: 'database',
    parentId: databaseId,
  });
}

async function fetchDataSourceChunks({
  apiKey,
  dataSourceId,
}: {
  apiKey: string;
  dataSourceId: string;
}) {
  const pages = await fetchDataSourcePages({ apiKey, dataSourceId });
  return fetchPagesAsChunks({
    apiKey,
    pages,
    sourceKind: 'data_source',
    parentId: dataSourceId,
  });
}

async function fetchPagesAsChunks({
  apiKey,
  pages,
  sourceKind,
  parentId,
}: {
  apiKey: string;
  pages: NotionPage[];
  sourceKind: string;
  parentId: string;
}) {
  const chunks = await Promise.all(
    pages.map(async (page) => {
      const title = getPageTitle(page) || 'Notion database item';
      const blocks = await fetchBlockTexts({ apiKey, blockId: page.id });
      const text = normalizeText(
        [getPagePropertiesText(page), ...blocks].join('\n')
      );

      return chunkLongText({
        id: `notion-page-${page.id}`,
        title,
        source: 'notion',
        text,
        url: page.url,
        metadata: {
          notionPageId: page.id,
          sourceKind,
          parentId,
        },
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
  return fetchPaginatedNotionPages({
    apiKey,
    path: `/databases/${databaseId}/query`,
  });
}

async function fetchDataSourcePages({
  apiKey,
  dataSourceId,
}: {
  apiKey: string;
  dataSourceId: string;
}) {
  return fetchPaginatedNotionPages({
    apiKey,
    path: `/data_sources/${dataSourceId}/query`,
    baseBody: { result_type: 'page' },
  });
}

async function fetchPaginatedNotionPages({
  apiKey,
  path,
  baseBody = {},
}: {
  apiKey: string;
  path: string;
  baseBody?: Record<string, unknown>;
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
      path,
      init: {
        method: 'POST',
        body: JSON.stringify({
          ...baseBody,
          ...(startCursor ? { start_cursor: startCursor } : {}),
        }),
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
  if (depth > 4) return [];

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
      'Notion-Version': getNotionVersion(),
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    throw new Error(
      `Notion API request failed: ${response.status} ${responseText}`
    );
  }

  return (await response.json()) as T;
}

function getBlockText(block: NotionBlock) {
  const value = block[block.type];

  if (!value || typeof value !== 'object') return '';

  if ('rich_text' in value && Array.isArray(value.rich_text)) {
    const text = richTextToPlainText(value.rich_text as NotionRichText[]);
    if (!text) return '';

    if (block.type.startsWith('heading')) return `# ${text}`;
    if (block.type === 'to_do' && 'checked' in value) {
      return `${value.checked ? '[x]' : '[ ]'} ${text}`;
    }
    return text;
  }

  if (block.type === 'child_page' && 'title' in value) {
    return `Page: ${String(value.title)}`;
  }

  if ('url' in value && typeof value.url === 'string') {
    return value.url;
  }

  if ('caption' in value && Array.isArray(value.caption)) {
    return richTextToPlainText(value.caption as NotionRichText[]);
  }

  return '';
}

function getPageTitle(page: NotionPage) {
  for (const property of Object.values(page.properties ?? {})) {
    if (property.type === 'title') {
      return richTextToPlainText(
        (property as { title: NotionRichText[] }).title
      );
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
      return richTextToPlainText(
        (property as { title: NotionRichText[] }).title
      );
    case 'rich_text':
      return richTextToPlainText(
        (property as { rich_text: NotionRichText[] }).rich_text
      );
    case 'select':
      return (
        (property as { select?: { name: string } | null }).select?.name ?? ''
      );
    case 'multi_select':
      return (
        property as { multi_select: Array<{ name: string }> }
      ).multi_select
        .map((item) => item.name)
        .join(', ');
    case 'status':
      return (
        (property as { status?: { name: string } | null }).status?.name ?? ''
      );
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
    case 'relation':
      return (property as { relation: Array<{ id: string }> }).relation
        .map((item) => item.id)
        .join(', ');
    case 'people':
      return (property as { people: Array<{ name?: string | null }> }).people
        .map((person) => person.name)
        .filter(Boolean)
        .join(', ');
    case 'files':
      return (
        property as {
          files: Array<{
            name?: string;
            file?: { url?: string };
            external?: { url?: string };
          }>;
        }
      ).files
        .map((file) => file.name || file.file?.url || file.external?.url)
        .filter(Boolean)
        .join(', ');
    default:
      return '';
  }
}

function richTextToPlainText(richText: NotionRichText[]) {
  return richText.map((item) => item.plain_text).join('');
}
