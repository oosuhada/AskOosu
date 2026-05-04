# AskOosu Home Server Deploy

AskOosu production target:

```text
Browser
-> Cloudflare DNS / Tunnel
-> cloudflared on Mac mini
-> Homebrew Nginx :8080
-> Docker app 127.0.0.1:3010
-> Next.js production server
```

## Paths

- Repo path: `/Users/gabriel/Development/AskOosu`
- Production service path: `/Users/gabrieljang/Services/askoosu-orbstack`
- Compose template: `ops/orbstack/compose.prod.yml`
- Nginx template: `ops/nginx/oosu.dev.conf`
- App domain: `https://oosu.dev`
- App upstream: `127.0.0.1:3010`
- Postgres service: Docker internal host `postgres:5432`

AskOosu should not change the existing Instagram, Sticks & Stones, or Portfoli-Oh routes.

## Environment

Create `/Users/gabrieljang/Services/askoosu-orbstack/.env.production` from `ops/orbstack/env.production.example`.

Required values:

```env
POSTGRES_USER=askoosu
POSTGRES_PASSWORD=replace_with_a_strong_password
POSTGRES_DB=askoosu
DATABASE_URL=postgres://askoosu:replace_with_a_strong_password@postgres:5432/askoosu
NEXT_PUBLIC_APP_URL=https://oosu.dev

NOTION_API_KEY=
NOTION_PAGE_ID=355a342869018181b578d73a791356af
ASKOOSU_NOTION_PAGE_IDS=
ASKOOSU_NOTION_KO_PAGE_IDS=
ASKOOSU_NOTION_EN_PAGE_IDS=

ASKOOSU_AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_API_KEYS=
GOOGLE_AI_ENABLED=false
GOOGLE_AI_MAX_CALLS_PER_DAY=100
GOOGLE_VERTEX_API_KEY=
GOOGLE_VERTEX_PROJECT=
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_MODEL=gemini-2.5-flash
GOOGLE_APPLICATION_CREDENTIALS=

RAG_SYNC_SECRET=
ASKOOSU_RAG_ADMIN_TOKEN=
ASKOOSU_RAG_STORE=postgres
ASKOOSU_RAG_AUTO_SYNC=false
ASKOOSU_WIKI_VERSION=v10
ASKOOSU_ANSWER_CACHE_TTL_HOURS=24
ASKOOSU_RAG_SYNC_LOCK_TTL_SECONDS=300
ASKOOSU_CHAT_MAX_REQUEST_BYTES=32768
```

Use real values only in `.env.production` or the shell environment. Do not commit secrets.

Use the parent `AskOosu Wiki` page in `NOTION_PAGE_ID` first. If `/api/rag/sync` reports only a small block count or only the KO/EN child page titles, switch to direct child-page mode:

```env
NOTION_PAGE_ID=
ASKOOSU_NOTION_PAGE_IDS=356a34286901807aa0c1f993a495c59d,356a34286901801583aff1822dac7f28
ASKOOSU_NOTION_KO_PAGE_IDS=356a34286901807aa0c1f993a495c59d
ASKOOSU_NOTION_EN_PAGE_IDS=356a34286901801583aff1822dac7f28
```

## Deploy With Compose

Copy or sync the repo into the production service path, then run from the repo root inside that path:

```bash
cd /Users/gabrieljang/Services/askoosu-orbstack
cp ops/orbstack/env.production.example .env.production
# edit .env.production locally with real values
docker compose -f ops/orbstack/compose.prod.yml build
docker compose -f ops/orbstack/compose.prod.yml up -d
docker compose -f ops/orbstack/compose.prod.yml ps
docker compose -f ops/orbstack/compose.prod.yml logs -f app
```

The app binds only to `127.0.0.1:3010:3000`. Postgres is internal to the Compose network by default, so it does not collide with the existing Instagram Postgres on `127.0.0.1:5432`.

## Migration

The migrations are idempotent where possible and use `CREATE ... IF NOT EXISTS` for tables, extensions, indexes, and added columns.

Apply them after the containers are running:

```bash
cd /Users/gabrieljang/Services/askoosu-orbstack
scripts/prod-migrate.sh
```

This applies:

- `db/migrations/001_create_rag_database_schema.sql`
- `db/migrations/002_create_answer_feedback.sql`
- `db/migrations/003_create_chat_cache_and_provider_usage.sql`
- `db/migrations/004_add_rag_language_and_sync_lock.sql`

The script runs `psql` inside the `postgres` Compose service and reads `POSTGRES_USER` and `POSTGRES_DB` from `.env.production`.

Migration `003` is required for `answer_cache`, `ai_provider_usage`, and `ai_provider_status`. Migration `004` is required for language-specific RAG search and sync locking. If production was already deployed before these migrations existed, run `scripts/prod-migrate.sh` again after pulling the latest code.

## Google Vertex Fallback

Groq remains the primary provider. Google Vertex is a fallback only when credentials and env are configured.

For local development outside Docker:

```bash
gcloud auth application-default login
```

For this Mac mini Docker Compose deployment, a local ADC login on the host is not enough by itself. Use one of these secure options:

