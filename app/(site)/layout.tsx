import type { ReactNode } from 'react';
import { SiteShell } from '@/components/layout/SiteShell';

/** The public website. The admin area has its own shell. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
