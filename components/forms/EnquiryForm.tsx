'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { services } from '@/content/services';
import { industries } from '@/content/industries';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { EnquiryKind } from '@/lib/leads/types';

type FieldErrors = Record<string, string>;

interface Props {
  kind: EnquiryKind;
  /** Preselect a service, e.g. when the form is placed on a service page. */
  defaultServiceSlug?: string;
  submitLabel?: string;
}

const labelClass = 'block text-sm font-medium text-ink-900';
const inputClass =
  'mt-1.5 block w-full rounded-card border border-paper-300 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus:border-technical-600 focus:ring-1 focus:ring-technical-600 focus:outline-none';
const errorClass = 'mt-1.5 text-xs text-danger-600';

export function EnquiryForm({ kind, defaultServiceSlug, submitLabel }: Props) {
  const pathname = usePathname();
  const formId = useId();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const renderedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);

  // Recorded on mount rather than at module load, so it reflects when this
  // visitor actually saw the form.
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === 'sent') successRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setFieldErrors({});
    setMessage('');

    const data = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(data.entries()),
      kind,
      sourcePath: pathname,
      renderedAt: renderedAt.current,
    };

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        reference?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok || !result.ok) {
        setStatus('error');
        setFieldErrors(result.fieldErrors ?? {});
        setMessage(result.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('sent');
      setReference(result.reference ?? null);
    } catch {
      setStatus('error');
      setMessage(
        'We could not reach the server. Please check your connection and try again.',
      );
    }
  }

  if (status === 'sent') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rule-accent bg-paper-100 p-6 focus:outline-none"
      >
        <h2 className="text-lg font-semibold text-ink-900">Enquiry received</h2>
        <p className="mt-2 leading-relaxed text-ink-600">
          Thank you. Your enquiry has reached our team and we will respond with the
          next step. If your requirement is time-critical, please call us directly
          so we can prioritise it.
        </p>
        {reference ? (
          <p className="tabular mt-3 text-xs text-ink-500">
            Reference: <span className="font-medium text-ink-700">{reference}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === 'error' && message ? (
        <div role="alert" className="border border-danger-600/30 bg-danger-600/5 p-4 text-sm text-danger-600">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${formId}-name`}
          name="name"
          label="Your name"
          required
          autoComplete="name"
          error={fieldErrors.name}
        />
        <Field
          id={`${formId}-company`}
          name="company"
          label="Company"
          required
          autoComplete="organization"
          error={fieldErrors.company}
        />
        <Field
          id={`${formId}-email`}
          name="email"
          label="Work email"
          type="email"
          required
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          id={`${formId}-phone`}
          name="phone"
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
          error={fieldErrors.phone}
        />
        <Field
          id={`${formId}-role`}
          name="role"
          label="Your role"
          placeholder="Procurement, Projects, Contracts"
          error={fieldErrors.role}
          className="sm:col-span-2"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-service`} className={labelClass}>
            Service required
          </label>
          <select
            id={`${formId}-service`}
            name="serviceSlug"
            defaultValue={defaultServiceSlug ?? ''}
            className={inputClass}
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-industry`} className={labelClass}>
            Project type
          </label>
          <select
            id={`${formId}-industry`}
            name="industrySlug"
            defaultValue=""
            className={inputClass}
          >
            <option value="">Select a project type</option>
            {industries.map((industry) => (
              <option key={industry.slug} value={industry.slug}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {kind !== 'general' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={`${formId}-project`}
            name="projectName"
            label="Project name or package"
            placeholder="Package number, stretch or facility"
            error={fieldErrors.projectName}
          />
          <Field
            id={`${formId}-location`}
            name="location"
            label="Project location"
            placeholder="State, district or site"
            error={fieldErrors.location}
          />
          <Field
            id={`${formId}-quantity`}
            name="quantity"
            label="Approximate quantity"
            placeholder="Lane-km, sq m, or number of units"
            error={fieldErrors.quantity}
          />
          <Field
            id={`${formId}-timeline`}
            name="timeline"
            label="Required timeline"
            placeholder="Expected start and completion"
            error={fieldErrors.timeline}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor={`${formId}-message`} className={labelClass}>
          {kind === 'boq'
            ? 'Describe the tender or BOQ'
            : kind === 'quote'
              ? 'Scope and requirement'
              : 'How can we help?'}{' '}
          <span className="text-danger-600">*</span>
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          required
          rows={6}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? `${formId}-message-error` : undefined}
          placeholder={
            kind === 'boq'
              ? 'Tender reference, authority, submission deadline, and the marking or safety items in the BOQ.'
              : 'Scope of work, specification, quantities, working windows and anything else that affects execution.'
          }
          className={cn(inputClass, fieldErrors.message && 'border-danger-600')}
        />
        {fieldErrors.message ? (
          <p id={`${formId}-message-error`} className={errorClass}>
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot. Hidden from sight and from assistive technology; a real
          visitor never fills it, so a filled value marks the submission. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          id={`${formId}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending'
            ? 'Sending…'
            : (submitLabel ??
              (kind === 'quote'
                ? 'Request a Quote'
                : kind === 'boq'
                  ? 'Submit Requirement'
                  : 'Send Enquiry'))}
        </Button>
        <p className="text-xs text-ink-500">
          We use your details only to respond to this enquiry.
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = 'text',
  required = false,
  placeholder,
  autoComplete,
  error,
  className,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label} {required ? <span className="text-danger-600">*</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, error && 'border-danger-600')}
      />
      {error ? (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
