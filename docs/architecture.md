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

Chat orchestration is intentionally cache-first:

1. `/api/chat` validates the request and applies rate limits.
2. `src/lib/chat/orchestrator.ts` detects language, routes FAQ intent semantically, checks `answer_cache`, then builds RAG context only on cache miss.
3. `src/lib/ai/providers.ts` selects the provider and keeps Groq key-pool/cooldown behavior isolated from the route.
4. Generated answers are written back to `answer_cache`, while provider success/failure is logged in `ai_provider_usage` and `ai_provider_status`.

Model selection is isolated in `src/lib/ai/providers.ts` with a compatibility re-export from `src/app/api/chat/model-provider.ts`:

- Default provider: OpenAI with `OPENAI_MODEL` or `gpt-4o-mini`
- Grok provider: set `ASKOOSU_AI_PROVIDER=xai`
- Required for Grok: `XAI_API_KEY`
- Optional for Grok: `XAI_MODEL`, `XAI_BASE_URL`
- API mode: `XAI_API_MODE=responses` by default, or `chat` for the older Chat Completions-style xAI path
- Groq provider: set `ASKOOSU_AI_PROVIDER=groq`
- Required for Groq: `GROQ_API_KEYS` or `GROQ_API_KEY`
- Optional for Groq: `GROQ_MODEL`, `GROQ_BASE_URL`, `GROQ_KEY_FAILURE_THRESHOLD`, `GROQ_KEY_COOLDOWN_MS`, `GROQ_KEY_QUOTA_COOLDOWN_MS`
- Google Vertex provider/fallback: set `ASKOOSU_AI_PROVIDER=google_vertex`, or configure `GOOGLE_VERTEX_API_KEY`/`GOOGLE_APPLICATION_CREDENTIALS`/`GOOGLE_VERTEX_PROJECT` so it can be used when Groq selection is unavailable
- Optional for Google Vertex: `GOOGLE_VERTEX_MODEL`, `GOOGLE_VERTEX_LOCATION`, `GOOGLE_VERTEX_PROJECT`

The xAI path uses `@ai-sdk/xai`. `xai.responses(model)` is the default because it is the forward-looking path for agentic/tool-capable Responses features. `xai.chat(model)` is still available through `XAI_API_MODE=chat` when a model or account behaves better on the chat endpoint.

The Groq path uses `@ai-sdk/groq` with a local in-process key pool. `GROQ_API_KEYS` accepts comma- or newline-separated entries in `label:key` format. Each request selects the next active key. Provider/network failures increment that key's failure count; once `GROQ_KEY_FAILURE_THRESHOLD` is reached, the key is disabled until `GROQ_KEY_COOLDOWN_MS` has elapsed. Quota and rate-limit responses disable the key immediately until `GROQ_KEY_QUOTA_COOLDOWN_MS` has elapsed. Reactivation is lazy: the next request after the cooldown resets the key and makes it eligible again.

FAQ and deterministic answers return through the same AI SDK UI message stream shape but set `answerSource=faq_cache` or `deterministic_rule`, `skippedGroq=true`, and language metadata. This keeps starter-question traffic fast and nearly free.

FAQ routing now lives in `src/lib/faq/semantic-router.ts`. It builds canonical candidate text from FAQ ids, intent ids, entity ids, labels, display questions, alternatives, patterns, and safe short-answer summaries, then ranks those candidates with provider-agnostic embeddings. OpenAI embeddings are used only when `OPENAI_API_KEY` is present; otherwise the router falls back to a stricter token-overlap path in `src/lib/faq/match.ts`. Route metadata includes `matchedFaqId`, `intentScore`, `intentSecondScore`, `intentMargin`, and `routeDecision`.

Answer confidence is stored as structured signals on `metadata.confidenceSignals`: `retrieval`, `intent`, `freshness`, `grounding`, and `final`. The legacy `metadata.confidence` field is still returned for compatibility and mirrors `confidenceSignals.final`, so answer cache policy can continue using one final number while debug tooling can inspect the contributing signals. Public UI shows only groundedness labels (`Well grounded`, `Partially grounded`, `Limited evidence`) and does not expose numeric signal values unless `debug=true` is enabled.

Routing modes:

- `direct`: high-confidence, unambiguous FAQ match. The direct threshold defaults to `ASKOOSU_FAQ_SEMANTIC_DIRECT_MIN=0.88`, and the top result must beat the second result by `ASKOOSU_FAQ_SEMANTIC_MARGIN_MIN=0.12`.
- `rewrite`: medium-confidence FAQ match. The app records the likely intent but still lets the normal RAG/generation path answer instead of blindly returning FAQ text.
- `rag_required`: low-confidence or ambiguous input, including very short entity-only text such as `우수`.

Quick-question requests are trusted only when `source=quick_question` and `starterQuestionId` resolves to a known server-side suggested question. The API does not directly trust client-sent `faqId`; it re-derives the FAQ id from `src/lib/suggested-questions.ts`.

## Stage C: Notion and RAG

Notion is now treated as the source candidate for portfolio facts. The app can fetch Notion pages, legacy databases, and current data sources, chunk their text, rank the chunks against the visitor's question, and inject the retrieved context into the system prompt.

Current behavior:

1. If `NOTION_API_KEY` is absent, AskOosu falls back to static profile/project chunks.
2. If `NOTION_API_KEY` is present, it reads `ASKOOSU_NOTION_PAGE_IDS`, `ASKOOSU_NOTION_DATABASE_IDS`, and `ASKOOSU_NOTION_DATA_SOURCE_IDS`.
3. If page ids are not configured, it attempts the current source page from `oosuProfile.notionSourceUrl`.
4. Retrieval defaults to hybrid ranking. `src/lib/rag/search.ts` runs lexical FTS/ILIKE search, optional pgvector embedding search, entity-alias boost, and weighted reciprocal rank fusion. If `OPENAI_API_KEY` or stored vectors are unavailable, vector retrieval is skipped with a warning and lexical/entity ranking still works.
5. `ASKOOSU_RAG_RETRIEVAL=lexical`, `embedding`, or `hybrid` controls the retrieval mode. Hybrid weights default to lexical `0.35`, vector `0.35`, entity `0.15`, intent `0.10`, and freshness `0.05`.
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

# Optional provider mode: openai (default), xai, groq, or google_vertex
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
ASKOOSU_NOTION_PAGE_IDS=401a342869018248a3f881a3e5fbef07
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
ASKOOSU_FAQ_SEMANTIC_ROUTER_ENABLED=true
ASKOOSU_FAQ_SEMANTIC_DIRECT_MIN=0.88
ASKOOSU_FAQ_SEMANTIC_REWRITE_MIN=0.76
ASKOOSU_FAQ_SEMANTIC_MARGIN_MIN=0.12
ASKOOSU_EMBEDDING_MODEL=text-embedding-3-small
ASKOOSU_EMBEDDING_DIMENSIONS=1536
# ASKOOSU_RAG_STORE=postgres
# DATABASE_URL=postgres://user:password@host:5432/database
```

For legacy Notion database query support, keep `NOTION_VERSION=2022-06-28` with `ASKOOSU_NOTION_DATABASE_IDS`. For the current Notion API shape, prefer `NOTION_VERSION=2026-03-11` with `ASKOOSU_NOTION_DATA_SOURCE_IDS`.
