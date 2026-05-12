# AskOosu Notion Wiki — v12 EN (Additional Content: AI Era Perspective & Philosophy)

> Add-on file for v12 EN. Moving beyond a "portfolio full of correct answers," this section adds content that reflects Oosu's own perspective and conviction about the AI era.
> This section is not a recruiter defense mechanism. It's an honest expression of how Oosu reads the AI era, and where he is placing his bets.
> Why a portfolio needs color and perspective: a portfolio filled only with perfect answers builds trust — but isn't remembered.
> Integrate these FAQs into `data/faq-answers.en.ts` and register the `oosu_philosophy` surface in `data/question-surfaces.en.ts`.

---

## Version Notes

- `v12-additional-content`: Added AI Era Perspective FAQ Bank — the future of teams, AI collaboration philosophy, PM+PO dual positioning, redefining the developer's role in the AI age. Adds the `oosu_philosophy` surface, which includes Oosu's predictions and experiment logs.

---

## Section Design Principles

These answers follow three rules that distinguish them from existing FAQs.

1. **Start from observation, not prediction.** Not "teams will disappear," but "there is a change I am directly witnessing through my own experiments right now."
2. **Claims come with evidence.** Every philosophical statement is accompanied by a specific, personal moment. OosuSalon, the Instagram clone, AskOosu — all of these are proof of this perspective.
3. **Leave room to be wrong.** This isn't an attempt to look prophetic. It's about showing why someone who is betting on this direction thinks the way they do.

---

## 17. FAQ Answer Cache — AI Era Philosophy Bank

---

### FAQ V-01. Can a developer who relies this heavily on AI tools still be competitive in the future?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.ai_developer_future.default` |
| Intent ID | `vision.ai_developer_future` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `AI era developer`, `AI tool dependency`, `future competitiveness`, `do developers matter if AI does everything`, `developers who survive the AI era` |
| Source Chunk IDs | `profile.ai_workflow`, `project.askoosu.fact`, `project.instagram_clone.fact`, `profile.strengths` |
| Visibility | `public` |

**Short Answer**

There's a difference between a developer who uses AI well and a developer who gets replaced by AI. I'm currently running experiments on that exact distinction.

**Default Answer**

Here's how I think about this question.

The question "what's the point of developers if AI writes code?" seems to come from a framing that sees AI as nothing more than a code generator.

I've used Claude Code, Gemini CLI, and Codex simultaneously to run projects that would normally require a multi-person team — solo. The Instagram clone: 22 tables, 7-domain ERD, Next.js frontend + Spring Boot backend + PostgreSQL. Running this alone at a pace close to a four-person team, what I discovered was this: there are things AI genuinely cannot do.

AI cannot decide **what to build**. Which features users actually need, what design choices will create problems down the road, what technical debt a decision made today will generate three months from now — these are still jobs for humans.

I'm betting on being the person who makes those judgments quickly and with sound reasoning. Not on how fast I can type code.

**Detailed Answer**

To be more specific — working with AI, I've noticed the developer's role being restructured into three functions.

**1. Architecture judge**
AI is good at implementation but doesn't grasp the trade-offs in design decisions. Ask AI "why will this approach cause problems later?" and it'll give an answer — but whether that answer fits the current project's context is still a human judgment call. AskOosu's RAG architecture decisions — the reason for separating FAQ cache and RAG routing, the fallback handling approach — AI proposed options, but I judged and decided.

**2. Product direction definer**
Deciding what to build is still a human domain. In the Instagram clone, choosing AI features like comment summarization, harassment detection, and hashtag suggestion wasn't because they were technically feasible — it was because I understood the real friction points in social platforms. That judgment came from years of watching user behavior patterns in data analytics consulting at GfK.

**3. AI orchestrator**
Setting architecture with Claude Code, delegating implementation to Codex, running large-scale refactoring with Gemini CLI — this isn't simply "being good at AI tools." It's a meta-judgment: understanding each model's strengths and weaknesses, and deciding which judgments to delegate where.

