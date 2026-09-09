import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import {
  buildGithubProjectQuestions,
  type GithubProjectQuestionIntent,
} from '@/lib/github-project-questions';
import { normalizeQuestion } from './text';
import { upsertCachedAnswer } from './database';

const PREWARM_PROVIDER = 'manual-prewarm';
const PREWARM_MODEL = 'assistant-authored-v2';
const PREWARM_CONFIDENCE = 0.95;

const KOREAN_PROJECT_DESCRIPTIONS: Record<string, string> = {
  AskOosu:
    '방문자가 스크롤 대신 질문으로 포트폴리오를 탐색하도록 만든 대화형 포트폴리오입니다. Next.js, PostgreSQL, RAG, 캐시, 스트리밍 답변 UI를 하나의 운영 서비스로 연결합니다.',
  'beneath-the-stack':
    '웹 프레임워크 아래의 알고리즘, 메모리, 동시성, 네트워킹, 저장소 내부를 직접 구현하고 측정하는 시스템 학습·검증 프로젝트입니다.',
  'agentic-ontology-dashboard':
    '제조 설비 이상을 관측, 예측, 근거, 의사결정, 점검, 정비, 역할별 보고 흐름으로 연결하는 predictive maintenance decision workspace입니다.',
  'petlens-ai':
    'ViT 기반 품종 분석과 CLIP 의미 기반 검색을 연결해 반려동물 이미지·영상 분석을 제공하는 멀티모달 AI 웹 서비스입니다.',
  'mytrip-planner':
    '여행 일정, 지도, 날씨, 준비물, 투표 흐름을 하나의 사용자 경험으로 묶은 개인 AI 여행 플래너입니다.',
  'source-archive':
    'Cloudflare R2, Backblaze B2, HLS, Service Worker를 활용해 대량 영상을 빠르게 탐색하도록 만든 미디어 아카이브입니다.',
  'text2cypher-factory-rca':
    '자연어 질문을 읽기 전용 Cypher로 변환해 제조 지식그래프에서 RCA 후보와 근거 경로를 찾는 knowledge graph RAG MVP입니다.',
  'browser-reliability-runtime':
    'Playwright/RPA 워크플로우가 실패했을 때 스크린샷, DOM, 접근성 정보, 실행 이력, 고객 정책을 함께 보고 원인을 진단한 뒤 정책에 맞는 복구를 실행·검증하는 브라우저 자동화 안정성 런타임입니다.',
  'decision-module-runtime':
    '검증 가능한 DAG, deterministic compute, provenance, snapshot, human approval을 묶은 의사결정 모듈 런타임입니다.',
  'spatial-project-archive':
    '원본 파일, 사람의 기억, AI 해석, 관계, 시간축을 분리해 프로젝트 히스토리를 공간적으로 탐색하는 풀스택 아카이브입니다.',
  Aigram:
    '피드, 팔로우, 댓글, 백엔드 API 흐름을 직접 구현한 초기 풀스택 SNS 프로젝트입니다.',
  'sticksandstones.kr':
    '기존 WordPress 기반 실서비스를 TypeScript/Vite 기반 정적 사이트로 이전한 실제 클라이언트 마이그레이션 사례입니다.',
  'ai-mot-research-lab':
    'AI와 기술경영 연구를 위해 논문·근거·인용 그래프·pgvector 검색을 연결한 evidence-first research intelligence 프로젝트입니다.',
  'fabops-decision-lab':
    '반도체 수율 이상 상황에서 evidence, CQRS, event-driven architecture, human-in-the-loop 판단 흐름을 실험한 의사결정 플랫폼입니다.',
  'vlm-reasoning-lab':
    '합성 데이터와 QLoRA 실험을 통해 VLM reasoning benchmark, ID/OOD 평가, 실패 분석을 검증한 멀티모달 연구 프로젝트입니다.',
};

