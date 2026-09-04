/**
 * CRM domain types.
 *
 * These mirror supabase/migrations/0003_crm.sql. The pipeline is the one
 * described in docs/06-crm-pipeline.md.
 */

export const PIPELINE_STAGES = [
  'target',
  'researched',
  'decision_maker_found',
  'personalized',
  'contacted',
  'replied',
  'meeting',
  'rfq',
  'quotation',
  'negotiation',
  'won',
  'lost',
  'nurture',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Stages shown as columns on the board, in order. */
export const BOARD_STAGES: readonly PipelineStage[] = [
  'target',
  'researched',
  'decision_maker_found',
  'personalized',
  'contacted',
  'replied',
  'meeting',
  'rfq',
  'quotation',
  'negotiation',
];

/** Terminal and holding stages, shown separately from the board. */
export const CLOSED_STAGES: readonly PipelineStage[] = ['won', 'lost', 'nurture'];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  target: 'Target',
  researched: 'Researched',
  decision_maker_found: 'Decision maker',
  personalized: 'Personalised',
  contacted: 'Contacted',
  replied: 'Replied',
  meeting: 'Meeting',
  rfq: 'RFQ',
  quotation: 'Quotation',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  nurture: 'Nurture',
};

export type AccountPriority = 'a' | 'b' | 'c';

export const PRIORITY_LABELS: Record<AccountPriority, string> = {
  a: 'A — act now',
  b: 'B — nurture',
  c: 'C — low',
};

export const COMPANY_CATEGORIES = [
  'epc',
  'highway_contractor',
  'developer',
  'concessionaire',
  'toll_operator',
  'airport',
  'industrial',
  'logistics',
  'smart_city',
  'other',
] as const;

export type CompanyCategory = (typeof COMPANY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CompanyCategory, string> = {
  epc: 'EPC contractor',
  highway_contractor: 'Highway contractor',
  developer: 'Infrastructure developer',
  concessionaire: 'Concessionaire',
  toll_operator: 'Toll road operator',
  airport: 'Airport / aviation',
  industrial: 'Industrial developer',
  logistics: 'Logistics / warehousing',
  smart_city: 'Smart city / urban',
  other: 'Other',
};

/**
 * How a stored claim was arrived at.
 *
 * `fact` requires evidence when the source is anything other than manual
 * entry — enforced by a check constraint, not by convention.
 */
export type ClaimStatus = 'fact' | 'inference' | 'recommendation' | 'unknown';

export interface Company {
  id: string;
  name: string;
  website: string | null;
  category: CompanyCategory;
  hqLocation: string | null;
  operatingRegions: string[];
  stage: PipelineStage;
  priority: AccountPriority | null;
  accountScore: number | null;
  scoreRationale: string | null;
  nextAction: string | null;
  nextActionDue: string | null;
  lastContactedAt: string | null;
  lastResponseAt: string | null;
  opportunityValue: number | null;
  notes: string | null;
  claimStatus: ClaimStatus;
  evidenceUrls: string[];
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  designation: string | null;
  roleCategory: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  publicSourceUrl: string | null;
  claimStatus: ClaimStatus;
  relevance: string | null;
  source: string | null;
  createdAt: string;
}

export type ActivityKind =
  | 'note'
  | 'stage_change'
  | 'outreach_sent'
  | 'reply_received'
  | 'meeting'
  | 'rfq_received'
  | 'quote_sent'
  | 'lead_converted';

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  note: 'Note',
  stage_change: 'Stage change',
  outreach_sent: 'Outreach sent',
  reply_received: 'Reply received',
  meeting: 'Meeting',
  rfq_received: 'RFQ received',
  quote_sent: 'Quote sent',
  lead_converted: 'Lead converted',
};

export interface Activity {
  id: string;
  companyId: string;
  kind: ActivityKind;
  summary: string;
  detail: string | null;
  fromStage: PipelineStage | null;
  toStage: PipelineStage | null;
  occurredAt: string;
}

export interface WebsiteLead {
  id: string;
  kind: 'general' | 'quote' | 'boq';
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string | null;
  serviceSlug: string | null;
  industrySlug: string | null;
  projectName: string | null;
  location: string | null;
  timeline: string | null;
  quantity: string | null;
  message: string;
  sourcePath: string | null;
  status: 'new' | 'reviewing' | 'qualified' | 'converted' | 'archived' | 'spam';
  companyId: string | null;
  documentCount: number;
  createdAt: string;
}

export interface CreateCompanyInput {
  name: string;
  website?: string | null;
  category: CompanyCategory;
  hqLocation?: string | null;
  operatingRegions?: string[];
  stage?: PipelineStage;
  priority?: AccountPriority | null;
  opportunityValue?: number | null;
  nextAction?: string | null;
  nextActionDue?: string | null;
  notes?: string | null;
  /** Who or what created this row. 'manual' means a person typed it in. */
  source?: string;
}

export interface CreateContactInput {
  companyId: string;
  name: string;
  designation?: string | null;
  roleCategory?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  publicSourceUrl?: string | null;
  source?: string;
}

/** Counts for the Founder Command Center. */
export interface DashboardSummary {
  totalAccounts: number;
  byStage: Record<PipelineStage, number>;
  priorityA: number;
  decisionMakers: number;
  actionsDue: number;
  actionsOverdue: number;
  openRfqs: number;
  won: number;
  pipelineValue: number;
  newLeads: number;
  unconvertedLeads: number;
}

/** Days between a timestamp and now, or null when there is no timestamp. */
export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}
