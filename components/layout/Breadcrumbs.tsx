import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export interface Crumb {
  readonly href: string;
  readonly label: string;
}

/**
 * Visible breadcrumb trail. The matching BreadcrumbList structured data is
 * emitted by the page, from the same crumb array, so the two cannot diverge.
 */
export function Breadcrumbs({ crumbs }: { crumbs: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-paper-200 bg-paper-100">
      <Container>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-xs text-ink-600">
          <li>
            <Link href="/" className="hover:text-ink-900 hover:underline">
              Home
            </Link>
          </li>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-ink-500">
                  /
                </span>
                {isLast ? (
                  <span aria-current="page" className="font-medium text-ink-800">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-ink-900 hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
