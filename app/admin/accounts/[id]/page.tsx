import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import { AdminHeading } from '@/components/admin/AdminChrome';
import { StageMover } from '@/components/admin/StageMover';
import { addContactAction, addNoteAction, setNextActionAction } from '@/app/admin/actions';
import {
  DecisionMakerPanel,
  ResearchPanel,
  ScorePanel,
} from '@/components/admin/AgentPanel';
import { ClaimRow, ListValue } from '@/components/admin/ResearchReview';
import { RunMeta } from '@/components/admin/RunMeta';
import { ScoreReview } from '@/components/admin/ScoreReview';
import { DecisionMakerReview } from '@/components/admin/DecisionMakerReview';
import { getProvider } from '@/lib/ai/registry';
import { marketResearchAgent } from '@/lib/ai/agents/market-research';
import { opportunityMatchingAgent } from '@/lib/ai/agents/opportunity-matching';
import { decisionMakerAgent } from '@/lib/ai/agents/decision-maker';
import type {
  DecisionMakerRecord,
  ResearchRecord,
  ScoreRecord,
} from '@/lib/crm/research';
import {
  ACTIVITY_LABELS,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STAGE_LABELS,
  daysSince,
} from '@/lib/crm/types';
import { formatDate, formatValue, isOverdue, relativeDays } from '@/lib/crm/format';

