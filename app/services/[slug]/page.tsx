import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';
import {
  AeoSection,
  BulletList,
  CostFactorList,
  DirectAnswer,
  FaqList,
  MistakeList,
  ProcessList,
  ProseList,
  SpecificationTable,
  StandardsList,
} from '@/components/aeo';
import { getService, services, servicesBySlug } from '@/content/services';
import { industriesBySlug } from '@/content/industries';
import { insightsForService } from '@/content/insights';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, schemaGraph, serviceSchema } from '@/lib/schema';

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const crumbs: Crumb[] = [
    { href: '/services', label: 'Services' },
    { href: `/services/${service.slug}`, label: service.name },
  ];

  const relatedIndustries = service.industries
    .map((s) => industriesBySlug.get(s))
    .filter((i) => i !== undefined);

  const relatedServices = service.relatedServices
    .map((s) => servicesBySlug.get(s))
    .filter((s) => s !== undefined);

  const supportingInsights = insightsForService(service.slug);

  return (
    <>
      {/* FAQPage schema is built from the same array FaqList renders below, so
          it can never describe a question a visitor cannot see. */}
      <JsonLd
        json={schemaGraph(
          serviceSchema(service),
          breadcrumbSchema(crumbs),
          faqSchema(service.faqs),
        )}
      />

      <Breadcrumbs crumbs={crumbs} />
      <PageHeader eyebrow="Service" title={service.name} standfirst={service.summary} />

      <Section tone="light" width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 space-y-14 lg:col-span-8">
            <DirectAnswer>{service.directAnswer}</DirectAnswer>

            <AeoSection
              id="specifications"
              title="Key specifications"
              intro="What is commonly specified for this work. The governing specification on any project is the one stated in its contract."
            >
              <SpecificationTable rows={service.specifications} />
            </AeoSection>

            <AeoSection id="applications" title="Applications">
              <BulletList items={service.applications} />
            </AeoSection>

            <AeoSection id="execution" title="Execution process">
              <ProcessList steps={service.executionProcess} />
            </AeoSection>

            <AeoSection
              id="quality"
              title="Quality checks"
              intro="What we check and record as the work proceeds, so the result is measurable rather than asserted."
            >
              <ProseList items={service.qualityChecks} />
            </AeoSection>

            <AeoSection
              id="cost"
              title="Cost factors"
              intro="What moves the rate. We do not publish prices, because a rate without a specification, a working window and a traffic management scope is not comparable to anything."
            >
              <CostFactorList factors={service.costFactors} />
            </AeoSection>

            <AeoSection id="considerations" title="Project considerations">
              <ProseList items={service.projectConsiderations} />
            </AeoSection>

            <AeoSection id="mistakes" title="Common mistakes">
              <MistakeList mistakes={service.commonMistakes} />
            </AeoSection>

            <AeoSection id="faq" title="Frequently asked questions">
              <FaqList faqs={service.faqs} />
            </AeoSection>

            <StandardsList standards={service.standards} />
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 lg:space-y-8">
              <nav
                aria-label="On this page"
                className="hidden border border-paper-300 bg-paper-100/60 p-5 lg:block"
              >
                <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                  On this page
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    ['specifications', 'Key specifications'],
                    ['applications', 'Applications'],
                    ['execution', 'Execution process'],
                    ['quality', 'Quality checks'],
                    ['cost', 'Cost factors'],
                    ['considerations', 'Project considerations'],
                    ['mistakes', 'Common mistakes'],
                    ['faq', 'FAQ'],
                  ].map(([id, label]) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="text-ink-600 underline-offset-4 hover:text-technical-700 hover:underline"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {relatedIndustries.length > 0 ? (
                <div className="border border-paper-300 p-5">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                    Applied in
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {relatedIndustries.map((industry) => (
                      <li key={industry.slug}>
                        <Link
                          href={`/industries/${industry.slug}`}
                          className="text-technical-700 underline-offset-4 hover:underline"
                        >
                          {industry.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {supportingInsights.length > 0 ? (
                <div className="border border-paper-300 p-5">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                    Guidance on this work
                  </h2>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {supportingInsights.map((insight) => (
                      <li key={insight.slug}>
                        <Link
                          href={`/insights/${insight.slug}`}
                          className="text-technical-700 underline-offset-4 hover:underline"
                        >
                          {insight.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {relatedServices.length > 0 ? (
                <div className="border border-paper-300 p-5">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                    Related services
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {relatedServices.map((related) => (
                      <li key={related.slug}>
                        <Link
                          href={`/services/${related.slug}`}
                          className="text-technical-700 underline-offset-4 hover:underline"
                        >
                          {related.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted" width="default" id="quote" labelledBy="service-quote-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Request a quote"
              title={`Get a rate for ${service.shortName.toLowerCase()}`}
              standfirst="Tell us the specification, the quantity and the working window available. Those three determine the rate more than anything else, and we will ask about them anyway."
              id="service-quote-heading"
            />
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm kind="quote" defaultServiceSlug={service.slug} />
          </div>
        </div>
      </Section>

      <ConversionBand />
    </>
  );
}
