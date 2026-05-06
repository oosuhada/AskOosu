# AskOosu Notion Wiki Draft

이 문서는 현재 코드, README, 아키텍처 문서, 기존 Notion 자기분석 페이지에서 확인 가능한 내용을 먼저 채운 초안입니다.

- `확인 필요`: 현재 자료로는 어느 정도 추론 가능하지만 우수가 직접 확인해야 하는 내용
- `TODO`: 우수가 직접 작성하거나 최종 판단해야 하는 내용
- `비워둠`: 아직 자료가 없어 의도적으로 비워둔 내용

## 1. Profile

### 기본 정보

| 항목 | 내용 |
| --- | --- |
| 이름 | Oosu Jang |
| 한글 이름 | 장우수 |
| 현재 타이틀 | AI-connected Fullstack Developer |
| 현재 위치 | Seoul, South Korea |
| 거주 | 서울특별시 마포구 |
| 학력 | 한국외국어대학교 경영학전공 |
| 이메일 | oosu.salon@gmail.com |
| GitHub | https://github.com/oosuhada |
| LinkedIn | https://www.linkedin.com/in/oosuhada/ |
| Instagram | https://www.instagram.com/oosu.hada |
| 2026 포트폴리오 | https://github.com/oosuhada/AskOosu |
| 2025 포트폴리오 | https://oosuhada.github.io/portfoli-oh/ |
| 2025 포트폴리오 GitHub | https://github.com/oosuhada/portfoli-oh |
| AskOosu Wiki | https://www.notion.so/355a342869018181b578d73a791356af |
| Resume KO | TODO |
| Resume EN | TODO |

### 한 줄 소개

프론트엔드 경험을 바탕으로 백엔드와 AI를 연결해, 사용자가 실제로 쓸 수 있는 서비스 형태로 구현하는 AI-connected Fullstack Developer.

### 3문장 소개

우수는 인터랙션 중심의 프론트엔드 포트폴리오에서 출발해, 현재는 React, Spring Boot, 데이터베이스, AI 도구를 연결하는 풀스택 개발자로 확장하고 있습니다. 새로운 도구와 기술을 빠르게 실험하고, 서비스 기획과 구조 설계를 통해 아이디어를 실제 구현으로 옮기는 데 강점이 있습니다. AskOosu는 이런 방향성을 보여주는 2026년 포트폴리오로, 방문자가 스크롤 대신 대화로 프로젝트, 기술 스택, 협업 가능성을 탐색하도록 설계되었습니다.

### 긴 자기소개

우수는 서비스 기획, 데이터 분석, 오프라인 매장 운영, 웹/앱 개발을 거치며 문제를 발견하고 구조화한 뒤 실제 결과물로 연결하는 경험을 쌓아왔습니다. GfK Korea에서는 삼성전자 계정의 글로벌 POS 데이터 분석 컨설팅을 경험했고, 우수살롱에서는 와인바를 창업해 공간 운영, 메뉴 기획, 인력 및 재고 관리 등 서비스 운영 전반을 직접 다뤘습니다. 이후 Flutter 앱 개발, UX/UI 웹·모바일 디자인, 생성형 AI 응용개발자 과정을 거치며 개발자로서의 전환과 확장을 이어가고 있습니다.

프론트엔드에서는 HTML, CSS, JavaScript, React, TypeScript 기반의 화면 구현과 인터랙션 설계 경험이 있으며, Sticks & Stones 홈페이지를 WordPress에서 TypeScript/Vite 기반 환경으로 마이그레이션한 실서비스 경험이 있습니다. 모바일 영역에서는 Flutter와 Firebase 기반 앱 프로젝트를 진행했고, 백엔드와 데이터베이스 영역에서는 Spring Boot, Node.js, PostgreSQL, MySQL을 활용한 풀스택 프로젝트를 진행하고 있습니다.

최근에는 Claude Code, Gemini CLI, OpenAI Codex 등 AI 개발 도구를 실제 개발 과정에 적용하며, 기획, 구현, 디버깅, 문서화를 더 빠르게 연결하는 방식을 실험하고 있습니다. AskOosu는 이러한 실험의 결과물입니다. 정적인 포트폴리오 페이지 대신, Notion Wiki와 RAG를 연결해 방문자의 질문에 맞춰 우수의 프로젝트와 경험을 답변하는 대화형 포트폴리오를 목표로 합니다.

### 개발자로서의 강점

| 강점 | 현재 초안 |
| --- | --- |
| 빠른 학습과 실행 | 새로운 분야를 빠르게 학습하고 실제 구현까지 연결하는 실행력이 있습니다. |
| 서비스 기획 감각 | 다양한 경험에서 얻은 인사이트를 바탕으로 아이디어를 기획하고 서비스 구조로 구체화하는 것을 좋아합니다. |
| 프론트엔드 감각 | 인터랙션, 화면 흐름, 포트폴리오 스토리텔링에 관심이 많고 실제 구현 경험이 있습니다. |
| 풀스택 확장성 | React/TypeScript 기반 프론트엔드에서 Spring Boot, PostgreSQL, AI/RAG 구조로 확장하고 있습니다. |
| AI 도구 활용 | Claude Code, Gemini CLI, Codex 같은 AI 개발 도구를 개인 프로젝트에 적극적으로 적용하고 있습니다. |
| 비즈니스/UX 연결 | 데이터 분석 컨설팅, 창업/운영, UX/UI 교육 경험을 바탕으로 기술을 사용자 문제와 연결하려고 합니다. |

