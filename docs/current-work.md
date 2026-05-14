# AskOosu Current Work

Last updated: 2026-05-11

## Project Name

AskOosu (`ask-oosu`)

## Current Branch

`docs/codex-handoff-workflow`

## Current Goal

Set up lightweight GitHub-based handoff notes so work can move between MacBook Pro, MacBook Air, Mac mini, and Codex Cloud without depending on local Codex cache or machine-specific logs.

## Current Status

- Handoff documentation is being added under `docs/`.
- No production source code changes are part of this work.
- Existing untracked local assets were present before this branch and should not be included unless a future task explicitly asks for them.

## Relevant Files / Areas

- `README.md`: project overview, runtime stack, local run instructions, RAG env examples.
- `docs/architecture.md`: chat orchestration, AI provider selection, FAQ routing, RAG, observability, and debug UI rules.
- `docs/rag-setup.md`: Notion/RAG setup, migrations, sync, and evaluation commands.
- `docs/home-server-deploy.md`: Mac mini Docker Compose, Nginx/Cloudflare, migrations, backups, logs.
- `src/app/api/chat/`: chat API and streaming entrypoint.
- `src/lib/chat/`, `src/lib/faq/`, `src/lib/rag/`, `src/lib/db/`: core orchestration, routing, retrieval, and Postgres helpers.
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

## Known Issues

- `pnpm lint` may be noisy because the project script uses `next lint`, which is not supported by newer Next.js CLI behavior. If it fails, record the exact output.
- RAG and chat verification can depend on local or production env variables that are intentionally not committed.
- If Postgres is unavailable locally, chat/RAG side writes may warn or fall back depending on env settings.
- Some local untracked assets may exist outside this docs branch; keep commits scoped to requested files.

## Next Steps

1. Keep this branch pushed to GitHub so another machine can continue from the same state.
2. Open or update a Draft PR titled `Add Codex handoff workflow docs`.
3. For future feature work, update this file with branch, goal, files touched, validation, known issues, and next steps before switching machines.
4. If a future task changes RAG, chat routing, deployment, or source-doc conventions, update `docs/codex-notes.md` and `docs/implementation-notes.md` as part of the same PR.

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
