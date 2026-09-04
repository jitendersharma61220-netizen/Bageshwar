import { Section, SectionHeading } from '@/components/ui/Section';
import { company } from '@/content/company';

/** Sectors the company works in, as stated in the corporate profile. */
export function SectorsBand() {
  return (
    <Section tone="muted" labelledBy="sectors-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="Sectors"
            title="Public infrastructure and private development"
            id="sectors-heading"
          />
        </div>
        <div className="lg:col-span-8">
          <ul className="grid gap-px border border-paper-300 bg-paper-300 sm:grid-cols-2">
            {company.sectorsServed.map((sector) => (
              <li key={sector.title} className="bg-paper-50 p-6">
                <h3 className="text-base font-semibold text-ink-900">{sector.title}</h3>
                <p className="mt-2.5 leading-relaxed text-ink-600">{sector.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
