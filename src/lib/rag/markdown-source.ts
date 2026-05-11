import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { detectEntityId } from './notion-chunks';
import { createRagChunk, normalizeText } from './text';
import type { RagChunk } from './types';

type LocalMarkdownDocument = {
  path: string;
  slug: string;
  language: 'ko' | 'en';
  author: 'claude' | 'gpt';
};

type MarkdownSection = {
  level: number;
  heading: string;
  sectionPath: string[];
  content: string;
  index: number;
};

export type LocalMarkdownRagSyncResult = {
  documents: Array<{
    path: string;
    slug: string;
    language: 'ko' | 'en';
    title: string;
    sectionCount: number;
    chunkCount: number;
  }>;
  chunks: RagChunk[];
  warnings: string[];
};

const LOCAL_MARKDOWN_DOCUMENTS: LocalMarkdownDocument[] = [
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-claude.md',
    slug: 'notion-wiki-draft-v12-ko-add-claude',
    language: 'ko',
    author: 'claude',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-claude.md',
    slug: 'notion-wiki-draft-v12-en-add-claude',
    language: 'en',
    author: 'claude',
  },
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-recruiter-risk-gpt.md',
    slug: 'notion-wiki-draft-v12-ko-add-recruiter-risk-gpt',
    language: 'ko',
    author: 'gpt',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-recruiter-risk-gpt.md',
    slug: 'notion-wiki-draft-v12-en-add-recruiter-risk-gpt',
    language: 'en',
    author: 'gpt',
  },
];

export async function fetchLocalMarkdownRagChunks(): Promise<LocalMarkdownRagSyncResult> {
  const documents: LocalMarkdownRagSyncResult['documents'] = [];
  const chunks: RagChunk[] = [];
  const warnings: string[] = [];

  for (const document of LOCAL_MARKDOWN_DOCUMENTS) {
    try {
      const absolutePath = path.join(process.cwd(), document.path);
      const content = await readFile(absolutePath, 'utf8');
      const title = extractDocumentTitle(content) ?? document.slug;
      const sections = parseMarkdownSections(content);
      const documentChunks = sections.flatMap((section) =>
        sectionToRagChunk({
          document,
          documentTitle: title,
          section,
        })
      );

      chunks.push(...documentChunks);
      documents.push({
        path: document.path,
        slug: document.slug,
        language: document.language,
        title,
        sectionCount: sections.length,
        chunkCount: documentChunks.length,
      });
    } catch (error) {
      warnings.push(
        `Local Markdown RAG document was not loaded: ${document.path}`
      );
      console.warn('Local Markdown RAG document load failed.', {
        path: document.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { documents, chunks, warnings };
}

function sectionToRagChunk({
  document,
  documentTitle,
  section,
}: {
  document: LocalMarkdownDocument;
  documentTitle: string;
  section: MarkdownSection;
}) {
  const text = normalizeText(section.content);
  if (!text || text.length < 80) return [];

  const faqId = extractField(section.content, 'FAQ ID');
  const intentId = extractField(section.content, 'Intent ID');
  const explicitEntityId = extractField(section.content, 'Entity ID');
  const visibility = normalizeVisibility(
    extractField(section.content, 'Visibility')
  );
  const sourceChunkIds = extractBacktickValues(
    extractField(section.content, 'Source Chunk IDs')
  );
  const patterns = extractBacktickValues(extractField(section.content, 'Patterns'));
  const freshness = normalizeFreshness(extractField(section.content, 'Freshness'));
  const cacheMode = extractField(section.content, 'Cache Mode');
  const chunkId =
    faqId ||
    `markdown.${document.slug}.${slugify(section.heading) || section.index}`;
  const entityId =
    explicitEntityId ||
    (faqId?.startsWith('faq.recruiter') ? 'recruiter' : null) ||
    detectEntityId(section.content);

  return [
    createRagChunk({
      id: chunkId,
      title: `${documentTitle} - ${section.heading}`,
      source: 'markdown',
      text,
      metadata: {
        sourceKind: 'local_markdown',
        sourceKey: document.path,
        sourceTitle: documentTitle,
        documentPath: document.path,
        documentSlug: document.slug,
        documentVersion: 'v12',
        documentAuthor: document.author,
        language: document.language,
        sectionHeading: section.heading,
        sectionPath: section.sectionPath,
        faqId,
        intentId,
        entityId,
        cacheMode,
        patterns,
        sourceChunkIds,
        visibility,
        freshness,
        confidence: visibility === 'public' ? 0.98 : 0.65,
      },
    }),
  ];
}

function parseMarkdownSections(content: string): MarkdownSection[] {
  const matches = Array.from(content.matchAll(/^(#{2,3})\s+(.+)$/gm));
  const sections: MarkdownSection[] = [];
  let currentH2 = '';

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const level = match[1].length;
    const heading = cleanHeading(match[2]);
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? content.length;
    const sectionContent = content.slice(start, end).trim();

    if (level === 2) currentH2 = heading;

    sections.push({
      level,
      heading,
      sectionPath:
        level === 2 || !currentH2 ? [heading] : [currentH2, heading],
      content: sectionContent,
      index: index + 1,
    });
  }

  return sections;
}

function extractDocumentTitle(content: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? cleanHeading(match[1]) : null;
}

function cleanHeading(value: string) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*/g, '')
    .trim();
}

function extractField(section: string, field: string) {
  const pattern = new RegExp(
    String.raw`\|\s*${escapeRegExp(field)}\s*\|\s*([^|]+?)\s*\|`,
    'i'
  );
  const match = section.match(pattern);
  return match?.[1]?.trim().replace(/^`|`$/g, '') ?? '';
}

function extractBacktickValues(value: string) {
  const values = Array.from(value.matchAll(/`([^`]+)`/g), (match) =>
    match[1].trim()
  );

  if (values.length > 0) return values;

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeVisibility(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'public') return 'public';
  if (normalized === 'private') return 'private';
  if (normalized === 'limited') return 'limited';
  return 'needs_review';
}

function normalizeFreshness(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'stable') return 'stable';
  if (normalized === 'time_sensitive') return 'time_sensitive';
  if (normalized === 'needs_update') return 'needs_update';
  return 'current';
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
