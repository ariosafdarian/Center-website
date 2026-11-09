import { initLocale } from '@/lib/page';
import { LabHome } from '@/components/lab/LabHome';

export const metadata = { title: 'Lab B' };

export default async function LabDirectionB({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  return <LabHome dir="b" locale={locale} />;
}
