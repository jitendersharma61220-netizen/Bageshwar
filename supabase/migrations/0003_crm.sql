-- ---------------------------------------------------------------------------
-- 0003 — CRM
--
-- Target accounts, the people at them, the opportunities they represent, and
-- the activity trail. This is the pipeline described in docs/06-crm-pipeline.md.
--
-- Unlike website_leads, these tables ARE written by authenticated staff through
-- the client, so they carry insert and update policies. The service role still
-- bypasses RLS for server-side work.
-- ---------------------------------------------------------------------------

-- Pipeline position. Ordered as the deal actually progresses; `nurture` is
-- reachable from any stage, not only from `lost`.
do $$ begin
  create type pipeline_stage as enum (
    'target',
    'researched',
    'decision_maker_found',
    'personalized',
    'contacted',
    'replied',
    'meeting',
    'rfq',
    'quotation',
    'negotiation',
    'won',
    'lost',
    'nurture'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type account_priority as enum ('a', 'b', 'c');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type company_category as enum (
    'epc',
    'highway_contractor',
    'developer',
    'concessionaire',
    'toll_operator',
    'airport',
    'industrial',
    'logistics',
    'smart_city',
    'other'
  );
exception when duplicate_object then null;
end $$;

-- How a claim on a record was arrived at. The AI layer in later iterations
-- writes these; a human-entered row is simply 'fact' with no sources needed.
do $$ begin
  create type claim_status as enum ('fact', 'inference', 'recommendation', 'unknown');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------

create table if not exists public.companies (
  id                 uuid primary key default gen_random_uuid(),

  name               text not null check (length(btrim(name)) between 2 and 200),
  website            text check (length(website) <= 300),
  category           company_category not null default 'other',
  hq_location        text check (length(hq_location) <= 200),
  operating_regions  text[] not null default '{}',

  -- Pipeline
  stage              pipeline_stage not null default 'target',
  priority           account_priority,
  account_score      integer check (account_score between 0 and 100),
  score_rationale    text,

  -- Handling
  owner_id           uuid references auth.users (id) on delete set null,
  next_action        text check (length(next_action) <= 300),
  next_action_due    date,
  last_contacted_at  timestamptz,
  last_response_at   timestamptz,

  -- Value, when known. Kept nullable rather than defaulted to zero, so
  -- "unknown" and "nothing" stay distinguishable in pipeline totals.
  opportunity_value  numeric(14, 2) check (opportunity_value >= 0),

  notes              text,

  -- Provenance. A row researched by an agent records how it was arrived at;
  -- a row typed in by a person is a fact with no sources required.
  claim_status       claim_status not null default 'fact',
  evidence_urls      text[] not null default '{}',
  confidence         numeric(3, 2) check (confidence between 0 and 1),
  source             text check (length(source) <= 200),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- The governance rule, enforced by the database rather than by prompting:
  -- anything asserted as fact by a non-human source must name its evidence.
  constraint companies_ai_fact_needs_evidence check (
    source is null
    or source = 'manual'
    or claim_status <> 'fact'
    or coalesce(array_length(evidence_urls, 1), 0) > 0
  )
);

comment on table public.companies is
  'Target accounts and their pipeline position.';
comment on constraint companies_ai_fact_needs_evidence on public.companies is
  'A non-manual row asserting fact must carry evidence URLs. Manual entry by a named user is its own evidence.';

create index if not exists companies_stage_idx on public.companies (stage);
create index if not exists companies_priority_idx on public.companies (priority)
  where priority is not null;
create index if not exists companies_next_action_due_idx on public.companies (next_action_due)
  where next_action_due is not null;
create index if not exists companies_owner_idx on public.companies (owner_id);
create index if not exists companies_name_idx on public.companies (lower(name));

-- ---------------------------------------------------------------------------
-- contacts
--
-- Decision makers. Every contact requires the public source it came from:
-- there is no code path, and no column, for a guessed email address.
-- ---------------------------------------------------------------------------

create table if not exists public.contacts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete cascade,

  name          text not null check (length(btrim(name)) between 2 and 160),
  designation   text check (length(designation) <= 160),
  role_category text check (length(role_category) <= 80),

  email         text check (length(email) <= 200),
  phone         text check (length(phone) <= 40),
  linkedin_url  text check (length(linkedin_url) <= 400),

  -- Where this person was found. Required for any contact that did not come
  -- from a direct conversation.
  public_source_url text check (length(public_source_url) <= 500),

  claim_status  claim_status not null default 'fact',
  confidence    numeric(3, 2) check (confidence between 0 and 1),
  relevance     text,
  source        text check (length(source) <= 200),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint contacts_researched_needs_source check (
    source is null
    or source = 'manual'
    or public_source_url is not null
  )
);

