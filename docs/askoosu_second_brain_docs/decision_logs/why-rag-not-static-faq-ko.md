---
docId: decision.why-rag-not-static-faq.ko
title: 왜 정적 FAQ만이 아니라 RAG인가?
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
# Decision Log: 왜 정적 FAQ만이 아니라 RAG인가?

## 결정

AskOosu는 정적 FAQ만으로는 복합 질문, 프로젝트 비교, 채용 리스크 질문을 충분히 처리하기 어렵다고 판단했습니다. Portfoli-Oh!의 JSON 챗봇 한계가 Notion Wiki + RAG 전환의 직접적인 배경입니다.

## 검토한 대안

- Static portfolio only
- Static FAQ only
- JSON chatbot
- RAG only
- FAQ cache + RAG

## 이 결정에서 생긴 운영 규칙

- FAQ cache handles repeated stable questions.
- RAG handles contextual and compositional questions.
- Guardrails prevent overconfident or private answers.

## 답변 활용 방향

이 문서는 사용자가 ‘왜 그렇게 만들었나요?’라고 물을 때, 단순 취향이 아니라 구조적 선택과 tradeoff로 설명하기 위한 근거입니다.

## 피해야 할 표현

- 이 선택이 유일한 정답입니다.
- 대안은 모두 틀렸습니다.
- 구현만 하면 운영 리스크는 없습니다.

## Confidence

Medium-high. 기존 위키와 대화에서 확인된 구조, 포지셔닝, 리스크 관리 방향에 근거합니다.
