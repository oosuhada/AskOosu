import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createAnswerFeedback,
  hasPostgresDatabaseUrl,
} from '@/lib/feedback/database';
import { updateLatestAskEventFeedback } from '@/lib/analytics/ask-events';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit';

export const maxDuration = 10;

const feedbackRequestSchema = z.object({
  sessionId: z.string().max(128).optional(),
  messageId: z.string().min(1).max(128),
  question: z.string().max(1000).optional(),
  answer: z.string().max(4000).optional(),
  rating: z.enum(['up', 'down']),
  reason: z.string().max(1000).optional().nullable(),
  matchedEntityIds: z.array(z.string().max(160)).max(50).optional(),
  sourceChunkIds: z.array(z.string().max(160)).max(50).optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
});

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit(req, {
    scope: 'api:feedback',
    windowMs: 60 * 1000,
    max: 30,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Too many feedback requests. Please wait and try again.',
        retryAfter: rateLimit.retryAfter,
      },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  if (!hasPostgresDatabaseUrl()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'DATABASE_URL or POSTGRES_URL is required for feedback.',
      },
      { status: 503 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const parsedBody = feedbackRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid feedback payload.',
        issues: parsedBody.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const feedback = await createAnswerFeedback(parsedBody.data);
    void updateLatestAskEventFeedback({
      sessionId: parsedBody.data.sessionId,
      question: parsedBody.data.question,
      feedback: parsedBody.data.rating === 'up' ? 'helpful' : 'not_helpful',
    }).catch((error) => {
      console.warn('Unable to update ask event feedback:', error);
    });

    return NextResponse.json({
      ok: true,
      feedbackId: feedback.id,
      createdAt: feedback.createdAt,
    });
  } catch (error) {
    console.error('Failed to store answer feedback:', error);

    return NextResponse.json(
      { ok: false, error: 'Failed to store answer feedback.' },
      { status: 500 }
    );
  }
}
