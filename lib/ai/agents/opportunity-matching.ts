import { z } from 'zod';
import { claimSchema } from '../claims';
import { services } from '@/content/services';
import { company } from '@/content/company';
import type { Agent } from './types';

/**
 * AI Employee #2 — Opportunity Matching Agent.
 *
 * Turns a research record into a score a founder can act on, or argue with.
 *
 * The design decision that matters here is that **the model does not produce
 * the total.** It rates eight components 0–10 and writes a reason for each;
 * `scoreOpportunity()` in this file computes the weighted total and the A/B/C
 * priority in TypeScript. Three consequences:
 *
 *   - The score is reproducible. The same components always give the same
 *     total, so a change in ranking means the assessment changed, not that the
 *     model added differently this time.
 *   - The weights are visible, reviewable and adjustable in one place, rather
 *     than being an emergent property of a prompt.
 *   - A model cannot talk itself into priority A. It can rate a component
 *     generously — and the written reason for that rating is right there to be
 *     challenged — but it cannot bypass the arithmetic.
 *
 * Components and priority bands are those in docs/08-target-account-workflow.md.
 */

/* -------------------------------------------------------------------------- */
/* Components and weights                                                      */
/* -------------------------------------------------------------------------- */

export const SCORE_COMPONENTS = [
  'serviceFit',
  'projectFit',
  'locationFit',
  'scaleFit',
  'timingFit',
  'procurementFit',
  'portfolioRelevance',
  'strategicValue',
] as const;

export type ScoreComponent = (typeof SCORE_COMPONENTS)[number];

export const COMPONENT_LABELS: Record<ScoreComponent, string> = {
  serviceFit: 'Service fit',
  projectFit: 'Project fit',
  locationFit: 'Location fit',
  scaleFit: 'Scale fit',
  timingFit: 'Timing fit',
  procurementFit: 'Procurement fit',
  portfolioRelevance: 'Portfolio relevance',
  strategicValue: 'Strategic value',
};

export const COMPONENT_QUESTIONS: Record<ScoreComponent, string> = {
  serviceFit: 'Do they need what we execute?',
  projectFit: 'Do their live projects contain this scope?',
  locationFit: 'Can we mobilise there economically?',
  scaleFit: 'Is the package size one we can execute well?',
  timingFit: 'Is the marking scope near enough to be procured now?',
  procurementFit: 'Do they subcontract this, and can we get on the list?',
  portfolioRelevance: 'Do we have proof that speaks to them?',
  strategicValue: 'Does winning this open a category or a region?',
};

/**
 * Weights, summing to 100.
 *
 * Front-loaded onto the three components that decide whether there is a job at
 * all — do they need this work, is it live, and do they buy it from outside.
 * Strategic value is real but deliberately small: it is the component most
 * easily used to justify chasing an account that fails the practical tests.
 */
export const COMPONENT_WEIGHTS: Record<ScoreComponent, number> = {
  serviceFit: 20,
  projectFit: 20,
  locationFit: 12,
  scaleFit: 10,
  timingFit: 12,
  procurementFit: 14,
  portfolioRelevance: 6,
  strategicValue: 6,
};

const WEIGHT_TOTAL = Object.values(COMPONENT_WEIGHTS).reduce((sum, w) => sum + w, 0);

/* -------------------------------------------------------------------------- */
/* Scoring                                                                     */
/* -------------------------------------------------------------------------- */

export type Priority = 'a' | 'b' | 'c';

/** Band thresholds from the workflow document. */
export const PRIORITY_THRESHOLDS = { a: 75, b: 50 } as const;

export function priorityFor(score: number): Priority {
  if (score >= PRIORITY_THRESHOLDS.a) return 'a';
  if (score >= PRIORITY_THRESHOLDS.b) return 'b';
  return 'c';
}

export interface ScoredComponent {
  readonly component: ScoreComponent;
  readonly label: string;
  /** As rated by the agent, 0–10. */
  readonly rating: number;
  readonly weight: number;
  /** rating/10 × weight, rounded for display. */
  readonly contribution: number;
  readonly reasoning: string;
  /** True where the rating rests on nothing the research established. */
  readonly unevidenced: boolean;
}

