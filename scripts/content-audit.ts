/**
 * Content audit.
 *
 * Reports every company fact that is not yet backed by evidence, and fails the
 * build if a fact claims to be verified without naming a source.
 *
 * The output is the working checklist of what still needs to be pulled from the
 * corporate presentation. Run it with `pnpm content:audit`.
 */

import { company } from '../content/company';
import { portfolioProjects, publishedProjects } from '../content/portfolio';
import { services } from '../content/services';
import { industries } from '../content/industries';
import { insights } from '../content/insights';
import type { Fact } from '../content/types';

interface Gap {
  readonly area: string;
  readonly item: string;
  readonly note?: string;
}

interface Invalid {
  readonly area: string;
  readonly item: string;
  readonly reason: string;
}

const gaps: Gap[] = [];
const invalid: Invalid[] = [];
let verifiedCount = 0;

function isFact(value: unknown): value is Fact<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'verification' in value &&
    (value.verification === 'verified' || value.verification === 'pending')
  );
}

/**
 * Walk an arbitrary content value and record every Fact encountered. Traversing
 * rather than hand-listing means a fact added to the content layer later is
 * picked up automatically instead of being silently skipped.
 */
function walk(area: string, path: string, value: unknown, seen: WeakSet<object>): void {
  if (isFact(value)) {
    if (value.verification === 'pending') {
      gaps.push(
        value.note === undefined
          ? { area, item: value.label }
          : { area, item: value.label, note: value.note },
      );
    } else {
      verifiedCount += 1;
      if (!value.source || !String(value.source).trim()) {
        invalid.push({
          area,
          item: path,
          reason: 'marked verified but names no source',
        });
      }
    }
    return;
  }

  if (typeof value !== 'object' || value === null) return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(area, `${path}[${index}]`, entry, seen));
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    walk(area, path ? `${path}.${key}` : key, entry, seen);
  }
}

const seen = new WeakSet<object>();
walk('Company', '', company, seen);
portfolioProjects.forEach((project) => {
  walk(`Portfolio: ${project.slug}`, '', project, seen);
});

/* -------------------------------------------------------------------------- */
/* Report                                                                      */
/* -------------------------------------------------------------------------- */

const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const amber = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;

console.log('');
console.log(bold('Content audit — Bageshwar Balaji Construction Co.'));
console.log('');

console.log(bold('Published content'));
console.log(`  Services           ${services.length}`);
console.log(`  Industries         ${industries.length}`);
console.log(`  Insight articles   ${insights.length}${insights.length === 0 ? dim('  (Iteration 2)') : ''}`);
console.log(
  `  Portfolio projects ${publishedProjects.length} publishable of ${portfolioProjects.length} defined`,
);
console.log('');

if (invalid.length > 0) {
  console.log(red(bold(`Invalid facts (${invalid.length})`)));
  console.log(dim('  A verified fact must name the evidence that backs it.'));
  for (const entry of invalid) {
    console.log(`  ${red('x')} [${entry.area}] ${entry.item} — ${entry.reason}`);
  }
  console.log('');
}

if (gaps.length === 0) {
  console.log(green('No outstanding content gaps.'));
} else {
  console.log(amber(bold(`Outstanding evidence needed (${gaps.length})`)));
  console.log(
    dim(
      '  These do not render on the site. Supply the evidence, then replace\n' +
        "  pending(...) with verified(value, 'source') in content/company.ts.",
    ),
  );
  console.log('');

  const byArea = new Map<string, Gap[]>();
  for (const gap of gaps) {
    const list = byArea.get(gap.area) ?? [];
    list.push(gap);
    byArea.set(gap.area, list);
  }

  for (const [area, list] of byArea) {
    console.log(`  ${bold(area)}`);
    for (const gap of list) {
      console.log(`    ${amber('-')} ${gap.item}${gap.note ? dim(` — ${gap.note}`) : ''}`);
    }
    console.log('');
  }
}

console.log(
  dim(`${verifiedCount} verified fact(s), ${gaps.length} pending, ${invalid.length} invalid.`),
);
console.log('');

if (invalid.length > 0) {
  console.error(
    red('Content audit failed: a fact is marked verified without naming a source.'),
  );
  process.exit(1);
}

process.exit(0);
