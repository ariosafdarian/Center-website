/**
 * Ogee (جناغی) arch outline, open at the bottom: straight jambs up to the
 * springing line, then on each side a convex curve and a concave curve that
 * meet at a pointed apex. DRAFT geometry: replace with arch_path from
 * reference/v1/build.py once it is in the repository.
 *
 * @param w width, @param h height, @param spring height of the springing line from the top (0–1 of h)
 */
export function archPath(w: number, h: number, spring = 0.42, x = 0, y = 0): string {
  const s = h * spring; // springing line, measured from the top
  const m = w / 2;
  const f = (n: number) => n.toFixed(2);
  return [
    `M${f(x)},${f(y + h)}`,
    `L${f(x)},${f(y + s)}`,
    // right-hand side (in SVG coordinates: left jamb → apex)
    `C${f(x)},${f(y + s * 0.5)} ${f(x + w * 0.16)},${f(y + s * 0.3)} ${f(x + w * 0.3)},${f(y + s * 0.22)}`,
    `C${f(x + w * 0.42)},${f(y + s * 0.15)} ${f(x + m - w * 0.02)},${f(y + s * 0.08)} ${f(x + m)},${f(y)}`,
    `C${f(x + m + w * 0.02)},${f(y + s * 0.08)} ${f(x + w * 0.58)},${f(y + s * 0.15)} ${f(x + w * 0.7)},${f(y + s * 0.22)}`,
    `C${f(x + w * 0.84)},${f(y + s * 0.3)} ${f(x + w)},${f(y + s * 0.5)} ${f(x + w)},${f(y + s)}`,
    `L${f(x + w)},${f(y + h)}`,
  ].join(' ');
}

/** Points of an eight-point khatam star (two overlapping squares). */
export function khatamPoints(cx: number, cy: number, r: number): [number, number][] {
  const ri = r * (Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8));
  const pts: [number, number][] = [];
  for (let k = 0; k < 16; k++) {
    const a = (Math.PI / 8) * k - Math.PI / 2;
    const rad = k % 2 === 0 ? r : ri;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  return pts;
}

export const pointsAttr = (pts: [number, number][]) => pts.map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`).join(' ');
