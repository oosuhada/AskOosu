# AskOosu

AskOosu is Oosu Jang's 2026 AI-connected portfolio, deployed at [oosu.dev](https://oosu.dev).

Instead of asking visitors to scroll through a static profile, AskOosu lets them ask natural language questions and receive grounded answers about Oosu's projects, skills, working style, contact links, and portfolio evidence.

![AskOosu desktop preview](public/images/projects/askoosu-cover-desktop.webp)

## Live Portfolio Links

- Current portfolio: [https://oosu.dev](https://oosu.dev)
- GitHub profile: [https://github.com/oosuhada](https://github.com/oosuhada)
- LinkedIn: [https://www.linkedin.com/in/oosuhada/](https://www.linkedin.com/in/oosuhada/)
- 2025 portfolio archive: [https://portfoli-oh.oosu.dev](https://portfoli-oh.oosu.dev)
- Legacy portfolio repository: [https://github.com/oosuhada/portfoli-oh](https://github.com/oosuhada/portfoli-oh)
- AskOosu wiki source: [Notion source page](https://www.notion.so/355a342869018181b578d73a791356af)

## Core Direction

- AI-connected Fullstack Developer portfolio
- LLM-style browser input as the main UI
- Five suggested questions at a time from an eight-question pool
- Local chat history, language preference, and theme preference
- Visitor-facing concept question: `포트폴리오를 왜 대화형으로 만들었어요?`
- Project cards for AskOosu 2026, Instagram Clone, Sticks & Stones Homepage, Portfoli-Oh! 2025, Pylingo, Javalingo, Onjung, Nomad Market, and Notion Knowledge Wiki
- Notion RAG retrieval path for Korean/English resume pages, study notes, GitHub activity summaries, and wiki-based answers
- RAG sync/search API routes with memory storage by default and optional Postgres + pgvector storage
- Optional Grok/xAI provider mode through AI SDK 6, using xAI Responses by default
- Optional Groq provider mode with multiple API keys, lazy cooldown, and automatic reactivation after failures or quota/rate-limit errors
- Cache-first chat orchestration with FAQ/deterministic answers, answer cache, RAG context, and optional Google Vertex fallback

## Representative Projects

AskOosu treats project information as retrievable portfolio evidence. The public portfolio currently highlights a small set of representative projects instead of presenting every learning repository as equal weight.

| Project | Role in Portfolio | Live / Source |
| --- | --- | --- |
| AskOosu 2026 | Current AI/RAG portfolio and answer-quality system | [Live](https://oosu.dev) / [GitHub](https://github.com/oosuhada/AskOosu) |
| Aigram | Fullstack SNS practice with React, Spring Boot, PostgreSQL, search, auth, and media flows | [Live](https://aigram.oosu.dev) |
| Sticks & Stones Homepage | Real-client website renewal and frontend migration case | [Live](https://stks.oosu.dev) |
| Portfoli-Oh! 2025 | Vanilla HTML/CSS/JavaScript interaction archive and previous portfolio | [Live](https://portfoli-oh.oosu.dev) / [GitHub](https://github.com/oosuhada/portfoli-oh) |
| Pylingo / Javalingo | Smaller learning-app references for education UX and study flow | [Pylingo](https://oosuhada.github.io/pylingo/) / [Javalingo](https://oosuhada.github.io/javalingo/) |

![Aigram desktop preview](public/images/projects/aigram-cover-desktop.webp)

![Sticks and Stones desktop preview](public/images/projects/sticks-stones-cover-desktop.webp)

![Portfoli-Oh desktop preview](public/images/projects/portfolio-oh-cover-desktop.webp)

## Architecture

```text
Visitor
  |
  v
Next.js App Router UI
  |-- suggested questions
  |-- local chat history
  |-- rich answer cards
  |-- public source summaries
  |
  v
/api/chat SSE endpoint
  |-- deterministic portfolio policies
  |-- FAQ cache and semantic routing
  |-- answer cache
  |-- optional model rewrite/generation
  |
  v
Portfolio knowledge layer
  |-- Notion API sync
  |-- local markdown second-brain docs
  |-- PostgreSQL RAG chunks
  |-- hybrid lexical/vector/entity scoring
  |
  v
Home-server deployment
  |-- Mac mini
  |-- Docker Compose
  |-- PostgreSQL
  |-- Nginx / Cloudflare front door
```

## GitHub Portfolio Curation

The GitHub profile is intentionally curated around public evidence:

- Public repositories should be readable without private credentials, raw secrets, local database dumps, or client-private assets.
- Representative projects should include a clear README, a live URL when available, screenshots, architecture notes, and honest scope boundaries.
- Private repositories can still appear in AskOosu as portfolio context when the public claim is backed by screenshots, case-study notes, or sanitized summaries.
- Duplicate or early learning repositories should not be over-positioned as production-ready work.

## Runtime Stack

- Framework: Next.js App Router, React, TypeScript
- Styling: Tailwind CSS
- Chat/runtime: Vercel AI SDK 6, SSE streaming, FAQ cache, deterministic routing
- Model providers: xAI/Grok, Groq, optional Google Vertex fallback
- Knowledge sources: Notion API, local markdown docs, Postgres-backed RAG chunks
- Data layer: raw SQL with `pg`, optional pgvector search
- Deployment: Mac mini home server, Docker Compose, PostgreSQL, Nginx/Cloudflare

## Run Locally

```bash
pnpm install
pnpm dev
```

Create `.env.local` with:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_ASKOOSU_DEBUG_UI_ENABLED=false

# Optional Grok/xAI mode
# ASKOOSU_AI_PROVIDER=xai
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-4
XAI_API_MODE=responses

# Optional Groq key pool mode
# ASKOOSU_AI_PROVIDER=groq
GROQ_API_KEYS=label:your_groq_api_key_here,label:another_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_KEY_FAILURE_THRESHOLD=3
GROQ_KEY_COOLDOWN_MS=900000
GROQ_KEY_QUOTA_COOLDOWN_MS=3600000

# Optional Google Vertex provider/fallback
# ASKOOSU_AI_PROVIDER=google_vertex
GOOGLE_VERTEX_API_KEY=
GOOGLE_VERTEX_PROJECT=
GOOGLE_CLOUD_PROJECT=
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_MODEL=gemini-2.5-flash
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_AI_ENABLED=false
GOOGLE_AI_MAX_CALLS_PER_DAY=100
GOOGLE_AI_COOLDOWN_MS=60000

# Optional Notion RAG
NOTION_API_KEY=your_notion_integration_secret
NOTION_VERSION=2026-03-11
NOTION_PAGE_ID=355a342869018181b578d73a791356af
ASKOOSU_NOTION_PAGE_IDS=
ASKOOSU_NOTION_KO_PAGE_IDS=
ASKOOSU_NOTION_EN_PAGE_IDS=
ASKOOSU_NOTION_DATABASE_IDS=
ASKOOSU_NOTION_DATA_SOURCE_IDS=
ASKOOSU_RAG_STORE=memory
ASKOOSU_RAG_AUTO_SYNC=true
ASKOOSU_RAG_RETRIEVAL=hybrid
ASKOOSU_RAG_HYBRID_LEXICAL_WEIGHT=0.35
ASKOOSU_RAG_HYBRID_VECTOR_WEIGHT=0.35
ASKOOSU_RAG_HYBRID_ENTITY_WEIGHT=0.15
ASKOOSU_RAG_HYBRID_INTENT_WEIGHT=0.10
ASKOOSU_RAG_HYBRID_FRESHNESS_WEIGHT=0.05
ASKOOSU_RAG_TOP_K=5
ASKOOSU_RAG_SEARCH_CACHE_TTL_MS=300000
ASKOOSU_RAG_ADMIN_TOKEN=local_or_server_secret
ASKOOSU_WIKI_VERSION=v10
ASKOOSU_ANSWER_CACHE_TTL_HOURS=24
ASKOOSU_RAG_SYNC_LOCK_TTL_SECONDS=300
ASKOOSU_CHAT_MAX_REQUEST_BYTES=32768
ASKOOSU_RATE_LIMIT_STORE=postgres
ASKOOSU_FAQ_SEMANTIC_ROUTER_ENABLED=true
ASKOOSU_FAQ_SEMANTIC_DIRECT_MIN=0.88
ASKOOSU_FAQ_SEMANTIC_REWRITE_MIN=0.76
ASKOOSU_FAQ_SEMANTIC_MARGIN_MIN=0.12

# Optional embedding/vector search
# ASKOOSU_RAG_RETRIEVAL=embedding
ASKOOSU_EMBEDDING_MODEL=text-embedding-3-small
ASKOOSU_EMBEDDING_DIMENSIONS=1536

# Optional pgvector storage
# ASKOOSU_RAG_STORE=postgres
# DATABASE_URL=postgres://user:password@host:5432/database
# ASKOOSU_POSTGRES_HOST_PORT=5433
```

Open http://localhost:3000.

RAG admin routes:

- `GET /api/rag/sync`: recursively fetches the configured Notion wiki page or pages, returns aggregate sync stats, and persists chunks when `DATABASE_URL` is configured
- `POST /api/rag/sync`: same recursive Notion sync behavior
- `GET /api/rag/search?query=...`: searches the synced knowledge base
- `POST /api/rag/search`: searches with JSON body `{ "query": "...", "limit": 5 }`

Use `NOTION_PAGE_ID` for the parent AskOosu Wiki page. If the parent sync only sees child page titles and misses imported KO/EN page content, leave `NOTION_PAGE_ID` empty and set `ASKOOSU_NOTION_PAGE_IDS` to the KO and EN child page ids.

For Google Vertex fallback, run `gcloud auth application-default login` in local development, then set `GOOGLE_AI_ENABLED=true` and `GOOGLE_VERTEX_PROJECT` or `GOOGLE_CLOUD_PROJECT`. In production Docker, mount credentials into the container and set `GOOGLE_APPLICATION_CREDENTIALS`, or use `GOOGLE_VERTEX_API_KEY` intentionally.

See [docs/architecture.md](docs/architecture.md) for the frontend, Grok streaming, and Notion/RAG upgrade plan.

Production Mac mini / Docker Compose notes live in [docs/home-server-deploy.md](docs/home-server-deploy.md), including `/api/health`, env-file permissions, backups, and Docker log checks.
