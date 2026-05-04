import { searchRagChunks } from '@/lib/rag/search';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';

type SearchBody = {
  q?: string;
  query?: string;
  limit?: number | string;
  entityId?: string;
  includePrivate?: boolean | string;
  debug?: boolean | string;
};

export async function GET(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  const url = new URL(req.url);
  return searchResponse({
    q: url.searchParams.get('q') ?? url.searchParams.get('query') ?? '',
    limit: parseLimit(url.searchParams.get('limit')),
    entityId: url.searchParams.get('entityId') ?? undefined,
    includePrivate: parseBoolean(url.searchParams.get('includePrivate')),
    debug: parseBoolean(url.searchParams.get('debug')),
  });
}

export async function POST(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  const body = (await req.json().catch(() => ({}))) as SearchBody;
  return searchResponse({
    q: body.q ?? body.query ?? '',
    limit: parseLimit(body.limit),
    entityId: body.entityId,
    includePrivate: parseBoolean(body.includePrivate),
    debug: parseBoolean(body.debug),
  });
}

async function searchResponse({
  q,
  limit,
  entityId,
  includePrivate = false,
  debug = false,
}: {
  q: string;
  limit?: number;
  entityId?: string;
  includePrivate?: boolean;
  debug?: boolean;
}) {
  const normalizedQuery = q.trim();
  const normalizedEntityId = entityId?.trim();

  if (!normalizedQuery && !normalizedEntityId) {
    return Response.json(
      {
        ok: false,
        query: {
          q: normalizedQuery,
          limit: limit ?? null,
          entityId: normalizedEntityId || undefined,
          includePrivate,
          debug,
        },
        results: [],
        warnings: ['q or entityId is required.'],
        error: 'q or entityId is required.',
      },
      { status: 400 }
    );
  }

  const payload = await searchRagChunks({
    q: normalizedQuery,
    limit,
    entityId: normalizedEntityId,
    includePrivate,
    debug,
  });

  return Response.json(payload, { status: payload.ok ? 200 : 500 });
}

function parseLimit(value: string | number | null | undefined) {
  if (!value) return undefined;

  const parsedValue =
    typeof value === 'number' ? value : Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) return undefined;
  return Math.floor(parsedValue);
}

function parseBoolean(value: boolean | string | null | undefined) {
  if (typeof value === 'boolean') return value;
  if (!value) return undefined;

  const normalizedValue = value.toLowerCase();
  if (['1', 'true', 'yes'].includes(normalizedValue)) return true;
  if (['0', 'false', 'no'].includes(normalizedValue)) return false;

  return undefined;
}
