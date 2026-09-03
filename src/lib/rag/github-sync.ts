import {
  getGithubRepositorySyncManifest,
  type GithubRepositorySyncManifest,
} from '@/lib/github-portfolio';
import { invalidateCachedAnswersForEntities } from '@/lib/chat/database';
import { getPostgresPool, hasPostgresDatabaseUrl } from '@/lib/db/postgres';
import { replaceStoredRagChunks } from './database';
import { fetchGithubRagChunks } from './github-source';
import { hashString } from './text';

const GITHUB_SYNC_STATE_KEY = 'github:oosuhada';
const DEFAULT_WEEKLY_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

type GithubSyncState = {
  fingerprint: string;
  lastFullSyncAt: string | null;
};

export async function syncGithubRagIfNeeded({ force = false } = {}) {
  if (!hasPostgresDatabaseUrl()) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required for GitHub RAG sync.');
  }

  await ensureGithubSyncStateSchema();
  const [manifest, state] = await Promise.all([
    getGithubRepositorySyncManifest(),
    getGithubSyncState(),
  ]);
  const fingerprint = createManifestFingerprint(manifest);
  const weeklyDue = isWeeklyRefreshDue(state?.lastFullSyncAt ?? null);
  const changed = manifest.live
    ? state?.fingerprint !== fingerprint
    : state == null;
  const shouldFullSync = force || changed || weeklyDue;

  if (!shouldFullSync) {
    await saveGithubSyncState({
      fingerprint: state?.fingerprint ?? fingerprint,
      fullSync: false,
    });
    return {
      ok: true,
      synced: false,
      reason: manifest.live ? 'unchanged' : 'github_api_unavailable',
      manifestLive: manifest.live,
      changed: false,
      weeklyDue: false,
      repositoryCount: manifest.repositories.length,
      chunkCount: 0,
      inserted: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      answerCacheInvalidated: 0,
    };
  }

  const github = await fetchGithubRagChunks();
  const persistences = await replaceStoredRagChunks(github.chunks);
  const staleDeleted = await deleteStaleGithubSources(github.sourceKeys);
  const changedEntityIds = Array.from(
    new Set(
      persistences.flatMap((persistence) => persistence.changedEntityIds)
    )
  );
  const answerCacheInvalidated = changedEntityIds.length
    ? await invalidateCachedAnswersForEntities(
        changedEntityIds,
        'github_rag_sync_changed_entities'
      )
    : 0;
  await saveGithubSyncState({
    fingerprint: manifest.live ? fingerprint : state?.fingerprint ?? fingerprint,
    fullSync: true,
  });

  return {
    ok: true,
    synced: true,
    reason: force
      ? 'forced'
      : changed
        ? 'github_changed'
        : 'weekly_refresh',
    manifestLive: manifest.live,
    changed,
    weeklyDue,
    repositoryCount: github.repositories.length,
    chunkCount: github.chunks.length,
    inserted: sum(persistences.map((item) => item.inserted)),
    updated: sum(persistences.map((item) => item.updated)),
    deleted: sum(persistences.map((item) => item.deleted)) + staleDeleted,
    skipped: sum(persistences.map((item) => item.skipped)),
    answerCacheInvalidated,
  };
}

async function ensureGithubSyncStateSchema() {
  const pool = await getPostgresPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rag_external_sync_state (
      source_key text PRIMARY KEY,
      fingerprint text NOT NULL DEFAULT '',
      last_checked_at timestamptz,
      last_full_sync_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function getGithubSyncState(): Promise<GithubSyncState | null> {
  const pool = await getPostgresPool();
  const result = await pool.query<{
    fingerprint: string;
    last_full_sync_at: Date | null;
  }>(
    `SELECT fingerprint, last_full_sync_at
     FROM rag_external_sync_state
     WHERE source_key = $1
     LIMIT 1`,
    [GITHUB_SYNC_STATE_KEY]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    fingerprint: row.fingerprint,
    lastFullSyncAt: row.last_full_sync_at?.toISOString() ?? null,
  };
}

async function saveGithubSyncState({
  fingerprint,
  fullSync,
}: {
  fingerprint: string;
  fullSync: boolean;
}) {
  const pool = await getPostgresPool();
  await pool.query(
    `
      INSERT INTO rag_external_sync_state (
        source_key,
        fingerprint,
        last_checked_at,
        last_full_sync_at,
        updated_at
      )
      VALUES ($1, $2, now(), CASE WHEN $3 THEN now() ELSE NULL END, now())
      ON CONFLICT (source_key)
      DO UPDATE SET
        fingerprint = EXCLUDED.fingerprint,
        last_checked_at = now(),
        last_full_sync_at = CASE
          WHEN $3 THEN now()
          ELSE rag_external_sync_state.last_full_sync_at
        END,
        updated_at = now()
    `,
    [GITHUB_SYNC_STATE_KEY, fingerprint, fullSync]
  );
}

async function deleteStaleGithubSources(activeSourceKeys: string[]) {
  const pool = await getPostgresPool();
  const result = await pool.query(
    `
      DELETE FROM rag_sources
      WHERE type = 'static'
        AND source_key LIKE 'github:%'
        AND NOT (source_key = ANY($1::text[]))
    `,
    [activeSourceKeys]
  );
  return result.rowCount ?? 0;
}

function createManifestFingerprint(manifest: GithubRepositorySyncManifest) {
  return hashString(
    JSON.stringify(
      manifest.repositories.map((repository) => ({
        name: repository.name,
        defaultBranch: repository.defaultBranch,
        updatedAt: repository.updatedAt,
        pushedAt: repository.pushedAt,
      }))
    )
  );
}

function isWeeklyRefreshDue(lastFullSyncAt: string | null) {
  if (!lastFullSyncAt) return true;
  const lastSyncTime = new Date(lastFullSyncAt).getTime();
  if (!Number.isFinite(lastSyncTime)) return true;
  return Date.now() - lastSyncTime >= getWeeklyRefreshMs();
}

function getWeeklyRefreshMs() {
  const value = Number.parseInt(
    process.env.ASKOOSU_GITHUB_RAG_WEEKLY_REFRESH_MS ?? '',
    10
  );
  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_WEEKLY_REFRESH_MS;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
