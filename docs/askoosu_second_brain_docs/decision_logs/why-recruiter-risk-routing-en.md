---
docId: decision.why-recruiter-risk-routing.en
title: Why Recruiter Risk Routing?
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
# Decision Log: Why Recruiter Risk Routing?

## Decision

Questions about retention, AI dependency, technical depth, and role ambiguity are hiring judgment questions, not casual chat. AskOosu should answer by acknowledging concerns, explaining conditions, and grounding in evidence.

## Alternatives Considered

- Casual fallback
- Overconfident denial
- Recruiter-risk routing

## Resulting Operating Rules

- Acknowledge first.
- Avoid unverifiable promises.
- Reframe the hiring criterion.

## Answer Usage

Use this document to answer ‘why did Oosu build it this way?’ as a structured tradeoff, not as a vague preference.

## Do Not Say

- This choice is the only correct answer.
- All alternatives are wrong.
- There is no operational risk once implemented.

## Confidence

Medium-high. Grounded in the existing wiki and prior project/positioning decisions.
