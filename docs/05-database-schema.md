# 05 — Database schema

PostgreSQL via Supabase. Designed here; migrations are applied in Iteration 4.

## Conventions

Every table carries:

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` PK, `gen_random_uuid()` | |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | Maintained by trigger |
| `status` | `text` | Domain-specific lifecycle state |
| `owner_id` | `uuid` → `auth.users` | Who is accountable for this record |

Every table holding **AI-produced content** additionally carries:

| Column | Type | Purpose |
| --- | --- | --- |
| `claim_status` | `claim_status` enum | `fact` \| `inference` \| `recommendation` \| `unknown` |
| `evidence_urls` | `text[]` | Sources backing the claim |
| `confidence` | `numeric(3,2)` | 0.00–1.00 |
| `model` | `text` | Which model produced it |
| `prompt_version` | `text` | Which prompt version produced it |
| `approved_by` | `uuid` | Null until a human approves |
| `approved_at` | `timestamptz` | Null until a human approves |

### The governance constraint

```sql
create type claim_status as enum ('fact','inference','recommendation','unknown');

-- A claim asserted as fact must name its evidence. Enforced in the database,
-- so no code path -- and no prompt failure -- can store an unsourced fact.
alter table companies add constraint companies_fact_needs_evidence
  check (claim_status <> 'fact' or coalesce(array_length(evidence_urls,1),0) > 0);
```

This constraint is repeated on every AI-written table. It is the structural
expression of the governance rule in [07](./07-ai-architecture.md): a fact
without a source is not a fact.

## Entity groups

### 1. Capability (what we sell)

| Table | Notes |
| --- | --- |
| `services` | Mirrors `content/services.ts`; the database copy is what the deck engine and matching agent read |
| `portfolio_projects` | Executed projects. `is_publishable` boolean gates website display |
| `portfolio_assets` | Photographs and documents per project; `alt_text` is NOT NULL |

### 2. Account intelligence (who might buy)

| Table | Key columns |
| --- | --- |
| `companies` | `company_name`, `website`, `industry`, `hq_location`, `operating_regions[]`, `project_types[]`, `existing_vendor_info`, `research_date`, `confidence_score`, `account_score`, `next_action` |
| `projects` | Their projects: `company_id`, `project_name`, `stage` (current/upcoming), `location`, `value_if_public`, `source_urls[]` |
| `contacts` | `company_id`, `name`, `designation`, `role_category`, `public_source_url`, `confidence`, `relevance`. **No scraped private data; public professional sources only** |
| `opportunities` | `company_id`, `project_id`, `service_id`, `opportunity_type`, `estimated_value`, `priority` (A/B/C) |
| `account_scores` | Component scores: service, project, location, scale, timing, procurement, portfolio relevance, strategic value; plus `total` and `rationale` |
| `research_sources` | Every URL any agent used, with `fetched_at` and a content hash. This is the audit trail behind every claim |

### 3. Outreach

| Table | Notes |
| --- | --- |
| `outreach` | One row per account-contact thread; carries pipeline `stage` |
| `outreach_messages` | Each drafted or sent message; `channel`, `direction`, `body`, `approved_by`, `sent_at`. **`sent_at` stays null until a human approves** |
| `followups` | `due_at`, `reason`, `recommended_action`, `completed_at` |

### 4. Decks

| Table | Notes |
| --- | --- |
| `decks` | `company_id`, `type` (master/account), `status` |
| `deck_versions` | Immutable versions; `slide_manifest jsonb` recording which existing verified proof was selected, `approved_by` |

### 5. Tenders

| Table | Notes |
| --- | --- |
| `tenders` | `title`, `authority`, `location`, `deadline`, `value_if_public`, `eligibility`, `experience_requirement`, `bid_recommendation` (bid/no-bid/review), `bid_rationale`, `human_decision`, `decided_by` |
| `tender_documents` | Uploaded files in Supabase Storage; private bucket |
| `tender_analysis` | Extracted scope, quantities, specifications, deadlines, penalties, EMD, risks |

`bid_recommendation` is advisory. `human_decision` is the decision. They are
separate columns precisely so the distinction cannot collapse.

### 6. Estimation

| Table | Notes |
| --- | --- |
| `boqs` | Uploaded BOQ; `source` (website/tender/manual) |
| `boq_items` | `item_code`, `description`, `unit`, `quantity`, `specification`, `location`, `extracted_confidence` |
| `estimates` | Worksheet header; `status` (draft/reviewed/approved) |
| `estimate_lines` | Cost components: material, labour, machinery, transport, mobilisation, site overhead, testing, safety, contingency, margin |
| `rate_card` | **The only source of prices.** `service_id`, `unit`, `rate`, `valid_from`, `valid_to`, `approved_by` |
| `quotes` | Issued quotations; `approved_by` NOT NULL — a quote cannot exist without a named human approver |

### The pricing rule, in schema

`estimate_lines.rate_source` is an enum: `rate_card`, `supplier_verified`,
`historical_project`, `manual_entry`. There is no value meaning "model
generated", and no code path that writes one. A model may structure a
worksheet; it may not supply a number that goes into it.

### 7. Delivery

`customers`, `projects_execution`, `site_reports`, `documents`.

`site_reports` carries `engineer_approved_by` — AI may summarise a daily report,
but the site engineer's approval is a separate, required field.

### 8. AI governance

| Table | Notes |
| --- | --- |
| `ai_tasks` | Every agent invocation: `agent`, `input jsonb`, `status`, `started_at`, `finished_at`, `token_usage` |
| `ai_outputs` | Every result, with the governance columns above |
| `ai_audit_log` | Append-only. Who ran what, what it produced, who approved it, what was sent. Immutable by RLS |

### 9. Marketing

| Table | Notes |
| --- | --- |
| `website_leads` | Enquiries from the site. Insert-only from the server route |
| `search_queries` | Tracked query definitions |
| `search_visibility` | AI visibility observations, per [04](./04-seo-aeo-architecture.md) |

## Row Level Security

- **All internal tables**: authenticated users only. No anon access.
- **`website_leads`**: insert only, via the server route using the service role.
  No client-side insert path exists.
- **`ai_audit_log`**: insert only; no update or delete for any role, including
  the service role.
- **`rate_card`**: read for authenticated; write restricted to an `admin` role.
  Pricing data is the most sensitive table in the system.
- **Storage buckets** (`tender-documents`, `boq-uploads`, `project-photos`):
  private by default. Client documents are never public.

## Relationship overview

```
companies ──< projects
    │            │
    ├──< contacts│
    ├──< account_scores
    ├──< opportunities >── services
    ├──< outreach ──< outreach_messages
    │        └──< followups
    └──< decks ──< deck_versions

tenders ──< tender_documents
    └──< tender_analysis ──> services

boqs ──< boq_items ──> estimates ──< estimate_lines ──> rate_card
                            └──> quotes

website_leads ──> companies        (linked on qualification)
ai_tasks ──< ai_outputs ──> ai_audit_log
research_sources ──> (any claim, by source_id)
```
