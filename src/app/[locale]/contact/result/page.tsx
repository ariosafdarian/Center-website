import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { initLocale } from '@/lib/page';
import { ID_RE } from '@/lib/id';
import { site } from '@/content/site';
import { ContactInfo } from '../shared';

/**
 * Result of the no-JS form fallback. Users see /contact?status=…; src/proxy.ts
 * rewrites that URL here because the static /contact page cannot read the query
 * without JavaScript. The only dynamic page; not indexed.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ContactResult({ params, searchParams }: Props) {
  const locale = await initLocale(params);
  const q = await searchParams;
  const t = await getTranslations();
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const ok = one(q.status) === 'ok';
  const id = ID_RE.test(one(q.id)) ? one(q.id) : '';
  const newsletter = one(q.form) === 'newsletter';
  const reason = one(q.reason);
  const errorText =
    reason === 'rate' || reason === 'origin' || reason === 'server' ? t(`form.errors.${reason}`) : t('result.invalid');

  return (
    <>
      <section aria-labelledby="result-title" role={ok ? 'status' : 'alert'}>
        <h1 id="result-title">{ok ? t(newsletter ? 'result.newsletterOkTitle' : 'result.okTitle') : t('result.errorTitle')}</h1>
        {ok && id && !newsletter ? <p>{t('form.successId', { id })}</p> : null}
        {ok && !newsletter ? (
          <p>
            {t('form.successPhone')}{' '}
            <a href={`tel:${site.data.phone.e164}`} dir="ltr">
              {site.data.phone.display[locale]}
            </a>
          </p>
        ) : null}
        {!ok ? <p>{errorText}</p> : null}
        <p>
          <Link href="/contact">{ok ? t('form.again') : t('result.back')}</Link>
        </p>
      </section>
      <ContactInfo locale={locale} />
    </>
  );
}
