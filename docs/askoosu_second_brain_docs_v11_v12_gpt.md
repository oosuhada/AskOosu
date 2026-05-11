첨부 문서를 먼저 훑어서 기존 Wiki의 톤과 구조를 파악한 뒤, 최근 AI 면접 질문 유형은 공개 자료 기준으로 조심스럽게 참고해서 “추가 문서 초안” 형태로 정리하겠습니다. 기존 내용을 갈아엎기보다 RAG에 붙이기 쉬운 add-on 섹션으로 맞추겠습니다.

문서 구조를 확인해 보니 이미 AI-Native Working Thesis, Recruiter Risk, Answer Quality Loop, Code Review with AI가 있어서, 새 내용은 완전히 새 철학이 아니라 “AI 시대 면접 질문 전용 answer bank”로 붙이는 게 가장 자연스럽습니다. 특히 기존 톤은 3인칭, 근거 중심, 과장 금지, fallback 명시가 강합니다.

Thought for 1m 38s

최근 공개 자료 기준으로는, AI 코딩 도구를 “금지할지/허용할지”를 넘어서 AI를 쓰면서도 이해·검증·디버깅할 수 있는지를 보는 방향이 점점 중요해지고 있습니다. 예를 들어 Google이 일부 소프트웨어 엔지니어 인터뷰에서 Gemini 사용을 허용하는 파일럿을 준비 중이라는 보도가 있고, OpenAI Codex와 Anthropic Claude Code도 단순 자동완성이 아니라 코드베이스를 읽고 수정·테스트·PR 제안까지 수행하는 에이전트형 도구로 설명됩니다. 따라서 아래 초안은 “AI보다 인간이 위대하다”가 아니라, AI를 현실의 맥락·사용자·품질 기준·제품 판단에 연결하는 개발자라는 방향으로 설계했습니다.

AI 시대의 개발자 경쟁력 Wiki 추가 초안
1. 추가해야 할 핵심 포지셔닝 요약

기존 AskOosu 문서의 정체성은 이미 명확합니다.

AI-connected Fullstack Developer
AI-native product builder
고객 경험, 데이터 분석, 브랜드 운영, UX, 프론트엔드, 백엔드, RAG를 연결하는 사람
과장보다 근거, 예측보다 working thesis, 대체보다 연결
AI를 많이 쓰지만, AI 결과물을 검토하고 책임지는 사람
작은 팀에서는 넓게 움직이고, 큰 팀에서는 PM·디자인·개발 언어를 연결하는 사람

새로 추가할 포지셔닝은 다음 한 문장으로 정리하는 것이 좋습니다.

우수의 AI 시대 경쟁력은 AI가 못 하는 일을 신비화하는 데 있지 않고, AI가 잘하는 실행 능력을 현실의 사용자 문제, 제품 맥락, 품질 기준, 취향과 판단에 연결하는 데 있습니다.

조금 더 짧게는:

우수는 AI와 경쟁하는 개발자가 아니라, AI를 현실의 제품 문제에 연결하는 개발자입니다.

핵심 프레임은 Context Connector / Tasteful Validator / AI-Orchestrated Builder입니다.

