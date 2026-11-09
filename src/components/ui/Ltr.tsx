import type { ReactNode } from 'react';

/** Phone numbers, emails and Latin words inside Persian text. */
export function Ltr({ children, lang }: { children: ReactNode; lang?: string }) {
  return (
    <bdi dir="ltr" lang={lang}>
      {children}
    </bdi>
  );
}
