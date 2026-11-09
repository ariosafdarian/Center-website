/** Dates and digits. Data is Gregorian ISO; display is Jalali in Persian. */
const TZ = 'Asia/Tehran';

export const toPersianDigits = (s: string | number) =>
  String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!);

export const localizeDigits = (s: string | number, locale: string) =>
  locale === 'fa' ? toPersianDigits(s) : String(s);

function parts(date: Date, locale: string, opts: Intl.DateTimeFormatOptions) {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat(locale, { timeZone: TZ, ...opts }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

/** "۱۴۰۵/۰۸/۱۷ ساعت ۱۴:۳۰" — used in bot messages. */
export function jalaliDateTime(date: Date): string {
  const p = parts(date, 'fa-IR-u-ca-persian-nu-arabext', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${p.year}/${p.month}/${p.day} ساعت ${p.hour}:${p.minute}`;
}

/** "1405/08/17 14:30" with Latin digits — used in the CSV backup. */
export function jalaliDateTimeLatin(date: Date): string {
  const p = parts(date, 'fa-IR-u-ca-persian-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}`;
}

/** Tehran-local Gregorian parts, for request ids. */
export function tehranParts(date: Date) {
  const p = parts(date, 'en-GB', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return { yy: p.year!, mm: p.month!, dd: p.day!, HH: p.hour!, MM: p.minute!, SS: p.second! };
}

/** Event date in the page language: Jalali for fa, Gregorian for en. */
export function formatEventDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (locale === 'fa') {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      timeZone: TZ,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(d);
  }
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);
}

/** The other calendar, as a secondary line: Gregorian for fa, Jalali for en. */
export function formatEventDateAlt(iso: string, locale: string): string {
  const d = new Date(iso);
  if (locale === 'fa') {
    return new Intl.DateTimeFormat('fa-IR-u-ca-gregory', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  }
  return new Intl.DateTimeFormat('en-GB-u-ca-persian', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