const label = 'block text-sm font-medium text-ink-900';
const field =
  'mt-1.5 block w-full rounded-card border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-technical-600 focus:ring-1 focus:ring-technical-600 focus:outline-none';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const repository = await getCrmRepository();
  if (!repository) redirect('/admin/login');

  const { id } = await params;
  const company = await repository.getCompany(id);
  if (!company) notFound();

  const [contacts, activity, research, score, decisionMakers, provider] = await Promise.all([
    repository.listContacts(id),
    repository.listActivity(id),
    repository.latestRun<ResearchRecord['output']>(id, marketResearchAgent.name),
    repository.latestRun<ScoreRecord['output']>(id, opportunityMatchingAgent.name),
    repository.latestRun<DecisionMakerRecord['output']>(id, decisionMakerAgent.name),
    getProvider(),
  ]);

  const sinceContact = daysSince(company.lastContactedAt);
  const sinceResponse = daysSince(company.lastResponseAt);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-ink-600">
        <Link href="/admin/accounts" className="hover:text-ink-900 hover:underline">
          Accounts
        </Link>
        <span aria-hidden="true" className="mx-2 text-ink-500">
          /
        </span>
        <span aria-current="page" className="font-medium text-ink-800">
          {company.name}
        </span>
      </nav>

      <AdminHeading
        title={company.name}
        description={[
          CATEGORY_LABELS[company.category],
          company.hqLocation,
          company.website,
        ]
          .filter(Boolean)
          .join(' · ')}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section aria-labelledby="status-heading">
            <h2 id="status-heading" className="sr-only">
              Status
            </h2>
            <dl className="grid gap-px border border-paper-300 bg-paper-300 sm:grid-cols-4">
              <Detail term="Stage" value={STAGE_LABELS[company.stage]} />
              <Detail
                term="Priority"
                value={company.priority ? PRIORITY_LABELS[company.priority] : '—'}
              />
              <Detail
                term="Score"
                value={company.accountScore !== null ? String(company.accountScore) : '—'}
              />
              <Detail term="Value" value={formatValue(company.opportunityValue)} />
              <Detail
                term="Last contact"
                value={
                  sinceContact === null
                    ? 'Never'
                    : `${sinceContact} day${sinceContact === 1 ? '' : 's'} ago`
                }
              />
              <Detail
                term="Last response"
                value={
                  sinceResponse === null
                    ? 'None'
                    : `${sinceResponse} day${sinceResponse === 1 ? '' : 's'} ago`
                }
              />
              <Detail term="Created" value={formatDate(company.createdAt)} />
              <Detail term="Source" value={company.source ?? 'manual'} />
            </dl>

            {company.scoreRationale ? (
              // The rationale is the verdict followed by one line per scoring
              // component, so the line breaks carry the structure.
              <p className="mt-4 border-l-2 border-safety-500 bg-paper-50 py-3 pr-4 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
                {company.scoreRationale}
              </p>
            ) : null}

            {company.notes ? (
              <div className="mt-4 border border-paper-300 bg-paper-50 p-4">
                <h3 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
                  Notes
                </h3>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
                  {company.notes}
                </p>
              </div>
            ) : null}
          </section>

          {research ? (
            <section aria-labelledby="research-heading">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2
                  id="research-heading"
                  className="font-display text-lg font-semibold text-ink-900"
                >
                  Research
                </h2>
              </div>

              <RunMeta run={research} />

              <div className="mt-5 border border-paper-300 bg-paper-50 px-5 py-2">
                <ClaimRow label="Summary" claim={research.output.summary} />
                <ClaimRow label="Category" claim={research.output.category} />
                <ClaimRow label="Head office" claim={research.output.hqLocation} />
                <ClaimRow
                  label="Operating regions"
                  claim={research.output.operatingRegions}
                  render={(v) => <ListValue value={v} />}
                />
                <ClaimRow
                  label="Current projects"
                  claim={research.output.currentProjects}
                  render={(v) => <ListValue value={v} />}
                />
                <ClaimRow
                  label="Upcoming projects"
                  claim={research.output.upcomingProjects}
                  render={(v) => <ListValue value={v} />}
                />
                <ClaimRow
                  label="Relevant services"
                  claim={research.output.relevantServices}
                  render={(v) => <ListValue value={v} />}
                />
                <ClaimRow label="Opportunity" claim={research.output.opportunityType} />
                <ClaimRow
                  label="Existing vendors"
                  claim={research.output.existingVendorInfo}
                />
                <ClaimRow
                  label="Roles to approach"
                  claim={research.output.decisionMakerRoles}
                  render={(v) => <ListValue value={v} />}
                />
              </div>

              {research.output.openQuestions.length > 0 ? (
                <div className="mt-4 border border-paper-300 p-4">
                  <h3 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
                    Open questions
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
                    {research.output.openQuestions.map((q) => (
                      <li key={q} className="flex gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-safety-500"
                        />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p className="mt-4 text-xs leading-relaxed text-ink-500">
                Research is an input to your decision, not a substitute for it. Nothing
                here is written onto the account automatically.
              </p>
            </section>
          ) : null}

          {score ? <ScoreReview run={score} applied={company.accountScore} /> : null}

          {decisionMakers ? (
            <DecisionMakerReview
              run={decisionMakers}
              existingNames={contacts.map((contact) => contact.name)}
            />
          ) : null}

          <section aria-labelledby="contacts-heading">
            <h2
              id="contacts-heading"
              className="font-display text-lg font-semibold text-ink-900"
            >
              Recorded contacts
            </h2>

            {contacts.length > 0 ? (
              <ul className="mt-4 divide-y divide-paper-200 border-y border-paper-200">
                {contacts.map((contact) => (
                  <li key={contact.id} className="py-4">
                    <p className="font-medium text-ink-900">{contact.name}</p>
                    <p className="mt-0.5 text-sm text-ink-600">
                      {[contact.designation, contact.roleCategory].filter(Boolean).join(' · ') ||
                        'Role not recorded'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                      {contact.email ? <span>{contact.email}</span> : null}
                      {contact.phone ? <span>{contact.phone}</span> : null}
                      {contact.publicSourceUrl ? (
                        <a
                          href={contact.publicSourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-technical-700 underline-offset-4 hover:underline"
                        >
                          Source
                        </a>
                      ) : (
                        <span className="text-safety-600">No public source recorded</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border border-paper-300 bg-paper-50 p-5 text-sm text-ink-600">
                No decision makers recorded yet.
              </p>
            )}

            <details className="mt-4 border border-paper-300 bg-paper-50">
              <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-ink-900">
                Add a contact
              </summary>
              <form action={addContactAction} className="border-t border-paper-200 p-5">
                <input type="hidden" name="companyId" value={company.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className={label}>
                      Name <span className="text-danger-600">*</span>
                    </label>
                    <input id="contact-name" name="name" required className={field} />
                  </div>
                  <div>
                    <label htmlFor="contact-designation" className={label}>
                      Designation
                    </label>
                    <input
                      id="contact-designation"
                      name="designation"
                      placeholder="Procurement Head"
                      className={field}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={label}>
                      Email
                    </label>
                    <input id="contact-email" name="email" type="email" className={field} />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className={label}>
                      Phone
                    </label>
                    <input id="contact-phone" name="phone" type="tel" className={field} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-source" className={label}>
                      Public source
                    </label>
                    <input
                      id="contact-source"
                      name="publicSourceUrl"
                      type="url"
                      placeholder="https://"
                      className={field}
                    />
                    <p className="mt-1 text-xs text-ink-500">
                      Where this person was found. Required for anyone identified by
                      research rather than met directly — the database rejects a
                      researched contact without one.
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-5 rounded-card bg-safety-500 px-4 py-2 text-sm font-semibold text-graphite-950 hover:bg-safety-400"
                >
                  Add contact
                </button>
              </form>
            </details>
          </section>

          <section aria-labelledby="activity-heading">
            <h2
              id="activity-heading"
              className="font-display text-lg font-semibold text-ink-900"
            >
              Activity
            </h2>

            <form action={addNoteAction} className="mt-4 flex gap-2">
              <input type="hidden" name="companyId" value={company.id} />
              <label htmlFor="note" className="sr-only">
                Add a note
              </label>
              <input
                id="note"
                name="summary"
                required
                maxLength={500}
                placeholder="What happened?"
                className="flex-1 rounded-card border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 focus:border-technical-600 focus:ring-1 focus:ring-technical-600 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-card border border-ink-900/20 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-paper-100"
              >
                Add note
              </button>
            </form>

            {activity.length > 0 ? (
              <ol className="mt-5 space-y-0">
                {activity.map((entry) => (
                  <li
                    key={entry.id}
                    className="grid grid-cols-[7rem_1fr] gap-4 border-t border-paper-200 py-3.5 first:border-t-0"
                  >
                    <span className="text-xs text-ink-500">
                      {relativeDays(entry.occurredAt)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{entry.summary}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {ACTIVITY_LABELS[entry.kind]}
                      </p>
                      {entry.detail ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                          {entry.detail}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 border border-paper-300 bg-paper-50 p-5 text-sm text-ink-600">
                Nothing recorded yet.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <ResearchPanel
            companyId={company.id}
            hasRun={research !== null}
            providerConfigured={provider?.configured ?? false}
          />

          <ScorePanel
            companyId={company.id}
            hasRun={score !== null}
            disabled={research === null}
            disabledReason="Research this account first — scoring assesses the research record rather than searching for itself."
            providerConfigured={provider?.configured ?? false}
          />

          <DecisionMakerPanel
            companyId={company.id}
            hasRun={decisionMakers !== null}
            providerConfigured={provider?.configured ?? false}
          />

          <div className="border border-paper-300 bg-paper-50 p-5">
            <h2 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
              Stage
            </h2>
            <div className="mt-3">
              <StageMover companyId={company.id} current={company.stage} />
            </div>
          </div>

          <div className="border border-paper-300 bg-paper-50 p-5">
            <h2 className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase">
              Next action
            </h2>
            {company.nextAction ? (
              <p className="mt-2 text-sm text-ink-700">{company.nextAction}</p>
            ) : null}
            {company.nextActionDue ? (
              <p
                className={
                  isOverdue(company.nextActionDue)
                    ? 'mt-1 text-xs font-semibold text-danger-600'
                    : 'mt-1 text-xs text-ink-500'
                }
              >
                Due {relativeDays(company.nextActionDue)}
              </p>
            ) : null}

            <form action={setNextActionAction} className="mt-4 space-y-3">
              <input type="hidden" name="companyId" value={company.id} />
              <div>
                <label htmlFor="nextAction" className="sr-only">
                  Next action
                </label>
                <input
                  id="nextAction"
                  name="nextAction"
                  defaultValue={company.nextAction ?? ''}
                  placeholder="What happens next?"
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="nextActionDue" className="text-xs text-ink-500">
                  Due
                </label>
                <input
                  id="nextActionDue"
                  name="nextActionDue"
                  type="date"
                  defaultValue={company.nextActionDue ?? ''}
                  className={field}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-card border border-ink-900/20 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-paper-100"
              >
                Save
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div className="bg-paper-50 p-4">
      <dt className="text-xs font-medium tracking-[0.1em] text-ink-500 uppercase">
        {term}
      </dt>
      <dd className="mt-1.5 text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}
