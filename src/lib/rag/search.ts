import {
  getRagHybridWeights,
  getRagRetrievalMode,
  getRagTopK,
  getPositiveIntEnv,
} from './config';
import {
  getRagDatabaseStatus,
  searchStoredRagChunkRowsByEmbedding,
  type StoredRagChunkEmbeddingSearchRow,
} from './database';
import { embedRagQuery, hasEmbeddingCredentials } from './embeddings';
import { NOTION_ENTITY_ALIAS_MAP } from './notion-chunks';
import { getCachedRagSearch, upsertCachedRagSearch } from './search-cache';
import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import type {
  RagChunkMetadata,
  RagHybridWeights,
  RagRetrievalMode,
} from './types';

const DEFAULT_PREVIEW_LENGTH = 320;
const DEFAULT_RRF_K = 60;
const DEFAULT_LOW_SCORE_WARNING_THRESHOLD = 1;

export type RagChunkSearchInput = {
  q?: string;
  limit?: number;
  entityId?: string;
  language?: 'ko' | 'en' | null;
  includePrivate?: boolean;
  includeContent?: boolean;
  debug?: boolean;
};

export type RagChunkSearchQuery = {
  q: string;
  limit: number;
  entityId?: string;
  language?: 'ko' | 'en';
  includePrivate: boolean;
  includeContent: boolean;
  debug: boolean;
  retrievalMode: RagRetrievalMode;
  hybridWeights: RagHybridWeights;
};

export type RagChunkRankingDetail = {
  searchMode:
    | 'postgres_fts'
    | 'ilike'
    | 'entity_filter'
    | 'embedding'
    | 'hybrid';
  textRank: number;
  titleScore: number;
  sectionPathScore: number;
  entityScore: number;
  contentScore: number;
  visibilityScore: number;
  todoPenalty: number;
  embeddingScore?: number;
  lexicalRank?: number;
  vectorRank?: number;
  entityRank?: number;
  rrfScore?: number;
  finalScore?: number;
  entityBoost?: number;
  intentBoost?: number;
  freshnessBoost?: number;
};

export type RagChunkSearchResult = {
  chunk_id: string;
  entity_id: string | null;
  title: string;
  section_path: string[];
  score: number;
  contentPreview: string;
  content?: string;
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
  freshness?: string | null;
  confidence?: number | string | null;
  updated_at?: Date | string | null;
  embedding_score?: number | string | null;
  lexical_rank?: number | string | null;
  vector_rank?: number | string | null;
  entity_rank?: number | string | null;
  rrf_score?: number | string | null;
  final_score?: number | string | null;
  entity_boost?: number | string | null;
  intent_boost?: number | string | null;
  freshness_boost?: number | string | null;
  ranking_search_mode?:
    | 'postgres_fts'
    | 'ilike'
    | 'entity_filter'
    | 'embedding'
    | 'hybrid';
};

type SearchListName = 'lexical' | 'vector' | 'entity';

type WeightedResultList<T extends { chunk_id: string }> = {
  name: SearchListName;
  weight: number;
  results: T[];
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

  const cachedSearch = await getCachedRagSearch(query).catch((error) => {
    warnings.push('RAG search cache read failed; used live DB search.');
    console.warn('Unable to read RAG search cache:', error);
    return null;
  });

  if (cachedSearch) {
    return {
      ...cachedSearch,
      warnings: mergeWarnings(cachedSearch.warnings, warnings),
    };
  }

  let rows: RagChunkSearchRow[] = [];
  let resolvedSearchMode: RagChunkRankingDetail['searchMode'] = query.q
    ? query.retrievalMode === 'embedding'
      ? 'embedding'
      : query.retrievalMode === 'hybrid'
        ? 'hybrid'
        : 'postgres_fts'
    : 'entity_filter';

  try {
    if (!query.q) {
      rows = await searchWithEntityFilter(query);
    } else if (query.retrievalMode === 'embedding') {
      rows = await searchWithEmbedding(query, warnings);

      if (rows.length === 0) {
        warnings.push(
          'Embedding retrieval returned no results; used lexical fallback ranking.'
        );
        rows = await searchLexically(
          { ...query, limit: getExpandedLimit(query.limit) },
          warnings
        );
        resolvedSearchMode = getLexicalSearchMode(rows);
      }
    } else if (query.retrievalMode === 'hybrid') {
      rows = await searchWithHybridRetrieval(query, warnings);
    } else {
      rows = await searchLexically(
        { ...query, limit: getExpandedLimit(query.limit) },
        warnings
      );
      resolvedSearchMode = getLexicalSearchMode(rows);
    }
  } catch (error) {
    return failedSearchPayload({ query, error, warnings });
  }

  if (query.q) {
    const sourceAwareRows = await searchWithSourceAwareRows(query).catch(
      (error) => {
        warnings.push('Source-aware RAG retrieval failed; used base ranking.');
        console.warn('Source-aware RAG retrieval failed:', error);
        return [] as RagChunkSearchRow[];
      }
    );
    rows = dedupeRows([...rows, ...sourceAwareRows]);
  }

  if (rows.length === 0) {
    warnings.push('No rag_chunks matched the search query.');
  }

  rows = rankRowsWithSourceAwareBoosts(rows, query).slice(0, query.limit);

  const results = rows.map((row) =>
    rowToSearchResult({
      row,
      q: query.q,
      includeContent: query.includeContent,
      debug: query.debug,
      searchMode: resolvedSearchMode,
    })
  );
  warnings.push(...getAnswerabilityWarnings(results));

  const payload = {
    ok: true,
    query,
    results,
    warnings,
    searchMode: resolvedSearchMode,
  };

  void upsertCachedRagSearch({ query, payload }).catch((error) => {
    console.warn('Unable to write RAG search cache:', error);
  });

  return payload;
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
  const language =
    input.language === 'ko' || input.language === 'en'
      ? input.language
      : undefined;

  return {
    q,
    limit: normalizeSearchLimit(input.limit),
    entityId: entityId || undefined,
    language,
    includePrivate: input.includePrivate ?? false,
    includeContent: input.includeContent ?? false,
    debug: input.debug ?? false,
    retrievalMode: getRagRetrievalMode(),
    hybridWeights: getRagHybridWeights(),
  };
}

