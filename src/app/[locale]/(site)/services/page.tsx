import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { FinalCta } from '@/components/layout/FinalCta';
import { DomainsList } from '@/components/sections/blocks';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'services');

// Audience filter and sticky scrollspy nav come in stage 2.
export default async function Services({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations('pages');
  return (
    <>
      <h1>{t('services')}</h1>
      <DomainsList locale={locale} level={2} withActivities />
      <FinalCta locale={locale} />
    </>
  );
}
