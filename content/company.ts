/**
 * Company facts — the single file the corporate presentation fills in.
 *
 * Anything marked `pending` here is a gap. Run `pnpm content:audit` for the
 * current list. When the corporate deck is supplied, replace each `pending(...)`
 * with `verified(value, 'Corporate deck, slide N')` and the site begins showing
 * that proof. No component changes are needed.
 *
 * Do not convert a placeholder or incomplete slide into a verified fact.
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
 * PAN-India capability is stated in the brief as an ambition and a capability,
 * so it is recorded as exactly that -- not as a claim of existing presence in
 * every state.
 */
const operatingRegions: OperatingRegionFacts = {
  statement: verified(
    'We mobilise for projects across India, with execution teams and machinery deployed to site for the duration of the works.',
    BRIEF,
  ),
  statesWorkedIn: pending('List of states where projects have been executed'),
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
  /* Machinery and technical capability                                      */
  /* ---------------------------------------------------------------------- */
  machinery: [] as readonly Machinery[],

  /* ---------------------------------------------------------------------- */
  /* Quality process. These are process commitments, not certifications, and  */
  /* describe how we work — so they are stated directly from the brief.       */
  /* ---------------------------------------------------------------------- */
  qualityProcess: [
    {
      title: 'Material verification before application',
      detail:
        'Thermoplastic compound and glass beads are checked against the specification called for in the contract before any material reaches the road. Batch records are retained.',
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
        'Application temperature and wet film thickness are monitored during laying, because both determine whether the marking achieves its designed life.',
    },
    {
      title: 'Retroreflectivity measurement',
      detail:
        'Completed markings are checked for retroreflectivity against the value specified for the project, and readings are recorded by location.',
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
