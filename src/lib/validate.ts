/**
 * Request & newsletter validation — shared by the browser form and the API.
 * Mirrors send.php: normalize, clean, truncate, then validate with zod.
 * Error codes (RFP): required | phone | email | url | short
 */
import { z } from 'zod';
import { optionValues } from '@/content/form-options';
import { LIMITS, clean, normalizePhone, isPhone, isEmail, normalizeLink } from './normalize';

export { LIMITS, clean, truncate, normalizePhone, isPhone, isEmail, normalizeLink, toLatinDigits } from './normalize';

export const PATH_TYPES = ['org', 'talent', 'partner', 'sponsor', 'other'] as const;
export type RequestType = (typeof PATH_TYPES)[number];
export const TOPICS = ['event', 'visit', 'venue', 'press', 'other'] as const;
export type ErrorCode = 'required' | 'phone' | 'email' | 'url' | 'short';
export type FieldErrors = Partial<Record<string, ErrorCode>>;



/** Keys of `details` per type. Also the flat names accepted from no-JS forms. */
export const DETAIL_KEYS = ['area', 'size', 'field', 'link', 'support', 'topic', 'event'] as const;

// ---------- schemas ----------

const s = (max: number, multiline = false) =>
  z.preprocess((v) => clean(v, max, multiline), z.string());

const requiredText = (max: number, min = 1, multiline = false) =>
  s(max, multiline).pipe(z.string().min(1, { error: 'required' }).min(min, { error: 'short' }));

const phone = s(40).pipe(
  z
    .string()
    .min(1, { error: 'required' })
    .transform(normalizePhone)
    .refine(isPhone, { error: 'phone' }),
);

const email = s(LIMITS.email).pipe(z.string().refine((v) => v === '' || isEmail(v), { error: 'email' }));

const choice = (values: readonly string[], required: boolean) =>
  s(60).pipe(
    z.string().refine((v) => (v === '' ? !required : values.includes(v)), { error: 'required' }),
  );

const link = s(LIMITS.link).pipe(
  z
    .string()
    .transform((v) => normalizeLink(v))
    .refine((v): v is string => v !== null, { error: 'url' }),
);

const base = {
  name: requiredText(LIMITS.name.max, LIMITS.name.min),
  phone,
  email,
  role: s(LIMITS.role),
  message: requiredText(LIMITS.message.max, LIMITS.message.min, true),
};
const orgOptional = s(LIMITS.org);
const orgRequired = requiredText(LIMITS.org);

const fieldLink = z.object({ field: requiredText(LIMITS.field), link });

export const RequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('org'),
    ...base,
    org: orgRequired,
    details: z.object({ area: choice(optionValues.area, true), size: choice(optionValues.size, false) }),
  }),
  z.object({ type: z.literal('talent'), ...base, org: orgOptional, details: fieldLink }),
  z.object({ type: z.literal('partner'), ...base, org: orgRequired, details: fieldLink }),
  z.object({
    type: z.literal('sponsor'),
    ...base,
    org: orgOptional,
    details: z.object({ support: choice(optionValues.support, true) }),
  }),
  z.object({
    type: z.literal('other'),
    ...base,
    org: orgOptional,
    details: z.object({
      topic: choice(TOPICS, true),
      event: s(80).pipe(z.string().refine((v) => v === '' || /^[a-z0-9-]+$/.test(v), { error: 'required' })),
    }),
  }),
]);

export type RequestData = z.infer<typeof RequestSchema>;

export type Lang = 'fa' | 'en';
export const toLang = (v: unknown): Lang => (v === 'en' ? 'en' : 'fa');

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; fields: FieldErrors };

/**
 * Accepts the JSON shape ({…, details:{…}}) or a flat no-JS form body
 * (area=…, field=…). Extra keys are ignored.
 */
export function shapeRequestInput(raw: Record<string, unknown>): Record<string, unknown> {
  const details: Record<string, unknown> =
    raw.details && typeof raw.details === 'object' ? { ...(raw.details as Record<string, unknown>) } : {};
  for (const k of DETAIL_KEYS) if (details[k] === undefined && raw[k] !== undefined) details[k] = raw[k];
  return { ...raw, details };
}

function collect(issues: z.core.$ZodIssue[]): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of issues) {
    // details.area → area (detail keys never collide with top-level keys)
    const key = String(issue.path[issue.path.length - 1] ?? 'form');
    const code = (['required', 'phone', 'email', 'url', 'short'] as const).find((c) => c === issue.message) ?? 'required';
    if (!fields[key]) fields[key] = code;
  }
  return fields;
}

export function validateRequest(raw: Record<string, unknown>): ValidationResult<RequestData> {
  const input = shapeRequestInput(raw);
  if (!PATH_TYPES.includes(input.type as RequestType)) {
    // Still report the common fields, so the user sees every problem at once.
    const probe = RequestSchema.safeParse({ ...input, type: 'other', details: { topic: 'other' } });
    return { ok: false, fields: { type: 'required', ...(probe.success ? {} : collect(probe.error.issues)) } };
  }
  const r = RequestSchema.safeParse(input);
  return r.success ? { ok: true, data: r.data } : { ok: false, fields: collect(r.error.issues) };
}

export const NewsletterSchema = z.object({
  email: s(LIMITS.email).pipe(z.string().min(1, { error: 'required' }).refine(isEmail, { error: 'email' })),
});
export type NewsletterData = z.infer<typeof NewsletterSchema>;

export function validateNewsletter(raw: Record<string, unknown>): ValidationResult<NewsletterData> {
  const r = NewsletterSchema.safeParse(raw);
  return r.success ? { ok: true, data: r.data } : { ok: false, fields: collect(r.error.issues) };
}
