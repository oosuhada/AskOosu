---
docId: ops.code-review-with-ai.en
title: Code Review with AI
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
# Code Review with AI

## Purpose

Explains how Oosu reviews AI-generated code instead of accepting it blindly. Review criteria include real file structure, type/API contracts, UX states, security, RAG answer quality, and maintainability.

## Operating Rules

- Check whether the agent inspected the real file structure.
- Ensure it did not invent non-existent files.
- Verify API response fields and UI fields match.
- Check loading/error/empty/success states.
- Ensure API keys, provider tokens, DB URLs, and secrets are not exposed in client or logs.
- Ensure TODO/private/unverified details do not appear in public answers.

## Answer Usage

For AI-code concerns, answer that AI may create drafts, but human standards decide what enters the product.

## Do Not Say

- AI-generated code is mostly used as-is.
- If it runs, it is enough.
- Testing can wait until after deployment.

## FAQ Hooks

- How does Oosu review AI-generated code?
- How does Oosu check code quality?
- Is AI-generated code risky?

## Assumptions / Review Notes

This document should be reviewed when tool preferences, project architecture, or public positioning changes.