export interface OpportunityScore {
  readonly total: number;
  readonly priority: Priority;
  readonly components: readonly ScoredComponent[];
  /**
   * Components rated on no evidence.
   *
   * Reported rather than silently excluded: an account scoring 80 on five
   * evidenced components and three guesses is a different proposition from one
   * scoring 80 on eight evidenced components, and the founder should be able
   * to see which they are looking at.
   */
  readonly unevidencedCount: number;
}

interface RatingLike {
  rating: number;
  reasoning: string;
  basedOn: readonly string[];
}

/**
 * Compute the total from the component ratings.
 *
 * Deliberately a plain function over plain data: it takes no model, no network
 * and no database, so it is directly testable and its output is a function of
 * its input alone.
 */
export function scoreOpportunity(
  ratings: Record<ScoreComponent, RatingLike>,
): OpportunityScore {
  const components: ScoredComponent[] = SCORE_COMPONENTS.map((component) => {
    const entry = ratings[component];
    const weight = COMPONENT_WEIGHTS[component];
    // Clamped rather than trusted: a model that returns 11 or -1 should not be
    // able to push the total outside 0–100.
    const rating = Math.max(0, Math.min(10, Number(entry?.rating ?? 0)));
    return {
      component,
      label: COMPONENT_LABELS[component],
      rating,
      weight,
      contribution: Math.round((rating / 10) * weight * 10) / 10,
      reasoning: entry?.reasoning ?? '',
      unevidenced: (entry?.basedOn?.length ?? 0) === 0,
    };
  });

  const raw = components.reduce((sum, c) => sum + (c.rating / 10) * c.weight, 0);
  const total = Math.round((raw / WEIGHT_TOTAL) * 100);

  return {
    total,
    priority: priorityFor(total),
    components,
    unevidencedCount: components.filter((c) => c.unevidenced).length,
  };
}

/* -------------------------------------------------------------------------- */
/* Agent                                                                       */
/* -------------------------------------------------------------------------- */

export const opportunityMatchingInputSchema = z.object({
  companyName: z.string().min(2).max(200),
  /** The research record, rendered as text. Passed in, never re-derived. */
  researchSummary: z.string().max(12_000),
  /** Facts already on the CRM record that the founder entered by hand. */
  knownContext: z.string().max(2000).optional(),
});

export type OpportunityMatchingInput = z.infer<typeof opportunityMatchingInputSchema>;

/**
 * One component rating.
 *
 * `basedOn` is the load-bearing field. It asks which specific findings from the
 * research support the rating, and an empty array is an honest answer that the
 * UI surfaces rather than hides — a rating with nothing behind it is a guess,
 * and a guess the founder can see is manageable.
 */
const ratingSchema = z.object({
  rating: z.number().int().min(0).max(10),
  reasoning: z.string().min(10).max(700),
  basedOn: z.array(z.string().max(300)).max(6).default([]),
});

export const opportunityMatchingOutputSchema = z.object({
  serviceFit: ratingSchema,
  projectFit: ratingSchema,
  locationFit: ratingSchema,
  scaleFit: ratingSchema,
  timingFit: ratingSchema,
  procurementFit: ratingSchema,
  portfolioRelevance: ratingSchema,
  strategicValue: ratingSchema,

  /** Which of our services this account most plausibly needs. */
  matchedServices: claimSchema(z.array(z.string().max(80)).max(9)),
  /** The specific, non-generic reason to approach them. */
  entryPoint: claimSchema(z.string().max(900)),
  /** What would have to be true for this to be worth pursuing. */
  keyRisks: z.array(z.string().max(300)).max(8).default([]),
  /** A recommendation, never a decision. */
  recommendedNextAction: claimSchema(z.string().max(400)),
  /** Two or three sentences the founder can read instead of the components. */
  verdict: z.string().min(20).max(1200),
});

export type OpportunityMatchingOutput = z.infer<typeof opportunityMatchingOutputSchema>;

const SERVICE_LIST = services.map((s) => `${s.slug} — ${s.name}`).join('\n  - ');
/*
 * Location fit is rated against where we have actually worked, not where we
 * would like to. The verified content layer is the only source for that, and
 * when it says nothing the agent is told to treat location as uncertain rather
 * than assume national coverage.
 */
