/**
 * Industry content — five buyer segments.
 *
 * These pages exist to answer a specific reader: someone accountable for
 * delivering infrastructure in that sector who is deciding whether to
 * shortlist a marking and safety specialist. They describe the buyer's
 * problem in the buyer's terms, then map it to services.
 *
 * As with services, nothing here asserts a company credential, client or
 * project. Those live in content/company.ts and content/portfolio.ts behind
 * the verification layer.
 */

import type { Industry, IndustrySlug } from './types';

export const industries: readonly Industry[] = [
  {
    slug: 'highways-expressways',
    name: 'Highways & Expressways',
    metaTitle: 'Road Marking & Safety Contractor for Highway and Expressway Projects',
    metaDescription:
      'Road marking, road studs, signage and safety asset execution for national highway, state highway and expressway projects, delivered under live traffic on EPC and HAM packages.',
    directAnswer:
      'On highway and expressway projects, the road safety scope covers markings, road studs, signage and safety furniture, usually executed under live traffic in restricted windows near the end of the programme. It is a small share of package value and a disproportionate share of completion risk, because it sits on the critical path to certification.',
    buyerContext: [
      'You are an EPC contractor, road developer or concessionaire accountable for delivering a package to programme and getting it certified.',
      'The safety scope sits near the end of the programme, behind surfacing, which means any float upstream has already been consumed by the time it starts.',
      'Marking cannot begin until the wearing course is laid and cured on each section, so the work is inherently sequenced behind others.',
      'Execution happens alongside live traffic, or under closures that are granted rather than assumed.',
      'The documentation this scope produces — measurements, test records, material records — feeds directly into your billing and certification.',
    ],
    requirements: [
      'Machinery and crews that can be mobilised to the stretch and sustained there for the duration.',
      'Method statements and traffic management arrangements that will pass the engineer’s approval.',
      'Productivity planned against the working window actually granted, not against theoretical output.',
      'Retroreflectivity and thickness records kept by chainage, not as a single project-level figure.',
      'Joint measurement as the work proceeds, so billing does not stall at the end.',
      'The ability to take markings, studs, signage and safety furniture under one scope rather than as four separate awards.',
    ],
    services: [
      'highway-expressway-marking',
      'thermoplastic-road-marking',
      'road-studs-cat-eyes',
      'traffic-signboards',
      'highway-safety-assets',
    ],
    considerations: [
      'Whether the package is new construction or maintenance re-marking on an operational concession, which changes removal scope and closure availability.',
      'Who carries traffic management within the contract, since it is a significant cost and a frequent source of post-award variation.',
      'How the marking programme is sequenced behind surfacing, including the curing period on each section.',
      'The retroreflectivity acceptance value and how often it must be measured and reported.',
      'Whether the safety scope is awarded as one package or split, and what that split costs in repeated mobilisation and closures.',
    ],
    faqs: [
      {
        question: 'When should the road marking contractor be engaged on a highway package?',
        answer:
          'Earlier than the programme suggests. Although marking is executed near the end, the decisions that govern it — traffic management responsibility, working windows, retroreflectivity acceptance, whether the safety scope is packaged together — are made much earlier and are expensive to change afterwards. Bringing the specialist in during procurement rather than at mobilisation avoids most of the variations this scope generates.',
      },
      {
        question: 'Can the full road safety scope be executed by one contractor?',
        answer:
          'Yes. Markings, road studs, signage and safety furniture are usually separate BOQ sections but the same specialist work on the same stretch under the same closures. Awarding them together removes repeated mobilisation, reduces coordination load, and produces delineation that is consistent along the route.',
      },
      {
        question: 'How is progress measured and billed on highway marking work?',
        answer:
          'Normally by joint measurement of executed quantities, supported by material records and test readings. The practical advice is to measure jointly as the work proceeds rather than reconciling at the end, because a single end-of-package reconciliation on a long stretch is where certification delays usually originate.',
      },
    ],
  },

  {
    slug: 'airports',
    name: 'Airports & Aviation Infrastructure',
    metaTitle: 'Airport Runway, Taxiway & Apron Marking Contractor',
    metaDescription:
      'Runway, taxiway and apron marking execution for operational airports: closure-window working, FOD control, survey-verified setting out and operator documentation.',
    directAnswer:
      'Airfield marking work covers runway, taxiway and apron markings on the movement area, executed within closure windows granted by air traffic control. It differs from road work less in technique than in regime: survey-verified geometry, hard foreign object debris control, cleared airside access, and handback that happens on time without exception.',
    buyerContext: [
      'You are an airport operator, aviation infrastructure developer or the contractor delivering a runway or apron package.',
      'The facility stays operational, so work happens in nightly closure windows granted by air traffic control.',
      'A late handback is an operational event for the aerodrome, not a programme slip.',
      'Foreign object debris control is a safety requirement with no tolerance for shortcuts.',
      'Airside access for crew and vehicles requires clearance with lead times that frequently govern the earliest possible start.',
    ],
    requirements: [
      'A method statement and FOD control plan the operator will accept before work is scheduled.',
      'Crew and vehicles cleared for airside access, with the clearance process started at award.',
      'Setting out verified by survey against the operator’s approved marking drawing.',
      'Work planned backwards from the handback time so the window is never overrun.',
      'Documentation in the operator’s required format, which is usually more prescriptive than a road contract.',
    ],
    services: ['runway-taxiway-marking', 'road-studs-cat-eyes', 'traffic-signboards'],
    considerations: [
      'Whether the airport is operational during the works, which determines nightly windows versus an extended shutdown.',
      'Airside clearance lead time, which is frequently the binding constraint on the start date.',
      'Whether existing markings need removal, and to what standard, particularly on resurfacing or designation changes.',
      'Coordination with resurfacing, airfield lighting and NAVAID works competing for the same windows.',
      'The operator’s inspection and documentation requirements, confirmed at the outset.',
    ],
    faqs: [
      {
        question: 'Does the airport have to close for runway marking work?',
        answer:
          'Not usually. Work is done within closure windows granted by air traffic control, most often at night, with the movement area handed back fully serviceable and debris-free at the end of each window. Window length is the main determinant of how long the overall programme takes.',
      },
      {
        question: 'What is the lead time for starting airside work?',
        answer:
          'It is driven by security clearance and airside access permits for crew and vehicles rather than by mobilisation of machinery. These processes have their own timelines and are frequently the constraint on the earliest possible start, so they should begin at award rather than at mobilisation.',
      },
    ],
  },

  {
    slug: 'logistics-warehousing',
    name: 'Logistics Parks & Warehousing',
    metaTitle: 'Line Marking Contractor for Logistics Parks & Warehouses',
    metaDescription:
      'Yard and facility line marking for logistics parks, distribution centres and warehouses: docking bays, circulation routes, pedestrian segregation and parking layouts.',
    directAnswer:
      'Marking in logistics facilities covers the yard and internal areas: truck docking bays, circulation routes, parking, pedestrian walkways and segregation. In a yard carrying a high density of reversing trailers and people on foot, marking is the primary movement control, and it is usually executed without stopping operations.',
    buyerContext: [
      'You are developing or operating a logistics park, distribution centre or warehouse facility.',
      'The yard carries high vehicle movement density in a small area, with reversing trailers and pedestrians sharing the space.',
      'Operations rarely stop, so marking work has to be phased around live loading.',
      'Docking and turning areas take concentrated tyre scrub and wear far faster than the rest of the yard.',
      'Layouts change as the facility’s use changes, so permanence is not always the right objective.',
    ],
    requirements: [
      'A layout checked against the swept path of the largest vehicle that will actually use the yard.',
      'Phased execution that keeps the facility operating.',
      'Material selection matched to the surface condition, including oil-contaminated loading areas.',
      'A more durable specification in docking and turning areas than in general circulation.',
      'Pedestrian routes marked as continuous paths from gate to building.',
      'An as-executed layout record at handover.',
    ],
    services: [
      'logistics-parking-marking',
      'industrial-floor-marking',
      'thermoplastic-road-marking',
      'traffic-signboards',
    ],
    considerations: [
      'Whether the facility can pause operations at all, and for how long, since this determines phasing more than quantity does.',
      'Surface contamination in loading areas, which is the most common cause of premature failure in yard marking.',
      'Whether the layout is expected to change within a few years, which affects the choice of system.',
      'Whether pedestrian segregation is designed end to end or only in sections.',
      'Whether an existing layout needs removal, which is often the larger part of a re-configuration job.',
    ],
    faqs: [
      {
        question: 'Can yard marking be done without shutting the facility?',
        answer:
          'Yes, by phasing the work section by section around live loading, often outside peak hours. It takes longer than marking an empty yard, so the constraint should be stated at enquiry stage so that programme and rate reflect it.',
      },
      {
        question: 'Why does marking fail first at the docks?',
        answer:
          'Because docking and turning areas take concentrated tyre scrub from manoeuvring trailers, which is a far more aggressive wear mechanism than straight-line running. A yard marked to one specification throughout will show this as uneven failure. Specifying a more durable system in those areas gives a more even service life across the facility.',
      },
    ],
  },

  {
    slug: 'industrial',
    name: 'Industrial Infrastructure',
    metaTitle: 'Industrial Floor & Facility Marking Contractor',
    metaDescription:
      'Floor and facility marking for factories and industrial plants: aisle marking, pedestrian segregation, safety zones, equipment footprints and internal road marking.',
    directAnswer:
      'Industrial marking covers plant floors and internal roads: forklift aisles, pedestrian walkways, hazard and exclusion zones, equipment footprints and storage areas, together with the external road and parking marking on the site. Its primary function is separating people from moving equipment.',
    buyerContext: [
      'You are responsible for a manufacturing plant, industrial campus or process facility.',
      'Forklifts and people share the same floor, which is the main hazard the marking exists to control.',
      'Production shutdowns are expensive, so the available window for preparation, application and cure is tightly limited.',
      'Floors vary from bare concrete to coated and sealed surfaces, and preparation differs accordingly.',
      'Internal roads and parking areas need marking too, often to a different specification from the plant floor.',
    ],
    requirements: [
      'A substrate assessment before any material decision, since coated and sealed floors need mechanical preparation.',
      'Material selected for the traffic and the substrate, not by default.',
      'A shutdown window that covers full cure, not just touch-dry.',
      'Walkways marked along the routes people actually use.',
      'A consistent facility colour convention applied across areas and future phases.',
      'An as-executed layout drawing at handover.',
    ],
    services: [
      'industrial-floor-marking',
      'logistics-parking-marking',
      'thermoplastic-road-marking',
      'traffic-signboards',
    ],
    considerations: [
      'Whether floors are coated, sealed or bare concrete, which governs preparation and material selection.',
      'The full cure time required and whether the plant can keep the area clear that long.',
      'Whether the layout is stable or expected to change, which decides between permanent and re-configurable systems.',
      'How people move through the plant in practice, as opposed to how the layout drawing assumes they do.',
      'Site induction, permit-to-work and escorted access requirements, which reduce productive hours.',
    ],
    faqs: [
      {
        question: 'How long does the plant need to be shut down for floor marking?',
        answer:
          'Long enough for surface preparation, application and full cure before equipment traffic returns. The relevant figure is the cure-before-traffic time in the material data sheet, not the touch-dry time. Returning forklifts early is the most common cause of early failure, so the window should be planned around the full figure.',
      },
      {
        question: 'Can marking be applied over an existing coated floor?',
        answer:
          'Yes, provided the coating is sound and the marking path is mechanically prepared so the new material keys into it. Applying directly onto an unprepared coated or sealed floor is the single most common reason industrial floor marking peels within weeks.',
      },
    ],
  },

  {
    slug: 'smart-cities-urban',
    name: 'Smart Cities & Urban Infrastructure',
    metaTitle: 'Urban Road Marking & Traffic Safety Contractor for City Projects',
    metaDescription:
      'Road marking and traffic safety execution for municipal and smart-city projects: junction markings, pedestrian crossings, lane channelisation, signage and street safety assets.',
    directAnswer:
      'Urban and smart-city road safety work covers junction markings, pedestrian crossings, lane channelisation, bus and cycle lane markings, parking layouts and street signage. Compared with highway work it is many small geometrically complex locations rather than long continuous runs, which changes how it should be priced and programmed.',
    buyerContext: [
      'You are delivering a municipal, urban development or smart-city road package.',
      'The scope is typically many discrete locations — junctions, crossings, refuges, bus stops — rather than continuous stretches.',
      'Working hours are constrained by traffic conditions and by municipal and traffic police approvals.',
      'Pedestrian movement continues around the work, which requires different safety arrangements from highway traffic management.',
      'Layouts change as the network is redesigned, so superseded marking has to be removed rather than overlaid.',
    ],
    requirements: [
      'Pricing and programming on a location-wise basis rather than on total area alone.',
      'Setting out at each junction against site geometry, not against the drawing alone.',
      'Coordination with utility and road-repair works so new marking is not laid before a trench is cut.',
      'Removal of superseded marking wherever the layout has changed.',
      'Pedestrian safety arrangements appropriate to a street rather than to a carriageway.',
    ],
    services: [
      'urban-road-marking',
      'thermoplastic-road-marking',
      'traffic-signboards',
      'road-studs-cat-eyes',
      'highway-safety-assets',
    ],
    considerations: [
      'The number and dispersion of locations, which drives cost far more than total marked area does.',
      'Permitted working hours and the approvals required from municipal and traffic authorities.',
      'Surface condition and utility patching, which affect both preparation and bond risk.',
      'Whether existing marking is to be removed or overlaid, decided location by location.',
      'Coordination with other street works so that sequencing does not destroy completed marking.',
    ],
    faqs: [
      {
        question: 'How should an urban road marking package be priced?',
        answer:
          'Location-wise, or with the number and distribution of locations stated explicitly in the RFQ. Mobilisation and setting out at each junction frequently exceed the application time, so a package priced purely on total area will be mispriced — usually against whichever contractor took it on.',
      },
      {
        question: 'Does old marking need to be removed when a junction layout changes?',
        answer:
          'Yes, wherever the new layout conflicts with the old. Ghost marking stays visible, especially at night and in the wet, and gives drivers two contradictory sets of instructions at the exact location where clarity matters most. Removal should be a priced item in the scope.',
      },
    ],
  },
] as const;

export const industriesBySlug: ReadonlyMap<IndustrySlug, Industry> = new Map(
  industries.map((i) => [i.slug, i]),
);

export function getIndustry(slug: string): Industry | undefined {
  return industriesBySlug.get(slug as IndustrySlug);
}
