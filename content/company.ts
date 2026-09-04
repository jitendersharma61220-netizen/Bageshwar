/**
 * Company facts.
 *
 * Populated from Bageshwar_Balaji_Corporate_Profile.pptx (20 slides), which is
 * the source of truth for company claims. Each verified fact names the slide it
 * came from. Anything the deck does not support stays `pending` — run
 * `pnpm content:audit` for the current gap list.
 *
 * Four things in the deck were deliberately NOT converted into facts:
 *
 *  1. Slide 13, "100% Compliance Rating". A self-declared statistic with no
 *     auditor, no defined scope and no measurement basis. Published on a site
 *     read by procurement teams it would read as invented, and it cannot be
 *     evidenced if questioned.
 *  2. Slides 16-17 portfolio images. The image slots are still "600 > 400"
 *     placeholders; no project photograph exists in the deck.
 *  3. Slides 16-17 as project references. The captions give a work type and a
 *     location but no client, date, scope or quantity, so they do not meet the
 *     publishable bar in content/portfolio.ts. The locations they do evidence
 *     are recorded under `workLocations` below.
 *  4. Slide 14's "Standard Contractors" comparison column, which is
 *     unverifiable disparagement of unnamed competitors.
 *
 * Slide 18 is titled "Future Project Gallery" and is explicitly forward-looking,
 * so nothing on it is treated as executed work.
 */

import {
  pending,
  verified,
  type Certification,
  type Fact,
  type Machinery,
} from './types';

/** Source label for claims taken directly from the founder's written brief. */
const BRIEF = 'Founder brief, 2026-09-04';

/** Source label for claims taken from the corporate presentation. */
const DECK = (slide: number) => `Corporate deck, slide ${slide}`;

/*
 * These groups are annotated rather than inferred.
 *
 * `pending()` carries no value, so an inferred `Fact<T>` would lose T and every
 * consumer would see `unknown`. Declaring the shape up front keeps the value
 * type attached to each field whether or not it is currently evidenced.
 */

interface ContactFacts {
  phone: Fact<string>;
  altPhone: Fact<string>;
  email: Fact<string>;
  address: Fact<string>;
  city: Fact<string>;
  state: Fact<string>;
  postalCode: Fact<string>;
  country: Fact<string>;
  googleMapsUrl: Fact<string>;
  linkedinUrl: Fact<string>;
}

interface RegistrationFacts {
  gstin: Fact<string>;
  cin: Fact<string>;
  pan: Fact<string>;
  yearEstablished: Fact<string>;
  msmeUdyam: Fact<string>;
}

interface ScaleFacts {
  projectsCompleted: Fact<number>;
  kilometresMarked: Fact<number>;
  statesOperated: Fact<number>;
  yearsOfExperience: Fact<number>;
  teamSize: Fact<number>;
}

interface ApprovalFacts {
  nhaiVendorRegistration: Fact<string>;
  contractorClass: Fact<string>;
  isoCertifications: Fact<string>;
}

interface OperatingRegionFacts {
  statement: Fact<string>;
  statesWorkedIn: Fact<string>;
}

const contact: ContactFacts = {
  phone: pending('Primary business phone number'),
  altPhone: pending('Secondary phone number'),
  email: pending('Primary business email address'),
  address: pending('Registered office address'),
  city: pending('Office city'),
  state: pending('Office state'),
  postalCode: pending('Office PIN code'),
  country: verified('India', BRIEF),
  googleMapsUrl: pending('Google Maps listing URL'),
  linkedinUrl: pending('Company LinkedIn page URL'),
};

const registration: RegistrationFacts = {
  gstin: pending('GSTIN'),
  cin: pending('CIN / firm registration number'),
  pan: pending('PAN'),
  yearEstablished: pending('Year the firm was established'),
  msmeUdyam: pending('Udyam / MSME registration number'),
};

/*
 * Every number here is a claim. Nothing is estimated, rounded up or inferred,
 * so these stay pending until the evidence exists.
 */
