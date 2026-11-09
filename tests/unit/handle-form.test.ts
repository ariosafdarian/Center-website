import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { handleForm } from '@/lib/handle-form';
import type { Env } from '@/lib/env';
import { startMockBot } from '../helpers/mock-bot';

let bot: Awaited<ReturnType<typeof startMockBot>>;
let env: Env;
let ipCounter = 0;
let ip = '';

beforeAll(async () => (bot = await startMockBot()));
afterAll(() => bot.close());
beforeEach(async () => {
  bot.calls.length = 0;
  ip = `10.0.0.${++ipCounter}`;
  env = {
    bale: { base: bot.base, token: 'T', chatId: '1' },
    saveToFile: true,
    dataDir: path.join(await mkdtemp(path.join(os.tmpdir(), 'hf-')), 'data'),
    ratePerHour: 6,
    allowedOrigins: [],
  };
});

const valid = {
  type: 'sponsor',
  name: 'سارا احمدی',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  message: 'می‌خواهیم از رویدادهای مرکز حمایت کنیم.',
  details: { support: 'events' },
  lang: 'fa',
  website: '',
  el: 14,
};

const json = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const form = (body: Record<string, string>) =>
  new Request('http://localhost/api/request', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': ip },
    body: new URLSearchParams(body).toString(),
  });

describe('handleForm /api/request', () => {
  it('200: delivers to the bot and writes the CSV', async () => {
    const res = await handleForm(json(valid), 'request', env);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.id).toMatch(/^R\d{6}-\d{6}-[A-Z0-9]{4}$/);
    expect(bot.calls).toHaveLength(1);
    expect(bot.calls[0]!.body.text).toContain('مسیر: حامیان و سرمایه‌گذاران');
    const csv = await readFile(path.join(env.dataDir, 'requests.csv'), 'utf8');
    expect(csv).toContain(body.id);
    expect(csv).toContain('"09123456789"');
    expect(csv).toContain('bale:ok');
  });

  it('honeypot and fast submit: fake success, nothing sent', async () => {
    for (const over of [{ website: 'http://spam' }, { el: 1 }, { el: undefined }]) {
      const res = await handleForm(json({ ...valid, ...over }), 'request', env);
      expect(res.status).toBe(200);
      expect((await res.json()).ok).toBe(true);
    }
    expect(bot.calls).toHaveLength(0);
  });

  it('422 with field codes', async () => {
    const res = await handleForm(json({ ...valid, phone: '123', name: '' }), 'request', env);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid', fields: { name: 'required', phone: 'phone' } });
  });

  it('422 on malformed JSON', async () => {
    const res = await handleForm(json('{nope'), 'request', env);
    expect(res.status).toBe(422);
  });

  it('403 when Origin is not allowed', async () => {
    env.allowedOrigins = ['https://example.ir'];
    expect((await handleForm(json(valid, { origin: 'https://evil.test' }), 'request', env)).status).toBe(403);
    expect((await handleForm(json(valid), 'request', env)).status).toBe(403);
    expect((await handleForm(json(valid, { origin: 'https://example.ir' }), 'request', env)).status).toBe(200);
  });

  it('rejects bodies over 16 KB', async () => {
    const res = await handleForm(json({ ...valid, message: 'x'.repeat(17000) }), 'request', env);
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid' });
  });

  it('429 after the hourly limit; rejected requests do not count', async () => {
    env.ratePerHour = 2;
    await handleForm(json({ ...valid, phone: 'x' }), 'request', env); // 422, not counted
    expect((await handleForm(json(valid), 'request', env)).status).toBe(200);
    expect((await handleForm(json(valid), 'request', env)).status).toBe(200);
    const res = await handleForm(json(valid), 'request', env);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: 'rate' });
  });

  it('200 when only the file got it; 502 when nothing did', async () => {
    env.bale = { base: bot.base, token: 'fail', chatId: '1' };
    expect((await handleForm(json(valid), 'request', env)).status).toBe(200);
    env.saveToFile = false;
    const res = await handleForm(json(valid), 'request', env);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'server' });
  });

  it('no-JS form: 303 to /contact?status=ok&id=…, flat detail fields, marked nojs', async () => {
    const { details, el, ...rest } = valid;
    void el;
    const res = await handleForm(form({ ...rest, ...details, lang: 'en' } as Record<string, string>), 'request', env);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toMatch(/^\/en\/contact\?status=ok&id=R\d{6}-\d{6}-[A-Z0-9]{4}$/);
    expect(bot.calls[0]!.body.text).toContain('روش ارسال: فرم بدون جاوااسکریپت');
    const csv = await readFile(path.join(env.dataDir, 'requests.csv'), 'utf8');
    expect(csv).toContain('bale:ok;nojs');
  });

  it('no-JS form errors: 303 to /contact?status=error', async () => {
    const res = await handleForm(form({ type: 'org', name: 'x', lang: 'fa' }), 'request', env);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/contact?status=error&reason=invalid');
  });
});

describe('handleForm /api/newsletter', () => {
  it('accepts an email, sends and stores it', async () => {
    const req = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ email: 'a@b.ir', lang: 'fa', website: '', el: 5 }),
    });
    const res = await handleForm(req, 'newsletter', env);
    expect(res.status).toBe(200);
    expect(bot.calls[0]!.body.text).toContain('📰 عضویت تازه در خبرنامه');
    const csv = await readFile(path.join(env.dataDir, 'newsletter.csv'), 'utf8');
    expect(csv).toContain('a@b.ir');
  });
  it('no-JS newsletter redirects with form=newsletter', async () => {
    const req = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': ip },
      body: 'email=a%40b.ir&lang=fa&website=',
    });
    const res = await handleForm(req, 'newsletter', env);
    expect(res.headers.get('location')).toMatch(/^\/contact\?status=ok&id=N.*&form=newsletter$/);
  });
});
