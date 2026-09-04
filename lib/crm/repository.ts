import 'server-only';
import type { ResearchRecord } from './research';
import type {
  Activity,
  ActivityKind,
  Company,
  Contact,
  CreateCompanyInput,
  CreateContactInput,
  DashboardSummary,
  PipelineStage,
  WebsiteLead,
} from './types';

/**
 * The CRM data layer.
 *
 * Two implementations, following the same pattern as LeadSink and
 * DocumentStore: Supabase in production, and an in-memory fixture for local
 * development so the CRM can be run, demonstrated and tested without a
 * Supabase project.
 *
 * The in-memory implementation is a development fixture, not a second source
 * of truth. It does not re-implement the database's check constraints — those
 * are proven separately by `pnpm db:validate`, which runs the real migrations
 * against a real Postgres.
 */
export interface CrmRepository {
  readonly name: string;

  listCompanies(options?: {
    stage?: PipelineStage;
    search?: string;
  }): Promise<Company[]>;
  getCompany(id: string): Promise<Company | null>;
  createCompany(input: CreateCompanyInput): Promise<Company>;
  updateCompany(id: string, patch: Partial<CreateCompanyInput>): Promise<Company | null>;
  moveStage(id: string, to: PipelineStage, note?: string): Promise<Company | null>;

  listContacts(companyId: string): Promise<Contact[]>;
  createContact(input: CreateContactInput): Promise<Contact>;

  listActivity(companyId: string, limit?: number): Promise<Activity[]>;
  addActivity(input: {
    companyId: string;
    kind: ActivityKind;
    summary: string;
    detail?: string | null;
  }): Promise<Activity>;

  /** The most recent research output for an account, if any. */
  latestResearch(companyId: string): Promise<ResearchRecord | null>;
  saveResearch(record: ResearchRecord): Promise<void>;

  listLeads(options?: { status?: WebsiteLead['status'] }): Promise<WebsiteLead[]>;
  getLead(id: string): Promise<WebsiteLead | null>;
  /** Create an account from a lead and link the two. */
  convertLead(leadId: string): Promise<Company | null>;

  summary(): Promise<DashboardSummary>;
}

let cached: CrmRepository | null = null;

/**
 * Resolve the repository.
 *
 * Supabase when configured; otherwise the in-memory fixture. In production
 * with no Supabase configured this returns null rather than falling back,
 * because a CRM backed by memory that resets on every deploy would be worse
 * than an honest error.
 */
export async function getCrmRepository(): Promise<CrmRepository | null> {
  if (cached) return cached;

  const { getServiceClient } = await import('@/lib/supabase/client');
  if (getServiceClient()) {
    const { SupabaseCrmRepository } = await import('./supabase-repository');
    cached = new SupabaseCrmRepository();
    return cached;
  }

  if (process.env.NODE_ENV === 'production') return null;

  const { InMemoryCrmRepository } = await import('./memory-repository');
  cached = new InMemoryCrmRepository();
  return cached;
}

/** Reset the memoised repository. Tests only. */
export function resetCrmRepositoryForTesting(): void {
  cached = null;
}
