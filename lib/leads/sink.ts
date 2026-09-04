import type { Enquiry } from './types';

/**
 * Where a validated enquiry goes.
 *
 * Iteration 1 ships a console sink for development and an email sink for
 * production. Iteration 3 adds a Supabase sink that writes to `website_leads`
 * and stores uploaded documents; because it implements this same interface,
 * no page or form component changes when it lands.
 */
export interface LeadSink {
  readonly name: string;
  capture(enquiry: Enquiry): Promise<void>;
}

class ConsoleSink implements LeadSink {
  readonly name = 'console';

  async capture(enquiry: Enquiry): Promise<void> {
    console.info('[enquiry] received', {
      id: enquiry.id,
      kind: enquiry.kind,
      company: enquiry.company,
      email: enquiry.email,
      serviceSlug: enquiry.serviceSlug || undefined,
      sourcePath: enquiry.sourcePath || undefined,
      receivedAt: enquiry.receivedAt,
    });
  }
}

class EmailSink implements LeadSink {
  readonly name = 'email';

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
  return `${label} — ${enquiry.company}`;
}

/**
 * Plain text rather than HTML: the recipient is an internal inbox, and plain
 * text removes any question of markup injection from submitted content.
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
  return lines.join('\n');
}

let cached: LeadSink | undefined;

/**
 * Resolve the configured sink. Falls back to the console sink when email is
 * selected but not fully configured, so a misconfigured environment logs the
 * enquiry rather than losing it.
 */
export function getLeadSink(): LeadSink {
  if (cached) return cached;

  const configured = process.env.LEAD_SINK ?? 'console';

  if (configured === 'email') {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.LEAD_EMAIL_FROM;
    const to = (process.env.LEAD_EMAIL_TO ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (apiKey && from && to.length > 0) {
      cached = new EmailSink(apiKey, from, to);
      return cached;
    }

    console.warn(
      '[enquiry] LEAD_SINK=email but RESEND_API_KEY, LEAD_EMAIL_FROM or LEAD_EMAIL_TO is unset. Falling back to the console sink.',
    );
  }

  cached = new ConsoleSink();
  return cached;
}
