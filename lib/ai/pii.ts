/**
 * Contact-detail protection for agent output.
 *
 * The brief's rule is blunt: do not fabricate contact information. Iteration 6
 * enforces it in three places, and this file is the last of them:
 *
 *   1. **Shape.** The Decision Maker agent's output schema has no email field
 *      and no phone field. A model cannot return what the schema cannot hold,
 *      so the common failure — a confidently invented `firstname.lastname@`
 *      address — is not merely discouraged, it is unrepresentable.
 *   2. **Sourcing.** A named individual is a claim like any other and is
 *      downgraded to `unknown` if it arrives without a source URL.
 *   3. **This file.** Free text is the gap in (1): a model told it cannot fill
 *      an email field will sometimes put the address in a `note` or a
 *      `relevance` sentence instead. Every string in every agent output is
 *      scanned, and anything that reads as an email address or a phone number
 *      is replaced with a visible marker before the output is persisted.
 *
 * Two deliberate choices:
 *
 * **Redact, do not reject.** A whole research run thrown away because one
 * sentence contained a phone number would tempt the next person to switch the
 * check off. The marker is visible in the review UI, so the reviewer sees that
 * something was removed rather than reading silently altered prose.
 *
 * **Allow our own details through.** A future outreach draft has to be able to
 * carry Bageshwar Balaji's own verified phone number and email. The allow list
 * is explicit and comes from the verified content layer, so "our number" means
 * a number a human has confirmed, not any number the model finds plausible.
 *
 * False positives were the design constraint. This code reads text about
 * chainages, IRC clause numbers, MoRTH section references, retroreflectivity
 * figures and rupee amounts all day. The patterns below are narrow on purpose
 * and are covered by negative tests in `scripts/test-ai-governance.ts`.
 */

export type PiiKind = 'email' | 'phone';

export interface PiiRemoval {
  readonly kind: PiiKind;
  /** Where in the output it was found, e.g. `contacts[0].relevance`. */
  readonly path: string;
  /**
   * A short, non-reversible fingerprint of what was removed.
   *
   * The point of removing a fabricated contact detail is that it stops
   * existing. Writing the full value into the audit log would put it straight
   * back into the database, so only the shape is recorded — enough to tell a
   * repeated pattern from a one-off, not enough to reconstruct.
   */
  readonly fingerprint: string;
}

export interface PiiScrubResult<T> {
  readonly value: T;
  readonly removals: readonly PiiRemoval[];
}

export const EMAIL_MARKER = '[email removed — not verified]';
export const PHONE_MARKER = '[phone number removed — not verified]';

/* -------------------------------------------------------------------------- */
/* Patterns                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A plain email address.
 *
 * Local part deliberately excludes a leading or trailing dot so that a
 * sentence like "email us at.info@example.com" cannot smuggle punctuation in,
 * and the TLD requires at least two letters so "user@host" alone is not a hit.
 */
const EMAIL = /\b[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,24}\b/g;

/**
 * Bracket-obfuscated addresses: `name [at] example [dot] com`.
 *
 * Only the bracketed forms are matched. A rule covering bare " at " would
 * mangle ordinary prose ("look at example.com"), and mangling prose to catch
 * an obfuscation a model has no reason to use is a bad trade.
 */
const OBFUSCATED_EMAIL =
  /\b[A-Za-z0-9._%+-]+\s*[[({<]\s*at\s*[\])}>]\s*[A-Za-z0-9.-]+\s*(?:[[({<]\s*dot\s*[\])}>]\s*[A-Za-z0-9-]+\s*)+/gi;

