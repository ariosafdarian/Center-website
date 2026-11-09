'use client';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { validateRequest, PATH_TYPES, LIMITS, type RequestType, type FieldErrors, type ErrorCode } from '@/lib/validate';
import { useHydrated } from '@/lib/use-hydrated';
import styles from './ContactForm.module.css';

type Option = { value: string; label: string };
export type ContactFormProps = {
  paths: { key: RequestType; label: string; audience: string }[];
  options: { area: Option[]; size: Option[]; support: Option[]; topic: Option[] };
  events: Option[];
  phone: { e164: string; display: string };
};

const DETAILS_BY_TYPE: Record<RequestType, string[]> = {
  org: ['area', 'size'],
  talent: ['field', 'link'],
  partner: ['field', 'link'],
  sponsor: ['support'],
  other: ['topic', 'event'],
};
/** DOM order, used to focus the first invalid field. */
const FIELD_ORDER = ['type', 'name', 'phone', 'email', 'org', 'role', 'area', 'size', 'field', 'link', 'support', 'topic', 'event', 'message'];
const ORG_REQUIRED: RequestType[] = ['org', 'partner'];

type Values = Record<string, string>;
const EMPTY: Values = { name: '', phone: '', email: '', org: '', role: '', message: '', area: '', size: '', field: '', link: '', support: '', topic: '', event: '', website: '' };

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success'; id: string } | { kind: 'error'; message: string };

