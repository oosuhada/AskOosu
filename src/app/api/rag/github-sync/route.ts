import { syncGithubRagIfNeeded } from '@/lib/rag/github-sync';
import { isRagAdminRequest, unauthorizedRagResponse } from '../auth';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function GET(req: Request) {
  return handleGithubSync(req);
}

export async function POST(req: Request) {
  return handleGithubSync(req);
}

async function handleGithubSync(req: Request) {
  if (!isRagAdminRequest(req)) return unauthorizedRagResponse();
  const force = new URL(req.url).searchParams.get('force') === '1';

  try {
    const result = await syncGithubRagIfNeeded({ force });
    return Response.json(result);
  } catch (error) {
    console.warn('GitHub RAG sync failed.', error);
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'GitHub RAG sync failed.',
      },
      { status: 500 }
    );
  }
}
