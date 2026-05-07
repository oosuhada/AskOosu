---
docId: postmortem.ez-air-ai-flight-search-lessons.ko
title: EZ Air AI Flight Search Lessons
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
# Postmortem: EZ Air AI Flight Search Lessons

## 요약

EZ Air는 AI-first 항공권 검색 경험을 실험한 UX/UI 과정 팀 프로젝트입니다. 자연어 검색, Gemini API, Amadeus API, animation, Node/Express backend 방향이 포함되었습니다.

## 잘 된 점

- 익숙한 항공권 검색 도메인과 AI 검색 결합
- 팀 프로젝트에서 AI-connected 방향 경험
- Flai 같은 후속 프로젝트 아이디어의 기반

## 어려웠던 점 / 리스크

- 항공권 검색은 provider/API/secret 관리가 까다로움
- 데모 UI와 실제 검색 가능 범위가 어긋나기 쉬움
- Git merge, 역할 분담, API contract가 품질에 큰 영향

## 배운 점

- AI 기능은 데모로 보이기 쉽지만 실제 신뢰도는 API 보안, 실패 상태, 검색 범위의 정직한 표현에서 결정된다.
- 완성된 예매 서비스처럼 과장하지 않는다.

## 답변 활용 방향

이 문서는 사용자가 프로젝트의 한계, 회고, 다시 만든다면 바꿀 점을 물을 때 사용합니다. 완벽한 척하지 말고, 확인된 범위에서 배운 점과 다음 개선 방향을 설명합니다.

## 피해야 할 표현

- 이 프로젝트는 완벽했습니다.
- 모든 기능이 production 수준입니다.
- 검증되지 않은 성과 수치가 있습니다.

## Confidence

Medium-high. 기존 위키, 프로젝트 설명, 대화에서 확인된 설계 방향에 근거합니다.
