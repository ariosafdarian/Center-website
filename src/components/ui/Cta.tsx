import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { contactHref } from '@/lib/links';
import type { PathKey } from '@/content/schema';

/** A call to action. Always targets /contact?path=<key> (RFP § "قاعدهٔ CTAها"). */
export function Cta({
  path,
  topic,
  event,
  children,
  variant = 'primary',
}: {
  path: PathKey;
  topic?: string;
  event?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link href={contactHref(path, { topic, event })} data-cta={variant} data-path={path}>
      {children}
    </Link>
  );
}
