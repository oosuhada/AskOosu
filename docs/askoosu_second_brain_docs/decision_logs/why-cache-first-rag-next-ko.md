---
docId: decision.why-cache-first-rag-next.ko
title: 왜 Cache First, RAG Next인가?
language: ko
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
# Decision Log: 왜 Cache First, RAG Next인가?

## 결정

반복 질문은 FAQ direct cache로 빠르고 일관되게 처리하고, 복잡한 질문은 RAG로 근거를 검색해 답하는 구조를 선택했습니다. 이는 비용 절감뿐 아니라 답변 품질 안정화를 위한 결정입니다.

## 검토한 대안

- RAG for every question
- FAQ for every question
- Cache-first hybrid

## 이 결정에서 생긴 운영 규칙

- Direct cache for stable questions.
- FAQ rewrite for nuanced but known questions.
- RAG for evidence-heavy questions.

## 답변 활용 방향

이 문서는 사용자가 ‘왜 그렇게 만들었나요?’라고 물을 때, 단순 취향이 아니라 구조적 선택과 tradeoff로 설명하기 위한 근거입니다.

## 피해야 할 표현

- 이 선택이 유일한 정답입니다.
- 대안은 모두 틀렸습니다.
- 구현만 하면 운영 리스크는 없습니다.

## Confidence

Medium-high. 기존 위키와 대화에서 확인된 구조, 포지셔닝, 리스크 관리 방향에 근거합니다.
