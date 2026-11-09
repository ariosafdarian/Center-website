/**
 * npm run check:bot — sends one test message to every configured destination
 * (Bale and/or Telegram) using .env, and prints the result for each.
 */
import fs from 'node:fs';
import { getEnv } from '../src/lib/env';
import { sendToBots } from '../src/lib/bot';
import { jalaliDateTime } from '../src/lib/format';

if (fs.existsSync('.env')) process.loadEnvFile('.env');
const env = getEnv();

const targets = [env.bale && 'bale', env.telegram && 'telegram'].filter(Boolean);
if (!targets.length) {
  console.error('✗ هیچ مقصدی پیکربندی نشده است. BALE_BOT_TOKEN و BALE_CHAT_ID (یا متغیرهای تلگرام) را در .env بنویسید.');
  process.exit(1);
}

const text = ['🔧 پیام آزمایشی از سایت مرکز', `زمان: ${jalaliDateTime(new Date())} (وقت تهران)`].join('\n');
console.log(`Sending a test message to: ${targets.join(', ')}${env.telegram?.proxy ? ' (Telegram via proxy)' : ''} …`);
void sendToBots(text, env).then((result) => {
  let failed = false;
  for (const [k, ok] of Object.entries(result)) {
    console.log(`${ok ? '✓' : '✗'} ${k}: ${ok ? 'delivered' : 'FAILED (check token, chat_id and network)'}`);
    failed ||= !ok;
  }
  process.exit(failed ? 1 : 0);
});
