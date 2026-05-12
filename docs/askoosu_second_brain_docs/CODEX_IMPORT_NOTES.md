# Codex Import Notes

## Goal

Import these docs into the existing AskOosu knowledge base as additive RAG sources.

## Implementation Rules

1. Inspect project structure first.
2. Do not replace canonical v11/v12 wiki files.
3. Do not modify `.env`, secret keys, DB credentials, or deployment config.
4. Preserve KO/EN language separation.
5. Store frontmatter as metadata.
6. Chunk by heading.
7. Treat `Do Not Say` as guardrail chunks.
8. Treat postmortems as high-priority for limitation/lesson questions.
9. Keep public UI concise; do not expose raw debug metadata.
10. Report changed files, test commands, and manual follow-up steps.

## Suggested Test Questions

KO:
- 우수는 AI를 어떻게 활용하나요?
- AskOosu는 왜 RAG로 만들었나요?
- FAQ cache와 RAG는 어떻게 다른가요?
- Portfoli-Oh!에서 무엇을 배웠나요?
- Flai에서 신뢰도 문제가 왜 중요했나요?
- 우수는 팀에서도 잘 일할 수 있나요?
- AI를 많이 쓰면 실력이 부족한 것 아닌가요?
- 프로젝트를 언제 완성으로 보나요?

EN:
- How does Oosu use AI?
- Why did Oosu build AskOosu with RAG?
- How are FAQ cache and RAG different?
- What did Oosu learn from Portfoli-Oh?
- Why does trust matter in Flai?
- Can Oosu work well in a team?
- Is Oosu too dependent on AI?
- When does Oosu consider a project done?
