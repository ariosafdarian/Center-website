import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { ContactInfo, contactFormProps } from './shared';
import { ContactForm } from '@/components/forms/ContactForm';
import { FaqList } from '@/components/sections/blocks';
import { Section } from '@/components/ui/Section';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'contact');

export default async function Contact({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations();
  return (
    <>
      <h1>{t('pages.contact')}</h1>
      <ContactForm {...contactFormProps(locale)} />
      <ContactInfo locale={locale} />
      <Section id="faq" title={t('contact.faqTitle')}>
        <FaqList locale={locale} />
      </Section>
    </>
  );
}
