# AskOosu

AskOosu is Oosu Jang's 2026 AI-connected portfolio.

Instead of a static portfolio, this project uses a chat-first interface: visitors can ask natural language questions and receive guided answers about Oosu, projects, skills, contact links, resume placeholders, and the planned Notion wiki.

## Core Direction

- AI-connected Fullstack Developer portfolio
- LLM-style browser input as the main UI
- Five suggested questions at a time from an eight-question pool
- Local chat history, language preference, and theme preference
- Visitor-facing concept question: `포트폴리오를 왜 대화형으로 만들었어요?`
- Project cards for AskOosu 2026, Instagram Clone, Sticks & Stones Homepage, Portfoli-Oh! 2025, Pylingo, Javalingo, Onjung, Nomad Market, and Notion Knowledge Wiki
- Future Notion API integration for Korean/English resume pages, study notes, GitHub activity summaries, and wiki-based answers
- Optional Grok/xAI provider mode through the same streaming chat route

## Links

- GitHub: https://github.com/oosuhada
- LinkedIn: https://www.linkedin.com/in/oosuhada/
- Instagram: https://www.instagram.com/oosu.hada
- AskOosu Wiki: https://www.notion.so/355a342869018181b578d73a791356af
- Source Notion page: https://www.notion.so/401a342869018248a3f881a3e5fbef07
- 2025 portfolio: https://oosuhada.github.io/portfoli-oh/
- 2025 portfolio repository: https://github.com/oosuhada/portfoli-oh

## Run Locally

```bash
pnpm install
pnpm dev
```

Create `.env.local` with:

```env
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_token_here

# Optional Grok/xAI mode
ASKOOSU_AI_PROVIDER=xai
XAI_API_KEY=your_xai_api_key_here
XAI_API_KEYS=your_first_xai_key,your_second_xai_key
XAI_MODEL=grok-4.3
```

Open http://localhost:3000.

See [docs/architecture.md](docs/architecture.md) for the frontend, Grok streaming, and Notion/RAG upgrade plan.
