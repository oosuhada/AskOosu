import {
  getPortfolioKnowledgeStatus,
  syncPortfolioKnowledgeBase,
} from '@/lib/rag/notion-rag';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  return Response.json(await getPortfolioKnowledgeStatus());
}

export async function POST(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();

  const body = await req.json().catch(() => ({}) as { force?: boolean });
  const summary = await syncPortfolioKnowledgeBase({
    force: Boolean(body.force),
  });

  return Response.json(summary);
}
