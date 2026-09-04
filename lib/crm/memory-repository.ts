import 'server-only';
import { randomUUID } from 'node:crypto';
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

/**
 * In-memory CRM for local development.
 *
 * This is a development fixture so the admin UI can be run and tested without
 * a Supabase project. It is NOT a second source of truth:
 *
 *  - It does not re-implement the database check constraints. Those are proven
 *    by `pnpm db:validate` against a real Postgres.
 *  - State lives in the server process and is lost on restart.
 *
 * `getCrmRepository()` refuses to select it in production for exactly that
 * reason.
 *
 * The seed data is obviously fictional and clearly labelled. It exists so the
 * board has something in it while the real pipeline is empty, and it never
 * reaches the public site.
 */

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

function seedCompany(partial: Partial<Company> & Pick<Company, 'name'>): Company {
  return {
    id: randomUUID(),
    website: null,
    category: 'epc',
    hqLocation: null,
    operatingRegions: [],
    stage: 'target',
    priority: null,
    accountScore: null,
    scoreRationale: null,
    nextAction: null,
    nextActionDue: null,
    lastContactedAt: null,
    lastResponseAt: null,
    opportunityValue: null,
    notes: null,
    claimStatus: 'fact',
    evidenceUrls: [],
    source: 'seed',
    createdAt: now(),
    updatedAt: now(),
    ...partial,
  };
}

export class InMemoryCrmRepository implements CrmRepository {
  readonly name = 'memory';

  private companies: Company[] = [];
  private contacts: Contact[] = [];
  private activity: Activity[] = [];
  private leads: WebsiteLead[] = [];
  /** Keyed by `${companyId}:${agent}`, holding the latest run of each. */
  private runs = new Map<string, AgentRunRecord<unknown>>();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const a = seedCompany({
      name: 'Sample Highways EPC (demo data)',
      category: 'epc',
      hqLocation: 'Ahmedabad, Gujarat',
      operatingRegions: ['Gujarat', 'Rajasthan'],
      stage: 'contacted',
      priority: 'a',
      accountScore: 82,
      scoreRationale:
        'Live highway package with marking scope near procurement; within mobilisation range; matches our core service.',
      nextAction: 'Follow up on the first outreach — no reply yet',
      nextActionDue: daysAhead(2),
      lastContactedAt: daysAgo(6),
      opportunityValue: 4_200_000,
      notes: 'Seeded demo record. Replace with a real target account.',
    });

    const b = seedCompany({
      name: 'Sample Logistics Park Developer (demo data)',
      category: 'logistics',
      hqLocation: 'Pune, Maharashtra',
      operatingRegions: ['Maharashtra'],
      stage: 'rfq',
      priority: 'a',
      accountScore: 74,
      scoreRationale: 'Yard marking scope issued for pricing; phased execution required.',
      nextAction: 'Return the priced BOQ',
      nextActionDue: daysAhead(-1),
      lastContactedAt: daysAgo(3),
      lastResponseAt: daysAgo(3),
      opportunityValue: 1_850_000,
    });

    const c = seedCompany({
      name: 'Sample Airport Authority (demo data)',
      category: 'airport',
      hqLocation: 'Gujarat',
      stage: 'researched',
      priority: 'b',
      accountScore: 58,
      scoreRationale: 'Runway resurfacing programme reported; timing not yet confirmed.',
      nextAction: 'Identify the procurement contact',
      nextActionDue: daysAhead(5),
    });

    this.companies = [a, b, c];

    this.contacts = [
      {
        id: randomUUID(),
        companyId: a.id,
        name: 'Demo Contact',
        designation: 'Procurement Head',
        roleCategory: 'Procurement',
        email: null,
        phone: null,
        linkedinUrl: null,
        publicSourceUrl: 'https://example.com/demo-source',
        claimStatus: 'fact',
        relevance: 'Owns subcontractor selection for marking packages.',
        source: 'seed',
        createdAt: now(),
      },
    ];

    this.activity = [
      {
        id: randomUUID(),
        companyId: a.id,
        kind: 'outreach_sent',
        summary: 'First outreach sent',
        detail: 'Referenced their live highway package and our marking scope.',
        fromStage: null,
        toStage: null,
        occurredAt: daysAgo(6),
      },
      {
        id: randomUUID(),
        companyId: b.id,
        kind: 'rfq_received',
        summary: 'RFQ received for yard marking',
        detail: 'Approximately 18,000 sq m across two phases.',
        fromStage: null,
        toStage: null,
        occurredAt: daysAgo(3),
      },
    ];

