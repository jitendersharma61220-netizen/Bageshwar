import type { Metadata } from 'next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { company } from '@/content/company';
import { contactDetails, hasAnyContactDetail } from '@/lib/site';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/contact', label: 'Contact' }];

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description:
    'Discuss a road marking, road stud, signage or highway safety requirement with our team. Send the project details and we will respond with the next step.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Contact"
        title="Discuss a project with our team"
        standfirst="Tell us the stretch, the facility or the package. We will come back with the questions that determine the rate and the programme, and with the next step."
      />

      <Section tone="light" width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <EnquiryForm kind="general" />
          </div>

          <aside id="team" className="lg:col-span-5">
            <div className="border border-paper-300 p-6">
              <h2 className="text-base font-semibold text-ink-900">Talk to our team</h2>

              {hasAnyContactDetail ? (
                <dl className="mt-5 space-y-4 text-sm">
                  <VerifiedOnly fact={company.contact.phone}>
                    {(phone) => (
                      <div>
                        <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
                          Phone
                        </dt>
                        <dd className="mt-1">
                          <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            className="font-medium text-technical-700 hover:underline"
                          >
                            {phone}
                          </a>
                        </dd>
                      </div>
                    )}
                  </VerifiedOnly>

                  <VerifiedOnly fact={company.contact.email}>
                    {(email) => (
                      <div>
                        <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
                          Email
                        </dt>
                        <dd className="mt-1">
                          <a
                            href={`mailto:${email}`}
                            className="font-medium text-technical-700 hover:underline"
                          >
                            {email}
                          </a>
                        </dd>
                      </div>
                    )}
                  </VerifiedOnly>

                  <VerifiedOnly fact={company.contact.address}>
                    {(address) => (
                      <div>
                        <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
                          Office
                        </dt>
                        <dd className="mt-1">
                          <address className="text-ink-700 not-italic">
                            {address}
                            {contactDetails.city ? <>, {contactDetails.city}</> : null}
                            {contactDetails.state ? <>, {contactDetails.state}</> : null}
                            {contactDetails.postalCode ? <> {contactDetails.postalCode}</> : null}
                          </address>
                        </dd>
                      </div>
                    )}
                  </VerifiedOnly>
                </dl>
              ) : (
                <p className="mt-4 leading-relaxed text-ink-600">
                  The enquiry form is the fastest route to our team and reaches us
                  directly. Send your requirement and we will respond with direct
                  contact details for the person handling it.
                </p>
              )}
            </div>

            <div className="mt-6 border border-paper-300 bg-paper-100/60 p-6">
              <h2 className="text-base font-semibold text-ink-900">
                What to include in your enquiry
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">
                These four things determine the rate and the programme more than
                anything else, and we will ask for them regardless:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                {[
                  'The specification — material, applied thickness and any retroreflectivity requirement.',
                  'The quantity and how it is distributed across the site or stretch.',
                  'The working window available, and who provides traffic management.',
                  'The required start and completion dates.',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-safety-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
