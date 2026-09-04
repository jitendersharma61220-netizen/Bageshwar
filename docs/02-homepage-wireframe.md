# 02 — Homepage wireframe

## Objective

A procurement or project reader arriving cold should be able to decide, within
one screen and one scroll, whether we are worth an enquiry. The page is
therefore ordered by what they need to know, not by what we want to say.

## Band structure

The page alternates dark shell bands and light content bands. The alternation
carries the structure, so section boundaries are legible without decoration.

```
┌──────────────────────────────────────────────────────────┐
│ 1  HERO                                          [dark]  │
│    H1: Highway & Infrastructure Safety Execution Partner │
│    Capability statement (one sentence)                   │
│    [Discuss a Project] [Request a Quote] [Upload BOQ]    │
│    Sidebar: the nine execution capabilities, listed      │
├──────────────────────────────────────────────────────────┤
│ 2  ANSWER BAND                                   [dark]  │
│    What we do │ Who we serve │ Where │ How to engage us  │
│    Four columns of plain crawlable text                  │
├──────────────────────────────────────────────────────────┤
│ 3  CAPABILITIES                                 [light]  │
│    3x3 grid of the nine services → service pages         │
├──────────────────────────────────────────────────────────┤
│ 4  INDUSTRIES                                   [muted]  │
│    Five sector cards → industry pages                    │
├──────────────────────────────────────────────────────────┤
│ 5  PROOF                                         [dark]  │
│    Verified projects, OR the capability statement        │
│    (see "Proof band behaviour" below)                    │
├──────────────────────────────────────────────────────────┤
│ 6  EXECUTION PROCESS                            [light]  │
│    Six numbered stages → /execution-process              │
├──────────────────────────────────────────────────────────┤
│ 7  QUALITY & COMPLIANCE                         [muted]  │
│    Six quality controls → /quality-compliance            │
├──────────────────────────────────────────────────────────┤
│ 8  INSIGHTS TEASER                              [light]  │
│    Three latest articles (hidden while none exist)       │
├──────────────────────────────────────────────────────────┤
│ 9  CONVERSION BAND                             [darker]  │
│    All four CTAs, plus phone and email when verified     │
└──────────────────────────────────────────────────────────┘
```

## Band 1 — Hero

- **H1** is the positioning line, not a slogan.
- One sentence of capability statement, in procurement language.
- Three CTAs, primary first.
- Right column lists all nine capabilities in plain text. A visitor sees the
  full scope before scrolling, and so does a crawler.
- **No photograph is used until real project photography is supplied.** The
  treatment is a technical grid and typography. Stock imagery would
  misrepresent the work, and a generic construction photo is worse than none.
- **No statistics.** No "500+ projects", no counters. Any figure would have to
  come from the verification layer, and none is evidenced yet.

## Band 2 — Answer band

Four short columns answering *what we do*, *who we serve*, *where we operate*
and *how to engage us*. This is deliberately plain prose in a `<dl>`, placed
high in the document, because it is the block most likely to be extracted when
an answer engine is asked what this company does.

## Band 5 — Proof band behaviour

This band has two states, decided by the content layer rather than by an editor:

| Condition | What renders |
| --- | --- |
| One or more publishable projects | Project cards with client, location and summary |
| No publishable projects | The four capability differentiators, plus a link to `/projects` explaining that references are provided directly |

There is no third state. The band never renders invented cards, "coming soon"
tiles, or placeholder imagery. A project is publishable only when its title,
client, location and summary are all verified — a half-populated entry is held
back rather than shown with gaps.

## Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| < 640px | Single column; hero CTAs stack; capability grid one per row |
| 640–1024px | Two-column grids; header collapses to the menu panel |
| > 1024px | Full grid; sticky header; hero splits 7/5 |

## What is deliberately absent

- Hero carousels and autoplaying video
- Animated statistic counters
- Client logo walls (no client has consented to being named)
- Testimonial sliders
- Gradient meshes, glassmorphism, floating particles
- "AI-powered" language anywhere in the visitor-facing copy

The site is the shopfront of an infrastructure execution company. It should read
like one.
