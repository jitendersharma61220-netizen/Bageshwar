-- ---------------------------------------------------------------------------
-- 0002 — Lead documents
--
-- BOQ, tender and drawing files attached to a website enquiry.
--
-- The file itself lives in a PRIVATE storage bucket. This table holds only the
-- metadata and the storage key. Nothing here is ever served publicly; internal
-- users read files through a short-lived signed URL generated server-side.
-- ---------------------------------------------------------------------------

create table if not exists public.lead_documents (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid not null references public.website_leads (id) on delete cascade,

  -- Key within the private bucket. Server-generated: never derived from the
  -- filename the visitor supplied.
  storage_key    text not null unique check (length(storage_key) between 8 and 400),

  -- The visitor's filename, kept for display only. Treated as untrusted text
  -- and never used to build a path.
  original_name  text not null check (length(original_name) between 1 and 300),

  content_type   text not null check (length(content_type) <= 128),
  byte_size      bigint not null check (byte_size > 0 and byte_size <= 26214400),

  -- Hex sha256 of the file, for duplicate detection and integrity checking.
  checksum       text not null check (checksum ~ '^[0-9a-f]{64}$'),

  created_at     timestamptz not null default now()
);

comment on table public.lead_documents is
  'Metadata for files attached to a website enquiry. Files live in the private lead-documents bucket.';
comment on column public.lead_documents.original_name is
  'Visitor-supplied filename. Untrusted display text — never used to construct a storage path.';
comment on column public.lead_documents.byte_size is
  'Capped at 25 MiB, matching the application-level upload limit.';

create index if not exists lead_documents_lead_id_idx
  on public.lead_documents (lead_id);
create index if not exists lead_documents_checksum_idx
  on public.lead_documents (checksum);

alter table public.lead_documents enable row level security;
alter table public.lead_documents force row level security;

drop policy if exists "lead documents readable by authenticated staff" on public.lead_documents;
create policy "lead documents readable by authenticated staff"
  on public.lead_documents for select
  to authenticated
  using (true);

revoke all on public.lead_documents from anon;

-- ---------------------------------------------------------------------------
-- Private storage bucket
--
-- Guarded so the file runs against a plain Postgres (for schema validation)
-- as well as against a real Supabase project.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'storage' and table_name = 'buckets') then

    insert into storage.buckets (id, name, public, file_size_limit)
    values ('lead-documents', 'lead-documents', false, 26214400)
    on conflict (id) do update
      set public = false,
          file_size_limit = excluded.file_size_limit;

    -- Authenticated staff may read. Nobody may write through the client API:
    -- uploads happen server-side with the service role, which bypasses RLS.
    execute $p$
      drop policy if exists "lead documents readable by staff" on storage.objects
    $p$;
    execute $p$
      create policy "lead documents readable by staff"
        on storage.objects for select
        to authenticated
        using (bucket_id = 'lead-documents')
    $p$;
  end if;
end $$;
