import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { publishedProjects } from '@/content/portfolio';
import { isVerified } from '@/content/types';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/projects', label: 'Projects' }];

export const metadata: Metadata = buildMetadata({
  title: 'Projects',
  description:
    'Executed road marking, road stud, signage and highway safety projects, published with the client, location and scope as recorded.',
  path: '/projects',
});

export default function ProjectsPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Projects"
        title="Executed projects"
        standfirst="Work we have delivered, published with the client, location and scope as recorded on the project."
      />

      <Section tone="light" width="wide">
        {publishedProjects.length > 0 ? (
          <ul className="grid gap-px bg-paper-300 sm:grid-cols-2 lg:grid-cols-3">
            {publishedProjects.map((project) => (
              <li key={project.slug} className="bg-paper-50">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col p-6 transition-colors hover:bg-paper-100"
                >
                  <h2 className="text-base font-semibold text-ink-900 group-hover:text-technical-700">
                    {isVerified(project.title) ? project.title.value : null}
                  </h2>
                  {isVerified(project.client) ? (
                    <p className="mt-1.5 text-xs tracking-wide text-safety-600 uppercase">
                      {project.client.value}
                    </p>
                  ) : null}
                  {isVerified(project.location) ? (
                    <p className="mt-1 text-sm text-ink-500">{project.location.value}</p>
                  ) : null}
                  {isVerified(project.summary) ? (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                      {project.summary.value}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyPortfolio />
        )}
      </Section>

      <ConversionBand />
    </>
  );
}

/**
 * Shown while no project has been documented for publication.
 *
 * Deliberately says so plainly rather than filling the page with illustrative
 * or representative entries. A procurement reader can ask for references
 * directly, and an honest empty state costs less credibility than an invented
 * portfolio does.
 */
function EmptyPortfolio() {
  return (
    <div className="max-w-3xl">
      <div className="rule-accent bg-paper-100 py-6 pr-6 pl-7">
        <h2 className="text-lg font-semibold text-ink-900">
          Project references are provided directly
        </h2>
        <p className="mt-3 leading-relaxed text-ink-600">
          We publish a project here only once its client, location, scope and executed
          quantities are documented and cleared for publication. Where a client
          relationship or a contract restricts what can be published, the project does
          not appear on this page even though the work was executed.
        </p>
        <p className="mt-3 leading-relaxed text-ink-600">
          If you are assessing us for a package or running a vendor registration,
          request references through the contact form. We will provide relevant
          project details, executed quantities and, where the client permits it,
          contactable references appropriate to your enquiry.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center rounded-card bg-safety-500 px-5 py-3 text-sm font-semibold text-graphite-950 hover:bg-safety-400"
        >
          Request project references
        </Link>
        <Link
          href="/execution-process"
          className="inline-flex items-center rounded-card border border-ink-900/20 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-paper-100"
        >
          How we execute
        </Link>
      </div>
    </div>
  );
}
