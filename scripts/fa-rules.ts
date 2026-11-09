/**
 * Persian writing rules (RFP § "نگهبان خودکار"). Pure functions; used by
 * scripts/lint-fa.ts and tests. Strings are only read, never modified, so
 * ZWNJ (U+200C) is never removed.
 */
export type Rule = { name: string; re: RegExp; hint: string };

export const RULES: Rule[] = [
  // Settled terms (RFP § "واژه‌های تثبیت‌شده")
  { name: 'نام مرکز', re: /مرکز پیشرفت هوش مصنوعی و ربات(?!‌ها)/, hint: 'مرکز پیشرفت هوش مصنوعی و انقلاب ربات‌ها' },
  { name: 'نام مرکز', re: /(^|[^؀-ۿ‌])مرکز هوش مصنوعی/, hint: 'مرکز پیشرفت هوش مصنوعی و انقلاب ربات‌ها، یا «مرکز»' },
  { name: 'رباتیک', re: /رباتیک/, hint: 'ربات‌ها' },
  { name: 'پیمانکار', re: /پیمانکار/, hint: 'متعهد اصلی / مجری' },
  { name: 'تأمین‌کننده', re: /تأمین[‌ ]?کننده/, hint: 'مجری، شبکهٔ مجریان' },
  { name: 'مشتری', re: /مشتری/, hint: 'کارفرما' },
  { name: 'لیگ فایت', re: /لیگ فایت/, hint: 'لیگ نبرد ربات‌ها' },
  { name: 'از باز به امن', re: /از باز به امن/, hint: 'سه لایهٔ دسترسی، از عمومی تا خصوصی' },
  { name: 'پروانه', re: /پروانه(?!ٔ? صنفی)/, hint: 'پروانهٔ صنفی' },
  // Names that must never appear on the site
  { name: 'نام طرح', re: /العلم سلطان/, hint: 'نام طرح در سایت نمی‌آید' },
  { name: 'پلکان پیشرفت', re: /پلکان پیشرفت/, hint: 'در سایت نمی‌آید' },
  { name: 'هوش آفرین', re: /هوش[‌ ]?آفرین/, hint: 'در سایت نمی‌آید' },
  // Banned verbs and phrases
  { name: 'می‌باشد', re: /می[‌ ]?باش(د|ند|م|ی|یم|ید)/, hint: 'است / هستند' },
  { name: 'انجام می‌دهد', re: /انجام (می[‌ ]?)?(ده|داد|شو|شد)/, hint: 'فعل دقیق' },
  { name: 'صورت می‌گیرد', re: /صورت (می[‌ ]?)?(گیر|گرفت)/, hint: 'فعل دقیق' },
  { name: 'توسط', re: /توسط/, hint: 'فاعل را بیاورید' },
  { name: 'در راستای', re: /در راستای/, hint: 'برای' },
  { name: 'از طریق', re: /از طریق/, hint: 'با / از راه' },
  // Characters
  { name: 'ی عربی', re: /ي/, hint: 'ی' },
  { name: 'ک عربی', re: /ك/, hint: 'ک' },
  // Spacing
  { name: 'می با فاصله', re: /(^|[\s«(])ن?می (?=[؀-ۿ])/, hint: 'می‌ با نیم‌فاصله' },
  { name: 'ها با فاصله', re: /[؀-ۿ] (ها|های|هایی|هایم|هایت|هایش|هایمان|هایتان|هایشان)(?=$|[^؀-ۿ‌])/, hint: '‌ها با نیم‌فاصله' },
];

/** Latin digits outside URLs, emails, ICU arguments and Latin tokens such as API or H2. */
export function latinDigit(s: string): boolean {
  const stripped = s
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\S+@\S+/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\b[A-Za-z][A-Za-z0-9_.\-/]*\b/g, '');
  return /[0-9]/.test(stripped);
}

export const hasPersian = (s: string) => /[؀-ۿ]/.test(s);


/** Names of the rules a Persian string breaks (empty when clean or not Persian). */
export function lintFaText(text: string): { rule: string; hint: string }[] {
  if (!hasPersian(text)) return [];
  const out = RULES.filter((r) => r.re.test(text)).map((r) => ({ rule: r.name, hint: r.hint }));
  if (latinDigit(text)) out.push({ rule: 'رقم لاتین', hint: 'رقم فارسی' });
  return out;
}
