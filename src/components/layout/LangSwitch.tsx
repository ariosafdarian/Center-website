'use client';
import NextLink from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { prefixOf, type Locale } from '@/i18n/routing';

/** Opens the same page in the other language (direct link, no redirect). */
export function LangSwitch() {
  const t = useTranslations('lang');
  const locale = useLocale() as Locale;
  const pathname = usePathname(); // without locale prefix, e.g. /about
  const other: Locale = locale === 'fa' ? 'en' : 'fa';
  const href = `${prefixOf(other)}${pathname === '/' && other !== 'fa' ? '' : pathname}` || '/';
  return (
    <NextLink href={href} hrefLang={other} lang={other} aria-label={t('switchLabel')} data-lang-switch>
      {t('switch')}
    </NextLink>
  );
}
