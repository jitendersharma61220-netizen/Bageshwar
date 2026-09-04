'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession, signIn, signOut } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import {
  COMPANY_CATEGORIES,
  PIPELINE_STAGES,
  type CompanyCategory,
  type PipelineStage,
} from '@/lib/crm/types';

/**
 * Server actions for the admin area.
 *
 * Every action that touches data calls `requireRepository()`, which re-checks
 * the session server-side. The layout guard is for navigation; this is the
 * check that actually protects the data, because a server action is a public
 * endpoint that a page render does not gate.
 */

async function requireRepository() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const repository = await getCrmRepository();
  if (!repository) throw new Error('The CRM data layer is not configured.');
  return repository;
}

function text(form: FormData, key: string, max = 300): string | null {
  const value = form.get(key);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed === '' ? null : trimmed;
}

/* -------------------------------------------------------------------------- */
/* Authentication                                                              */
/* -------------------------------------------------------------------------- */

export async function signInAction(
  _previous: { error?: string } | undefined,
  form: FormData,
): Promise<{ error?: string }> {
  const email = text(form, 'email', 200) ?? '';
  const password = typeof form.get('password') === 'string'
    ? (form.get('password') as string)
    : '';

  const result = await signIn(email, password);
  if (!result.ok) return { error: result.error ?? 'Sign in failed.' };

  redirect('/admin');
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect('/admin/login');
}

/* -------------------------------------------------------------------------- */
/* Accounts                                                                    */
/* -------------------------------------------------------------------------- */

export async function createCompanyAction(
  _previous: { error?: string } | undefined,
  form: FormData,
): Promise<{ error?: string }> {
  const repository = await requireRepository();

  const name = text(form, 'name', 200);
  if (!name || name.length < 2) return { error: 'Enter the company name.' };

  const categoryValue = text(form, 'category', 40) ?? 'other';
  const category = (COMPANY_CATEGORIES as readonly string[]).includes(categoryValue)
    ? (categoryValue as CompanyCategory)
    : 'other';

  const stageValue = text(form, 'stage', 40) ?? 'target';
  const stage = (PIPELINE_STAGES as readonly string[]).includes(stageValue)
    ? (stageValue as PipelineStage)
    : 'target';

  const rawValue = text(form, 'opportunityValue', 20);
  const opportunityValue =
    rawValue === null ? null : Number.isFinite(Number(rawValue)) ? Number(rawValue) : null;

  const company = await repository.createCompany({
    name,
    website: text(form, 'website'),
    category,
    hqLocation: text(form, 'hqLocation'),
    stage,
    nextAction: text(form, 'nextAction'),
    nextActionDue: text(form, 'nextActionDue', 20),
    opportunityValue,
    notes: text(form, 'notes', 4000),
    source: 'manual',
  });

  revalidatePath('/admin');
  revalidatePath('/admin/pipeline');
  revalidatePath('/admin/accounts');
  redirect(`/admin/accounts/${company.id}`);
}

export async function moveStageAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const id = text(form, 'companyId', 60);
  const stageValue = text(form, 'stage', 40);
  if (!id || !stageValue) return;
  if (!(PIPELINE_STAGES as readonly string[]).includes(stageValue)) return;

  await repository.moveStage(id, stageValue as PipelineStage, text(form, 'note', 500) ?? undefined);

  revalidatePath('/admin');
  revalidatePath('/admin/pipeline');
  revalidatePath(`/admin/accounts/${id}`);
}

export async function addNoteAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const id = text(form, 'companyId', 60);
  const summary = text(form, 'summary', 500);
  if (!id || !summary) return;

  await repository.addActivity({ companyId: id, kind: 'note', summary });
  revalidatePath(`/admin/accounts/${id}`);
}

