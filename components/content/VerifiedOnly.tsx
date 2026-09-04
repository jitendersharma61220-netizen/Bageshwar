import type { ReactNode } from 'react';
import { isVerified, type Fact } from '@/content/types';

/**
 * Renders children only when the fact is evidenced.
 *
 * In development an unevidenced fact renders a visible marker so gaps are
 * obvious while building. In production it renders nothing at all — an
 * unevidenced claim never reaches a visitor in any form.
 */
export function VerifiedOnly<T>({
  fact,
  children,
  fallback,
}: {
  fact: Fact<T>;
  children: (value: T) => ReactNode;
  fallback?: ReactNode;
}) {
  if (isVerified(fact)) return <>{children(fact.value)}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  if (process.env.NODE_ENV === 'development') {
    return <ContentGap label={fact.label} />;
  }
  return null;
}

/**
 * Development-only gap marker. Deliberately loud, and deliberately never
 * rendered in production.
 */
export function ContentGap({ label }: { label: string }) {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <span
      data-content-gap
      className="inline-flex items-center gap-1.5 rounded-card border border-dashed border-safety-500 bg-safety-300/15 px-2 py-0.5 text-xs font-medium text-safety-600"
      title="This fact has no evidence yet. Run `pnpm content:audit` for the full list."
    >
      <span aria-hidden="true">!</span>
      Evidence needed: {label}
    </span>
  );
}

/**
 * Renders the first evidenced value from a list of facts, or nothing.
 * Used where a section needs at least one verified item to be worth showing.
 */
export function AnyVerified<T>({
  facts,
  children,
}: {
  facts: readonly Fact<T>[];
  children: (values: T[]) => ReactNode;
}) {
  const values = facts.filter(isVerified).map((f) => f.value);
  if (values.length === 0) return null;
  return <>{children(values)}</>;
}
