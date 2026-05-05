# AskOosu Architecture

AskOosu is intentionally chat-first. The first screen should feel like a usable portfolio conversation, not a landing page with a chatbot attached.

## Stage A: Frontend UX and Static Prompt

- Keep the portfolio centered on one conversational surface.
- Show five curated questions at a time from an eight-question pool.
- Hide questions already clicked in the current browser session until the pool is exhausted.
- Save chat history in `localStorage` so returning visitors can continue previous conversations.
- Store language and theme preferences locally and mirror them into the URL.
- Keep the resume link visible but disabled until the Notion resume is ready.

## Stage B: Grok API and Streaming

The chat API uses AI SDK 6 `streamText` and returns `toUIMessageStreamResponse()`, so the client receives streamed UI message parts that match the current `useChat` transport API.

Model selection is isolated in `src/app/api/chat/model-provider.ts`:

- Default provider: OpenAI with `OPENAI_MODEL` or `gpt-4o-mini`
- Grok provider: set `ASKOOSU_AI_PROVIDER=xai`
- Required for Grok: `XAI_API_KEY`
- Optional for Grok: `XAI_MODEL`, `XAI_BASE_URL`
- API mode: `XAI_API_MODE=responses` by default, or `chat` for the older Chat Completions-style xAI path
- Groq provider: set `ASKOOSU_AI_PROVIDER=groq`
- Required for Groq: `GROQ_API_KEYS` or `GROQ_API_KEY`
- Optional for Groq: `GROQ_MODEL`, `GROQ_BASE_URL`, `GROQ_KEY_FAILURE_THRESHOLD`, `GROQ_KEY_COOLDOWN_MS`, `GROQ_KEY_QUOTA_COOLDOWN_MS`

The xAI path uses `@ai-sdk/xai`. `xai.responses(model)` is the default because it is the forward-looking path for agentic/tool-capable Responses features. `xai.chat(model)` is still available through `XAI_API_MODE=chat` when a model or account behaves better on the chat endpoint.

The Groq path uses `@ai-sdk/groq` with a local in-process key pool. `GROQ_API_KEYS` accepts comma- or newline-separated entries in `label:key` format. Each request selects the next active key. Provider/network failures increment that key's failure count; once `GROQ_KEY_FAILURE_THRESHOLD` is reached, the key is disabled until `GROQ_KEY_COOLDOWN_MS` has elapsed. Quota and rate-limit responses disable the key immediately until `GROQ_KEY_QUOTA_COOLDOWN_MS` has elapsed. Reactivation is lazy: the next request after the cooldown resets the key and makes it eligible again.

## Stage C: Notion and RAG

Notion is now treated as the source candidate for portfolio facts. The app can fetch Notion pages, legacy databases, and current data sources, chunk their text, rank the chunks against the visitor's question, and inject the retrieved context into the system prompt.

Current behavior:

1. If `NOTION_API_KEY` is absent, AskOosu falls back to static profile/project chunks.
2. If `NOTION_API_KEY` is present, it reads `ASKOOSU_NOTION_PAGE_IDS`, `ASKOOSU_NOTION_DATABASE_IDS`, and `ASKOOSU_NOTION_DATA_SOURCE_IDS`.
3. If page ids are not configured, it attempts the current source page from `oosuProfile.notionSourceUrl`.
4. Retrieval defaults to lexical ranking for speed and no extra cost.
5. `ASKOOSU_RAG_RETRIEVAL=embedding` or `hybrid` enables OpenAI embedding ranking with `text-embedding-3-small`, falling back to lexical ranking if embeddings fail.
6. `ASKOOSU_RAG_STORE=memory` keeps chunks in the running Node process. `ASKOOSU_RAG_STORE=postgres` stores chunks and vectors in Postgres using pgvector.
7. `/api/rag/sync` recursively fetches the configured Notion wiki page or direct KO/EN child page ids, returns aggregate sync stats with per-source details, and persists chunks into `rag_sources`, `rag_chunks`, and `rag_sync_runs` when `DATABASE_URL` is configured. `/api/rag/search` exposes an admin-protected search/debug API.
8. `/api/feedback` stores answer-level up/down feedback in `answer_feedback` with truncated question/answer text, matched entity ids, source chunk ids, confidence, and an optional visitor note. Feedback write failures are isolated from chat streaming so the core chat UX remains usable.

The next Mac mini/home-server step is to run sync on a schedule, keep Postgres + pgvector warm, and eventually add incremental sync based on Notion edit timestamps.

## Suggested Notion Shape

- `Profile`: bio, location, background, current focus
- `Projects`: title, year, role, stack, links, screenshots, decision notes
- `Resume`: Korean and English resume pages
- `Learning Logs`: GitHub or study summaries
- `Decisions`: architecture choices and portfolio iteration notes

## Runtime Env

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Optional provider mode: openai (default), xai, or groq
ASKOOSU_AI_PROVIDER=openai

# Optional Grok/xAI mode
# ASKOOSU_AI_PROVIDER=xai
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-4
XAI_API_MODE=responses
XAI_BASE_URL=https://api.x.ai/v1

# Optional Groq key pool mode
# ASKOOSU_AI_PROVIDER=groq
GROQ_API_KEYS=label:your_groq_api_key_here,label:another_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_KEY_FAILURE_THRESHOLD=3
GROQ_KEY_COOLDOWN_MS=900000
GROQ_KEY_QUOTA_COOLDOWN_MS=3600000

# Optional Notion RAG
NOTION_API_KEY=your_notion_integration_secret
NOTION_VERSION=2026-03-11
ASKOOSU_NOTION_PAGE_IDS=401a342869018248a3f881a3e5fbef07
ASKOOSU_NOTION_DATABASE_IDS=
ASKOOSU_NOTION_DATA_SOURCE_IDS=
ASKOOSU_RAG_STORE=memory
ASKOOSU_RAG_AUTO_SYNC=true
ASKOOSU_RAG_RETRIEVAL=lexical
ASKOOSU_RAG_TOP_K=5
ASKOOSU_RAG_ADMIN_TOKEN=local_or_server_secret
ASKOOSU_EMBEDDING_MODEL=text-embedding-3-small
ASKOOSU_EMBEDDING_DIMENSIONS=1536
# ASKOOSU_RAG_STORE=postgres
# DATABASE_URL=postgres://user:password@host:5432/database
```

For legacy Notion database query support, keep `NOTION_VERSION=2022-06-28` with `ASKOOSU_NOTION_DATABASE_IDS`. For the current Notion API shape, prefer `NOTION_VERSION=2026-03-11` with `ASKOOSU_NOTION_DATA_SOURCE_IDS`.
