/**
 * Claim governance tests.
 *
 * These exercise the rule the whole AI layer rests on: a claim asserted as
 * fact must name its sources, and one that does not is downgraded before
 * anything else sees it.
 *
 * The fixture provider is used deliberately. The cases that matter are the bad
 * ones — an unsourced fact, a confident guess, a fabricated project — and
 * waiting for a live model to happen to produce them would be a poor way to
 * test the rules built to catch them.
 *
 * Run with `pnpm test:ai`.
 */

import { z } from 'zod';
import {
  claimSchema,
  collectSources,
  downgradeUnsourced,
  summariseStatus,
  type Claim,
} from '../lib/ai/claims';
import { FixtureProvider } from '../lib/ai/providers/fixture';
import { extractJson, ProviderOutputError } from '../lib/ai/provider';
import {
  marketResearchAgent,
  marketResearchOutputSchema,
} from '../lib/ai/agents/market-research';

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  ${green('ok')}   ${label}`);
  } else {
    failed += 1;
    console.log(`  ${red('FAIL')} ${label}`);
    if (detail) console.log(dim(`         ${detail}`));
  }
}

async function assertThrows(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
    failed += 1;
    console.log(`  ${red('FAIL')} ${label}`);
    console.log(dim('         did not throw'));
  } catch {
    passed += 1;
    console.log(`  ${green('ok')}   ${label}`);
  }
}

const SOURCE = { url: 'https://example.com/tender-award', title: 'Award notice' };

const fact = <T>(value: T): Claim<T> => ({
  value,
  status: 'fact',
  sources: [SOURCE],
  confidence: 0.9,
});
const unsourcedFact = <T>(value: T): Claim<T> => ({
  value,
  status: 'fact',
  sources: [],
  confidence: 0.9,
});
const unknown = (): Claim<never> => ({
  value: null,
  status: 'unknown',
  sources: [],
  confidence: 0.1,
});

async function main(): Promise<void> {
  console.log(`\n${bold('Claim governance')}`);

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Downgrading unsourced facts')}`);

  {
    const { value, downgrades } = downgradeUnsourced({ name: unsourcedFact('Acme EPC') });
    assert('an unsourced fact is downgraded to unknown', value.name.status === 'unknown',
      `status was ${value.name.status}`);
    assert('the downgrade is reported', downgrades.length === 1, `got ${downgrades.length}`);
    assert('the downgrade names the field', downgrades[0]?.path === 'name',
      `path was ${downgrades[0]?.path}`);
    assert('the value is kept rather than discarded', value.name.value === 'Acme EPC',
      'the value was dropped, so a human cannot judge it');
    assert('confidence is reduced', value.name.confidence <= 0.3,
      `confidence stayed at ${value.name.confidence}`);
    assert('the note explains why', /downgrad/i.test(value.name.note ?? ''),
      `note was ${value.name.note}`);
  }

  {
    const { value, downgrades } = downgradeUnsourced({ name: fact('Acme EPC') });
    assert('a sourced fact is left alone', value.name.status === 'fact');
    assert('no downgrade is reported for it', downgrades.length === 0);
  }

  {
    const { downgrades } = downgradeUnsourced({
      a: { status: 'inference', value: 'x', sources: [], confidence: 0.5 },
      b: { status: 'recommendation', value: 'y', sources: [], confidence: 0.5 },
      c: unknown(),
    });
    assert('inference, recommendation and unknown need no sources', downgrades.length === 0,
      `${downgrades.length} unexpected downgrades`);
  }

  {
    // The shape an agent actually returns: claims nested in objects and arrays.
    const { value, downgrades } = downgradeUnsourced({
      company: { name: fact('Sourced Co'), hq: unsourcedFact('Guessed City') },
      projects: [
        { title: unsourcedFact('Invented Package 7') },
        { title: fact('Real Package 3') },
      ],
    });
    assert('nested claims are reached', downgrades.length === 2, `got ${downgrades.length}`);
    assert('array elements are reached',
      downgrades.some((d) => d.path === 'projects[0].title'),
      downgrades.map((d) => d.path).join(', '));
    assert('the sourced sibling is untouched',
      value.projects[1]!.title.status === 'fact');
    assert('the sourced nested claim is untouched', value.company.name.status === 'fact');
  }

  {
    const { downgrades } = downgradeUnsourced({ plain: 'a string', n: 42, nil: null, arr: [1, 2] });
    assert('non-claim values pass through untouched', downgrades.length === 0);
  }

  {
    // A model returning `sources: undefined` rather than an empty array must not
    // slip past on a truthiness check.
    const malformed = { name: { value: 'X', status: 'fact', confidence: 0.9 } };
    const { value, downgrades } = downgradeUnsourced(malformed as never);
    assert('a fact with a missing sources field is downgraded', downgrades.length === 1,
      `got ${downgrades.length}`);
    assert('sources is normalised to an array',
      Array.isArray((value as { name: Claim<string> }).name.sources));
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Source collection and status summary')}`);

  {
    const sources = collectSources({
      a: fact('x'),
      b: { ...fact('y'), sources: [SOURCE, { url: 'https://example.com/second' }] },
    });
    assert('sources are collected across claims', sources.length === 2, `got ${sources.length}`);
    assert('duplicate URLs are collapsed',
      sources.filter((s) => s.url === SOURCE.url).length === 1);
  }

  {
    const clean = { a: fact('x') };
    assert('an all-sourced output summarises as fact',
      summariseStatus(clean, []) === 'fact');

    const { value, downgrades } = downgradeUnsourced({ a: unsourcedFact('x'), b: fact('y') });
    assert('an output that needed a downgrade never summarises as fact',
      summariseStatus(value, downgrades) === 'inference',
      `summarised as ${summariseStatus(value, downgrades)}`);

    assert('an output with nothing established summarises as unknown',
      summariseStatus({ a: unknown() }, []) === 'unknown');
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Provider output parsing')}`);

  assert('plain JSON is parsed', (extractJson('{"a":1}') as { a: number }).a === 1);
  assert('fenced JSON is parsed',
    (extractJson('```json\n{"a":2}\n```') as { a: number }).a === 2);
  assert('JSON wrapped in prose is recovered',
    (extractJson('Here you go:\n{"a":3}\nHope that helps.') as { a: number }).a === 3);
  {
    let threw = false;
    try {
      extractJson('not json at all');
    } catch (error) {
      threw = error instanceof ProviderOutputError;
    }
    assert('unparseable output raises a provider error', threw);
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Fixture provider')}`);

  {
    const provider = new FixtureProvider();
    await assertThrows('an unregistered schema throws rather than inventing data', () =>
      provider.generateObject({
        schema: z.object({ a: z.string() }),
        schemaName: 'nothing-registered',
        system: '',
        prompt: '',
      }),
    );
  }

  {
    const provider = new FixtureProvider().set('shape', { a: 123 });
    await assertThrows('a fixture that violates its own schema throws', () =>
      provider.generateObject({
        schema: z.object({ a: z.string() }),
        schemaName: 'shape',
        system: '',
        prompt: '',
      }),
    );
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Market Research Agent')}`);

  {
    assert('research does not require approval', marketResearchAgent.requiresApproval === false);
    assert('the agent declares a prompt version',
      /^v\d+$/.test(marketResearchAgent.promptVersion));

    const system = marketResearchAgent.system;
    assert('the system prompt forbids unsourced facts',
      /never mark something "fact" without at least one source/i.test(system));
    assert('the system prompt makes unknown an acceptable answer',
      /"unknown" is a good answer/i.test(system));
    assert('the system prompt forbids naming individuals',
      /do not name individual people/i.test(system));
    assert('the system prompt forbids inventing contact details',
      /do not invent contact details/i.test(system));
    assert('the system prompt forbids assumed vendor relationships',
      /is not evidence/i.test(system));

    const prompt = marketResearchAgent.buildPrompt({
      companyName: 'Test Highways EPC',
      website: 'https://example.com',
      knownContext: 'Met at a trade show.',
    });
    assert('the prompt carries the company name', prompt.includes('Test Highways EPC'));
    assert('the prompt carries known context', prompt.includes('Met at a trade show.'));
  }

  {
    // A plausible bad response: two fields asserted as fact with no source.
    const response = {
      companyName: fact('Test Highways EPC'),
      website: fact('https://example.com'),
      category: fact('epc' as const),
      hqLocation: unsourcedFact('Probably Mumbai'),
      operatingRegions: unknown(),
      currentProjects: {
        value: [
          {
            name: 'Invented Package 9',
            stage: 'current' as const,
            location: null,
            scopeSummary: null,
            valueIfPublic: null,
          },
        ],
        status: 'fact' as const,
        sources: [],
        confidence: 0.8,
      },
      upcomingProjects: unknown(),
      relevantServices: fact(['thermoplastic-road-marking']),
      opportunityType: { ...fact('Marking subcontract'), status: 'inference' as const },
      existingVendorInfo: unknown(),
      decisionMakerRoles: fact(['Procurement Head']),
      summary: { ...fact('A highway contractor.'), status: 'inference' as const },
      openQuestions: ['Confirm the head office location.'],
    };

    const parsed = marketResearchOutputSchema.safeParse(response);
    assert('the agent schema accepts a well-formed response', parsed.success,
      parsed.success ? '' : parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; '));

    if (parsed.success) {
      const { value, downgrades } = downgradeUnsourced(parsed.data);
      assert('both unsourced facts are caught', downgrades.length === 2,
        `caught ${downgrades.length}: ${downgrades.map((d) => d.path).join(', ')}`);
      assert('the guessed head office is downgraded',
        value.hqLocation.status === 'unknown');
      assert('the unsourced project list is downgraded',
        value.currentProjects.status === 'unknown');
      assert('the sourced service match survives',
        value.relevantServices.status === 'fact');
      assert('the whole output cannot summarise as fact after a downgrade',
        summariseStatus(value, downgrades) !== 'fact');
    }
  }

  {
    // The agent must be runnable end to end against the fixture, with the
    // fixture held to the agent's real schema.
    const clean = {
      companyName: fact('Sourced Highways Ltd'),
      website: fact('https://example.com'),
      category: fact('highway_contractor' as const),
      hqLocation: fact('Ahmedabad, Gujarat'),
      operatingRegions: fact(['Gujarat']),
      currentProjects: fact([
        {
          name: 'NH package widening',
          stage: 'current' as const,
          location: 'Gujarat',
          scopeSummary: 'Four-laning with associated safety works.',
          valueIfPublic: null,
        },
      ]),
      upcomingProjects: unknown(),
      relevantServices: fact(['highway-expressway-marking']),
      opportunityType: fact('Marking and safety subcontract'),
      existingVendorInfo: unknown(),
      decisionMakerRoles: fact(['Procurement Head', 'Project Director']),
      summary: fact('A highway contractor with live four-laning work in Gujarat.'),
      openQuestions: [],
    };

    const provider = new FixtureProvider().set('market-research-v1', clean);
    const result = await provider.generateObject({
      schema: marketResearchAgent.outputSchema,
      schemaName: `${marketResearchAgent.name}-${marketResearchAgent.promptVersion}`,
      system: marketResearchAgent.system,
      prompt: marketResearchAgent.buildPrompt({ companyName: 'Sourced Highways Ltd' }),
    });

    assert('a fully sourced response runs through the agent schema',
      result.value.companyName.status === 'fact');
    const { downgrades } = downgradeUnsourced(result.value);
    assert('a fully sourced response needs no downgrades', downgrades.length === 0,
      downgrades.map((d) => d.path).join(', '));
    assert('the provider records the call', provider.calls.length === 1);
    assert('the system prompt reached the provider',
      provider.calls[0]!.system.includes('market research analyst'));
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Schema shape')}`);

  {
    const optional = claimSchema(z.string());
    const nullValue = optional.safeParse({ value: null, status: 'unknown', sources: [] });
    assert('a claim may carry a null value, so "unknown" is expressible', nullValue.success);

    const badStatus = optional.safeParse({ value: 'x', status: 'certain', sources: [] });
    assert('an unrecognised claim status is rejected', !badStatus.success);

    const badSource = optional.safeParse({
      value: 'x',
      status: 'fact',
      sources: [{ url: 'not-a-url' }],
    });
    assert('a source that is not a URL is rejected', !badSource.success);
  }


}

/* -------------------------------------------------------------------------- */

main()
  .then(() => {
    console.log('');
    console.log(dim(`${passed} passed, ${failed} failed.`));
    console.log('');
    if (failed > 0) {
      console.log(red('Governance tests failed.\n'));
      process.exit(1);
    }
    console.log(green('All governance tests passed.\n'));
  })
  .catch((error: unknown) => {
    console.error(red(`\nGovernance tests crashed: ${(error as Error).message}\n`));
    process.exit(1);
  });
