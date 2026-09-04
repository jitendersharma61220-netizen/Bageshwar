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
/* Research                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Run the Market Research Agent against an account.
 *
 * The result is stored and shown for review. Nothing is written onto the
 * company record automatically: research is an input to a human decision, not
 * a substitute for one, and an agent silently overwriting a founder's own
 * notes would be the wrong trade.
 */
export async function researchAccountAction(
  _previous: { error?: string; ok?: boolean } | undefined,
  form: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const repository = await requireRepository();

  const companyId = text(form, 'companyId', 60);
  if (!companyId) return { error: 'No account selected.' };

  const company = await repository.getCompany(companyId);
  if (!company) return { error: 'That account no longer exists.' };

  const { runAgent, NoProviderError } = await import('@/lib/ai/runner');
  const { marketResearchAgent } = await import('@/lib/ai/agents/market-research');

  try {
    const result = await runAgent(
      marketResearchAgent,
      {
        companyName: company.name,
        ...(company.website ? { website: company.website } : {}),
        ...(company.notes ? { knownContext: company.notes.slice(0, 2000) } : {}),
      },
      { companyId },
    );

    await repository.saveResearch({
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
      ranAt: new Date().toISOString(),
    });

    await repository.addActivity({
      companyId,
      kind: 'note',
      summary: 'Market research run',
      detail: [
        `${result.sources.length} source(s)`,
        result.downgrades.length > 0
          ? `${result.downgrades.length} unsourced claim(s) downgraded`
          : 'no downgrades',
      ].join(' · '),
    });

    revalidatePath(`/admin/accounts/${companyId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof NoProviderError) {
      return {
        error:
          'No AI provider is configured. Set GEMINI_API_KEY to enable research.',
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error('[admin] research failed', companyId, message);
    return { error: `Research failed: ${message.slice(0, 200)}` };
  }
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
