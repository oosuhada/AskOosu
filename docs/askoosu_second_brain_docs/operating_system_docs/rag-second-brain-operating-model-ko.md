---
docId: ops.rag-second-brain-operating-model.ko
title: RAG Second Brain Operating Model
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
# RAG Second Brain Operating Model

## 목적

AskOosu의 second brain 구조를 설명합니다. Notion은 사람이 편집하는 기억, PostgreSQL은 검색 가능한 기억, FAQ cache는 안정된 반복 답변, RAG는 맥락 질문을 처리하는 증거 기반 설명 엔진입니다.

## 운영 규칙

- profile, project, philosophy, operating system, decision log, postmortem, answer policy를 sourceType으로 구분한다.
- FAQ cache first, RAG next 원칙을 유지한다.
- 프로젝트 chunk와 guardrail chunk를 함께 검색한다.
- 근거가 약하면 답변 범위를 좁힌다.
- 실패 질문은 다음 FAQ/RAG 개선으로 연결한다.

## 답변 활용 방향

AskOosu는 “문서가 많은 챗봇”이 아니라 “근거·정책·회고·의사결정이 분리된 AI knowledge system”으로 설명합니다.

## 피해야 할 표현

- RAG가 있으면 모든 질문에 답할 수 있습니다.
- Notion에 넣기만 하면 AI가 알아서 잘 답합니다.
- vector search만 있으면 second brain입니다.

## 연결 질문

- AskOosu는 second brain인가요?
- Notion과 RAG는 어떻게 연결되나요?
- FAQ cache와 RAG는 어떻게 다른가요?

## 검토 메모

도구 선호도, 프로젝트 구조, 공개 포지셔닝이 바뀌면 이 문서를 함께 갱신해야 합니다.
