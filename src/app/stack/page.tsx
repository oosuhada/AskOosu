'use client';

import Link from 'next/link';
import { useState } from 'react';

type Skill = {
  name: string;
  unlockedAt: number;
  firstProject?: string;
};

type StackGroup = {
  label: string;
  skills: Skill[];
};

const START_YEAR = 2024;
const START_MONTH = 1;
const MAX_MONTH = 31; // 2024-01 -> 2026-08

const stackGroups: StackGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'Python', unlockedAt: 12, firstProject: 'Python / AI studies' },
      { name: 'TypeScript', unlockedAt: 6, firstProject: 'Web projects' },
      { name: 'JavaScript', unlockedAt: 0, firstProject: 'Early web projects' },
      { name: 'Dart', unlockedAt: 3, firstProject: 'Flutter apps' },
      { name: 'Java', unlockedAt: 13, firstProject: 'Aigram' },
      { name: 'Swift', unlockedAt: 25, firstProject: 'iBridge Studio' },
      { name: 'SQL', unlockedAt: 10, firstProject: 'Full-stack projects' },
      { name: 'HTML', unlockedAt: 0, firstProject: 'Early web projects' },
      { name: 'CSS', unlockedAt: 0, firstProject: 'Early web projects' },
    ],
  },
  {
    label: 'Web / Frontend',
    skills: [
      { name: 'React', unlockedAt: 5, firstProject: 'Web projects' },
      { name: 'Next.js', unlockedAt: 8, firstProject: 'Portfolio / AI apps' },
      { name: 'Vite', unlockedAt: 4, firstProject: 'Frontend projects' },
      { name: 'Tailwind CSS', unlockedAt: 5, firstProject: 'Web projects' },
      { name: 'React Admin', unlockedAt: 19, firstProject: 'Lingo' },
      { name: 'Framer Motion', unlockedAt: 18, firstProject: 'Interactive web UI' },
      { name: 'Three.js', unlockedAt: 20, firstProject: 'Interactive web UI' },
    ],
  },
  {
    label: 'App / Desktop / Extensions',
    skills: [
      { name: 'Flutter', unlockedAt: 3, firstProject: 'Flutter apps' },
      { name: 'Riverpod', unlockedAt: 4, firstProject: 'Flutter apps' },
      { name: 'GoRouter', unlockedAt: 4, firstProject: 'Flutter apps' },
      { name: 'Firebase', unlockedAt: 2, firstProject: 'Mobile / web apps' },
      { name: 'Firestore', unlockedAt: 2, firstProject: 'Mobile / web apps' },
      { name: 'Swift / macOS', unlockedAt: 25, firstProject: 'iBridge Studio' },
      { name: 'ScreenCaptureKit', unlockedAt: 26, firstProject: 'iBridge Studio' },
      { name: 'VS Code Extension API', unlockedAt: 28, firstProject: 'GitAnimals for VS Code' },
      { name: 'Chrome Extensions', unlockedAt: 27, firstProject: 'Algolog' },
    ],
  },
  {
    label: 'Backend / API',
    skills: [
      { name: 'FastAPI', unlockedAt: 16, firstProject: 'AI / data apps' },
      { name: 'Spring Boot', unlockedAt: 13, firstProject: 'Aigram' },
      { name: 'Node.js', unlockedAt: 6, firstProject: 'Web projects' },
      { name: 'SQLAlchemy', unlockedAt: 17, firstProject: 'Python backend projects' },
      { name: 'Drizzle ORM', unlockedAt: 19, firstProject: 'Lingo' },
      { name: 'Pydantic', unlockedAt: 18, firstProject: 'FastAPI projects' },
      { name: 'WebSocket', unlockedAt: 20, firstProject: 'Realtime app experiments' },
    ],
  },
  {
    label: 'AI / ML',
    skills: [
      { name: 'LLM', unlockedAt: 14, firstProject: 'AI projects' },
      { name: 'RAG', unlockedAt: 18, firstProject: 'RAG experiments' },
      { name: 'Agentic Workflows', unlockedAt: 25, firstProject: 'Agentic Ontology Dashboard' },
      { name: 'LangChain', unlockedAt: 18, firstProject: 'LangChain practice' },
      { name: 'LangGraph', unlockedAt: 27, firstProject: 'Agentic systems' },
      { name: 'LlamaIndex', unlockedAt: 24, firstProject: 'Knowledge / graph experiments' },
      { name: 'Embeddings / Vector Search', unlockedAt: 19, firstProject: 'RAG projects' },
      { name: 'Prompt Engineering', unlockedAt: 14, firstProject: 'LLM projects' },
      { name: 'Fine-tuning', unlockedAt: 23, firstProject: 'Modeling studies' },
      { name: 'Reinforcement Learning', unlockedAt: 22, firstProject: 'ML studies' },
      { name: 'Machine Learning', unlockedAt: 15, firstProject: 'Colab modeling studies' },
      { name: 'Google Colab', unlockedAt: 15, firstProject: 'ML studies' },
      { name: 'Jupyter', unlockedAt: 15, firstProject: 'ML / data studies' },
      { name: 'Vertex AI / Gemini', unlockedAt: 20, firstProject: 'AI projects' },
      { name: 'OpenAI API', unlockedAt: 14, firstProject: 'LLM projects' },
      { name: 'Groq', unlockedAt: 21, firstProject: 'AI projects' },
    ],
  },
  {
    label: 'Data / Knowledge',
    skills: [
      { name: 'Data Modeling', unlockedAt: 12, firstProject: 'Backend / data studies' },
      { name: 'Ontology', unlockedAt: 26, firstProject: 'Agentic Ontology Dashboard' },
      { name: 'Knowledge Graph', unlockedAt: 25, firstProject: 'Text-to-Cypher Factory RCA' },
      { name: 'Text-to-Cypher', unlockedAt: 26, firstProject: 'Text-to-Cypher Factory RCA' },
      { name: 'Neo4j', unlockedAt: 25, firstProject: 'Text-to-Cypher Factory RCA' },
      { name: 'PostgreSQL', unlockedAt: 12, firstProject: 'Full-stack projects' },
      { name: 'pgvector', unlockedAt: 19, firstProject: 'RAG projects' },
      { name: 'SQLite', unlockedAt: 8, firstProject: 'App / backend projects' },
      { name: 'Meilisearch', unlockedAt: 13, firstProject: 'Aigram' },
    ],
  },
];

