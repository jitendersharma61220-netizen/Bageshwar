import type { Metadata } from 'next';
import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { AnswerBand } from '@/components/sections/AnswerBand';
import { CapabilityGrid } from '@/components/sections/CapabilityGrid';
import { IndustryStrip } from '@/components/sections/IndustryStrip';
import { ProofBand } from '@/components/sections/ProofBand';
import { ProcessBand } from '@/components/sections/ProcessBand';
import { QualityBand } from '@/components/sections/QualityBand';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { Section, SectionHeading } from '@/components/ui/Section';
import { buildMetadata } from '@/lib/seo';
import { company } from '@/content/company';
import { insights } from '@/content/insights';

export const metadata: Metadata = buildMetadata({
  title: `${company.legalName} | ${company.positioning}`,
  description: company.description,
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <AnswerBand />
      <CapabilityGrid />
      <IndustryStrip />
      <ProofBand />
      <ProcessBand />
      <QualityBand />
      {insights.length > 0 ? <InsightsTeaser /> : null}
      <ConversionBand />
    </>
  );
}

function InsightsTeaser() {
  return (
    <Section tone="light" labelledBy="insights-heading">
      <SectionHeading
        eyebrow="Knowledge hub"
        title="Specifications, execution and procurement guidance"
        standfirst="Written for the people who scope, price and inspect this work."
        id="insights-heading"
      />
      <ul className="mt-10 grid gap-5 sm:grid-cols-3">
        {insights.slice(0, 3).map((insight) => (
          <li key={insight.slug}>
            <Link
              href={`/insights/${insight.slug}`}
              className="group flex h-full flex-col border border-paper-300 p-6 hover:border-ink-900/25"
            >
              <h3 className="text-base font-semibold text-ink-900 group-hover:text-technical-700">
                {insight.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
                {insight.directAnswer}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
