# 01 — Information architecture

## Principle

Every page answers one question for one reader, and links to the next question
that reader will have. There are no orphan pages, and no page exists purely to
hold keywords.

The site answers seven questions, in this order, for a procurement or project
reader who has never heard of us:

1. What do we do?
2. Who do we serve?
3. What can we actually execute?
4. Where do we operate?
5. Why should we be trusted?
6. How do we get in touch?
7. How do we send a project or BOQ?

## URL map

```
/                                        Home
/about                                   Company, positioning, scope
/services                                Services hub
  /services/thermoplastic-road-marking
  /services/highway-expressway-marking
  /services/urban-road-marking
  /services/runway-taxiway-marking
  /services/logistics-parking-marking
  /services/industrial-floor-marking
  /services/road-studs-cat-eyes
  /services/traffic-signboards
  /services/highway-safety-assets
/industries                              Industries hub
  /industries/highways-expressways
  /industries/airports
  /industries/logistics-warehousing
  /industries/industrial
  /industries/smart-cities-urban
/projects                                Portfolio index
  /projects/[slug]                       Individual project
/quality-compliance                      QC process, inspection points, standards
/execution-process                       Six-stage execution and documentation
/insights                                Knowledge hub
  /insights/[slug]                       Article
/contact                                 Discuss a project / talk to our team
/request-quote                           Request a quote
/upload-boq                              Submit BOQ / tender
/sitemap.xml
/robots.txt
```

URL rules:

- Lowercase, hyphenated, no trailing slash, no dates, no IDs.
- Slugs are the permanent identity of a page. Once published, a slug does not
  change; if it must, a 301 is added.
- Depth is capped at two levels. Nothing is nested more deeply than
  `/services/[slug]`.

## Linking model

Hub and spoke, with three deliberate loops:

```
                 ┌──────────────┐
                 │     Home     │
                 └──────┬───────┘
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌───────────┐  ┌──────────┐
    │ Services │  │Industries │  │ Projects │
    └────┬─────┘  └─────┬─────┘  └────┬─────┘
         │              │              │
         ▼              ▼              │
    ┌──────────┐   ┌──────────┐        │
    │ Service  │◄─►│ Industry │        │
    │  page    │   │   page   │        │
    └────┬─────┘   └──────────┘        │
         │              ▲              │
         │              └──────────────┘
         ▼
    ┌──────────┐        ┌───────────────────────┐
    │ Insight  │───────►│ Conversion: quote /   │
    │ article  │        │ contact / upload BOQ  │
    └──────────┘        └───────────────────────┘
```

Rules enforced in the content model rather than by editorial habit:

- Each **service** declares the industries it serves and its related services.
  Both render as links, so the graph is generated, not hand-maintained.
- Each **industry** declares the services relevant to it.
- Each **insight** declares exactly one primary service and links back to it.
- Every content page ends with the conversion band, so the four primary calls to
  action are never more than one screen away.

## Page inventory and intent

| Page | Reader | Job |
| --- | --- | --- |
| Home | Anyone, first visit | Answer all seven questions above the decision threshold |
| Service page | Engineer / estimator scoping work | Answer every question they have before issuing an RFQ |
| Industry page | Buyer in that sector | Show we understand their constraint, not just the technique |
| Projects | Anyone assessing credibility | Show evidence — or say plainly that references come on request |
| Quality & compliance | QA / prequalification | Show the process is measured and recorded |
| Execution process | Project manager | Show the work will not derail their programme |
| Insights | Search and answer engines, technical readers | Earn the visit with genuinely useful depth |
| Contact / Quote / BOQ | Ready to act | Remove every obstacle between intent and submission |

## Conversion architecture

Four primary calls to action, present sitewide:

1. **Discuss a Project** → `/contact`
2. **Request a Quote** → `/request-quote`
3. **Upload BOQ / Tender** → `/upload-boq`
4. **Talk to Our Team** → `/contact#team`

Service pages carry an additional inline quote form with the service
preselected, because a reader who has just read a full specification page is the
most likely to convert, and sending them elsewhere loses that.