async function searchLexically(query: RagChunkSearchQuery, warnings: string[]) {
  try {
    return await searchWithPostgresFullText(query);
  } catch (error) {
    warnings.push(
      'PostgreSQL full-text search failed; used ILIKE fallback ranking.'
    );
    console.warn('PostgreSQL full-text RAG search failed:', error);
    return searchWithIlikeFallback(query);
  }
}

function getLexicalSearchMode(rows: RagChunkSearchRow[]) {
  return rows.some((row) => row.ranking_search_mode === 'ilike')
    ? 'ilike'
    : 'postgres_fts';
}

async function searchWithPostgresFullText(query: RagChunkSearchQuery) {
  const pool = await getPostgresPool();
  const fullTextQuery = toFullTextQuery(query.q);
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
          c.freshness,
          c.confidence,
          ts_rank_cd(
            to_tsvector('simple', coalesce(c.title, '') || ' ' || array_to_string(c.section_path, ' ') || ' ' || c.content),
            websearch_to_tsquery('simple', $1)
          )::double precision AS text_rank,
          CASE WHEN c.title ILIKE $2 ESCAPE '\\' THEN 8 ELSE 0 END::double precision AS title_score,
          CASE WHEN array_to_string(c.section_path, ' ') ILIKE $2 ESCAPE '\\' THEN 5 ELSE 0 END::double precision AS section_path_score,
          CASE WHEN $4::text IS NOT NULL AND c.entity_id = $4 THEN 7 ELSE 0 END::double precision AS entity_score,
          CASE WHEN c.content ILIKE $2 ESCAPE '\\' THEN 2 ELSE 0 END::double precision AS content_score,
          CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END::double precision AS visibility_score,
          CASE WHEN c.has_todo THEN -2 ELSE 0 END::double precision AS todo_penalty,
          c.updated_at
        FROM rag_chunks c
        WHERE
          ($4::boolean OR c.visibility = 'public')
          AND ($5::text IS NULL OR c.entity_id = $5)
          AND ($6::text IS NULL OR c.language IS NULL OR c.language = $6)
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
        freshness,
        confidence,
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
      fullTextQuery,
      likePattern,
      query.limit,
      query.includePrivate,
      query.entityId ?? null,
      query.language ?? null,
    ]
  );

  return result.rows.map((row) => ({
    ...row,
    ranking_search_mode: 'postgres_fts' as const,
  }));
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
          c.freshness,
          c.confidence,
          0::double precision AS text_rank,
          CASE WHEN c.title ILIKE $1 ESCAPE '\\' THEN 8 ELSE 0 END::double precision AS title_score,
          CASE WHEN array_to_string(c.section_path, ' ') ILIKE $1 ESCAPE '\\' THEN 5 ELSE 0 END::double precision AS section_path_score,
          CASE WHEN $4::text IS NOT NULL AND c.entity_id = $4 THEN 7 ELSE 0 END::double precision AS entity_score,
          CASE WHEN c.content ILIKE $1 ESCAPE '\\' THEN 2 ELSE 0 END::double precision AS content_score,
          CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END::double precision AS visibility_score,
          CASE WHEN c.has_todo THEN -2 ELSE 0 END::double precision AS todo_penalty,
          c.updated_at
        FROM rag_chunks c
        WHERE
          ($3::boolean OR c.visibility = 'public')
          AND ($4::text IS NULL OR c.entity_id = $4)
          AND ($5::text IS NULL OR c.language IS NULL OR c.language = $5)
          AND (
            c.title ILIKE $1 ESCAPE '\\'
            OR array_to_string(c.section_path, ' ') ILIKE $1 ESCAPE '\\'
            OR c.content ILIKE $1 ESCAPE '\\'
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
        freshness,
        confidence,
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
      LIMIT $2
    `,
    [
      likePattern,
      query.limit,
      query.includePrivate,
      query.entityId ?? null,
      query.language ?? null,
    ]
  );

  return result.rows.map((row) => ({
    ...row,
    ranking_search_mode: 'ilike' as const,
  }));
}

async function searchWithSourceAwareRows(query: RagChunkSearchQuery) {
  const filters = getSourceAwareFilters(query.q);
  if (
    filters.sourceTypes.length === 0 &&
    filters.sourceCategories.length === 0 &&
    filters.surfaces.length === 0
  ) {
    return [];
  }

  const pool = await getPostgresPool();
  const likePatterns = toSourceAwareLikePatterns(query.q);
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
          c.freshness,
          c.confidence,
          0::double precision AS text_rank,
          CASE WHEN c.title ILIKE ANY($1::text[]) THEN 14 ELSE 0 END::double precision AS title_score,
          CASE WHEN array_to_string(c.section_path, ' ') ILIKE ANY($1::text[]) THEN 8 ELSE 0 END::double precision AS section_path_score,
          CASE WHEN $4::text IS NOT NULL AND c.entity_id = $4 THEN 7 ELSE 0 END::double precision AS entity_score,
          CASE WHEN c.content ILIKE ANY($1::text[]) THEN 4 ELSE 0 END::double precision AS content_score,
          CASE WHEN c.metadata->>'docId' ILIKE ANY($9::text[]) THEN 30 ELSE 0 END::double precision AS doc_id_score,
          CASE WHEN c.visibility = 'public' THEN 1.5 ELSE 0 END::double precision AS visibility_score,
          CASE WHEN c.has_todo THEN -2 ELSE 0 END::double precision AS todo_penalty,
          c.updated_at
        FROM rag_chunks c
        WHERE
          ($3::boolean OR c.visibility = 'public')
          AND ($4::text IS NULL OR c.entity_id = $4)
          AND ($5::text IS NULL OR c.language IS NULL OR c.language = $5)
          AND (
            c.metadata->>'sourceType' = ANY($6::text[])
            OR c.metadata->>'sourceCategory' = ANY($7::text[])
            OR c.metadata->>'surface' = ANY($8::text[])
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
        freshness,
        confidence,
        text_rank,
        title_score,
        section_path_score,
        entity_score,
        content_score,
        visibility_score,
        todo_penalty,
        (
          60
          + title_score
          + section_path_score
          + entity_score
          + content_score
          + doc_id_score
          + visibility_score
          + todo_penalty
        )::double precision AS score
      FROM ranked
      ORDER BY score DESC, updated_at DESC, title ASC
      LIMIT $2
    `,
    [
      likePatterns,
      getExpandedLimit(query.limit),
      query.includePrivate,
      query.entityId ?? null,
      query.language ?? null,
      filters.sourceTypes,
      filters.sourceCategories,
      filters.surfaces,
      toPreferredDocLikePatterns(query.q),
    ]
  );

  return result.rows.map((row) => ({
    ...row,
    ranking_search_mode: 'ilike' as const,
  }));
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
          c.freshness,
          c.confidence,
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
          AND ($4::text IS NULL OR c.language IS NULL OR c.language = $4)
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
        freshness,
        confidence,
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
    [query.limit, query.includePrivate, query.entityId, query.language ?? null]
  );

  return result.rows.map((row) => ({
    ...row,
    ranking_search_mode: 'entity_filter' as const,
  }));
}

