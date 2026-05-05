import { getListEnv, getNotionVersion, NOTION_API_BASE_URL } from './config';
import { parseNotionId } from './text';
import type { NotionPage, NotionRichText } from './types';

const DEFAULT_MAX_DEPTH = 24;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 600;

export type NotionRagSection = {
  id: string;
  title: string;
  level: number;
  sectionPath: string[];
  text: string;
  textLength: number;
  blockCount: number;
  blockIds: string[];
};

export type NotionRagSyncResult = {
  ok: true;
  pageId: string;
  pageUrl?: string;
  pageTitle: string;
  blockCount: number;
  textLength: number;
  sections: NotionRagSection[];
  warnings: string[];
};

export type NotionRagConfig =
  | {
      ok: true;
      apiKey: string;
      pageId: string;
      pageIds: string[];
      warnings: string[];
    }
  | {
      ok: false;
      status: number;
      error: string;
      warnings: string[];
    };

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

type NormalizedBlock = {
  id: string;
  type: string;
  depth: number;
  text: string;
};

type NotionListResponse<T> = {
  results: T[];
  has_more: boolean;
  next_cursor?: string | null;
};

type NotionRequestErrorOptions = {
  status: number;
  message: string;
  retryable: boolean;
};

export class NotionRequestError extends Error {
  status: number;
  retryable: boolean;

  constructor({ status, message, retryable }: NotionRequestErrorOptions) {
    super(message);
    this.name = 'NotionRequestError';
    this.status = status;
    this.retryable = retryable;
  }
}

export function getNotionRagConfig(): NotionRagConfig {
  const warnings: string[] = [];
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const rawPageId = process.env.NOTION_PAGE_ID?.trim();
  const extraPageIds = getListEnv('ASKOOSU_NOTION_PAGE_IDS');
  const pageIds = uniqueNotionPageIds([rawPageId, ...extraPageIds]);
  const pageId = pageIds[0] ?? '';

  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error: 'NOTION_API_KEY is required for RAG sync.',
      warnings,
    };
  }

  if (!pageId) {
    return {
      ok: false,
      status: 400,
      error:
        'NOTION_PAGE_ID or ASKOOSU_NOTION_PAGE_IDS is required for RAG sync.',
      warnings,
    };
  }

  if (!rawPageId && pageIds.length > 0) {
    warnings.push(
      'Using ASKOOSU_NOTION_PAGE_IDS because NOTION_PAGE_ID is not set.'
    );
  }

  if (extraPageIds.length > 0 && pageIds.length > 1) {
    warnings.push(
      'Syncing multiple Notion page ids from NOTION_PAGE_ID and ASKOOSU_NOTION_PAGE_IDS.'
    );
  }

  return {
    ok: true,
    apiKey,
    pageId,
    pageIds,
    warnings,
  };
}

function uniqueNotionPageIds(rawValues: Array<string | undefined>) {
  const ids: string[] = [];

  for (const rawValue of rawValues) {
    if (!rawValue) continue;
    const pageId = parseNotionId(rawValue);
    if (pageId && !ids.includes(pageId)) ids.push(pageId);
  }

  return ids;
}

export async function fetchNotionRagPage({
  apiKey,
  pageId,
  maxDepth = DEFAULT_MAX_DEPTH,
  initialWarnings = [],
}: {
  apiKey: string;
  pageId: string;
  maxDepth?: number;
  initialWarnings?: string[];
}): Promise<NotionRagSyncResult> {
  const warnings = initialWarnings;
  const skippedBlockTypes = new Set<string>();
  const client = new NotionApiClient({ apiKey, warnings });
  const page = await client.request<NotionPage>(`/pages/${pageId}`);
  const pageTitle = getPageTitle(page) || 'Notion page';
  const blocks = await fetchBlockTree({
    client,
    blockId: pageId,
    depth: 0,
    maxDepth,
    visitedBlockIds: new Set<string>(),
    skippedBlockTypes,
    warnings,
  });

  for (const type of skippedBlockTypes) {
    warnings.push(`Skipped unsupported Notion block type: ${type}.`);
  }

  const sections = buildSections({
    blocks,
    pageTitle,
  });
  const fullText = normalizeSectionText(
    sections.map((section) => section.text).join('\n\n')
  );

  return {
    ok: true,
    pageId,
    pageUrl: page.url,
    pageTitle,
    blockCount: blocks.length,
    textLength: fullText.length,
    sections,
    warnings,
  };
}

