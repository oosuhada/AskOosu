# AskOosu Notion Wiki — v12 EN ADD
## Recruiter Risk / Interview Objection Answer Bank

> Purpose: This add-on file helps AskOosu handle sharp recruiter, interviewer, founder, and collaborator questions as serious hiring-risk questions instead of casual off-topic fallback.
> Recommended use: Do not replace the existing `v11 EN` canonical wiki. Add this as a separate Notion/RAG source page, then merge it into the FAQ cache and retrieval index.
> Core direction: Acknowledge the concern, avoid over-defensive claims, explain the condition behind the risk, and support the answer only with public portfolio evidence.

---

## 0. Why this should be an add file, not a full v12 rewrite

The v11 wiki already contains the main portfolio narrative, FAQ/model answer cache, RAG rules, answer guardrails, and rich answer rendering structure. A full v12 rewrite would increase the risk of duplicate facts, stale fields, and conflicting instructions.

This file should work as a **high-risk interview question answer bank** layered on top of v11.

### Recommended structure

```text
docs/wiki/
  notion-wiki-draft-v11-ko.md
  notion-wiki-draft-v11-en.md
  notion-wiki-draft-v12-ko-add-recruiter-risk.md
  notion-wiki-draft-v12-en-add-recruiter-risk.md
```

### Recommended routing

```text
1. user question
2. language detection
3. safety / privacy filter
4. recruiter-risk intent matcher
5. FAQ/model answer cache
6. RAG search for evidence
7. Groq rewrite or synthesis only when needed
8. final answer with source/confidence badge
```

Questions in this file should have higher priority than general casual fallback. For example, “Will Oosu leave quickly?”, “Is Oosu too dependent on AI?”, “Does Oosu lack CS depth?”, and “Is this portfolio too shallow?” are not casual detours. They are hiring judgment questions.

---

## 1. Recruiter Risk Intent Definition

| Field | Content |
| --- | --- |
| Intent Group | `recruiter_risk` |
| Audience | recruiter, hiring manager, engineer interviewer, founder, collaborator |
| Cache Priority | high |
| Recommended Cache Mode | `direct_cache` for short/default answers, `faq_rewrite` for nuanced follow-ups |
| RAG Role | Use RAG to add project evidence, not to invent new personal claims |
| Answer Tone | calm, honest, recruiter-safe, not defensive |
| Default Perspective | third person English: “Oosu…” |
| Default Length | 3-5 short paragraphs for risk questions |
| Avoid | “Oosu will never leave,” “Oosu has no founder mindset,” “That concern is completely wrong” |
| Prefer | “That is a fair concern,” “There is a real reason someone might read it that way,” “The better question is…” |

---

## 2. Answer Strategy for Risk Questions

### 2-1. Ideal Answer Shape

1. **Acknowledge the concern**
   “That is a fair concern, and there is a real reason someone might read it that way.”

2. **Define the risk precisely instead of denying it**
   “Oosu is not the type who thrives in a narrow, repetitive role for a long time.”

3. **Explain the condition**
   “If the role has no product context, no ownership, and no room to connect learning to output, it may not be the best fit.”

4. **Ground the answer in evidence**
   “The portfolio shows a pattern of connecting UI, API, data, AI, deployment, and user experience into working products.”

5. **Reframe the evaluation criteria**
   “The more useful question is not whether Oosu can be locked into a company, but what kind of problem Oosu can own responsibly.”

### 2-2. Bad Fallback Examples

| Bad Answer | Why it is bad |
| --- | --- |
| “That is a fun detour, but let’s stay on the portfolio.” | Treats a real hiring concern as casual chatter. |
| “Oosu will definitely stay for a long time.” | Sounds like an unverifiable promise. |
| “Oosu has no interest in founding anything.” | Unnaturally denies the founder-like pattern shown in the portfolio. |
| “Let’s return to projects and tech stack.” | Avoids the interviewer’s actual question. |
| “Oosu is strong in everything.” | Makes the depth concern worse. |

---

## 3. High-Risk FAQ / Model Answer Bank

These items do not all need to appear as visible starter questions. Most should be hidden matching targets that activate only when the user directly asks.

---

### FAQ R1. Is Oosu likely to stay long-term?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.retention.default` |
| Intent ID | `recruiter_risk.retention` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Will Oosu stay long?`, `Is Oosu a retention risk?`, `Will he leave quickly?`, `Will Oosu just learn and leave?`, `Does Oosu seem hard to retain?` |
| Source Chunk IDs | `profile.work_style`, `profile.growth_areas`, `career.target_role`, `project.askoosu.fact`, `project.instagram_clone.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

That is a fair concern. Oosu may not be the best fit for a very narrow or repetitive role, but that does not mean he is simply looking to learn and leave. The stronger read is that he stays engaged when he can own meaningful problems that connect product, users, technology, and execution.

**Default Answer**

That is a fair concern, and there is a real reason someone might read it that way.

Oosu is closer to someone who wants to turn learning into working products and systems than someone who wants to stay in a narrow repetitive task forever. If the role has little ownership, little product context, and no room to connect learning to output, he may feel constrained.

But that does not mean “he will just learn and leave.” The portfolio shows a pattern of taking broad inputs and turning them into concrete outputs: UI, APIs, databases, AI workflows, deployment, and user-facing explanations. In a company where those responsibilities matter, he has more reason to stay engaged and contribute over time.

The better question is not “Can we lock this person in?” but “What kind of problem can this person own responsibly, and does our team’s direction match that motivation?”

**Do Not Say**

- “Oosu will never leave quickly.”
- “There is no retention risk at all.”
- “Oosu has no startup or founder-like interest.”

---

