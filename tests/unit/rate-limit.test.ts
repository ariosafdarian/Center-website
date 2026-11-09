import { describe, it, expect } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { RateLimiter, clientIp } from '@/lib/rate-limit';

describe('RateLimiter', () => {
  it('limits per IP per hour and survives a restart', async () => {
    const file = path.join(await mkdtemp(path.join(os.tmpdir(), 'rl-')), 'rl.json');
    const t0 = 1_800_000_000_000;
    const a = new RateLimiter(file);
    for (let i = 0; i < 3; i++) {
      expect(a.allowed('request', '1.1.1.1', 3, t0)).toBe(true);
      await a.hit('request', '1.1.1.1', t0);
    }
    expect(a.allowed('request', '1.1.1.1', 3, t0)).toBe(false);
    expect(a.allowed('request', '2.2.2.2', 3, t0)).toBe(true);
    expect(a.allowed('newsletter', '1.1.1.1', 3, t0)).toBe(true);

    const b = new RateLimiter(file); // "restart"
    expect(b.allowed('request', '1.1.1.1', 3, t0 + 1000)).toBe(false);
    expect(b.allowed('request', '1.1.1.1', 3, t0 + 60 * 60 * 1000)).toBe(true);
  });

  it('only counts hits, not checks', () => {
    const l = new RateLimiter(null);
    for (let i = 0; i < 10; i++) expect(l.allowed('r', 'x', 1)).toBe(true);
  });
});

describe('clientIp', () => {
  it('uses the right-most X-Forwarded-For entry (added by Nginx)', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '6.6.6.6, 10.0.0.1' }))).toBe('10.0.0.1');
    expect(clientIp(new Headers({ 'x-forwarded-for': '5.5.5.5' }))).toBe('5.5.5.5');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});
