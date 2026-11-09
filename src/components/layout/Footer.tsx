import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/content/site';
import { paths } from '@/content/paths';
import type { Locale } from '@/i18n/routing';
import { Ltr } from '@/components/ui/Ltr';
import { Newsletter } from '@/components/forms/Newsletter';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations('footer');
  const ta = await getTranslations('a11y');
  const s = site.data;
  return (
    <footer>
      <section aria-labelledby="footer-contact">
        <h2 id="footer-contact">{t('contactTitle')}</h2>
        <dl>
          <dt>{t('address')}</dt>
          <dd>
            <address>{s.address[locale]}</address>
          </dd>
          <dt>{t('phone')}</dt>
          <dd>
            <a href={`tel:${s.phone.e164}`} dir="ltr">
              {s.phone.display[locale]}
            </a>
          </dd>
          <dt>{t('email')}</dt>
          <dd>
            <a href={`mailto:${s.email}`}>
              <Ltr>{s.email}</Ltr>
            </a>
          </dd>
          <dt>{t('hours')}</dt>
          <dd>{s.hours[locale]}</dd>
        </dl>
      </section>

      <nav aria-label={ta('footerNav')}>
        <h2>{t('pathsTitle')}</h2>
        <ul>
          {paths.data
            .filter((p) => p.key !== 'other')
            .map((p) => (
              <li key={p.key}>
                <Link href={`/join#${p.key}`}>{p.label[locale]}</Link>
              </li>
            ))}
        </ul>
        <h2>{t('socials')}</h2>
        <ul>
          {s.socials.map((so) => (
            <li key={so.key}>
              <a href={so.url} rel="noopener noreferrer" target="_blank">
                {so.label[locale]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Newsletter />
    </footer>
  );
}