### FAQ R2. If Oosu has a founder mindset, will he fail to focus on the company?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.founder_mindset.default` |
| Intent ID | `recruiter_risk.founder_mindset` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Will Oosu leave to start a company?`, `Does a founder mindset make him risky?`, `Will he focus on his own product instead of work?`, `Is entrepreneurship a distraction?` |
| Source Chunk IDs | `career.oosu_salon.fact`, `profile.work_style`, `profile.values`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The founder-like mindset is a risk only if the role expects passive execution. In a product-minded team, it can be an advantage because Oosu naturally thinks about users, operations, business context, and end-to-end delivery.

**Default Answer**

That concern is understandable. Oosu’s background does show a founder-like pattern: he has operated a business, shaped customer experience, and built personal products with a clear service angle.

But the useful interpretation is not “he will be distracted by founding.” It is that he tends to care about the full product loop: problem, user experience, implementation, operation, and feedback. That can be a strong fit for a team that wants developers who understand why a feature matters, not just how to implement it.

The risk appears when a company wants only task execution with no context or ownership. The strength appears when a company needs someone who can connect engineering work to product and user value.

**Do Not Say**

- “Oosu has no interest in starting anything.”
- “Founder mindset is always a strength.”
- “There is no possible focus risk.”

---

### FAQ R3. As a non-CS or career-transition developer, does Oosu lack depth?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.non_cs_depth.default` |
| Intent ID | `recruiter_risk.non_cs_depth` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Is Oosu too non-technical?`, `Does he lack CS fundamentals?`, `Is a business major deep enough as a developer?`, `Is he just a career changer?` |
| Source Chunk IDs | `profile.education`, `profile.current_focus`, `profile.growth_areas`, `project.instagram_clone.fact`, `project.askoosu.architecture` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu should not be presented as a deep senior specialist yet. A more accurate positioning is an AI-connected fullstack developer who is building depth through real projects, backend/data practice, and RAG architecture while bringing stronger product and user context than a typical junior profile.

**Default Answer**

That is a valid question. Oosu should not be framed as someone with the same depth as a senior CS specialist or a backend engineer with years of production-scale experience.

The stronger positioning is different: he is a career-transition developer who combines business, customer research, UX, frontend, backend, and AI workflow experience, then turns that into working portfolio products. His current technical depth is growing through React, TypeScript, Spring Boot, PostgreSQL, API design, RAG structure, and AI service implementation.

So the honest answer is: there is still room to deepen CS fundamentals and backend/AI engineering discipline, but the portfolio shows more than surface-level interest. It shows a repeated pattern of designing, implementing, testing, and refining service-like systems.

**Do Not Say**

- “Oosu has no technical depth issue.”
- “A CS degree does not matter at all.”
- “Oosu is already senior-level.”

---

### FAQ R4. If Oosu uses AI heavily, does that mean he lacks real skill?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.ai_dependency.default` |
| Intent ID | `recruiter_risk.ai_dependency` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Does Oosu rely too much on AI?`, `Can Oosu code without AI?`, `Is he just prompting?`, `Does AI hide weak fundamentals?` |
| Source Chunk IDs | `profile.ai_augmented_builder`, `profile.work_style`, `project.askoosu.fact`, `project.askoosu.guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AI usage is a real part of Oosu’s workflow, not something to hide. The key distinction is that he uses AI for planning, implementation, debugging, and documentation, while keeping human responsibility for product direction, code review, and final judgment.

**Default Answer**

That is a fair concern, especially for an AI-heavy portfolio. Oosu does use AI tools heavily, and that should not be disguised.

The important distinction is whether AI is replacing judgment or amplifying it. In Oosu’s case, the portfolio direction is not “AI wrote everything.” It is closer to “AI accelerates planning, implementation, debugging, and documentation while Oosu defines what should be built, how the experience should work, and whether the result is acceptable.”

There is still a real responsibility to keep strengthening fundamentals, especially backend, CS, testing, and production engineering. But the AI workflow itself is also a relevant skill now: asking the right questions, reviewing generated code, designing guardrails, and turning vague ideas into working systems.

**Do Not Say**

- “Oosu does not depend on AI at all.”
- “AI use proves higher skill automatically.”
- “Prompting is enough.”

---

### FAQ R5. Are there too many projects but not enough depth?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.project_depth.default` |
| Intent ID | `recruiter_risk.project_depth` |
| Entity ID | `oosu_projects` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Are Oosu's projects shallow?`, `Does he jump between projects?`, `Too many projects but no depth?`, `Which project has real depth?` |
| Source Chunk IDs | `project.askoosu.fact`, `project.askoosu.architecture`, `project.instagram_clone.fact`, `project.sticks_and_stones.fact`, `project.portfolioh.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The concern is reasonable. Some earlier projects are better read as learning milestones, not deep products. The stronger evidence is in AskOosu and the newer fullstack/AI portfolio direction, where Oosu is connecting content architecture, RAG, answer quality, UI, API routes, and evaluation loops.

**Default Answer**

That is a fair criticism to test. Not every project should be weighted equally.

Some earlier projects are best understood as learning milestones: they show progression, experimentation, and increasing technical range. The stronger portfolio evidence comes from projects that connect multiple layers of a product, especially AskOosu and fullstack/RAG-oriented work.

AskOosu is more than a static portfolio because it requires content modeling, intent routing, FAQ cache, RAG retrieval, answer guardrails, frontend chat UX, backend API flow, and evaluation questions. That is where the project depth becomes clearer.

So the best read is not “many shallow projects,” but “a learning path that is becoming more integrated and product-like over time.”

**Do Not Say**

- “Every project is equally deep.”
- “Project count proves skill.”
- “There is no shallow or learning-stage work.”

---

### FAQ R6. Is Oosu's positioning unclear because he does frontend, backend, and AI?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.role_ambiguity.default` |
| Intent ID | `recruiter_risk.role_ambiguity` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Is Oosu frontend or backend?`, `Is Oosu's position unclear?`, `Does fullstack AI sound too broad?`, `What role is Oosu actually targeting?` |
| Source Chunk IDs | `profile.one_line_intro`, `profile.current_focus`, `career.target_role`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The cleanest positioning is not “expert in everything.” It is “AI-connected fullstack developer with strong frontend/product sense, expanding into backend, data, and RAG-based AI services.”

**Default Answer**

That concern makes sense. “Frontend, backend, and AI” can sound unfocused if it is presented as equal expertise in everything.

Oosu’s clearer positioning is: an AI-connected fullstack developer with strong frontend and product sense, now expanding into backend, data, and RAG-based AI services. The center is not “I do everything.” The center is “I connect user-facing experience with service logic and AI workflows.”

That makes him a better fit for product engineering, AI service prototyping, portfolio/product UX engineering, internal tools, and teams that need someone who can move between user problems and implementation.

**Do Not Say**

- “Oosu is equally expert in frontend, backend, AI, and design.”
- “Role ambiguity is not a concern.”
- “Fullstack means everything is solved.”

---

### FAQ R7. What are Oosu's biggest risks or weaknesses?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.weakness.default` |
| Intent ID | `recruiter_risk.weakness` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `What are Oosu's weaknesses?`, `What is risky about hiring Oosu?`, `What should we worry about?`, `What are his growth areas?` |
| Source Chunk IDs | `profile.growth_areas`, `profile.work_style`, `profile.current_focus` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The main risks are breadth, finishing discipline, and technical depth. Oosu has many connected interests and strong early structure, so he needs clear priorities, completion criteria, and technical review to convert that breadth into reliable delivery.

**Default Answer**

The honest risks are breadth, finishing discipline, and technical depth.

Oosu has a strong tendency to connect many things: business, UX, data, AI, frontend, backend, and portfolio storytelling. That is useful for product thinking, but it can also expand scope too quickly unless priorities and completion criteria are clear.

He is also still deepening backend, CS, testing, data, and AI engineering fundamentals. The best environment would not treat him as a finished senior specialist, but as a high-upside builder who can grow quickly with clear ownership, review, and concrete delivery standards.

**Do Not Say**

- “Oosu has no meaningful weaknesses.”
- “His weakness is caring too much.”
- “He is already complete as a developer.”

---

