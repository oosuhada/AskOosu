---
docId: postmortem.ask-oosu-rag-lessons.ko
title: AskOosu RAG Lessons
language: ko
sourceType: postmortem_doc
visibility: public
freshness: stable
audience: [recruiter, hiring_manager, engineer, designer_pm, ai_tooling, casual_visitor]
intentGroup: project_postmortem
priority: high
confidence: medium_high
relatedEntities: [askoosu, portfoli_oh, instagram_clone, sticks_and_stones, flai, ez_air]
tags: [lessons, postmortem, portfolio_evolution]
status: draft_for_review
generatedAt: 2026-05-07
---
# Postmortem: AskOosu RAG Lessons

## 요약

AskOosu는 Notion Wiki, FAQ cache, RAG retrieval, Groq generation, source/confidence badge, recruiter-risk answer bank를 연결한 AI 포트폴리오입니다. 핵심 학습은 모델보다 질문 라우팅, 문서 구조, 근거 표시, fallback 정책이 중요하다는 점입니다.

## 잘 된 점

- 스크롤 포트폴리오를 질문 기반 인터페이스로 전환
- FAQ cache와 RAG의 역할 분리
- source/confidence badge 기반 신뢰 UX

## 어려웠던 점 / 리스크

- 문서가 길어질수록 retrieval noise 발생 가능
- KO/EN source/cache 관리 부담
- 너무 많은 FAQ는 UX를 무겁게 만들 수 있음

## 배운 점

- AI 포트폴리오는 챗봇이 아니라 지식 운영 시스템이어야 한다.
- 실패 질문을 다음 문서/FAQ/guardrail 개선으로 연결해야 한다.

## 답변 활용 방향

이 문서는 사용자가 프로젝트의 한계, 회고, 다시 만든다면 바꿀 점을 물을 때 사용합니다. 완벽한 척하지 말고, 확인된 범위에서 배운 점과 다음 개선 방향을 설명합니다.

## 피해야 할 표현

- 이 프로젝트는 완벽했습니다.
- 모든 기능이 production 수준입니다.
- 검증되지 않은 성과 수치가 있습니다.

## Confidence

Medium-high. 기존 위키, 프로젝트 설명, 대화에서 확인된 설계 방향에 근거합니다.
