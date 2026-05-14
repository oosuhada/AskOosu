# AI 시대의 개발자 경쟁력 Wiki 추가 초안
> **Add-on 문서입니다.** 기존 v11/v12 Wiki를 대체하지 않습니다.  
> 기존 `Section 17. FAQ Answer Cache — AI Era Philosophy Bank` (v12-visionary)와 충돌하지 않게 설계되었습니다.  
> RAG 청킹 시 heading 기준으로 분리하고, `docId` 및 `sourceType: faq_addon`으로 등록하세요.  
> 언어: 한국어 버전과 영어 버전을 각각 별도 파일로 관리 권장.

---

## 1. 추가해야 할 핵심 포지셔닝 요약

### 기존 AskOosu의 정체성 (변경 없음)

기존 문서를 읽고 확인한 AskOosu의 핵심 포지셔닝:

- **타이틀**: AI-connected Fullstack Developer
- **핵심 프레임**: AI는 속도와 실행을 담당하고, 인간이 방향·판단·검토를 책임진다
- **강점의 근거**: GfK 데이터 분석 → OOSU SALON 운영 → UX/UI → Flutter → Fullstack → AI/RAG — 연결된 경로
- **기존 톤**: 예언자적 주장 금지, 과장 금지, working thesis 프레임, 근거 있는 답변
- **기존 가드레일**: "AI가 팀을 대체한다", "AI 쓰면 실력 없는 것 아닌가" 류 질문에 이미 답변 프레임 있음

### 이번 Add-on의 추가 포지셔닝

기존 문서에 **아직 없는** 관점 하나를 추가합니다:

> "AI는 섬에 고립된 채 방대한 책을 쌓아둔 존재다. 나는 그 섬을 현실 세계와 연결하는 사람이다."

이 프레임은 기존 "AI accelerates, human judges"보다 더 구체적인 역할 이미지를 제공하고, "AI가 대체하지 못하는 것"을 방어적으로 나열하는 대신 **연결자(Connector)로서의 포지셔닝**을 제시합니다.

추가 포지셔닝 요약:

| 기존 포지셔닝 | 이번 Add-on으로 보완하는 포지셔닝 |
|---|---|
| AI는 실행, 인간은 판단 | AI는 고립된 지식, 인간은 현실과의 연결고리 |
| AI tool orchestrator | World-to-AI connector |
| AI dependency 질문에 방어적 답변 | AI 경쟁력 질문에 공격적(선제적) 답변 |
| 프로젝트 근거 중심 | 인사이트·감각·맥락 이해를 근거로 추가 |

---

## 2. 면접 예상 질문 목록

> 아래 질문들은 AI 시대 신입/주니어 채용 면접에서 나올 법한 유형을 정리한 것입니다.  
> 실제 특정 기업이나 면접에서 해당 질문이 반드시 나온다는 보장은 없습니다.  
> 질문 의도와 답변 핵심은 AskOosu의 기존 포지셔닝과 충돌하지 않게 설계했습니다.

---

### Q01. "당신이 할 수 있는 일 중에서 AI가 대체하지 못하는 일이 무엇인가요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | AI 의존도가 높은 지원자가 "AI 없이도 생각할 수 있는가"를 확인하려는 질문. 동시에 AI에 대한 이해 깊이를 본다. |
| **답변 핵심** | AI의 한계를 잘 아는 사람 = AI를 잘 쓰는 사람. 나열식 인간 찬양이 아니라, 실제 경험에서 관찰한 AI의 구체적 약점을 말한다. |
| **피해야 할 답변** | "창의성은 인간만의 것입니다" / "공감 능력은 AI가 못 합니다" 류의 추상적 인간 찬양 |
| **AskOosu 짧은 답변** | 아래 Section 3 대표 답변 초안 참고 |
| **근거로 연결할 Wiki 섹션** | `ops.ai-agent-workflow.en`, `profile.strengths`, `profile.work_style`, `decision.why-not-overclaim-ai-era.en` |

---

### Q02. "AI 툴을 많이 쓰는데, 본인이 직접 코드를 이해하고 작성할 수 있나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | AI 생성 코드를 블랙박스로 쓰는지, 아니면 이해하면서 쓰는지 확인. 실제 디버깅 능력을 본다. |
| **답변 핵심** | "AI가 만든 코드를 그대로 쓰면 디버깅이 안 된다는 걸 직접 경험했다." 구체적 실패 경험과 그 이후의 워크플로우 변화를 말한다. |
| **AskOosu 짧은 답변** | "초기에는 AI가 주는 코드를 그대로 썼어요. 그런데 작동은 하는데 왜 작동하는지 모르면 고칠 수 없다는 걸 Instagram 클론에서 배웠습니다. 지금은 설계와 흐름은 내가 먼저 이해하고, 구현 속도를 AI에게 빌립니다." |
| **근거로 연결할 Wiki 섹션** | `ops.code-review-with-ai.en`, `postmortem.instagram-clone-fullstack-lessons.en`, `faq.vision.ai_workflow_origin.default` |

