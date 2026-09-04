import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './Container';

/**
 * A page band. `tone` selects the dark shell or the light content ground —
 * the alternation is what gives the site its structure, so bands are always
 * declared rather than styled ad hoc.
 */
export function Section({
  children,
  tone = 'light',
  className,
  width = 'default',
  id,
  as: Tag = 'section',
  labelledBy,
}: {
  children: ReactNode;
  tone?: 'light' | 'dark' | 'darker' | 'muted';
  className?: string;
  width?: 'default' | 'narrow' | 'wide';
  id?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
  labelledBy?: string;
}) {
  const dark = tone === 'dark' || tone === 'darker';
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'py-16 sm:py-20 lg:py-section',
        tone === 'light' && 'bg-paper-50 text-ink-800',
        tone === 'muted' && 'bg-paper-100 text-ink-800',
        tone === 'dark' && 'band-dark bg-graphite-900 text-graphite-300',
        tone === 'darker' && 'band-dark bg-graphite-950 text-graphite-300',
        dark && 'text-paper-200',
        className,
      )}
    >
      <Container width={width}>{children}</Container>
    </Tag>
  );
}

/** Section heading with optional eyebrow and standfirst. */
export function SectionHeading({
  eyebrow,
  title,
  standfirst,
  tone = 'light',
  id,
  level = 2,
  className,
}: {
  eyebrow?: string;
  title: string;
  standfirst?: string;
  tone?: 'light' | 'dark';
  id?: string;
  level?: 2 | 3;
  className?: string;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow ? (
        <p
          className={cn(
            'mb-3 text-xs font-semibold tracking-[0.14em] uppercase',
            tone === 'dark' ? 'text-safety-400' : 'text-safety-600',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={id}
        className={cn(
          'text-2xl leading-tight font-semibold sm:text-3xl lg:text-4xl',
          tone === 'dark' && 'text-paper-50',
        )}
      >
        {title}
      </Heading>
      {standfirst ? (
        <p
          className={cn(
            'mt-4 text-base leading-relaxed sm:text-lg',
            tone === 'dark' ? 'text-graphite-300' : 'text-ink-600',
          )}
        >
          {standfirst}
        </p>
      ) : null}
    </div>
  );
}
