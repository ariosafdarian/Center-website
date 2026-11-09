import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { buildRequestMessage, buildNewsletterMessage, sendToBots, deliverySummary, MAX_MESSAGE } from '@/lib/bot';
import { validateRequest, type RequestData } from '@/lib/validate';
import { startMockBot } from '../helpers/mock-bot';

const date = new Date('2026-11-08T11:00:00Z'); // 14:30 Tehran
const meta = { id: 'R261108-143000-AB12', date, lang: 'fa' as const };

function data(over: Record<string, unknown> = {}): RequestData {
  const r = validateRequest({
    type: 'org',
    name: 'سارا احمدی',
    phone: '09123456789',
    org: 'بانک نمونه',
    message: 'مسئلهٔ ما کاهش صف شعبه‌هاست.',
    details: { area: 'banking-finance' },
    ...over,
  });
  if (!r.ok) throw new Error(JSON.stringify(r.fields));
  return r.data;
}

describe('buildRequestMessage', () => {
  it('follows the RFP layout', () => {
    expect(buildRequestMessage(data(), meta)).toBe(
      [
        '📩 درخواست تازه از سایت مرکز',
        'مسیر: سازمان‌ها و کارفرمایان',
        '━━━━━━━━━━━━',
        'نام: سارا احمدی',
        'تلفن: 09123456789',
        'سازمان: بانک نمونه',
        'حوزهٔ کاری: بانک و مالی',
        '',
        'پیام:',
        'مسئلهٔ ما کاهش صف شعبه‌هاست.',
        '━━━━━━━━━━━━',
        'زمان: ۱۴۰۵/۰۸/۱۷ ساعت ۱۴:۳۰ (وقت تهران)',
        'زبان فرم: فارسی',
        'شناسه: R261108-143000-AB12',
      ].join('\n'),
    );
  });
  it('is always Persian and marks English forms and no-JS posts', () => {
    const t = buildRequestMessage(data(), { ...meta, lang: 'en', nojs: true });
    expect(t).toContain('زبان فرم: انگلیسی');
    expect(t).toContain('روش ارسال: فرم بدون جاوااسکریپت');
  });
  it('shows event title for event registration', () => {
    const t = buildRequestMessage(
      data({ type: 'other', org: '', details: { topic: 'event', event: 'robot-battle-league' } }),
      meta,
    );
    expect(t).toContain('رویداد: لیگ نبرد ربات‌ها');
    expect(t).toContain('موضوع: ثبت‌نام در رویداد');
  });
  it('caps at 4000 chars, keeping the footer', () => {
    const t = buildRequestMessage(data({ message: 'م'.repeat(2000), name: 'ن'.repeat(80) }), meta);
    expect(Array.from(t).length).toBeLessThanOrEqual(MAX_MESSAGE);
    expect(t.endsWith('شناسه: R261108-143000-AB12')).toBe(true);
  });
});

describe('newsletter message', () => {
  it('has header, email and time', () => {
    const t = buildNewsletterMessage('a@b.ir', meta);
    expect(t.startsWith('📰 عضویت تازه در خبرنامه')).toBe(true);
    expect(t).toContain('ایمیل: a@b.ir');
    expect(t).toContain('۱۴۰۵/۰۸/۱۷');
  });
});

describe('sendToBots', () => {
  let bot: Awaited<ReturnType<typeof startMockBot>>;
  beforeAll(async () => (bot = await startMockBot()));
  afterAll(() => bot.close());

  it('sends to both destinations', async () => {
    const r = await sendToBots('hi', {
      bale: { base: bot.base, token: 'T1', chatId: '1' },
      telegram: { base: bot.base, token: 'T2', chatId: '-100' },
    });
    expect(r).toEqual({ bale: true, telegram: true });
    expect(bot.calls.map((c) => c.path)).toEqual(expect.arrayContaining(['/botT1/sendMessage', '/botT2/sendMessage']));
    expect(bot.calls[0]!.body).toMatchObject({ text: 'hi', disable_web_page_preview: true });
  });
  it('reports failures', async () => {
    const r = await sendToBots('x', {
      bale: { base: bot.base, token: 'fail', chatId: '1' },
      telegram: { base: 'http://127.0.0.1:1', token: 'T', chatId: '1' },
    });
    expect(r).toEqual({ bale: false, telegram: false });
    expect(deliverySummary(r, ['nojs'])).toBe('bale:fail;telegram:fail;nojs');
  });
  it('nothing configured', async () => {
    expect(await sendToBots('x', {})).toEqual({});
  });
});