### 일하는 방식

| 항목 | 현재 초안 |
| --- | --- |
| 문제 접근 | 먼저 목적과 맥락을 파악한 뒤, 서비스 구조와 사용자 흐름을 정리하고 구현에 들어갑니다. |
| 설계 방식 | 초기 기획과 구조 설계에 몰입하는 편이며, 기능을 만들기 전에 전체 방향과 기준을 잡는 것을 선호합니다. |
| 구현 방식 | 작은 단위로 만들고 확인하면서 UI, API, 데이터, AI 응답 흐름을 연결합니다. |
| 마무리 방식 | 마무리 단계에서 집중력이 떨어질 수 있음을 인식하고, 완료 기준과 우선순위를 먼저 정해 보완하려고 합니다. |
| 반복 작업 | 목적과 맥락 없이 주어지는 반복 작업보다 결과와 연결되는 실질적인 작업을 선호합니다. |
| 확인 필요 | 실제 협업에서 사용하는 도구, 문서화 습관, 코드 리뷰 방식, 일정 관리 방식은 추가 작성 필요. |

### 배우는 방식

| 항목 | 현재 초안 |
| --- | --- |
| 학습 성향 | 새로운 도구와 기술이 등장하면 직접 써보며 빠르게 익히는 것을 즐깁니다. |
| 실습 방식 | 단순 학습에 그치기보다 개인 프로젝트나 포트폴리오 기능에 붙여보며 익힙니다. |
| 현재 학습 | KOSA × BISTelligence 생성형 AI 응용개발자 과정에서 백엔드, 데이터 처리, AI 서비스 개발 역량을 쌓고 있습니다. |
| 루틴 | 코딩 테스트 스터디에서 1일 1문제 풀이를 목표로 하고 있습니다. |
| 확인 필요 | 실제 학습 기록 방식, 참고 자료, 학습 루틴, 회고 방식은 추가 작성 필요. |

### 협업 스타일

| 항목 | 현재 초안 |
| --- | --- |
| 기본 태도 | 팀 프로젝트와 코드 스터디를 통해 동료와 적극적으로 협업하려는 목표가 있습니다. |
| 강점 | 기획, 구조 설계, 사용자 문제 정의, 구현 연결에서 기여할 수 있습니다. |
| 커뮤니케이션 | TODO |
| 코드 리뷰 | TODO |
| 갈등/이견 처리 | TODO |
| 선호하는 팀 환경 | 목적, 맥락, 결과가 명확한 환경에서 더 잘 일합니다. |
| 확인 필요 | 실제 협업 사례를 기반으로 구체화 필요. |

### 현재 집중하는 방향

| 항목 | 현재 초안 |
| --- | --- |
| 포트폴리오 | AskOosu 2026 대화형 포트폴리오 완성 |
| AI | Notion Wiki, RAG, AI 응답 품질, AI 개발 도구 활용 방식 정리 |
| 백엔드/데이터 | Spring Boot, PostgreSQL, 데이터 처리, API 설계 역량 강화 |
| 커리어 | 데이터, UX, 비즈니스를 연결하는 AI 서비스 개발자로 성장 |
| 관심 분야 | 제조 데이터, 산업용 AI, AI 응용 개발, 풀스택 개발, AI PM 성격의 문제 정의 |

### 성장 중인 부분

| 항목 | 현재 초안 |
| --- | --- |
| 마무리 집중력 | 초기 기획·설계에 몰입하는 만큼 마무리 단계에서 집중력이 떨어지는 경향이 있어, 완료 기준을 사전에 정하는 방식으로 보완 중입니다. |
| 우선순위 | 관심사가 넓어 방향성이 분산될 수 있어, 현재는 우선순위를 명확히 설정하는 습관을 기르고 있습니다. |
| 백엔드/AI 실무 깊이 | Spring Boot, 데이터 처리, RAG, AI 서비스 운영 품질을 프로젝트로 쌓아가는 중입니다. |
| 확인 필요 | 본인이 가장 솔직하게 말하고 싶은 성장 과제 1~2개 추가 필요. |

### 포트폴리오에서 말해도 되는 핵심 이력

| 기간 | 이력 | 포트폴리오용 요약 |
| --- | --- | --- |
| 2015.12-2016.02 | 아이리스 인포테크, 에스티로더 코리아 해외 IT 계약 프로젝트 담당 | 해외 IT 프로젝트 환경을 경험했습니다. |
| 2018.04-2019.11 | GfK Korea, 삼성전자(GKAM) 어카운트 글로벌 POS 데이터 분석 컨설턴트 | 글로벌 POS 데이터 분석과 클라이언트 컨설팅 경험을 통해 데이터 기반 문제 정의를 경험했습니다. |
| 2020.02-2025.03 | 우수살롱, 와인바 창업 및 운영 | 공간 운영, 메뉴 기획, 인력/재고 관리 등 실제 서비스 운영 전반을 경험했습니다. |
| 2025.08-2026.03 | 스틱스앤스톤스 홈페이지 리뉴얼/마이그레이션 | WordPress 기반 홈페이지를 TypeScript/Vite 기반 환경으로 마이그레이션했습니다. |

