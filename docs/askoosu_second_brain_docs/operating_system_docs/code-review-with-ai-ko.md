---
docId: ops.code-review-with-ai.ko
title: Code Review with AI
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
# Code Review with AI

## 목적

AI가 생성한 코드를 그대로 쓰지 않고 어떤 기준으로 검토하는지 정리합니다. 기준은 실제 파일 구조, 타입/API 계약, UX 상태, 보안, RAG 답변 품질, 유지보수성입니다.

## 운영 규칙

- AI가 실제 파일 구조를 확인했는지 본다.
- 존재하지 않는 파일을 상상해서 수정하지 않았는지 확인한다.
- API 응답과 UI 표시 필드가 일치하는지 확인한다.
- loading/error/empty/success 상태를 확인한다.
- API key, provider token, DB URL, secret이 client나 log에 노출되지 않는지 확인한다.
- TODO/private/unverified 정보가 public answer로 나오지 않는지 본다.

## 답변 활용 방향

AI 코드 관련 질문에는 “AI가 초안을 만들 수 있지만, 제품에 들어가는 코드는 사람이 기준을 세워 검토한다”고 답합니다.

## 피해야 할 표현

- AI가 만든 코드는 대부분 그대로 사용합니다.
- 동작하면 충분합니다.
- 테스트는 배포 후 확인하면 됩니다.

## 연결 질문

- AI가 만든 코드는 어떻게 검토하나요?
- 우수는 코드 품질을 어떻게 확인하나요?
- AI 코드가 위험하지 않나요?

## 검토 메모

도구 선호도, 프로젝트 구조, 공개 포지셔닝이 바뀌면 이 문서를 함께 갱신해야 합니다.
