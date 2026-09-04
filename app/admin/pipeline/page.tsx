import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import { AdminHeading } from '@/components/admin/AdminChrome';
import { StageMover } from '@/components/admin/StageMover';
import { BOARD_STAGES, CLOSED_STAGES, STAGE_LABELS, type Company } from '@/lib/crm/types';
import { formatValue, isOverdue, relativeDays } from '@/lib/crm/format';

export default async function PipelinePage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const repository = await getCrmRepository();
  if (!repository) redirect('/admin/login');

  const companies = await repository.listCompanies();
  const byStage = new Map(
    [...BOARD_STAGES, ...CLOSED_STAGES].map((stage) => [
      stage,
      companies.filter((c) => c.stage === stage),
    ]),
  );

  return (
    <>
      <AdminHeading
        title="Pipeline"
        description="Accounts by stage. Move an account with the control on its card; every move is recorded in that account's activity trail."
      />

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {BOARD_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? [];
            const value = items.reduce((sum, c) => sum + (c.opportunityValue ?? 0), 0);
            return (
              <section
                key={stage}
                aria-labelledby={`stage-${stage}`}
                className="flex w-72 shrink-0 flex-col"
              >
                <div className="flex items-baseline justify-between border-b-2 border-graphite-900 pb-2">
                  <h2
                    id={`stage-${stage}`}
                    className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase"
                  >
                    {STAGE_LABELS[stage]}
                  </h2>
                  <span className="tabular text-xs text-ink-500">{items.length}</span>
                </div>
                {value > 0 ? (
                  <p className="tabular mt-1.5 text-xs text-ink-500">{formatValue(value)}</p>
                ) : null}

                <ul className="mt-3 space-y-3">
                  {items.map((company) => (
                    <li key={company.id}>
                      <AccountCard company={company} />
                    </li>
                  ))}
                  {items.length === 0 ? (
                    <li className="border border-dashed border-paper-300 p-4 text-xs text-ink-500">
                      Empty
                    </li>
                  ) : null}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="closed-heading" className="mt-10">
        <h2
          id="closed-heading"
          className="text-xs font-semibold tracking-[0.1em] text-ink-900 uppercase"
        >
          Closed and holding
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CLOSED_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <div key={stage} className="border border-paper-300 bg-paper-50 p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-ink-900">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <span className="tabular text-xs text-ink-500">{items.length}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {items.map((company) => (
                    <li key={company.id}>
                      <Link
                        href={`/admin/accounts/${company.id}`}
                        className="text-sm text-technical-700 underline-offset-4 hover:underline"
                      >
                        {company.name}
                      </Link>
                    </li>
                  ))}
                  {items.length === 0 ? (
                    <li className="text-xs text-ink-500">None</li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function AccountCard({ company }: { company: Company }) {
  const overdue = isOverdue(company.nextActionDue);
  return (
    <article className="border border-paper-300 bg-paper-50 p-4">
      <Link
        href={`/admin/accounts/${company.id}`}
        className="font-medium text-ink-900 underline-offset-4 hover:text-technical-700 hover:underline"
      >
        {company.name}
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
        {company.priority ? (
          <span className="font-semibold text-safety-600 uppercase">
            {company.priority}
          </span>
        ) : null}
        {company.accountScore !== null ? (
          <span className="tabular">Score {company.accountScore}</span>
        ) : null}
        {company.opportunityValue !== null ? (
          <span className="tabular">{formatValue(company.opportunityValue)}</span>
        ) : null}
      </div>

      {company.nextAction ? (
        <p className="mt-2.5 text-sm leading-snug text-ink-700">{company.nextAction}</p>
      ) : null}

      {company.nextActionDue ? (
        <p
          className={
            overdue
              ? 'mt-1.5 text-xs font-semibold text-danger-600'
              : 'mt-1.5 text-xs text-ink-500'
          }
        >
          Due {relativeDays(company.nextActionDue)}
        </p>
      ) : null}

      <div className="mt-3 border-t border-paper-200 pt-3">
        <StageMover companyId={company.id} current={company.stage} />
      </div>
    </article>
  );
}
