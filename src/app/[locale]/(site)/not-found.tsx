import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { contactHref } from '@/lib/links';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <section aria-labelledby="nf-title">
      <h1 id="nf-title">{t('title')}</h1>
      <p>{t('body')}</p>
      <ul>
        <li>
          <Link href="/">{t('home')}</Link>
        </li>
        <li>
          <Link href={contactHref('other')}>{t('form')}</Link>
        </li>
      </ul>
    </section>
  );
}
