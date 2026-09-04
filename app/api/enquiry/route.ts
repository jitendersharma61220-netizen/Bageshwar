import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { enquirySchema, type Enquiry } from '@/lib/leads/types';
import { getLeadSink } from '@/lib/leads/sink';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A genuine submission takes a human at least this long to complete. */
const MIN_FILL_MS = 3000;
const MAX_BODY_BYTES = 32 * 1024;

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim();
  return ip || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  const limit = rateLimit(`enquiry:${clientKey(request)}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: 'Submission is too large.' },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return NextResponse.json(
      { ok: false, error: 'Please check the highlighted fields.', fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Bot checks. Both fail silently with a success response, so an automated
  // submitter gets no signal about which check rejected it.
  const trippedHoneypot = Boolean(input.website);
  const submittedTooFast =
    input.renderedAt !== undefined && Date.now() - input.renderedAt < MIN_FILL_MS;

  if (trippedHoneypot || submittedTooFast) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const enquiry: Enquiry = {
    ...input,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  };

  try {
    await getLeadSink().capture(enquiry);
  } catch (error) {
    // Log server-side with the reference, return a generic message to the
    // visitor along with the phone route so a failed submission is not a dead end.
    console.error('[enquiry] capture failed', enquiry.id, error);
    return NextResponse.json(
      {
        ok: false,
        error:
          'We could not record your enquiry just now. Please try again, or contact us directly.',
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, reference: enquiry.id }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 });
}
