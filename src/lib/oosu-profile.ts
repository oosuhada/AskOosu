export const oosuProfile = {
  name: 'Oosu Jang',
  handle: '@oosuhada',
  title: 'AI-connected Fullstack Developer',
  location: 'Seoul, South Korea',
  residence: '서울특별시 마포구',
  education: '한국외국어대학교 경영학전공',
  email: 'oosu.salon@gmail.com',
  github: 'https://github.com/oosuhada',
  linkedin: 'https://www.linkedin.com/in/oosuhada/',
  instagram: 'https://www.instagram.com/oosu.hada',
  currentPortfolio: 'https://github.com/oosuhada/AskOosu',
  legacyPortfolioUrl: 'https://oosuhada.github.io/portfoli-oh/',
  legacyPortfolioGithub: 'https://github.com/oosuhada/portfoli-oh',
  notionWikiUrl: 'https://www.notion.so/355a342869018181b578d73a791356af',
  notionSourceUrl: 'https://www.notion.so/401a342869018248a3f881a3e5fbef07',
  resumeKoUrl: '',
  resumeEnUrl: '',
  wikiSource: 'Notion API planned',
  sourceSummary:
    '2026 KOSA x BISTelligence 생성형 AI 응용개발자 과정 자기분석/포트폴리오 Notion page',
} as const;

export const suggestedQuestions = {
  Portfolio: '대표 프로젝트 보여줘',
  Me: 'Oosu Jang은 어떤 개발자인가요?',
  Skills: '기술 스택과 강점을 알려줘',
  Process: '이 포트폴리오는 어떻게 업데이트되나요?',
  Contact: '연락처를 알려줘',
} as const;

