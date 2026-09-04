import Link from 'next/link';
import { Section, SectionHeading } from '@/components/ui/Section';
import { publishedProjects } from '@/content/portfolio';
import { company } from '@/content/company';
import { isVerified } from '@/content/types';

/**
 * Portfolio proof.
 *
 * When evidenced projects exist, they are shown. When none do, this band does
 * not fall back to invented cards, placeholder tiles or a fabricated statistic
 * — it states what the company does and how it works, which is the honest
 * substitute for proof we cannot yet show.
 */
export function ProofBand() {
  if (publishedProjects.length === 0) return <CapabilityStatement />;

  return (
    <Section tone="dark" width="wide" labelledBy="proof-heading">
      <SectionHeading
        eyebrow="Project evidence"
        title="Executed projects"
        standfirst="Work delivered, with the client, location and scope as recorded."
        tone="dark"
        id="proof-heading"
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {publishedProjects.slice(0, 6).map((project) => (
          <li key={project.slug}>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col border border-graphite-700 bg-graphite-850 p-6 transition-colors hover:border-safety-500/50"
            >
              <h3 className="text-base font-semibold text-paper-50">
                {isVerified(project.title) ? project.title.value : null}
              </h3>
              {isVerified(project.client) ? (
                <p className="mt-1.5 text-xs tracking-wide text-safety-400 uppercase">
                  {project.client.value}
                </p>
              ) : null}
              {isVerified(project.summary) ? (
                <p className="mt-3 flex-1 text-sm leading-relaxed text-graphite-300">
                  {project.summary.value}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link
          href="/projects"
          className="text-sm font-semibold text-safety-400 underline-offset-4 hover:underline"
        >
          View all projects &rarr;
        </Link>
      </div>
    </Section>
  );
}

function CapabilityStatement() {
  return (
    <Section tone="dark" width="wide" labelledBy="capability-heading">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="How we work"
            title="Why an EPC or procurement team engages a marking specialist"
            tone="dark"
            id="capability-heading"
          />
        </div>

        <div className="lg:col-span-7">
          <ul className="grid gap-px bg-graphite-700 sm:grid-cols-2">
            {company.differentiators.map((item) => (
              <li key={item.title} className="bg-graphite-900 p-6">
                <h3 className="text-base font-semibold text-paper-50">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-graphite-300">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 border-t border-graphite-800 pt-6 text-sm leading-relaxed text-graphite-400">
            Project references and executed quantities are available on request and
            are published here as they are documented.{' '}
            <Link
              href="/projects"
              className="font-medium text-safety-400 underline-offset-4 hover:underline"
            >
              About our project record
            </Link>
          </p>
        </div>
      </div>
    </Section>
  );
}
