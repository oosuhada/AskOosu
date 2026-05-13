# AskOosu Current Work

Last updated: 2026-05-13

## Project Name

AskOosu (`ask-oosu`)

## Current Branch

`codex/fix-askoosu-architecture-routing`

## Current Goal

Fix AskOosu architecture-question routing, align docs with the live Mac mini deployment contract, and restore chat history/sidebar usability.

## Current Status

- `웹사이트의 구조는?` now routes to `faq.project.askoosu.rag.default` as a grounded direct FAQ answer instead of falling through to empty RAG generation.
- Local `/api/chat` verification returned `faq_direct`, `sourceCount=3`, `confidence=0.88`, and `showEvidence=true` for that question.
- Architecture docs now state the current production contract: Cloudflare fronts `oosu.dev`, and the Next.js/Postgres app runs on the Mac mini Docker Compose stack.
- Vercel AI SDK is documented as a runtime/model streaming library, not the hosting layer for `oosu.dev`.
- Chat history selection preserves the selected `conversationId` in the URL and scrolls the selected conversation into view.
- Chat history edit mode now shows per-row archive/delete actions immediately.
- The chat scroll container now spans the viewport area, so the scrollbar sits at the browser-window edge rather than the narrow centered chat column.
- Existing untracked local assets were present before this branch and should not be included unless a future task explicitly asks for them.

## Relevant Files / Areas

- `README.md`: project overview, runtime stack, local run instructions, RAG env examples.
- `docs/architecture.md`: chat orchestration, AI provider selection, FAQ routing, RAG, observability, and debug UI rules.
- `docs/rag-setup.md`: Notion/RAG setup, migrations, sync, and evaluation commands.
- `docs/home-server-deploy.md`: Mac mini Docker Compose, Nginx/Cloudflare, migrations, backups, logs.
- `src/app/api/chat/`: chat API and streaming entrypoint.
- `src/lib/chat/`, `src/lib/faq/`, `src/lib/rag/`, `src/lib/db/`: core orchestration, routing, retrieval, and Postgres helpers.
- `src/lib/seo.ts`: shared SEO/AEO metadata, public routes, and JSON-LD graph.
- `src/lib/analytics/`: privacy-conscious AskOosu event logging and anonymous client session helper.
- `src/lib/privacy/redact.ts`: conservative redaction utility for emails, phone numbers, tokens, private keys, ID-like values, cards, and long secrets.
- `src/components/seo/`: JSON-LD and public page shell components.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`: crawler and social preview surfaces.
- `src/app/ai-director/`, `src/app/ai-era-developer/`, `src/app/faq/ai-competitiveness/`, `src/app/ask/`, `src/app/about/`, `src/app/projects/`, `src/app/privacy/`: public SEO/AEO pages.
- `public/llms.txt`, `public/llms-full.txt`, `public/ai-profile.md`, `public/ai-projects.md`, `public/ai-faq.md`: machine-readable public summaries.
- `db/migrations/009_create_ask_events.sql`: Postgres schema for sanitized AskOosu question analytics.
- `docs/analytics.md`: storage decision, Cloudflare setup, retention SQL, read queries, and home-server note.
- `docs/askoosu-wiki-addon-v14-sensitive-interview-ko.md`: KO sensitive interview positioning source.
- `docs/askoosu-wiki-addon-v14-sensitive-interview-en.md`: EN sensitive interview positioning source.
- `src/lib/faq/recruiter-risk-answers.ts`: Markdown-backed hidden recruiter-risk FAQ loader.
- `src/lib/faq/semantic-router.ts`: direct phrase routing for recruiter-risk/sensitive interview questions.
- `db/migrations/`: raw SQL migrations for RAG, feedback, cache, provider usage, and rate limiting.
- `ops/`: deployment templates and production helper scripts.

## Local Setup Notes

- Package manager: `pnpm` via `pnpm-lock.yaml` and `packageManager: pnpm@10.33.2`.
- Framework/runtime: Next.js App Router 15, React 19, TypeScript, Node.js.
- Styling: Tailwind CSS 4 with PostCSS.
- Data/RAG: raw SQL through `pg`; optional Postgres/pgvector storage; memory fallback for local RAG.
- Local dev command: `pnpm dev`, then open `http://localhost:3000`.
- Local secrets belong only in `.env.local` or deployment env files. Never commit API keys, tokens, database URLs with credentials, or private Notion details.
- Production notes live in `docs/home-server-deploy.md`; do not assume the Mac mini service path is a git checkout.

