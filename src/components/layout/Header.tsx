import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/content/site';
import type { Locale } from '@/i18n/routing';
import { Emblem } from '@/components/motifs/Emblem';
import { Cta } from '@/components/ui/Cta';
import { NavLinks } from './NavLinks';
import { LangSwitch } from './LangSwitch';

// Mobile full-screen menu (focus trap, Esc) is built in stage 2 with the design system.
export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const name = site.data.name;
  return (
    <header>
      <Link href="/" aria-label={`${name.full[locale]} — ${t('a11y.home')}`} data-brand>
        <Emblem size={40} />
        <span>
          <span>{name.line1[locale]}</span> <span>{name.line2[locale]}</span>
        </span>
      </Link>
      <NavLinks />
      <LangSwitch />
      <Cta path="org">{t('header.cta')}</Cta>
    </header>
  );
}
