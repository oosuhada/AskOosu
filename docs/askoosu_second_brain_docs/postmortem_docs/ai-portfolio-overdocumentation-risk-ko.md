---
docId: postmortem.ai-portfolio-overdocumentation-risk.ko
title: AI Portfolio Overdocumentation Risk
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
# Postmortem: AI Portfolio Overdocumentation Risk

## 요약

AskOosu의 second brain은 강점이지만, 문서가 많아질수록 retrieval noise와 과도한 답변, philosophy 과잉 리스크가 생길 수 있습니다.

## 잘 된 점

- 프로젝트 사실, 작업 철학, 결정, 회고, 답변 정책을 분리
- 사용자가 왜 만들었는지와 무엇을 배웠는지 물어볼 수 있음
- 채용 리스크 질문에 더 잘 답할 수 있음

## 어려웠던 점 / 리스크

- 문서가 많아질수록 retrieval noise 증가
- 비슷한 내용 반복 가능
- 개인 생각과 공개 포트폴리오 지식의 경계 흐림

## 배운 점

- 문서는 많이 넣는 것이 목적이 아니라 실제 사용자 질문에 더 정확히 답하기 위해 넣어야 한다.
- philosophy docs는 project fact보다 높게 랭킹되지 않도록 한다.

## 답변 활용 방향

이 문서는 사용자가 프로젝트의 한계, 회고, 다시 만든다면 바꿀 점을 물을 때 사용합니다. 완벽한 척하지 말고, 확인된 범위에서 배운 점과 다음 개선 방향을 설명합니다.

## 피해야 할 표현

- 이 프로젝트는 완벽했습니다.
- 모든 기능이 production 수준입니다.
- 검증되지 않은 성과 수치가 있습니다.

## Confidence

Medium-high. 기존 위키, 프로젝트 설명, 대화에서 확인된 설계 방향에 근거합니다.