export const oosuProjects = [
  {
    title: 'AskOosu 2026',
    category: 'AI Portfolio',
    date: '2026',
    description:
      'AskOosu is a 2026 portfolio interface connected to an AI backend. Instead of asking visitors to scroll through static sections, it lets them ask natural language questions and receive answers about Oosu, projects, skills, portfolio work, and future wiki knowledge. The latest profile and project source is planned to come from Notion.',
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Vercel AI SDK',
      'OpenAI',
      'Tool Calling',
      'Notion API planned',
    ],
    links: [
      {
        name: 'GitHub',
        url: oosuProfile.currentPortfolio,
      },
      {
        name: 'Notion Wiki',
        url: oosuProfile.notionWikiUrl,
      },
      {
        name: 'Source Notion Page',
        url: oosuProfile.notionSourceUrl,
      },
    ],
    images: [
      {
        src: '/oosu-avatar/hover-23.webp',
        alt: 'AskOosu animated profile avatar frame',
      },
      {
        src: '/oosu-avatar/hover-01.webp',
        alt: 'Oosu avatar frame',
      },
    ],
  },
  {
    title: 'Instagram Clone',
    category: 'Fullstack',
    date: '2026',
    description:
      'A fullstack project implementing core SNS features including feeds, follows, comments, and backend API flows. It is built to practice the full product loop from database schema and API design to React UI deployment.',
    techStack: ['Spring Boot', 'React', 'PostgreSQL', 'Fullstack', 'REST API'],
    links: [
      {
        name: 'Live Site',
        url: 'https://oosuhada-instagram-web.fly.dev/',
      },
    ],
    images: [
      {
        src: '/oosu-avatar/hover-03.webp',
        alt: 'Instagram clone placeholder preview',
      },
    ],
  },
  {
    title: 'Sticks & Stones Homepage',
    category: 'Real Service Migration',
    date: '2025-2026',
    description:
      'A real company homepage renewal and migration project. Oosu migrated the site from WordPress to a TypeScript and Vite based environment, handling the renewal as a practical frontend implementation project.',
    techStack: ['TypeScript', 'Vite', 'HTML', 'CSS', 'Website Migration'],
    links: [
      {
        name: 'Live Site',
        url: 'https://stks-kr.vercel.app/',
      },
    ],
    images: [
      {
        src: '/oosu-avatar/hover-05.webp',
        alt: 'Sticks and Stones project placeholder preview',
      },
    ],
  },
  {
    title: 'Portfoli-Oh! 2025',
    category: 'Frontend Portfolio',
    date: '2025',
    description:
      'The 2025 frontend portfolio built as an interactive playground. It presents projects, experimental UI/UX, motion, and portfolio storytelling through a custom HTML/CSS/JavaScript experience.',
    techStack: ['HTML', 'CSS', 'JavaScript', 'GSAP', 'Lottie', 'GitHub Pages'],
    links: [
      {
        name: 'Live Site',
        url: oosuProfile.legacyPortfolioUrl,
      },
      {
        name: 'GitHub',
        url: oosuProfile.legacyPortfolioGithub,
      },
    ],
    images: [
      {
        src: '/oosu-projects/portfoli-oh-2025.webp',
        alt: 'Portfoli-Oh 2025 portfolio preview',
      },
    ],
  },
  {
    title: 'Pylingo',
    category: 'Learning Web App',
    date: '2026',
    description:
      'An interactive Python learning web app designed around hands-on practice. It helps learners move from basic syntax to applied exercises through a lightweight browser-based learning flow.',
    techStack: ['HTML', 'CSS', 'JavaScript', 'Python Learning', 'Education UX'],
    links: [
      {
        name: 'Live Site',
        url: 'https://oosuhada.github.io/pylingo/',
      },
    ],
    images: [
      {
        src: '/oosu-avatar/hover-08.webp',
        alt: 'Pylingo project placeholder preview',
      },
    ],
  },
  {
    title: 'Javalingo',
    category: 'Learning Web App',
    date: '2026',
    description:
      'A Java learning web app for object-oriented concepts and coding-test preparation. The project structures Java study into staged learning and practice for beginners.',
    techStack: ['HTML', 'CSS', 'JavaScript', 'Java Learning', 'Education UX'],
    links: [
      {
        name: 'Live Site',
        url: 'https://oosuhada.github.io/javalingo/',
      },
    ],
    images: [
      {
        src: '/oosu-avatar/hover-10.webp',
        alt: 'Javalingo project placeholder preview',
      },
    ],
  },
  {
    title: 'Onjung',
    category: 'Cross-platform App',
    date: '2025',
    description:
      'A cross-platform app for digitally recording and managing congratulatory/condolence money history. It replaces analog ledgers with a practical life-event record flow.',
    techStack: ['Flutter', 'Figma', 'Firebase', 'Riverpod', 'Mobile UX'],
    links: [
      {
        name: 'GitHub Private',
        url: 'https://github.com/oosuhada/flutter_onjung_v1',
      },
    ],
    images: [
      {
        src: '/oosu-projects/onjung.webp',
        alt: 'Onjung project preview',
      },
    ],
  },
  {
    title: 'Nomad Market',
    category: 'Cross-border Marketplace',
    date: '2024-2025',
    description:
      'A Grabr-style mobile app concept where travelers mediate overseas purchases for buyers. The project explores cross-border marketplace UX, trust, chat, and user verification.',
    techStack: [
      'Flutter',
      'Figma',
      'Firebase',
      'Riverpod',
      'Marketplace UX',
      'Trust Design',
    ],
    links: [
      {
        name: 'GitHub Private',
        url: 'https://github.com/oosuhada/flutter_nomad_market_v1.2',
      },
    ],
    images: [
      {
        src: '/oosu-projects/nomad-market.webp',
        alt: 'Nomad Market project preview',
      },
    ],
  },
  {
    title: 'Notion Knowledge Wiki',
    category: 'Planned Knowledge System',
    date: 'Planned',
    description:
      'A planned knowledge layer where Oosu can store study notes, GitHub learning logs, project decisions, Korean and English resume pages, and portfolio wiki entries in Notion. AskOosu will later retrieve and summarize that information through the Notion API.',
    techStack: [
      'Notion API',
      'GitHub API',
      'RAG',
      'Embeddings',
      'Scheduled Sync',
      'Portfolio Q&A',
    ],
    links: [
      {
        name: 'AskOosu Wiki',
        url: oosuProfile.notionWikiUrl,
      },
      {
        name: 'Source Page',
        url: oosuProfile.notionSourceUrl,
      },
    ],
    images: [
      {
        src: '/oosu-avatar/hover-12.webp',
        alt: 'Oosu project preview used as a placeholder for future wiki cards',
      },
    ],
  },
] as const;
