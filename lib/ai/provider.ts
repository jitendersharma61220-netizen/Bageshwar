import type { z } from 'zod';

/**
 * The model interface.
 *
 * Gemini is the initial provider because the founder already has Gemini Pro.
 * This interface exists so that is a configuration choice rather than an
 * architectural commitment: no agent imports a provider, and every agent is
 * therefore testable against the fixture provider with no network access.
 */

export interface TokenUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface GenerateObjectArgs<T> {
  /** The shape the model must return. Also used to build the schema prompt. */
  readonly schema: z.ZodType<T>;
  /** Stable identifier for the shape, sent to providers that need one. */
  readonly schemaName: string;
  readonly system: string;
  readonly prompt: string;
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
}

export interface GenerateResult<T> {
  readonly value: T;
  readonly model: string;
  readonly usage: TokenUsage;
  /** The raw text the model returned, kept for the audit trail. */
  readonly raw: string;
}

export interface AIProvider {
  readonly name: string;
  /** True when the provider can actually reach a model. */
  readonly configured: boolean;

  generateObject<T>(args: GenerateObjectArgs<T>): Promise<GenerateResult<T>>;
}

/** Thrown when a provider returns something that is not the requested shape. */
export class ProviderOutputError extends Error {
  constructor(
    message: string,
    readonly raw: string,
  ) {
    super(message);
    this.name = 'ProviderOutputError';
  }
}

/**
 * Pull a JSON object out of a model response.
 *
 * Models wrap JSON in prose or fences more often than their documentation
 * suggests, so this is deliberately forgiving about the envelope and strict
 * about the contents: whatever is extracted still has to satisfy the schema.
 */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the outermost braces.
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw new ProviderOutputError('The model did not return valid JSON.', raw);
  }
}