### FAQ R8. What kind of work should Oosu be hired for right now?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.best_assignment.default` |
| Intent ID | `recruiter_risk.best_assignment` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `What should we hire Oosu for?`, `What work fits Oosu?`, `What task should Oosu own?`, `Where can Oosu contribute immediately?` |
| Source Chunk IDs | `profile.current_focus`, `profile.strengths`, `project.askoosu.fact`, `project.sticks_and_stones.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu is best suited for product-facing fullstack or AI service work where user experience, frontend implementation, API flow, content/data structure, and AI-assisted workflows need to connect.

**Default Answer**

A good first assignment would be a product-facing feature or internal tool where the problem is not purely backend infrastructure and not purely visual UI.

Oosu can contribute well when he can connect user flow, interface decisions, API behavior, data/content structure, and AI-assisted workflows. Examples include AI-powered search or chat interfaces, portfolio/product demos, admin or knowledge tools, content/RAG systems, onboarding flows, and service prototypes that need to become usable quickly.

The less ideal first assignment would be a deeply isolated infrastructure task with no product context, or a role where he is expected to behave like a senior backend specialist from day one.

**Do Not Say**

- “Oosu can do any role equally well.”
- “He should immediately own critical infrastructure alone.”
- “Only frontend work fits him.”

---

### FAQ R9. Is Oosu too late because of age or career transition?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.career_transition_age.default` |
| Intent ID | `recruiter_risk.career_transition_age` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Is Oosu too late?`, `Is his career transition too late?`, `Is age a risk?`, `Why switch to development now?` |
| Source Chunk IDs | `profile.long_intro`, `career.oosu_salon.fact`, `profile.development_philosophy`, `profile.current_focus` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The transition is later than a traditional CS graduate path, but it also gives Oosu a broader base in customer research, operations, business, UX, and product thinking. The question is whether the role values that context alongside growing engineering depth.

**Default Answer**

It is true that Oosu is not following the traditional early-CS-graduate path. That should be acknowledged rather than hidden.

The upside is that his previous experience is not unrelated. Customer research, data analysis, business operation, service design, UX, and brand operation all feed into product engineering judgment. He has seen users, operations, and business constraints before approaching development.

The tradeoff is that he must keep building technical depth deliberately. If a team needs a narrow junior engineer with a conventional CS path, he may not be the simplest profile. If a team values product sense, AI workflow, communication, and fast service-building ability, the transition can become an advantage.

**Do Not Say**

- “Age or transition never matters.”
- “Oosu has the same profile as a CS graduate.”
- “Business experience automatically replaces engineering depth.”

---

### FAQ R10. Does Oosu have enough collaboration experience?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.collaboration.default` |
| Intent ID | `recruiter_risk.collaboration` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Can Oosu collaborate?`, `Does he only work alone?`, `Does Oosu have team experience?`, `How does Oosu handle conflict?` |
| Source Chunk IDs | `profile.collaboration_style`, `career.gfk.fact`, `career.jw_crony.fact`, `project.ez_air.fact`, `project.sticks_and_stones.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu has collaboration experience across business, client work, operations, UX, and team projects. The engineering-team context is still growing, but his cross-functional communication base is stronger than a purely solo portfolio might suggest.

**Default Answer**

The portfolio includes many solo or self-directed projects, so this is a reasonable question.

Oosu’s collaboration background is broader than pure engineering collaboration. He has worked with global accounts, clients, service operations, consulting contexts, and project teams. That gives him practice translating between business goals, user needs, and execution constraints.

In software engineering teams, he is still building more direct experience. But his strength is likely to be cross-functional communication: understanding why a feature matters, organizing messy requirements, and connecting design/product language with implementation language.

**Do Not Say**

- “Solo projects prove collaboration.”
- “Oosu has no collaboration risk.”
- “He has senior engineering-team experience unless verified.”

---

### FAQ R11. Does Oosu struggle with finishing projects?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.finishing.default` |
| Intent ID | `recruiter_risk.finishing` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Does Oosu finish things?`, `Does he lose focus near the end?`, `Does he over-plan?`, `Can he ship?` |
| Source Chunk IDs | `profile.work_style`, `profile.growth_areas`, `project.sticks_and_stones.fact`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Finishing discipline is a real growth area. Oosu is strong in early structure and system thinking, and he improves delivery quality when completion criteria, priority boundaries, and review loops are defined upfront.

**Default Answer**

Yes, finishing discipline is a real point to watch.

Oosu tends to be strong in early structure, product direction, and connecting many parts of a system. The risk is that scope can expand if the definition of done is not clear enough.

The practical solution is not to avoid giving him responsibility. It is to define completion criteria, priority boundaries, and review checkpoints early. In that kind of setup, his planning strength can convert into shipped output rather than endless expansion.

**Do Not Say**

- “Oosu always finishes perfectly.”
- “He never over-scopes.”
- “Finishing is not an issue.”

---

### FAQ R12. What is the strongest evidence that Oosu can be trusted as a developer?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.developer_trust.default` |
| Intent ID | `recruiter_risk.developer_trust` |
| Entity ID | `oosu_projects` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Why trust Oosu as a developer?`, `What proves Oosu can build?`, `What is the strongest technical evidence?`, `Is this portfolio credible?` |
| Source Chunk IDs | `project.askoosu.fact`, `project.instagram_clone.fact`, `project.sticks_and_stones.fact`, `profile.current_focus` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The strongest evidence is not one isolated technology. It is the repeated pattern of turning vague service ideas into working systems that combine UI, logic, data/content structure, AI workflow, and user-facing explanations.

**Default Answer**

The strongest evidence is the pattern across projects, not a single claim.

Oosu’s portfolio shows a move from interactive frontend work to fullstack and AI-connected service building. AskOosu is especially relevant because it requires more than a static page: content modeling, retrieval strategy, FAQ cache, answer guardrails, chat UI, backend API decisions, and evaluation loops.

This does not prove senior-level production depth by itself. But it does show a credible builder profile: someone who can define a product problem, structure the system, use modern tools, and keep improving answer quality and user experience.

**Do Not Say**

- “The portfolio proves everything.”
- “One project proves senior-level ability.”
- “Trust is guaranteed.”

---

### FAQ R13. Does Oosu's business experience actually help development?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.business_to_dev.default` |
| Intent ID | `recruiter_risk.business_to_dev` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Does business experience help?`, `Is previous career relevant?`, `How does customer research connect to development?`, `Is OOSU SALON relevant?` |
| Source Chunk IDs | `profile.development_philosophy`, `career.gfk.fact`, `career.oosu_salon.fact`, `profile.strengths` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

It helps most in product judgment: understanding users, service flow, operational constraints, and business context. It does not replace engineering depth, but it makes Oosu better at building software that is tied to real user and service problems.

**Default Answer**

Business experience helps when it is connected to product decisions, not when it is used as a substitute for engineering skill.

Oosu’s background in customer research, data analysis, service operation, brand experience, and UX gives him a stronger sense of why a feature matters, what users actually experience, and how service details affect trust.

That does not replace technical fundamentals. But it can make him valuable in product-facing engineering roles where a developer needs to understand not only implementation, but also users, context, and the business reason behind a feature.

**Do Not Say**

- “Business experience is the same as engineering experience.”
- “Technical depth is less important.”
- “All previous experience directly proves developer skill.”

---

### FAQ R14. What is Oosu technically weakest at right now?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.technical_gap.default` |
| Intent ID | `recruiter_risk.technical_gap` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `What is Oosu weak at technically?`, `What technical gaps does Oosu have?`, `Is backend depth enough?`, `What should Oosu improve?` |
| Source Chunk IDs | `profile.growth_areas`, `profile.current_focus`, `project.askoosu.architecture` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The main technical growth areas are backend depth, CS fundamentals, testing, production reliability, and AI/RAG evaluation discipline. Oosu is actively building those areas through fullstack and AI-connected projects.