---

### Q03. "AI가 빠르게 발전하는데, 지금 배우는 기술 스택이 3년 후에도 유효할까요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 기술 변화 속도에 대한 인식과 학습 태도를 본다. 특정 언어/프레임워크 집착 여부도 확인. |
| **답변 핵심** | "특정 스택보다 문제를 구조화하는 능력과 새 도구를 빠르게 익히는 능력이 더 오래간다." 실제로 Flutter → UX/UI → Fullstack → AI/RAG로 전환한 경험을 근거로 든다. |
| **AskOosu 짧은 답변** | "저는 이미 Flutter에서 UX/UI로, 다시 Fullstack으로, 지금은 AI/RAG 구조로 방향을 바꿔왔습니다. 특정 언어를 지키기보다 필요한 도구를 빠르게 배우는 것이 제 패턴입니다. 그래서 스택보다 문제를 읽는 눈이 더 중요하다고 생각합니다." |
| **근거로 연결할 Wiki 섹션** | `profile.learning_style`, `career.timeline`, `profile.strengths.fast_learning` |

---

### Q04. "AI가 코드를 다 짜준다면, 주니어 개발자를 뽑을 이유가 있나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 지원자가 자신의 존재 이유를 스스로 설명할 수 있는가. 방어적이거나 겸손하기만 한 답변은 약점이 된다. |
| **답변 핵심** | 실행이 아니라 방향 설정과 판단에서 주니어의 역할이 재정의된다. AI 오케스트레이터로서의 역할을 구체적으로 말한다. |
| **AskOosu 짧은 답변** | "AI가 코드를 짜는 속도는 빨라졌지만, 무엇을 짜야 할지 판단하는 속도는 빨라지지 않았습니다. 저는 그 판단을 빠르게, 근거 있게 할 수 있는 사람이 되려고 준비하고 있습니다." |
| **근거로 연결할 Wiki 섹션** | `faq.vision.ai_developer_future.default`, `ops.ai-agent-workflow.en`, `decision.why-small-team-wide-ownership-positioning.en` |

---

### Q05. "본인의 경쟁자는 누구라고 생각하나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | AI 시대에 대한 인식 수준과 자기 포지셔닝 명확성을 본다. "AI가 경쟁자"라고 하면 감점. |
| **답변 핵심** | AI 자체가 아니라, AI를 잘 쓰는 사람들이 경쟁자다. 그리고 나는 그 쪽에 있다. |
| **AskOosu 짧은 답변** | "AI 자체는 제 경쟁자가 아닙니다. AI를 잘 활용하는 사람들이 경쟁자입니다. 저는 그 편에 있으려고 지금 준비하고 있고, AskOosu가 그 증거입니다." |
| **근거로 연결할 Wiki 섹션** | `decision.why-ai-native-working-thesis.en`, `project.askoosu.fact` |

---

### Q06. "팀으로 일할 때 AI 툴 사용을 어떻게 조율하나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | AI 도구 사용이 팀 컨텍스트에서 어떻게 작동하는지 본다. 개인 역량이 팀으로 연결되는지 확인. |
| **답변 핵심** | AI가 만든 결과물을 팀 기준으로 검토하고 재구성하는 역할. AI 출력을 그대로 팀에 가져가지 않는다. |
| **AskOosu 짧은 답변** | "Instagram 클론 팀 프로젝트에서 저는 ERD 문서화, 시드 데이터, API 설계를 AI와 함께 처리했지만, 팀에 공유할 때는 반드시 직접 검토하고 팀 기준에 맞게 다듬었습니다. AI 출력을 그대로 팀에 넘기면 신뢰 비용이 생깁니다." |
| **근거로 연결할 Wiki 섹션** | `ops.collaboration-with-ai-and-humans.en`, `postmortem.instagram-clone-fullstack-lessons.en` |

---

### Q07. "사이드 프로젝트나 포트폴리오에서 AI 툴을 사용했다면, 본인이 기여한 부분이 무엇인지 명확히 설명해 주세요."