프레임	의미	기존 Wiki와 연결
Context Connector	AI가 모르는 현실의 사용자, 비즈니스, 팀 맥락을 제품 판단에 연결	Product Build Loop, Collaboration with AI and Humans
Tasteful Validator	AI 결과물을 사용자 입장에서 보고, UX·카피·흐름·신뢰감을 다듬음	Flai Trust and Clarity Lessons, Sticks & Stones, 우수살롱
AI-Orchestrated Builder	Codex, Claude, GPT, Gemini 등을 역할별로 나누어 실행 속도를 높임	AI Agent Workflow, Prompt Delegation Patterns
Evidence-Based Communicator	근거가 있는 답변과 모르는 것을 구분함	Answer Quality Loop, Source/Confidence Badge
Long-Form Learner	한 주제에 꽂히면 문서화·실험·개선 루프로 깊게 파고듦	RAG Second Brain Operating Model, Postmortem Docs
2. 면접 예상 질문 목록
1. 당신이 할 수 있는 일 중에서 AI가 대체하지 못하는 일은 무엇인가요?
질문 의도
AI 시대에 본인의 역할을 방어적으로 설명하는지, 실제로 AI와 협업하는 관점이 있는지 확인.
답변 핵심
AI가 절대 못 한다는 식의 인간 찬양보다, AI가 실행은 잘하지만 현실 맥락, 사용자 판단, 취향, 책임, 우선순위 설정은 사람이 연결해야 한다고 답변.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI가 대체하지 못하는 일을 “코드를 직접 치는 능력” 하나로 보지 않습니다. AI가 만든 결과물을 현실의 사용자 문제, 제품 맥락, UX 흐름, 신뢰 기준에 맞게 판단하고 다듬는 일이 더 중요해지고 있다고 봅니다. 그래서 우수의 경쟁력은 AI와 경쟁하는 것이 아니라, AI를 현실의 제품 문제에 연결하는 데 있습니다.
근거로 연결할 Wiki 섹션
AI Agent Workflow, Product Build Loop, Code Review with AI, Flai Trust and Clarity Lessons, why-not-overclaim-ai-era-ko
2. AI를 많이 쓰면 개발자로서 기본기가 부족한 것 아닌가요?
질문 의도
AI 의존도와 실제 이해도, 코드 검증 능력을 확인.
답변 핵심
AI 사용을 숨기지 말고, 검증 기준을 말해야 함. 파일 구조, API 계약, 상태 흐름, 보안, 에러 처리, 유지보수성을 직접 확인한다는 점 강조.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI를 많이 쓰는 개발자가 맞습니다. 다만 AI가 만든 결과물을 그대로 받아들이는 방식이 아니라, 실제 파일 구조, API 계약, UI 상태, 보안, 유지보수성을 기준으로 검토합니다. 핵심은 AI가 코드를 써줬는지가 아니라, 그 결과를 이해하고 제품에 책임 있게 통합할 수 있는지입니다.
근거로 연결할 Wiki 섹션
Code Review with AI, Prompt Delegation Patterns, Answer Quality Loop, AskOosu RAG Lessons
3. AI 시대에 주니어 개발자의 가치는 어디에 있다고 보나요?
질문 의도
주니어로서 실행력만이 아니라 학습 방식, 검증 태도, 성장 방향을 갖고 있는지 확인.
답변 핵심
주니어의 가치는 “AI 없이 더 빨리 타이핑”이 아니라, 빠르게 배우고, 모르는 것을 드러내며, AI 결과물을 검증 가능한 결과물로 바꾸는 능력.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI 시대의 주니어 경쟁력을 “혼자 다 아는 것”보다 “빠르게 배우고, AI 결과물을 검증 가능한 제품 단위로 연결하는 것”에 둡니다. 모르는 부분은 숨기지 않고 문서화하며, 실패 질문이나 오류를 다음 개선 루프로 연결하는 방식이 강점입니다.
근거로 연결할 Wiki 섹션
Answer Quality Loop, RAG Second Brain Operating Model, AI Portfolio Overdocumentation Risk, profile.growth
4. AI가 생성한 코드가 틀렸을 때 어떻게 알아차리나요?
질문 의도
코드 이해, 디버깅, 테스트, 검증 능력 확인.
답변 핵심
“돌아가는지”만 보지 않고, 실제 파일 구조, 타입/API 계약, loading/error/empty/success 상태, secret 노출, UX 영향까지 확인.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI 코드가 맞는지 볼 때 단순히 컴파일 여부만 확인하지 않습니다. 실제 파일 구조와 API 응답 필드가 맞는지, UI 상태가 빠지지 않았는지, secret이나 private 정보가 노출되지 않는지, 사용자가 이해할 수 있는 흐름인지까지 확인합니다. AI 코드는 초안이고, 제품에 들어가는 판단은 사람이 책임진다는 기준을 갖고 있습니다.
근거로 연결할 Wiki 섹션
Code Review with AI, Prompt Delegation Patterns, Definition of Done
5. AI 도구를 어떻게 역할별로 나눠 쓰나요?
질문 의도
단순히 “ChatGPT 씁니다” 수준이 아니라, 도구별 장단점과 작업 분배 능력이 있는지 확인.
답변 핵심
Claude/GPT는 구조화와 문서, Codex는 실제 코드베이스 작업, Gemini/Perplexity/Liner는 최신 정보와 레퍼런스 확인, Groq는 비용 민감한 답변 생성처럼 역할 분리.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI 도구를 하나의 만능 도구처럼 쓰기보다 역할별로 나눠 사용합니다. 구조 설계와 긴 문서 정리는 Claude/GPT, 실제 파일 수정과 리팩터링은 Codex, 최신 정보와 레퍼런스 확인은 Gemini·Perplexity·Liner, 비용 민감한 답변 생성은 Groq처럼 배치합니다. 중요한 것은 도구 이름보다 작업 범위, 금지사항, 검증 기준을 명확히 주는 방식입니다.
근거로 연결할 Wiki 섹션
AI Agent Workflow, Prompt Delegation Patterns
6. “AI와 협업한다”는 말이 구체적으로 무슨 뜻인가요?
질문 의도
AI 협업을 추상적 유행어로 쓰는지, 실제 워크플로가 있는지 확인.
답변 핵심
문제 정의 → 구조 설계 → 구현 위임 → 검토 → 오류 수정 → 문서화 → FAQ/RAG 반영까지의 루프.
AskOosu에 넣을 수 있는 짧은 답변
우수에게 AI와 협업한다는 것은 단순히 프롬프트를 잘 쓰는 것이 아닙니다. 문제 정의, 화면 흐름, API 구조, 구현, 디버깅, 문서화, 답변 품질 개선까지 작업을 단계별로 나누고, AI에게 맡길 범위와 사람이 판단할 범위를 구분하는 방식입니다. AskOosu의 RAG 문서와 FAQ cache 구조가 그 워크플로의 대표 사례입니다.
근거로 연결할 Wiki 섹션
AI Agent Workflow, Product Build Loop, RAG Second Brain Operating Model
7. AI가 있는데 왜 RAG나 Second Brain을 직접 만들었나요?
질문 의도
단순 챗봇 구현인지, 정보 구조와 신뢰 설계에 대한 이해가 있는지 확인.
답변 핵심
LLM만으로는 개인 포트폴리오의 정확한 근거를 보장하기 어렵기 때문에, Notion Wiki, FAQ cache, RAG, source/confidence badge를 분리.
AskOosu에 넣을 수 있는 짧은 답변
AskOosu는 단순히 AI에게 자기소개를 맡긴 프로젝트가 아닙니다. Notion은 사람이 편집하는 기억, PostgreSQL은 검색 가능한 기억, FAQ cache는 반복 질문용 안정 답변, RAG는 복합 질문용 근거 검색으로 나뉩니다. 우수는 AI 답변의 자연스러움보다, 어떤 근거로 어디까지 답할 수 있는지를 더 중요하게 봅니다.
근거로 연결할 Wiki 섹션
RAG Second Brain Operating Model, why-cache-first-rag-next-ko, why-source-confidence-badges-ko, AskOosu RAG Lessons
8. AI 제품에서 가장 중요한 UX 원칙은 무엇이라고 보나요?
질문 의도
AI 기능을 붙이는 것과 실제 사용자 신뢰를 만드는 것을 구분하는지 확인.
답변 핵심
AI가 무엇을 알고 모르는지 구분하는 UI, fake progress나 검증 안 된 수치 금지, 실패 상태 설계.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI 제품의 신뢰가 화려한 문구보다 “아는 것과 모르는 것을 정확히 구분하는 UI”에서 나온다고 봅니다. Flai에서 fake progress나 검증되지 않은 source count 표현을 경계한 것도 같은 이유입니다. AI 설명은 결과를 대신하는 것이 아니라, 사용자가 결과를 이해하도록 돕는 역할이어야 합니다.
근거로 연결할 Wiki 섹션
Flai Trust and Clarity Lessons, Product Build Loop, Answer Quality Loop
9. AI 시대에도 팀 협업이 필요하다고 보나요?
질문 의도
AI-native 성향이 협업 회피로 이어지는지 확인.
답변 핵심
팀을 대체한다기보다 팀의 기본 단위와 역할 분담이 바뀔 수 있음. 사람 팀 안에서는 공통 언어와 판단 연결자가 중요.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI가 팀을 완전히 대체한다고 보지 않습니다. 다만 AI로 한 사람이 탐색할 수 있는 범위가 넓어지면서, 작은 팀에서는 더 넓은 ownership이 중요해질 수 있다고 봅니다. 큰 팀에서는 PM, 디자이너, 개발자의 언어를 연결하고 AI 결과물을 팀 기준에 맞게 정리하는 역할로 기여할 수 있습니다.
근거로 연결할 Wiki 섹션
Collaboration with AI and Humans, why-small-team-wide-ownership-positioning-ko, why-not-overclaim-ai-era-ko
10. 본인의 취향이나 센스가 개발 경쟁력과 어떻게 연결되나요?
질문 의도
감각적 배경이 단순 취미인지, 제품 품질 판단으로 연결되는지 확인.
답변 핵심
와인바 운영, 향/와인/공간 경험, UX 디자인 경험은 사용자가 느끼는 디테일과 신뢰감을 판단하는 감각으로 연결.
AskOosu에 넣을 수 있는 짧은 답변
우수의 취향과 감각은 개발과 분리된 취미라기보다, 사용자가 결과물을 어떻게 느끼는지 판단하는 기준으로 연결됩니다. 우수살롱 운영, 브랜드 경험, 공간과 메뉴 설계, Sticks & Stones 리빌드 경험은 화면의 기능뿐 아니라 분위기, 흐름, 신뢰감을 함께 보는 배경이 되었습니다. AI가 결과물을 많이 만들어낼수록, 어떤 결과가 사용자에게 자연스럽고 설득력 있는지 판단하는 눈이 더 중요해진다고 봅니다.
근거로 연결할 Wiki 섹션
Profile, 우수살롱-개발 연결 FAQ, Sticks & Stones, Uncorked, Flai Trust and Clarity Lessons
11. 시키지 않아도 먼저 해보는 성향이 실제 업무에서는 어떻게 장점이 되나요?
질문 의도
initiative가 산만함이 아니라 책임 있는 실행으로 이어지는지 확인.
답변 핵심
문제 발견 → 빠른 프로토타입 → 검토 → 문서화 → 개선 루프. 단, 범위 확장을 통제해야 함.
AskOosu에 넣을 수 있는 짧은 답변
우수는 새로운 도구나 아이디어를 보면 직접 프로젝트에 적용해보는 성향이 강합니다. 이 성향은 AskOosu처럼 포트폴리오를 정적인 페이지에서 질문 기반 인터페이스로 바꾸는 실행력으로 이어졌습니다. 다만 관심사가 넓어질 수 있다는 점도 인식하고 있어, 최근에는 완료 기준과 우선순위를 먼저 정해 범위를 관리하려고 합니다.
근거로 연결할 Wiki 섹션
Product Build Loop, profile.growth, AskOosu RAG Lessons, AI Portfolio Overdocumentation Risk
12. AI를 쓰지 않는 사람과 쓰는 사람의 격차를 어떻게 보나요?
질문 의도
AI 도구에 대한 현실 감각과 과장 없는 관점 확인.
답변 핵심
격차는 생기지만, “AI를 쓰기만 하면 된다”가 아니라 검증과 적용 능력에서 차이가 생김.
AskOosu에 넣을 수 있는 짧은 답변
우수는 AI 도구를 쓰는 사람과 쓰지 않는 사람의 격차가 커질 가능성이 있다고 봅니다. 하지만 단순히 AI를 많이 쓰는 것만으로 경쟁력이 생긴다고 보지는 않습니다. 중요한 차이는 AI 결과물을 현실의 코드베이스, 사용자 흐름, 제품 기준에 맞게 검증하고 적용할 수 있는지에서 생긴다고 봅니다.
근거로 연결할 Wiki 섹션
AI Agent Workflow, Code Review with AI, why-not-overclaim-ai-era-ko
3. “AI가 대체하지 못하는 일”에 대한 대표 답변 초안
한국어 버전 — AskOosu용 3인칭

