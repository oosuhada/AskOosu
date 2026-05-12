---
docId: ops.prompt-delegation-patterns.ko
title: Prompt Delegation Patterns
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
# Prompt Delegation Patterns

## 목적

Codex, Claude, GPT에게 작업을 맡길 때 사용하는 지시 패턴입니다. 역할, 목표, 수정 범위, 금지사항, 테스트 기준, 최종 보고 형식을 명확히 지정하는 것이 핵심입니다.

## 운영 규칙

- 먼저 파일 구조를 확인하라고 지시한다.
- 실제 존재하는 파일만 수정하게 한다.
- 기존 구조를 깨지 않게 한다.
- .env, secret key, production credential을 요구하거나 출력하지 않게 한다.
- 변경 파일, 테스트 방법, 남은 수동 작업을 보고하게 한다.

## 답변 활용 방향

프롬프트 능력은 “말을 잘 거는 것”이 아니라 AI에게 역할, 범위, 금지사항, 검증 기준을 주고 결과를 검토하는 운영 능력으로 설명합니다.

## 피해야 할 표현

- 프롬프트만 잘 쓰면 개발이 됩니다.
- AI에게 자유롭게 맡기는 것이 가장 빠릅니다.
- secret은 필요하면 AI에게 공유할 수 있습니다.

## 연결 질문

- 우수는 Codex에게 어떻게 작업을 시키나요?
- 좋은 AI 작업 지시의 기준은 무엇인가요?
- 프롬프트 엔지니어링도 우수의 강점인가요?

## 검토 메모

도구 선호도, 프로젝트 구조, 공개 포지셔닝이 바뀌면 이 문서를 함께 갱신해야 합니다.
