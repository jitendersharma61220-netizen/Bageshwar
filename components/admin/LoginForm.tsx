'use client';

import { useActionState } from 'react';
import { signInAction } from '@/app/admin/actions';
import type { AuthMode } from '@/lib/auth/session';

const inputClass =
  'mt-1.5 block w-full rounded-card border border-graphite-600 bg-graphite-900 px-3 py-2.5 text-sm text-paper-50 placeholder:text-graphite-500 focus:border-safety-500 focus:ring-1 focus:ring-safety-500 focus:outline-none';

export function LoginForm({ mode }: { mode: AuthMode }) {
  const [state, formAction, pending] = useActionState(signInAction, {});

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state.error ? (
        <p
          role="alert"
          className="border border-danger-600/40 bg-danger-600/10 px-3 py-2 text-sm text-danger-600"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-paper-200">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required={mode === 'supabase'}
          placeholder={mode === 'supabase' ? 'you@company.com' : 'founder@localhost'}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-paper-200">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-card bg-safety-500 px-4 py-2.5 text-sm font-semibold text-graphite-950 hover:bg-safety-400 disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
