import Link from 'next/link';
import { Section, SectionHeading } from '@/components/ui/Section';
import { services } from '@/content/services';

export function CapabilityGrid() {
  return (
    <Section tone="light" width="wide" labelledBy="capabilities-heading">
      <SectionHeading
        eyebrow="Capabilities"
        title="Nine execution capabilities under one scope"
        standfirst="Markings, studs, signage and safety assets are usually separate BOQ sections but the same specialist work on the same stretch. Taking them together removes repeated mobilisation and produces delineation that is consistent along the route."
        id="capabilities-heading"
      />

      <ul className="mt-12 grid gap-px border border-paper-300 bg-paper-300 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.slug} className="bg-paper-50">
            <Link
              href={`/services/${service.slug}`}
              className="group flex h-full flex-col p-6 transition-colors hover:bg-paper-100 focus-visible:bg-paper-100"
            >
              <h3 className="text-base font-semibold text-ink-900 group-hover:text-technical-700">
                {service.name}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-600">
                {service.directAnswer.split('. ')[0]}.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-safety-600 uppercase">
                Specifications &amp; process
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