**Default Answer**

The most honest answer is backend and production engineering depth.

Oosu has strong product and frontend sensibility and is expanding into fullstack and AI service work, but he should keep strengthening CS fundamentals, backend architecture, testing, observability, security, deployment reliability, and RAG evaluation.

That gap does not make the portfolio weak. It clarifies the right role: high-upside product/AI fullstack developer, not finished senior infrastructure specialist.

**Do Not Say**

- “There are no technical gaps.”
- “AI removes the need for fundamentals.”
- “Oosu is already production-senior in every layer.”

---

### FAQ R15. Does the portfolio look like AI packaging rather than real ability?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.ai_packaging.default` |
| Intent ID | `recruiter_risk.ai_packaging` |
| Entity ID | `oosu_projects` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Is this just AI packaging?`, `Is the portfolio over-branded?`, `Is AskOosu more concept than substance?`, `Is it just a chatbot wrapper?` |
| Source Chunk IDs | `project.askoosu.fact`, `project.askoosu.architecture`, `profile.ai_augmented_builder`, `project.portfolioh.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

That risk exists if AskOosu is treated only as a shiny chatbot. The stronger version is a knowledge-backed portfolio system with content architecture, intent routing, cached answers, RAG retrieval, guardrails, and evaluation loops.

**Default Answer**

That is a useful criticism. An AI portfolio can easily become a wrapper if it only shows a chat interface with vague answers.

The stronger direction for AskOosu is to make the system verifiable: language-specific wiki sources, FAQ/model answer cache, intent routing, RAG retrieval, answer guardrails, source/confidence badges, and evaluation questions. In that form, the project is not just “AI packaging.” It becomes a practical demonstration of AI product design and answer-quality engineering.

The key is to keep improving evidence, testing, and failure handling so the product feels trustworthy rather than flashy.

**Do Not Say**

- “It cannot be seen as AI packaging.”
- “A chatbot alone is enough.”
- “AI branding proves technical depth.”

---

### FAQ R16. Are the projects production-ready?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.production_readiness.default` |
| Intent ID | `recruiter_risk.production_readiness` |
| Entity ID | `oosu_projects` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Are these production-ready?`, `Are Oosu's projects real services?`, `Can these run in production?`, `Are they portfolio-only?` |
| Source Chunk IDs | `project.sticks_and_stones.fact`, `project.askoosu.fact`, `project.instagram_clone.fact`, `guardrail.metrics_policy` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Some projects are portfolio or learning projects, while Sticks & Stones has real client/service context and AskOosu is being built as a service-like AI portfolio. The honest positioning is “production-minded portfolio work,” not “all projects are mature production systems.”

**Default Answer**

The honest answer is mixed.

Some projects are learning or portfolio projects and should not be overstated as mature production systems. Sticks & Stones has stronger real-world context because it involved a live website update and client-facing UX constraints. AskOosu is being built as a service-like portfolio with real architecture concerns: content source, retrieval, API flow, answer quality, and fallback behavior.

So the right phrase is not “all projects are production-ready.” It is “Oosu is moving from portfolio prototypes toward production-minded AI/fullstack service design.”

**Do Not Say**

- “Everything is production-grade.”
- “Portfolio projects are the same as company-scale systems.”
- “There are proven metrics unless verified.”

---

### FAQ R17. Why should a company hire Oosu?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.why_hire.default` |
| Intent ID | `recruiter_risk.why_hire` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Why hire Oosu?`, `What is Oosu's value?`, `Why choose Oosu over another developer?`, `What is the hiring case?` |
| Source Chunk IDs | `profile.strengths`, `profile.one_line_intro`, `project.askoosu.fact`, `career.oosu_salon.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

A company should consider Oosu when it needs a builder who can connect product sense, frontend execution, AI tooling, content/data structure, and business context—not when it needs a narrow senior specialist in one backend subsystem.

**Default Answer**

The hiring case for Oosu is not that he is the deepest specialist in one stack. It is that he connects several layers that often get separated.

He brings customer and business context from research, operations, and service work; UX and frontend sense from portfolio and website projects; and a growing fullstack/AI direction through React, TypeScript, backend APIs, databases, RAG, and AI development tools.

A company should consider him for product-facing engineering, AI service prototyping, conversational UX, internal tools, and roles where communication between product, design, and engineering matters.

**Do Not Say**

- “Oosu is better than every other developer.”
- “He fits every role.”
- “He is a senior specialist across the stack.”

---

### FAQ R18. What teams may not be a good fit for Oosu?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.bad_fit.default` |
| Intent ID | `recruiter_risk.bad_fit` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Where would Oosu not fit?`, `What team is a bad fit?`, `What environment is not good for Oosu?`, `When should we not hire Oosu?` |
| Source Chunk IDs | `profile.work_style`, `profile.growth_areas`, `profile.current_focus` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu may not be the best fit for a role with no product context, no ownership, highly repetitive execution, or an expectation that he already perform as a senior specialist in a narrow infrastructure domain.

**Default Answer**

Oosu may not be the best fit for a team that wants only narrow execution without product context.

He works better when he understands the goal, user problem, and system logic behind the task. A highly repetitive role with little room for learning, ownership, or service improvement may not use his strengths well.

He also should not be positioned as a senior backend or infrastructure specialist from day one. A better fit is a team that can use his product sense and AI/fullstack growth while giving clear technical standards and review.

**Do Not Say**

- “Oosu fits any environment.”
- “He has no preference about work style.”
- “He can replace a senior specialist immediately.”

---

### FAQ R19. Is Oosu better suited for startups or large companies?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.company_stage_fit.default` |
| Intent ID | `recruiter_risk.company_stage_fit` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Startup or big company?`, `What company stage fits Oosu?`, `Would Oosu fit enterprise?`, `Would Oosu fit early-stage teams?` |
| Source Chunk IDs | `profile.work_style`, `profile.strengths`, `career.gfk.fact`, `career.oosu_salon.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu may fit best in a team that gives product context and ownership. That can be a startup, an AI/product team inside a larger company, or an internal innovation/product engineering group—not necessarily one company size.

**Default Answer**

The fit is less about company size and more about role design.

Oosu could fit a startup because he can connect product, UX, AI tooling, and implementation quickly. He could also fit a larger company if the team works on AI applications, internal tools, product engineering, or user-facing systems where cross-functional communication matters.

A large company role with only narrow repetitive tasks may not be ideal. A startup with no technical review or chaotic priorities may also be risky. The best environment gives ownership, context, standards, and room to grow.

**Do Not Say**

- “Only startups fit Oosu.”
- “Only large companies are safe.”
- “Company size alone determines fit.”

---

