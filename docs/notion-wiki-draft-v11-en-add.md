# AskOosu Notion Wiki — v11 EN

> Language-managed English source. This file is the English canonical Notion/RAG wiki for AskOosu.  
> Korean should be managed separately in `notion-wiki-draft-v10-ko.md`.  
> For API-cost reduction, English questions should first use the English FAQ/model-answer cache before calling Groq.

---

## Version Notes

- `TODO`: fields Oosu should fill directly. Do not invent missing URLs, dates, metrics, or private repository details.
- `v8`: added answer routing, answer length guide, guardrails, project Q&A matrix, project comparison guide, audience mode guide, metadata tags, and freshness/update policy.
- `v9`: upgraded the wiki into an AI portfolio + RAG operating document. Added readiness audit, canonical entity map, alias dictionary, chunk id convention, retrieval priority, answer evidence contract, Notion sync rules, frontend/backend/DB blueprint, Groq free-tier guardrails, RAG evaluation set, and feedback/log schema.
- `v10`: added FAQ Answer Cache / Model Answer Bank so high-frequency portfolio questions can be answered without calling Groq, or can be lightly rewritten from a cached answer.
- `v11`: added Interactive Portfolio Sections / Navigation Model. This adapts the Me, Projects, Skills, Fun, and Contact pattern into section-specific cached questions, warm first-person avatar answers, visual component data, follow-up CTAs, and button behavior contracts.

---

## 0. AI Portfolio + RAG Wiki Readiness Audit

This wiki is designed for two purposes: an AI-powered portfolio and a RAG knowledge base. The content is rich enough for portfolio storytelling, but RAG quality depends on stable entities, chunk ids, aliases, freshness rules, and answer guardrails.

### 0-1. Current Structure Diagnosis

| Axis | Status | Diagnosis | v10 Direction |
| --- | --- | --- | --- |
| Portfolio narrative | Strong | The transition from business, OOSU SALON, Sticks & Stones, Portfoli-Oh!, and AskOosu is clear. | Keep story chunks short and searchable. |
| Project information | Strong | Major projects include problem, solution, role, tech stack, challenges, and lessons. | Add canonical entities and source chunk ids. |
| AI answer guardrails | Strong | Rules already restrict first-person claims, invented metrics, unverified URLs, and TODO facts. | Connect them to evidence contracts and FAQ cache. |
| RAG retrieval stability | Medium | Long tables and story blocks can mix signals. | Use chunk type, priority, and alias matching. |
| Notion operation | Medium | Notion is clearly the CMS, but sync/update rules need implementation-level detail. | Use Notion as CMS and DB as retrieval cache. |
| Frontend/backend/DB connection | Medium | API directions exist. | Maintain `/api/rag/sync`, `/api/rag/search`, `/api/chat`, and feedback flow. |
| Cost control | Medium | Groq is used as a free/low-cost model provider. | Add FAQ Answer Cache before Groq. |

### 0-2. Core Principles

| Principle | Meaning |
| --- | --- |
| Canonical First | People, projects, skills, roles, links, and policies should be represented as canonical entities. |
| Alias Safe Retrieval | Variants like `Ask Oosu`, `AskOosu`, `AI portfolio`, and Korean spellings should route to the same entity. |
| Evidence Before Generation | The API should decide which chunks support an answer before asking the model to write. |
| Guardrail Co-Retrieval | Project and achievement answers should also retrieve policy/guardrail chunks. |
| Notion as CMS, DB as Retrieval Cache | Humans edit Notion; the backend stores searchable chunks, embeddings, logs, and feedback. |
| Cache First, RAG Next | High-frequency questions should use cached model answers first; complex questions should use RAG + Groq. |

---

## 1. Profile

### Basic Information

| Field | Content |
| --- | --- |
| Name | Oosu Jang |
| Korean name | 장우수 |
| Current title | AI-connected Fullstack Developer |
| Location | Seoul, South Korea |
| Education | Hankuk University of Foreign Studies, Business Administration major / Advertising, PR & Branding minor |
| Email | oosu.salon@gmail.com |
| GitHub | https://github.com/oosuhada |
| LinkedIn | https://www.linkedin.com/in/oosuhada/ |
| Instagram | https://www.instagram.com/oosu.hada |
| 2026 Portfolio | https://oosu.dev |
| 2026 Portfolio GitHub | https://github.com/oosuhada/AskOosu |
| 2025 Portfolio | https://portfoli-oh.oosu.dev |
| AskOosu Wiki | TODO / Notion URL managed separately |
| Resume KO | TODO |
| Resume EN | TODO |

### Name Meaning

The name Oosu carries multiple meanings in Hanja and Korean sound.

| Hanja | Meaning | Portfolio interpretation |
| --- | --- | --- |
| 佑守 | to help and to guard | Purpose and care |
| 優秀 | to be excellent | Excellence and high standards |
| 憂愁 | to feel deeply | Empathy and emotional depth |

These meanings connect to Oosu's design and development approach: purpose, excellence, and empathy.

### Certifications / Language

| Item | Content |
| --- | --- |
| OPIc | AL, Advanced Low, perfect score, 2017.05 |
| TOEIC | 990, perfect score, 2017.09 |
| Driver's license | Korean class 2 ordinary license |
| Word processor | Level 1 certification |
| Hanja certification | Semi-level 4 |
| Candle making | Certified |
| Perfumery | Certified |
| Wine sommelier | Certified |

### Awards and Activities

Oosu has awards and project experience in marketing, presentation, tourism planning, promotion, and university-level project execution. These are used in the portfolio as evidence of early communication, planning, and business-oriented problem solving. Do not overstate them as software engineering awards.

### One-Line Introduction

Oosu is an AI-connected fullstack developer who connects customer experience, business insight, frontend, backend, and AI into practical service experiences.

### Alternative Self-Introduction Lines

| Context | Expression |
| --- | --- |
| Technical attitude | A builder who designs experiences and extends them with AI. |
| Career path | Flutter to UX/UI to AI fullstack; someone who is not afraid to start again. |
| Honest tone | A heavy AI user who knows that AI is powerful only when the human knows what should be built. |
| UX-centered | An engineer who connects user experience, data, and AI. |
| Life-wide tone | Someone who debugs code by day, reads patterns by night, and pours wine on weekends. |

### Three-Sentence Introduction

Oosu is an AI-connected fullstack developer expanding into software development from customer research, data analysis, brand operation, and UX design. Oosu started from interactive frontend portfolio work and is now building projects that connect React, Spring Boot, databases, and AI tooling. AskOosu is the 2026 portfolio project that lets visitors explore projects, skills, and collaboration potential through conversation instead of scrolling.

### Long Introduction

Oosu has built a career across customer research, marketing, data analysis, offline brand operation, UX design, and web/app development. At GfK Korea, Oosu worked on global POS tracking data analysis and reporting for a Samsung Electronics mobile account and supported customer communication and training. At JW CRONY WORLDWIDE, Oosu experienced global Galaxy Studio VR-4D operations and CGV 4DX overseas installation/maintenance operations, and later worked as an external consultant on market analysis, business strategy, process improvement, marketing strategy, and risk evaluation.

From 2020 to 2025, Oosu founded and operated OOSU SALON, a boutique wine bar, designing the brand, space, menu, customer experience, and daily operations. This became a foundation for understanding sensory experience, service flow, brand consistency, and operational reality. Later, at Sticks & Stones, Oosu led a website update as a contract User Experience Designer, modernizing interface and navigation for better engagement and digital journey.

In development, Oosu works with HTML, CSS, JavaScript, React, TypeScript, Next.js, Spring Boot, PostgreSQL, and AI/RAG structures. Recent work uses Claude Code, Gemini CLI, OpenAI Codex, Notion API, Groq, and RAG workflows to connect planning, implementation, debugging, documentation, and answer quality.

### Development Philosophy

| Philosophy | Explanation |
| --- | --- |
| CX to UX Bridge | Customer experience from business, research, POS data, and OOSU SALON becomes digital UX thinking. |
| Connecting the Dots | Marketing, data, consulting, entrepreneurship, UX, and development are treated as one connected path. |
| Modern & Traditional | Oosu likes the balance between Korean traditional sensibility and modern digital interaction. |
| AI-Augmented Builder | AI is used as a productivity engine for planning, implementation, debugging, and documentation, but human judgment remains responsible. |
| Continuous Learner | Oosu grows by learning tools needed to complete services, not by treating languages as isolated goals. |

### Strengths as a Developer

| Strength | Explanation |
| --- | --- |
| Fast learning and execution | Learns new tools quickly and applies them in projects. |
| Service planning sense | Turns broad experience into product and service structures. |
| Frontend sensibility | Cares about interaction, visual flow, and portfolio storytelling. |
| Fullstack scalability | Expanding from React/TypeScript frontend to Spring Boot, PostgreSQL, and AI/RAG. |
| AI tool usage | Actively uses Claude Code, Gemini CLI, Codex, and Groq in development workflows. |
| Business/UX connection | Connects technical choices to user problems and business context. |
| Customer insight | Uses mystery shopper, customer panel, CRM, market research, and POS analysis experience. |
| Project leadership | Has experience coordinating events, consulting, service operations, and web updates. |
| Global communication | Has English-based business communication experience through global accounts and overseas operations. |
| Cross-functional communication | Bridges business language and engineering language. |
| Sensory experience design | Has candle, perfume, and wine certifications that support holistic experience thinking. |

### Work Style

Oosu first understands the purpose and context, then structures the user flow and service logic before implementation. Oosu tends to concentrate strongly on early planning and system structure, and is improving finishing discipline by defining completion criteria and priorities upfront. Communication style is context-first, evidence-based, and oriented toward connecting user value with execution feasibility.

### Learning Style

Oosu learns best by applying new tools to actual portfolio or service projects. Current focus areas are AskOosu, Notion/RAG, Spring Boot, PostgreSQL, data processing, AI service development, and coding test practice.

### Collaboration Style

Oosu contributes to planning, structure design, user problem definition, and implementation connection. In conflict, Oosu prefers shared goals, factual evidence, objective output, and responsibility-based task adjustment. In EZ Air, Oosu pushed the team toward an AI-connected direction when the initial team preference leaned toward a simpler design clone.

### Current Focus

