---
docId: decision.why-notion-as-cms-postgres-as-retrieval-cache.ko
title: 왜 Notion as CMS, PostgreSQL as Retrieval Cache인가?
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
# Decision Log: 왜 Notion as CMS, PostgreSQL as Retrieval Cache인가?

## 결정

Notion은 사람이 편집하기 좋은 원본 CMS이고, PostgreSQL은 chunk, metadata, confidence, feedback, rate limit을 다루는 검색 캐시입니다. 두 역할을 분리해 운영성을 높입니다.

## 검토한 대안

- Code-only content
- Notion-only source
- Notion + PostgreSQL

## 이 결정에서 생긴 운영 규칙

- Notion stores source knowledge.
- PostgreSQL stores searchable chunks and metadata.
- Production sync needs dry-run and caution.

## 답변 활용 방향

이 문서는 사용자가 ‘왜 그렇게 만들었나요?’라고 물을 때, 단순 취향이 아니라 구조적 선택과 tradeoff로 설명하기 위한 근거입니다.

## 피해야 할 표현

- 이 선택이 유일한 정답입니다.
- 대안은 모두 틀렸습니다.
- 구현만 하면 운영 리스크는 없습니다.

## Confidence

Medium-high. 기존 위키와 대화에서 확인된 구조, 포지셔닝, 리스크 관리 방향에 근거합니다.
