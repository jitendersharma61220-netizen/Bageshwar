# 07 — AI architecture

## Principle

Reliable workflows first. Automation second. Autonomy later.

We are not building an autonomous agent swarm. We are building seven
well-scoped, individually testable workflows, each with a typed input, a typed
output, a recorded audit trail, and — where the effect leaves the building — a
mandatory human approval gate.

## Provider abstraction

Gemini is the initial provider because the founder already has Gemini Pro. The
architecture assumes it will be replaced.

```
lib/ai/
  provider.ts          AIProvider interface
  providers/gemini.ts
  providers/openai.ts
  registry.ts          resolves from AI_PROVIDER
  claims.ts            Claim<T> governance wrapper
  agents/              the seven agents
  runner.ts            logging, gating, enforcement
```

```ts
export interface AIProvider {
  readonly name: string;
  generateObject<T>(args: {
    schema: z.ZodType<T>;
    system: string;
    prompt: string;
    temperature?: number;
  }): Promise<{ value: T; model: string; usage: TokenUsage }>;

  generateText(args: {
    system: string;
    prompt: string;
  }): Promise<{ text: string; model: string; usage: TokenUsage }>;
}
```

No agent imports a provider directly. Agents receive an `AIProvider` and are
therefore testable against a stub with no network access.

## Claim governance

Every factual field an agent produces is wrapped:

```ts
export type ClaimStatus = 'fact' | 'inference' | 'recommendation' | 'unknown';

export interface Source {
  url: string;
  title?: string;
  fetchedAt: string;
}

export interface Claim<T> {
  value: T;
  status: ClaimStatus;
  sources: Source[];
  confidence: number;   // 0-1
  note?: string;
}
```

| Status | Means |
| --- | --- |
| `fact` | Directly supported by a named source |
| `inference` | Reasoned from evidence, but not directly stated by it |
| `recommendation` | Our suggested action |
| `unknown` | Not established. **This is a valid, expected output** |

### Two structural guarantees

These are enforced in code and in the database, not requested in a prompt:

1. **Sourcing.** `runner.ts` inspects every `Claim` before persisting. A claim
   with `status: 'fact'` and zero sources is downgraded to `unknown` and the
   downgrade is logged. The database `check` constraint in
   [05](./05-database-schema.md) rejects it as a second line of defence.

2. **Approval.** Each agent declares `requiresApproval`. For those that do, the
   runner writes a pending-approval record and returns; it has no code path that
   performs the outward action. Sending, quoting and deciding are separate,
   human-triggered operations.

A model can be prompted to behave well and sometimes will not. A constraint
cannot be persuaded.

## The seven agents

### 1. Market Research Agent

**In:** a company name or website. **Out:** an account record with a `Claim` per
field, plus every source consulted.

Finds the company, its active and upcoming projects, geographic footprint,
project categories, likely subcontracting opportunities, relevant services, and
publicly available vendor information. Anything not found is `unknown` — never
filled in plausibly.

`requiresApproval: false` (research is internal and reversible).

### 2. Opportunity Matching Agent

**In:** an account record plus our capability set. **Out:** a score of 0–100
with a component breakdown and written reasoning.

Scores service fit, project fit, location fit, scale fit, timing fit, likely
procurement fit, portfolio relevance and strategic value. Assigns priority
A (immediate), B (nurture) or C (low), and — importantly — explains why. A score
without reasoning is not actionable.

`requiresApproval: false`.

### 3. Decision Maker Research Agent

**In:** a company. **Out:** candidate roles and named individuals where
publicly documented.

Priority roles: Procurement Head, Purchase Head, Project Director, Construction
Head, Project Manager, Contracts Head, Commercial Head, Vendor Development,
Tendering/Estimation, Business Development.

**Hard constraints, enforced in the output schema:**

- Every contact requires a `public_source_url`. No source, no record.
- **No fabricated contact information.** Email addresses and phone numbers are
  never guessed, pattern-derived, or inferred from a company's email format.
- **No scraping of private or sensitive data.** Public professional sources only.

Where an individual cannot be identified, the agent returns the *role* to
target. A named role is useful; an invented person is a liability.

`requiresApproval: false` for research; the resulting outreach is gated.

### 4. Account Strategist

**In:** account record, scores, contacts, our portfolio. **Out:** a one-page
account brief.

Company overview, relevant projects, likely requirements, relevant services,
relevant portfolio proof, likely pain points, potential entry point, decision
makers, recommended outreach angle, recommended deck, recommended CTA.

`requiresApproval: false` (internal document).

### 5. Outreach Agent

**In:** account brief and target contact. **Out:** a drafted email, LinkedIn
message and follow-up sequence.

Structure: **Observation → Relevance → Proof → Low-friction CTA.**

Every message must contain a genuine, specific reason for contacting *that*
company. A draft that would read identically to another company is rejected by
review, not softened.

**Prohibited outputs, enforced in the prompt and checked in review:**

- Any claim of being an approved or empanelled vendor unless verified in
  `company.approvals`
- Any project, client, certification or statistic not present in the verified
  content layer
- Generic template language

`requiresApproval: **true**`. Nothing is sent without founder approval.

### 6. Follow-up Agent

**In:** outreach history and pipeline state. **Out:** a recommended next action
and timing, per the rules in [06](./06-crm-pipeline.md).

`requiresApproval: **true**` for anything that sends.

### 7. Tender Analyst

**In:** a tender PDF, BOQ or RFP. **Out:** structured extraction plus a
capability match.

Extracts scope, quantities, technical specifications, eligibility, deadlines,
required documents, commercial requirements, quality requirements, project
location, execution timeline, penalties, EMD/security and relevant work
categories. Then maps requirements against our capabilities and outputs a
**BID / NO-BID / REVIEW recommendation with reasons.**

**The agent never makes the bid decision.** `tenders.bid_recommendation` and
`tenders.human_decision` are separate columns for exactly this reason.

`requiresApproval: **true**`.

## What requires human approval

| Action | Gate |
| --- | --- |
| External outreach | Founder approval before send |
| Quotations | Named approver, enforced NOT NULL |
| Bid / no-bid | Human decision column, separate from the recommendation |
| Technical specifications | Engineer review |
| Pricing | Rates only from rate card, verified supplier data, historical data, or manual entry |
| Contractual communication | Founder approval |
| Final project decisions | Founder or project engineer |

## The BOQ and estimation boundary

The estimation assistant (Iteration 11) may:

- extract items, descriptions, units, quantities, specifications, locations and
  timelines from a document
- structure a worksheet across material, labour, machinery, transport,
  mobilisation, site overhead, testing, safety, contingency and margin
- compute totals from rates supplied to it

It may **not** supply a rate. `estimate_lines.rate_source` has no value meaning
"model generated". This is not a policy that could be relaxed later — it is
the difference between a useful tool and a quotation nobody can stand behind.

## Logging

Every invocation writes `ai_tasks` (input, agent, timing, token usage) and
`ai_outputs` (result with governance columns). Every approval, send and decision
writes to the append-only `ai_audit_log`. When a claim on the founder's screen
is questioned, the chain from claim to source to run is reconstructable.
