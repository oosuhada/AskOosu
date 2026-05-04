import {
  fetchNotionRagPage,
  getNotionRagConfig,
  NotionRequestError,
} from '@/lib/rag/notion';
import {
  hasPostgresDatabaseUrl,
  persistNotionRagSyncResult,
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
      result.warnings.push('DATABASE_URL is not set; DB persistence skipped.');
      return Response.json(result);
    }

    const persistence = await persistNotionRagSyncResult(result);

    return Response.json({
      ...result,
      persistence,
    });
  } catch (error) {
    console.warn('Notion RAG sync failed.', getSafeErrorLog(error));

    return Response.json(
      {
        ok: false,
        pageId: config.pageId,
        error:
          error instanceof NotionRequestError
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
