'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';
import { industryLinks, primaryNav, serviceLinks } from '@/lib/nav';
import { cn } from '@/lib/cn';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  const menuId = useId();

  // Close the mobile menu on navigation so the panel never outlives its route.
  // Adjusted during render rather than in an effect, which avoids the extra
  // render pass an effect-driven reset would cause.
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  // Lock body scroll only while the panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-700 bg-graphite-900/95 backdrop-blur supports-[backdrop-filter]:bg-graphite-900/85">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between gap-6 lg:h-20">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'rounded-card px-3 py-2 text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'text-safety-400'
                        : 'text-graphite-300 hover:text-paper-50',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ButtonLink href="/contact" variant="onDark" className="px-4 py-2.5">
              Discuss a Project
            </ButtonLink>
            <ButtonLink href="/request-quote" className="px-4 py-2.5">
              Request a Quote
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={menuId}
            className="-mr-2 inline-flex items-center gap-2 rounded-card p-2 text-sm font-medium text-paper-50 lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>

      <div
        id={menuId}
        hidden={!open}
        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-graphite-700 bg-graphite-950 lg:hidden"
      >
        <Container>
          <div className="space-y-6 py-6">
            <div className="flex flex-col gap-3">
              <ButtonLink href="/request-quote">Request a Quote</ButtonLink>
              <ButtonLink href="/upload-boq" variant="onDark">
                Submit BOQ / Tender
              </ButtonLink>
            </div>

            <MobileGroup title="Services" links={serviceLinks} />
            <MobileGroup title="Industries" links={industryLinks} />
            <MobileGroup
              title="Company"
              links={[
                { href: '/projects', label: 'Projects' },
                { href: '/execution-process', label: 'Execution Process' },
                { href: '/quality-compliance', label: 'Quality & Compliance' },
                { href: '/insights', label: 'Insights' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ]}
            />
          </div>
        </Container>
      </div>
    </header>
  );
}

function MobileGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-safety-400 uppercase">
        {title}
      </p>
      <ul className="border-l border-graphite-700">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block py-2 pl-4 text-sm text-graphite-300 hover:text-paper-50"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
