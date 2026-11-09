import type { Locale } from '@/i18n/routing';
import { archPath, khatamPoints, pointsAttr } from './arch';

type L = { fa: string; en: string };

/**
 * The gap the Center closes: three groups around the core «اعتماد و سنجش».
 * Text equivalent is given in the figcaption (visually hidden).
 */
export function GapDiagram({ groups, core, locale }: { groups: { key: string; title: L }[]; core: L; locale: Locale }) {
  // Three overlapping circles; the core star sits where all three meet.
  const R = 132;
  const C = [300, 262] as const;
  const pos = [
    [300, 180],
    [229, 303],
    [371, 303],
  ] as const;
  // Label positions: pushed outward from the core, away from the overlaps.
  const label = (x: number, y: number) => {
    const dx = x - C[0];
    const dy = y - C[1];
    const d = Math.hypot(dx, dy) || 1;
    return [x + (dx / d) * 70, y + (dy / d) * 70] as const;
  };
  const order = locale === 'fa' ? [0, 2, 1] : [0, 1, 2];
  return (
    <figure className="diagram diagram--gap">
      <svg viewBox="0 0 600 520" aria-hidden="true">
        {pos.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={R} className="d-ring" />
        ))}
        <polygon points={pointsAttr(khatamPoints(C[0], C[1], 40))} className="d-core" />
        <text x={C[0]} y={C[1] + 76} className="d-core-label" textAnchor="middle" dominantBaseline="central">
          {core[locale]}
        </text>
        {order.map((gi, i) => {
          const g = groups[gi]!;
          const [x, y] = label(pos[i]![0], pos[i]![1]);
          return (
            <text key={g.key} x={x} y={y} textAnchor="middle" dominantBaseline="central" className="d-label">
              {g.title[locale]}
            </text>
          );
        })}
      </svg>
      <figcaption className="visually-hidden">
        {groups.map((g) => g.title[locale]).join('، ')} — {core[locale]}
      </figcaption>
    </figure>
  );
}

/** Two contracts: employer ↔ Center (outcome-based), Center ↔ implementer (separate). */
export function ContractDiagram({ locale }: { locale: Locale }) {
  const fa = locale === 'fa';
  const t = {
    employer: fa ? 'کارفرما' : 'Employer',
    center: fa ? 'مرکز' : 'The Center',
    impl: fa ? 'مجری' : 'Implementer',
    c1: fa ? 'قرارداد نتیجه‌محور' : 'Outcome-based contract',
    c2: fa ? 'قرارداد جداگانه' : 'Separate contract',
  };
  // RTL reads right to left: employer on the right.
  const xs = fa ? [520, 300, 80] : [80, 300, 520];
  const nodes = [t.employer, t.center, t.impl];
  return (
    <figure className="diagram diagram--contract">
      <svg viewBox="0 0 600 220" aria-hidden="true">
        <path d={`M${xs[0]},110 Q${(xs[0]! + xs[1]!) / 2},20 ${xs[1]},110`} className="d-link d-link--a" />
        <path d={`M${xs[1]},110 Q${(xs[1]! + xs[2]!) / 2},20 ${xs[2]},110`} className="d-link d-link--b" />
        <text x={(xs[0]! + xs[1]!) / 2} y={44} textAnchor="middle" className="d-small">
          {t.c1}
        </text>
        <text x={(xs[1]! + xs[2]!) / 2} y={44} textAnchor="middle" className="d-small">
          {t.c2}
        </text>
        {nodes.map((n, i) => (
          <g key={n}>
            {i === 1 ? (
              <polygon points={pointsAttr(khatamPoints(xs[i]!, 110, 34))} className="d-core" />
            ) : (
              <circle cx={xs[i]} cy={110} r={26} className="d-node" />
            )}
            <text x={xs[i]} y={176} textAnchor="middle" className="d-label">
              {n}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="visually-hidden">
        {t.employer} — {t.c1} — {t.center} — {t.c2} — {t.impl}
      </figcaption>
    </figure>
  );
}

/** Three nested ogee arches: the three spaces, from public (outer) to private (inner). */
export function NestedArches({ spaces, locale }: { spaces: { key: string; title: L; access: L }[]; locale: Locale }) {
  const W = 420;
  const H = 440;
  const layers = [
    { w: 400, h: 420 },
    { w: 290, h: 330 },
    { w: 180, h: 240 },
  ];
  return (
    <figure className="diagram diagram--arches">
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {layers.map((l, i) => (
          <path
            key={i}
            d={archPath(l.w, l.h, 0.42, (W - l.w) / 2, H - l.h)}
            className={`d-arch d-arch--${i + 1}`}
          />
        ))}
        {spaces.map((s, i) => {
          const l = layers[i]!;
          const nextTop = layers[i + 1] ? H - layers[i + 1]!.h : H - 30;
          const y = i < 2 ? (H - l.h + nextTop) / 2 + 18 : H - l.h + l.h * 0.62;
          return (
            <text key={s.key} x={W / 2} y={y} textAnchor="middle" className="d-label">
              {s.title[locale]}
            </text>
          );
        })}
      </svg>
      <figcaption className="visually-hidden">
        {spaces.map((s) => `${s.title[locale]}: ${s.access[locale]}`).join('؛ ')}
      </figcaption>
    </figure>
  );
}

/** Seven concentric rings (names pending import). */
export function RingsDiagram({ count = 7 }: { count?: number }) {
  return (
    <svg className="diagram diagram--rings" viewBox="0 0 400 400" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={200} cy={200} r={28 + i * 25} className="d-ring" style={{ ['--i' as string]: i }} />
      ))}
      <polygon points={pointsAttr(khatamPoints(200, 200, 18))} className="d-core" />
      {Array.from({ length: count }, (_, i) => {
        const a = -Math.PI / 2 + i * ((Math.PI * 2) / count);
        const r = 28 + i * 25;
        return <circle key={`n${i}`} cx={200 + r * Math.cos(a)} cy={200 + r * Math.sin(a)} r={4.5} className="d-dot" />;
      })}
    </svg>
  );
}