| 항목 | 내용 |
|---|---|
| **질문 의도** | "AI가 다 했나요?" 의심을 직접 파고드는 질문. 기여도를 명확히 분리할 수 있는지 본다. |
| **답변 핵심** | 무엇을 AI에게 맡겼고, 무엇을 직접 판단했는지를 구체적으로 분리해서 말한다. |
| **AskOosu 짧은 답변** | "AskOosu에서 AI가 한 것: RAG API 구현, 컴포넌트 초안, 데이터 스키마 초안. 제가 한 것: RAG vs FAQ cache 분리 결정, Notion을 CMS로 쓰고 PostgreSQL을 retrieval cache로 분리하는 아키텍처 판단, 답변 guardrail 설계, 배포 전략. 저는 AI를 시키는 사람으로 일했고, 결정은 항상 제가 했습니다." |
| **근거로 연결할 Wiki 섹션** | `project.askoosu.fact`, `ops.ai-agent-workflow.en`, `decision.why-cache-first-rag-next.en` |

---

### Q08. "기술 트렌드를 어떻게 따라가나요? 최근에 배운 새로운 기술이나 개념이 있나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 학습 습관과 자기주도성을 본다. 단순히 "공부했다"가 아니라 실제 프로젝트 적용 여부를 확인. |
| **답변 핵심** | 트렌드를 읽는 것과 실제로 써보는 것의 차이. 직접 써보지 않은 것은 모른다는 솔직함. |
| **AskOosu 짧은 답변** | "트렌드는 쓰면서 배웁니다. Groq, pgvector, Vercel AI SDK, Cloudflare Tunnel — 전부 AskOosu를 만들면서 처음 썼고, 문제가 생길 때마다 파고들었습니다. 읽기만 한 기술과 직접 배포까지 해본 기술은 다릅니다." |
| **근거로 연결할 Wiki 섹션** | `profile.learning_style`, `project.askoosu.fact` |

---

### Q09. "제품의 방향을 결정할 때 어떤 기준으로 판단하나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | PM적 사고, 사용자 중심 사고가 있는지 본다. 기능 나열이 아니라 판단 기준을 묻는다. |
| **답변 핵심** | OOSU SALON 운영 경험과 GfK 데이터 분석 경험을 근거로, "사용자가 실제로 느끼는 마찰"을 기준으로 삼는다는 것을 말한다. |
| **AskOosu 짧은 답변** | "Portfoli-Oh!를 만들었을 때 기능을 너무 많이 넣었더니 방문자가 길을 잃었습니다. AskOosu는 그 반성에서 시작했습니다. '방문자가 실제로 무엇을 알고 싶은가'가 기준입니다. 기능이 아니라 질문이 출발점입니다." |
| **근거로 연결할 Wiki 섹션** | `postmortem.portfoli-oh-json-chatbot-limitations.en`, `project.askoosu.fact`, `profile.values` |

---

### Q10. "AI가 생성한 결과물의 품질을 어떻게 검증하나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | AI 출력의 신뢰성 문제에 대한 인식과 실제 검토 프로세스를 본다. |
| **답변 핵심** | AI는 틀릴 수 있다는 것을 기본 전제로 설계한다. 구체적인 검토 기준을 말한다. |
| **AskOosu 짧은 답변** | "AI는 자신감 있게 틀립니다. 그래서 저는 AI 코드를 받으면 세 가지를 먼저 봅니다: 실제 파일 구조를 참조했는가, API와 UI의 필드가 일치하는가, 시크릿 키나 민감 정보가 노출되는가. 이 세 가지만 확인해도 대부분의 AI 실수는 잡힙니다." |
| **근거로 연결할 Wiki 섹션** | `ops.code-review-with-ai.en`, `ops.answer-quality-loop.en` |

---

### Q11. "개발자로서 미적 감각이나 UX 감각이 중요하다고 생각하나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 개발자와 디자이너의 경계가 흐려지는 시대에, 지원자가 어느 영역을 커버할 수 있는지 확인. |
| **답변 핵심** | UX 감각은 "보기 좋음"이 아니라 "마찰을 줄이는 것"이다. OOSU SALON 운영 경험이 서비스 감각의 실제 근거다. |
| **AskOosu 짧은 답변** | "OOSU SALON을 5년간 운영하면서 손님이 어떤 순간에 당황하는지, 어떤 흐름이 자연스러운지를 몸으로 익혔습니다. 그게 지금 UI를 설계할 때 기준이 됩니다. 좋은 UX는 예쁜 게 아니라 막히지 않는 겁니다." |
| **근거로 연결할 Wiki 섹션** | `career.oosu_salon`, `profile.development_philosophy.cx_to_ux`, `profile.strengths.frontend_sensibility` |

---