class NotionApiClient {
  private apiKey: string;
  private warnings: string[];

  constructor({ apiKey, warnings }: { apiKey: string; warnings: string[] }) {
    this.apiKey = apiKey;
    this.warnings = warnings;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${this.apiKey}`);
      headers.set('Content-Type', 'application/json');
      headers.set('Notion-Version', getNotionVersion());

      const response = await fetch(`${NOTION_API_BASE_URL}${path}`, {
        ...init,
        headers,
      });

      if (response.ok) return (await response.json()) as T;

      const retryable = isRetryableStatus(response.status);
      if (!retryable || attempt === MAX_RETRY_ATTEMPTS) {
        throw new NotionRequestError({
          status: response.status,
          retryable,
          message: getSafeNotionErrorMessage(response.status),
        });
      }

      const retryDelayMs = getRetryDelayMs(response, attempt);
      this.warnings.push(
        `Notion request returned ${response.status}; retrying in ${retryDelayMs}ms.`
      );
      await sleep(retryDelayMs);
    }

    throw new NotionRequestError({
      status: 500,
      retryable: true,
      message: 'Notion request failed after retries.',
    });
  }
}

async function fetchBlockTree({
  client,
  blockId,
  depth,
  maxDepth,
  visitedBlockIds,
  skippedBlockTypes,
  warnings,
}: {
  client: NotionApiClient;
  blockId: string;
  depth: number;
  maxDepth: number;
  visitedBlockIds: Set<string>;
  skippedBlockTypes: Set<string>;
  warnings: string[];
}): Promise<NormalizedBlock[]> {
  if (depth > maxDepth) {
    warnings.push(`Skipped Notion children deeper than max depth ${maxDepth}.`);
    return [];
  }

  if (visitedBlockIds.has(blockId)) {
    warnings.push('Skipped a Notion block that was already visited.');
    return [];
  }

  visitedBlockIds.add(blockId);

  const blocks: NormalizedBlock[] = [];
  let startCursor: string | undefined;

  do {
    const searchParams = new URLSearchParams({ page_size: '100' });
    if (startCursor) searchParams.set('start_cursor', startCursor);

    const response = await client.request<NotionListResponse<NotionBlock>>(
      `/blocks/${blockId}/children?${searchParams.toString()}`
    );

    for (const block of response.results) {
      const text = normalizeBlockText(block, skippedBlockTypes);
      blocks.push({
        id: block.id,
        type: block.type,
        depth,
        text,
      });

      if (block.has_children) {
        blocks.push(
          ...(await fetchBlockTree({
            client,
            blockId: block.id,
            depth: depth + 1,
            maxDepth,
            visitedBlockIds,
            skippedBlockTypes,
            warnings,
          }))
        );
      }
    }

    startCursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (startCursor);

  return blocks;
}

function normalizeBlockText(
  block: NotionBlock,
  skippedBlockTypes: Set<string>
) {
  switch (block.type) {
    case 'heading_1':
      return headingText(block, 1);
    case 'heading_2':
      return headingText(block, 2);
    case 'heading_3':
      return headingText(block, 3);
    case 'paragraph':
      return richTextBlockText(block);
    case 'bulleted_list_item':
      return prefixText('- ', richTextBlockText(block));
    case 'numbered_list_item':
      return prefixText('1. ', richTextBlockText(block));
    case 'table':
      return '';
    case 'table_row':
      return tableRowText(block);
    case 'toggle':
      return prefixText('Toggle: ', richTextBlockText(block));
    case 'child_page':
      return childPageText(block);
    case 'code':
      return codeBlockText(block);
    case 'quote':
      return prefixText('> ', richTextBlockText(block));
    case 'callout':
      return prefixText('Callout: ', richTextBlockText(block));
    default:
      skippedBlockTypes.add(block.type);
      return '';
  }
}

function buildSections({
  blocks,
  pageTitle,
}: {
  blocks: NormalizedBlock[];
  pageTitle: string;
}) {
  const sections: Array<NotionRagSection & { textParts: string[] }> = [];
  let currentSection: (NotionRagSection & { textParts: string[] }) | null =
    null;
  const headingPath: string[] = [];

  for (const block of blocks) {
    const headingLevel = getHeadingLevel(block.type);
    const plainText = stripMarkdownHeading(block.text);

    if (headingLevel && plainText) {
      headingPath.splice(headingLevel - 1);
      headingPath[headingLevel - 1] = plainText;

      currentSection = {
        id: block.id,
        title: plainText,
        level: headingLevel,
        sectionPath: headingPath.filter(Boolean),
        text: '',
        textLength: 0,
        blockCount: 0,
        blockIds: [],
        textParts: [],
      };
      sections.push(currentSection);
    }

    if (!currentSection) {
      currentSection = {
        id: 'page-root',
        title: pageTitle,
        level: 0,
        sectionPath: [pageTitle],
        text: '',
        textLength: 0,
        blockCount: 0,
        blockIds: [],
        textParts: [],
      };
      sections.push(currentSection);
    }

    currentSection.blockCount += 1;
    currentSection.blockIds.push(block.id);

    if (block.text) {
      currentSection.textParts.push(indentNestedText(block.text, block.depth));
    }
  }

  return sections.map(({ textParts, ...section }) => {
    const text = normalizeSectionText(textParts.join('\n'));

    return {
      ...section,
      text,
      textLength: text.length,
    };
  });
}

function headingText(block: NotionBlock, level: 1 | 2 | 3) {
  return prefixText(`${'#'.repeat(level)} `, richTextBlockText(block));
}

function richTextBlockText(block: NotionBlock) {
  const value = getBlockValue(block);
  if (!value || !Array.isArray(value.rich_text)) return '';
  return richTextToPlainText(value.rich_text);
}

function tableRowText(block: NotionBlock) {
  const value = getBlockValue(block);
  if (!value || !Array.isArray(value.cells)) return '';

  return value.cells
    .map((cell) =>
      Array.isArray(cell)
        ? richTextToPlainText(cell.filter(isNotionRichText))
        : ''
    )
    .join(' | ');
}

function childPageText(block: NotionBlock) {
  const value = getBlockValue(block);
  const title = typeof value?.title === 'string' ? value.title : '';
  return prefixText('Page: ', title);
}

function codeBlockText(block: NotionBlock) {
  const value = getBlockValue(block);
  if (!value || !Array.isArray(value.rich_text)) return '';

  const language = typeof value.language === 'string' ? value.language : '';
  const text = richTextToPlainText(value.rich_text);
  if (!text) return '';

  return ['```' + language, text, '```'].join('\n');
}

function prefixText(prefix: string, text: string) {
  return text ? `${prefix}${text}` : '';
}

function getBlockValue(block: NotionBlock) {
  const value = block[block.type];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getHeadingLevel(type: string) {
  if (type === 'heading_1') return 1;
  if (type === 'heading_2') return 2;
  if (type === 'heading_3') return 3;
  return 0;
}

function stripMarkdownHeading(text: string) {
  return text.replace(/^#{1,3}\s+/, '').trim();
}

function indentNestedText(text: string, depth: number) {
  if (!depth) return text;
  return text
    .split('\n')
    .map((line) => `${'  '.repeat(depth)}${line}`)
    .join('\n');
}

function normalizeSectionText(value: string) {
  return value
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

function richTextToPlainText(richText: NotionRichText[]) {
  return richText.map((item) => item.plain_text).join('');
}

function isNotionRichText(value: unknown): value is NotionRichText {
  return (
    value !== null &&
    typeof value === 'object' &&
    'plain_text' in value &&
    typeof (value as NotionRichText).plain_text === 'string'
  );
}

function isRetryableStatus(status: number) {
  return status === 429 || (status >= 500 && status < 600);
}

function getRetryDelayMs(response: Response, attempt: number) {
  const retryAfter = response.headers.get('retry-after');
  const retryAfterMs = retryAfter ? Number.parseFloat(retryAfter) * 1000 : 0;

  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    return Math.ceil(retryAfterMs);
  }

  return DEFAULT_RETRY_DELAY_MS * 2 ** attempt;
}

function getSafeNotionErrorMessage(status: number) {
  if (status === 401 || status === 403) {
    return 'Notion page access failed. Check the integration secret and page sharing settings.';
  }

  if (status === 404) {
    return 'Notion page was not found or is not shared with the integration.';
  }

  if (status === 429) {
    return 'Notion rate limit was reached and retries were exhausted.';
  }

  return 'Notion API request failed.';
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
