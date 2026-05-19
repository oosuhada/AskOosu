# AskOosu Analytics And Question Logging

Last updated: 2026-05-19

## Storage Choice

AskOosu uses the existing PostgreSQL database for custom AskOosu visitor and
question logs.
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

`visitor_events` stores page-view and acquisition signals:

- anonymous `session_id`
- `ip_hash`, generated server-side with HMAC-SHA256
- path, referrer without query string, UTM values
- Cloudflare country and optional city/region/timezone/lat-lon headers
- Cloudflare Ray ID
- user-agent hash plus coarse device/browser/OS labels
- screen, viewport, browser timezone, and browser language

`ask_events` stores privacy-conscious product-quality signals:

- anonymous `session_id`
- `ip_hash`, so question behavior can be correlated with visits without raw IP storage
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
- country code, optional city/region fields, device type, browser, OS

Raw IP addresses are not stored. `ip_hash` is intended for repeat-visitor
analysis, not identity proof. Set a stable production-only salt so the same IP
hashes consistently over time:

```bash
ASKOOSU_IP_HASH_SALT=<long-random-secret>
```

City/region fields depend on Cloudflare request headers. In Cloudflare, enable
visitor location headers if city/region-level reporting is needed. Location from
IP is approximate and may reflect VPNs, carriers, or company networks.

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

Daily visitor stats:

```sql
SELECT
  date_trunc('day', created_at) AS day,
  count(*) AS page_views,
  count(DISTINCT session_id) AS sessions,
  count(DISTINCT ip_hash) FILTER (WHERE ip_hash IS NOT NULL) AS ip_hashes
FROM visitor_events
WHERE created_at >= now() - interval '30 days'
GROUP BY day
ORDER BY day DESC;
```

Top entry and content paths:

```sql
SELECT path, count(*) AS page_views, count(DISTINCT session_id) AS sessions
FROM visitor_events
WHERE created_at >= now() - interval '30 days'
GROUP BY path
ORDER BY page_views DESC
LIMIT 30;
```

Referrer and campaign sources:

```sql
SELECT
  coalesce(utm_source, '(direct)') AS utm_source,
  coalesce(referrer, '(none)') AS referrer,
  count(*) AS page_views,
  count(DISTINCT session_id) AS sessions
FROM visitor_events
WHERE created_at >= now() - interval '30 days'
GROUP BY utm_source, referrer
ORDER BY page_views DESC
LIMIT 30;
```

Repeat visitors by IP hash:

```sql
SELECT
  ip_hash,
  min(created_at) AS first_seen_at,
  max(created_at) AS last_seen_at,
  count(*) AS page_views,
  count(DISTINCT session_id) AS sessions,
  array_agg(DISTINCT path) FILTER (WHERE path IS NOT NULL) AS paths
FROM visitor_events
WHERE ip_hash IS NOT NULL
GROUP BY ip_hash
HAVING count(*) > 1
ORDER BY last_seen_at DESC
LIMIT 50;
```

Visitor timeline by session:

```sql
SELECT created_at, path, referrer, utm_source, utm_campaign, country, geo_region, geo_city
FROM visitor_events
WHERE session_id = '<session-id>'
ORDER BY created_at;
```

Question timeline with visitor context:

```sql
SELECT
  created_at,
  session_id,
  ip_hash,
  country,
  geo_region,
  geo_city,
  page_path,
  question_redacted,
  answer_preview,
  answer_mode
FROM ask_events
ORDER BY created_at DESC
LIMIT 50;
```

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
