# Bageshwar Balaji Construction Co.

Highway and infrastructure safety execution — website and, in later iterations,
the AI-native B2B growth and execution system.

## Status

**Iteration 1 — website foundation.** The public website, its content layer, SEO
and AEO foundations, and a working enquiry pipeline. Everything beyond this is
designed in [`docs/`](./docs) and built in later iterations.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in what you need; the site runs without any of it
pnpm dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server on http://localhost:3000 |
| `pnpm build` | Production build; every page is statically generated |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | Strict TypeScript, no emit |
| `pnpm lint` | ESLint |
| `pnpm content:audit` | Report every unverified company fact — the checklist of what still needs evidence |
| `pnpm verify` | typecheck + lint + content audit + build |

## The content layer, and why it matters

Every factual claim about the company — projects, clients, certifications,
machinery, statistics, approvals — lives in [`content/`](./content) as a typed
`Fact<T>` that carries a verification status and a source.

```ts
verified(12, 'Corporate deck, slide 14')  // renders
pending('Project count')                  // never renders as a claim
```

Components read facts through `<VerifiedOnly>`. A fact without evidence cannot
reach the page as an assertion — in development it renders a visible gap marker
so you can see what is missing, and in production it renders nothing at all.

`pnpm content:audit` prints every outstanding gap. That output is the exact list
of what to pull from the corporate presentation.

This exists because the site must never state a client, project, certification
or number the company cannot evidence.

## Documentation

The architecture for the full system lives in [`docs/`](./docs) — information
architecture, SEO/AEO strategy, database schema, CRM pipeline, AI agent design,
and the iteration roadmap.
