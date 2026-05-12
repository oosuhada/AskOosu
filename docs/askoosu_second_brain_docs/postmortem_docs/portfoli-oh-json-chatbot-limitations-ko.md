---
docId: postmortem.portfoli-oh-json-chatbot-limitations.ko
title: Portfoli-Oh! JSON Chatbot Limitations
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
# Postmortem: Portfoli-Oh! JSON Chatbot Limitations

## 요약

Portfoli-Oh!는 GSAP, Three.js, Lottie, 커스텀 커서, 하이라이터, JSON 챗봇을 담은 2025 포트폴리오였습니다. 배운 기술을 많이 보여주는 데는 성공했지만, 사용자가 필요한 정보를 빠르게 찾는 경험은 약해졌고 JSON 챗봇은 데이터가 늘수록 유지보수가 어려워졌습니다.

## 잘 된 점

- 시각적 인터랙션과 스토리텔링 실험
- 정적 이력서형 포트폴리오보다 개성 있는 경험
- AskOosu로 이어진 문제의식

## 어려웠던 점 / 리스크

- 사용자 정보 탐색보다 기술 아카이브에 가까워짐
- JSON 데이터 유지보수 한계
- 맥락형 질문 처리 부족

## 배운 점

- 포트폴리오는 기능 전시장이 아니라 방문자의 질문에 답하는 경험이어야 한다.
- AskOosu는 보여주는 포트폴리오에서 대화로 탐색하는 포트폴리오로 전환했다.

## 답변 활용 방향

이 문서는 사용자가 프로젝트의 한계, 회고, 다시 만든다면 바꿀 점을 물을 때 사용합니다. 완벽한 척하지 말고, 확인된 범위에서 배운 점과 다음 개선 방향을 설명합니다.

## 피해야 할 표현

- 이 프로젝트는 완벽했습니다.
- 모든 기능이 production 수준입니다.
- 검증되지 않은 성과 수치가 있습니다.

## Confidence

Medium-high. 기존 위키, 프로젝트 설명, 대화에서 확인된 설계 방향에 근거합니다.
