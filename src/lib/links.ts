import type { PathKey } from '@/content/schema';

/**
 * The only way to build a CTA target (RFP § "قاعدهٔ CTAها"):
 * every CTA goes to /contact?path=<key> (locale prefix added by the Link).
 */
export function contactHref(path: PathKey, extra?: { topic?: string; event?: string }) {
  return {
    pathname: '/contact' as const,
    query: { path, ...(extra?.topic ? { topic: extra.topic } : {}), ...(extra?.event ? { event: extra.event } : {}) },
  };
}

export const eventHref = (slug: string) => contactHref('other', { topic: 'event', event: slug });