export async function setNextActionAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const id = text(form, 'companyId', 60);
  if (!id) return;

  await repository.updateCompany(id, {
    nextAction: text(form, 'nextAction'),
    nextActionDue: text(form, 'nextActionDue', 20),
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/accounts/${id}`);
}

export async function addContactAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  const name = text(form, 'name', 160);
  if (!companyId || !name) return;

  await repository.createContact({
    companyId,
    name,
    designation: text(form, 'designation', 160),
    roleCategory: text(form, 'roleCategory', 80),
    email: text(form, 'email', 200),
    phone: text(form, 'phone', 40),
    linkedinUrl: text(form, 'linkedinUrl', 400),
    publicSourceUrl: text(form, 'publicSourceUrl', 500),
    source: 'manual',
  });

  revalidatePath(`/admin/accounts/${companyId}`);
}

/* -------------------------------------------------------------------------- */
/* AI agents                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Every agent action in this file follows the same shape, and the shape is the
 * point:
 *
 *   run the agent → store the run → show it for review → change nothing else
 *
 * Nothing an agent produces is written onto the account record by the act of
 * running it. Adopting a score and adding a contact are separate actions, each
 * triggered by a person clicking a button, each recorded in the activity trail.
 * An agent that could silently rewrite the founder's own notes, or import six
 * names it found somewhere, would be a worse tool than one that proposes and
 * waits.
 */

type AgentActionState = { error?: string; ok?: boolean };

/** Shared error handling: a missing provider is a configuration message. */
async function withProvider(
  label: string,
  run: () => Promise<AgentActionState>,
): Promise<AgentActionState> {
  const { NoProviderError } = await import('@/lib/ai/runner');
  try {
    return await run();
  } catch (error) {
    if (error instanceof NoProviderError) {
      return {
        error: 'No AI provider is configured. Set GEMINI_API_KEY to enable this.',
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[admin] ${label} failed`, message);
    return { error: `${label} failed: ${message.slice(0, 200)}` };
  }
}

/**
 * Run the Market Research Agent against an account.
 *
 * The result is stored and shown for review. Nothing is written onto the
 * company record automatically: research is an input to a human decision, not
 * a substitute for one, and an agent silently overwriting a founder's own
 * notes would be the wrong trade.
 */
export async function researchAccountAction(
  _previous: AgentActionState | undefined,
  form: FormData,
): Promise<AgentActionState> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  if (!companyId) return { error: 'No account selected.' };

  const company = await repository.getCompany(companyId);
  if (!company) return { error: 'That account no longer exists.' };

  return withProvider('Research', async () => {
    const { runAgent } = await import('@/lib/ai/runner');
    const { marketResearchAgent } = await import('@/lib/ai/agents/market-research');

    const result = await runAgent(
      marketResearchAgent,
      {
        companyName: company.name,
        ...(company.website ? { website: company.website } : {}),
        ...(company.notes ? { knownContext: company.notes.slice(0, 2000) } : {}),
      },
      { companyId },
    );

    await repository.saveRun({
      taskId: result.taskId,
      companyId,
      agent: marketResearchAgent.name,
      promptVersion: marketResearchAgent.promptVersion,
      provider: result.provider,
      model: result.model,
      output: result.output,
      claimStatus: result.claimStatus,
      sources: result.sources,
      downgrades: result.downgrades,
      piiRemovals: result.piiRemovals,
      ranAt: new Date().toISOString(),
    });

    await repository.addActivity({
      companyId,
      kind: 'note',
      summary: 'Market research run',
      detail: runDetail(result.sources.length, result.downgrades.length, result.piiRemovals.length),
    });

    revalidatePath(`/admin/accounts/${companyId}`);
    return { ok: true };
  });
}

/** One line describing what governance did to a run, for the activity trail. */
function runDetail(sources: number, downgrades: number, piiRemovals: number): string {
  const parts = [`${sources} source${sources === 1 ? '' : 's'}`];
  parts.push(
    downgrades > 0 ? `${downgrades} unsourced claim(s) downgraded` : 'no downgrades',
  );
  if (piiRemovals > 0) parts.push(`${piiRemovals} contact detail(s) removed`);
  return parts.join(' · ');
}

/**
 * Score the opportunity.
 *
 * Requires research to exist, and is given only that research — never the live
 * web. The scoring agent's job is to assess what was established, and letting
 * it introduce new facts would make the score unauditable against the record
 * it is supposedly scoring.
 *
 * The model rates eight components; the total and the A/B/C priority are
 * computed in `scoreOpportunity()`, so the same ratings always give the same
 * score and the weights are visible in one file.
 */
