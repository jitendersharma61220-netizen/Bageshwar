import type { Metadata } from 'next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { company } from '@/content/company';
import { services } from '@/content/services';
import { SectorsBand } from '@/components/sections/SectorsBand';
import { MachineryBand } from '@/components/sections/MachineryBand';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/about', label: 'About' }];

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description:
    'Bageshwar Balaji Construction Co. is a road safety and infrastructure marking execution specialist working with EPC contractors, developers, concessionaires, airports and industrial clients across India.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="About"
        title="A road safety execution specialist, not a general contractor"
        standfirst={company.capabilityStatement}
      />

      <Section tone="light">
        <div className="prose-technical">
          <p className="text-lg leading-relaxed text-ink-800">
            Road marking and safety work is a specialist trade that is frequently
            treated as an afterthought on infrastructure packages. It sits at the end
            of the programme, it is a small share of package value, and it is the
            scope standing between a completed carriageway and a certified one.
          </p>
          <p>
            We exist to take that scope off a main contractor&rsquo;s critical path.
            The crew, the machinery and the quality process are built for marking and
            safety works rather than bolted onto a broader civil capability, which is
            what allows the work to be planned around traffic windows, executed inside
            them, and documented well enough to support billing without a second pass.
          </p>
          <VerifiedOnly fact={company.experienceStatement}>
            {(statement) => <p>{statement}</p>}
          </VerifiedOnly>
          <p>
            Our scope covers thermoplastic markings on highways, expressways and urban
            roads; runway, taxiway and apron markings at airports; yard and floor
            marking at logistics and industrial facilities; and the road studs,
            signage and safety assets that are usually procured alongside them. Taking
            these together, rather than as separate awards, removes repeated
            mobilisation on the same stretch and produces delineation that is
            consistent along a route.
          </p>
        </div>
      </Section>

      <Section tone="muted" labelledBy="purpose-heading">
        <SectionHeading
          eyebrow="Mission &amp; vision"
          title="What we are working towards"
          id="purpose-heading"
        />
        <div className="mt-8 grid gap-px border border-paper-300 bg-paper-300 sm:grid-cols-2">
          <div className="bg-paper-50 p-6">
            <h3 className="text-base font-semibold text-ink-900">Our mission</h3>
            <VerifiedOnly fact={company.mission}>
              {(mission) => (
                <p className="mt-2.5 leading-relaxed text-ink-600">{mission}</p>
              )}
            </VerifiedOnly>
          </div>
          <div className="bg-paper-50 p-6">
            <h3 className="text-base font-semibold text-ink-900">Our vision</h3>
            <VerifiedOnly fact={company.vision}>
              {(vision) => (
                <p className="mt-2.5 leading-relaxed text-ink-600">{vision}</p>
              )}
            </VerifiedOnly>
          </div>
        </div>
      </Section>

      <SectorsBand />

      <Section tone="light" labelledBy="operating-heading">
        <SectionHeading
          eyebrow="Where we work"
          title="Project-based mobilisation across India"
          id="operating-heading"
        />
        <div className="mt-8 max-w-3xl">
          <VerifiedOnly fact={company.operatingRegions.statement}>
            {(statement) => (
              <p className="text-lg leading-relaxed text-ink-700">{statement}</p>
            )}
          </VerifiedOnly>
          <VerifiedOnly fact={company.operatingRegions.statesWorkedIn}>
            {(states) => (
              <p className="mt-4 text-ink-600">
                <span className="font-medium text-ink-900">States worked in to date: </span>
                {states}
              </p>
            )}
          </VerifiedOnly>

          {company.workLocations.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-sm font-semibold tracking-[0.14em] text-ink-900 uppercase">
                Recent work locations
              </h3>
              <ul className="mt-4 divide-y divide-paper-200 border-y border-paper-200">
                {company.workLocations.map((entry, index) => (
                  <li
                    key={index}
                    className="grid gap-1 py-3 text-sm sm:grid-cols-[14rem_1fr] sm:gap-6"
                  >
                    <span className="font-medium text-ink-900">{entry.work}</span>
                    <span className="text-ink-600">{entry.location}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-500">
                Full project details, executed quantities and photographs are provided
                directly on request. We publish a project on this site only once those
                are documented and cleared for publication.
              </p>
            </div>
          ) : null}
        </div>
      </Section>

      <Section tone="light" labelledBy="scope-heading">
        <SectionHeading
          eyebrow="Execution scope"
          title="What we execute"
          id="scope-heading"
        />
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug} className="flex gap-3 text-ink-700">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-safety-500" />
              {service.name}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted" labelledBy="why-heading">
        <SectionHeading
          eyebrow="Why engage us"
          title="What a specialist changes on your package"
          id="why-heading"
        />
        <ul className="mt-10 grid gap-px border border-paper-300 bg-paper-300 sm:grid-cols-2">
          {company.differentiators.map((item) => (
            <li key={item.title} className="bg-paper-50 p-6">
              <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2.5 leading-relaxed text-ink-600">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <MachineryBand />

      <Section tone="light" labelledBy="goals-heading">
        <SectionHeading
          eyebrow="Where we are going"
          title="Our strategic goals"
          standfirst="Stated as goals rather than achievements, because that is what they are."
          id="goals-heading"
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {company.strategicGoals.map((goal) => (
            <li key={goal.title} className="border-t-2 border-safety-500 pt-5">
              <h3 className="text-base font-semibold text-ink-900">{goal.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{goal.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <ConversionBand />
    </>
  );
}
