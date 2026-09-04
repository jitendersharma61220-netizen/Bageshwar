import type { Insight } from './types';
import { ASTM_E1710, EN_1436, IRC_35, MORTH_800 } from './standards';

export const rfqChecklist: Insight = {
  slug: 'road-marking-rfq-checklist',
  title: 'What to Include in a Road Marking RFQ',
  metaTitle: 'Road Marking RFQ Checklist | What to Specify to Get Comparable Quotes',
  metaDescription:
    'A checklist for issuing a road marking RFQ: the scope, specification, site and commercial information that makes quotes comparable, and the omissions that reliably turn into variations after award.',
  audience: 'For procurement teams issuing an enquiry for marking or safety works',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-04',
  primaryService: 'highway-expressway-marking',
  related: [
    'thermoplastic-road-marking-specifications',
    'how-to-select-a-road-marking-contractor',
  ],
  directAnswer:
    'A road marking RFQ needs four blocks of information: what is to be marked and how much, the specification it must meet, the site conditions and working windows available, and the commercial terms. Leave any one out and the quotes you receive will not be comparable with each other.',

  sections: [
    {
      heading: 'The problem an RFQ is trying to solve',
      paragraphs: [
        'You are not trying to get the lowest number. You are trying to get three numbers that describe the same job, so that comparing them tells you something.',
        'Most marking RFQs fail at that. They state a quantity and a material and leave everything else to assumption, and the assumptions differ between bidders in ways that move the rate by more than the commercial difference between the companies. The bidder with the most optimistic assumptions wins, and the gap between their assumption and your requirement becomes a variation.',
        'Everything below exists to close that gap before award rather than after.',
      ],
    },
    {
      heading: 'Block 1 — Scope and quantity',
      paragraphs: [
        'State what is to be marked, how much of it, and how it is distributed. Distribution matters as much as total quantity: the same area as one continuous stretch and as fifty scattered junctions are different jobs with different costs.',
      ],
      bullets: [
        'Quantity by marking type — longitudinal lines, transverse markings, arrows, legends, zebras, hatching — not a single lump area.',
        'For urban work, the number and distribution of discrete locations, because mobilisation and setting out at each one frequently exceed application time.',
        'Whether road studs, signage or safety furniture are included, and their quantities.',
        'Whether removal of existing marking is in scope, and at what extent.',
        'Drawings or a marking schedule where the layout is not obvious from the quantity.',
      ],
    },
    {
      heading: 'Block 2 — Specification',
      paragraphs: [
        'The parameters that determine what is actually being priced. These are covered in detail in our specification guide, but at minimum an RFQ should state the following.',
      ],
      bullets: [
        'Material and the standard it must meet.',
        'Applied thickness, per marking type where it differs.',
        'Glass bead specification and drop-on application rate.',
        'Minimum retroreflectivity at handover, separately for white and yellow.',
        'For studs: type, class, colour convention, spacing, and surface-mounted or recessed.',
        'For signage: retroreflective sheeting class, substrate and mounting type.',
        'Testing and documentation obligations, including any third-party testing.',
      ],
    },
    {
      heading: 'Block 3 — Site conditions and access',
      paragraphs: [
        'This is the block most often omitted and the one that most affects the rate on highway and airside work. Output is governed by access, not by machine capacity.',
      ],
      bullets: [
        'The working window available — day, night, lane closure, full closure — and how many hours per shift.',
        'Who provides traffic management: cones, signage, flagmen, attenuator vehicles.',
        'How the marking scope sequences behind surfacing, including the curing period required.',
        'Surface type and condition, including any concrete sections needing primer.',
        'Distance from the nearest town for mobilisation, and whether site accommodation is available.',
        'For airside work, the closure windows granted and the airside access clearance process and lead time.',
        'For facilities, whether operations can pause and for how long.',
      ],
    },
    {
      heading: 'Block 4 — Commercial and programme',
      paragraphs: [
        'What the contractor needs in order to price the commercial risk rather than guess at it.',
      ],
      bullets: [
        'Required start and completion dates, and any sectional milestones.',
        'Basis of measurement and payment — per square metre, per metre, per unit, and how special markings are measured.',
        'Retention, defects liability period, and whether a retroreflectivity threshold applies during it.',
        'Whether supply and install, or install only against client-supplied material.',
        'Any prequalification documents required with the quote, so they arrive with it rather than after.',
      ],
    },
    {
      heading: 'The five omissions that reliably become variations',
      paragraphs: [
        'If you take nothing else from this, settle these five before issuing the enquiry. In practice they account for the large majority of post-award disputes on marking packages.',
      ],
      rows: [
        { term: 'Traffic management', detail: 'Whose scope. Substantial cost; silence makes quotes incomparable' },
        { term: 'Working window', detail: 'Hours actually available per shift, including setup and clearance' },
        { term: 'Removal', detail: 'Whether existing marking is removed or overlaid, and where' },
        { term: 'Applied thickness', detail: 'A stated figure per marking type, not a general note' },
        { term: 'Acceptance criteria', detail: 'The retroreflectivity value the work will be accepted against' },
      ],
    },
    {
      heading: 'What good bidder questions tell you',
      paragraphs: [
        'A well-formed RFQ produces few questions. If a bidder comes back asking about working windows, traffic management or removal scope, that is not an inconvenience — it is a signal that the enquiry left a gap, and that this bidder intends to execute rather than to claim.',
        'It is worth answering those questions to all bidders rather than only the one who asked. Otherwise you have three quotes priced on three different information sets, which is the situation the RFQ was meant to prevent.',
      ],
    },
  ],

  faqs: [
    {
      question: 'How detailed does a road marking RFQ need to be?',
      answer:
        'One page of specification and site information is usually enough, provided it covers scope and quantity, the specification parameters, working windows and traffic management responsibility, and the commercial basis. The aim is not exhaustive detail — it is closing the assumptions that would otherwise differ between bidders and turn into variations after award.',
    },
    {
      question: 'Why do quotes for the same marking package vary so widely?',
      answer:
        'Almost always because the bidders assumed different things about parameters the RFQ left silent — applied thickness, bead specification, whether removal is included, and above all who provides traffic management and how long the working window is. Equalise those assumptions and the spread usually collapses to a much smaller genuine commercial difference.',
    },
    {
      question: 'Should the RFQ state a retroreflectivity value?',
      answer:
        'Yes. Without one, there is no objective basis on which to accept or reject the finished work, and no target for the contractor to price the bead specification against. State the minimum RL required at handover separately for white and yellow, and state how often it will be measured and whether readings are recorded by chainage.',
    },
    {
      question: 'Should I ask for a rate per square metre or a lump sum?',
      answer:
        'Rates per marking type are generally better on highway work, because quantities move between drawing and site and rates let that be measured rather than negotiated. For urban packages, price location-wise or state the number and distribution of locations explicitly — a city package priced purely on total area is usually mispriced, since mobilisation and setting out at each junction often exceed application time.',
    },
    {
      question: 'Can I send a BOQ or tender document instead of writing an RFQ?',
      answer:
        'Yes, and it is usually better, provided the document actually contains the specification and site information. Where a tender document is silent on working windows or traffic management, the gap is the same one an incomplete RFQ leaves. Sending the document with a short covering note that states those items is the practical answer.',
    },
  ],

  standards: [IRC_35, MORTH_800, ASTM_E1710, EN_1436],
};