우수는 “AI가 절대 대체하지 못하는 일”을 인간만의 신비한 능력으로 포장하기보다, AI가 아직 현실과 직접 연결되어 있지 않다는 점에서 출발해 설명하는 편이 자연스럽습니다.

LLM은 비유하자면 섬에 고립된 채 많은 책을 가지고 있는 존재에 가깝습니다. 엄청난 지식을 가지고 있고 실행도 빠르지만, 지금 이 사용자가 무엇을 불편해하는지, 이 제품이 어떤 맥락에서 신뢰를 잃는지, 어떤 화면이 자연스럽고 어떤 표현이 과장되어 보이는지는 실제 세계와 계속 연결된 사람이 판단해야 합니다.

우수의 경쟁력은 바로 그 연결에 있습니다. 고객 경험, 데이터 분석, 브랜드 운영, UX, 프론트엔드와 백엔드, RAG 실험을 거치며 문제를 사용자 입장에서 보고, AI가 만든 결과물을 제품 기준으로 검토하고 다듬는 쪽에 강점이 있습니다.

그래서 우수는 AI와 경쟁하려고 하지 않습니다. 경쟁자는 AI 자체라기보다 AI를 더 잘 활용하는 사람들입니다. AI 시대에는 “AI가 나를 대체하느냐”보다 “내가 AI를 얼마나 현실의 문제와 잘 연결하고, 그 결과를 책임 있게 검증하느냐”가 더 중요하다고 봅니다.

