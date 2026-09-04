import type { Enquiry } from './types';
import { getServiceClient } from '@/lib/supabase/client';

/**
 * Where a validated enquiry goes.
 *
 * Two kinds of sink, and the distinction matters:
 *
 *  - A **durable** sink is the system of record. If it fails, the enquiry is
 *    lost, so the request fails and the visitor is told to try again.
 *  - A **notifier** tells someone the enquiry arrived. If it fails, the
 *    enquiry is still safely captured, so the request succeeds and the failure
 *    is recorded against the row instead.
 *
 * Iteration 1 had only email, which meant an email outage returned an error to
 * a visitor whose enquiry we had in fact received. With a database behind it,
 * that is no longer an acceptable trade.
 */
export interface LeadSink {
  readonly name: string;
  readonly durable: boolean;
  capture(enquiry: Enquiry): Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Console — local development                                                 */
/* -------------------------------------------------------------------------- */

class ConsoleSink implements LeadSink {
  readonly name = 'console';
  readonly durable = true;

  async capture(enquiry: Enquiry): Promise<void> {
    console.info('[enquiry] received', {
      id: enquiry.id,
      kind: enquiry.kind,
      company: enquiry.company,
      email: enquiry.email,
      serviceSlug: enquiry.serviceSlug || undefined,
      sourcePath: enquiry.sourcePath || undefined,
      documents: enquiry.documents.map((d) => ({
        name: d.originalName,
        bytes: d.byteSize,
        key: d.storageKey,
      })),
      receivedAt: enquiry.receivedAt,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Supabase — the system of record                                             */
/* -------------------------------------------------------------------------- */

class SupabaseSink implements LeadSink {
  readonly name = 'supabase';
  readonly durable = true;

  async capture(enquiry: Enquiry): Promise<void> {
    const client = getServiceClient();
    if (!client) throw new Error('Supabase is not configured');

    const { error: leadError } = await client.from('website_leads').insert({
      id: enquiry.id,
      kind: enquiry.kind,
      name: enquiry.name,
      company: enquiry.company,
      email: enquiry.email,
      phone: enquiry.phone,
      role: enquiry.role || null,
      service_slug: enquiry.serviceSlug || null,
      industry_slug: enquiry.industrySlug || null,
      project_name: enquiry.projectName || null,
      location: enquiry.location || null,
      timeline: enquiry.timeline || null,
      quantity: enquiry.quantity || null,
      message: enquiry.message,
      source_path: enquiry.sourcePath || null,
      referrer: enquiry.referrer || null,
      user_agent: enquiry.userAgent || null,
    });

    if (leadError) {
      throw new Error(`lead insert failed: ${leadError.message}`);
    }

    if (enquiry.documents.length === 0) return;

    const { error: documentError } = await client.from('lead_documents').insert(
      enquiry.documents.map((doc) => ({
        lead_id: enquiry.id,
        storage_key: doc.storageKey,
        original_name: doc.originalName,
        content_type: doc.contentType,
        byte_size: doc.byteSize,
        checksum: doc.checksum,
      })),
    );

    if (documentError) {
      // The lead is saved and the files are in the bucket; only the metadata
      // link failed. Surface it rather than silently orphaning the documents.
      throw new Error(`document metadata insert failed: ${documentError.message}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Email — notification                                                        */
/* -------------------------------------------------------------------------- */

class EmailSink implements LeadSink {
  readonly name = 'email';
  readonly durable = false;

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly to: string[],
  ) {}

  async capture(enquiry: Enquiry): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: this.to,
        reply_to: enquiry.email,
        subject: subjectFor(enquiry),
        text: renderPlainText(enquiry),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Email delivery failed (${response.status}): ${detail.slice(0, 300)}`);
    }
  }
}

function subjectFor(enquiry: Enquiry): string {
  const label =
    enquiry.kind === 'quote'
      ? 'Quote request'
      : enquiry.kind === 'boq'
        ? 'BOQ / tender submission'
        : 'Project enquiry';
  const attachments =
    enquiry.documents.length > 0 ? ` (${enquiry.documents.length} file(s))` : '';
  return `${label} - ${enquiry.company}${attachments}`;
}

/**
 * Plain text rather than HTML: the recipient is an internal inbox, and plain
 * text removes any question of markup injection from submitted content.
 *
 * Documents are listed but not attached. They live in a private bucket and are
 * read through a signed URL from the CRM, so a forwarded email never carries a
 * client's commercial documents out of the business.
 */
function renderPlainText(enquiry: Enquiry): string {
  const lines: string[] = [
    `Type:        ${enquiry.kind}`,
    `Received:    ${enquiry.receivedAt}`,
    `Reference:   ${enquiry.id}`,
    '',
    `Name:        ${enquiry.name}`,
    `Company:     ${enquiry.company}`,
    `Role:        ${enquiry.role || '-'}`,
    `Email:       ${enquiry.email}`,
    `Phone:       ${enquiry.phone}`,
    '',
    `Service:     ${enquiry.serviceSlug || '-'}`,
    `Industry:    ${enquiry.industrySlug || '-'}`,
    `Project:     ${enquiry.projectName || '-'}`,
    `Location:    ${enquiry.location || '-'}`,
    `Timeline:    ${enquiry.timeline || '-'}`,
    `Quantity:    ${enquiry.quantity || '-'}`,
    `Source page: ${enquiry.sourcePath || '-'}`,
    '',
    'Message:',
    enquiry.message,
  ];

  if (enquiry.documents.length > 0) {
    lines.push(
      '',
      `Documents (${enquiry.documents.length}) - stored privately, not attached:`,
      ...enquiry.documents.map(
        (doc) => `  - ${doc.originalName} (${formatBytes(doc.byteSize)})`,
      ),
    );
  }

  return lines.join('\n');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

export interface CaptureResult {
  /** The sink that took responsibility for the enquiry. */
  readonly durableSink: string;
  /** Notifiers that failed. The enquiry is still captured. */
  readonly notifyErrors: readonly { sink: string; error: string }[];
}

/**
 * Run the durable sink, then the notifiers.
 *
 * A durable failure throws: the enquiry was not recorded and the visitor must
 * be told. A notifier failure is collected and returned, so the caller can log
 * it against the row without failing the request.
 */
export class LeadPipeline {
  constructor(
    private readonly durable: LeadSink,
    private readonly notifiers: readonly LeadSink[],
  ) {}

  get description(): string {
    const names = [this.durable.name, ...this.notifiers.map((n) => n.name)];
    return names.join(' + ');
  }

  async capture(enquiry: Enquiry): Promise<CaptureResult> {
    await this.durable.capture(enquiry);

    const notifyErrors: { sink: string; error: string }[] = [];
    for (const notifier of this.notifiers) {
      try {
        await notifier.capture(enquiry);
      } catch (error) {
        notifyErrors.push({
          sink: notifier.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { durableSink: this.durable.name, notifyErrors };
  }
}

let cached: LeadPipeline | undefined;

/**
 * Build the pipeline from the environment.
 *
 * `LEAD_SINK` selects the system of record. Email notification is added
 * whenever it is fully configured, independently of that choice, so switching
 * to Supabase does not silently stop the notifications.
 */
export function getLeadPipeline(): LeadPipeline {
  if (cached) return cached;

  const configured = process.env.LEAD_SINK ?? 'console';
  let durable: LeadSink;

  if (configured === 'supabase') {
    if (getServiceClient()) {
      durable = new SupabaseSink();
    } else {
      console.warn(
        '[enquiry] LEAD_SINK=supabase but NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset. Falling back to the console sink.',
      );
      durable = new ConsoleSink();
    }
  } else {
    durable = new ConsoleSink();
  }

  const notifiers: LeadSink[] = [];
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  const to = (process.env.LEAD_EMAIL_TO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (apiKey && from && to.length > 0) {
    notifiers.push(new EmailSink(apiKey, from, to));
  } else if (configured === 'email') {
    // Iteration 1 used LEAD_SINK=email. Keep the warning meaningful for anyone
    // still carrying that value in their environment.
    console.warn(
      '[enquiry] Email notification is not configured: set RESEND_API_KEY, LEAD_EMAIL_FROM and LEAD_EMAIL_TO.',
    );
  }

  cached = new LeadPipeline(durable, notifiers);
  return cached;
}

/** Reset the memoised pipeline. Tests only. */
export function resetLeadPipelineForTesting(): void {
  cached = undefined;
}
