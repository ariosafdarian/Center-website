import { describe, it, expect } from 'vitest';
import { jalaliDateTime, jalaliDateTimeLatin, toPersianDigits, formatEventDate } from '@/lib/format';
import { makeId, ID_RE } from '@/lib/id';

const d = new Date('2026-11-08T11:00:00Z');

describe('format', () => {
  it('jalali', () => {
    expect(jalaliDateTime(d)).toBe('۱۴۰۵/۰۸/۱۷ ساعت ۱۴:۳۰');
    expect(jalaliDateTimeLatin(d)).toBe('1405/08/17 14:30');
  });
  it('digits', () => expect(toPersianDigits('42 / 7')).toBe('۴۲ / ۷'));
  it('event date fa is Jalali with Persian digits', () => {
    const s = formatEventDate('2026-12-10T16:00:00+03:30', 'fa');
    expect(s).toContain('آذر');
    expect(s).toContain('۱۴۰۵');
  });
  it('id', () => {
    const id = makeId('R', d);
    expect(id).toMatch(ID_RE);
    expect(id.startsWith('R261108-143000-')).toBe(true);
  });
});
