import { ClaimBadge } from './ClaimBadge';
import { relativeDays } from '@/lib/crm/format';
import type { AgentRunRecord } from '@/lib/crm/research';

/**
 * The provenance line and governance warnings shown above every agent output.
 *
 * Shared by all three review panels so a reviewer reads the same information
 * in the same place whichever agent produced the output: which agent and
 * prompt version, which model, how many sources, and — the part that matters —
 * what the governance layer had to correct on the way through.
 *
 * The warnings are deliberately prominent rather than tucked away. A run where
 * the model asserted things it could not source, or wrote a contact detail into
 * a sentence, is the run most worth reading sceptically.
 */
export function RunMeta({ run }: { run: AgentRunRecord<unknown> }) {
  return (
    <>
      <p className="mt-1 text-xs text-ink-500">
        {run.provider} · {run.model} · {run.agent}@{run.promptVersion} ·{' '}
        {relativeDays(run.ranAt)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ClaimBadge status={run.claimStatus} />
        <span className="text-xs text-ink-500">
          {run.sources.length} source{run.sources.length === 1 ? '' : 's'}
        </span>
      </div>

      {run.downgrades.length > 0 ? (
        <div className="mt-4 border border-safety-600/40 bg-safety-500/5 p-4">
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-900 uppercase">
            {run.downgrades.length} claim
            {run.downgrades.length === 1 ? ' was' : 's were'} asserted without a source
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-700">
            These were rewritten to &ldquo;not established&rdquo; before being stored. The
            value is kept so you can judge it — it is not presented as a finding.
          </p>
          <ul className="mt-2 space-y-0.5 text-xs text-ink-600">
            {run.downgrades.map((downgrade, index) => (
              <li key={`${downgrade.path}-${index}`}>
                <code className="text-ink-800">{downgrade.path}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {run.piiRemovals.length > 0 ? (
        <div className="mt-4 border border-danger-600/40 bg-danger-600/5 p-4">
          <p className="text-xs font-semibold tracking-[0.08em] text-danger-600 uppercase">
            {run.piiRemovals.length} contact detail
            {run.piiRemovals.length === 1 ? '' : 's'} removed
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-700">
            The model wrote something that reads as an email address or phone number
            into free text. It was removed before storage and is not recoverable from
            here. Treat the rest of this output with extra care, and do not try to
            reconstruct what was removed.
          </p>
          <ul className="mt-2 space-y-0.5 text-xs text-ink-600">
            {run.piiRemovals.map((removal, index) => (
              <li key={`${removal.path}-${index}`}>
                <code className="text-ink-800">{removal.path}</code> — {removal.kind}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
