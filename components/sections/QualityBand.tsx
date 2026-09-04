import Link from 'next/link';
import { Section, SectionHeading } from '@/components/ui/Section';
import { company } from '@/content/company';

export function QualityBand() {
  return (
    <Section tone="muted" labelledBy="quality-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Quality &amp; compliance"
            title="Quality control that produces a record, not a claim"
            standfirst="Marking either meets its specified thickness and retroreflectivity or it does not, and the difference is measurable. These are the checks we run and record as the work proceeds."
            id="quality-heading"
          />
          <Link
            href="/quality-compliance"
            className="mt-6 inline-block text-sm font-semibold text-technical-700 underline-offset-4 hover:underline"
          >
            Quality &amp; compliance approach &rarr;
          </Link>
        </div>

        <div className="lg:col-span-7">
          <ul className="grid gap-px border border-paper-300 bg-paper-300 sm:grid-cols-2">
            {company.qualityProcess.map((item) => (
              <li key={item.title} className="bg-paper-50 p-5">
                <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
