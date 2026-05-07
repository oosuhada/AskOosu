import {
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  getPositiveIntEnv,
} from './config';
import { hashString } from './text';
import type { NotionRagSection, NotionRagSyncResult } from './notion';
import type { RagChunkMetadata } from './types';

export type NotionDatabaseChunk = {
  chunkId: string;
  entityId?: string | null;
  title: string;
  sectionPath: string[];
  content: string;
  contentHash: string;
  metadata: RagChunkMetadata;
  language?: 'ko' | 'en' | null;
  visibility: string;
  freshness: string;
  hasTodo: boolean;
  confidence: number;
};

type EntityAlias = {
  entityId: string;
  aliases: string[];
};

export const NOTION_ENTITY_ALIAS_MAP: Record<string, EntityAlias> = {
  askoosu: {
    entityId: 'project.askoosu',
    aliases: [
      'AskOosu',
      'Ask Oosu',
      '애스크우수',
      '2026 포트폴리오',
      'AI 포트폴리오',
      '대화형 포트폴리오',
      'RAG 포트폴리오',
      '챗봇 포트폴리오',
    ],
  },
  instagram_clone: {
    entityId: 'project.instagram_clone',
    aliases: [
      'Instagram Clone',
      'Aigram',
      'AIgram',
      'aigram',
      '인스타그램 클론',
      'SNS 프로젝트',
      '인스타 프로젝트',
      '풀스택 SNS',
      'Spring Boot SNS',
      'Spring Boot',
    ],
  },
  sticks_and_stones: {
    entityId: 'project.sticks_and_stones',
    aliases: [
      'Sticks & Stones',
      'Sticks and Stones',
      'sticksandstones',
      '스틱스앤스톤스',
      '한옥 리모델링',
      '레거시 홈페이지',
      'WordPress 리빌드',
    ],
  },
  portfoli_oh: {
    entityId: 'project.portfoli_oh',
    aliases: [
      'Portfoli-Oh!',
      'Portfoli Oh',
      'portfolioh',
      '포트폴리오오',
      '포폴리오',
      '포트폴리오 2025',
      '이전 포트폴리오',
      '인터랙션 포트폴리오',
      'JSON 챗봇',
    ],
  },
  ez_air: {
    entityId: 'project.ez_air',
    aliases: [
      'EZ Air',
      'EZAir',
      '이지에어',
      '항공권 AI',
      '자연어 항공권 검색',
      'Gemini 항공권',
      'Amadeus API',
    ],
  },
  uncorked: {
    entityId: 'project.uncorked',
    aliases: [
      'Uncorked',
      '언코크드',
      '와인바 사이트',
      '우수살롱 디자인',
      'Figma 와인바',
    ],
  },
  oosu_salon: {
    entityId: 'career.oosu_salon',
    aliases: ['우수살롱', '와인바', '창업', '연남동 와인바', 'OOSU SALON'],
  },
  profile: {
    entityId: 'profile.identity',
    aliases: [
      'Profile',
      '기본 정보',
      '한 줄 소개',
      '자기소개',
      '장우수',
      'Oosu Jang',
    ],
  },
  career: {
    entityId: 'profile.career',
    aliases: ['Career', '경력', '커리어', '커리어 전환', 'GfK', 'JW CRONY'],
  },
  guardrail: {
    entityId: 'policy.guardrail',
    aliases: [
      'guardrail',
      'guardrails',
      '가드레일',
      '공개 범위',
      '과장 금지',
      'TODO 처리',
      'Public Answer Redaction',
    ],
  },
};

const TODO_PATTERN = /\bTODO\b|확인 필요|채워야|미정/i;

const REVIEW_VISIBILITY_PATTERN =
  /\bTODO\b|확인 필요|공개 범위|비공개|private|internal only|redaction|민감|주소|거주|수치 공개 불가|성과 수치|미정|placeholder/i;

export function notionResultToDatabaseChunks(
  result: NotionRagSyncResult
): NotionDatabaseChunk[] {
  return result.sections.flatMap((section, sectionIndex) =>
    sectionToDatabaseChunks({
      pageId: result.pageId,
      pageUrl: result.pageUrl,
      language: result.language,
      section,
      sectionIndex,
    })
  );
}

export function hasTodoMarker(value: string) {
  return TODO_PATTERN.test(value);
}

export function detectEntityId(value: string) {
  const explicitEntityId = value.match(
    /\b(?:person|project|career|profile|skill|knowledge|policy|contact|audience|question)\.[a-z0-9_.-]+\b/i
  );

  if (explicitEntityId) return explicitEntityId[0].toLowerCase();

  const normalizedValue = normalizeAliasText(value);
  const match = Object.values(NOTION_ENTITY_ALIAS_MAP).find(({ aliases }) =>
    aliases.some((alias) => normalizedValue.includes(normalizeAliasText(alias)))
  );

  return match?.entityId ?? null;
}

function sectionToDatabaseChunks({
  pageId,
  pageUrl,
  language,
  section,
  sectionIndex,
}: {
  pageId: string;
  pageUrl?: string;
  language?: 'ko' | 'en' | null;
  section: NotionRagSection;
  sectionIndex: number;
}) {
  const parts = splitChunkContent(section.text);

  return parts.map((content, partIndex) => {
    const sectionPath = section.sectionPath.length
      ? section.sectionPath
      : [section.title];
    const chunkId = ['notion', pageId, section.id, partIndex + 1].join(':');
    const entityId = detectEntityId(`${sectionPath.join('\n')}\n${content}`);
    const hasTodo = hasTodoMarker(content);
    const visibility = detectVisibility(
      `${sectionPath.join('\n')}\n${content}`
    );
    const metadata: RagChunkMetadata = {
      notionPageId: pageId,
      notionBlockId: section.id,
      pageUrl,
      entityAliasMapVersion: 'v9',
      sectionLevel: section.level,
      sectionIndex,
      sectionPath,
      sourceBlockIds: section.blockIds,
      sourceBlockCount: section.blockCount,
      sourceTextLength: section.textLength,
      language: language ?? null,
      chunkPart: partIndex + 1,
      chunkPartCount: parts.length,
      visibility,
      hasTodo,
    };

    if (entityId) metadata.entityId = entityId;

    return {
      chunkId,
      entityId,
      title:
        parts.length > 1 ? `${section.title} ${partIndex + 1}` : section.title,
      sectionPath,
      content,
      contentHash: hashString(normalizeHashContent(content)),
      metadata,
      language: language ?? null,
      visibility,
      freshness:
        hasTodo || visibility === 'needs_review' ? 'needs_review' : 'current',
      hasTodo,
      confidence: hasTodo || visibility === 'needs_review' ? 0.6 : 1,
    };
  });
}

function splitChunkContent(content: string) {
  const maxLength = getPositiveIntEnv(
    'ASKOOSU_RAG_CHUNK_SIZE',
    DEFAULT_CHUNK_SIZE
  );
  const overlap = getPositiveIntEnv(
    'ASKOOSU_RAG_CHUNK_OVERLAP',
    DEFAULT_CHUNK_OVERLAP
  );

  if (content.length <= maxLength) return [content].filter(Boolean);

  const chunks: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + maxLength, content.length);
    chunks.push(content.slice(start, end).trim());

    if (end === content.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks.filter(Boolean);
}

function detectVisibility(value: string) {
  return REVIEW_VISIBILITY_PATTERN.test(value) ? 'needs_review' : 'public';
}

function normalizeAliasText(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9가-힣]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeHashContent(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
