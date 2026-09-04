import type { Metadata } from 'next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { company } from '@/content/company';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/upload-boq', label: 'Submit BOQ / Tender' }];

export const metadata: Metadata = buildMetadata({
  title: 'Submit BOQ / Tender',
  description:
    'Send us a BOQ, tender or RFQ covering road marking, road studs, signage or highway safety items. We will review the scope and respond with what we need to price it.',
  path: '/upload-boq',
});

const extracted = [
  'The marking, stud, signage and safety items in the BOQ, with their specified quantities and units.',
  'The specification each item is measured against, including thickness, material and any retroreflectivity requirement.',
  'Eligibility and experience requirements, where the document is a tender.',
  'Submission deadlines and the documents required with the bid.',
  'Working window, traffic management and site constraints stated in the document.',
  'Testing, inspection and documentation obligations.',
];

export default function UploadBoqPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="BOQ / tender"
        title="Send us a BOQ, tender or RFQ"
        standfirst="Tell us what the document covers and we will review the marking and safety scope in it, then come back with our reading of the items and anything that needs clarification before it can be priced."
      />

      <Section tone="light" width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {/* File attachment is deliberately absent rather than present and
                non-functional: document storage arrives with the client portal
                in a later iteration. Offering an input that discarded files
                would be worse than telling people how to send them now. */}
            <div className="rule-accent mb-8 bg-paper-100 py-5 pr-5 pl-6">
              <h2 className="text-base font-semibold text-ink-900">
                Sending the document itself
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Submit the details below first. We will reply directly, and you can
                send the BOQ, tender or drawing set as an attachment to that reply.
                Secure in-browser document upload arrives with our client portal;
                until then we would rather you had a working route than a form that
                looked like one.
              </p>
              <VerifiedOnly fact={company.contact.email}>
                {(email) => (
                  <p className="mt-3 text-sm text-ink-600">
                    To send documents straight away, email{' '}
                    <a
                      href={`mailto:${email}`}
                      className="font-medium text-technical-700 hover:underline"
                    >
                      {email}
                    </a>
                    .
                  </p>
                )}
              </VerifiedOnly>
            </div>

            <EnquiryForm kind="boq" submitLabel="Submit BOQ / Tender Details" />
          </div>

          <aside className="lg:col-span-5">
            <div className="border border-paper-300 bg-paper-100/60 p-6">
              <h2 className="text-base font-semibold text-ink-900">
                What we review in your document
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
                {extracted.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-safety-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-paper-300 pt-4 text-sm leading-relaxed text-ink-600">
                Documents you send are treated as confidential and used only to
                prepare a response to your enquiry.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
