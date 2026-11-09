'use client';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const ITEMS = ['about', 'services', 'spaces', 'events', 'join', 'contact'] as const;

export function NavLinks() {
  const t = useTranslations();
  const pathname = usePathname();
  return (
    <nav aria-label={t('a11y.mainNav')}>
      <ul>
        {ITEMS.map((k) => {
          const href = `/${k}`;
          const current = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={k}>
              <Link href={href} aria-current={current ? 'page' : undefined}>
                {t(`nav.${k}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
