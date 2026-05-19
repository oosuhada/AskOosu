# AskOosu Analytics And Question Logging

Last updated: 2026-05-13

## Storage Choice

AskOosu uses the existing PostgreSQL database for custom AskOosu question logs.
This is the most natural option for this codebase because the project already
has:

- raw SQL migrations under `db/migrations/`
- lazy `pg` pooling in `src/lib/db/postgres.ts`
- PostgreSQL-backed RAG chunks, answer cache, feedback, provider usage, and rate limits
- Mac mini Docker Compose production notes that already run Postgres migrations

Cloudflare D1 is not used in this implementation because it would add a second
database path. Supabase is also not introduced because the existing Postgres
pattern is already sufficient.

## What Is Logged

`ask_events` stores privacy-conscious product-quality signals:

- anonymous `session_id`
- language
- sanitized `question` and `question_redacted`
- sanitized `answer_preview`, a short redacted response excerpt for quality review
- normalized intent
- answer mode: `direct_cache`, `rag`, `fallback`, `smalltalk`, `safety`, `unknown`
- confidence
- source document IDs
- model provider
- latency
- optional user feedback value
- page path, referrer without query string, UTM values
- country code, device type, browser, OS

Raw IP addresses and precise geolocation are not stored.

## Cloudflare Web Analytics

Cloudflare Web Analytics can be enabled without hardcoding a token:

```bash
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=<cloudflare-web-analytics-token>
```

If the variable is empty, the Cloudflare beacon script is not loaded.

Manual Cloudflare setup:

1. Open the Cloudflare dashboard for `oosu.dev`.
2. Enable Web Analytics for the site.
3. Copy the Web Analytics token.
4. Add it to the production environment as `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`.
5. Rebuild and redeploy the app.

## Retention

Sanitized question logs are kept for product-quality review unless they are
manually deleted, aggregated, or no longer needed for improving the portfolio
experience. No automatic deletion job is enabled in this implementation.

Manual cleanup SQL is kept here for future review, but it should not be run
unless the retention policy changes or the owner explicitly decides to prune old
records.

Example Postgres cleanup:

```sql
DELETE FROM ask_events
WHERE created_at < now() - interval '180 days';
```

Optional feedback cleanup if needed later:

```sql
DELETE FROM answer_feedback
WHERE created_at < now() - interval '180 days';
```

## Useful Read Queries

Total questions:

```sql
SELECT count(*) AS total_questions
FROM ask_events;
```

Questions by answer mode:

```sql
SELECT answer_mode, count(*) AS count
FROM ask_events
GROUP BY answer_mode
ORDER BY count DESC;
```

Top normalized intents:

```sql
SELECT normalized_intent, count(*) AS count
FROM ask_events
WHERE normalized_intent IS NOT NULL
GROUP BY normalized_intent
ORDER BY count DESC
LIMIT 20;
```

Fallback or low-confidence questions:

```sql
SELECT created_at, language, question_redacted, normalized_intent, answer_mode, confidence, source_doc_ids
FROM ask_events
WHERE answer_mode = 'fallback'
   OR confidence IS NULL
   OR confidence < 0.55
ORDER BY created_at DESC
LIMIT 50;
```

Recent questions with answer previews:

```sql
SELECT created_at, language, question_redacted, answer_preview, normalized_intent, answer_mode, confidence
FROM ask_events
ORDER BY created_at DESC
LIMIT 50;
```

Questions with no source docs:

```sql
SELECT created_at, language, question_redacted, normalized_intent, answer_mode, confidence
FROM ask_events
WHERE cardinality(source_doc_ids) = 0
ORDER BY created_at DESC
LIMIT 50;
```

Feedback counts:

```sql
SELECT user_feedback, count(*) AS count
FROM ask_events
WHERE user_feedback IS NOT NULL
GROUP BY user_feedback
ORDER BY count DESC;
```

Average latency by answer mode:

```sql
SELECT answer_mode, round(avg(latency_ms)) AS avg_latency_ms
FROM ask_events
WHERE latency_ms IS NOT NULL
GROUP BY answer_mode
ORDER BY avg_latency_ms DESC;
```

## Admin Dashboard Decision

No public `/admin/analytics` dashboard is implemented yet. The repo does not
currently have a general-purpose admin auth pattern for pages. Until that exists,
use direct database queries over SSH or a private DB client.

`/admin/` is disallowed in `robots.ts` and is not included in `sitemap.ts`.

## Mac Mini Home Server Note

Production analytics should not depend on the Mac mini home server for uptime in
this implementation. The Mac mini can later be used for:

- private dashboard experiments
- backups
- local analysis notebooks
- Grafana, Metabase, Umami, or Plausible experiments

Keep the first production analytics path simple: Cloudflare Web Analytics plus
the existing Postgres-backed AskOosu event log.
