import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { SpecificationTable } from '@/components/aeo';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';
import { getProject, publishedProjects } from '@/content/portfolio';
import { factValue, isVerified } from '@/content/types';
import { servicesBySlug } from '@/content/services';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

export function generateStaticParams() {
  return publishedProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = factValue(project.title) ?? 'Project';
  const summary = factValue(project.summary) ?? '';
  return buildMetadata({
    title,
    description: summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const title = factValue(project.title) ?? '';
  const crumbs: Crumb[] = [
    { href: '/projects', label: 'Projects' },
    { href: `/projects/${project.slug}`, label: title },
  ];

  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Project"
        title={title}
        standfirst={factValue(project.summary)}
      />

      <Section tone="light">
        <dl className="grid gap-x-8 gap-y-5 border-b border-paper-200 pb-8 sm:grid-cols-3">
          <Detail label="Client">
            <VerifiedOnly fact={project.client}>{(v) => <>{v}</>}</VerifiedOnly>
          </Detail>
          <Detail label="Location">
            <VerifiedOnly fact={project.location}>{(v) => <>{v}</>}</VerifiedOnly>
          </Detail>
          <Detail label="Year">
            <VerifiedOnly fact={project.year}>{(v) => <>{v}</>}</VerifiedOnly>
          </Detail>
        </dl>

        <VerifiedOnly fact={project.scope}>
          {(scope) => (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">Scope executed</h2>
              <ul className="mt-4 space-y-2">
                {scope.map((item) => (
                  <li key={item} className="flex gap-3 text-ink-700">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 bg-safety-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </VerifiedOnly>

        <VerifiedOnly fact={project.quantities}>
          {(rows) => (
            <div className="mt-10">
              <h2 className="text-xl font-semibold">Executed quantities</h2>
              <div className="mt-4">
                <SpecificationTable rows={rows} />
              </div>
            </div>
          )}
        </VerifiedOnly>

        {project.services.length > 0 ? (
          <div className="mt-10">
            <h2 className="text-xl font-semibold">Services applied</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.services.map((s) => {
                const service = servicesBySlug.get(s);
                if (!service) return null;
                return (
                  <li
                    key={s}
                    className="border border-paper-300 bg-paper-100 px-3 py-1.5 text-sm text-ink-700"
                  >
                    {service.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {isVerified(project.images) ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {project.images.value.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full border border-paper-300"
              />
            ))}
          </div>
        ) : null}
      </Section>

      <ConversionBand />
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-ink-900">{children}</dd>
    </div>
  );
}
