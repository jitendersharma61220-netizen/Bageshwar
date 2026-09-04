import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase/client';

/**
 * Admin authentication.
 *
 * Two modes, chosen by what is configured:
 *
 *  - **Supabase Auth** when Supabase is configured. The real thing: real
 *    users, real password hashing, real session management.
 *  - **A single development password** otherwise, so the CRM can be run and
 *    tested locally before a Supabase project exists.
 *
 * The development mode REFUSES TO RUN IN PRODUCTION. `isDevAuthAvailable()`
 * returns false when NODE_ENV is production, `signInWithDevPassword` throws,
 * and the admin area returns an explicit "not configured" page rather than
 * silently falling back to a shared password on a public deployment.
 */

export const SESSION_COOKIE = 'bb_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface AdminSession {
  readonly email: string;
  /** Which mechanism authenticated this session. */
  readonly via: 'supabase' | 'dev-password';
}

export type AuthMode = 'supabase' | 'dev-password' | 'unavailable';

/* -------------------------------------------------------------------------- */
/* Mode selection                                                              */
/* -------------------------------------------------------------------------- */

export function isSupabaseAuthAvailable(): boolean {
  return getServiceClient() !== null;
}

/**
 * Development password auth is available only outside production and only when
 * a password is actually set. Both conditions are required.
 */
export function isDevAuthAvailable(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return Boolean(process.env.ADMIN_DEV_PASSWORD);
}

export function authMode(): AuthMode {
  if (isSupabaseAuthAvailable()) return 'supabase';
  if (isDevAuthAvailable()) return 'dev-password';
  return 'unavailable';
}

/* -------------------------------------------------------------------------- */
/* Signed session cookie                                                       */
/*                                                                             */
/* Used by the development mode. The cookie carries the email, an expiry and   */
/* an HMAC over both, so it cannot be edited by the client.                    */
/* -------------------------------------------------------------------------- */

function devSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_DEV_PASSWORD;
  if (!secret) throw new Error('No session secret configured');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', devSecret()).update(payload).digest('base64url');
}

function encodeSession(email: string): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${Buffer.from(email).toString('base64url')}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string): AdminSession | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedEmail, expires, signature] = parts as [string, string, string];

  const expected = sign(`${encodedEmail}.${expires}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (Number(expires) * 1000 < Date.now()) return null;

  return {
    email: Buffer.from(encodedEmail, 'base64url').toString('utf8'),
    via: 'dev-password',
  };
}

/* -------------------------------------------------------------------------- */
/* Sign in / out                                                               */
/* -------------------------------------------------------------------------- */

export interface SignInResult {
  ok: boolean;
  error?: string;
}

/**
 * Constant-time password comparison, so a wrong password cannot be discovered
 * character by character from response timing.
 */
function passwordMatches(supplied: string, expected: string): boolean {
  const a = createHmac('sha256', 'compare').update(supplied).digest();
  const b = createHmac('sha256', 'compare').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const mode = authMode();

  if (mode === 'supabase') {
    const client = getServiceClient();
    if (!client) return { ok: false, error: 'Authentication is not configured.' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      return { ok: false, error: 'Those credentials were not accepted.' };
    }

    const jar = await cookies();
    jar.set(SESSION_COOKIE, data.session.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: data.session.expires_in ?? SESSION_TTL_SECONDS,
    });
    return { ok: true };
  }

  if (mode === 'dev-password') {
    const expected = process.env.ADMIN_DEV_PASSWORD!;
    if (!password || !passwordMatches(password, expected)) {
      return { ok: false, error: 'Those credentials were not accepted.' };
    }

    const jar = await cookies();
    jar.set(SESSION_COOKIE, encodeSession(email || 'founder@localhost'), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Development only; never set in production.
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });
    return { ok: true };
  }

  return {
    ok: false,
    error:
      'The admin area is not configured. Set up Supabase, or set ADMIN_DEV_PASSWORD for local development.',
  };
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/* -------------------------------------------------------------------------- */
/* Reading the session                                                         */
/* -------------------------------------------------------------------------- */

export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const mode = authMode();

  if (mode === 'supabase') {
    const client = getServiceClient();
    if (!client) return null;
    // Verify the token against Supabase rather than trusting its contents.
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user?.email) return null;
    return { email: data.user.email, via: 'supabase' };
  }

  if (mode === 'dev-password') {
    return decodeSession(token);
  }

  return null;
}

/** Generate a session secret, for the setup instructions. */
export function suggestSecret(): string {
  return randomBytes(32).toString('base64url');
}
