import { NextResponse } from 'next/server';

import { recordVisitorEvent, type VisitorEventType } from '@/lib/analytics/visitor-events';

const EVENT_TYPES = new Set<VisitorEventType>(['page_view', 'click', 'engagement']);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!EVENT_TYPES.has(body.eventType)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await recordVisitorEvent(req, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[analytics:event]', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
