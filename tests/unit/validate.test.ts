import { describe, it, expect } from 'vitest';
import { normalizePhone, isPhone, clean, normalizeLink, validateRequest, validateNewsletter } from '@/lib/validate';

const base = { name: 'سارا احمدی', phone: '۰۹۱۲ ۳۴۵-۶۷۸۹', message: 'یک پیام آزمایشی برای مرکز', lang: 'fa' };

describe('phone', () => {
  it.each([
    ['۰۹۱۲۳۴۵۶۷۸۹', '09123456789'],
    ['٠٩١٢٣٤٥٦٧٨٩', '09123456789'],
    ['(0912) 345-6789', '09123456789'],
    ['+98 912 345 6789', '+989123456789'],
    ['۰۹۱۲‌۳۴۵۶۷۸۹', '09123456789'],
  ])('normalizes %s', (raw, out) => expect(normalizePhone(raw)).toBe(out));

  it.each(['09123456789', '+989123456789', '00989123456789', '989123456789', '9123456789', '+4915112345678'])(
    'accepts %s',
    (p) => expect(isPhone(p)).toBe(true),
  );
  it.each(['0212200000', '0912345678', '+12', '091234567890', 'abc'])('rejects %s', (p) => expect(isPhone(p)).toBe(false));
});

describe('clean', () => {
  it('keeps ZWNJ and strips control chars', () => {
    expect(clean('می‌کنیم\u0007‮', 80)).toBe('می‌کنیم');
  });
  it('truncates by code point', () => {
    expect(clean('😀😀😀', 2)).toBe('😀😀');
  });
  it('collapses newlines in single-line fields, keeps them in multiline', () => {
    expect(clean('a\r\nb', 10)).toBe('a b');
    expect(clean('a\r\nb', 10, true)).toBe('a\nb');
  });
});

describe('link', () => {
  it('adds https://', () => expect(normalizeLink('github.com/x')).toBe('https://github.com/x'));
  it('keeps http(s)', () => expect(normalizeLink('http://a.ir')).toBe('http://a.ir'));
  it('rejects junk', () => expect(normalizeLink('not a url')).toBeNull());
  it('empty is fine', () => expect(normalizeLink('')).toBe(''));
});

describe('validateRequest per path', () => {
  it('org requires org name and area', () => {
    const r = validateRequest({ ...base, type: 'org' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fields).toMatchObject({ org: 'required', area: 'required' });
  });
  it('org ok', () => {
    const r = validateRequest({ ...base, type: 'org', org: 'بانک نمونه', details: { area: 'banking-finance', size: '' } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.phone).toBe('09123456789');
  });
  it('rejects unknown area', () => {
    const r = validateRequest({ ...base, type: 'org', org: 'x', details: { area: 'nope' } });
    expect(!r.ok && r.fields.area).toBe('required');
  });
  it('talent needs field; link gets https', () => {
    const r = validateRequest({ ...base, type: 'talent', details: { field: 'بینایی ماشین', link: 'example.com/me' } });
    expect(r.ok && r.data.details).toEqual({ field: 'بینایی ماشین', link: 'https://example.com/me' });
  });
  it('talent bad link → url', () => {
    const r = validateRequest({ ...base, type: 'talent', details: { field: 'x', link: 'bad link' } });
    expect(!r.ok && r.fields.link).toBe('url');
  });
  it('partner requires org', () => {
    const r = validateRequest({ ...base, type: 'partner', details: { field: 'x' } });
    expect(!r.ok && r.fields.org).toBe('required');
  });
  it('sponsor requires support', () => {
    expect(validateRequest({ ...base, type: 'sponsor', details: { support: 'events' } }).ok).toBe(true);
    const r = validateRequest({ ...base, type: 'sponsor', details: {} });
    expect(!r.ok && r.fields.support).toBe('required');
  });
  it('other requires topic, accepts event slug from flat no-JS body', () => {
    const r = validateRequest({ ...base, type: 'other', topic: 'event', event: 'robot-battle-league' });
    expect(r.ok && r.data.details).toEqual({ topic: 'event', event: 'robot-battle-league' });
    const bad = validateRequest({ ...base, type: 'other', topic: 'party' });
    expect(!bad.ok && bad.fields.topic).toBe('required');
  });
  it('error codes: required, short, phone, email', () => {
    const r = validateRequest({ type: 'other', name: 'ا', phone: '123', email: 'x@', message: 'کوتاه', details: { topic: 'visit' } });
    expect(!r.ok && r.fields).toMatchObject({ name: 'short', phone: 'phone', email: 'email', message: 'short' });
    const e = validateRequest({ type: 'other', details: { topic: 'visit' } });
    expect(!e.ok && e.fields).toMatchObject({ name: 'required', phone: 'required', message: 'required' });
  });
  it('missing or invalid type', () => {
    expect(validateRequest({ ...base, type: 'x' })).toEqual({ ok: false, fields: { type: 'required' } });
    expect(validateRequest({ name: 'ا' })).toEqual({
      ok: false,
      fields: { type: 'required', name: 'short', phone: 'required', message: 'required' },
    });
  });
  it('truncates long fields instead of failing', () => {
    const r = validateRequest({ ...base, type: 'sponsor', name: 'ب'.repeat(200), details: { support: 'events' } });
    expect(r.ok && Array.from(r.data.name).length).toBe(80);
  });
});

describe('validateNewsletter', () => {
  it('works', () => {
    expect(validateNewsletter({ email: ' a@b.ir ' })).toEqual({ ok: true, data: { email: 'a@b.ir' } });
    expect(validateNewsletter({ email: '' })).toEqual({ ok: false, fields: { email: 'required' } });
    expect(validateNewsletter({ email: 'no' })).toEqual({ ok: false, fields: { email: 'email' } });
  });
});
