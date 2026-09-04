import { z } from 'zod';
import { services } from '@/content/services';
import { industries } from '@/content/industries';
import type { StoredDocument } from './documents';

const serviceSlugs = services.map((s) => s.slug);
const industrySlugs = industries.map((i) => i.slug);

export const ENQUIRY_KINDS = ['general', 'quote', 'boq'] as const;
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];

/**
 * The enquiry payload.
 *
 * Validated on the server before anything is done with it. Every field is
 * length-bounded so an oversized submission is rejected rather than forwarded.
 */
export const enquirySchema = z.object({
  kind: z.enum(ENQUIRY_KINDS),
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  company: z.string().trim().min(2, 'Please enter your company name.').max(160),
  email: z.email('Please enter a valid work email address.').max(200),
  phone: z
    .string()
    .trim()
    .min(6, 'Please enter a contact number.')
    .max(30)
    .regex(/^[0-9+\-()\s]+$/, 'Please enter a valid contact number.'),
  role: z.string().trim().max(120).optional().or(z.literal('')),
  serviceSlug: z
    .string()
    .refine((v) => v === '' || serviceSlugs.includes(v as never), 'Unknown service.')
    .optional()
    .or(z.literal('')),
  industrySlug: z
    .string()
    .refine((v) => v === '' || industrySlugs.includes(v as never), 'Unknown industry.')
    .optional()
    .or(z.literal('')),
  projectName: z.string().trim().max(200).optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  timeline: z.string().trim().max(120).optional().or(z.literal('')),
  quantity: z.string().trim().max(200).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Please describe the requirement in a little more detail.')
    .max(4000),
  /** Source page path, for attribution in the CRM from Iteration 4 onward. */
  sourcePath: z.string().max(300).optional().or(z.literal('')),
  /**
   * Honeypot. A real user never fills this; bots usually do.
   *
   * Deliberately permissive: rejecting a filled honeypot here would return a
   * field error naming the trap, which tells a bot exactly which input to leave
   * alone next time. The route inspects this value and fails silently instead.
   */
  website: z.string().max(500).optional(),
  /** Client-side render timestamp, used to reject instant submissions. */
  renderedAt: z.coerce.number().int().nonnegative().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/**
 * A validated enquiry, enriched server-side. Never constructed from raw input.
 *
 * `documents` are already stored by the time this exists: the route uploads to
 * the document store first and passes the resulting metadata here, so a sink
 * never handles file bytes.
 */
export interface Enquiry extends EnquiryInput {
  readonly receivedAt: string;
  readonly id: string;
  readonly documents: readonly StoredDocument[];
  /** Request headers captured for attribution. Untrusted; length-bounded. */
  readonly referrer?: string;
  readonly userAgent?: string;
}