const KOREAN_PROJECT_OVERVIEW_HIGHLIGHTS: Record<string, string[]> = {
  'browser-reliability-runtime': [
    '**핵심 기능**: 합성 커머스 워크플로우를 일부러 실패시키고, 실패 유형을 진단한 뒤 복구 후보를 실행·검증합니다.',
    '**진단 근거**: 스크린샷, DOM, 접근성 텍스트, action history, URL, workflow state, 고객 정책을 함께 사용합니다.',
    '**검증 포인트**: deterministic recovery와 텍스트 전용 LLM 대비 screenshot-aware VLM의 진단 차이를 측정 결과로 남겼습니다.',
  ],
  'text2cypher-factory-rca': [
    '**핵심 기능**: 제조 도메인의 자연어 질문을 읽기 전용 Cypher로 바꾸고 Neo4j 지식그래프에서 근거 경로를 찾습니다.',
    '**안전 장치**: Cypher 검증, correction/retry, Gold fallback, 쓰기 차단을 통해 LLM이 임의로 조작하지 않도록 설계했습니다.',
    '**성장 연결**: 이후 agentic ontology dashboard의 grounded report와 evidence workflow 설계로 이어진 선행 MVP입니다.',
  ],
  'agentic-ontology-dashboard': [
    '**핵심 기능**: 설비 이상 관측부터 예측 결과, 근거, 판단, 점검, 정비, 보고까지 하나의 decision case로 묶습니다.',
    '**제품 관점**: 엔지니어, 운영 관리자, 경영진이 같은 사건을 각자의 언어와 화면으로 이해하도록 역할별 UX를 제공합니다.',
    '**아키텍처 포인트**: event-driven workflow, audit, idempotency, repository pattern, human-in-the-loop 승인 흐름을 강조합니다.',
  ],
  'beneath-the-stack': [
    '**핵심 기능**: 자료구조, allocator, 동시성, blocking network, storage, durability를 직접 구현하고 테스트합니다.',
    '**검증 방식**: benchmark, sanitizer, differential test, source reading note, interview defense 문서로 이해를 증명합니다.',
    '**포트폴리오 의미**: 웹 제품을 만들 때 쓰는 추상화의 아래 계층을 source-level로 방어하기 위한 시스템 capstone입니다.',
  ],
};

type GithubIndexedChunk = {
  chunkId: string;
  entityId: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

type IndexedGithubProject = {
  name: string;
  entityId: string;
  metadata: Record<string, unknown>;
  overviewChunk: GithubIndexedChunk;
  readmeChunks: GithubIndexedChunk[];
};

export async function prewarmGithubAnswerCache({
  repositoryNames,
}: {
  repositoryNames?: string[];
} = {}) {
  if (!hasPostgresDatabaseUrl()) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required for GitHub answer prewarm.');
  }

  const projects = await loadIndexedGithubProjects(repositoryNames);
  let upserted = 0;

  for (const project of projects) {
    for (const language of ['ko', 'en'] as const) {
      for (const question of buildGithubProjectQuestions(project.name, language)) {
        const sourceChunkIds = selectSourceChunkIds(project, question.intent);
        const answer = buildPrewarmedAnswer(project, question.intent, language);
        const saved = await upsertCachedAnswer({
          normalizedQuestion: normalizeQuestion(question.displayQuestion),
          language,
          answer,
          answerSource: 'deterministic_rule',
          matchedEntityIds: [project.entityId],
          sourceChunkIds,
          confidence: PREWARM_CONFIDENCE,
          provider: PREWARM_PROVIDER,
          model: PREWARM_MODEL,
          hasTodoEvidence: false,
          warnings: [],
        });
        if (saved) upserted += 1;
      }
    }
  }

  return {
    repositoryCount: projects.length,
    answerCount: projects.length * 8,
    upserted,
    provider: PREWARM_PROVIDER,
    model: PREWARM_MODEL,
  };
}

async function loadIndexedGithubProjects(repositoryNames?: string[]) {
  const pool = await getPostgresPool();
  const normalizedNames = (repositoryNames ?? [])
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
  const result = await pool.query<{
    chunk_id: string;
    entity_id: string;
    title: string;
    content: string;
    metadata: Record<string, unknown>;
  }>(
    `
      SELECT
        c.chunk_id,
        c.entity_id,
        c.title,
        c.content,
        c.metadata
      FROM rag_chunks c
      JOIN rag_sources s ON s.id = c.source_id
      WHERE s.source_key LIKE 'github:%'
        AND c.entity_id LIKE 'github:%'
        AND c.visibility = 'public'
        AND (
          cardinality($1::text[]) = 0
          OR lower(substring(c.entity_id from 8)) = ANY($1::text[])
        )
      ORDER BY c.entity_id ASC, c.chunk_id ASC
    `,
    [normalizedNames]
  );

  const grouped = new Map<string, GithubIndexedChunk[]>();
  for (const row of result.rows) {
    const chunks = grouped.get(row.entity_id) ?? [];
    chunks.push({
      chunkId: row.chunk_id,
      entityId: row.entity_id,
      title: row.title,
      content: row.content,
      metadata: row.metadata ?? {},
    });
    grouped.set(row.entity_id, chunks);
  }

  const projects: IndexedGithubProject[] = [];
  for (const [entityId, chunks] of grouped) {
    const overviewChunk = chunks.find((chunk) => chunk.chunkId.endsWith('-overview'));
    if (!overviewChunk) continue;
    const name = entityId.replace(/^github:/, '');
    projects.push({
      name,
      entityId,
      metadata: overviewChunk.metadata,
      overviewChunk,
      readmeChunks: chunks.filter((chunk) => chunk !== overviewChunk),
    });
  }

  return projects.sort((left, right) =>
    getProjectStartedAt(right.metadata).localeCompare(
      getProjectStartedAt(left.metadata)
    )
  );
}

