'use client';
import { useEffect, useState, type ComponentType } from 'react';

/**
 * Loads the hero canvas after first paint (idle time), so it never delays LCP
 * and stays out of the initial JavaScript bundle (RFP: canvas loads after LCP).
 */
export function HeroCanvasLoader({ className }: { className?: string }) {
  const [Canvas, setCanvas] = useState<ComponentType<{ className?: string }> | null>(null);
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      import('./HeroCanvas').then((m) => {
        if (!cancelled) setCanvas(() => m.default);
      });
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(load, { timeout: 1500 });
    else setTimeout(load, 300);
    return () => {
      cancelled = true;
    };
  }, []);
  return Canvas ? <Canvas className={className} /> : <div className={className} aria-hidden="true" />;
}
