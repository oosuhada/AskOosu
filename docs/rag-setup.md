# AskOosu RAG Setup

`docs/notion-wiki-draft-v10-ko.md` and `docs/notion-wiki-draft-v10-en.md` are the canonical language-managed Markdown sources for the AskOosu Notion wiki.

## Notion Import Checklist

1. Open the parent Notion page `AskOosu Wiki` (`355a342869018181b578d73a791356af`).
2. Import `docs/notion-wiki-draft-v10-ko.md` as a `KO` child page.
3. Import `docs/notion-wiki-draft-v10-en.md` as an `EN` child page.
4. Create a Notion integration for AskOosu RAG.
5. Share the parent `AskOosu Wiki` page and both child pages with that integration.
6. Use the parent page id as the sync target.
7. Run `/api/rag/sync` after the page and environment variables are ready.
8. If the parent page sync returns only the child page titles and not the KO/EN page body, switch to direct child-page mode with `ASKOOSU_NOTION_PAGE_IDS`.

## Environment Variables

Use real values only in `.env.local` or the deployment environment. Do not commit secrets.

```env
NOTION_API_KEY=
NOTION_PAGE_ID=355a342869018181b578d73a791356af
ASKOOSU_NOTION_PAGE_IDS=
ASKOOSU_NOTION_KO_PAGE_IDS=
ASKOOSU_NOTION_EN_PAGE_IDS=
GROQ_API_KEY=
DATABASE_URL=
```

The sync route recursively reads every configured page id. Preferred production mode is the parent page only:

```env
NOTION_PAGE_ID=355a342869018181b578d73a791356af
ASKOOSU_NOTION_PAGE_IDS=
```

Fallback direct child-page mode is available if Notion does not expose imported child page bodies through the parent block tree:

```env
NOTION_PAGE_ID=
ASKOOSU_NOTION_PAGE_IDS=356a34286901807aa0c1f993a495c59d,356a34286901801583aff1822dac7f28
ASKOOSU_NOTION_KO_PAGE_IDS=356a34286901807aa0c1f993a495c59d
ASKOOSU_NOTION_EN_PAGE_IDS=356a34286901801583aff1822dac7f28
```

Avoid setting both the parent and the direct KO/EN child page ids at the same time unless you intentionally want to sync both sources, because duplicate wiki content can reduce search quality.

`ASKOOSU_NOTION_KO_PAGE_IDS` and `ASKOOSU_NOTION_EN_PAGE_IDS` are optional hints for language tagging. The sync code also infers language from page titles such as `KO`, `EN`, `Korean`, or `English`.

## Database Migration

AskOosu uses raw SQL with `pg` for the RAG database path. Apply the migration after `DATABASE_URL` is set in your shell or deployment environment:

```bash
psql "$DATABASE_URL" -f db/migrations/001_create_rag_database_schema.sql
psql "$DATABASE_URL" -f db/migrations/002_create_answer_feedback.sql
psql "$DATABASE_URL" -f db/migrations/003_create_chat_cache_and_provider_usage.sql
psql "$DATABASE_URL" -f db/migrations/004_add_rag_language_and_sync_lock.sql
psql "$DATABASE_URL" -f db/migrations/005_create_rag_search_cache.sql
```

For the Mac mini Docker Compose deployment, run:

```bash
scripts/prod-migrate.sh
```

The migration creates:

- `rag_sources`
- `rag_chunks`
- `rag_sync_runs`
- `answer_feedback`
- `answer_cache`
- `ai_provider_usage`
- `ai_provider_status`
- `rag_sync_locks`
- `rag_search_cache`

It also adds PostgreSQL indexes for `chunk_id`, `entity_id`, `source_id`, `has_todo`, metadata JSON, full-text search, and pgvector embedding search.

`answer_feedback` stores lightweight answer quality signals from the chat UI: session/message ids, truncated question and answer text, up/down rating, optional reason, matched entity ids, source chunk ids, confidence, and creation time. It intentionally does not store IP addresses, user agents, or authenticated user identity.

`answer_cache` stores generated RAG answers by normalized question, language, and wiki version so repeat questions can skip the provider call. `ai_provider_usage` and `ai_provider_status` record provider latency, token usage, success/failure, and recent status for Groq/Google fallback operations.

`rag_sources.language` and `rag_chunks.language` let Korean questions search Korean chunks first and English questions search English chunks first. `rag_sync_locks` prevents two sync runs from mutating the same chunk set at the same time. `rag_search_cache` stores short-lived top chunk results so repeated free-form questions do not rerun ranking every time.

## Google Vertex Fallback

Google Vertex is optional. The code path is ready, but real credentials and project env are required before it can make calls.

For local development, prefer Application Default Credentials:

```bash
gcloud auth application-default login
```

For production Docker on the Mac mini, either set `GOOGLE_VERTEX_API_KEY` if you intentionally use API-key auth, or mount an ADC/service-account credentials file into the container and set `GOOGLE_APPLICATION_CREDENTIALS` to the in-container path. Cloud Run/Compute Engine can use an attached service account, but a local Docker Compose container does not automatically inherit a Google Cloud service account.

Minimum fallback env:

```env
GOOGLE_AI_ENABLED=true
GOOGLE_AI_MAX_CALLS_PER_DAY=100
GOOGLE_AI_COOLDOWN_MS=60000
GOOGLE_VERTEX_PROJECT=
GOOGLE_CLOUD_PROJECT=
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_MODEL=gemini-2.5-flash
GOOGLE_APPLICATION_CREDENTIALS=
```

`GOOGLE_AI_MAX_CALLS_PER_DAY` is enforced from `ai_provider_usage`. Provider cooldown state is read from `ai_provider_status`, so a rate-limited provider can be skipped on the next request instead of retried immediately. Keep `GOOGLE_AI_ENABLED=false` until credentials are configured.

## Sync Step

After the Markdown import and integration sharing are complete, call the admin-protected RAG sync endpoint. It returns aggregate metadata (`ok`, `pageId`, `pageIds`, `sourceId`, `syncRunId`, `blockCount`, `chunkCount`, `inserted`, `updated`, `skipped`, `warnings`) plus a `sources` array with per-page sync results.

```bash
curl -X POST http://localhost:3000/api/rag/sync \
  -H "Authorization: Bearer $ASKOOSU_RAG_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

For production:

```bash
ASKOOSU_BASE_URL=https://oosu.dev scripts/prod-rag-sync.sh
corepack pnpm rag:eval -- --base-url https://oosu.dev
```
