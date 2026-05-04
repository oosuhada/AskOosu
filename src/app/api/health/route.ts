import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';

export const runtime = 'nodejs';
export const maxDuration = 10;

type DbHealth = {
  ok: boolean;
  status: 'ok' | 'not_configured' | 'unavailable';
};

export async function GET() {
  const db = await checkDatabase();

  return Response.json(
    {
      ok: db.status !== 'unavailable',
      service: 'askoosu',
      timestamp: new Date().toISOString(),
      db,
    },
    { status: db.status === 'unavailable' ? 503 : 200 }
  );
}

async function checkDatabase(): Promise<DbHealth> {
  if (!hasPostgresDatabaseUrl()) {
    return {
      ok: false,
      status: 'not_configured',
    };
  }

  try {
    const pool = await getPostgresPool();
    await pool.query('SELECT 1');

    return {
      ok: true,
      status: 'ok',
    };
  } catch {
    return {
      ok: false,
      status: 'unavailable',
    };
  }
}
