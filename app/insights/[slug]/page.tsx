import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import {
  AeoSection,
  DirectAnswer,
  FaqList,
  ProseList,
  SpecificationTable,
  StandardsList,
} from '@/components/aeo';
import { getInsight, getRelated, insights, readingMinutes } from '@/content/insights';
import { servicesBySlug } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  schemaGraph,
} from '@/lib/schema';

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

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

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
  const related = getRelated(insight);
  const minutes = readingMinutes(insight);

  // Section ids are derived from the heading so the on-page nav, the anchors
  // and the headings themselves cannot drift apart.
  const sectionId = (heading: string) =>
    heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

  return (
    <>
      <JsonLd
        json={schemaGraph(
          articleSchema(insight),
          breadcrumbSchema(crumbs),
          faqSchema(insight.faqs),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader eyebrow="Insight" title={insight.title} standfirst={insight.audience} />

      <Section tone="light" width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <article className="min-w-0 space-y-12 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-paper-200 pb-5 text-xs text-ink-500">
              <span className="tabular">
                Updated{' '}
                <time dateTime={insight.updatedAt}>
                  {dateFormat.format(new Date(insight.updatedAt))}
                </time>
              </span>
              <span aria-hidden="true">&middot;</span>
              <span className="tabular">{minutes} min read</span>
              {primaryService ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <Link
                    href={`/services/${primaryService.slug}`}
                    className="text-technical-700 underline-offset-4 hover:underline"
                  >
                    {primaryService.shortName}
                  </Link>
                </>
              ) : null}
            </div>

            <DirectAnswer>{insight.directAnswer}</DirectAnswer>

            {insight.sections.map((section) => (
              <AeoSection
                key={section.heading}
                id={sectionId(section.heading)}
                title={section.heading}
              >
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

                {section.rows ? (
                  <div className="mt-5">
                    <SpecificationTable
                      rows={section.rows.map((row) => ({
                        parameter: row.term,
                        value: row.detail,
                      }))}
                      caption={section.heading}
                      columns={{ parameter: 'Item', value: 'Detail' }}
                    />
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
          </article>

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
                  {insight.sections.map((section) => (
                    <li key={section.heading}>
                      <a
                        href={`#${sectionId(section.heading)}`}
                        className="text-ink-600 underline-offset-4 hover:text-technical-700 hover:underline"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                  {insight.faqs.length > 0 ? (
                    <li>
                      <a
                        href="#faq"
                        className="text-ink-600 underline-offset-4 hover:text-technical-700 hover:underline"
                      >
                        FAQ
                      </a>
                    </li>
                  ) : null}
                </ul>
              </nav>

              {primaryService ? (
                <div className="border border-paper-300 p-5">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                    Related service
                  </h2>
                  <p className="mt-3 text-sm">
                    <Link
                      href={`/services/${primaryService.slug}`}
                      className="font-medium text-technical-700 underline-offset-4 hover:underline"
                    >
                      {primaryService.name}
                    </Link>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {primaryService.directAnswer.split('. ')[0]}.
                  </p>
                </div>
              ) : null}

              {related.length > 0 ? (
                <div className="border border-paper-300 p-5">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-ink-900 uppercase">
                    Read next
                  </h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/insights/${item.slug}`}
                          className="text-technical-700 underline-offset-4 hover:underline"
                        >
                          {item.title}
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

      <Section tone="muted" labelledBy="insight-cta-heading">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Have a package to price?"
              title="Send us the scope and we will tell you what is missing from it"
              standfirst="If your specification is still being written, we will tell you which parameters will change the rate and which will not — before you go out to tender."
              id="insight-cta-heading"
            />
          </div>
          <div className="flex flex-wrap items-start gap-3 lg:col-span-6 lg:justify-end">
            <Link
              href="/request-quote"
              className="inline-flex items-center rounded-card bg-safety-500 px-5 py-3 text-sm font-semibold text-graphite-950 hover:bg-safety-400"
            >
              Request a Quote
            </Link>
            <Link
              href="/upload-boq"
              className="inline-flex items-center rounded-card border border-ink-900/20 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-paper-100"
            >
              Submit BOQ / Tender
            </Link>
          </div>
        </div>
      </Section>

      <ConversionBand />
    </>
  );
}
