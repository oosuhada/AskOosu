---
docId: ops.definition-of-done.en
title: Definition of Done
language: en
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
# Definition of Done

## Purpose

For Oosu, done does not mean a feature exists. It means users understand the purpose and can trust what happens, including failure states.

## Operating Rules

- The first screen must explain the product.
- Core CTA and user action must be clear.
- Loading/error/empty/success states must exist.
- AI answers must connect to source, confidence, and fallback policy.
- There must be an FAQ ID or RAG source chunk.
- Lint/typecheck and changed-file/test-step reporting are expected.

## Answer Usage

For “done” questions, answer with user understanding, trust, fallback, documentation, and verification—not just deployment.

## Do Not Say

- Deployed means done.
- If an AI answer appears, the feature is complete.
- Demo products can use inflated copy.

## FAQ Hooks

- When does Oosu consider a project done?
- What is the completion standard for AskOosu?
- What does Oosu check before shipping AI features?

## Assumptions / Review Notes

This document should be reviewed when tool preferences, project architecture, or public positioning changes.
