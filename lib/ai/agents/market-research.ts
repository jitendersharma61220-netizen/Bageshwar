import { z } from 'zod';
import { claimSchema } from '../claims';
import { COMPANY_CATEGORIES } from '@/lib/crm/types';
import { services } from '@/content/services';
import type { Agent } from './types';

/**
 * AI Employee #1 — Market Research Agent.
 *
 * Takes a company name and produces a structured account record in which every
 * factual field is a Claim carrying its status and sources.
 *
 * The agent is instructed, and the schema is shaped, so that "I could not
 * establish this" is an easy and expected answer. An empty field is
 * information; an invented one is damage that will surface in front of a
 * procurement manager.
 */

export const marketResearchInputSchema = z.object({
  companyName: z.string().min(2).max(200),
  website: z.string().max(300).optional(),
  /** Anything the founder already knows, passed through to avoid re-deriving it. */
  knownContext: z.string().max(2000).optional(),
});

export type MarketResearchInput = z.infer<typeof marketResearchInputSchema>;

const projectSchema = z.object({
  name: z.string().max(250),
  stage: z.enum(['current', 'upcoming', 'completed', 'unknown']),
  location: z.string().max(200).nullable(),
  scopeSummary: z.string().max(600).nullable(),
  valueIfPublic: z.string().max(120).nullable(),
});

export const marketResearchOutputSchema = z.object({
  companyName: claimSchema(z.string().max(200)),
  website: claimSchema(z.string().max(300)),
  category: claimSchema(z.enum(COMPANY_CATEGORIES)),
  hqLocation: claimSchema(z.string().max(200)),
  operatingRegions: claimSchema(z.array(z.string().max(100)).max(40)),

  currentProjects: claimSchema(z.array(projectSchema).max(20)),
  upcomingProjects: claimSchema(z.array(projectSchema).max(20)),

  /** Which of our services their work could plausibly require. */
  relevantServices: claimSchema(z.array(z.string().max(80)).max(12)),
  opportunityType: claimSchema(z.string().max(400)),

  /** Only where publicly reported. Never inferred from "someone must do it". */
  existingVendorInfo: claimSchema(z.string().max(600)),

  /**
   * Roles worth targeting. Deliberately roles, not people: naming individuals
   * is the Decision Maker agent's job, and it has its own sourcing rule.
   */
  decisionMakerRoles: claimSchema(z.array(z.string().max(120)).max(12)),

  /** A short readable summary for the account brief. */
  summary: claimSchema(z.string().max(1500)),

  /** Anything the agent could not establish and thinks a human should check. */
  openQuestions: z.array(z.string().max(300)).max(12).default([]),
});

export type MarketResearchOutput = z.infer<typeof marketResearchOutputSchema>;

const SERVICE_LIST = services.map((s) => `${s.slug} (${s.name})`).join('\n  - ');

const SYSTEM = `You are a market research analyst for Bageshwar Balaji Construction Co., an Indian road safety and infrastructure marking contractor. Your job is to build an accurate, sourced picture of a target company so a founder can decide whether to pursue it.

The company you work for executes:
  - ${SERVICE_LIST}

HOW TO ANSWER

Every factual field is a claim with a status. Choose it honestly:
  - "fact"           you have a specific source that states this directly. You MUST list that source.
  - "inference"      you reasoned it from evidence. Say what evidence in the note.
  - "recommendation" your suggested action or judgement.
  - "unknown"        you could not establish it. Set value to null.

RULES YOU MUST NOT BREAK

1. Never mark something "fact" without at least one source URL. An unsourced
   assertion must be "inference" or "unknown". This is checked automatically
   and a violation is downgraded and recorded against your prompt.
2. "unknown" is a good answer. A field you cannot establish is far more useful
   empty than filled in plausibly. Do not guess project names, values,
   locations or vendor relationships.
3. Do not name individual people. Return the ROLES worth approaching. Naming
   individuals is a separate step with its own sourcing requirements.
4. Do not invent contact details of any kind.
5. Do not state that the company uses, or does not use, a particular
   contractor unless a source says so. "They must use someone" is not evidence.
6. Prefer specific recent evidence — a tender award, an annual report, a
   project page — over general company description.
7. Put anything a human should verify into openQuestions.

You are helping decide where to spend a small business's limited outreach
effort. An account record padded with plausible guesses is worse than a short
one, because it wastes that effort on a false picture.`;

export const marketResearchAgent: Agent<MarketResearchInput, MarketResearchOutput> = {
  name: 'market-research',
  promptVersion: 'v1',
  inputSchema: marketResearchInputSchema,
  outputSchema: marketResearchOutputSchema,
  // Research changes nothing outside the business and is reversible, so it
  // does not gate. What it produces feeds agents that do.
  requiresApproval: false,
  system: SYSTEM,

  buildPrompt(input) {
    const lines = [
      `Research this company as a potential client.`,
      ``,
      `Company: ${input.companyName}`,
    ];
    if (input.website) lines.push(`Website: ${input.website}`);
    if (input.knownContext) {
      lines.push(``, `What we already know (do not contradict without a source):`, input.knownContext);
    }
    lines.push(
      ``,
      `Establish: what they do, where they operate, what infrastructure projects`,
      `they have live or upcoming, which of our services those projects could`,
      `require, and which roles would own that procurement.`,
      ``,
      `Mark as "unknown" anything you cannot source. Do not fill gaps with`,
      `plausible detail.`,
    );
    return lines.join('\n');
  },
};
