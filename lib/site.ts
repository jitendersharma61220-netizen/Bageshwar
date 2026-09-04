import { company } from '@/content/company';
import { factValue } from '@/content/types';

/**
 * The canonical origin. Every canonical URL, sitemap entry and Open Graph tag
 * derives from this single value so that they cannot drift apart.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bageshwarbalaji.com'
).replace(/\/$/, '');

export const SITE_NAME = company.legalName;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

/** Contact details that are evidenced, for the footer and contact page. */
export const contactDetails = {
  phone: factValue(company.contact.phone),
  altPhone: factValue(company.contact.altPhone),
  email: factValue(company.contact.email),
  address: factValue(company.contact.address),
  city: factValue(company.contact.city),
  state: factValue(company.contact.state),
  postalCode: factValue(company.contact.postalCode),
  country: factValue(company.contact.country),
  linkedinUrl: factValue(company.contact.linkedinUrl),
  googleMapsUrl: factValue(company.contact.googleMapsUrl),
};

export const hasAnyContactDetail =
  contactDetails.phone !== undefined || contactDetails.email !== undefined;
