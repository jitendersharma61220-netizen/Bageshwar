import Script from 'next/script';

/**
 * GA4 loader.
 *
 * Renders nothing when no measurement ID is configured, so the site ships with
 * zero third-party requests until analytics is deliberately switched on. The
 * script is deferred so it never competes with content for the main thread
 * during first paint.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
