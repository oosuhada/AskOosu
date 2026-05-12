---
docId: decision.why-notion-as-cms-postgres-as-retrieval-cache.en
title: Why Notion as CMS and PostgreSQL as Retrieval Cache?
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
# Decision Log: Why Notion as CMS and PostgreSQL as Retrieval Cache?

## Decision

Notion is the human-editable CMS, while PostgreSQL is the retrieval cache for chunks, metadata, confidence, feedback, and rate limits. Separating these roles improves operations.

## Alternatives Considered

- Code-only content
- Notion-only source
- Notion + PostgreSQL

## Resulting Operating Rules

- Notion stores source knowledge.
- PostgreSQL stores searchable chunks and metadata.
- Production sync needs dry-run and caution.

## Answer Usage

Use this document to answer ‘why did Oosu build it this way?’ as a structured tradeoff, not as a vague preference.

## Do Not Say

- This choice is the only correct answer.
- All alternatives are wrong.
- There is no operational risk once implemented.

## Confidence

Medium-high. Grounded in the existing wiki and prior project/positioning decisions.