| Area | Focus |
| --- | --- |
| Portfolio | Complete AskOosu 2026 conversational portfolio. |
| AI | Notion Wiki, RAG, answer quality, and AI development workflow. |
| Backend/Data | Spring Boot, PostgreSQL, API design, data processing. |
| Career | Grow into an AI service/fullstack developer connecting CX, UX, business, and data. |
| Interests | Industrial AI, manufacturing data, AI application development, fullstack development, AI-PM style problem definition. |

### Growth Areas

| Area | Description |
| --- | --- |
| Finishing focus | Strong in early structure; improving finish by setting completion criteria first. |
| Prioritization | Broad interests can expand scope; actively practicing sharper priority setting. |
| Backend/AI depth | Still building depth through Spring Boot, RAG, data processing, and AI service projects. |

### Values

| Value | Meaning |
| --- | --- |
| Empathy over aesthetics | Design is not just how things look, but how they work and feel. |
| Big-picture thinking | Understand the full ecosystem from system logic to final pixels. |
| Continuous growth | Learn fast, try often, and use feedback as fuel. |
| Design with conviction | Solve real problems instead of only making things pretty. |

### Process

| Step | Description |
| --- | --- |
| Discover | Define the problem, map user needs, and research context. |
| Define | Structure the solution with flows, wireframes, and clear goals. |
| Design | Craft intuitive interfaces grounded in human behavior. |
| Deliver | Build, prototype, and refine through feedback and iteration. |

### Fun Facts and Interests

Oosu has broad interests including perfume, candles, scuba diving, wine, piano, service exploration, and everyday route optimization. Oosu often calculates travel paths by considering not only the shortest route but also hills, stairs, subway car position, transfer speed, and the most efficient exit. This habit connects to UX thinking because it focuses on reducing time, fatigue, and decision cost for users. Recently, Oosu is also interested in services like low-cost meal maps: simple but sharp products that identify a real need at the right time.

### Career Timeline Summary

| Period | Organization / Role | Portfolio Summary |
| --- | --- | --- |
| 2012-2014 | Marketing Association MIFE | Weekly case study and discussion operation. |
| 2012-2014 | Korea Association of Talent | Student organization leadership and online/offline campaigns. |
| 2012-2013 | Bausch + Lomb | Marketing internship and promotion strategy. |
| 2013-2014 | Specup Ad | Large-scale job fair project management. |
| 2014-2015 | US Army / KATUSA | Customer service, leadership, access control, emergency service communication. |
| 2015-2016 | Estée Lauder / IRIS Infotech | IT subcontract issue coordination with HCL and global offices. |
| 2016-2017 | Ipsos / GfK / INI | Mystery shopper and customer panel projects. |
| 2017-2018 | Ermenegildo Zegna | Marketing/MD internship, CRM, omnichannel reports, consumer research. |
| 2018-2019 | GfK Korea | POS tracking data analysis and global key account communication. |
| 2019 | JW CRONY WORLDWIDE | Global VR-4D operations and overseas installation/maintenance coordination. |
| 2020-2025 | OOSU SALON | Founder; brand, space, menu, customer experience, and operations. |
| 2022 | Taeyoung Tech | External consultant for business strategy and process improvement. |
| 2023-2024 | Davit Inc. | External consultant for management, strategy, market analysis, and risk. |
| 2025-2026 | Sticks & Stones | Contract UX designer leading website update and frontend rebuild. |

### Education Summary

| Period | Institution / Program |
| --- | --- |
| 2012-2018 | Hankuk University of Foreign Studies, Business Administration / Advertising, PR & Branding |
| 2024.10-2025.02 | Flutter app development startup course, Sparta Coding Club |
| 2025.04-2025.07 | UX/UI web/mobile design course, Seoul program |
| 2026.03-2026.09 | KOSA × BISTelligence Generative AI Application Developer course, expected completion |

### Academic Interpretation

Business administration and advertising/PR/branding provide a foundation for understanding customer needs, brand messaging, market context, and user journeys. Courses such as business statistics, consumer behavior, marketing research, and technology/operations management connect to POS data analysis, UX reasoning, and AI/RAG data architecture. Writing and presentation courses support Notion Wiki, documentation, README writing, and AI answer design.

### Profile FAQ

#### What kind of developer is Oosu?

Oosu is an AI-connected fullstack developer expanding from customer experience, data analysis, brand operation, and UX design into software development. Oosu is interested in connecting user questions, data, APIs, and AI answers into one service flow rather than only making screens look attractive.

#### What are Oosu's strengths?

Oosu learns quickly, applies new tools in projects, and connects technology to user and business context. Oosu has experience in customer research, POS data, CRM, entrepreneurship, UX/UI, frontend, backend, and AI/RAG structures.

#### How does business experience help development?

Oosu's business background helps define problems, priorities, user journeys, and service value before implementation. This makes Oosu useful in cross-functional environments where business goals and engineering decisions need to be connected.

#### What position is Oosu interested in?

Oosu is interested in AI application development, fullstack development, and AI service/product roles that connect problem definition, data, frontend, backend, and generative AI.

---

## 2. Projects

### AskOosu 2026

| Field | Content |
| --- | --- |
| Status | Home-server deployment prepared / production URL confirmed |
| Priority | Representative project |
| One-line description | An AI-connected conversational portfolio where visitors explore Oosu's projects and skills by asking questions instead of scrolling. |
| Problem | Static portfolios make visitors search manually and make project updates hard to maintain. |
| Solution | Connect a Next.js chat UI, Vercel AI SDK, Groq, Notion RAG, project cards, static fallback, and a PostgreSQL retrieval cache. In production, AskOosu is prepared for a Mac mini home-server deployment with Docker Compose, Homebrew Nginx, and Cloudflare Tunnel at `https://oosu.dev`. |
| Role | Solo project: planning, UI/UX, frontend, AI chat API, RAG structure, implementation. |
| Tech | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Vercel AI SDK 6, Groq, Notion API, RAG, PostgreSQL, pgvector, Docker Compose, Mac mini, Homebrew Nginx, Cloudflare Tunnel, Radix UI, Framer Motion. |
| Key features | Chat-first UI, starter questions, local chat history, language/theme preference, project cards, GitHub stars API, Notion/static search, `/api/rag/sync`, `/api/rag/search`, Groq key-pool fallback, answer feedback storage, `/api/health`, and home-server operation scripts. |
| Challenge | Connecting AI answers to portfolio UX and maintaining Notion/static fallback while building answer reliability. |
| Lesson | A portfolio can be a conversational product, not only a static showcase. |
| Live URL | https://oosu.dev |
| GitHub | https://github.com/oosuhada/AskOosu |

Story: AskOosu came from the reflection that Portfoli-Oh! had too many features and made visitors lose direction. The goal is to reduce friction and let visitors ask what they actually want to know. Its RAG design keeps Notion as the editable CMS, PostgreSQL as the retrieval cache, Groq as the generation model, and Vercel AI SDK as the streaming/model integration layer. The AI SDK is still used on the Mac mini deployment because it is a Next.js/Node library, not a Vercel-only hosting feature.

### Instagram Clone

| Field | Content |
| --- | --- |
| Status | Core features implemented; deployment/enhancement ongoing |
| Priority | Representative project |
| One-line description | A solo fullstack SNS project implementing feed, follow, comments, search, media, and AI features. |
| Problem | Needed fullstack experience beyond screen cloning: database, API, user relations, and frontend flow. |
| Solution | Spring Boot backend, PostgreSQL, React/Next.js frontend, Meilisearch, Cloudinary, JWT/Spring Security, and AI features. |
| Role | Solo fullstack project. |
| Tech | Next.js 14, React 18, Tailwind, Spring Boot 3, Java 21, JPA, Spring Security, JWT, Redis, PostgreSQL, Cloudinary, Meilisearch, REST API, Fly.io, Railway. |
| Key features | Feed, like, comments, profiles, post detail routes, search, local recent search, story/reels UI, AI comment summary, profanity detection, hashtag suggestions. |
| Lesson | SNS projects require clear data modeling and layer boundaries. |
| Live URL | https://aigram.oosu.dev |
| GitHub | Local remote or public candidate should be verified before public answer. |

Story: The project started as something that seemed short, but the relationships between users, posts, comments, follows, stories, search, and uploads made it deeper. Oosu learned that fullstack development depends on designing the data flow before adding features.

### Sticks & Stones Homepage

| Field | Content |
| --- | --- |
| Status | Completed |
| Priority | Representative project |
| One-line description | A real-service website update that modernized UX, navigation, and frontend structure for a company website. |
| Problem | The old website used an outdated WordPress theme and accumulated external maintenance changes, making it difficult to maintain. |
| Solution | Preserve brand assets and experience while rebuilding the technical foundation with Vite + TypeScript. |
| Role | Contract UX Designer; end-to-end website update, UX improvement, frontend implementation, deployment. |
| Tech | TypeScript, Vite, HTML, CSS, Vercel. |
| Key challenge | Understanding and replacing legacy PHP/CSS/JS without losing the existing brand experience. |
| Guardrail | Do not invent Google Analytics or performance metrics; explain structural outcomes instead. |
| Live URL | https://stks.oosu.dev |
| GitHub | https://github.com/oosuhada/sticksandstones |

Story: The client's metaphor was to keep the frame of an old hanok but remodel it with modern glass and air conditioning. In portfolio language, this means preserving brand identity while rebuilding the technical foundation.

### Portfoli-Oh! 2025

| Field | Content |
| --- | --- |
| Status | Completed / archived |
| Priority | Supporting project |
| One-line description | An interactive portfolio combining problem-solving process, motion, custom cursor, highlighter, and a JSON-based chatbot. |
| Tech | HTML, CSS, JavaScript, GSAP, Three.js, Lottie, GitHub Pages. |
| Lesson | Adding too many features can turn a portfolio into a technology archive rather than a user-centered experience. |
| Live URL | https://portfoli-oh.oosu.dev |
| GitHub | https://github.com/oosuhada/portfoli-oh |

Portfoli-Oh! is important because its limits led directly to AskOosu. The JSON chatbot became hard to maintain as data grew, which created the need for Notion Wiki + RAG.

### EZ Air

EZ Air is a UX/UI course team project for an AI-first flight booking experience. The core idea was to make AI flight search visible and usable through natural-language search, Gemini API, Amadeus API, animation, and a Node/Express backend. Oosu pushed the team toward an AI-connected direction, guided Git workflow and merging, and contributed heavily to UI/animation and API direction.

