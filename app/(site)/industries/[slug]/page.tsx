import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';
import { AeoSection, DirectAnswer, FaqList, ProseList } from '@/components/aeo';
import { getIndustry, industries } from '@/content/industries';
import { servicesBySlug } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, schemaGraph } from '@/lib/schema';

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return buildMetadata({
    title: industry.metaTitle,
    description: industry.metaDescription,
    path: `/industries/${industry.slug}`,
  });
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const crumbs: Crumb[] = [
    { href: '/industries', label: 'Industries' },
    { href: `/industries/${industry.slug}`, label: industry.name },
  ];

  const relevantServices = industry.services
    .map((s) => servicesBySlug.get(s))
    .filter((s) => s !== undefined);

  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs), faqSchema(industry.faqs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader eyebrow="Industry" title={industry.name} />

      <Section tone="light" width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 space-y-14 lg:col-span-8">
            <DirectAnswer>{industry.directAnswer}</DirectAnswer>

            <AeoSection
              id="context"
              title="What you are accountable for"
              intro="The constraints that shape this work in your sector, stated plainly."
            >
              <ProseList items={industry.buyerContext} />
            </AeoSection>

            <AeoSection id="requirements" title="What the work requires">
              <ProseList items={industry.requirements} />
            </AeoSection>

            <AeoSection
              id="considerations"
              title="Settle these before requesting rates"
              intro="Each of these changes the price or the programme materially, and each is cheaper to decide before award than after."
            >
              <ProseList items={industry.considerations} />
            </AeoSection>

            <AeoSection id="faq" title="Frequently asked questions">
              <FaqList faqs={industry.faqs} />
            </AeoSection>
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="border border-paper-300 p-5">
                <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                  Relevant services
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {relevantServices.map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-technical-700 underline-offset-4 hover:underline"
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted" labelledBy="industry-quote-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Start a conversation"
              title="Send us the project"
              standfirst="Tell us the package, the location and the constraints you are working within. We will come back with the questions that determine the rate and the programme."
              id="industry-quote-heading"
            />
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm kind="quote" />
          </div>
        </div>
      </Section>

      <ConversionBand />
    </>
  );
}