- Set `GOOGLE_VERTEX_API_KEY` only if API-key auth is intentionally enabled for the project.
- Mount an ADC or service-account credentials file into the app container and set `GOOGLE_APPLICATION_CREDENTIALS` to the container path.

Keep `GOOGLE_AI_ENABLED=false` until credentials are available. Then set:

```env
GOOGLE_AI_ENABLED=true
GOOGLE_AI_MAX_CALLS_PER_DAY=100
GOOGLE_VERTEX_PROJECT=<google-cloud-project-id>
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_MODEL=gemini-2.5-flash
```

`GOOGLE_AI_MAX_CALLS_PER_DAY` is enforced from `ai_provider_usage` so fallback usage does not silently run without a daily call cap.

## Nginx

Template: `ops/nginx/oosu.dev.conf`

It proxies `oosu.dev` from Homebrew Nginx on `:8080` to the AskOosu app on `127.0.0.1:3010`.

Install with backup:

```bash
cd /Users/gabrieljang/Services/askoosu-orbstack
scripts/prod-install-nginx.sh
```

Manual equivalent:

```bash
sudo mkdir -p /opt/homebrew/etc/nginx/servers/backups
sudo cp /opt/homebrew/etc/nginx/servers/oosu.dev.conf \
  /opt/homebrew/etc/nginx/servers/backups/oosu.dev.conf.$(date +%Y%m%d-%H%M%S).bak 2>/dev/null || true
sudo cp ops/nginx/oosu.dev.conf /opt/homebrew/etc/nginx/servers/oosu.dev.conf
nginx -t
brew services restart nginx
```

Only restart Nginx after `nginx -t` passes.

## Cloudflare Tunnel

Current tunnel:

- Name: `macmini`
- ID: `9224db63-e2cf-435e-b68b-196269e0c87b`
- Config: `~/.cloudflared/config.yml`
- LaunchAgent: `com.cloudflare.cloudflared`

Check and back up config:

```bash
scripts/prod-cloudflared-check.sh
```

If `oosu.dev` is missing, add the DNS route:

```bash
cloudflared tunnel route dns macmini oosu.dev
```

Then add this ingress entry above the final catch-all rule in `~/.cloudflared/config.yml`:

```yaml
- hostname: oosu.dev
  service: http://localhost:8080
```

Restart cloudflared:

```bash
launchctl kickstart -k gui/$(id -u)/com.cloudflare.cloudflared
```

Do not remove or edit the existing `ssh.oosu.dev`, `aigram.oosu.dev`, `aigram-api.oosu.dev`, `stks.oosu.dev`, or `portfoli-oh.oosu.dev` entries.

## RAG Sync

After migration and Notion env setup:

```bash
cd /Users/gabrieljang/Services/askoosu-orbstack
ASKOOSU_BASE_URL=https://oosu.dev scripts/prod-rag-sync.sh
```

The script sends the admin token as a header and prints `ok`, `sourceId`, `syncRunId`, `blockCount`, `chunkCount`, `inserted`, `updated`, `skipped`, and warnings. It does not print the secret.

## RAG Eval

Search-only mode:

```bash
cd /Users/gabrieljang/Services/askoosu-orbstack
corepack pnpm rag:eval -- --base-url https://oosu.dev
```

Wrapper:

```bash
ASKOOSU_BASE_URL=https://oosu.dev scripts/prod-rag-eval.sh
```

Chat mode only runs when Groq credentials are configured:

```bash
corepack pnpm rag:eval -- --base-url https://oosu.dev --chat
```

If eval fails with empty results, check in this order:

1. `/api/health` returns DB `ok`.
2. Migrations have been applied.
3. `/api/rag/sync` has inserted chunks.
4. Wiki body contains the expected answer.
5. Entity aliases in `src/lib/rag/notion-chunks.ts` match the wording.
6. Chunk rules did not mark public evidence as `needs_review` or TODO.

## Health Checks

```bash
curl -I https://oosu.dev
curl https://oosu.dev/api/health
docker compose -f ops/orbstack/compose.prod.yml ps
docker compose -f ops/orbstack/compose.prod.yml logs -f app
```

Expected `/api/health` shape:

```json
{
  "ok": true,
  "service": "askoosu",
  "timestamp": "2026-05-04T00:00:00.000Z",
  "db": {
    "ok": true,
    "status": "ok"
  }
}
```

## Rollback

App rollback:

```bash
cd /Users/gabrieljang/Services/askoosu-orbstack
docker compose -f ops/orbstack/compose.prod.yml down
git checkout <previous_commit>
docker compose -f ops/orbstack/compose.prod.yml build
docker compose -f ops/orbstack/compose.prod.yml up -d
```

Nginx rollback:

```bash
sudo cp /opt/homebrew/etc/nginx/servers/backups/<backup-file> \
  /opt/homebrew/etc/nginx/servers/oosu.dev.conf
nginx -t
brew services restart nginx
```

Cloudflared rollback:

```bash
cp ~/.cloudflared/config.yml.<timestamp>.bak ~/.cloudflared/config.yml
launchctl kickstart -k gui/$(id -u)/com.cloudflare.cloudflared
```
