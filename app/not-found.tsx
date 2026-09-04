import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { services } from '@/content/services';

export default function NotFound() {
  return (
    <Section tone="light" width="narrow" className="py-24">
      <p className="text-xs font-semibold tracking-[0.14em] text-safety-600 uppercase">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Page not found</h1>
      <p className="mt-4 leading-relaxed text-ink-600">
        The page you were looking for does not exist or has moved. The links below
        cover our execution scope, or you can send us your requirement directly.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Discuss a Project
        </ButtonLink>
      </div>

      <div className="mt-12 border-t border-paper-200 pt-8">
        <h2 className="text-sm font-semibold text-ink-900">Services</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="text-sm text-technical-700 underline-offset-4 hover:underline"
              >
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