async function searchWithEmbedding(
  query: RagChunkSearchQuery,
  warnings: string[]
) {
  if (!hasEmbeddingCredentials()) {
    warnings.push(
      'OpenAI embedding credentials are not configured; skipped vector search.'
    );
    return [];
  }

  const status = await getRagDatabaseStatus().catch((error) => {
    warnings.push('RAG vector status check failed; skipped vector search.');
    console.warn('Unable to read RAG vector status:', error);
    return null;
  });

  if (status && status.embeddingCount === 0) {
    warnings.push(
      'No vector embeddings exist in rag_chunks; skipped vector search.'
    );
    return [];
  }

  try {
    const embedding = await embedRagQuery(query.q);
    const rows = await searchStoredRagChunkRowsByEmbedding({
      embedding,
      limit: getExpandedLimit(query.limit),
      includePrivate: query.includePrivate,
      entityId: query.entityId,
      language: query.language,
    });

    if (rows.length === 0) {
      warnings.push('Vector search returned no matching rag_chunks.');
    }

    return rows.map(embeddingRowToSearchRow);
  } catch (error) {
    warnings.push('Vector search unavailable; skipped embedding retrieval.');
    console.warn('RAG vector search failed:', error);
    return [];
  }
}

async function searchWithHybridRetrieval(
  query: RagChunkSearchQuery,
  warnings: string[]
) {
  const detectedEntityIds = shouldSkipEntityBoost(query.q)
    ? []
    : detectMentionedEntityIds(query.q);
  const [lexicalRows, vectorRows, entityRows] = await Promise.all([
    searchLexically(
      { ...query, limit: getExpandedLimit(query.limit) },
      warnings
    ),
    searchWithEmbedding(query, warnings),
    searchWithEntityBoost(query, detectedEntityIds, warnings),
  ]);

  return reciprocalRankFusion<RagChunkSearchRow>(
    [
      {
        name: 'lexical',
        weight: query.hybridWeights.lexical,
        results: lexicalRows,
      },
      {
        name: 'vector',
        weight: query.hybridWeights.vector,
        results: vectorRows,
      },
      {
        name: 'entity',
        weight: query.hybridWeights.entity,
        results: entityRows,
      },
    ],
    {
      limit: query.limit,
      rrfK: DEFAULT_RRF_K,
      query: query.q,
      entityIds: detectedEntityIds,
      weights: query.hybridWeights,
    }
  );
}