### 교육

| 기간 | 과정 |
| --- | --- |
| 2024.10-2025.02 | Flutter 앱 개발 창업 과정, 스파르타 코딩클럽 |
| 2025.04-2025.07 | UX/UI 웹·모바일 디자인 과정, 서울시 매력일자리 사업 |
| 2026.03-2026.09 | KOSA × BISTelligence 생성형 AI 응용개발자 과정, 수료 예정 |

### Profile FAQ 초안

#### Q. 우수는 어떤 개발자예요?

우수는 프론트엔드에서 출발해 백엔드와 AI까지 연결하는 방향으로 확장 중인 AI-connected Fullstack Developer입니다. 화면을 예쁘게 만드는 데서 끝나는 것이 아니라, 사용자 질문, 데이터, API, AI 응답이 하나의 서비스 흐름으로 이어지도록 설계하고 구현하는 데 관심이 있습니다. AskOosu는 이런 방향을 보여주는 대표 프로젝트로, 정적인 포트폴리오를 대화형 지식 인터페이스로 바꾸는 실험입니다.

#### Q. 어떤 강점이 있어요?

새로운 기술을 빠르게 익히고 실제 프로젝트에 붙여보는 실행력이 강점입니다. 또 서비스 기획, 데이터 분석 컨설팅, 오프라인 매장 운영, UX/UI 학습 경험이 있어 기술을 사용자 문제나 비즈니스 맥락과 연결하려는 관점이 있습니다. 프론트엔드, 백엔드, AI를 따로 보는 대신 하나의 서비스 경험으로 묶어내는 방향으로 성장하고 있습니다.

#### Q. 같이 일하면 어떤 스타일인가요?

목적과 맥락을 먼저 이해하고, 문제를 구조화한 뒤 구현으로 옮기는 스타일입니다. 기획과 구조 설계에 강하게 몰입하는 편이라 초반에 방향을 정리하고 기준을 세우는 데 기여할 수 있습니다. 다만 마무리 단계에서 집중력이 떨어질 수 있다는 점을 알고 있어, 완료 기준과 우선순위를 명확히 세우는 방식으로 보완하고 있습니다.

#### Q. 요즘 어디에 집중하고 있나요?

현재는 AskOosu 2026 포트폴리오를 완성하면서, Notion Wiki를 답변 원본으로 연결하는 RAG 구조와 AI 기반 채팅 UX를 다듬는 데 집중하고 있습니다. 동시에 Spring Boot, PostgreSQL, React, TypeScript, AI 개발 도구를 활용해 풀스택·AI 응용 개발 역량을 쌓고 있습니다.

## 2. Projects

### 프로젝트 공통 작성 기준

| 항목 | 작성 기준 |
| --- | --- |
| 프로젝트명 | 서비스명 또는 포트폴리오 카드명 |
| 기간 / 연도 | 연도만 있어도 가능. 정확한 기간은 우수가 직접 보완 |
| 상태 | 완료 / 진행 중 / 계획 / 아카이브 |
| 문제 정의 | 왜 만들었는지, 어떤 불편을 해결하려 했는지 |
| 해결 방식 | 구조, 기술 선택, 핵심 구현 방식 |
| 담당 역할 | 개인 / 팀, 기획/디자인/프론트/백엔드/배포 등 |
| 성과 또는 배운 점 | 수치가 없으면 배운 점 중심으로 작성 |

### AskOosu 2026

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | AskOosu 2026 |
| 기간 / 연도 | 2026 |
| 상태 | 진행 중 |
| 프로젝트 우선순위 | 대표 |
| 한 줄 설명 | 방문자가 스크롤 대신 질문으로 우수의 프로젝트와 기술 스택을 탐색하는 AI-connected 대화형 포트폴리오. |
| 문제 정의 | 정적 포트폴리오는 방문자가 필요한 정보를 직접 찾아야 하고, 최신 프로젝트/학습 정보가 흩어지기 쉽습니다. |
| 해결 방식 | Next.js 기반 채팅 UI에 AI SDK, tool calling, Notion RAG 구조를 연결해 질문별 답변과 프로젝트 카드를 제공합니다. |
| 담당 역할 | 개인 프로젝트. 기획, UI/UX, 프론트엔드, AI 채팅 API, RAG 구조 설계 및 구현. |
| 사용 기술 | Next.js, React, TypeScript, Tailwind CSS, Vercel AI SDK, OpenAI, Groq, xAI/Grok, Tool Calling, Notion API, RAG |
| 핵심 기능 | 추천 질문, 채팅 히스토리, 언어/테마 설정, 프로젝트 카드 렌더링, Notion 기반 검색 컨텍스트 주입, Groq key pool fallback |
| 기술적으로 어려웠던 점 | AI 응답을 단순 텍스트가 아니라 포트폴리오 UX와 연결하고, Notion/정적 프로필 fallback을 함께 설계하는 부분. |
| 해결한 의사결정 | 정적 프로필과 시스템 프롬프트는 유지하되, Notion Wiki를 점진적으로 답변 원본으로 승격하는 구조를 선택. |
| 성과 또는 배운 점 | AI 포트폴리오를 UI, API, RAG, fallback, 배포 운영까지 연결하는 전체 구조를 설계하고 구현 중입니다. |
| 라이브 URL | TODO |
| GitHub URL | https://github.com/oosuhada/AskOosu |
| 이미지 경로 | /oosu-avatar/hover-23.webp, /oosu-avatar/hover-01.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | AskOosu는 우수의 2026년 대화형 포트폴리오로, 방문자의 질문에 맞춰 프로젝트와 기술 스택을 답변하는 AI-connected 인터페이스입니다. |

