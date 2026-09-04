/**
 * Knowledge hub.
 *
 * Iteration 1 ships the route, the layout and the structured-data handling for
 * insight articles. The article set itself is Iteration 2 work, planned against
 * the Tier 2 and Tier 3 question architecture in
 * docs/04-seo-aeo-architecture.md.
 *
 * Articles are deliberately not mass-produced. Each one has to answer a real
 * commercial or technical question well enough to be worth a procurement
 * reader's time; a page that does not clear that bar is not published.
 */

import type { FaqItem, ServiceSlug, StandardReference } from './types';

export interface InsightSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
}

export interface Insight {
  readonly slug: string;
  readonly title: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  /** The extractable answer, 40-60 words. */
  readonly directAnswer: string;
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly sections: readonly InsightSection[];
  readonly faqs: readonly FaqItem[];
  readonly standards: readonly StandardReference[];
  /** Each insight links back to exactly one primary service. */
  readonly primaryService: ServiceSlug;
}

/** Published articles. Populated in Iteration 2. */
export const insights: readonly Insight[] = [];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
