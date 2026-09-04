import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Analytics } from '@/components/Analytics';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema, schemaGraph, websiteSchema } from '@/lib/schema';

/**
 * The public website shell.
 *
 * Kept separate from the root layout so the admin area does not inherit the
 * marketing header, footer and Organization schema. Used by the (site) route
 * group and by the global not-found page.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd json={schemaGraph(organizationSchema(), websiteSchema())} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-safety-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-graphite-950"
      >
        Skip to content
      </a>

      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>

      <Analytics />
    </>
  );
}
