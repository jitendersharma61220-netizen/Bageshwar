import type { Insight } from './types';
import {
  ASTM_D4960,
  ASTM_E1710,
  EN_1423,
  EN_1436,
  EN_1871,
  IRC_35,
  MORTH_800,
} from './standards';

export const thermoplasticSpecifications: Insight = {
  slug: 'thermoplastic-road-marking-specifications',
  title: 'Thermoplastic Road Marking Specifications: What to Write Into a BOQ',
  metaTitle: 'Thermoplastic Road Marking Specifications | What to Specify in a BOQ',
  metaDescription:
    'The parameters that actually govern thermoplastic road marking performance — thickness, glass beads, retroreflectivity, binder and surface preparation — and how to write them into a BOQ so quotes are comparable.',
  audience: 'For engineers and estimators writing or checking a marking specification',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-04',
  primaryService: 'thermoplastic-road-marking',
  related: [
    'road-marking-retroreflectivity-explained',
    'road-marking-rfq-checklist',
  ],
  directAnswer:
    'A usable thermoplastic road marking specification states six things: applied thickness, glass bead type and application rate, the minimum retroreflectivity required at handover, the binder and material standard, the surface preparation included, and who provides traffic management. Anything left out becomes a variation after award.',

  sections: [
    {
      heading: 'Why an incomplete specification costs more than a strict one',
      paragraphs: [
        'Most disputes on marking packages are not about workmanship. They are about scope that was never written down. A BOQ line that reads "thermoplastic road marking, per square metre" is not a specification — it is an invitation for every bidder to assume something different, and for the cheapest assumption to win.',
        'The contractor who assumed 2.5 mm, a standard bead and no removal will quote below the contractor who assumed 3 mm, a higher-specification bead and removal of the failed existing line. Both quotes are honest. Only one of them is for the job you actually need, and you will not find out which until the work is on the road.',
        'Writing the six parameters below into the BOQ costs nothing and removes almost all of that risk. It also makes the quotes comparable, which is the only way a rate per square metre means anything.',
      ],
    },
    {
      heading: '1. Applied thickness',
      paragraphs: [
        'Thickness is the single largest driver of material consumption and therefore of the rate. MoRTH Section 800 commonly specifies 2.5 mm for hot-applied thermoplastic on highway work, and projects do specify other values. Whatever the figure, it belongs in the BOQ line, not in a general note.',
        'Thickness is measured on the laid marking, wet or by core, not inferred from consumption. If you intend to verify it, say so and state the frequency — a contractor who knows thickness will be checked prices differently from one who assumes it will not.',
      ],
      bullets: [
        'State the nominal applied thickness in millimetres, per marking type if it differs.',
        'State the tolerance you will accept, and how thickness will be verified.',
        'Do not mix thicknesses across a package without separate BOQ lines — they are different rates.',
      ],
    },
    {
      heading: '2. Glass beads',
      paragraphs: [
        'Beads are what make a marking visible at night. They are also where a specification is most often silent and a quote most often differs. Two markings identical in every other respect will perform very differently if one carries a higher-refractive-index bead at a higher application rate.',
        'There are two distinct bead applications and a specification should address both. Premix beads are blended into the thermoplastic and provide retroreflectivity as the surface wears down. Drop-on beads are applied to the hot surface immediately behind the applicator and provide the initial retroreflectivity that the marking is accepted on.',
      ],
      bullets: [
        'State the drop-on bead application rate in grams per square metre.',
        'State the gradation and refractive index required, referencing the applicable standard.',
        'State whether premix beads are required in addition to drop-on.',
        'Require bead certificates for the batches actually used, not a generic product datasheet.',
      ],
    },
    {
      heading: '3. Retroreflectivity at handover',
      paragraphs: [
        'This is the performance requirement that ties the material and the workmanship together, and it is the one most often omitted. Retroreflectivity is reported as RL in millicandelas per lux per square metre and measured with a portable retroreflectometer at the standard 30-metre geometry.',
        'A specification that states no minimum RL has no basis on which to accept or reject the finished work. Stating one turns a subjective judgement into a measurement, which protects both sides.',
      ],
      bullets: [
        'State the minimum RL required at handover, separately for white and yellow.',
        'State the measurement frequency and whether readings are recorded by chainage or averaged.',
        'State whether a maintenance threshold applies during any defects liability period, and what happens when a section falls below it.',
      ],
    },
    {
      heading: '4. Material and binder',
      paragraphs: [
        'Thermoplastic is not a single product. Binder chemistry, filler content and pigment quality vary considerably between materials that all satisfy the word "thermoplastic" in a BOQ, and they show up as differences in colour retention, wear rate and resistance to yellowing under heat.',
        'Reference the material standard the project requires and ask for the manufacturer’s test certificates for the batches supplied. Batch records cost nothing to require and are the only evidence that the material on the road is the material that was priced.',
      ],
    },
    {
      heading: '5. Surface preparation and removal',
      paragraphs: [
        'This is the most common source of post-award variation on re-marking work. Applying new thermoplastic over a failing existing marking produces a new marking that fails with the old one, so removal is not optional where the existing layer is unsound — but it is separate work with its own productivity and its own rate.',
        'Decide before tender whether removal is in scope, and if so, at how many locations and by what method. "Clean the surface" and "remove existing degraded marking to sound substrate" are not the same instruction and should not be priced as though they were.',
      ],
      bullets: [
        'State whether removal of existing marking is included, and the extent.',
        'State the surface preparation required on concrete, including primer where applicable.',
        'State the curing period required behind new surfacing before marking may begin.',
      ],
    },
    {
      heading: '6. Traffic management and working windows',
      paragraphs: [
        'Not strictly a material specification, but it belongs in the same document because it moves the price more than any material parameter does. Output on a highway is governed by how much carriageway the contractor is given and for how long, and by whether cones, signage, flagmen and attenuator vehicles sit in their scope or yours.',
        'A four-hour night window and a full-day closure produce very different outputs from identical crews and machinery. If the RFQ does not say which applies, the quotes are not comparable, and the difference will surface as a claim rather than as a rate.',
      ],
    },
    {
      heading: 'A specification that fits on one page',
      paragraphs: [
        'None of this requires a lengthy document. The six parameters above, stated plainly against each BOQ line, are enough to make a marking package biddable and enforceable.',
      ],
      rows: [
        { term: 'Applied thickness', detail: 'Nominal in mm, with tolerance and verification method' },
        { term: 'Drop-on beads', detail: 'Rate in g/m², gradation, refractive index' },
        { term: 'Premix beads', detail: 'Required or not' },
        { term: 'Retroreflectivity', detail: 'Minimum RL at handover, white and yellow, measurement frequency' },
        { term: 'Material', detail: 'Material standard, batch certificates required' },
        { term: 'Preparation', detail: 'Removal extent, primer on concrete, curing period behind surfacing' },
        { term: 'Traffic management', detail: 'Whose scope, and the working window available' },
      ],
    },
  ],

  faqs: [
    {
      question: 'What thickness should be specified for thermoplastic road marking?',
      answer:
        '2.5 mm is commonly specified for hot-applied thermoplastic on highway work under MoRTH Section 800, though projects do specify other thicknesses for particular marking types or conditions. The governing figure is always the one in your contract specification. What matters most is that a figure is stated at all, and that it appears against the BOQ line rather than in a general note, because it changes material consumption and therefore the rate.',
    },
    {
      question: 'Should the BOQ specify glass beads separately from the thermoplastic?',
      answer:
        'Yes. Bead specification and application rate are a significant part of both cost and night-time performance, and they are the parameter most often left silent. State the drop-on rate in grams per square metre, the gradation and refractive index required, and whether premix beads are required in addition. Without that, two quotes for the same marking can be for materially different products.',
    },
    {
      question: 'Is it enough to specify a retroreflectivity value and leave the rest open?',
      answer:
        'It is better than specifying nothing, but it is not sufficient on its own. Retroreflectivity at handover can be achieved by a marking that will not last, because initial RL is driven largely by the drop-on bead layer while service life is driven by thickness, binder and bond. Specifying performance and the parameters that produce it together is what gives you a marking that still performs in year three.',
    },
    {
      question: 'Who should provide traffic management on a marking package?',
      answer:
        'It depends entirely on the contract, and either arrangement can work. What does not work is leaving it unstated. Traffic management is a substantial cost on highway work, so an RFQ that is silent on it produces quotes that are not comparable and a gap that surfaces as a variation after award. State it explicitly before requesting rates.',
    },
    {
      question: 'How do I compare two quotes with very different rates?',
      answer:
        'Line them up against the six parameters above before looking at the numbers. In most cases a large gap resolves into a different assumed thickness, a cheaper bead specification, removal excluded, or traffic management assumed to sit with the main contractor. Once the assumptions are equalised, the remaining difference is the real commercial one — and it is usually much smaller than it first appeared.',
    },
  ],

  standards: [IRC_35, MORTH_800, ASTM_D4960, ASTM_E1710, EN_1436, EN_1423, EN_1871],
};
