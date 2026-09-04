import type { ClaimStatus, Downgrade, Source } from '@/lib/ai/claims';
import type { MarketResearchOutput } from '@/lib/ai/agents/market-research';

/**
 * A stored research run, as the CRM reads it back.
 *
 * The downgrade list is kept and shown. A run where the model asserted things
 * it could not source is exactly the run a human should look at hardest, and
 * hiding that would defeat the purpose of catching it.
 */
export interface ResearchRecord {
  readonly taskId: string;
  readonly companyId: string;
  readonly agent: string;
  readonly promptVersion: string;
  readonly provider: string;
  readonly model: string;
  readonly output: MarketResearchOutput;
  readonly claimStatus: ClaimStatus;
  readonly sources: readonly Source[];
  readonly downgrades: readonly Downgrade[];
  readonly ranAt: string;
}
