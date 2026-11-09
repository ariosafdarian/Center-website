import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { initLocale, pageMetadata } from '@/lib/page';
import { events } from '@/content/events';
import { FinalCta } from '@/components/layout/FinalCta';
import { EventsList } from '@/components/sections/blocks';

type Props = { params: Promise<{ locale: string }> };
export const generateMetadata = ({ params }: Props): Promise<Metadata> => pageMetadata(params, 'events');

// Audience filter comes in stage 2; Event JSON-LD (real events only) in stage 3.
export default async function Events({ params }: Props) {
  const locale = await initLocale(params);
  const t = await getTranslations('pages');
  const list = [...events.data].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <>
      <h1>{t('events')}</h1>
      <EventsList locale={locale} items={list} level={2} />
      <FinalCta locale={locale} />
    </>
  );
}