The developer who can do all three simultaneously is the competitive developer in the AI era. That's the direction I'm actively building myself toward.

---

### FAQ V-02. Will team projects still be necessary in the future? Isn't working alone with AI enough?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.team_future.default` |
| Intent ID | `vision.team_future` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `future of team projects`, `do teams matter in the AI era`, `working alone with AI`, `future of team collaboration`, `working with AI agents` |
| Source Chunk IDs | `project.instagram_clone.fact`, `profile.ai_workflow`, `profile.work_style`, `career.target_role` |
| Visibility | `public` |

**Short Answer**

I don't think teams disappear. But how teams are composed, and what roles are needed, is clearly changing. I think that shift has already started.

**Default Answer**

Honestly — I'm living this experiment in real time.

The Instagram clone project: in a four-person team, I took on backend API design, documentation of a 22-table ERD, seed data generation, and full-stack debugging — solo, running AI agents in parallel. I managed to cover what four people would normally split up, at a reasonable pace.

Here's the conclusion I drew.

**The more a job is "well-defined execution," the less a team is needed.** Clear specs, repeating patterns, automatable work — AI agents are rapidly displacing this. Previously, multiple people split this kind of work between them.

**The more a job is "judgment and direction-setting," the more humans are still needed.** What to build, which priorities to pursue, what a decision means for the business and the user — AI isn't good at this. And it's becoming more important, not less.

So I see the direction as not "teams shrink," but **"how teams are composed changes."** The proportion of execution headcount will decrease; the proportion of people who set direction and orchestrate AI will grow.

**Detailed Answer**

To be more concrete about where I'm placing my bets:

**Scenario A: When there's a team**
I can step into a PM role and lead the full workflow — including each role's AI usage — across developers, designers, and data roles. A PM who understands technical context and sets product direction. Becoming a "technical PM" used to require years of engineering experience; in the AI era, "the ability to experiment fast with AI and make sound judgments" is becoming more critical.

**Scenario B: When working solo or in a small group**
As Product Owner, I directly collaborate with AI agents while covering both developer and designer roles. AskOosu is the proof — from RAG architecture design to frontend UI to deployment, built solo with AI.

Becoming someone who can operate in both modes — that's what I'm preparing for right now.

I could be wrong. The value of team collaboration might persist far longer and far more strongly than I expect. But if the direction holds, this bet seems worth making.

---

### FAQ V-03. This way of working with AI — when and how did it develop?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.ai_workflow_origin.default` |
| Intent ID | `vision.ai_workflow_origin` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `AI usage approach`, `AI workflow`, `how do you use AI`, `AI tool usage`, `AI collaboration style` |
| Source Chunk IDs | `profile.ai_workflow`, `career.timeline`, `project.instagram_clone.fact`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

It wasn't planned from the start. I kept experimenting to solve problems faster, and this workflow is what emerged.

**Default Answer**

My AI workflow evolved like this.

At first it was just "I'll ask AI to write the code." The problem surfaced immediately — the code AI gave me ran, but I couldn't debug it because I didn't understand why it behaved that way. So I shifted: delegate implementation to AI, but make sure I understand the design and flow first.

Then I started assigning distinct roles to each AI tool. Claude Code for architecture decisions and complex debugging — "why should this be designed this way." Codex for fast implementation delegation when specs are clear. Gemini CLI for large-scale codebase refactoring — when a lot of context is needed.

The Instagram clone project was the real-world validation. In a four-person team project, I covered backend + DB + AI feature integration solo, and confirmed that orchestrating three AIs in parallel actually works.

**Detailed Answer**

The core principles of my current workflow:

**Judgment is mine, execution belongs to AI.** What to build, which design to choose, what downstream impact a decision will have — if I fully delegate these judgments to AI, I end up with a codebase I don't understand. The responsibility for judgment always stays with me; I borrow AI's speed for execution.

