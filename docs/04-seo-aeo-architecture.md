# 04 — SEO & AEO architecture

## Position

We are competing for a small number of high-value commercial queries against
directory sites and thin contractor pages. The winning move is not volume — it
is being the most genuinely useful page on the internet for each query we
target. A procurement manager scoping thermoplastic marking should find our page
more useful than anything else available, including the standards themselves.

**We do not mass-produce thin pages.** Nine service pages, five industry pages
and a deliberately paced insights programme. Every page has to earn its place.

## Technical foundations (shipped in Iteration 1)

| Item | Implementation |
| --- | --- |
| Clean URL structure | Lowercase, hyphenated, max two levels, stable slugs |
| Crawlable HTML | Static generation; all content in the initial HTML, no client-side content rendering |
| Sitemap | `app/sitemap.ts`, generated from the same content the pages use |
| robots.txt | `app/robots.ts`; `/api/` disallowed, sitemap declared |
| Canonical URLs | `lib/seo.ts` `buildMetadata()`, single origin constant |
| Metadata | Unique title and description per page, from the content layer |
| Open Graph / Twitter | Built alongside canonical in the same function |
| Internal linking | Generated from declared relationships, not hand-maintained |
| Headings | Exactly one `h1` per page; sections use `h2`/`h3` in order |
| Image alt text | Required by the `PortfolioProject` type; an image cannot be added without it |
| Structured data | `lib/schema.ts`, policy below |
| Page speed | Static HTML, self-hosted fonts via `next/font`, zero third-party JS by default |
| Mobile-first | Responsive from 390px up |
| Core Web Vitals | No layout-shifting embeds, no render-blocking third-party requests |
| Search Console | `NEXT_PUBLIC_GSC_VERIFICATION` meta tag |
| Analytics | GA4 via `NEXT_PUBLIC_GA4_MEASUREMENT_ID`; renders nothing when unset |

## Structured data policy

| Schema | Where | Condition |
| --- | --- | --- |
| `Organization` | Sitewide | Always, but **only with evidenced properties**. Unverified phone, email or address are omitted rather than guessed |
| `WebSite` | Sitewide | Always |
| `Service` | Service pages | Always |
| `BreadcrumbList` | All nested pages | Built from the same crumb array the page renders |
| `FAQPage` | Service, industry, quality, insight pages | **Only from FAQs visibly rendered on that page** — enforced by passing the same array to both the component and the schema builder |
| `LocalBusiness` | Nowhere, for now | Withheld until a verified address exists. Emitting it now would be a misrepresentation |

`faqSchema()` returns `null` for an empty array, so an empty FAQ block can never
be emitted.

## Keyword and question architecture

Three tiers, each mapped to a page type and a stage of the buyer's thinking.

### Tier 1 — Vendor selection (service and industry pages)

The commercial queries. High intent, low volume, directly monetisable.

| Query | Target page |
| --- | --- |
| thermoplastic road marking contractor | `/services/thermoplastic-road-marking` |
| highway road marking contractor India | `/services/highway-expressway-marking` |
| road marking company for highway projects | `/industries/highways-expressways` |
| airport runway marking contractor | `/services/runway-taxiway-marking` |
| road stud installation contractor | `/services/road-studs-cat-eyes` |
| industrial floor marking contractor | `/services/industrial-floor-marking` |
| traffic signboard supplier and installer | `/services/traffic-signboards` |
| parking and logistics area marking | `/services/logistics-parking-marking` |
| highway safety asset contractor | `/services/highway-safety-assets` |
| road safety contractor India | `/services` |

### Tier 2 — Specification and technical (insights, Iteration 2)

Queries from engineers and estimators writing or checking a specification.

- Thermoplastic road marking specifications
- Road marking thickness and retroreflectivity requirements
- How retroreflectivity is measured on road markings
- Thermoplastic vs cold-applied road marking paint
- Glass bead specification for road markings
- Road stud types and specifications
- Retroreflective sheeting classes for traffic signs

### Tier 3 — Procurement decision (insights, Iteration 2)

Queries from the person deciding how to buy, not what to buy. Highest
commercial value per visit, because the reader is choosing a vendor category.

- How to select a highway road marking contractor
- Road marking execution process on live highways
- Road marking quality inspection checklist
- Thermoplastic road marking cost factors
- BOQ items for road marking works
- What to include in a road marking RFQ

Each Tier 2 and Tier 3 article declares exactly one primary service and links
back to it. That is the whole internal linking strategy: depth pages feed
commercial pages.

## Answer-first content structure

Every page targeting a question uses the answer-first block sequence defined in
[03](./03-service-page-structure.md): Direct Answer → Key Specifications →
Applications → Execution Process → Quality Checks → Cost Factors → Project
Considerations → Common Mistakes → FAQ → Request Quote.

The **Direct Answer** block is the extraction target. It is placed first,
written as 40–60 words of plain prose, and states the answer without
qualification or marketing. Everything below it is the supporting depth that
earns the citation.

## AI Visibility Tracker

Specified here; built in a later iteration (see [10](./10-roadmap-30-day.md)).

### What it does

Runs a fixed set of commercial queries against each measurable platform on a
schedule, records the result, and reports the change over time.

### Tracked queries

- Best highway road marking contractor in India
- Highway road marking companies
- Thermoplastic road marking contractor
- Airport runway marking contractor
- Road safety contractor India
- Road stud installation contractor
- Industrial floor marking contractor
- Highway safety asset contractor

### Record shape

Stored in `search_visibility` (see [05](./05-database-schema.md)):

| Field | Meaning |
| --- | --- |
| `query` | The query as run |
| `platform` | Google organic, Google AI experience, ChatGPT search, Gemini, Perplexity |
| `checked_at` | Timestamp of the check |
| `brand_mentioned` | Whether we appear at all |
| `brand_position` | Rank or position in the answer, where positional |
| `brand_context` | How we were characterised |
| `competitors` | Competitors named in the same answer |
| `citations` | Sources the answer cited |
| `cited_url` | Which of our URLs, if any, was cited |
| `answer_excerpt` | The relevant passage, for later review |
| `delta_from_previous` | Change since the last check on the same query and platform |

### What we can and cannot promise

**We cannot guarantee inclusion in AI-generated answers, and nobody can.**
Answer engines do not offer placement, their outputs vary between runs, and
their selection criteria are neither published nor stable.

What this system does is measure. It tells us whether visibility is trending up
or down, which pages get cited, how we are being characterised, and who is
being named instead of us. That is a diagnostic instrument for content strategy,
not a placement guarantee, and it should never be described internally or
externally as one.

Platforms are recorded **only where measurement is actually possible**. Where a
platform cannot be measured reliably, it is recorded as unmeasured rather than
estimated.

## Success measures

Traffic is not the metric. These are:

| Metric | Why |
| --- | --- |
| Organic impressions on Tier 1 queries | Are we visible where buyers are looking? |
| Organic clicks on Tier 1 queries | Are we compelling when we appear? |
| AEO query coverage | How many tracked queries mention us at all? |
| AI visibility trend | Direction of travel, per platform |
| Qualified leads from organic | Leads that match our service and scale |
| Lead-to-RFQ conversion | Did the content attract the right reader? |

A page that ranks and produces no qualified enquiry has failed, regardless of
its position.
