import type { Metadata } from 'next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { FaqList, ProseList, StandardsList } from '@/components/aeo';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { company } from '@/content/company';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, faqSchema, schemaGraph } from '@/lib/schema';
import type { FaqItem, StandardReference } from '@/content/types';

const crumbs: Crumb[] = [{ href: '/quality-compliance', label: 'Quality & Compliance' }];

export const metadata: Metadata = buildMetadata({
  title: 'Quality & Compliance',
  description:
    'How road marking quality is controlled and evidenced: material verification, surface preparation, thickness and temperature control, retroreflectivity measurement and handover documentation.',
  path: '/quality-compliance',
});

const standards: readonly StandardReference[] = [
  {
    code: 'IRC:35',
    title: 'Code of Practice for Road Markings',
    issuer: 'Indian Roads Congress',
  },
  {
    code: 'IRC:67',
    title: 'Code of Practice for Road Signs',
    issuer: 'Indian Roads Congress',
  },
  {
    code: 'MoRTH Section 800',
    title:
      'Specifications for Road and Bridge Works — Traffic Signs, Markings and Other Road Appurtenances',
    issuer: 'Ministry of Road Transport & Highways',
  },
  {
    code: 'ASTM E1710',
    title:
      'Standard Test Method for Measurement of Retroreflective Pavement Marking Materials Using a Portable Retroreflectometer',
    issuer: 'ASTM International',
  },
  {
    code: 'EN 1436',
    title: 'Road marking materials — Road marking performance for road users',
    issuer: 'European Committee for Standardization',
  },
];

const inspectionPoints = [
  'Material specification and batch records verified against the approved submittal before any material is used.',
  'Surface cleanliness, dryness and curing state confirmed at each location before application.',
  'Pre-marking and setting-out submitted and approved before laying begins.',
  'Application temperature monitored at the applicator and recorded through each shift.',
  'Wet film thickness checked at defined intervals along the run.',
  'Glass bead application rate and embedment checked visually and by sampling.',
  'Retroreflectivity measured with a portable retroreflectometer and recorded by location.',
  'Line width, alignment and edge definition checked against the approved drawing.',
  'Night-time verification of completed markings, studs and signage along the route.',
  'Joint measurement with the client’s representative and photographic documentation at handover.',
];

const faqs: readonly FaqItem[] = [
  {
    question: 'How is road marking quality actually verified?',
    answer:
      'By measurement rather than inspection alone. The parameters that determine whether a marking performs are applied thickness, application temperature, bead embedment and measured retroreflectivity. Each of these can be checked while the work is in progress, and a marking that meets them will look correct at handover and still perform two years later. A visual inspection at handover tells you very little about either.',
  },
  {
    question: 'What retroreflectivity value should a project specify?',
    answer:
      'The specification should state a minimum RL value in mcd/lx/m² for acceptance, together with how often and where it is to be measured. The appropriate value depends on the road type and the project standard, and it differs between new-work acceptance and a maintenance intervention threshold. What matters most in practice is that the requirement is stated at all — a project that specifies no value has no basis on which to accept or reject the work.',
  },
  {
    question: 'Do you provide third-party testing?',
    answer:
      'Where the contract requires independent testing, it can be arranged through an accredited laboratory and priced as part of the scope. It should be stated in the RFQ, because third-party testing carries real cost and lead time that an all-in rate would otherwise absorb silently.',
  },
  {
    question: 'What documentation is provided at handover?',
    answer:
      'Joint measurement sheets, material batch records, in-process records of temperature and thickness, retroreflectivity readings recorded by location, and photographic documentation of the executed work, issued in the format the contract requires. These are produced as the work proceeds rather than assembled afterwards, because reconstructing records at the end is where certification usually stalls.',
  },
];

export default function QualityCompliancePage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs), faqSchema(faqs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Quality &amp; compliance"
        title="Quality that is measured, recorded and handed over"
        standfirst="Road marking either meets its specified thickness and retroreflectivity or it does not, and the difference is measurable while the work is in progress. Our quality process is built around measuring it then, rather than inspecting it afterwards."
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Quality process"
              title="Six controls applied on every project"
            />
          </div>
          <div className="lg:col-span-8">
            <ul className="grid gap-px border border-paper-300 bg-paper-300">
              {company.qualityProcess.map((item) => (
                <li key={item.title} className="bg-paper-50 p-6">
                  <h2 className="text-base font-semibold text-ink-900">{item.title}</h2>
                  <p className="mt-2.5 leading-relaxed text-ink-600">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="muted" labelledBy="inspection-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Inspection points"
              title="What is checked, and when"
              standfirst="Each of these is a hold or check point in the method statement, not a post-completion review."
              id="inspection-heading"
            />
          </div>
          <div className="lg:col-span-8">
            <ProseList items={inspectionPoints} />
          </div>
        </div>
      </Section>

      <Section tone="light" labelledBy="credentials-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Registrations"
              title="Certifications and registrations"
              standfirst="We publish credentials here only where we can produce the certificate. Current registration documents are available on request for prequalification and vendor registration."
              id="credentials-heading"
            />
          </div>
          <div className="lg:col-span-8 space-y-4">
            {company.certifications.length > 0 ? (
              <ul className="space-y-4">
                {company.certifications.map((cert, index) => (
                  <li key={index} className="border border-paper-300 p-5">
                    <VerifiedOnly fact={cert.name}>
                      {(name) => (
                        <h3 className="text-base font-semibold text-ink-900">{name}</h3>
                      )}
                    </VerifiedOnly>
                    <VerifiedOnly fact={cert.issuer}>
                      {(issuer) => <p className="mt-1 text-sm text-ink-600">{issuer}</p>}
                    </VerifiedOnly>
                    <VerifiedOnly fact={cert.identifier}>
                      {(id) => (
                        <p className="tabular mt-1 text-sm text-ink-500">
                          Certificate no. {id}
                        </p>
                      )}
                    </VerifiedOnly>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-paper-300 bg-paper-100/60 p-6">
                <p className="leading-relaxed text-ink-600">
                  Registration and certification documents are provided directly during
                  prequalification and vendor registration, against the specific
                  requirements of your process. Request them through the contact form
                  and we will send the current documents applicable to your enquiry.
                </p>
              </div>
            )}

            <StandardsList standards={standards} />
          </div>
        </div>
      </Section>

      <Section tone="muted" labelledBy="quality-faq-heading">
        <SectionHeading
          eyebrow="FAQ"
          title="Quality questions we are asked"
          id="quality-faq-heading"
        />
        <div className="mt-8 max-w-4xl">
          <FaqList faqs={faqs} />
        </div>
      </Section>

      <ConversionBand
        title="Need our documents for prequalification?"
        standfirst="Tell us which registration or vendor process you are running and we will send the current documents that apply to it."
      />
    </>
  );
}
