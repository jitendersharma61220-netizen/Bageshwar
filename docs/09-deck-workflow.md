# 09 — Deck workflow

## Two layers

**Layer 1 — Master corporate deck.** The canonical set of verified slides:
capabilities, execution, quality, machinery, portfolio, process. Maintained by
the founder. It is the source of every claim any deck can make.

**Layer 2 — Account-specific deck.** A re-selection and re-ordering of Layer 1
slides for one target company.

## The one rule

**An account deck contains no claim that is not already in the master deck.**

It re-selects, re-orders and re-frames existing verified proof. It does not
generate new capabilities, projects, credentials or numbers. The deck engine
operates on a manifest of slide IDs, not on generated content — which means the
constraint is structural rather than a matter of prompt compliance.

```
MASTER DECK (verified slides)
        │
        │  Account Strategist selects, from the account brief:
        │    - which capability slides are relevant
        │    - which portfolio slides speak to this buyer
        │    - which credentials matter to this procurement process
        ▼
SLIDE MANIFEST  (ordered list of existing slide IDs + a cover + a "why this
                 is relevant to you" slide written from the brief)
        │
        ▼
DRAFT DECK  ──►  ►► FOUNDER APPROVAL ◄◄  ──►  SENT
```

## Deck structure

1. Cover — target company named
2. Why this is relevant to you — the only newly written slide, drawn from the account brief
3. Our relevant capabilities
4. Relevant project experience
5. Execution capability
6. Quality & compliance
7. Machinery / technical capability
8. Execution process
9. Why partner with us
10. Contact / next step

Slide 2 is the only slide with new prose, and it is assembled from the account
brief's observations about the target — their projects, their sector, their
likely requirement. It states relevance; it does not make new claims about us.

## Selection logic

| Target profile | Prioritised slides |
| --- | --- |
| Highway / expressway EPC | Highway & expressway markings, road studs, traffic signs, highway safety assets, highway portfolio, live-traffic execution, quality |
| Airport / aviation | Runway & taxiway markings, machinery, FOD and window discipline, quality controls, airfield portfolio |
| Logistics / warehousing | Logistics & parking markings, industrial floor marking, phased execution, yard portfolio |
| Industrial | Industrial floor marking, substrate and cure handling, plant-shutdown working, industrial portfolio |
| Urban / smart city | Urban markings, signage, location-wise execution, municipal portfolio |

Selection comes from the account brief's identified services and industry, so
the deck follows the research rather than a template guess.

## Verification gate

Before a deck can be generated at all, its constituent slides must be verified.
A portfolio slide whose project is not publishable is not eligible for
selection. This is the same gate the website uses, applied to a different
output — which is the point of keeping proof in one content layer.

If the master deck has no verified portfolio slides, the account deck is
generated **without a portfolio section** rather than with placeholders. It
leans on capability, process and quality instead, and says so honestly.

## Approval

The system generates a **draft**. It does not send.

The founder reviews the draft against the account brief, edits or rejects, and
approves. Only an approved `deck_version` can be attached to outreach. Every
version is immutable and recorded with its manifest, so what was sent to whom is
always reconstructable.
