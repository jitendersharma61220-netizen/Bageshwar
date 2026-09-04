import { z } from 'zod';

/**
 * Claim governance.
 *
 * Every factual field an agent produces is wrapped in a `Claim`, which carries
 * how the value was arrived at and what backs it.
 *
 *   fact           directly supported by a named source
 *   inference      reasoned from evidence, not directly stated by it
 *   recommendation our suggested action
 *   unknown        not established — a valid and expected output
 *
 * The rule that matters: **a claim asserted as fact must name its sources.**
 *
 * That is enforced three times, deliberately:
 *
 *   1. `downgradeUnsourced()` rewrites an unsourced fact to `unknown` before
 *      anything else sees it;
 *   2. the database check constraint on `ai_outputs` rejects it on insert;
 *   3. the review UI shows the claim status beside every value.
 *
 * A model can be asked to behave well and sometimes will not. A constraint
 * cannot be persuaded.
 */

export const CLAIM_STATUSES = ['fact', 'inference', 'recommendation', 'unknown'] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const sourceSchema = z.object({
  url: z.url().max(2000),
  title: z.string().max(500).optional(),
  /** ISO timestamp. Set by the runner, not by the model. */
  fetchedAt: z.string().optional(),
});

export type Source = z.infer<typeof sourceSchema>;

/**
 * Build a Claim schema around a value schema.
 *
 * `value` is nullable because `unknown` is a real answer: an agent that cannot
 * establish something should say so rather than invent a plausible value.
 */
export function claimSchema<T extends z.ZodType>(value: T) {
  return z.object({
    value: value.nullable(),
    status: z.enum(CLAIM_STATUSES),
    sources: z.array(sourceSchema).default([]),
    confidence: z.number().min(0).max(1).default(0.5),
    note: z.string().max(1000).optional(),
  });
}

export interface Claim<T> {
  value: T | null;
  status: ClaimStatus;
  sources: Source[];
  confidence: number;
  note?: string;
}

/** A claim the runner rewrote, and why. */
export interface Downgrade {
  readonly path: string;
  readonly from: ClaimStatus;
  readonly to: ClaimStatus;
  readonly reason: string;
}

export interface GovernanceResult<T> {
  readonly value: T;
  readonly downgrades: readonly Downgrade[];
}

function isClaimLike(value: unknown): value is Claim<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'value' in value &&
    typeof (value as { status: unknown }).status === 'string' &&
    (CLAIM_STATUSES as readonly string[]).includes((value as { status: string }).status)
  );
}

/**
 * Walk an agent output and downgrade every unsourced fact to `unknown`.
 *
 * Returns a new structure rather than mutating, and reports what it changed so
 * the runner can record it. A prompt that keeps producing unsourced facts then
 * shows up as a measurable rate rather than as silence.
 *
 * A claim with `status: 'fact'` and no sources is not treated as an error to
 * reject: the rest of the output may be perfectly good. It is rewritten to
 * `unknown`, which is the honest reading of "asserted but unevidenced".
 */
export function downgradeUnsourced<T>(input: T): GovernanceResult<T> {
  const downgrades: Downgrade[] = [];

  function walk(node: unknown, path: string): unknown {
    if (isClaimLike(node)) {
      const claim = node as Claim<unknown>;
      const sources = Array.isArray(claim.sources) ? claim.sources : [];

      if (claim.status === 'fact' && sources.length === 0) {
        downgrades.push({
          path: path || '(root)',
          from: 'fact',
          to: 'unknown',
          reason: 'asserted as fact with no sources',
        });
        return {
          ...claim,
          status: 'unknown' as const,
          sources: [],
          // The value is kept but is no longer presented as established. The
          // review UI renders an unknown as unverified rather than hiding it,
          // so the founder can judge it rather than lose it.
          confidence: Math.min(claim.confidence ?? 0.5, 0.3),
          note: claim.note
            ? `${claim.note} (downgraded: no source)`
            : 'Downgraded: asserted as fact with no source.',
        };
      }

      return { ...claim, sources };
    }

    if (Array.isArray(node)) {
      return node.map((entry, index) => walk(entry, `${path}[${index}]`));
    }

    if (typeof node === 'object' && node !== null) {
      const out: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(node)) {
        out[key] = walk(entry, path ? `${path}.${key}` : key);
      }
      return out;
    }

    return node;
  }

  return { value: walk(input, '') as T, downgrades };
}

/** Collect every source referenced anywhere in an output, de-duplicated by URL. */
export function collectSources(input: unknown): Source[] {
  const byUrl = new Map<string, Source>();

  function walk(node: unknown): void {
    if (isClaimLike(node)) {
      for (const source of node.sources ?? []) {
        if (source?.url && !byUrl.has(source.url)) byUrl.set(source.url, source);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(walk);
    }
  }

  walk(input);
  return [...byUrl.values()];
}

/**
 * The overall status of an output, for the single `claim_status` column on
 * `ai_outputs`.
 *
 * Deliberately conservative: an output is only `fact` if at least one claim is
 * an evidenced fact and none had to be downgraded. Anything else reads down.
 */
export function summariseStatus(
  input: unknown,
  downgrades: readonly Downgrade[],
): ClaimStatus {
  const statuses: ClaimStatus[] = [];

  function walk(node: unknown): void {
    if (isClaimLike(node)) {
      statuses.push(node.status);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(walk);
    }
  }
  walk(input);

  if (downgrades.length > 0) return 'inference';
  if (statuses.includes('fact')) return 'fact';
  if (statuses.includes('inference')) return 'inference';
  if (statuses.includes('recommendation')) return 'recommendation';
  return 'unknown';
}

/** Human-readable label for a claim status, used in the review UI. */
export const CLAIM_LABELS: Record<ClaimStatus, string> = {
  fact: 'Fact',
  inference: 'Inference',
  recommendation: 'Recommendation',
  unknown: 'Not established',
};
