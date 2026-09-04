import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import { AdminHeading, StatCard } from '@/components/admin/AdminChrome';
import { STAGE_LABELS } from '@/lib/crm/types';
import { formatValue, isOverdue, relativeDays } from '@/lib/crm/format';

export default async function CommandCenterPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const repository = await getCrmRepository();
  if (!repository) redirect('/admin/login');

  const [summary, companies, leads] = await Promise.all([
    repository.summary(),
    repository.listCompanies(),
    repository.listLeads(),
  ]);

  const dueNow = companies
    .filter((c) => c.nextActionDue !== null && c.nextActionDue <= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.nextActionDue ?? '').localeCompare(b.nextActionDue ?? ''));

  const priorityAccounts = companies
    .filter((c) => c.priority === 'a')
    .sort((a, b) => (b.accountScore ?? 0) - (a.accountScore ?? 0));

  const newLeads = leads.filter((l) => l.companyId === null);

  return (
    <>
      <AdminHeading
        title="Command Center"
        description="What needs attention today, and where the pipeline stands."
        actions={
          <Link
            href="/admin/accounts?new=1"
            className="rounded-card bg-safety-500 px-4 py-2 text-sm font-semibold text-graphite-950 hover:bg-safety-400"
          >
            Add an account
          </Link>
        }
      />

      <section aria-labelledby="cards-heading">
        <h2 id="cards-heading" className="sr-only">
          Summary
        </h2>
        <div className="grid gap-px bg-paper-300 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Actions due"
            value={summary.actionsDue}
            hint={summary.actionsOverdue > 0 ? `${summary.actionsOverdue} overdue` : 'Nothing overdue'}
            tone={summary.actionsOverdue > 0 ? 'alert' : 'default'}
            href="/admin/accounts"
          />
          <StatCard
            label="New leads"
            value={summary.unconvertedLeads}
            hint="From the website, not yet converted"
            href="/admin/leads"
          />
          <StatCard
            label="Open RFQs"
            value={summary.openRfqs}
            hint="At RFQ or quotation"
            href="/admin/pipeline"
          />
          <StatCard
            label="Pipeline value"
            value={formatValue(summary.pipelineValue)}
            hint="Open stages only, where known"
          />
          <StatCard label="Accounts" value={summary.totalAccounts} href="/admin/accounts" />
          <StatCard label="Priority A" value={summary.priorityA} hint="Act now" />
          <StatCard label="Decision makers" value={summary.decisionMakers} />
          <StatCard label="Won" value={summary.won} tone={summary.won > 0 ? 'good' : 'default'} />
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="today-heading">
          <h2 id="today-heading" className="font-display text-lg font-semibold text-ink-900">
            Today&rsquo;s actions
          </h2>
          {dueNow.length > 0 ? (
            <ul className="mt-4 divide-y divide-paper-200 border-y border-paper-200">
              {dueNow.map((company) => (
                <li key={company.id} className="py-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/accounts/${company.id}`}
                        className="font-medium text-ink-900 underline-offset-4 hover:text-technical-700 hover:underline"
                      >
                        {company.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-600">
                        {company.nextAction ?? 'No action recorded'}
                      </p>
                    </div>
                    <span
                      className={
                        isOverdue(company.nextActionDue)
                          ? 'shrink-0 text-xs font-semibold text-danger-600'
                          : 'shrink-0 text-xs text-ink-500'
                      }
                    >
                      {relativeDays(company.nextActionDue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-paper-300 bg-paper-50 p-5 text-sm text-ink-600">
              Nothing is due. Set a next action on an account to have it appear here.
            </p>
          )}
        </section>

        <section aria-labelledby="leads-heading">
          <h2 id="leads-heading" className="font-display text-lg font-semibold text-ink-900">
            New website enquiries
          </h2>
          {newLeads.length > 0 ? (
            <ul className="mt-4 divide-y divide-paper-200 border-y border-paper-200">
              {newLeads.slice(0, 6).map((lead) => (
                <li key={lead.id} className="py-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href="/admin/leads"
                        className="font-medium text-ink-900 underline-offset-4 hover:text-technical-700 hover:underline"
                      >
                        {lead.company}
                      </Link>
                      <p className="mt-1 text-sm text-ink-600">
                        {lead.name} &middot; {lead.kind}
                        {lead.documentCount > 0
                          ? ` · ${lead.documentCount} document${lead.documentCount === 1 ? '' : 's'}`
                          : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-500">
                      {relativeDays(lead.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-paper-300 bg-paper-50 p-5 text-sm text-ink-600">
              No unconverted enquiries.
            </p>
          )}
        </section>

        <section aria-labelledby="priority-heading" className="lg:col-span-2">
          <h2 id="priority-heading" className="font-display text-lg font-semibold text-ink-900">
            High-priority accounts
          </h2>
          {priorityAccounts.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {priorityAccounts.map((company) => (
                <li key={company.id} className="border border-paper-300 bg-paper-50 p-5">
                  <Link
                    href={`/admin/accounts/${company.id}`}
                    className="font-medium text-ink-900 underline-offset-4 hover:text-technical-700 hover:underline"
                  >
                    {company.name}
                  </Link>
                  <p className="mt-1.5 text-xs tracking-wide text-safety-600 uppercase">
                    {STAGE_LABELS[company.stage]}
                    {company.accountScore !== null ? ` · score ${company.accountScore}` : ''}
                  </p>
                  {company.scoreRationale ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">
                      {company.scoreRationale}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 border border-paper-300 bg-paper-50 p-5 text-sm text-ink-600">
              No accounts marked priority A yet.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
