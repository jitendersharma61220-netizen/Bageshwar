/**
 * Validate the migrations against a real Postgres.
 *
 * Runs every file in supabase/migrations against an embedded Postgres (PGlite),
 * then asserts that the constraints actually behave rather than merely parse.
 * Needs no Docker and no Supabase project, so the schema is checked on every
 * run rather than only when someone happens to have the stack up.
 *
 * Supabase-managed schemas (auth, storage) are stubbed here to the minimum the
 * migrations reference. The storage bucket block in 0002 is guarded on the real
 * table existing, so it is exercised only when that stub is present.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const MIGRATIONS = join(process.cwd(), 'supabase', 'migrations');

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

let failures = 0;

async function check(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ${green('ok')}   ${label}`);
  } catch (error) {
    failures += 1;
    console.log(`  ${red('FAIL')} ${label}`);
    console.log(dim(`         ${(error as Error).message.split('\n')[0]}`));
  }
}

/** Assert a statement is rejected by the database. */
async function rejects(db: PGlite, label: string, sql: string): Promise<void> {
  await check(label, async () => {
    try {
      await db.exec(sql);
    } catch {
      return; // Rejected, as required.
    }
    throw new Error('statement was accepted but should have been rejected');
  });
}

async function main(): Promise<void> {
  const db = new PGlite();

  console.log('\nBootstrapping Supabase-managed schemas');
  // Minimum stubs for what the migrations reference.
  await db.exec(`
    create schema if not exists auth;
    create schema if not exists storage;
    create table if not exists auth.users (id uuid primary key);
    create table if not exists storage.buckets (
      id text primary key,
      name text not null,
      public boolean not null default false,
      file_size_limit bigint
    );
    create table if not exists storage.objects (
      id uuid primary key default gen_random_uuid(),
      bucket_id text references storage.buckets (id),
      name text
    );
    do $$ begin create role anon; exception when duplicate_object then null; end $$;
    do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
  `);
  console.log(`  ${green('ok')}   auth.users, storage.buckets, storage.objects, roles`);

  console.log('\nApplying migrations');
  const files = (await readdir(MIGRATIONS)).filter((f) => f.endsWith('.sql')).sort();
  if (files.length === 0) throw new Error('no migrations found');

  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS, file), 'utf8');
    try {
      await db.exec(sql);
      console.log(`  ${green('ok')}   ${file}`);
    } catch (error) {
      failures += 1;
      console.log(`  ${red('FAIL')} ${file}`);
      console.log(dim(`         ${(error as Error).message}`));
      console.log(red('\nMigration failed to apply. Later assertions skipped.\n'));
      process.exit(1);
    }
  }

  console.log('\nSchema shape');

  await check('website_leads exists with expected columns', async () => {
    const res = await db.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name = 'website_leads'`,
    );
    const cols = new Set(res.rows.map((r) => r.column_name));
    for (const required of [
      'id', 'kind', 'name', 'company', 'email', 'phone', 'message',
      'status', 'created_at', 'updated_at', 'notified_at', 'notify_error',
    ]) {
      if (!cols.has(required)) throw new Error(`missing column ${required}`);
    }
  });

  await check('lead_documents exists with expected columns', async () => {
    const res = await db.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name = 'lead_documents'`,
    );
    const cols = new Set(res.rows.map((r) => r.column_name));
    for (const required of [
      'id', 'lead_id', 'storage_key', 'original_name', 'content_type',
      'byte_size', 'checksum', 'created_at',
    ]) {
      if (!cols.has(required)) throw new Error(`missing column ${required}`);
    }
  });

  await check('RLS is enabled and forced on both tables', async () => {
    const res = await db.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
      `select relname, relrowsecurity, relforcerowsecurity from pg_class
       where relname in ('website_leads', 'lead_documents')`,
    );
    if (res.rows.length !== 2) throw new Error('expected both tables');
    for (const row of res.rows) {
      if (!row.relrowsecurity) throw new Error(`RLS not enabled on ${row.relname}`);
      if (!row.relforcerowsecurity) throw new Error(`RLS not forced on ${row.relname}`);
    }
  });

  await check('no policy grants insert to any client role', async () => {
    const res = await db.query<{ policyname: string; cmd: string; tablename: string }>(
      `select policyname, cmd, tablename from pg_policies
       where schemaname = 'public' and tablename in ('website_leads', 'lead_documents')`,
    );
    const inserts = res.rows.filter((r) => r.cmd === 'INSERT' || r.cmd === 'ALL');
    if (inserts.length > 0) {
      throw new Error(
        `insert-capable policy found: ${inserts.map((r) => `${r.tablename}.${r.policyname}`).join(', ')}`,
      );
    }
  });

  await check('private storage bucket is registered and not public', async () => {
    const res = await db.query<{ public: boolean; file_size_limit: string | number }>(
      `select public, file_size_limit from storage.buckets where id = 'lead-documents'`,
    );
    if (res.rows.length !== 1) throw new Error('bucket not created');
    if (res.rows[0]!.public) throw new Error('bucket is public');
    if (Number(res.rows[0]!.file_size_limit) !== 26214400)
      throw new Error(`unexpected size limit ${res.rows[0]!.file_size_limit}`);
  });

  console.log('\nConstraint behaviour');

  const validLead = `
    insert into public.website_leads (kind, name, company, email, phone, message)
    values ('quote', 'A Kumar', 'Test EPC Ltd', 'a@testepc.example', '+91 98765 43210',
            'Thermoplastic marking for a 40 km package, 2.5mm, night windows.')
  `;

  await check('a valid lead inserts', async () => {
    await db.exec(validLead);
    const res = await db.query<{ count: string }>('select count(*)::text as count from public.website_leads');
    if (res.rows[0]!.count !== '1') throw new Error(`expected 1 row, got ${res.rows[0]!.count}`);
  });

  await check('status defaults to new', async () => {
    const res = await db.query<{ status: string }>('select status from public.website_leads limit 1');
    if (res.rows[0]!.status !== 'new') throw new Error(`got ${res.rows[0]!.status}`);
  });

  await rejects(db, 'rejects a message under 10 characters', `
    insert into public.website_leads (kind, name, company, email, phone, message)
    values ('quote', 'A Kumar', 'Test EPC', 'a@b.example', '+91 98765 43210', 'too short')
  `);

  await rejects(db, 'rejects an email with no @', `
    insert into public.website_leads (kind, name, company, email, phone, message)
    values ('quote', 'A Kumar', 'Test EPC', 'not-an-email', '+91 98765 43210',
            'A message that is long enough to pass.')
  `);

  await rejects(db, 'rejects an unknown enquiry kind', `
    insert into public.website_leads (kind, name, company, email, phone, message)
    values ('newsletter', 'A Kumar', 'Test EPC', 'a@b.example', '+91 98765 43210',
            'A message that is long enough to pass.')
  `);

  await rejects(db, 'rejects a blank-padded name', `
    insert into public.website_leads (kind, name, company, email, phone, message)
    values ('quote', '  ', 'Test EPC', 'a@b.example', '+91 98765 43210',
            'A message that is long enough to pass.')
  `);

  await check('updated_at trigger fires on update', async () => {
    const before = await db.query<{ id: string; updated_at: string }>(
      'select id, updated_at from public.website_leads limit 1',
    );
    const { id, updated_at } = before.rows[0]!;
    await db.exec(`update public.website_leads set status = 'reviewing' where id = '${id}'`);
    const after = await db.query<{ updated_at: string }>(
      `select updated_at from public.website_leads where id = '${id}'`,
    );
    if (new Date(after.rows[0]!.updated_at) <= new Date(updated_at)) {
      throw new Error('updated_at did not advance');
    }
  });

  console.log('\nDocument constraints');

  await check('a valid document inserts against its lead', async () => {
    const lead = await db.query<{ id: string }>('select id from public.website_leads limit 1');
    await db.exec(`
      insert into public.lead_documents
        (lead_id, storage_key, original_name, content_type, byte_size, checksum)
      values ('${lead.rows[0]!.id}', 'leads/2026/09/abc123def456.pdf', 'BOQ Package 4.pdf',
              'application/pdf', 184320,
              '${'a'.repeat(64)}')
    `);
  });

  await rejects(db, 'rejects a non-hex checksum', `
    insert into public.lead_documents
      (lead_id, storage_key, original_name, content_type, byte_size, checksum)
    select id, 'leads/bad-checksum.pdf', 'x.pdf', 'application/pdf', 100, 'not-a-sha256'
    from public.website_leads limit 1
  `);

  await rejects(db, 'rejects a file over the 25 MiB cap', `
    insert into public.lead_documents
      (lead_id, storage_key, original_name, content_type, byte_size, checksum)
    select id, 'leads/too-big.pdf', 'x.pdf', 'application/pdf', 26214401, '${'b'.repeat(64)}'
    from public.website_leads limit 1
  `);

  await rejects(db, 'rejects a duplicate storage key', `
    insert into public.lead_documents
      (lead_id, storage_key, original_name, content_type, byte_size, checksum)
    select id, 'leads/2026/09/abc123def456.pdf', 'other.pdf', 'application/pdf', 100, '${'c'.repeat(64)}'
    from public.website_leads limit 1
  `);

  await rejects(db, 'rejects a document with no lead', `
    insert into public.lead_documents
      (lead_id, storage_key, original_name, content_type, byte_size, checksum)
    values ('00000000-0000-0000-0000-000000000000', 'leads/orphan.pdf', 'x.pdf',
            'application/pdf', 100, '${'d'.repeat(64)}')
  `);

  await check('deleting a lead cascades to its documents', async () => {
    await db.exec('delete from public.website_leads');
    const res = await db.query<{ count: string }>(
      'select count(*)::text as count from public.lead_documents',
    );
    if (res.rows[0]!.count !== '0') throw new Error(`${res.rows[0]!.count} documents survived`);
  });

  await db.close();

  console.log('');
  if (failures > 0) {
    console.log(red(`${failures} check(s) failed.\n`));
    process.exit(1);
  }
  console.log(green('Migrations apply cleanly and every constraint behaves as intended.\n'));
}

main().catch((error) => {
  console.error(red(`\nValidation crashed: ${(error as Error).message}\n`));
  process.exit(1);
});
