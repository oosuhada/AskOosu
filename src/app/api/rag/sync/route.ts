import {
  fetchNotionRagPage,
  getNotionRagConfig,
  NotionRequestError,
  type NotionRagSyncResult,
} from '@/lib/rag/notion';
import {
  acquireRagSyncLock,
  hasPostgresDatabaseUrl,
  persistNotionRagSyncResult,
  RagSyncPersistenceError,
  recordFailedNotionRagSyncRun,
  releaseRagSyncLock,
  replaceStoredRagChunks,
} from '@/lib/rag/database';
import { fetchLocalMarkdownRagChunks } from '@/lib/rag/markdown-source';
import {
  invalidateCachedAnswersForEntities,
  invalidateCachedAnswersForSourceChunks,
} from '@/lib/chat/database';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

type SyncedRagSource = {
  sourceType: 'notion' | 'markdown';
  sourceKey: string;
  sourceTitle: string;
  pageId?: string;
  pageTitle?: string;
  sourceId: string | null;
  syncRunId: string | null;
  blockCount: number;
  chunkCount: number;
  inserted: number;
  updated: number;
  deleted: number;
  skipped: number;
  changedEntityIds: string[];
  changedSourceChunkIds: string[];
  warnings: string[];
};

type AnswerCacheInvalidationSummary = {
  mode: 'none' | 'entity' | 'source_chunk' | 'ttl_fallback' | 'failed';
  invalidated: number;
  entityIds: string[];
  sourceChunkIds: string[];
  reason: string | null;
  warnings: string[];
};

export async function GET(req: Request) {
  return syncNotionPages(req);
}

export async function POST(req: Request) {
  return syncNotionPages(req);
}

