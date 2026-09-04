'use client';

import { useRef, useTransition } from 'react';
import { moveStageAction } from '@/app/admin/actions';
import { PIPELINE_STAGES, STAGE_LABELS, type PipelineStage } from '@/lib/crm/types';

/**
 * Stage control.
 *
 * A select rather than drag-and-drop: it works with a keyboard, works on a
 * phone, and is legible to a screen reader. The board is read far more often
 * than it is rearranged.
 */
export function StageMover({
  companyId,
  current,
  label = 'Move to',
}: {
  companyId: string;
  current: PipelineStage;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const id = `stage-${companyId}`;

  return (
    <form ref={formRef} action={moveStageAction}>
      <input type="hidden" name="companyId" value={companyId} />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name="stage"
        defaultValue={current}
        disabled={pending}
        onChange={() => startTransition(() => formRef.current?.requestSubmit())}
        className="w-full rounded-card border border-paper-300 bg-white px-2 py-1.5 text-xs text-ink-800 focus:border-technical-600 focus:ring-1 focus:ring-technical-600 focus:outline-none disabled:opacity-60"
      >
        {PIPELINE_STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {STAGE_LABELS[stage]}
          </option>
        ))}
      </select>
      <noscript>
        <button
          type="submit"
          className="mt-1.5 w-full rounded-card border border-paper-300 px-2 py-1 text-xs"
        >
          Move
        </button>
      </noscript>
    </form>
  );
}
