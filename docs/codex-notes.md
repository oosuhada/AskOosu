# Codex Notes

Last updated: 2026-05-11

## Instructions For Future Codex Sessions

- Start every AskOosu repo task with a real orientation pass: `pwd`, current branch, `git status`, concise tree, package manager, key config, and remotes.
- Treat GitHub and committed docs as the handoff source of truth. Do not rely on local Codex cache, local terminal logs, or one machine's uncommitted state.
- Preserve unrelated work. Stage only files that are part of the active request.
- Keep docs concise and append dated updates when preserving previous context is useful.
- Use TODO markers for unknown facts instead of inventing missing environment details or private links.

## Project Conventions

- Package manager: `pnpm`.
- App stack: Next.js App Router, React, TypeScript, Tailwind CSS.
- API routes live under `src/app/api/`.
- Chat UI and rich answer rendering live under `src/components/chat/` and `src/components/chat/rich/`.
- Chat orchestration, FAQ routing, RAG, and provider logic live under `src/lib/`.
- Database work uses raw SQL migrations under `db/migrations/` and `pg` helpers, not Prisma/Drizzle/TypeORM.
- Public debug surfaces must stay guarded by `NEXT_PUBLIC_ASKOOSU_DEBUG_UI_ENABLED`.
- Visitor-facing UI should hide raw ids, scores, provider/model details, route internals, prompts, and retrieved context unless an explicit debug gate is enabled.

## Things Codex Should Avoid Changing

- Do not commit `.env.local`, production env files, API keys, tokens, credentials, private URLs, or raw secret-bearing logs.
- Do not rewrite canonical wiki/versioned docs wholesale unless the user explicitly asks for that scope.
- Do not redesign quick-question, FAQ, RAG, or evidence contracts when a narrow content/routing fix is requested.
- Do not expose chunk ids, entity ids, internal scores, provider status, or prompt/context metadata in public UI.
- Do not change Mac mini routes for other hosted apps while working on AskOosu deployment.
- Do not add production dependencies for docs or handoff work.

## Known Gotchas

- `source=quick_question` is trusted only after the server re-derives the starter question from `src/lib/suggested-questions.ts`; do not trust client-sent `faqId` alone.
- `quickLabel` and `displayQuestion` serve different UX purposes and should not be collapsed casually.
- RAG can run in memory mode locally and Postgres mode in production.
- Production deploy uses a synced service directory on the Mac mini; remote git commands may not be the right deployment mechanism.
- `pnpm lint` can fail because `next lint` is no longer available in newer Next.js CLI behavior. Record the exact failure instead of masking it.
- Optional provider and RAG behavior depends on env values that should not be committed.

## Environment Assumptions

- Primary local repo path: `/Users/gabriel/Development/AskOosu`.
- Production target is documented in `docs/home-server-deploy.md`.
- Runtime secrets live in `.env.local`, shell environment, or Mac mini `.env.production` only.
- Local development without Postgres may use memory fallback paths.
- GitHub remote is expected to be `origin`, but verify with `git remote -v` each session.

## Git / PR Workflow Notes

- Prefer short descriptive branches, for example `docs/codex-handoff-workflow`.
- Before a machine switch, commit and push the active branch.
- Prefer a Draft PR for non-trivial work so MacBook Pro, MacBook Air, and Codex Cloud can share context.
- PR descriptions should include summary, changed files, validation, remaining TODOs, and next-machine instructions.
- If `gh` is unavailable or unauthenticated, push the branch and print a paste-ready PR title/body.

## Safe Validation Commands

```bash
pnpm lint
pnpm build
pnpm faq:eval
pnpm rag:eval
```

Choose the lightest command that matches the change. For docs-only work, `pnpm lint` is enough unless the repo's lint script is known to be broken; record failures verbatim.
