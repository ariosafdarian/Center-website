import { getTranslations } from 'next-intl/server';
import { Cta } from '@/components/ui/Cta';
import { getPath } from '@/content/paths';
import type { Locale } from '@/i18n/routing';

/** Closing CTA before the footer on every page except /contact. */
export async function FinalCta({ locale }: { locale: Locale }) {
  const t = await getTranslations('finalCta');
  return (
    <section aria-labelledby="final-cta-title" data-final-cta>
      <h2 id="final-cta-title">{t('title')}</h2>
      <Cta path="org">{getPath('org').cta![locale]}</Cta>
    </section>
  );
}
