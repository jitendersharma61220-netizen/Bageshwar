import type {
  AIProvider,
  GenerateObjectArgs,
  GenerateResult,
} from '../provider';

/**
 * A deterministic provider that calls no model.
 *
 * Two jobs:
 *
 *  1. It lets the whole pipeline — runner, governance, logging, review UI — be
 *     exercised without an API key, which is how Iteration 5 is verifiable
 *     before the founder supplies one.
 *  2. It lets the governance layer be tested against outputs a real model
 *     might plausibly produce, including bad ones: an unsourced fact, a
 *     fabricated contact, a confident guess. Those are the cases that matter,
 *     and waiting for a live model to happen to produce them would be a poor
 *     way to test the rules meant to catch them.
 *
 * Responses are registered by schema name. An unregistered call throws rather
 * than inventing something, so a missing fixture is loud.
 */
export class FixtureProvider implements AIProvider {
  readonly name = 'fixture';
  readonly configured = true;

  private readonly responses = new Map<string, unknown>();
  /** Calls made, for assertions in tests. */
  readonly calls: { schemaName: string; system: string; prompt: string }[] = [];

  constructor(responses?: Record<string, unknown>) {
    if (responses) {
      for (const [key, value] of Object.entries(responses)) this.responses.set(key, value);
    }
  }

  /** Register the object a given schema should return. */
  set(schemaName: string, value: unknown): this {
    this.responses.set(schemaName, value);
    return this;
  }

  async generateObject<T>(args: GenerateObjectArgs<T>): Promise<GenerateResult<T>> {
    this.calls.push({
      schemaName: args.schemaName,
      system: args.system,
      prompt: args.prompt,
    });

    if (!this.responses.has(args.schemaName)) {
      throw new Error(
        `FixtureProvider has no response registered for "${args.schemaName}". ` +
          'Register one with .set() rather than letting the test pass on invented data.',
      );
    }

    const candidate = this.responses.get(args.schemaName);

    // The fixture is still held to the schema. A fixture that has drifted from
    // the shape the agent expects should fail here, not silently pass a test
    // that the real provider would fail.
    const parsed = args.schema.safeParse(candidate);
    if (!parsed.success) {
      throw new Error(
        `Fixture for "${args.schemaName}" does not satisfy its own schema: ` +
          parsed.error.issues
            .map((i) => `${i.path.join('.')} ${i.message}`)
            .slice(0, 5)
            .join('; '),
      );
    }

    const raw = JSON.stringify(candidate);
    return {
      value: parsed.data,
      model: 'fixture-1',
      usage: { inputTokens: 0, outputTokens: 0 },
      raw,
    };
  }
}
