import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { FinalCta } from '@/components/layout/FinalCta';
import { SpacesList } from '@/components/sections/blocks';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'spaces');

// Nested-arch diagram and the access "steps" interaction come in stages 1–2.
export default async function Spaces({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations('pages');
  return (
    <>
      <h1>{t('spaces')}</h1>
      <SpacesList locale={locale} level={2} />
      <FinalCta locale={locale} />
    </>
  );
}