### Q12. "혼자 AI로 많이 개발했는데, 코드 리뷰 경험이나 협업 경험은 어떻게 쌓았나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 솔로 포트폴리오가 많을 때 나오는 협업 경험 의심 질문. 방어적이 되지 않는 것이 핵심. |
| **답변 핵심** | 솔로 작업은 협업 회피가 아니라 end-to-end 오너십의 증거다. 팀 프로젝트 경험도 있다. |
| **AskOosu 짧은 답변** | "Instagram 클론은 4인 팀 프로젝트였고, 저는 백엔드 API, DB 문서화, AI 기능 통합을 담당했습니다. 솔로 프로젝트가 많은 건 협업을 피한 게 아니라, 전체 흐름을 직접 경험하고 싶었기 때문입니다. 협업에서는 그 전체 그림이 오히려 강점이 된다고 생각합니다." |
| **근거로 연결할 Wiki 섹션** | `ops.collaboration-with-ai-and-humans.en`, `project.instagram_clone.fact` |

---

### Q13. "본인이 생각하는 '좋은 코드'란 무엇인가요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 코딩 철학과 품질 기준을 본다. AI 시대에 이 질문의 무게는 더 커졌다. |
| **답변 핵심** | AI가 쓴 코드가 많아질수록, "읽히는 코드", "이유를 설명할 수 있는 코드"의 가치가 올라간다. |
| **AskOosu 짧은 답변** | "AI가 짜준 코드는 작동하는 경우가 많습니다. 하지만 '왜 이렇게 짰는가'를 설명할 수 없으면 제 코드가 아닙니다. 저한테 좋은 코드는 다음 사람이 맥락을 파악할 수 있는 코드입니다. 그래서 AskOosu Wiki를 RAG 문서로 만들 때도 '읽히는 구조'를 가장 먼저 생각했습니다." |
| **근거로 연결할 Wiki 섹션** | `ops.code-review-with-ai.en`, `ops.definition-of-done.en` |

---

### Q14. "3년 후 어떤 개발자가 되어 있을 것 같나요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | 장기 방향성과 자기 인식 수준을 본다. 과장된 목표와 현실적 경로를 구분한다. |
| **답변 핵심** | 예언보다는 방향. 구체적이면서도 겸손한 working thesis로 말한다. |
| **AskOosu 짧은 답변** | "3년 후에 어떤 역할을 맡고 있을지는 모릅니다. 하지만 '새로운 AI 도구가 나왔을 때 팀에서 가장 먼저 실험해보고, 팀에 맞게 번역해주는 사람'이 되고 싶습니다. 지금도 그걸 연습하고 있습니다." |
| **근거로 연결할 Wiki 섹션** | `profile.current_focus`, `decision.why-ai-native-working-thesis.en`, `career.target_role` |

---

### Q15. "AI 도구가 없다면 지금 이 자리에 올 수 있었을까요?"

| 항목 | 내용 |
|---|---|
| **질문 의도** | AI 의존도에 대한 날카로운 도발 질문. 방어적이 되면 약점이 된다. |
| **답변 핵심** | AI 도구 없이도 경험과 인사이트는 그대로다. AI는 속도를 빌려줬을 뿐, 방향 판단은 내 것이다. |
| **AskOosu 짧은 답변** | "AI 없이는 지금보다 훨씬 느렸을 겁니다. 하지만 무엇을 만들지는 AI가 결정하지 않았습니다. OOSU SALON에서 쌓은 서비스 감각, GfK에서 배운 데이터 읽기, 세 번의 부트캠프에서 직접 부딪힌 경험 — 이건 AI가 대신해줄 수 없는 부분입니다. AI는 제 실행 속도를 높여줬고, 저는 그 속도로 더 많이 실험할 수 있었습니다." |
| **근거로 연결할 Wiki 섹션** | `career.timeline`, `decision.why-not-overclaim-ai-era.en`, `profile.development_philosophy` |

---

## 3. "AI가 대체하지 못하는 일"에 대한 대표 답변 초안

> 이 답변은 AskOosu에서 직접 사용하거나, 면접 답변의 베이스로 활용할 수 있습니다.  
> **절대 피할 것**: "창의성은 인간만의 것", "공감은 AI가 못 한다" 류의 추상적·방어적 표현.

---

### 한국어 버전

**짧은 버전 (30초 답변)**

> AI는 방대한 지식을 갖고 있지만, 현실 세계와 고립되어 있습니다. 저는 그 AI를 실제 사용자, 실제 맥락, 실제 문제와 연결하는 역할을 합니다. AI를 쓰는 사람과 쓰지 않는 사람의 격차는 이미 벌어지고 있고, 저는 AI를 잘 쓰는 쪽에서 그 경계를 계속 실험하고 있습니다.

