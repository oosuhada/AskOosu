export function isRagAdminRequest(req: Request) {
  const token = process.env.ASKOOSU_RAG_ADMIN_TOKEN;

  if (!token) {
    return process.env.NODE_ENV !== 'production';
  }

  return (
    req.headers.get('authorization') === `Bearer ${token}` ||
    req.headers.get('x-ask-oosu-rag-token') === token
  );
}

export function unauthorizedRagResponse() {
  return Response.json(
    {
      error:
        'RAG admin token is required. Set ASKOOSU_RAG_ADMIN_TOKEN and send it as a Bearer token.',
    },
    { status: 401 }
  );
}
