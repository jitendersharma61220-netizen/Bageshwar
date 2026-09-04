# 08 — Target account workflow

From "this company might be relevant" to "here is the brief and the drafted
outreach, waiting for your approval."

## The loop

```
  ┌──────────────────────────────────────────────────────────────┐
  │  1  ADD TARGET            founder adds a company             │
  ├──────────────────────────────────────────────────────────────┤
  │  2  RESEARCH              Market Research Agent              │
  │       company, projects, footprint, sources                  │
  ├──────────────────────────────────────────────────────────────┤
  │  3  MATCH & SCORE         Opportunity Matching Agent         │
  │       0-100, priority A/B/C, with reasoning                  │
  ├──────────────────────────────────────────────────────────────┤
  │  4  GATE                  score below threshold -> nurture   │
  ├──────────────────────────────────────────────────────────────┤
  │  5  DECISION MAKERS       Decision Maker Research Agent      │
  │       roles, and named individuals where public              │
  ├──────────────────────────────────────────────────────────────┤
  │  6  ACCOUNT BRIEF         Account Strategist                 │
  ├──────────────────────────────────────────────────────────────┤
  │  7  DECK                  personalized deck (doc 09)         │
  ├──────────────────────────────────────────────────────────────┤
  │  8  OUTREACH DRAFT        Outreach Agent                     │
  ├──────────────────────────────────────────────────────────────┤
  │  9  ►► FOUNDER APPROVAL ◄◄   nothing sends without this      │
  ├──────────────────────────────────────────────────────────────┤
  │ 10  SEND & TRACK          CRM records; Follow-up Agent runs  │
  └──────────────────────────────────────────────────────────────┘
```

## Target account types

EPC companies · highway contractors · infrastructure developers · toll road
operators · concessionaires · airport infrastructure companies · industrial
developers · logistics park developers · warehouse developers · smart-city
contractors · road contractors · large construction contractors.

## Step 2 — Research

The Market Research Agent produces one account record:

| Field | Type |
| --- | --- |
| `company_name`, `website`, `industry`, `hq_location` | `Claim<string>` |
| `operating_regions`, `project_types` | `Claim<string[]>` |
| `current_projects`, `upcoming_projects` | `Claim<Project[]>` |
| `relevant_service_match` | `Claim<ServiceSlug[]>` |
| `estimated_opportunity_type` | `Claim<string>` |
| `existing_vendor_information_if_public` | `Claim<string>` |
| `decision_maker_candidates` | deferred to step 5 |
| `source_urls` | `Source[]`, always populated |
| `research_date`, `confidence_score` | metadata |

**Every research claim carries its source.** Anything not found is returned as
`unknown`. The agent is explicitly instructed and structurally constrained not
to fill gaps plausibly — an empty field is information; an invented one is
damage.

## Step 3 — Scoring

Eight components, each 0–10, weighted to a 0–100 total:

| Component | Question |
| --- | --- |
| Service fit | Do they need what we execute? |
| Project fit | Do their live projects contain this scope? |
| Location fit | Can we mobilise there economically? |
| Scale fit | Is the package size one we can execute well? |
| Timing fit | Is the marking scope near enough to be procured now? |
| Procurement fit | Do they subcontract this, and can we get on the list? |
| Portfolio relevance | Do we have proof that speaks to them? |
| Strategic value | Does winning this open a category or a region? |

Priority: **A** ≥ 75 (act now) · **B** 50–74 (nurture) · **C** < 50 (park).

The written reasoning is mandatory. A number without a reason cannot be argued
with, checked, or learned from.

## Step 5 — Decision makers

Priority roles, in order of usefulness to us: Procurement Head · Purchase Head ·
Project Director · Construction Head · Project Manager · Contracts Head ·
Commercial Head · Vendor Development · Tendering & Estimation · Business
Development.

Per contact: `name`, `designation`, `company`, `public_source_url`,
`confidence`, `relevance`.

Constraints, repeated here because they matter more than anything else in this
workflow:

- **No fabricated contact details.** Email addresses are never pattern-derived.
- **No scraping of private or sensitive data.** Public professional sources only.
- Where no individual can be found, return the **role** to target. That is a
  usable output; a plausible invented person is not.

## Step 6 — The account brief

One page. Company overview · relevant projects · likely requirements · relevant
services · relevant portfolio proof · likely pain points · potential entry point
· decision makers · recommended outreach angle · recommended deck · recommended
CTA.

Every statement is labelled `fact`, `inference`, `recommendation` or `unknown`
and links to its sources. The founder should be able to tell at a glance what is
established and what is reasoning.

## Step 9 — The approval gate

The founder sees the brief, the deck and the drafted message together, and can
approve, edit, or reject with a reason. Rejection reasons are stored and
reviewed — they are the training signal for prompt revision.

**Nothing leaves the building without this step.** Not in the MVP, not later.
This is a deliberate design constraint, not a temporary limitation pending
better models: outbound communication from a real infrastructure business to
real procurement teams carries reputational risk that no autonomy gain justifies.

## Quality bar

An account is only ready for outreach when:

- [ ] Company and at least one relevant project are documented with sources
- [ ] A service match is identified and explained
- [ ] The opportunity is scored with written reasoning
- [ ] At least one decision maker or target role is identified with a source
- [ ] The outreach draft contains a specific, genuine reason for contacting *this*
      company — one that could not be copied to another
- [ ] No claim in the brief, deck or message is unsupported by the verified
      content layer

Any unchecked box sends it back rather than out.