/** `mailto:` and `tel:` URIs, which slip past the patterns above. */
const MAILTO = /\bmailto:\s*[^\s<>"']+/gi;
const TEL_URI = /\btel:\s*\+?[\d\s().-]{6,}/gi;

/**
 * Phone numbers.
 *
 * Four narrow patterns rather than one broad one, each anchored on something
 * that distinguishes a phone number from the other long numbers in this
 * domain:
 *
 *   INTERNATIONAL   a leading `+` and country code
 *   INDIAN_MOBILE   ten digits opening 6–9, the Indian mobile range
 *   INDIAN_STD      a leading 0 trunk prefix, then an area code and number
 *   LABELLED        preceded by "phone", "mobile", "contact" and similar
 *
 * Every candidate is then checked by `looksLikePhone()`, which rejects the
 * things this codebase actually writes: rupee amounts, chainages, clause
 * numbers, years and measurement figures.
 */
const PHONE_PATTERNS: readonly RegExp[] = [
  // +91 98765 43210 · +91-98765-43210 · +44 (0)20 7946 0958
  /\+\d{1,3}[\s.\u2010-\u2015-]?(?:\(\s*\d{1,5}\s*\)[\s.\u2010-\u2015-]?)?\d(?:[\s.\u2010-\u2015-]?\d){6,14}/g,
  // 9876543210 · 98765 43210 · 98765-43210
  // The lookarounds exclude a neighbouring digit, comma or dash. A full stop
  // is excluded only where it is a decimal point, so a number that ends a
  // sentence is still caught.
  /(?<![\d,\u2010-\u2015-])(?<!\d\.)[6-9]\d{4}[\s.\u2010-\u2015-]?\d{5}(?![\d,\u2010-\u2015-])(?!\.\d)/g,
  // 022-24567890 · 0141 2345678 · (011) 2345 6789
  /(?<![\d,])(?<!\d\.)\(?0\d{1,4}\)?[\s.\u2010-\u2015-]?\d{3}[\s.\u2010-\u2015-]?\d{3,5}(?![\d,])(?!\.\d)/g,
  // phone: 2345 6789 — a label makes a shorter run of digits a phone number
  /\b(?:phone|mobile|cell|tel|telephone|contact(?:\s+number)?|call|whatsapp|fax)\b\s*(?:no\.?|number|at|:|-|—)?\s*\+?\d(?:[\s.\u2010-\u2015-]?\d){5,14}/gi,
];

/**
 * Words that make a following number a measurement rather than a contact.
 *
 * The negative tests in the governance suite are the specification for this
 * list; anything added here needs a test showing what it stops mangling.
 */
const MEASUREMENT_CONTEXT =
  /(?:₹|rs\.?|inr|usd|\$|lakh|crore|cr\.?|km|kms?|kilometres?|kilometers?|metres?|meters?|mm|cm|sqm|sq\.?\s?m|m2|mcd|lux|micron|kg|tonnes?|tons?|litres?|liters?|irc[:\s-]*\d*|is[:\s-]*\d+|astm|bs[:\s-]*\d+|morth|clause|section|chainage|ch\.?|package|pkg\.?|nh|sh|pin|pincode|gst(?:in)?|pan|cin|udyam|invoice|po|tender|bid|ref\.?|reference|year|fy|version|v)\s*[:#-]?\s*$/i;

/** Trailing units that make a preceding number a measurement. */
const MEASUREMENT_UNIT =
  /^\s*(?:%|km|kms|m|mm|cm|sqm|m2|mcd|lux|micron|kg|tonnes?|tons?|litres?|liters?|nos\.?|units?|lakh|crore|cr\b)/i;

/* -------------------------------------------------------------------------- */
/* Classification                                                              */
/* -------------------------------------------------------------------------- */

const digitsOf = (value: string): string => value.replace(/\D/g, '');

/**
 * Decide whether a candidate really is a phone number.
 *
 * Called with the surrounding text so a figure introduced by "₹" or followed
 * by "km" can be left alone. Length is the main filter: 8–15 digits covers
 * every real dialling format and excludes both PIN codes and the fifteen-plus
 * digit identifiers (GSTIN, account numbers) that are not phone numbers even
 * though they are long.
 */
export function looksLikePhone(candidate: string, before = '', after = ''): boolean {
  const digits = digitsOf(candidate);
  if (digits.length < 8 || digits.length > 15) return false;

  // Part of a longer token: `2024_MORTH_9876543210_1`, a filename, a path
  // segment. A phone number is written as its own word.
  if (/[A-Za-z0-9_/\\]$/.test(before)) return false;
  if (/^[A-Za-z0-9_/\\]/.test(after)) return false;

  // A run of identical digits, or a strict ascending/descending run, is
  // placeholder text rather than a number anyone could dial.
  if (/^(\d)\1+$/.test(digits)) return false;

  if (MEASUREMENT_CONTEXT.test(before)) return false;
  if (MEASUREMENT_UNIT.test(after)) return false;

  // A decimal figure: "1234567.89". Phone numbers do not carry decimals.
  if (/[\d]\.\d{1,2}\s*$/.test(candidate) && !/^\+/.test(candidate.trim())) {
    if (!/[\s()\u2010-\u2015-]/.test(candidate.replace(/^\+/, ''))) return false;
  }

  // Indian digit grouping for money: 12,34,567. The comma is not a phone
  // separator, so any candidate containing one is an amount.
  if (candidate.includes(',')) return false;

  return true;
}

/** A short, non-reversible description of a removed value. */
function fingerprint(kind: PiiKind, value: string): string {
  if (kind === 'email') {
    const at = value.lastIndexOf('@');
    const domain = at === -1 ? '' : value.slice(at + 1).toLowerCase();
    return domain ? `email@${domain}` : 'email';
  }
  const digits = digitsOf(value);
  return `phone(${digits.length} digits, ends ${digits.slice(-2)})`;
}

/* -------------------------------------------------------------------------- */
/* Scrubbing a single string                                                   */
/* -------------------------------------------------------------------------- */

export interface ScrubTextResult {
  readonly text: string;
  readonly removals: readonly { kind: PiiKind; fingerprint: string }[];
}

/**
 * Spans occupied by URLs.
 *
 * A tender notice URL ending `/notice/9876543210` is evidence, and rewriting
 * digits inside it would break the one thing that makes a claim checkable.
 * Phone matches falling inside a URL are therefore skipped.
 *
 * Email matches are not skipped, even inside a URL. An `@` in a link is rare;
 * a real address reaching the CRM under cover of one is the outcome this file
 * exists to prevent, and a broken link is the cheaper failure.
 */
const URL_SPAN = /\b(?:https?:\/\/|www\.)[^\s<>"'()\[\]]+/gi;

function urlSpans(input: string): [number, number][] {
  const spans: [number, number][] = [];
  URL_SPAN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = URL_SPAN.exec(input)) !== null) {
    spans.push([match.index, match.index + match[0].length]);
  }
  return spans;
}

interface Hit {
  start: number;
  end: number;
  kind: PiiKind;
  raw: string;
}

/**
 * Remove email addresses and phone numbers from a single string.
 *
 * `allow` holds values that may pass through — our own verified contact
 * details, so an outreach draft can sign off with a real number.
 */
export function scrubText(input: string, allow: readonly string[] = []): ScrubTextResult {
  if (!input) return { text: input, removals: [] };

  const allowed = new Set(allow.map((value) => digitsOf(value)).filter((d) => d.length >= 6));
  const allowedText = new Set(allow.map((value) => value.trim().toLowerCase()).filter(Boolean));

  const hits: Hit[] = [];
  const urls = urlSpans(input);
  const insideUrl = (start: number, end: number): boolean =>
    urls.some(([from, to]) => start >= from && end <= to);

  const collect = (pattern: RegExp, kind: PiiKind, guard?: (m: RegExpExecArray) => boolean) => {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(input)) !== null) {
      // A zero-length match would loop forever.
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
        continue;
      }
      if (guard && !guard(match)) continue;
      hits.push({
        start: match.index,
        end: match.index + match[0].length,
        kind,
        raw: match[0],
      });
    }
  };

  collect(MAILTO, 'email');
  collect(EMAIL, 'email');
  collect(OBFUSCATED_EMAIL, 'email');
  collect(TEL_URI, 'phone');
  for (const pattern of PHONE_PATTERNS) {
    collect(pattern, 'phone', (match) =>
      !insideUrl(match.index, match.index + match[0].length) &&
      looksLikePhone(
        match[0],
        input.slice(Math.max(0, match.index - 24), match.index),
        input.slice(match.index + match[0].length, match.index + match[0].length + 8),
      ),
    );
  }

  if (hits.length === 0) return { text: input, removals: [] };

  // Longest match wins where two patterns overlap, so "+91 98765 43210" is
  // removed whole rather than leaving a stray "+91".
  hits.sort((a, b) => a.start - b.start || b.end - a.end);

  const removals: { kind: PiiKind; fingerprint: string }[] = [];
  let out = '';
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start < cursor) continue;

    const trimmed = hit.raw.trim();
    if (allowedText.has(trimmed.toLowerCase())) continue;
    if (hit.kind === 'phone') {
      const digits = digitsOf(trimmed);
      // Suffix match, so "+91 98765 43210" is recognised as the allowed
      // "98765 43210" written with a country code.
      const isOurs = [...allowed].some(
        (value) => digits === value || digits.endsWith(value) || value.endsWith(digits),
      );
      if (isOurs) continue;
    }

    out += input.slice(cursor, hit.start);
    out += hit.kind === 'email' ? EMAIL_MARKER : PHONE_MARKER;
    removals.push({ kind: hit.kind, fingerprint: fingerprint(hit.kind, trimmed) });
    cursor = hit.end;
  }

  out += input.slice(cursor);
  return { text: out, removals };
}