async function searchWithEntityBoost(
  query: RagChunkSearchQuery,
  detectedEntityIds: string[],
  warnings: string[]
) {
  const entityIds = Array.from(
    new Set([query.entityId, ...detectedEntityIds].filter(Boolean))
  ) as string[];
  const rowGroups: RagChunkSearchRow[][] = [];

  for (const entityId of entityIds) {
    try {
      const rows = [
        ...(await searchWithEntityFilter({
          ...query,
          entityId,
          limit: getExpandedLimit(query.limit),
        })),
        ...(await searchWithEntityAliasRows(query, entityId)),
      ];
      rowGroups.push(
        dedupeRows(rows).sort((a, b) => toNumber(b.score) - toNumber(a.score))
      );
    } catch (error) {
      warnings.push(`Entity boost search failed for ${entityId}.`);
      console.warn(`RAG entity boost search failed for ${entityId}:`, error);
    }
  }

  return interleaveRows(rowGroups, getExpandedLimit(query.limit));
}

async function searchWithEntityAliasRows(
  query: RagChunkSearchQuery,
  entityId: string
) {
  const aliases = Object.values(NOTION_ENTITY_ALIAS_MAP).find(
    (entry) => entry.entityId === entityId
  )?.aliases;

  if (!aliases) return [];

  const rows: RagChunkSearchRow[] = [];
  const canonicalAliases = aliases
    .filter((alias) => normalizeAliasText(alias).length >= 3)
    .slice(0, 3);

  for (const alias of canonicalAliases) {
    rows.push(
      ...(await searchWithIlikeFallback({
        ...query,
        q: alias,
        entityId: undefined,
        limit: getExpandedLimit(query.limit),
      }))
    );
  }

  return rows.map((row) => ({
    ...row,
    entity_id: entityId,
    metadata: {
      ...(row.metadata ?? {}),
      boostedAliasEntityId: entityId,
      originalEntityId: row.entity_id,
    },
    entity_score: Math.max(toNumber(row.entity_score), 7),
    score: toNumber(row.score) + 7,
  }));
}

export function reciprocalRankFusion<T extends RagChunkSearchRow>(
  resultLists: WeightedResultList<T>[],
  options: {
    limit: number;
    rrfK?: number;
    query: string;
    entityIds: string[];
    weights: RagHybridWeights;
  }
): T[] {
  const candidates = new Map<
    string,
    {
      row: T;
      rrfScore: number;
      lexicalRank?: number;
      vectorRank?: number;
      entityRank?: number;
    }
  >();
  const rrfK = options.rrfK ?? DEFAULT_RRF_K;

  for (const list of resultLists) {
    list.results.forEach((row, index) => {
      const rank = index + 1;
      const existing = candidates.get(row.chunk_id);
      const candidate =
        existing ??
        ({
          row,
          rrfScore: 0,
        } satisfies {
          row: T;
          rrfScore: number;
          lexicalRank?: number;
          vectorRank?: number;
          entityRank?: number;
        });

      candidate.rrfScore += list.weight / (rrfK + rank);

      if (list.name === 'lexical') candidate.lexicalRank ??= rank;
      if (list.name === 'vector') candidate.vectorRank ??= rank;
      if (list.name === 'entity') candidate.entityRank ??= rank;

      if (toNumber(row.score) > toNumber(candidate.row.score)) {
        candidate.row = { ...candidate.row, ...row };
      }

      candidates.set(row.chunk_id, candidate);
    });
  }

  return Array.from(candidates.values())
    .map((candidate) => {
      const entityBoost = getEntityBoost(
        candidate.row,
        options.entityIds,
        options.weights
      );
      const intentBoost = getIntentBoost(
        candidate.row,
        options.query,
        options.weights
      );
      const freshnessBoost = getFreshnessBoost(candidate.row, options.weights);
      const finalScore =
        (candidate.rrfScore + entityBoost + intentBoost + freshnessBoost) * 100;

      return {
        ...candidate.row,
        score: Number(finalScore.toFixed(4)),
        ranking_search_mode: 'hybrid' as const,
        lexical_rank: candidate.lexicalRank,
        vector_rank: candidate.vectorRank,
        entity_rank: candidate.entityRank,
        rrf_score: Number(candidate.rrfScore.toFixed(6)),
        final_score: Number(finalScore.toFixed(4)),
        entity_boost: Number(entityBoost.toFixed(4)),
        intent_boost: Number(intentBoost.toFixed(4)),
        freshness_boost: Number(freshnessBoost.toFixed(4)),
      };
    })
    .sort((a, b) => toNumber(b.score) - toNumber(a.score))
    .slice(0, options.limit);
}

