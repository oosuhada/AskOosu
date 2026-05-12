---
docId: decision.why-source-confidence-badges.ko
title: 왜 Source/Confidence Badge가 필요한가?
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
# Decision Log: 왜 Source/Confidence Badge가 필요한가?

## 결정

AI 포트폴리오에서 자연스러운 답변보다 중요한 것은 근거와 신뢰입니다. source badge와 confidence badge는 답변이 어떤 문서에 근거하는지, 어느 정도 확신 가능한지를 보여줍니다.

## 검토한 대안

- Plain text answer
- Debug-heavy answer
- Concise public trust badges

## 이 결정에서 생긴 운영 규칙

- Show source without exposing raw debug data.
- Lower confidence means more cautious answer.
- Do not show TODO/unverified details as final.

## 답변 활용 방향

이 문서는 사용자가 ‘왜 그렇게 만들었나요?’라고 물을 때, 단순 취향이 아니라 구조적 선택과 tradeoff로 설명하기 위한 근거입니다.

## 피해야 할 표현

- 이 선택이 유일한 정답입니다.
- 대안은 모두 틀렸습니다.
- 구현만 하면 운영 리스크는 없습니다.

## Confidence

Medium-high. 기존 위키와 대화에서 확인된 구조, 포지셔닝, 리스크 관리 방향에 근거합니다.
