export const dynamic = 'force-static';

export function GET() {
  return new Response(null, {
    status: 308,
    headers: {
      Location: '/favicon.svg',
      'Cache-Control': 'public, max-age=14400, s-maxage=86400, must-revalidate',
    },
  });
}