async function syncNotionPages(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  const config = getNotionRagConfig();
  if (!config.ok) {
    return Response.json(
      {
        ok: false,
        error: config.error,
        warnings: config.warnings,
      },
      { status: config.status }
    );
  }

  const pageResults: SyncedRagSource[] = [];
  let currentPageId = config.pageId;
  let currentWarnings = [...config.warnings];
  const lockId = `notion:${config.pageIds.join(',')}`;
  let acquiredLock = false;

  try {
    if (hasPostgresDatabaseUrl()) {
      acquiredLock = await acquireRagSyncLock({
        lockId,
        ttlSeconds: getRagSyncLockTtlSeconds(),
      });

      if (!acquiredLock) {
        return Response.json(
          {
            ok: false,
            pageId: config.pageId,
            pageIds: config.pageIds,
            sourceId: null,
            syncRunId: null,
            blockCount: 0,
            chunkCount: 0,
            inserted: 0,
            updated: 0,
            deleted: 0,
            skipped: 0,
            answerCacheInvalidated: 0,
            warnings: [
              ...config.warnings,
              'RAG sync is already running. Try again after the current sync finishes.',
            ],
            sources: [],
            error: 'RAG sync is already running.',
          },
          { status: 409 }
        );
      }
    }

    const notionResults: NotionRagSyncResult[] = [];

    for (const pageId of config.pageIds) {
      currentPageId = pageId;
      currentWarnings = [...config.warnings];
      const result = await fetchNotionRagPage({
        apiKey: config.apiKey,
        pageId,
        initialWarnings: currentWarnings,
      });
      notionResults.push(result);
    }

    if (!hasPostgresDatabaseUrl()) {
      pageResults.push(
        ...notionResults.map((result) => ({
          sourceType: 'notion' as const,
          sourceKey: result.pageId,
          sourceTitle: result.pageTitle,
          pageId: result.pageId,
          pageTitle: result.pageTitle,
          sourceId: null,
          syncRunId: null,
          blockCount: result.blockCount,
          chunkCount: 0,
          inserted: 0,
          updated: 0,
          deleted: 0,
          skipped: 0,
          changedEntityIds: [],
          changedSourceChunkIds: [],
          warnings: [
            ...result.warnings,
            'DATABASE_URL is not set; DB persistence failed.',
          ],
        }))
      );
      const aggregate = aggregatePageResults(pageResults);

      return Response.json(
        {
          ok: false,
          pageId: config.pageId,
          pageIds: config.pageIds,
          sourceId: aggregate.sourceId,
          syncRunId: aggregate.syncRunId,
          blockCount: aggregate.blockCount,
          chunkCount: aggregate.chunkCount,
          inserted: aggregate.inserted,
          updated: aggregate.updated,
          deleted: aggregate.deleted,
          skipped: aggregate.skipped,
          answerCacheInvalidated: 0,
          warnings: aggregate.warnings,
          sources: pageResults,
          error: 'DATABASE_URL or POSTGRES_URL is required for RAG sync.',
        },
        { status: 500 }
      );
    }

    for (const result of notionResults) {
      currentPageId = result.pageId;
      currentWarnings = result.warnings;
      const persistence = await persistNotionRagSyncResult(result);
      pageResults.push({
        sourceType: 'notion',
        sourceKey: result.pageId,
        sourceTitle: result.pageTitle,
        pageId: result.pageId,
        pageTitle: result.pageTitle,
        sourceId: persistence.sourceId,
        syncRunId: persistence.syncRunId,
        blockCount: result.blockCount,
        chunkCount: persistence.chunkCount,
        inserted: persistence.inserted,
        updated: persistence.updated,
        deleted: persistence.deleted,
        skipped: persistence.skipped,
        changedEntityIds: persistence.changedEntityIds,
        changedSourceChunkIds: persistence.changedSourceChunkIds,
        warnings: result.warnings,
      });
    }

    const localMarkdownResult = await fetchLocalMarkdownRagChunks();
    const localMarkdownPersistences =
      localMarkdownResult.chunks.length > 0
        ? await replaceStoredRagChunks(localMarkdownResult.chunks)
        : [];
    const localDocumentsByPath = new Map(
      localMarkdownResult.documents.map((document) => [document.path, document])
    );

    for (const persistence of localMarkdownPersistences) {
      const document = localDocumentsByPath.get(persistence.sourceKey);
      pageResults.push({
        sourceType: 'markdown',
        sourceKey: persistence.sourceKey,
        sourceTitle: persistence.title,
        pageId: persistence.sourceKey,
        pageTitle: persistence.title,
        sourceId: persistence.sourceId,
        syncRunId: null,
        blockCount: document?.sectionCount ?? persistence.chunkCount,
        chunkCount: persistence.chunkCount,
        inserted: persistence.inserted,
        updated: persistence.updated,
        deleted: persistence.deleted,
        skipped: persistence.skipped,
        changedEntityIds: persistence.changedEntityIds,
        changedSourceChunkIds: persistence.changedSourceChunkIds,
        warnings: localMarkdownResult.warnings,
      });
    }

    const aggregate = aggregatePageResults(pageResults);
    const cacheInvalidation =
      await invalidateAnswerCacheAfterRagSync(aggregate);
    const warnings = mergeWarnings(
      aggregate.warnings,
      localMarkdownResult.warnings,
      cacheInvalidation.warnings
    );

    return Response.json({
      ok: true,
      pageId: config.pageId,
      pageIds: config.pageIds,
      sourceId: aggregate.sourceId,
      syncRunId: aggregate.syncRunId,
      blockCount: aggregate.blockCount,
      chunkCount: aggregate.chunkCount,
      inserted: aggregate.inserted,
      updated: aggregate.updated,
      deleted: aggregate.deleted,
      skipped: aggregate.skipped,
      warnings,
      answerCacheInvalidated: cacheInvalidation.invalidated,
      cacheInvalidation,
      sources: pageResults,
    });
  } catch (error) {
    console.warn('Notion RAG sync failed.', getSafeErrorLog(error));
    const failedRun = await maybeRecordFailedSyncRun({
      error,
      pageId: currentPageId,
      warnings: currentWarnings,
    });
    const aggregate = aggregatePageResults(pageResults);
    const failedRunWarnings =
      failedRun ||
      error instanceof RagSyncPersistenceError ||
      !hasPostgresDatabaseUrl()
        ? []
        : ['Failed sync run was not recorded.'];

    return Response.json(
      {
        ok: false,
        sourceId: getFailedSourceId(error) ?? failedRun?.sourceId ?? null,
        syncRunId: getFailedSyncRunId(error) ?? failedRun?.syncRunId ?? null,
        blockCount: aggregate.blockCount || getFailedBlockCount(error),
        chunkCount: aggregate.chunkCount || getFailedChunkCount(error),
        inserted: 0,
        updated: 0,
        deleted: 0,
        skipped: 0,
        answerCacheInvalidated: 0,
        pageId: currentPageId,
        pageIds: config.pageIds,
        error:
          error instanceof NotionRequestError
            ? error.message
            : error instanceof RagSyncPersistenceError
              ? error.message
              : 'Notion RAG sync failed.',
        warnings: mergeWarnings(
          aggregate.warnings,
          currentWarnings,
          failedRunWarnings
        ),
        sources: pageResults,
      },
      {
        status: error instanceof NotionRequestError ? error.status : 500,
      }
    );
  } finally {
    if (acquiredLock) {
      await releaseRagSyncLock(lockId).catch((lockError) => {
        console.warn(
          'Failed to release RAG sync lock.',
          getSafeErrorLog(lockError)
        );
      });
    }
  }
}

async function maybeRecordFailedSyncRun({
  error,
  pageId,
  warnings,
}: {
  error: unknown;
  pageId: string;
  warnings: string[];
}) {
  if (error instanceof RagSyncPersistenceError || !hasPostgresDatabaseUrl()) {
    return null;
  }

  try {
    return await recordFailedNotionRagSyncRun({
      pageId,
      warnings,
      errorMessage:
        error instanceof Error ? error.message : 'Notion RAG sync failed.',
    });
  } catch (syncRunError) {
    warnings.push('Failed to record failed RAG sync run.');
    console.warn(
      'Failed to record failed RAG sync run.',
      getSafeErrorLog(syncRunError)
    );
    return null;
  }
}

