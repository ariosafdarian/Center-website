import { initLocale } from '@/lib/page';
import { LabHome } from '@/components/lab/LabHome';

export const metadata = { title: 'Lab G' };

export default async function LabDirectionG({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  return <LabHome dir="g" locale={locale} />;
}
