import Link from 'next/link';
import { Section, SectionHeading } from '@/components/ui/Section';
import { industries } from '@/content/industries';

export function IndustryStrip() {
  return (
    <Section tone="muted" width="wide" labelledBy="industries-heading">
      <SectionHeading
        eyebrow="Industries"
        title="Built around what each buyer is accountable for"
        standfirst="A highway package, an operational runway, a working warehouse yard and a live plant floor impose completely different constraints on the same technical work. These pages describe the constraint, not the brochure."
        id="industries-heading"
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <li key={industry.slug}>
            <Link
              href={`/industries/${industry.slug}`}
              className="group flex h-full flex-col border border-paper-300 bg-paper-50 p-6 transition-colors hover:border-ink-900/25"
            >
              <h3 className="text-base font-semibold text-ink-900 group-hover:text-technical-700">
                {industry.name}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-600">
                {industry.directAnswer.split('. ').slice(0, 2).join('. ')}.
              </p>
              <span className="mt-4 text-xs font-semibold tracking-wide text-safety-600 uppercase">
                View sector approach &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
