import Link from 'next/link';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ProcessList } from '@/components/aeo';
import { company } from '@/content/company';

export function ProcessBand() {
  return (
    <Section tone="light" labelledBy="process-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Execution process"
            title="From site assessment to handover documentation"
            standfirst="The same six stages on every project, because the documentation produced along the way is what supports your billing and certification after the work is done."
            id="process-heading"
          />
          <Link
            href="/execution-process"
            className="mt-6 inline-block text-sm font-semibold text-technical-700 underline-offset-4 hover:underline"
          >
            Full execution process &rarr;
          </Link>
        </div>

        <div className="lg:col-span-7">
          <ProcessList steps={company.executionProcess} />
        </div>
      </div>
    </Section>
  );
}
