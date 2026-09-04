import Link from 'next/link';
import { signOutAction } from '@/app/admin/actions';
import type { AdminSession } from '@/lib/auth/session';
import { cn } from '@/lib/cn';

const nav = [
  { href: '/admin', label: 'Command Center' },
  { href: '/admin/pipeline', label: 'Pipeline' },
  { href: '/admin/accounts', label: 'Accounts' },
  { href: '/admin/leads', label: 'Website leads' },
];

export function AdminChrome({
  session,
  repositoryName,
  children,
}: {
  session: AdminSession;
  repositoryName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-paper-100">
      <header className="border-b border-graphite-700 bg-graphite-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-card bg-safety-500 font-display text-xs font-bold text-graphite-950"
            >
              BB
            </span>
            <span className="font-display text-sm font-semibold text-paper-50">
              Command Center
            </span>
          </Link>

          <nav aria-label="Admin" className="flex-1">
            <ul className="flex flex-wrap items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-card px-3 py-1.5 text-sm font-medium text-graphite-300 hover:text-paper-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4 text-xs">
            {repositoryName !== 'supabase' ? (
              <span
                className="rounded-card border border-safety-500/50 bg-safety-500/10 px-2 py-1 font-medium text-safety-400"
                title="Data is held in the server process and is lost on restart. Configure Supabase for durable storage."
              >
                Local data ({repositoryName})
              </span>
            ) : null}
            <span className="hidden text-graphite-400 sm:inline">{session.email}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-graphite-300 underline-offset-4 hover:text-paper-50 hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}

export function AdminHeading({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-paper-300 pb-5',
        className,
      )}
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'alert' | 'good';
  href?: string;
}) {
  const body = (
    <>
      <p className="text-xs font-medium tracking-[0.1em] text-ink-500 uppercase">{label}</p>
      <p
        className={cn(
          'tabular mt-2 font-display text-3xl font-semibold',
          tone === 'alert' && 'text-danger-600',
          tone === 'good' && 'text-success-600',
          tone === 'default' && 'text-ink-900',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </>
  );

  const className =
    'block border border-paper-300 bg-paper-50 p-5 transition-colors hover:border-ink-900/25';

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
