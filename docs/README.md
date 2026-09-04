# Architecture

The design of record for the AI-native growth and execution system. Iteration 1
(the website) is built; everything else is designed here and built in later
iterations.

| # | Document | Covers |
| --- | --- | --- |
| 01 | [Information architecture](./01-information-architecture.md) | Site structure, URL map, internal linking |
| 02 | [Homepage wireframe](./02-homepage-wireframe.md) | Section-by-section homepage |
| 03 | [Service page structure](./03-service-page-structure.md) | The answer-first page template |
| 04 | [SEO & AEO architecture](./04-seo-aeo-architecture.md) | Keyword and question architecture, schema policy, AI visibility tracking |
| 05 | [Database schema](./05-database-schema.md) | Entities, governance columns, RLS |
| 06 | [CRM pipeline](./06-crm-pipeline.md) | Stages, transitions, next-action rules |
| 07 | [AI architecture](./07-ai-architecture.md) | Provider abstraction, the seven agents, claim governance |
| 08 | [Target account workflow](./08-target-account-workflow.md) | Discover to account brief |
| 09 | [Deck workflow](./09-deck-workflow.md) | Master and account-specific decks |
| 10 | [30-day roadmap](./10-roadmap-30-day.md) | Twelve iterations across four weeks |

## The operating rule these documents are written against

Every feature has to answer one question: **does this help us find a project, win
a project, execute a project, or measure a project?** Anything that does not is
deprioritised, however impressive it sounds.

Three further constraints run through all ten documents:

1. **Human-in-the-loop first, automation second, autonomy later.** No agent
   sends, quotes, or decides. Every outward-facing action requires founder
   approval.
2. **Facts require evidence.** AI output is classified as fact, inference,
   recommendation or unknown. A fact without a source is downgraded before it is
   stored — enforced by a database constraint, not by prompting.
3. **Iterate and verify.** Each iteration is tested and its issues fixed before
   the next one starts.
