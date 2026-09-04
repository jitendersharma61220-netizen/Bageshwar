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

  console.log('\nCRM schema');

  await check('companies, contacts, opportunities and account_activity exist', async () => {
    const res = await db.query<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public'
         and table_name in ('companies','contacts','opportunities','account_activity')`,
    );
    if (res.rows.length !== 4) {
      throw new Error(`found ${res.rows.map((r) => r.table_name).join(', ') || 'none'}`);
    }
  });

  await check('RLS is enabled and forced on every CRM table', async () => {
    const res = await db.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
      `select relname, relrowsecurity, relforcerowsecurity from pg_class
       where relname in ('companies','contacts','opportunities','account_activity')`,
    );
    for (const row of res.rows) {
      if (!row.relrowsecurity) throw new Error(`RLS not enabled on ${row.relname}`);
      if (!row.relforcerowsecurity) throw new Error(`RLS not forced on ${row.relname}`);
    }
  });

  await check('account_activity is append-only for staff', async () => {
    const res = await db.query<{ cmd: string }>(
      `select cmd from pg_policies
       where schemaname = 'public' and tablename = 'account_activity'`,
    );
    const cmds = new Set(res.rows.map((r) => r.cmd));
    if (cmds.has('UPDATE') || cmds.has('DELETE') || cmds.has('ALL')) {
      throw new Error(`activity trail is mutable: policies allow ${[...cmds].join(', ')}`);
    }
    if (!cmds.has('SELECT') || !cmds.has('INSERT')) {
      throw new Error('staff cannot read or append activity');
    }
  });

  await check('no CRM policy grants delete', async () => {
    const res = await db.query<{ tablename: string; policyname: string; cmd: string }>(
      `select tablename, policyname, cmd from pg_policies
       where schemaname = 'public'
         and tablename in ('companies','contacts','opportunities','account_activity')
         and cmd in ('DELETE','ALL')`,
    );
    if (res.rows.length > 0) {
      throw new Error(
        `delete-capable policy: ${res.rows.map((r) => `${r.tablename}.${r.policyname}`).join(', ')}`,
      );
    }
  });

  await check('a manually entered company inserts', async () => {
    await db.exec(`
      insert into public.companies (name, category, stage, source)
      values ('Test Highways EPC Ltd', 'epc', 'target', 'manual')
    `);
  });

  await check('stage defaults to target and priority is nullable', async () => {
    const res = await db.query<{ stage: string; priority: string | null }>(
      'select stage, priority from public.companies limit 1',
    );
    if (res.rows[0]!.stage !== 'target') throw new Error(`stage was ${res.rows[0]!.stage}`);
    if (res.rows[0]!.priority !== null) throw new Error('priority should default to null');
  });

  await rejects(db, 'rejects an unknown pipeline stage', `
    insert into public.companies (name, stage) values ('Bad Stage Co', 'prospecting')
  `);

  await rejects(db, 'rejects an account score above 100', `
    insert into public.companies (name, account_score) values ('Overscored Co', 101)
  `);

  await rejects(db, 'rejects a negative opportunity value', `
    insert into public.companies (name, opportunity_value) values ('Negative Co', -1)
  `);

  await rejects(db, 'rejects a researched company asserting fact with no evidence', `
    insert into public.companies (name, source, claim_status, evidence_urls)
    values ('Unsourced Research Co', 'market-research-agent', 'fact', '{}')
  `);

  await check('a researched company with evidence inserts', async () => {
    await db.exec(`
      insert into public.companies (name, source, claim_status, evidence_urls)
      values ('Sourced Research Co', 'market-research-agent', 'fact',
              array['https://example.com/tender-award'])
    `);
  });

  await check('a researched company may record an unknown without evidence', async () => {
    await db.exec(`
      insert into public.companies (name, source, claim_status)
      values ('Unknown Research Co', 'market-research-agent', 'unknown')
    `);
  });

  await rejects(db, 'rejects a researched contact with no public source', `
    insert into public.contacts (company_id, name, source)
    select id, 'Fabricated Person', 'decision-maker-agent' from public.companies limit 1
  `);

  await check('a researched contact with a public source inserts', async () => {
    await db.exec(`
      insert into public.contacts (company_id, name, designation, source, public_source_url)
      select id, 'R Sharma', 'Procurement Head', 'decision-maker-agent',
             'https://www.linkedin.com/in/example'
      from public.companies limit 1
    `);
  });

  await check('a manually entered contact needs no public source', async () => {
    await db.exec(`
      insert into public.contacts (company_id, name, source)
      select id, 'Met At Site', 'manual' from public.companies limit 1
    `);
  });

  await check('activity records a stage change', async () => {
    await db.exec(`
      insert into public.account_activity (company_id, kind, summary, from_stage, to_stage)
      select id, 'stage_change', 'Moved to researched', 'target', 'researched'
      from public.companies limit 1
    `);
    const res = await db.query<{ count: string }>(
      "select count(*)::text as count from public.account_activity where kind = 'stage_change'",
    );
    if (res.rows[0]!.count !== '1') throw new Error(`got ${res.rows[0]!.count}`);
  });

  await check('website_leads can be linked to a company', async () => {
    await db.exec(`
      insert into public.website_leads (kind, name, company, email, phone, message)
      values ('quote', 'Lead Person', 'Lead Co', 'lead@example.com', '+91 90000 00000',
              'A message long enough to satisfy the constraint.')
    `);
    await db.exec(`
      update public.website_leads
      set company_id = (select id from public.companies limit 1)
      where company_id is null
    `);
    const res = await db.query<{ count: string }>(
      'select count(*)::text as count from public.website_leads where company_id is not null',
    );
    if (res.rows[0]!.count === '0') throw new Error('link did not persist');
  });

  await check('deleting a company cascades to contacts and activity', async () => {
    await db.exec('delete from public.companies');
    const contacts = await db.query<{ count: string }>(
      'select count(*)::text as count from public.contacts',
    );
    const activity = await db.query<{ count: string }>(
      'select count(*)::text as count from public.account_activity',
    );
    if (contacts.rows[0]!.count !== '0') throw new Error('contacts survived');
    if (activity.rows[0]!.count !== '0') throw new Error('activity survived');
  });

  await check('deleting a company detaches rather than deletes its website lead', async () => {
    const res = await db.query<{ count: string; linked: string }>(
      `select count(*)::text as count,
              count(company_id)::text as linked
       from public.website_leads`,
    );
    if (res.rows[0]!.count === '0') throw new Error('the lead was deleted with the company');
    if (res.rows[0]!.linked !== '0') throw new Error('company_id was not cleared');
  });

  console.log('\nAI governance schema');

  await check('ai_tasks, ai_outputs, ai_audit_log and research_sources exist', async () => {
    const res = await db.query<{ table_name: string }>(
      `select table_name from information_schema.tables
       where table_schema = 'public'
         and table_name in ('ai_tasks','ai_outputs','ai_audit_log','research_sources')`,
    );
    if (res.rows.length !== 4) {
      throw new Error(`found ${res.rows.map((r) => r.table_name).join(', ') || 'none'}`);
    }
  });

  await check('RLS is enabled and forced on every AI table', async () => {
    const res = await db.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
      `select relname, relrowsecurity, relforcerowsecurity from pg_class
       where relname in ('ai_tasks','ai_outputs','ai_audit_log','research_sources')`,
    );
    for (const row of res.rows) {
      if (!row.relrowsecurity) throw new Error(`RLS not enabled on ${row.relname}`);
      if (!row.relforcerowsecurity) throw new Error(`RLS not forced on ${row.relname}`);
    }
  });

  await check('no client role may insert an AI task or output', async () => {
    const res = await db.query<{ tablename: string; policyname: string; cmd: string }>(
      `select tablename, policyname, cmd from pg_policies
       where schemaname = 'public'
         and tablename in ('ai_tasks','ai_outputs','ai_audit_log','research_sources')
         and cmd in ('INSERT','ALL','DELETE')`,
    );
    if (res.rows.length > 0) {
      throw new Error(
        `unexpected policy: ${res.rows.map((r) => `${r.tablename}.${r.policyname} (${r.cmd})`).join(', ')}`,
      );
    }
  });

  // A task to hang the output assertions from.
  await db.exec(`
    insert into public.ai_tasks (id, agent, prompt_version, provider, model, status)
    values ('11111111-1111-1111-1111-111111111111', 'market-research', 'v1', 'fixture', 'fixture-1', 'succeeded')
  `);

  await check('an output asserting fact with evidence inserts', async () => {
    await db.exec(`
      insert into public.ai_outputs (task_id, output, claim_status, evidence_urls)
      values ('11111111-1111-1111-1111-111111111111', '{"name":"Test Co"}'::jsonb, 'fact',
              array['https://example.com/award-notice'])
    `);
  });

  await rejects(db, 'rejects an output asserting fact with no evidence', `
    insert into public.ai_outputs (task_id, output, claim_status, evidence_urls)
    values ('11111111-1111-1111-1111-111111111111', '{"name":"Unsourced Co"}'::jsonb, 'fact', '{}')
  `);

  await check('an unknown needs no evidence', async () => {
    await db.exec(`
      insert into public.ai_outputs (task_id, output, claim_status)
      values ('11111111-1111-1111-1111-111111111111', '{"name":"Unknown Co"}'::jsonb, 'unknown')
    `);
  });

  await rejects(db, 'rejects an approval with no approver', `
    insert into public.ai_outputs (task_id, output, claim_status, approval, approved_at)
    values ('11111111-1111-1111-1111-111111111111', '{}'::jsonb, 'recommendation', 'approved', now())
  `);

  await rejects(db, 'rejects an approval with no timestamp', `
    insert into public.ai_outputs (task_id, output, claim_status, approval, approved_by)
    values ('11111111-1111-1111-1111-111111111111', '{}'::jsonb, 'recommendation', 'approved',
            '00000000-0000-0000-0000-000000000000')
  `);

  await rejects(db, 'rejects an approved_at on an unapproved output', `
    insert into public.ai_outputs (task_id, output, claim_status, approval, approved_at)
    values ('11111111-1111-1111-1111-111111111111', '{}'::jsonb, 'recommendation', 'pending', now())
  `);

  await check('a downgrade is recorded with its reason', async () => {
    await db.exec(`
      insert into public.ai_outputs (task_id, output, claim_status, downgraded, downgrade_reason)
      values ('11111111-1111-1111-1111-111111111111', '{"name":"Downgraded Co"}'::jsonb, 'unknown',
              true, 'claimed fact with no sources')
    `);
    const res = await db.query<{ count: string }>(
      'select count(*)::text as count from public.ai_outputs where downgraded',
    );
    if (res.rows[0]!.count !== '1') throw new Error(`got ${res.rows[0]!.count}`);
  });

  console.log('\nAudit trail immutability');

  await check('an audit entry can be appended', async () => {
    await db.exec(`
      insert into public.ai_audit_log (task_id, event, detail)
      values ('11111111-1111-1111-1111-111111111111', 'task.started', '{"agent":"market-research"}'::jsonb)
    `);
  });

  await rejects(db, 'an audit entry cannot be updated, even by the table owner', `
    update public.ai_audit_log set event = 'tampered'
  `);

  await rejects(db, 'an audit entry cannot be deleted, even by the table owner', `
    delete from public.ai_audit_log
  `);

  await check('the audit entry survived both attempts unchanged', async () => {
    const res = await db.query<{ event: string; count: string }>(
      "select event, count(*) over ()::text as count from public.ai_audit_log limit 1",
    );
    if (res.rows.length !== 1) throw new Error('the entry was deleted');
    if (res.rows[0]!.event !== 'task.started') {
      throw new Error(`event was changed to ${res.rows[0]!.event}`);
    }
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
