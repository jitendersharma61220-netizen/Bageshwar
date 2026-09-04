import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { services } from '@/content/services';
import { industriesBySlug } from '@/content/industries';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/services', label: 'Services' }];

export const metadata: Metadata = buildMetadata({
  title: 'Road Marking & Highway Safety Services',
  description:
    'Thermoplastic road markings, highway and expressway markings, runway and taxiway markings, road studs, traffic signboards and highway safety assets, executed as one specialist scope.',
  path: '/services',
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Services"
        title="Road safety and marking execution"
        standfirst="Nine capabilities that usually appear as separate BOQ sections but are the same specialist work on the same stretch. Each page below sets out what is commonly specified, how the work is executed, what we check, and what actually moves the rate."
      />

      <Section tone="light" width="wide">
        <ul className="space-y-px bg-paper-300">
          {services.map((service) => (
            <li key={service.slug} className="bg-paper-50">
              <Link
                href={`/services/${service.slug}`}
                className="group grid gap-4 p-6 transition-colors hover:bg-paper-100 sm:grid-cols-12 sm:gap-8 sm:p-8"
              >
                <div className="sm:col-span-4">
                  <h2 className="text-lg font-semibold text-ink-900 group-hover:text-technical-700">
                    {service.name}
                  </h2>
                  <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-ink-500">
                    {service.industries.map((slug) => (
                      <span key={slug}>{industriesBySlug.get(slug)?.name}</span>
                    ))}
                  </p>
                </div>
                <div className="sm:col-span-8">
                  <p className="leading-relaxed text-ink-600">{service.directAnswer}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-safety-600 uppercase">
                    Specifications, process &amp; cost factors
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <ConversionBand />
    </>
  );
}
