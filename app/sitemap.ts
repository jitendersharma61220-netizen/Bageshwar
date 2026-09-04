import type { MetadataRoute } from 'next';
import { services } from '@/content/services';
import { industries } from '@/content/industries';
import { publishedProjects } from '@/content/portfolio';
import { insights } from '@/content/insights';
import { absoluteUrl } from '@/lib/site';

/**
 * The sitemap is generated from the same content the pages are, so a page can
 * never be published without appearing here, and an unpublished project can
 * never be listed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; frequency: 'weekly' | 'monthly' }[] = [
    { path: '/', priority: 1, frequency: 'weekly' },
    { path: '/services', priority: 0.9, frequency: 'monthly' },
    { path: '/industries', priority: 0.8, frequency: 'monthly' },
    { path: '/projects', priority: 0.8, frequency: 'monthly' },
    { path: '/execution-process', priority: 0.7, frequency: 'monthly' },
    { path: '/quality-compliance', priority: 0.7, frequency: 'monthly' },
    { path: '/about', priority: 0.6, frequency: 'monthly' },
    { path: '/insights', priority: 0.6, frequency: 'weekly' },
    { path: '/contact', priority: 0.8, frequency: 'monthly' },
    { path: '/request-quote', priority: 0.9, frequency: 'monthly' },
    { path: '/upload-boq', priority: 0.8, frequency: 'monthly' },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.frequency,
      priority: route.priority,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    ...industries.map((industry) => ({
      url: absoluteUrl(`/industries/${industry.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...publishedProjects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    ...insights.map((insight) => ({
      url: absoluteUrl(`/insights/${insight.slug}`),
      lastModified: new Date(insight.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
