import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { detectEntityId } from './notion-chunks';
import { createRagChunk, normalizeText } from './text';
import type { RagChunk, RagChunkMetadataValue } from './types';

type LocalMarkdownDocument = {
  path: string;
  slug: string;
  language: 'ko' | 'en';
  author: 'claude' | 'gpt' | 'gemini';
  docId?: string;
  sourceType?: string;
};

type MarkdownSection = {
  level: number;
  heading: string;
  sectionPath: string[];
  content: string;
  index: number;
};

type ParsedFrontmatter = Record<string, RagChunkMetadataValue>;

type SecondBrainManifestEntry = {
  path: string;
  docId: string;
  language: 'ko' | 'en';
  sourceType: string;
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
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-visionary-claude.md',
    slug: 'notion-wiki-draft-v12-ko-add-visionary-claude',
    language: 'ko',
    author: 'claude',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-visionary-claude.md',
    slug: 'notion-wiki-draft-v12-en-add-visionary-claude',
    language: 'en',
    author: 'claude',
  },
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-visionary-gpt.md',
    slug: 'notion-wiki-draft-v12-ko-add-visionary-gpt',
    language: 'ko',
    author: 'gpt',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-visionary-gpt.md',
    slug: 'notion-wiki-draft-v12-en-add-visionary-gpt',
    language: 'en',
    author: 'gpt',
  },
  {
    path: 'docs/notion-wiki-draft-v12-ko-add-visionary-gemini.md',
    slug: 'notion-wiki-draft-v12-ko-add-visionary-gemini',
    language: 'ko',
    author: 'gemini',
  },
  {
    path: 'docs/notion-wiki-draft-v12-en-add-visionary-gemini.md',
    slug: 'notion-wiki-draft-v12-en-add-visionary-gemini',
    language: 'en',
    author: 'gemini',
  },
];

const SECOND_BRAIN_BASE_PATH = 'docs/askoosu_second_brain_docs';
const SECOND_BRAIN_MANIFEST_PATH = `${SECOND_BRAIN_BASE_PATH}/manifest.json`;

