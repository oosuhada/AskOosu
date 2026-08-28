import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function BlogCTA() {
  return (
    <aside className="border-border bg-card my-12 rounded-lg border p-6">
      <p className="text-muted-foreground text-sm font-medium">
        AskOosu는 포트폴리오를 채팅으로 탐색할 수 있게 만든 개인 AI 인터페이스입니다.
      </p>
      <Link
        href="/"
        className="text-foreground mt-4 inline-flex items-center gap-2 text-base font-semibold underline underline-offset-4"
      >
        포트폴리오 보기 → oosu.dev
        <ArrowUpRight size={16} />
      </Link>
    </aside>
  );
}