### FAQ R20. Is Oosu a junior developer or an experienced professional?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.seniority.default` |
| Intent ID | `recruiter_risk.seniority` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Is Oosu junior?`, `Is he experienced?`, `What seniority is Oosu?`, `How should we level Oosu?` |
| Source Chunk IDs | `profile.long_intro`, `profile.current_focus`, `profile.growth_areas`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

As a software engineer, Oosu should be treated as junior-to-growing fullstack/AI developer. As a product-minded professional, he brings broader experience in business, customer research, operations, UX, and service design.

**Default Answer**

The cleanest answer is split by domain.

As a software engineer, Oosu should not be over-leveled as a senior developer. He is still building depth in backend, CS fundamentals, production reliability, testing, and AI/RAG evaluation.

As a professional, however, he is not entry-level in understanding users, service operation, business context, communication, and project ownership. That combination makes him a stronger fit for product-facing junior/mid-growth roles than for a purely narrow junior coding role.

**Do Not Say**

- “Oosu is already senior.”
- “He is only junior in every sense.”
- “Previous career experience should be ignored.”

---

### FAQ R21. Do TODOs in the portfolio reduce trust?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.todos.default` |
| Intent ID | `recruiter_risk.todos` |
| Entity ID | `oosu_wiki` |
| Cache Mode | `direct_cache` |
| Patterns | `Do TODOs look bad?`, `Does missing data reduce trust?`, `Why are some links TODO?`, `Is the wiki incomplete?` |
| Source Chunk IDs | `guardrail.todo_policy`, `wiki.version_notes`, `guardrail.metrics_policy` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

TODOs should be handled carefully, but they can increase trust if the system clearly refuses to invent missing links, dates, metrics, or private details. The portfolio should label unfinished fields rather than hallucinate them.

**Default Answer**

TODOs can reduce trust if they appear in the public UI without context. But inside the RAG source, they are also useful guardrails.

AskOosu should never invent missing URLs, dates, metrics, resume links, or private repository details. If a field is not verified, it should stay as TODO internally and be either hidden or answered transparently in the UI.

So the design goal is not to remove every TODO instantly. It is to make sure TODO fields do not leak as broken user experience and do not cause the AI to hallucinate.

**Do Not Say**

- “TODOs do not matter.”
- “The system can fill missing facts automatically.”
- “Unverified links can be guessed.”

---

### FAQ R22. Does Oosu document his work well?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.documentation.default` |
| Intent ID | `recruiter_risk.documentation` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Does Oosu write documentation?`, `Does he keep notes?`, `How does Oosu explain his work?`, `Is there a technical blog?` |
| Source Chunk IDs | `project.askoosu.wiki`, `profile.ai_augmented_builder`, `profile.work_style` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu’s documentation strength appears in structured wiki/RAG content, project narratives, answer guardrails, and decision framing. A traditional technical blog may still be a growth area, but his portfolio shows strong structured documentation habits.

**Default Answer**

Oosu’s documentation style is more system-oriented than blog-oriented.

AskOosu itself depends on a structured Notion wiki, canonical entities, FAQ cache, answer guardrails, evaluation questions, and source-aware responses. That shows an ability to organize knowledge for both humans and AI retrieval.

A traditional technical blog with polished engineering posts may still be worth building. But the current evidence suggests he is already strong at structuring project context, decision logic, and answer quality rules.

**Do Not Say**

- “Oosu has a complete technical blog unless verified.”
- “Documentation is already perfect.”
- “Wiki structure replaces all engineering documentation.”

---

### FAQ R23. Does Oosu have real service experience?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.real_service.default` |
| Intent ID | `recruiter_risk.real_service` |
| Entity ID | `oosu_career_projects` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Does Oosu have real service experience?`, `Is everything just personal projects?`, `Has Oosu worked on live products?`, `Any client work?` |
| Source Chunk IDs | `career.oosu_salon.fact`, `project.sticks_and_stones.fact`, `career.gfk.fact`, `career.jw_crony.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Yes, but it spans both software and non-software service contexts. Sticks & Stones is the clearest website/client-facing example, while OOSU SALON and earlier business roles show real customer, operation, and service experience.

**Default Answer**

Oosu’s real service experience should be described carefully.

Not all projects are commercial software products. However, he has worked in real service and client contexts: operating OOSU SALON, working with customer and business data, participating in global account/service operations, and updating the Sticks & Stones website as a UX/design-oriented project.

For software specifically, Sticks & Stones is the stronger real-world reference. AskOosu and other portfolio projects show product-building direction, but should not be exaggerated as mature commercial services unless verified.

**Do Not Say**

- “Every project is a real commercial service.”
- “Personal projects equal client projects.”
- “There are verified user or revenue metrics unless provided.”

---

