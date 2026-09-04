import type { FaqItem, ServiceSlug, StandardReference } from '../types';

export interface InsightSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
  /** Optional definition-style rows, for parameter tables inside an article. */
  readonly rows?: readonly { term: string; detail: string }[];
}

export interface Insight {
  readonly slug: string;
  readonly title: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  /** The extractable answer: 40-60 words, plain language, no marketing. */
  readonly directAnswer: string;
  /** Who this is written for, shown under the title. */
  readonly audience: string;
  /** ISO date. */
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly sections: readonly InsightSection[];
  readonly faqs: readonly FaqItem[];
  readonly standards: readonly StandardReference[];
  /** Each insight links back to exactly one primary service. */
  readonly primaryService: ServiceSlug;
  /** Other articles worth reading next. */
  readonly related?: readonly string[];
}
