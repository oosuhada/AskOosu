---
docId: postmortem.instagram-clone-fullstack-lessons.ko
title: Instagram Clone Fullstack Lessons
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
# Postmortem: Instagram Clone Fullstack Lessons

## 요약

Instagram Clone은 사용자, 게시물, 댓글, 팔로우, 스토리, 검색, 업로드의 관계를 다루며 fullstack 데이터 모델링의 중요성을 배운 프로젝트입니다.

## 잘 된 점

- React/Next.js 계열 프론트와 Spring Boot/PostgreSQL 흐름 연결
- SNS 도메인의 관계형 데이터 모델링 경험
- AskOosu와 다른 fullstack depth 근거

## 어려웠던 점 / 리스크

- SNS 화면보다 데이터 관계가 복잡함
- 기능 추가 전 API boundary와 데이터 흐름 설계 필요
- clone이 UI 유사성에서 끝나면 깊이가 약해짐

## 배운 점

- Fullstack 개발은 화면을 따라 만드는 것이 아니라 데이터 관계와 API 경계를 설계하는 일이다.
- 관계형 사고는 AskOosu의 RAG knowledge architecture에도 연결된다.

## 답변 활용 방향

이 문서는 사용자가 프로젝트의 한계, 회고, 다시 만든다면 바꿀 점을 물을 때 사용합니다. 완벽한 척하지 말고, 확인된 범위에서 배운 점과 다음 개선 방향을 설명합니다.

## 피해야 할 표현

- 이 프로젝트는 완벽했습니다.
- 모든 기능이 production 수준입니다.
- 검증되지 않은 성과 수치가 있습니다.

## Confidence

Medium-high. 기존 위키, 프로젝트 설명, 대화에서 확인된 설계 방향에 근거합니다.
