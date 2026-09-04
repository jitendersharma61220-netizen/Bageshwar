import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { AeoSection, DirectAnswer, FaqList, ProseList, StandardsList } from '@/components/aeo';
import { getInsight, insights } from '@/content/insights';
import { servicesBySlug } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, schemaGraph } from '@/lib/schema';

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) return {};
  return buildMetadata({
    title: insight.metaTitle,
    description: insight.metaDescription,
    path: `/insights/${insight.slug}`,
    type: 'article',
  });
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const crumbs: Crumb[] = [
    { href: '/insights', label: 'Insights' },
    { href: `/insights/${insight.slug}`, label: insight.title },
  ];
  const primaryService = servicesBySlug.get(insight.primaryService);

  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs), faqSchema(insight.faqs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader eyebrow="Insight" title={insight.title} />

      <Section tone="light">
        <div className="space-y-12">
          <DirectAnswer>{insight.directAnswer}</DirectAnswer>

          {insight.sections.map((section, index) => (
            <AeoSection key={section.heading} id={`section-${index}`} title={section.heading}>
              <div className="prose-technical">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-ink-700">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets ? (
                <div className="mt-5">
                  <ProseList items={section.bullets} />
                </div>
              ) : null}
            </AeoSection>
          ))}

          {insight.faqs.length > 0 ? (
            <AeoSection id="faq" title="Frequently asked questions">
              <FaqList faqs={insight.faqs} />
            </AeoSection>
          ) : null}

          <StandardsList standards={insight.standards} />

          {primaryService ? (
            <p className="border-t border-paper-200 pt-8 text-ink-600">
              Related service:{' '}
              <Link
                href={`/services/${primaryService.slug}`}
                className="font-medium text-technical-700 underline-offset-4 hover:underline"
              >
                {primaryService.name}
              </Link>
            </p>
          ) : null}
        </div>
      </Section>

      <ConversionBand />
    </>
  );
}