### Instagram Clone

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Instagram Clone |
| 기간 / 연도 | 2026 |
| 상태 | 배포 완료 또는 진행 중 확인 필요 |
| 프로젝트 우선순위 | 대표 |
| 한 줄 설명 | 피드, 팔로우, 댓글 등 SNS 핵심 기능을 직접 설계·구현한 풀스택 프로젝트. |
| 문제 정의 | 단순 화면 구현을 넘어 데이터베이스, API, 인증/사용자 관계, 프론트엔드 흐름을 함께 다루는 풀스택 경험이 필요했습니다. |
| 해결 방식 | Spring Boot 백엔드, PostgreSQL 데이터베이스, React 프론트엔드를 연결해 SNS의 핵심 흐름을 구현했습니다. |
| 담당 역할 | TODO: 개인/팀 여부, 담당 범위 작성 |
| 사용 기술 | Spring Boot, React, PostgreSQL, REST API |
| 핵심 기능 | 피드, 팔로우, 댓글, 백엔드 API 흐름 |
| 기술적으로 어려웠던 점 | TODO: 인증, 이미지 업로드, 관계 모델링, 배포 등 실제 어려웠던 부분 작성 |
| 해결한 의사결정 | TODO |
| 성과 또는 배운 점 | 풀스택 프로젝트의 전체 흐름, DB 스키마, API 설계, React UI 배포까지 경험했습니다. |
| 라이브 URL | https://oosuhada-instagram-web.fly.dev/ |
| GitHub URL | TODO |
| 이미지 경로 | /oosu-avatar/hover-03.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Instagram Clone은 SNS 핵심 기능을 Spring Boot, React, PostgreSQL로 구현한 우수의 풀스택 프로젝트입니다. |

### Sticks & Stones Homepage

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Sticks & Stones Homepage |
| 기간 / 연도 | 2025-2026 |
| 상태 | 완료 |
| 프로젝트 우선순위 | 대표 |
| 한 줄 설명 | 실제 기업 홈페이지를 WordPress에서 TypeScript/Vite 기반 환경으로 리뉴얼·마이그레이션한 프로젝트. |
| 문제 정의 | 기존 WordPress 기반 홈페이지를 더 관리 가능하고 현대적인 프론트엔드 환경으로 이전할 필요가 있었습니다. |
| 해결 방식 | TypeScript와 Vite 기반 구조로 사이트를 재구성하고, 실서비스 홈페이지 리뉴얼을 담당했습니다. |
| 담당 역할 | 홈페이지 리뉴얼 및 마이그레이션 담당. 단독 여부 확인 필요. |
| 사용 기술 | TypeScript, Vite, HTML, CSS, Website Migration |
| 핵심 기능 | 기업 홈페이지 구조 재구성, 정적 페이지 구현, 배포 환경 이전 |
| 기술적으로 어려웠던 점 | TODO: WordPress 구조 이전, 콘텐츠/디자인 재구성, 반응형, 배포 이슈 등 구체 작성 |
| 해결한 의사결정 | WordPress에서 TypeScript/Vite 기반 환경으로 마이그레이션. 세부 의사결정 TODO |
| 성과 또는 배운 점 | 실제 서비스 환경에서 홈페이지 리뉴얼과 마이그레이션을 경험했습니다. |
| 라이브 URL | https://stks-kr.vercel.app/ |
| GitHub URL | TODO |
| 이미지 경로 | /oosu-avatar/hover-05.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Sticks & Stones는 우수가 실제 기업 홈페이지를 TypeScript/Vite 기반으로 리뉴얼·마이그레이션한 실서비스 프로젝트입니다. |