function rankRowsWithSourceAwareBoosts(
  rows: RagChunkSearchRow[],
  query: RagChunkSearchQuery
) {
  if (rows.length === 0 || !query.q) return rows;

  return rows
    .map((row) => {
      const intentBoost = getIntentBoost(row, query.q, query.hybridWeights);
      if (intentBoost <= 0) return row;

      return {
        ...row,
        score: toNumber(row.score) + intentBoost * 10,
        intent_boost: Math.max(toNumber(row.intent_boost ?? 0), intentBoost),
      };
    })
    .sort((left, right) => toNumber(right.score) - toNumber(left.score));
}

function rowToSearchResult({
  row,
  q,
  includeContent,
  debug,
  searchMode,
}: {
  row: RagChunkSearchRow;
  q: string;
  includeContent: boolean;
  debug: boolean;
  searchMode: RagChunkRankingDetail['searchMode'];
}): RagChunkSearchResult {
  const ranking: RagChunkRankingDetail = {
    searchMode: row.ranking_search_mode ?? searchMode,
    textRank: toNumber(row.text_rank),
    titleScore: toNumber(row.title_score),
    sectionPathScore: toNumber(row.section_path_score),
    entityScore: toNumber(row.entity_score),
    contentScore: toNumber(row.content_score),
    visibilityScore: toNumber(row.visibility_score),
    todoPenalty: toNumber(row.todo_penalty),
    ...(row.embedding_score !== undefined && row.embedding_score !== null
      ? { embeddingScore: toNumber(row.embedding_score) }
      : {}),
    ...(row.lexical_rank ? { lexicalRank: toNumber(row.lexical_rank) } : {}),
    ...(row.vector_rank ? { vectorRank: toNumber(row.vector_rank) } : {}),
    ...(row.entity_rank ? { entityRank: toNumber(row.entity_rank) } : {}),
    ...(row.rrf_score ? { rrfScore: toNumber(row.rrf_score) } : {}),
    ...(row.final_score ? { finalScore: toNumber(row.final_score) } : {}),
    ...(row.entity_boost ? { entityBoost: toNumber(row.entity_boost) } : {}),
    ...(row.intent_boost ? { intentBoost: toNumber(row.intent_boost) } : {}),
    ...(row.freshness_boost
      ? { freshnessBoost: toNumber(row.freshness_boost) }
      : {}),
  };

  return {
    chunk_id: row.chunk_id,
    entity_id: row.entity_id,
    title: row.title,
    section_path: row.section_path ?? [],
    score: toNumber(row.score),
    contentPreview: createContentPreview(row.content, q),
    ...(includeContent ? { content: row.content } : {}),
    metadata: row.metadata ?? {},
    has_todo: row.has_todo,
    visibility: row.visibility,
    ...(debug ? { ranking } : {}),
  };
}

function embeddingRowToSearchRow(
  row: StoredRagChunkEmbeddingSearchRow
): RagChunkSearchRow {
  return {
    chunk_id: row.chunk_id,
    entity_id: row.entity_id,
    title: row.title,
    section_path: row.section_path,
    content: row.content,
    metadata: row.metadata,
    has_todo: row.has_todo,
    visibility: row.visibility,
    freshness: row.freshness,
    confidence: row.confidence,
    updated_at: row.updated_at,
    score: row.score,
    text_rank: 0,
    title_score: 0,
    section_path_score: 0,
    entity_score: 0,
    content_score: 0,
    visibility_score: row.visibility === 'public' ? 1.5 : 0,
    todo_penalty: row.has_todo ? -2 : 0,
    embedding_score: row.embedding_score,
    ranking_search_mode: 'embedding',
  };
}

function getExpandedLimit(limit: number) {
  return normalizeSearchLimit(Math.max(limit * 3, 12));
}

function dedupeRows(rows: RagChunkSearchRow[]) {
  const seen = new Set<string>();
  const deduped: RagChunkSearchRow[] = [];

  for (const row of rows) {
    if (seen.has(row.chunk_id)) continue;
    seen.add(row.chunk_id);
    deduped.push(row);
  }

  return deduped;
}

function interleaveRows(rowGroups: RagChunkSearchRow[][], limit: number) {
  const rows: RagChunkSearchRow[] = [];
  const seen = new Set<string>();
  const maxLength = Math.max(0, ...rowGroups.map((group) => group.length));

  for (let index = 0; index < maxLength; index += 1) {
    for (const group of rowGroups) {
      const row = group[index];
      if (!row || seen.has(row.chunk_id)) continue;
      seen.add(row.chunk_id);
      rows.push(row);
      if (rows.length >= limit) return rows;
    }
  }

  return rows;
}

