# AskOosu Architecture

AskOosu is intentionally chat-first. The first screen should feel like a usable portfolio conversation, not a landing page with a chatbot attached.

## Stage A: Frontend UX and Static Prompt

- Keep the portfolio centered on one conversational surface.
- Show five curated questions at a time from an eight-question pool.
- Hide questions already clicked in the current browser session until the pool is exhausted.
- Save chat history in `localStorage` so returning visitors can continue previous conversations.
- Store language and theme preferences locally and mirror them into the URL.
- Keep the resume link visible but disabled until the Notion resume is ready.

## Stage B: Grok API and Streaming

The chat API continues to use the Vercel AI SDK `streamText` flow, so the client receives streamed responses through the existing data stream protocol.

Model selection is isolated in `src/app/api/chat/model-provider.ts`:

- Default provider: OpenAI with `OPENAI_MODEL` or `gpt-4o-mini`
- Grok provider: set `ASKOOSU_AI_PROVIDER=xai`
- Required for Grok: `XAI_API_KEY`
- Optional for Grok: `XAI_MODEL`, `XAI_BASE_URL`

The xAI-compatible path uses the OpenAI-compatible base URL `https://api.x.ai/v1`. xAI's current docs also recommend the newer Responses API for future features, so the provider wrapper is the right place to migrate later without touching the UI.

## Stage C: Notion and RAG

Notion should become the source of truth before adding vector search.

Recommended order:

1. Create structured Notion pages for profile, projects, resume, stack, and decisions.
2. Add a sync route or scheduled job that reads Notion and writes a compact JSON cache.
3. Feed the cached profile/project facts into the system prompt for low-latency answers.
4. Add embeddings/RAG only after the wiki grows beyond what a curated prompt can reliably hold.
5. Keep a fallback flow: when AskOosu lacks enough information, it should suggest contacting Oosu directly instead of pretending.

## Suggested Notion Shape

- `Profile`: bio, location, background, current focus
- `Projects`: title, year, role, stack, links, screenshots, decision notes
- `Resume`: Korean and English resume pages
- `Learning Logs`: GitHub or study summaries
- `Decisions`: architecture choices and portfolio iteration notes

## Runtime Env

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Optional Grok mode
ASKOOSU_AI_PROVIDER=xai
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-4.3
XAI_BASE_URL=https://api.x.ai/v1
```
