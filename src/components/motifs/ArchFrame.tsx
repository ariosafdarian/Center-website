import { archPath } from './arch';

/** Decorative ogee outline placed behind card content (stretches with the card). */
export function ArchFrame({ className }: { className?: string }) {
  return (
    <svg className={`arch-frame ${className ?? ''}`} viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
      <path d={archPath(98, 139, 0.3, 1, 1)} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
