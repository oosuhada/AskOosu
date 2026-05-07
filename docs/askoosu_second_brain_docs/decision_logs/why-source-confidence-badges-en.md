---
docId: decision.why-source-confidence-badges.en
title: Why Source and Confidence Badges?
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
# Decision Log: Why Source and Confidence Badges?

## Decision

In an AI portfolio, evidence and trust matter more than natural-sounding answers. Source and confidence badges show what the answer is grounded in and how certain it is.

## Alternatives Considered

- Plain text answer
- Debug-heavy answer
- Concise public trust badges

## Resulting Operating Rules

- Show source without exposing raw debug data.
- Lower confidence means more cautious answer.
- Do not show TODO/unverified details as final.

## Answer Usage

Use this document to answer ‘why did Oosu build it this way?’ as a structured tradeoff, not as a vague preference.

## Do Not Say

- This choice is the only correct answer.
- All alternatives are wrong.
- There is no operational risk once implemented.

## Confidence

Medium-high. Grounded in the existing wiki and prior project/positioning decisions.