English Version — AskOosu-style third person

Oosu would not frame this as “humans are special and AI can never replace us.” A more accurate framing is that AI is powerful, but it is still disconnected from many real-world contexts.

An LLM can be imagined as a highly capable system on an island with a massive library. It can read, generate, and execute quickly, but it does not directly live with the user’s frustration, the product’s trust problem, the team’s constraints, or the subtle difference between a technically correct result and a genuinely useful experience.

Oosu’s strength is in connecting those two sides. Through customer experience, data analysis, brand operation, UX, frontend/backend development, and RAG experiments, he has built a habit of reviewing outputs from the user’s point of view and turning AI-generated drafts into product decisions.

So Oosu does not see AI as the competitor. The real competition is with people who know how to use AI well. In the AI era, the important question is less “Will AI replace me?” and more “How well can I connect AI to real users, real context, and responsible product judgment?”

4. RAG/FAQ에 넣기 좋은 Q&A 초안
FAQ AI-COMP-01. AI가 대체하지 못하는 개발자의 일은 무엇인가요?
Field	Content
FAQ ID	faq.ai_competitiveness.irreplaceable_work.default
Intent ID	ai_competitiveness.irreplaceable_work
Entity ID	ai_usage
Cache Mode	direct_cache
Patterns	AI가 대체하지 못하는 일, AI 시대 개발자 경쟁력, AI가 개발자를 대체, AI can't replace, what can you do that AI cannot
Source Chunk IDs	ops.ai-agent-workflow.ko, ops.product-build-loop.ko, ops.code-review-with-ai.ko, postmortem.flai-trust-clarity-lessons.ko, decision.why-not-overclaim-ai-era.ko
Visibility	public
Freshness	stable
Confidence	medium_high

Short Answer

AI가 대체하기 어려운 일은 단순히 코드를 직접 치는 일이 아니라, 현실의 사용자 문제와 제품 맥락을 이해하고 AI 결과물을 판단·검증·다듬는 일입니다. 우수는 AI와 경쟁하기보다 AI를 현실의 문제에 연결하는 개발자를 지향합니다.

Default Answer

우수는 “AI가 절대 못 하는 일”을 인간만의 신비한 능력처럼 말하지 않습니다. 대신 AI가 강한 영역과 사람이 책임져야 할 영역을 구분합니다.

