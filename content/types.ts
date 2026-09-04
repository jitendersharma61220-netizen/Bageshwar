/**
 * The verification layer.
 *
 * Every factual claim this website makes about the company passes through a
 * `Fact<T>`. A fact is either `verified` — in which case it carries the source
 * that backs it — or `pending`, in which case it holds no value at all and can
 * never be rendered as an assertion.
 *
 * This exists because the site must not state a client, project,
 * certification, approval, revenue figure or statistic that the company cannot
 * evidence. Enforcing it in the type system rather than by author discipline
 * means an unsourced claim is a compile error, not a review miss.
 */

export type Verification = 'verified' | 'pending';

/** A claim backed by a named source. */
export interface VerifiedFact<T> {
  readonly verification: 'verified';
  readonly value: T;
  /** Where this came from: a deck slide, a document, a URL, a signed record. */
  readonly source: string;
  readonly note?: string;
}

/**
 * A claim we cannot yet evidence. Deliberately carries no `value` field, so
 * there is nothing for a component to accidentally render.
 */
export interface PendingFact {
  readonly verification: 'pending';
  /** Human-readable name of what is missing, used by the content audit. */
  readonly label: string;
  readonly note?: string;
}

export type Fact<T> = VerifiedFact<T> | PendingFact;

/**
 * Record a fact together with the source that backs it. The source is a
 * required argument: there is no way to construct a verified fact without one.
 */
export function verified<T>(value: T, source: string, note?: string): VerifiedFact<T> {
  if (!source.trim()) {
    throw new Error(
      'verified() requires a non-empty source. Use pending() if there is no evidence yet.',
    );
  }
  return note === undefined
    ? { verification: 'verified', value, source }
    : { verification: 'verified', value, source, note };
}

/** Record a gap. `label` names what still needs evidence. */
export function pending(label: string, note?: string): PendingFact {
  return note === undefined
    ? { verification: 'pending', label }
    : { verification: 'pending', label, note };
}

export function isVerified<T>(fact: Fact<T>): fact is VerifiedFact<T> {
  return fact.verification === 'verified';
}

/** Read a fact's value, or `undefined` when it is not yet evidenced. */
export function factValue<T>(fact: Fact<T>): T | undefined {
  return isVerified(fact) ? fact.value : undefined;
}

/** Read a fact's value, falling back to a safe non-claiming default. */
export function factValueOr<T>(fact: Fact<T>, fallback: T): T {
  return isVerified(fact) ? fact.value : fallback;
}

/** Keep only the verified entries of a list of facts. */
export function verifiedOnly<T>(facts: readonly Fact<T>[]): T[] {
  return facts.filter(isVerified).map((f) => f.value);
}

/* -------------------------------------------------------------------------- */
/* Domain content types                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A citation for a public technical standard.
 *
 * Standards content is educational: it describes what a published code
 * requires. It is kept structurally separate from company compliance claims,
 * which are `Fact<T>` values, so that "IRC:35 specifies X" can never be read
 * by a component as "we are certified to IRC:35".
 */
export interface StandardReference {
  /** e.g. "IRC:35" */
  readonly code: string;
  /** e.g. "Code of Practice for Road Markings" */
  readonly title: string;
  /** Issuing body, e.g. "Indian Roads Congress". */
  readonly issuer: string;
  /** Optional public URL for the standard or its official listing. */
  readonly url?: string;
}

export interface SpecificationRow {
  readonly parameter: string;
  readonly value: string;
  /** Optional standard this parameter derives from. */
  readonly basis?: string;
}

export interface ProcessStep {
  readonly title: string;
  readonly detail: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface CostFactor {
  readonly factor: string;
  readonly effect: string;
}

export interface Mistake {
  readonly mistake: string;
  readonly consequence: string;
  readonly instead: string;
}

/** Slugs are the URL identity of a service; keep them stable once published. */
export type ServiceSlug =
  | 'thermoplastic-road-marking'
  | 'highway-expressway-marking'
  | 'urban-road-marking'
  | 'runway-taxiway-marking'
  | 'logistics-parking-marking'
  | 'industrial-floor-marking'
  | 'road-studs-cat-eyes'
  | 'traffic-signboards'
  | 'highway-safety-assets';

export type IndustrySlug =
  | 'highways-expressways'
  | 'airports'
  | 'logistics-warehousing'
  | 'industrial'
  | 'smart-cities-urban';

/**
 * A service page. The section order here mirrors the answer-first template in
 * docs/03-service-page-structure.md and is enforced by the page component, so
 * every service answers the same procurement questions in the same order.
 */
export interface Service {
  readonly slug: ServiceSlug;
  readonly name: string;
  /** Short label for navigation and cards. */
  readonly shortName: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  /** The extractable answer: 40-60 words, plain language, no marketing. */
  readonly directAnswer: string;
  readonly summary: string;
  readonly specifications: readonly SpecificationRow[];
  readonly applications: readonly string[];
  readonly executionProcess: readonly ProcessStep[];
  readonly qualityChecks: readonly string[];
  readonly costFactors: readonly CostFactor[];
  readonly projectConsiderations: readonly string[];
  readonly commonMistakes: readonly Mistake[];
  readonly faqs: readonly FaqItem[];
  readonly standards: readonly StandardReference[];
  readonly industries: readonly IndustrySlug[];
  readonly relatedServices: readonly ServiceSlug[];
}

export interface Industry {
  readonly slug: IndustrySlug;
  readonly name: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly directAnswer: string;
  /** What this buyer is accountable for, in their own terms. */
  readonly buyerContext: readonly string[];
  readonly requirements: readonly string[];
  readonly services: readonly ServiceSlug[];
  readonly considerations: readonly string[];
  readonly faqs: readonly FaqItem[];
}

/**
 * A portfolio entry. Every field that constitutes a claim about work performed
 * is a `Fact`, so an incomplete or placeholder entry in the corporate deck
 * cannot become an assertion on the website.
 */
export interface PortfolioProject {
  readonly slug: string;
  readonly title: Fact<string>;
  readonly client: Fact<string>;
  readonly location: Fact<string>;
  readonly year: Fact<string>;
  readonly scope: Fact<readonly string[]>;
  readonly quantities: Fact<readonly SpecificationRow[]>;
  readonly services: readonly ServiceSlug[];
  readonly industry: IndustrySlug;
  /** Photographs of the actual work. Never stock or generated imagery. */
  readonly images: Fact<readonly { src: string; alt: string }[]>;
  readonly summary: Fact<string>;
}

export interface Machinery {
  readonly name: Fact<string>;
  readonly purpose: string;
  readonly quantity: Fact<number>;
}

export interface Certification {
  readonly name: Fact<string>;
  readonly issuer: Fact<string>;
  readonly identifier: Fact<string>;
  readonly validUntil: Fact<string>;
}
