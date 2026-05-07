# AskOosu Notion Wiki — v12 EN (Add)

> Add-on file for v11 EN. This file extends the FAQ Answer Cache / Model Answer Bank with recruiter-facing "hard questions" — the kinds of things hiring managers and recruiters actually probe during interviews or portfolio reviews.
> These answers are curated model answers, not auto-generated. They are designed to be honest, grounded, and recruiter-safe.
> Integrate these FAQs as entries in `data/faq-answers.en.ts` and register corresponding surfaces in `data/question-surfaces.en.ts`.

---

## Version Notes

- `v12-add`: Added Recruiter Defense FAQ Bank — 30+ curated model answers covering retention risk, career-switcher depth, AI dependency, collaboration, role ambiguity, and hiring recommendations. Also expanded the Question Surface Registry with a `recruiter_defense` surface.

---

## 14. FAQ Answer Cache — v12 Extension (Recruiter Defense Bank)

### Design Principles for This Section

These answers follow three rules that separate them from generic portfolio FAQs:

1. **Acknowledge before defending.** Start by validating the concern. "That's a fair question" or "there is something to that" builds more credibility than "that worry is wrong."
2. **State conditions, not promises.** "Oosu thrives when X" is more believable than "Oosu will never leave."
3. **Reframe the evaluation criteria.** Shift the question from "will Oosu stay?" to "in what environment does Oosu contribute long-term?"

---

### FAQ R-01. Will Oosu stay long-term, or leave as soon as they've learned enough?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.retention_risk.default` |
| Intent ID | `recruiter.retention_risk` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Will Oosu stay long?`, `retention risk`, `will they leave soon`, `job hopping`, `how long will Oosu stay`, `오래 근무할 사람인가` |
| Source Chunk IDs | `profile.work_style`, `profile.strengths`, `career.timeline`, `profile.growth_areas` |
| Visibility | `public` |

**Short Answer**

That concern is reasonable. Oosu is less likely to stay in a role that limits growth — but more likely to contribute for a long time in a role where responsibility, product ownership, and growth direction are aligned.

**Default Answer**

It is fair to wonder. Oosu is not the type to stay in narrowly defined, repetitive roles for long — there is genuine restlessness if the scope of responsibility is too small or the growth ceiling is too obvious.

That said, this is not the same as "learn fast and leave." The pattern in Oosu's work history is not short-term transience; it is a long directional arc — from customer research and market analysis to brand operation and UX design to fullstack and AI development. Each chapter was long enough to go deep. The risk is not disloyalty. It is an environment where scope is capped and the work stops connecting to something real.

The more useful frame is: if the role gives Oosu a real product problem, room to connect UX/data/AI, and visible impact — the motivation to stay and go deep is very high.

**Detailed Answer**

Oosu's career shows a recurring pattern: move toward more direct ownership of the problem. Marketing → data → consulting → building a service → UX design → fullstack development → AI service design. Each transition was not "quitting" — it was following where the work was most real.

That means the retention question is best answered by environment, not personality. Oosu will likely stay longer in a role where:
- The problem domain is substantive and not fully solved
- Responsibility can grow over time (not just execute fixed specs)
- There is cross-functional collaboration across product, data, or AI
- The team's direction and Oosu's growth direction have real overlap

The risk is: if the role is too narrowly defined, if growth is blocked, or if the work disconnects from actual user/product impact, Oosu will become restless before long.

The best hiring decision is not to ask "will this person stay no matter what?" but to assess whether this role, at this company, offers the environment where Oosu's pattern of growth and contribution would actually continue.

---

### FAQ R-02. If Oosu wants to start a company, why would they focus here?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.startup_intent.default` |
| Intent ID | `recruiter.startup_intent` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `startup risk`, `wants to start a company`, `entrepreneurship concern`, `will Oosu leave to found a startup`, `창업 생각`, `배울것만 배우고 창업` |
| Source Chunk IDs | `career.oosu_salon`, `profile.current_focus`, `career.target_role` |
| Visibility | `public` |

**Short Answer**

Entrepreneurial interest is a direction, not an exit plan. Someone who wants to build things that work is exactly the kind of person who engages seriously with real product problems — which is what a good employer benefits from.

**Default Answer**

The worry is understandable: if someone wants to start a company, maybe they are just using this job to gather skills before leaving.

But that framing assumes entrepreneurship and employment are opposites. Oosu has already run a business — OOSU SALON for five years. That experience did not produce someone impatient with other people's problems. It produced someone who knows what it takes to make a service work end-to-end, and who takes operational and product responsibility seriously.

The startup interest, if anything, makes Oosu more engaged with product problems — not less. Someone who wants to build something eventually is highly motivated to understand how real products are built, how decisions get made, and how teams work. That engagement is not a flight risk. It is a signal that this person will not coast.

**Detailed Answer**

Entrepreneurial-minded people in engineering environments tend to bring two things that companies find valuable: a strong sense of product ownership, and a bias toward things actually working rather than just being technically complete.