### Portfoli-Oh! 2025

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Portfoli-Oh! 2025 |
| 기간 / 연도 | 2025 |
| 상태 | 완료 / 아카이브 |
| 프로젝트 우선순위 | 대표 또는 아카이브 확인 필요 |
| 한 줄 설명 | 실험적인 UI/UX와 인터랙션을 담은 2025년 프론트엔드 포트폴리오. |
| 문제 정의 | 개발자로 전환하는 과정에서 프로젝트, UI 실험, 프론트엔드 구현력을 한 곳에 보여줄 포트폴리오가 필요했습니다. |
| 해결 방식 | HTML, CSS, JavaScript, GSAP, Lottie를 활용해 인터랙션 중심의 포트폴리오 경험을 구성했습니다. |
| 담당 역할 | 개인 프로젝트. 기획, 디자인 방향, 프론트엔드 구현. |
| 사용 기술 | HTML, CSS, JavaScript, GSAP, Lottie, GitHub Pages |
| 핵심 기능 | 인터랙티브 포트폴리오, 프로젝트 아카이브, 모션 기반 UI |
| 기술적으로 어려웠던 점 | TODO: 애니메이션 구성, 반응형, 성능, 섹션 전환 등 구체 작성 |
| 해결한 의사결정 | 정적인 이력서형 포트폴리오보다 인터랙션과 시각적 경험을 중심에 둔 구성을 선택. |
| 성과 또는 배운 점 | 프론트엔드 인터랙션과 포트폴리오 스토리텔링의 기반 경험이 되었고, AskOosu 2026의 이전 챕터 역할을 합니다. |
| 라이브 URL | https://oosuhada.github.io/portfoli-oh/ |
| GitHub URL | https://github.com/oosuhada/portfoli-oh |
| 이미지 경로 | /oosu-projects/portfoli-oh-2025.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Portfoli-Oh! 2025는 우수의 프론트엔드 전환기를 보여주는 인터랙션 중심 포트폴리오입니다. |

### Pylingo

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Pylingo |
| 기간 / 연도 | 2026 |
| 상태 | 배포 완료 |
| 프로젝트 우선순위 | 보조 |
| 한 줄 설명 | Python 기초 문법부터 실습 중심으로 학습할 수 있도록 설계한 인터랙티브 학습 웹앱. |
| 문제 정의 | 초보자가 문법을 읽기만 하는 대신 직접 실습하며 Python을 익힐 수 있는 가벼운 학습 흐름이 필요했습니다. |
| 해결 방식 | HTML/CSS/JavaScript 기반 웹앱으로 학습 단계를 나누고, 브라우저에서 실습 중심으로 탐색할 수 있게 구성했습니다. |
| 담당 역할 | TODO: 개인/팀 여부, 담당 범위 작성 |
| 사용 기술 | HTML, CSS, JavaScript, Python Learning, Education UX |
| 핵심 기능 | Python 학습 콘텐츠, 단계형 학습 흐름, 실습 중심 UI |
| 기술적으로 어려웠던 점 | TODO |
| 해결한 의사결정 | TODO |
| 성과 또는 배운 점 | 교육 UX와 학습 흐름 설계 경험을 쌓았습니다. |
| 라이브 URL | https://oosuhada.github.io/pylingo/ |
| GitHub URL | TODO |
| 이미지 경로 | /oosu-avatar/hover-08.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Pylingo는 Python 초보 학습자가 기초 문법을 실습 중심으로 익힐 수 있게 만든 학습 웹앱입니다. |

### Javalingo

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Javalingo |
| 기간 / 연도 | 2026 |
| 상태 | 배포 완료 |
| 프로젝트 우선순위 | 보조 |
| 한 줄 설명 | 객체지향 개념과 코딩 테스트 대비를 위한 Java 단계별 학습 웹앱. |
| 문제 정의 | Java 초보자가 객체지향 개념과 코딩 테스트 기초를 단계적으로 익힐 수 있는 학습 흐름이 필요했습니다. |
| 해결 방식 | HTML/CSS/JavaScript 기반으로 Java 학습 콘텐츠를 구조화하고, 초보자가 순서대로 학습할 수 있게 구성했습니다. |
| 담당 역할 | TODO: 개인/팀 여부, 담당 범위 작성 |
| 사용 기술 | HTML, CSS, JavaScript, Java Learning, Education UX |
| 핵심 기능 | Java 학습 콘텐츠, 객체지향 개념 정리, 코딩 테스트 대비 흐름 |
| 기술적으로 어려웠던 점 | TODO |
| 해결한 의사결정 | TODO |
| 성과 또는 배운 점 | Java 학습 내용을 사용자 친화적인 웹 흐름으로 구조화하는 경험을 쌓았습니다. |
| 라이브 URL | https://oosuhada.github.io/javalingo/ |
| GitHub URL | TODO |
| 이미지 경로 | /oosu-avatar/hover-10.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Javalingo는 Java와 객체지향 개념을 단계적으로 익힐 수 있게 설계한 학습 웹앱입니다. |

