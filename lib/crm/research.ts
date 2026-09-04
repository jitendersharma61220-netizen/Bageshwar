import type { ClaimStatus, Downgrade, Source } from '@/lib/ai/claims';
import type { PiiRemoval } from '@/lib/ai/pii';
import type { MarketResearchOutput } from '@/lib/ai/agents/market-research';
import type { OpportunityMatchingOutput } from '@/lib/ai/agents/opportunity-matching';
import type { DecisionMakerOutput } from '@/lib/ai/agents/decision-maker';

/**
 * A stored agent run, as the CRM reads it back.
 *
 * One shape for every agent, because what a reviewer needs to know is the same
 * whichever agent produced the output: which agent and prompt version, which
 * model, what it claimed, what backs it, and what the governance layer had to
 * correct on the way through.
 *
 * The downgrade and removal lists are kept and shown. A run where the model
 * asserted things it could not source, or wrote a contact detail into a note,
 * is exactly the run a human should look at hardest; hiding that would defeat
 * the purpose of catching it.
 */
export interface AgentRunRecord<Output> {
  readonly taskId: string;
  readonly companyId: string;
  readonly agent: string;
  readonly promptVersion: string;
  readonly provider: string;
  readonly model: string;
  readonly output: Output;
  readonly claimStatus: ClaimStatus;
  readonly sources: readonly Source[];
  readonly downgrades: readonly Downgrade[];
  /** Contact details stripped from free text. Empty on a well-behaved run. */
  readonly piiRemovals: readonly PiiRemoval[];
  readonly ranAt: string;
}

export type ResearchRecord = AgentRunRecord<MarketResearchOutput>;
export type ScoreRecord = AgentRunRecord<OpportunityMatchingOutput>;
export type DecisionMakerRecord = AgentRunRecord<DecisionMakerOutput>;