export function ContactForm({ paths, options, events, phone }: ContactFormProps) {
  const t = useTranslations('form');
  const locale = useLocale();
  const hydrated = useHydrated();
  const [type, setType] = useState<RequestType | ''>('');
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const shownAt = useRef(0);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Pre-select from ?path=, ?topic=, ?event= (static page: read on the client).
  useEffect(() => {
    shownAt.current = Date.now();
    const q = new URLSearchParams(window.location.search);
    const path = q.get('path');
    const next: Values = { ...EMPTY };
    if (path && (PATH_TYPES as readonly string[]).includes(path)) setType(path as RequestType);
    const topic = q.get('topic');
    if (topic && options.topic.some((o) => o.value === topic)) next.topic = topic;
    const ev = events.find((e) => e.value === q.get('event'));
    if (ev) {
      next.event = ev.value;
      next.topic = 'event';
      next.message = t('eventMessage', { event: ev.label });
    }
    setValues(next);
  }, [events, options.topic, t]);

  useEffect(() => {
    if (status.kind === 'success') successRef.current?.focus();
  }, [status.kind]);

  const set = (k: string) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function message(field: string, code: ErrorCode): string {
    if (field === 'type') return t('errors.type');
    if (t.has(`errors.${field}.${code}`)) return t(`errors.${field}.${code}`);
    if (t.has(`errors.${field}`)) return t(`errors.${field}`);
    return t('errors.generic');
  }

  function focusFirst(fields: FieldErrors) {
    const first = FIELD_ORDER.find((f) => fields[f]);
    if (!first) return;
    const el = document.getElementById(first === 'type' ? `f-type-${PATH_TYPES[0]}` : `f-${first}`);
    el?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === 'sending') return;
    const details = type ? Object.fromEntries(DETAILS_BY_TYPE[type].map((k) => [k, values[k] ?? ''])) : {};
    const payload = {
      type,
      name: values.name,
      phone: values.phone,
      email: values.email,
      org: values.org,
      role: values.role,
      message: values.message,
      details,
      lang: locale,
      website: values.website,
      el: Math.round((Date.now() - shownAt.current) / 1000),
    };
    const v = validateRequest(payload);
    if (!v.ok) {
      setErrors(v.fields);
      setStatus({ kind: 'error', message: t('errorSummary') });
      focusFirst(v.fields);
      return;
    }
    setErrors({});
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string; fields?: FieldErrors };
      if (body.ok && body.id) {
        setStatus({ kind: 'success', id: body.id });
        return;
      }
      if (body.error === 'invalid' && body.fields && Object.keys(body.fields).length) {
        setErrors(body.fields);
        setStatus({ kind: 'error', message: t('errorSummary') });
        focusFirst(body.fields);
        return;
      }
      const key = body.error === 'rate' || body.error === 'origin' ? body.error : 'server';
      setStatus({ kind: 'error', message: t(`errors.${key}`) });
    } catch {
      setStatus({ kind: 'error', message: t('errors.network') });
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStatus({ kind: 'idle' });
    shownAt.current = Date.now();
  }

  if (status.kind === 'success') {
    return (
      <div role="status" className={styles.success}>
        <h2 ref={successRef} tabIndex={-1}>
          {t('successTitle')}
        </h2>
        <p>{t('successId', { id: status.id })}</p>
        <p>
          {t('successPhone')}{' '}
          <a href={`tel:${phone.e164}`} dir="ltr">
            {phone.display}
          </a>
        </p>
        <button type="button" onClick={reset}>
          {t('again')}
        </button>
      </div>
    );
  }

  const field = (
    name: string,
    label: string,
    control: (common: Record<string, unknown>) => ReactNode,
    opts: { optional?: ReactNode; hint?: string; dataFor?: string } = {},
  ) => {
    const err = errors[name];
    const describedBy = [opts.hint ? `f-${name}-hint` : null, err ? `f-${name}-error` : null].filter(Boolean).join(' ') || undefined;
    return (
      <div className={styles.field} data-for={opts.dataFor}>
        <label htmlFor={`f-${name}`}>
          {label}
          {opts.optional}
        </label>
        {opts.hint ? <p id={`f-${name}-hint`}>{opts.hint}</p> : null}
        {control({
          id: `f-${name}`,
          name,
          value: values[name] ?? '',
          onChange: set(name),
          'aria-invalid': err ? true : undefined,
          'aria-describedby': describedBy,
        })}
        {err ? (
          <p id={`f-${name}-error`} className={styles.error}>
            {message(name, err)}
          </p>
        ) : null}
      </div>
    );
  };

  const optional = <span className={styles.optional}> ({t('optional')})</span>;
  const select = (list: Option[]) =>
    function SelectControl(common: Record<string, unknown>) {
      return (
    <select {...common}>
      <option value="">{t('choose')}</option>
      {list.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
      );
    };

  const sending = status.kind === 'sending';
  return (
    <form method="post" action="/api/request" noValidate={hydrated} onSubmit={onSubmit} className={styles.form} aria-describedby="f-privacy">
      <input type="hidden" name="lang" value={locale} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">{t('honeypot')}</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>

      <fieldset aria-describedby={errors.type ? 'f-type-error' : undefined}>
        <legend>{t('pathLegend')}</legend>
        {paths.map((p) => (
          <div key={p.key} className={styles.card}>
            <input
              type="radio"
              id={`f-type-${p.key}`}
              name="type"
              value={p.key}
              required
              checked={type === p.key}
              onChange={() => {
                setType(p.key);
                setErrors((er) => ({ ...er, type: undefined }));
              }}
            />
            <label htmlFor={`f-type-${p.key}`}>
              <strong>{p.label}</strong>
              <span>{p.audience}</span>
            </label>
          </div>
        ))}
        {errors.type ? (
          <p id="f-type-error" className={styles.error}>
            {message('type', errors.type)}
          </p>
        ) : null}
      </fieldset>

      {field('name', t('name'), (c) => <input {...c} type="text" autoComplete="name" required maxLength={LIMITS.name.max} />)}
      {field(
        'phone',
        t('phone'),
        (c) => <input {...c} type="tel" inputMode="tel" dir="ltr" autoComplete="tel" required maxLength={40} />,
        { hint: t('phoneHint') },
      )}
      {field('email', t('email'), (c) => <input {...c} type="email" dir="ltr" autoComplete="email" maxLength={LIMITS.email} />, { optional })}
      {field('org', t('org'), (c) => <input {...c} type="text" autoComplete="organization" maxLength={LIMITS.org} />, {
        optional: (
          <span className={styles.optional} data-unless={ORG_REQUIRED.join(' ')}>
            {' '}
            ({t('optional')})
          </span>
        ),
      })}
      {field('role', t('role'), (c) => <input {...c} type="text" autoComplete="organization-title" maxLength={LIMITS.role} />, { optional })}

      {/* Path-specific fields. CSS (:has) shows them for the checked path, so this works without JS too. */}
      {field('area', t('area'), select(options.area), { dataFor: 'org' })}
      {field('size', t('size'), select(options.size), { dataFor: 'org', optional })}
      {field('field', t('field'), (c) => <input {...c} type="text" maxLength={LIMITS.field} />, { dataFor: 'talent partner' })}
      {field('link', t('link'), (c) => <input {...c} type="text" inputMode="url" dir="ltr" maxLength={LIMITS.link} />, {
        dataFor: 'talent partner',
        optional,
      })}
      {field('support', t('support'), select(options.support), { dataFor: 'sponsor' })}
      {field('topic', t('topic'), select(options.topic), { dataFor: 'other' })}
      {field('event', t('event'), select(events), { dataFor: 'other', optional })}

      {field('message', t('message'), (c) => <textarea {...c} rows={6} required minLength={LIMITS.message.min} maxLength={LIMITS.message.max} />)}

      <p role="alert" className={styles.error}>
        {status.kind === 'error' ? status.message : null}
      </p>
      <button type="submit" disabled={sending} aria-busy={sending || undefined}>
        {sending ? t('sending') : t('submit')}
      </button>
      <p id="f-privacy">{t('privacy')}</p>
    </form>
  );
}
