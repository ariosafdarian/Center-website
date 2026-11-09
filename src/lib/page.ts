import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing, prefixOf, type Locale } from '@/i18n/routing';

/** Validate the [locale] param and enable static rendering for this request. */
export async function initLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

export type PageKey = 'home' | 'about' | 'services' | 'spaces' | 'events' | 'join' | 'contact';
export const PAGE_PATHS: Record<PageKey, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  spaces: '/spaces',
  events: '/events',
  join: '/join',
  contact: '/contact',
};

const localized = (locale: Locale, path: string) => `${prefixOf(locale)}${path === '/' && locale !== 'fa' ? '' : path}` || '/';

/** Title, description, canonical and hreflang alternates. Full OG/Twitter in stage 3. */
export async function pageMetadata(params: Promise<{ locale: string }>, key: PageKey): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (hasLocale(routing.locales, raw) ? raw : routing.defaultLocale) as Locale;
  const t = await getTranslations({ locale });
  const path = PAGE_PATHS[key];
  const name = t('meta.titleTemplate', { page: t(`pages.${key}`) });
  return {
    title: key === 'home' ? name.split(' | ')[1] : name,
    description: t('meta.description'),
    alternates: {
      canonical: localized(locale, path),
      languages: { fa: localized('fa', path), en: localized('en', path), 'x-default': localized('fa', path) },
    },
  };
}