function monthToLabel(offset: number) {
  const absoluteMonth = START_YEAR * 12 + (START_MONTH - 1) + offset;
  const year = Math.floor(absoluteMonth / 12);
  const month = (absoluteMonth % 12) + 1;
  return `${year}.${String(month).padStart(2, '0')}`;
}

export default function StackTimelinePage() {
  const [selectedMonth, setSelectedMonth] = useState(MAX_MONTH);
  const selectedLabel = monthToLabel(selectedMonth);
  const isNow = selectedMonth === MAX_MONTH;

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-[980px]">
        <div className="mb-8 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← AskOosu
          </Link>
          <span>README interaction prototype</span>
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
              <p className="text-sm font-medium text-muted-foreground">STACK HISTORY</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {isNow ? 'NOW · ' : ''}{selectedLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground" />
              visible at selected time
              <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full border border-border bg-muted opacity-30" />
              future skill
            </div>
          </div>

          <label htmlFor="stack-time" className="sr-only">
            Stack history date
          </label>
          <input
            id="stack-time"
            type="range"
            min={0}
            max={MAX_MONTH}
            step={1}
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            className="h-2 w-full cursor-ew-resize accent-foreground"
            style={{ accentColor: 'var(--foreground)' }}
          />
          <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
            <span>2024.01</span>
            <span>2025.01</span>
            <span>2026.01</span>
            <span>NOW</span>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Drag the timeline. Chips stay in the same place; skills that had not appeared yet simply fade out.
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
                  const active = selectedMonth >= skill.unlockedAt;
                  return (
                    <span
                      key={skill.name}
                      title={`${skill.name} · prototype unlock ${monthToLabel(skill.unlockedAt)}${skill.firstProject ? ` · ${skill.firstProject}` : ''}`}
                      className="rounded-md border border-border bg-muted/45 px-2.5 py-1 font-mono text-[13px] transition-opacity duration-300 ease-out sm:text-sm"
                      style={{
                        opacity: active ? 1 : 0.13,
                      }}
                    >
                      {skill.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Prototype chronology only — the interaction is the test. If this UI is kept, unlock dates can be rebuilt from repository history before publishing it as portfolio evidence.
        </p>
      </article>
    </div>
  );
}
