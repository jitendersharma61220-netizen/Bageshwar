# 10 — 30-day roadmap

Twelve iterations across four weeks. **No iteration starts until the previous
one is tested, its issues fixed, and the change documented.**

## Week 1 — Inbound foundation

### Iteration 1 — Website foundation ✅ **complete**

All pages, the verification-gated content layer, the design system, SEO
foundations, and a working enquiry pipeline.

*Exit criteria (all met):* typecheck and lint clean; content audit passes; 29
routes prerender; every route returns 200 with a unique title and one `h1`;
JSON-LD valid with `FAQPage` only where FAQs render; enquiry API validates,
rate-limits and delivers.

### Iteration 2 — SEO / AEO content architecture

Write the first six insight articles against the Tier 2 and Tier 3 questions in
[04](./04-seo-aeo-architecture.md). Submit the sitemap to Search Console. Set
the GA4 property live.

*Exit:* six substantial articles published, each linked to its primary service;
Search Console verified and receiving the sitemap; GA4 recording page views and
enquiry submissions.

### Iteration 3 — Lead capture & BOQ upload

Supabase project. Apply the `website_leads` schema. Add `SupabaseSink` behind
the existing `LeadSink` interface. Add authenticated file upload to a private
bucket for BOQ and tender documents.

*Exit:* enquiries land in `website_leads`; documents upload to a private bucket
with type and size validation; the email notification still fires; no page or
form component changed.

## Week 2 — Internal system

### Iteration 4 — CRM

Supabase Auth. Apply the account, contact, opportunity and outreach schema with
RLS. Build the pipeline board and the account detail view. Build the Founder
Command Center shell.

*Exit:* founder can sign in; add a company by hand; move it through stages;
website leads appear in the pipeline.

### Iteration 5 — Target Account Engine

The AI provider abstraction, the claim governance layer, the runner with its
logging and gates, and the Market Research Agent.

*Exit:* researching a company produces a sourced account record; every claim
carries its status and sources; an unsourced fact is demonstrably downgraded;
`ai_tasks` and `ai_outputs` are populated.

### Iteration 6 — Decision maker research

The Opportunity Matching Agent and the Decision Maker Research Agent.

*Exit:* accounts are scored 0–100 with component breakdown and reasoning;
contacts carry public source URLs; **no fabricated contact detail appears in any
output** — verified by review of a sample of at least twenty accounts.

## Week 3 — Outbound

### Iteration 7 — Account brief

The Account Strategist. One-page briefs rendered in the CRM with claim labels
and source links throughout.

*Exit:* a brief is generated for a real target and is genuinely useful for a
first call, judged by the founder actually using one.

### Iteration 8 — Personalized deck generator

Master deck ingestion, slide manifest model, account deck generation, draft
review UI.

*Exit:* an account deck is generated containing only master-deck claims; the
verification gate demonstrably excludes unpublishable portfolio slides.

### Iteration 9 — Outreach & follow-up

The Outreach Agent and the Follow-up Agent, with the approval queue.

*Exit:* drafts are generated with a specific per-company reason; nothing sends
without approval; follow-up recommendations match the rules in
[06](./06-crm-pipeline.md); replies are tracked against the pipeline.

## Week 4 — Tender, estimation, measurement

### Iteration 10 — Tender intelligence

Tender capture, the Tender Analyst, and BID / NO-BID / REVIEW recommendations
with reasons.

*Exit:* a real tender PDF is extracted accurately; the recommendation carries
reasoning; `human_decision` remains separate and required.

### Iteration 11 — BOQ estimation assistant

BOQ extraction, the estimation worksheet, and the rate card.

*Exit:* a BOQ is extracted into structured items; a worksheet computes from rate
card values only; **there is no path by which a model supplies a rate**; a
quotation cannot be issued without a named approver.

### Iteration 12 — Power BI analytics

The reporting data model and the four dashboards: sales, marketing, tender,
operations. The AI Visibility Tracker feeding `search_visibility`.

*Exit:* Power BI connects to the reporting views; dashboards render real data;
AI visibility is tracked for the eight queries in
[04](./04-seo-aeo-architecture.md).

## Deferred beyond 30 days

Iteration 7 of the original brief — AI project operations (site reports,
planned-versus-actual, material consumption, delay flagging) — begins only after
projects are being won through this system. Building project operations before
there are projects to operate would be building for a hypothesis.

## How to judge whether this is working

Not by traffic, and not by how impressive the system looks.

| Question | Metric |
| --- | --- |
| Are we finding projects? | Qualified accounts, relevant opportunities, decision makers identified |
| Are we winning projects? | Meetings, RFQs, quotes, win rate, pipeline value |
| Is inbound working? | Organic impressions and clicks on Tier 1 queries, AEO coverage, qualified leads, lead-to-RFQ rate |
| Is the AI actually saving time? | Research hours saved, accounts researched per day, deck preparation time, RFQ analysis time |

If an iteration does not move one of these, it was the wrong iteration.