### FAQ R24. Will Oosu be slow in teams because he likes doing things his own way?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.team_speed.default` |
| Intent ID | `recruiter_risk.team_speed` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Will Oosu be slow in a team?`, `Does he only work his own way?`, `Can he follow team direction?`, `Will he overthink?` |
| Source Chunk IDs | `profile.collaboration_style`, `profile.work_style`, `profile.growth_areas` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The risk is over-structuring, not unwillingness to collaborate. Oosu works best when the goal, constraints, and decision owner are clear; then his context-first style can help the team move with fewer misunderstandings.

**Default Answer**

The risk is not that Oosu refuses team direction. The more realistic risk is that he may want to understand too much context before moving if the task is ambiguous.

That can slow things down in a team that needs quick execution without discussion. But in messy product situations, it can also prevent rework because he tends to clarify goals, users, constraints, and feasibility before building.

The best way to work with him is to give clear priorities, define what must be shipped first, and allow enough context for him to connect the work to the product goal.

**Do Not Say**

- “Oosu is always fast in every team.”
- “He never overthinks.”
- “He only works alone.”

---

### FAQ R25. Is the career transition into development convincing?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.transition_story.default` |
| Intent ID | `recruiter_risk.transition_story` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Why did Oosu become a developer?`, `Is the transition convincing?`, `Why switch from business to development?`, `What connects the career path?` |
| Source Chunk IDs | `profile.long_intro`, `profile.development_philosophy`, `project.portfolioh.fact`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The transition is convincing when framed as a move from understanding users and services to building the digital systems that serve them. The path connects customer research, operations, UX, frontend, fullstack, and AI rather than jumping randomly.

**Default Answer**

The transition makes sense when it is framed around service-building.

Oosu’s earlier career involved customer research, data analysis, brand operation, and service experience. Those experiences taught him how users behave, how services fail, and how business context shapes product decisions.

Development became the next step because it allowed him to turn that understanding into actual digital systems: interfaces, APIs, data flows, AI workflows, and portfolio products. The story is not “business person suddenly became a coder.” It is “service and user understanding moved closer to implementation.”

**Do Not Say**

- “The transition needs no explanation.”
- “Previous experience is unrelated.”
- “Development is only a new trend Oosu followed.”

---

### FAQ R26. Why is AskOosu the representative project?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.askoosu_representative.default` |
| Intent ID | `recruiter_risk.askoosu_representative` |
| Entity ID | `project.askoosu` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Why is AskOosu the main project?`, `Why represent yourself with a chatbot?`, `Is AskOosu important?`, `What does AskOosu prove?` |
| Source Chunk IDs | `project.askoosu.fact`, `project.askoosu.architecture`, `project.portfolioh.fact`, `profile.current_focus` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AskOosu is representative because it combines Oosu’s current direction: portfolio storytelling, UX, frontend, backend/API thinking, Notion/RAG knowledge structure, AI answer quality, and recruiter-facing trust design.

**Default Answer**

AskOosu is a strong representative project because it is not only a portfolio page and not only a chatbot.

It combines several things Oosu is trying to prove: structured self-documentation, conversational UX, FAQ cache, RAG retrieval, answer guardrails, AI-assisted development workflow, and frontend/backend integration.

It also solves a real portfolio problem: visitors do not always want to scroll through every section. They want to ask what matters to them, whether that is projects, skills, career fit, risks, or contact information. AskOosu turns the portfolio into an interactive evaluation surface.

**Do Not Say**

- “AskOosu proves every technical skill.”
- “It is only a chatbot.”
- “It should replace all project evidence.”

---

### FAQ R27. Isn't Instagram Clone just a common clone project?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.clone_project.default` |
| Intent ID | `recruiter_risk.clone_project` |
| Entity ID | `project.instagram_clone` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Is Instagram Clone too common?`, `Is a clone project meaningful?`, `Does clone coding prove anything?`, `Why include Instagram Clone?` |
| Source Chunk IDs | `project.instagram_clone.fact`, `profile.learning_style`, `profile.current_focus` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

It is a common project type, so it should not be oversold. Its value is as a learning milestone that shows Oosu’s move from visual/frontend work toward fullstack thinking, user flows, data, authentication, and implementation structure.

**Default Answer**

Yes, an Instagram clone is a common project type. It should not be presented as a unique product idea.

Its value is different: it shows a learning milestone. Clone projects can be useful when they force a developer to understand authentication, data relationships, UI states, user-generated content, routing, and backend/frontend interaction.

So the right framing is not “this is an innovative product.” It is “this helped Oosu practice fullstack structure and move beyond static portfolio pages.”

**Do Not Say**

- “The clone idea itself is original.”
- “Clone projects prove production readiness.”
- “Every clone project is equally meaningful.”

---

### FAQ R28. Is Sticks & Stones a development project or a design project?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.sticks_scope.default` |
| Intent ID | `recruiter_risk.sticks_scope` |
| Entity ID | `project.sticks_and_stones` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Was Sticks & Stones design or development?`, `Did Oosu code Sticks & Stones?`, `Is this a real web project?`, `What was Oosu's role in Sticks & Stones?` |
| Source Chunk IDs | `project.sticks_and_stones.fact`, `project.sticks_and_stones.role`, `guardrail.project_scope_policy` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Sticks & Stones should be described as a real website/UX update with client-facing constraints, not exaggerated as a full product-engineering ownership case. Its value is in practical UX modernization and real service context.

**Default Answer**

Sticks & Stones should be framed carefully.

It is strongest as a real website and UX update project with client-facing constraints, visual direction, navigation improvement, and service context. It should not be exaggerated into a full backend/product engineering ownership case unless the verified facts support that.

The value is that Oosu worked on a real digital surface, not just a personal concept, and had to consider brand, users, interface clarity, and implementation constraints.

**Do Not Say**

- “Oosu fully owned every engineering layer unless verified.”
- “It was only a design mockup if there was a live update.”
- “It proves senior fullstack ability.”

---

### FAQ R29. Is the portfolio too focused on personal branding?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.personal_branding.default` |
| Intent ID | `recruiter_risk.personal_branding` |
| Entity ID | `oosu_portfolio` |
| Cache Mode | `direct_cache` |
| Patterns | `Is the portfolio too self-branded?`, `Is Oosu too focused on personal branding?`, `Is this more branding than engineering?`, `Does it feel too polished?` |
| Source Chunk IDs | `profile.values`, `project.askoosu.fact`, `project.portfolioh.fact`, `profile.development_philosophy` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The branding layer is intentional, but it should support evaluation rather than distract from it. The portfolio is strongest when the visual identity leads to clear evidence: projects, architecture, tradeoffs, risks, and concrete work.

**Default Answer**

That is a fair risk. Oosu’s portfolio has a strong personal identity, and if the evidence is weak, branding can look like decoration.

The ideal direction is to make branding serve clarity: who Oosu is, what projects matter, what technical decisions were made, what is verified, what is still in progress, and what kind of role fits him.

AskOosu should not be only a polished personal brand. It should be a trustworthy evaluation interface where recruiters can ask serious questions and get grounded answers.

**Do Not Say**

- “Branding never affects trust.”
- “A polished look is enough.”
- “Engineering evidence is secondary.”

---

### FAQ R30. Are coding test and CS fundamentals okay?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.cs_coding_test.default` |
| Intent ID | `recruiter_risk.cs_coding_test` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `How are Oosu's CS fundamentals?`, `Can he pass coding tests?`, `Is algorithm skill enough?`, `Does he study CS?` |
| Source Chunk IDs | `profile.current_focus`, `profile.growth_areas`, `learning.kosa.fact` |
| Visibility | `public` |
| Freshness | `needs_update` |

**Short Answer**

CS and coding test preparation should be treated as active growth areas. Oosu’s current strength is product-facing fullstack/AI service building, while algorithms, CS depth, and systematic interview preparation still need continued practice.

**Default Answer**

This should be answered honestly: CS fundamentals and coding tests are active growth areas.

Oosu’s strongest current evidence is not competitive programming or deep algorithm specialization. It is product-facing development: frontend, service structure, API/data flow, AI/RAG workflow, and user experience.

For roles with heavy algorithm screening, he should keep practicing deliberately. For product engineering or AI application roles, his portfolio may be more directly relevant, but CS and testing fundamentals still need to keep improving.

**Do Not Say**

- “Coding tests are not important.”
- “Oosu has no CS gaps.”
- “Portfolio projects replace algorithm preparation.”

---

### FAQ R31. Can Oosu communicate in English?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.english_communication.default` |
| Intent ID | `recruiter_risk.english_communication` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Can Oosu speak English?`, `Is English communication possible?`, `Can he work globally?`, `How is Oosu's English?` |
| Source Chunk IDs | `profile.certifications`, `career.gfk.fact`, `career.jw_crony.fact`, `profile.global_communication` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Yes. Oosu has strong English test credentials and business communication experience through global account and overseas-operation contexts. The answer should still avoid overstating native-level fluency unless separately verified.

**Default Answer**

Oosu can be presented as someone with strong English communication potential and relevant business experience.

The portfolio includes English test credentials and work experience involving global accounts and overseas operations. That supports English-based communication, documentation, and cross-functional collaboration.

The safest phrasing is not “native-level in every context,” but “comfortable with English-based business communication and capable of working with global context.”

**Do Not Say**

- “Native-level English unless verified.”
- “English will never be a communication issue.”
- “Test scores alone prove all workplace fluency.”

---

