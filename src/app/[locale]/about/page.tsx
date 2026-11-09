import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { model } from '@/content/model';
import { Section } from '@/components/ui/Section';
import { Pending } from '@/components/ui/Pending';
import { FinalCta } from '@/components/layout/FinalCta';
import { NetworkList } from '@/components/sections/blocks';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'about');

export default async function About({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations();
  return (
    <>
      <h1>{t('pages.about')}</h1>
      <Section id="what" title={t('about.what')}>
        <p>{model.data.message[locale]}</p>
        <Pending />
      </Section>
      <Section id="is-not" title={t('about.isNot')}>
        <Pending />
      </Section>
      <Section id="vision" title={t('about.vision')}>
        <Pending />
        <h3>{t('about.future')}</h3>
        <Pending />
      </Section>
      <Section id="mission" title={t('about.mission')}>
        <Pending />
      </Section>
      <Section id="values" title={t('about.values')}>
        <Pending />
      </Section>
      {/* Ring tabs (ARIA Tabs) come in stage 2 */}
      <Section id="network" title={t('about.network')}>
        <NetworkList locale={locale} />
      </Section>
      <FinalCta locale={locale} />
    </>
  );
}
