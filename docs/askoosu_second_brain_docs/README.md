# AskOosu Second Brain Docs

This package adds three RAG-ready knowledge sections for AskOosu:

- `operating_system_docs`: how Oosu works with AI agents, humans, code, products, and answer quality.
- `decision_logs`: why the portfolio/RAG/product decisions were made.
- `postmortem_docs`: what each project taught, what did not work, and what should improve next.

## Import Guidance

These files should be added as additive RAG sources, not replacements for the existing canonical v11/v12 Wiki.

Recommended handling:

1. Preserve frontmatter as metadata.
2. Chunk by heading, not by whole file.
3. Treat `Do Not Say` sections as guardrail chunks.
4. Treat `Assumptions / Review Notes` as lower-confidence material.
5. Keep KO and EN sources separate for language-specific retrieval.
6. Use FAQ cache for stable repeated questions; use these docs for working-style, decision, and lesson questions.

## Public Answer Principle

AskOosu should answer from these docs with this framing:

> Oosu is not trying to replace a team with AI. Oosu is building an AI-connected product workflow where AI agents accelerate planning, UX, implementation, debugging, documentation, and validation, while human judgment remains responsible for direction, quality, trust, and collaboration.
