---
docId: decision.why-rag-not-static-faq.en
title: Why RAG Instead of Only Static FAQ?
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
# Decision Log: Why RAG Instead of Only Static FAQ?

## Decision

AskOosu chose RAG because static FAQ alone cannot handle compositional questions, project comparisons, or hiring-risk concerns. The limitations of Portfoli-Oh!’s JSON chatbot directly led to the Notion Wiki + RAG direction.

## Alternatives Considered

- Static portfolio only
- Static FAQ only
- JSON chatbot
- RAG only
- FAQ cache + RAG

## Resulting Operating Rules

- FAQ cache handles repeated stable questions.
- RAG handles contextual and compositional questions.
- Guardrails prevent overconfident or private answers.

## Answer Usage

Use this document to answer ‘why did Oosu build it this way?’ as a structured tradeoff, not as a vague preference.

## Do Not Say

- This choice is the only correct answer.
- All alternatives are wrong.
- There is no operational risk once implemented.

## Confidence

Medium-high. Grounded in the existing wiki and prior project/positioning decisions.
