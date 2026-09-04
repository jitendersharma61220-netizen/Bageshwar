import { CLAIM_LABELS, type ClaimStatus } from '@/lib/ai/claims';
import { cn } from '@/lib/cn';

/**
 * How a claim was arrived at, shown beside the value.
 *
 * The founder should never have to wonder whether something on the screen is
 * established or inferred. An unknown is shown, not hidden: the value may
 * still be worth judging, and hiding it would quietly discard information.
 */
export function ClaimBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-card px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase',
        status === 'fact' && 'bg-success-600/10 text-success-600',
        status === 'inference' && 'bg-technical-600/10 text-technical-700',
        status === 'recommendation' && 'bg-safety-500/15 text-safety-600',
        status === 'unknown' && 'bg-ink-500/10 text-ink-600',
      )}
      title={
        status === 'fact'
          ? 'Directly supported by a named source.'
          : status === 'inference'
            ? 'Reasoned from evidence, not stated directly by it.'
            : status === 'recommendation'
              ? 'A suggested action or judgement.'
              : 'Not established. Treat as unverified.'
      }
    >
      {CLAIM_LABELS[status]}
    </span>
  );
}