**Anticipate and verify AI's mistakes.** AI sometimes follows patterns into the wrong direction, misses context, or confidently gives broken code. To catch this, I need to already know something. So even when I delegate implementation, I always try to understand the core concepts of the relevant technology first.

**Continuously improve the workflow itself.** Accumulating error logs in Korean on Notion, auto-committing algorithm solutions to GitHub, tracking learning patterns — all of this is about improving "how I learn and how I work" at a meta level.

I don't think this workflow is finished. I'm still experimenting.

---

### FAQ V-04. You call yourself an "AI era developer" — but are you a programmer or a PM?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.pm_or_developer.default` |
| Intent ID | `vision.pm_or_developer` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `PM or developer`, `what is your role`, `position`, `aren't you a PM`, `which one are you`, `developer or product manager` |
| Source Chunk IDs | `career.target_role`, `profile.strengths`, `profile.ai_workflow`, `project.askoosu.fact` |
| Visibility | `public` |

**Short Answer**

Honestly — both. And I think those two might not need to be separate categories anymore.

**Default Answer**

This question feels like a taxonomy from the old world.

Previously, "the person who decides what to build" and "the person who builds it" were different people. PMs set direction, developers implemented. The division of labor existed because it was hard for one person to excel at both.

When AI takes on a large portion of implementation, the rationale for that division starts to break down. "Someone who judges what to build while also directly building it" becomes possible.

I'm the person running experiments at that boundary. In AskOosu, I was simultaneously PM (what to build, what the UX should be, what guardrails are needed) and developer (RAG architecture, API routing, frontend components).

**Detailed Answer**

To be honest about the positions I'm preparing for — there are two.

**When there's a team: PM role**
A PM who understands technical context, sets product direction, and communicates meaningfully with developers and designers. I think "technical PM" becomes more important in the AI era. Teams using AI will need someone who designs the AI usage approach itself and optimizes the workflow.

**When working solo or in a small group: Product Owner + execution**
I set the direction and directly develop while orchestrating AI agents. This is what I think of as the next stage beyond "full-stack" — not crossing technology layers, but covering the judgment layer and the execution layer simultaneously.

Right now I'm a junior developer. I'm not denying that. But what I'm building isn't "a good junior developer" — it's "a new role that the AI era needs."

---

### FAQ V-05. Is learning to code the right move in the AI era?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.learning_dev_now.default` |
| Intent ID | `vision.learning_dev_now` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `is learning to code the right move now`, `do you need to learn coding in the AI era`, `developer outlook`, `why learn development if AI does it all` |
| Source Chunk IDs | `career.timeline`, `profile.current_focus`, `profile.ai_workflow` |
| Visibility | `public` |

**Short Answer**

Yes, I think so. But for different reasons than before.

**Default Answer**

I asked myself this question seriously — when I started my third bootcamp.

"Does it make sense to learn coding if AI writes the code?" My answer is this.

The goal isn't to learn coding. **The goal is to develop the ability to understand and evaluate what AI produces.**

Whether AI-written code is wrong, whether this architecture will cause problems later, how this API design feels from a client's perspective — to judge these things, you need the experience of having built things yourself.

Building AskOosu, I designed the RAG pipeline directly. Being able to judge why FAQ cache and RAG routing needed to be separated, why this chunk size affects retrieval quality — that was possible because I built things myself, failed, and learned from those failures.

**The reason to learn coding is to better direct AI.** And that capability is becoming more important, not less.

**Detailed Answer**

To be more candid — learning development right now serves two distinct purposes.

**First: to improve the quality of collaboration with AI**
To ask AI not "build this for me" but "I think this design will cause an N+1 problem — how should we handle it?" — I need to already understand the concept. Learning JPA query optimization while studying Spring Boot, learning async handling while studying Python — this isn't primarily to implement things directly; it's to have more sophisticated conversations with AI.

