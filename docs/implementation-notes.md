# Implementation Notes

Last updated: 2026-05-11

## Architecture Overview

AskOosu is a chat-first portfolio built with Next.js App Router, React, TypeScript, and Tailwind CSS. The primary user flow is a portfolio conversation rather than a static landing page.

High-level flow:

```text
Visitor
-> Next.js chat UI
-> /api/chat SSE endpoint
-> deterministic policies / FAQ routing / answer cache
-> optional RAG context and model generation
-> public answer with guarded source summaries
```

Knowledge sources include static profile/project data, local Markdown wiki docs, optional Notion sync, and optional Postgres-backed RAG chunks. Production deployment is documented as a Mac mini home-server setup using Docker Compose, Postgres, Nginx, and Cloudflare.

## Important Implementation Decisions

- Chat orchestration is cache-first and routes deterministic/FAQ answers before expensive model calls.
- AI provider selection is isolated in `src/lib/ai/` and supports OpenAI, xAI/Grok, Groq, and optional Google Vertex fallback depending on env.
- FAQ routing has semantic and token-overlap paths, with direct and rewrite modes.
- Public UI separates human-readable evidence summaries from debug-only metadata.
- RAG uses raw SQL and `pg`; migrations are explicit SQL files under `db/migrations/`.
- RAG storage can be in-memory for local development or Postgres/pgvector for persistent production use.
- Observability logs are structured JSON and must avoid secrets, full prompts, full user messages, full answers, and retrieved context.
- Production debug UI is disabled unless explicitly built with the public debug env flag.

## Tradeoffs

- Memory-mode RAG keeps local setup easier, but it is not persistent across process restarts.
- Postgres-backed RAG improves persistence and cache invalidation, but requires migrations and environment setup.
- FAQ/direct routing reduces latency and provider cost, but requires careful maintenance of canonical question contracts.
- Semantic routing can improve matching when embeddings are configured; token-overlap fallback keeps local runs possible without provider keys.
- Home-server deployment gives durable control, but handoff must go through GitHub and docs because the service directory may not be a normal git checkout.

## Follow-Up Ideas

- Add a small docs-maintenance checklist to future PR templates if the repo starts using GitHub PR templates.
- Add a documented typecheck script if the project wants a faster non-build TypeScript validation path.
- Consider a scheduled production RAG sync process if it is not already handled outside this repo.
- Add a short troubleshooting matrix for common chat/RAG verification failures after the next deployment-focused task.
- TODO: Document the current preferred Node.js version if the project standardizes it in `.nvmrc`, Volta, mise, or another runtime pin.

## Areas That Need Careful Manual Review

- Chat routing and FAQ changes, especially quick-question handling and `faqId` / `intentId` preservation.
- Public evidence UI and debug gates.
- RAG chunking, entity ids, language tagging, and cache invalidation behavior.
- Database migrations and production Postgres changes.
- Provider fallback behavior and any logging changes.
- Mac mini deployment templates, Nginx routing, Cloudflare assumptions, and scripts that touch production state.
- Versioned wiki and Notion-source docs, especially when canonical content should be additive rather than replaced.