Oosu's experience with OOSU SALON is the concrete evidence here. Running a service for five years — covering brand, space, customer experience, finances, and operations — is not a hobby. It produced a very clear understanding of what separates a product people use from one they abandon.

That perspective now shows up in how Oosu approaches development: "does this actually solve a user problem?" and "where does the friction come from?" are not just interview answers. They are the actual questions Oosu brings to a product.

The better evaluation is not "does this person want to start a company someday?" It is "does this person treat the work as meaningful and take product outcomes seriously?" On both counts, the evidence points yes.

---

### FAQ R-03. Is Oosu deep enough as a developer, or is the background too broad?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.depth_concern.default` |
| Intent ID | `recruiter.depth_concern` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Is Oosu deep enough?`, `non-CS background`, `career switcher depth`, `비전공 개발자`, `깊이가 부족하지 않은가`, `career changer developer` |
| Source Chunk IDs | `profile.strengths`, `tech_stack.main`, `project.instagram_clone.fact`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

The depth concern is real and worth taking seriously. Oosu is not a 10-year backend veteran. What Oosu does have is the ability to connect layers — UI, API, database, AI — into working systems, backed by business and UX judgment that many career-starters lack.

**Default Answer**

Legitimate question. Oosu does not have the kind of depth that comes from six years of backend systems engineering or low-level infrastructure work. That should be stated clearly.

What Oosu does have is cross-layer integration ability. Instagram Clone connected Spring Boot, PostgreSQL, JPA, JWT, Meilisearch, Cloudinary, and React/Next.js as a solo fullstack project. AskOosu connects Notion API, RAG chunk storage, Groq answer generation, and a chat UI with source badges and feedback logging. These are not simple demo apps — they require understanding how data flows across layers, how errors surface, and how to design for reliability.

The career-switcher background is also not a pure disadvantage. Understanding a business problem before writing code, knowing what a confused user actually experiences, knowing what operational reality looks like — these are hard to develop in a purely technical track and they show up in product quality.

The right framing: Oosu's depth is horizontal across layers and across domains, not yet vertical in any single specialized area. For roles that need integration, product thinking, and breadth, that is a real strength. For roles that need deep specialist expertise in a single narrow area, there are stronger matches.

**Detailed Answer**

A non-CS background creates two kinds of gaps. The first is structural knowledge — data structures, algorithms, operating systems, networking fundamentals. Oosu has been building this through coursework, project work, and coding test practice, but this is still an honest gap compared to a CS graduate with several years of engineering experience.

The second gap is depth in a specific technical domain — say, Kafka pipeline engineering or GPU memory optimization. Oosu does not have that kind of vertical depth yet.

What Oosu does have is: the ability to move from a problem description to a working system across multiple layers, business judgment about what problems are worth solving, UX instinct about where friction lives, and AI/tooling fluency that many traditional-track developers are still catching up to.

In practical terms, this looks like: building a fullstack SNS with proper relational modeling, JWT auth, file uploads, AI features, and search in a solo project; building a conversational AI portfolio with RAG architecture, FAQ caching, source evidence, and feedback loops; and rebuilding a real company's legacy website while preserving brand experience.

The question for hiring is: does this role need someone who can go very deep in one domain from day one, or someone who can connect systems, own a product problem end-to-end, and grow quickly into deeper expertise? For the latter, Oosu is a strong fit.

---

### FAQ R-04. If Oosu uses AI so much, is the underlying skill actually there?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.ai_dependency.default` |
| Intent ID | `recruiter.ai_dependency` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `AI dependency`, `does Oosu actually code`, `heavy AI user skill`, `AI를 많이 쓰면 실력이`, `코드를 직접 짤 수 있는가`, `AI tool skill gap` |
| Source Chunk IDs | `ai_usage.methodology`, `project.instagram_clone.fact`, `project.sticks_and_stones.fact`, `profile.strengths` |
| Visibility | `public` |

**Short Answer**

Heavy AI usage does not replace understanding — it requires it. Oosu's workflow is not "ask AI to write everything." It is using AI to move faster while still understanding data flow, reviewing generated code, catching errors, and making architectural decisions.

**Default Answer**

The concern behind this question is worth taking seriously: if someone leans heavily on AI-generated code, can they actually read, debug, and extend that code? Can they make independent decisions when AI output is wrong?

For Oosu, the answer is grounded in project evidence. Instagram Clone was not built by prompting AI for entire feature implementations. The relational model, the JWT auth flow, the Meilisearch integration, the AI comment features — these required understanding what the code was doing at each layer. AI tools helped with syntax, boilerplate, and iteration speed. They did not replace understanding data flow, error handling, or architecture decisions.

AskOosu goes further: Oosu designed the RAG architecture, the FAQ cache routing rules, the answer evidence contract, and the guardrail policies. These are not things AI proposes unprompted — they require knowing what the system needs and what failure modes look like.

