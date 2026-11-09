import { fetch, ProxyAgent, type Dispatcher } from 'undici';
import { getPath } from '@/content/paths';
import { formOptions } from '@/content/form-options';
import { getEvent } from '@/content/events';
import type { Env } from './env';
import type { Lang, RequestData } from './validate';
import { jalaliDateTime } from './format';
import { truncate } from './validate';

export const MAX_MESSAGE = 4000;
const RULE = '━━━━━━━━━━━━';
const TIMEOUT_MS = 12_000;

const DETAIL_LABELS: Record<string, string> = {
  area: 'حوزهٔ کاری',
  size: 'اندازهٔ سازمان',
  field: 'زمینهٔ تخصص',
  link: 'پیوند',
  support: 'نوع حمایت',
  topic: 'موضوع',
  event: 'رویداد',
};

function detailValue(key: string, value: string): string {
  if (key === 'event') return getEvent(value)?.title.fa ?? value;
  if (key === 'area' || key === 'size' || key === 'support' || key === 'topic') {
    const list = formOptions.data[key] as { value: string; label: { fa: string } }[];
    return list.find((o) => o.value === value)?.label.fa ?? value;
  }
  return value;
}

export type MessageMeta = { id: string; date: Date; lang: Lang; nojs?: boolean };

function footer(meta: MessageMeta) {
  return [
    RULE,
    `زمان: ${jalaliDateTime(meta.date)} (وقت تهران)`,
    `زبان فرم: ${meta.lang === 'en' ? 'انگلیسی' : 'فارسی'}`,
    ...(meta.nojs ? ['روش ارسال: فرم بدون جاوااسکریپت'] : []),
    `شناسه: ${meta.id}`,
  ];
}

/** Persian bot text, whatever the form language. Max 4000 chars; the message body is cut first. */
export function buildRequestMessage(d: RequestData, meta: MessageMeta): string {
  const head = ['📩 درخواست تازه از سایت مرکز', `مسیر: ${getPath(d.type).label.fa}`, RULE, `نام: ${d.name}`, `تلفن: ${d.phone}`];
  const optional: [string, string][] = [
    ['ایمیل', d.email],
    ['سازمان', d.org],
    ['سمت', d.role],
  ];
  for (const [label, v] of optional) if (v) head.push(`${label}: ${v}`);
  for (const [k, v] of Object.entries(d.details)) {
    if (typeof v === 'string' && v) head.push(`${DETAIL_LABELS[k] ?? k}: ${detailValue(k, v)}`);
  }
  const top = head.join('\n') + '\n\nپیام:\n';
  const bottom = '\n' + footer(meta).join('\n');
  const room = MAX_MESSAGE - Array.from(top).length - Array.from(bottom).length;
  const body = Array.from(d.message).length > room ? truncate(d.message, Math.max(0, room - 1)) + '…' : d.message;
  return truncate(top + body + bottom, MAX_MESSAGE);
}

export function buildNewsletterMessage(email: string, meta: MessageMeta): string {
  return ['📰 عضویت تازه در خبرنامه', RULE, `ایمیل: ${email}`, ...footer(meta)].join('\n');
}

export type DeliveryResult = { bale?: boolean; telegram?: boolean };

async function post(url: string, body: object, dispatcher?: Dispatcher): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      dispatcher,
    });
    if (!res.ok) return false;
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return json?.ok === true;
  } catch {
    return false;
  }
}

const proxies = new Map<string, ProxyAgent>();
function proxyFor(url?: string) {
  if (!url) return undefined;
  let agent = proxies.get(url);
  if (!agent) proxies.set(url, (agent = new ProxyAgent(url)));
  return agent;
}

/** Sends to every configured destination in parallel. */
export async function sendToBots(text: string, env: Pick<Env, 'bale' | 'telegram'>): Promise<DeliveryResult> {
  const result: DeliveryResult = {};
  const jobs: Promise<void>[] = [];
  const payload = (chatId: string) => ({ chat_id: chatId, text, disable_web_page_preview: true });
  if (env.bale) {
    const { base, token, chatId } = env.bale;
    jobs.push(post(`${base}/bot${token}/sendMessage`, payload(chatId)).then((ok) => void (result.bale = ok)));
  }
  if (env.telegram) {
    const { base, token, chatId, proxy } = env.telegram;
    jobs.push(
      post(`${base}/bot${token}/sendMessage`, payload(chatId), proxyFor(proxy)).then((ok) => void (result.telegram = ok)),
    );
  }
  await Promise.all(jobs);
  return result;
}

export const anyDelivered = (r: DeliveryResult) => r.bale === true || r.telegram === true;

/** "bale:ok;telegram:fail" — for the CSV and logs. Never contains personal data. */
export function deliverySummary(r: DeliveryResult, extra: string[] = []): string {
  const parts = (['bale', 'telegram'] as const)
    .filter((k) => r[k] !== undefined)
    .map((k) => `${k}:${r[k] ? 'ok' : 'fail'}`);
  return [...parts, ...extra].join(';') || 'none';
}
