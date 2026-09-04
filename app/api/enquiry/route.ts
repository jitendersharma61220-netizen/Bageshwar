import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { enquirySchema, type Enquiry } from '@/lib/leads/types';
import { getLeadPipeline } from '@/lib/leads/sink';
import { getDocumentStore, type StoredDocument } from '@/lib/leads/documents';
import {
  MAX_FILES_PER_ENQUIRY,
  MAX_TOTAL_BYTES,
  validateUpload,
} from '@/lib/leads/upload-validation';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A genuine submission takes a human at least this long to complete. */
const MIN_FILL_MS = 3000;
/** Cap on a JSON (no-attachment) submission. */
const MAX_JSON_BYTES = 32 * 1024;
/** Bytes of each file inspected for a format signature. */
const SIGNATURE_BYTES = 512;

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim();
  return ip || request.headers.get('x-real-ip') || 'unknown';
}

function bounded(value: string | null, max: number): string | undefined {
  if (!value) return undefined;
  return value.slice(0, max);
}

interface ParsedBody {
  fields: Record<string, unknown>;
  files: File[];
}

/**
 * Read the request body as either JSON or multipart.
 *
 * The contact and quote forms post JSON; the BOQ form posts multipart when the
 * visitor attached documents. Both land in the same shape.
 */
async function parseBody(request: Request): Promise<ParsedBody | { error: string; status: number }> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return { error: 'Invalid request.', status: 400 };
    }

    const fields: Record<string, unknown> = {};
    const files: File[] = [];

    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') {
        fields[key] = value;
      } else if (key === 'documents') {
        files.push(value);
      }
      // Any other file field is ignored rather than trusted.
    }

    if (files.length > MAX_FILES_PER_ENQUIRY) {
      return {
        error: `Please attach no more than ${MAX_FILES_PER_ENQUIRY} files.`,
        status: 400,
      };
    }

    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      return {
        error: `Attachments total more than ${Math.round(MAX_TOTAL_BYTES / 1024 / 1024)} MB. Please send fewer or smaller files.`,
        status: 413,
      };
    }

    return { fields, files };
  }

  const raw = await request.text();
  if (raw.length > MAX_JSON_BYTES) {
    return { error: 'Submission is too large.', status: 413 };
  }
  try {
    return { fields: JSON.parse(raw) as Record<string, unknown>, files: [] };
  } catch {
    return { error: 'Invalid request.', status: 400 };
  }
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

  const parsed = await parseBody(request);
  if ('error' in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status });
  }

  const result = enquirySchema.safeParse(parsed.fields);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
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

  const input = result.data;

  // Bot checks. Both fail silently with a success response, so an automated
  // submitter gets no signal about which check rejected it. Checked before any
  // file is read, so a bot cannot make us do upload work.
  const trippedHoneypot = Boolean(input.website);
  const submittedTooFast =
    input.renderedAt !== undefined && Date.now() - input.renderedAt < MIN_FILL_MS;

  if (trippedHoneypot || submittedTooFast) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  /* ---------------------------------------------------------------------- */
  /* Documents                                                               */
  /*                                                                         */
  /* Every file is validated against its leading bytes before it is stored.  */
  /* A file that fails validation rejects the whole submission rather than    */
  /* being dropped silently: the visitor needs to know their BOQ did not      */
  /* arrive.                                                                  */
  /* ---------------------------------------------------------------------- */

  const documents: StoredDocument[] = [];

  if (parsed.files.length > 0) {
    const store = getDocumentStore();

    for (const file of parsed.files) {
      const bytes = new Uint8Array(await file.arrayBuffer());

      const verdict = validateUpload({
        filename: file.name,
        contentType: file.type,
        byteSize: bytes.byteLength,
        head: bytes.subarray(0, SIGNATURE_BYTES),
      });

      if (!verdict.ok) {
        return NextResponse.json(
          { ok: false, error: verdict.detail, fieldErrors: { documents: verdict.detail } },
          { status: 400 },
        );
      }

      try {
        documents.push(
          await store.put({
            bytes,
            originalName: verdict.safeName,
            contentType: file.type || 'application/octet-stream',
            extension: verdict.extension,
          }),
        );
      } catch (error) {
        console.error('[enquiry] document store failed', error);
        return NextResponse.json(
          {
            ok: false,
            error:
              'We could not store your attachment. Please try again, or send the document by email.',
          },
          { status: 502 },
        );
      }
    }
  }

  const enquiry: Enquiry = {
    ...input,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    documents,
    referrer: bounded(request.headers.get('referer'), 500),
    userAgent: bounded(request.headers.get('user-agent'), 500),
  };

  try {
    const capture = await getLeadPipeline().capture(enquiry);

    // A failed notification is not a failed enquiry: the lead is recorded, so
    // the visitor gets a success and the failure is logged for follow-up.
    for (const failure of capture.notifyErrors) {
      console.error('[enquiry] notification failed', enquiry.id, failure.sink, failure.error);
    }

    return NextResponse.json({ ok: true, reference: enquiry.id }, { status: 200 });
  } catch (error) {
    // The durable sink failed, so the enquiry was not recorded. Say so.
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
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed.' }, { status: 405 });
}
