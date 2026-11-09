import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/content/site';
import { paths } from '@/content/paths';
import { formOptions } from '@/content/form-options';
import { upcomingEvents } from '@/content/events';
import type { ContactFormProps } from '@/components/forms/ContactForm';
import { Ltr } from '@/components/ui/Ltr';

/** Plain, serializable props for the client form. */
export function contactFormProps(locale: Locale): ContactFormProps {
  const o = formOptions.data;
  const opt = (list: { value: string; label: { fa: string; en: string } }[]) =>
    list.map((x) => ({ value: x.value, label: x.label[locale] }));
  return {
    paths: paths.data.map((p) => ({ key: p.key, label: p.label[locale], audience: p.audience[locale] })),
    options: { area: opt(o.area), size: opt(o.size), support: opt(o.support), topic: opt(o.topic) },
    events: upcomingEvents().map((e) => ({ value: e.slug, label: e.title[locale] })),
    phone: { e164: site.data.phone.e164, display: site.data.phone.display[locale] },
  };
}

export async function ContactInfo({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const s = site.data;
  return (
    <section aria-labelledby="contact-info">
      <h2 id="contact-info">{t('contact.infoTitle')}</h2>
      <dl>
        <dt>{t('footer.address')}</dt>
        <dd>
          <address>{s.address[locale]}</address>
        </dd>
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
    </section>
  );
}
