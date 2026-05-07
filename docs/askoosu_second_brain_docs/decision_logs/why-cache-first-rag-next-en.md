---
docId: decision.why-cache-first-rag-next.en
title: Why Cache First, RAG Next?
language: en
sourceType: decision_log
visibility: public
freshness: stable
audience: [recruiter, hiring_manager, engineer, designer_pm, ai_tooling, casual_visitor]
intentGroup: decision_log
priority: high
confidence: medium_high
relatedEntities: [askoosu, profile, ai_usage]
tags: [architecture_decision, portfolio_positioning, rag]
status: draft_for_review
generatedAt: 2026-05-07
---
# Decision Log: Why Cache First, RAG Next?

## Decision

Repeated questions use FAQ direct cache for speed and consistency, while complex questions use RAG for evidence. This is not only about cost; it stabilizes answer quality.

## Alternatives Considered

- RAG for every question
- FAQ for every question
- Cache-first hybrid

## Resulting Operating Rules

- Direct cache for stable questions.
- FAQ rewrite for nuanced but known questions.
- RAG for evidence-heavy questions.

## Answer Usage

Use this document to answer ‘why did Oosu build it this way?’ as a structured tradeoff, not as a vague preference.

## Do Not Say

- This choice is the only correct answer.
- All alternatives are wrong.
- There is no operational risk once implemented.

## Confidence

Medium-high. Grounded in the existing wiki and prior project/positioning decisions.
