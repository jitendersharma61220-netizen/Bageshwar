import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { company } from '@/content/company';
import { services } from '@/content/services';

/**
 * Homepage hero.
 *
 * No photograph is used because none has been supplied, and a stock image
 * would misrepresent the work. The treatment is typographic with a technical
 * grid, which reads as deliberate rather than as a missing asset. When real
 * project photography is available it belongs here.
 */
export function Hero() {
  return (
    <section className="band-dark relative overflow-hidden bg-graphite-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-safety-500/40"
      />

      <Container width="wide" className="relative">
        <div className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-10 lg:py-28">
          <div className="lg:col-span-7">
            <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-safety-400 uppercase">
              {company.legalName}
            </p>
            <h1 className="text-[2.1rem] leading-[1.1] font-semibold text-paper-50 sm:text-5xl lg:text-[3.4rem]">
              {company.positioning}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-graphite-300 sm:text-lg">
              {company.capabilityStatement}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/contact">Discuss a Project</ButtonLink>
              <ButtonLink href="/request-quote" variant="onDark">
                Request a Quote
              </ButtonLink>
              <ButtonLink href="/upload-boq" variant="onDark">
                Upload BOQ / Tender
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-5 lg:pl-8">
            <div className="border-t border-graphite-700 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <h2 className="text-xs font-semibold tracking-[0.14em] text-graphite-400 uppercase">
                Execution scope
              </h2>
              <ul className="mt-4 space-y-2.5">
                {services.map((service) => (
                  <li key={service.slug} className="flex items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 shrink-0 translate-y-[-0.15rem] bg-safety-500"
                    />
                    <span className="text-sm text-graphite-300">{service.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