AI는 코드를 만들고, 문서를 요약하고, 대안을 빠르게 제시하는 데 강합니다. 하지만 어떤 문제가 진짜 사용자에게 중요한지, 어떤 표현이 과장되어 보이는지, 어떤 UI가 신뢰를 주는지, 어떤 구현이 나중에 유지보수 리스크가 되는지는 사람이 맥락을 가지고 판단해야 합니다.

우수의 경쟁력은 그 연결에 있습니다. AI가 만든 결과물을 사용자 입장, 제품 기준, 코드 품질, 공개 범위, 신뢰 UX 기준으로 검토하고 실제 프로젝트에 적용 가능한 형태로 다듬는 것입니다. 그래서 우수는 AI와 경쟁하는 사람이 아니라, AI를 현실의 제품 문제와 연결하는 개발자에 가깝습니다.

FAQ AI-COMP-02. AI 시대에 우수의 경쟁자는 누구인가요?
Field	Content
FAQ ID	faq.ai_competitiveness.real_competitor.default
Intent ID	ai_competitiveness.real_competitor
Entity ID	ai_usage
Cache Mode	direct_cache
Patterns	AI와 경쟁, AI가 경쟁자, AI 시대 경쟁자, your competitor is AI, competing with AI
Source Chunk IDs	ops.ai-agent-workflow.ko, ops.prompt-delegation-patterns.ko, decision.why-ai-native-working-thesis.ko
Visibility	public
Freshness	stable
Confidence	medium_high

Short Answer

우수는 AI 자체를 경쟁자로 보지 않습니다. 더 정확히는 AI를 잘 활용해 문제 정의, 실행, 검증 속도를 높이는 사람들이 경쟁자라고 봅니다.

Default Answer

우수는 AI와 경쟁하려고 하지 않습니다. AI가 점점 더 많은 실행을 도와주는 흐름은 피하기 어렵기 때문에, 중요한 기준은 AI를 쓰느냐 안 쓰느냐보다 어떻게 쓰고 검증하느냐에 가깝습니다.

그래서 우수의 실제 경쟁자는 AI 자체가 아니라 AI를 잘 활용하는 사람들입니다. 좋은 질문을 던지고, 작업 범위를 나누고, 결과를 검증하고, 실제 제품 맥락에 맞게 적용하는 사람이 더 빠르게 성장할 가능성이 큽니다.

우수는 이 변화에 방어적으로 대응하기보다, Codex, Claude, GPT, Gemini 같은 도구를 역할별로 나눠 쓰며 실제 프로젝트에 적용하는 방식으로 적응하고 있습니다.

FAQ AI-COMP-03. AI를 잘 쓰는 것과 AI에 의존하는 것은 어떻게 다른가요?
Field	Content
FAQ ID	faq.ai_competitiveness.ai_fluency_vs_dependency.default
Intent ID	ai_competitiveness.ai_fluency_vs_dependency
Entity ID	ai_usage
Cache Mode	direct_cache
Patterns	AI 의존, AI를 잘 쓰는 것, AI 없으면 개발 못 하나요, AI dependency, AI fluency
Source Chunk IDs	ops.code-review-with-ai.ko, ops.prompt-delegation-patterns.ko, ops.definition-of-done.ko
Visibility	public
Freshness	stable
Confidence	medium_high

Short Answer

AI에 의존하는 것은 결과를 이해하지 못한 채 받아들이는 것이고, AI를 잘 쓰는 것은 목표·범위·검증 기준을 정한 뒤 결과를 책임지고 통합하는 것입니다.

Default Answer

우수는 AI를 많이 쓰지만, 그것을 “AI가 대신 해준다”로 설명하지 않습니다. AI에 의존하는 방식은 결과물을 이해하지 못한 채 받아들이고, 문제가 생겼을 때 어디서 잘못됐는지 찾지 못하는 방식입니다.

반대로 AI를 잘 쓰는 방식은 목표, 수정 범위, 금지사항, 테스트 기준을 먼저 정하고 AI에게 작업을 맡긴 뒤, 실제 파일 구조와 제품 흐름 안에서 결과를 검토하는 것입니다. 우수는 이 기준을 코드 리뷰, RAG 답변 품질, UX 상태, 보안 검토에 적용하려고 합니다.

FAQ AI-COMP-04. AI가 만든 결과물을 어떻게 사용자 관점에서 다듬나요?
Field	Content
FAQ ID	faq.ai_competitiveness.user_review.default
Intent ID	ai_competitiveness.user_review
Entity ID	product_ux
Cache Mode	direct_cache
Patterns	사용자 관점, AI 결과물 검토, UX 감각, taste, product judgment
Source Chunk IDs	ops.product-build-loop.ko, postmortem.flai-trust-clarity-lessons.ko, profile.oosu_salon, project.sticks_and_stones.story
Visibility	public
Freshness	stable
Confidence	medium_high

Short Answer