function getFailedSourceId(error: unknown) {
  return error instanceof RagSyncPersistenceError ? error.sourceId : null;
}

function getFailedSyncRunId(error: unknown) {
  return error instanceof RagSyncPersistenceError ? error.syncRunId : null;
}

function getFailedBlockCount(error: unknown) {
  return error instanceof RagSyncPersistenceError ? error.blockCount : 0;
}

function getFailedChunkCount(error: unknown) {
  return error instanceof RagSyncPersistenceError ? error.chunkCount : 0;
}

function getSafeErrorLog(error: unknown) {
  if (error instanceof NotionRequestError) {
    return {
      name: error.name,
      status: error.status,
      retryable: error.retryable,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return { message: 'Unknown error' };
}

function aggregatePageResults(pageResults: SyncedRagSource[]) {
  return {
    sourceId: pageResults[0]?.sourceId ?? null,
    syncRunId: pageResults[0]?.syncRunId ?? null,
    blockCount: sum(pageResults.map((result) => result.blockCount)),
    chunkCount: sum(pageResults.map((result) => result.chunkCount)),
    inserted: sum(pageResults.map((result) => result.inserted)),
    updated: sum(pageResults.map((result) => result.updated)),
    deleted: sum(pageResults.map((result) => result.deleted)),
    skipped: sum(pageResults.map((result) => result.skipped)),
    changedEntityIds: uniqueText(
      pageResults.flatMap((result) => result.changedEntityIds)
    ),
    changedSourceChunkIds: uniqueText(
      pageResults.flatMap((result) => result.changedSourceChunkIds)
    ),
    warnings: mergeWarnings(...pageResults.map((result) => result.warnings)),
  };
}

async function invalidateAnswerCacheAfterRagSync({
  inserted,
  updated,
  deleted,
  changedEntityIds,
  changedSourceChunkIds,
}: ReturnType<typeof aggregatePageResults>): Promise<AnswerCacheInvalidationSummary> {
  const changedChunkCount = inserted + updated + deleted;
  const entityIds = uniqueText(changedEntityIds);
  const sourceChunkIds = uniqueText(changedSourceChunkIds);

  if (changedChunkCount === 0) {
    return {
      mode: 'none',
      invalidated: 0,
      entityIds,
      sourceChunkIds,
      reason: null,
      warnings: [],
    };
  }

  try {
    if (entityIds.length > 0) {
      const reason = 'rag_sync_changed_entities';
      const entityInvalidated = await invalidateCachedAnswersForEntities(
        entityIds,
        reason
      );
      const sourceChunkInvalidated =
        sourceChunkIds.length > 0
          ? await invalidateCachedAnswersForSourceChunks(
              sourceChunkIds,
              'rag_sync_changed_source_chunks'
            )
          : 0;

      return {
        mode: 'entity',
        invalidated: entityInvalidated + sourceChunkInvalidated,
        entityIds,
        sourceChunkIds,
        reason,
        warnings:
          sourceChunkInvalidated > 0
            ? [
                'RAG sync primarily invalidated answer_cache by entity ids and also invalidated source_chunk_ids without entity coverage.',
              ]
            : [],
      };
    }

    if (sourceChunkIds.length > 0) {
      const reason = 'rag_sync_changed_source_chunks';
      const invalidated = await invalidateCachedAnswersForSourceChunks(
        sourceChunkIds,
        reason
      );

      return {
        mode: 'source_chunk',
        invalidated,
        entityIds: [],
        sourceChunkIds,
        reason,
        warnings: [
          'RAG sync changed chunks without entity ids; invalidated answer_cache by source_chunk_ids.',
        ],
      };
    }
  } catch (error) {
    console.warn(
      'Answer cache invalidation failed after RAG sync.',
      getSafeErrorLog(error)
    );

    return {
      mode: 'failed',
      invalidated: 0,
      entityIds,
      sourceChunkIds,
      reason: 'rag_sync_cache_invalidation_failed',
      warnings: [
        'Answer cache invalidation failed after RAG sync; TTL will expire stale rows.',
      ],
    };
  }

  return {
    mode: 'ttl_fallback',
    invalidated: 0,
    entityIds: [],
    sourceChunkIds: [],
    reason: null,
    warnings: [
      'RAG sync changed chunks but no entity ids or source chunk ids were available; answer_cache TTL will expire stale rows.',
    ],
  };
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

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function uniqueText(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function getRagSyncLockTtlSeconds() {
  const rawValue = process.env.ASKOOSU_RAG_SYNC_LOCK_TTL_SECONDS;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 300;
}
