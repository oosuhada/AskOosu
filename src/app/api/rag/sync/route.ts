import {
  fetchNotionRagPage,
  getNotionRagConfig,
  NotionRequestError,
} from '@/lib/rag/notion';
import {
  hasPostgresDatabaseUrl,
  persistNotionRagSyncResult,
  RagSyncPersistenceError,
  recordFailedNotionRagSyncRun,
} from '@/lib/rag/database';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
  return syncNotionPage(req);
}

export async function POST(req: Request) {
  return syncNotionPage(req);
}

async function syncNotionPage(req: Request) {
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

  const warnings = [...config.warnings];

  try {
    const result = await fetchNotionRagPage({
      apiKey: config.apiKey,
      pageId: config.pageId,
      initialWarnings: warnings,
    });

    if (!hasPostgresDatabaseUrl()) {
      result.warnings.push('DATABASE_URL is not set; DB persistence failed.');
      return Response.json(
        {
          ok: false,
          sourceId: null,
          syncRunId: null,
          blockCount: result.blockCount,
          chunkCount: 0,
          inserted: 0,
          updated: 0,
          skipped: 0,
          warnings: result.warnings,
          error: 'DATABASE_URL or POSTGRES_URL is required for RAG sync.',
        },
        { status: 500 }
      );
    }

    const persistence = await persistNotionRagSyncResult(result);

    return Response.json({
      ok: true,
      sourceId: persistence.sourceId,
      syncRunId: persistence.syncRunId,
      blockCount: result.blockCount,
      chunkCount: persistence.chunkCount,
      inserted: persistence.inserted,
      updated: persistence.updated,
      skipped: persistence.skipped,
      warnings: result.warnings,
    });
  } catch (error) {
    console.warn('Notion RAG sync failed.', getSafeErrorLog(error));
    const failedRun = await maybeRecordFailedSyncRun({
      error,
      pageId: config.pageId,
      warnings,
    });

    return Response.json(
      {
        ok: false,
        sourceId: getFailedSourceId(error) ?? failedRun?.sourceId ?? null,
        syncRunId: getFailedSyncRunId(error) ?? failedRun?.syncRunId ?? null,
        blockCount: getFailedBlockCount(error),
        chunkCount: getFailedChunkCount(error),
        inserted: 0,
        updated: 0,
        skipped: 0,
        pageId: config.pageId,
        error:
          error instanceof NotionRequestError
            ? error.message
            : error instanceof RagSyncPersistenceError
              ? error.message
              : 'Notion RAG sync failed.',
        warnings,
      },
      {
        status: error instanceof NotionRequestError ? error.status : 500,
      }
    );
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