## Validation Commands

Use safe checks based on the change scope:

```bash
pnpm lint
pnpm build
pnpm faq:eval
pnpm rag:eval
```

For docs-only changes, `pnpm lint` is usually enough unless source code or config changed.

Latest validation on 2026-05-13:

```bash
corepack pnpm build
corepack pnpm lint
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
curl http://localhost:3000/llms.txt
curl http://localhost:3000/llms-full.txt
curl http://localhost:3000/opengraph-image
curl http://localhost:3000/twitter-image
```

Build and lint passed locally. Sitemap, robots, LLM files, homepage metadata/JSON-LD, and OG/Twitter image routes responded correctly from the local dev server.

Latest live-chat quality pass on 2026-05-13 13:27 KST:

```bash
pnpm lint
pnpm build
pnpm exec tsc --noEmit
```

All three checks passed after the AskOosu chat routing/rendering polish. Local `/api/chat` HTTP verification confirmed direct FAQ routing and Wiki source IDs for:

- `이 지원자는 어떤 지원자지?` -> `faq.profile.intro.default`
- `뭘 제일 잘하지?` -> `faq.recruiter.role_ambiguity.default`
- `나이가 너무 많지 않나?` -> `faq.recruiter.age_career_timing.default`
- `나이가 많아서 조직 적응이 힘들지 않겠냐고` -> repeated age concern with context prefix
- `와인바는 왜 그만뒀지?` -> `faq.career.oosu_salon_closed.default`

The same local conversation returned five unique quote lines. Local browser verification through the in-app browser was blocked by `ERR_BLOCKED_BY_CLIENT` for localhost, so verify final rendering on the deployed `https://oosu.dev` surface.

Latest evidence fallback / quote UI pass on 2026-05-13 14:21 KST:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

All checks passed. Local `/api/chat` verification for `신입으로 회사에 적응할 수 있을까?` confirmed the response can remain in `rag_google` generation mode while promoting nearby FAQ source chunks into the evidence panel:

- `showEvidence: true`
- `warnings: []`
- `sourceCount: 8`
- `confidence: 0.94`

Quote rendering was changed to the Minimal Top Rule style: no surrounding quote card border/background, centered quote text, and a single subtle top rule.

Latest architecture-routing and chat-shell pass on 2026-05-13:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH corepack pnpm exec tsc --noEmit
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH corepack pnpm lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH corepack pnpm build
```

Local `/api/chat` verification for `웹사이트의 구조는?` confirmed:

- `routeMode: faq_direct`
- `matchedFaqId: faq.project.askoosu.rag.default`
- `sourceCount: 3`
- `confidence: 0.88`
- `showEvidence: true`

`faq:eval` passes the new `site-architecture-ko` case. Two unrelated pre-existing eval cases still fail: `typo-ko` and `paraphrase-en`.

## Known Issues

- `pnpm lint` may be noisy because the project script uses `next lint`, which is not supported by newer Next.js CLI behavior. If it fails, record the exact output.
- RAG and chat verification can depend on local or production env variables that are intentionally not committed.
- If Postgres is unavailable locally, chat/RAG side writes may warn or fall back depending on env settings.
- Some local untracked assets may exist outside this docs branch; keep commits scoped to requested files.

## Next Steps

1. Push this branch so another machine can continue from the same state.
2. After deployment, verify `https://oosu.dev/sitemap.xml`, `https://oosu.dev/robots.txt`, `https://oosu.dev/llms.txt`, and the new public AEO pages.
3. Submit `https://oosu.dev/sitemap.xml` to Google Search Console and Bing Webmaster Tools.
4. Inspect `https://oosu.dev` in Google Search Console and verify Cloudflare serves the updated robots/sitemap files.
5. Keep unrelated local assets out of this handoff unless a future task explicitly scopes them in.

## Machine Handoff Checklist

Before switching devices:

- Run `git status --short --branch`.
- Confirm unrelated files are not staged.
- Run the safest relevant validation command and record the result here.
- Commit only the intended files.
- Push the current branch to `origin`.
- Create or update a Draft PR with summary, validation, TODOs, and next-machine instructions.

On the next device:

- Clone or open the repo from GitHub.
- Run `git fetch origin`.
- Check out the active branch.
- Run `git status --short --branch`.
- Read `docs/current-work.md`, `docs/codex-notes.md`, and `docs/implementation-notes.md`.
- Continue from the PR and this file, not from local Codex cache.