AI fluency is a skill in 2026, not a shortcut. Knowing what to ask, how to evaluate the output, when to override it, and how to build guardrails for AI-generated answers — these are now part of being an effective developer.

**Detailed Answer**

The best way to think about AI tool usage in development is not "is the person using AI?" but "what is the quality of their judgment about AI output?"

Oosu's workflow: AI tools (Claude Code, Gemini CLI, Codex, Groq) are used for planning, drafting, debugging, and documentation. But every piece of generated code is reviewed for correctness, for how it integrates with existing state, and for edge cases. Type checks, build tests, log review, and comparison against documented expected behavior are standard steps — not optional.

The evidence: Sticks & Stones required understanding legacy PHP/CSS/JS before rebuilding with Vite + TypeScript. You cannot use AI to understand someone else's legacy code without also understanding what that code was supposed to do. Instagram Clone involved debugging cross-layer issues — where auth state was not propagating correctly, where search index was stale, where file upload errors were silent — none of which AI tools solve without a developer who understands each layer.

The broader point: a developer who knows how to use AI effectively is not demonstrating a lack of skill. They are demonstrating the additional skill of AI-augmented judgment, which is increasingly a real part of software engineering. The question is whether the human judgment is there to guide and validate. In Oosu's case, the project evidence supports yes.

---

### FAQ R-05. There are many projects — is there actual depth, or just surface-level breadth?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.project_breadth_vs_depth.default` |
| Intent ID | `recruiter.project_breadth_vs_depth` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Too many projects`, `breadth vs depth`, `프로젝트가 많은데 깊이가 있나`, `surface level portfolio`, `do the projects go deep` |
| Source Chunk IDs | `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks_and_stones.fact`, `profile.growth_areas` |
| Visibility | `public` |

**Short Answer**

The number of projects is partly the nature of a portfolio-in-progress. The three representative projects — AskOosu, Instagram Clone, Sticks & Stones — each go meaningfully deep in different directions: AI/RAG architecture, fullstack SNS implementation, and real-service legacy rebuild.

**Default Answer**

A fair concern. A portfolio with many projects can signal breadth without depth, and that would be a legitimate worry for a hiring team that needs someone to go deep.

Oosu's portfolio has two tiers. The representative projects — AskOosu, Instagram Clone, Sticks & Stones — are each substantial and go deep in a specific direction. AskOosu required designing a RAG knowledge architecture, building a FAQ cache routing system, and handling answer evidence, fallback, and feedback logging. Instagram Clone required real relational data modeling, JWT auth, Meilisearch integration, file uploads, and AI feature integration as a solo fullstack project. Sticks & Stones required understanding legacy code enough to rebuild it without losing brand experience.

The supporting projects — early Flutter apps, lab experiments, and learning logs — are visible as growth history but are not being presented as equivalent depth.

**Detailed Answer**

There are two ways to read a portfolio with many projects. The pessimistic read: this person starts things and does not finish them deeply. The accurate read: this person learns by building, and the visible progress tells you the direction and speed of growth.

For Oosu, the honest answer is: some projects in the repository are learning exercises. Pylingo, Javalingo, the early Flutter apps — these show where the learning started, not where it ended. They should not be evaluated as finished products.

The projects that represent real depth are AskOosu, Instagram Clone, and Sticks & Stones. For each:

**AskOosu**: designed the entire knowledge architecture — canonical entities, chunk ID convention, retrieval priority, answer evidence contracts, FAQ routing rules, guardrails, and UI surface registry. This is not a simple chatbot. It is a structured information retrieval and AI answer system built around a specific product purpose.

**Instagram Clone**: built relational data models for users, posts, comments, follows, stories, and search. Connected Spring Boot, PostgreSQL, Redis, JWT, Meilisearch, Cloudinary, and React/Next.js. Added AI features for comment summary, profanity detection, and hashtag suggestion. Debugged cross-layer issues. This is substantive fullstack depth.

**Sticks & Stones**: understood a production company's legacy WordPress site, identified what could be safely replaced, and rebuilt it with Vite + TypeScript while preserving the brand experience. Real-service constraints and client communication are different from personal portfolio constraints.

Three deep projects across different technical domains — AI/RAG, fullstack SNS, and legacy modernization — is a reasonable portfolio for someone who is still growing.

---

### FAQ R-06. Does Oosu have real collaboration experience?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.collaboration_experience.default` |
| Intent ID | `recruiter.collaboration_experience` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `collaboration experience`, `team work`, `협업 경험`, `has Oosu worked in teams`, `can Oosu work with others` |
| Source Chunk IDs | `profile.collaboration`, `project.ez_air.fact`, `career.sticks_and_stones`, `career.gfk`, `career.consulting` |
| Visibility | `public` |

**Short Answer**

Collaboration experience exists across multiple contexts — global account coordination, team-based consulting, a UX contract project, and a multi-person web development project. The portfolio projects lean solo, but cross-functional collaboration is a real pattern in the career history.