**디폴트 버전 (면접 기본 답변)**

> AI가 대체하지 못하는 게 무엇이냐고 물으시면, 저는 "현실 연결"이라고 답하겠습니다.
>
> LLM은 방대한 지식을 갖고 있지만, 고립된 섬에서 혼자 책을 쌓아두는 것과 비슷합니다. 실제 사용자가 어떤 순간에 불편함을 느끼는지, 이 프로젝트의 맥락에서 어떤 판단이 맞는지, 이 팀이 지금 어떤 우선순위를 가져야 하는지 — AI는 옵션을 제시하지만, 그 선택의 무게를 실제로 지는 건 사람입니다.
>
> 저는 OOSU SALON을 5년간 운영하면서 사용자의 반응을 실시간으로 읽는 훈련을 했고, GfK에서 데이터 뒤에 있는 맥락을 읽는 훈련을 했습니다. 그 경험이 지금 AI 결과물을 검토하고 다듬는 기준이 됩니다.
>
> 그래서 저는 "AI가 나를 대체하느냐"보다 "내가 AI를 얼마나 잘 세상과 연결하느냐"가 더 중요한 질문이라고 생각합니다.

**상세 버전 (심화 질문 대비)**

> 좀 더 구체적으로 말씀드리면, 제가 AI를 쓰면서 AI가 잘 못하는 것을 직접 경험한 세 가지가 있습니다.
>
> **첫 번째는 "무엇을 만들지 결정하는 것"입니다.** AI는 스펙을 주면 잘 구현합니다. 하지만 어떤 기능이 실제 사용자의 마찰을 줄이는지, 오늘의 기술적 결정이 3개월 후 어떤 부채가 되는지 — 이건 AI에게 맡기면 프로젝트의 방향이 흔들립니다. AskOosu에서 RAG와 FAQ cache를 분리하는 결정, Notion을 CMS로 쓰고 PostgreSQL을 retrieval cache로 쓰는 아키텍처 선택 — AI는 옵션을 제안했지만, 판단은 제가 했습니다.
>
> **두 번째는 "감각과 취향을 기준으로 삼는 것"입니다.** AI는 평균을 잘 만듭니다. 하지만 이 디자인이 단순히 틀리지 않은 것과 기억에 남는 것의 차이를 구분하는 건 사람의 감각입니다. OOSU SALON을 운영하며 쌓은 공간 감각, 향수와 와인 소믈리에 경험이 만든 감각적 기준 — 이게 지금 UI 결정에 영향을 줍니다.
>
> **세 번째는 "AI의 실수를 잡아내는 것"입니다.** AI는 자신 있게 틀립니다. 파일 구조를 잘못 읽거나, 존재하지 않는 API를 쓰거나, 보안 키를 노출시키거나. 이걸 잡으려면 내가 알고 있어야 합니다. AI를 잘 쓰는 것의 역설은, AI를 잘 검토할 수 있어야 잘 쓸 수 있다는 겁니다.
>
> 요약하면 — AI는 실행 속도를 빌려줍니다. 하지만 방향, 감각, 검토는 여전히 사람의 일이고, 저는 그 부분을 계속 훈련하고 있습니다.

---

### English Version

**Short Version (30-second answer)**

> AI holds a vast amount of knowledge, but it operates in isolation from the real world. My role is to connect AI to actual users, actual context, and actual problems. The gap between people who use AI well and those who don't is already widening — and I'm actively experimenting at that boundary, on the side that uses it well.

**Default Version (standard interview answer)**

> If you ask me what AI can't replace, I'd say: the connection to reality.
>
> An LLM is like someone sitting alone on an island surrounded by enormous stacks of books. It has vast knowledge but it's cut off from the real world — from what a real user finds frustrating in this moment, from what judgment is right for this project's specific context, from what priority this team actually needs right now. AI can surface options. But the person who carries the weight of that choice is still a human.
>
> Running OOSU SALON for five years trained me to read user reactions in real time. Working at GfK trained me to read the context behind data. That experience is now the standard I use when reviewing and refining AI output.
>
> So I think the more useful question isn't "will AI replace me?" — it's "how well can I connect AI to the real world?" That's what I'm building toward.

**Detailed Version (for deeper follow-up questions)**

