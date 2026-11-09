/**
 * Zod-free normalization helpers, safe to import from any client component
 * without pulling zod into the bundle (e.g. the footer newsletter form).
 * validate.ts builds the zod schemas on top of these.
 */
export const LIMITS = {
  name: { min: 2, max: 80 },
  email: 120,
  org: 120,
  role: 80,
  message: { min: 10, max: 2000 },
  field: 120,
  link: 300,
} as const;


const ZWNJ = '\u200c';
// C0/C1 controls except \t \n \r, plus bidi override/isolate controls.
// ZWNJ (U+200C) and ZWJ (U+200D) are never removed.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toLatinDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (d) => {
    const p = PERSIAN_DIGITS.indexOf(d);
    return String(p >= 0 ? p : ARABIC_DIGITS.indexOf(d));
  });
}

/** Truncate by code points so a surrogate pair is never split. */
export function truncate(s: string, max: number): string {
  const chars = Array.from(s);
  return chars.length > max ? chars.slice(0, max).join('') : s;
}

/** Remove control characters, collapse to one line unless multiline, trim, truncate. */
export function clean(v: unknown, max: number, multiline = false): string {
  if (typeof v !== 'string') return typeof v === 'number' ? String(v) : '';
  let s = v.replace(CONTROL_RE, '');
  s = multiline ? s.replace(/\r\n?/g, '\n').replace(/\t/g, ' ') : s.replace(/[\r\n\t]+/g, ' ');
  return truncate(s.trim(), max);
}

/** Persian/Arabic digits → Latin; drop spaces, dashes, parentheses and ZWNJ. */
export function normalizePhone(raw: string): string {
  return toLatinDigits(raw).replace(new RegExp(`[\\s\\-()${ZWNJ}\\u200f\\u200e.]`, 'g'), '');
}

const IR_MOBILE = /^(\+98|0098|98|0)?9\d{9}$/;
const INTL = /^\+\d{8,15}$/;
export const isPhone = (p: string) => IR_MOBILE.test(p) || INTL.test(p);

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
export const isEmail = (e: string) => EMAIL.test(e) && !e.includes('..');

/** Add https:// when no scheme; return null when it is not a plausible web URL. */
export function normalizeLink(raw: string): string | null {
  if (!raw) return '';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.') || /\s/.test(raw)) return null;
    return truncate(withScheme, LIMITS.link);
  } catch {
    return null;
  }
}