**Second: to build a foundation for judgment**
Even working as a PM or Product Owner, I need to understand technology to judge how technical decisions affect the business. To be a PM who can ask a developer "why does this take two weeks?" — I need some level of technical fluency myself.

So yes — I think learning now is right. But for reasons that differ from before: not "for employment," not "for coding ability itself," but for something else.

---

### FAQ V-06. How would you summarize your perspective on AI in one phrase?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.ai_philosophy_summary.default` |
| Intent ID | `vision.ai_philosophy_summary` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `thoughts on AI`, `AI philosophy`, `how do you see AI`, `AI perspective`, `attitude toward AI` |
| Source Chunk IDs | `profile.ai_workflow`, `profile.values`, `profile.long_intro` |
| Visibility | `public` |

**Short Answer**

AI isn't a tool. It's closer to a teammate. But not a teammate who follows instructions well — it's a teammate who needs direction from me to do its job.

**Default Answer**

Calling AI a "tool" feels like an underestimation. Calling it a "colleague" feels like over-anthropomorphizing.

The analogy I find closest is **"an exceptionally capable new hire with no context."** Executes fast and well — but I have to continuously explain why this matters, and how this decision connects to everything else.

So the core capability for working well with AI is **"communicating context clearly."** More than writing good prompts — it's structuring and conveying "why this decision matters in this project" in a way AI can actually process.

I've been deliberately training toward that. Breaking down complex data for clients at GfK, operating OosuSalon where I had to understand and decide on all service context alone, structuring user context in UX bootcamp — all of this connects to "context delivery capability" when working with AI.

**Detailed Answer**

As AI agents multiply, I think the **orchestrator role** becomes the most critical.

Working with multiple AI agents simultaneously — Claude Code, Gemini CLI, Codex — understanding each one's strengths, deciding which judgments to delegate where, integrating each agent's output, and steering everything in a consistent direction. That's the orchestrator's job.

It's like a conductor. A conductor doesn't need to play violin as well as the violinist. But they need to know how the full piece should sound, what role each section plays, and when to bring whom forward.

I think the AI era developer increasingly resembles that conductor. And I think I have the background to do that role well — data analytics, service operations, UX design, full-stack development experience all connect to "the ability to understand the full context while coordinating each part."

---

### FAQ V-07. Isn't working alone with AI lonely or inefficient?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.solo_ai_work.default` |
| Intent ID | `vision.solo_ai_work` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `solo development`, `working alone with AI`, `working without a team`, `AI collaboration`, `solo development` |
| Source Chunk IDs | `profile.work_style`, `project.askoosu.fact`, `career.oosu_salon` |
| Visibility | `public` |

**Short Answer**

Lonely — yes, that's fair. Inefficient — I'm still not sure. At least in my experience so far, it's been reasonably efficient.

**Default Answer**

I spent five years running OosuSalon solo. The pattern was similar — every decision was mine alone, no one to check with, every mistake landed on me.

What I learned: when working alone, the most important thing is **"how you check the possibility that you're wrong."**

Same with AI. A loop for verifying whether the direction AI suggests is actually right — building it, testing it, finding the flaw faster than expected, correcting course. That's the core routine of solo work.

On the efficiency question — at least for "well-defined execution," it can be faster than a team. No communication overhead, decisions are immediate. For "exploratory problem-solving," I think multiple perspectives still hold real value.

**Detailed Answer**

How I manage the loneliness — I use conversations with AI as a kind of "review session." Instead of getting code reviewed by a teammate, I ask Claude: "what am I missing in this design?"

I know this can't fully replace a human reviewer. AI can't judge "how will this feature actually feel to a user?" or "how will I feel about this code six months from now?" So even in a team environment, I think human collaboration remains necessary.

But what I've discovered — a well-prompted AI conversation **can maintain a degree of critical feedback loop even without teammates**. Imperfect, but far better than nothing, and it catches more than you'd expect.

---