const statesFact = company.operatingRegions.statesWorkedIn;
const REGION_NOTE =
  statesFact.verification === 'verified'
    ? `Verified execution experience: ${statesFact.value}. We mobilise elsewhere, but treat states outside that as a mobilisation cost, not as established presence.`
    : 'Our verified operating regions are not recorded yet. Treat location fit as uncertain and say so in the reasoning.';

const COMPONENT_BRIEF = SCORE_COMPONENTS.map(
  (c) => `  ${COMPONENT_LABELS[c]} (${c}) — ${COMPONENT_QUESTIONS[c]}`,
).join('\n');

const SYSTEM = `You are the opportunity assessor for Bageshwar Balaji Construction Co., an Indian road safety and infrastructure marking contractor. You read a research record on a target company and rate how good an opportunity it is.

What we execute:
  - ${SERVICE_LIST}

${REGION_NOTE}

WHAT YOU PRODUCE

Eight component ratings, each 0-10, each with written reasoning:

${COMPONENT_BRIEF}

You do NOT produce a total score or a priority. Those are computed from your
component ratings by code you cannot influence. Rate each component on its own
merits; do not adjust one to steer an outcome.

THE RATING SCALE

  0-2   Clearly poor, or the research shows the opposite of what we need.
  3-4   Weak. Possible but nothing supports it.
  5-6   Plausible, unproven. Use this when you are reasoning rather than citing.
  7-8   Good, supported by something specific in the research.
  9-10  Strong and directly evidenced.

Ratings of 7 or above should be rare unless the research actually establishes
the point. If the research says "unknown", that is not a reason to rate 5 out
of politeness — rate what the absence of evidence deserves and say so.

RULES YOU MUST NOT BREAK

1. "basedOn" must quote or name the specific research findings behind the
   rating. If nothing in the research supports it, return an empty array and
   say plainly in the reasoning that you are reasoning without evidence. An
   empty basedOn is an accepted answer; a fabricated one is not.
2. Do not introduce new facts. You are assessing the research you were given.
   If the research does not mention a project, you do not know about it.
3. Never state or estimate a price, a rate, a margin or a contract value that
   the research did not report. We do not quote from a model.
4. Do not name individual people and do not produce any email address or phone
   number. Contact research is a separate step with its own sourcing rules.
5. Do not claim we are an approved or empanelled vendor anywhere. Do not claim
   certifications. Assess the opportunity, not our credentials.
6. recommendedNextAction is a recommendation for a human to accept or reject.
   Never write it as a decision that has been taken.
7. The entry point must be specific to THIS company. If the sentence would be
   equally true of any highway contractor in India, it is not an entry point,
   and you should say the research is too thin to find one.

A low score is a useful answer. This business has limited outreach effort, and
telling the founder an account is not worth chasing saves more than flattering
a weak account costs.`;

export const opportunityMatchingAgent: Agent<
  OpportunityMatchingInput,
  OpportunityMatchingOutput
> = {
  name: 'opportunity-matching',
  promptVersion: 'v1',
  inputSchema: opportunityMatchingInputSchema,
  outputSchema: opportunityMatchingOutputSchema,
  // Scoring produces a recommendation for internal reading. It changes nothing
  // outside the business, and the bid/no-bid decision it informs is a human's.
  requiresApproval: false,
  system: SYSTEM,

  buildPrompt(input) {
    const lines = [
      `Assess this account as an opportunity.`,
      ``,
      `Company: ${input.companyName}`,
      ``,
      `RESEARCH RECORD`,
      input.researchSummary,
    ];
    if (input.knownContext) {
      lines.push(``, `FOUNDER'S OWN NOTES`, input.knownContext);
    }
    lines.push(
      ``,
      `Rate all eight components. For each, name what in the research record`,
      `supports the rating, or return an empty basedOn and say you are`,
      `reasoning without evidence.`,
      ``,
      `Where the research says something is unknown, rate it as unknown`,
      `deserves. Do not compensate with an average rating.`,
    );
    return lines.join('\n');
  },
};
