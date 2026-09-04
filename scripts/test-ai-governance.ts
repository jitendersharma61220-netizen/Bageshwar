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
import { containsPii, scrubPii, scrubText } from '../lib/ai/pii';
import {
  COMPONENT_WEIGHTS,
  SCORE_COMPONENTS,
  opportunityMatchingAgent,
  opportunityMatchingOutputSchema,
  priorityFor,
  scoreOpportunity,
} from '../lib/ai/agents/opportunity-matching';
import {
  decisionMakerAgent,
  decisionMakerOutputSchema,
  withSourcedIndividualsOnly,
} from '../lib/ai/agents/decision-maker';

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
  console.log(`\n${bold('Contact-detail removal')}`);

  {
    // The cases that matter: a model that puts a contact detail somewhere the
    // schema did not offer it.
    const found = [
      ['a plain email address', 'Write to rajesh.kumar@example.com about the tender.'],
      ['an Indian mobile number', 'Reach him on +91 98765 43210 any time.'],
      ['a bare ten-digit mobile', 'His mobile is 9876543210.'],
      ['a landline with an STD code', 'Call 022-24567890 for the site office.'],
      ['a bracket-obfuscated address', 'Try name [at] example [dot] com instead.'],
      ['a mailto link', 'mailto:someone@example.co.in'],
      ['a tel URI', 'tel:+919876543210'],
      ['a labelled short number', 'phone: 2345 6789'],
    ] as const;

    for (const [label, text] of found) {
      const result = scrubText(text);
      assert(`${label} is removed`, result.removals.length > 0, `left as: ${result.text}`);
      assert(
        `${label} leaves a visible marker`,
        /\[(?:email|phone number) removed/.test(result.text),
        result.text,
      );
    }
  }

  {
    // False positives were the design constraint: this codebase writes about
    // chainages, clause numbers and rupee amounts all day, and a scrubber that
    // mangles them would be switched off.
    const untouched = [
      ['an IRC citation', 'IRC:35-2015 governs road markings.'],
      ['a MoRTH section reference', 'MoRTH Section 803 covers thermoplastic.'],
      ['a retroreflectivity figure', 'Retroreflectivity of 150 mcd/m²/lux at handover.'],
      ['a chainage range', 'Chainage km 12+500 to km 18+200.'],
      ['a rupee amount', 'Contract value ₹ 12,45,67,890 as awarded.'],
      ['a thickness specification', 'Thickness 2.5 mm on carriageway, 3.0 mm on rumble strips.'],
      ['a highway number', 'The package covers 128 km of NH-48.'],
      ['a GSTIN', 'GSTIN 24AABCU9603R1ZX is on record.'],
      ['a run of years', 'Awarded in 2019, completed 2021, defect liability to 2023.'],
      ['a PIN code', 'PIN 302012, Jaipur.'],
      ['a URL with digits in the path', 'See https://etenders.gov.in/notice/9876543210 for it.'],
      ['a tender identifier', 'Tender ID 2024_MORTH_9876543210_1 on the portal.'],
      ['a glass bead rate', 'Glass beads at 250 g/m2, drop-on rate per IS 15039.'],
    ] as const;

    for (const [label, text] of untouched) {
      const result = scrubText(text);
      assert(`${label} is left alone`, result.removals.length === 0, `became: ${result.text}`);
    }
  }

  {
    const removed = scrubText('Reach him on +91 98765 43210.');
    assert(
      'the removal is fingerprinted rather than logged in full',
      removed.removals[0] !== undefined &&
        !removed.removals[0].fingerprint.includes('98765'),
      `fingerprint was ${removed.removals[0]?.fingerprint}`,
    );
  }

  {
    // Our own verified number must survive, so an outreach draft can sign off.
    const ours = scrubText('Call us on +91 98765 43210.', ['98765 43210']);
    assert('an allow-listed number passes through', ours.removals.length === 0, ours.text);

    const theirs = scrubText('Call them on +91 91234 56789.', ['98765 43210']);
    assert('a number not on the allow list is still removed', theirs.removals.length === 1);
  }

  {
    // The walk: nested objects, arrays, and the structural keys it must not touch.
    const output = {
      note: 'Ask for Mr Sharma on 9876543210.',
      contacts: [
        { relevance: 'Best reached at sharma@example.com.' },
        { relevance: 'Owns the marking package.' },
      ],
      sources: [{ url: 'https://example.com/team/9876543210', title: 'Team page' }],
      website: 'https://example.com',
    };

    const { value, removals } = scrubPii(output);
    assert('a phone number in a note is removed', removals.some((r) => r.path === 'note'));
    assert(
      'an email in a nested array element is removed',
      removals.some((r) => r.path === 'contacts[0].relevance'),
      removals.map((r) => r.path).join(', '),
    );
    assert('a clean sibling is untouched',
      value.contacts[1]!.relevance === 'Owns the marking package.');
    assert('a source URL is never rewritten',
      value.sources[0]!.url === 'https://example.com/team/9876543210');
    assert('a website field is never rewritten', value.website === 'https://example.com');
    assert('the removal names its kind',
      removals.every((r) => r.kind === 'email' || r.kind === 'phone'));
  }

  assert('containsPii agrees with scrubText',
    containsPii('mail me at a@b.com') && !containsPii('IRC:35-2015'));

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Opportunity Matching Agent')}`);

  const rating = (value: number, evidenced = true) => ({
    rating: value,
    reasoning: 'A reason long enough to satisfy the schema minimum.',
    basedOn: evidenced ? ['Current projects: a live package'] : [],
  });

  const ratings = (value: number, evidenced = true) =>
    Object.fromEntries(
      SCORE_COMPONENTS.map((component) => [component, rating(value, evidenced)]),
    ) as Record<(typeof SCORE_COMPONENTS)[number], ReturnType<typeof rating>>;

  {
    assert('the weights sum to 100',
      Object.values(COMPONENT_WEIGHTS).reduce((sum, w) => sum + w, 0) === 100);
    assert('every component carries a weight',
      SCORE_COMPONENTS.every((c) => COMPONENT_WEIGHTS[c] > 0));
  }

  {
    assert('all tens score 100', scoreOpportunity(ratings(10)).total === 100);
    assert('all zeroes score 0', scoreOpportunity(ratings(0)).total === 0);
    assert('all fives score 50', scoreOpportunity(ratings(5)).total === 50);
  }

  {
    assert('75 and above is priority A', priorityFor(75) === 'a' && priorityFor(100) === 'a');
    assert('50 to 74 is priority B', priorityFor(50) === 'b' && priorityFor(74) === 'b');
    assert('below 50 is priority C', priorityFor(49) === 'c' && priorityFor(0) === 'c');
  }

  {
    // The point of computing the total in code: a model cannot talk itself into
    // priority A, and cannot push the total outside the band by returning a
    // rating outside the scale.
    const outOfRange = ratings(10);
    outOfRange.serviceFit = { ...rating(99), rating: 99 };
    outOfRange.projectFit = { ...rating(0), rating: -50 };
    const scored = scoreOpportunity(outOfRange);
    assert('an out-of-range rating is clamped, not trusted',
      scored.total <= 100 && scored.total >= 0, `total was ${scored.total}`);
    assert('the clamped high rating counts as ten',
      scored.components.find((c) => c.component === 'serviceFit')?.rating === 10);
    assert('the clamped low rating counts as zero',
      scored.components.find((c) => c.component === 'projectFit')?.rating === 0);
  }

  {
    const scored = scoreOpportunity(ratings(7, false));
    assert('components rated with no evidence are counted',
      scored.unevidencedCount === SCORE_COMPONENTS.length,
      `counted ${scored.unevidencedCount}`);
    assert('the evidenced case counts none',
      scoreOpportunity(ratings(7, true)).unevidencedCount === 0);
  }

  {
    const first = scoreOpportunity(ratings(6));
    const second = scoreOpportunity(ratings(6));
    assert('the same ratings always give the same total', first.total === second.total);
    assert('every component is reported back with its reasoning',
      first.components.length === SCORE_COMPONENTS.length &&
        first.components.every((c) => c.reasoning.length > 0));
  }

  {
    const system = opportunityMatchingAgent.system;
    assert('scoring does not require approval',
      opportunityMatchingAgent.requiresApproval === false);
    assert('the scorer is told it does not produce the total',
      /You do NOT produce a total score or a priority/i.test(system));
    assert('the scorer is forbidden from introducing new facts',
      /Do not introduce new facts/i.test(system));
    assert('the scorer is forbidden from inventing prices',
      /Never state or estimate a price/i.test(system));
    assert('the scorer is forbidden from naming people or contact details',
      /Do not name individual people and do not produce any email address or phone/i.test(system));
    assert('the scorer is forbidden from claiming approved-vendor status',
      /Do not claim we are an approved or empanelled vendor/i.test(system));
    assert('an empty basedOn is stated to be acceptable',
      /An\s+empty basedOn is an accepted answer/i.test(system));

    const prompt = opportunityMatchingAgent.buildPrompt({
      companyName: 'Test Highways EPC',
      researchSummary: 'Head office (Not established): unknown',
      knownContext: 'Met at a trade show.',
    });
    assert('the prompt carries the research record',
      prompt.includes('Head office (Not established)'));
    assert('the prompt carries the founder notes', prompt.includes('Met at a trade show.'));
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Decision Maker Research Agent')}`);

  {
    // The structural guarantee: there is nowhere for a contact detail to go.
    const shape = JSON.stringify(z.toJSONSchema(decisionMakerOutputSchema));
    for (const forbidden of ['"email"', '"phone"', '"mobile"', '"directLine"']) {
      assert(`the output schema has no ${forbidden} field`, !shape.includes(forbidden),
        'a model can only return what the schema can hold');
    }
  }

  const person = {
    name: 'A Named Person',
    designation: 'Head — Procurement',
    role: 'procurement_head' as const,
    publicSourceUrl: 'https://example.com/leadership',
    sourceType: 'company_website' as const,
    profileUrl: null,
    relevance: 'Owns subcontract packages of this size.',
    confidence: 0.6,
    caveat: null,
  };

  const roles = [
    {
      role: 'procurement_head' as const,
      likelyTitle: null,
      whyThisRole: 'Owns the package.',
      suggestedApproach: 'Switchboard.',
    },
  ];

  const baseOutput = {
    individuals: [person],
    roles,
    vendorOnboarding: unknown(),
    primaryTarget: { ...unknown(), value: 'procurement_head' as const, status: 'recommendation' as const },
    openQuestions: [],
    noIndividualsFound: false,
  };

  {
    const parsed = decisionMakerOutputSchema.safeParse(baseOutput);
    assert('a sourced individual is accepted', parsed.success,
      parsed.success ? '' : parsed.error.issues.map((i) => i.message).join('; '));

    const noSource = decisionMakerOutputSchema.safeParse({
      ...baseOutput,
      individuals: [{ ...person, publicSourceUrl: undefined }],
    });
    assert('an individual with no source URL is rejected', !noSource.success);

    const badSource = decisionMakerOutputSchema.safeParse({
      ...baseOutput,
      individuals: [{ ...person, publicSourceUrl: 'not-a-url' }],
    });
    assert('an individual whose source is not a URL is rejected', !badSource.success);

    const noRoles = decisionMakerOutputSchema.safeParse({ ...baseOutput, roles: [] });
    assert('an output with no roles to target is rejected', !noRoles.success,
      'roles are the answer when no individual can be found');

    const inventedRole = decisionMakerOutputSchema.safeParse({
      ...baseOutput,
      individuals: [{ ...person, role: 'head_of_synergy' }],
    });
    assert('a role outside the target list is rejected', !inventedRole.success);
  }

  {
    // An empty result is a complete answer, and must parse as one.
    const empty = decisionMakerOutputSchema.safeParse({
      individuals: [],
      roles,
      vendorOnboarding: unknown(),
      primaryTarget: { ...unknown(), value: 'procurement_head', status: 'recommendation' },
      openQuestions: ['Confirm who signs off subcontracts.'],
      noIndividualsFound: true,
    });
    assert('"no individuals found" is a valid, complete output', empty.success,
      empty.success ? '' : empty.error.issues.map((i) => i.message).join('; '));
  }

  {
    const guarded = withSourcedIndividualsOnly({
      ...baseOutput,
      individuals: [person, { ...person, name: 'Unsourced Person', publicSourceUrl: '' }],
    });
    assert('an unsourced individual is dropped by the guard',
      guarded.output.individuals.length === 1 && guarded.dropped === 1);
    assert('the sourced individual survives',
      guarded.output.individuals[0]?.name === 'A Named Person');

    const allDropped = withSourcedIndividualsOnly({
      ...baseOutput,
      individuals: [{ ...person, publicSourceUrl: '' }],
    });
    assert('dropping everyone sets noIndividualsFound',
      allDropped.output.noIndividualsFound === true);
  }

  {
    const system = decisionMakerAgent.system;
    assert('the agent is told never to produce an email address',
      /NEVER produce an email address/i.test(system));
    assert('the agent is told never to produce a phone number',
      /NEVER produce a phone number/i.test(system));
    assert('a source URL is stated to be mandatory',
      /MUST have a publicSourceUrl/i.test(system));
    assert('finding nobody is stated to be a normal result',
      /that is a normal and useful result/i.test(system));
    assert('private information is forbidden',
      /Never personal or private information/i.test(system));
    assert('stale sources are called out',
      /People change jobs/i.test(system));
  }

  {
    // End to end against the fixture: a model that smuggles a contact detail
    // into free text is caught by the runner's scrub, not by the schema.
    const smuggled = {
      ...baseOutput,
      individuals: [
        {
          ...person,
          relevance:
            'Owns the package. Best reached on 9876543210 or a.person@example.com.',
        },
      ],
    };

    const provider = new FixtureProvider().set('decision-maker-v1', smuggled);
    const result = await provider.generateObject({
      schema: decisionMakerAgent.outputSchema,
      schemaName: `${decisionMakerAgent.name}-${decisionMakerAgent.promptVersion}`,
      system: decisionMakerAgent.system,
      prompt: decisionMakerAgent.buildPrompt({ companyName: 'Test Highways EPC' }),
    });

    assert('the schema alone lets a smuggled contact detail through',
      /9876543210/.test(result.value.individuals[0]!.relevance),
      'this is why the scrub exists');

    const { value, removals } = scrubPii(result.value);
    assert('the scrub catches both smuggled details', removals.length === 2,
      removals.map((r) => `${r.path}:${r.kind}`).join(', '));
    assert('neither survives into the stored value',
      !/9876543210/.test(value.individuals[0]!.relevance) &&
        !/a\.person@example\.com/.test(value.individuals[0]!.relevance),
      value.individuals[0]!.relevance);
    assert('the rest of the sentence is preserved',
      value.individuals[0]!.relevance.startsWith('Owns the package.'),
      value.individuals[0]!.relevance);
    assert('the source URL is untouched',
      value.individuals[0]!.publicSourceUrl === 'https://example.com/leadership');
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Contact-safety sweep across a sample of accounts')}`);

  {
    /*
     * The iteration's exit criterion, discharged as a test rather than as a
     * manual read-through: across a sample of accounts, no fabricated contact
     * detail reaches the CRM.
     *
     * Each account gets a decision-maker output carrying a different way a
     * model might smuggle a contact detail past a schema that has no field for
     * one. Running it as a sweep rather than a single case is the point — one
     * passing example proves nothing about the next prompt revision.
     */
    const smugglingAttempts = [
      'Best reached on 9876543210.',
      'Try a.person@example.com first.',
      'Direct line +91 22 6789 0123.',
      'Mobile: 98765 43210 (verified).',
      'Contact number - 98765-43210.',
      'Email: first.last@contractor.co.in',
      'Write to person [at] example [dot] com.',
      'mailto:procurement@example.com is the shared inbox.',
      'Landline 022-24567890, extension 214.',
      'WhatsApp 9123456789 works better than email.',
      'tel:+919876543210',
      'Reach the office on 0141 2345678.',
      'Her assistant answers on +91-98765-43210.',
      'See the leadership page; switchboard 011 2345 6789.',
      'No contact details are public for this person.',
      'Introduced through a common supplier.',
      'Named on the tender award notice.',
      'Signs off packages above 5 crore.',
      'Based at the Ahmedabad office.',
      'Took the role in 2023 per the press release.',
      'Owns marking and safety scope on NH-48 packages.',
      'Responsible for vendor empanelment, per IRC:35 works.',
      'Quoted in coverage of the 128 km widening package.',
      'Previously at another EPC; joined last year.',
    ];

    let scanned = 0;
    let leaked = 0;
    let stripped = 0;

    for (const [index, attempt] of smugglingAttempts.entries()) {
      const output = {
        individuals: [
          {
            ...person,
            name: `Candidate ${index + 1}`,
            relevance: attempt,
            caveat: index % 3 === 0 ? `Also listed as ${attempt}` : null,
          },
        ],
        roles,
        vendorOnboarding: {
          ...unknown(),
          value: `Vendor portal enquiries: ${attempt}`,
          status: 'inference' as const,
        },
        primaryTarget: {
          ...unknown(),
          value: 'procurement_head' as const,
          status: 'recommendation' as const,
        },
        openQuestions: [`Confirm the route in: ${attempt}`],
        noIndividualsFound: false,
      };

      const parsed = decisionMakerOutputSchema.safeParse(output);
      if (!parsed.success) continue;

      const guarded = withSourcedIndividualsOnly(parsed.data);
      const { value, removals } = scrubPii(guarded.output);
      scanned += 1;
      if (removals.length > 0) stripped += 1;

      // The assertion that matters: nothing that reads as a contact detail
      // survives anywhere in the structure the CRM would store.
      if (containsPii(JSON.stringify(value))) leaked += 1;
    }

    assert(`the sweep covered a sample of at least twenty accounts`, scanned >= 20,
      `scanned ${scanned}`);
    assert('no contact detail survived into any stored output', leaked === 0,
      `${leaked} of ${scanned} accounts leaked a contact detail`);
    assert('the sweep actually exercised the scrubber', stripped >= 12,
      `only ${stripped} accounts triggered a removal — the fixtures may have drifted`);
  }

  /* -------------------------------------------------------------------------- */
  console.log(`\n${bold('Development fixtures')}`);

  {
    const { DEV_SCORE_FIXTURE, DEV_DECISION_MAKER_FIXTURE, DEV_RESEARCH_FIXTURE } =
      await import('../lib/ai/providers/dev-fixture-data');

    assert('the research fixture satisfies its agent schema',
      marketResearchOutputSchema.safeParse(DEV_RESEARCH_FIXTURE).success);
    assert('the score fixture satisfies its agent schema',
      opportunityMatchingOutputSchema.safeParse(DEV_SCORE_FIXTURE).success);
    assert('the decision maker fixture satisfies its agent schema',
      decisionMakerOutputSchema.safeParse(DEV_DECISION_MAKER_FIXTURE).success);

    assert('no development fixture contains a contact detail',
      scrubPii([DEV_RESEARCH_FIXTURE, DEV_SCORE_FIXTURE, DEV_DECISION_MAKER_FIXTURE])
        .removals.length === 0);
    assert('the decision maker fixture names nobody',
      DEV_DECISION_MAKER_FIXTURE.individuals.length === 0 &&
        DEV_DECISION_MAKER_FIXTURE.noIndividualsFound,
      'the safe outcome is the one worth demonstrating');
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
