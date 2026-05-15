import type { Metadata } from 'next';
import { PublicPageShell, TextSection } from '@/components/seo/public-page-shell';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy',
  description:
    'Privacy notes for Oosu.dev and AskOosu, the public conversational portfolio site.',
  path: '/privacy',
  keywords: ['Oosu.dev privacy', 'AskOosu privacy'],
});

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Privacy"
      title="Privacy / 개인정보 안내"
      summary="Oosu.dev is a public portfolio site. AskOosu uses privacy-conscious analytics and sanitized question logs to improve portfolio UX, answer quality, and RAG/FAQ coverage."
    >
      <TextSection title="Public Portfolio Content">
        <p>
          Oosu.dev publishes portfolio information, project summaries, public
          contact links, and AI-readable summaries intended for search engines
          and answer engines.
        </p>
        <p>
          Oosu.dev는 공개 포트폴리오 사이트입니다. 공개 프로젝트 설명, 공개
          연락 링크, AI가 읽기 쉬운 요약 문서를 제공합니다.
        </p>
      </TextSection>
      <TextSection title="Analytics">
        <p>
          The site may use Cloudflare Web Analytics when the production
          analytics token is configured. This is used to understand public page
          traffic, referrers, approximate country-level traffic, and basic web
          performance. Oosu.dev does not use this setup to store raw IP
          addresses or precise geolocation in the application database.
        </p>
        <p>
          운영 환경에서 Cloudflare Web Analytics 토큰이 설정된 경우, 공개
          페이지 방문 흐름, referrer, 국가 단위의 대략적인 유입, 기본 성능
          지표를 확인할 수 있습니다. 애플리케이션 DB에는 원본 IP 주소나
          정밀 위치를 저장하지 않습니다.
        </p>
      </TextSection>
      <TextSection title="AskOosu Question Logs">
        <p>
          AskOosu may store sanitized question events to improve portfolio UX,
          answer quality, RAG/FAQ coverage, fallback detection, latency, and
          feedback loops. Stored fields can include an anonymous session ID,
          language, redacted question text, normalized intent, answer mode,
          confidence, source document IDs, model provider, latency, feedback
          value, page path, referrer without query string, UTM parameters,
          country code, device type, browser, and operating system.
        </p>
        <p>
          AskOosu는 포트폴리오 UX 개선, 답변 품질 개선, RAG/FAQ 커버리지
          보완, fallback 질문 탐지, 응답 속도 확인, 피드백 루프 개선을 위해
          민감정보가 제거된 질문 이벤트를 저장할 수 있습니다. 저장 항목은
          익명 세션 ID, 언어, redaction된 질문, intent, 답변 모드, confidence,
          source document ID, provider, latency, feedback 값, 페이지 경로,
          query string이 제거된 referrer, UTM, 국가 코드, 기기/브라우저/OS
          정도로 제한됩니다.
        </p>
      </TextSection>
      <TextSection title="What Is Not Stored">
        <p>
          Oosu.dev does not intentionally store raw IP addresses, precise
          geolocation, passwords, API keys, bearer tokens, private keys, credit
          card numbers, Korean resident registration number-like values, emails,
          phone numbers, or secrets from user questions.
        </p>
        <p>
          질문 저장 전에는 이메일, 전화번호, API key/token, bearer token,
          private key, 긴 secret 형태의 문자열, 주민등록번호처럼 보이는 패턴,
          카드번호처럼 보이는 패턴을 가능한 범위에서
          <code> [REDACTED_*] </code> 형태로 치환합니다.
        </p>
      </TextSection>
      <TextSection title="Anonymous Session ID">
        <p>
          AskOosu can generate a random anonymous session ID in the browser and
          store it in localStorage as <code>askOosuSessionId</code>. It is used
          to understand repeated portfolio questions within the same browser. It
          is not tied to a login account, name, email address, or exact location.
        </p>
      </TextSection>
      <TextSection title="Retention">
        <p>
          Sanitized AskOosu question logs should be retained for up to 180 days,
          then deleted or aggregated for product-quality review. Manual cleanup
          SQL is documented in the project analytics notes.
        </p>
        <p>
          민감정보가 제거된 질문 로그는 최대 180일 보관 후 삭제하거나 집계
          데이터로 전환하는 것을 원칙으로 합니다.
        </p>
      </TextSection>
      <TextSection title="Deletion Requests">
        <p>
          If you believe you submitted personal or sensitive information through
          AskOosu and want it deleted, contact{' '}
          <a className="underline" href="mailto:oosu.salon@gmail.com">
            oosu.salon@gmail.com
          </a>{' '}
          with the approximate date, question topic, and any safe context that
          helps locate the record. Do not include secrets in the deletion
          request.
        </p>
      </TextSection>
      <TextSection title="Crawler Boundaries">
        <p>
          Public pages are indexable. API, admin, dashboard, private, and
          preview-only paths are excluded from the sitemap and disallowed in the
          robots policy.
        </p>
      </TextSection>
    </PublicPageShell>
  );
}
