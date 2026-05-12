---
docId: ops.ai-agent-workflow.en
title: AI Agent Workflow
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
# AI Agent Workflow

## Purpose

Explains how Oosu separates roles across Codex, Claude, GPT, Gemini, Perplexity, Liner, and Groq. The core idea is not that AI replaces work, but that AI accelerates execution while the human owns direction, review, and final judgment.

## Operating Rules

- Human owns problem definition and product direction.
- Claude/GPT are used for architecture, risky answer design, and large document structuring.
- Codex is used for implementation after inspecting the real file structure.
- Perplexity/Gemini/Liner are used for current docs, API references, and research.
- Groq is used for cost-sensitive generation/fallback such as AskOosu responses.
- AI output is reviewed against UX flow, security, overclaim risk, and existing architecture.

## Answer Usage

For AI-usage questions, answer that Oosu assigns AI agents as working partners and reviews their output against product standards.

## Do Not Say

- AI builds it for him.
- With Codex, developers are unnecessary.
- AI usage automatically proves skill.

## FAQ Hooks

- How does Oosu use AI?
- How does Oosu split work between Codex and Claude?
- What does working with AI agents mean?

## Assumptions / Review Notes

This document should be reviewed when tool preferences, project architecture, or public positioning changes.