function detectMentionedEntityIds(query: string) {
  const normalizedQuery = normalizeAliasText(query);
  const entityMatches: Array<{ entityId: string; index: number }> = [];
  const explicitEntityIds = query.matchAll(
    /\b(?:person|project|career|profile|skill|knowledge|policy|contact|audience|question)\.[a-z0-9_.-]+\b/gi
  );

  for (const match of explicitEntityIds) {
    entityMatches.push({
      entityId: match[0].toLowerCase(),
      index: match.index ?? 0,
    });
  }

  for (const { entityId, aliases } of Object.values(NOTION_ENTITY_ALIAS_MAP)) {
    const aliasIndexes = aliases
      .map((alias) => normalizedQuery.indexOf(normalizeAliasText(alias)))
      .filter((index) => index >= 0);

    if (aliasIndexes.length > 0) {
      entityMatches.push({
        entityId,
        index: Math.min(...aliasIndexes),
      });
    }
  }

  const seen = new Set<string>();
  return entityMatches
    .sort((a, b) => a.index - b.index)
    .map((match) => match.entityId)
    .filter((entityId) => {
      if (seen.has(entityId)) return false;
      seen.add(entityId);
      return true;
    });
}

function shouldSkipEntityBoost(query: string) {
  return /raw prompt|system prompt|시스템 명령|주소|비공개|private|repo|레포|이력서\s*url|resume\s*url/i.test(
    query
  );
}

function getEntityBoost(
  row: RagChunkSearchRow,
  entityIds: string[],
  weights: RagHybridWeights
) {
  if (row.entity_rank) return weights.entity;
  if (row.entity_id && entityIds.includes(row.entity_id)) return weights.entity;
  return 0;
}

function getIntentBoost(
  row: RagChunkSearchRow,
  query: string,
  weights: RagHybridWeights
) {
  const sourceAwareBoost = Math.max(
    getVisionaryIntentBoost(row, query, weights),
    getSecondBrainIntentBoost(row, query, weights),
    getFaqAddonIntentBoost(row, query, weights)
  );
  const normalizedQuery = normalizeAliasText(query);
  const searchableText = normalizeAliasText(
    [row.title, ...(row.section_path ?? [])].join(' ')
  );
  if (!normalizedQuery || !searchableText) return sourceAwareBoost;
  if (searchableText.includes(normalizedQuery)) {
    return Math.max(weights.intent, sourceAwareBoost);
  }

  const tokens = normalizedQuery
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
  if (tokens.length === 0) return sourceAwareBoost;

  const overlapCount = tokens.filter((token) =>
    searchableText.includes(token)
  ).length;

  const lexicalBoost = Math.min(
    weights.intent,
    (overlapCount / tokens.length) * weights.intent
  );

  return Math.max(lexicalBoost, sourceAwareBoost);
}

function getVisionaryIntentBoost(
  row: RagChunkSearchRow,
  query: string,
  weights: RagHybridWeights
) {
  const metadata = row.metadata ?? {};
  const surface = typeof metadata.surface === 'string' ? metadata.surface : '';
  const intentGroup =
    typeof metadata.intentGroup === 'string' ? metadata.intentGroup : '';
  const sourceLabel =
    typeof metadata.sourceLabel === 'string' ? metadata.sourceLabel : '';

  if (
    surface !== 'oosu_philosophy' &&
    intentGroup !== 'vision' &&
    !/Visionary Builder Docs/i.test(sourceLabel)
  ) {
    return 0;
  }

  if (!isVisionarySearchQuery(query)) return 0;
  return weights.intent * 1.75;
}

function isVisionarySearchQuery(query: string) {
  return /(AI 시대|미래|팀 프로젝트|팀의 미래|협업 방식|AI 활용|AI 에이전트|철학|관점|생각|오케스트레이터|Product Owner|PM|AI era|future of teams|AI agents|philosophy|perspective|orchestrator|what do you think|five years)/i.test(
    query
  );
}

function getSecondBrainIntentBoost(
  row: RagChunkSearchRow,
  query: string,
  weights: RagHybridWeights
) {
  const metadata = row.metadata ?? {};
  const sourceType =
    typeof metadata.sourceType === 'string' ? metadata.sourceType : '';
  const intentGroup =
    typeof metadata.intentGroup === 'string' ? metadata.intentGroup : '';
  const sourceCategory =
    typeof metadata.sourceCategory === 'string' ? metadata.sourceCategory : '';

  if (
    sourceCategory !== 'second_brain' &&
    sourceType !== 'operating_system_doc' &&
    sourceType !== 'decision_log' &&
    sourceType !== 'postmortem_doc'
  ) {
    return 0;
  }

  if (sourceType === 'postmortem_doc' || intentGroup === 'project_postmortem') {
    return isPostmortemSearchQuery(query) ? weights.intent * 2 : 0;
  }

  if (sourceType === 'decision_log' || intentGroup === 'decision_log') {
    return isDecisionLogSearchQuery(query) ? weights.intent * 1.8 : 0;
  }

  if (
    sourceType === 'operating_system_doc' ||
    intentGroup === 'operating_system'
  ) {
    return isOperatingSystemSearchQuery(query) ? weights.intent * 1.7 : 0;
  }

  return 0;
}

