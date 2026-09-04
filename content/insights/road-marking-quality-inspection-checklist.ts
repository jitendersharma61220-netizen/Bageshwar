import type { Insight } from './types';
import { ASTM_E1710, EN_1423, EN_1436, IRC_35, MORTH_800 } from './standards';

export const inspectionChecklist: Insight = {
  slug: 'road-marking-quality-inspection-checklist',
  title: 'Road Marking Quality Inspection Checklist',
  metaTitle: 'Road Marking Quality Inspection Checklist | What to Check and When',
  metaDescription:
    'A practical inspection checklist for road marking works: what to verify before, during and after application, what to measure rather than judge by eye, and the defects a daytime inspection will never find.',
  audience: 'For site engineers and QA teams inspecting marking works',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-04',
  primaryService: 'thermoplastic-road-marking',
  related: [
    'road-marking-retroreflectivity-explained',
    'thermoplastic-road-marking-specifications',
  ],
  directAnswer:
    'Road marking is inspected in three phases: before application, verify material, surface condition and setting-out; during application, monitor temperature, thickness and bead embedment; after application, measure retroreflectivity by chainage and drive the route at night. The defects that matter most cannot be seen in a daylight walk-through.',

  sections: [
    {
      heading: 'Why inspection has to happen during the work, not after it',
      paragraphs: [
        'Almost everything that determines whether a marking lasts is decided in a window of a few seconds: the temperature the material was at when it left the applicator, the thickness it was laid at, and whether the beads landed while the surface was still fluid enough to hold them.',
        'None of those is recoverable afterwards. A marking laid at the wrong temperature or beaded too late looks correct at handover and fails months later, and by then the only remedy is to remove it and do it again.',
        'An inspection regime that consists of walking the completed work is therefore checking the two things least likely to be wrong — alignment and appearance — and missing the ones most likely to be.',
      ],
    },
    {
      heading: 'Before application',
      paragraphs: [
        'These are hold points. Each one is cheap to check and expensive to discover afterwards.',
      ],
      bullets: [
        'Material batch matches the approved submittal, and certificates are on site for the batches actually delivered — not a generic product datasheet.',
        'Glass bead type, gradation and refractive index match the specification, with their own certificates.',
        'Carriageway is clean, dry and free of dust, loose aggregate, oil and vegetation along the marking path.',
        'New bituminous surfacing has cured for the period the specification requires. This is the single most common cause of wholesale bond failure.',
        'Concrete sections have been prepared and primed where the specification calls for it, and curing compound or laitance has been removed.',
        'Existing degraded marking has been removed where the layer beneath is unsound, rather than overlaid.',
        'Pre-marking and setting-out has been offered and approved. Correcting alignment after application means removal, not adjustment.',
        'Traffic management is in place per the approved plan before any crew is on the carriageway.',
      ],
    },
    {
      heading: 'During application',
      paragraphs: [
        'These are the measurements that decide service life. All of them are quick, and all of them should be recorded rather than merely observed.',
      ],
      bullets: [
        'Application temperature monitored at the applicator and recorded through the shift, not judged by eye. Overheated material loses binder performance and yellows; underheated material bonds poorly and lays unevenly.',
        'Applied thickness checked at defined intervals along the run and recorded against chainage.',
        'Bead application rate checked against the specified grams per square metre, by sampling rather than by appearance.',
        'Bead embedment observed directly — beads should sit at roughly half their diameter. Beads visibly resting on the surface were dropped too late; a surface with no visible beads had them buried.',
        'Line width and edge definition checked against the drawing. Ragged edges usually indicate a temperature or die problem that will worsen through the shift.',
        'Daily progress recorded by chainage against the approved programme.',
      ],
    },
    {
      heading: 'After application',
      paragraphs: [
        'Two checks here find things nothing else will.',
      ],
      bullets: [
        'Retroreflectivity measured with a portable retroreflectometer on a clean, dry marking, recorded by chainage rather than averaged across the project. White and yellow measured separately.',
        'A night drive of the completed route under headlights. This is the only inspection that tests the marking from the driver’s position, and it reveals misaligned studs, gaps in delineation and sections with collapsed retroreflectivity that are entirely invisible by day.',
        'Joint measurement with the client’s representative as work proceeds, signed and dated, rather than one reconciliation at the end.',
        'Photographic documentation dated and located.',
      ],
    },
    {
      heading: 'What a daylight inspection cannot find',
      paragraphs: [
        'Worth stating plainly, because it is the gap most inspection regimes have. Each of the following passes a daytime visual inspection without difficulty and represents a real failure.',
      ],
      rows: [
        { term: 'Beads swept away', detail: 'Marking is bright white, full thickness, and returns almost nothing at night' },
        { term: 'Beads buried', detail: 'Marking looks perfect and never retroreflected at all' },
        { term: 'Studs misoriented', detail: 'Fully seated, correctly spaced, invisible to the traffic they were installed for' },
        { term: 'Yellow below threshold', detail: 'Looks correct beside the white line, measures far below it' },
        { term: 'Bond failure starting', detail: 'Edges lifting in the wheel path, not visible until a section detaches' },
      ],
    },
    {
      heading: 'What to record, and why it is commercial as well as technical',
      paragraphs: [
        'On most packages the delay between physical completion and certification is a documentation delay, not a workmanship one. Records produced as the work proceeds close that gap; records assembled afterwards open it.',
        'The set below is what a contractor should be producing without being asked, and what an engineer should expect to receive at handover.',
      ],
      bullets: [
        'Material and bead batch certificates for the batches used.',
        'Temperature and thickness records for each shift.',
        'Bead application rate checks.',
        'Retroreflectivity readings against chainage, white and yellow separately.',
        'Setting-out approvals.',
        'Joint measurement sheets, signed and dated as work proceeded.',
        'Photographic documentation, dated and located.',
        'Night inspection confirmation for the completed route.',
      ],
    },
  ],

  faqs: [
    {
      question: 'What should be checked before road marking application begins?',
      answer:
        'Material and bead batch certificates against the approved submittal; carriageway cleanliness, dryness and freedom from loose aggregate; curing of any new surfacing; preparation and priming on concrete; removal of unsound existing marking; approved setting-out; and traffic management in place. Each of these is a hold point, and each is far cheaper to check than to discover after the material is on the road.',
    },
    {
      question: 'How do you check glass bead embedment on site?',
      answer:
        'By direct observation of the fresh marking. Beads should be embedded to roughly half their diameter. Beads visibly sitting proud on the surface were dropped after the material began to skin and will sweep away under traffic within days; a surface with no visible beads at all had them applied too early or too heavily and buried in binder. Neither condition is correctable once the material has set.',
    },
    {
      question: 'Is a visual inspection of completed marking sufficient?',
      answer:
        'No. A visual inspection confirms alignment, width and appearance, which are the properties least likely to be defective. It cannot detect lost or buried beads, collapsed retroreflectivity, misoriented studs, or bond failure that has not yet lifted. Adding a retroreflectometer reading recorded by chainage and a night drive of the completed route catches nearly everything a daylight walk-through misses.',
    },
    {
      question: 'How often should thickness and temperature be recorded?',
      answer:
        'Frequently enough that a drifting applicator is caught within the same shift rather than at handover. The specification should state the interval; in practice, recording at defined chainage intervals through each shift is both practical and sufficient. The value of the record is as much in what it prevents as in what it proves.',
    },
    {
      question: 'What documentation should be handed over at completion?',
      answer:
        'Material and bead batch certificates for the batches actually used, temperature and thickness records per shift, bead rate checks, retroreflectivity readings by chainage with white and yellow separated, setting-out approvals, joint measurement sheets signed as work proceeded, dated photographic documentation, and confirmation of the night inspection. Assembled during the work, this package is what allows certification to follow completion rather than trail it.',
    },
  ],

  standards: [IRC_35, MORTH_800, ASTM_E1710, EN_1436, EN_1423],
};