### Uncorked

Uncorked is a wine recommendation and experience project connected to OOSU SALON. It translates offline wine/service knowledge into a digital product idea. It should be described as a CX/UX bridge rather than a purely technical flagship project.

### Pylingo / Javalingo

Pylingo and Javalingo are early language-learning projects that show Oosu's transition from basic programming practice to structured learning. They are supporting projects, useful for showing consistency and learning history.

### Onjung

Onjung is a design/front-end project connected to warm service and landing-page style experimentation. Use it as a supporting UX/visual project.

### Nomad Market

Nomad Market is a marketplace/mobile/web learning project connected to map and location-oriented product thinking. It supports the story of exploring practical services and user flows.

### Notion Knowledge Wiki

The Notion Knowledge Wiki is the source CMS for AskOosu's RAG system. Its role is not only documentation but the structured knowledge base behind AI portfolio answers.

### Algolog / Codetest Log Extension

Algolog is a coding-test log / Chrome extension direction project. It shows automation, GitHub API integration, and learning-log product thinking.

### Webtoon AI Translate

Webtoon AI Translate is an AI/document/image processing project idea using OCR, translation APIs, image processing, and editor tooling. It is a supporting AI application project and should not be overstated as a completed production system unless verified.

### Youth Housing Map

Youth Housing Map is a map-based project that connects public-interest service needs, location information, and user problem definition. It fits Oosu's interest in practical maps and route/service optimization.

### Train Booking App / Flutter Learning Apps / Dart Console Projects

These projects show the early Flutter/Dart learning path. They should be used to explain growth and learning consistency, not as representative production work.

### Lab / CSS Experiments / JavaScript Projects

The Lab section includes visual experiments, CSS motion, JavaScript utilities, and interface studies. It supports the story of visual curiosity and frontend experimentation.

### Development Folder Inventory and Growth Timeline

Oosu's repository/folder history shows a progression from Dart/Flutter and small learning repositories to UX/UI projects, frontend portfolios, fullstack SNS, AI tooling, and RAG-powered portfolio architecture. The preferred interpretation is steady expansion, not a scattered list.

---

## 3. Tech Stack

### Skill Level Criteria

| Level | Meaning |
| --- | --- |
| confident | Can explain, implement, and debug independently in a project context. |
| usable | Can implement with documentation and AI/tooling support. |
| learning | Currently studying and applying in limited project scopes. |

### Main Stack

| Area | Technologies | Portfolio Evidence |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript, React, Next.js, TypeScript, Tailwind CSS, Framer Motion | Portfoli-Oh!, Sticks & Stones, AskOosu, Instagram Clone |
| Backend | Spring Boot, Java, REST API, JWT, Spring Security, Node/Express | Instagram Clone, EZ Air, AskOosu design |
| Database/Search | PostgreSQL, MySQL, Redis, Meilisearch, pgvector concept | Instagram Clone, AskOosu RAG |
| AI/RAG | Notion API, Groq, OpenAI, xAI/Grok, Vercel AI SDK, RAG | AskOosu |
| Tools | Git, GitHub, Claude Code, Gemini CLI, Codex, FFMPEG | Portfolio projects and creative automation |
| Design/UX | Figma, Framer, interaction design, user journey, service planning | UX/UI course, Sticks & Stones, Portfoli-Oh!, AskOosu |
| Business/Data | POS data analysis, market research, CRM, strategy, customer research | GfK, consulting, OOSU SALON |

### Tech Stack FAQ

Oosu should be described as a growing fullstack/AI developer, not as a senior expert in every listed technology. The strongest evidence is the ability to connect tools into working projects: Sticks & Stones for real-service frontend rebuild, Instagram Clone for fullstack/SNS structure, and AskOosu for AI/RAG architecture.

---

## 4. AI Usage

### Tools

| Tool | Usage |
| --- | --- |
| Claude Code | Development assistance, refactoring, implementation planning. |
| Gemini CLI | Development support and experiment workflow. |
| OpenAI Codex | AskOosu implementation workflow and repository tasks. |
| Groq | Low-cost/free-tier answer generation for AskOosu. |
| Notion API | Knowledge source sync for RAG. |
| Vercel AI SDK | AI chat/frontend integration. |

### Methodology

Oosu uses AI as an augmented workflow, not as a replacement for understanding. AI can help with planning, coding, debugging, and documentation, but Oosu reviews code flow, asks for explanations, runs tests, checks logs, and compares results against documentation or project requirements.

### AI Usage FAQ

AI is used to speed up development, but final judgment remains human. Oosu's skill is shown by knowing what to ask, how to evaluate generated code, how to integrate it into a service, and how to build guardrails for answer quality.

---

## 5. Recommended FAQ Questions

Recommended starter questions should be routed to FAQ cache whenever possible:

1. What kind of developer is Oosu?
2. Explain AskOosu.
3. What did Oosu learn from Instagram Clone?
4. Why is Sticks & Stones important?
5. How does business experience connect to development?
6. What is Oosu's collaboration style?
7. How does Oosu use AI tools?
8. What roles is Oosu interested in?

---

## 6. Tone Guide

### Answer Tone

- Use third-person or subject omission in Korean; in English, use a polished portfolio-assistant tone.
- Do not answer as if the assistant is Oosu speaking in first person unless the UI explicitly requires first-person mode.
- Keep default answers to about three sentences unless the user asks for detail.
- Be clear, grounded, and recruiter-safe.
- Avoid emotional overexposure, inflated metrics, and invented achievements.

### Prohibited

- Do not invent live URLs, resume URLs, private repo links, metrics, employment outcomes, or analytics numbers.
- Do not expose detailed residential information.
- Do not overstate KOSA as completed before completion.
- Do not claim expert-level backend/AI depth beyond project evidence.
- Do not answer TODO items as finalized.

---

## 7. Connect

### Contact

| Channel | Information |
| --- | --- |
| Email | oosu.salon@gmail.com |
| LinkedIn | https://www.linkedin.com/in/oosuhada/ |
| GitHub | https://github.com/oosuhada |
| Instagram | https://www.instagram.com/oosu.hada |

### Current Status

Oosu is preparing for AI application development, fullstack development, and AI service/product roles after completing the KOSA × BISTelligence course in 2026. Freelance collaboration, side projects, portfolio feedback, and coffee chats may be discussed, but employment/availability details should not be invented.

---

## 8. Creative & Writing

### Medium

Medium is used as a writing archive and should be described as evidence of thinking, reflection, and documentation. Public links and exact post details should be verified before being given.

### Tistory

Tistory is used for development learning notes. It supports the story of documenting learning and technical progress.

### KOSA Learning Log

The KOSA learning log records ongoing backend, AI, data processing, and service development learning. Since completion is expected in 2026.09, do not state it as completed before that date.

### Gradient Therapy

Gradient Therapy is a visual/ambient screen-saver YouTube project using gradient color design and FFMPEG automation. It connects creative technology, visual sensitivity, and CLI-based media automation.

### Naver Blog

Naver Blog is an early personal writing archive. Use it only as context for long-term writing/thinking habits unless public link and details are confirmed.

---

## 9. AI Answer Engine Guide

### 9-0. Core Rules

1. Answer only from the wiki, cached FAQ answers, or retrieved chunks.
2. Use the user's language.
3. Use the cache for high-frequency questions.
4. Use RAG + Groq for complex, specific, or low-confidence questions.
5. Retrieve guardrail chunks for links, achievements, metrics, private repositories, and sensitive stories.
6. Do not hallucinate.
7. Keep follow-up suggestions to at most one.

### 9-1. Routing Guide

| Intent | Examples | Preferred Source |
| --- | --- | --- |
| Profile intro | who is Oosu, introduce Oosu | FAQ cache → profile chunks |
| Strengths | strengths, why hire | FAQ cache → profile/career chunks |
| Project overview | AskOosu, Instagram Clone, Sticks & Stones | FAQ cache → project fact/story chunks |
| Technical detail | RAG architecture, backend, DB | RAG search + Groq |
| Career story | career transition, OOSU SALON | FAQ cache or RAG depending on depth |
| Contact/link | resume, live URL, collaboration | FAQ cache with guardrails |
| Unknown | unrelated or unsupported | fallback template |

### 9-2. Length Guide

| Length | Use Case |
| --- | --- |
| One sentence | Quick card, starter question preview, short answer. |
| Three sentences | Default chat answer. |
| Detailed | Interview-style or technical explanation. |

### 9-3. Guardrails

Never invent metrics, URLs, resume links, private repo details, employment outcomes, course completion, or company-owned analytics. When something is TODO, say it is not finalized. When a source is private, explain the project at a high level without exposing the private link.

### 9-4. Project Q&A Matrix

| Project | Emphasize | Avoid |
| --- | --- | --- |
| AskOosu | AI portfolio, Notion RAG, Groq, chat UI, evidence/cached answers | Claiming all parts are fully complete if TODO remains. |
| Instagram Clone | Fullstack SNS, DB/API/frontend/search/AI feature integration | Presenting it as only a UI clone. |
| Sticks & Stones | Real-service legacy rebuild, Vite + TypeScript, brand preservation | Inventing performance or analytics numbers. |
| Portfoli-Oh! | Interactive frontend archive and learning experience | Calling it a failure; frame as learning that led to AskOosu. |
| EZ Air | AI-first UX team project and collaboration leadership | Overstating production maturity. |
| Uncorked | Offline wine/CX experience translated to digital UX | Overstating technical depth if not verified. |

### 9-5. Project Comparison

| Comparison | Core Difference |
| --- | --- |
| Portfoli-Oh! vs AskOosu | Feature-heavy interactive archive vs conversational AI portfolio. |
| Instagram Clone vs AskOosu | Fullstack SNS implementation vs AI/RAG portfolio experience. |
| Sticks & Stones vs personal projects | Real client/legacy constraints vs self-directed portfolio experiments. |
| OOSU SALON vs Uncorked | Offline service operation vs digital translation of sensory service experience. |

### 9-6. Audience Modes

| Audience | Focus |
| --- | --- |
| Recruiter | Strengths, representative projects, collaboration, role fit. |
| Engineer | Architecture, data flow, API/DB decisions, limitations. |
| Designer/PM | UX, problem definition, user journey, service context. |
| Casual visitor | Simple language, personality, interests, project overview. |
| AI/tooling | Notion, RAG, Groq, caching, prompts, evaluation. |

