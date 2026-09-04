/**
 * Service content — nine services, each following the answer-first structure
 * defined in docs/03-service-page-structure.md.
 *
 * Editorial rules for this file:
 *
 *  - Technical figures describe what published standards and typical contracts
 *    specify. They are written as what is *commonly specified*, never as a
 *    guarantee, because the governing specification is always the one in the
 *    contract. Each carries the standard it derives from.
 *  - Nothing here claims that this company is certified to, approved under, or
 *    compliant with any standard. Those are company facts and live in
 *    content/company.ts behind the verification layer.
 *  - No prices. Cost content describes the drivers that move a rate, which is
 *    what a procurement reader actually needs before issuing an RFQ.
 */

import type { Service, ServiceSlug, StandardReference } from './types';

/* -------------------------------------------------------------------------- */
/* Standards referenced across services                                        */
/* -------------------------------------------------------------------------- */

const IRC_35: StandardReference = {
  code: 'IRC:35',
  title: 'Code of Practice for Road Markings',
  issuer: 'Indian Roads Congress',
};

const IRC_67: StandardReference = {
  code: 'IRC:67',
  title: 'Code of Practice for Road Signs',
  issuer: 'Indian Roads Congress',
};

const MORTH_800: StandardReference = {
  code: 'MoRTH Section 800',
  title:
    'Specifications for Road and Bridge Works — Traffic Signs, Markings and Other Road Appurtenances',
  issuer: 'Ministry of Road Transport & Highways',
};

const ASTM_D4960: StandardReference = {
  code: 'ASTM D4960',
  title: 'Standard Specification for Thermoplastic Traffic Marking Material',
  issuer: 'ASTM International',
};

const ASTM_E1710: StandardReference = {
  code: 'ASTM E1710',
  title:
    'Standard Test Method for Measurement of Retroreflective Pavement Marking Materials with CEN-Prescribed Geometry Using a Portable Retroreflectometer',
  issuer: 'ASTM International',
};

const EN_1436: StandardReference = {
  code: 'EN 1436',
  title: 'Road marking materials — Road marking performance for road users',
  issuer: 'European Committee for Standardization',
};

const EN_1463: StandardReference = {
  code: 'EN 1463',
  title: 'Road marking materials — Retroreflecting road studs',
  issuer: 'European Committee for Standardization',
};

const ICAO_ANNEX_14: StandardReference = {
  code: 'ICAO Annex 14',
  title: 'Aerodromes — Volume I, Aerodrome Design and Operations',
  issuer: 'International Civil Aviation Organization',
};

const IS_164: StandardReference = {
  code: 'IS 164',
  title: 'Ready Mixed Paint, for Road Marking',
  issuer: 'Bureau of Indian Standards',
};

/* -------------------------------------------------------------------------- */
/* Shared content fragments                                                    */
/* -------------------------------------------------------------------------- */

const LIVE_TRAFFIC_CONSIDERATIONS = [
  'Available working windows. Night working or lane-by-lane closure changes productivity far more than the quantity does, and should be settled before rates are compared.',
  'Traffic management responsibility. Confirm in the RFQ whether cones, signage, crash-attenuator vehicles and flagmen sit with the marking contractor or the main contractor.',
  'Surface age and curing. Newly laid bituminous surfaces need to cure before thermoplastic is applied, or the bond and the final colour both suffer.',
  'Weather and moisture. Thermoplastic will not bond to a damp surface. Monsoon periods need contingency in the programme, not optimism.',
  'Access and mobilisation distance. A stretch far from the nearest depot carries mobilisation cost that a per-square-metre rate alone will not reveal.',
];

