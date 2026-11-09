import { initLocale } from '@/lib/page';
import { LabHome } from '@/components/lab/LabHome';

export const metadata = { title: 'Lab A' };

export default async function LabDirectionA({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  return <LabHome dir="a" locale={locale} />;
}
