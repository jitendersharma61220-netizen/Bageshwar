import type { Claim } from '@/lib/ai/claims';
import { CLAIM_LABELS } from '@/lib/ai/claims';
import type { ResearchRecord } from './research';

/**
 * Render a stored research record as text for the scoring agent.
 *
 * The scoring agent is not allowed to research. It assesses what the research
 * agent established, and the only way to hold it to that is to hand it exactly
 * that and nothing else.
 *
 * Two details do the work:
 *
 *   - **Every line carries its claim status.** A value that was downgraded to
 *     "Not established" reads as such, so the scorer cannot quietly treat a
 *     guess as a finding. This is why the status labels are rendered rather
 *     than the raw values.
 *   - **Downgrades are listed explicitly at the end.** A run where the model
 *     asserted things it could not source should score lower on evidence, and
 *     the scorer can only account for that if it is told.
 */

function renderClaim(label: string, claim: Claim<unknown> | undefined): string {
  if (!claim) return `${label}: Not established`;

  const status = CLAIM_LABELS[claim.status];

  if (claim.value === null || claim.value === undefined) {
    return `${label}: Not established${claim.note ? ` — ${claim.note}` : ''}`;
  }

  let value: string;
  if (Array.isArray(claim.value)) {
    if (claim.value.length === 0) {
      value = 'none listed';
    } else if (typeof claim.value[0] === 'string') {
      value = (claim.value as string[]).join(', ');
    } else {
      value = (claim.value as Record<string, unknown>[])
        .map((entry) => {
          const parts = [
            String(entry.name ?? 'unnamed'),
            entry.location ? `at ${String(entry.location)}` : null,
            entry.stage ? `(${String(entry.stage)})` : null,
            entry.scopeSummary ? `— ${String(entry.scopeSummary)}` : null,
            entry.valueIfPublic ? `[reported value: ${String(entry.valueIfPublic)}]` : null,
          ].filter(Boolean);
          return `\n    * ${parts.join(' ')}`;
        })
        .join('');
    }
  } else {
    value = String(claim.value);
  }

  const sources =
    claim.sources.length > 0
      ? ` [sources: ${claim.sources.map((s) => s.url).join(', ')}]`
      : ' [no source]';

  return `${label} (${status}): ${value}${sources}${claim.note ? `\n    note: ${claim.note}` : ''}`;
}

export function renderResearchForScoring(record: ResearchRecord): string {
  const o = record.output;

  const lines = [
    `Researched by ${record.agent}@${record.promptVersion} via ${record.provider}/${record.model} on ${record.ranAt}.`,
    `Overall claim status of the run: ${CLAIM_LABELS[record.claimStatus]}.`,
    ``,
    renderClaim('Company', o.companyName),
    renderClaim('Website', o.website),
    renderClaim('Category', o.category),
    renderClaim('Head office', o.hqLocation),
    renderClaim('Operating regions', o.operatingRegions),
    renderClaim('Current projects', o.currentProjects),
    renderClaim('Upcoming projects', o.upcomingProjects),
    renderClaim('Services they may need from us', o.relevantServices),
    renderClaim('Opportunity type', o.opportunityType),
    renderClaim('Known existing vendors', o.existingVendorInfo),
    renderClaim('Roles worth targeting', o.decisionMakerRoles),
    renderClaim('Summary', o.summary),
  ];

  if (o.openQuestions.length > 0) {
    lines.push(``, `Open questions the researcher could not answer:`);
    for (const question of o.openQuestions) lines.push(`  - ${question}`);
  }

  if (record.downgrades.length > 0) {
    lines.push(
      ``,
      `GOVERNANCE: ${record.downgrades.length} claim(s) in this record were asserted`,
      `as fact with no source and have been downgraded to "Not established":`,
    );
    for (const downgrade of record.downgrades) lines.push(`  - ${downgrade.path}`);
    lines.push(`Treat those as unknown, not as findings.`);
  }

  if (record.piiRemovals.length > 0) {
    lines.push(
      ``,
      `GOVERNANCE: ${record.piiRemovals.length} contact detail(s) were removed from this`,
      `record's free text. Do not attempt to reconstruct them.`,
    );
  }

  return lines.join('\n');
}
