import type { Insight } from './types';
import { EN_1436, EN_1463, IRC_35, MORTH_800 } from './standards';

export const roadStudSpecifications: Insight = {
  slug: 'road-stud-types-and-specifications',
  title: 'Road Stud Types and Specifications',
  metaTitle: 'Road Stud Types & Specifications | Cat Eyes for Highways',
  metaDescription:
    'Road stud types, colour convention, spacing, compressive strength and installation method — and why almost all premature stud failure is caused at installation rather than by the stud.',
  audience: 'For engineers specifying delineation and inspecting installed studs',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-04',
  primaryService: 'road-studs-cat-eyes',
  related: [
    'road-marking-retroreflectivity-explained',
    'road-marking-quality-inspection-checklist',
  ],
  directAnswer:
    'Road studs are retroreflective devices fixed into or onto the carriageway to maintain lane delineation at night and in rain, when a water film suppresses the retroreflectivity of flat markings. They are specified by type, class, colour, spacing and fixing method — and almost all early failure traces to installation conditions rather than to the stud.',

  sections: [
    {
      heading: 'What studs are for',
      paragraphs: [
        'A painted or thermoplastic line works at night because glass beads in its surface return headlight light to the driver. In rain, a film of water over that surface refracts the light away and the line effectively disappears — precisely when delineation matters most.',
        'A road stud sits proud of the water film. Its reflective faces stay clear, and it continues to return light when the marking beside it cannot. That is the whole reason studs exist, and it is why specifications normally require both: markings carry the information in daylight and dry conditions, studs carry it at night and in the wet.',
        'Studs supplement markings. They do not replace them.',
      ],
    },
    {
      heading: 'Types',
      paragraphs: [
        'Three distinctions matter when specifying: how the stud is fixed, what it is made of, and whether it is passive or active.',
      ],
      rows: [
        { term: 'Surface-mounted', detail: 'Bonded to the carriageway with adhesive. Faster to install, more exposed to snow ploughs and heavy scrub' },
        { term: 'Recessed', detail: 'Set into a cut socket so the body sits below the surface. More durable, substantially slower to install' },
        { term: 'Passive (retroreflective)', detail: 'Returns headlight light via a lens or prismatic reflector. No power, no maintenance beyond replacement' },
        { term: 'Active (solar)', detail: 'Solar-charged LED that emits light. Visible far further, several times the cost, and carries a maintenance expectation' },
        { term: 'Body material', detail: 'Polycarbonate, aluminium or ceramic, selected by traffic loading and the specification' },
      ],
    },
    {
      heading: 'Colour convention',
      paragraphs: [
        'Stud colour communicates lane position and direction, so consistency along a route matters more than any individual choice. The convention is set by the drawing and by IRC:35, and it should not be varied locally for availability reasons.',
        'Broadly, white studs accompany lane and centre lines, yellow marks the central reserve or median edge, red is used at the left edge or where a driver should not be, and green is used at slip road entries and exits. Confirm the convention that applies to your project rather than assuming it, since usage differs between jurisdictions and contract standards.',
      ],
    },
    {
      heading: 'Spacing',
      paragraphs: [
        'Spacing is set by the drawing and by road geometry. The principle worth holding onto is that spacing should tighten where delineation matters most — on curves, at merges and diverges, on approaches to hazards and structures, and at locations with a poor safety record.',
        'Uniform spacing applied along an entire route regardless of geometry is the most common specification error. It under-delineates exactly the locations that justified installing studs in the first place, while spending the budget on straight sections that were never the problem.',
      ],
    },
    {
      heading: 'Performance parameters',
      paragraphs: [
        'Two properties are worth specifying explicitly, because both determine whether the stud is still working in two years.',
      ],
      bullets: [
        'Coefficient of luminous intensity — how much light the stud returns, specified by class. EN 1463 sets out the classification and the test method.',
        'Compressive strength — studs are driven over directly and repeatedly, so the class must match the traffic. An under-specified stud fractures rather than wears.',
        'Resistance to the temperature range at the site, which matters for both the body and the adhesive.',
        'Lens durability, since a scuffed or crazed lens returns far less light while remaining physically intact.',
      ],
    },
    {
      heading: 'Why studs come off the road',
      paragraphs: [
        'This is the practical heart of the subject. When studs are lost within weeks of installation, the stud is almost never the cause. Three installation conditions account for the overwhelming majority of early failures, and all three are decided at site rather than at procurement.',
      ],
      bullets: [
        'Adhesive applied to a damp or dusty surface. The bond never develops, and traffic pulls the stud out complete with its adhesive pad. Stop work in wet conditions rather than pressing on.',
        'Traffic admitted before the adhesive has cured. The studs are displaced before they ever carry load, and the failure appears along the whole section rather than at isolated points.',
        'Installation onto a pavement surface that is itself deteriorating. The stud does not fail — the surface beneath it does, and takes the stud with it.',
      ],
    },
    {
      heading: 'Orientation, and why night inspection is not optional',
      paragraphs: [
        'A stud installed with its reflective faces at the wrong angle to approaching traffic returns a fraction of the light it should. It is fully seated, undamaged and correctly spaced, and a daytime inspection will pass it without comment.',
        'The defect is only visible at night, under headlights, from the driver’s position. Driving the completed run after dark takes very little time and is the only inspection that tests what the studs were installed to do.',
      ],
    },
    {
      heading: 'When solar studs are worth the cost',
      paragraphs: [
        'Active studs cost several times more than passive ones and add a maintenance and replacement obligation that passive studs do not carry. They earn that where active delineation genuinely changes driver behaviour: sharp curves, unlit stretches, accident-prone locations, hazard approaches and complex junction geometry.',
        'Specifying them along an entire uneventful stretch spends the budget where passive studs would have performed adequately, and creates a maintenance liability across the whole route rather than at the locations that needed it.',
      ],
    },
  ],

  faqs: [
    {
      question: 'Do road studs replace road markings?',
      answer:
        'No. They supplement them. Painted and thermoplastic markings carry the information in daylight and dry conditions; studs maintain delineation at night and in rain, when a water film over the carriageway suppresses the retroreflectivity of a flat marking. Specifications normally require both, and studs alone would leave the road without daytime lane information.',
    },
    {
      question: 'Why do newly installed road studs come off within weeks?',
      answer:
        'Almost always because of installation conditions rather than the stud itself. The three usual causes are adhesive applied to a damp or dusty surface, traffic admitted before the adhesive cured, and installation onto a pavement surface that is already failing. All three are avoidable, and all three are decided at site during the shift rather than at procurement.',
    },
    {
      question: 'Should studs be surface-mounted or recessed?',
      answer:
        'Recessed studs are more durable, particularly where snow ploughs, heavy vehicle scrub or aggressive sweeping are involved, but they need a socket cut and cleaned at every position and are substantially slower to install. Surface-mounted studs install faster and cost less but sit more exposed. The choice usually follows the traffic and maintenance regime rather than the initial cost.',
    },
    {
      question: 'What spacing should road studs be installed at?',
      answer:
        'The project drawing governs, and spacing should tighten on curves, at merges and diverges, and on approaches to hazards and structures. Uniform spacing applied along an entire route regardless of geometry is the most common specification error, because it under-delineates the locations that justified installing studs in the first place.',
    },
    {
      question: 'Are solar road studs worth specifying?',
      answer:
        'At sharp curves, unlit stretches, accident-prone locations and hazard approaches, yes — active delineation is visible far further ahead and genuinely changes driver behaviour. Along an entire uneventful route, generally not: they cost several times more than passive studs and add a maintenance and replacement obligation across the whole length rather than only where it was needed.',
    },
    {
      question: 'How should installed studs be inspected?',
      answer:
        'Check spacing, alignment, full seating and reflective face orientation during installation, then drive the completed run after dark under headlights. Orientation errors and gaps in delineation are immediately obvious at night and effectively invisible by day, so a daytime-only inspection tests everything except the property the studs were installed to provide.',
    },
  ],

  standards: [IRC_35, MORTH_800, EN_1463, EN_1436],
};