const STANDARD_QUALITY_CHECKS = [
  'Material batch verification against the approved specification before application.',
  'Surface cleanliness, dryness and curing state confirmed before laying begins.',
  'Pre-marking and setting-out submitted for the engineer’s approval.',
  'Application temperature monitored and recorded through the laying operation.',
  'Wet film thickness checked at defined intervals along the run.',
  'Glass bead application rate and embedment checked visually and by sampling.',
  'Retroreflectivity measured with a portable retroreflectometer and recorded by location.',
  'Line width, alignment and edge definition checked against the approved drawing.',
  'Joint measurement with the client’s representative and photographic documentation at handover.',
];

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export const services: readonly Service[] = [
  /* ---------------------------------------------------------------------- */
  {
    slug: 'thermoplastic-road-marking',
    name: 'Thermoplastic Road Markings',
    shortName: 'Thermoplastic Markings',
    metaTitle: 'Thermoplastic Road Marking Contractor | Specifications & Execution',
    metaDescription:
      'Thermoplastic road marking execution for highways, urban roads and industrial facilities: specifications, application process, quality checks and the factors that drive cost.',
    directAnswer:
      'Thermoplastic road marking is a hot-applied pavement marking in which a resin, pigment and filler compound is heated to around 180–200 °C, laid on the road surface, and finished with drop-on glass beads that give it night-time retroreflectivity. It is specified where markings must survive heavy traffic for years rather than months.',
    summary:
      'Thermoplastic is the default marking material on highway and high-volume urban work because it wears at a rate measured in years, holds retroreflectivity as it wears, and can be laid at a rate that suits long stretches. Getting the designed life out of it depends less on the material and more on three things done correctly at site: surface preparation, application temperature and bead embedment.',
    specifications: [
      {
        parameter: 'Application method',
        value: 'Hot-applied — screed, extrusion or spray, selected by line type and surface',
        basis: 'IRC:35',
      },
      {
        parameter: 'Application temperature',
        value: 'Commonly 180–200 °C at the applicator, per the material data sheet',
        basis: 'Material specification',
      },
      {
        parameter: 'Applied thickness',
        value:
          'Commonly specified at 2.5 mm for hot-applied thermoplastic on highway work; the contract specification governs',
        basis: 'MoRTH Section 800',
      },
      {
        parameter: 'Drop-on glass beads',
        value:
          'Applied to the hot surface to give initial retroreflectivity; rate and gradation as specified',
        basis: 'IRC:35 / MoRTH Section 800',
      },
      {
        parameter: 'Colour',
        value: 'White and yellow, to the shade called for in the drawing',
        basis: 'IRC:35',
      },
      {
        parameter: 'Retroreflectivity',
        value:
          'Measured as RL in mcd/lx/m². The minimum acceptable value is set by the contract, not by the material',
        basis: 'ASTM E1710 / EN 1436',
      },
      {
        parameter: 'Skid resistance',
        value: 'Specified where the marking covers a significant proportion of the running surface',
        basis: 'EN 1436',
      },
      {
        parameter: 'Set-to-traffic time',
        value: 'Typically minutes rather than hours, which is why it suits short working windows',
        basis: 'Material specification',
      },
    ],
    applications: [
      'Centre lines, lane lines and edge lines on national and state highways',
      'Continuity, transverse and stop lines at intersections and toll plazas',
      'Zebra crossings, give-way markings and directional arrows',
      'Chevron and hatched markings at diverges, merges and obstruction approaches',
      'Speed-reduction and rumble markings where specified',
      'Parking bay, aisle and hatch markings in logistics and commercial facilities',
    ],
    executionProcess: [
      {
        title: 'Survey and quantity confirmation',
        detail:
          'The stretch is surveyed against the BOQ. Line types, lengths and special markings are confirmed by chainage, because BOQ quantities and site reality frequently differ at intersections and structures.',
      },
      {
        title: 'Surface preparation',
        detail:
          'The surface is cleaned of dust, loose aggregate, oil and existing degraded marking. On a surface that will not take the bond, no application temperature or bead rate will save the job.',
      },
      {
        title: 'Primer where required',
        detail:
          'A primer or tack coat is applied on concrete and on aged or polished bituminous surfaces where the specification calls for it.',
      },
      {
        title: 'Pre-marking and setting out',
        detail:
          'Lines are set out and offered for the engineer’s approval before any thermoplastic is laid. Correcting alignment after application means removal, not adjustment.',
      },
      {
        title: 'Melting and application',
        detail:
          'Material is melted in a controlled pre-melter and applied at the temperature the data sheet requires. Overheating degrades the binder; underheating produces poor bond and inconsistent thickness.',
      },
      {
        title: 'Glass bead application',
        detail:
          'Beads are dropped onto the hot material immediately behind the applicator, so they embed to roughly half their diameter — the condition that produces retroreflectivity that survives wear.',
      },
      {
        title: 'Cooling and opening to traffic',
        detail:
          'The marking is protected until set, then the lane is returned to traffic.',
      },
      {
        title: 'Inspection, measurement and documentation',
        detail:
          'Thickness, width, alignment and retroreflectivity are checked, quantities are measured jointly, and records are compiled for the bill.',
      },
    ],
    qualityChecks: STANDARD_QUALITY_CHECKS,
    costFactors: [
      {
        factor: 'Applied thickness specified',
        effect:
          'Material consumption scales directly with thickness. A 3 mm specification is materially more expensive per square metre than 2.5 mm, and the two are not interchangeable at the same rate.',
      },
      {
        factor: 'Glass bead specification and rate',
        effect:
          'Bead gradation, refractive index and application rate all move the material cost, and a higher-specification bead is often what the retroreflectivity requirement is really asking for.',
      },
      {
        factor: 'Line type mix',
        effect:
          'Continuous longitudinal lines are the most productive work. Broken lines, arrows, legends, zebras and chevrons take disproportionately more time per square metre.',
      },
      {
        factor: 'Working window and traffic management',
        effect:
          'Night working, short closure windows and lane-by-lane sequencing reduce daily output substantially. This is usually the single largest difference between two quotes for the same quantity.',
      },
      {
        factor: 'Surface preparation required',
        effect:
          'Removal of existing degraded marking, or cleaning a heavily contaminated surface, is separate work and should be priced as such rather than absorbed.',
      },
      {
        factor: 'Mobilisation and site distance',
        effect:
          'Moving machinery, material and crew to a remote stretch, and the site establishment that follows, is a fixed cost that a small quantity cannot absorb efficiently.',
      },
      {
        factor: 'Quantity and continuity of work',
        effect:
          'A continuous long stretch is more efficient than the same quantity scattered across disconnected locations.',
      },
      {
        factor: 'Testing and documentation requirements',
        effect:
          'Third-party testing, specified retroreflectivity reporting frequency and formal documentation packages carry real cost and should be stated in the RFQ.',
      },
    ],
    projectConsiderations: LIVE_TRAFFIC_CONSIDERATIONS,
    commonMistakes: [
      {
        mistake: 'Applying thermoplastic to a surface that is damp or not fully cured',
        consequence:
          'The bond fails. The marking lifts in sheets within weeks, usually starting at the wheel path.',
        instead:
          'Confirm surface dryness and allow new bituminous surfaces to cure before marking. Build the wait into the programme.',
      },
      {
        mistake: 'Judging application temperature by eye instead of measuring it',
        consequence:
          'Overheated material loses binder performance and yellows; underheated material bonds poorly and lays at inconsistent thickness.',
        instead:
          'Monitor and record temperature at the applicator throughout the shift.',
      },
      {
        mistake: 'Dropping glass beads too late, after the surface has begun to skin',
        consequence:
          'Beads sit on the surface instead of embedding, sweep away under traffic within days, and night visibility collapses even though the marking looks intact.',
        instead:
          'Apply beads immediately behind the applicator while the material is still fluid enough to accept them.',
      },
      {
        mistake: 'Comparing quotes on rate per square metre alone',
        consequence:
          'A lower rate at a thinner applied thickness, a cheaper bead or without traffic management included is not a cheaper job — it is a different scope.',
        instead:
          'Compare thickness, bead specification, traffic management responsibility and testing scope alongside the rate.',
      },
      {
        mistake: 'Laying over existing degraded marking rather than removing it',
        consequence:
          'The new marking is only as sound as the failing layer beneath it, and fails with it.',
        instead:
          'Remove degraded marking where the existing layer is unsound, and price removal as separate work.',
      },
    ],
    faqs: [
      {
        question: 'How long does thermoplastic road marking last?',
        answer:
          'Service life depends on traffic volume, surface condition, applied thickness and how well the material was laid, so no honest single figure covers every project. On highway work, correctly applied thermoplastic at the specified thickness is expected to serve for several years, while retroreflectivity typically falls below the specified value before the marking itself wears away. Where a specific life is required, it should be stated in the contract along with the retroreflectivity threshold that defines end of life.',
      },
      {
        question: 'What thickness is specified for thermoplastic road marking?',
        answer:
          '2.5 mm is commonly specified for hot-applied thermoplastic on highway work under MoRTH Section 800, though projects do specify other thicknesses. The governing figure is always the one in your contract specification. Thickness should be stated in the RFQ, because it changes material consumption and therefore the rate.',
      },
      {
        question: 'What is the difference between thermoplastic and road marking paint?',
        answer:
          'Thermoplastic is a hot-applied solid compound laid at millimetre thickness that wears over years. Road marking paint is a liquid coating applied at a fraction of that thickness with a service life usually measured in months on trafficked surfaces. Paint costs less to apply and suits temporary marking, diversions and low-traffic areas. Thermoplastic is specified where the marking has to survive traffic.',
      },
      {
        question: 'How is retroreflectivity measured and what value is required?',
        answer:
          'It is measured as RL in millicandelas per lux per square metre using a portable retroreflectometer, following ASTM E1710 or the equivalent European geometry. The required minimum is set by the project specification rather than by the material, and it differs between new-work acceptance and maintenance thresholds. Ask for readings recorded by location rather than a single representative figure.',
      },
      {
        question: 'Can thermoplastic be applied on concrete pavement?',
        answer:
          'Yes, but concrete generally requires a primer to achieve adequate bond, and the surface must be clean and free of curing compound and laitance. Where a project has both bituminous and concrete stretches, the preparation differs and should be reflected in the scope.',
      },
      {
        question: 'Do you work at night and on live carriageways?',
        answer:
          'Yes. Most highway and expressway marking is executed in night windows or under lane closure alongside live traffic, under an approved traffic management plan. The available working window should be confirmed at enquiry stage because it affects the programme more than the quantity does.',
      },
    ],
    standards: [IRC_35, MORTH_800, ASTM_D4960, ASTM_E1710, EN_1436, IS_164],
    industries: ['highways-expressways', 'smart-cities-urban', 'industrial', 'logistics-warehousing'],
    relatedServices: [
      'highway-expressway-marking',
      'urban-road-marking',
      'road-studs-cat-eyes',
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'highway-expressway-marking',
    name: 'Highway & Expressway Markings',
    shortName: 'Highway Markings',
    metaTitle: 'Highway & Expressway Road Marking Contractor in India',
    metaDescription:
      'Highway and expressway road marking execution under live traffic: lane, edge and continuity lines, toll plaza and interchange markings, traffic management and quality documentation.',
    directAnswer:
      'Highway and expressway marking is the lane, edge, continuity and special marking work carried out on high-speed carriageways, almost always alongside live traffic in restricted windows. The technical work is thermoplastic application; the difficulty is executing it safely and productively without closing the road.',
    summary:
      'On a highway package, the marking scope is rarely the risk — the working window is. Output on an expressway is governed by how much carriageway you are allowed, for how long, and how quickly the crew can set up and clear. A marking contractor who plans around the traffic management plan rather than around the quantity is the one who finishes on programme.',
    specifications: [
      {
        parameter: 'Longitudinal marking types',
        value: 'Centre line, lane line, edge line, continuity line and no-overtaking line',
        basis: 'IRC:35',
      },
      {
        parameter: 'Transverse and special markings',
        value: 'Stop lines, give-way, zebra crossings, arrows, legends, chevrons and hatching',
        basis: 'IRC:35',
      },
      {
        parameter: 'Line widths',
        value: 'Set by road classification and marking type in the approved drawing',
        basis: 'IRC:35',
      },
      {
        parameter: 'Material',
        value: 'Hot-applied thermoplastic to the project specification, unless otherwise called for',
        basis: 'MoRTH Section 800',
      },
      {
        parameter: 'Retroreflectivity acceptance',
        value: 'Measured value against the minimum stated in the contract specification',
        basis: 'ASTM E1710 / EN 1436',
      },
      {
        parameter: 'Traffic management',
        value:
          'Advance warning, taper, buffer and working zone arranged per the approved traffic management plan',
        basis: 'IRC:SP:55',
      },
    ],
    applications: [
      'National highway and state highway lane and edge marking',
      'Access-controlled expressway marking including full carriageway packages',
      'Interchange, diverge and merge markings including chevrons and hatching',
      'Toll plaza approach markings, lane channelisation and stop lines',
      'Structure approaches, median openings and emergency lay-bys',
      'Maintenance re-marking on operational highway concessions',
    ],
    executionProcess: [
      {
        title: 'Joint site inspection with the engineer',
        detail:
          'The stretch is walked or driven with the client’s representative to agree the chainage-wise scope and identify locations where the drawing and the site differ.',
      },
      {
        title: 'Traffic management plan approval',
        detail:
          'The closure arrangement, taper lengths, signage and working-zone layout are agreed and approved before any crew goes to the carriageway.',
      },
      {
        title: 'Programme built around the working window',
        detail:
          'Output is planned against the hours actually available, not against theoretical machine capacity, so the programme survives contact with the site.',
      },
      {
        title: 'Pre-marking and approval',
        detail:
          'Setting-out is completed and approved ahead of the application shift, so the shift is spent laying rather than measuring.',
      },
      {
        title: 'Application under closure',
        detail:
          'The crew sets up, applies, beads and clears within the window, with progress recorded by chainage against the day’s plan.',
      },
      {
        title: 'Quality checks and joint measurement',
        detail:
          'Thickness and retroreflectivity are checked and recorded by location, and quantities are measured jointly as the work proceeds rather than in a single reconciliation at the end.',
      },
      {
        title: 'Handover documentation',
        detail:
          'Measurement sheets, material records, test readings and photographs are compiled in the format the contract requires.',
      },
    ],
    qualityChecks: STANDARD_QUALITY_CHECKS,
    costFactors: [
      {
        factor: 'Working window length and timing',
        effect:
          'The dominant driver on highway work. A four-hour night window and a full-day closure produce very different outputs from identical crews and machinery.',
      },
      {
        factor: 'Traffic management scope',
        effect:
          'Whether cones, signage, flagmen and crash-attenuator vehicles are in the marking contractor’s scope changes the rate significantly. It must be stated explicitly in the RFQ.',
      },
      {
        factor: 'Proportion of special markings',
        effect:
          'Chevrons, hatching, arrows and legends at interchanges and toll plazas consume far more time per square metre than plain longitudinal running.',
      },
      {
        factor: 'Stretch continuity',
        effect:
          'One continuous package is more efficient than the same area split across disconnected sections, each needing its own mobilisation and closure.',
      },
      {
        factor: 'Existing marking removal',
        effect:
          'Re-marking work on an operational highway often needs removal of failed marking first, which is separate work with its own productivity.',
      },
      {
        factor: 'Applied thickness and bead specification',
        effect:
          'As with all thermoplastic work, these drive material consumption directly and are the first two things to align when comparing quotes.',
      },
      {
        factor: 'Site accommodation and mobilisation distance',
        effect:
          'Remote stretches carry mobilisation, storage and crew accommodation costs that do not appear in a per-square-metre comparison.',
      },
    ],
    projectConsiderations: [
      ...LIVE_TRAFFIC_CONSIDERATIONS,
      'Whether the package is new-build marking or re-marking on an operational concession, since the two differ in removal scope, closure availability and documentation.',
      'Coordination with the surfacing programme, because marking cannot start until the wearing course is laid and cured on each section.',
    ],
    commonMistakes: [
      {
        mistake: 'Planning output from machine capacity rather than from the approved working window',
        consequence:
          'The programme slips from the first week and stays behind, because the constraint was never the machine.',
        instead:
          'Build the programme from the hours the traffic management plan actually allows, including setup and clearance time.',
      },
      {
        mistake: 'Leaving traffic management responsibility unstated in the RFQ',
        consequence:
          'Quotes are not comparable, and the gap surfaces as a variation after award.',
        instead:
          'State explicitly who provides signage, cones, flagmen and attenuator vehicles before requesting rates.',
      },
      {
        mistake: 'Starting marking before the wearing course has cured',
        consequence:
          'Bond failure on the newest sections of the project, which then need removal and redoing at the contractor’s cost.',
        instead:
          'Sequence marking behind surfacing with the curing period built into the programme.',
      },
      {
        mistake: 'Treating retroreflectivity as a single project-level number',
        consequence:
          'Locally failing sections pass on an averaged figure and are found later during a maintenance audit.',
        instead:
          'Record readings by chainage and treat them as location data, not as one acceptance value.',
      },
    ],
    faqs: [
      {
        question: 'Can highway marking be done without closing the road?',
        answer:
          'It is done under lane closure rather than full closure in most cases. One lane is taken under an approved traffic management plan with advance warning, a taper and a buffer zone, while traffic continues in the remaining lanes. Full closure is used where the geometry or the volume of special marking makes lane-by-lane working unsafe or impractical.',
      },
      {
        question: 'How much highway marking can be completed in a night window?',
        answer:
          'It depends on the window length, the line type mix and how much of the window is consumed by setting up and clearing the closure. A four-hour window loses a meaningful proportion to setup and clearance before any material is laid. Any contractor quoting output should be able to state their assumed window and setup time, and those assumptions are worth checking when comparing programmes.',
      },
      {
        question: 'Who is responsible for traffic management during marking works?',
        answer:
          'It depends entirely on the contract. On some packages the main contractor provides the traffic management arrangement and the marking contractor works within it; on others it sits with the marking contractor. Because it is a significant cost, it should be stated in the RFQ rather than assumed.',
      },
      {
        question: 'Do you take on re-marking work on operational highway concessions?',
        answer:
          'Yes. Maintenance re-marking on operational concessions and toll roads is regular work. It differs from new-build marking mainly in the removal scope, the closure constraints on a revenue-generating road, and the documentation the concessionaire needs for its own compliance reporting.',
      },
    ],
    standards: [IRC_35, MORTH_800, ASTM_E1710, EN_1436],
    industries: ['highways-expressways', 'smart-cities-urban'],
    relatedServices: [
      'thermoplastic-road-marking',
      'road-studs-cat-eyes',
      'traffic-signboards',
      'highway-safety-assets',
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'urban-road-marking',
    name: 'Urban Road Markings',
    shortName: 'Urban Markings',
    metaTitle: 'Urban Road Marking Contractor | City Roads, Junctions & Crossings',
    metaDescription:
      'Urban and city road marking execution: junction markings, pedestrian crossings, lane channelisation, bus lanes and parking markings for municipal and smart-city projects.',
    directAnswer:
      'Urban road marking covers the lane, junction, crossing and channelisation markings on city streets and municipal roads. Compared with highway work the quantities per location are smaller and the geometry is more complex, so the work is dominated by junctions, crossings and layout rather than by long continuous runs.',
    summary:
      'City marking work rewards accuracy over throughput. A typical urban package is a large number of small, geometrically awkward locations — junctions, crossings, refuges, bus stops — executed around pedestrian movement, parked vehicles and utility works. Setting out is the substantial part of the effort, and mobilisation between locations often exceeds application time.',
    specifications: [
      {
        parameter: 'Marking types',
        value:
          'Lane lines, stop lines, zebra and pedestrian crossings, give-way, box junctions, arrows and legends',
        basis: 'IRC:35',
      },
      {
        parameter: 'Material',
        value:
          'Thermoplastic on trafficked carriageways; cold-applied paint where the specification calls for temporary or low-traffic marking',
        basis: 'IRC:35 / IS 164',
      },
      {
        parameter: 'Pedestrian crossing layout',
        value: 'Bar width and spacing to the approved drawing and municipal standard',
        basis: 'IRC:35',
      },
      {
        parameter: 'Colour convention',
        value: 'White, yellow and, where specified, coloured surfacing for bus or cycle lanes',
        basis: 'IRC:35',
      },
    ],
    applications: [
      'Junction markings, stop lines and box junctions',
      'Pedestrian crossings and school-zone markings',
      'Lane channelisation and turning-lane markings',
      'Bus lane and bus stop markings',
      'Cycle lane markings where provided',
      'On-street parking bay marking and no-parking zones',
      'Traffic calming and speed-table markings where specified',
    ],
    executionProcess: [
      {
        title: 'Location survey and layout confirmation',
        detail:
          'Each junction and crossing is surveyed individually. Urban drawings and site geometry differ often enough that this cannot be skipped.',
      },
      {
        title: 'Local coordination',
        detail:
          'Working windows are agreed with the municipal authority and, where relevant, traffic police, since city working is usually constrained to off-peak hours.',
      },
      {
        title: 'Surface preparation',
        detail:
          'Urban surfaces carry more oil, dust and utility patching than highway surfaces, so preparation is a larger share of the work.',
      },
      {
        title: 'Setting out and approval',
        detail:
          'Layout is marked out and approved on site before application, because junction geometry rarely translates directly from the drawing.',
      },
      {
        title: 'Application',
        detail:
          'Marking is applied location by location around pedestrian movement and local access, with the site made safe at each one.',
      },
      {
        title: 'Inspection and measurement',
        detail:
          'Each location is checked and measured, and quantities are reconciled location-wise rather than as a single package figure.',
      },
    ],
    qualityChecks: STANDARD_QUALITY_CHECKS,
    costFactors: [
      {
        factor: 'Number of discrete locations',
        effect:
          'The dominant driver in urban work. Fifty small junctions cost far more than one stretch of equivalent total area, because each location carries its own mobilisation and setting out.',
      },
      {
        factor: 'Geometric complexity',
        effect:
          'Box junctions, multi-arm intersections and irregular crossings need substantially more setting-out time than standard layouts.',
      },
      {
        factor: 'Permitted working hours',
        effect:
          'City work is frequently restricted to night or off-peak hours, which reduces daily output and adds supervision cost.',
      },
      {
        factor: 'Surface condition and utility patching',
        effect:
          'Frequently patched urban surfaces need more preparation, and marking over recent patching carries a bond risk that should be addressed in the scope.',
      },
      {
        factor: 'Removal of superseded marking',
        effect:
          'Junction redesigns usually require existing marking to be removed rather than overlaid, which is separate work.',
      },
      {
        factor: 'Access and parked vehicles',
        effect:
          'Locations that need clearing before work can start introduce delay that is real but easy to leave out of a rate.',
      },
    ],
    projectConsiderations: [
      'Whether the package is measured location-wise or on total area, since urban work priced purely on area tends to under-recover on scattered small locations.',
      'Coordination with utility and road-repair programmes, so that new marking is not laid immediately before a trench is cut through it.',
      'Permitted working hours and the approvals needed from municipal and traffic authorities.',
      'Pedestrian safety arrangements at each location, which differ from highway traffic management.',
      'Whether existing marking is to be removed or overlaid, decided location by location rather than as a blanket instruction.',
    ],
    commonMistakes: [
      {
        mistake: 'Pricing an urban package on total area alone',
        consequence:
          'The rate does not reflect the real cost of many small scattered locations, and the job either loses money or is executed poorly.',
        instead:
          'Price location-wise, or state the number and distribution of locations clearly in the RFQ.',
      },
      {
        mistake: 'Marking over recent utility patching without assessing it',
        consequence:
          'The marking fails where the patch settles or where the patch surface never took the bond.',
        instead:
          'Assess patched areas separately and flag those that need attention before marking.',
      },
      {
        mistake: 'Overlaying a new junction layout on top of the old one',
        consequence:
          'Ghost marking stays visible and gives drivers conflicting information, which is a safety issue and not just a cosmetic one.',
        instead:
          'Remove superseded marking wherever the layout has changed, and price removal in the scope.',
      },
    ],
    faqs: [
      {
        question: 'How is urban road marking priced compared with highway work?',
        answer:
          'Highway work is normally priced per square metre or per kilometre because the runs are long and continuous. Urban work is better priced location-wise or with an explicit statement of how many discrete locations are involved, because mobilisation and setting out at each location often exceed the application time. A city package priced purely on area tends to be mispriced.',
      },
      {
        question: 'Can city road marking be done during the day?',
        answer:
          'Sometimes, on lower-volume streets and with adequate pedestrian safety arrangements. Busier corridors and junctions are usually restricted to night or off-peak windows by the municipal authority or traffic police. The permitted hours should be confirmed before the programme is fixed.',
      },
      {
        question: 'Should old marking be removed when a junction is redesigned?',
        answer:
          'Yes, wherever the new layout conflicts with the old. Ghost marking remains visible, particularly in wet conditions and at night, and gives drivers two contradictory sets of instructions at exactly the location where clarity matters most. Removal should be a priced item in the scope rather than an afterthought.',
      },
    ],
    standards: [IRC_35, IS_164, MORTH_800],
    industries: ['smart-cities-urban', 'highways-expressways'],
    relatedServices: [
      'thermoplastic-road-marking',
      'traffic-signboards',
      'logistics-parking-marking',
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'runway-taxiway-marking',
    name: 'Runway & Taxiway Markings',
    shortName: 'Runway & Taxiway',
    metaTitle: 'Airport Runway & Taxiway Marking Contractor in India',
    metaDescription:
      'Runway, taxiway and apron marking execution for airports: designation and centreline markings, holding positions, apron layout, night working windows and quality documentation.',
    directAnswer:
      'Runway and taxiway marking is the pavement marking that guides aircraft on the movement area: runway designation, centreline, threshold, touchdown zone and edge markings, taxiway centrelines and holding positions, and apron layout. It is executed to the aerodrome operator’s specification within closure windows agreed with air traffic control.',
    summary:
      'Airfield marking is technically similar to road marking and operationally very different. The tolerances are tighter, the layout is defined by aerodrome design standards rather than by local judgement, foreign object debris control is a hard requirement, and every working window is granted by air traffic control and ends when it ends. Execution capability on an airfield is mostly about discipline inside the window.',
    specifications: [
      {
        parameter: 'Marking categories',
        value:
          'Runway designation, centreline, threshold, aiming point, touchdown zone, side stripe; taxiway centreline and edge; holding position; apron and stand markings',
        basis: 'ICAO Annex 14',
      },
      {
        parameter: 'Colour convention',
        value:
          'Runway markings white; taxiway and apron markings yellow; mandatory instruction markings white on red',
        basis: 'ICAO Annex 14',
      },
      {
        parameter: 'Layout and dimensions',
        value:
          'Set by the aerodrome design standard and the operator’s approved marking drawing, not by general road practice',
        basis: 'ICAO Annex 14 / operator specification',
      },
      {
        parameter: 'Material',
        value:
          'Airfield-grade marking material to the operator’s specification; bead type and skid resistance as called for',
        basis: 'Operator specification',
      },
      {
        parameter: 'Foreign object debris control',
        value: 'Full FOD control and post-work sweep of the working area before handback',
        basis: 'Aerodrome operating procedures',
      },
      {
        parameter: 'Working windows',
        value: 'Closure periods granted and controlled by air traffic control',
        basis: 'Aerodrome operating procedures',
      },
    ],
    applications: [
      'Runway designation, centreline, threshold and touchdown zone markings',
      'Runway side stripes and aiming point markings',
      'Taxiway centreline, edge and turn markings',
      'Runway holding position and intermediate holding position markings',
      'Apron stand markings, lead-in and lead-out lines and equipment parking areas',
      'Removal and re-marking during resurfacing or runway upgrade works',
    ],
    executionProcess: [
      {
        title: 'Airside access and security clearance',
        detail:
          'Crew passes, vehicle permits and airside driving requirements are completed before any programme dates are committed, because clearance timelines are frequently the binding constraint.',
      },
      {
        title: 'Method statement and window agreement',
        detail:
          'The method statement, FOD control plan and required closure windows are agreed with the aerodrome operator and air traffic control.',
      },
      {
        title: 'Setting out to the approved marking drawing',
        detail:
          'Layout is set out against the operator’s approved drawing and surveyed, since airfield marking geometry is defined by standard and verified rather than adjusted on site.',
      },
      {
        title: 'Application within the granted window',
        detail:
          'Work proceeds inside the closure with the crew briefed on the window end time and the handback condition required.',
      },
      {
        title: 'FOD sweep and handback',
        detail:
          'The working area is swept and inspected for debris and the surface is handed back within the window, without exception.',
      },
      {
        title: 'Inspection and documentation',
        detail:
          'Geometry, thickness and finish are checked against the drawing and specification and recorded for the operator’s records.',
      },
    ],
    qualityChecks: [
      'Layout verified by survey against the operator’s approved marking drawing.',
      'Material batch verified against the airfield specification before application.',
      'Surface cleanliness and dryness confirmed before laying.',
      'Application temperature and thickness monitored through the operation.',
      'Bead application rate and embedment checked where beads are specified.',
      'Colour and edge definition checked against the standard.',
      'Full FOD sweep and visual inspection of the working area before handback.',
      'Handback within the granted window confirmed with the operator.',
      'Documentation issued in the format the aerodrome operator requires.',
    ],
    costFactors: [
      {
        factor: 'Closure window length and frequency',
        effect:
          'The governing driver. Short nightly windows on an operational runway produce a fraction of the output of an extended closure, for identical scope.',
      },
      {
        factor: 'Airside access and security requirements',
        effect:
          'Passes, escorts, airside vehicle permits and crew clearance carry lead time and cost that road work does not.',
      },
      {
        factor: 'Removal of existing markings',
        effect:
          'Runway upgrades and designation changes require removal to airfield standards, which is specialised work distinct from application.',
      },
      {
        factor: 'Material specification',
        effect:
          'Airfield-grade material and specified bead types cost more than standard road material and are not interchangeable with it.',
      },
      {
        factor: 'Survey and setting-out precision',
        effect:
          'Airfield geometry is verified by survey rather than set out by eye, which adds time and equipment to every location.',
      },
      {
        factor: 'FOD control and handback discipline',
        effect:
          'Sweeping, inspection and guaranteed handback within the window are non-negotiable and consume part of every window.',
      },
    ],
    projectConsiderations: [
      'Whether the airport remains operational during the works, which determines whether windows are nightly closures or an extended shutdown.',
      'Airside access lead time for crew clearance and vehicle permits, which frequently governs the earliest possible start.',
      'Whether existing markings are to be removed, and to what standard, particularly on designation changes and resurfacing.',
      'Coordination with resurfacing, lighting and NAVAID works sharing the same closure windows.',
      'The operator’s documentation and inspection requirements, which are usually more prescriptive than road contracts.',
    ],
    commonMistakes: [
      {
        mistake: 'Planning the programme before airside clearance timelines are known',
        consequence:
          'The start date slips regardless of how ready the crew and machinery are, because access, not capability, is the constraint.',
        instead:
          'Begin the clearance process at award and build the programme around confirmed access dates.',
      },
      {
        mistake: 'Treating the closure window as approximate',
        consequence:
          'A late handback is an operational incident for the aerodrome, not a programme delay, and it damages the contractor’s standing permanently.',
        instead:
          'Plan each window backwards from the handback time, including the FOD sweep, and stop application accordingly.',
      },
      {
        mistake: 'Applying road-marking practice to airfield geometry',
        consequence:
          'Non-conforming markings on a movement area have to be removed and redone, at cost and inside scarce windows.',
        instead:
          'Set out to the operator’s approved drawing and the aerodrome design standard, and verify by survey.',
      },
      {
        mistake: 'Underestimating FOD control',
        consequence:
          'Debris left on a movement area is a direct hazard to aircraft and the most serious failure available on this type of work.',
        instead:
          'Treat the FOD sweep and inspection as a fixed, non-compressible part of every window.',
      },
    ],
    faqs: [
      {
        question: 'Can runway marking be done while the airport stays operational?',
        answer:
          'Yes, and it usually is. Work is carried out in closure windows granted by air traffic control, most often at night, with the movement area handed back in a fully serviceable and debris-free condition at the end of each window. The available window length is the main determinant of programme duration.',
      },
      {
        question: 'How is airfield marking different from highway marking?',
        answer:
          'The application technique is similar but the operating regime is not. Layout is defined by aerodrome design standards and verified by survey rather than set out on site; foreign object debris control is a hard safety requirement; airside access requires cleared crew and permitted vehicles; and every working window is granted, fixed and enforced. Planning and discipline matter more than raw output rate.',
      },
      {
        question: 'What documentation does an airport operator typically require?',
        answer:
          'Requirements vary by operator, but generally include the approved method statement, material certificates for the batches used, survey verification of the set-out geometry, in-process records, FOD sweep confirmation for each window, and photographic documentation. This should be confirmed with the operator at the outset because it is usually more prescriptive than a road contract.',
      },
    ],
    standards: [ICAO_ANNEX_14, ASTM_E1710],
    industries: ['airports'],
    relatedServices: ['thermoplastic-road-marking', 'logistics-parking-marking'],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'logistics-parking-marking',
    name: 'Logistics & Parking Area Markings',
    shortName: 'Logistics & Parking',
    metaTitle: 'Logistics Park & Parking Area Line Marking Contractor',
    metaDescription:
      'Line marking for warehouses, logistics parks and parking facilities: truck docks, circulation routes, parking bays, pedestrian walkways and yard traffic management.',
    directAnswer:
      'Logistics and parking area marking is the yard and circulation marking at warehouses, distribution centres, logistics parks and parking facilities: truck docking bays, one-way circulation routes, parking bays, pedestrian walkways and segregation markings. Its purpose is to make vehicle and pedestrian movement predictable in a congested yard.',
    summary:
      'A warehouse yard is a small area carrying a very high density of vehicle movements, reversing trailers and people on foot. Marking is the primary control. The design question is rarely which material to use — it is whether the layout actually segregates pedestrians from reversing vehicles, and whether the circulation route works for the largest vehicle that will use it.',
    specifications: [
      {
        parameter: 'Marking types',
        value:
          'Docking bays, circulation and directional arrows, parking bays, pedestrian walkways, hatched exclusion zones and stop lines',
        basis: 'Site traffic management plan',
      },
      {
        parameter: 'Material',
        value:
          'Thermoplastic in heavy vehicle areas; cold-applied systems where layouts change frequently or the surface is unsuitable',
        basis: 'Project specification',
      },
      {
        parameter: 'Colour convention',
        value:
          'Set by the operator’s standard — commonly white or yellow for vehicle marking, with a distinct colour for pedestrian routes',
        basis: 'Operator standard',
      },
      {
        parameter: 'Bay dimensions',
        value:
          'Determined by vehicle type and the swept path of the largest vehicle using the facility',
        basis: 'Facility design',
      },
      {
        parameter: 'Durability requirement',
        value:
          'Docking and turning areas take concentrated tyre scrub and need a specification suited to that, not general yard marking',
        basis: 'Project specification',
      },
    ],
    applications: [
      'Truck docking and staging bay marking at distribution centres',
      'Yard circulation routes, one-way systems and directional arrows',
      'Car and staff parking bay marking, including accessible bays',
      'Pedestrian walkways and vehicle–pedestrian segregation marking',
      'Hatched exclusion zones around loading equipment and building access',
      'Fire lane and emergency access route marking',
      'Container and trailer parking layouts in logistics parks',
    ],
    executionProcess: [
      {
        title: 'Layout review against actual vehicle movements',
        detail:
          'The proposed layout is checked against the vehicles that actually use the yard and how they move through it, because a bay layout that ignores swept path will not be used as drawn.',
      },
      {
        title: 'Operational window agreement',
        detail:
          'Working periods are agreed with the facility, since most yards cannot stop operations and the work has to move around live loading.',
      },
      {
        title: 'Surface assessment',
        detail:
          'Yard surfaces vary from new concrete to worn bituminous with oil contamination, and the preparation and material differ accordingly.',
      },
      {
        title: 'Setting out and approval',
        detail:
          'Bays and routes are set out and walked with the facility manager before application, since changes after laying mean removal.',
      },
      {
        title: 'Phased application',
        detail:
          'Work is executed in sections so that the yard keeps operating, with each section returned to use as it sets.',
      },
      {
        title: 'Inspection and handover',
        detail:
          'Layout, dimensions and finish are checked against the approved plan and handed over with an as-executed record.',
      },
    ],
    qualityChecks: [
      'Surface cleanliness and freedom from oil contamination confirmed before application.',
      'Material selected against the surface type and the vehicle loading in each area.',
      'Setting-out approved by the facility before application.',
      'Bay dimensions and aisle widths checked against the approved layout.',
      'Application thickness and temperature monitored where thermoplastic is used.',
      'Pedestrian route continuity checked end to end, not section by section.',
      'As-executed layout record issued at handover.',
    ],
    costFactors: [
      {
        factor: 'Operational constraints',
        effect:
          'A yard that cannot pause loading forces phased and often out-of-hours working, which reduces output substantially.',
      },
      {
        factor: 'Surface condition and contamination',
        effect:
          'Oil-contaminated and worn surfaces need more preparation, and heavily contaminated areas may need a different material system.',
      },
      {
        factor: 'Proportion of bay and symbol marking',
        effect:
          'Bays, arrows, symbols and hatching are slower per square metre than straight circulation lines.',
      },
      {
        factor: 'Material system selected',
        effect:
          'Thermoplastic in heavy scrub areas costs more than cold-applied systems but lasts materially longer where trailers turn.',
      },
      {
        factor: 'Removal of an existing layout',
        effect:
          'Re-configuring a yard usually requires removing the previous layout, which is separate work and often the larger part of the job.',
      },
      {
        factor: 'Site access and working hours',
        effect:
          'Restricted access, induction requirements and night working all reduce productive hours on site.',
      },
    ],
    projectConsiderations: [
      'The swept path of the largest vehicle using the yard, which governs whether the layout will be usable in practice.',
      'Whether the facility can pause operations, and for how long, since this determines phasing more than quantity does.',
      'Whether the layout is expected to change again within a few years, which affects whether a permanent or a re-configurable system is appropriate.',
      'Pedestrian routes as continuous paths from gate to building, rather than as disconnected painted sections.',
      'Surface contamination in loading areas, which is the most common cause of premature failure in yard marking.',
    ],
    commonMistakes: [
      {
        mistake: 'Marking a bay layout that ignores the swept path of the largest vehicle',
        consequence:
          'Drivers cannot use the bays as drawn, so they park where it works instead, and the layout is ignored.',
        instead:
          'Check the layout against the actual vehicle types and turning requirements before marking.',
      },
      {
        mistake: 'Applying marking over oil-contaminated yard surface',
        consequence:
          'Bond failure in exactly the loading and docking areas that matter most, within months.',
        instead:
          'Assess and clean contaminated areas, and select a material system suited to the surface condition.',
      },
      {
        mistake: 'Marking pedestrian routes as disconnected sections',
        consequence:
          'People leave the marked route where it stops and walk through vehicle movement areas, which defeats the purpose of the segregation.',
        instead:
          'Design and mark pedestrian routes as continuous paths from entry to destination.',
      },
      {
        mistake: 'Using general yard marking specification in docking and turning areas',
        consequence:
          'Concentrated tyre scrub removes the marking in the highest-traffic areas first, while the rest of the yard still looks new.',
        instead:
          'Specify a more durable system where trailers turn and dock, and treat those as separate areas.',
      },
    ],
    faqs: [
      {
        question: 'How long does warehouse yard marking last?',
        answer:
          'It varies widely by area within the same yard. Straight circulation runs wear slowly, while docking and turning areas take concentrated tyre scrub and wear far faster. A yard marked to a single specification throughout will usually fail first at the docks. Specifying a more durable system in those areas gives a more even service life.',
      },
      {
        question: 'Can yard marking be done without stopping warehouse operations?',
        answer:
          'Generally yes, by phasing the work section by section and working around live loading, often outside peak hours. It takes longer than marking an empty yard, so the phasing constraint should be stated at enquiry stage rather than discovered after award.',
      },
      {
        question: 'What material should be used for warehouse and logistics marking?',
        answer:
          'It depends on the surface and the traffic. Thermoplastic suits heavy-vehicle areas on sound surfaces and lasts well under trailer movement. Cold-applied systems suit layouts expected to change, surfaces unsuitable for hot application, and indoor or transitional areas. Contaminated surfaces may need specific preparation regardless of the system chosen.',
      },
    ],
    standards: [IRC_35, MORTH_800],
    industries: ['logistics-warehousing', 'industrial'],
    relatedServices: [
      'industrial-floor-marking',
      'thermoplastic-road-marking',
      'traffic-signboards',
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'industrial-floor-marking',
    name: 'Industrial Floor Markings',
    shortName: 'Industrial Floor',
    metaTitle: 'Industrial Floor Marking Contractor | Factory & Warehouse Floors',
    metaDescription:
      'Industrial floor marking for factories and warehouses: aisle marking, walkway segregation, safety zones, equipment footprints and 5S layout marking on concrete and coated floors.',
    directAnswer:
      'Industrial floor marking is the internal marking of factory and warehouse floors: aisles, walkways, safety zones, equipment footprints, storage areas and hazard demarcation. It is applied to concrete or coated floors and its purpose is to separate people from moving equipment and to make the intended layout unambiguous.',
    summary:
      'Inside a plant, the main hazard is forklifts and people sharing the same floor. Floor marking is the cheapest and most direct control available. What determines whether it works is not the material — it is whether the walkway is continuous, whether the aisle is wide enough for the equipment actually used, and whether the floor was prepared well enough for the marking to survive forklift wheels.',
    specifications: [
      {
        parameter: 'Marking types',
        value:
          'Aisle lines, pedestrian walkways, hazard and exclusion zones, equipment footprints, storage bays and directional arrows',
        basis: 'Facility layout and safety plan',
      },
      {
        parameter: 'Substrate',
        value: 'Power-floated concrete, epoxy-coated or resin floors, treated per substrate',
        basis: 'Material specification',
      },
      {
        parameter: 'Material systems',
        value:
          'Solvent-free or two-component floor paint, or heavy-duty tape systems where the layout is expected to change',
        basis: 'Material specification',
      },
      {
        parameter: 'Colour convention',
        value:
          'To the facility’s safety colour standard, applied consistently so that a colour means the same thing throughout the plant',
        basis: 'Facility safety standard',
      },
      {
        parameter: 'Slip resistance',
        value: 'Anti-slip additive specified where marking falls on a pedestrian walking surface',
        basis: 'Material specification',
      },
      {
        parameter: 'Surface preparation',
        value:
          'Mechanical preparation and removal of laitance, sealer or curing compound as the substrate requires',
        basis: 'Material specification',
      },
    ],
    applications: [
      'Forklift aisle and travel route marking',
      'Pedestrian walkway marking and vehicle–pedestrian segregation',
      'Hazard, exclusion and no-go zone demarcation',
      'Machine and equipment footprint marking',
      'Raw material, WIP and finished goods storage bay marking',
      'Fire equipment, electrical panel and emergency exit clearance zones',
      '5S and lean layout marking',
    ],
    executionProcess: [
      {
        title: 'Layout review with operations and safety',
        detail:
          'The proposed layout is reviewed with the people who work the floor, since a walkway that does not follow how people actually move will simply be walked around.',
      },
      {
        title: 'Substrate assessment',
        detail:
          'The floor is checked for coating, sealer, curing compound, contamination and moisture, because these determine both the preparation and the material system.',
      },
      {
        title: 'Shutdown window agreement',
        detail:
          'Working periods are agreed around production, as most floor marking requires the area to be clear and to stay clear while the material cures.',
      },
      {
        title: 'Surface preparation',
        detail:
          'The marking path is mechanically prepared and cleaned. On coated floors this step is what determines whether the marking survives forklift traffic.',
      },
      {
        title: 'Setting out and approval',
        detail:
          'Aisles and walkways are set out and walked with the facility team before application.',
      },
      {
        title: 'Application and cure',
        detail:
          'Material is applied and left to cure for the period the data sheet requires before traffic returns. Returning equipment early is the most common cause of early failure.',
      },
      {
        title: 'Handover',
        detail:
          'The completed layout is handed over with an as-executed drawing and the material records.',
      },
    ],
    qualityChecks: [
      'Substrate assessed for coating, contamination and moisture before work begins.',
      'Surface preparation completed along the marking path and verified.',
      'Material system confirmed as compatible with the substrate and any existing coating.',
      'Setting-out approved by the facility before application.',
      'Applied film thickness checked against the data sheet.',
      'Anti-slip additive applied where the marking falls on a walking surface.',
      'Full cure achieved before equipment traffic is allowed to return.',
      'Colour usage checked for consistency against the facility safety standard.',
      'As-executed layout drawing issued at handover.',
    ],
    costFactors: [
      {
        factor: 'Surface preparation required',
        effect:
          'Usually the largest variable. A sealed or coated floor needs mechanical preparation before anything is applied, and skipping it guarantees early failure.',
      },
      {
        factor: 'Available shutdown window',
        effect:
          'The area must be clear during application and cure. A plant that can only release small areas at a time extends the programme considerably.',
      },
      {
        factor: 'Material system',
        effect:
          'Two-component systems cost more than single-pack paint and last longer under forklift traffic. Tape systems cost more upfront but suit layouts that change.',
      },
      {
        factor: 'Layout complexity',
        effect:
          'Equipment footprints, storage bays and symbols take far more time per metre than straight aisle lines.',
      },
      {
        factor: 'Removal of existing marking',
        effect:
          'Re-laying out a plant usually requires removing the old marking, which on a coated floor is careful work.',
      },
      {
        factor: 'Site induction and access requirements',
        effect:
          'Plant induction, permits to work and escorted access reduce productive hours, particularly on short shifts.',
      },
    ],
    projectConsiderations: [
      'Whether the floor is coated, sealed or bare concrete, since this governs both preparation and material selection.',
      'The cure time the material needs and whether the plant can keep the area clear for that long.',
      'Whether the layout is stable or expected to change, which decides between a permanent system and a re-configurable one.',
      'How people actually walk through the plant, as distinct from how the drawing says they should.',
      'The facility’s existing safety colour convention, so that new marking does not contradict what is already there.',
    ],
    commonMistakes: [
      {
        mistake: 'Applying floor marking without preparing a sealed or coated surface',
        consequence:
          'The marking peels under forklift wheels within weeks. The material is blamed, but the preparation was the cause.',
        instead:
          'Mechanically prepare the marking path and confirm compatibility with any existing coating.',
      },
      {
        mistake: 'Returning equipment to the area before the material has fully cured',
        consequence:
          'Tyre marks, lifting and premature wear that cannot be repaired without redoing the section.',
        instead:
          'Plan the shutdown around the full cure time in the data sheet, not just the touch-dry time.',
      },
      {
        mistake: 'Marking walkways that do not match how people actually move',
        consequence:
          'People take their usual route across the vehicle area anyway, and the segregation exists only on the floor.',
        instead:
          'Walk the plant with the operations team and mark the routes people will genuinely use.',
      },
      {
        mistake: 'Using colours inconsistently across areas or over time',
        consequence:
          'A colour stops carrying meaning, which undermines every other marking in the plant.',
        instead:
          'Fix a facility colour convention and apply it consistently in every area and every future phase.',
      },
    ],
    faqs: [
      {
        question: 'What is the best material for industrial floor marking?',
        answer:
          'It depends on the substrate and the traffic. Two-component floor coatings perform well under forklift traffic on properly prepared floors. Single-pack paints cost less and suit lighter traffic. Heavy-duty tape systems suit layouts that change often and areas that cannot be closed long enough for a coating to cure. The substrate assessment should come before the material decision.',
      },
      {
        question: 'How long does the plant area need to be closed?',
        answer:
          'Long enough for preparation, application and full cure. Touch-dry is not the relevant figure — the material data sheet gives a cure time before vehicle traffic, and returning forklifts early is the most common cause of early failure. The requirement should be confirmed for the specific product before the shutdown is planned.',
      },
      {
        question: 'Can floor marking be applied over an existing epoxy coating?',
        answer:
          'Yes, provided the coating is sound and the marking path is mechanically prepared so the new material can key into it. Applying directly onto an unprepared coated floor is the single most common reason industrial floor marking fails early.',
      },
    ],
    standards: [],
    industries: ['industrial', 'logistics-warehousing'],
    relatedServices: ['logistics-parking-marking', 'traffic-signboards'],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'road-studs-cat-eyes',
    name: 'Road Studs & Cat Eyes',
    shortName: 'Road Studs',
    metaTitle: 'Road Stud & Cat Eye Installation Contractor for Highways',
    metaDescription:
      'Road stud and cat eye supply and installation for highways and expressways: stud types, colour convention, spacing, installation method and the causes of premature failure.',
    directAnswer:
      'Road studs, commonly called cat eyes, are retroreflective devices fixed into or onto the carriageway to make lane lines visible at night and in rain, when painted markings lose much of their effectiveness. They supplement markings rather than replace them, and are specified by type, colour and spacing in the project drawing.',
    summary:
      'Road studs earn their place in wet night conditions, where a water film over the carriageway suppresses the retroreflectivity of a painted line but a raised stud stays visible. Almost all premature stud failure traces to installation rather than to the stud: the wrong adhesive, a contaminated or damp socket, or traffic returned before the adhesive had cured.',
    specifications: [
      {
        parameter: 'Stud types',
        value:
          'Surface-mounted, recessed and solar-powered active studs, selected by application and specification',
        basis: 'IRC:35',
      },
      {
        parameter: 'Body material',
        value:
          'Polycarbonate, aluminium or ceramic body with retroreflective lens inserts, per specification',
        basis: 'Project specification',
      },
      {
        parameter: 'Colour convention',
        value:
          'White, yellow, red and green used to convey lane position and direction; the drawing governs',
        basis: 'IRC:35',
      },
      {
        parameter: 'Reflectivity',
        value: 'Coefficient of luminous intensity as specified for the stud class',
        basis: 'EN 1463',
      },
      {
        parameter: 'Spacing',
        value:
          'Set by the drawing and by road geometry, with closer spacing on curves and approaches',
        basis: 'IRC:35',
      },
      {
        parameter: 'Fixing',
        value:
          'Epoxy or bituminous adhesive to the manufacturer’s specification; recessed studs set into a cut socket',
        basis: 'Manufacturer specification',
      },
      {
        parameter: 'Compressive strength',
        value: 'To the class specified, since studs are driven over directly and repeatedly',
        basis: 'EN 1463',
      },
    ],
    applications: [
      'Lane and centre line delineation on highways and expressways',
      'Edge line and shoulder delineation',
      'Curve, merge and diverge delineation where night guidance matters most',
      'Median and central reserve delineation',
      'Toll plaza approach and lane channelisation',
      'Hazard and obstruction approach delineation',
      'Solar stud installation at locations requiring active delineation',
    ],
    executionProcess: [
      {
        title: 'Setting out to the specified spacing',
        detail:
          'Positions are set out from the drawing, with spacing tightened on curves and approaches where the drawing calls for it.',
      },
      {
        title: 'Surface preparation at each position',
        detail:
          'Each position is cleaned to sound, dry surface. Adhesive bonding to dust or moisture is the primary cause of studs being lost within weeks.',
      },
      {
        title: 'Socket cutting for recessed studs',
        detail:
          'Where recessed studs are specified, sockets are cut to the required depth and cleaned of slurry and debris before fixing.',
      },
      {
        title: 'Adhesive application and placement',
        detail:
          'Adhesive is mixed and applied per the manufacturer’s instructions and the stud is seated with the reflective faces correctly oriented to traffic.',
      },
      {
        title: 'Cure before traffic',
        detail:
          'The location is protected until the adhesive reaches the strength the manufacturer specifies. This is the step most often shortened, and it is the one that determines survival.',
      },
      {
        title: 'Inspection',
        detail:
          'Alignment, spacing, orientation and seating are checked along the run, and any stud that is not fully seated is reset rather than left.',
      },
    ],
    qualityChecks: [
      'Stud type, class and colour verified against the specification before installation.',
      'Setting-out and spacing checked against the drawing, including tightened spacing on curves.',
      'Surface at each position confirmed clean and dry before adhesive is applied.',
      'Socket depth and cleanliness verified where recessed studs are used.',
      'Adhesive type, mix and quantity per the manufacturer’s instructions.',
      'Reflective face orientation checked against the direction of travel.',
      'Full seating with no rocking checked stud by stud.',
      'Adhesive cure achieved before traffic is admitted.',
      'Installed positions recorded by chainage for the handover record.',
    ],
    costFactors: [
      {
        factor: 'Stud type and class specified',
        effect:
          'Solar and active studs cost several times more than passive studs, and recessed studs cost more to install than surface-mounted ones.',
      },
      {
        factor: 'Spacing',
        effect:
          'Spacing determines the number of studs per kilometre and therefore drives both material and labour directly.',
      },
      {
        factor: 'Surface-mounted versus recessed installation',
        effect:
          'Recessed installation requires socket cutting and debris removal at every position, which is substantially slower.',
      },
      {
        factor: 'Adhesive system',
        effect:
          'Epoxy systems cost more than bituminous adhesives and perform better, particularly in high-temperature conditions.',
      },
      {
        factor: 'Traffic management and cure time',
        effect:
          'Positions must stay protected while the adhesive cures, which on a live carriageway means longer closure per section.',
      },
      {
        factor: 'Location and access',
        effect:
          'Median and shoulder positions on a live carriageway need more traffic management per stud than lane line positions.',
      },
    ],
    projectConsiderations: [
      'Whether studs are specified as supply-and-install or install-only, since material is the larger part of the cost.',
      'Whether solar studs are required, which brings a different cost base and a maintenance expectation with it.',
      'Surface condition, because studs will not stay on a surface that is itself failing.',
      'Whether the closure allows adhesive to cure before traffic returns, which is a scheduling question, not a materials one.',
      'Maintenance and replacement expectations, since studs are consumable assets on any road with significant traffic.',
    ],
    commonMistakes: [
      {
        mistake: 'Fixing studs to a damp or dusty surface',
        consequence:
          'The adhesive never develops its bond and the studs are pulled out by traffic within weeks, taking the adhesive pad with them.',
        instead:
          'Clean and dry each position immediately before applying adhesive, and stop work in wet conditions.',
      },
      {
        mistake: 'Opening the lane to traffic before the adhesive has cured',
        consequence:
          'Studs are displaced or loosened before they ever carry load, and the failure is spread along the whole section.',
        instead:
          'Plan the closure around the manufacturer’s cure time and protect the run until it is reached.',
      },
      {
        mistake: 'Installing studs on a surface that is already deteriorating',
        consequence:
          'The stud does not fail — the surface beneath it does, and it takes the stud with it.',
        instead:
          'Address surface defects before installing studs, or accept and state a reduced service expectation.',
      },
      {
        mistake: 'Orienting reflective faces without checking the direction of travel',
        consequence:
          'The stud is invisible to the traffic it was installed for, which is a safety failure that a daytime inspection will not reveal.',
        instead:
          'Check orientation against traffic direction during installation and again on night inspection.',
      },
    ],
    faqs: [
      {
        question: 'Do road studs replace road markings?',
        answer:
          'No. They supplement markings. Painted and thermoplastic lines carry the primary information in daylight and dry conditions, while studs maintain delineation at night and in rain, when a water film over the carriageway suppresses the retroreflectivity of a flat marking. Specifications normally require both.',
      },
      {
        question: 'Why do road studs come off the road?',
        answer:
          'Almost always because of installation conditions rather than the stud. The three usual causes are adhesive applied to a damp or dusty surface, traffic admitted before the adhesive cured, and installation onto a pavement surface that is itself failing. All three are avoidable, and all three are decided at site rather than at procurement.',
      },
      {
        question: 'Are solar road studs worth specifying?',
        answer:
          'They cost several times more than passive studs and are worth it where active delineation genuinely improves safety — sharp curves, accident-prone locations, unlit stretches and hazard approaches. Specifying them along an entire uneventful stretch spends the budget where passive studs would have performed adequately. They also introduce a maintenance and replacement expectation that should be planned for.',
      },
      {
        question: 'What spacing should road studs be installed at?',
        answer:
          'The project drawing governs, and spacing is normally tightened on curves, approaches and hazard locations where delineation matters most. Uniform spacing applied along a whole route regardless of geometry misses the point of installing studs at all.',
      },
    ],
    standards: [IRC_35, EN_1463],
    industries: ['highways-expressways', 'smart-cities-urban', 'airports'],
    relatedServices: [
      'highway-expressway-marking',
      'thermoplastic-road-marking',
      'highway-safety-assets',
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'traffic-signboards',
    name: 'Traffic Signboards',
    shortName: 'Traffic Signboards',
    metaTitle: 'Traffic Signboard Supplier & Installation Contractor',
    metaDescription:
      'Traffic signboard fabrication and installation for highways, urban roads and facilities: sign types, retroreflective sheeting classes, foundations, and installation quality.',
    directAnswer:
      'Traffic signboards are the mandatory, cautionary and informatory signs installed along a road to convey regulation, warning and direction. Their effectiveness depends on three things: the retroreflective sheeting class, the mounting position and height, and a foundation adequate for the sign area and local wind loading.',
    summary:
      'A sign only works if a driver can read it in time to act on it. That makes sheeting class, placement and legibility distance the decisions that matter, and they are decided at specification stage. The other half of the job is structural: a large gantry or cantilever sign is a wind-loaded structure, and the foundation has to be designed for it rather than standardised.',
    specifications: [
      {
        parameter: 'Sign categories',
        value: 'Mandatory or regulatory, cautionary or warning, and informatory or directional',
        basis: 'IRC:67',
      },
      {
        parameter: 'Substrate',
        value:
          'Aluminium composite material or aluminium sheet, with thickness selected by sign size and mounting',
        basis: 'IRC:67',
      },
      {
        parameter: 'Retroreflective sheeting',
        value:
          'Class of sheeting specified by road type and sign function; higher classes give greater legibility distance at night',
        basis: 'IRC:67 / ASTM D4956',
      },
      {
        parameter: 'Legend and lettering',
        value: 'Letter height, font and spacing set by required legibility distance and approach speed',
        basis: 'IRC:67',
      },
      {
        parameter: 'Mounting',
        value:
          'Post-mounted, cantilever or overhead gantry, selected by sign area and carriageway configuration',
        basis: 'IRC:67',
      },
      {
        parameter: 'Mounting height and lateral clearance',
        value: 'To the values in the code for the road type and mounting arrangement',
        basis: 'IRC:67',
      },
      {
        parameter: 'Foundation',
        value: 'Designed for sign area, mounting height and local wind loading',
        basis: 'Structural design',
      },
    ],
    applications: [
      'Highway and expressway regulatory, warning and directional signage',
      'Overhead gantry and cantilever directional signage',
      'Chainage, kilometre and location marker signage',
      'Urban and municipal street signage',
      'Toll plaza approach and lane designation signage',
      'Industrial facility, logistics park and campus signage',
      'Work-zone and temporary traffic management signage',
    ],
    executionProcess: [
      {
        title: 'Schedule and location review',
        detail:
          'The sign schedule is reviewed against site conditions, checking sight lines, obstructions and approach visibility at each proposed location.',
      },
      {
        title: 'Fabrication to the approved drawing',
        detail:
          'Boards are fabricated with the specified substrate and sheeting class, and legend layout and letter heights are checked before the sheeting is applied.',
      },
      {
        title: 'Foundation construction',
        detail:
          'Foundations are constructed to the design for the sign area and mounting height, and allowed to gain strength before erection.',
      },
      {
        title: 'Erection and alignment',
        detail:
          'Signs are erected to the specified height and lateral clearance and aligned to face approaching traffic squarely, so the retroreflective return reaches the driver.',
      },
      {
        title: 'Night verification',
        detail:
          'Installed signs are checked after dark under headlights, because a sign that reads correctly in daylight can still be poorly aligned or shadowed at night.',
      },
      {
        title: 'Handover',
        detail:
          'A location-wise schedule of installed signs with sheeting class and material records is issued at handover.',
      },
    ],
    qualityChecks: [
      'Substrate type and thickness verified against the specification.',
      'Retroreflective sheeting class verified against the specification and its batch records retained.',
      'Legend, letter height and layout checked against the approved drawing before fabrication is completed.',
      'Sign location checked for sight line and obstruction before foundation work.',
      'Foundation dimensions and concrete verified against the design.',
      'Mounting height and lateral clearance measured after erection.',
      'Sign face alignment to approaching traffic checked and corrected.',
      'Night-time legibility and retroreflective performance verified under headlights.',
      'Location-wise installed schedule issued at handover.',
    ],
    costFactors: [
      {
        factor: 'Retroreflective sheeting class',
        effect:
          'The single largest material variable. Higher sheeting classes cost considerably more per square metre and are what a night legibility requirement is usually asking for.',
      },
      {
        factor: 'Sign size and substrate',
        effect:
          'Area drives both material and the structural requirement, so a large sign costs more than proportionally.',
      },
      {
        factor: 'Mounting type',
        effect:
          'Post-mounted signs are the base case. Cantilever and overhead gantry structures involve structural design, fabrication and erection plant, and belong in a different cost bracket.',
      },
      {
        factor: 'Foundation requirements',
        effect:
          'Foundation size depends on sign area, height and wind loading, and ground conditions can change it substantially at particular locations.',
      },
      {
        factor: 'Installation access and traffic management',
        effect:
          'Median and overhead installations on a live carriageway need closures and lifting plant that shoulder installations do not.',
      },
      {
        factor: 'Number and dispersion of locations',
        effect:
          'Widely scattered single signs carry mobilisation cost per location that a concentrated package avoids.',
      },
    ],
    projectConsiderations: [
      'The sheeting class actually required for the road type and approach speed, since this is where night performance is decided.',
      'Sight lines at each location, checked on site rather than assumed from a schedule.',
      'Whether overhead or cantilever structures are involved, since they need structural design and erection plant.',
      'Ground conditions at gantry and large-sign locations, which can change foundation cost significantly.',
      'Whether the scope is supply-only, install-only or both, which changes the basis of comparison between quotes.',
    ],
    commonMistakes: [
      {
        mistake: 'Specifying a lower sheeting class to reduce cost',
        consequence:
          'The sign is legible in daylight and inadequate at night, which is precisely when the driver most needs it. The saving is small and the loss is the sign’s purpose.',
        instead:
          'Set the sheeting class from the road type and required legibility distance, and treat it as a safety parameter, not a commercial one.',
      },
      {
        mistake: 'Installing signs without checking approach sight lines on site',
        consequence:
          'Signs end up obscured by vegetation, structures or other signs, and drivers never see them.',
        instead:
          'Verify each location on site against the approach, and relocate where sight lines are compromised.',
      },
      {
        mistake: 'Standardising foundations across all sign sizes',
        consequence:
          'Larger signs are under-founded and move or fail in high wind, while small signs are over-founded and waste money.',
        instead:
          'Design foundations for sign area, mounting height and local wind loading.',
      },
      {
        mistake: 'Skipping the night-time verification after installation',
        consequence:
          'Misaligned signs return far less light to the driver than specified, and the defect is invisible in daylight inspection.',
        instead:
          'Inspect installed signage after dark under headlights and correct alignment.',
      },
    ],
    faqs: [
      {
        question: 'What retroreflective sheeting class should be specified?',
        answer:
          'It follows from the road type, the approach speed and the legibility distance the sign needs to achieve. Higher classes return substantially more light and stay legible from further away at night, which is why highway signage specifies higher classes than a low-speed urban street. The project specification should state the class explicitly, since it is the largest single cost variable and the one that determines night performance.',
      },
      {
        question: 'How long do traffic signboards last?',
        answer:
          'The substrate and structure usually outlast the sheeting. Retroreflective sheeting degrades with ultraviolet exposure and weathering, losing reflective performance gradually while still looking acceptable in daylight. Sheeting classes carry manufacturer performance expectations, and signage should be assessed for night-time retroreflective performance rather than for visible damage.',
      },
      {
        question: 'Do you fabricate signs as well as install them?',
        answer:
          'Signage can be taken as supply-and-install or as installation against boards supplied by the client. Because material is a large share of the cost, the RFQ should state which basis is intended so that quotes are comparable.',
      },
      {
        question: 'What determines the foundation size for a traffic sign?',
        answer:
          'Sign area, mounting height, the mounting arrangement and local wind loading, together with the ground conditions at the location. A large cantilever or gantry sign is a wind-loaded structure and needs a designed foundation. Applying one standard foundation detail to every sign on a project under-founds the large ones and over-founds the small ones.',
      },
    ],
    standards: [IRC_67, MORTH_800],
    industries: [
      'highways-expressways',
      'smart-cities-urban',
      'industrial',
      'logistics-warehousing',
      'airports',
    ],
    relatedServices: [
      'highway-safety-assets',
      'highway-expressway-marking',
      'road-studs-cat-eyes',
    ],
  },

  /* ---------------------------------------------------------------------- */
  {
    slug: 'highway-safety-assets',
    name: 'Highway Safety Assets',
    shortName: 'Safety Assets',
    metaTitle: 'Highway Safety Asset Contractor | Delineators, Barriers & Road Furniture',
    metaDescription:
      'Highway safety asset supply and installation: delineators, hazard markers, crash barriers, kerb marking and road furniture executed alongside marking and signage scope.',
    directAnswer:
      'Highway safety assets are the physical road furniture that supports safe operation alongside markings and signage: delineators and hazard markers, guard rails and crash barriers, kerb marking, reflective devices and object markers. They are usually specified together with marking and signage in the same safety package.',
    summary:
      'On most highway packages, markings, studs, signage and safety furniture are separate BOQ sections executed by one specialist. Consolidating them removes the coordination overhead of appointing several vendors for one safety scope, and it means the delineation is designed as one system — the studs, the signage and the delineators giving the driver a consistent picture rather than three different ones.',
    specifications: [
      {
        parameter: 'Asset categories',
        value:
          'Delineators, hazard markers, object markers, guard rails and crash barriers, kerb marking and reflective road furniture',
        basis: 'IRC:35 / IRC:67 / MoRTH Section 800',
      },
      {
        parameter: 'Delineator specification',
        value: 'Post type, height and retroreflective element as specified for the road type',
        basis: 'IRC:35',
      },
      {
        parameter: 'Barrier systems',
        value:
          'Type, containment level and installation detail per the project specification and structural design',
        basis: 'MoRTH Section 800',
      },
      {
        parameter: 'Kerb and edge marking',
        value: 'Reflective kerb marking where specified at medians, islands and structures',
        basis: 'IRC:35',
      },
      {
        parameter: 'Placement',
        value:
          'Spacing and lateral placement per the drawing, tightened at curves, hazards and structures',
        basis: 'IRC:35',
      },
    ],
    applications: [
      'Delineator and hazard marker installation on highways and expressways',
      'Object markers at structures, culverts and obstructions',
      'Guard rail and crash barrier installation where specified',
      'Median, island and structure kerb marking',
      'Reflective road furniture on curves and hazard approaches',
      'Toll plaza safety furniture',
      'Combined safety packages executed with marking, studs and signage',
    ],
    executionProcess: [
      {
        title: 'Scope consolidation review',
        detail:
          'Where markings, studs, signage and furniture are in one package, they are reviewed together so that delineation is consistent along the route rather than assembled piecemeal.',
      },
      {
        title: 'Location survey',
        detail:
          'Positions are surveyed against the drawing, with hazard locations, structures and curves checked individually.',
      },
      {
        title: 'Foundation and fixing works',
        detail:
          'Foundations and fixings are constructed to the specified detail for each asset type and location.',
      },
      {
        title: 'Installation',
        detail:
          'Assets are installed to the specified spacing, height and alignment, with reflective elements oriented to approaching traffic.',
      },
      {
        title: 'Inspection including night check',
        detail:
          'Placement and alignment are inspected, and reflective performance is verified after dark along the route.',
      },
      {
        title: 'Handover documentation',
        detail:
          'A location-wise asset schedule with material records and photographs is issued at handover.',
      },
    ],
    qualityChecks: [
      'Asset type and specification verified against the BOQ and drawing.',
      'Locations surveyed and confirmed, with hazard and curve locations reviewed individually.',
      'Foundation and fixing details verified against the specified detail.',
      'Installed height, spacing and lateral placement measured against the drawing.',
      'Retroreflective element orientation checked against the direction of travel.',
      'Night-time verification of delineation continuity along the route.',
      'Location-wise asset schedule issued at handover.',
    ],
    costFactors: [
      {
        factor: 'Asset mix in the package',
        effect:
          'Barrier systems are in a different cost bracket from delineators and markers, so the mix matters more than the total count.',
      },
      {
        factor: 'Foundation and fixing requirements',
        effect:
          'Assets requiring excavation and concrete foundations cost considerably more to install than surface-fixed items.',
      },
      {
        factor: 'Location dispersion',
        effect:
          'Assets scattered along a long route carry per-location mobilisation and traffic management cost that a concentrated installation avoids.',
      },
      {
        factor: 'Traffic management',
        effect:
          'Median and shoulder work on a live carriageway needs closures, and this is often the larger part of the installation cost.',
      },
      {
        factor: 'Package consolidation',
        effect:
          'Executing markings, studs, signage and furniture under one scope reduces repeated mobilisation and closure for the same stretch.',
      },
    ],
    projectConsiderations: [
      'Whether the safety scope is packaged together or split between vendors, since splitting it multiplies mobilisation and closures on the same stretch.',
      'Whether barrier systems are included, as these carry structural design and installation requirements distinct from the rest of the scope.',
      'Ground conditions at foundation locations along the route.',
      'Whether the delineation is designed as one system, so that studs, delineators and signage give the driver a consistent picture.',
      'Maintenance and replacement expectations, particularly for assets exposed to vehicle impact.',
    ],
    commonMistakes: [
      {
        mistake: 'Awarding markings, studs, signage and furniture to separate vendors',
        consequence:
          'The same stretch is mobilised and closed repeatedly, coordination overhead lands on the main contractor, and the delineation ends up inconsistent along the route.',
        instead:
          'Package the safety scope together where the BOQ allows it, and treat delineation as one system.',
      },
      {
        mistake: 'Installing delineators at uniform spacing regardless of geometry',
        consequence:
          'Curves and hazard approaches are under-delineated at exactly the locations where guidance matters most.',
        instead:
          'Follow the drawing and tighten spacing at curves, hazards and structures.',
      },
      {
        mistake: 'Skipping night verification of the completed route',
        consequence:
          'Gaps and misaligned reflective elements go unnoticed, because they are invisible during a daylight inspection.',
        instead:
          'Drive the completed route after dark and verify that delineation is continuous and correctly oriented.',
      },
    ],
    faqs: [
      {
        question: 'Can markings, road studs, signage and safety furniture be executed under one contract?',
        answer:
          'Yes, and on most highway packages this is the sensible arrangement. These items are usually separate BOQ sections but the same specialist scope, executed on the same stretch under the same closures. Consolidating them removes repeated mobilisation, reduces the coordination load on the main contractor, and produces delineation that is consistent along the route.',
      },
      {
        question: 'What is included in a highway safety asset scope?',
        answer:
          'It varies by project, but typically delineators and hazard markers, object markers at structures and obstructions, kerb and median marking, reflective road furniture, and in many packages guard rails and crash barriers. The BOQ defines the actual scope, and barrier systems in particular should be confirmed early because they carry structural requirements the rest of the scope does not.',
      },
      {
        question: 'How is safety asset work priced?',
        answer:
          'Normally per unit installed by asset type, with foundations and traffic management priced separately or stated as included. Because installation cost varies far more than material cost across asset types, a per-unit rate should always be read alongside what it includes — particularly foundations and closure arrangements.',
      },
    ],
    standards: [IRC_35, IRC_67, MORTH_800],
    industries: ['highways-expressways', 'smart-cities-urban', 'airports'],
    relatedServices: [
      'road-studs-cat-eyes',
      'traffic-signboards',
      'highway-expressway-marking',
    ],
  },
] as const;

export const servicesBySlug: ReadonlyMap<ServiceSlug, Service> = new Map(
  services.map((s) => [s.slug, s]),
);

export function getService(slug: string): Service | undefined {
  return servicesBySlug.get(slug as ServiceSlug);
}
