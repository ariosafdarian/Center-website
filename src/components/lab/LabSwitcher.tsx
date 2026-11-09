'use client';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

/** Floating switcher between the three directions (lab only; hidden in screenshots). */
export function LabSwitcher() {
  const path = usePathname();
  return (
    <nav className="lab-switcher" aria-label="جهت‌های طراحی" data-lab-switcher>
      <NextLink href="/lab">آزمایشگاه</NextLink>
      {(['a', 'b', 'c', 'd', 'e', 'f'] as const).map((d) => (
        <NextLink key={d} href={`/lab/${d}`} aria-current={path?.endsWith(`/lab/${d}`) ? 'page' : undefined}>
          {{ a: 'الف', b: 'ب', c: 'ج', d: 'د', e: 'ه', f: 'و' }[d]}
        </NextLink>
      ))}
    </nav>
  );
}
