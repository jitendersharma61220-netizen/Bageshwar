import type { ReactNode } from 'react';
import { Inter, Inter_Tight } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Analytics } from '@/components/Analytics';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema, schemaGraph, websiteSchema } from '@/lib/schema';
import { defaultMetadata } from '@/lib/seo';
import './globals.css';

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
      <body className="flex min-h-dvh flex-col">
        <JsonLd json={schemaGraph(organizationSchema(), websiteSchema())} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-safety-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-graphite-950"
        >
          Skip to content
        </a>

        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
