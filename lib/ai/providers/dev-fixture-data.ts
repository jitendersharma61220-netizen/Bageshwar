import type { MarketResearchOutput } from '../agents/market-research';
import type { OpportunityMatchingOutput } from '../agents/opportunity-matching';
import type { DecisionMakerOutput } from '../agents/decision-maker';

/**
 * A canned research response for local development.
 *
 * Deliberately imperfect: `hqLocation` is asserted as fact with no source, so
 * running research in development demonstrates the governance layer catching
 * and downgrading it rather than only showing the happy path.
 *
 * Every value is obviously fictional and labelled as demo data. This never
 * reaches production — the registry refuses the fixture provider there.
 */
export const DEV_RESEARCH_FIXTURE: MarketResearchOutput = {
  companyName: {
    value: 'Demo Infrastructure Contractor',
    status: 'fact',
    sources: [{ url: 'https://example.com/demo-company', title: 'Company profile (demo)' }],
    confidence: 0.95,
  },
  website: {
    value: 'https://example.com',
    status: 'fact',
    sources: [{ url: 'https://example.com/demo-company', title: 'Company profile (demo)' }],
    confidence: 0.9,
  },
  category: {
    value: 'highway_contractor',
    status: 'inference',
    sources: [{ url: 'https://example.com/demo-projects', title: 'Projects page (demo)' }],
    confidence: 0.7,
    note: 'Inferred from the project types listed on their site.',
  },
  // Deliberately unsourced. The runner downgrades this to "unknown" and the
  // account view shows the downgrade warning.
  hqLocation: {
    value: 'Probably Ahmedabad',
    status: 'fact',
    sources: [],
    confidence: 0.6,
  },
  operatingRegions: {
    value: ['Gujarat', 'Rajasthan'],
    status: 'inference',
    sources: [{ url: 'https://example.com/demo-projects', title: 'Projects page (demo)' }],
    confidence: 0.6,
  },
  currentProjects: {
    value: [
      {
        name: 'Demo state highway four-laning (demo data)',
        stage: 'current',
        location: 'Gujarat',
        scopeSummary: 'Widening with associated signage and safety works.',
        valueIfPublic: null,
      },
    ],
    status: 'fact',
    sources: [{ url: 'https://example.com/demo-award', title: 'Award notice (demo)' }],
    confidence: 0.8,
  },
  upcomingProjects: {
    value: null,
    status: 'unknown',
    sources: [],
    confidence: 0.1,
    note: 'No upcoming work could be established from public sources.',
  },
  relevantServices: {
    value: ['highway-expressway-marking', 'road-studs-cat-eyes', 'traffic-signboards'],
    status: 'inference',
    sources: [{ url: 'https://example.com/demo-award', title: 'Award notice (demo)' }],
    confidence: 0.75,
    note: 'The award scope includes safety works, which normally carry these items.',
  },
  opportunityType: {
    value: 'Marking and safety asset subcontract on a live widening package.',
    status: 'recommendation',
    sources: [],
    confidence: 0.7,
  },
  existingVendorInfo: {
    value: null,
    status: 'unknown',
    sources: [],
    confidence: 0.1,
    note: 'No public information about their current marking subcontractor.',
  },
  decisionMakerRoles: {
    value: ['Procurement Head', 'Project Director', 'Contracts Manager'],
    status: 'recommendation',
    sources: [],
    confidence: 0.8,
  },
  summary: {
    value:
      'Demo record produced by the development fixture. A highway contractor with a live widening package whose scope includes safety works, making it a plausible target for a marking subcontract.',
    status: 'inference',
    sources: [{ url: 'https://example.com/demo-award', title: 'Award notice (demo)' }],
    confidence: 0.7,
  },
  openQuestions: [
    'Confirm the head office location — the fixture asserted it without a source.',
    'Confirm whether the safety scope is subcontracted or self-performed.',
  ],
};

/**
 * A canned scoring response for local development.
 *
 * Deliberately mixed: two components are rated with an empty `basedOn`, so the
 * account view demonstrates the "rated without citing evidence" warning rather
 * than only the clean path. The ratings are chosen to land the total in the B
 * band, which is the interesting case — an account worth nurturing rather than
 * an obvious yes or an obvious no.
 */
