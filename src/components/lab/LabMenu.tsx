'use client';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';

/**
 * Full-screen mobile menu for the lab: focus is trapped inside, Esc closes,
 * focus returns to the toggle. Stage 2 turns this into the site component.
 */
export function LabMenu({
  label,
  closeLabel,
  items,
  cta,
}: {
  label: string;
  closeLabel: string;
  items: { href: string; label: string }[];
  cta: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('a, button') ?? []);
    focusables()[0]?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0]!;
      const last = f[f.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const t = toggle.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      t?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggle}
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="lab-menu"
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
      </button>
      <div id="lab-menu" ref={panel} className="menu-panel" data-open={open || undefined} hidden={!open} role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="menu-close" aria-label={closeLabel} onClick={() => setOpen(false)}>
          ×
        </button>
        <ul>
          {items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} onClick={() => setOpen(false)}>
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={cta.href} className="btn btn--primary" data-cta="primary">
          {cta.label}
        </Link>
      </div>
    </>
  );
}