### 9-7. Unknown / Fallback Templates

- English: "The current Wiki does not have enough confirmed information about that yet. It is safer to treat this as not finalized rather than inventing details."
- Korean equivalent is maintained in the KO file.

---

## 10. RAG Knowledge Architecture

### 10-1. Canonical Entity Map

| Entity ID | Entity |
| --- | --- |
| `profile` | Oosu Jang profile |
| `career` | Career timeline and transition |
| `askoosu` | AskOosu 2026 |
| `instagram_clone` | Instagram Clone |
| `sticks_and_stones` | Sticks & Stones Homepage |
| `portfoli_oh` | Portfoli-Oh! 2025 |
| `ez_air` | EZ Air |
| `uncorked` | Uncorked |
| `oosu_salon` | OOSU SALON |
| `tech_stack` | Technical skills |
| `ai_usage` | AI workflow and tooling |
| `contact` | Public contact info |
| `guardrail` | Redaction and answer safety policies |

### 10-2. Alias Dictionary

| Canonical | Aliases |
| --- | --- |
| AskOosu | Ask Oosu, AskOosu 2026, AI portfolio, conversational portfolio, 애스크우수 |
| Instagram Clone | Instagram project, SNS clone, Instagram KOSA project, 인스타그램 클론 |
| Sticks & Stones | Sticks, Sticks and Stones, stks, legacy WordPress rebuild |
| Portfoli-Oh! | 2025 portfolio, portfoli-oh, old portfolio, interactive portfolio |
| OOSU SALON | Oosu Salon, wine bar, 우수살롱 |

### 10-3. Chunk ID Convention

Use stable ids such as:

```text
profile.summary
profile.strengths
career.timeline
project.askoosu.fact
project.askoosu.story
project.instagram_clone.fact
project.sticks_and_stones.guardrail
policy.guardrail.metrics
faq.profile.intro.default
```

### 10-4. Retrieval Priority

Representative projects and public-safe answers should rank higher. TODO, private, unverified, or sensitive chunks should be retrieved only with explicit guardrails and should lower confidence.

### 10-5. Answer Evidence Contract

The backend should log answer evidence:

```json
{
  "answer": "final answer shown to the user",
  "language": "en",
  "intent": "project_overview | tech_skill | career_story | contact | unknown",
  "audience_mode": "recruiter | engineer | designer_pm | casual | ai_tooling",
  "used_chunks": [
    {
      "chunk_id": "project.askoosu.fact",
      "entity_id": "askoosu",
      "score": 0.91,
      "visibility": "public",
      "has_todo": true
    }
  ],
  "confidence": "high | medium | low",
  "needs_update": false,
  "guardrails_applied": ["no_unverified_url", "no_metric_hallucination"],
  "answerSource": "faq_cache | faq_rewrite | rag_generation"
}
```

### 10-6. Public Redaction Rules

Public answers should reduce precise personal details, avoid private repository links, avoid unverified metrics, and never expose secrets. Residence should be summarized as Seoul-based unless there is a strong reason to disclose more.

---

## 11. Notion + Groq + Frontend/Backend/DB Blueprint

### 11-1. Recommended Architecture

```text
Notion Wiki CMS
  ↓ /api/rag/sync
Normalized chunks
  ↓
PostgreSQL rag_chunks / faq_answers / feedback logs
  ↓ /api/rag/search and FAQ matcher
Next.js /api/chat
  ↓
Groq generation only when needed
  ↓
Chat UI with answer, source badge, confidence, project card, feedback
```

### 11-2. Frontend

The frontend should show chat input, starter questions, answer bubbles, project cards, source badges, confidence badges, TODO/needs-review warnings, and feedback buttons. FAQ cache answers should display a badge such as `Frequently asked answer` or `Model answer based response`.

### 11-3. Backend API

| API | Role |
| --- | --- |
| `/api/rag/sync` | Fetch Notion blocks recursively, normalize, chunk, and upsert into DB. |
| `/api/rag/search` | Search chunks by query, entity, visibility, and ranking. |
| `/api/chat` | Match FAQ cache first, then RAG search + Groq if needed. |
| `/api/feedback` | Store answer quality feedback. |
| `/api/health` | Check service and DB health. |

### 11-4. DB Tables

| Table | Role |
| --- | --- |
| `rag_sources` | Source pages such as Notion page ids. |
| `rag_chunks` | Searchable knowledge chunks with metadata. |
| `rag_sync_runs` | Sync history and errors. |
| `faq_answers` | Cached model answers for high-frequency questions. |
| `chat_sessions` | Session-level history if needed. |
| `chat_messages` | User/assistant messages and evidence. |
| `answer_feedback` | User feedback for answer quality. |
| `rag_eval_runs` | Evaluation run history. |

### 11-5. Retrieval Strategy

Start with PostgreSQL full-text search, trigram/fuzzy matching, entity hints, and visibility filters. Add pgvector later if needed. FAQ cache should be checked before chunk search.

### 11-6. Groq Rules

Use Groq only when FAQ cache does not confidently answer the question or when a rewrite/technical synthesis is needed. Handle 429/rate limits with fallback. Do not include secrets in logs. Use Korean for Korean questions and English for English questions.

### 11-7. Implementation Priority

1. Import KO and EN Notion pages or maintain them as separate Markdown sources.
2. Sync each language into DB with `language` metadata.
3. Add FAQ cache matcher before Groq.
4. Add English/Korean model answers to DB or static data.
5. Add UI badges for `faq_cache`, `faq_rewrite`, and `rag_generation`.
6. Evaluate both Korean and English starter questions.

---

## 12. RAG Evaluation Set

### 12-1. Representative Questions

| ID | English Question | Expected Route |
| --- | --- | --- |
| eval.profile.001 | What kind of developer is Oosu? | faq.profile.intro.default |
| eval.project.001 | Explain AskOosu. | faq.project.askoosu.overview.default |
| eval.instagram.001 | What did Oosu learn from Instagram Clone? | faq.project.instagram.learned.default |
| eval.sticks.001 | Why is Sticks & Stones important? | faq.project.sticks.importance.default |
| eval.compare.001 | What is the difference between Portfoli-Oh! and AskOosu? | faq.project.portfoliooh_vs_askoosu.default |
| eval.salon.001 | How does OOSU SALON connect to development? | faq.career.oosu_salon_to_dev.default |
| eval.business.001 | How does business experience connect to development? | faq.profile.business_to_dev.default |
| eval.collab.001 | What is Oosu's collaboration style? | faq.profile.collaboration.default |
| eval.ai.001 | How does Oosu use AI tools? | faq.ai_usage.workflow.default |
| eval.role.001 | What roles is Oosu interested in? | faq.career.target_role.default |
| eval.resume.001 | Can I see the resume URL? | faq.link.resume.default |
| eval.url.001 | What is the live URL? | faq.link.live_url.default |

### 12-2. Pass Criteria

Answers should include the expected entity, avoid hallucination, use the correct language, respect TODO/private/metric guardrails, and return cached answers for high-frequency questions.

---

## 13. Implementation Notes for AskOosu Repo

### Recommended Folders

```text
app/api/chat/route.ts
app/api/rag/sync/route.ts
app/api/rag/search/route.ts
app/api/feedback/route.ts
lib/rag/notion.ts
lib/rag/search.ts
lib/faq/match.ts
data/faq-answers.ko.ts
data/faq-answers.en.ts
db/migrations/
docs/wiki/notion-wiki-draft-v10-ko.md
docs/wiki/notion-wiki-draft-v10-en.md
```

### Minimum for First Deployment

- Production DB connected.
- Migrations applied.
- Notion sync executed.
- FAQ cache loaded.
- `/api/chat` calls FAQ matcher before Groq.
- Health endpoint working.
- Rate limit enabled for `/api/chat` and `/api/feedback`.

---

## 14. FAQ Answer Cache / Model Answer Bank

### 14-1. Purpose

The FAQ Answer Cache reduces Groq usage and response latency for high-frequency questions. It should not replace RAG entirely; it handles repeated portfolio questions while RAG + Groq handles deeper or unique questions.

### 14-2. Routing Rule

```text
1. Normalize the user question.
2. Match it against English or Korean FAQ patterns.
3. If confidence >= 0.90, return the cached answer directly.
4. If confidence is between 0.75 and 0.90, use the FAQ answer as rewrite context.
5. If confidence < 0.75, use RAG search + Groq generation.
```

### 14-3. FAQ Answer Schema

```json
{
  "id": "faq.profile.intro.default",
  "intentId": "profile.intro",
  "entityId": "profile",
  "language": "en",
  "patterns": ["who is oosu", "introduce oosu", "what kind of developer is oosu"],
  "shortAnswer": "...",
  "defaultAnswer": "...",
  "detailedAnswer": "...",
  "sourceChunkIds": ["profile.summary", "profile.strengths"],
  "visibility": "public",
  "hasTodo": false,
  "freshness": "stable",
  "answerSource": "faq_cache",
  "skippedGroq": true
}
```

### 14-4. UI Badge Copy

| Source | English Badge |
| --- | --- |
| `faq_cache` | Frequently asked answer |
| `faq_rewrite` | Model-answer based response |
| `rag_generation` | Wiki search-based answer |
| `fallback` | Basic profile-based response |
| `todo_warning` | Includes information that needs confirmation |

### 14-5. Model Answer Bank — English

#### FAQ 01. What kind of developer is Oosu?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.profile.intro.default` |
| Intent ID | `profile.intro` |
| Entity ID | `profile` |
| Cache Mode | `direct_cache` |
| Patterns | `who is oosu`, `introduce oosu`, `what kind of developer is oosu`, `tell me about oosu` |
| Source Chunk IDs | `profile.summary`, `profile.long_intro`, `profile.strengths`, `career.summary` |

**Short Answer**  
Oosu is an AI-connected fullstack developer who connects customer experience, business insight, frontend, backend, and AI into practical service experiences.

**Default Answer**  
Oosu is an AI-connected fullstack developer expanding from customer research, data analysis, brand operation, and UX design into software development. Oosu is interested in designing service flows where user questions, data, APIs, and AI answers work together instead of treating the interface as only a visual layer.

AskOosu, the 2026 portfolio project, shows this direction. It lets visitors ask questions and explore projects, skills, and collaboration potential through conversation rather than scrolling through a static page.