우수는 AI 결과물을 기능 단위로만 보지 않고, 사용자가 이해할 수 있는 흐름인지, 신뢰를 주는 표현인지, 불필요한 과장이 없는지 기준으로 다시 검토합니다.

Default Answer

AI가 만든 결과물은 빠르지만, 사용자가 실제로 이해하고 신뢰할 수 있는지는 별개의 문제입니다. 우수는 기능이 동작하는지만 보지 않고, 사용자가 어떤 순서로 정보를 받아들이는지, 어떤 표현이 과장되어 보이는지, 실패 상태가 어떻게 보이는지까지 확인하려고 합니다.

Flai에서 fake progress나 검증되지 않은 source count 표현을 경계한 것도 같은 맥락입니다. AI 제품은 “똑똑해 보이는 말”보다 사용자가 무엇을 믿어도 되는지 분명히 알려주는 경험이 중요하다고 봅니다.

5. 기존 문서에 추가할 Markdown 섹션 초안

아래는 별도 파일로 추가하는 것을 추천합니다.

권장 파일명:

docs/askoosu_second_brain_docs/decision_logs/why-ai-era-developer-competitiveness-ko.md
docs/askoosu_second_brain_docs/decision_logs/why-ai-era-developer-competitiveness-en.md
docs/askoosu_second_brain_docs/faq_answer_cache/ai-era-competitiveness-ko.md
추가 문서 초안
---
docId: decision.why-ai-era-developer-competitiveness.ko
title: 왜 AI 시대의 개발자 경쟁력을 별도 문서로 정의하는가?
language: ko
sourceType: decision_log
visibility: public
freshness: stable
audience: [recruiter, hiring_manager, engineer, designer_pm, ai_tooling, casual_visitor]
intentGroup: ai_competitiveness
priority: high
confidence: medium_high
relatedEntities: [profile, askoosu, ai_usage, product_build_loop]
tags: [ai_competitiveness, ai_workflow, interview_answer, portfolio_positioning]
status: draft_for_review
generatedAt: 2026-05-11
---

# Decision Log: 왜 AI 시대의 개발자 경쟁력을 별도 문서로 정의하는가?

## 결정

AskOosu에 “AI 시대의 개발자 경쟁력” 질문을 처리하기 위한 별도 add-on 문서를 추가합니다. 이 문서는 기존 Profile, AI Usage, Recruiter Risk, Operating System Docs를 대체하지 않고, 면접에서 나올 수 있는 AI 관련 질문에 더 자연스럽게 답하기 위한 근거 문서입니다.

핵심 메시지는 다음과 같습니다.

> 우수는 AI와 경쟁하는 개발자가 아니라, AI를 현실의 사용자 문제, 제품 맥락, 품질 기준에 연결하는 개발자입니다.

## 배경

최근 개발자 면접에서는 단순히 기술 스택이나 프로젝트 경험뿐 아니라, AI 도구를 어떻게 활용하고 검증하는지에 대한 질문이 나올 가능성이 커지고 있습니다. 특히 주니어/신입에게는 “AI가 코드를 써주는 시대에 개발자로서 어떤 가치가 있는가?”, “AI가 만든 코드를 이해하고 고칠 수 있는가?”, “AI를 쓰는 것과 의존하는 것은 어떻게 다른가?” 같은 질문이 중요해질 수 있습니다.

AskOosu의 기존 Wiki는 AI Agent Workflow, Code Review with AI, Product Build Loop, Answer Quality Loop, RAG Second Brain Operating Model을 이미 갖고 있습니다. 따라서 이 문서는 완전히 새로운 포지셔닝이 아니라, 기존 근거를 면접 질문에 맞게 묶는 역할을 합니다.

## 핵심 포지셔닝

우수의 AI 시대 경쟁력은 “AI가 절대 할 수 없는 인간만의 영역”을 과장하는 데 있지 않습니다. 더 정확히는 AI가 잘하는 실행 능력을 현실의 문제에 연결하고, 결과물을 사용자와 제품 기준으로 검토하는 데 있습니다.

AI는 코드를 만들고, 문서를 요약하고, 대안을 빠르게 제시하는 데 강합니다. 하지만 어떤 문제가 진짜 사용자에게 중요한지, 어떤 표현이 신뢰를 잃게 만드는지, 어떤 UI 흐름이 자연스러운지, 어떤 구현이 유지보수 리스크가 되는지는 현실의 맥락을 아는 사람이 판단해야 합니다.

우수는 고객 경험, 데이터 분석, 브랜드 운영, UX, 프론트엔드, 백엔드, RAG 실험을 거치며 이런 연결 능력을 키워왔습니다. 그래서 우수는 AI를 대체물로 보기보다, 제품 기획·구현·검증·문서화의 속도를 높이는 작업 파트너로 봅니다.

## LLM Island Metaphor

LLM은 비유하자면 섬에 고립된 채 많은 책을 가진 존재에 가깝습니다. 지식은 많고 실행도 빠르지만, 현실의 사용자, 팀의 제약, 제품의 신뢰 문제, 시장의 미묘한 맥락과는 직접 연결되어 있지 않습니다.