function getFaqAddonIntentBoost(
  row: RagChunkSearchRow,
  query: string,
  weights: RagHybridWeights
) {
  const metadata = row.metadata ?? {};
  const sourceType =
    typeof metadata.sourceType === 'string' ? metadata.sourceType : '';
  const intentGroup =
    typeof metadata.intentGroup === 'string' ? metadata.intentGroup : '';
  const sourceCategory =
    typeof metadata.sourceCategory === 'string' ? metadata.sourceCategory : '';

  if (
    sourceType !== 'faq_addon' &&
    sourceCategory !== 'faq_addon' &&
    intentGroup !== 'ai_era_competitiveness'
  ) {
    return 0;
  }

  return isAiEraCompetitivenessSearchQuery(query) ? weights.intent * 2.1 : 0;
}

function isOperatingSystemSearchQuery(query: string) {
  return /(어떻게\s*(활용|일|검토|리뷰|완성|나눠|운영)|코드.*(검토|리뷰)|리뷰.*코드|AI.*(코드|검토|리뷰)|AI\s*(활용|에이전트|워크플로)|Codex|Claude|definition\s+of\s+done|done|workflow|code\s+review|agent\s+workflow|how\s+does\s+Oosu\s+(use|work)|when\s+does\s+Oosu\s+consider)/i.test(
    query
  );
}

function isDecisionLogSearchQuery(query: string) {
  return /(왜|이유|선택|결정|판단|tradeoff|RAG|cache\s*first|FAQ\s*cache|source\s*badge|confidence\s*badge|Notion|recruiter\s*risk|overclaim|why\s+did|why\s+cache|why\s+rag|decision)/i.test(
    query
  );
}

function isAiEraCompetitivenessSearchQuery(query: string) {
  return /(AI\s*시대.*(경쟁력|개발자|차별점|강점)|AI가\s*(개발자|주니어|사람).*(대체|필요\s*없)|AI\s*(의존|기본기|실력)|AI와\s*경쟁|AI를\s*잘\s*쓰|AI\s*fluency|AI\s*dependency|ai\s+era.*(developer|edge|competitive)|ai.*replace.*developer|developers?.*(obsolete|replace)|why\s+hire.*developer|competitive\s+advantage|competing\s+with\s+ai|can\s+you\s+code\s+without\s+ai)/i.test(
    query
  );
}

function isPostmortemSearchQuery(query: string) {
  return /(배웠|회고|한계|아쉬|다시\s*만든다면|교훈|lessons?|postmortem|limitation|what\s+did\s+Oosu\s+learn|would\s+rebuild|Portfoli-Oh|AskOosu|Flai|EZ\s*Air|Instagram|Sticks)/i.test(
    query
  );
}

function getFreshnessBoost(row: RagChunkSearchRow, weights: RagHybridWeights) {
  if (
    row.freshness === 'current' &&
    row.visibility === 'public' &&
    !row.has_todo
  ) {
    return weights.freshness;
  }

  if (row.has_todo || row.visibility === 'needs_review') {
    return -weights.freshness;
  }

  return 0;
}

function getAnswerabilityWarnings(results: RagChunkSearchResult[]) {
  const warnings: string[] = [];
  const topResults = results.slice(0, Math.min(3, results.length));

  if (topResults.length > 0 && topResults.every(isUncertainOrPrivateResult)) {
    warnings.push(
      'All top RAG chunks are TODO, needs_review, or non-public; answer with caution.'
    );
  }

  if (
    results.length > 0 &&
    toNumber(results[0].score) < DEFAULT_LOW_SCORE_WARNING_THRESHOLD
  ) {
    warnings.push('Top RAG search score is below the answerability threshold.');
  }

  return warnings;
}

