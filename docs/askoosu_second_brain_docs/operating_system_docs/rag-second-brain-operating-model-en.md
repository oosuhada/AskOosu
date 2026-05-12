---
docId: ops.rag-second-brain-operating-model.en
title: RAG Second Brain Operating Model
language: en
sourceType: operating_system_doc
visibility: public
freshness: stable
audience: [recruiter, hiring_manager, engineer, designer_pm, ai_tooling, casual_visitor]
intentGroup: operating_system
priority: high
confidence: medium_high
relatedEntities: [profile, askoosu, ai_usage]
tags: [ai_workflow, second_brain, portfolio_operations]
status: draft_for_review
generatedAt: 2026-05-07
---
# RAG Second Brain Operating Model

## Purpose

Explains AskOosu’s second-brain model. Notion is human-edited memory, PostgreSQL is searchable memory, FAQ cache is the stable voice for repeated questions, and RAG is the evidence-driven engine for contextual questions.

## Operating Rules

- Separate profile, project, philosophy, operating system, decision log, postmortem, and answer policy by sourceType.
- Preserve FAQ cache first, RAG next.
- Retrieve project chunks with guardrail chunks.
- Narrow the answer when evidence is weak.
- Turn failed questions into future FAQ/RAG improvements.

## Answer Usage

Describe AskOosu as an AI knowledge system with separated evidence, policy, postmortems, and decisions—not merely a chatbot with many docs.

## Do Not Say

- RAG can answer everything.
- Putting content in Notion makes the AI automatically good.
- Vector search alone is a second brain.

## FAQ Hooks

- Is AskOosu a second brain?
- How do Notion and RAG connect?
- How are FAQ cache and RAG different?

## Assumptions / Review Notes

This document should be reviewed when tool preferences, project architecture, or public positioning changes.