function buildPrewarmedAnswer(
  project: IndexedGithubProject,
  intent: GithubProjectQuestionIntent,
  language: 'ko' | 'en'
) {
  if (intent === 'overview') return buildOverviewAnswer(project, language);
  if (intent === 'readme') return buildReadmeAnswer(project, language);
  if (intent === 'languages') return buildLanguagesAnswer(project, language);
  return buildGrowthAnswer(project, language);
}

function joinMarkdownLines(lines: Array<string | null | undefined | false>) {
  return lines
    .filter((line): line is string => line !== null && line !== undefined && line !== false)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildOverviewAnswer(project: IndexedGithubProject, language: 'ko' | 'en') {
  const description = getDescription(project, language);
  const languageSummary = formatLanguageSummary(project.metadata, 4);
  const sectionNames = getReadmeSectionNames(project, language).slice(0, 4);
  const highlights = getReadmeHighlights(project, 2, undefined, language);
  const koProjectHighlights = getKoreanProjectOverviewHighlights(project);
  const githubUrl = getMetadataString(project.metadata, 'url');
  const homepage = getMetadataString(project.metadata, 'homepage');

  if (language === 'ko') {
    return joinMarkdownLines([
      `**${project.name}**는 ${description}`,
      '',
      `- **기술 구성**: ${languageSummary || '공개 저장소에서 확인되는 구현 언어를 기준으로 정리했습니다.'}`,
      ...(koProjectHighlights.length > 0
        ? koProjectHighlights.map((highlight) => `- ${highlight}`)
        : [
            sectionNames.length > 0
              ? `- **README 핵심 흐름**: ${sectionNames.join(', ')}`
              : '- **README 핵심 흐름**: 프로젝트 개요와 구현 정보를 공개 저장소에서 확인할 수 있습니다.',
            ...highlights.map(
              (highlight) => `- **${highlight.title}**: ${highlight.summary}`
            ),
          ]),
      githubUrl ? `- **GitHub**: ${githubUrl}` : '',
      homepage ? `- **라이브**: ${homepage}` : '',
    ]);
  }

  return joinMarkdownLines([
    `**${project.name}** ${descriptionEn(project)}`,
    '',
    `- **Language mix**: ${languageSummary || 'Based on the languages visible in the public repository.'}`,
    sectionNames.length > 0
      ? `- **README highlights**: ${sectionNames.join(', ')}`
      : '- **README highlights**: The public repository documents the project overview and implementation details.',
    ...highlights.map((highlight) => `- **${highlight.title}**: ${highlight.summary}`),
    githubUrl ? `- **GitHub**: ${githubUrl}` : '',
    homepage ? `- **Live**: ${homepage}` : '',
  ]);
}

function buildReadmeAnswer(project: IndexedGithubProject, language: 'ko' | 'en') {
  const sections = getReadmeHighlights(project, 5, undefined, language);
  const languageSummary = formatLanguageSummary(project.metadata, 4);

  if (language === 'ko') {
    return joinMarkdownLines([
      `**${project.name}**의 README에서 확인되는 핵심 내용은 다음과 같습니다.`,
      '',
      ...sections.flatMap((section, index) =>
        formatReadmeSectionItem(section, index, 'ko')
      ),
      sections.length === 0
        ? '1. 공개 README가 짧아 저장소 설명과 공개된 프로젝트 정보에서 확인되는 내용만 정리했습니다.'
      : '',
      '',
      `**주요 기술 구성**: ${languageSummary || '공개 저장소 기준'}`,
    ]);
  }

  return joinMarkdownLines([
    `The public README for **${project.name}** highlights the following points.`,
    '',
    ...sections.flatMap((section, index) =>
      formatReadmeSectionItem(section, index, 'en')
    ),
    sections.length === 0
      ? '1. The public README is brief, so this summary stays within what the repository description and public project information support.'
    : '',
    '',
    `**Main language mix**: ${languageSummary || 'Based on the public repository.'}`,
  ]);
}

function formatReadmeSectionItem(
  section: { title: string; summary: string },
  index: number,
  language: 'ko' | 'en'
) {
  const summaryLines = splitSummaryLines(section.summary);
  const number = index + 1;

  if (summaryLines.length === 0) {
    return [`${number}. **${section.title}**`, ''];
  }

  if (summaryLines.length === 1 && !isListLikeSummary(section.summary)) {
    return [`${number}. **${section.title}** — ${summaryLines[0]}`, ''];
  }

  return [
    `${number}. **${section.title}**`,
    ...summaryLines.map((line) => `   - ${line}`),
    '',
  ];
}

function buildLanguagesAnswer(project: IndexedGithubProject, language: 'ko' | 'en') {
  const languages = getLanguages(project.metadata).slice(0, 6);
  const topics = getMetadataStringArray(project.metadata, 'topics').slice(0, 6);
  const techSections = getReadmeHighlights(
    project,
    3,
    /tech|stack|architecture|build|install|deploy|구조|기술|설치|배포/i,
    language
  );

  if (language === 'ko') {
    return joinMarkdownLines([
      `**${project.name}의 언어 비율**`,
      '',
      ...languages.map(
        (item) => `- **${item.name} ${item.percentage}%** — ${describeLanguageRole(item.name, 'ko', project)}`
      ),
      languages.length === 0 ? '- 현재 인덱스에 정확한 언어 비율이 없습니다.' : '',
      '',
      topics.length > 0 ? `**주요 기술/주제**: ${topics.join(', ')}` : '',
      ...techSections.map((section) => `- **${section.title}**: ${section.summary}`),
      '',
      '언어 비율은 GitHub Linguist 기준이며, 각 기술의 역할은 공개 README에서 확인되는 내용만 바탕으로 설명했습니다.',
    ]);
  }

  return joinMarkdownLines([
    `**Language breakdown for ${project.name}**`,
    '',
    ...languages.map(
      (item) => `- **${item.name} ${item.percentage}%** — ${describeLanguageRole(item.name, 'en', project)}`
    ),
    languages.length === 0 ? '- No exact language percentages are available in the current index.' : '',
    '',
    topics.length > 0 ? `**Main technologies/topics**: ${topics.join(', ')}` : '',
    ...techSections.map((section) => `- **${section.title}**: ${section.summary}`),
    '',
    'The percentages follow GitHub Linguist byte counts; the role of each technology is described only where the public README supports it.',
  ]);
}

function buildGrowthAnswer(project: IndexedGithubProject, language: 'ko' | 'en') {
  const category = inferProjectCategory(project);
  const languageSummary = formatLanguageSummary(project.metadata, 3);
  const topics = getMetadataStringArray(project.metadata, 'topics').slice(0, 5);
  const homepage = getMetadataString(project.metadata, 'homepage');
  const readmeSections = getReadmeSectionNames(project, language);

  if (language === 'ko') {
    return [
      `**${project.name}**이 개발 성장 흐름에서 보여주는 포인트는 공개 저장소 근거로 보면 세 가지입니다.`,
      '',
      `1. **영역 확장** — 이 프로젝트는 ${category.ko} 성격이 강합니다. 같은 포트폴리오 안에서도 문제 영역을 넓혀 간 흔적을 보여줍니다.`,
      `2. **구현 범위** — ${languageSummary || '여러 구현 요소'}를 사용했고${topics.length > 0 ? `, ${topics.join(', ')} 같은 주제를 함께 다룹니다` : ''}. 단일 화면 구현보다 제품 구조와 기술 선택을 함께 다룬 프로젝트로 볼 수 있습니다.`,
      `3. **제품화 경험** — ${homepage ? '공개 배포 주소가 있어 구현을 실제 사용 가능한 형태까지 연결했습니다.' : 'README와 저장소 구조를 통해 구현과 실행 방법을 문서화했습니다.'}${readmeSections.length >= 4 ? ' README도 여러 섹션으로 나뉘어 있어 기능·구조·운영 정보를 함께 남겼습니다.' : ''}`,
      '',
      '따라서 이 프로젝트의 의미를 단순히 “새 기술을 하나 더 썼다”기보다, 새로운 도메인에서 구현 범위와 제품 완성도를 넓힌 증거로 보는 편이 정확합니다.',
    ].join('\n');
  }

  return [
    `From the public repository evidence, **${project.name}** shows three useful parts of Oosu's development trajectory.`,
    '',
    `1. **Domain expansion** — The project is primarily a ${category.en} project, extending the portfolio into a distinct problem space.`,
    `2. **Implementation range** — It uses ${languageSummary || 'multiple implementation layers'}${topics.length > 0 ? ` and covers topics such as ${topics.join(', ')}` : ''}, showing work beyond a single UI surface.`,
    `3. **Productization** — ${homepage ? 'It has a public deployment, connecting implementation work to a usable product surface.' : 'Its README and repository structure document how the implementation is organized and used.'}${readmeSections.length >= 4 ? ' The README also separates multiple functional and operational concerns.' : ''}`,
    '',
    'So the strongest growth signal is not simply adopting another technology; it is expanding the kind of problem solved while carrying implementation through to a documented product or system.',
  ].join('\n');
}

function selectSourceChunkIds(
  project: IndexedGithubProject,
  intent: GithubProjectQuestionIntent
) {
  const overview = [project.overviewChunk.chunkId];
  if (intent === 'languages') {
    return [
      ...overview,
      ...selectReadmeChunks(project, 3, /tech|stack|architecture|build|install|deploy|기술|구조|설치|배포/i).map(
        (chunk) => chunk.chunkId
      ),
    ];
  }
  if (intent === 'readme') {
    return [...overview, ...project.readmeChunks.slice(0, 7).map((chunk) => chunk.chunkId)];
  }
  return [...overview, ...project.readmeChunks.slice(0, 4).map((chunk) => chunk.chunkId)];
}

function getReadmeHighlights(
  project: IndexedGithubProject,
  limit: number,
  preferredPattern?: RegExp,
  language: 'ko' | 'en' = 'en'
) {
  return selectReadmeChunks(project, limit, preferredPattern).map((chunk) => {
    const rawTitle =
      getMetadataString(chunk.metadata, 'readmeSection') ||
      chunk.title.replace(`${project.name} README · `, '');
    const title = localizeReadmeSectionTitle(rawTitle, language);

    return {
      title,
      summary: summarizeChunk(chunk.content, rawTitle, language),
    };
  });
}

function selectReadmeChunks(
  project: IndexedGithubProject,
  limit: number,
  preferredPattern?: RegExp
) {
  const unique = rankReadmeChunks(dedupeBySection(project.readmeChunks));
  if (!preferredPattern) return unique.slice(0, limit);
  const preferred = unique.filter((chunk) =>
    preferredPattern.test(`${chunk.title} ${getMetadataString(chunk.metadata, 'readmeSection')}`)
  );
  const rest = unique.filter((chunk) => !preferred.includes(chunk));
  return [...preferred, ...rest].slice(0, limit);
}

function dedupeBySection(chunks: GithubIndexedChunk[]) {
  const seen = new Set<string>();
  return chunks.filter((chunk) => {
    const section =
      getMetadataString(chunk.metadata, 'readmeSection') || chunk.title;
    const key = section.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getReadmeSectionNames(
  project: IndexedGithubProject,
  language: 'ko' | 'en' = 'en'
) {
  return rankReadmeChunks(dedupeBySection(project.readmeChunks))
    .map((chunk) => {
      const title =
        getMetadataString(chunk.metadata, 'readmeSection') ||
        chunk.title.replace(`${project.name} README · `, '');
      return localizeReadmeSectionTitle(title, language);
    })
    .filter(Boolean);
}

function summarizeChunk(
  content: string,
  sectionTitle = '',
  language: 'ko' | 'en' = 'en'
) {
  const cleaned = removeLeadingDuplicateSectionTitle(
    content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
      .replace(/[#>*_|]/g, ' ')
    .replace(/\s+/g, ' ')
      .trim(),
    sectionTitle
  );
  const knownKoreanSummary =
    language === 'ko' ? summarizeKnownEnglishSection(sectionTitle) : null;
  if (knownKoreanSummary) return knownKoreanSummary;

  if (!cleaned) {
    return language === 'ko'
      ? 'README에 이 섹션의 구현 정보가 정리되어 있습니다.'
      : 'The README documents implementation details for this section.';
  }

  if (isListLikeSummary(cleaned)) {
    return cleaned.slice(0, 420).trim();
  }

  const sentence = cleaned.match(/^.{1,260}?(?:[.!?](?=\s|$)|$)/)?.[0] ?? cleaned;
  return sentence.slice(0, 260).trim();
}

function removeLeadingDuplicateSectionTitle(content: string, sectionTitle: string) {
  const cleaned = content.trim();
  if (!sectionTitle) return cleaned;

  const titlePattern = escapeRegExp(sectionTitle.trim());
  return cleaned
    .replace(new RegExp(`^${titlePattern}\\s*(?:[-—:：])?\\s*`, 'i'), '')
    .trim();
}

function splitSummaryLines(summary: string) {
  const normalized = summary.trim();
  if (!normalized) return [];

  const numberedItems = Array.from(
    normalized.matchAll(/(?:^|\s)(\d+)\.\s+(.+?)(?=\s+\d+\.\s+|$)/g)
  )
    .map((match) => match[2]?.trim())
    .filter(Boolean);
  if (numberedItems.length >= 2) return numberedItems.slice(0, 5);

  const bulletSource = normalized.replace(/^[-•]\s*/, '');
  const bulletItems = bulletSource
    .split(/\s+[-•]\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (bulletItems.length >= 2) return bulletItems.slice(0, 6);

  return [normalized];
}

function isListLikeSummary(summary: string) {
  return /(?:^|\s)\d+\.\s+\S/.test(summary) || /(?:^|\s)[-•]\s+\S/.test(summary);
}

function getKoreanProjectOverviewHighlights(project: IndexedGithubProject) {
  return KOREAN_PROJECT_OVERVIEW_HIGHLIGHTS[project.name] ?? [];
}

function localizeReadmeSectionTitle(title: string, language: 'ko' | 'en') {
  if (language !== 'ko') return title;
  const normalized = title.trim().toLowerCase();
  const mapped: Record<string, string> = {
    introduction: '프로젝트 소개',
    overview: '개요',
    architecture: '아키텍처',
    'what is implemented': '구현된 기능',
    'measured highlights': '측정 결과',
    'browser reliability runtime': '브라우저 안정성 런타임',
    'synthetic workflows': '합성 워크플로우',
    'product preview': '제품 미리보기',
    'product preview / 제품 미리보기': '제품 미리보기',
    'why i built it / 만든 이유': '만든 이유',
    'english executive summary': '요약',
    'what it demonstrates': '검증한 내용',
    'prototype lineage / 연결된 실험과 후속 구현': '연결된 실험과 후속 구현',
    'current architecture': '현재 아키텍처',
    '현재 아키텍처': '현재 아키텍처',
    'llm과 보고': 'LLM과 보고',
    '저장소 구조': '저장소 구조',
    'portfolio evidence preview': '포트폴리오 증거 미리보기',
  };
  return mapped[normalized] ?? title;
}

function summarizeKnownEnglishSection(sectionTitle: string) {
  const normalized = sectionTitle.trim().toLowerCase();
  if (normalized === 'measured highlights') {
    return '결정론적 복구율, 정책 준수율, 텍스트 전용 LLM과 스크린샷 기반 VLM 비교 결과를 측정 지표로 정리합니다.';
  }
  if (normalized === 'what is implemented') {
    return '합성 워크플로우 앱, 실패 변형 엔진, Playwright 실행기, 복구 랭킹, 정책 게이트, trace viewer 등 실제 구현 범위를 정리합니다.';
  }
  if (normalized === 'browser reliability runtime') {
    return '브라우저 자동화가 실패했을 때 실패 원인 진단, 정책 기반 복구 선택, 실행, 검증까지 이어지는 런타임의 목적을 설명합니다.';
  }
  if (normalized === 'architecture') {
    return '입력, 검증, 실행, 저장, 화면 표현이 어떤 계층으로 분리되어 있는지 설명합니다.';
  }
  if (normalized === 'product preview') {
    return '공개 데모 화면을 통해 사용자가 어떤 제품 흐름을 보게 되는지 보여줍니다.';
  }
  if (normalized === 'portfolio evidence preview') {
    return '포트폴리오에서 빠르게 확인할 수 있는 대표 화면과 검증 근거를 보여줍니다.';
  }
  if (normalized === 'what it demonstrates') {
    return '이 저장소가 보여주는 핵심 기능, 구조, 평가 방식, 제품화 범위를 요약합니다.';
  }
  if (normalized === 'english executive summary') {
    return '프로젝트의 목적, 핵심 기능, 공개 데모, 구현 범위를 요약합니다.';
  }
  return null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rankReadmeChunks(chunks: GithubIndexedChunk[]) {
  return [...chunks].sort((left, right) => {
    const scoreDifference =
      readmeSectionScore(right) - readmeSectionScore(left);
    if (scoreDifference !== 0) return scoreDifference;
    return left.chunkId.localeCompare(right.chunkId, undefined, {
      numeric: true,
    });
  });
}

function readmeSectionScore(chunk: GithubIndexedChunk) {
  const title = `${getMetadataString(chunk.metadata, 'readmeSection')} ${chunk.title}`.toLowerCase();

  if (/\boverview\b|개요/.test(title)) return 120;
  if (
    /core experience|core capabilities|current capabilities|주요 기능|product flow|image analysis pipeline|video analysis pipeline/.test(
      title
    )
  ) {
    return 115;
  }
  if (
    /architecture|구조|data persistence|server 연동|search and retrieval|semantic action timeline|hierarchical classifier routing/.test(
      title
    )
  ) {
    return 110;
  }
  if (/\bapi\b|주요 라우트|model stack|\bstack\b|ai behavior/.test(title)) {
    return 105;
  }
  if (
    /solutions implemented|adaptive hls|viewport-aware|cache|performance problem|seek-friendly|product preview|interface/.test(
      title
    )
  ) {
    return 95;
  }
  if (/deployment|build|run|live site|from prompt to production/.test(title)) {
    return 80;
  }
  if (/why i built|why bother|문제의식|receipts/.test(title)) return 70;
  if (/screenshots|reference|result guide|validation metrics|training/.test(title)) {
    return 55;
  }
  if (
    /local development|development|environment|install|configure|start|시작하기|설치|프로젝트 실행|privacy|open-set warning/.test(
      title
    )
  ) {
    return 20;
  }

  return 60;
}

function getDescription(project: IndexedGithubProject, language: 'ko' | 'en') {
  if (language === 'ko') {
    const localized = KOREAN_PROJECT_DESCRIPTIONS[project.name];
    if (localized) return ensureSentence(localized);
  }

  const description = getMetadataString(project.metadata, 'description');
  if (description) return language === 'ko' ? ensureSentence(description) : description;
  return language === 'ko'
    ? '공개 GitHub 저장소에서 목적과 구현 내용을 확인할 수 있는 프로젝트입니다.'
    : 'is documented through its public GitHub repository and README.';
}

function ensureSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /[.!?。！？다요음임됨함됨니다]$/.test(trimmed)
    ? trimmed
    : `${trimmed}.`;
}

function descriptionEn(project: IndexedGithubProject) {
  const description = getMetadataString(project.metadata, 'description');
  if (!description) {
    return 'is documented through its public GitHub repository and README.';
  }
  return `is described in the repository as: ${description}`;
}

function formatLanguageSummary(metadata: Record<string, unknown>, limit: number) {
  return getLanguages(metadata)
    .slice(0, limit)
    .map((item) => `${item.name} ${item.percentage}%`)
    .join(', ');
}

function getLanguages(metadata: Record<string, unknown>) {
  const value = metadata.languages;
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = (item as Record<string, unknown>).name;
      const percentage = (item as Record<string, unknown>).percentage;
      if (typeof name !== 'string' || typeof percentage !== 'number') return null;
      return { name, percentage };
    })
    .filter((item): item is { name: string; percentage: number } => Boolean(item));
}

function describeLanguageRole(
  languageName: string,
  language: 'ko' | 'en',
  project: IndexedGithubProject
) {
  const roles: Record<string, { ko: string; en: string }> = {
    TypeScript: {
      ko: '타입 안정성을 갖춘 웹 애플리케이션 로직과 UI 구현에 주로 사용됩니다.',
      en: 'primarily supports typed web application logic and UI implementation.',
    },
    JavaScript: {
      ko: '브라우저 및 런타임의 핵심 동작과 인터랙션 구현을 담당합니다.',
      en: 'drives the core browser/runtime behavior and interactions.',
    },
    HTML: {
      ko: '페이지 구조와 정적 콘텐츠 계층을 구성합니다.',
      en: 'defines the page structure and static content layer.',
    },
    CSS: {
      ko: '시각 스타일과 레이아웃 표현을 담당합니다.',
      en: 'handles visual styling and layout presentation.',
    },
    Python: {
      ko: 'AI·데이터 처리 또는 백엔드 보조 로직에 사용되는 비중입니다.',
      en: 'supports AI/data processing or backend-oriented logic.',
    },
    'C++': {
      ko: '네이티브 성능과 서버·시스템 계층 구현에 중심적으로 사용됩니다.',
      en: 'is used for native performance and server/system-level implementation.',
    },
    CMake: {
      ko: 'C/C++ 빌드 구성과 의존성·타깃 관리를 담당합니다.',
      en: 'manages C/C++ build configuration, dependencies, and targets.',
    },
    Dockerfile: {
      ko: '컨테이너 빌드와 실행 환경 재현을 담당합니다.',
      en: 'defines reproducible container build and runtime environments.',
    },
    Shell: {
      ko: '개발·빌드·배포 자동화 스크립트에 사용됩니다.',
      en: 'supports development, build, and deployment automation.',
    },
    Dart: {
      ko: 'Flutter 기반 크로스플랫폼 클라이언트 구현의 중심 언어입니다.',
      en: 'is the primary language for the Flutter cross-platform client.',
    },
    Swift: {
      ko: 'iOS·Apple 플랫폼의 네이티브 앱 구현에 사용됩니다.',
      en: 'implements the native iOS/Apple-platform application layer.',
    },
    Java: {
      ko: '서버 애플리케이션과 백엔드 비즈니스 로직 구현에 사용됩니다.',
      en: 'implements the server application and backend business logic.',
    },
    Ruby: {
      ko: 'Apple 플랫폼 빌드·의존성 도구 등 보조 자동화에 사용됩니다.',
      en: 'supports Apple-platform build or dependency tooling.',
    },
    Kotlin: {
      ko: 'Android 네이티브 연동 계층에 사용되는 언어입니다.',
      en: 'supports the Android native integration layer.',
    },
    C: {
      ko: '네이티브 라이브러리 또는 저수준 연동 코드에 사용됩니다.',
      en: 'supports native libraries or lower-level integration code.',
    },
    'Objective-C': {
      ko: 'Apple 플랫폼의 네이티브 호환·연동 계층에 사용됩니다.',
      en: 'supports native compatibility/integration on Apple platforms.',
    },
  };
  const role = roles[languageName];
  if (role) return role[language];
  const primary = getMetadataString(project.metadata, 'primaryLanguage');
  if (language === 'ko') {
    return primary === languageName
      ? '저장소의 주 언어로 핵심 구현을 담당합니다.'
      : '저장소의 보조 구현 또는 도구 계층에 사용됩니다.';
  }
  return primary === languageName
    ? 'is the repository’s primary implementation language.'
    : 'supports a secondary implementation or tooling layer.';
}

function inferProjectCategory(project: IndexedGithubProject) {
  const text = [
    getMetadataString(project.metadata, 'description'),
    ...getMetadataStringArray(project.metadata, 'topics'),
    ...getLanguages(project.metadata).map((item) => item.name),
  ]
    .join(' ')
    .toLowerCase();

  if (/clip|vision|multimodal|ai|pytorch|classification|semantic/.test(text)) {
    return { ko: 'AI·멀티모달 제품', en: 'AI/multimodal product' };
  }
  if (/flutter|dart|swift|ios|watch/.test(text)) {
    return { ko: '모바일·네이티브 클라이언트', en: 'mobile/native client' };
  }
  if (/c\+\+|boost|spring|java|rest-api|backend/.test(text)) {
    return { ko: '백엔드·시스템', en: 'backend/system' };
  }
  if (/video|hls|stream|media|cdn/.test(text)) {
    return { ko: '미디어·스트리밍 웹', en: 'media/streaming web' };
  }
  if (/seo|experiment|research|analytics|observatory/.test(text)) {
    return { ko: '실험·분석 도구', en: 'experimentation/analytics tool' };
  }
  if (/travel|map|weather|itinerary/.test(text)) {
    return { ko: '지도·여행 제품', en: 'map/travel product' };
  }
  return { ko: '웹·제품 개발', en: 'web/product engineering' };
}

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getProjectStartedAt(metadata: Record<string, unknown>) {
  return (
    getMetadataString(metadata, 'firstCommitAt') ||
    getMetadataString(metadata, 'createdAt')
  );
}

function getMetadataStringArray(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
}
