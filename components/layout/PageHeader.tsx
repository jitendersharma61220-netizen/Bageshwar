import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

/** The dark page header used by every interior page. */
export function PageHeader({
  eyebrow,
  title,
  standfirst,
  className,
}: {
  eyebrow?: string;
  title: string;
  standfirst?: string;
  className?: string;
}) {
  return (
    <div className={cn('band-dark bg-graphite-900 py-14 sm:py-16 lg:py-20', className)}>
      <Container>
        {eyebrow ? (
          <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-safety-400 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-4xl text-3xl leading-tight font-semibold text-paper-50 sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {standfirst ? (
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-graphite-300 sm:text-lg">
            {standfirst}
          </p>
        ) : null}
      </Container>
    </div>
  );
}
