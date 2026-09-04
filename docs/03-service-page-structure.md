# 03 — Service page structure

## The template

Every service page renders the same sections in the same order. The order is
enforced by the page component (`app/services/[slug]/page.tsx`) composing typed
content from `content/services.ts`, so no page can quietly drop a section or
reorder itself.

```
Breadcrumbs
PageHeader           H1 = service name, standfirst = summary
─────────────────────────────────────────────────────────
DIRECT ANSWER        40-60 words, plain prose, accent rule
KEY SPECIFICATIONS   Table: parameter │ typically specified │ basis
APPLICATIONS         Where the work is used
EXECUTION PROCESS    Numbered stages, site-level detail
QUALITY CHECKS       What is measured and recorded
COST FACTORS         What moves the rate (never prices)
PROJECT CONSIDERATIONS  What to settle before requesting rates
COMMON MISTAKES      Mistake → what happens → do this instead
FAQ                  Visible, expandable, 3-6 questions
STANDARDS REFERENCED With the disclaimer described below
─────────────────────────────────────────────────────────
INLINE QUOTE FORM    Service preselected
CONVERSION BAND      All four CTAs
```

A sticky sidebar carries an on-page nav, the industries the service applies to,
and related services.

## Why this order

It follows the sequence in which a procurement or project reader actually
evaluates a vendor:

1. **Direct answer** — is this even the right thing?
2. **Specifications** — does it match what my contract calls for?
3. **Applications** — have they done this in my context?
4. **Execution process** — will they derail my programme?
5. **Quality checks** — can they prove it was done right?
6. **Cost factors** — what will move my price?
7. **Considerations** — what should I settle before I issue the RFQ?
8. **Mistakes** — what goes wrong, and do they know it?
9. **FAQ** — the leftovers.
10. **Quote** — act.

By the time a reader reaches the form, every question they would have asked on a
first call has been answered. That is the entire point of the structure.

## Editorial rules

**Direct answer.** 40–60 words. States what the thing is, not why we are good at
it. Written so it stands alone if lifted out of the page.

**Specifications.** Every row is written as *what is commonly specified*, with
the standard it derives from in the `basis` column, and every table is
introduced with the note that the governing specification is the one in the
reader's contract. We describe the field; we do not promise a number.

**Cost factors.** Named drivers with their effect. **No prices, ever.** A rate
without a specification, a quantity distribution, a working window and a traffic
management scope is not comparable to anything, and publishing one would invite
exactly the false comparison the section exists to prevent.

**Common mistakes.** Three fields — the mistake, what actually happens, and what
to do instead. This section does more for credibility than any claim we could
make about ourselves, because only someone who has executed the work knows why
beads dropped late sweep away within days.

**FAQ.** Real questions in the reader's words. Answers that concede uncertainty
where it exists ("no honest single figure covers every project") rather than
asserting a number to sound authoritative.

## The standards separation

This is the most important rule in the content model.

| Kind of statement | Where it lives | Example |
| --- | --- | --- |
| What a public standard specifies | `content/services.ts`, plain data | "IRC:35 is the Code of Practice for Road Markings" |
| What this company is certified to | `content/company.ts`, behind `Fact<T>` | "We hold ISO 9001, certificate no. X" |

The two can never blur, because they are different types in different files.
Every service page carrying standards renders the `StandardsList` component,
which states explicitly that listing a standard is not a claim of certification
under it.

## Industry page variant

Industry pages use a reduced version of the same template:

```
DIRECT ANSWER
WHAT YOU ARE ACCOUNTABLE FOR    the buyer's constraints, in their terms
WHAT THE WORK REQUIRES          what the constraint demands of a contractor
SETTLE THESE BEFORE RFQ         decisions that move price or programme
FAQ
─────────────────────────────
Sidebar: relevant services
Inline quote form + conversion band
```

The difference is the point of view. A service page is written from the work
outward; an industry page is written from the buyer's accountability inward.
