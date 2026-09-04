import type { Insight } from './types';
import { ASTM_E1710, EN_1436, IRC_35, MORTH_800 } from './standards';

export const selectingAContractor: Insight = {
  slug: 'how-to-select-a-road-marking-contractor',
  title: 'How to Select a Highway Road Marking Contractor',
  metaTitle: 'How to Select a Highway Road Marking Contractor in India',
  metaDescription:
    'What to assess when shortlisting a road marking contractor for a highway package: machinery, working-window planning, quality records, traffic management capability and the questions that reveal real execution experience.',
  audience: 'For procurement and project teams shortlisting a marking subcontractor',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-04',
  primaryService: 'highway-expressway-marking',
  related: ['road-marking-rfq-checklist', 'road-marking-quality-inspection-checklist'],
  directAnswer:
    'Assess a road marking contractor on five things: the machinery they own rather than hire, how they plan output around working windows, the quality records they produce as work proceeds, whether they can take markings, studs and signage under one scope, and whether their answers to specification questions are specific.',

  sections: [
    {
      heading: 'Why this decision is worth more attention than its value suggests',
      paragraphs: [
        'Marking is a small share of a highway package by value and a disproportionate share of its completion risk. It sits at the end of the programme, behind surfacing, which means any float lost upstream has already been consumed by the time it starts. It is executed alongside live traffic in windows that are granted rather than assumed. And the documentation it produces feeds directly into measurement, billing and certification.',
        'A marking contractor who cannot plan around a working window, or who produces measurement records three weeks after the work, does not cost you their contract value. They cost you certification delay on the whole package.',
      ],
    },
    {
      heading: '1. Machinery owned, not hired',
      paragraphs: [
        'Marking quality is decided by application temperature, laid thickness and bead embedment — all three functions of the equipment and how consistently it is run. A contractor who hires applicators for each job is at the mercy of what is available, and cannot maintain calibration between projects.',
        'Ask what they own. A credible marking contractor should be able to describe their applicators, their surface preparation equipment, their bead dispensing arrangement and their retroreflectivity testing instruments without hesitating.',
      ],
      bullets: [
        'Thermoplastic applicators with controlled pre-melting and temperature monitoring.',
        'Surface preparation capability — milling and removal, not just sweeping.',
        'Bead dispensers integrated with the applicator, so beads drop while the material is still fluid.',
        'A retroreflectometer of their own. A contractor who cannot measure their own work cannot control it.',
      ],
    },
    {
      heading: '2. How they plan output',
      paragraphs: [
        'This question separates contractors who have executed highway work from those who have only quoted for it. Ask how many square metres they expect to complete in a shift, and then ask what working window that assumes.',
        'A contractor who answers with a machine capacity figure has told you they plan from the equipment datasheet. A contractor who asks how long the closure is, how long setup and clearance take, and what proportion of the scope is special marking at interchanges, is planning from the constraint that actually governs.',
        'On a four-hour night window, a meaningful proportion is consumed before any material is laid and after the last is applied. Two contractors quoting the same output for the same package have made very different assumptions about that, and only one of them will hold their programme.',
      ],
    },
    {
      heading: '3. The records they produce',
      paragraphs: [
        'Ask to see the documentation package from a completed project. Not a certificate — the actual measurement sheets, material batch records, temperature and thickness records, and retroreflectivity readings.',
        'What you are looking for is whether the records were produced as the work proceeded or assembled afterwards. Readings recorded by chainage, dated daily, signed jointly, are the mark of a contractor whose quality process is real. A single summary sheet produced at handover is the mark of one whose quality process is a document.',
        'This matters commercially as much as technically: on most packages, the delay between physical completion and certification is a documentation delay.',
      ],
      bullets: [
        'Measurement sheets signed jointly as work proceeded, not reconciled at the end.',
        'Material batch certificates for the batches actually used on your project.',
        'Retroreflectivity readings recorded against chainage.',
        'Photographic documentation dated and located.',
      ],
    },
    {
      heading: '4. Scope consolidation',
      paragraphs: [
        'Markings, road studs, signage and safety furniture usually appear as separate BOQ sections but are the same specialist work, on the same stretch, under the same closures. Awarding them to different vendors multiplies mobilisation, multiplies closures on the same carriageway, and puts the coordination load on your team.',
        'It also produces delineation that is inconsistent along the route, because three vendors each interpreted the drawing independently. Ask whether the contractor can take the whole safety scope, and what that changes about their programme.',
      ],
    },
    {
      heading: '5. The quality of their questions',
      paragraphs: [
        'This is the most reliable signal available to you, and it costs nothing to assess. Send the same RFQ to three contractors and read what they ask before they quote.',
        'A contractor with real execution experience will come back asking about the working window, who provides traffic management, whether removal of existing marking is in scope, what retroreflectivity value governs acceptance, and how the marking sequences behind surfacing. Those are the parameters that determine whether the rate they quote is achievable.',
        'A contractor who quotes immediately from the quantity has not thought about executing it. Their rate may be lower. It is also more likely to become a claim.',
      ],
    },
    {
      heading: 'What to be sceptical of',
      paragraphs: [
        'A few claims are common in this sector and worth testing rather than accepting.',
      ],
      bullets: [
        '"Approved vendor" or "empanelled" without a registration document to show. Ask for it; a genuine registration is easy to produce.',
        'A rate materially below the others without a stated reason. It usually resolves into a thinner applied thickness, a cheaper bead, or traffic management assumed to be yours.',
        'Round-number statistics with no basis — "100% compliance", "500+ projects" — that cannot be evidenced when questioned.',
        'A portfolio of project photographs with no client, location, date or quantity attached to any of them.',
        'Certification claims where the certificate itself is never produced.',
      ],
    },
    {
      heading: 'A shortlisting sequence that works',
      paragraphs: [
        'In practice, three steps filter reliably without a lengthy prequalification exercise.',
      ],
      rows: [
        { term: 'Step 1', detail: 'Send a complete RFQ stating specification, quantity, working window and traffic management responsibility, then read the questions that come back' },
        { term: 'Step 2', detail: 'Ask the shortlist for the documentation package from one completed project, and for their machinery list' },
        { term: 'Step 3', detail: 'Ask how they would sequence your specific package, and listen for whether the answer is built around your working windows' },
      ],
    },
  ],

  faqs: [
    {
      question: 'What should I ask a road marking contractor before shortlisting them?',
      answer:
        'Ask what machinery they own rather than hire, what output they expect per shift and what working window that assumes, and to see the documentation package from a completed project. Then read the questions they ask you back. A contractor who asks about working windows, traffic management responsibility, removal scope and the retroreflectivity acceptance value is planning to execute. One who quotes straight from the quantity is not.',
    },
    {
      question: 'Should markings, studs and signage go to one contractor or several?',
      answer:
        'One, wherever the BOQ allows it. These are separate BOQ sections but the same specialist work on the same stretch under the same closures. Splitting them multiplies mobilisation and closures on the same carriageway, puts the coordination load on your team, and tends to produce delineation that is inconsistent along the route because each vendor interpreted the drawing independently.',
    },
    {
      question: 'Is the lowest rate usually a false economy on marking work?',
      answer:
        'Not necessarily, but a rate materially below the others almost always encodes a different assumption rather than a genuine efficiency. Before rejecting or accepting it, equalise the assumptions: applied thickness, bead specification, removal scope and traffic management responsibility. Once those match, the remaining difference is the real commercial one, and it is usually much smaller than the headline gap.',
    },
    {
      question: 'How early should the marking contractor be engaged?',
      answer:
        'Earlier than the programme suggests. Although marking is executed near the end, the decisions that govern it — traffic management responsibility, working windows, retroreflectivity acceptance, whether the safety scope is packaged together — are made during procurement and are expensive to change afterwards. Involving the specialist at that stage avoids most of the variations this scope generates.',
    },
    {
      question: 'What does a credible quality record look like?',
      answer:
        'Records produced as the work proceeded rather than assembled at handover: measurement sheets signed jointly and dated daily, material batch certificates for the batches actually used, temperature and thickness records through each shift, and retroreflectivity readings recorded against chainage. A single summary sheet produced at the end tells you the quality process is a document rather than a practice.',
    },
  ],

  standards: [IRC_35, MORTH_800, ASTM_E1710, EN_1436],
};
