/**
 * Emit a JSON-LD document.
 *
 * The payload is produced by lib/schema.ts from the same content the page
 * renders, so structured data cannot describe something a visitor cannot see.
 */
export function JsonLd({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // The payload is JSON.stringify output from our own content, not user input.
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, '\\u003c') }}
    />
  );
}
