/**
 * Portfolio — executed project references.
 *
 * This file is intentionally empty of project entries.
 *
 * The corporate presentation is the source of truth for project references,
 * and it has not yet been supplied. Rather than seed the site with invented,
 * illustrative or "representative" projects, the portfolio starts empty and
 * the pages that display it degrade honestly: the projects index explains what
 * it will contain, and the homepage proof band is replaced by a capability and
 * process statement.
 *
 * To add a project once the deck is available:
 *
 *   1. Copy the template below.
 *   2. Replace each `pending(...)` with `verified(value, 'Corporate deck, slide N')`
 *      for the fields the deck actually supports.
 *   3. Leave every field the deck does not support as `pending(...)`.
 *      A slide with placeholder or incomplete data is not evidence.
 *   4. Place real photographs of the work in public/images/projects/ and
 *      reference them in `images`. Never use stock or generated imagery.
 *   5. Run `pnpm content:audit` to confirm what remains outstanding.
 *
 * A project renders on the site only when its title, client, location and
 * summary are all verified. Partial entries are held back rather than shown
 * with gaps.
 */

import { pending, type PortfolioProject } from './types';

/**
 * Template for a new project entry. Copy this into `portfolioProjects`, give it
 * a stable slug, and replace the pending facts with verified ones as evidence
 * becomes available.
 */
export const PROJECT_TEMPLATE: PortfolioProject = {
  slug: 'project-slug',
  title: pending('Project title'),
  client: pending('Client or awarding authority'),
  location: pending('Project location'),
  year: pending('Year of execution'),
  scope: pending('Scope of work executed'),
  quantities: pending('Executed quantities'),
  services: [],
  industry: 'highways-expressways',
  images: pending('Project photographs'),
  summary: pending('Project summary'),
};

/**
 * Executed projects. Empty until the corporate presentation is supplied.
 */
export const portfolioProjects: readonly PortfolioProject[] = [];

/**
 * A project is publishable only when the facts that identify it are all
 * evidenced. This prevents a half-populated entry from reaching the site with
 * visible gaps where a client name or location should be.
 */
export function isPublishable(project: PortfolioProject): boolean {
  return (
    project.title.verification === 'verified' &&
    project.client.verification === 'verified' &&
    project.location.verification === 'verified' &&
    project.summary.verification === 'verified'
  );
}

export const publishedProjects: readonly PortfolioProject[] =
  portfolioProjects.filter(isPublishable);

export function getProject(slug: string): PortfolioProject | undefined {
  return publishedProjects.find((p) => p.slug === slug);
}
