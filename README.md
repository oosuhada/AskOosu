# AskOosu

AskOosu is Oosu Jang's 2026 AI-connected portfolio.

Instead of a static portfolio, this project uses a chat-first interface: visitors can ask natural language questions and receive guided answers about Oosu, projects, skills, contact links, resume placeholders, and the planned Notion wiki.

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

## Links

- GitHub: https://github.com/oosuhada
- LinkedIn: https://www.linkedin.com/in/oosuhada/
- Instagram: https://www.instagram.com/oosu.hada
- AskOosu: https://oosu.dev
- AskOosu Wiki: https://www.notion.so/355a342869018181b578d73a791356af
- Source Notion page: https://www.notion.so/355a342869018181b578d73a791356af
- 2025 portfolio: https://portfoli-oh.oosu.dev
- 2025 portfolio repository: https://github.com/oosuhada/portfoli-oh

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
ASKOOSU_RAG_RETRIEVAL=lexical
ASKOOSU_RAG_TOP_K=5
ASKOOSU_RAG_SEARCH_CACHE_TTL_MS=300000
ASKOOSU_RAG_ADMIN_TOKEN=local_or_server_secret
ASKOOSU_WIKI_VERSION=v10
ASKOOSU_ANSWER_CACHE_TTL_HOURS=24
ASKOOSU_RAG_SYNC_LOCK_TTL_SECONDS=300
ASKOOSU_CHAT_MAX_REQUEST_BYTES=32768

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
