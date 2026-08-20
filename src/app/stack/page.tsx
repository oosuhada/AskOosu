'use client';

import Link from 'next/link';
import { useState } from 'react';

type Skill = {
  name: string;
  firstSeen: `${number}-${number}`;
  timelineAt: TimelineMilestone;
  repo: string;
  path: string;
  commit: string;
};

type StackGroup = {
  label: string;
  skills: Skill[];
};

const timelineMilestones = ['2024-09', '2025-03', '2026-03', '2026-05', '2026-07', 'NOW'] as const;
type TimelineMilestone = (typeof timelineMilestones)[number];
const MAX_STEP = timelineMilestones.length - 1;

function timelineOffset(timelineAt: TimelineMilestone) {
  if (timelineAt === 'NOW') return MAX_STEP;
  return timelineMilestones.indexOf(timelineAt);
}

// Dates below are the earliest public Git commit evidence found for each skill.
// They mean "in use by this month", not necessarily "learned for the first time this month".
const stackGroups: StackGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'Dart', firstSeen: '2024-10', timelineAt: '2024-09', repo: 'shoppingmall_console', path: 'shoppingmall_main.dart', commit: '691b820a473bf89487c5dbc732afec9ccefca528' },
      { name: 'JavaScript', firstSeen: '2025-06', timelineAt: '2025-03', repo: 'portfolio', path: 'repository root', commit: '4490db6bfdea28082f2dad7f87710c97d0a6a81b' },
      { name: 'HTML', firstSeen: '2025-06', timelineAt: '2025-03', repo: 'portfolio', path: 'repository root', commit: '4490db6bfdea28082f2dad7f87710c97d0a6a81b' },
      { name: 'CSS', firstSeen: '2025-06', timelineAt: '2025-03', repo: 'portfolio', path: 'repository root', commit: '4490db6bfdea28082f2dad7f87710c97d0a6a81b' },
      { name: 'Python', firstSeen: '2026-03', timelineAt: '2026-03', repo: 'Flai', path: 'sdk/python/pyproject.toml', commit: '4460b429fcf4827b3a92d8db1298ef26776a72e7' },
      { name: 'TypeScript', firstSeen: '2026-03', timelineAt: '2026-03', repo: 'Flai', path: 'sdk/js/src/index.ts', commit: 'd9c2c9e54489e348d4a22728086d64bc2a0d85b5' },
      { name: 'Java', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'instagram-project', path: 'backend/build.gradle', commit: '2fd1ea806e3addbb83a3614cb41264f3ee877baa' },
      { name: 'Swift', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'iBridge-Studio', path: 'apps/primary-macos/Package.swift', commit: '0b9ccde5ec048307adffcc8bd05a638da9e2aa81' },
    ],
  },
  {
    label: 'Web / Frontend',
    skills: [
      { name: 'Three.js', firstSeen: '2025-06', timelineAt: '2025-03', repo: 'portfolio', path: 'lab/javascript/3d/3dBlob/index.html', commit: '7eebcd31b36f4cd8a447cb6d4dc650975167c379' },
      { name: 'React', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'Flai', path: 'website/package.json', commit: '515f29c5d4197d50dd403992917927becc2df90b' },
      { name: 'Next.js', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'Flai', path: 'website/package.json', commit: '515f29c5d4197d50dd403992917927becc2df90b' },
      { name: 'Tailwind CSS', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'instagram-project', path: 'frontend/package.json', commit: 'f6075cfd0b8cdb552c9a45de1d1f17fc41f1595b' },
      { name: 'Framer Motion', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'instagram-project', path: 'frontend/package.json', commit: 'f6075cfd0b8cdb552c9a45de1d1f17fc41f1595b' },
      { name: 'Vite', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'Aigram', path: 'package.json', commit: 'ebdb6455b3f812f5db8d5feaac6eb4316121e982' },
      { name: 'React Admin', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'Lingo', path: 'package.json', commit: '6e6f227f4e533167cf4a84bf26bf3fd235439a3e' },
    ],
  },
  {
    label: 'App / Desktop / Extensions',
    skills: [
      { name: 'Flutter', firstSeen: '2024-11', timelineAt: '2024-09', repo: 'train_booking_app', path: 'pubspec.yaml', commit: 'cb5862f2eca1d34692cee87d712cfb1f3629b6f7' },
      { name: 'Riverpod', firstSeen: '2024-11', timelineAt: '2024-09', repo: 'flutter_riverpod_mvvm', path: 'pubspec.yaml', commit: '4790201b5324a54a569eed9456e42f6aef89c2f4' },
      { name: 'Firebase', firstSeen: '2024-12', timelineAt: '2024-09', repo: 'flutter_firebase_blog_app', path: 'pubspec.yaml', commit: '5b7ecdabb4118aec3adca005b9a14424d4f6b1a7' },
      { name: 'Firestore', firstSeen: '2024-12', timelineAt: '2024-09', repo: 'flutter_firebase_blog_app', path: 'pubspec.yaml', commit: '5b7ecdabb4118aec3adca005b9a14424d4f6b1a7' },
      { name: 'GoRouter', firstSeen: '2025-01', timelineAt: '2024-09', repo: 'flutter_nomad_market_v1.2', path: 'pubspec.yaml', commit: '724698f5c5a4d3fcf99c5f141cfab1e2243eb018' },
      { name: 'Chrome Extensions', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'codetestlog-extension', path: 'manifest.json', commit: 'd8f93685c3b5e668bfcc4a992d15f8a9bbf0934b' },
      { name: 'Swift / macOS', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'iBridge-Studio', path: 'apps/primary-macos/Package.swift', commit: '0b9ccde5ec048307adffcc8bd05a638da9e2aa81' },
      { name: 'ScreenCaptureKit', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'iBridge-Studio', path: 'apps/primary-macos/Package.swift', commit: '0b9ccde5ec048307adffcc8bd05a638da9e2aa81' },
      { name: 'VS Code Extension API', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'gitanimals-vscode', path: 'package.json', commit: 'f4ce7fff342b50bca6162f08722e36ad423e1813' },
    ],
  },
  {
    label: 'Backend / API',
    skills: [
      { name: 'Node.js', firstSeen: '2025-06', timelineAt: '2025-03', repo: 'ezair.ai', path: 'backend/package.json', commit: 'a6ea2813aa8371d970fbffbaf7886df7435e26df' },
      { name: 'Express', firstSeen: '2025-06', timelineAt: '2025-03', repo: 'ezair.ai', path: 'backend/package.json', commit: 'a6ea2813aa8371d970fbffbaf7886df7435e26df' },
      { name: 'Pydantic', firstSeen: '2026-03', timelineAt: '2026-03', repo: 'Flai', path: 'sdk/python/pyproject.toml', commit: '4460b429fcf4827b3a92d8db1298ef26776a72e7' },
      { name: 'Spring Boot', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'instagram-project', path: 'backend/build.gradle', commit: '2fd1ea806e3addbb83a3614cb41264f3ee877baa' },
      { name: 'Meilisearch', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'instagram-project', path: 'backend/build.gradle', commit: '8ed1ec64f7ed889d902953edf656ed840df7116e' },
      { name: 'FastAPI', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'webtoon-ai-translate', path: 'backend/requirements.txt', commit: '469e6b62b841402baa513eb1b732d9039f0c2539' },
      { name: 'SQLAlchemy', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'webtoon-ai-translate', path: 'backend/requirements.txt', commit: '469e6b62b841402baa513eb1b732d9039f0c2539' },
      { name: 'Drizzle ORM', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'Lingo', path: 'package.json', commit: '6e6f227f4e533167cf4a84bf26bf3fd235439a3e' },
    ],
  },
  {
    label: 'AI / ML',
    skills: [
      { name: 'Groq', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'webtoon-ai-translate', path: 'backend/requirements.txt', commit: '469e6b62b841402baa513eb1b732d9039f0c2539' },
      { name: 'OpenAI API', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'AskOosu', path: 'package.json', commit: '744ecd925afdcf1dcb82f5eb2e4e8a3b13d879a6' },
      { name: 'RAG', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'AskOosu', path: 'src/lib/rag', commit: '7855017b768a5ebe6be71b3d07c07fc9944b84b4' },
      { name: 'Embeddings / Vector Search', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'AskOosu', path: 'src/lib/rag', commit: '7cb5c2539c6490c2eb2983a22a7dc6ddaff9f9ce' },
      { name: 'Vertex AI / Gemini', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'AskOosu', path: 'package.json', commit: 'da67abea59b81d34bb5d37dce7966d885f339bcb' },
      { name: 'LangChain', firstSeen: '2026-06', timelineAt: '2026-05', repo: 'kosa-langchain-practice', path: 'langchain/requirements.txt', commit: '53f12e2410d26e8c7846a6e3ff8715e0da7668cf' },
      { name: 'Agentic Workflows', firstSeen: '2026-08', timelineAt: '2026-05', repo: 'agentic-ontology-dashboard', path: 'api/pyproject.toml', commit: '47eefeb2c5576fc01b1d474c429b95a68bf9b80e' },
    ],
  },
  {
    label: 'Data / Knowledge',
    skills: [
      { name: 'PostgreSQL', firstSeen: '2026-04', timelineAt: '2026-03', repo: 'instagram-project', path: 'backend/build.gradle', commit: '2fd1ea806e3addbb83a3614cb41264f3ee877baa' },
      { name: 'pgvector', firstSeen: '2026-05', timelineAt: '2026-03', repo: 'AskOosu', path: 'src/lib/rag', commit: '7cb5c2539c6490c2eb2983a22a7dc6ddaff9f9ce' },
      { name: 'Knowledge Graph', firstSeen: '2026-07', timelineAt: '2026-07', repo: 'text2cypher-factory-rca', path: 'backend/requirements.txt', commit: 'ea4c283f8dba3fe87fd91f67a1a8f8b78dd185a3' },
      { name: 'Neo4j', firstSeen: '2026-07', timelineAt: '2026-07', repo: 'text2cypher-factory-rca', path: 'backend/requirements.txt', commit: 'ea4c283f8dba3fe87fd91f67a1a8f8b78dd185a3' },
      { name: 'Text-to-Cypher', firstSeen: '2026-07', timelineAt: '2026-07', repo: 'text2cypher-factory-rca', path: 'backend/requirements.txt', commit: 'ea4c283f8dba3fe87fd91f67a1a8f8b78dd185a3' },
      { name: 'Ontology', firstSeen: '2026-08', timelineAt: '2026-07', repo: 'agentic-ontology-dashboard', path: 'api/pyproject.toml', commit: '21b894d56883455a023c826a2f6cf010cfe3ba6f' },
    ],
  },
];

