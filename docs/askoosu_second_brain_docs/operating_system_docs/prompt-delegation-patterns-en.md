---
docId: ops.prompt-delegation-patterns.en
title: Prompt Delegation Patterns
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
# Prompt Delegation Patterns

## Purpose

Captures how Oosu delegates work to Codex, Claude, and GPT. The core is giving clear role, goal, scope, constraints, test criteria, and final-report requirements.

## Operating Rules

- Instruct the agent to inspect file structure first.
- Modify only files that actually exist.
- Preserve existing architecture.
- Do not ask for or print .env, secret keys, or production credentials.
- Report changed files, test steps, and remaining manual work.

## Answer Usage

Prompting is not just wording; it is an operating skill: giving role, scope, constraints, verification criteria, and reviewing the result.

## Do Not Say

- Prompting alone is development.
- Giving AI total freedom is fastest.
- Secrets can be shared with AI if needed.

## FAQ Hooks

- How does Oosu delegate work to Codex?
- What makes a good AI task prompt?
- Is prompt engineering one of Oosu’s strengths?

## Assumptions / Review Notes

This document should be reviewed when tool preferences, project architecture, or public positioning changes.
