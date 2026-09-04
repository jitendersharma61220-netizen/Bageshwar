import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import { AdminHeading } from '@/components/admin/AdminChrome';
import { NewAccountForm } from '@/components/admin/NewAccountForm';
import { CATEGORY_LABELS, STAGE_LABELS } from '@/lib/crm/types';
import { formatValue, isOverdue, relativeDays } from '@/lib/crm/format';

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const repository = await getCrmRepository();
  if (!repository) redirect('/admin/login');

  const params = await searchParams;
  const showForm = params.new === '1';
  const search = params.q?.trim() || undefined;
  const companies = await repository.listCompanies(search ? { search } : undefined);

  return (
    <>
      <AdminHeading
        title="Accounts"
        description="Every target account, most recently updated first."
        actions={
          showForm ? (
            <Link
              href="/admin/accounts"
              className="rounded-card border border-ink-900/20 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-paper-100"
            >
              Cancel
            </Link>
          ) : (
            <Link
              href="/admin/accounts?new=1"
              className="rounded-card bg-safety-500 px-4 py-2 text-sm font-semibold text-graphite-950 hover:bg-safety-400"
            >
              Add an account
            </Link>
          )
        }
      />

      {showForm ? (
        <section aria-labelledby="new-account" className="mb-10">
          <h2 id="new-account" className="sr-only">
            Add an account
          </h2>
          <NewAccountForm />
        </section>
      ) : null}

      <form method="get" className="mb-6 flex max-w-md gap-2">
        <label htmlFor="q" className="sr-only">
          Search accounts
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={search ?? ''}
          placeholder="Search by company name"
          className="flex-1 rounded-card border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 focus:border-technical-600 focus:ring-1 focus:ring-technical-600 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-card border border-ink-900/20 px-4 py-2 text-sm font-medium text-ink-900 hover:bg-paper-100"
        >
          Search
        </button>
      </form>

      {companies.length > 0 ? (
        <div className="overflow-x-auto border border-paper-300">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">Accounts</caption>
            <thead>
              <tr className="bg-graphite-900 text-left text-paper-50">
                <th scope="col" className="px-4 py-3 font-semibold">Account</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stage</th>
                <th scope="col" className="px-4 py-3 font-semibold">Next action</th>
                <th scope="col" className="px-4 py-3 font-semibold">Due</th>
                <th scope="col" className="px-4 py-3 font-semibold">Last contact</th>
                <th scope="col" className="px-4 py-3 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => (
                <tr
                  key={company.id}
                  className={
                    index % 2 === 1
                      ? 'border-t border-paper-200 bg-paper-100/60 align-top'
                      : 'border-t border-paper-200 align-top'
                  }
                >
                  <th scope="row" className="px-4 py-3 text-left font-medium">
                    <Link
                      href={`/admin/accounts/${company.id}`}
                      className="text-ink-900 underline-offset-4 hover:text-technical-700 hover:underline"
                    >
                      {company.name}
                    </Link>
                    <span className="mt-0.5 block text-xs font-normal text-ink-500">
                      {CATEGORY_LABELS[company.category]}
                      {company.hqLocation ? ` · ${company.hqLocation}` : ''}
                    </span>
                  </th>
                  <td className="px-4 py-3 text-ink-700">{STAGE_LABELS[company.stage]}</td>
                  <td className="px-4 py-3 text-ink-700">{company.nextAction ?? '—'}</td>
                  <td
                    className={
                      isOverdue(company.nextActionDue)
                        ? 'px-4 py-3 font-semibold text-danger-600'
                        : 'px-4 py-3 text-ink-600'
                    }
                  >
                    {company.nextActionDue ? relativeDays(company.nextActionDue) : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {company.lastContactedAt ? relativeDays(company.lastContactedAt) : '—'}
                  </td>
                  <td className="tabular px-4 py-3 text-ink-700">
                    {formatValue(company.opportunityValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border border-paper-300 bg-paper-50 p-6 text-sm text-ink-600">
          {search
            ? `No accounts match “${search}”.`
            : 'No accounts yet. Add one, or convert a website enquiry from the leads view.'}
        </p>
      )}
    </>
  );
}
