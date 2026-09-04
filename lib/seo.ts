import type { Metadata } from 'next';
import { company } from '@/content/company';
import { SITE_NAME, SITE_URL, absoluteUrl } from './site';

/**
 * Build page metadata from a single place, so that title, description,
 * canonical URL and Open Graph tags are always derived together and cannot
 * drift apart across pages.
 */
export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${company.legalName} | ${company.positioning}`,
    template: `%s | ${company.shortName}`,
  },
  description: company.description,
  applicationName: SITE_NAME,
  authors: [{ name: company.legalName }],
  creator: company.legalName,
  publisher: company.legalName,
  formatDetection: { telephone: true, address: false, email: true },
  category: 'Construction',
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};
