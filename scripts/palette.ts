/**
 * npm run palette — builds the color scales from OKLCH and checks contrast.
 *
 * Owner decision (docs/decisions.md D13): neutrals white/gray/black,
 * primary red, secondary blue. Scales are built in OKLCH so that each step
 * has the same perceived lightness across hues (a red-600 and a blue-600 look
 * equally "heavy"), chroma peaks in the middle of the scale and tapers at
 * both ends, and every color is gamut-mapped into sRGB by reducing chroma
 * only (hue and lightness stay fixed). No npm package: the conversion uses
 * Björn Ottosson's published OKLab matrices.
 *
 * Writes src/styles/palette.css and fails if a usage rule misses its WCAG target.
 */
import fs from 'node:fs';

type RGB = [number, number, number];

function oklchToLinear(L: number, C: number, hDeg: number): RGB {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (c: RGB) => c.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
const encode = (v: number) => {
  const x = Math.min(1, Math.max(0, v));
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
};

/** Gamut-map by lowering chroma (binary search); returns hex and the chroma actually used. */
function toHex(L: number, C: number, h: number): { hex: string; c: number } {
  let c = C;
  if (!inGamut(oklchToLinear(L, c, h))) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  const rgb = oklchToLinear(L, c, h).map(encode);
  const hex = '#' + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  return { hex, c };
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as RGB;
}
function luminance(hex: string) {
  const lin = hexToRgb(hex).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

// Shared lightness curve: steps are perceptually even (OKLCH L).
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const LIGHTNESS = [0.975, 0.94, 0.885, 0.81, 0.71, 0.63, 0.545, 0.475, 0.4, 0.325, 0.24];

const SCALES = {
  // Neutral: a whisper of cool hue so grays read clean, not muddy.
  neutral: { hue: 262, chroma: [0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.007, 0.008, 0.008, 0.009, 0.01] },
  // Primary red: hue 27 (a true, slightly warm red; not orange, not pink).
  red: { hue: 27, chroma: [0.013, 0.032, 0.062, 0.105, 0.165, 0.205, 0.22, 0.2, 0.165, 0.13, 0.09] },
  // Secondary blue: hue 262 (a clear institutional blue).
  blue: { hue: 262, chroma: [0.012, 0.03, 0.056, 0.092, 0.14, 0.175, 0.195, 0.185, 0.155, 0.12, 0.085] },
} as const;

type Scale = Record<(typeof STEPS)[number], string>;
const palette = {} as Record<keyof typeof SCALES, Scale>;
const meta: string[] = [];

for (const [name, def] of Object.entries(SCALES) as [keyof typeof SCALES, (typeof SCALES)[keyof typeof SCALES]][]) {
  palette[name] = {} as Scale;
  STEPS.forEach((step, i) => {
    const L = LIGHTNESS[i]!;
    const { hex, c } = toHex(L, def.chroma[i]!, def.hue);
    palette[name][step] = hex;
    meta.push(`  --${name}-${step}: ${hex}; /* oklch(${(L * 100).toFixed(1)}% ${c.toFixed(3)} ${def.hue}) */`);
  });
}

const WHITE = '#ffffff';
const n = palette.neutral;
const r = palette.red;
const b = palette.blue;

// Usage rules (where each color is used) and their WCAG 2.2 targets.
const RULES: [string, string, string, number][] = [
  ['Body text: neutral-900 on white', n[900], WHITE, 12],
  ['Headings: neutral-950 on white', n[950], WHITE, 15],
  ['Muted text: neutral-600 on white', n[600], WHITE, 4.5],
  ['Muted text on light gray: neutral-600 on neutral-50', n[600], n[50], 4.5],
  ['Primary button: white on red-600', WHITE, r[600], 4.5],
  ['Primary button hover: white on red-700', WHITE, r[700], 4.5],
  ['Accent text: red-600 on white', r[600], WHITE, 4.5],
  ['Error text: red-700 on white', r[700], WHITE, 4.5],
  ['Links: blue-700 on white', b[700], WHITE, 4.5],
  ['Links on light gray: blue-700 on neutral-50', b[700], n[50], 4.5],
  ['Focus ring: blue-600 vs white (non-text)', b[600], WHITE, 3],
  ['Borders: neutral-300 vs white (non-text, decorative)', n[300], WHITE, 1.3],
  ['Dark band text: neutral-50 on neutral-950', n[50], n[950], 12],
  ['Dark band muted: neutral-400 on neutral-950', n[400], n[950], 4.5],
  ['Dark band accent: red-400 on neutral-950', r[400], n[950], 4.5],
  ['Dark band links: blue-300 on neutral-950', b[300], n[950], 4.5],
];

let failed = false;
console.log('Contrast checks (WCAG 2.2):');
for (const [label, fg, bg, min] of RULES) {
  const c = contrast(fg, bg);
  const ok = c >= min;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✗'} ${c.toFixed(2).padStart(5)}:1  (≥ ${min})  ${label}  ${fg} / ${bg}`);
}

const css = `/*
 * Generated by scripts/palette.ts (npm run palette). Do not edit by hand.
 * OKLCH scales: shared lightness curve, chroma peaking mid-scale, gamut-mapped
 * by chroma reduction. Owner decision D13: neutral + red (primary) + blue (secondary).
 */
:root {
  --white: #ffffff;
${meta.join('\n')}
}
`;
fs.writeFileSync('src/styles/palette.css', css);
console.log('\n✓ wrote src/styles/palette.css');
console.log(Object.entries(palette).map(([k, v]) => `${k}: ${Object.values(v).join(' ')}`).join('\n'));
if (failed) process.exit(1);
