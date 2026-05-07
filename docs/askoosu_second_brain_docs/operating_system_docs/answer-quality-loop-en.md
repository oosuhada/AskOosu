---
docId: ops.answer-quality-loop.en
title: Answer Quality Loop
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
# Answer Quality Loop

## Purpose

Defines AskOosu’s answer-quality loop. A good AI portfolio is not an AI that answers everything; it answers evidence-backed questions well and pauses when evidence is weak.

## Operating Rules

- Stable FAQs use direct_cache.
- Compositional questions retrieve evidence through RAG.
- Recruiter-risk questions acknowledge concerns and explain conditions with evidence.
- Unknowns should narrow scope instead of inventing.
- Failed questions improve intent patterns, sourceChunkIds, guardrails, and eval sets.

## Answer Usage

For answer-quality questions, emphasize routing, cache, retrieval, evidence, guardrails, and feedback loops over raw model intelligence.

## Do Not Say

- AskOosu can answer any question.
- Better models automatically solve answer quality.
- Source badges are just decoration.

## FAQ Hooks

- How does AskOosu manage answer quality?
- What happens when evidence is weak?
- Why does fallback matter in an AI portfolio?

## Assumptions / Review Notes

This document should be reviewed when tool preferences, project architecture, or public positioning changes.
