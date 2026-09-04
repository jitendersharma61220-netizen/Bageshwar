'use client';

import { useActionState } from 'react';
import { researchAccountAction } from '@/app/admin/actions';

/**
 * Trigger for the Market Research Agent.
 *
 * Deliberately explicit: research costs a model call and the founder should
 * choose when to spend one, rather than have it fire on page load.
 */
export function ResearchPanel({
  companyId,
  hasResearch,
  providerConfigured,
}: {
  companyId: string;
  hasResearch: boolean;
  providerConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(researchAccountAction, {});

  return (
    <div className="border border-paper-300 bg-paper-50 p-5">
      <h2 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
        Research
      </h2>

      {!providerConfigured ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          No AI provider is configured. Set <code className="text-ink-800">GEMINI_API_KEY</code>{' '}
          to enable the research agent.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {hasResearch
            ? 'Re-run to refresh. Each run is recorded and replaces what is shown below.'
            : 'Build a sourced picture of this company. Every claim is shown with how it was arrived at and what backs it.'}
        </p>
      )}

      {state.error ? (
        <p
          role="alert"
          className="mt-3 border border-danger-600/30 bg-danger-600/5 px-3 py-2 text-sm text-danger-600"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="companyId" value={companyId} />
        <button
          type="submit"
          disabled={pending || !providerConfigured}
          className="w-full rounded-card bg-safety-500 px-4 py-2 text-sm font-semibold text-graphite-950 hover:bg-safety-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Researching…' : hasResearch ? 'Re-run research' : 'Research this account'}
        </button>
      </form>
    </div>
  );
}
