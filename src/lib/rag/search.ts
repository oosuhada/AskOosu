import { getRagTopK, getPositiveIntEnv } from './config';
import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import type { RagChunkMetadata } from './types';

const DEFAULT_PREVIEW_LENGTH = 320;

export type RagChunkSearchInput = {
  q?: string;
  limit?: number;
  entityId?: string;
  includePrivate?: boolean;
  debug?: boolean;
};

export type RagChunkSearchQuery = {
  q: string;
  limit: number;
  entityId?: string;
  includePrivate: boolean;
  debug: boolean;
};

export type RagChunkRankingDetail = {
  searchMode: 'postgres_fts' | 'ilike' | 'entity_filter';
  textRank: number;
  titleScore: number;
  sectionPathScore: number;
  entityScore: number;
  contentScore: number;
  visibilityScore: number;
  todoPenalty: number;
};

export type RagChunkSearchResult = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[];
  score: number;
  contentPreview: string;
  metadata: RagChunkMetadata;
  has_todo: boolean;
  visibility: string;
  ranking?: RagChunkRankingDetail;
};

export type RagChunkSearchPayload = {
  ok: boolean;
  query: RagChunkSearchQuery;
  results: RagChunkSearchResult[];
  warnings: string[];
  searchMode?: RagChunkRankingDetail['searchMode'];
  error?: string;
};

type RagChunkSearchRow = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[] | null;
  content: string;
  metadata: RagChunkMetadata | null;
  has_todo: boolean;
  visibility: string;
  score: number | string;
  text_rank: number | string;
  title_score: number | string;
  section_path_score: number | string;
  entity_score: number | string;
  content_score: number | string;
  visibility_score: number | string;
  todo_penalty: number | string;
};

export async function searchRagChunks(
  input: RagChunkSearchInput
): Promise<RagChunkSearchPayload> {
  const query = normalizeSearchInput(input);
  const warnings: string[] = [];

  if (!hasPostgresDatabaseUrl()) {
    return {
      ok: false,
      query,
      results: [],
      warnings: ['DATABASE_URL or POSTGRES_URL is required for RAG search.'],
      error: 'Database URL is not configured.',
    };
  }

  if (!query.q && !query.entityId) {
    return {
      ok: false,
      query,
      results: [],
      warnings: ['q or entityId is required.'],
      error: 'q or entityId is required.',
    };
  }

  const searchMode = query.q ? 'postgres_fts' : 'entity_filter';
  let rows: RagChunkSearchRow[] = [];
  let resolvedSearchMode: RagChunkRankingDetail['searchMode'] = searchMode;

  try {
    rows = query.q
      ? await searchWithPostgresFullText(query)
      : await searchWithEntityFilter(query);
  } catch (error) {
    if (!query.q) {
      return failedSearchPayload({ query, error, warnings });
    }

    warnings.push(
      'PostgreSQL full-text search failed; used ILIKE fallback ranking.'
    );

    try {
      rows = await searchWithIlikeFallback(query);
      resolvedSearchMode = 'ilike';
    } catch (fallbackError) {
      return failedSearchPayload({
        query,
        error: fallbackError,
        warnings,
      });
    }
  }

  if (rows.length === 0) {
    warnings.push('No rag_chunks matched the search query.');
  }

  return {
    ok: true,
    query,
    results: rows.map((row) =>
      rowToSearchResult({
        row,
        q: query.q,
        debug: query.debug,
        searchMode: resolvedSearchMode,
      })
    ),
    warnings,
    searchMode: resolvedSearchMode,
  };
}

export function normalizeSearchLimit(value: number | undefined) {
  const fallback = getRagTopK();
  const maxLimit = getPositiveIntEnv('ASKOOSU_RAG_MAX_SEARCH_LIMIT', 20);

  if (!value || !Number.isFinite(value) || value < 1) return fallback;
  return Math.min(Math.floor(value), maxLimit);
}

function normalizeSearchInput(input: RagChunkSearchInput): RagChunkSearchQuery {
  const q = input.q?.trim() ?? '';
  const entityId = input.entityId?.trim();

  return {
    q,
    limit: normalizeSearchLimit(input.limit),
    entityId: entityId || undefined,
    includePrivate: input.includePrivate ?? false,
    debug: input.debug ?? false,
  };
}

