import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/**
 * Locale routing (next-intl) plus one rewrite: the no-JS form fallback
 * redirects to /contact?status=… ; the static /contact page cannot read the
 * query without JS, so that URL is served by the small dynamic
 * /[locale]/contact/result page instead. The visible URL stays the same.
 */
export default function proxy(request: NextRequest) {
  const { pathname, searchParams, search } = request.nextUrl;
  const m = pathname.match(/^\/(?:(en|fa)\/)?contact\/?$/);
  if (m && searchParams.has('status')) {
    const locale = m[1] ?? routing.defaultLocale;
    return NextResponse.rewrite(new URL(`/${locale}/contact/result${search}`, request.url));
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
