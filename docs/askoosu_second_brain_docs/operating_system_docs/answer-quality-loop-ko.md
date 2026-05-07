---
docId: ops.answer-quality-loop.ko
title: Answer Quality Loop
language: ko
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

## 목적

AskOosu의 답변 품질을 관리하는 루프입니다. 좋은 AI 포트폴리오는 모든 질문에 답하는 AI가 아니라, 근거 있는 질문에는 잘 답하고 근거가 약한 질문에는 조심스럽게 멈추는 AI입니다.

## 운영 규칙

- stable FAQ는 direct_cache로 처리한다.
- 복합 질문은 RAG로 근거를 검색한다.
- recruiter-risk 질문은 우려 인정 후 조건과 근거를 제시한다.
- unknown은 invent하지 않고 범위를 제한한다.
- 실패 질문은 intent pattern, sourceChunkIds, guardrail, eval set 개선으로 연결한다.

## 답변 활용 방향

답변 품질 질문에는 모델 성능보다 라우팅, 캐시, 검색, 근거, 가드레일, 피드백 루프를 강조합니다.

## 피해야 할 표현

- AskOosu는 어떤 질문이든 답할 수 있습니다.
- 모델 성능이 좋으면 답변 품질은 자동으로 좋아집니다.
- source badge는 보여주기용입니다.

## 연결 질문

- AskOosu는 답변 품질을 어떻게 관리하나요?
- 근거가 부족한 질문에는 어떻게 답하나요?
- AI 포트폴리오에서 fallback은 왜 중요한가요?

## 검토 메모

도구 선호도, 프로젝트 구조, 공개 포지셔닝이 바뀌면 이 문서를 함께 갱신해야 합니다.