**Detailed Answer**  
Oosu has moved through marketing, customer research, POS data analysis, consulting, entrepreneurship, UX design, and web/app development. This path created a habit of defining problems from the user's and business context before implementation.

In software development, Oosu works with React, TypeScript, Next.js, Spring Boot, PostgreSQL, Notion API, Groq, and RAG structures. AskOosu is the clearest example: it connects UI, API, database, AI answer generation, fallback logic, evidence tracking, and deployment into one portfolio experience.

---

#### FAQ 02. What are Oosu's strengths?

**Short Answer**  
Oosu's strengths are fast learning, execution, business/UX thinking, and the ability to connect frontend, backend, data, and AI into one service flow.

**Default Answer**  
Oosu learns new tools quickly and applies them in actual projects. Customer research, POS data analysis, CRM, entrepreneurship, and UX/UI experience help Oosu see technology not just as a feature list but as a way to reduce user and business pain.

Oosu is also growing toward fullstack and AI-connected development. AskOosu, Instagram Clone, and Sticks & Stones show this from different angles: AI/RAG portfolio design, fullstack SNS implementation, and real-service legacy rebuild.

---

#### FAQ 03. How does business experience connect to development?

**Short Answer**  
Oosu's business experience helps define user problems, priorities, market context, and service value before implementation.

**Default Answer**  
Oosu's business background directly supports problem definition and prioritization in development. Business administration and advertising/PR/branding trained Oosu to consider customer needs, brand messaging, user journeys, and business structure together.

This means Oosu does not start only from “what feature should be built?” but from “whose problem does this reduce, and how does it connect to the service goal?” That perspective helps bridge business and engineering language.

---

#### FAQ 04. How did Oosu transition into development?

**Short Answer**  
Oosu's transition came from a growing desire to build directly after years of identifying customer, market, and service problems.

**Default Answer**  
Oosu's career transition was not a straight planned line; it came from accumulating the desire to make things directly. Marketing, data analysis, consulting, and OOSU SALON helped Oosu understand users and markets, while UX/UI and development learning turned that understanding into implementation.

The Flutter app course, UX/UI course, and KOSA × BISTelligence generative AI application developer course are part of this transition. AskOosu is the project that best summarizes this shift from experience analysis to AI-connected fullstack building.

---

#### FAQ 05. Explain AskOosu.

**Short Answer**  
AskOosu is an AI-connected conversational portfolio where visitors explore Oosu's projects, skills, and career by asking questions instead of scrolling.

**Default Answer**  
AskOosu is Oosu's representative 2026 portfolio project. Instead of asking visitors to browse a long static portfolio, it lets them ask questions and receive answers based on a Notion Wiki, RAG structure, and Groq-powered answer generation.

Technically, it connects a Next.js/React/TypeScript chat UI with Notion API, RAG search, PostgreSQL chunk storage, Groq, source/confidence badges, project cards, and feedback logging. The core idea is to make the portfolio itself a conversational product.

---

#### FAQ 06. How does RAG work in AskOosu?

**Short Answer**  
AskOosu uses Notion as the editable CMS, PostgreSQL as the retrieval cache, and Groq as the generation model when a cached answer is not enough.

**Default Answer**  
AskOosu separates responsibilities clearly. Notion is the human-edited source, `/api/rag/sync` reads Notion blocks and stores searchable chunks in PostgreSQL, `/api/rag/search` finds relevant chunks, and `/api/chat` sends grounded context to Groq when generation is needed.

Before Groq is called, the FAQ Answer Cache checks whether the question can be answered from a high-confidence model answer. If so, AskOosu returns the cached answer immediately and skips Groq.

---

#### FAQ 07. What did Oosu learn from Instagram Clone?

**Short Answer**  
Oosu learned that an SNS is not just UI cloning; it is a complex data flow involving users, posts, comments, follows, media, search, and AI features.

**Default Answer**  
The biggest lesson from Instagram Clone was the importance of designing layer boundaries early in fullstack development. What looked like a simple clone became a complex system of user, post, comment, follow, story, search, upload, and authentication relationships.

By connecting Spring Boot, PostgreSQL, React/Next.js, Meilisearch, Cloudinary, and AI features such as comment summary, profanity detection, and hashtag suggestions, Oosu experienced how a real service moves through data flow across layers.

---

#### FAQ 08. Why is Sticks & Stones important?

**Short Answer**  
Sticks & Stones is important because it was a real-service legacy website rebuild that preserved brand experience while modernizing the technical foundation.

**Default Answer**  
Sticks & Stones was not just a personal project; it involved an actual company website with legacy WordPress/PHP/CSS/JS constraints. The old site had accumulated external maintenance changes and was difficult to maintain.

Oosu rebuilt the technical foundation with Vite + TypeScript while preserving the brand experience. The client's “modernized hanok” metaphor captures the project well: keep the recognizable frame, but rebuild the living conditions for modern use.

---

#### FAQ 09. What is the difference between Portfoli-Oh! and AskOosu?

**Short Answer**  
Portfoli-Oh! was a feature-heavy interactive frontend archive, while AskOosu is a conversational AI portfolio built around user questions.

**Default Answer**  
Portfoli-Oh! 2025 included many frontend interactions such as GSAP, Three.js, Lottie, a custom cursor, a highlighter, and a JSON keyword-matching chatbot. It was valuable as a learning archive, but it also showed that too many features can make visitors lose direction.

AskOosu came from that reflection. Instead of adding more visual features, it focuses on helping visitors ask questions and reach the information they need through Notion Wiki, RAG, and AI-powered chat.

---

#### FAQ 10. How does OOSU SALON connect to development?

**Short Answer**  
OOSU SALON taught Oosu how users experience a service through flow, atmosphere, timing, and operations, which now connects to UX and product development.

**Default Answer**  
OOSU SALON was a five-year service operation experience covering brand, space, menu, customer experience, and daily operations. It taught Oosu that good service is not a single feature but a connected experience across many touchpoints.

In development, this becomes CX-to-UX thinking. Oosu pays attention not only to whether a feature works, but also to where users enter, where they hesitate, what effort they spend, and how the service flow feels.

---

#### FAQ 11. What is Oosu's collaboration style?

**Short Answer**  
Oosu first clarifies purpose and context, then connects user perspective, business needs, and implementation feasibility.

**Default Answer**  
Oosu's collaboration style is context-first and structure-oriented. Oosu tends to clarify the goal, define the problem from a user/customer perspective, and then connect it to implementation.

Because Oosu has experience in marketing, data analysis, consulting, entrepreneurship, and real-service web updates, Oosu is comfortable translating between different stakeholder languages. In conflict, Oosu prefers shared goals, facts, evidence, and responsibility-based adjustment over emotional argument.

---

#### FAQ 12. How does Oosu use AI tools?

**Short Answer**  
Oosu uses AI tools for planning, implementation, debugging, documentation, and RAG/answer quality, while still reviewing and validating the output.

**Default Answer**  
Oosu uses tools such as Claude Code, Gemini CLI, OpenAI Codex, Groq, and Notion API as part of the development workflow. AI helps accelerate planning, coding, debugging, and documentation, but Oosu does not treat AI output as automatically correct.

Oosu reviews code flow, asks for explanations, runs type checks/builds/tests, checks logs, and compares results against project requirements. AskOosu also applies this mindset at the product level by designing answer evidence, guardrails, FAQ cache, and feedback loops.

---

#### FAQ 13. What roles is Oosu interested in?

**Short Answer**  
Oosu is interested in AI application development, fullstack development, and AI service/product roles that connect user problem definition with implementation.

**Default Answer**  
Oosu is interested in roles where user problems, data, frontend, backend, and AI can be connected into practical services. The strongest fit is AI application development, fullstack development with React/Spring Boot/PostgreSQL, or AI service/product development where problem definition and implementation are both important.

Oosu is especially interested in industrial AI, manufacturing data, and companies that use AI to create practical operational impact.

---

#### FAQ 14. Can I see the resume URL?

**Short Answer**  
The resume URL is not finalized in the current Wiki. It should be shared after the official Korean or English resume link is added.

**Default Answer**  
The current Wiki marks the Korean and English resume URLs as TODO. Because the links are not finalized, AskOosu should not invent or provide a resume URL.

For now, contact can be made through email, LinkedIn, or GitHub. Once the official resume links are added to the Wiki, AskOosu can provide them directly.

---

#### FAQ 15. What is the live URL?

**Short Answer**  
AskOosu's live URL is still managed as a TODO in the Wiki. Confirm the deployed URL before answering with a link.

**Default Answer**  
The AskOosu live URL is not finalized in the current Wiki. The GitHub repository is public, but the production URL should not be invented until it is confirmed and added.

If asked about currently available public links, AskOosu can provide the GitHub repository and verified project links such as Portfoli-Oh! or Sticks & Stones, while clearly saying that AskOosu's live URL is still being finalized.

---

#### FAQ 16. How can someone contact or collaborate with Oosu?

**Short Answer**  
Oosu can be contacted through email, LinkedIn, or GitHub. Collaboration discussions can include portfolio feedback, side projects, freelance work, or coffee chats.

**Default Answer**  
The safest public contact channels are email, LinkedIn, and GitHub. Oosu is preparing for AI application development, fullstack development, and roles that connect user problem definition with implementation after the KOSA × BISTelligence course.

For collaboration, it is best to discuss the project goal, timeline, role expectation, and technical scope first.

---

#### FAQ 17. What are Oosu's hobbies or interests outside development?

**Short Answer**  
Oosu has sensory and service-oriented interests: perfume, candles, scuba diving, wine, piano, route optimization, and exploring simple services that solve sharp everyday problems.

**Default Answer**  
Oosu's interests include perfume, candles, scuba diving, wine, piano, and sensory experience design. Oosu also has a habit of optimizing routes in everyday life: checking not only the shortest path but also hills, stairs, subway car position, transfer speed, and the fastest exit.

This connects well to UX thinking because it is about reducing time, fatigue, and decision cost. Recently, Oosu is also interested in simple but sharp services such as low-cost meal maps that identify real needs without needing heavy visual or technical complexity.

---

#### FAQ 18. What are Oosu's growth areas?

**Short Answer**  
Oosu is improving finishing focus and prioritization by defining completion criteria and separating core features from later expansions.

**Default Answer**  
Oosu tends to be strong in early planning and structure design, but broad interests can make project scope expand. To improve this, Oosu is practicing setting completion criteria first and separating essential features from future ideas.