    this.leads = [
      {
        id: randomUUID(),
        kind: 'boq',
        name: 'Demo Enquirer',
        company: 'Sample Contractor Pvt Ltd (demo data)',
        email: 'demo@example.com',
        phone: '+91 90000 00000',
        role: 'Projects',
        serviceSlug: 'thermoplastic-road-marking',
        industrySlug: 'highways-expressways',
        projectName: 'Package 4',
        location: 'Gujarat',
        timeline: 'Q4',
        quantity: '40 lane-km',
        message:
          'Seeded demo lead so the leads view is not empty. Delete once real enquiries arrive.',
        sourcePath: '/upload-boq',
        status: 'new',
        companyId: null,
        documentCount: 1,
        createdAt: daysAgo(1),
      },
    ];
  }

  async listCompanies(options?: {
    stage?: PipelineStage;
    search?: string;
  }): Promise<Company[]> {
    let rows = [...this.companies];
    if (options?.stage) rows = rows.filter((c) => c.stage === options.stage);
    if (options?.search) {
      const q = options.search.toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q));
    }
    return rows.sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  }

  async getCompany(id: string): Promise<Company | null> {
    return this.companies.find((c) => c.id === id) ?? null;
  }

  async createCompany(input: CreateCompanyInput): Promise<Company> {
    const company: Company = {
      id: randomUUID(),
      name: input.name,
      website: input.website ?? null,
      category: input.category,
      hqLocation: input.hqLocation ?? null,
      operatingRegions: input.operatingRegions ?? [],
      stage: input.stage ?? 'target',
      priority: input.priority ?? null,
      accountScore: null,
      scoreRationale: null,
      nextAction: input.nextAction ?? null,
      nextActionDue: input.nextActionDue ?? null,
      lastContactedAt: null,
      lastResponseAt: null,
      opportunityValue: input.opportunityValue ?? null,
      notes: input.notes ?? null,
      claimStatus: 'fact',
      evidenceUrls: [],
      source: input.source ?? 'manual',
      createdAt: now(),
      updatedAt: now(),
    };
    this.companies.unshift(company);
    return company;
  }

  async updateCompany(
    id: string,
    patch: Partial<CreateCompanyInput>,
  ): Promise<Company | null> {
    const company = this.companies.find((c) => c.id === id);
    if (!company) return null;
    Object.assign(company, {
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.website !== undefined && { website: patch.website }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.hqLocation !== undefined && { hqLocation: patch.hqLocation }),
      ...(patch.priority !== undefined && { priority: patch.priority }),
      ...(patch.nextAction !== undefined && { nextAction: patch.nextAction }),
      ...(patch.nextActionDue !== undefined && { nextActionDue: patch.nextActionDue }),
      ...(patch.opportunityValue !== undefined && {
        opportunityValue: patch.opportunityValue,
      }),
      ...(patch.notes !== undefined && { notes: patch.notes }),
      updatedAt: now(),
    });
    return company;
  }

  async applyScore(
    companyId: string,
    score: { total: number; priority: AccountPriority; rationale: string },
  ): Promise<Company | null> {
    const company = this.companies.find((c) => c.id === companyId);
    if (!company) return null;
    company.accountScore = score.total;
    company.priority = score.priority;
    company.scoreRationale = score.rationale;
    company.updatedAt = now();
    return company;
  }

  async moveStage(id: string, to: PipelineStage, note?: string): Promise<Company | null> {
    const company = this.companies.find((c) => c.id === id);
    if (!company) return null;
    if (!PIPELINE_STAGES.includes(to)) return null;

    const from = company.stage;
    if (from === to) return company;

    company.stage = to;
    company.updatedAt = now();
    if (to === 'contacted') company.lastContactedAt = now();
    if (to === 'replied') company.lastResponseAt = now();

    this.activity.unshift({
      id: randomUUID(),
      companyId: id,
      kind: 'stage_change',
      summary: `Moved from ${from} to ${to}`,
      detail: note ?? null,
      fromStage: from,
      toStage: to,
      occurredAt: now(),
    });
    return company;
  }

  async listContacts(companyId: string): Promise<Contact[]> {
    return this.contacts.filter((c) => c.companyId === companyId);
  }

  async createContact(input: CreateContactInput): Promise<Contact> {
    const contact: Contact = {
      id: randomUUID(),
      companyId: input.companyId,
      name: input.name,
      designation: input.designation ?? null,
      roleCategory: input.roleCategory ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      publicSourceUrl: input.publicSourceUrl ?? null,
      claimStatus: 'fact',
      relevance: null,
      source: input.source ?? 'manual',
      createdAt: now(),
    };
    this.contacts.push(contact);
    return contact;
  }

  async listActivity(companyId: string, limit = 50): Promise<Activity[]> {
    return this.activity
      .filter((a) => a.companyId === companyId)
      .sort((x, y) => y.occurredAt.localeCompare(x.occurredAt))
      .slice(0, limit);
  }

  async addActivity(input: {
    companyId: string;
    kind: ActivityKind;
    summary: string;
    detail?: string | null;
  }): Promise<Activity> {
    const entry: Activity = {
      id: randomUUID(),
      companyId: input.companyId,
      kind: input.kind,
      summary: input.summary,
      detail: input.detail ?? null,
      fromStage: null,
      toStage: null,
      occurredAt: now(),
    };
    this.activity.unshift(entry);

    const company = this.companies.find((c) => c.id === input.companyId);
    if (company) {
      if (input.kind === 'outreach_sent') company.lastContactedAt = entry.occurredAt;
      if (input.kind === 'reply_received') company.lastResponseAt = entry.occurredAt;
      company.updatedAt = now();
    }
    return entry;
  }

  async latestRun<Output>(
    companyId: string,
    agent: string,
  ): Promise<AgentRunRecord<Output> | null> {
    return (this.runs.get(`${companyId}:${agent}`) as AgentRunRecord<Output>) ?? null;
  }

  async saveRun<Output>(record: AgentRunRecord<Output>): Promise<void> {
    this.runs.set(`${record.companyId}:${record.agent}`, record as AgentRunRecord<unknown>);
  }

  async listLeads(options?: { status?: WebsiteLead['status'] }): Promise<WebsiteLead[]> {
    let rows = [...this.leads];
    if (options?.status) rows = rows.filter((l) => l.status === options.status);
    return rows.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  }

  async getLead(id: string): Promise<WebsiteLead | null> {
    return this.leads.find((l) => l.id === id) ?? null;
  }

  async convertLead(leadId: string): Promise<Company | null> {
    const lead = this.leads.find((l) => l.id === leadId);
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

    lead.companyId = company.id;
    lead.status = 'converted';

    await this.addActivity({
      companyId: company.id,
      kind: 'lead_converted',
      summary: `Converted from a website ${lead.kind} enquiry`,
      detail: `${lead.name} (${lead.email}) via ${lead.sourcePath ?? 'the website'}`,
    });

    return company;
  }

  async summary(): Promise<DashboardSummary> {
    const byStage = Object.fromEntries(
      PIPELINE_STAGES.map((s) => [s, 0]),
    ) as Record<PipelineStage, number>;
    for (const company of this.companies) byStage[company.stage] += 1;

    const today = new Date().toISOString().slice(0, 10);
    const withDue = this.companies.filter((c) => c.nextActionDue !== null);

    return {
      totalAccounts: this.companies.length,
      byStage,
      priorityA: this.companies.filter((c) => c.priority === 'a').length,
      decisionMakers: this.contacts.length,
      actionsDue: withDue.filter((c) => c.nextActionDue! <= today).length,
      actionsOverdue: withDue.filter((c) => c.nextActionDue! < today).length,
      openRfqs: this.companies.filter(
        (c) => c.stage === 'rfq' || c.stage === 'quotation',
      ).length,
      won: byStage.won,
      pipelineValue: this.companies
        .filter((c) => BOARD_STAGES.includes(c.stage))
        .reduce((sum, c) => sum + (c.opportunityValue ?? 0), 0),
      newLeads: this.leads.filter((l) => l.status === 'new').length,
      unconvertedLeads: this.leads.filter((l) => l.companyId === null).length,
    };
  }
}
