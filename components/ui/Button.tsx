import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark';

const base =
  'inline-flex items-center justify-center gap-2 rounded-card px-5 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-safety-500 text-graphite-950 hover:bg-safety-400 focus-visible:outline-safety-600',
  secondary:
    'border border-ink-900/20 bg-transparent text-ink-900 hover:border-ink-900/40 hover:bg-paper-100',
  ghost: 'text-ink-700 underline-offset-4 hover:text-ink-900 hover:underline',
  onDark:
    'border border-paper-50/30 bg-transparent text-paper-50 hover:border-paper-50/60 hover:bg-paper-50/10',
};

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentProps<'button'>) {
  return (
    <button
      className={cn(base, variants[variant], 'disabled:opacity-60', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
