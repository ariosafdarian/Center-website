# CLAUDE.md

Bilingual site for «مرکز پیشرفت هوش مصنوعی و انقلاب ربات‌ها» — Next.js 16 (App Router, TypeScript strict) on Node.
**docs/RFP.md is the source of truth.** Decisions on ambiguities: docs/decisions.md.

## Working rules (from the RFP)
1. Work stage by stage: 0 foundation → 1 design exploration → 2 pages → 3 quality → 4 deployment. Finish each stage against its acceptance criteria in the RFP, report briefly, then **stop** for the owner’s gate.
2. Stage 1: never finalize a visual decision yourself. At every review gate prepare screenshots (`npm run shots -- NN`) and `design/reviews/NN.md` (≤10 lines), then wait. One commit + tag (`design-rN`) per round.
3. Do not write new copy. Move texts verbatim from `reference/v1/content.py`. If something is missing, draft it and flag it in the review note (and as `source: 'draft'` in content).
4. No fake partner logos, stats, news, testimonials or faces.
5. No external resources (Google Fonts, CDNs, analytics). Everything self-hosted.
6. Every new npm package goes into README.md with its reason.
7. After every step `npm run lint`, `npm run lint:fa` and `npm test` must be green.
8. Where the RFP is ambiguous or contradicts itself: ask, don’t guess. Record the answer in docs/decisions.md.

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `ALLOW_SAMPLE=1 npm run build` | Production build (prebuild checks content; fails on `sample: true` without `ALLOW_SAMPLE=1`) |
| `npm start` | Serve the build |
| `npm run lint` | `next typegen` + ESLint + `tsc --noEmit` |
| `npm run lint:fa` | Persian writing rules on messages/fa.json and src/content |
| `npm test` | Vitest unit tests (tests/unit) |
| `npm run e2e` | Playwright: builds, starts a mock bot + `next start`, runs tests/e2e |
| `npm run shots -- NN [baseURL] [paths…]` | Screenshots 1440/390 px into design/reviews/NN/ |
| `npm run check:bot` | Send a test message to the configured Bale/Telegram chats (.env) |
| `npm run check:content` | Content schemas + fa/en key parity |
| `npm run import:v1` | Dump reference/v1/content.py to JSON (mapping step follows) |

## Architecture notes
- Locales: `fa` (default, root, rtl) and `en` (`/en`, ltr). `localeDetection: false` — the URL alone decides.
- `src/proxy.ts` = next-intl routing + rewrite of `/contact?status=…` to the dynamic `contact/result` page (no-JS fallback).
- Every page: `initLocale(params)` (validates + `setRequestLocale`) so it stays static (SSG). Only `/api/*`, `contact/result` and the 404 catch-all are dynamic.
- Content: `src/content/*.ts`, each `{ sample, data }` parsed by zod at import. Bilingual values are `{ fa, en }`; every item has `source: rfp | v1 | draft | pending`.
- UI strings: `messages/{fa,en}.json`, identical key sets (checked at build).
- Forms: `src/lib/validate.ts` (shared browser/server), `handle-form.ts` (pipeline), `bot.ts`, `store.ts` (CSV), `rate-limit.ts`, `env.ts` (server-only).
- CTAs: only via `<Cta path=…>` / `contactHref()` → `/contact?path=<key>`.
- CSS: tokens in `src/styles/tokens.css`, CSS Modules; logical properties only (never left/right). Persian: no letter-spacing, no uppercase, body ≥17px, line-height ≈1.9.

## Persian writing (enforced by lint:fa)
Use «ربات‌ها» not «رباتیک»; «متعهد اصلی» not «پیمانکار»; «مجری / شبکهٔ مجریان»; «کارفرما» not «مشتری»; «لیگ نبرد ربات‌ها». Never: «می‌باشد»، «انجام می‌دهد»، «صورت می‌گیرد»، «توسط»، «در راستای»، «از طریق»; the plan name, «پلکان پیشرفت», «هوش آفرین». ZWNJ in «می‌»، «‌ها»، «‌تر»؛ «ٔ» on silent «ه»; Persian digits; «» ، ؛. Never strip U+200C.
