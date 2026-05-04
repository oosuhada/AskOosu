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
```

Avoid setting both the parent and the direct KO/EN child page ids at the same time unless you intentionally want to sync both sources, because duplicate wiki content can reduce search quality.

## Database Migration

AskOosu uses raw SQL with `pg` for the RAG database path. Apply the migration after `DATABASE_URL` is set in your shell or deployment environment:

```bash
psql "$DATABASE_URL" -f db/migrations/001_create_rag_database_schema.sql
psql "$DATABASE_URL" -f db/migrations/002_create_answer_feedback.sql
psql "$DATABASE_URL" -f db/migrations/003_create_chat_cache_and_provider_usage.sql
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

It also adds PostgreSQL indexes for `chunk_id`, `entity_id`, `source_id`, `has_todo`, metadata JSON, full-text search, and pgvector embedding search.

`answer_feedback` stores lightweight answer quality signals from the chat UI: session/message ids, truncated question and answer text, up/down rating, optional reason, matched entity ids, source chunk ids, confidence, and creation time. It intentionally does not store IP addresses, user agents, or authenticated user identity.

`answer_cache` stores generated RAG answers by normalized question, language, and wiki version so repeat questions can skip the provider call. `ai_provider_usage` and `ai_provider_status` record provider latency, token usage, success/failure, and recent status for Groq/Google fallback operations.

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
