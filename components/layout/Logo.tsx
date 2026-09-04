import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Wordmark. Typographic rather than a supplied logo file, because no brand
 * asset has been provided and a placeholder graphic would be worse than none.
 * Replace with the company mark when it is available.
 */
export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    // No aria-label: the visible wordmark is the accessible name. An aria-label
    // that did not contain the visible text would fail WCAG 2.5.3 (label in name).
    <Link href="/" className="group flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-safety-500 font-display text-sm font-bold text-graphite-950"
      >
        BB
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[0.95rem] font-semibold tracking-tight',
            tone === 'dark' ? 'text-paper-50' : 'text-ink-900',
          )}
        >
          Bageshwar Balaji
        </span>
        <span
          className={cn(
            'mt-1 text-[0.65rem] tracking-[0.12em] uppercase',
            tone === 'dark' ? 'text-graphite-300' : 'text-ink-500',
          )}
        >
          Construction Co.
        </span>
      </span>
    </Link>
  );
}
