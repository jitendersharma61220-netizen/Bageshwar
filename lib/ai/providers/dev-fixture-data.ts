import type { MarketResearchOutput } from '../agents/market-research';

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
