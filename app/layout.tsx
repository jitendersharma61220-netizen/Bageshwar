import type { ReactNode } from 'react';
import { Inter, Inter_Tight } from 'next/font/google';
import { defaultMetadata } from '@/lib/seo';
import './globals.css';

/**
 * Root layout.
 *
 * Deliberately minimal: document shell, fonts and global styles only. The
 * public site chrome lives in app/(site)/layout.tsx and the admin chrome in
 * app/admin/layout.tsx, so neither area inherits the other's furniture.
 */

export const metadata = defaultMetadata;

export const viewport = {
  themeColor: '#0e1114',
  width: 'device-width',
  initialScale: 1,
};

// Self-hosted through next/font: no render-blocking request to a font CDN,
// and no layout shift when the face swaps in.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700'],
  variable: '--font-inter-tight',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
