import { z } from 'zod';
import { createVisitorEvent } from '@/lib/analytics/visitor-events';
import { logWarn, toLogError } from '@/lib/observability/logger';

export const runtime = 'nodejs';

const pageViewSchema = z.object({
  sessionId: z.string().max(128).optional().nullable(),
  path: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  utmSource: z.string().max(500).optional().nullable(),
  utmMedium: z.string().max(500).optional().nullable(),
  utmCampaign: z.string().max(500).optional().nullable(),
  screenWidth: z.number().finite().nonnegative().optional().nullable(),
  screenHeight: z.number().finite().nonnegative().optional().nullable(),
  viewportWidth: z.number().finite().nonnegative().optional().nullable(),
  viewportHeight: z.number().finite().nonnegative().optional().nullable(),
  timezone: z.string().max(80).optional().nullable(),
  language: z.string().max(80).optional().nullable(),
});

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = pageViewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid page view payload' }, { status: 400 });
  }

  try {
    await createVisitorEvent(req, parsed.data);
  } catch (error) {
    logWarn('analytics.page_view_write_failed', {
      route: 'api/analytics/page-view',
      error: toLogError(error),
    });
  }

  return Response.json({ ok: true });
}