**Default Answer**

Oosu's portfolio projects are mostly solo, which can make the collaboration evidence less immediately visible.

But the career history tells a different story. At GfK Korea, Oosu worked with Samsung Electronics global accounts, coordinating data delivery, reporting, and communication across internal teams and client stakeholders. At JW CRONY, Oosu was involved in overseas installation and maintenance coordination across different technical and operational teams. As an external consultant at Taeyoung Tech and Davit Inc., Oosu worked across business, operations, and strategy teams — the kind of work that requires being useful to people with different expertise and different priorities.

In development specifically, EZ Air is the most direct evidence: a team web project where Oosu pushed the AI-connected direction, guided Git workflow and merging, and contributed to UI/animation and API integration alongside teammates. Sticks & Stones was a contract role — working with a client's expectations, constraints, and brand requirements.

**Detailed Answer**

Three areas of collaboration experience stand out.

First, **cross-functional business collaboration**. GfK Korea's global POS data work required coordinating with Samsung Electronics account stakeholders, internal analysts, and international office contacts. The consulting work at Taeyoung Tech and Davit Inc. involved working with leadership teams on strategy and process — which requires listening well, framing recommendations clearly, and navigating disagreement about direction.

Second, **client and stakeholder collaboration in UX and development**. Sticks & Stones was a contract project with a real client. Oosu was responsible for understanding the client's goals, constraints, and brand expectations — then translating those into technical and UX decisions. That relationship required more than technical skill; it required communication, judgment, and managing expectations.

Third, **team-based development collaboration**. EZ Air was the most development-team-specific example. Oosu contributed to direction-setting (pushing toward AI-connected features when the team leaned toward a simpler approach), managed Git workflow and merge conflicts, and worked across UI, animation, and API integration alongside teammates. That included the harder social dynamics of advocating for a direction that was not the team's initial preference.

The honest gap is: most of Oosu's recent development work has been solo, partly because the portfolio projects were designed to show individual capability. Growing into strong team-based development is an ongoing area — Oosu communicates this directly rather than overstating the current team experience.

---

