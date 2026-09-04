import 'server-only';
import type { AIProvider } from './provider';

/**
 * Provider selection.
 *
 * `AI_PROVIDER` chooses; the key decides whether that choice is usable. When
 * nothing is configured, this returns null rather than a stub that pretends to
 * work — an agent run that cannot reach a model should say so, not produce
 * plausible output from nowhere.
 */

let cached: AIProvider | null | undefined;

export async function getProvider(): Promise<AIProvider | null> {
  if (cached !== undefined) return cached;

  const configured = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase();

  if (configured === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      const { OpenAIProvider } = await import('./providers/openai');
      cached = new OpenAIProvider(key);
      return cached;
    }
  }

  if (configured === 'gemini') {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      const { GeminiProvider } = await import('./providers/gemini');
      cached = new GeminiProvider(key);
      return cached;
    }
  }

  /*
   * Development fixture.
   *
   * Lets the research flow be run, demonstrated and screenshotted without an
   * API key. Refused in production for the same reason the in-memory CRM is:
   * a system that produces canned output while appearing to research would be
   * worse than one that plainly says it is not configured.
   */
  if (configured === 'fixture' && process.env.NODE_ENV !== 'production') {
    const [{ FixtureProvider }, fixtures] = await Promise.all([
      import('./providers/fixture'),
      import('./providers/dev-fixture-data'),
    ]);
    cached = new FixtureProvider({
      'market-research-v1': fixtures.DEV_RESEARCH_FIXTURE,
      'opportunity-matching-v1': fixtures.DEV_SCORE_FIXTURE,
      'decision-maker-v1': fixtures.DEV_DECISION_MAKER_FIXTURE,
    });
    return cached;
  }

  cached = null;
  return cached;
}

/** Replace the provider. Tests only. */
export function setProviderForTesting(provider: AIProvider | null): void {
  cached = provider;
}

export function resetProviderForTesting(): void {
  cached = undefined;
}
