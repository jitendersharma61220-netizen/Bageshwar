import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { industries } from '@/content/industries';
import { servicesBySlug } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/industries', label: 'Industries' }];

export const metadata: Metadata = buildMetadata({
  title: 'Industries We Serve',
  description:
    'Road marking and safety execution for highways and expressways, airports, logistics parks, industrial facilities and urban and smart-city infrastructure projects.',
  path: '/industries',
});

export default function IndustriesPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Industries"
        title="The same technical work, five very different constraints"
        standfirst="A highway package, an operational runway, a working warehouse yard and a live plant floor each impose their own limits on how marking work can be executed. These pages describe those constraints from the buyer's side."
      />

      <Section tone="light" width="wide">
        <ul className="grid gap-px bg-paper-300 lg:grid-cols-2">
          {industries.map((industry) => (
            <li key={industry.slug} className="bg-paper-50">
              <Link
                href={`/industries/${industry.slug}`}
                className="group flex h-full flex-col p-7 transition-colors hover:bg-paper-100"
              >
                <h2 className="text-lg font-semibold text-ink-900 group-hover:text-technical-700">
                  {industry.name}
                </h2>
                <p className="mt-3 flex-1 leading-relaxed text-ink-600">
                  {industry.directAnswer}
                </p>
                <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-paper-200 pt-4 text-xs text-ink-500">
                  {industry.services.map((slug) => (
                    <span key={slug}>{servicesBySlug.get(slug)?.shortName}</span>
                  ))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <ConversionBand />
    </>
  );
}