function milestoneLabel(milestone: TimelineMilestone) {
  return milestone === 'NOW' ? 'NOW · 2026.08' : milestone.replace('-', '.');
}

function evidenceUrl(skill: Skill) {
  return `https://github.com/oosuhada/${skill.repo}/commit/${skill.commit}`;
}

export default function StackTimelinePage() {
  const [selectedStep, setSelectedStep] = useState(MAX_STEP);
  const selectedMilestone = timelineMilestones[selectedStep];

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-[980px]">
        <div className="mb-8 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← AskOosu
          </Link>
          <span>GitHub-backed stack timeline</span>
        </div>

        <header className="border-b border-border pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Stack</h1>
        </header>

        <blockquote className="my-7 border-l-4 border-border pl-4 text-lg font-medium sm:text-xl">
          기술은 목적보다 뒤에 둡니다. 필요한 문제에 맞춰 웹·모바일·AI·데이터·인프라를 연결합니다.
        </blockquote>

        <section className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">STACK TIMELINE</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {milestoneLabel(selectedMilestone)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground" />
              evidenced by selected time
              <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full border border-border bg-muted opacity-30" />
              not yet seen
            </div>
          </div>

          <label htmlFor="stack-time" className="sr-only">
            Stack timeline milestone
          </label>
          <input
            id="stack-time"
            type="range"
            min={0}
            max={MAX_STEP}
            step={1}
            value={selectedStep}
            onChange={(event) => setSelectedStep(Number(event.target.value))}
            className="h-2 w-full cursor-ew-resize accent-foreground"
            style={{ accentColor: 'var(--foreground)' }}
          />
          <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
            <span>2024.09</span>
            <span>2025.03</span>
            <span>2026.03</span>
            <span>2026.05</span>
            <span>2026.07</span>
            <span>NOW</span>
          </div>

          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Drag between grouped milestones. Activation dates are intentionally compressed for readability; each chip still keeps its exact earliest public Git commit evidence.
            Click a chip to inspect that evidence commit.
          </p>
        </section>

        <section className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[minmax(150px,0.28fr)_1fr] border-b border-border bg-muted/35 px-4 py-3 text-sm font-semibold sm:grid-cols-[210px_1fr]">
            <span>Area</span>
            <span>Stack</span>
          </div>

          {stackGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={`grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[210px_1fr] sm:gap-5 ${
                groupIndex === stackGroups.length - 1 ? '' : 'border-b border-border'
              }`}
            >
              <h2 className="font-semibold">{group.label}</h2>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => {
                  const active = selectedStep >= timelineOffset(skill.timelineAt);
                  const evidence = `${skill.name} · timeline ${skill.timelineAt.replace('-', '.')} · first seen ${skill.firstSeen.replace('-', '.')} · ${skill.repo}/${skill.path} · ${skill.commit.slice(0, 7)}`;
                  return (
                    <a
                      key={skill.name}
                      href={evidenceUrl(skill)}
                      target="_blank"
                      rel="noreferrer"
                      title={evidence}
                      aria-label={`${evidence}; open GitHub evidence commit`}
                      className="rounded-md border border-border bg-muted/45 px-2.5 py-1 font-mono text-[13px] transition-opacity duration-300 ease-out hover:bg-muted sm:text-sm"
                      style={{ opacity: active ? 1 : 0.13 }}
                    >
                      {skill.name}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Timeline dates are grouped milestones for readability. Evidence links preserve the earliest public commit currently found in oosuhada repositories or imported Git history; grouped activation is not presented as the literal first-use date.
        </p>
      </article>
    </div>
  );
}