### FAQ V-08. Why build a portfolio as an AI chatbot?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.why_chatbot_portfolio.default` |
| Intent ID | `vision.why_chatbot_portfolio` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `why build a chatbot portfolio`, `why chat format`, `why AI portfolio`, `what makes it different from a normal portfolio`, `why did you build AskOosu` |
| Source Chunk IDs | `project.askoosu.fact`, `profile.long_intro`, `profile.values` |
| Visibility | `public` |

**Short Answer**

I thought a portfolio could be a place for conversation, not just a place to display information. And I thought that was the more appropriate format for the AI era.

**Default Answer**

The problem with conventional portfolios: visitors have to read from start to finish to find what they're looking for. Recruiters usually spend 3–5 minutes. In that time, they need to judge "is this person someone I need?" 

The chat format solves that. You can directly ask "does this person have AI project experience?" You get a well-prepared answer immediately, and can follow up if curious.

This isn't just a "trick for differentiation." I think how people consume information is genuinely changing in the AI era — from "reading long documents to find what you want" to "asking directly for what you want." A portfolio should reflect that shift first.

And honestly — it's also the format that best demonstrates my perspective. Explaining "how to integrate AI into a product" in words is far less convincing than building it and showing it.

**Detailed Answer**

A few specific design decisions in building AskOosu.

**Why a RAG + FAQ cache hybrid structure**
Pure RAG alone produces inconsistent answer quality. Especially for questions recruiters frequently ask — "aren't you too dependent on AI?", "do you have team project experience?" — these need pre-crafted, carefully worded answers to build trust. So: FAQ cache serves curated answers first; RAG handles questions that aren't covered.

**Why guardrails were designed first**
The biggest risk in an AI portfolio is "AI saying something wrong with confidence." If my portfolio's AI claims a project I don't have, or inflates my capabilities, trust collapses instantly. So I defined "what must never be said" first — fabricated metrics, presenting incomplete information as complete, impersonating first-person voice.

This guardrail design is actually what I'm most proud of in this portfolio. More than the technical implementation — it's a product judgment that puts "making sure the AI doesn't mislead portfolio visitors" before everything else.

---

### FAQ V-09. Five years from now, what do you hope to look like?

| Field | Content |
| --- | --- |
| FAQ ID | `faq.vision.five_year_future.default` |
| Intent ID | `vision.five_year_future` |
| Entity ID | `visitor` |
| Cache Mode | `direct_cache` |
| Patterns | `five years from now`, `future plans`, `career goals`, `what do you think you'll become`, `long-term goals` |
| Source Chunk IDs | `career.target_role`, `profile.values`, `profile.current_focus` |
| Visibility | `public` |

**Short Answer**

I want to be someone who designs how people work with AI. Not as a developer, not as a PM — but in a role that moves between those boundaries.

**Default Answer**

Predicting five years from now with any precision is difficult — honestly, impossible. I don't know how AI technology will evolve, which roles will emerge, which will disappear.

So I think in terms of **capability direction** rather than specific titles.

Capabilities I hope are still valuable in five years:
- Rapidly identifying what AI agents do well and what they don't
- Structuring complex problems into units AI can handle
- Connecting technical decisions to product and business meaning
- Quickly integrating new tools into the workflow as they emerge

These are all capabilities I'm building right now. I hope they're more solid in five years.

In terms of title — something like designing and leading how an AI-powered team works, or connecting technology and business as a bridge role.

**Detailed Answer**

To be more candid — two scenarios both seem plausible.

**Scenario A: Inside an organization**
Designing and optimizing the team's development workflow including AI usage. Deciding how developers use AI, which judgments to delegate to AI and which to keep human — someone who owns that workflow design within the organization. Could be closer to Engineering Manager, could be closer to Technical PM.

**Scenario B: Independently**
As Product Owner, building and operating products with AI agents. I have the experience of operating something directly — OosuSalon — and that mode of working is becoming more viable in the AI era. Someone who can build and run meaningful services without a team.