async function searchWithPostgresFullText(query: RagChunkSearchQuery) {
  const pool = await getPostgresPool();
  const likePattern = toLikePattern(query.q);
  const result = await pool.query<RagChunkSearchRow>(
    `
      WITH ranked AS (
        SELECT
          c.chunk_id,
          c.entity_id,
          c.title,
          c.section_path,
          c.content,
          c.metadata,
          c.has_todo,
          c.visibility,
          ts_rank_cd(
            to_tsvector('simple', coalesce(c.title, '') || ' ' || array_to_string(c.section_path, ' ') || ' ' || c.content),
            websearch_to_tsquery('simple', $1)
          )::double precision AS text_rank,
          CASE WHEN c.title ILIKE $2 ESCAPE '\\' THEN 8 ELSE 0 END::double precision AS title_score,
          CASE WHEN array_to_string(c.section_path, ' ') ILIKE $2 ESCAPE '\\' THEN 5 ELSE 0 END::double precision AS section_path_score,
          CASE WHEN $5::text IS NOT NULL AND c.entity_id = $5 THEN 7 ELSE 0 END::double precision AS entity_score,
          CASE WHEN c.content ILIKE $2 ESCAPE '\\' THEN 2 ELSE 0 END::double precision AS content_score,
          CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END::double precision AS visibility_score,
          CASE WHEN c.has_todo THEN -2 ELSE 0 END::double precision AS todo_penalty,
          c.updated_at
        FROM rag_chunks c
        WHERE
          ($4::boolean OR c.visibility = 'public')
          AND ($5::text IS NULL OR c.entity_id = $5)
          AND (
            to_tsvector('simple', coalesce(c.title, '') || ' ' || array_to_string(c.section_path, ' ') || ' ' || c.content)
              @@ websearch_to_tsquery('simple', $1)
            OR c.title ILIKE $2 ESCAPE '\\'
            OR array_to_string(c.section_path, ' ') ILIKE $2 ESCAPE '\\'
            OR c.content ILIKE $2 ESCAPE '\\'
          )
      )
      SELECT
        chunk_id,
        entity_id,
        title,
        section_path,
        content,
        metadata,
        has_todo,
        visibility,
        text_rank,
        title_score,
        section_path_score,
        entity_score,
        content_score,
        visibility_score,
        todo_penalty,
        (
          text_rank * 10
          + title_score
          + section_path_score
          + entity_score
          + content_score
          + visibility_score
          + todo_penalty
        )::double precision AS score
      FROM ranked
      ORDER BY score DESC, updated_at DESC, title ASC
      LIMIT $3
    `,
    [
      query.q,
      likePattern,
      query.limit,
      query.includePrivate,
      query.entityId ?? null,
    ]
  );

  return result.rows;
}

async function searchWithIlikeFallback(query: RagChunkSearchQuery) {
  const pool = await getPostgresPool();
  const likePattern = toLikePattern(query.q);
  const result = await pool.query<RagChunkSearchRow>(
    `
      WITH ranked AS (
        SELECT
          c.chunk_id,
          c.entity_id,
          c.title,
          c.section_path,
          c.content,
          c.metadata,
          c.has_todo,
          c.visibility,
          0::double precision AS text_rank,
          CASE WHEN c.title ILIKE $2 ESCAPE '\\' THEN 8 ELSE 0 END::double precision AS title_score,
          CASE WHEN array_to_string(c.section_path, ' ') ILIKE $2 ESCAPE '\\' THEN 5 ELSE 0 END::double precision AS section_path_score,
          CASE WHEN $5::text IS NOT NULL AND c.entity_id = $5 THEN 7 ELSE 0 END::double precision AS entity_score,
          CASE WHEN c.content ILIKE $2 ESCAPE '\\' THEN 2 ELSE 0 END::double precision AS content_score,
          CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END::double precision AS visibility_score,
          CASE WHEN c.has_todo THEN -2 ELSE 0 END::double precision AS todo_penalty,
          c.updated_at
        FROM rag_chunks c
        WHERE
          ($4::boolean OR c.visibility = 'public')
          AND ($5::text IS NULL OR c.entity_id = $5)
          AND (
            c.title ILIKE $2 ESCAPE '\\'
            OR array_to_string(c.section_path, ' ') ILIKE $2 ESCAPE '\\'
            OR c.content ILIKE $2 ESCAPE '\\'
          )
      )
      SELECT
        chunk_id,
        entity_id,
        title,
        section_path,
        content,
        metadata,
        has_todo,
        visibility,
        text_rank,
        title_score,
        section_path_score,
        entity_score,
        content_score,
        visibility_score,
        todo_penalty,
        (
          title_score
          + section_path_score
          + entity_score
          + content_score
          + visibility_score
          + todo_penalty
        )::double precision AS score
      FROM ranked
      ORDER BY score DESC, updated_at DESC, title ASC
      LIMIT $3
    `,
    [
      query.q,
      likePattern,
      query.limit,
      query.includePrivate,
      query.entityId ?? null,
    ]
  );

  return result.rows;
}

