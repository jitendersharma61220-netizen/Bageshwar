import type { Metadata } from 'next';
import Link from 'next/link';
import { getSession, authMode } from '@/lib/auth/session';
import { getCrmRepository } from '@/lib/crm/repository';
import { AdminChrome } from '@/components/admin/AdminChrome';

/**
 * Admin area.
 *
 * `noindex` is set here rather than per page, so no internal view can be
 * published to search by omission.
 */
export const metadata: Metadata = {
  title: 'Command Center',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = authMode();

  // Production with nothing configured: say so rather than falling back to a
  // shared password or an in-memory store that resets on every deploy.
  if (mode === 'unavailable') {
    return <NotConfigured />;
  }

  const session = await getSession();

  // The login page renders its own shell, so an unauthenticated request falls
  // through to the route rather than being wrapped in the signed-in chrome.
  if (!session) return <>{children}</>;

  const repository = await getCrmRepository();
  if (!repository) return <NotConfigured />;

  return (
    <AdminChrome session={session} repositoryName={repository.name}>
      {children}
    </AdminChrome>
  );
}

function NotConfigured() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper-100 px-5">
      <div className="max-w-xl border border-paper-300 bg-paper-50 p-8">
        <h1 className="font-display text-xl font-semibold text-ink-900">
          The admin area is not configured
        </h1>
        <p className="mt-3 leading-relaxed text-ink-600">
          The CRM needs a database. Create a Supabase project, apply the
          migrations in <code className="text-ink-800">supabase/migrations</code>, and
          set <code className="text-ink-800">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="text-ink-800">SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
        <p className="mt-3 leading-relaxed text-ink-600">
          For local development without Supabase, set{' '}
          <code className="text-ink-800">ADMIN_DEV_PASSWORD</code> instead. That path
          is deliberately disabled in production.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-technical-700 underline-offset-4 hover:underline"
        >
          Back to the website
        </Link>
      </div>
    </div>
  );
}
