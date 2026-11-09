import { initLocale } from '@/lib/page';
import { LabHome } from '@/components/lab/LabHome';

export const metadata = { title: 'Lab C' };

export default async function LabDirectionC({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  return <LabHome dir="c" locale={locale} />;
}
