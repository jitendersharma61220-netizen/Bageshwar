import 'server-only';
import { randomUUID } from 'node:crypto';
import { getProvider } from './registry';
import {
  collectSources,
  downgradeUnsourced,
  summariseStatus,
  type ClaimStatus,
  type Downgrade,
  type Source,
} from './claims';
import { ourContactDetails, scrubPii, type PiiRemoval } from './pii';
import type { Agent } from './agents/types';
import { getServiceClient } from '@/lib/supabase/client';

/**
 * The runner.
 *
 * Everything an agent run needs that is not the agent itself: the provider
 * call, governance enforcement, persistence and the audit trail.
 *
 * Two guarantees live here rather than in a prompt:
 *
 *  1. **Sourcing.** Every output passes through `downgradeUnsourced()` before
 *     anything else sees it. A claim asserted as fact with no sources becomes
 *     `unknown`, and the downgrade is recorded so a prompt that keeps doing it
 *     is measurable.
 *  2. **Approval.** An agent declaring `requiresApproval` produces an output
 *     marked `pending`. The runner has no code path that performs an outward
 *     action, so "approved" is only ever reachable through a human.
 *  3. **Contact details.** Every string is scrubbed of anything that reads as
 *     an email address or phone number, except our own verified ones. Agent
 *     schemas already omit contact fields; this catches the address a model
 *     writes into a note instead.
 *
 * All three run here rather than in each agent, so a new agent inherits them
 * by existing rather than by remembering to.
 */

export interface RunOptions {
  /** Attach the run to an account. */
  readonly companyId?: string;
  /** Who asked for it. */
  readonly requestedBy?: string;
}

export interface RunResult<Output> {
  readonly taskId: string;
  readonly output: Output;
  readonly claimStatus: ClaimStatus;
  readonly sources: readonly Source[];
  readonly downgrades: readonly Downgrade[];
  /** Contact details stripped from free text before persistence. */
  readonly piiRemovals: readonly PiiRemoval[];
  readonly requiresApproval: boolean;
  readonly model: string;
  readonly provider: string;
  readonly durationMs: number;
  readonly usage: { inputTokens: number; outputTokens: number };
  /** False when the result could not be persisted; the output is still returned. */
  readonly persisted: boolean;
}

export class NoProviderError extends Error {
  constructor() {
    super(
      'No AI provider is configured. Set GEMINI_API_KEY (or OPENAI_API_KEY with AI_PROVIDER=openai).',
    );
    this.name = 'NoProviderError';
  }
}

/** Fire-and-forget audit write: a logging failure must not fail the run. */
async function audit(
  taskId: string | null,
  event: string,
  detail: Record<string, unknown>,
  actorId?: string,
): Promise<void> {
  const client = getServiceClient();
  if (!client) return;
  const { error } = await client.from('ai_audit_log').insert({
    task_id: taskId,
    event,
    detail,
    actor_id: actorId ?? null,
  } as never);
  if (error) console.error('[ai] audit write failed', event, error.message);
}

