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
} from '@/lib/rag/database';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

type SyncedNotionPage = {
  pageId: string;
  pageTitle: string;
  sourceId: string | null;
  syncRunId: string | null;
  blockCount: number;
  chunkCount: number;
  inserted: number;
  updated: number;
  skipped: number;
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

  const pageResults: SyncedNotionPage[] = [];
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
            skipped: 0,
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
          pageId: result.pageId,
          pageTitle: result.pageTitle,
          sourceId: null,
          syncRunId: null,
          blockCount: result.blockCount,
          chunkCount: 0,
          inserted: 0,
          updated: 0,
          skipped: 0,
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
          skipped: aggregate.skipped,
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
        pageId: result.pageId,
        pageTitle: result.pageTitle,
        sourceId: persistence.sourceId,
        syncRunId: persistence.syncRunId,
        blockCount: result.blockCount,
        chunkCount: persistence.chunkCount,
        inserted: persistence.inserted,
        updated: persistence.updated,
        skipped: persistence.skipped,
        warnings: result.warnings,
      });
    }

    const aggregate = aggregatePageResults(pageResults);

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
      skipped: aggregate.skipped,
      warnings: aggregate.warnings,
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
        skipped: 0,
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

function aggregatePageResults(pageResults: SyncedNotionPage[]) {
  return {
    sourceId: pageResults[0]?.sourceId ?? null,
    syncRunId: pageResults[0]?.syncRunId ?? null,
    blockCount: sum(pageResults.map((result) => result.blockCount)),
    chunkCount: sum(pageResults.map((result) => result.chunkCount)),
    inserted: sum(pageResults.map((result) => result.inserted)),
    updated: sum(pageResults.map((result) => result.updated)),
    skipped: sum(pageResults.map((result) => result.skipped)),
    warnings: mergeWarnings(...pageResults.map((result) => result.warnings)),
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

function getRagSyncLockTtlSeconds() {
  const rawValue = process.env.ASKOOSU_RAG_SYNC_LOCK_TTL_SECONDS;
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 300;
}
