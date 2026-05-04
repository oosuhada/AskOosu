export function isRagAdminRequest(req: Request) {
  const tokens = [
    process.env.RAG_SYNC_SECRET,
    process.env.ASKOOSU_RAG_ADMIN_TOKEN,
  ]
    .map((token) => token?.trim())
    .filter((token): token is string => Boolean(token));

  if (tokens.length === 0) {
    return process.env.NODE_ENV !== 'production';
  }

  const bearerToken = req.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    .trim();
  const headerToken =
    req.headers.get('x-rag-sync-secret') ||
    req.headers.get('x-ask-oosu-rag-token');

  return tokens.some((token) => bearerToken === token || headerToken === token);
}

export function unauthorizedRagResponse() {
  return Response.json(
    {
      error:
        'RAG admin token is required. Set RAG_SYNC_SECRET or ASKOOSU_RAG_ADMIN_TOKEN and send it as a Bearer token.',
    },
    { status: 401 }
  );
}
