import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { site } from '@/content/site';
import { model } from '@/content/model';
import { upcomingEvents } from '@/content/events';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/ui/Section';
import { Cta } from '@/components/ui/Cta';
import { Pending } from '@/components/ui/Pending';
import { FinalCta } from '@/components/layout/FinalCta';
import {
  Glance, Gap, ModelSteps, Contract, PathsList, SpacesList, DomainsList, NetworkList, EventsList, FaqList, ReadMore,
} from '@/components/sections/blocks';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'home');

// Block order is decided in stage 1 (design exploration); all blocks must exist.
export default async function Home({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations('home');
  const slogan = site.data.slogan.parts.map((p) => p[locale]);
  return (
    <>
      <section aria-labelledby="hero-title" data-block="hero">
        <h1 id="hero-title">
          {slogan.map((s, i) => (
            <span key={i}>
              {s}
              {i < slogan.length - 1 ? (locale === 'fa' ? '، ' : '. ') : '.'}
            </span>
          ))}
        </h1>
        <p>{model.data.message[locale]}</p>
        <Pending />
        <p>
          <Cta path="org">{t('ctaPrimary')}</Cta> <Link href="/join">{t('ctaSecondary')}</Link>
        </p>
      </section>

      <Section id="glance" title={t('glanceTitle')}>
        <Glance locale={locale} />
      </Section>

      <Section id="gap" title={t('gapTitle')}>
        <Gap locale={locale} />
      </Section>

      <Section id="model" title={t('modelTitle')}>
        <ModelSteps locale={locale} />
        <h3>{t('contractTitle')}</h3>
        <Contract locale={locale} />
      </Section>

      <Section id="paths" title={t('pathsTitle')}>
        <PathsList locale={locale} />
      </Section>

      <Section id="spaces" title={t('spacesTitle')}>
        <SpacesList locale={locale} />
      </Section>

      <Section id="services" title={t('servicesTitle')}>
        <DomainsList locale={locale} />
      </Section>

      <Section id="network" title={t('networkTitle')}>
        <NetworkList locale={locale} />
      </Section>

      <Section id="events" title={t('eventsTitle')}>
        <EventsList locale={locale} items={upcomingEvents(new Date(), 3)} />
        <ReadMore href="/events">{t('eventsAll')}</ReadMore>
      </Section>

      <Section id="faq" title={t('faqTitle')}>
        <FaqList locale={locale} />
      </Section>

      <FinalCta locale={locale} />
    </>
  );
}