Both scenarios connect to the capabilities I'm training right now. I don't know which direction it'll be, but I'm making progress toward being ready for either.

---

## 18. Question Surface Registry — Additional Content Extension

### New Surface: `oosu_philosophy`

> This surface activates when a visitor is curious about Oosu's perspective on AI or future vision, or asks about positioning as an "AI era developer."

| Priority | Quick Label | Display Question | FAQ ID | Answer Variant | RenderSpec |
| --- | --- | --- | --- | --- | --- |
| 1 | `AI-era competitiveness` | `Can a developer who relies heavily on AI tools still be competitive?` | `faq.vision.ai_developer_future.default` | `default` | `vision_card` |
| 2 | `Future of teams` | `Will team projects still matter in the AI era?` | `faq.vision.team_future.default` | `default` | `vision_card` |
| 3 | `PM or developer` | `At the end of the day — PM or developer?` | `faq.vision.pm_or_developer.default` | `default` | `vision_card` |
| 4 | `AI workflow` | `How did your AI collaboration approach develop?` | `faq.vision.ai_workflow_origin.default` | `default` | `vision_card` |
| 5 | `AI philosophy` | `How would you summarize your perspective on AI?` | `faq.vision.ai_philosophy_summary.default` | `default` | `vision_card` |
| 6 | `Learning dev now` | `Is learning to code the right call in the AI era?` | `faq.vision.learning_dev_now.default` | `default` | `vision_card` |
| 7 | `Chatbot portfolio` | `Why build a portfolio as an AI chatbot?` | `faq.vision.why_chatbot_portfolio.default` | `default` | `vision_card` |
| 8 | `Solo AI work` | `Isn't working alone with AI lonely or inefficient?` | `faq.vision.solo_ai_work.default` | `default` | `vision_card` |
| 9 | `Five-year vision` | `Five years from now — what do you hope to look like?` | `faq.vision.five_year_future.default` | `default` | `vision_card` |

### `oosu_philosophy` Surface Display Logic

```text
oosu_philosophy surface trigger conditions:
- Visitor asks about Oosu's AI usage approach or future vision
- Visitor's question includes keywords like "AI era", "future", "team", "PM", "Product Owner", "orchestrator"
- Visitor asks directly about Oosu's perspective or opinions

When oosu_philosophy activates:
- Display 3-4 high-relevance philosophy questions on the surface
- Answers always returned in `default` or `detailed` variant (`short` minimized)
- Where supported, display "Oosu's Perspective" badge in UI
- After answer, suggest 2 related philosophy questions as follow-up chips
```

---

## 19. Rich Answer Rendering — Additional Content Extension

### New RenderSpec: `vision_card`

| Component | Content |
| --- | --- |
| Header | Question label + "Oosu's Perspective" badge |
| Body | Two-part structure: direct observation/experience → thinking or bet that emerges from it |
| Footer | Optional: "View related project" or "Ask for more detail" follow-up chips |
| Tone badge | `personal_take` (distinct from recruiter-defense `honest_assessment`) |

This component should feel like the answers are "something Oosu directly experienced and thought about" — not "official position statements." The tone of honestly sharing thoughts that could turn out to be wrong is what matters.

---

## Open TODO — Additional Content Items

| Priority | TODO |
| --- | --- |
| 0 | Integrate vision FAQ IDs (V-01 ~ V-09) into `data/faq-answers.en.ts` |
| 0 | Register `oosu_philosophy` surface in `data/question-surfaces.en.ts` |
| 1 | Build `VisionCard.tsx` component in `components/chat/rich/` |
| 1 | Add philosophy surface trigger detection logic to `/api/chat` routing |
| 2 | Verify EN and KO philosophy surfaces stay in sync as content evolves |
| 3 | Monitor which philosophy questions get the most engagement via visitor feedback |
| 4 | Confirm surface logic keeps `vision_card` tone separate from recruiter defense answers |