export async function scoreAccountAction(
  _previous: AgentActionState | undefined,
  form: FormData,
): Promise<AgentActionState> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  if (!companyId) return { error: 'No account selected.' };

  const company = await repository.getCompany(companyId);
  if (!company) return { error: 'That account no longer exists.' };

  const { marketResearchAgent } = await import('@/lib/ai/agents/market-research');
  const research = await repository.latestRun<
    Awaited<ReturnType<typeof marketResearchAgent.outputSchema.parse>>
  >(companyId, marketResearchAgent.name);

  if (!research) {
    return { error: 'Research this account first — scoring assesses the research record.' };
  }

  return withProvider('Scoring', async () => {
    const { runAgent } = await import('@/lib/ai/runner');
    const { opportunityMatchingAgent } = await import('@/lib/ai/agents/opportunity-matching');
    const { renderResearchForScoring } = await import('@/lib/crm/research-summary');

    const result = await runAgent(
      opportunityMatchingAgent,
      {
        companyName: company.name,
        researchSummary: renderResearchForScoring(research).slice(0, 12_000),
        ...(company.notes ? { knownContext: company.notes.slice(0, 2000) } : {}),
      },
      { companyId },
    );

    await repository.saveRun({
      taskId: result.taskId,
      companyId,
      agent: opportunityMatchingAgent.name,
      promptVersion: opportunityMatchingAgent.promptVersion,
      provider: result.provider,
      model: result.model,
      output: result.output,
      claimStatus: result.claimStatus,
      sources: result.sources,
      downgrades: result.downgrades,
      piiRemovals: result.piiRemovals,
      ranAt: new Date().toISOString(),
    });

    const { scoreOpportunity } = await import('@/lib/ai/agents/opportunity-matching');
    const scored = scoreOpportunity(result.output);

    await repository.addActivity({
      companyId,
      kind: 'note',
      summary: `Opportunity scored ${scored.total}/100 (priority ${scored.priority.toUpperCase()})`,
      detail: scored.unevidencedCount > 0
        ? `${scored.unevidencedCount} of 8 components rated with no evidence cited. Not applied to the account.`
        : 'All eight components cite evidence. Not applied to the account.',
    });

    revalidatePath(`/admin/accounts/${companyId}`);
    return { ok: true };
  });
}

/**
 * Adopt the computed score onto the account.
 *
 * The separate step. A score sitting in a review panel informs a person; a
 * score written onto the record changes what the pipeline shows and what gets
 * worked on, and that is a decision rather than an output.
 *
 * The score is recomputed here from the stored component ratings rather than
 * being passed through the form, so what lands on the account is the
 * arithmetic in `scoreOpportunity()` and not a number a client submitted.
 */
export async function applyScoreAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  if (!companyId) return;

  const { opportunityMatchingAgent, scoreOpportunity } = await import(
    '@/lib/ai/agents/opportunity-matching'
  );
  const { OpportunityMatchingOutputRuntimeCheck } = { OpportunityMatchingOutputRuntimeCheck: null };
  void OpportunityMatchingOutputRuntimeCheck;

  const run = await repository.latestRun<
    import('@/lib/ai/agents/opportunity-matching').OpportunityMatchingOutput
  >(companyId, opportunityMatchingAgent.name);
  if (!run) return;

  const scored = scoreOpportunity(run.output);

  const rationale = [
    run.output.verdict,
    '',
    ...scored.components.map(
      (c) => `${c.label}: ${c.rating}/10 (weight ${c.weight}) — ${c.reasoning}`,
    ),
    '',
    `Scored by ${run.agent}@${run.promptVersion} via ${run.provider}/${run.model} on ${run.ranAt}.`,
    scored.unevidencedCount > 0
      ? `${scored.unevidencedCount} of 8 components were rated without citing evidence.`
      : 'All eight components cited evidence.',
  ].join('\n');

  await repository.applyScore(companyId, {
    total: scored.total,
    priority: scored.priority,
    rationale,
  });

  await repository.addActivity({
    companyId,
    kind: 'note',
    summary: `Score applied: ${scored.total}/100, priority ${scored.priority.toUpperCase()}`,
    detail: run.output.verdict.slice(0, 1000),
  });

  revalidatePath('/admin');
  revalidatePath('/admin/pipeline');
  revalidatePath('/admin/accounts');
  revalidatePath(`/admin/accounts/${companyId}`);
}

/**
 * Find who to approach.
 *
 * The agent's output schema has no email field and no phone field, so the
 * usual failure — a confidently invented address — cannot be expressed. What
 * comes back is roles to target, plus any individuals a public page actually
 * names, each with the URL that names them.
 */
