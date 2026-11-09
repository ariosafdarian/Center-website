import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { paths } from '@/content/paths';
import { Cta } from '@/components/ui/Cta';
import { Pending } from '@/components/ui/Pending';
import { FinalCta } from '@/components/layout/FinalCta';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'join');

// Hash-linked tabs (#org, #talent …) come in stage 2; each path is a section with that id today.
export default async function Join({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations();
  return (
    <>
      <h1>{t('pages.join')}</h1>
      {paths.data
        .filter((p) => p.cta)
        .map((p) => (
          <section key={p.key} id={p.key} aria-labelledby={`${p.key}-title`}>
            <h2 id={`${p.key}-title`}>{p.label[locale]}</h2>
            <p>{p.audience[locale]}</p>
            <Pending />
            <h3>{t('join.gains')}</h3>
            <Pending />
            <h3>{t('join.process')}</h3>
            <Pending />
            <Cta path={p.key}>{p.cta![locale]}</Cta>
          </section>
        ))}
      <FinalCta locale={locale} />
    </>
  );
}