function isUncertainOrPrivateResult(result: RagChunkSearchResult) {
  return (
    result.has_todo ||
    result.visibility === 'needs_review' ||
    result.visibility !== 'public'
  );
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

function toFullTextQuery(value: string) {
  const sourceAwareTerms = getSourceAwareSearchTerms(value);
  if (sourceAwareTerms.length === 0) return value;

  const normalizedTokens = normalizeAliasText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  return uniqueSearchTerms([...normalizedTokens, ...sourceAwareTerms])
    .map(quoteWebsearchTerm)
    .join(' OR ');
}

function getSourceAwareSearchTerms(value: string) {
  const terms: string[] = [];

  if (isVisionarySearchQuery(value)) {
    terms.push(
      'AI',
      'team',
      'future',
      'PM',
      'Product Owner',
      'philosophy',
      'agent',
      'workflow',
      '팀',
      '미래',
      '철학',
      '관점'
    );
  }

  if (isOperatingSystemSearchQuery(value)) {
    terms.push(
      'agent',
      'workflow',
      'code review',
      'definition of done',
      'answer quality',
      'review',
      'done',
      '검토',
      '리뷰',
      '완성',
      '품질',
      '워크플로'
    );
  }

  if (isDecisionLogSearchQuery(value)) {
    terms.push(
      'RAG',
      'FAQ',
      'cache',
      'cache first',
      'static',
      'Notion',
      'source',
      'confidence',
      'badge',
      'decision',
      'overclaim',
      'recruiter',
      '정적',
      '캐시',
      '근거',
      '출처',
      '신뢰도',
      '결정',
      '판단',
      '과장'
    );
  }

  if (isPostmortemSearchQuery(value)) {
    terms.push(
      'postmortem',
      'lesson',
      'limitation',
      'rebuild',
      'AskOosu',
      'Portfoli Oh',
      'Flai',
      'EZ Air',
      'Instagram',
      'Sticks',
      '회고',
      '배운',
      '한계',
      '교훈',
      '다시'
    );
  }

  return terms;
}

function getSourceAwareFilters(value: string) {
  const sourceTypes: string[] = [];
  const sourceCategories: string[] = [];
  const surfaces: string[] = [];

  if (isVisionarySearchQuery(value)) {
    sourceCategories.push('ai_working_thesis');
    surfaces.push('oosu_philosophy');
  }

  if (isOperatingSystemSearchQuery(value)) {
    sourceTypes.push('operating_system_doc');
  }

  if (isDecisionLogSearchQuery(value)) {
    sourceTypes.push('decision_log');
  }

  if (isPostmortemSearchQuery(value)) {
    sourceTypes.push('postmortem_doc');
  }

  if (isAiEraCompetitivenessSearchQuery(value)) {
    sourceTypes.push('faq_addon');
    sourceCategories.push('faq_addon');
  }

  return {
    sourceTypes: uniqueSearchTerms(sourceTypes),
    sourceCategories: uniqueSearchTerms(sourceCategories),
    surfaces: uniqueSearchTerms(surfaces),
  };
}

function toSourceAwareLikePatterns(value: string) {
  const normalizedTokens = normalizeAliasText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  return uniqueSearchTerms([
    ...normalizedTokens,
    ...getSourceAwareSearchTerms(value),
  ]).map(toLikePattern);
}

function toPreferredDocLikePatterns(value: string) {
  const normalizedValue = normalizeAliasText(value);
  const patterns: string[] = [];

  if (/(코드.*(검토|리뷰)|리뷰.*코드|code\s*review)/i.test(value)) {
    patterns.push('code-review-with-ai');
  }
  if (/definition\s+of\s+done|완성|done/i.test(value)) {
    patterns.push('definition-of-done');
  }
  if (/answer\s+quality|답변\s*품질|품질/i.test(value)) {
    patterns.push('answer-quality-loop');
  }
  if (/agent|에이전트|workflow|워크플로/i.test(value)) {
    patterns.push('ai-agent-workflow');
  }

  if (/cache|캐시|cache\s*first/i.test(value)) {
    patterns.push('why-cache-first-rag-next');
  }
  if (/static|정적|static\s*faq/i.test(value)) {
    patterns.push('why-rag-not-static-faq');
  }
  if (/notion|노션/i.test(value)) {
    patterns.push('why-notion-as-cms-postgres-as-retrieval-cache');
  }
  if (/source|confidence|badge|출처|근거|신뢰도|배지/i.test(value)) {
    patterns.push('why-source-confidence-badges');
  }
  if (/recruiter|risk|리크루터|채용|리스크/i.test(value)) {
    patterns.push('why-recruiter-risk-routing');
  }
  if (/overclaim|과장/i.test(value)) {
    patterns.push('why-not-overclaim-ai-era');
  }
  if (/small\s*team|wide\s*ownership|작은\s*팀|넓은\s*책임/i.test(value)) {
    patterns.push('why-small-team-wide-ownership-positioning');
  }
  if (/ai[-\s]?native|working\s*thesis|AI\s*시대/i.test(value)) {
    patterns.push('why-ai-native-working-thesis');
  }

  if (/askoosu|ask\s*oosu|rag/.test(normalizedValue)) {
    patterns.push('ask-oosu-rag-lessons');
  }
  if (/overdocumentation|문서.*과|너무\s*많은\s*문서/i.test(value)) {
    patterns.push('ai-portfolio-overdocumentation-risk');
  }
  if (/flai/i.test(value)) patterns.push('flai-trust-clarity-lessons');
  if (/ez\s*air|이지\s*에어/i.test(value)) {
    patterns.push('ez-air-ai-flight-search-lessons');
  }
  if (/instagram|aigram|인스타/i.test(value)) {
    patterns.push('instagram-clone-fullstack-lessons');
  }
  if (/portfoli.?oh|포트폴리오오/i.test(value)) {
    patterns.push('portfoli-oh-json-chatbot-limitations');
  }
  if (/sticks|stones|스틱스/i.test(value)) {
    patterns.push('sticks-and-stones-legacy-rebuild-lessons');
  }

  return uniqueSearchTerms(patterns).map(toLikePattern);
}

function uniqueSearchTerms(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalizedValue = value.trim();
    const key = normalizedValue.toLowerCase();
    if (!normalizedValue || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function quoteWebsearchTerm(value: string) {
  return `"${value.replace(/["\\]/g, ' ')}"`;
}

function normalizeAliasText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\s\-_:!.,/()[\]{}'"`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumber(value: number | string) {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function mergeWarnings(...groups: string[][]) {
  const warnings: string[] = [];

  for (const group of groups) {
    for (const warning of group) {
      if (warning && !warnings.includes(warning)) warnings.push(warning);
    }
  }

  return warnings;
}
