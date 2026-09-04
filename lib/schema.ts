import { company } from '@/content/company';
import { factValue } from '@/content/types';
import type { FaqItem, Service } from '@/content/types';
import { SITE_NAME, absoluteUrl } from './site';
import type { Crumb } from '@/components/layout/Breadcrumbs';

/**
 * Structured data builders.
 *
 * Schema policy, from docs/04-seo-aeo-architecture.md:
 *
 *  - Organization is emitted sitewide, but only with the properties that are
 *    actually evidenced. An unverified phone number or address is omitted
 *    rather than guessed.
 *  - LocalBusiness is deliberately NOT emitted. It requires a verified address
 *    and would be a misrepresentation until one is supplied.
 *  - FAQPage is emitted only from FAQs that are rendered visibly on the page.
 *  - Service and BreadcrumbList are emitted from the same data the page renders.
 */

type Json = Record<string, unknown>;

/** Drop undefined and empty values so no property is emitted without a value. */
function compact(input: Json): Json {
  const out: Json = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

export const ORGANIZATION_ID = absoluteUrl('/#organization');
export const WEBSITE_ID = absoluteUrl('/#website');

export function organizationSchema(): Json {
  const phone = factValue(company.contact.phone);
  const email = factValue(company.contact.email);
  const street = factValue(company.contact.address);
  const city = factValue(company.contact.city);
  const region = factValue(company.contact.state);
  const postalCode = factValue(company.contact.postalCode);
  const country = factValue(company.contact.country);
  const linkedin = factValue(company.contact.linkedinUrl);

  // Only emit a postal address when there is a real street address to anchor it.
  const address = street
    ? compact({
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: city,
        addressRegion: region,
        postalCode,
        addressCountry: country ?? 'IN',
      })
    : undefined;

  return compact({
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: company.legalName,
    alternateName: company.shortName,
    url: absoluteUrl('/'),
    description: company.description,
    telephone: phone,
    email,
    address,
    areaServed: { '@type': 'Country', name: 'India' },
    knowsAbout: [
      'Thermoplastic road marking',
      'Highway road marking',
      'Runway and taxiway marking',
      'Road studs and cat eyes',
      'Traffic signboards',
      'Highway safety assets',
    ],
    sameAs: linkedin ? [linkedin] : undefined,
  });
}

export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: SITE_NAME,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-IN',
  };
}

export function serviceSchema(service: Service): Json {
  return compact({
    '@type': 'Service',
    name: service.name,
    description: service.directAnswer,
    url: absoluteUrl(`/services/${service.slug}`),
    serviceType: service.name,
    provider: { '@id': ORGANIZATION_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    category: 'Road safety and infrastructure marking',
  });
}

export function breadcrumbSchema(crumbs: readonly Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      ...crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.label,
        item: absoluteUrl(crumb.href),
      })),
    ],
  };
}

/**
 * FAQPage schema. Call this only with the exact FAQ array the page renders.
 * Passing an empty array returns null so no empty FAQ block is emitted.
 */
export function faqSchema(faqs: readonly FaqItem[]): Json | null {
  if (faqs.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Wrap one or more schema objects into a single @graph document. */
export function schemaGraph(...nodes: (Json | null | undefined)[]): string {
  const graph = nodes.filter((n): n is Json => Boolean(n));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
