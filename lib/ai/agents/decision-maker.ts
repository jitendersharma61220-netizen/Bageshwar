import { z } from 'zod';
import { claimSchema } from '../claims';
import type { Agent } from './types';

/**
 * AI Employee #3 — Decision Maker Research Agent.
 *
 * Finds who to approach at a target company.
 *
 * This is the agent most likely to cause real damage if it invents, because
 * the invention would be a person and a way to reach them. A fabricated
 * project name is embarrassing; a fabricated email address is an outreach
 * message to a stranger, or to nobody, sent under the company's name.
 *
 * So the defence is structural rather than instructional. **The output schema
 * has no email field and no phone field.** Not an optional one, not a
 * nullable one — none. A model cannot return what the schema cannot hold, and
 * the schema is enforced by the provider before the runner sees the value.
 *
 * That leaves one gap: a model told it has nowhere to put an email address
 * will sometimes write it into a sentence instead. The runner scrubs every
 * string in every output (`lib/ai/pii.ts`), so the note field is covered too.
 *
 * What the agent returns instead is what is actually useful and actually
 * knowable from public sources: the roles that own this procurement, and named
 * individuals only where a public professional page says so and the URL is
 * given. Where no individual can be found, the role is the answer. A role is a
 * usable output — the founder can call the switchboard and ask for the
 * procurement head. A plausible invented person is not.
 */

/* -------------------------------------------------------------------------- */
/* Roles                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The roles worth approaching, in order of usefulness to us.
 *
 * From docs/08-target-account-workflow.md. Held as an enum rather than free
 * text so a returned role maps onto something the CRM can group and filter,
 * and so "Head of Synergy" cannot arrive as a target.
 */
export const TARGET_ROLES = [
  'procurement_head',
  'purchase_head',
  'project_director',
  'construction_head',
  'project_manager',
  'contracts_head',
  'commercial_head',
  'vendor_development',
  'tendering_estimation',
  'business_development',
  'other',
] as const;

export type TargetRole = (typeof TARGET_ROLES)[number];

export const ROLE_LABELS: Record<TargetRole, string> = {
  procurement_head: 'Procurement Head',
  purchase_head: 'Purchase Head',
  project_director: 'Project Director',
  construction_head: 'Construction Head',
  project_manager: 'Project Manager',
  contracts_head: 'Contracts Head',
  commercial_head: 'Commercial Head',
  vendor_development: 'Vendor Development',
  tendering_estimation: 'Tendering & Estimation',
  business_development: 'Business Development',
  other: 'Other',
};

/* -------------------------------------------------------------------------- */
/* Schema                                                                      */
/* -------------------------------------------------------------------------- */

export const decisionMakerInputSchema = z.object({
  companyName: z.string().min(2).max(200),
  website: z.string().max(300).optional(),
  /** Which of their projects we are interested in, so relevance is specific. */
  opportunityContext: z.string().max(4000).optional(),
});

export type DecisionMakerInput = z.infer<typeof decisionMakerInputSchema>;

/**
 * A named individual.
 *
 * Note what is not here: no email, no phone, no mobile, no direct line. The
 * only routes to a person this schema can carry are a company page and a
 * professional profile, both of which are URLs a human can open and check.
 *
 * `publicSourceUrl` is required, not optional. A person with no source cannot
 * be expressed, which is a stronger guarantee than a prompt asking nicely.
 */
const individualSchema = z.object({
  name: z.string().min(2).max(160),
  designation: z.string().max(200),
  role: z.enum(TARGET_ROLES),
  /**
   * The public page that names this person in this role. Required.
   */
  publicSourceUrl: z.url().max(2000),
  /** What kind of page that is, so a reviewer knows how much to trust it. */
  sourceType: z.enum([
    'company_website',
    'linkedin_profile',
    'press_release',
    'annual_report',
    'tender_document',
    'news_article',
    'other',
  ]),
  /** A professional profile URL, where one is public. Never derived. */
  profileUrl: z.url().max(2000).nullable(),
  /** Why this person, for this opportunity, in one or two sentences. */
  relevance: z.string().max(600),
  /** How sure the agent is that this person currently holds this role. */
  confidence: z.number().min(0).max(1),
  /** Anything a human should check before this name is used. */
  caveat: z.string().max(400).nullable(),
});

export type DecisionMakerIndividual = z.infer<typeof individualSchema>;

/**
 * A role to target when no individual can be found.
 *
 * The fallback that makes "I could not find anyone" a complete answer rather
 * than a failure, and therefore makes it safe for the agent to give.
 */
const roleTargetSchema = z.object({
  role: z.enum(TARGET_ROLES),
  /** The company's own words for it, where known. */
  likelyTitle: z.string().max(200).nullable(),
  whyThisRole: z.string().max(600),
  /** How to reach the function without a name: switchboard, vendor portal. */
  suggestedApproach: z.string().max(600),
});

