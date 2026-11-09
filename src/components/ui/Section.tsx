import type { ReactNode } from 'react';

export function Section({ id, title, level = 2, children }: { id: string; title: string; level?: 2 | 3; children: ReactNode }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <H id={`${id}-title`}>{title}</H>
      {children}
    </section>
  );
}
