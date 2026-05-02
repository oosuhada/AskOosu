import { getRagTopK, getPositiveIntEnv } from '@/lib/rag/config';
import { searchPortfolioKnowledge } from '@/lib/rag/notion-rag';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';

type SearchBody = {
  query?: string;
  limit?: number;
};

export async function GET(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  const url = new URL(req.url);
  const query = url.searchParams.get('query') ?? '';
  const limit = parseLimit(url.searchParams.get('limit'));

  return searchResponse({ query, limit });
}

export async function POST(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  const body = (await req.json().catch(() => ({}))) as SearchBody;
  return searchResponse({
    query: body.query ?? '',
    limit: parseLimit(body.limit),
  });
}

async function searchResponse({
  query,
  limit,
}: {
  query: string;
  limit?: number;
}) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return Response.json({ error: 'query is required' }, { status: 400 });
  }

  const results = await searchPortfolioKnowledge(normalizedQuery, {
    limit: limit ?? getRagTopK(),
  });

  return Response.json({
    query: normalizedQuery,
    results,
  });
}

function parseLimit(value: string | number | null | undefined) {
  if (!value) return undefined;

  const parsedValue =
    typeof value === 'number' ? value : Number.parseInt(value, 10);
  const maxLimit = getPositiveIntEnv('ASKOOSU_RAG_MAX_SEARCH_LIMIT', 20);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) return undefined;
  return Math.min(parsedValue, maxLimit);
}
