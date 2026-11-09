import { randomInt } from 'node:crypto';
import { tehranParts } from './format';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** R261108-143000-AB12 — Tehran-local Gregorian date/time + 4 random chars. */
export function makeId(prefix: 'R' | 'N', date = new Date()): string {
  const p = tehranParts(date);
  let rand = '';
  for (let i = 0; i < 4; i++) rand += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}${p.yy}${p.mm}${p.dd}-${p.HH}${p.MM}${p.SS}-${rand}`;
}

export const ID_RE = /^[RN]\d{6}-\d{6}-[A-Z0-9]{4}$/;
