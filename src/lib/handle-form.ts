import 'server-only';
import { getEnv, type Env } from './env';
import { validateRequest, validateNewsletter, toLang, type Lang, type FieldErrors } from './validate';
import { buildRequestMessage, buildNewsletterMessage, sendToBots, anyDelivered, deliverySummary } from './bot';
import { appendCsv, REQUEST_COLUMNS, NEWSLETTER_COLUMNS } from './store';
import { limiterFor, clientIp } from './rate-limit';
import { makeId } from './id';
import { jalaliDateTimeLatin } from './format';

export const MAX_BODY = 16 * 1024;
const MIN_SECONDS = 3;

export type Kind = 'request' | 'newsletter';
type ErrorKind = 'invalid' | 'rate' | 'origin' | 'server' | 'size';

/**
 * Shared pipeline for POST /api/request and /api/newsletter, mirroring send.php:
 * size → Origin → honeypot/timing → rate limit → validation → bots + CSV.
 *
 * JSON bodies come from the JS form and get JSON responses.
 * Form-encoded bodies come from the no-JS fallback and get a 303 to /contact?status=…
 * The no-JS form cannot send `el` (time on page); see docs/decisions.md (D3).
 */
export async function handleForm(req: Request, kind: Kind, env: Env = getEnv()): Promise<Response> {
  const contentType = req.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  let lang: Lang = 'fa';

  const fail = (status: number, error: ErrorKind, fields?: FieldErrors) =>
    isJson
      ? Response.json({ ok: false, error: error === 'size' ? 'invalid' : error, ...(fields ? { fields } : {}) }, { status })
      : redirect(lang, kind, { status: 'error', reason: error });

  // 1. Size
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY) return fail(413, 'size');
  let rawText: string;
  try {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > MAX_BODY) return fail(413, 'size');
    rawText = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  } catch {
    return fail(422, 'invalid');
  }

  // 2. Parse (needed early to know the language for redirects)
  let raw: Record<string, unknown>;
  try {
    if (isJson) {
      const parsed: unknown = JSON.parse(rawText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('shape');
      raw = parsed as Record<string, unknown>;
    } else {
      raw = Object.fromEntries(new URLSearchParams(rawText));
    }
  } catch {
    return fail(422, 'invalid', {});
  }
  lang = toLang(raw.lang);

  // 3. Origin
  if (env.allowedOrigins.length) {
    const origin = req.headers.get('origin')?.replace(/\/+$/, '');
    if (!origin || !env.allowedOrigins.includes(origin)) return fail(403, 'origin');
  }

  // 4. Honeypot and timing → pretend success, send nothing
  const date = new Date();
  const prefix = kind === 'request' ? 'R' : 'N';
  const fakeOk = () => {
    const id = makeId(prefix, date);
    return isJson ? Response.json({ ok: true, id }) : redirect(lang, kind, { status: 'ok', id });
  };
  if (typeof raw.website === 'string' ? raw.website.trim() !== '' : raw.website != null) return fakeOk();
  const el = raw.el === undefined || raw.el === '' ? undefined : Number(raw.el);
  if (isJson && (el === undefined || !Number.isFinite(el) || el < MIN_SECONDS)) return fakeOk();
  if (!isJson && el !== undefined && (!Number.isFinite(el) || el < MIN_SECONDS)) return fakeOk();

  // 5. Rate limit (only accepted requests are counted)
  const ip = clientIp(req.headers);
  const limiter = limiterFor(env.dataDir);
  if (!limiter.allowed(kind, ip, env.ratePerHour)) return fail(429, 'rate');

  // 6. Validate + 7. Deliver
  const id = makeId(prefix, date);
  const meta = { id, date, lang, nojs: !isJson };
  const extra = isJson ? [] : ['nojs'];
  let text: string;
  let row: Record<string, string>;
  let file: string;
  let columns: readonly string[];

  if (kind === 'request') {
    const v = validateRequest(raw);
    if (!v.ok) return fail(422, 'invalid', v.fields);
    const d = v.data;
    text = buildRequestMessage(d, meta);
    file = 'requests.csv';
    columns = REQUEST_COLUMNS;
    row = {
      type: d.type,
      name: d.name,
      phone: d.phone,
      email: d.email,
      org: d.org,
      role: d.role,
      details: Object.entries(d.details)
        .filter(([, val]) => val)
        .map(([k, val]) => `${k}=${val}`)
        .join('; '),
      message: d.message,
    };
  } else {
    const v = validateNewsletter(raw);
    if (!v.ok) return fail(422, 'invalid', v.fields);
    text = buildNewsletterMessage(v.data.email, meta);
    file = 'newsletter.csv';
    columns = NEWSLETTER_COLUMNS;
    row = { email: v.data.email };
  }

  const delivery = await sendToBots(text, env);
  const summary = deliverySummary(delivery, extra);
  const saved = env.saveToFile
    ? await appendCsv(env.dataDir, file, columns, {
        ...row,
        time: date.toISOString(),
        jalali: jalaliDateTimeLatin(date),
        id,
        lang,
        ip,
        delivery: summary,
      })
    : false;

  if (!anyDelivered(delivery) || (env.saveToFile && !saved)) {
    // Log only the id and the per-destination result, never personal data.
    console.error(`[${kind}] ${id} delivery=${summary} file=${env.saveToFile ? (saved ? 'ok' : 'fail') : 'off'}`);
  }
  if (!anyDelivered(delivery) && !saved) return fail(502, 'server');

  await limiter.hit(kind, ip);
  return isJson ? Response.json({ ok: true, id }) : redirect(lang, kind, { status: 'ok', id });
}

function redirect(lang: Lang, kind: Kind, params: Record<string, string>): Response {
  const qs = new URLSearchParams({ ...params, ...(kind === 'newsletter' ? { form: 'newsletter' } : {}) });
  const prefix = lang === 'en' ? '/en' : '';
  return new Response(null, { status: 303, headers: { Location: `${prefix}/contact?${qs}` } });
}