개발자의 역할은 이 섬과 현실 세계를 연결하는 것입니다. AI가 제안한 코드를 실제 코드베이스에 맞게 검토하고, AI가 만든 문장을 사용자에게 자연스럽게 다듬고, AI가 제안한 기능을 실제 제품 문제와 연결하는 일이 중요합니다.

이 비유는 AI를 낮춰 보려는 표현이 아닙니다. 오히려 AI의 강점을 인정하되, 그 강점이 제품 가치가 되려면 현실 맥락과 검증 책임이 필요하다는 의미입니다.

## 우수에게 중요한 5가지 경쟁력

### 1. Context Connection

우수는 AI가 만든 결과물을 현실의 사용자 문제와 연결하는 데 관심이 있습니다. 단순히 기능을 추가하는 것이 아니라, 사용자가 왜 이 기능을 필요로 하는지, 어떤 흐름에서 불편을 느끼는지, 어떤 답변을 신뢰할 수 있는지 봅니다.

연결 근거:
- Product Build Loop
- Flai Trust and Clarity Lessons
- AskOosu RAG Lessons

### 2. Taste and Judgment

AI가 여러 결과물을 빠르게 만들어낼수록, 어떤 결과가 더 자연스럽고 신뢰할 만한지 판단하는 감각이 중요해집니다. 우수의 브랜드 운영, 와인바 운영, UX/UI 경험, Sticks & Stones 리빌드 경험은 사용자가 느끼는 디테일을 보는 기반이 됩니다.

연결 근거:
- Profile
- 우수살롱 경험
- Sticks & Stones
- Uncorked
- Flai Trust and Clarity Lessons

### 3. User-Side Validation

우수는 AI 결과물을 만든 사람의 입장이 아니라 사용자 입장에서 다시 봅니다. 로딩, 실패, 빈 결과, 성공 상태를 확인하고, 검증되지 않은 수치나 fake progress를 피하며, 사용자가 무엇을 믿어도 되는지 명확히 보여주는 방향을 선호합니다.

연결 근거:
- Product Build Loop
- Answer Quality Loop
- Flai Trust and Clarity Lessons

### 4. AI Tool Orchestration

우수는 AI 도구를 하나의 만능 도구처럼 쓰지 않고 역할별로 나눠 사용합니다. 구조 설계, 구현, 리팩터링, 최신 정보 확인, 답변 생성, 비용 최적화 등 작업 성격에 따라 도구를 분리하고, 작업 범위와 검증 기준을 명확히 지시합니다.

연결 근거:
- AI Agent Workflow
- Prompt Delegation Patterns
- Code Review with AI

### 5. Initiative and Learning Loop

우수는 새로운 도구나 아이디어를 보면 직접 프로젝트에 적용해보는 성향이 강합니다. 이 성향은 AskOosu처럼 정적인 포트폴리오를 질문 기반 RAG 인터페이스로 바꾸는 실행력으로 이어졌습니다. 다만 관심사가 넓어질 수 있다는 점도 인식하고 있어, 완료 기준과 우선순위를 먼저 정하는 방식으로 보완하고 있습니다.

연결 근거:
- AI Portfolio Overdocumentation Risk
- Answer Quality Loop
- profile.growth

## 면접 답변 기본 구조

AI 시대 경쟁력 질문에는 다음 순서로 답변합니다.

1. 질문의 우려를 인정합니다.
2. AI가 잘하는 일과 사람이 책임질 일을 구분합니다.
3. 우수의 실제 경험과 프로젝트 근거를 연결합니다.
4. 과장된 미래 예측을 피하고 working thesis로 말합니다.
5. “AI와 경쟁”이 아니라 “AI를 현실의 제품 문제에 연결”하는 방향으로 마무리합니다.

## 대표 답변

우수는 AI가 대체하지 못하는 일을 인간만의 신비한 능력으로 포장하기보다, AI가 아직 현실과 직접 연결되어 있지 않다는 점에서 설명하는 편이 자연스럽습니다.

LLM은 비유하자면 섬에 고립된 채 많은 책을 가지고 있는 존재에 가깝습니다. 엄청난 지식을 가지고 있고 실행도 빠르지만, 지금 이 사용자가 무엇을 불편해하는지, 이 제품이 어떤 맥락에서 신뢰를 잃는지, 어떤 화면이 자연스럽고 어떤 표현이 과장되어 보이는지는 실제 세계와 계속 연결된 사람이 판단해야 합니다.

우수의 경쟁력은 바로 그 연결에 있습니다. 고객 경험, 데이터 분석, 브랜드 운영, UX, 프론트엔드와 백엔드, RAG 실험을 거치며 문제를 사용자 입장에서 보고, AI가 만든 결과물을 제품 기준으로 검토하고 다듬는 쪽에 강점이 있습니다.

그래서 우수는 AI와 경쟁하려고 하지 않습니다. 경쟁자는 AI 자체라기보다 AI를 더 잘 활용하는 사람들입니다. AI 시대에는 “AI가 나를 대체하느냐”보다 “내가 AI를 얼마나 현실의 문제와 잘 연결하고, 그 결과를 책임 있게 검증하느냐”가 더 중요하다고 봅니다.

