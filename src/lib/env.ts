import 'server-only';
import path from 'node:path';
import { z } from 'zod';

const bool = z
  .string()
  .optional()
  .transform((v) => v === undefined || v === '' || /^(1|true|yes|on)$/i.test(v));
const opt = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const EnvSchema = z.object({
  BALE_BOT_TOKEN: opt,
  BALE_CHAT_ID: opt,
  TELEGRAM_BOT_TOKEN: opt,
  TELEGRAM_CHAT_ID: opt,
  TELEGRAM_PROXY: opt,
  SAVE_TO_FILE: bool,
  DATA_DIR: opt,
  RATE_LIMIT_PER_HOUR: z.coerce.number().int().min(1).max(10_000).catch(6),
  ALLOWED_ORIGINS: opt,
  BALE_API_BASE: opt,
  TELEGRAM_API_BASE: opt,
});

export type Env = {
  bale?: { token: string; chatId: string; base: string };
  telegram?: { token: string; chatId: string; base: string; proxy?: string };
  saveToFile: boolean;
  dataDir: string;
  ratePerHour: number;
  allowedOrigins: string[];
};

/** Read on every call so tests (and a restarted process) see current values. */
export function getEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const e = EnvSchema.parse(source);
  return {
    bale:
      e.BALE_BOT_TOKEN && e.BALE_CHAT_ID
        ? { token: e.BALE_BOT_TOKEN, chatId: e.BALE_CHAT_ID, base: e.BALE_API_BASE ?? 'https://tapi.bale.ai' }
        : undefined,
    telegram:
      e.TELEGRAM_BOT_TOKEN && e.TELEGRAM_CHAT_ID
        ? {
            token: e.TELEGRAM_BOT_TOKEN,
            chatId: e.TELEGRAM_CHAT_ID,
            base: e.TELEGRAM_API_BASE ?? 'https://api.telegram.org',
            proxy: e.TELEGRAM_PROXY,
          }
        : undefined,
    saveToFile: e.SAVE_TO_FILE,
    dataDir: path.resolve(/*turbopackIgnore: true*/ e.DATA_DIR ?? './data'),
    ratePerHour: e.RATE_LIMIT_PER_HOUR,
    allowedOrigins: (e.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim().replace(/\/+$/, ''))
      .filter(Boolean),
  };
}
