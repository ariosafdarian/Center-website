import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import { model } from '@/content/model';
import { paths } from '@/content/paths';
import { spaces } from '@/content/spaces';
import { activities } from '@/content/activities';
import { network } from '@/content/network';
import { faq } from '@/content/faq';
import { upcomingEvents } from '@/content/events';
import { localizeDigits, eventDateParts } from '@/lib/format';
import { contactHref, eventHref } from '@/lib/links';
import { Emblem } from '@/components/motifs/Emblem';
import { Star, KnotRule } from '@/components/motifs/Knot';
import { ArchFrame } from '@/components/motifs/ArchFrame';
import { GapDiagram, ContractDiagram, NestedArches, RingsDiagram } from '@/components/motifs/Diagrams';
import { Newsletter } from '@/components/forms/Newsletter';
import { Ltr } from '@/components/ui/Ltr';
import { HeroCanvasLoader } from './HeroCanvasLoader';
import { LabMenu } from './LabMenu';

export type Direction = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

const NAV = ['about', 'services', 'spaces', 'events', 'join', 'contact'] as const;

/** Section shell shared by every direction; layout comes from the direction's CSS. */
function Sec({
  id,
  index,
  title,
  locale,
  children,
  tone,
}: {
  id: string;
  index: number;
  title: string;
  locale: Locale;
  children: ReactNode;
  tone?: 'dark' | 'soft';
}) {
  return (
    <section id={id} className={`sec sec--${id}`} data-tone={tone} aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <header className="sec__head">
          <span className="sec__index" aria-hidden="true">
            {localizeDigits(String(index).padStart(2, '0'), locale)}
          </span>
          <h2 id={`${id}-title`} className="sec__title">
            {title}
          </h2>
        </header>
        <div className="sec__body">{children}</div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function LabHome({ dir, locale }: { dir: Direction; locale: Locale }) {
  const t = await getTranslations();
  const s = site.data;
  const slogan = s.slogan.parts.map((p) => p[locale]);
  const events = upcomingEvents(new Date(), 3);
  const pathCards = paths.data.filter((p) => p.cta);
  const activityCount = model.data.activitiesCount;
  const sep = locale === 'fa' ? '، ' : ', ';

  const glance = [
    [model.data.activitiesCount, t('home.glance.activities')],
    [model.data.domainsCount, t('home.glance.domains')],
    [spaces.data.length, t('home.glance.spaces')],
    [network.data.length, t('home.glance.rings')],
  ] as const;

  return (
    <div className="lab" data-dir={dir}>
      <a className="skip-link" href="#main">
        {t('a11y.skip')}
      </a>

      {/* ───────── Header ───────── */}
      <header className="site-header">
        <div className="wrap site-header__inner">
          <Link href="/" className="brand" aria-label={`${s.name.full[locale]} — ${t('a11y.home')}`}>
            <Emblem size={42} />
            <span className="brand__name">
              <span>{s.name.line1[locale]}</span>
              <span>{s.name.line2[locale]}</span>
            </span>
          </Link>
          <nav className="site-nav" aria-label={t('a11y.mainNav')}>
            <ul>
              {NAV.map((k) => (
                <li key={k}>
                  <Link href={`/${k}`}>{t(`nav.${k}`)}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-header__actions">
            <NextLink href="/en" hrefLang="en" lang="en" className="lang-switch" aria-label={t('lang.switchLabel')}>
              EN
            </NextLink>
            <Link href={contactHref('org')} className="btn btn--primary btn--sm" data-cta="primary">
              {t('header.cta')}
            </Link>
            <LabMenu
              label={t('a11y.mainNav')}
              closeLabel={t('a11y.close')}
              items={NAV.map((k) => ({ href: `/${k}`, label: t(`nav.${k}`) }))}
              cta={{ href: '/contact?path=org', label: t('header.cta') }}
            />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {/* ───────── Hero ───────── */}
        <section className="hero" aria-labelledby="hero-title">
          <HeroCanvasLoader className="hero__canvas" />
          <div className="hero__veil" aria-hidden="true" />
          <div className="wrap hero__inner">
            <p className="hero__eyebrow">
              <Star size={12} /> {s.name.full[locale]}
            </p>
            <h1 id="hero-title" className="hero__title">
              {slogan.map((part, i) => (
                <span key={i} className={`hero__line hero__line--${i + 1}`}>
                  {part}
                  {i < slogan.length - 1 ? (locale === 'fa' ? '،' : '.') : '.'}
                </span>
              ))}
            </h1>
            <p className="hero__lede">{model.data.message[locale]}</p>
            <div className="hero__actions">
              <Link href={contactHref('org')} className="btn btn--primary" data-cta="primary">
                {t('home.ctaPrimary')}
                <Arrow />
              </Link>
              <Link href="/join" className="link-arrow">
                {t('home.ctaSecondary')}
                <Arrow />
              </Link>
            </div>
          </div>
          <div className="wrap hero__glance">
            <dl className="glance">
              {glance.map(([n, label]) => (
                <div key={label} className="glance__item">
                  <dt>{label}</dt>
                  <dd>{localizeDigits(n, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ───────── Gap ───────── */}
        <Sec id="gap" index={1} title={t('home.gapTitle')} locale={locale}>
          <div className="gap">
            <GapDiagram groups={model.data.gap.groups} core={model.data.gap.core} locale={locale} />
            <ul className="gap__list">
              {model.data.gap.groups.map((g) => (
                <li key={g.key}>
                  <Star size={10} /> {g.title[locale]}
                </li>
              ))}
              <li className="gap__core">
                <Star size={10} /> {model.data.gap.core[locale]}
              </li>
            </ul>
          </div>
        </Sec>

        {/* ───────── Work model ───────── */}
        <Sec id="model" index={2} title={t('home.modelTitle')} locale={locale} tone="soft">
          <ol className="steps">
            {model.data.steps.map((st, i) => (
              <li key={st.key} className="step">
                <span className="step__num" aria-hidden="true">
                  {localizeDigits(i + 1, locale)}
                </span>
                <h3 className="step__title">{st.title[locale]}</h3>
                <p className="step__body">{st.body[locale]}</p>
              </li>
            ))}
          </ol>
          <div className="contract">
            <h3 className="contract__title">{t('home.contractTitle')}</h3>
            <ContractDiagram locale={locale} />
            <p className="contract__body">{model.data.contract[locale]}</p>
          </div>
        </Sec>

        {/* ───────── Paths ───────── */}
        <Sec id="paths" index={3} title={t('home.pathsTitle')} locale={locale}>
          <ul className="paths">
            {pathCards.map((p, i) => (
              <li key={p.key} className={`path path--${p.key}`}>
                <ArchFrame />
                <span className="path__num" aria-hidden="true">
                  {localizeDigits(i + 1, locale)}
                </span>
                <h3 className="path__title">{p.label[locale]}</h3>
                <p className="path__audience">{p.audience[locale]}</p>
                <Link href={contactHref(p.key)} className="link-arrow path__cta" data-cta="secondary">
                  {p.cta![locale]}
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </Sec>

        {/* ───────── Spaces ───────── */}
        <Sec id="spaces" index={4} title={t('home.spacesTitle')} locale={locale} tone="dark">
          <div className="spaces">
            <NestedArches spaces={spaces.data} locale={locale} />
            <ol className="spaces__list">
              {spaces.data.map((sp) => (
                <li key={sp.key} className="space">
                  <span className="space__layer">{t('spaces.layer', { n: localizeDigits(sp.layer, locale) })}</span>
                  <h3 className="space__title">{sp.title[locale]}</h3>
                  <p className="space__access">{sp.access[locale]}</p>
                </li>
              ))}
            </ol>
          </div>
        </Sec>

        {/* ───────── Services ───────── */}
        <Sec id="services" index={5} title={t('home.servicesTitle')} locale={locale}>
          <p className="sec__note">{localizeDigits(t('services.activities', { count: activityCount }), locale)}</p>
          <ol className="domains">
            {activities.data.domains.map((d, i) => (
              <li key={d.key} className="domain">
                <span className="domain__num" aria-hidden="true">
                  {localizeDigits(String(i + 1).padStart(2, '0'), locale)}
                </span>
                <span className="domain__title">{d.title[locale]}</span>
              </li>
            ))}
          </ol>
        </Sec>

        {/* ───────── Network ───────── */}
        <Sec id="network" index={6} title={t('home.networkTitle')} locale={locale} tone="soft">
          <div className="network">
            <RingsDiagram count={network.data.length} />
            <ol className="network__list">
              {network.data.map((r) => (
                <li key={r.key} data-source={r.source}>
                  {r.title[locale]}
                </li>
              ))}
            </ol>
          </div>
          <div className="marquee" aria-hidden="true">
            <div className="marquee__track">
              {[0, 1].map((rep) => (
                <span key={rep} className="marquee__group">
                  {network.data.map((r) => (
                    <span key={r.key} className="marquee__item">
                      {r.title[locale]} <Star size={10} />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
          <p className="pending-note">{t('pending')}</p>
        </Sec>

        {/* ───────── Events ───────── */}
        <Sec id="events" index={7} title={t('home.eventsTitle')} locale={locale}>
          <ul className="events">
            {events.map((e) => {
              const d = eventDateParts(e.start, locale);
              return (
                <li key={e.slug} className="event">
                  <time className="event__date" dateTime={e.start}>
                    <span className="event__day">{d.day}</span>
                    <span className="event__month">{d.month}</span>
                  </time>
                  <div className="event__main">
                    <h3 className="event__title">{e.title[locale]}</h3>
                    <p className="event__meta">
                      {d.weekday}{sep}{d.time} · {t('events.audiences')}{' '}
                      {e.audiences.map((a) => paths.data.find((p) => p.key === a)!.label[locale]).join(sep)}
                    </p>
                  </div>
                  <Link href={eventHref(e.slug)} className="link-arrow event__cta" data-cta="secondary">
                    {t('events.register')}
                    <Arrow />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="sec__more">
            <Link href="/events" className="link-arrow">
              {t('home.eventsAll')}
              <Arrow />
            </Link>
          </p>
        </Sec>

        {/* ───────── FAQ ───────── */}
        <Sec id="faq" index={8} title={t('home.faqTitle')} locale={locale}>
          {faq.data.length ? (
            <div className="faq">
              {faq.data.map((f) => (
                <details key={f.id}>
                  <summary>{f.q[locale]}</summary>
                  <p>{f.a[locale]}</p>
                </details>
              ))}
            </div>
          ) : (
            <p className="pending-note">{t('pending')}</p>
          )}
        </Sec>

        {/* ───────── Final CTA ───────── */}
        <section className="final" aria-labelledby="final-title" data-final-cta>
          <div className="wrap final__inner">
            <KnotRule />
            <h2 id="final-title" className="final__title">
              {t('finalCta.title')}
            </h2>
            <Link href={contactHref('org')} className="btn btn--primary btn--lg" data-cta="primary">
              {paths.data[0]!.cta![locale]}
              <Arrow />
            </Link>
          </div>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer className="site-footer">
        <div className="wrap site-footer__grid">
          <div className="site-footer__brand">
            <Emblem size={48} />
            <p className="brand__name">
              <span>{s.name.line1[locale]}</span>
              <span>{s.name.line2[locale]}</span>
            </p>
            <p className="site-footer__slogan">{t('finalCta.title')}</p>
          </div>
          <div>
            <h2 className="site-footer__h">{t('footer.contactTitle')}</h2>
            <dl className="site-footer__dl">
              <dt>{t('footer.address')}</dt>
              <dd>{s.address[locale]}</dd>
              <dt>{t('footer.phone')}</dt>
              <dd>
                <a href={`tel:${s.phone.e164}`} dir="ltr">
                  {s.phone.display[locale]}
                </a>
              </dd>
              <dt>{t('footer.email')}</dt>
              <dd>
                <a href={`mailto:${s.email}`}>
                  <Ltr>{s.email}</Ltr>
                </a>
              </dd>
              <dt>{t('footer.hours')}</dt>
              <dd>{s.hours[locale]}</dd>
            </dl>
          </div>
          <nav aria-label={t('a11y.footerNav')}>
            <h2 className="site-footer__h">{t('footer.pathsTitle')}</h2>
            <ul className="site-footer__links">
              {pathCards.map((p) => (
                <li key={p.key}>
                  <Link href={`/join#${p.key}`}>{p.label[locale]}</Link>
                </li>
              ))}
            </ul>
            <h2 className="site-footer__h">{t('footer.socials')}</h2>
            <ul className="site-footer__links site-footer__links--inline">
              {s.socials.map((so) => (
                <li key={so.key}>
                  <a href={so.url} rel="noopener noreferrer" target="_blank">
                    {so.label[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-footer__newsletter">
            <Newsletter />
          </div>
        </div>
      </footer>
    </div>
  );
}
