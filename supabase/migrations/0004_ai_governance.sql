-- ---------------------------------------------------------------------------
-- 0004 — AI governance
--
-- Every agent run, every output, and an immutable audit trail.
--
-- The point of these tables is not observability for its own sake. It is that
-- when a claim on the founder's screen is questioned, the chain from claim to
-- source to model run is reconstructable — and that a claim which cannot
-- produce that chain is refused by the database rather than displayed.
-- ---------------------------------------------------------------------------

do $$ begin
  create type ai_task_status as enum ('pending', 'running', 'succeeded', 'failed', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type approval_state as enum ('not_required', 'pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- research_sources
--
-- Every URL any agent consulted, with when it was fetched. This is the
-- evidence table the claim constraints point at.
-- ---------------------------------------------------------------------------

create table if not exists public.research_sources (
  id           uuid primary key default gen_random_uuid(),
  url          text not null check (length(url) between 5 and 2000),
  title        text check (length(title) <= 500),
  publisher    text check (length(publisher) <= 200),
  fetched_at   timestamptz not null default now(),
  /** Hash of the retrieved content, so a source that later changes is detectable. */
  content_hash text check (content_hash ~ '^[0-9a-f]{64}$'),
  created_at   timestamptz not null default now()
);

create index if not exists research_sources_url_idx on public.research_sources (url);

-- ---------------------------------------------------------------------------
-- ai_tasks — one row per agent invocation
-- ---------------------------------------------------------------------------

create table if not exists public.ai_tasks (
  id             uuid primary key default gen_random_uuid(),

  agent          text not null check (length(agent) between 2 and 80),
  prompt_version text not null check (length(prompt_version) between 1 and 40),
  provider       text not null check (length(provider) between 2 and 40),
  model          text check (length(model) <= 120),

  input          jsonb not null default '{}'::jsonb,
  status         ai_task_status not null default 'pending',
  error          text,

  -- What this run was about, when it concerns an account.
  company_id     uuid references public.companies (id) on delete set null,

  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  duration_ms    integer check (duration_ms >= 0),

  input_tokens   integer check (input_tokens >= 0),
  output_tokens  integer check (output_tokens >= 0),

  requested_by   uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now()
);

comment on table public.ai_tasks is
  'One row per agent invocation. Written before the model is called, so a crashed run is still visible.';

create index if not exists ai_tasks_agent_idx on public.ai_tasks (agent, started_at desc);
create index if not exists ai_tasks_company_idx on public.ai_tasks (company_id)
  where company_id is not null;
create index if not exists ai_tasks_status_idx on public.ai_tasks (status);

-- ---------------------------------------------------------------------------
-- ai_outputs — the result, with its governance columns
-- ---------------------------------------------------------------------------

create table if not exists public.ai_outputs (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references public.ai_tasks (id) on delete cascade,

  output        jsonb not null,

  -- How the output as a whole should be read.
  claim_status  claim_status not null,
  evidence_urls text[] not null default '{}',
  confidence    numeric(3, 2) check (confidence between 0 and 1),

  -- Set when the runner had to downgrade a claim. Recording it means a prompt
  -- that keeps producing unsourced facts is measurable rather than invisible.
  downgraded          boolean not null default false,
  downgrade_reason    text,

  -- Outward-facing actions require a named human. `not_required` is for
  -- internal research that changes nothing outside the business.
  approval      approval_state not null default 'not_required',
  approved_by   uuid references auth.users (id) on delete set null,
  approved_at   timestamptz,
  rejected_reason text,

  created_at    timestamptz not null default now(),

  -- The governance rule, in the database: an output asserted as fact must name
  -- the evidence behind it. No prompt failure and no code path can bypass this.
  constraint ai_outputs_fact_needs_evidence check (
    claim_status <> 'fact' or coalesce(array_length(evidence_urls, 1), 0) > 0
  ),

  -- An approval that has happened must say who and when; one that has not must
  -- say neither. This makes "approved by nobody" unrepresentable.
  constraint ai_outputs_approval_is_attributed check (
    (approval = 'approved' and approved_by is not null and approved_at is not null)
    or (approval <> 'approved' and approved_at is null)
  )
);

comment on constraint ai_outputs_fact_needs_evidence on public.ai_outputs is
  'A fact must carry evidence. The runner downgrades unsourced facts to unknown before insert; this is the second line of defence.';
comment on constraint ai_outputs_approval_is_attributed on public.ai_outputs is
  'An approved output must name a human and a time. "Approved by nobody" is unrepresentable.';

create index if not exists ai_outputs_task_idx on public.ai_outputs (task_id);
create index if not exists ai_outputs_approval_idx on public.ai_outputs (approval)
  where approval = 'pending';
create index if not exists ai_outputs_downgraded_idx on public.ai_outputs (downgraded)
  where downgraded;

-- ---------------------------------------------------------------------------
-- ai_audit_log — append-only
-- ---------------------------------------------------------------------------

create table if not exists public.ai_audit_log (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid references public.ai_tasks (id) on delete set null,

  event       text not null check (length(event) between 2 and 80),
  detail      jsonb not null default '{}'::jsonb,
  actor_id    uuid references auth.users (id) on delete set null,
  occurred_at timestamptz not null default now()
);

comment on table public.ai_audit_log is
  'Append-only. No role, including the service role, may update or delete a row: a rule enforced by triggers rather than only by policy.';

create index if not exists ai_audit_log_task_idx on public.ai_audit_log (task_id);
create index if not exists ai_audit_log_occurred_idx on public.ai_audit_log (occurred_at desc);

-- The service role bypasses RLS, so policies alone would not make this
-- immutable. A trigger applies to every role.
create or replace function public.reject_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'ai_audit_log is append-only: % is not permitted', tg_op;
end;
$$;

drop trigger if exists ai_audit_log_no_update on public.ai_audit_log;
create trigger ai_audit_log_no_update
  before update on public.ai_audit_log
  for each row execute function public.reject_audit_mutation();

drop trigger if exists ai_audit_log_no_delete on public.ai_audit_log;
create trigger ai_audit_log_no_delete
  before delete on public.ai_audit_log
  for each row execute function public.reject_audit_mutation();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Staff read; the server writes through the service role. Nothing here is
-- client-writable, because these tables are the record of what the system did.
-- ---------------------------------------------------------------------------

alter table public.research_sources enable row level security;
alter table public.research_sources force row level security;
alter table public.ai_tasks enable row level security;
alter table public.ai_tasks force row level security;
alter table public.ai_outputs enable row level security;
alter table public.ai_outputs force row level security;
alter table public.ai_audit_log enable row level security;
alter table public.ai_audit_log force row level security;

do $$
declare
  t text;
begin
  foreach t in array array['research_sources', 'ai_tasks', 'ai_outputs', 'ai_audit_log'] loop
    execute format('drop policy if exists "%s readable by staff" on public.%I', t, t);
    execute format(
      'create policy "%s readable by staff" on public.%I for select to authenticated using (true)', t, t);
  end loop;
end $$;

-- Staff may approve or reject an output. That is the only client-side write in
-- this migration, and it is the one action that requires a human.
drop policy if exists "ai outputs approvable by staff" on public.ai_outputs;
create policy "ai outputs approvable by staff"
  on public.ai_outputs for update
  to authenticated
  using (true)
  with check (true);

revoke all on public.research_sources from anon;
revoke all on public.ai_tasks from anon;
revoke all on public.ai_outputs from anon;
revoke all on public.ai_audit_log from anon;
