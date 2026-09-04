import type { ReactNode } from 'react';
import type {
  CostFactor,
  FaqItem,
  Mistake,
  ProcessStep,
  SpecificationRow,
  StandardReference,
} from '@/content/types';
import { cn } from '@/lib/cn';

/**
 * The answer-first page sections.
 *
 * Every service and industry page composes these in the same order, defined in
 * docs/03-service-page-structure.md. Fixing the order in components rather than
 * leaving it to each page means a procurement reader finds the same answer in
 * the same place on every page, and no page can quietly omit a section.
 */

/* -------------------------------------------------------------------------- */

/**
 * The extractable answer. Placed first on the page, written as plain prose in
 * 40-60 words, because this is the block an answer engine or a reader scanning
 * for a decision will lift.
 */
export function DirectAnswer({ children }: { children: ReactNode }) {
  return (
    <div className="rule-accent bg-paper-100 py-5 pr-5 pl-6">
      <p className="text-lg leading-relaxed text-ink-900 sm:text-xl">{children}</p>
    </div>
  );
}

export function AeoSection({
  id,
  title,
  children,
  intro,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  intro?: string;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn('scroll-mt-24', className)}>
      <h2
        id={`${id}-heading`}
        className="text-xl font-semibold sm:text-2xl"
      >
        {title}
      </h2>
      {intro ? <p className="mt-3 text-ink-600">{intro}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Specification table.
 *
 * `tone` must match the band it sits on: the light styling is unreadable on a
 * graphite background, so the component carries both rather than assuming one.
 */
export function SpecificationTable({
  rows,
  tone = 'light',
  caption = 'Key specifications',
  columns,
}: {
  rows: readonly SpecificationRow[];
  tone?: 'light' | 'dark';
  caption?: string;
  columns?: { parameter: string; value: string; basis?: string };
}) {
  const dark = tone === 'dark';
  const showBasis = rows.some((row) => row.basis !== undefined);
  const heads = {
    parameter: columns?.parameter ?? 'Parameter',
    value: columns?.value ?? 'Typically specified',
    basis: columns?.basis ?? 'Basis',
  };

  return (
    <div
      className={cn(
        'w-full max-w-full overflow-x-auto border',
        dark ? 'border-graphite-700' : 'border-paper-300',
      )}
    >
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr
            className={cn(
              'text-left',
              dark ? 'bg-graphite-800 text-paper-50' : 'bg-graphite-900 text-paper-50',
            )}
          >
            <th scope="col" className="px-4 py-3 font-semibold">
              {heads.parameter}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {heads.value}
            </th>
            {showBasis ? (
              <th scope="col" className="px-4 py-3 font-semibold">
                {heads.basis}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.parameter}
              className={cn(
                'border-t align-top',
                dark ? 'border-graphite-700' : 'border-paper-200',
                index % 2 === 1 && (dark ? 'bg-graphite-850' : 'bg-paper-100/60'),
              )}
            >
              <th
                scope="row"
                className={cn(
                  'px-4 py-3 text-left font-medium',
                  dark ? 'text-paper-50' : 'text-ink-900',
                )}
              >
                {row.parameter}
              </th>
              <td className={cn('px-4 py-3', dark ? 'text-graphite-200' : 'text-ink-700')}>
                {row.value}
              </td>
              {showBasis ? (
                <td
                  className={cn('px-4 py-3', dark ? 'text-graphite-300' : 'text-ink-500')}
                >
                  {row.basis ?? '\u2014'}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function BulletList({
  items,
  tone = 'light',
}: {
  items: readonly string[];
  tone?: 'light' | 'dark';
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 bg-safety-500"
          />
          <span className={tone === 'dark' ? 'text-graphite-300' : 'text-ink-700'}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ProseList({
  items,
  tone = 'light',
}: {
  items: readonly string[];
  tone?: 'light' | 'dark';
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-safety-500" />
          <span
            className={cn(
              'leading-relaxed',
              tone === 'dark' ? 'text-graphite-300' : 'text-ink-700',
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

export function ProcessList({
  steps,
  tone = 'light',
}: {
  steps: readonly ProcessStep[];
  tone?: 'light' | 'dark';
}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={cn(
            'grid grid-cols-[2.5rem_1fr] gap-4 border-t py-5 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_1fr]',
            tone === 'dark' ? 'border-graphite-700' : 'border-paper-200',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'tabular font-display text-lg font-semibold',
              tone === 'dark' ? 'text-safety-400' : 'text-safety-600',
            )}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3
              className={cn(
                'text-base font-semibold',
                tone === 'dark' ? 'text-paper-50' : 'text-ink-900',
              )}
            >
              {step.title}
            </h3>
            <p
              className={cn(
                'mt-1.5 leading-relaxed',
                tone === 'dark' ? 'text-graphite-300' : 'text-ink-600',
              )}
            >
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */

export function CostFactorList({ factors }: { factors: readonly CostFactor[] }) {
  return (
    <dl className="divide-y divide-paper-200 border-y border-paper-200">
      {factors.map((factor) => (
        <div key={factor.factor} className="grid gap-1 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6">
          <dt className="font-medium text-ink-900">{factor.factor}</dt>
          <dd className="leading-relaxed text-ink-600">{factor.effect}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */

export function MistakeList({ mistakes }: { mistakes: readonly Mistake[] }) {
  return (
    <ul className="space-y-5">
      {mistakes.map((entry) => (
        <li key={entry.mistake} className="border border-paper-300 bg-paper-100/60 p-5">
          <h3 className="text-base font-semibold text-ink-900">{entry.mistake}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            <span className="font-medium text-ink-800">What happens: </span>
            {entry.consequence}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            <span className="font-medium text-safety-600">Do this instead: </span>
            {entry.instead}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Visible FAQ list.
 *
 * The matching FAQPage structured data is emitted by the page from the same
 * array, so schema can only ever describe questions a visitor can actually see.
 */
export function FaqList({ faqs }: { faqs: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-paper-200 border-y border-paper-200">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-4">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-ink-900 marker:content-['']">
            <span>{faq.question}</span>
            <span
              aria-hidden="true"
              className="mt-1 shrink-0 text-safety-600 transition-transform duration-150 group-open:rotate-45"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Standards referenced by a page.
 *
 * Presented explicitly as public technical references, with a note that they
 * describe the standard rather than a company credential. Company compliance
 * and certification are separate claims and live behind the verification layer.
 */
export function StandardsList({ standards }: { standards: readonly StandardReference[] }) {
  if (standards.length === 0) return null;
  return (
    <div className="border border-paper-300 bg-paper-100/60 p-5">
      <h3 className="text-sm font-semibold text-ink-900">Standards referenced on this page</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {standards.map((standard) => (
          <li key={standard.code} className="text-ink-600">
            <span className="font-medium text-ink-800">{standard.code}</span>
            {' — '}
            {standard.title}
            <span className="text-ink-500"> ({standard.issuer})</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        These are public technical standards, referenced here to describe what is
        commonly specified. The governing specification for any project is the one
        stated in its contract. Listing a standard here is not a claim of
        certification or approval under it.
      </p>
    </div>
  );
}