export async function fetchLocalMarkdownRagChunks(): Promise<LocalMarkdownRagSyncResult> {
  const documents: LocalMarkdownRagSyncResult['documents'] = [];
  const chunks: RagChunk[] = [];
  const warnings: string[] = [];
  const localDocuments = [
    ...LOCAL_MARKDOWN_DOCUMENTS,
    ...(await loadSecondBrainManifestDocuments(warnings)),
  ];

  for (const document of localDocuments) {
    try {
      const absolutePath = path.join(process.cwd(), document.path);
      const content = await readFile(absolutePath, 'utf8');
      const parsedDocument = parseDocumentFrontmatter(content);
      const frontmatter = {
        ...parsedDocument.frontmatter,
        docId: parsedDocument.frontmatter.docId ?? document.docId,
        sourceType:
          parsedDocument.frontmatter.sourceType ?? document.sourceType,
        language: parsedDocument.frontmatter.language ?? document.language,
      };
      const title =
        getFrontmatterString(frontmatter, 'title') ||
        extractDocumentTitle(parsedDocument.body) ||
        document.slug;
      const sections = parseMarkdownSections(parsedDocument.body);
      const documentChunks = sections.flatMap((section) =>
        sectionToRagChunk({
          document,
          documentTitle: title,
          frontmatter,
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

async function loadSecondBrainManifestDocuments(warnings: string[]) {
  try {
    const rawManifest = await readFile(
      path.join(process.cwd(), SECOND_BRAIN_MANIFEST_PATH),
      'utf8'
    );
    const manifest = JSON.parse(rawManifest) as SecondBrainManifestEntry[];
    if (!Array.isArray(manifest)) {
      warnings.push('Second brain manifest is not a JSON array.');
      return [];
    }

    return manifest
      .filter(
        (entry) =>
          entry &&
          typeof entry.path === 'string' &&
          typeof entry.docId === 'string' &&
          (entry.language === 'ko' || entry.language === 'en') &&
          typeof entry.sourceType === 'string'
      )
      .map(
        (entry): LocalMarkdownDocument => ({
          path: `${SECOND_BRAIN_BASE_PATH}/${entry.path}`,
          slug: entry.docId,
          language: entry.language,
          author: 'gpt',
          docId: entry.docId,
          sourceType: entry.sourceType,
        })
      );
  } catch (error) {
    warnings.push(
      `Second brain manifest was not loaded: ${SECOND_BRAIN_MANIFEST_PATH}`
    );
    console.warn('Second brain manifest load failed.', {
      path: SECOND_BRAIN_MANIFEST_PATH,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return [];
  }
}

function sectionToRagChunk({
  document,
  documentTitle,
  frontmatter,
  section,
}: {
  document: LocalMarkdownDocument;
  documentTitle: string;
  frontmatter: ParsedFrontmatter;
  section: MarkdownSection;
}) {
  const text = normalizeText(section.content);
  const isGuardrailSection = isGuardrailHeading(section.heading);
  if (!text || text.length < (isGuardrailSection ? 30 : 80)) return [];

  const faqId = extractField(section.content, 'FAQ ID');
  const intentId = extractField(section.content, 'Intent ID');
  const explicitEntityId = extractField(section.content, 'Entity ID');
  const visibility = normalizeVisibility(
    extractField(section.content, 'Visibility') ||
      getFrontmatterString(frontmatter, 'visibility')
  );
  const sourceChunkIds = extractBacktickValues(
    extractField(section.content, 'Source Chunk IDs')
  );
  const patterns = extractBacktickValues(
    extractField(section.content, 'Patterns')
  );
  const freshness = normalizeFreshness(
    extractField(section.content, 'Freshness') ||
      getFrontmatterString(frontmatter, 'freshness')
  );
  const cacheMode = extractField(section.content, 'Cache Mode');
  const isVisionaryDocument = document.slug.includes('visionary');
  const isSecondBrainDocument = document.path.startsWith(
    SECOND_BRAIN_BASE_PATH
  );
  const docId = getFrontmatterString(frontmatter, 'docId') || document.docId;
  const sourceType =
    getFrontmatterString(frontmatter, 'sourceType') || document.sourceType;
  const intentGroup =
    getFrontmatterString(frontmatter, 'intentGroup') ||
    getIntentGroupFromSourceType(sourceType);
  const chunkId =
    getPreferredChunkId({
      faqId,
      intentId,
      isVisionaryDocument,
      docId,
      section,
    }) ||
    `markdown.${document.slug}.${slugify(section.heading) || section.index}`;
  const entityId =
    explicitEntityId ||
    (isVisionaryDocument ? getVisionaryEntityId({ faqId, intentId }) : null) ||
    getFirstFrontmatterString(frontmatter, 'relatedEntities') ||
    (faqId?.startsWith('faq.recruiter') ? 'recruiter' : null) ||
    detectEntityId(section.content);
  const confidence = getConfidenceScore(
    getFrontmatterString(frontmatter, 'confidence'),
    visibility
  );
  const guardrailItems = isGuardrailSection
    ? extractMarkdownListItems(text)
    : [];

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
        ...frontmatter,
        ...(docId ? { docId } : {}),
        ...(sourceType ? { sourceType } : {}),
        ...(isSecondBrainDocument
          ? {
              sourceCategory: 'second_brain',
              sourceLabel: getSecondBrainSourceLabel(sourceType),
              cachePriority: getFrontmatterString(frontmatter, 'priority'),
              priority: getFrontmatterString(frontmatter, 'priority'),
              preferredTone: 'evidence_backed_operating_notes',
            }
          : {}),
        ...(isVisionaryDocument
          ? {
              sourceType: 'wiki_addon',
              sourceCategory: 'ai_working_thesis',
              sourceLabel: 'oosu.dev Visionary Builder Docs',
              surface: 'oosu_philosophy',
              intentGroup: 'vision',
              cachePriority: 'high',
              priority: 'high',
              preferredTone: 'personal_take',
            }
          : {}),
        language: document.language,
        sectionHeading: section.heading,
        sectionPath: section.sectionPath,
        faqId,
        intentId,
        entityId,
        intentGroup: isGuardrailSection
          ? `${intentGroup || 'markdown'}_guardrail`
          : intentGroup,
        cacheMode,
        patterns,
        sourceChunkIds,
        ...(guardrailItems.length > 0 ? { doNotSay: guardrailItems } : {}),
        isGuardrailChunk: isGuardrailSection,
        visibility,
        freshness,
        confidence,
      },
    }),
  ];
}

function parseDocumentFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  return {
    frontmatter: parseSimpleYamlFrontmatter(match[1]),
    body: content.slice(match[0].length),
  };
}

function parseSimpleYamlFrontmatter(value: string): ParsedFrontmatter {
  const frontmatter: ParsedFrontmatter = {};

  for (const rawLine of value.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const delimiterIndex = line.indexOf(':');
    if (delimiterIndex < 0) continue;

    const key = line.slice(0, delimiterIndex).trim();
    const rawValue = line.slice(delimiterIndex + 1).trim();
    if (!key) continue;
    frontmatter[key] = parseFrontmatterValue(rawValue);
  }

  return frontmatter;
}

function parseFrontmatterValue(value: string): RagChunkMetadataValue {
  if (!value) return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);

  const bracketList = value.match(/^\[(.*)]$/);
  if (bracketList) {
    return bracketList[1]
      .split(',')
      .map((item) => cleanFrontmatterScalar(item))
      .filter(Boolean);
  }

  return cleanFrontmatterScalar(value);
}

function cleanFrontmatterScalar(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, '');
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
      sectionPath: level === 2 || !currentH2 ? [heading] : [currentH2, heading],
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

function getPreferredChunkId({
  faqId,
  intentId,
  isVisionaryDocument,
  docId,
  section,
}: {
  faqId: string;
  intentId: string;
  isVisionaryDocument: boolean;
  docId?: string;
  section: MarkdownSection;
}) {
  if (!isVisionaryDocument) {
    if (faqId) return faqId;
    if (docId) return `${docId}.${slugify(section.heading) || section.index}`;
    return '';
  }
  if (intentId?.startsWith('vision.') || intentId?.startsWith('ai_thesis.')) {
    return intentId;
  }

  const visionMatch = faqId?.match(/^faq[.]vision[.]([a-z0-9_]+)[.]default$/);
  if (visionMatch) return `vision.${visionMatch[1]}`;

  const thesisMatch = faqId?.match(
    /^faq[.]ai_thesis[.]([a-z0-9_]+)[.]default$/
  );
  if (thesisMatch) return `ai_thesis.${thesisMatch[1]}`;

  return faqId;
}

function getVisionaryEntityId({
  faqId,
  intentId,
}: {
  faqId: string;
  intentId: string;
}) {
  if (faqId?.startsWith('faq.vision')) return 'oosu_philosophy';
  if (intentId?.includes('team')) return 'ai_thesis.team';
  if (intentId?.includes('pm') || intentId?.includes('role')) {
    return 'ai_thesis.role_fit';
  }
  if (intentId?.includes('agent') || intentId?.includes('workflow')) {
    return 'ai_thesis.workflow';
  }
  if (intentId?.startsWith('ai_thesis')) return 'ai_thesis';
  return null;
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

function getFrontmatterString(frontmatter: ParsedFrontmatter, key: string) {
  const value = frontmatter[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function getFirstFrontmatterString(
  frontmatter: ParsedFrontmatter,
  key: string
) {
  const value = frontmatter[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    return (
      value.find(
        (item): item is string => typeof item === 'string' && Boolean(item)
      ) ?? ''
    );
  }
  return '';
}

function getIntentGroupFromSourceType(sourceType: string | undefined) {
  if (sourceType === 'operating_system_doc') return 'operating_system';
  if (sourceType === 'decision_log') return 'decision_log';
  if (sourceType === 'postmortem_doc') return 'project_postmortem';
  return '';
}

function getSecondBrainSourceLabel(sourceType: string | undefined) {
  if (sourceType === 'operating_system_doc') {
    return 'AskOosu Operating System Docs';
  }
  if (sourceType === 'decision_log') return 'AskOosu Decision Logs';
  if (sourceType === 'postmortem_doc') return 'AskOosu Postmortem Docs';
  return 'AskOosu Second Brain Docs';
}

function getConfidenceScore(value: string, visibility: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'high') return 0.98;
  if (normalized === 'medium_high') return 0.88;
  if (normalized === 'medium') return 0.75;
  if (normalized === 'low') return 0.5;
  return visibility === 'public' ? 0.98 : 0.65;
}

function isGuardrailHeading(heading: string) {
  return /do not say|피해야 할 표현|guardrail|가드레일/i.test(heading);
}

function extractMarkdownListItems(value: string) {
  return value
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^[-*]\s+/, '')
        .trim()
    )
    .filter((line) => line && !line.startsWith('#'));
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
