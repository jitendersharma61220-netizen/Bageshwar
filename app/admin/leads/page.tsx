import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import { AdminHeading } from '@/components/admin/AdminChrome';
import { convertLeadAction } from '@/app/admin/actions';
import { relativeDays } from '@/lib/crm/format';

const KIND_LABELS = {
  general: 'Project enquiry',
  quote: 'Quote request',
  boq: 'BOQ / tender',
} as const;

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const repository = await getCrmRepository();
  if (!repository) redirect('/admin/login');

  const leads = await repository.listLeads();
  const unconverted = leads.filter((l) => l.companyId === null);
  const converted = leads.filter((l) => l.companyId !== null);

  return (
    <>
      <AdminHeading
        title="Website leads"
        description="Enquiries submitted through the website. Converting a lead creates an account and links the two, so the enquiry stays attached to the pipeline record it became."
      />

      <section aria-labelledby="unconverted-heading">
        <h2
          id="unconverted-heading"
          className="font-display text-lg font-semibold text-ink-900"
        >
          Not yet converted
          <span className="tabular ml-2 text-sm font-normal text-ink-500">
            {unconverted.length}
          </span>
        </h2>

        {unconverted.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {unconverted.map((lead) => (
              <li key={lead.id} className="border border-paper-300 bg-paper-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{lead.company}</p>
                    <p className="mt-0.5 text-sm text-ink-600">
                      {lead.name}
                      {lead.role ? ` · ${lead.role}` : ''} &middot;{' '}
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-technical-700 underline-offset-4 hover:underline"
                      >
                        {lead.email}
                      </a>{' '}
                      &middot;{' '}
                      <a
                        href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                        className="text-technical-700 underline-offset-4 hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-ink-500">
                      {relativeDays(lead.createdAt)}
                    </span>
                    <form action={convertLeadAction}>
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button
                        type="submit"
                        className="rounded-card bg-safety-500 px-4 py-2 text-sm font-semibold text-graphite-950 hover:bg-safety-400"
                      >
                        Convert to account
                      </button>
                    </form>
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-paper-200 pt-4 text-sm sm:grid-cols-3">
                  <Meta term="Type" value={KIND_LABELS[lead.kind]} />
                  <Meta term="Service" value={lead.serviceSlug ?? '—'} />
                  <Meta term="Project type" value={lead.industrySlug ?? '—'} />
                  <Meta term="Project" value={lead.projectName ?? '—'} />
                  <Meta term="Location" value={lead.location ?? '—'} />
                  <Meta term="Quantity" value={lead.quantity ?? '—'} />
                  <Meta term="Timeline" value={lead.timeline ?? '—'} />
                  <Meta term="Source page" value={lead.sourcePath ?? '—'} />
                  <Meta
                    term="Documents"
                    value={
                      lead.documentCount > 0
                        ? `${lead.documentCount} attached`
                        : 'None attached'
                    }
                  />
                </dl>

                <p className="mt-4 border-l-2 border-paper-300 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-700">
                  {lead.message}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border border-paper-300 bg-paper-50 p-5 text-sm text-ink-600">
            No unconverted enquiries. New submissions from the website appear here.
          </p>
        )}
      </section>

      {converted.length > 0 ? (
        <section aria-labelledby="converted-heading" className="mt-10">
          <h2
            id="converted-heading"
            className="font-display text-lg font-semibold text-ink-900"
          >
            Converted
            <span className="tabular ml-2 text-sm font-normal text-ink-500">
              {converted.length}
            </span>
          </h2>
          <ul className="mt-4 divide-y divide-paper-200 border-y border-paper-200">
            {converted.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">{lead.company}</p>
                  <p className="text-xs text-ink-500">
                    {lead.name} &middot; {KIND_LABELS[lead.kind]}
                  </p>
                </div>
                <Link
                  href={`/admin/accounts/${lead.companyId}`}
                  className="shrink-0 text-sm text-technical-700 underline-offset-4 hover:underline"
                >
                  View account
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{term}</dt>
      <dd className="mt-0.5 text-ink-800">{value}</dd>
    </div>
  );
}