### Onjung

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Onjung |
| 기간 / 연도 | 2025 |
| 상태 | 완료 또는 아카이브 확인 필요 |
| 프로젝트 우선순위 | 보조 |
| 한 줄 설명 | 경조사비 내역을 디지털로 기록·관리하는 생활 밀착형 모바일 앱. |
| 문제 정의 | 종이 장부나 기억에 의존하던 경조사비 기록을 더 편리하게 관리할 필요가 있었습니다. |
| 해결 방식 | Flutter 기반 모바일 앱으로 경조사비 내역을 기록하고 관리하는 흐름을 구현했습니다. |
| 담당 역할 | TODO: 개인/팀 여부, 담당 범위 작성 |
| 사용 기술 | Flutter, Figma, Firebase, Riverpod, Mobile UX |
| 핵심 기능 | 경조사비 기록, 내역 관리, 모바일 UX |
| 기술적으로 어려웠던 점 | TODO |
| 해결한 의사결정 | TODO |
| 성과 또는 배운 점 | 생활 문제를 모바일 앱으로 구조화하는 경험과 Flutter 앱 개발 경험을 쌓았습니다. |
| 라이브 URL | TODO |
| GitHub URL | https://github.com/oosuhada/flutter_onjung_v1 (Private) |
| 이미지 경로 | /oosu-projects/onjung.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Onjung은 경조사비 기록을 디지털로 관리하도록 설계한 Flutter 기반 모바일 앱입니다. |

### Nomad Market

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Nomad Market |
| 기간 / 연도 | 2024-2025 |
| 상태 | 완료 또는 아카이브 확인 필요 |
| 프로젝트 우선순위 | 보조 |
| 한 줄 설명 | 여행자가 해외 구매를 중개하는 Grabr 스타일의 크로스보더 마켓플레이스 모바일 앱 콘셉트. |
| 문제 정의 | 해외 구매를 원하는 사용자와 여행자를 연결할 때 신뢰, 채팅, 거래 흐름을 어떻게 설계할지 탐색했습니다. |
| 해결 방식 | Flutter/Firebase 기반 모바일 앱으로 구매자와 여행자를 연결하는 마켓플레이스 흐름을 구현했습니다. |
| 담당 역할 | 수업 팀 프로젝트. 본인 담당 범위 TODO |
| 사용 기술 | Flutter, Figma, Firebase, Riverpod, Marketplace UX, Trust Design |
| 핵심 기능 | 구매 요청, 여행자 중개, 채팅/신뢰 흐름 확인 필요 |
| 기술적으로 어려웠던 점 | TODO |
| 해결한 의사결정 | TODO |
| 성과 또는 배운 점 | 크로스보더 마켓플레이스 UX와 모바일 앱 구조를 경험했습니다. |
| 라이브 URL | TODO |
| GitHub URL | https://github.com/oosuhada/flutter_nomad_market_v1.2 (Private) |
| 이미지 경로 | /oosu-projects/nomad-market.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Nomad Market은 여행자를 통한 해외 구매 중개 흐름을 실험한 Flutter 기반 마켓플레이스 앱입니다. |

### Notion Knowledge Wiki

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Notion Knowledge Wiki |
| 기간 / 연도 | Planned |
| 상태 | 계획 / 진행 중 확인 필요 |
| 프로젝트 우선순위 | 대표 또는 보조 확인 필요 |
| 한 줄 설명 | 우수의 프로필, 프로젝트, 학습 기록, 의사결정을 Notion에 정리하고 AskOosu의 답변 원본으로 연결하는 지식 시스템. |
| 문제 정의 | 포트폴리오 답변 원본이 코드, 프롬프트, 개인 노트에 흩어져 있으면 최신성과 신뢰도를 유지하기 어렵습니다. |
| 해결 방식 | Notion Wiki를 구조화하고, 동기화된 chunk/embedding/vector DB 또는 lexical search를 통해 AskOosu 답변 컨텍스트로 주입합니다. |
| 담당 역할 | 개인 프로젝트. 정보 구조 설계, Notion Wiki 정리, RAG 연동 설계. |
| 사용 기술 | Notion API, RAG, Embeddings, pgvector/Postgres, Scheduled Sync, Portfolio Q&A |
| 핵심 기능 | Profile, Projects, Tech Stack, AI Usage, FAQ, Tone Guide를 답변 원본화 |
| 기술적으로 어려웠던 점 | Notion 문서를 AI가 안정적으로 검색할 수 있도록 chunking, 메타데이터, fallback 기준을 설계하는 부분. |
| 해결한 의사결정 | 중요한 답변은 Notion 우선, 없으면 로컬 프로필 fallback을 사용하는 점진적 전환 구조. |
| 성과 또는 배운 점 | TODO |
| 라이브 URL | TODO |
| GitHub URL | TODO |
| 이미지 경로 | /oosu-avatar/hover-12.webp |
| 영상 URL | TODO |
| 답변 카드 대표 문장 | Notion Knowledge Wiki는 AskOosu가 더 정확하고 최신성 있는 답변을 하도록 만드는 지식 원본 시스템입니다. |

## 3. Tech Stack

### 숙련도 기준

| 숙련도 | 의미 |
| --- | --- |
| learning | 배우는 중. 개념과 기본 사용법을 익히는 단계 |
| usable | 프로젝트에서 사용할 수 있고, 도움을 받아 문제를 해결할 수 있는 단계 |
| confident | 주요 기능을 스스로 설계·구현·디버깅할 수 있는 단계 |
| strong | 실무 수준으로 안정적으로 설계하고 다른 사람에게 설명/리뷰할 수 있는 단계 |

### 기술 스택 초안