### FAQ R-07. Front, back, AI — is Oosu's positioning too vague?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.role_ambiguity.default` |
| Intent ID | `recruiter.role_ambiguity` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Role ambiguity`, `what role is Oosu`, `frontend or backend`, `포지션이 애매하지 않나`, `프론트백AI 다 한다고 하는데`, `generalist vs specialist` |
| Source Chunk IDs | `profile.current_focus`, `career.target_role`, `tech_stack.main`, `profile.strengths` |
| Visibility | `public` |

**Short Answer**

Breadth is intentional in Oosu's current stage, not a sign of indecision. The clearest positioning is: AI-connected fullstack, with a bias toward the product/UX side and a growing backend/data foundation. This is not "I can do anything." It is "I connect layers, and I care about the user problem."

**Default Answer**

This is a real positioning question and worth answering directly. Oosu is not presenting as a frontend specialist, a backend engineer, or an ML researcher. The honest position is: AI-connected fullstack developer — someone who can build across the stack and understands how user experience, data, and AI generation connect into one service.

That is not the same as "I do everything at surface level." It means Oosu is strong at integration — the connective tissue between layers — and is still building depth in specialized areas like backend systems and data pipelines.

For some roles, this is exactly right: teams that need someone who can take a feature from idea to working system, or who can design a product architecture that spans frontend, API, and AI tooling. For roles that need a deep specialist in one narrow area, Oosu is not the strongest match.

**Detailed Answer**

The positioning question gets harder to answer without context about the role. So the most useful answer is to describe where the strength actually sits.

Oosu's strongest integration layer is: user-facing experience (frontend, UX, interaction design) connected to data/API/AI logic. That is where AskOosu lives — the product thinking, the chat UI design, the RAG architecture, the answer quality system. It is also where Instagram Clone lives — the social product structure, the search and upload flows, the AI-assisted content features.

On the backend, Oosu can build REST APIs, work with relational databases, design data schemas, and connect authentication and search. This is real, but it is building depth, not established expertise.

On the AI/tooling side, Oosu is ahead of most generalists: designing retrieval systems, building FAQ caching and routing, writing guardrails for answer quality, and structuring feedback loops are not typical "I added an API call to OpenAI" level usage.

In recruiting terms: Oosu fits best in a team where the connection between product/UX thinking and technical implementation is valued, and where AI/data is becoming part of the product. That is the clearest, most honest position — not "I do everything," but "I connect things and I care about what the product actually does."

---

### FAQ R-08. What are Oosu's real weaknesses or risks?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.weaknesses_risks.default` |
| Intent ID | `recruiter.weaknesses_risks` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Weaknesses`, `risks of hiring Oosu`, `단점이 뭔가`, `risks`, `honest weaknesses`, `what should I worry about` |
| Source Chunk IDs | `profile.growth_areas`, `profile.work_style`, `career.timeline`, `tech_stack.main` |
| Visibility | `public` |

**Short Answer**

Three honest weaknesses: finishing discipline (strong on structure, improving on completion criteria), backend/data depth (still building), and limited team-based development experience at scale.

**Default Answer**

Three are worth naming directly.

First, **finishing scope**. Oosu is strong in early planning, architecture, and structure — but broad interests can cause scope to expand before a clear finish line is defined. This is improving: AskOosu was specifically designed with fewer features and clearer completion criteria after Portfoli-Oh! became too feature-heavy. But it is an honest tension to watch.

Second, **backend and data depth**. Spring Boot and PostgreSQL are being built through project work, but Oosu is not a backend engineer with five years of production systems experience. For roles that need that depth from day one, this is a real gap.

Third, **team-based development experience**. Most recent development work has been solo or in small-contract contexts. Growing into strong async collaboration, pull request culture, code review discipline, and shared ownership of a codebase is still in progress.

**Detailed Answer**

Honest weakness answers require separating "things I am aware of and working on" from "things that might surprise a hiring team."

**Things Oosu is actively working on:**
- Finishing discipline: setting completion criteria before starting, separating "must have" from "later." Evidence of improvement: AskOosu's more focused scope compared to Portfoli-Oh!
- Backend/data depth: KOSA course, Instagram Clone backend work, and ongoing practice. Still growing, not yet senior-level.

**Things that might surprise a hiring team:**
- Team-scale development: PR review culture, async communication on shared codebases, and ownership within a larger technical team are not well-evidenced in the current portfolio. Solo projects are designed to show individual capability; they do not fully demonstrate team-based development maturity.
- Coding test performance: Oosu is practicing algorithm/data structure problems but does not have the kind of competitive programming background that top technical interviews sometimes expect. This is a real risk for companies with highly selective coding screens.

**Things that are risks worth naming but not necessarily blockers:**
- Career diversity can look unfocused. The narrative framing (business → data → UX → AI dev) makes sense in context, but a fast-read recruiter might see scattered experience.
- Entrepreneurial orientation means Oosu is motivated by product problems and ownership, which is great in the right environment and a mismatch in highly execution-only roles.

The goal of stating these directly is that a hiring team that knows these risks can assess whether they are blockers for this specific role — rather than discovering them post-hire.

---

### FAQ R-09. What kind of role should Oosu be given?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.role_recommendation.default` |
| Intent ID | `recruiter.role_recommendation` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `What role should Oosu have`, `What job fits Oosu`, `지금 채용하면 어떤 일을 맡기면 좋은가`, `what position is right`, `best role for Oosu` |
| Source Chunk IDs | `career.target_role`, `profile.strengths`, `profile.current_focus`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

Best fit: AI application development, fullstack web service development, or product/AI engineering roles where connecting user problems to implementation is the core work. Not yet: deep infrastructure engineering or highly specialized ML research.

**Default Answer**

The roles where Oosu is most likely to contribute well from early on are those where the job is to connect user-facing product experience with data, API, and AI logic — not to specialize deeply in a single technical layer.

Concretely: AI-powered feature development, internal tool building, conversational product design, RAG/search system development, or fullstack web application work where the scope spans from UI to data. Roles where business context, UX thinking, and implementation are all part of the job.

The roles where Oosu is not yet the strongest fit: production infrastructure engineering, deep ML model development, or roles requiring specialized domain expertise (e.g., embedded systems, low-level networking).

**Detailed Answer**

Here is a structured view of role fit.

**High fit (early contributor):**
- AI application developer — connecting LLM/RAG capabilities to a real product surface
- Fullstack web developer on a product team — owning features from UI to API to database
- AI-PM hybrid or product-facing engineer — problem definition + implementation
- Internal tooling / knowledge management developer — search, retrieval, structured information products
- Junior fullstack with AI tooling scope — Oosu's real level, where expectations and capability are well-matched

**Moderate fit (will grow into quickly):**
- Backend-focused roles with Spring Boot and PostgreSQL
- Data engineering adjacent work (pipeline, processing, product analytics)
- Developer-facing documentation and DX tooling

**Lower fit (honest mismatch):**
- Deep infrastructure / DevOps / SRE — not enough systems operations background
- ML research / model training — not the current direction
- Narrow specialist execution roles with no product context — Oosu needs to understand the "why" to stay engaged

One practical hiring recommendation: give Oosu a problem with real user and product context, and evaluate how they approach it — not just the code, but the framing and judgment. That will show the collaboration and product-thinking value more clearly than a standard algorithm screen.

---

### FAQ R-10. Is Oosu a non-traditional developer worth the risk?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.career_switcher_value.default` |
| Intent ID | `recruiter.career_switcher_value` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `non-traditional developer`, `career switcher`, `커리어 전환 개발자`, `is it worth hiring a career changer`, `비전공 전환 개발자 리스크` |
| Source Chunk IDs | `profile.long_intro`, `career.transition`, `profile.strengths`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

