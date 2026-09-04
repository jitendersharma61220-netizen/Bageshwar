# 06 — CRM pipeline

Built internally rather than on third-party SaaS, because the pipeline has to
hold account intelligence, deck versions, tender analysis and estimation
together, and no off-the-shelf CRM models that combination well.

## Stages

```
TARGET
  └─> RESEARCHED
        └─> DECISION MAKER FOUND
              └─> PERSONALIZED
                    └─> CONTACTED
                          └─> REPLIED
                                └─> MEETING
                                      └─> RFQ
                                            └─> QUOTATION
                                                  └─> NEGOTIATION
                                                        ├─> WON
                                                        └─> LOST
                                                              └─> NURTURE
```

`NURTURE` is reachable from any stage, not only from `LOST`. Most accounts that
go quiet are timing problems, not fit problems.

## Stage definitions and exit criteria

| Stage | Means | Exits when |
| --- | --- | --- |
| `target` | Identified as potentially relevant | Research agent has produced an account record |
| `researched` | Company, projects and footprint documented with sources | An opportunity is scored and a service match identified |
| `decision_maker_found` | At least one relevant role identified from a public professional source | An account brief exists |
| `personalized` | Account brief and draft outreach prepared | Founder approves the outreach |
| `contacted` | Approved outreach sent | Any reply arrives, or the follow-up sequence completes |
| `replied` | They responded | A meeting is booked, or they decline |
| `meeting` | Meeting held or scheduled | An RFQ is issued, or it is parked |
| `rfq` | They have asked us to price something | An estimate is prepared |
| `quotation` | Quotation issued (human-approved) | They respond commercially |
| `negotiation` | Commercial discussion under way | Award or loss |
| `won` | Awarded | Moves to project execution |
| `lost` | Not awarded | Loss reason captured; usually to `nurture` |
| `nurture` | Not now | A future follow-up date is set |

## Fields shown on every account

| Field | Source |
| --- | --- |
| Next action | Follow-up agent recommendation, founder-editable |
| Last contact | Most recent `outreach_messages.sent_at` |
| Last response | Most recent inbound message |
| Days since contact | Computed |
| Opportunity value | `opportunities.estimated_value`, when known |
| Service | Matched service |
| Project | Their project driving the opportunity |
| Decision maker | Primary contact |
| Deck sent | Latest approved `deck_version` |
| RFQ status | Linked BOQ / estimate / quote state |
| Account score | With the component breakdown, not just the total |

## Stage transition rules

1. **No agent moves an account into `contacted`, `quotation`, `won` or `lost`.**
   Those transitions follow real-world events and are recorded by a human.
2. **`personalized` → `contacted` requires an approval record.** The outreach
   message must carry `approved_by` and `approved_at` before `sent_at` can be set.
3. **Backwards transitions are allowed and logged.** Accounts genuinely move
   backwards, and a pipeline that forbids it just becomes inaccurate.
4. **Every transition writes to `ai_audit_log`** with actor, timestamp and
   reason.

## Next-action rules (Follow-up agent)

| Situation | Recommended action |
| --- | --- |
| Contacted, no reply, < 5 working days | Wait |
| Contacted, no reply, 5–7 working days | First follow-up, new angle — not a bump |
| Contacted, no reply, after two follow-ups | Move to `nurture`, set a date |
| Positive reply | Draft response, propose a meeting |
| Meeting booked | Generate a meeting brief |
| RFQ received | Move to estimation, flag missing scope information |
| Quotation issued, no response, 7 days | Follow up on the quotation |
| Lost | Capture the reason, set a nurture date |
| Nurture date reached | Re-research the account before contacting again |

The rules are deliberately conservative. Two follow-ups then nurture, not six.
An account is a long-term relationship in this industry, and burning it for a
short-term response rate is a bad trade.

## What the founder sees

The Founder Command Center (Iteration 4) surfaces:

**Top cards** — qualified accounts, new opportunities, decision makers, outreach
due, replies, meetings, RFQs, pipeline value, wins, AI visibility.

**Sections** — today's actions; new opportunities; high-priority accounts;
follow-ups due; tender opportunities; open RFQs; AI recommendations awaiting
approval; search and AEO performance.

**Account detail** — company, their projects, why they are relevant, decision
makers, the evidence behind every claim, relevant services, relevant portfolio,
the suggested deck, the drafted outreach, pipeline status and next action.

Every AI-derived statement in that view is labelled with its claim status and
links to its sources. The founder should never have to wonder whether something
on the screen is established or inferred.
