import { defineRouting } from 'next-intl/routing';

export const locales = ['fa', 'en'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'fa',
  localePrefix: 'as-needed',
  // The URL alone decides the language: / is always Persian, /en is English.
  // Accept-Language redirects would send Iranian visitors with English-language
  // browsers away from the Persian site. See docs/decisions.md (D7).
  localeDetection: false,
  localeCookie: false,
});

export const dirOf = (locale: Locale) => (locale === 'fa' ? 'rtl' : 'ltr');

/** Path prefix for a locale: '' for fa (root), '/en' for en. */
export const prefixOf = (locale: Locale) => (locale === routing.defaultLocale ? '' : `/${locale}`);
