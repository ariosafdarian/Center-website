import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { initLocale } from '@/lib/page';
import '@/styles/lab/base.css';
import '@/styles/lab/tokens-a.css';
import '@/styles/lab/tokens-b.css';
import '@/styles/lab/tokens-c.css';
import '@/styles/lab/a.css';
import '@/styles/lab/b.css';
import '@/styles/lab/c.css';
import { LabSwitcher } from '@/components/lab/LabSwitcher';

/**
 * Stage 1 design lab (RFP § "مسیر رسیدن به UI هدف"). Persian only, never
 * indexed, and closed in production builds unless LAB_ENABLED=true.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'fa' }];
}

export default async function LabLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await initLocale(params);
  if (process.env.LAB_ENABLED !== 'true' || locale !== 'fa') notFound();
  return (
    <>
      {children}
      <LabSwitcher />
    </>
  );
}