> To be more specific — working with AI, I've directly experienced three things AI consistently struggles with.
>
> **First: deciding what to build.** AI implements well when you give it clear specs. But understanding which features actually reduce user friction, and what technical debt today's decision will create three months from now — if you delegate that judgment to AI, your project loses direction. In AskOosu, the decision to separate RAG from FAQ cache, and to use Notion as CMS while keeping PostgreSQL as the retrieval cache — AI proposed options, but I made the call.
>
> **Second: applying taste and sensibility as a standard.** AI is good at producing averages. But distinguishing between something that's merely not wrong and something that's actually memorable — that's a human judgment. Five years of running OOSU SALON built my instincts for space and experience. Certifications in perfumery and wine built a different kind of sensory standard. That shapes how I make UI decisions now.
>
> **Third: catching AI's mistakes.** AI fails with confidence. It misreads file structures, invents APIs that don't exist, and occasionally exposes secrets in client code. To catch these, you need to already know something. The paradox of using AI well is that you can only use it well if you're capable of reviewing it well.
>
> To summarize — AI lends me execution speed. But direction, sensibility, and review are still human work. That's what I'm actively training.

---

## 4. RAG/FAQ에 넣기 좋은 Q&A 초안

> AskOosu가 실제로 답변으로 사용할 수 있게 작성했습니다.  
> `data/faq-answers.en.ts` / `data/faq-answers.ko.ts`에 추가 권장.

---

### FAQ AI-C-01. AI가 개발자를 대체할 것 같은데, Oosu는 어떻게 생각하나요?

**FAQ ID**: `faq.ai_era.replace_developer.default`  
**Intent**: `ai_era.replace_developer`  
**Cache Mode**: `direct_cache`  
**Patterns**: `AI가 개발자를 대체`, `개발자 필요없어`, `AI 시대 개발자`, `개발자 살아남기`

**한국어 답변**

저는 AI가 "실행"을 빠르게 만드는 건 사실이라고 생각합니다. 하지만 "무엇을 실행할지"는 여전히 사람의 일입니다.

Instagram 클론을 만들면서 Claude Code, Gemini CLI, Codex를 동시에 돌렸습니다. 속도는 빨라졌지만, 어떤 AI 기능을 넣을지, 데이터 구조를 어떻게 잡을지 — 그 판단은 제가 했습니다. AI는 제가 결정한 것을 빠르게 구현해줬습니다.

그래서 저는 "AI가 개발자를 대체하느냐"보다 "AI를 잘 쓰는 개발자가 그렇지 않은 개발자를 대체하느냐"가 더 현실적인 질문이라고 생각합니다.

**English Answer**

I think AI genuinely accelerates execution. But deciding *what* to execute is still a human job.

While building the Instagram clone, I ran Claude Code, Gemini CLI, and Codex simultaneously. Speed increased. But which AI features to include, how to structure the data model — those judgments were mine. AI implemented what I decided, quickly.

So the question I find more realistic isn't "will AI replace developers?" It's "will developers who use AI well replace those who don't?" I'm positioning myself on the side that uses it well.

---

### FAQ AI-C-02. AI 도구를 많이 쓰면 실력이 안 늘지 않나요?

**FAQ ID**: `faq.ai_era.skill_atrophy.default`  
**Intent**: `ai_era.skill_atrophy`  
**Cache Mode**: `direct_cache`  
**Patterns**: `AI 많이 쓰면 실력`, `AI 의존`, `AI 없으면 못 하나`, `진짜 실력`

**한국어 답변**

초기에는 저도 그랬습니다. AI가 준 코드를 그대로 쓰면 작동은 하는데, 왜 작동하는지 모르면 고칠 수가 없습니다. 그게 답답해서 지금 방식이 생겼습니다.

지금은 설계와 흐름을 먼저 제가 이해하고, 구현 속도를 AI에게 빌립니다. AI 코드를 받으면 파일 구조 참조 여부, API-UI 필드 일치 여부, 보안 노출 여부를 먼저 확인합니다. 이 검토를 하려면 내가 알고 있어야 하고, 그 과정에서 계속 공부가 됩니다.

AI를 잘 검토할 수 있어야 잘 쓸 수 있다 — 이게 제가 찾은 균형입니다.

**English Answer**

Early on, I experienced exactly this. AI-generated code ran, but when I didn't understand why it ran, I couldn't fix it when things broke. That frustration led to my current approach.

Now I make sure I understand the design and flow first, then borrow AI's speed for implementation. When I receive AI-generated code, I check three things first: whether it referenced the actual file structure, whether the API and UI fields match, and whether any secrets are exposed. Doing that review requires me to already know something — which is where the real learning happens.

The way I think about it: to use AI well, you have to be capable of reviewing it well.

---

### FAQ AI-C-03. Oosu의 경쟁력은 AI 시대에 어디서 온다고 생각하나요?