Career-switcher developers carry more context about what software is supposed to do. The risk is real on raw technical depth in some areas. The upside is proportionally real on product judgment, user empathy, and cross-functional communication.

**Default Answer**

Career-switcher developers are a meaningful risk on technical depth — they do not have the early repetitions that CS students get from coursework and internships. That gap is real.

But the portfolio shows what those years actually built instead: customer behavior research, market analysis, POS data processing, brand strategy, service operations, UX design. These are not soft skills bolted onto a technical resume — they are the inputs to good product thinking.

In practice, this means Oosu tends to ask "what problem does this solve and for whom?" before "what is the most technically elegant way to build this?" That is not always a strength — sometimes you need someone to just ship clean code fast. But in product environments where the connection between user need and implementation matters, this is a real differentiator.

The honest hiring calculus: if the role requires deep technical seniority from day one, there are stronger candidates. If the role values product judgment, learning speed, cross-functional communication, and AI-augmented development alongside growing technical skill, Oosu is a competitive candidate.

---

### FAQ R-11. How does Oosu handle pressure, ambiguity, or unclear requirements?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.ambiguity_handling.default` |
| Intent ID | `recruiter.ambiguity_handling` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Ambiguity`, `unclear requirements`, `how does Oosu handle pressure`, `압박이나 불확실한 요구사항`, `working without clear direction` |
| Source Chunk IDs | `profile.work_style`, `career.consulting`, `career.oosu_salon`, `profile.collaboration` |
| Visibility | `public` |

**Short Answer**

Oosu's default response to ambiguity is structure: define what is known, surface what is unknown, and find a workable starting point. This comes from years of work where requirements were not handed down from a spec — they had to be built from customer behavior, market data, and operational reality.

**Default Answer**

Ambiguity is familiar territory. Consulting work at Taeyoung Tech and Davit Inc. required making recommendations with incomplete information — where the client's actual problem was often different from what they initially described. OOSU SALON was five years of operating without a product manager or engineering team. These experiences trained a tolerance for "figure it out" rather than "wait for the spec."

In development, Oosu's response to unclear requirements is to start from the user problem: who is confused, where is friction, what would success look like? Then structure that into options with tradeoffs before committing to implementation. This is slower than just building something immediately, but it tends to reduce the cost of rework later.

**Detailed Answer**

Handling ambiguity well depends on distinguishing between three different kinds of unclear:

1. **Unclear because the problem itself is not well-defined.** Oosu's approach: use business/UX framing to define the problem before building. Go upstream — ask who the user is, what they are trying to do, and what a successful outcome looks like. This came from consulting and customer research work.

2. **Unclear because the technical path is uncertain.** Oosu's approach: start from what is known, prototype quickly, and evaluate rather than over-planning. AskOosu's RAG architecture went through multiple design decisions — what format for chunks, how to route between FAQ cache and RAG, how to handle fallback — that were resolved by building, testing, and revising.

3. **Unclear because of organizational ambiguity — unclear ownership, shifting priorities, or conflicting direction.** Oosu's approach: surface the ambiguity explicitly, propose a working assumption, and check. In EZ Air, when the team had different ideas about the product direction, Oosu advocated clearly for the AI-connected approach with reasoning rather than either deferring or steamrolling.

Under deadline pressure, the risk is scope expansion — starting too broad and not narrowing fast enough. Oosu has identified this and is actively practicing "lock the scope early, build the hardest thing first."

---

### FAQ R-12. Can Oosu grow into a senior or leadership role over time?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.growth_potential.default` |
| Intent ID | `recruiter.growth_potential` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Growth potential`, `will Oosu become senior`, `성장 가능성`, `leadership potential`, `can Oosu grow` |
| Source Chunk IDs | `profile.strengths`, `career.timeline`, `profile.values`, `profile.current_focus` |
| Visibility | `public` |

**Short Answer**

The indicators are positive: Oosu learns fast, has initiative, takes product ownership seriously, and has led complex work without a manager in multiple contexts. Whether that translates to technical leadership depends on how fast the backend/systems depth grows.

**Default Answer**

Career switchers sometimes grow faster than traditional-track developers because they arrive with more context about what software is for. The ability to define a problem, prioritize features, communicate across functions, and keep quality high under constraints — these come from having operated in non-engineering environments where no one else was going to handle it.

Oosu has shown this in multiple settings: OOSU SALON as a solo operator of a real service; consulting engagements where the deliverable was strategy under ambiguity; AskOosu where Oosu designed and built the full architecture without external direction.

The honest caveat: technical leadership requires proven depth in systems, architecture, and reliability engineering over time. That is still being built. The growth potential is real; the timeline to senior technical leadership is longer than for someone who started in CS and has been coding for seven years.

---

### FAQ R-13. How does Oosu's business background actually show up in code?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.business_in_code.default` |
| Intent ID | `recruiter.business_in_code` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Business background in code`, `how does UX help development`, `비즈니스 경험이 개발에서 어떻게 나타나나`, `does the business background actually matter` |
| Source Chunk IDs | `profile.long_intro`, `career.oosu_salon`, `project.sticks_and_stones.fact`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

It shows up in how features are defined, how user flows are structured, and where quality bar gets set — not just whether the code compiles.

**Default Answer**

The clearest example is AskOosu's guardrail system. Before writing a single line of answer-generation code, Oosu defined what the system should never say — invented metrics, private repository links, unfinished information presented as complete, first-person impersonation. This is not a technical pattern. It is a product judgment about what a user (in this case, a recruiter or engineer visiting the portfolio) would find trustworthy versus misleading.

In Sticks & Stones, the client's constraint was: keep the brand recognizable while modernizing the technical foundation. The business judgment — which elements were brand-critical versus technically convenient — shaped the implementation decisions. That came from understanding what brand experience means to the people who operate a service, not just from reading CSS.

In Instagram Clone, the AI feature choices (comment summary, profanity detection, hashtag suggestion) were selected because they solve real friction points in social content — not because they were the most technically interesting AI features to implement.

---

### FAQ R-14. What kind of team and company environment brings out Oosu's best work?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.ideal_environment.default` |
| Intent ID | `recruiter.ideal_environment` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `Ideal environment`, `team fit`, `어떤 환경에서 잘하는가`, `company culture fit`, `what kind of team` |
| Source Chunk IDs | `profile.work_style`, `profile.values`, `career.target_role`, `profile.current_focus` |
| Visibility | `public` |

