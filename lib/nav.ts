import { services } from '@/content/services';
import { industries } from '@/content/industries';

export interface NavLink {
  readonly href: string;
  readonly label: string;
  readonly description?: string;
}

export const serviceLinks: readonly NavLink[] = services.map((s) => ({
  href: `/services/${s.slug}`,
  label: s.name,
  description: s.shortName,
}));

export const industryLinks: readonly NavLink[] = industries.map((i) => ({
  href: `/industries/${i.slug}`,
  label: i.name,
}));

export const primaryNav: readonly NavLink[] = [
  { href: '/services', label: 'Services' },
  { href: '/industries', label: 'Industries' },
  { href: '/projects', label: 'Projects' },
  { href: '/execution-process', label: 'Execution' },
  { href: '/quality-compliance', label: 'Quality' },
  { href: '/insights', label: 'Insights' },
  { href: '/about', label: 'About' },
];

export const footerNav: readonly { title: string; links: readonly NavLink[] }[] = [
  { title: 'Services', links: serviceLinks },
  { title: 'Industries', links: industryLinks },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/execution-process', label: 'Execution Process' },
      { href: '/quality-compliance', label: 'Quality & Compliance' },
      { href: '/projects', label: 'Projects' },
      { href: '/insights', label: 'Insights' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Start a project',
    links: [
      { href: '/request-quote', label: 'Request a Quote' },
      { href: '/upload-boq', label: 'Submit BOQ / Tender' },
      { href: '/contact', label: 'Discuss a Project' },
    ],
  },
];
