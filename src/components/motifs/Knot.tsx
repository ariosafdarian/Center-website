import { khatamPoints, pointsAttr } from './arch';

/** Small khatam star glyph. */
export function Star({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <polygon points={pointsAttr(khatamPoints(10, 10, 9.5))} fill="currentColor" />
    </svg>
  );
}

/** Knot rule: section divider with a small star in the middle. */
export function KnotRule({ className }: { className?: string }) {
  return (
    <div className={`knot-rule ${className ?? ''}`} role="presentation">
      <span />
      <Star size={14} />
      <span />
    </div>
  );
}