**FAQ ID**: `faq.ai_era.competitiveness_source.default`  
**Intent**: `ai_era.competitiveness_source`  
**Cache Mode**: `direct_cache`  
**Patterns**: `경쟁력`, `강점`, `AI 시대 차별점`, `왜 Oosu를 뽑아야`, `Oosu 특징`

**한국어 답변**

세 가지에서 온다고 생각합니다.

**하나, 연결된 경험.** 고객 리서치 → 데이터 분석 → OOSU SALON 운영 → UX/UI → Fullstack → AI/RAG — 각 단계가 다음 단계의 기준이 됩니다. AI가 없는 부분입니다.

**둘, AI를 현실과 연결하는 감각.** AI는 가능성을 제안하지만, 그 가능성이 이 사용자, 이 팀, 이 프로젝트에 맞는지 판단하는 건 제 경험에서 옵니다. 5년의 서비스 운영, 시장조사, 데이터 분석이 그 기준을 만들었습니다.

**셋, 빠른 실험 속도.** 새 도구가 나오면 직접 써봅니다. Groq, pgvector, Cloudflare Tunnel — 모두 AskOosu를 만들면서 처음 써봤고, 바로 배포까지 연결했습니다. 읽은 것과 써본 것은 다릅니다.

**English Answer**

I think it comes from three things.

**One: connected experience.** Customer research → data analytics → running OOSU SALON → UX/UI → Fullstack → AI/RAG — each stage becomes the standard for the next. AI doesn't have that.

**Two: the instinct to connect AI to reality.** AI suggests possibilities, but judging whether those possibilities fit this user, this team, this project — that comes from my experience. Five years of running a service, market research, and data analysis built that standard.

**Three: speed of experimentation.** When a new tool comes out, I try it. Groq, pgvector, Cloudflare Tunnel — I used all of them for the first time while building AskOosu, and got them to production. Reading about a tool and shipping with it are different things.

---

## 5. 기존 문서에 추가할 Markdown 섹션 초안

> 아래 내용은 `notion-wiki-draft-v12`의 Section 17 다음에 **Section 18**로 추가하거나,  
> 별도 파일 `notion-wiki-draft-v13-ai-competitiveness-en.md` / `*-ko.md`로 관리하세요.  
> 기존 문서를 수정하거나 대체하지 마세요.

---

```markdown
---
docId: faq.ai_competitiveness_addon.v13
title: AI Era Developer Competitiveness — FAQ Add-on
language: en
sourceType: faq_addon
visibility: public
freshness: stable
audience: [recruiter, hiring_manager, engineer, ai_tooling]
intentGroup: ai_era_competitiveness
priority: high
confidence: medium_high
relatedEntities: [askoosu, profile, ai_usage, career]
tags: [interview_prep, ai_era, competitiveness, positioning]
status: draft_for_review
generatedAt: 2026-05-11
---

## Section 18. AI Era Developer Competitiveness

> Add-on to v12. Does not replace existing FAQ or decision_logs.
> Designed to answer the class of questions: "What can you do that AI can't?"
> and "Why hire a developer who uses this much AI?"

### Core Positioning Statement

Oosu does not compete with AI.
Oosu's competitors are developers who use AI well.
The gap between developers who use AI effectively and those who do not
is already widening, and Oosu is actively building on the side that does.

### The Connector Frame

An LLM is like a person isolated on an island with an enormous library.
Vast knowledge. No connection to the real world.
Oosu's role is to connect that isolated knowledge to:
- actual user friction
- actual project context
- actual team priorities
- actual product judgment

This is not a claim that AI is weak.
It is a description of where the human role is currently clearest.

### What Oosu Does That AI Does Not

These are not abstract human traits. These are grounded in specific experiences.

| What AI struggles with | Oosu's specific experience that provides this |
|---|---|
| Deciding what to build | Portfoli-Oh! failure → AskOosu direction reset |
| Reading user friction in real time | 5 years running OOSU SALON |
| Context behind data | GfK POS tracking, customer panel projects |
| Catching AI's own mistakes | Code review workflow built from Instagram clone debugging |
| Sensory and taste-based judgment | Sommelier, perfumery, space design experience |
| Cross-functional translation | Business → UX → Engineering language bridging |

### Do Not Say

- "Creativity is uniquely human."
- "AI can't feel empathy."
- "AI will never replace good developers."

These are abstract claims with no personal evidence.
Replace with specific experience-grounded observations as above.

### FAQ Hooks

- What can you do that AI can't?
- Why should we hire a developer who uses this much AI?
- Aren't you just AI-dependent?
- What's your competitive edge in the AI era?
- How do you stay competitive as AI improves?
```