export const DEV_SCORE_FIXTURE: OpportunityMatchingOutput = {
  serviceFit: {
    rating: 8,
    reasoning:
      'The award scope includes safety works, which is exactly what we execute. Demo data.',
    basedOn: ['Services they may need from us: highway-expressway-marking, road-studs-cat-eyes'],
  },
  projectFit: {
    rating: 7,
    reasoning: 'One live widening package with associated safety works. Demo data.',
    basedOn: ['Current projects: Demo state highway four-laning'],
  },
  locationFit: {
    rating: 6,
    reasoning:
      'Gujarat, where we have verified execution experience. Demo data.',
    basedOn: ['Operating regions: Gujarat, Rajasthan'],
  },
  scaleFit: {
    rating: 5,
    reasoning:
      'No package value was reported, so the size is unknown. Rated as unknown deserves rather than assumed comfortable.',
    basedOn: [],
  },
  timingFit: {
    rating: 6,
    reasoning:
      'The package is described as current, so marking is likely a later-stage item. Reasoning, not a finding.',
    basedOn: ['Current projects: stage current'],
  },
  procurementFit: {
    rating: 4,
    reasoning:
      'Nothing public establishes whether they subcontract marking or self-perform it.',
    basedOn: [],
  },
  portfolioRelevance: {
    rating: 6,
    reasoning: 'Our verified work is in the same state and the same scope family. Demo data.',
    basedOn: ['Operating regions: Gujarat'],
  },
  strategicValue: {
    rating: 5,
    reasoning: 'A repeatable EPC relationship, but nothing that opens a new category.',
    basedOn: [],
  },
  matchedServices: {
    value: ['highway-expressway-marking', 'road-studs-cat-eyes'],
    status: 'inference',
    sources: [{ url: 'https://example.com/demo-award', title: 'Award notice (demo)' }],
    confidence: 0.7,
  },
  entryPoint: {
    value:
      'Their live widening package carries safety works that are normally subcontracted; approach before the marking package is let. Demo data.',
    status: 'recommendation',
    sources: [],
    confidence: 0.6,
  },
  keyRisks: [
    'Whether they subcontract marking at all is unestablished.',
    'No package value, so the commercial size is a guess.',
  ],
  recommendedNextAction: {
    value: 'Confirm the procurement route before spending outreach effort. Demo data.',
    status: 'recommendation',
    sources: [],
    confidence: 0.7,
  },
  verdict:
    'Demo verdict from the development fixture. A plausible account with a real scope match, held back by not knowing whether they subcontract this work. Worth nurturing rather than chasing.',
};

/**
 * A canned decision-maker response for local development.
 *
 * `noIndividualsFound` is true. That is the case worth exercising: the agent
 * returning roles and no names is the intended, safe outcome, and the screen
 * that renders it needs to read as a complete answer rather than as an empty
 * list. A fixture full of invented names would demonstrate exactly the
 * behaviour this iteration exists to prevent.
 */
export const DEV_DECISION_MAKER_FIXTURE: DecisionMakerOutput = {
  individuals: [],
  roles: [
    {
      role: 'procurement_head',
      likelyTitle: 'Head — Procurement & Contracts',
      whyThisRole:
        'Owns subcontract packages of this size at an EPC contractor. Demo data.',
      suggestedApproach:
        'Company switchboard, asking for procurement; or the vendor registration form if one is published.',
    },
    {
      role: 'project_director',
      likelyTitle: null,
      whyThisRole:
        'Decides scope and timing on the package itself, and can direct procurement. Demo data.',
      suggestedApproach: 'Site office for the named package.',
    },
  ],
  vendorOnboarding: {
    value: null,
    status: 'unknown',
    sources: [],
    confidence: 0.1,
    note: 'No public vendor registration process could be found.',
  },
  primaryTarget: {
    value: 'procurement_head',
    status: 'recommendation',
    sources: [],
    confidence: 0.7,
  },
  openQuestions: [
    'Confirm whether they run a vendor empanelment process.',
    'Confirm who signs off subcontracts at this package size.',
  ],
  noIndividualsFound: true,
};
