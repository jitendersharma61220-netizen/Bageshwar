import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Server-side Supabase client.
 *
 * This module is marked `server-only`: importing it from a client component is
 * a build error, which is the guarantee that the service-role key cannot be
 * bundled into anything the browser receives.
 *
 * The service role bypasses RLS. It is the only path that writes leads and
 * documents, which is why no RLS policy grants insert to a client role.
 */

export interface SupabaseConfig {
  readonly url: string;
  readonly serviceRoleKey: string;
}

/** Read config, or `null` when Supabase is not configured for this environment. */
export function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

let cached: SupabaseClient<Database> | null = null;

/**
 * The service-role client, or `null` when Supabase is not configured.
 *
 * Returning null rather than throwing lets the application fall back to the
 * console and filesystem implementations in development, so the site runs with
 * no Supabase project at all.
 */
export function getServiceClient(): SupabaseClient<Database> | null {
  if (cached) return cached;
  const config = readSupabaseConfig();
  if (!config) return null;

  cached = createClient<Database>(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'bageshwar-balaji-website' } },
  });
  return cached;
}

export const LEAD_DOCUMENTS_BUCKET = 'lead-documents';