export async function findDecisionMakersAction(
  _previous: AgentActionState | undefined,
  form: FormData,
): Promise<AgentActionState> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  if (!companyId) return { error: 'No account selected.' };

  const company = await repository.getCompany(companyId);
  if (!company) return { error: 'That account no longer exists.' };

  return withProvider('Decision maker research', async () => {
    const { runAgent } = await import('@/lib/ai/runner');
    const { decisionMakerAgent, withSourcedIndividualsOnly } = await import(
      '@/lib/ai/agents/decision-maker'
    );

    // Give it the opportunity context so relevance is specific to this account
    // rather than generic. Sourced from what we already established.
    const { marketResearchAgent } = await import('@/lib/ai/agents/market-research');
    const research = await repository.latestRun<
      import('@/lib/ai/agents/market-research').MarketResearchOutput
    >(companyId, marketResearchAgent.name);
    const context =
      research?.output.opportunityType.value ?? company.notes ?? undefined;

    const result = await runAgent(
      decisionMakerAgent,
      {
        companyName: company.name,
        ...(company.website ? { website: company.website } : {}),
        ...(context ? { opportunityContext: context.slice(0, 4000) } : {}),
      },
      { companyId },
    );

    const { output, dropped } = withSourcedIndividualsOnly(result.output);

    await repository.saveRun({
      taskId: result.taskId,
      companyId,
      agent: decisionMakerAgent.name,
      promptVersion: decisionMakerAgent.promptVersion,
      provider: result.provider,
      model: result.model,
      output,
      claimStatus: result.claimStatus,
      sources: result.sources,
      downgrades: result.downgrades,
      piiRemovals: result.piiRemovals,
      ranAt: new Date().toISOString(),
    });

    await repository.addActivity({
      companyId,
      kind: 'note',
      summary: output.noIndividualsFound
        ? 'Decision maker research: no named individuals found'
        : `Decision maker research: ${output.individuals.length} sourced candidate(s)`,
      detail: [
        `${output.roles.length} role(s) to target`,
        dropped > 0 ? `${dropped} unsourced name(s) discarded` : null,
        result.piiRemovals.length > 0
          ? `${result.piiRemovals.length} contact detail(s) removed`
          : null,
      ]
        .filter(Boolean)
        .join(' · '),
    });

    revalidatePath(`/admin/accounts/${companyId}`);
    return { ok: true };
  });
}

/**
 * Add one researched individual to the account as a contact.
 *
 * One at a time, by a person, from the stored run — never a bulk import.
 *
 * The candidate is looked up in the stored output by name rather than being
 * read out of the form, so a submitted field cannot introduce a person the
 * agent never returned. Email and phone are written as null explicitly: the
 * agent had nowhere to put them, and this is the point where a helpful guess
 * would otherwise creep in.
 */
export async function addCandidateContactAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  const name = text(form, 'candidateName', 160);
  if (!companyId || !name) return;

  const { decisionMakerAgent, ROLE_LABELS } = await import('@/lib/ai/agents/decision-maker');
  const run = await repository.latestRun<
    import('@/lib/ai/agents/decision-maker').DecisionMakerOutput
  >(companyId, decisionMakerAgent.name);
  if (!run) return;

  const candidate = run.output.individuals.find((person) => person.name === name);
  // No source, no contact. The schema requires one, so this is belt and braces
  // for a record written by an older prompt version.
  if (!candidate?.publicSourceUrl) return;

  await repository.createContact({
    companyId,
    name: candidate.name,
    designation: candidate.designation,
    roleCategory: ROLE_LABELS[candidate.role],
    email: null,
    phone: null,
    linkedinUrl: candidate.profileUrl,
    publicSourceUrl: candidate.publicSourceUrl,
    source: `ai:${decisionMakerAgent.name}@${decisionMakerAgent.promptVersion}`,
  });

  await repository.addActivity({
    companyId,
    kind: 'note',
    summary: `Contact added from research: ${candidate.name}`,
    detail: `${candidate.designation} · source: ${candidate.publicSourceUrl}${
      candidate.caveat ? ` · caveat: ${candidate.caveat}` : ''
    }`,
  });

  revalidatePath(`/admin/accounts/${companyId}`);
}

/* -------------------------------------------------------------------------- */
/* Leads                                                                       */
/* -------------------------------------------------------------------------- */

export async function convertLeadAction(form: FormData): Promise<void> {
  const repository = await requireRepository();

  const leadId = text(form, 'leadId', 60);
  if (!leadId) return;

  const company = await repository.convertLead(leadId);

  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath('/admin/pipeline');

  if (company) redirect(`/admin/accounts/${company.id}`);
}