const scale: ScaleFacts = {
  projectsCompleted: pending('Number of completed projects'),
  kilometresMarked: pending('Total lane-kilometres marked'),
  statesOperated: pending('Number of states worked in'),
  yearsOfExperience: pending('Years of execution experience'),
  teamSize: pending('Site and office team size'),
};

const approvals: ApprovalFacts = {
  nhaiVendorRegistration: pending('NHAI or authority vendor registration evidence'),
  contractorClass: pending('Contractor registration class and issuing authority'),
  isoCertifications: pending('ISO certificate numbers and validity'),
};

/*
 * Pan-India expansion is stated in the deck as a strategic goal (slide 19), so
 * it is recorded as a goal rather than as existing presence in every state.
 * The states actually worked in come from the project locations named on the
 * portfolio slides.
 */
const operatingRegions: OperatingRegionFacts = {
  statement: verified(
    'We mobilise for projects across India, with execution teams and machinery deployed to site for the duration of the works.',
    BRIEF,
  ),
  statesWorkedIn: verified('Gujarat', DECK(16) + ' and 17, project locations'),
};

export const company = {
  legalName: 'Bageshwar Balaji Construction Co.',
  shortName: 'Bageshwar Balaji',

  /** The positioning line. Used as the homepage H1. */
  positioning: 'Highway & Infrastructure Safety Execution Partner',

  /**
   * One sentence describing what the company does, in the language a
   * procurement or project manager would use. Appears in the hero, the
   * Organization schema and the default meta description.
   */
  description:
    'Precision-engineered road safety, high-performance thermoplastic markings and government-grade infrastructure solutions, delivered as a specialist execution partner to highway, airport, industrial and urban infrastructure projects.',

  /** Capability statement — what we execute, without adjectives. */
  capabilityStatement:
    'We execute thermoplastic road markings, highway and expressway markings, runway and taxiway markings, road studs, traffic signboards and highway safety assets for EPC contractors, road developers, concessionaires, airports and industrial and logistics developers.',

  contact,
  registration,
  scale,
  operatingRegions,
  approvals,

  /**
   * Certifications and approvals. Nothing renders until the certificate itself
   * is supplied.
   */
  certifications: [] as readonly Certification[],

  /* ---------------------------------------------------------------------- */
  /* Machinery and technical capability (deck slide 7)                       */
  /* ---------------------------------------------------------------------- */
  machinery: [
    {
      name: verified('Thermoplastic applicators', DECK(7)),
      purpose:
        'Automated heating vessels and screed systems that lay thermoplastic at controlled temperature and distribute glass beads uniformly behind the applicator.',
      quantity: pending('Number of thermoplastic applicators'),
    },
    {
      name: verified('Surface preparation units', DECK(7)),
      purpose:
        'Industrial milling machines and strippers used to remove failed marking and prepare the roadway so the new marking bonds.',
      quantity: pending('Number of surface preparation units'),
    },
    {
      name: verified('Cold paint spray systems', DECK(7)),
      purpose:
        'Airless spray equipment for airports, warehouse lanes and kerb marking, where cold-applied systems are specified.',
      quantity: pending('Number of cold paint spray systems'),
    },
    {
      name: verified('Retroreflectivity testers', DECK(7)),
      purpose:
        'Optical instruments used to measure night visibility performance of completed markings against the specified value.',
      quantity: pending('Number of retroreflectivity testers'),
    },
  ] as readonly Machinery[],

  /* ---------------------------------------------------------------------- */
  /* Mission and vision (deck slide 4)                                       */
  /* ---------------------------------------------------------------------- */
  mission: verified(
    'Delivering uncompromised road safety standards through engineering quality, advanced technological machinery, timely delivery schedules, and long-term customer partnerships.',
    DECK(4),
  ),
  vision: verified(
    'To become India’s most trusted road safety and highway marking company by delivering innovative, sustainable and world-class infrastructure safety solutions across expressways.',
    DECK(4),
  ),

  /**
   * Experience, recorded exactly as the deck states it.
   *
   * The deck says "5+ years of combined domain knowledge", which is a statement
   * about the team's accumulated experience rather than the age of the firm.
   * It is therefore kept as prose here, and `scale.yearsOfExperience` stays
   * pending, because rendering it as a company age would overstate it.
   */
  experienceStatement: verified(
    '5+ years of combined domain knowledge, carrying out turn-key projects using premium reflective compounds designed to withstand high volumes of commercial traffic and extreme weather.',
    DECK(3),
  ),

  /* ---------------------------------------------------------------------- */
  /* Sectors served (deck slide 9)                                           */
  /* ---------------------------------------------------------------------- */
  sectorsServed: [
    {
      title: 'Public infrastructure',
      detail:
        'State highway grids, expressway corridors, NHAI contracts, metro paths and civil airport tarmacs, executed to government specifications.',
      source: DECK(9),
    },
    {
      title: 'Private developments',
      detail:
        'Distribution warehouses, container ports, automated logistics depots, multi-tier parking, private roads and commercial tech park systems.',
      source: DECK(9),
    },
  ],

  /**
   * Locations where work has been carried out.
   *
   * Taken from the captions on the portfolio slides. These name a work type and
   * a place but no client, date, scope or quantity, so they are recorded as
   * locations worked in rather than as project references. They become full
   * portfolio entries in content/portfolio.ts once the project details and
   * photographs are supplied.
   */
  workLocations: [
    { work: 'Highway marking', location: 'Nadiad, Gujarat', source: DECK(16) },
    { work: 'Zebra crossing marking', location: 'Nadiad, Gujarat', source: DECK(16) },
    { work: 'Curve layout marking', location: 'Bilodara, Gujarat', source: DECK(16) },
    { work: 'Urban crossing marking', location: 'Nadiad, Gujarat', source: DECK(17) },
    { work: 'Thermal profile testing', location: 'Ramana Muvada', source: DECK(17) },
  ],

  /* ---------------------------------------------------------------------- */
  /* Site safety (deck slide 12)                                             */
  /* ---------------------------------------------------------------------- */
  siteSafety: [
    {
      title: 'Workforce PPE',
      detail:
        'Class-3 reflective vests, steel-toe boots, chemical respirators and helmet discipline, applied as standard when crews work on live high-speed carriageways.',
    },
    {
      title: 'Active traffic control',
      detail:
        'Barricades, sequential cones, warning signage and beacons deployed to guide traffic safely around the working zone for the duration of the shift.',
    },
  ],

  /**
   * Applied specification, as stated in the deck (slide 14).
   *
   * Only our own column is reproduced. The deck's comparison against unnamed
   * "standard contractors" is not published: it is unverifiable and reads as
   * disparagement to a procurement audience.
   */
  appliedSpecification: [
    {
      parameter: 'Average layer thickness',
      value: '2.5 mm to 3.0 mm, verified on site',
    },
    {
      parameter: 'Reflective microbeads',
      value: 'Uniform drop-on dispersion',
    },
    {
      parameter: 'Conformity',
      value: 'Executed to MoRTH, NHAI and IRC clause requirements',
    },
    {
      parameter: 'Adhesion base',
      value: 'Hot-melt thermoplastic polymer',
    },
  ],

  /**
   * Strategic goals (deck slide 19). Recorded as goals, not achievements, and
   * rendered as such.
   */
  strategicGoals: [
    {
      title: 'Pan-India expansion',
      detail:
        'Bidding on government infrastructure projects, state highway programmes and Smart City initiatives beyond our current operating base.',
    },
    {
      title: 'Digital asset monitoring',
      detail:
        'Building reflectivity degradation logs for road networks, so maintenance marking can be scheduled from measured condition rather than from age.',
    },
    {
      title: 'Direct EPC partnerships',
      detail:
        'Establishing stable, direct contracting relationships with Tier-1 Indian EPC developers.',
    },
  ],

  /* ---------------------------------------------------------------------- */
  /* Quality process. These are process commitments, not certifications, and  */
  /* describe how we work — so they are stated directly from the brief.       */
  /* ---------------------------------------------------------------------- */
  qualityProcess: [
    {
      title: 'Material verification before application',
      detail:
        'Thermoplastic compound and glass beads are checked against the specification called for in the contract before any material reaches the road, with work executed to MoRTH Clause 803 and the applicable IRC standards. Batch records are retained.',
    },
    {
      title: 'Surface preparation and readiness check',
      detail:
        'The carriageway is inspected for cleanliness, moisture and curing state. Marking does not begin on a surface that will not hold the bond.',
    },
    {
      title: 'Setting-out approval',
      detail:
        'Pre-marking and setting-out is offered for the engineer’s approval before application, so that alignment, chainage and layout are agreed before laying begins.',
    },
    {
      title: 'In-process thickness and temperature control',
      detail:
        'Application temperature and thickness are monitored during laying, with digital caliper checks taken on site. Both determine whether the marking achieves its designed life, and an applied thickness of 2.5 mm to 3.0 mm is verified rather than assumed.',
    },
    {
      title: 'Bead dispersion logging',
      detail:
        'Drop-on reflective glass dispersion is logged on site, because uneven bead application is what causes early loss of night visibility even where the marking itself is still intact.',
    },
    {
      title: 'Retroreflectivity measurement',
      detail:
        'Completed markings are measured with optical retroreflectivity instruments against the value specified for the project, and readings are recorded by location.',
    },
    {
      title: 'Joint measurement and handover documentation',
      detail:
        'Quantities are measured jointly with the client’s engineer and issued with the test records, batch details and photographs that support the bill.',
    },
  ],

  /* ---------------------------------------------------------------------- */
  /* Execution process — the six stages shown on the homepage and the         */
  /* Execution Process page.                                                  */
  /* ---------------------------------------------------------------------- */
  executionProcess: [
    {
      title: 'Site assessment',
      detail:
        'We visit the stretch or facility, confirm quantities against the BOQ, and identify the constraints that actually govern the work: traffic conditions, available working windows, surface condition and access.',
    },
    {
      title: 'Method statement and mobilisation plan',
      detail:
        'We issue a method statement covering sequence, traffic management, manpower, machinery and the safety arrangements for working alongside live traffic, for the engineer’s approval.',
    },
    {
      title: 'Mobilisation',
      detail:
        'Machinery, material and crew are moved to site and a site store is established. Material is verified on arrival against the approved specification.',
    },
    {
      title: 'Execution',
      detail:
        'Work proceeds in agreed windows under an approved traffic management plan, with pre-marking approved before application and daily progress recorded by chainage.',
    },
    {
      title: 'Quality control and joint measurement',
      detail:
        'Thickness, retroreflectivity and finish are checked as the work proceeds, and quantities are measured jointly with the client’s representative.',
    },
    {
      title: 'Handover and documentation',
      detail:
        'We hand over the completed works with measurement sheets, test records, material records and photographic documentation in the format the contract requires.',
    },
  ],

  /* ---------------------------------------------------------------------- */
  /* Why an EPC or procurement team should engage us. Capability and process  */
  /* claims only — no client names, no counts, until evidenced.               */
  /* ---------------------------------------------------------------------- */
  differentiators: [
    {
      title: 'A specialist, not a general contractor',
      detail:
        'Road safety and marking work is what we do, rather than a trade bolted onto a broader civil scope. The crew, the machinery and the quality process are built for it.',
    },
    {
      title: 'Built for live-traffic execution',
      detail:
        'Highway and expressway marking is done next to moving vehicles in restricted windows. Our method statements, traffic management and crew discipline are organised around that reality.',
    },
    {
      title: 'Documentation that supports your bill',
      detail:
        'Measurement sheets, material records, test readings and photographs are produced as the work proceeds, so the certification and billing process does not stall after handover.',
    },
    {
      title: 'Single point of accountability across asset types',
      detail:
        'Markings, road studs, signage and safety assets can be executed under one scope, which removes the coordination overhead of appointing separate specialist vendors.',
    },
  ],
} as const;

export type Company = typeof company;
