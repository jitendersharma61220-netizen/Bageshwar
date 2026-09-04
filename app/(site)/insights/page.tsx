import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { insights, readingMinutes } from '@/content/insights';
import { services, servicesBySlug } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/insights', label: 'Insights' }];

export const metadata: Metadata = buildMetadata({
  title: 'Insights & Knowledge Hub',
  description:
    'Specification, execution and procurement guidance on road marking, road studs, signage and highway safety works, written for the people who scope, price and inspect this work.',
  path: '/insights',
});

export default function InsightsPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Knowledge hub"
        title="Specifications, execution and procurement guidance"
        standfirst="Written for procurement managers, project managers and engineers scoping road safety works — the questions that determine whether a package is specified well and priced comparably."
      />

      <Section tone="light" width="wide">
        {insights.length > 0 ? (
          <>
            <ul className="grid gap-px bg-paper-300 lg:grid-cols-2">
              {insights.map((insight) => {
                const service = servicesBySlug.get(insight.primaryService);
                return (
                  <li key={insight.slug} className="bg-paper-50">
                    <Link
                      href={`/insights/${insight.slug}`}
                      className="group flex h-full flex-col p-7 transition-colors hover:bg-paper-100"
                    >
                      <p className="text-xs font-semibold tracking-[0.14em] text-safety-600 uppercase">
                        {service?.shortName ?? 'Guidance'}
                      </p>
                      <h2 className="mt-2.5 text-lg font-semibold text-ink-900 group-hover:text-technical-700">
                        {insight.title}
                      </h2>
                      <p className="mt-3 flex-1 leading-relaxed text-ink-600">
                        {insight.directAnswer}
                      </p>
                      <p className="tabular mt-4 border-t border-paper-200 pt-4 text-xs text-ink-500">
                        {insight.audience} &middot; {readingMinutes(insight)} min read
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-14 border-t border-paper-200 pt-10">
              <h2 className="text-sm font-semibold tracking-[0.14em] text-ink-900 uppercase">
                Browse by service
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-sm text-technical-700 underline-offset-4 hover:underline"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="max-w-3xl">
            <div className="rule-accent bg-paper-100 py-6 pr-6 pl-7">
              <h2 className="text-lg font-semibold text-ink-900">In preparation</h2>
              <p className="mt-3 leading-relaxed text-ink-600">
                We are writing this section rather than generating it. Each article
                answers one real specification, execution or procurement question in
                enough depth to be useful to someone actually scoping the work.
              </p>
            </div>
          </div>
        )}
      </Section>

      <ConversionBand />
    </>
  );
}
