import { Section, SectionHeading } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { company } from '@/content/company';

/**
 * The conversion band. Repeated at the foot of every content page so the four
 * primary calls to action are always one screen away.
 */
export function ConversionBand({
  title = 'Discuss your project with our team',
  standfirst = 'Send us the stretch, the facility or the BOQ. We will come back with the questions that actually determine the rate and the programme, not a generic brochure.',
}: {
  title?: string;
  standfirst?: string;
}) {
  return (
    <Section tone="darker" labelledBy="cta-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="lg:col-span-6">
          <SectionHeading
            eyebrow="Next step"
            title={title}
            standfirst={standfirst}
            tone="dark"
            id="cta-heading"
          />
        </div>

        <div className="lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink href="/contact">Discuss a Project</ButtonLink>
            <ButtonLink href="/request-quote" variant="onDark">
              Request a Quote
            </ButtonLink>
            <ButtonLink href="/upload-boq" variant="onDark">
              Upload BOQ / Tender
            </ButtonLink>
            <ButtonLink href="/contact#team" variant="onDark">
              Talk to Our Team
            </ButtonLink>
          </div>

          <div className="mt-6 space-y-2 border-t border-graphite-800 pt-6 text-sm">
            <VerifiedOnly fact={company.contact.phone}>
              {(phone) => (
                <p className="text-graphite-300">
                  Call:{' '}
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="font-medium text-paper-50 hover:text-safety-400"
                  >
                    {phone}
                  </a>
                </p>
              )}
            </VerifiedOnly>
            <VerifiedOnly fact={company.contact.email}>
              {(email) => (
                <p className="text-graphite-300">
                  Email:{' '}
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-paper-50 hover:text-safety-400"
                  >
                    {email}
                  </a>
                </p>
              )}
            </VerifiedOnly>
          </div>
        </div>
      </div>
    </Section>
  );
}
