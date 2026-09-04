'use client';

import { useActionState } from 'react';
import { createCompanyAction } from '@/app/admin/actions';
import {
  BOARD_STAGES,
  CATEGORY_LABELS,
  COMPANY_CATEGORIES,
  STAGE_LABELS,
} from '@/lib/crm/types';

const label = 'block text-sm font-medium text-ink-900';
const field =
  'mt-1.5 block w-full rounded-card border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:border-technical-600 focus:ring-1 focus:ring-technical-600 focus:outline-none';

export function NewAccountForm() {
  const [state, formAction, pending] = useActionState(createCompanyAction, {});

  return (
    <form
      action={formAction}
      className="border border-paper-300 bg-paper-50 p-6"
      aria-describedby={state.error ? 'new-account-error' : undefined}
    >
      {state.error ? (
        <p
          id="new-account-error"
          role="alert"
          className="mb-5 border border-danger-600/30 bg-danger-600/5 px-3 py-2 text-sm text-danger-600"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={label}>
            Company name <span className="text-danger-600">*</span>
          </label>
          <input id="name" name="name" required maxLength={200} className={field} />
        </div>

        <div>
          <label htmlFor="category" className={label}>
            Category
          </label>
          <select id="category" name="category" defaultValue="epc" className={field}>
            {COMPANY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="stage" className={label}>
            Stage
          </label>
          <select id="stage" name="stage" defaultValue="target" className={field}>
            {BOARD_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="website" className={label}>
            Website
          </label>
          <input id="website" name="website" type="url" placeholder="https://" className={field} />
        </div>

        <div>
          <label htmlFor="hqLocation" className={label}>
            Head office
          </label>
          <input id="hqLocation" name="hqLocation" placeholder="City, state" className={field} />
        </div>

        <div>
          <label htmlFor="nextAction" className={label}>
            Next action
          </label>
          <input
            id="nextAction"
            name="nextAction"
            placeholder="Identify the procurement contact"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="nextActionDue" className={label}>
            Due
          </label>
          <input id="nextActionDue" name="nextActionDue" type="date" className={field} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="opportunityValue" className={label}>
            Opportunity value (INR)
          </label>
          <input
            id="opportunityValue"
            name="opportunityValue"
            type="number"
            min="0"
            step="1000"
            placeholder="Leave blank if not known"
            className={field}
          />
          <p className="mt-1 text-xs text-ink-500">
            Left blank stays &ldquo;unknown&rdquo; rather than counting as zero in the
            pipeline total.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className={label}>
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} maxLength={4000} className={field} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-card bg-safety-500 px-5 py-2.5 text-sm font-semibold text-graphite-950 hover:bg-safety-400 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Create account'}
        </button>
      </div>
    </form>
  );
}
