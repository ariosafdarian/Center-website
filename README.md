# Center website

Bilingual (Persian/English) website of «مرکز پیشرفت هوش مصنوعی و انقلاب ربات‌ها», Niavaran, Tehran.
Next.js 16 on Node. Specification: [docs/RFP.md](docs/RFP.md) · decisions: [docs/decisions.md](docs/decisions.md) · working rules: [CLAUDE.md](CLAUDE.md).

**Status: stage 1 (design exploration), round 1.** Three home-page directions at `/lab/a`, `/lab/b`, `/lab/c` (run with `LAB_ENABLED=true`). Site pages are still the unstyled stage 0 skeleton; forms work end to end.

## Quick start

```bash
npm ci
cp .env.example .env          # fill BALE_BOT_TOKEN / BALE_CHAT_ID
npm run dev                   # http://localhost:3000 (fa) and /en
npm run check:bot             # sends a test message to the configured chat(s)
```

Production: `ALLOW_SAMPLE=1 npm run build && npm start` (remove `ALLOW_SAMPLE` once no content file has `sample: true`).

## Checks

```bash
npm run lint && npm run lint:fa && npm test   # after every step
npm run e2e                                    # Playwright, with a mock bot
```

## Packages and why

| Package | Why |
|---|---|
| `next`, `react`, `react-dom` | Framework required by the RFP (Next.js 16.4.5, includes the November 2026 security release) |
| `next-intl` | fa/en routing and messages, required by the RFP |
| `zod` | Validation of form input and content files, required by the RFP |
| `undici` | `ProxyAgent` for Telegram through `TELEGRAM_PROXY` on Iranian hosts (RFP) |
| `server-only` | Fails the build if server code (bot tokens) is imported into client code |
| dev: `typescript`, `@types/*` | TypeScript strict |
| dev: `eslint`, `eslint-config-next` | `npm run lint` |
| dev: `vitest` | Unit tests for `src/lib` (RFP) |
| dev: `@playwright/test` | e2e tests and `npm run shots` (RFP) |
| dev: `tsx` | Runs the TypeScript scripts in `scripts/` |

Fonts are self-hosted files, not packages: `public/fonts/Vazirmatn-Variable.woff2` (from the official `vazirmatn` npm package v33.0.3) and `public/fonts/Inter-Variable-latin.woff2` (from `@fontsource-variable/inter` v5.3.0), both SIL OFL 1.1 (license files next to them).

## Layout

```
src/app/[locale]/      pages (fa at /, en at /en), contact/result (no-JS fallback)
src/app/api/           request/ and newsletter/ (the only server work)
src/content/           structured content, zod-validated, { sample, data }
src/lib/               validate, handle-form, bot, store (CSV), rate-limit, env, format, id
src/components/        layout/ sections/ ui/ forms/ motifs/
messages/              fa.json, en.json (UI strings, identical keys)
scripts/               check-content, lint-fa, check-bot, shots, import-v1
tests/unit, tests/e2e  Vitest and Playwright
data/                  runtime CSV + rate-limit state (git-ignored, mode 700)
```

## Still needed from the owner

- `reference/v1/` (the `_source` folder of `center-website.zip`), `design/references/`, `docs/08-persian-writing-guide.md` — then `npm run import:v1`.
- A real Bale bot token and chat_id to confirm `npm run check:bot`.
- The open items in RFP § "موارد باز".
