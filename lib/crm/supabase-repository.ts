import 'server-only';
import { getServiceClient } from '@/lib/supabase/client';
import type { CrmRepository } from './repository';
import type { AgentRunRecord } from './research';
import {
  BOARD_STAGES,
  PIPELINE_STAGES,
  type AccountPriority,
  type Activity,
  type ActivityKind,
  type Company,
  type Contact,
  type CreateCompanyInput,
  type CreateContactInput,
  type DashboardSummary,
  type PipelineStage,
  type WebsiteLead,
} from './types';

/* -------------------------------------------------------------------------- */
/* Row shapes                                                                  */
/* -------------------------------------------------------------------------- */

interface CompanyRow {
  id: string;
  name: string;
  website: string | null;
  category: Company['category'];
  hq_location: string | null;
  operating_regions: string[] | null;
  stage: PipelineStage;
  priority: Company['priority'];
  account_score: number | null;
  score_rationale: string | null;
  next_action: string | null;
  next_action_due: string | null;
  last_contacted_at: string | null;
  last_response_at: string | null;
  opportunity_value: string | number | null;
  notes: string | null;
  claim_status: Company['claimStatus'];
  evidence_urls: string[] | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactRow {
  id: string;
  company_id: string;
  name: string;
  designation: string | null;
  role_category: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  public_source_url: string | null;
  claim_status: Contact['claimStatus'];
  relevance: string | null;
  source: string | null;
  created_at: string;
}

interface ActivityRow {
  id: string;
  company_id: string;
  kind: ActivityKind;
  summary: string;
  detail: string | null;
  from_stage: PipelineStage | null;
  to_stage: PipelineStage | null;
  occurred_at: string;
}

interface LeadRow {
  id: string;
  kind: WebsiteLead['kind'];
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string | null;
  service_slug: string | null;
  industry_slug: string | null;
  project_name: string | null;
  location: string | null;
  timeline: string | null;
  quantity: string | null;
  message: string;
  source_path: string | null;
  status: WebsiteLead['status'];
  company_id: string | null;
  created_at: string;
  lead_documents?: { count: number }[] | null;
}

/* -------------------------------------------------------------------------- */
/* Mapping                                                                     */
/* -------------------------------------------------------------------------- */

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    website: row.website,
    category: row.category,
    hqLocation: row.hq_location,
    operatingRegions: row.operating_regions ?? [],
    stage: row.stage,
    priority: row.priority,
    accountScore: row.account_score,
    scoreRationale: row.score_rationale,
    nextAction: row.next_action,
    nextActionDue: row.next_action_due,
    lastContactedAt: row.last_contacted_at,
    lastResponseAt: row.last_response_at,
    // numeric arrives as a string from Postgres; parse rather than assume.
    opportunityValue:
      row.opportunity_value === null ? null : Number(row.opportunity_value),
    notes: row.notes,
    claimStatus: row.claim_status,
    evidenceUrls: row.evidence_urls ?? [],
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    designation: row.designation,
    roleCategory: row.role_category,
    email: row.email,
    phone: row.phone,
    linkedinUrl: row.linkedin_url,
    publicSourceUrl: row.public_source_url,
    claimStatus: row.claim_status,
    relevance: row.relevance,
    source: row.source,
    createdAt: row.created_at,
  };
}

function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    companyId: row.company_id,
    kind: row.kind,
    summary: row.summary,
    detail: row.detail,
    fromStage: row.from_stage,
    toStage: row.to_stage,
    occurredAt: row.occurred_at,
  };
}

function toLead(row: LeadRow): WebsiteLead {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    role: row.role,
    serviceSlug: row.service_slug,
    industrySlug: row.industry_slug,
    projectName: row.project_name,
    location: row.location,
    timeline: row.timeline,
    quantity: row.quantity,
    message: row.message,
    sourcePath: row.source_path,
    status: row.status,
    companyId: row.company_id,
    documentCount: row.lead_documents?.[0]?.count ?? 0,
    createdAt: row.created_at,
  };
}

/* -------------------------------------------------------------------------- */

const COMPANY_COLUMNS = '*';

export class SupabaseCrmRepository implements CrmRepository {
  readonly name = 'supabase';

  private client() {
    const client = getServiceClient();
    if (!client) throw new Error('Supabase is not configured');
    return client;
  }

