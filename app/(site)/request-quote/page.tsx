import type { Metadata } from 'next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/request-quote', label: 'Request a Quote' }];

export const metadata: Metadata = buildMetadata({
  title: 'Request a Quote',
  description:
    'Request a rate for road marking, road studs, traffic signage or highway safety assets. Send the specification, quantity and working window and we will respond with a quotation.',
  path: '/request-quote',
});

const whatWeNeed = [
  {
    title: 'Specification',
    detail:
      'Material, applied thickness, glass bead specification and any retroreflectivity requirement. Thickness and bead specification are the two things that make two quotes comparable or not.',
  },
  {
    title: 'Quantity and distribution',
    detail:
      'Total quantity and how it is spread — one continuous stretch prices very differently from the same area across fifty scattered locations.',
  },
  {
    title: 'Working window',
    detail:
      'Whether work is by day, at night, under lane closure or under full closure, and how many hours are actually available per shift. This usually affects the programme more than the quantity does.',
  },
  {
    title: 'Traffic management responsibility',
    detail:
      'Whether cones, signage, flagmen and attenuator vehicles sit with us or with the main contractor. Left unstated, this is the most common source of post-award variation.',
  },
  {
    title: 'Testing and documentation',
    detail:
      'Any third-party testing, reporting frequency or documentation package the contract requires, since these carry real cost and lead time.',
  },
  {
    title: 'Programme',
    detail:
      'Required start and completion dates, and how the marking scope sequences behind surfacing.',
  },
];

export default function RequestQuotePage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Request a quote"
        title="Get a rate for your package"
        standfirst="Send the specification, the quantity and the working window and we will come back with a quotation. If something is not yet settled, say so — we will tell you what it changes."
      />

      <Section tone="light" width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <EnquiryForm kind="quote" />
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-paper-300 bg-paper-100/60 p-6">
              <h2 className="text-base font-semibold text-ink-900">
                What makes a quote comparable
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                A rate per square metre means nothing on its own. These are the
                variables behind it, and stating them up front is what lets you
                compare quotes rather than guess at them.
              </p>
              <dl className="mt-5 space-y-4">
                {whatWeNeed.map((item) => (
                  <div key={item.title}>
                    <dt className="text-sm font-semibold text-ink-900">{item.title}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink-600">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
