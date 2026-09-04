import { applyScoreAction } from '@/app/admin/actions';
import { ClaimRow, ListValue } from './ResearchReview';
import { RunMeta } from './RunMeta';
import {
  COMPONENT_QUESTIONS,
  scoreOpportunity,
} from '@/lib/ai/agents/opportunity-matching';
import { PRIORITY_LABELS } from '@/lib/crm/types';
import type { ScoreRecord } from '@/lib/crm/research';

/**
 * The opportunity score, broken into the eight components that produced it.
 *
 * The breakdown is the product, not the total. A number on its own cannot be
 * argued with; a number with eight ratings, eight reasons and a note beside
 * each of which had evidence behind it can be checked, disagreed with, and
 * learned from.
 *
 * The total shown here is recomputed from the stored ratings on every render
 * rather than read from a stored field, so what appears cannot drift from the
 * ratings underneath it.
 */
export function ScoreReview({
  run,
  applied,
}: {
  run: ScoreRecord;
  /** The score currently written onto the account, if any. */
  applied: number | null;
}) {
  const scored = scoreOpportunity(run.output);
  const isApplied = applied !== null && applied === scored.total;

  return (
    <section aria-labelledby="score-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="score-heading" className="font-display text-lg font-semibold text-ink-900">
          Opportunity score
        </h2>
      </div>
      <RunMeta run={run} />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border border-paper-300 bg-paper-50 p-5">
        <p className="font-display text-4xl font-semibold tabular-nums text-ink-900">
          {scored.total}
          <span className="ml-1 text-lg font-normal text-ink-500">/100</span>
        </p>
        <p className="text-sm font-medium text-ink-900">
          Priority {PRIORITY_LABELS[scored.priority]}
        </p>
        {isApplied ? (
          <p className="text-xs text-success-600">Applied to this account.</p>
        ) : (
          <form action={applyScoreAction} className="ml-auto">
            <input type="hidden" name="companyId" value={run.companyId} />
            <button
              type="submit"
              className="rounded-card border border-ink-900/20 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-paper-100"
            >
              {applied === null ? 'Apply score to account' : 'Replace applied score'}
            </button>
          </form>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-700">{run.output.verdict}</p>

      {scored.unevidencedCount > 0 ? (
        <p className="mt-3 border-l-2 border-safety-500 py-2 pl-4 text-xs leading-relaxed text-ink-700">
          {scored.unevidencedCount} of 8 components were rated without citing anything
          from the research record. Those ratings are reasoning, not findings — read
          them before adopting the score.
        </p>
      ) : null}

      {/* The breakdown. */}
      <ul className="mt-5 divide-y divide-paper-200 border-y border-paper-200">
        {scored.components.map((component) => (
          <li key={component.component} className="py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm font-medium text-ink-900">{component.label}</span>
              <span className="text-xs tabular-nums text-ink-600">
                {component.rating}/10 · weight {component.weight} ·{' '}
                <span className="font-medium text-ink-800">
                  {component.contribution} pts
                </span>
              </span>
            </div>

            {/* A bar rather than a colour-coded badge: the reader is comparing
                eight ratings against each other, and length compares better
                than hue — and is legible without colour vision. */}
            <div
              className="mt-2 h-1.5 w-full bg-paper-200"
              role="img"
              aria-label={`${component.label}: ${component.rating} out of 10`}
            >
              <div
                className="h-full bg-safety-500"
                style={{ width: `${component.rating * 10}%` }}
              />
            </div>

            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              <span className="text-ink-500">{COMPONENT_QUESTIONS[component.component]}</span>{' '}
              {component.reasoning}
            </p>

            {component.unevidenced ? (
              <p className="mt-1.5 text-xs font-medium text-safety-600">
                Rated without citing evidence from the research record.
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <ClaimRow
          label="Matched services"
          claim={run.output.matchedServices}
          render={(value) => <ListValue value={value} />}
        />
        <ClaimRow label="Entry point" claim={run.output.entryPoint} />
        <ClaimRow label="Recommended next action" claim={run.output.recommendedNextAction} />
      </div>

      {run.output.keyRisks.length > 0 ? (
        <div className="mt-4 border border-paper-300 bg-paper-50 p-4">
          <h3 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
            Key risks
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            {run.output.keyRisks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        The model rated the eight components. The total and the priority band are
        computed from those ratings and fixed weights, not produced by the model — so
        the same ratings always give the same score. The bid decision remains yours.
      </p>
    </section>
  );
}