**Short Answer**

Environments where the product problem is real, where cross-functional input is valued, and where growth and responsibility are connected to contribution. Not: narrowly defined execution roles where the "why" is not accessible.

**Default Answer**

Oosu works best in environments where there is a real user problem to solve and where the engineering team is close enough to that problem to understand why decisions matter. That is not just about product-engineering collaboration philosophy — it is about motivation. Oosu needs to understand what the work is for to do it well.

Autonomy matters: Oosu is strongest when trusted to define how to approach a problem, not just execute a fixed spec. This comes from years of self-directed work in consulting, entrepreneurship, and solo project development.

Small-to-mid-size teams tend to be a better fit than large teams with highly specialized roles — at least at this career stage. Oosu's value is cross-layer integration; that is more visible and more useful in environments where one person is expected to touch multiple layers.

**Detailed Answer**

Four environmental factors that correlate with Oosu's best work:

1. **Real user problems in the product.** Not "maintain this internal tool" or "implement this spec" — but "here is a problem our users have, figure out how to solve it." Oosu's product thinking and UX instinct are most useful when the design space is open enough to apply them.

2. **AI and data as first-class product concerns.** AI tooling is a genuine area of strength and genuine interest. Environments that treat AI as a bolt-on feature will underuse this. Environments where AI/data is central to the product value are where Oosu will grow fastest.

3. **Responsibility that grows with contribution.** Not just seniority by tenure, but responsibility that expands as work quality demonstrates it. Oosu is motivated by ownership. Fixed-scope roles with low ceiling do not sustain engagement.

4. **Cross-functional communication as a valued skill.** Teams where the engineering/product/business boundary is low — where developers are expected to understand user needs and stakeholders are expected to understand technical tradeoffs — match Oosu's communication style well.

Anti-patterns: very large teams where individual contribution is invisible, roles where the spec is fully locked before implementation starts, and organizations where AI tools are actively discouraged.

---

### FAQ R-15. If we hire Oosu, what are the first questions Oosu would ask?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.onboarding_questions.default` |
| Intent ID | `recruiter.onboarding_questions` |
| Entity ID | `recruiter` |
| Cache Mode | `direct_cache` |
| Patterns | `First questions Oosu would ask`, `onboarding style`, `입사 첫 날 어떤 질문을 할까`, `what does Oosu want to understand first` |
| Source Chunk IDs | `profile.work_style`, `profile.collaboration`, `profile.process` |
| Visibility | `public` |

**Short Answer**

Oosu would start by understanding: who the user is and what problem they have, how the team currently measures whether the product is working, and what the hardest unsolved problem in the product is right now.

**Default Answer**

On day one, Oosu's instinct is to understand context before contributing. The specific questions would be:

- Who is the actual user, and what does their experience with this product look like today?
- What is the team most proud of shipping recently, and what did not go as planned?
- Where is the friction in the current product — what do users complain about, and what does the team know they need to fix?
- What does "a good contribution" look like in the first 90 days here?
- How does engineering interact with product and design — is there a spec, or is there a problem to solve?

These are not softballs. They reflect a pattern: Oosu wants to understand the real situation, not just get the official onboarding version of it.

---

## 15. Question Surface Registry — v12 Extension

### New Surface: `recruiter_defense`

