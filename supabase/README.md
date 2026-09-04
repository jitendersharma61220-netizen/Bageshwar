# Database

PostgreSQL on Supabase. Migrations are plain SQL, applied in filename order.

## Applying migrations

**Supabase CLI** (preferred):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Dashboard**: open the SQL editor and run each file in `migrations/` in order.

## What exists after 0001 and 0002

| Object | Purpose |
| --- | --- |
| `website_leads` | Enquiries from the public website |
| `lead_documents` | Metadata for BOQ / tender files attached to a lead |
| `lead-documents` bucket | Private storage for the files themselves |

## Security model

The important property: **there is no client-side write path.**

- No RLS policy grants `insert` on either table. Rows are created only by the
  server route using the service role, which bypasses RLS.
- `anon` has all privileges revoked on both tables.
- The storage bucket is private. No policy grants `insert` to `anon` or
  `authenticated`; uploads go through the server with the service role.
- Authenticated staff may `select` leads and document metadata, and may
  `update` leads (to set status and notes). They cannot delete.
- Files are read through short-lived signed URLs generated server-side. No
  public URL is ever produced for a client document.

A leaked `NEXT_PUBLIC_SUPABASE_ANON_KEY` therefore exposes nothing: it cannot
read a lead, write a lead, or reach a document.

## Validating the SQL

`pnpm db:validate` runs both migrations against an embedded Postgres
(PGlite) and asserts the constraints actually behave — check constraints
reject bad data, the `updated_at` trigger fires, and the cascade delete works.
It needs no Docker and no Supabase project.