| 기술명 | 카테고리 | 숙련도 | 실제 사용 프로젝트 | 할 수 있는 일 | 보완 중인 부분 | 대표 경험 | 노출 우선순위 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HTML | frontend | confident | Portfoli-Oh! 2025, Pylingo, Javalingo, Sticks & Stones | 시맨틱 구조, 정적 페이지 구성, 포트폴리오/학습 웹앱 화면 구현 | 접근성/SEO 세부 기준 추가 확인 필요 | 2025 포트폴리오와 학습 웹앱 구현 | 2 |
| CSS | frontend | confident | Portfoli-Oh! 2025, Pylingo, Javalingo, Sticks & Stones | 반응형 레이아웃, 인터랙션 스타일링, 포트폴리오 UI 구현 | 디자인 시스템화, 접근성 색 대비 QA 보완 | 인터랙션 중심 포트폴리오 구현 | 2 |
| JavaScript | frontend | confident | Portfoli-Oh! 2025, Pylingo, Javalingo | 브라우저 인터랙션, 학습 웹앱 로직, 동적 UI | 대규모 앱 구조화는 TypeScript/React 중심으로 확장 중 | Portfoli-Oh! 인터랙션 구현 | 2 |
| TypeScript | frontend | usable | AskOosu 2026, Sticks & Stones | 타입 기반 React UI, Vite/Next.js 프로젝트 구현 | 고급 타입 설계, 대규모 타입 모델링 | AskOosu와 실서비스 마이그레이션 | 1 |
| React | frontend | usable | AskOosu 2026, Instagram Clone | 컴포넌트 기반 UI, 상태 기반 화면 구성, 채팅/카드 UI 구현 | 복잡한 상태 관리, 성능 최적화, 테스트 | AskOosu 채팅 UI, Instagram Clone 프론트엔드 | 1 |
| Next.js | frontend / infra | usable | AskOosu 2026 | App Router 기반 페이지/API 구성, Vercel 배포 전제 구조 | 캐싱, 서버 컴포넌트, 운영 최적화 | AskOosu 2026 | 1 |
| Tailwind CSS | frontend | usable | AskOosu 2026 | 빠른 UI 스타일링, 반응형 구성, 컴포넌트 스타일링 | 디자인 토큰/일관성 관리 | AskOosu UI | 1 |
| Vite | frontend | usable | Sticks & Stones | 가벼운 프론트엔드 빌드 환경 구성 | 빌드 최적화/운영 이슈 경험 보완 | WordPress에서 Vite 기반 마이그레이션 | 2 |
| GSAP | frontend | usable | Portfoli-Oh! 2025 | 모션/인터랙션 구현 | 성능 최적화, 접근성 대응 | 2025 포트폴리오 인터랙션 | 3 |
| Lottie | frontend | usable | Portfoli-Oh! 2025 | 애니메이션 에셋 활용 | TODO | 2025 포트폴리오 | 3 |
| Java | backend | learning / usable 확인 필요 | Javalingo, Instagram Clone | Java 문법/객체지향 학습, Spring Boot 백엔드 구현 | 코어 Java, 테스트, 객체지향 설계 깊이 | Java 학습 웹앱, 풀스택 프로젝트 | 2 |
| Spring Boot | backend | usable | Instagram Clone | REST API, 백엔드 구조, DB 연동 | 인증/인가, 테스트, 배포 운영, 예외 처리 고도화 | Instagram Clone 백엔드 | 1 |
| Node.js | backend | learning / usable 확인 필요 | AskOosu 2026 | Next.js API route, 서버 사이드 로직 구성 | 독립 백엔드 서버 설계 경험 보완 | AskOosu API route | 2 |
| PostgreSQL | backend / infra | usable | Instagram Clone, AskOosu RAG 계획 | 관계형 데이터 모델링, 프로젝트 DB 구성, pgvector 계획 | 인덱싱, 쿼리 튜닝, 운영 백업 | Instagram Clone, RAG store 계획 | 1 |
| MySQL | backend | learning / usable 확인 필요 | 교육/풀스택 학습 | 관계형 DB 기본 사용 | 실제 프로젝트 경험 구체화 필요 | Notion source에 스택으로 기재 | 3 |
| Python | AI / backend | learning / usable 확인 필요 | Pylingo, KOSA 과정, 코딩 스터디 | Python 문법 학습, 코딩 테스트 풀이, AI/데이터 처리 학습 | 실무형 데이터 처리/AI 파이프라인 | Pylingo, 생성형 AI 과정 | 2 |
| Dart | mobile | usable | Onjung, Nomad Market | Flutter 앱 로직 작성 | 앱 아키텍처, 배포, 테스트 | Flutter 앱 개발 과정 프로젝트 | 2 |
| Flutter | mobile | usable | Onjung, Nomad Market | 모바일 화면 구성, Firebase 연동 앱 개발 | 앱 출시/운영, 고급 상태 관리 | 경조사비 앱, 마켓플레이스 앱 | 2 |
| Firebase | mobile / backend | usable | Onjung, Nomad Market | 모바일 앱 백엔드/데이터 연동 | 보안 규칙, 운영 관리 | Flutter 앱 프로젝트 | 3 |
| Riverpod | mobile | learning / usable 확인 필요 | Onjung, Nomad Market | Flutter 상태 관리 | 구조화/테스트 경험 보완 | Flutter 앱 프로젝트 | 3 |
| Figma | design | usable | Onjung, Nomad Market, UX/UI 과정 | 화면 설계, 프로토타입, 모바일 UX 구상 | 디자인 시스템/핸드오프 고도화 | UX/UI 웹·모바일 디자인 과정 | 3 |
| Notion API | AI / infra | learning / usable | AskOosu 2026, Notion Knowledge Wiki | Notion 페이지를 지식 원본으로 연결, RAG 동기화 설계 | 안정적인 동기화, 권한/버전 관리, chunking 전략 | AskOosu RAG 구조 | 1 |
| RAG | AI | learning / usable | AskOosu 2026, Notion Knowledge Wiki | 질문별 관련 문서 검색, 컨텍스트 주입, fallback 설계 | chunking/embedding 품질, vector DB 운영 | AskOosu Notion RAG 계획/구현 | 1 |
| Embeddings | AI | learning | AskOosu RAG 계획 | 텍스트 임베딩 기반 검색 설계 | 평가, 비용, 최신성 관리 | text-embedding-3-small 옵션 설계 | 2 |
| Vercel AI SDK | AI / frontend | usable | AskOosu 2026 | streamText, UI message stream, tool calling 기반 채팅 API | 고급 tool orchestration, provider별 차이 대응 | AskOosu 채팅 API | 1 |
| OpenAI | AI | usable | AskOosu 2026 | 기본 LLM provider, embedding 모델 사용 | 모델 선택/비용/응답 평가 | AskOosu 기본 provider | 1 |
| Groq | AI / infra | usable | AskOosu 2026 | Groq provider mode, key pool, rate limit/quota fallback 설계 | 운영 로그/장애 대응 고도화 | AskOosu provider fallback | 2 |
| xAI/Grok | AI | learning / usable 확인 필요 | AskOosu 2026 | AI SDK provider 전환 구조 | 실제 운영 안정성 검증 | AskOosu optional provider | 3 |
| Claude Code | AI tools | usable | 개인 프로젝트 | 코드 작성, 리팩터링, 개발 보조 | 검증 루틴 명문화 필요 | Notion source에 실제 개발 도구로 기재 | 1 |
| Gemini CLI | AI tools | usable | 개인 프로젝트 | 코드 탐색/생성 보조 | 검증 루틴 명문화 필요 | Notion source에 실제 개발 도구로 기재 | 2 |
| OpenAI Codex | AI tools | usable | AskOosu 개발 과정 | 코드 구현, 문서 정리, 프로젝트 보조 | AI 산출물 검증 기준 정리 | 현재 포트폴리오 정리/개발 | 1 |