export const decisionMakerOutputSchema = z.object({
  /**
   * Named individuals, each with a required source URL.
   *
   * Capped low on purpose. A long list of names is a symptom of a model
   * pattern-filling an org chart, and this is not a lead-scraping tool: three
   * or four sourced names is more than enough to open a conversation.
   */
  individuals: z.array(individualSchema).max(6).default([]),

  /** Roles to target. Always populated, whether or not names were found. */
  roles: z.array(roleTargetSchema).min(1).max(6),

  /**
   * How the company appears to take on vendors, where publicly stated: a
   * vendor registration portal, an empanelment process, a tender portal.
   */
  vendorOnboarding: claimSchema(z.string().max(900)),

  /** Which role most likely decides on marking and safety subcontracts. */
  primaryTarget: claimSchema(z.enum(TARGET_ROLES)),

  /** What the agent could not establish and a human should check. */
  openQuestions: z.array(z.string().max(300)).max(10).default([]),

  /**
   * Explicitly stated when the agent found nobody.
   *
   * A boolean the UI can act on, so "no individuals found" renders as a clear
   * outcome rather than as an empty list that looks like a bug.
   */
  noIndividualsFound: z.boolean().default(false),
});

export type DecisionMakerOutput = z.infer<typeof decisionMakerOutputSchema>;

/* -------------------------------------------------------------------------- */
/* Agent                                                                       */
/* -------------------------------------------------------------------------- */

const ROLE_LIST = TARGET_ROLES.filter((r) => r !== 'other')
  .map((r) => `${r} (${ROLE_LABELS[r]})`)
  .join('\n  - ');

const SYSTEM = `You are researching who to approach at a target company on behalf of Bageshwar Balaji Construction Co., an Indian road safety and infrastructure marking contractor seeking marking and safety subcontract work.

WHAT YOU ARE LOOKING FOR

The roles that own procurement of road marking and highway safety subcontracts:
  - ${ROLE_LIST}

And, only where a public professional page names them, the individuals holding
those roles.

THE RULES THAT MATTER MOST

1. NEVER produce an email address. Not a real one, not a guessed one, not a
   pattern like firstname.lastname@company.com, not in any field, not inside a
   sentence, not as an example. There is nowhere in your output for one to go.
2. NEVER produce a phone number, mobile number or direct line, in any field or
   inside any sentence.
3. Every named individual MUST have a publicSourceUrl: a public page that names
   that person in that role. If you cannot give the URL, do not give the name.
   There is no exception to this. A name without a source is worse than no name,
   because it looks like research.
4. Use only public professional sources: the company's own website, press
   releases, annual reports, tender documents, news coverage, public
   professional profiles. Never personal or private information: home address,
   personal accounts, family, anything about someone's private life.
5. If you cannot find any individual, that is a normal and useful result. Set
   noIndividualsFound to true, return an empty individuals array, and give the
   roles to target instead. The founder can telephone the office and ask for
   the procurement head — that works. A wrong name does not.
6. People change jobs. A source from three years ago may be stale. Set
   confidence accordingly and put the date or staleness into the caveat.
7. Do not infer a person's role from their employer plus a job title elsewhere.
   The source must connect this person to this role at this company.
8. Do not claim we are an approved, empanelled or registered vendor anywhere.

WHY THIS IS STRICT

The output of this step becomes an outreach message to a real procurement team
at a real infrastructure business. A fabricated name or address is not a
harmless error there — it is a message to nobody sent under our name, or a
message to a stranger. The founder can work with "call the office and ask for
procurement". The founder cannot work with a plausible person who does not
exist.`;

export const decisionMakerAgent: Agent<DecisionMakerInput, DecisionMakerOutput> = {
  name: 'decision-maker',
  promptVersion: 'v1',
  inputSchema: decisionMakerInputSchema,
  outputSchema: decisionMakerOutputSchema,
  /*
   * Research does not itself contact anyone, so it does not gate. What it
   * produces is proposed, not written: names arrive in the CRM as candidates a
   * human adds one at a time, never as an automatic import. The approval that
   * matters — before anything is sent — is on the outreach agent.
   */
  requiresApproval: false,
  system: SYSTEM,

  buildPrompt(input) {
    const lines = [
      `Find who to approach at this company about road marking and highway`,
      `safety subcontract work.`,
      ``,
      `Company: ${input.companyName}`,
    ];
    if (input.website) lines.push(`Website: ${input.website}`);
    if (input.opportunityContext) {
      lines.push(``, `The opportunity we are pursuing:`, input.opportunityContext);
    }
    lines.push(
      ``,
      `Return the roles to target in every case. Return named individuals only`,
      `where a public page names them in that role, and give that page's URL.`,
      ``,
      `If you find nobody, say so — set noIndividualsFound and give the roles.`,
      `Do not produce an email address or a phone number anywhere in your`,
      `answer.`,
    );
    return lines.join('\n');
  },
};

/* -------------------------------------------------------------------------- */
/* Guard                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Drop individuals whose source did not survive.
 *
 * The schema requires a source URL, so this normally removes nothing. It
 * exists for the case where a value reaches this code by another route — a
 * stored record from an older prompt version, a hand-edited fixture — because
 * a name without a source must not reach the review UI looking like research
 * whatever path it arrived by.
 */
export function withSourcedIndividualsOnly(
  output: DecisionMakerOutput,
): { output: DecisionMakerOutput; dropped: number } {
  const kept = output.individuals.filter(
    (person) => typeof person.publicSourceUrl === 'string' && person.publicSourceUrl.length > 0,
  );
  return {
    output: {
      ...output,
      individuals: kept,
      noIndividualsFound: output.noIndividualsFound || kept.length === 0,
    },
    dropped: output.individuals.length - kept.length,
  };
}