---

## 6. 주의할 점: 표현 점검

### 과장되거나 방어적으로 들릴 수 있는 원래 표현들

아래는 우수님이 제시하신 아이디어 중 면접관에게 약점으로 읽힐 수 있는 표현과, 더 나은 대안입니다.

---

**① "아름다움을 판단하는 눈, 센스, 취향"**

| 문제 | 개선 |
|---|---|
| 너무 주관적으로 들릴 수 있음. 면접관에게 "그게 실력인가요?"라는 반문을 유발함. | **근거를 붙이세요.** "소믈리에 자격증, 향수 조향 경험, OOSU SALON 공간 설계 경험이 UI 판단 기준이 됩니다." — 취향이 아니라 훈련된 감각으로 프레이밍. |

---

**② "하나에 빠지면 오래 몰입하는 성향"**

| 문제 | 개선 |
|---|---|
| 몰입 자체는 장점이지만, 맥락 없이 말하면 "마감을 못 지키는 것 아닌가?" 의심을 살 수 있음. | "몰입하면서도 완료 기준을 먼저 정하는 습관을 만들었습니다 — AskOosu에서 Definition of Done을 먼저 작성한 게 그 예입니다." 라고 연결하세요. |

---

**③ "시키지 않아도 먼저 해보는 initiative"**

| 문제 | 개선 |
|---|---|
| 미덕처럼 들리지만, 구체적 예시 없이 말하면 자기 PR로만 들림. | **구체적 예시로 대체**: "EZ Air 팀 프로젝트에서 팀이 단순 디자인 클론을 하려 할 때, AI 연동 방향을 먼저 제안하고 설득했습니다." |

---

**④ "LLM은 섬에 고립된 채 책만 가득 가지고 있는 존재에 가깝다"**

| 문제 | 개선 |
|---|---|
| 좋은 프레임이지만 한 번에 너무 많은 설명이 필요함. 면접 현장에서 혼자 길게 설명하면 산만해질 수 있음. | **한 문장으로 압축**: "AI는 방대한 지식을 갖고 있지만 현실과 고립되어 있고, 저는 그 연결을 합니다." — 그 다음에 예시를 붙이세요. |

---

**⑤ "AI 도구를 쓰는 사람과 쓰지 않는 사람의 격차는 점점 커질 것이다"**

| 문제 | 개선 |
|---|---|
| 사실이지만, 예언형 문장은 면접관에게 "그래서 당신은 어느 편이냐"는 질문을 남김. | 항상 "저는 그 쪽에 있습니다"로 마무리하세요. 주장 → 자기 포지셔닝 순서로. |

---

**⑥ "나는 AI와 경쟁하지 않는다 / 나의 경쟁자는 AI를 잘 활용하는 사람들이다"**

| 문제 | 개선 |
|---|---|
| 좋은 프레임이지만, 자칫 "그래서 당신은 AI를 잘 활용하는 사람인가요?"라는 반문을 부른다. | 반드시 증거와 함께: "그래서 저는 AskOosu를 만들었고, Claude Code + Gemini CLI + Codex를 동시에 쓰는 워크플로우를 실제 프로젝트에 적용했습니다." |

---

### 전체적으로 지켜야 할 원칙

1. **주장 → 근거 → 예시** 순서를 항상 지키세요. 주장만 있으면 자기 PR, 예시만 있으면 경험담. 둘을 연결해야 포지셔닝입니다.
2. **추상적 인간 찬양은 피하세요.** "창의성", "공감", "감성" — 증거 없이 말하면 약점이 됩니다.
3. **성장 영역을 숨기지 마세요.** 기존 Wiki의 `Growth Areas` 섹션처럼, 약점을 솔직하게 인정하되 개선 방향과 함께 말하는 것이 신뢰를 만듭니다.
4. **"아직 주니어"를 부끄러워하지 마세요.** 기존 v12 문서에서 이미 잘 쓰고 있는 표현: "Right now I'm a junior developer. I'm not denying that. But what I'm building isn't 'a good junior developer' — it's 'a new role that the AI era needs.'" — 이 톤을 유지하세요.

---

> **파일 관리 권장:**  
> EN: `notion-wiki-draft-v13-ai-competitiveness-en.md`  
> KO: `notion-wiki-draft-v13-ai-competitiveness-ko.md`  
> Second Brain: `decision_logs/why-connector-not-competitor-en.md` / `*-ko.md`  
> FAQ cache: `faq-answers.en.ts` → `faq.ai_era.*` prefix로 등록