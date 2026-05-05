# AskOosu RAG Evaluation

This evaluation set checks whether the v9 Wiki retrieval layer can find the right evidence before `/api/chat` generates an answer.

## How To Run

Start the app first:

```bash
pnpm dev
```

Then run the search-only evaluation:

```bash
pnpm rag:eval
```

`pnpm rag:eval` also checks the FAQ semantic intent router through `/api/chat` by default. To run only those FAQ intent checks:

```bash
pnpm faq:eval
```

Useful options:

```bash
pnpm rag:eval -- --base-url http://localhost:3001
pnpm rag:eval -- --limit 8
pnpm rag:eval -- --chat
pnpm rag:eval -- --no-faq
pnpm rag:eval -- --faq-only
pnpm rag:eval -- --json
pnpm rag:eval -- --strict
```

The script calls `/api/rag/search` by default. If `RAG_SYNC_SECRET` or `ASKOOSU_RAG_ADMIN_TOKEN` is present in the shell or `.env.local`, it sends the token as a Bearer header. `--chat` also asks `/api/chat` for answer previews only when a Groq key is configured. FAQ intent checks always call `/api/chat` and read route metadata; use `--no-faq` to skip them.

## Evaluation Set

| #   | Question                                           | Expected Evidence                                                                             | Expected Entity IDs                      | Watch For                                                                               |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | 우수는 어떤 개발자예요?                            | Profile, current title, growth direction, AI-connected fullstack positioning                  | `profile.identity`, `profile.career`     | Should not overstate seniority or invent company experience                             |
| 2   | AskOosu 프로젝트를 설명해줘.                       | AskOosu project story, RAG/Notion/Groq architecture, conversational portfolio intent          | `project.askoosu`                        | Should mention Wiki grounding and avoid saying every planned feature is complete        |
| 3   | Instagram Clone은 어떤 풀스택 경험을 보여주나요?   | Fullstack SNS practice, backend/API/database/frontend loop                                    | `project.instagram_clone`                | Should not claim large production users or unverified metrics                           |
| 4   | Sticks & Stones 프로젝트에서 가장 어려웠던 점은?   | Real service migration, WordPress/legacy constraints, modern frontend renewal, client context | `project.sticks_and_stones`              | Should distinguish real-service constraints from toy-project learning                   |
| 5   | Portfoli-Oh!와 AskOosu의 차이는?                   | Portfoli-Oh! 2025 interactive/static portfolio vs AskOosu RAG conversational portfolio        | `project.portfoli_oh`, `project.askoosu` | Should compare evolution without dismissing the older portfolio                         |
| 6   | 우수살롱 경험이 개발과 어떻게 연결되나요?          | OOSU SALON/business operations, customer empathy, product thinking, service design            | `career.oosu_salon`                      | Should avoid exposing sensitive address or private business details                     |
| 7   | 비즈니스 전공이 개발에 어떤 도움이 되나요?         | Business major, marketing/branding, planning, user/audience thinking                          | `profile.identity`, `profile.career`     | Should connect business background to development decisions, not only list school facts |
| 8   | 협업 스타일은 어떤가요?                            | Collaboration style, communication, iteration, stakeholder-friendly delivery                  | `profile.career`                         | Should stay evidence-based and avoid generic personality claims                         |
| 9   | AI 도구를 어떻게 활용하나요?                       | AI workflow, coding assistance, RAG design, guardrails, verification mindset                  | `project.askoosu`, `policy.guardrail`    | Should not imply AI replaces validation or that all AI outputs are accepted             |
| 10  | 현재 관심 있는 포지션은?                           | Current target role, AI-connected fullstack/frontend direction, portfolio visitor framing     | `profile.career`, `profile.identity`     | Should mark uncertain/TODO evidence as tentative                                        |
| 11  | 이력서 URL 알려줘.                                 | Resume KO/EN TODO and fallback contact/GitHub/LinkedIn guidance                               | `profile.identity`, `policy.guardrail`   | Should not invent a resume URL when Wiki says TODO                                      |
| 12  | 라이브 URL이 없는 프로젝트는 어떻게 답해야 하나요? | Guardrail/public answer policy, TODO handling, private repo/live URL fallback                 | `policy.guardrail`                       | Should say unavailable/not public instead of fabricating links                          |

## FAQ Intent Evaluation Set

These cases check `src/lib/faq/semantic-router.ts` routing metadata rather than RAG chunk retrieval.

| #   | Question                                                         | Expected Route | Expected FAQ                                 | Watch For                                                       |
| --- | ---------------------------------------------------------------- | -------------- | -------------------------------------------- | --------------------------------------------------------------- |
| 1   | 우수님은 어떤 개발자인가요?                                      | `direct`       | `faq.profile.intro.default`                  | Korean honorific/particle variation should not miss profile FAQ |
| 2   | 포트폴리오오 만든 사람 누구야?                                   | `direct`       | `faq.portfolio.creator.default`              | Repeated final syllable typo should still match creator intent  |
| 3   | 우수                                                             | `rag_required` | none                                         | Short entity-only input should not blindly return a direct FAQ  |
| 4   | Portfoli-Oh랑 AskOosu는 뭐가 달라?                               | `direct`       | `faq.project.portfoliooh_vs_askoosu.default` | Mixed entity comparison should map to comparison FAQ            |
| 5   | Which portfolio projects best show Oosu's growth as a developer? | `direct`       | `faq.project.top_three.default`              | English paraphrase should map to representative projects        |

## Console Output Checklist

For each question, the eval script prints:

- `question`
- top matched chunks: `chunk_id`, title, section path, score, entity id
- matched entity ids
- whether any result has `has_todo=true`
- visibility warnings for `needs_review` or non-public chunks
- search warnings from `/api/rag/search`

## How To Debug A Wrong Answer

Use this order. It keeps fixes close to the actual failure instead of randomly rewriting the prompt.

1. Wiki body

If the right chunk is retrieved but the generated answer is wrong, fix the Wiki text first. Make the canonical fact clearer, shorter, and less mixed with unrelated context. Add a direct Q&A row when the question is likely to repeat.

2. Alias dictionary

If the wrong entity is retrieved or no entity is found, update `NOTION_ENTITY_ALIAS_MAP` in `src/lib/rag/notion-chunks.ts`. Add Korean/English variants, common abbreviations, spacing variants, and project nicknames.

3. Chunk rules

If the right content exists but is buried inside a noisy chunk, adjust chunking in `src/lib/rag/notion-chunks.ts`. Good chunks should keep one entity, one section path, and one answer intent together.

4. Ranking/search

If several correct chunks exist but lower-ranked results win, inspect `src/lib/rag/search.ts`. Tune title/section path/entity/content weights before changing the LLM prompt.

5. Guardrails

If answers invent URLs, expose private details, or state TODO content as fact, strengthen guardrail chunks in the Wiki and make sure `policy.guardrail` appears in search/chat context.

## Pass Criteria

A search-only run is healthy when most questions retrieve at least one expected entity in the top results, no public answer depends solely on `needs_review` chunks, and TODO/link questions retrieve guardrail evidence. Chat output is healthy when it answers from retrieved Wiki evidence, refuses to invent missing URLs, and explains uncertainty naturally.
