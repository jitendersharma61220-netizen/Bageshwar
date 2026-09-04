import { addCandidateContactAction } from '@/app/admin/actions';
import { ClaimRow } from './ResearchReview';
import { RunMeta } from './RunMeta';
import { ROLE_LABELS } from '@/lib/ai/agents/decision-maker';
import type { DecisionMakerRecord } from '@/lib/crm/research';

/**
 * Who to approach, as proposed by the Decision Maker Research Agent.
 *
 * Two things are deliberately absent from this screen, and their absence is
 * the feature:
 *
 *   - **No contact details.** The agent's schema has no email or phone field,
 *     so there is nothing to render. A candidate carries a name, a role, and
 *     the public page that says they hold it.
 *   - **No bulk import.** Each candidate is added individually by a person.
 *     Names arrive as proposals, and a proposal that nobody accepts leaves no
 *     trace on the account.
 *
 * The roles list is shown above the names on purpose. Where no individual can
 * be found, the role is the answer — the founder can telephone the office and
 * ask for the procurement head, and that works. Presenting roles as a fallback
 * shown only on failure would make "I found nobody" feel like a failure, which
 * is exactly the pressure that produces invented names.
 */
export function DecisionMakerReview({
  run,
  existingNames,
}: {
  run: DecisionMakerRecord;
  /** Contacts already on the account, so an added candidate is not offered twice. */
  existingNames: readonly string[];
}) {
  const known = new Set(existingNames.map((name) => name.trim().toLowerCase()));

  return (
    <section aria-labelledby="candidates-heading">
      <h2
        id="candidates-heading"
        className="font-display text-lg font-semibold text-ink-900"
      >
        Who to approach
      </h2>
      <RunMeta run={run} />

      {/* Roles first. */}
      <ul className="mt-5 divide-y divide-paper-200 border-y border-paper-200">
        {run.output.roles.map((role, index) => (
          <li key={`${role.role}-${index}`} className="py-4">
            <p className="text-sm font-medium text-ink-900">
              {ROLE_LABELS[role.role]}
              {role.likelyTitle ? (
                <span className="ml-2 font-normal text-ink-600">
                  — likely titled &ldquo;{role.likelyTitle}&rdquo;
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-600">{role.whyThisRole}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-700">
              <span className="font-medium text-ink-800">How to reach them:</span>{' '}
              {role.suggestedApproach}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <h3 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
          Named candidates
        </h3>

        {run.output.noIndividualsFound || run.output.individuals.length === 0 ? (
          <p className="mt-2 border border-paper-300 bg-paper-50 p-5 text-sm leading-relaxed text-ink-600">
            No individual could be found on a public page. That is a complete answer,
            not a failure — approach the roles above through the switchboard or the
            vendor registration route. A name nobody can source would be worse than
            none.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {run.output.individuals.map((person, index) => {
              const alreadyAdded = known.has(person.name.trim().toLowerCase());
              return (
                <li
                  key={`${person.name}-${index}`}
                  className="border border-paper-300 bg-paper-50 p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium text-ink-900">{person.name}</p>
                    <p className="text-xs tabular-nums text-ink-500">
                      confidence {Math.round(person.confidence * 100)}%
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-600">
                    {person.designation} · {ROLE_LABELS[person.role]}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-700">
                    {person.relevance}
                  </p>

                  {person.caveat ? (
                    <p className="mt-2 border-l-2 border-safety-500 py-1 pl-3 text-xs leading-relaxed text-ink-700">
                      {person.caveat}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a
                      href={person.publicSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-technical-700 underline-offset-4 hover:underline"
                    >
                      Source ({person.sourceType.replace(/_/g, ' ')})
                    </a>
                    {person.profileUrl ? (
                      <a
                        href={person.profileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-xs text-technical-700 underline-offset-4 hover:underline"
                      >
                        Profile
                      </a>
                    ) : null}

                    {alreadyAdded ? (
                      <span className="ml-auto text-xs text-success-600">
                        Added to contacts
                      </span>
                    ) : (
                      <form action={addCandidateContactAction} className="ml-auto">
                        <input type="hidden" name="companyId" value={run.companyId} />
                        <input type="hidden" name="candidateName" value={person.name} />
                        <button
                          type="submit"
                          className="rounded-card border border-ink-900/20 px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-paper-100"
                        >
                          Add to contacts
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-5">
        <ClaimRow
          label="Primary target role"
          claim={run.output.primaryTarget}
          render={(value) => ROLE_LABELS[value as keyof typeof ROLE_LABELS] ?? String(value)}
        />
        <ClaimRow label="Vendor onboarding route" claim={run.output.vendorOnboarding} />
      </div>

      {run.output.openQuestions.length > 0 ? (
        <div className="mt-4 border border-paper-300 bg-paper-50 p-4">
          <h3 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
            Check before using
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
            {run.output.openQuestions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        No email address or phone number appears here because the agent cannot produce
        one: its output schema has no field for either, and any that reached a
        sentence was removed before this was stored. Contact details are yours to
        obtain and record by hand.
      </p>
    </section>
  );
}
