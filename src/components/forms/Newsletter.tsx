'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { validateNewsletter } from '@/lib/validate';
import { useHydrated } from '@/lib/use-hydrated';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok' } | { kind: 'error'; message: string };

/** Works without JS (plain POST → 303), enhanced with fetch when JS is available. */
export function Newsletter() {
  const t = useTranslations();
  const locale = useLocale();
  const shownAt = useRef(0);
  const hydrated = useHydrated();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validateNewsletter({ email });
    if (!v.ok) {
      setState({ kind: 'error', message: t('form.errors.email') });
      return;
    }
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: v.data.email,
          lang: locale,
          website: hp,
          el: Math.round((Date.now() - shownAt.current) / 1000),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (body.ok) return setState({ kind: 'ok' });
      const key = body.error === 'rate' || body.error === 'origin' ? body.error : body.error === 'invalid' ? 'email' : 'server';
      setState({ kind: 'error', message: t(`form.errors.${key}`) });
    } catch {
      setState({ kind: 'error', message: t('form.errors.network') });
    }
  }

  const sending = state.kind === 'sending';
  return (
    <section aria-labelledby="newsletter-title" id="newsletter">
      <h2 id="newsletter-title">{t('newsletter.title')}</h2>
      {state.kind === 'ok' ? (
        <p role="status">{t('newsletter.ok')}</p>
      ) : (
        <form method="post" action="/api/newsletter" onSubmit={onSubmit} noValidate={hydrated}>
          <input type="hidden" name="lang" value={locale} />
          <div className="hp" aria-hidden="true">
            <label htmlFor="nl-website">{t('form.honeypot')}</label>
            <input id="nl-website" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>
          <label htmlFor="nl-email">{t('newsletter.label')}</label>
          <input
            id="nl-email"
            name="email"
            type="email"
            dir="ltr"
            required
            maxLength={120}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={state.kind === 'error' || undefined}
            aria-describedby={state.kind === 'error' ? 'nl-error' : 'nl-privacy'}
          />
          <button type="submit" disabled={sending} aria-busy={sending || undefined}>
            {sending ? t('newsletter.sending') : t('newsletter.submit')}
          </button>
          <p id="nl-error" role="alert">
            {state.kind === 'error' ? state.message : null}
          </p>
          <p id="nl-privacy">{t('newsletter.privacy')}</p>
        </form>
      )}
    </section>
  );
}