comment on constraint contacts_researched_needs_source on public.contacts is
  'A researched contact must name the public professional source it came from. Fabricated contact details have no path into this table.';

create index if not exists contacts_company_idx on public.contacts (company_id);

-- ---------------------------------------------------------------------------
-- opportunities
-- ---------------------------------------------------------------------------

create table if not exists public.opportunities (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies (id) on delete cascade,

  title         text not null check (length(btrim(title)) between 2 and 250),
  service_slug  text check (length(service_slug) <= 80),
  project_name  text check (length(project_name) <= 250),
  location      text check (length(location) <= 200),
  estimated_value numeric(14, 2) check (estimated_value >= 0),
  stage         pipeline_stage not null default 'target',
  notes         text,

  source_urls   text[] not null default '{}',
  claim_status  claim_status not null default 'fact',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists opportunities_company_idx on public.opportunities (company_id);
create index if not exists opportunities_stage_idx on public.opportunities (stage);

-- ---------------------------------------------------------------------------
-- account_activity
--
-- Append-only trail: stage changes, notes, outreach records, meetings. This is
-- what makes "days since contact" and "what happened last" answerable.
-- ---------------------------------------------------------------------------

do $$ begin
  create type activity_kind as enum (
    'note',
    'stage_change',
    'outreach_sent',
    'reply_received',
    'meeting',
    'rfq_received',
    'quote_sent',
    'lead_converted'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.account_activity (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id) on delete cascade,

  kind        activity_kind not null,
  summary     text not null check (length(btrim(summary)) between 1 and 500),
  detail      text,

  from_stage  pipeline_stage,
  to_stage    pipeline_stage,

  actor_id    uuid references auth.users (id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists account_activity_company_idx
  on public.account_activity (company_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Link a website lead to the account it became
-- ---------------------------------------------------------------------------

alter table public.website_leads
  add column if not exists company_id uuid references public.companies (id) on delete set null;

create index if not exists website_leads_company_idx
  on public.website_leads (company_id) where company_id is not null;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Staff are authenticated users. They may read and write CRM records, but not
-- delete them: an account that turns out to be wrong is archived through its
-- stage, so the activity trail survives.
-- ---------------------------------------------------------------------------

alter table public.companies enable row level security;
alter table public.companies force row level security;
alter table public.contacts enable row level security;
alter table public.contacts force row level security;
alter table public.opportunities enable row level security;
alter table public.opportunities force row level security;
alter table public.account_activity enable row level security;
alter table public.account_activity force row level security;

do $$
declare
  t text;
begin
  foreach t in array array['companies', 'contacts', 'opportunities'] loop
    execute format('drop policy if exists "%s readable by staff" on public.%I', t, t);
    execute format(
      'create policy "%s readable by staff" on public.%I for select to authenticated using (true)', t, t);

    execute format('drop policy if exists "%s insertable by staff" on public.%I', t, t);
    execute format(
      'create policy "%s insertable by staff" on public.%I for insert to authenticated with check (true)', t, t);

    execute format('drop policy if exists "%s updatable by staff" on public.%I', t, t);
    execute format(
      'create policy "%s updatable by staff" on public.%I for update to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- Activity is append-only: staff may read and write, never update or delete,
-- so the trail cannot be quietly rewritten after the fact.
drop policy if exists "activity readable by staff" on public.account_activity;
create policy "activity readable by staff"
  on public.account_activity for select to authenticated using (true);

drop policy if exists "activity insertable by staff" on public.account_activity;
create policy "activity insertable by staff"
  on public.account_activity for insert to authenticated with check (true);

revoke all on public.companies from anon;
revoke all on public.contacts from anon;
revoke all on public.opportunities from anon;
revoke all on public.account_activity from anon;
