import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing, dirOf } from '@/i18n/routing';
import { initLocale } from '@/lib/page';
import { vazirmatn, inter } from '../fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
    description: t('meta.description'),
    icons: { icon: '/favicon.svg' },
  };
}

/** Only the namespaces client components need are sent to the browser. */
const CLIENT_NAMESPACES = ['form', 'newsletter', 'lang', 'nav', 'a11y'] as const;

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((k) => [k, messages[k]]));
  const t = await getTranslations('a11y');

  return (
    <html lang={locale} dir={dirOf(locale)} className={`${vazirmatn.variable} ${inter.variable}`}>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <a className="skip-link" href="#main">
            {t('skip')}
          </a>
          <Header locale={locale} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
