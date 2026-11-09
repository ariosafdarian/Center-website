import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { model } from '@/content/model';
import { paths } from '@/content/paths';
import { spaces } from '@/content/spaces';
import { activities } from '@/content/activities';
import { network } from '@/content/network';
import { faq } from '@/content/faq';
import type { EventItem } from '@/content/schema';
import { localizeDigits, formatEventDate, formatEventDateAlt } from '@/lib/format';
import { Cta } from '@/components/ui/Cta';
import { Pending } from '@/components/ui/Pending';

type P = { locale: Locale; level?: 2 | 3 };

/** Real numbers only (RFP): 42 activities, 7 domains, 3 spaces, 7 rings. */
export async function Glance({ locale }: P) {
  const t = await getTranslations('home.glance');
  const items = [
    [model.data.activitiesCount, t('activities')],
    [model.data.domainsCount, t('domains')],
    [spaces.data.length, t('spaces')],
    [network.data.length, t('rings')],
  ] as const;
  return (
    <dl>
      {items.map(([n, label]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{localizeDigits(n, locale)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Gap({ locale }: P) {
  const g = model.data.gap;
  return (
    <figure>
      <ul>
        {g.groups.map((x) => (
          <li key={x.key}>{x.title[locale]}</li>
        ))}
      </ul>
      <figcaption>{g.core[locale]}</figcaption>
    </figure>
  );
}

export function ModelSteps({ locale, level = 3 }: P) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <ol>
      {model.data.steps.map((s) => (
        <li key={s.key}>
          <H>{s.title[locale]}</H>
          <p>{s.body[locale]}</p>
        </li>
      ))}
    </ol>
  );
}

export function Contract({ locale }: P) {
  return <p>{model.data.contract[locale]}</p>;
}

export function PathsList({ locale, level = 3 }: P) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <ul>
      {paths.data
        .filter((p) => p.cta)
        .map((p) => (
          <li key={p.key}>
            <H>{p.label[locale]}</H>
            <p>{p.audience[locale]}</p>
            <Cta path={p.key}>{p.cta![locale]}</Cta>
          </li>
        ))}
    </ul>
  );
}

export async function SpacesList({ locale, level = 3 }: P) {
  const t = await getTranslations('spaces');
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <ol>
      {spaces.data.map((s) => (
        <li key={s.key} id={s.key}>
          <H>{s.title[locale]}</H>
          <p>
            {t('layer', { n: localizeDigits(s.layer, locale) })} · {t('access')}: {s.access[locale]}
          </p>
          {s.components.length ? (
            <ul>
              {s.components.map((c) => (
                <li key={c.en}>{c[locale]}</li>
              ))}
            </ul>
          ) : (
            <Pending />
          )}
        </li>
      ))}
    </ol>
  );
}

export async function DomainsList({ locale, level = 3, withActivities = false }: P & { withActivities?: boolean }) {
  const t = await getTranslations('services');
  const H = level === 2 ? 'h2' : 'h3';
  const pending = activities.data.activities.length === 0;
  return (
    <>
      <ol>
        {activities.data.domains.map((d) => {
          const list = activities.data.activities.filter((a) => a.domain === d.key);
          return (
            <li key={d.key} id={d.key}>
              <H>{d.title[locale]}</H>
              {withActivities && list.length ? (
                <>
                  <p>{localizeDigits(t('activities', { count: list.length }), locale)}</p>
                  <ul>
                    {list.map((a) => (
                      <li key={a.id} data-audiences={a.audiences.join(' ')}>
                        <strong>{a.title[locale]}</strong> {a.summary[locale]}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
      {withActivities && pending ? <Pending /> : null}
    </>
  );
}

export function NetworkList({ locale }: P) {
  return (
    <ol>
      {network.data.map((r) => (
        <li key={r.key} data-source={r.source}>
          {r.title[locale]}
          {r.summary ? <p>{r.summary[locale]}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export async function EventsList({ locale, items, level = 3 }: P & { items: EventItem[] }) {
  const t = await getTranslations('events');
  const H = level === 2 ? 'h2' : 'h3';
  if (!items.length) return <p>{t('empty')}</p>;
  return (
    <ul>
      {items.map((e) => (
        <li key={e.slug} id={e.slug} data-audiences={e.audiences.join(' ')}>
          <article aria-labelledby={`ev-${e.slug}`}>
            <H id={`ev-${e.slug}`}>{e.title[locale]}</H>
            <p>
              <time dateTime={e.start}>{formatEventDate(e.start, locale)}</time>
              <br />
              <small>{formatEventDateAlt(e.start, locale)}</small>
            </p>
            {e.summary ? <p>{e.summary[locale]}</p> : null}
            <p>
              {t('audiences')}: {e.audiences.map((a) => paths.data.find((p) => p.key === a)!.label[locale]).join(locale === 'fa' ? '، ' : ', ')}
            </p>
            <Cta path="other" topic="event" event={e.slug}>
              {t('register')}
            </Cta>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ locale }: P) {
  if (!faq.data.length) return <Pending />;
  return (
    <div>
      {faq.data.map((f) => (
        <details key={f.id}>
          <summary>{f.q[locale]}</summary>
          <p>{f.a[locale]}</p>
        </details>
      ))}
    </div>
  );
}

export function ReadMore({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p>
      <Link href={href}>{children}</Link>
    </p>
  );
}