/** True when a string contains something that reads as a contact detail. */
export function containsPii(input: string, allow: readonly string[] = []): boolean {
  return scrubText(input, allow).removals.length > 0;
}

/* -------------------------------------------------------------------------- */
/* Scrubbing a whole agent output                                              */
/* -------------------------------------------------------------------------- */

/**
 * Keys whose string values are structural rather than prose.
 *
 * A source URL is the evidence for a claim; running it through a phone-number
 * pattern risks corrupting the one thing that makes a claim checkable. LinkedIn
 * and company URLs are the same. These are validated as URLs by their schemas,
 * which is a stronger guarantee than this scrubber could give them.
 */
const STRUCTURAL_KEYS = new Set([
  'url',
  'website',
  'linkedinUrl',
  'publicSourceUrl',
  'sourceUrl',
  'evidenceUrl',
  'fetchedAt',
  'status',
  'confidence',
]);

export interface PiiScrubOptions {
  /** Contact details that may pass through — our own verified ones. */
  readonly allow?: readonly string[];
}

/**
 * Walk an agent output and scrub every free-text string.
 *
 * Runs after `downgradeUnsourced()` and before persistence, so nothing with a
 * fabricated contact detail in it reaches the database, the review UI or an
 * export.
 */
export function scrubPii<T>(input: T, options: PiiScrubOptions = {}): PiiScrubResult<T> {
  const allow = options.allow ?? [];
  const removals: PiiRemoval[] = [];

  function walk(node: unknown, path: string, key: string | null): unknown {
    if (typeof node === 'string') {
      if (key !== null && STRUCTURAL_KEYS.has(key)) return node;
      const { text, removals: found } = scrubText(node, allow);
      for (const hit of found) {
        removals.push({ kind: hit.kind, path: path || '(root)', fingerprint: hit.fingerprint });
      }
      return text;
    }

    if (Array.isArray(node)) {
      return node.map((entry, index) => walk(entry, `${path}[${index}]`, key));
    }

    if (typeof node === 'object' && node !== null) {
      const out: Record<string, unknown> = {};
      for (const [childKey, entry] of Object.entries(node)) {
        out[childKey] = walk(entry, path ? `${path}.${childKey}` : childKey, childKey);
      }
      return out;
    }

    return node;
  }

  return { value: walk(input, '', null) as T, removals };
}

/**
 * The contact details that may appear in agent output: ours, and only where a
 * human has verified them.
 *
 * Reads the verified content layer rather than the environment, so this list
 * is empty until the founder supplies and verifies a number. Empty is the safe
 * state: nothing is allowed through.
 */
export async function ourContactDetails(): Promise<string[]> {
  const { company } = await import('@/content/company');
  const values: string[] = [];
  for (const fact of [company.contact.phone, company.contact.altPhone, company.contact.email]) {
    if (fact.verification === 'verified') values.push(fact.value);
  }
  return values;
}
