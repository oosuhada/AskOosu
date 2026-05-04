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

## Sync Step

After the Markdown import and integration sharing are complete, call the admin-protected RAG sync endpoint. It currently returns recursive Notion fetch metadata (`ok`, `pageId`, `blockCount`, `textLength`, `sections`, `warnings`) without writing to the database.

```bash
curl -X POST http://localhost:3000/api/rag/sync \
  -H "Authorization: Bearer $ASKOOSU_RAG_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```
