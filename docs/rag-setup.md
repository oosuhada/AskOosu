# AskOosu RAG Setup

`docs/wiki/notion-wiki-draft-v9.md` is the canonical Markdown source for the AskOosu Notion wiki.

## Notion Import Checklist

1. Import `docs/wiki/notion-wiki-draft-v9.md` into Notion as Markdown.
2. Create a Notion integration for AskOosu RAG.
3. Share the imported Notion page with that integration.
4. Copy the imported page id into `.env.local`.
5. Run `/api/rag/sync` after the page and environment variables are ready.

## Environment Variables

Use real values only in `.env.local` or the deployment environment. Do not commit secrets.

```env
NOTION_API_KEY=
NOTION_PAGE_ID=
GROQ_API_KEY=
DATABASE_URL=
```

The current Next.js sync code reads `ASKOOSU_NOTION_PAGE_IDS`, so copy the same Notion page id there as well when running the app:

```env
ASKOOSU_NOTION_PAGE_IDS=
```

## Database Migration

AskOosu uses raw SQL with `pg` for the RAG database path. Apply the migration after `DATABASE_URL` is set in your shell or deployment environment:

```bash
psql "$DATABASE_URL" -f db/migrations/001_create_rag_database_schema.sql
```

The migration creates:

- `rag_sources`
- `rag_chunks`
- `rag_sync_runs`

It also adds PostgreSQL indexes for `chunk_id`, `entity_id`, `source_id`, `has_todo`, metadata JSON, full-text search, and pgvector embedding search.

## Sync Step

After the Markdown import and integration sharing are complete, call the admin-protected RAG sync endpoint. It returns recursive Notion fetch metadata (`ok`, `pageId`, `blockCount`, `textLength`, `sections`, `warnings`) and writes chunks to the database when `DATABASE_URL` is configured.

```bash
curl -X POST http://localhost:3000/api/rag/sync \
  -H "Authorization: Bearer $ASKOOSU_RAG_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```