## FAQ Hooks

- AI가 대체하지 못하는 개발자의 일은 무엇인가요?
- AI 시대에 우수의 경쟁력은 무엇인가요?
- AI를 많이 쓰면 개발 실력이 부족한 것 아닌가요?
- AI와 경쟁한다고 생각하나요?
- AI가 만든 코드는 어떻게 검토하나요?
- AI 제품에서 사람의 판단은 어디에 필요하나요?
- 우수의 취향이나 감각은 개발과 어떻게 연결되나요?

## Do Not Say

- AI는 절대 인간을 대체할 수 없습니다.
- AI를 못 쓰는 사람은 도태됩니다.
- 우수는 AI로 모든 역할을 혼자 대체할 수 있습니다.
- 개발자는 이제 코드를 몰라도 됩니다.
- 우수는 AI를 쓰기 때문에 생산성이 몇 배 높습니다.
- AI가 만든 코드는 대부분 그대로 사용합니다.
- 사람보다 AI와 일하는 것이 더 낫습니다.

## Safer Phrases

- AI가 실행을 빠르게 만들수록, 사람의 판단과 검증 기준이 더 중요해집니다.
- 우수는 AI와 경쟁하기보다 AI를 제품 문제에 연결하는 개발자를 지향합니다.
- AI를 많이 쓰는 것 자체보다, 결과물을 이해하고 검증하고 책임지는 방식이 중요합니다.
- 팀이 사라진다기보다, 작은 팀에서 한 사람이 탐색할 수 있는 범위가 넓어지고 있다고 봅니다.
- 이 관점은 확정적인 미래 예측이 아니라, 우수가 실제 프로젝트를 통해 실험 중인 working thesis입니다.

## Confidence

Medium-high. 기존 AskOosu Wiki의 AI Agent Workflow, Product Build Loop, Code Review with AI, Answer Quality Loop, RAG Second Brain Operating Model, Flai Trust and Clarity Lessons, Recruiter Risk Routing 문서와 일관됩니다.
6. 주의할 점
원래 표현	리스크	더 나은 표현
“AI가 할 수 없는 일은 인간의 감성과 창의성이다”	너무 흔하고 추상적임	“AI가 만든 결과를 현실의 사용자 맥락과 제품 기준에 맞게 판단하고 다듬는 일”
“AI는 섬에 고립된 책벌레다”	AI를 낮춰 보는 뉘앙스가 생길 수 있음	“LLM은 많은 지식을 가진 섬과 같고, 개발자는 그 지식을 현실의 사용자·도구·문제와 연결한다”
“AI를 안 쓰는 사람은 도태된다”	공격적이고 면접관에게 방어적으로 들릴 수 있음	“AI 도구를 쓰는 사람과 쓰지 않는 사람의 작업 속도와 검증 방식에는 차이가 커질 수 있다”
“나는 AI와 경쟁하지 않는다”	단독으로 쓰면 멋있지만 근거가 약함	“AI 자체보다 AI를 잘 활용하는 사람들과 경쟁한다고 보는 편이 현실적입니다”
“나는 센스와 취향이 있다”	자기PR처럼 들릴 수 있음	“우수살롱, 브랜드 운영, UX 경험을 통해 사용자가 느끼는 흐름과 신뢰감을 보는 기준을 쌓았습니다”
“AI가 못 하는 아름다움의 판단”	과장되거나 예술가 포지션처럼 보일 수 있음	“AI가 만든 여러 결과 중 어떤 것이 사용자에게 자연스럽고 신뢰감 있는지 판단하는 눈”
“시키지 않아도 먼저 한다”	조직에서 범위 통제 못 하는 사람처럼 보일 수 있음	“새 도구를 빠르게 실험하되, 최근에는 완료 기준과 우선순위를 먼저 정해 범위를 관리하려고 합니다”
“하나에 빠지면 오래 몰입한다”	장점이지만 산만함과 연결될 수 있음	“관심이 생기면 문서화, 실험, 회고까지 이어가는 학습 루프가 강합니다”
“AI가 나를 대체하느냐보다 내가 AI를 활용하느냐”	좋지만 조금 흔한 문장	“AI가 실행을 확장할수록, 개발자의 가치는 문제 정의·맥락 연결·검증 책임 쪽으로 이동한다고 봅니다”

가장 추천하는 최종 대표 문장은 이것입니다.

우수는 AI가 대체하지 못하는 일을 인간만의 신비한 능력으로 포장하기보다, AI가 만든 결과를 현실의 사용자 문제와 제품 기준에 연결하는 일로 정의합니다. AI는 실행을 빠르게 만들 수 있지만, 무엇을 만들지, 무엇을 믿어도 되는지, 어떤 결과가 사용자에게 자연스러운지는 사람이 책임 있게 판단해야 합니다. 우수의 경쟁력은 AI와 경쟁하는 것이 아니라, AI를 제품 맥락에 연결하고 검증 가능한 결과물로 바꾸는 데 있습니다.