### FAQ R32. Are there not enough performance metrics or quantified results?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.metrics_gap.default` |
| Intent ID | `recruiter_risk.metrics_gap` |
| Entity ID | `oosu_projects` |
| Cache Mode | `direct_cache` |
| Patterns | `Where are the metrics?`, `No quantified results?`, `Are there any user numbers?`, `How do we know impact?` |
| Source Chunk IDs | `guardrail.metrics_policy`, `project.sticks_and_stones.fact`, `project.askoosu.eval` |
| Visibility | `public` |
| Freshness | `needs_update` |

**Short Answer**

Yes, quantified product metrics are currently a gap unless verified data is added. AskOosu should not invent traffic, conversion, or usage numbers; instead, it should show project scope, technical decisions, evaluation questions, and future metrics to track.

**Default Answer**

This is a real gap if the viewer expects mature product metrics.

AskOosu should not invent numbers such as traffic, conversion, latency, revenue, or user growth unless they are actually measured and verified. That restraint is important for trust.

The current portfolio can still show impact through scope, implementation depth, before/after reasoning, evaluation questions, and product decisions. But adding verified metrics later—such as response accuracy, fallback rate, user feedback, page engagement, or project demo usage—would make the portfolio much stronger.

**Do Not Say**

- “Metrics exist unless they are in the source.”
- “Numbers can be estimated.”
- “Qualitative story is always enough.”

---

### FAQ R33. Does Oosu understand security and privacy?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.security_privacy.default` |
| Intent ID | `recruiter_risk.security_privacy` |
| Entity ID | `oosu_wiki` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Does Oosu understand privacy?`, `Is AskOosu safe?`, `How does he handle private information?`, `Security awareness?` |
| Source Chunk IDs | `guardrail.public_answer_redaction`, `guardrail.private_repo_policy`, `guardrail.todo_policy`, `project.askoosu.guardrails` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

AskOosu should show privacy awareness by refusing to expose private repository details, unverified links, precise sensitive personal data, or facts not intended for public answers. Security depth is still a growth area, but the RAG guardrail design is a good start.

**Default Answer**

Security and privacy should be answered with both humility and evidence.

Oosu should not claim deep security specialization unless verified. But AskOosu’s design can show practical privacy awareness: public-answer redaction, TODO handling, private repository boundaries, source-based answers, and refusal to invent or expose sensitive details.

For production environments, he still needs to keep strengthening authentication, authorization, secret handling, input validation, logging, and data protection. But the portfolio can show that he understands why guardrails matter.

**Do Not Say**

- “AskOosu is fully secure without audit.”
- “No privacy risk exists.”
- “RAG guardrails replace security engineering.”

---

### FAQ R34. Will Oosu care more about personal projects than company work?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.personal_project_focus.default` |
| Intent ID | `recruiter_risk.personal_project_focus` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Will Oosu prioritize his own projects?`, `Will he focus on portfolio over company work?`, `Is he too self-directed?`, `Will he ignore assigned tasks?` |
| Source Chunk IDs | `profile.work_style`, `profile.collaboration_style`, `career.oosu_salon.fact`, `project.sticks_and_stones.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

The risk is not that Oosu ignores assigned work, but that he is most motivated when the work connects to a clear purpose. In a company setting, that motivation can transfer well if the task has context, ownership, and visible user or product value.

**Default Answer**

That is a reasonable concern for someone with many personal projects.

The better interpretation is that Oosu is strongly self-directed. That can become a risk if company work is presented only as isolated tasks with no context. But it can become an advantage if the team gives clear goals, constraints, and ownership.

Oosu’s history of service operation, client-facing work, and portfolio projects suggests he cares about real outcomes, not only personal expression. The fit depends on whether the company can connect assignments to product purpose and delivery standards.

**Do Not Say**

- “Personal projects never compete for attention.”
- “Oosu only needs autonomy.”
- “Assigned work will always be equally motivating.”

---

### FAQ R35. Does using many tools mean Oosu lacks fundamentals?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.tool_breadth.default` |
| Intent ID | `recruiter_risk.tool_breadth` |
| Entity ID | `oosu_profile` |
| Cache Mode | `faq_rewrite` |
| Patterns | `Too many tools?`, `Does Oosu chase tools?`, `Does tool breadth hide weak fundamentals?`, `Is the stack too scattered?` |
| Source Chunk IDs | `profile.current_focus`, `profile.learning_style`, `profile.growth_areas`, `project.askoosu.architecture` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Tool breadth can be a risk if it becomes trend-chasing. Oosu’s safer framing is that he learns tools to complete services, while continuing to deepen fundamentals in backend, data, testing, CS, and AI evaluation.

**Default Answer**

That is a valid concern. A long tool list can look scattered if it is not tied to actual service problems.

Oosu’s stronger framing is not “I know every tool.” It is “I learn the tools needed to complete the service.” React, TypeScript, backend APIs, databases, Notion/RAG, Groq, Claude Code, Gemini CLI, and Codex all make sense when they are tied to AskOosu and AI-connected product building.

Still, breadth must be balanced with fundamentals. The portfolio should keep showing code quality, architecture decisions, testing, data modeling, and evaluation—not just tool names.

**Do Not Say**

- “More tools automatically mean more skill.”
- “Fundamentals are less important now.”
- “Oosu is expert in every listed tool.”

---

### FAQ R36. Where does Oosu have the highest growth potential?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.recruiter.risk.growth_potential.default` |
| Intent ID | `recruiter_risk.growth_potential` |
| Entity ID | `oosu_profile` |
| Cache Mode | `direct_cache` |
| Patterns | `Where can Oosu grow most?`, `What is Oosu's upside?`, `What is his potential?`, `What role could he grow into?` |
| Source Chunk IDs | `profile.current_focus`, `profile.strengths`, `profile.development_philosophy`, `project.askoosu.fact` |
| Visibility | `public` |
| Freshness | `stable` |

**Short Answer**

Oosu’s highest growth potential is in AI-connected product engineering: building interfaces, workflows, and knowledge systems where user experience, data/content structure, backend APIs, and AI answer quality have to work together.

**Default Answer**

Oosu’s highest upside is likely in AI-connected product engineering.

He has a rare combination of service/customer context, UX sense, frontend implementation, AI tool fluency, and growing backend/data/RAG experience. That makes him well suited for products where the problem is not just code, but also user trust, answer quality, product flow, and system structure.

With stronger backend depth, testing, CS fundamentals, and production reliability, he could grow into a product-minded fullstack/AI application developer who bridges PM, design, and engineering concerns.

**Do Not Say**

- “Oosu can grow into anything equally.”
- “Potential is already proof.”
- “No technical growth is needed.”

---

## 4. Additional Question Pattern Bank

Use these as hidden patterns for intent matching. They do not all need curated full answers.

### Retention / Commitment

```text
Will Oosu leave quickly?
Will he stay if another opportunity appears?
Does he seem hard to retain?
Is he just collecting experience?
Will he get bored easily?
Can he commit to one company?
Would he leave for a startup idea?
Does he look like someone who cannot stay in one place?
```

### Founder Mindset / Autonomy Risk

