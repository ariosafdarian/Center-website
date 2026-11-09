/**
 * Emblem: eight-point khatam star (two overlapping squares) with thin spokes
 * from the center, eight gold nodes on the tips and a turquoise core —
 * a Persian knot that is also a neural-network node.
 * DRAFT geometry: replace with reference/v1/static/assets/img/emblem.svg once imported.
 * `mono` renders everything in currentColor.
 */
export function Emblem({ size = 40, mono = false, title }: { size?: number; mono?: boolean; title?: string }) {
  const gold = mono ? 'currentColor' : 'var(--color-gold)';
  const turquoise = mono ? 'currentColor' : 'var(--color-turquoise)';
  const r = 26;
  const tips = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    return [32 + r * Math.cos(a), 32 + r * Math.sin(a)] as const;
  });
  const square = (rot: number) => {
    const pts = [0, 1, 2, 3].map((k) => {
      const a = (Math.PI / 2) * k + rot - Math.PI / 2;
      return `${(32 + r * Math.cos(a)).toFixed(2)},${(32 + r * Math.sin(a)).toFixed(2)}`;
    });
    return pts.join(' ');
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      stroke="currentColor"
    >
      <polygon points={square(0)} strokeWidth={1.6} strokeLinejoin="round" />
      <polygon points={square(Math.PI / 4)} strokeWidth={1.6} strokeLinejoin="round" />
      {tips.map(([x, y], i) => (
        <line key={`s${i}`} x1={32} y1={32} x2={x} y2={y} strokeWidth={0.6} />
      ))}
      {tips.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r={2.6} fill={gold} stroke="none" />
      ))}
      <circle cx={32} cy={32} r={4.5} fill={turquoise} stroke="none" />
    </svg>
  );
}
