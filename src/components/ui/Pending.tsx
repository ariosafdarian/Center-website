import { getTranslations } from 'next-intl/server';

/** Marks a block whose text arrives with `npm run import:v1`. */
export async function Pending() {
  const t = await getTranslations();
  return <p data-pending="v1">{t('pending')}</p>;
}