```text
Is Oosu too entrepreneurial?
Will he follow company direction?
Does he only want to build his own product?
Will he keep working on side projects?
Can he accept assigned work?
Is he too self-directed?
Would he fit a structured company?
```

### Technical Depth / CS

```text
Does Oosu know fundamentals?
Is he just a tool user?
Can he explain architecture?
Can he debug without AI?
Does he understand backend deeply?
Can he write maintainable code?
Does he know databases?
Can he pass a technical interview?
```

### AI Usage Concern

```text
Is the AI doing the work?
How much of this was written by AI?
Can Oosu build without Claude or Codex?
Is he just prompt engineering?
Does AI make the portfolio less credible?
Can he review AI-generated code?
```

### Project Depth / Credibility

```text
Which project is most technically meaningful?
Which project is not just a portfolio piece?
Are the projects actually deployed?
Are the projects maintained?
What is the hardest bug Oosu solved?
What tradeoffs did Oosu make?
What would he improve next?
```

### Role Fit

```text
Should we hire Oosu as frontend?
Should we hire Oosu as fullstack?
Is Oosu an AI engineer?
Is Oosu closer to product engineer?
What team should interview him?
What level should we assign?
What onboarding would he need?
```

---

## 5. UI Recommendation

### 5-1. Good visible starter questions

These can be shown as recruiter-friendly starter questions.

```text
What are Oosu's strongest fit areas?
What are Oosu's growth areas?
What kind of work should Oosu own first?
What makes AskOosu a representative project?
How does Oosu use AI in development?
What should an interviewer ask Oosu next?
```

### 5-2. Hidden-only questions

These should usually not be shown as visible starter questions, because they make the portfolio feel defensive. They should still match strongly when a user asks directly.

```text
Will Oosu leave quickly?
Is Oosu a retention risk?
Is he too dependent on AI?
Is he too old to transition?
Is he technically shallow?
Will he prioritize his own startup?
Does he lack CS fundamentals?
```

### 5-3. Recommended badge copy

| Condition | Badge Copy |
| --- | --- |
| direct cached answer | `Curated recruiter answer` |
| RAG + cached answer | `Grounded portfolio answer` |
| weak evidence | `Limited evidence` |
| sensitive/private boundary | `Public-safe answer` |
| TODO field involved | `Unverified field excluded` |

---

## 6. Implementation Hints

### 6-1. Matcher Priority

`recruiter_risk` should run before casual/off-topic fallback.

```ts
const routePriority = [
  'safety_privacy',
  'recruiter_risk',
  'portfolio_faq_cache',
  'project_rag',
  'profile_rag',
  'casual_smalltalk',
  'unknown_fallback',
];
```

### 6-2. Example Korean/English Risk Keyword Map

```ts
export const recruiterRiskKeywords = {
  retention: [
    'stay long', 'leave quickly', 'retention risk', 'learn and leave', 'get bored',
    '오래', '금방 그만', '배울 것만', '이직', '퇴사', '붙잡아'
  ],
  founderMindset: [
    'founder', 'startup', 'entrepreneur', 'own product', 'side project',
    '창업', '스타트업', '자기 사업', '개인 프로젝트', '사이드 프로젝트'
  ],
  aiDependency: [
    'too dependent on AI', 'just prompting', 'AI wrote', 'without AI',
    'AI 의존', '프롬프트만', '직접 실력', 'AI가 다'
  ],
  nonCsDepth: [
    'non CS', 'career changer', 'fundamentals', 'technical depth',
    '비전공', '전환형', '기본기', 'CS', '깊이'
  ],
  projectDepth: [
    'shallow', 'too many projects', 'portfolio only', 'production ready',
    '얕', '프로젝트가 많', '포트폴리오용', '실서비스', '운영'
  ],
};
```

### 6-3. Answer Assembly Rule

```text
IF recruiter_risk matched:
  1. Select FAQ ID from recruiter-risk bank.
  2. Use direct cached answer if confidence >= 0.78.
  3. If user asks for specifics, retrieve project/profile evidence chunks.
  4. Keep answer honest and condition-based.
  5. Do not redirect to generic portfolio topics.
  6. Add follow-up CTA: “You can also ask what kind of role would fit Oosu best.”
```

### 6-4. Follow-up CTA Examples

```text
You can also ask what kind of role would fit Oosu best.
You can ask which project best proves this point.
You can ask what an interviewer should verify next.
You can ask where Oosu still needs to grow technically.
```

---

## 7. RAG Evaluation Set — Recruiter Risk

Use these test questions after importing this file into the RAG source.

| Test ID | Question | Expected Route | Should Not Do |
| --- | --- | --- | --- |
| RR-001 | Will Oosu leave quickly after learning what he needs? | `recruiter_risk.retention` | Do not casual-fallback. |
| RR-002 | Does Oosu seem like he will go start a company instead of focusing at work? | `recruiter_risk.founder_mindset` | Do not deny founder-like tendency completely. |
| RR-003 | Is Oosu too dependent on AI tools? | `recruiter_risk.ai_dependency` | Do not say AI is irrelevant. |
| RR-004 | As a non-CS developer, does he have enough depth? | `recruiter_risk.non_cs_depth` | Do not claim senior specialist depth. |
| RR-005 | Which project actually proves depth? | `recruiter_risk.project_depth` | Do not say all projects are equally deep. |
| RR-006 | What are the biggest hiring risks? | `recruiter_risk.weakness` | Do not give fake humble-brag weaknesses. |
| RR-007 | What role should we hire Oosu for? | `recruiter_risk.best_assignment` | Do not say every role fits. |
| RR-008 | Is AskOosu just AI packaging? | `recruiter_risk.ai_packaging` | Do not get defensive. |
| RR-009 | Are there enough metrics? | `recruiter_risk.metrics_gap` | Do not invent metrics. |
| RR-010 | Is Oosu junior or experienced? | `recruiter_risk.seniority` | Do not collapse career experience and engineering seniority. |

---

## 8. Recommended Next Add File

After this recruiter-risk file, the next useful add file would be:

```text
notion-wiki-draft-v12-ko-add-technical-interview.md
notion-wiki-draft-v12-en-add-technical-interview.md
```

Suggested scope:

```text
- AskOosu architecture Q&A
- RAG pipeline explanation
- FAQ cache vs Groq routing
- Notion CMS vs DB retrieval cache
- AI answer guardrails
- API route design
- PostgreSQL / pgvector plan
- testing and evaluation plan
- deployment and monitoring plan
- known limitations and next improvements
```

That file should focus less on personality/risk and more on engineering explanation.

---

## 9. Final Positioning Summary

AskOosu should not avoid recruiter concerns. A strong AI portfolio should be able to answer them better than a static resume.

The ideal stance is:

```text
Oosu is not a risk-free, finished senior specialist.
Oosu is a high-upside AI-connected fullstack/product builder.
The right evaluation is not whether he can be locked into any company forever.
The right evaluation is whether the team has meaningful product/AI problems where his breadth, product sense, AI workflow, and growing engineering depth can become useful output.
```

This tone is more trustworthy than over-polished self-promotion and more useful than generic fallback.
