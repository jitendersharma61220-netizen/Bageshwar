-- ---------------------------------------------------------------------------
-- 0001 — Website leads
--
-- Enquiries submitted through the public website. Rows are written only by the
-- server route using the service role; there is no client-side insert path and
-- no anonymous read path.
-- ---------------------------------------------------------------------------

-- gen_random_uuid() is core Postgres from 13 onward, so no extension is needed.

-- Which form the enquiry came from.
do $$ begin
  create type enquiry_kind as enum ('general', 'quote', 'boq');
exception when duplicate_object then null;
end $$;

-- Where the lead currently sits. Deliberately coarse: the full CRM pipeline
-- arrives in Iteration 4 and will reference this from `companies`.
do $$ begin
  create type lead_status as enum ('new', 'reviewing', 'qualified', 'converted', 'archived', 'spam');
exception when duplicate_object then null;
end $$;

create table if not exists public.website_leads (
  id            uuid primary key default gen_random_uuid(),

  -- Submission
  kind          enquiry_kind not null,
  name          text not null check (length(btrim(name)) between 2 and 120),
  company       text not null check (length(btrim(company)) between 2 and 160),
  email         text not null check (length(email) <= 200 and position('@' in email) > 1),
  phone         text not null check (length(btrim(phone)) between 6 and 30),
  role          text check (length(role) <= 120),

  -- Interest
  service_slug  text check (length(service_slug) <= 80),
  industry_slug text check (length(industry_slug) <= 80),
  project_name  text check (length(project_name) <= 200),
  location      text check (length(location) <= 200),
  timeline      text check (length(timeline) <= 120),
  quantity      text check (length(quantity) <= 200),
  message       text not null check (length(btrim(message)) between 10 and 4000),

  -- Attribution
  source_path   text check (length(source_path) <= 300),
  referrer      text check (length(referrer) <= 500),
  user_agent    text check (length(user_agent) <= 500),

  -- Handling
  status        lead_status not null default 'new',
  owner_id      uuid references auth.users (id) on delete set null,
  internal_note text,

  -- Delivery outcome, so a lead that failed to email is still recoverable.
  notified_at   timestamptz,
  notify_error  text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.website_leads is
  'Enquiries from the public website. Insert is server-only via the service role.';
comment on column public.website_leads.notify_error is
  'Set when email delivery failed. The lead is still captured; only the notification was lost.';

create index if not exists website_leads_created_at_idx
  on public.website_leads (created_at desc);
create index if not exists website_leads_status_idx
  on public.website_leads (status) where status <> 'archived';
create index if not exists website_leads_kind_idx
  on public.website_leads (kind);
create index if not exists website_leads_email_idx
  on public.website_leads (lower(email));

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists website_leads_set_updated_at on public.website_leads;
create trigger website_leads_set_updated_at
  before update on public.website_leads
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- No policy grants insert. The service role bypasses RLS, which is the only
-- path that writes here, so a leaked anon key cannot create or read leads.
-- ---------------------------------------------------------------------------

alter table public.website_leads enable row level security;
alter table public.website_leads force row level security;

drop policy if exists "leads readable by authenticated staff" on public.website_leads;
create policy "leads readable by authenticated staff"
  on public.website_leads for select
  to authenticated
  using (true);

drop policy if exists "leads updatable by authenticated staff" on public.website_leads;
create policy "leads updatable by authenticated staff"
  on public.website_leads for update
  to authenticated
  using (true)
  with check (true);

revoke all on public.website_leads from anon;
