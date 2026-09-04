'use client';

import { useActionState } from 'react';
import {
  findDecisionMakersAction,
  researchAccountAction,
  scoreAccountAction,
} from '@/app/admin/actions';

/**
 * The triggers for the three research agents.
 *
 * Deliberately explicit: each run costs a model call, and the founder should
 * choose when to spend one rather than have it fire on page load.
 *
 * They are also deliberately ordered and gated — research, then score, then
 * decision makers — because that is the actual dependency. Scoring assesses a
 * research record; without one there is nothing to assess, and a scoring agent
 * left to fill that gap itself would be doing research without the sourcing
 * rules the research agent is held to.
 */

interface AgentButtonProps {
  companyId: string;
  hasRun: boolean;
  disabled?: boolean;
  disabledReason?: string;
  providerConfigured: boolean;
}

function ProviderNotice() {
  return (
    <p className="mt-3 text-sm leading-relaxed text-ink-600">
      No AI provider is configured. Set <code className="text-ink-800">GEMINI_API_KEY</code>{' '}
      to enable the agents.
    </p>
  );
}

const buttonClass =
  'w-full rounded-card bg-safety-500 px-4 py-2 text-sm font-semibold text-graphite-950 hover:bg-safety-400 disabled:cursor-not-allowed disabled:opacity-50';

function ErrorNotice({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-3 border border-danger-600/30 bg-danger-600/5 px-3 py-2 text-sm text-danger-600"
    >
      {message}
    </p>
  );
}

export function ResearchPanel({
  companyId,
  hasRun,
  providerConfigured,
}: AgentButtonProps) {
  const [state, formAction, pending] = useActionState(researchAccountAction, {});

  return (
    <div className="border border-paper-300 bg-paper-50 p-5">
      <h2 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
        1 · Research
      </h2>

      {!providerConfigured ? (
        <ProviderNotice />
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {hasRun
            ? 'Re-run to refresh. Each run is recorded and replaces what is shown.'
            : 'Build a sourced picture of this company. Every claim is shown with how it was arrived at and what backs it.'}
        </p>
      )}

      {state.error ? <ErrorNotice message={state.error} /> : null}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="companyId" value={companyId} />
        <button type="submit" disabled={pending || !providerConfigured} className={buttonClass}>
          {pending ? 'Researching…' : hasRun ? 'Re-run research' : 'Research this account'}
        </button>
      </form>
    </div>
  );
}

export function ScorePanel({
  companyId,
  hasRun,
  disabled,
  disabledReason,
  providerConfigured,
}: AgentButtonProps) {
  const [state, formAction, pending] = useActionState(scoreAccountAction, {});

  return (
    <div className="border border-paper-300 bg-paper-50 p-5">
      <h2 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
        2 · Score
      </h2>

      {!providerConfigured ? (
        <ProviderNotice />
      ) : disabled ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{disabledReason}</p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {hasRun
            ? 'Re-score against the current research record.'
            : 'Rate the opportunity on eight components. The total and the A/B/C band are computed from those ratings, not written by the model.'}
        </p>
      )}

      {state.error ? <ErrorNotice message={state.error} /> : null}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="companyId" value={companyId} />
        <button
          type="submit"
          disabled={pending || !providerConfigured || disabled}
          className={buttonClass}
        >
          {pending ? 'Scoring…' : hasRun ? 'Re-score' : 'Score this opportunity'}
        </button>
      </form>
    </div>
  );
}

export function DecisionMakerPanel({
  companyId,
  hasRun,
  providerConfigured,
}: AgentButtonProps) {
  const [state, formAction, pending] = useActionState(findDecisionMakersAction, {});

  return (
    <div className="border border-paper-300 bg-paper-50 p-5">
      <h2 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
        3 · Decision makers
      </h2>

      {!providerConfigured ? (
        <ProviderNotice />
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {hasRun
            ? 'Re-run to look again. Candidates are proposals until you add them.'
            : 'Find the roles to approach, and any individuals a public page names in them. No email addresses or phone numbers — the agent has nowhere to put one.'}
        </p>
      )}

      {state.error ? <ErrorNotice message={state.error} /> : null}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="companyId" value={companyId} />
        <button type="submit" disabled={pending || !providerConfigured} className={buttonClass}>
          {pending ? 'Searching…' : hasRun ? 'Re-run' : 'Find decision makers'}
        </button>
      </form>
    </div>
  );
}
