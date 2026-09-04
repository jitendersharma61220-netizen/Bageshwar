import { Section, SectionHeading } from '@/components/ui/Section';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { company } from '@/content/company';
import { isVerified } from '@/content/types';

/**
 * Machinery and technical capability.
 *
 * Each item renders only if its name is evidenced. Unit counts are shown only
 * where they are evidenced too — the fleet is described by what it can do,
 * not by a number we cannot substantiate.
 */
export function MachineryBand() {
  const items = company.machinery.filter((m) => isVerified(m.name));
  if (items.length === 0) return null;

  return (
    <Section tone="dark" width="wide" labelledBy="machinery-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="Technical capability"
            title="The equipment the work actually requires"
            standfirst="Marking quality is decided by application temperature, laid thickness and bead embedment. All three are functions of the machinery and how it is run."
            tone="dark"
            id="machinery-heading"
          />
        </div>

        <div className="lg:col-span-8">
          <ul className="grid gap-px bg-graphite-700 sm:grid-cols-2">
            {items.map((item, index) => (
              <li key={index} className="bg-graphite-900 p-6">
                <VerifiedOnly fact={item.name}>
                  {(name) => (
                    <h3 className="text-base font-semibold text-paper-50">{name}</h3>
                  )}
                </VerifiedOnly>
                <p className="mt-2.5 text-sm leading-relaxed text-graphite-300">
                  {item.purpose}
                </p>
                <VerifiedOnly fact={item.quantity}>
                  {(qty) => (
                    <p className="tabular mt-3 text-xs tracking-wide text-safety-400 uppercase">
                      {qty} in fleet
                    </p>
                  )}
                </VerifiedOnly>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