  private async fail<T>(label: string, error: { message: string } | null, value: T): Promise<T> {
    if (error) throw new Error(`${label}: ${error.message}`);
    return value;
  }

  async listCompanies(options?: {
    stage?: PipelineStage;
    search?: string;
  }): Promise<Company[]> {
    let query = this.client()
      .from('companies')
      .select(COMPANY_COLUMNS)
      .order('updated_at', { ascending: false });

    if (options?.stage) query = query.eq('stage', options.stage);
    if (options?.search) query = query.ilike('name', `%${options.search}%`);

    const { data, error } = await query;
    await this.fail('listCompanies', error, null);
    return ((data ?? []) as unknown as CompanyRow[]).map(toCompany);
  }

  async getCompany(id: string): Promise<Company | null> {
    const { data, error } = await this.client()
      .from('companies')
      .select(COMPANY_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    await this.fail('getCompany', error, null);
    return data ? toCompany(data as unknown as CompanyRow) : null;
  }

  async createCompany(input: CreateCompanyInput): Promise<Company> {
    const { data, error } = await this.client()
      .from('companies')
      .insert({
        name: input.name,
        website: input.website ?? null,
        category: input.category,
        hq_location: input.hqLocation ?? null,
        operating_regions: input.operatingRegions ?? [],
        stage: input.stage ?? 'target',
        priority: input.priority ?? null,
        next_action: input.nextAction ?? null,
        next_action_due: input.nextActionDue ?? null,
        opportunity_value: input.opportunityValue ?? null,
        notes: input.notes ?? null,
        source: input.source ?? 'manual',
      } as never)
      .select(COMPANY_COLUMNS)
      .single();
    await this.fail('createCompany', error, null);
    return toCompany(data as unknown as CompanyRow);
  }

  async updateCompany(
    id: string,
    patch: Partial<CreateCompanyInput>,
  ): Promise<Company | null> {
    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.website !== undefined) update.website = patch.website;
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.hqLocation !== undefined) update.hq_location = patch.hqLocation;
    if (patch.priority !== undefined) update.priority = patch.priority;
    if (patch.nextAction !== undefined) update.next_action = patch.nextAction;
    if (patch.nextActionDue !== undefined) update.next_action_due = patch.nextActionDue;
    if (patch.opportunityValue !== undefined) {
      update.opportunity_value = patch.opportunityValue;
    }
    if (patch.notes !== undefined) update.notes = patch.notes;
    if (Object.keys(update).length === 0) return this.getCompany(id);