AskOosu reflects this growth. After Portfoli-Oh! became feature-heavy, AskOosu focuses more deliberately on reducing friction and helping visitors reach the right information.

---

#### FAQ 19. Summarize the top three projects.

**Short Answer**  
The top three projects are AskOosu, Instagram Clone, and Sticks & Stones: AI portfolio, solo fullstack SNS, and real-service legacy rebuild.

**Default Answer**  
Oosu's top three projects are AskOosu 2026, Instagram Clone, and Sticks & Stones. AskOosu is an AI conversational portfolio that connects Notion Wiki, RAG, Groq, and a chat UI. Instagram Clone is a solo fullstack SNS project using Spring Boot, PostgreSQL, React/Next.js, Meilisearch, and AI features.

Sticks & Stones is a real-service website rebuild that modernized an old WordPress structure into a Vite + TypeScript frontend while preserving brand experience. Together, these projects show AI service design, fullstack implementation, and real-world legacy modernization.

---

#### FAQ 20. What is Oosu's tech stack level?

**Short Answer**  
Oosu is building project-based fullstack and AI capability with React/Next.js/TypeScript, Spring Boot/PostgreSQL, and Notion RAG/Groq structures.

**Default Answer**  
Oosu has frontend experience with React, Next.js, TypeScript, Tailwind CSS, and interaction design. Sticks & Stones shows a Vite + TypeScript real-service rebuild, while AskOosu shows a Next.js chat UI connected to AI/RAG.

On the backend/data side, Oosu works with Spring Boot, PostgreSQL, REST APIs, JWT, Meilisearch, and RAG chunk storage through projects. It is accurate to describe Oosu as a growing fullstack/AI developer with strong integration ability rather than as a senior expert in every technology.

---

#### FAQ 21. Why should someone hire Oosu?

**Short Answer**  
Oosu understands business and user experience and is learning to turn that understanding into frontend, backend, and AI implementation.

**Default Answer**  
Oosu's differentiator is the ability to connect business context, user experience, and implementation. Customer research, POS data analysis, brand operation, entrepreneurship, and UX design help Oosu start from the user's problem rather than only from technology.

Projects such as AskOosu, Instagram Clone, and Sticks & Stones show that Oosu can move from problem definition to structure design, implementation, deployment, and improvement. Oosu is especially suited for teams that value AI-connected product thinking and cross-functional communication.

---

#### FAQ 22. Why did OOSU SALON close?

**Short Answer**  
OOSU SALON closed because sales pressure, market changes, rising costs, and operational fatigue made the business less sustainable.

**Default Answer**  
The main reasons were sales decline and market change. OOSU SALON started around the COVID period and had learning and growth moments, but after late 2023, repeated operations, reduced new opportunities, consumer spending changes, rising costs, and operational fatigue made sustainability difficult.

This should not be framed only as failure. It became a direct learning experience in brand, customer flow, service operations, timing, and sustainability, which now informs Oosu's UX and product development perspective.

---

#### FAQ 23. What languages does Oosu speak?

**Short Answer**  
Oosu is fluent in Korean and English, with OPIc AL and TOEIC 990. Italian is a hobby-level language for simple daily situations.

**Default Answer**  
Oosu uses Korean and English for professional communication. Oosu has OPIc AL and TOEIC 990, and has experience with English-based business communication through global account management and overseas project operations.

Italian is a hobby/life-experience language. Oosu studied practical Italian at university and lived in Italy for short periods, enough for restaurant orders and simple daily communication, but business communication should be described as Korean and English.

---

#### FAQ 24. Does Oosu's diverse background look unfocused?

**Short Answer**  
Oosu's diverse background is best understood as a connected path from understanding customers and markets to building services directly.

**Default Answer**  
Oosu's career may look broad at first because it includes marketing, data analysis, consulting, entrepreneurship, UX, and development. But the common thread is understanding people, defining problems, and creating better experiences.

Customer research and POS data analysis taught Oosu how to read users and markets. OOSU SALON taught real service operation, and UX/development turned that experience into digital product building. AskOosu organizes this path into an AI-connected fullstack direction rather than presenting it as scattered experience.

---

### 14-6. Cache Hit / Miss Logging

Log the following fields for cost and quality analysis:

```json
{
  "question": "What kind of developer is Oosu?",
  "language": "en",
  "answerSource": "faq_cache",
  "matchedFaqId": "faq.profile.intro.default",
  "confidence": 0.94,
  "skippedGroq": true,
  "latencyMs": 12,
  "fallbackUsed": false
}
```

### 14-7. When Not to Use FAQ Cache

Do not use FAQ cache when the user asks a highly specific technical question, requests comparison beyond the prepared answer, asks for the latest deployment state, asks for private information, asks for exact metrics, or combines multiple intents. Use RAG + Groq or fallback instead.

### 14-8. Quality Checklist

- English and Korean FAQ ids should match.
- Patterns should be language-specific.
- Cache hit must not call Groq.
- TODO answers must stay conservative.
- Public/private/metric guardrails must apply even to cached answers.
- `answerSource`, `matchedFaqId`, and `skippedGroq` must be returned to the frontend.

---

## Open TODO List

| Priority | TODO |
| --- | --- |
| 0 | Confirm AskOosu live URL. |
| 0 | Add official Korean resume URL. |
| 0 | Add official English resume URL. |
| 0 | Confirm Notion page id and production sync settings. |
| 1 | Verify public/private repository visibility for each project. |
| 1 | Confirm demo video links if any. |
| 2 | Add more English detailed answers if interview-specific phrasing is needed. |
| 3 | Add public links for writing/blog archives after review. |

---


#### FAQ 25. What was the UI/UX direction behind AskOosu?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.project.askoosu.visual_ui.default` |
| Intent ID | `project.askoosu.visual_ui` |
| Entity ID | `askoosu` |
| Cache Mode | `direct_cache` |
| Patterns | `What was the UI direction of AskOosu?`, `AskOosu UI UX`, `conversational portfolio UX`, `AskOosu visual ui`, `AskOosu design direction` |
| Source Chunk IDs | `project.askoosu.fact`, `project.askoosu.story`, `project.askoosu.rag_principles`, `project.portfolio_oh.story`, `ui.answer_experience` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

AskOosu’s UI/UX is designed around “letting people ask immediately” rather than “making them read a long portfolio.” Chat is the core, but visual answer blocks such as project cards, suggestion chips, and source badges help answers feel richer and easier to understand.

**Default Answer**

AskOosu’s UI/UX is designed to turn a static portfolio into a conversational information-discovery experience. The goal is to help visitors reach answers quickly by asking natural questions instead of scrolling through long sections. That is why chat is the main interface, but the answer experience should not be text-only—recommended questions, project cards, source/confidence badges, and quick actions should support understanding.

I also learned from Portfoli-Oh! that adding too many interactions can make people lose their way. So in AskOosu, the priority is not “more flashy,” but “easier to understand faster.” In other words, the UI should serve information architecture and navigation, not just visual effect.

**Detailed Answer**

The UI/UX direction of AskOosu can be summarized into three principles. First, **question-first navigation**. Visitors should not need to read About, Projects, and Skills in a fixed order. A single question should be enough to enter the right context. That is why quick questions should stay short, while the actual user bubble in chat should display a more natural sentence.

Second, **blending text with visual answer blocks**. Some questions are fine with a short paragraph, but high-value questions—such as top projects, skills, contact, or AskOosu architecture—are easier to understand when shown as cards, chips, or step diagrams. A profile intro works well as a hero card, projects as a carousel, skills as grouped chips, and contact as an application-style info card.

Third, **clear information hierarchy over excessive interaction**. As Portfoli-Oh! showed, strong motion and effects are not enough if the answer arrives too late. In AskOosu, it is better to show only a few starter questions at first, and reveal more contextual questions only after the visitor enters a project, skills, or contact context. In short, AskOosu is meant to be a portfolio that is easy to ask, not just easy to look at.

---

#### FAQ 26. How is AskOosu deployed and operated?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.project.askoosu.deployment.default` |
| Intent ID | `project.askoosu.deployment` |
| Entity ID | `askoosu` |
| Cache Mode | `faq_rewrite_or_rag` |
| Patterns | `How is AskOosu deployed?`, `Where does AskOosu run?`, `portfolio deployment`, `deployment of AskOosu`, `home server deployment` |
| Source Chunk IDs | `links.public`, `rag.frontend_backend_db`, `rag.notion_sync.rules`, `rag.groq.guardrails`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

AskOosu uses `oosu.dev` as its canonical public URL and treats Notion Wiki as the source of truth, with the app, DB, and RAG cache connected around it. Deployment follows the principle of exposing a clean canonical domain instead of temporary URLs.

**Default Answer**

AskOosu is intended to run with `https://oosu.dev` as the canonical live URL. The original content lives in Notion Wiki, while the service layer connects a Next.js frontend, route handlers, a retrieval/cache data layer, and Groq-based answer generation. Even if temporary deployment URLs exist, the user-facing experience should stay centered on the main portfolio domain.

From an operations point of view, Notion content should be synced regularly into chunks, and frequently asked questions should be handled by the FAQ cache first to reduce API cost and latency. That makes AskOosu closer to a small portfolio product than a simple static website.

**Detailed Answer**

The deployment and operations model of AskOosu can be understood in four layers. First, the **content source layer**: Notion Wiki acts as the editable source of truth for portfolio content, project descriptions, and the FAQ answer bank. Second, the **application layer**: the Next.js app handles the chat UI, suggested questions, visual answer blocks, and API route handlers.

Third, the **retrieval and generation layer**: `/api/rag/sync` reads Notion blocks and stores chunks, `/api/rag/search` retrieves relevant chunks, and `/api/chat` assembles answers using FAQ cache → RAG → Groq. Fourth, the **operations and infrastructure layer**: the public experience should prioritize a canonical domain such as `oosu.dev`, with a home-server + Cloudflare Tunnel style approach for clean access. Temporary platform URLs should stay secondary.

Operationally, it is also important to log question history, feedback, cache-hit status, and source chunk IDs. That makes it possible to improve which questions should stay in the FAQ cache, where RAG search is weak, and which answers benefit from visual rendering.

---

