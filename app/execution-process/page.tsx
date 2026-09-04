import type { Metadata } from 'next';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionHeading } from '@/components/ui/Section';
import { ConversionBand } from '@/components/sections/ConversionBand';
import { JsonLd } from '@/components/JsonLd';
import { ProcessList, ProseList } from '@/components/aeo';
import { company } from '@/content/company';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, schemaGraph } from '@/lib/schema';

const crumbs: Crumb[] = [{ href: '/execution-process', label: 'Execution Process' }];

export const metadata: Metadata = buildMetadata({
  title: 'Execution Process',
  description:
    'How road marking and safety works are executed: site assessment, method statement, mobilisation, execution under traffic management, quality control, joint measurement and handover documentation.',
  path: '/execution-process',
});

const documentation = [
  'Method statement and traffic management plan submitted for the engineer’s approval before mobilisation.',
  'Material batch records and manufacturer documentation for every consignment used on the project.',
  'Pre-marking and setting-out approvals recorded before application begins.',
  'In-process records of application temperature and thickness through each shift.',
  'Retroreflectivity readings recorded by location rather than as a single project figure.',
  'Daily progress recorded by chainage against the approved programme.',
  'Joint measurement sheets signed as the work proceeds.',
  'Photographic documentation of executed work at handover.',
];

export default function ExecutionProcessPage() {
  return (
    <>
      <JsonLd json={schemaGraph(breadcrumbSchema(crumbs))} />
      <Breadcrumbs crumbs={crumbs} />
      <PageHeader
        eyebrow="Execution"
        title="How the work is planned, executed and documented"
        standfirst="Six stages applied on every project. The documentation produced along the way is not administrative overhead — it is what supports your measurement, billing and certification once the work is finished."
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Six stages"
              title="From site assessment to handover"
              standfirst="The sequence does not change between a highway package and a warehouse yard. What changes is the constraint each stage has to work within."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessList steps={company.executionProcess} />
          </div>
        </div>
      </Section>

      <Section tone="muted" labelledBy="documentation-heading">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Documentation"
              title="What you receive"
              standfirst="Certification delays on marking scope are usually documentation delays, not execution delays. These records are produced as the work happens rather than reconstructed afterwards."
              id="documentation-heading"
            />
          </div>
          <div className="lg:col-span-8">
            <ProseList items={documentation} />
          </div>
        </div>
      </Section>

      <ConversionBand
        title="Send us the package and we will send back a method"
        standfirst="Give us the stretch or the facility, the specification and the working windows available, and we will come back with how we would sequence it."
      />
    </>
  );
}
