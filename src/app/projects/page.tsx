import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { LocalizedText } from '@/components/localized-content';
import {
  PublicPageShell,
  TextSection,
} from '@/components/seo/public-page-shell';
import { oosuProjects } from '@/lib/oosu-profile';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Oosu Projects',
  description:
    'Selected Oosu projects including AskOosu, Aigram, Sticks & Stones, Portfoli-Oh, and learning/product experiments.',
  path: '/projects',
  keywords: ['Oosu projects', 'AskOosu project', 'RAG portfolio project'],
});

const projectDescriptionsKo: Record<string, string> = {
  'AskOosu 2026':
    'Mac mini 홈 서버에 배포한 대화형 AI 포트폴리오입니다. Next.js, FAQ 라우팅, Notion RAG, PostgreSQL 기반 근거를 연결해 프로젝트와 기술에 답합니다.',
  Aigram:
    '피드, 팔로우, 댓글, 백엔드 API 흐름을 구현한 풀스택 SNS 프로젝트입니다.',
  'Sticks & Stones Homepage':
    '기존 WordPress 사이트를 TypeScript와 Vite 기반으로 이전·리뉴얼한 실제 기업 홈페이지 프로젝트입니다.',
  'Portfoli-Oh! 2025':
    '인터랙션, 모션, UI/UX 실험을 통해 프로젝트와 이야기를 보여주는 2025년 프론트엔드 포트폴리오입니다.',
  Pylingo:
    '기초 문법부터 응용 문제까지 브라우저에서 실습하는 인터랙티브 Python 학습 웹 앱입니다.',
  Javalingo:
    '객체지향 개념과 코딩 테스트 학습을 단계별로 구성한 Java 학습 웹 앱입니다.',
};

export default function ProjectsPage() {
  return (
    <PublicPageShell
      eyebrow={{ ko: '프로젝트', en: 'Projects' }}
      title={{
        ko: '주요 제품·개발 프로젝트',
        en: 'Selected Product and Engineering Projects',
      }}
      summary={{
        ko: '장우수의 대표 프로젝트를 검증 가능한 설명과 공개 링크 중심으로 정리했습니다.',
        en: 'A concise public index of Oosu’s representative projects, with grounded descriptions and links where public links are available.',
      }}
    >
      <TextSection title={{ ko: '대표 프로젝트', en: 'Featured Projects' }}>
        <div className="grid gap-4">
          {oosuProjects.slice(0, 6).map((project) => (
            <article
              key={project.title}
              className="border-border/70 bg-card rounded-lg border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {project.category} · {project.date}
                  </p>
                </div>
                {project.title === 'AskOosu 2026' ? (
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold underline"
                    href="/projects/askoosu"
                  >
                    <LocalizedText ko="상세 보기" en="Details" />
                    <ArrowUpRight size={14} />
                  </Link>
                ) : project.links[0] ? (
                  <a
                    className="inline-flex items-center gap-1 text-sm font-semibold underline"
                    href={project.links[0].url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LocalizedText ko="방문하기" en="Visit" />
                    <ArrowUpRight size={14} />
                  </a>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-4 leading-7">
                <LocalizedText
                  ko={
                    projectDescriptionsKo[project.title] ?? project.description
                  }
                  en={project.description}
                />
              </p>
            </article>
          ))}
        </div>
      </TextSection>
    </PublicPageShell>
  );
}
