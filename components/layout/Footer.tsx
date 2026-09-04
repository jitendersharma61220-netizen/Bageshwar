import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Logo } from './Logo';
import { company } from '@/content/company';
import { footerNav } from '@/lib/nav';
import { contactDetails } from '@/lib/site';
import { VerifiedOnly } from '@/components/content/VerifiedOnly';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="band-dark border-t border-graphite-800 bg-graphite-950 text-graphite-400">
      <Container width="wide">
        <div className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-graphite-400">
              {company.capabilityStatement}
            </p>

            <div className="mt-6 space-y-1.5 text-sm">
              <VerifiedOnly fact={company.contact.phone}>
                {(phone) => (
                  <p>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="text-paper-200 hover:text-safety-400"
                    >
                      {phone}
                    </a>
                  </p>
                )}
              </VerifiedOnly>
              <VerifiedOnly fact={company.contact.email}>
                {(email) => (
                  <p>
                    <a
                      href={`mailto:${email}`}
                      className="text-paper-200 hover:text-safety-400"
                    >
                      {email}
                    </a>
                  </p>
                )}
              </VerifiedOnly>
              <VerifiedOnly fact={company.contact.address}>
                {(address) => (
                  <address className="not-italic text-graphite-400">
                    {address}
                    {contactDetails.city ? `, ${contactDetails.city}` : ''}
                    {contactDetails.state ? `, ${contactDetails.state}` : ''}
                    {contactDetails.postalCode ? ` ${contactDetails.postalCode}` : ''}
                  </address>
                )}
              </VerifiedOnly>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="mb-3 text-xs font-semibold tracking-[0.14em] text-paper-50 uppercase">
                  {group.title}
                </h2>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-graphite-400 hover:text-paper-50"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-graphite-800 py-6 text-xs text-graphite-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {company.legalName} All rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">
            {company.positioning} &middot; Operating across India
          </p>
        </div>
      </Container>
    </footer>
  );
}