async function searchWithEntityFilter(query: RagChunkSearchQuery) {
  const pool = await getPostgresPool();
  const result = await pool.query<RagChunkSearchRow>(
    `
      WITH ranked AS (
        SELECT
          c.chunk_id,
          c.entity_id,
          c.title,
          c.section_path,
          c.content,
          c.metadata,
          c.has_todo,
          c.visibility,
          0::double precision AS text_rank,
          0::double precision AS title_score,
          0::double precision AS section_path_score,
          CASE WHEN c.entity_id = $3 THEN 7 ELSE 0 END::double precision AS entity_score,
          0::double precision AS content_score,
          CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END::double precision AS visibility_score,
          CASE WHEN c.has_todo THEN -2 ELSE 0 END::double precision AS todo_penalty,
          c.updated_at
        FROM rag_chunks c
        WHERE
          ($2::boolean OR c.visibility = 'public')
          AND c.entity_id = $3
      )
      SELECT
        chunk_id,
        entity_id,
        title,
        section_path,
        content,
        metadata,
        has_todo,
        visibility,
        text_rank,
        title_score,
        section_path_score,
        entity_score,
        content_score,
        visibility_score,
        todo_penalty,
        (
          entity_score
          + visibility_score
          + todo_penalty
        )::double precision AS score
      FROM ranked
      ORDER BY score DESC, updated_at DESC, title ASC
      LIMIT $1
    `,
    [query.limit, query.includePrivate, query.entityId]
  );

  return result.rows;
}

function rowToSearchResult({
  row,
  q,
  debug,
  searchMode,
}: {
  row: RagChunkSearchRow;
  q: string;
  debug: boolean;
  searchMode: RagChunkRankingDetail['searchMode'];
}): RagChunkSearchResult {
  const ranking: RagChunkRankingDetail = {
    searchMode,
    textRank: toNumber(row.text_rank),
    titleScore: toNumber(row.title_score),
    sectionPathScore: toNumber(row.section_path_score),
    entityScore: toNumber(row.entity_score),
    contentScore: toNumber(row.content_score),
    visibilityScore: toNumber(row.visibility_score),
    todoPenalty: toNumber(row.todo_penalty),
  };

  return {
    chunk_id: row.chunk_id,
    entity_id: row.entity_id,
    title: row.title,
    section_path: row.section_path ?? [],
    score: toNumber(row.score),
    contentPreview: createContentPreview(row.content, q),
    metadata: row.metadata ?? {},
    has_todo: row.has_todo,
    visibility: row.visibility,
    ...(debug ? { ranking } : {}),
  };
}

function failedSearchPayload({
  query,
  error,
  warnings,
}: {
  query: RagChunkSearchQuery;
  error: unknown;
  warnings: string[];
}): RagChunkSearchPayload {
  const message =
    error instanceof Error ? error.message : 'RAG search query failed.';

  return {
    ok: false,
    query,
    results: [],
    warnings,
    error: message,
  };
}

function createContentPreview(content: string, q: string) {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  if (!q) return trimPreview(normalizedContent);

  const queryIndex = normalizedContent.toLowerCase().indexOf(q.toLowerCase());
  if (queryIndex < 0) return trimPreview(normalizedContent);

  const start = Math.max(0, queryIndex - 80);
  const preview = normalizedContent.slice(
    start,
    start + DEFAULT_PREVIEW_LENGTH
  );

  return `${start > 0 ? '...' : ''}${trimPreview(preview)}`;
}

function trimPreview(value: string) {
  if (value.length <= DEFAULT_PREVIEW_LENGTH) return value;
  return `${value.slice(0, DEFAULT_PREVIEW_LENGTH).trim()}...`;
}

function toLikePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

function toNumber(value: number | string) {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
