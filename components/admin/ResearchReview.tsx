import type { ReactNode } from 'react';
import { ClaimBadge } from './ClaimBadge';
import type { Claim } from '@/lib/ai/claims';

/**
 * One researched field: the value, how it was arrived at, and what backs it.
 *
 * Sources are rendered as links so a claim can be checked in one click rather
 * than taken on trust.
 */
export function ClaimRow({
  label,
  claim,
  render,
}: {
  label: string;
  claim: Claim<unknown>;
  render?: (value: unknown) => ReactNode;
}) {
  const hasValue = claim.value !== null && claim.value !== undefined;

  return (
    <div className="border-t border-paper-200 py-3.5 first:border-t-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-medium tracking-[0.1em] text-ink-500 uppercase">
          {label}
        </span>
        <ClaimBadge status={claim.status} />
      </div>

      <div className="mt-1.5 text-sm text-ink-900">
        {hasValue ? (
          (render?.(claim.value) ?? String(claim.value))
        ) : (
          <span className="text-ink-500">Not established</span>
        )}
      </div>

      {claim.note ? (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{claim.note}</p>
      ) : null}

      {claim.sources.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {claim.sources.map((source, index) => (
            <li key={`${source.url}-${index}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-technical-700 underline-offset-4 hover:underline"
              >
                {source.title ?? new URL(source.url).hostname}
              </a>
            </li>
          ))}
        </ul>
      ) : claim.status === 'fact' ? (
        // Should be unreachable: the runner downgrades an unsourced fact before
        // it is stored. Rendered rather than hidden so a regression is visible.
        <p className="mt-2 text-xs font-semibold text-danger-600">
          Marked as fact with no source. This should not happen — report it.
        </p>
      ) : null}
    </div>
  );
}

export function ListValue({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-ink-500">None</span>;
  }
  return (
    <ul className="space-y-1">
      {value.map((entry, index) => (
        <li key={index}>
          {typeof entry === 'string' ? (
            entry
          ) : (
            <span>
              {(entry as { name?: string }).name ?? JSON.stringify(entry)}
              {(entry as { location?: string | null }).location
                ? ` — ${(entry as { location: string }).location}`
                : ''}
              {(entry as { scopeSummary?: string | null }).scopeSummary ? (
                <span className="block text-xs text-ink-600">
                  {(entry as { scopeSummary: string }).scopeSummary}
                </span>
              ) : null}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