#### FAQ 27. What is the difference between FAQ cache and RAG?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.tech.rag_vs_faq_cache.default` |
| Intent ID | `tech.rag_vs_faq_cache` |
| Entity ID | `rag` |
| Cache Mode | `direct_cache` |
| Patterns | `Difference between FAQ cache and RAG`, `cache vs rag`, `Why do you need both?`, `faq cache vs rag`, `retrieval vs cache` |
| Source Chunk IDs | `rag.architecture.overview`, `faq.cache.rules`, `rag.answer_routing`, `rag.groq.guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

FAQ cache is the layer that returns verified model answers directly for highly repeated questions, while RAG is the layer that retrieves relevant chunks and composes a grounded answer for more flexible questions. Cache is mainly for speed and cost reduction; RAG is for flexibility and evidence retrieval.

**Default Answer**

FAQ cache and RAG serve different roles. FAQ cache is for repeated, stable questions such as “What kind of developer is Oosu?”, “Can you summarize the top 3 projects?”, or “How can I contact you?” In those cases, the system can return a prepared answer directly without calling Groq, which makes the response faster and cheaper.

RAG is used when the question is more specific or more compositional. For example, detailed technical questions, comparison questions, or contextual follow-ups require retrieving relevant Notion Wiki chunks first and then assembling the answer. In short, FAQ cache is for questions whose answers are mostly stable, while RAG is for questions that need flexible explanation grounded in retrieved evidence.

**Detailed Answer**

In AskOosu, FAQ cache and RAG are not competing systems—they are complementary. FAQ cache is closer to a **model answer bank**. Each cached item has an FAQ ID, intent, patterns, and short/default/detailed answer variants. When a user’s question matches with high confidence, the system can return that answer immediately. This is very effective for repeated questions, and it keeps tone and quality stable.

RAG is closer to an **evidence-driven explanation engine**. When the question is longer, combines multiple concepts, or uses wording that does not map cleanly to a cached FAQ, the system first retrieves relevant source chunks and then generates or assembles the answer. This gives more flexibility, but it depends more on retrieval quality and model calls.

That is why the best routing rule is “FAQ cache first, RAG next.” Short, repeated questions should stay in the FAQ layer. Ambiguous or compositional questions should go through RAG. In the middle zone, the system can use the FAQ answer as rewrite context. This structure balances speed, cost, and flexibility.

---

#### FAQ 28. Which projects used Spring Boot and PostgreSQL?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.tech.springboot.postgresql.default` |
| Intent ID | `tech.springboot_postgresql` |
| Entity ID | `tech` |
| Cache Mode | `direct_cache` |
| Patterns | `Where did you use Spring Boot?`, `PostgreSQL projects`, `Spring Boot and PostgreSQL`, `backend stack`, `what projects used spring boot and postgresql` |
| Source Chunk IDs | `project.instagram_clone.fact`, `project.instagram_clone.story`, `project.askoosu.fact`, `rag.db.blueprint`, `skills.backend` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The clearest project where Spring Boot and PostgreSQL were used together is Instagram Clone. PostgreSQL also matters in AskOosu, where it is used in the retrieval/cache-oriented data structure for RAG.

**Default Answer**

The project where I most clearly used Spring Boot and PostgreSQL together is Instagram Clone. In that project, Spring Boot and PostgreSQL were used to design and implement the relational flow behind users, posts, comments, follows, and search. That makes it important not just as a frontend clone, but as a fullstack project where API and DB structure were connected from end to end.

PostgreSQL is also important in AskOosu. In AskOosu, the goal is to use PostgreSQL (with a pgvector-ready structure) to store and retrieve Notion-derived chunks and metadata for the RAG layer. So if Instagram Clone represents more traditional service-backend experience, AskOosu represents a retrieval- and AI-oriented data usage pattern.

**Detailed Answer**

Spring Boot and PostgreSQL together show an important part of Oosu’s backend growth. In **Instagram Clone**, Spring Boot, PostgreSQL, and REST API were used to build the core domain of an SNS product. Users, posts, comments, follows, search, and auth all required careful data modeling and API design, which made the project a strong learning experience for backend structure.

In **AskOosu**, PostgreSQL plays a slightly different role. Rather than focusing mainly on CRUD-oriented product backend logic, it is used as a retrieval-oriented data layer for knowledge chunks, metadata, source IDs, and feedback logs. In that sense, Instagram Clone reflects service-backend experience, while AskOosu reflects AI-portfolio retrieval architecture.

So the best summary is: Spring Boot + PostgreSQL are most strongly represented in Instagram Clone, while PostgreSQL’s extended use case appears in AskOosu.

---

#### FAQ 29. How could Oosu contribute in the first 30 days?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.first_30_days.default` |
| Intent ID | `recruiter.first_30_days` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `First 30 days`, `How would you contribute in your first month?`, `onboarding plan`, `first 30 days contribution`, `what would you do first` |
| Source Chunk IDs | `profile.strengths`, `profile.collaboration`, `career.target_role`, `project.askoosu.fact`, `project.instagram_clone.fact` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

In the first 30 days, Oosu could contribute by learning the product and domain quickly, then shipping small improvements right away. Strong areas include understanding user flow, organizing information, connecting frontend/backend pieces, and structuring AI-related opportunities.

**Default Answer**

In the first 30 days, the best contribution would not be trying to change everything at once, but understanding the product context and user flow quickly, then finding areas that can be improved immediately. Oosu is strong at learning new tools and structures fast, and turning that understanding into small execution—such as UX fixes, documentation, FAQ/help structure, or a small feature.

For example, that could mean identifying where users get confused, where information is scattered, or where time is being wasted repeatedly, and translating that into frontend improvements, a simple API integration, clearer help content, or an AI-assisted workflow idea. The first-month role is less “the person who transforms everything” and more “the person who understands quickly and becomes useful fast.”

**Detailed Answer**

Oosu’s contribution in the first 30 days can be divided into three stages. First, **absorbing context**: using the product directly, understanding the user journey and core metrics, and learning how the team defines its important problems. Because Oosu has both business and UX perspective, the focus tends to be on structure and context, not only isolated features.

Second, **small execution**: if a screen is confusing, microcopy, layout, or information hierarchy can be improved. If users repeat the same questions, FAQ/help flows can be organized. From a development side, Oosu can contribute through frontend component work, simple API integration, internal tools, or documentation.

Third, **proposing extension points**: if the product could benefit from AI, search, recommendation, or operational efficiency tooling, Oosu can help structure those opportunities. With experience from AskOosu in designing information architecture and AI answer flow, and from Instagram Clone in building fullstack flows, Oosu could contribute as someone who learns fast and ships useful small wins early.

---

#### FAQ 30. What kind of project would make Oosu say yes immediately?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.collaboration.project_yes.default` |
| Intent ID | `collaboration.project_yes` |
| Entity ID | `collaboration` |
| Cache Mode | `direct_cache` |
| Patterns | `What kind of project interests you?`, `Projects you would say yes to`, `what projects would make you say yes`, `what teams fit you well` |
| Source Chunk IDs | `career.target_role`, `profile.current_focus`, `profile.contact`, `project.askoosu.fact`, `profile.business_to_dev` |
| Visibility | `public` |
| Freshness | `medium` |

**Short Answer**

Projects where AI becomes part of the real user experience—and where problem definition and implementation both matter—are the most exciting. Especially appealing are RAG/search, AI applications, fullstack web services, and industrial or manufacturing AI tied to real-world problems.

**Default Answer**

The kind of project that would make Oosu say yes immediately is one where AI genuinely improves the user experience. Not just attaching a model for the sake of it, but creating a flow where users can find faster, get less lost, or make better decisions. That is why RAG/search, AI application development, fullstack web services, knowledge-heavy products, and operational efficiency tools are especially interesting.

Because Oosu’s strength lies in connecting business/UX thinking with implementation, teams that care about problem definition—not only coding—are also a strong fit. Industrial/manufacturing data, practical AI, internal tools, knowledge discovery, and recommendation experiences are especially compelling because they turn complex real-world problems into usable products.

**Detailed Answer**

There are a few common traits in the projects Oosu would say yes to immediately. First, **AI should live inside the real service experience**. The most interesting products are not just demos, but those where AI changes user flow through search, question answering, recommendation, or operational automation. AskOosu itself is an experiment in that direction.

Second, **problem definition and implementation should both matter**. Oosu is strongest not only when building screens, but when thinking through what should be built and why. Business studies, data analysis, OOSU SALON, and UX experience all contribute to the ability to structure a problem and turn it into product flow.

Third, **the work should connect to real-world problems**. Industrial/manufacturing data, customer experience improvement, search/knowledge management, AI applications, fullstack SaaS, and internal productivity tools are all attractive because they reduce friction and decision cost in real environments. Ultimately, the attraction is not just to technology itself, but to the way technology improves how people move, decide, and work.

---

## 15. Question Surface Registry / Exposure Hierarchy (v11 UPDATED)

> The FAQ Answer Bank is the internal answer repository. The actual questions exposed in the UI should be managed separately through a Question Surface Registry. In other words: **FAQ = answer layer**, **Question Surface = exposure layer**, **RenderSpec = visualization layer**.

### 15-1. Design Principles

1. **Do not expose every FAQ on the first screen.** Show only 4–6 starter questions at first.
2. **A single FAQ can support multiple question phrasings.** Keep `quickLabel` short, and `displayQuestion` natural and sentence-like.
3. **Separate contextual questions that appear only after entering a project, skills, or contact context.**
4. **Only attach rich visual answers to high-priority questions.** Others can stay text-first or lightly visual.
5. **Typed questions still use the existing FAQ matcher.** The exposure layer is separate from free-form user input.

### 15-2. Surface Types

| Surface | Description |
| --- | --- |
| `home` | Starter questions shown on first visit |
| `project.askoosu` | Questions shown when the AskOosu card/detail is active |
| `project.instagram` | Questions shown in Instagram Clone context |
| `project.sticks` | Questions shown in Sticks & Stones context |
| `project.portfoliooh` | Questions shown in Portfoli-Oh! context |
| `profile` | Profile and career deep-dive questions |
| `skills` | Skill and stack questions |
| `fun` | Hobbies, OOSU SALON, observation habits |
| `contact` | Contact and collaboration questions |
| `recruiter` | Recruiter-facing questions |
| `after_answer` | Follow-up questions after an answer |
| `typed_only` | Not exposed in UI; matched only on typed input |

### 15-3. Home Starter Questions (recommended initial 5)

