import type { z } from 'zod';

/**
 * An agent.
 *
 * `requiresApproval` is the gate that matters. Agents whose effects leave the
 * building — outreach, quotations, bid decisions — declare it, and the runner
 * has no code path that performs the outward action. Sending is a separate,
 * human-triggered operation.
 */
export interface Agent<Input, Output> {
  readonly name: string;
  readonly promptVersion: string;
  readonly inputSchema: z.ZodType<Input>;
  readonly outputSchema: z.ZodType<Output>;
  /** True when a human must approve the output before it can have any effect. */
  readonly requiresApproval: boolean;
  readonly system: string;
  buildPrompt(input: Input): string;
}