    const { data, error } = await this.client()
      .from('companies')
      .update(update as never)
      .eq('id', id)
      .select(COMPANY_COLUMNS)
      .maybeSingle();
    await this.fail('updateCompany', error, null);
    return data ? toCompany(data as unknown as CompanyRow) : null;
  }

  async applyScore(
    companyId: string,
    score: { total: number; priority: AccountPriority; rationale: string },
  ): Promise<Company | null> {
    const { data, error } = await this.client()
      .from('companies')
      .update({
        account_score: Math.max(0, Math.min(100, Math.round(score.total))),
        priority: score.priority,
        score_rationale: score.rationale.slice(0, 4000),
      } as never)
      .eq('id', companyId)
      .select(COMPANY_COLUMNS)
      .maybeSingle();
    await this.fail('applyScore', error, null);
    return data ? toCompany(data as unknown as CompanyRow) : null;
  }

  async moveStage(id: string, to: PipelineStage, note?: string): Promise<Company | null> {
    if (!PIPELINE_STAGES.includes(to)) return null;

    const current = await this.getCompany(id);
    if (!current) return null;
    if (current.stage === to) return current;

    const update: Record<string, unknown> = { stage: to };
    const stamp = new Date().toISOString();
    if (to === 'contacted') update.last_contacted_at = stamp;
    if (to === 'replied') update.last_response_at = stamp;

    const { data, error } = await this.client()
      .from('companies')
      .update(update as never)
      .eq('id', id)
      .select(COMPANY_COLUMNS)
      .maybeSingle();
    await this.fail('moveStage', error, null);
    if (!data) return null;

    // The activity trail is append-only, so a failure to record the move is
    // logged rather than thrown: the stage change itself has already happened.
    const { error: activityError } = await this.client()
      .from('account_activity')
      .insert({
        company_id: id,
        kind: 'stage_change',
        summary: `Moved from ${current.stage} to ${to}`,
        detail: note ?? null,
        from_stage: current.stage,
        to_stage: to,
      } as never);
    if (activityError) {
      console.error('[crm] stage change not recorded in activity', id, activityError.message);
    }

    return toCompany(data as unknown as CompanyRow);
  }

  async listContacts(companyId: string): Promise<Contact[]> {
    const { data, error } = await this.client()
      .from('contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });
    await this.fail('listContacts', error, null);
    return ((data ?? []) as unknown as ContactRow[]).map(toContact);
  }

  async createContact(input: CreateContactInput): Promise<Contact> {
    const { data, error } = await this.client()
      .from('contacts')
      .insert({
        company_id: input.companyId,
        name: input.name,
        designation: input.designation ?? null,
        role_category: input.roleCategory ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        linkedin_url: input.linkedinUrl ?? null,
        public_source_url: input.publicSourceUrl ?? null,
        source: input.source ?? 'manual',
      } as never)
      .select('*')
      .single();
    await this.fail('createContact', error, null);
    return toContact(data as unknown as ContactRow);
  }

  async listActivity(companyId: string, limit = 50): Promise<Activity[]> {
    const { data, error } = await this.client()
      .from('account_activity')
      .select('*')
      .eq('company_id', companyId)
      .order('occurred_at', { ascending: false })
      .limit(limit);
    await this.fail('listActivity', error, null);
    return ((data ?? []) as unknown as ActivityRow[]).map(toActivity);
  }

  async addActivity(input: {
    companyId: string;
    kind: ActivityKind;
    summary: string;
    detail?: string | null;
  }): Promise<Activity> {
    const { data, error } = await this.client()
      .from('account_activity')
      .insert({
        company_id: input.companyId,
        kind: input.kind,
        summary: input.summary,
        detail: input.detail ?? null,
      } as never)
      .select('*')
      .single();
    await this.fail('addActivity', error, null);

    if (input.kind === 'outreach_sent' || input.kind === 'reply_received') {
      const column =
        input.kind === 'outreach_sent' ? 'last_contacted_at' : 'last_response_at';
      await this.client()
        .from('companies')
        .update({ [column]: new Date().toISOString() } as never)
        .eq('id', input.companyId);
    }

    return toActivity(data as unknown as ActivityRow);
  }

  /**
   * Read the latest research for an account.
   *
   * Joined from ai_tasks and ai_outputs rather than duplicated onto the
   * company row, so the account view and the audit trail cannot disagree
   * about what the model actually produced.
   */
  /**
   * The latest successful run of an agent against an account.
   *
   * Reads `ai_tasks` joined to `ai_outputs` rather than a per-agent table:
   * the runner already wrote both inside the run, and a second copy would be
   * a second thing to keep in step with the audit trail.
   */
  async latestRun<Output>(
    companyId: string,
    agent: string,
  ): Promise<AgentRunRecord<Output> | null> {
    const { data, error } = await this.client()
      .from('ai_tasks')
      .select('*, ai_outputs(*)')
      .eq('company_id', companyId)
      .eq('agent', agent)
      .eq('status', 'succeeded')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    await this.fail('latestRun', error, null);
    if (!data) return null;

    const task = data as unknown as {
      id: string;
      agent: string;
      prompt_version: string;
      provider: string;
      model: string | null;
      started_at: string;
      ai_outputs?: {
        output: unknown;
        claim_status: AgentRunRecord<Output>['claimStatus'];
        evidence_urls: string[] | null;
        downgrade_reason: string | null;
        downgraded: boolean;
      }[];
    };

    const output = task.ai_outputs?.[0];
    if (!output) return null;

    /*
     * Reconstructed from the stored reason string for display. The
     * authoritative record of what was downgraded or removed is
     * `ai_audit_log`, which is append-only and enforced by a trigger; this is
     * the readable version beside the output it applies to.
     */
    const entries = output.downgraded
      ? (output.downgrade_reason ?? '').split('; ').filter(Boolean)
      : [];
    const piiEntries = entries.filter((entry) => / removed from free text$/.test(entry));
    const downgradeEntries = entries.filter((entry) => !/ removed from free text$/.test(entry));

    return {
      taskId: task.id,
      companyId,
      agent: task.agent,
      promptVersion: task.prompt_version,
      provider: task.provider,
      model: task.model ?? 'unknown',
      output: output.output as Output,
      claimStatus: output.claim_status,
      sources: (output.evidence_urls ?? []).map((url) => ({ url })),
      downgrades: downgradeEntries.map((entry) => {
        const [path = '(unknown)', reason = ''] = entry.split(': ');
        return { path, from: 'fact' as const, to: 'unknown' as const, reason };
      }),
      piiRemovals: piiEntries.map((entry) => {
        const [path = '(unknown)', reason = ''] = entry.split(': ');
        return {
          path,
          kind: reason.startsWith('email') ? ('email' as const) : ('phone' as const),
          // Fingerprints are written to the audit log, not to the output row:
          // the point of removing a fabricated contact detail is that it stops
          // existing, so it is not reproduced here either.
          fingerprint: 'see audit log',
        };
      }),
      ranAt: task.started_at,
    };
  }

  /**
   * No-op: the runner already wrote `ai_tasks` and `ai_outputs` inside the run,
   * before and after the model call respectively. Writing again here would
   * duplicate the record and could disagree with the audit trail.
   */
  async saveRun(): Promise<void> {
    return;
  }

  async listLeads(options?: { status?: WebsiteLead['status'] }): Promise<WebsiteLead[]> {
    let query = this.client()
      .from('website_leads')
      .select('*, lead_documents(count)')
      .order('created_at', { ascending: false });
    if (options?.status) query = query.eq('status', options.status);

    const { data, error } = await query;
    await this.fail('listLeads', error, null);
    return ((data ?? []) as unknown as LeadRow[]).map(toLead);
  }

  async getLead(id: string): Promise<WebsiteLead | null> {
    const { data, error } = await this.client()
      .from('website_leads')
      .select('*, lead_documents(count)')
      .eq('id', id)
      .maybeSingle();
    await this.fail('getLead', error, null);
    return data ? toLead(data as unknown as LeadRow) : null;
  }

  async convertLead(leadId: string): Promise<Company | null> {
    const lead = await this.getLead(leadId);
    if (!lead || lead.companyId) return null;

    const company = await this.createCompany({
      name: lead.company,
      category: 'other',
      hqLocation: lead.location ?? null,
      stage: 'replied',
      nextAction: `Respond to the ${lead.kind} enquiry from ${lead.name}`,
      notes: lead.message,
      source: 'website-lead',
    });

    const { error } = await this.client()
      .from('website_leads')
      .update({ company_id: company.id, status: 'converted' } as never)
      .eq('id', leadId);
    await this.fail('convertLead', error, null);

    await this.addActivity({
      companyId: company.id,
      kind: 'lead_converted',
      summary: `Converted from a website ${lead.kind} enquiry`,
      detail: `${lead.name} (${lead.email}) via ${lead.sourcePath ?? 'the website'}`,
    });

    return company;
  }

  async summary(): Promise<DashboardSummary> {
    const [companies, contacts, leads] = await Promise.all([
      this.listCompanies(),
      this.client().from('contacts').select('id'),
      this.listLeads(),
    ]);

    const byStage = Object.fromEntries(
      PIPELINE_STAGES.map((s) => [s, 0]),
    ) as Record<PipelineStage, number>;
    for (const company of companies) byStage[company.stage] += 1;

    const today = new Date().toISOString().slice(0, 10);
    const withDue = companies.filter((c) => c.nextActionDue !== null);

    return {
      totalAccounts: companies.length,
      byStage,
      priorityA: companies.filter((c) => c.priority === 'a').length,
      decisionMakers: contacts.data?.length ?? 0,
      actionsDue: withDue.filter((c) => c.nextActionDue! <= today).length,
      actionsOverdue: withDue.filter((c) => c.nextActionDue! < today).length,
      openRfqs: companies.filter((c) => c.stage === 'rfq' || c.stage === 'quotation').length,
      won: byStage.won,
      pipelineValue: companies
        .filter((c) => BOARD_STAGES.includes(c.stage))
        .reduce((sum, c) => sum + (c.opportunityValue ?? 0), 0),
      newLeads: leads.filter((l) => l.status === 'new').length,
      unconvertedLeads: leads.filter((l) => l.companyId === null).length,
    };
  }
}
