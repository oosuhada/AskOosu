import { ImageResponse } from 'next/og';
import { defaultDescription } from '@/lib/seo';

export const runtime = 'edge';
export const alt =
  'Oosu — AI-connected Fullstack Developer, AskOosu RAG Portfolio, AI Director-style Product Builder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0d1117',
          color: '#f8fafc',
          padding: 72,
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#7dd3fc',
            fontSize: 28,
            letterSpacing: 0,
          }}
        >
          <span>Oosu</span>
          <span>oosu.dev</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontSize: 86,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: 0,
            }}
          >
            <span>AI-connected</span>
            <span>Fullstack Developer</span>
          </div>
          <p
            style={{
              width: 880,
              margin: 0,
              color: '#cbd5e1',
              fontSize: 32,
              lineHeight: 1.35,
            }}
          >
            {defaultDescription}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            color: '#0f172a',
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {['AskOosu', 'RAG Portfolio', 'AI Director-style Product Builder'].map(
            (item) => (
              <span
                key={item}
                style={{
                  borderRadius: 999,
                  background: '#a7f3d0',
                  padding: '13px 22px',
                }}
              >
                {item}
              </span>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