> This surface is shown when the user is identified as a recruiter/hiring manager OR when they ask a question that signals evaluation intent.

| Priority | Quick label | Display question | FAQ ID | Answer variant | RenderSpec |
| --- | --- | --- | --- | --- | --- |
| 1 | `Retention risk` | `Will Oosu stay long-term, or leave once they've learned enough?` | `faq.recruiter.retention_risk.default` | `default` | `recruiter_honest_card` |
| 2 | `Startup concern` | `If Oosu wants to found a company, won't they leave?` | `faq.recruiter.startup_intent.default` | `default` | `recruiter_honest_card` |
| 3 | `Developer depth` | `Is Oosu deep enough as a developer, given the non-CS background?` | `faq.recruiter.depth_concern.default` | `default` | `recruiter_honest_card` |
| 4 | `AI dependency` | `If Oosu uses AI so heavily, is the underlying skill actually there?` | `faq.recruiter.ai_dependency.default` | `default` | `recruiter_honest_card` |
| 5 | `Project depth` | `Are there too many projects without real depth?` | `faq.recruiter.project_breadth_vs_depth.default` | `default` | `recruiter_honest_card` |
| 6 | `Collaboration` | `Does Oosu have real collaboration experience?` | `faq.recruiter.collaboration_experience.default` | `default` | `recruiter_honest_card` |
| 7 | `Role fit` | `Front, back, AI — isn't the positioning too vague?` | `faq.recruiter.role_ambiguity.default` | `default` | `recruiter_honest_card` |
| 8 | `Real weaknesses` | `What are Oosu's honest weaknesses and risks?` | `faq.recruiter.weaknesses_risks.default` | `default` | `recruiter_honest_card` |
| 9 | `Role recommendation` | `What role should Oosu actually be given?` | `faq.recruiter.role_recommendation.default` | `default` | `thirty_day_plan_timeline` |
| 10 | `Career-switcher value` | `Is a non-traditional developer worth the hiring risk?` | `faq.recruiter.career_switcher_value.default` | `default` | `recruiter_honest_card` |
| 11 | `Ambiguity handling` | `How does Oosu handle pressure and unclear requirements?` | `faq.recruiter.ambiguity_handling.default` | `default` | `recruiter_honest_card` |
| 12 | `Growth potential` | `Can Oosu grow into a senior or leadership role?` | `faq.recruiter.growth_potential.default` | `default` | `recruiter_honest_card` |
| 13 | `Best environment` | `What kind of team and environment brings out Oosu's best work?` | `faq.recruiter.ideal_environment.default` | `default` | `collaboration_fit_card` |
| 14 | `First 30 days` | `How could Oosu contribute in the first 30 days?` | `faq.recruiter.first_30_days.default` | `default` | `thirty_day_plan_timeline` |
| 15 | `Day-one questions` | `What would Oosu ask first after joining?` | `faq.recruiter.onboarding_questions.default` | `default` | `recruiter_honest_card` |

### Display Logic for `recruiter_defense` surface

```text
Trigger conditions for recruiter_defense surface:
- User self-identifies as recruiter, hiring manager, or interviewer
- User asks any of the recruiter defense FAQ patterns
- User asks a question containing: "hire", "stay", "risk", "depth", "leave", "weakness", "position"

When recruiter_defense is active:
- Show 5 most relevant recruiter questions based on conversation context
- Suppress casual/fun questions from other surfaces
- All answers should be returned at `default` or `detailed` variant (not `short`)
- Add a subtle "Recruiter view" mode indicator in the UI if supported
```

---

## 16. Rich Answer Rendering — v12 Extension

### New RenderSpec: `recruiter_honest_card`

| Component | Content |
| --- | --- |
| Header | Question label + "Honest answer" badge |
| Body | Three-part structure: Concern acknowledged → What the evidence shows → Honest condition or caveat |
| Footer | Optional: "Ask about a specific project" or "See collaboration style" follow-up chip |
| Tone badge | `honest_assessment` (distinct from `faq_cache` or `rag_generation`) |

This component is specifically designed so that answers do not feel like PR. The visual design should reinforce that these are calibrated, honest assessments — not marketing copy.

---

## Open TODO — v12 Additions

| Priority | TODO |
| --- | --- |
| 0 | Integrate recruiter defense FAQ IDs into `data/faq-answers.en.ts` |
| 0 | Register `recruiter_defense` surface in `data/question-surfaces.en.ts` |
| 1 | Build `RecruiterHonestCard.tsx` component in `components/chat/rich/` |
| 1 | Add recruiter surface trigger detection logic to `/api/chat` routing |
| 2 | Add Korean equivalents in `notion-wiki-draft-v12-ko-add.md` |
| 2 | Add `faq.recruiter.business_in_code.default` and `faq.recruiter.ideal_environment.default` to KO bank |
| 3 | Evaluate recruiter FAQ answer quality with mock recruiter questions |