| Priority | Quick label | Display question | FAQ ID | Answer variant | RenderSpec |
| --- | --- | --- | --- | --- | --- |
| 1 | `Who are you?` | `What kind of developer are you? Could you introduce yourself briefly?` | `faq.profile.intro.default` | `default` | `profile_hero_card` |
| 2 | `Top projects` | `Could you introduce your top 3 projects at a glance?` | `faq.projects.top3.summary` | `default` | `project_showcase_carousel` |
| 3 | `Skills` | `What is your current tech stack and strongest area?` | `faq.tech_stack.level.default` | `default` | `skills_cloud_card` |
| 4 | `AI workflow` | `How do you use AI tools in your development workflow?` | `faq.ai_usage.default` | `default` | `tooling_workflow_steps` |
| 5 | `Contact` | `How can I reach you, and what kinds of collaboration are you open to?` | `faq.contact.default` | `default` | `contact_opportunity_card` |

### 15-4. AskOosu Context Questions

| Priority | Quick label | Display question | FAQ ID | Answer variant | RenderSpec |
| --- | --- | --- | --- | --- | --- |
| 1 | `Overview` | `What problem is AskOosu trying to solve?` | `faq.project.askoosu.overview.default` | `default` | `product_spotlight_card` |
| 2 | `RAG architecture` | `How does RAG work inside AskOosu?` | `faq.project.askoosu.rag.default` | `detailed` | `architecture_steps_diagram` |
| 3 | `UI/UX direction` | `What was the UI/UX direction behind AskOosu?` | `faq.project.askoosu.visual_ui.default` | `default` | `ui_principles_cards` |
| 4 | `Deployment` | `How is AskOosu deployed and operated?` | `faq.project.askoosu.deployment.default` | `default` | `deployment_stack_flow` |
| 5 | `Before / After` | `How did the limits of Portfoli-Oh! lead to AskOosu?` | `faq.project.portfoliooh_vs_askoosu.default` | `default` | `comparison_grid` |

### 15-5. Other Contextual Questions

#### Instagram Clone

| Quick label | Display question | FAQ ID | RenderSpec |
| --- | --- | --- | --- |
| `What I learned` | `What was the biggest thing you learned from building Instagram Clone?` | `faq.project.instagram.learned.default` | `project_learning_card` |
| `Backend / DB` | `How were backend and data structured in this project?` | `faq.tech.springboot.postgresql.default` | `project_tech_usage_cards` |

#### Sticks & Stones

| Quick label | Display question | FAQ ID | RenderSpec |
| --- | --- | --- | --- |
| `Real service` | `Why is Sticks & Stones an important real-service case?` | `faq.project.sticks.importance.default` | `before_after_case_card` |
| `Tech base` | `How did you rebuild the legacy structure?` | `faq.tech_stack.level.default` | `stack_summary_card` |

#### Portfoli-Oh!

| Quick label | Display question | FAQ ID | RenderSpec |
| --- | --- | --- | --- |
| `Evolution` | `What is the difference between Portfoli-Oh! and AskOosu?` | `faq.project.portfoliooh_vs_askoosu.default` | `comparison_grid` |

#### Profile / Skills / Contact / Recruiter

| Group | Quick label | Display question | FAQ ID | RenderSpec |
| --- | --- | --- | --- | --- |
| Profile | `Strengths` | `What are your biggest strengths?` | `faq.profile.strengths.default` | `strength_cards` |
| Profile | `Career story` | `I’m curious about your career transition into development.` | `faq.career.transition.default` | `career_timeline_card` |
| Skills | `RAG vs Cache` | `What is the difference between FAQ cache and RAG?` | `faq.tech.rag_vs_faq_cache.default` | `comparison_grid` |
| Skills | `Spring/PostgreSQL` | `Which projects used Spring Boot and PostgreSQL?` | `faq.tech.springboot.postgresql.default` | `project_tech_usage_cards` |
| Recruiter | `First 30 days` | `How could you contribute in your first 30 days?` | `faq.recruiter.first_30_days.default` | `thirty_day_plan_timeline` |
| Contact | `Say yes project` | `What kind of project would make you say yes immediately?` | `faq.collaboration.project_yes.default` | `collaboration_fit_card` |

### 15-6. Display Logic Contract

```text
1. On first visit: surface = home
   → show only the top 5 starter questions

2. When the user clicks a project card:
   → activeSurface = project.askoosu / project.instagram / ...
   → show only contextual questions for that surface

3. When the user enters Skills / Contact / Recruiter context:
   → activeSurface = skills / contact / recruiter
   → show only the matching question group

4. When the user clicks a question:
   → show displayQuestion in the user bubble
   → fetch the answer using faqId + answerVariant
   → if renderSpec exists, render the matching visual block together with the answer text

5. When the user types directly:
   → use the existing FAQ matcher / RAG routing
   → keep it separate from the exposure logic
```

---

## 16. Rich Answer Rendering / Visual Response Guide (v11 UPDATED)

> Not every answer needs to be visual. But for high-value questions, using cards, chips, images, step diagrams, and comparison layouts creates a much stronger portfolio experience.

### 16-1. Visualization Priority

| Priority | Meaning | Example FAQs |
| --- | --- | --- |
| A | Top-value first-screen or high-context questions | FAQ 01, 05, 16, 19, 20, 25, 26, 27, 29, 30 |
| B | Contextual questions that benefit from structure | FAQ 06, 07, 08, 09, 10, 12, 21 |
| C | Questions that are fine as text or are more sensitive | FAQ 14, 18, 22, 23, 24 |

### 16-2. Screenshot-inspired Component Types

| RenderSpec | Visual feel | Building blocks |
| --- | --- | --- |
| `profile_hero_card` | Large profile image + name/tags + intro | portrait, name, title, location, chips, intro text |
| `project_showcase_carousel` | Three strong project cards in a carousel | thumbnail, project type, title, one-line value, CTA |
| `skills_cloud_card` | Category headers + pill chips | group title, skill chips, short summary |
| `fun_story_card` | One large image with caption and short story | hero image, caption, paragraph, optional link |
| `contact_opportunity_card` | Application/contact card with structured info blocks | status badge, duration/role/location, tech stack, value proposition, goal, contact links |
| `architecture_steps_diagram` | Step-based flow diagram | Notion → Sync → DB → Search → Groq → UI |
| `deployment_stack_flow` | Layered deployment cards | content source, app layer, data layer, infra/domain layer |
| `comparison_grid` | Two-column comparison card | left/right concept, goals, strengths, when to use |
| `project_tech_usage_cards` | Technology-by-project cards | project, backend, db, what was learned |
| `thirty_day_plan_timeline` | Three-step timeline | learn, ship small, propose next |
| `collaboration_fit_card` | Collaboration-fit keyword cards | project types, why fit, what I bring |
| `tooling_workflow_steps` | AI tooling workflow | plan → build → debug → document |

### 16-3. Recommended FAQ-to-RenderSpec Mapping

| FAQ ID | RenderSpec | Suggested answer format |
| --- | --- | --- |
| `faq.profile.intro.default` | `profile_hero_card` | profile card + summary text |
| `faq.projects.top3.summary` | `project_showcase_carousel` | 3 top project cards |
| `faq.tech_stack.level.default` | `skills_cloud_card` | grouped skill chips + summary |
| `faq.ai_usage.default` | `tooling_workflow_steps` | AI workflow steps |
| `faq.contact.default` | `contact_opportunity_card` | contact + opportunities card |
| `faq.project.askoosu.overview.default` | `product_spotlight_card` | AskOosu hero card + bullets |
| `faq.project.askoosu.rag.default` | `architecture_steps_diagram` | RAG flow diagram |
| `faq.project.askoosu.visual_ui.default` | `ui_principles_cards` | 3–4 UI principle cards |
| `faq.project.askoosu.deployment.default` | `deployment_stack_flow` | deployment/ops structure card |
| `faq.tech.rag_vs_faq_cache.default` | `comparison_grid` | FAQ cache vs RAG comparison |
| `faq.tech.springboot.postgresql.default` | `project_tech_usage_cards` | Instagram Clone vs AskOosu tech cards |
| `faq.recruiter.first_30_days.default` | `thirty_day_plan_timeline` | 0–10 / 10–20 / 20–30 day plan |
| `faq.collaboration.project_yes.default` | `collaboration_fit_card` | preferred project types |
| `faq.profile.hobby.default` | `fun_story_card` | image + short narrative |

### 16-4. Light Visual or Text-only Recommendations

| FAQ ID | Recommended format |
| --- | --- |
| `faq.link.resume.todo` | text + TODO badge |
| `faq.profile.growth.default` | text + 2–3 bullets |
| `faq.career.oosu_salon_closed.default` | text only |
| `faq.profile.language.default` | mini stats row |
| `faq.career.diverse_background.default` | text + timeline chips |

### 16-5. Codex Implementation Summary

1. **Separate two layers on question click.**
   - Use `quickLabel` for the button
   - Use `displayQuestion` for the user bubble in chat

2. **Render answers via `faqId + answerVariant + renderSpec`.**
   - Use the FAQ answer bank for short/default/detailed text
   - If `renderSpec` exists, render the visual block first and place the answer text underneath

3. **Make visual blocks data-driven.**
   - Prefer `uiData`-driven reusable components over hardcoded JSX per answer

4. **Do not over-visualize everything.**
   - Priority A → rich visual
   - Priority B → light visual or collapsible
   - Priority C → text only

5. **Keep layouts simple and readable, like the attached references.**
   - big title
   - clear metadata blocks
   - card/chip grouping
   - information hierarchy first, animation second

6. **Suggested file structure**

```text
data/question-surfaces.ko.ts
data/question-surfaces.en.ts
data/render-specs.ko.ts
components/chat/rich/ProfileHeroCard.tsx
components/chat/rich/ProjectShowcaseCarousel.tsx
components/chat/rich/SkillsCloudCard.tsx
components/chat/rich/FunStoryCard.tsx
components/chat/rich/ContactOpportunityCard.tsx
components/chat/rich/ArchitectureStepsDiagram.tsx
components/chat/rich/DeploymentStackFlow.tsx
components/chat/rich/ComparisonGrid.tsx
components/chat/rich/ProjectTechUsageCards.tsx
components/chat/rich/ThirtyDayPlanTimeline.tsx
components/chat/rich/CollaborationFitCard.tsx
```

---