### Tech Stack FAQ 초안

#### Q. 기술 스택과 숙련도가 궁금해요.

우수의 현재 핵심 스택은 React, TypeScript, Next.js, Spring Boot, PostgreSQL, 그리고 AI/RAG 도구입니다. 프론트엔드에서는 HTML/CSS/JavaScript 기반 인터랙션 포트폴리오와 React/TypeScript 기반 AskOosu를 만들었고, 백엔드에서는 Spring Boot와 PostgreSQL을 활용한 풀스택 프로젝트를 진행하고 있습니다. AI 쪽에서는 Vercel AI SDK, OpenAI, Groq, Notion API, RAG 구조를 포트폴리오 자체에 연결하는 방식으로 실험하고 있습니다.

#### Q. 프론트엔드에서 풀스택·AI로 어떻게 확장했나요?

2025년에는 Portfoli-Oh!를 통해 프론트엔드 인터랙션과 포트폴리오 스토리텔링을 보여주는 데 집중했습니다. 이후 Sticks & Stones 홈페이지 마이그레이션, Instagram Clone 풀스택 프로젝트, KOSA 생성형 AI 응용개발자 과정을 거치며 백엔드와 데이터베이스 영역으로 확장했습니다. 2026년 AskOosu에서는 그 흐름을 AI 채팅, tool calling, Notion RAG까지 연결해 포트폴리오 자체를 하나의 AI 서비스처럼 만들고 있습니다.

### 우수가 직접 채우면 좋은 핵심 빈칸

| 우선순위 | 채울 내용 |
| --- | --- |
| 1 | 각 프로젝트의 정확한 기간, 개인/팀 여부, 본인 담당 범위 |
| 1 | Instagram Clone의 GitHub URL, 인증/이미지/배포 등 핵심 난이도 |
| 1 | Sticks & Stones에서 실제로 겪은 마이그레이션 문제와 해결 방식 |
| 1 | AskOosu 라이브 URL, 현재 배포 상태, 가장 보여주고 싶은 기술적 포인트 |
| 2 | Pylingo/Javalingo의 GitHub URL과 실제 학습 기능 상세 |
| 2 | Onjung/Nomad Market에서 본인이 맡은 역할과 핵심 화면/기능 |
| 2 | 기술별 숙련도 최종 판단 |
| 3 | 각 프로젝트 이미지/영상 최종 자료 |
| 3 | 협업 스타일의 실제 사례 |
| 3 | Resume KO/EN Notion URL |