export async function runAgent<Input, Output>(
  agent: Agent<Input, Output>,
  input: Input,
  options: RunOptions = {},
): Promise<RunResult<Output>> {
  const provider = await getProvider();
  if (!provider || !provider.configured) throw new NoProviderError();

  const parsedInput = agent.inputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(
      `Invalid input for ${agent.name}: ${parsedInput.error.issues
        .map((i) => `${i.path.join('.')} ${i.message}`)
        .join('; ')}`,
    );
  }

  const client = getServiceClient();
  const taskId = randomUUID();
  const startedAt = Date.now();

  // The task row is written BEFORE the model call, so a run that crashes or
  // times out is still visible rather than leaving no trace.
  if (client) {
    const { error } = await client.from('ai_tasks').insert({
      id: taskId,
      agent: agent.name,
      prompt_version: agent.promptVersion,
      provider: provider.name,
      input: parsedInput.data as never,
      status: 'running',
      company_id: options.companyId ?? null,
      requested_by: options.requestedBy ?? null,
    } as never);
    if (error) console.error('[ai] could not record task', error.message);
  }

  await audit(taskId, 'task.started', { agent: agent.name, provider: provider.name });

  let generated;
  try {
    generated = await provider.generateObject({
      schema: agent.outputSchema,
      schemaName: `${agent.name}-${agent.promptVersion}`,
      system: agent.system,
      prompt: agent.buildPrompt(parsedInput.data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (client) {
      await client
        .from('ai_tasks')
        .update({
          status: 'failed',
          error: message.slice(0, 2000),
          finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startedAt,
        } as never)
        .eq('id', taskId);
    }
    await audit(taskId, 'task.failed', { error: message.slice(0, 500) });
    throw error;
  }

  /* ---------------------------------------------------------------------- */
  /* Governance                                                              */
  /* ---------------------------------------------------------------------- */

  const { value: downgraded, downgrades } = downgradeUnsourced(generated.value);

  // Scrubbing runs after downgrading and before anything is written. Our own
  // verified numbers are allowed through so a future outreach draft can sign
  // off properly; that list is empty until a human verifies one, and empty is
  // the safe state.
  const { value: governed, removals: piiRemovals } = scrubPii(downgraded, {
    allow: await ourContactDetails(),
  });

  const sources = collectSources(governed);
  const claimStatus = summariseStatus(governed, downgrades);
  const durationMs = Date.now() - startedAt;

  if (downgrades.length > 0) {
    console.warn(
      `[ai] ${agent.name}@${agent.promptVersion} produced ${downgrades.length} unsourced fact(s); downgraded to unknown`,
      downgrades.map((d) => d.path),
    );
    await audit(taskId, 'output.downgraded', {
      count: downgrades.length,
      paths: downgrades.map((d) => d.path),
      promptVersion: agent.promptVersion,
    });
  }

  if (piiRemovals.length > 0) {
    console.warn(
      `[ai] ${agent.name}@${agent.promptVersion} produced ${piiRemovals.length} contact detail(s) in free text; removed`,
      piiRemovals.map((r) => `${r.path} (${r.kind})`),
    );
    // Fingerprints only. Writing the removed value into the audit log would
    // put the fabricated contact detail straight back into the database.
    await audit(taskId, 'output.pii_removed', {
      count: piiRemovals.length,
      removals: piiRemovals.map((r) => ({
        path: r.path,
        kind: r.kind,
        fingerprint: r.fingerprint,
      })),
      promptVersion: agent.promptVersion,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Persistence                                                             */
  /* ---------------------------------------------------------------------- */

  let persisted = false;
  if (client) {
    // Record every source consulted, so a claim can be traced later even if
    // the page it came from changes.
    if (sources.length > 0) {
      const { error } = await client.from('research_sources').insert(
        sources.map((s) => ({
          url: s.url,
          title: s.title ?? null,
          fetched_at: s.fetchedAt ?? new Date().toISOString(),
        })) as never,
      );
      if (error) console.error('[ai] could not record sources', error.message);
    }

    const { error: outputError } = await client.from('ai_outputs').insert({
      task_id: taskId,
      output: governed as never,
      claim_status: claimStatus,
      evidence_urls: sources.map((s) => s.url),
      confidence: null,
      downgraded: downgrades.length > 0 || piiRemovals.length > 0,
      downgrade_reason:
        [
          ...downgrades.map((d) => `${d.path}: ${d.reason}`),
          ...piiRemovals.map((r) => `${r.path}: ${r.kind} removed from free text`),
        ]
          .join('; ')
          .slice(0, 2000) || null,
      // The gate. An agent whose effects leave the building produces a pending
      // output; nothing in this runner can move it to approved.
      approval: agent.requiresApproval ? 'pending' : 'not_required',
    } as never);

    if (outputError) {
      console.error('[ai] could not record output', outputError.message);
    } else {
      persisted = true;
    }

    await client
      .from('ai_tasks')
      .update({
        status: 'succeeded',
        model: generated.model,
        finished_at: new Date().toISOString(),
        duration_ms: durationMs,
        input_tokens: generated.usage.inputTokens,
        output_tokens: generated.usage.outputTokens,
      } as never)
      .eq('id', taskId);
  }

  await audit(taskId, 'task.succeeded', {
    claimStatus,
    sourceCount: sources.length,
    downgraded: downgrades.length,
    piiRemoved: piiRemovals.length,
    requiresApproval: agent.requiresApproval,
  });

  return {
    taskId,
    output: governed,
    claimStatus,
    sources,
    downgrades,
    piiRemovals,
    requiresApproval: agent.requiresApproval,
    model: generated.model,
    provider: provider.name,
    durationMs,
    usage: generated.usage,
    persisted,
  };
}

/**
 * Approve an output.
 *
 * Deliberately separate from `runAgent`, takes a human's id, and is the only
 * function in this module that can set `approved`. The database additionally
 * refuses an approval that does not name a person and a time.
 */
export async function approveOutput(
  outputId: string,
  approverId: string,
): Promise<{ ok: boolean; error?: string }> {
  const client = getServiceClient();
  if (!client) return { ok: false, error: 'Supabase is not configured.' };
  if (!approverId) return { ok: false, error: 'An approval must name a person.' };

  const { error } = await client
    .from('ai_outputs')
    .update({
      approval: 'approved',
      approved_by: approverId,
      approved_at: new Date().toISOString(),
    } as never)
    .eq('id', outputId)
    .eq('approval', 'pending');

  if (error) return { ok: false, error: error.message };

  await audit(null, 'output.approved', { outputId }, approverId);
  return { ok: true };
}

export async function rejectOutput(
  outputId: string,
  approverId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const client = getServiceClient();
  if (!client) return { ok: false, error: 'Supabase is not configured.' };

  const { error } = await client
    .from('ai_outputs')
    .update({
      approval: 'rejected',
      rejected_reason: reason.slice(0, 2000),
    } as never)
    .eq('id', outputId)
    .eq('approval', 'pending');

  if (error) return { ok: false, error: error.message };

  await audit(null, 'output.rejected', { outputId, reason: reason.slice(0, 500) }, approverId);
  return { ok: true };
}
