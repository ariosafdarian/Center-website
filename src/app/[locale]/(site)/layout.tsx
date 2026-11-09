import type { ReactNode } from 'react';
import { initLocale } from '@/lib/page';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  return (
    <>
      <Header locale={locale} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
