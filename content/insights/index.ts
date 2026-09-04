/**
 * Knowledge hub.
 *
 * Articles are deliberately not mass-produced. Each one answers a real
 * commercial or technical question in enough depth to be worth a procurement
 * reader's time, and each declares exactly one primary service so the internal
 * linking graph is generated rather than hand-maintained.
 *
 * Question architecture and the tier each article targets are set out in
 * docs/04-seo-aeo-architecture.md.
 */

import { thermoplasticSpecifications } from './thermoplastic-road-marking-specifications';
import { retroreflectivityExplained } from './road-marking-retroreflectivity-explained';
import { selectingAContractor } from './how-to-select-a-road-marking-contractor';
import { rfqChecklist } from './road-marking-rfq-checklist';
import { roadStudSpecifications } from './road-stud-types-and-specifications';
import { inspectionChecklist } from './road-marking-quality-inspection-checklist';
import { sheetingClasses } from './retroreflective-sheeting-classes-for-traffic-signs';

export type { Insight, InsightSection } from './types';
import type { Insight } from './types';

/** Published articles, newest first. */
export const insights: readonly Insight[] = [
  thermoplasticSpecifications,
  retroreflectivityExplained,
  inspectionChecklist,
  selectingAContractor,
  rfqChecklist,
  roadStudSpecifications,
  sheetingClasses,
];

const bySlug = new Map(insights.map((i) => [i.slug, i]));

export function getInsight(slug: string): Insight | undefined {
  return bySlug.get(slug);
}

/**
 * Resolve an article's related links.
 *
 * Unknown slugs are dropped rather than rendered, so removing or renaming an
 * article cannot leave a dead link behind on the articles that referenced it.
 */
export function getRelated(insight: Insight): Insight[] {
  return (insight.related ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((i): i is Insight => i !== undefined && i.slug !== insight.slug);
}

/** Articles supporting a given service, for cross-linking from service pages. */
export function insightsForService(slug: string): Insight[] {
  return insights.filter((i) => i.primaryService === slug);
}

/**
 * Rough reading time in minutes, from the article's own prose. Computed rather
 * than authored so it cannot drift out of date when an article is edited.
 */
export function readingMinutes(insight: Insight): number {
  const words =
    insight.directAnswer.split(/\s+/).length +
    insight.sections.reduce(
      (total, section) =>
        total +
        section.heading.split(/\s+/).length +
        section.paragraphs.join(' ').split(/\s+/).length +
        (section.bullets?.join(' ').split(/\s+/).length ?? 0) +
        (section.rows?.map((r) => `${r.term} ${r.detail}`).join(' ').split(/\s+/).length ?? 0),
      0,
    ) +
    insight.faqs.reduce(
      (total, faq) => total + `${faq.question} ${faq.answer}`.split(/\s+/).length,
      0,
    );
  return Math.max(1, Math.round(words / 220));
}
