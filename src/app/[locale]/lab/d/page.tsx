import { initLocale } from '@/lib/page';
import { LabHome } from '@/components/lab/LabHome';

export const metadata = { title: 'Lab D' };

export default async function LabDirectionD({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  return <LabHome dir="d" locale={locale} />;
}
