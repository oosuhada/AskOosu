---
docId: postmortem.flai-trust-clarity-lessons.ko
title: Flai Trust and Clarity Lessons
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
# Postmortem: Flai Trust and Clarity Lessons

## 요약

Flai는 자연어 항공권 검색과 AI 추천 설명을 실험하는 개인 프로젝트입니다. 핵심 교훈은 AI 제품의 신뢰가 화려한 문구가 아니라 시스템이 실제로 아는 것과 모르는 것을 정확히 구분하는 UI에서 생긴다는 점입니다.

## 잘 된 점

- AI planner와 hosted search worker를 분리하는 방향
- 결과 카드/필터/AI 설명 panel 등 명확한 surface
- personal project by oosuhada 포지셔닝

## 어려웠던 점 / 리스크

- fake progress와 source count 표현 리스크
- Failed to fetch 같은 오류가 데모 신뢰도를 크게 낮춤
- 검증되지 않은 savings/social proof claim 위험

## 배운 점

- 실제 진행 데이터가 없으면 fake progress를 쓰지 않는다.
- AI 설명은 결과를 대신하지 않고 결과 이해를 도와야 한다.

## 답변 활용 방향

이 문서는 사용자가 프로젝트의 한계, 회고, 다시 만든다면 바꿀 점을 물을 때 사용합니다. 완벽한 척하지 말고, 확인된 범위에서 배운 점과 다음 개선 방향을 설명합니다.

## 피해야 할 표현

- 이 프로젝트는 완벽했습니다.
- 모든 기능이 production 수준입니다.
- 검증되지 않은 성과 수치가 있습니다.

## Confidence

Medium-high. 기존 위키, 프로젝트 설명, 대화에서 확인된 설계 방향에 근거합니다.
