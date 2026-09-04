import { redirect } from 'next/navigation';
import { authMode, getSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/admin/LoginForm';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/admin');

  const mode = authMode();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-graphite-900 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-card bg-safety-500 font-display text-sm font-bold text-graphite-950"
          >
            BB
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-semibold text-paper-50">
              Bageshwar Balaji
            </span>
            <span className="mt-1 text-[0.65rem] tracking-[0.12em] text-graphite-300 uppercase">
              Command Center
            </span>
          </span>
        </div>

        <div className="border border-graphite-700 bg-graphite-850 p-6">
          <h1 className="font-display text-lg font-semibold text-paper-50">Sign in</h1>
          <p className="mt-1.5 text-sm text-graphite-300">
            {mode === 'supabase'
              ? 'Use your Supabase account.'
              : 'Development sign-in. Use the password from ADMIN_DEV_PASSWORD.'}
          </p>

          <LoginForm mode={mode} />
        </div>
      </div>
    </div>
  );
}
