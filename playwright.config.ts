import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

// Cloud/CI images ship a Chromium that may not match this Playwright version.
const SYSTEM_CHROMIUM = '/opt/pw-browsers/chromium';
const launchOptions = fs.existsSync(SYSTEM_CHROMIUM) && !process.env.PW_BUNDLED ? { executablePath: SYSTEM_CHROMIUM } : {};

const PORT = 3200;
const BOT_PORT = 4010;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'off',
    launchOptions,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions } }],
  webServer: [
    {
      command: `npx tsx tests/helpers/mock-bot.ts ${BOT_PORT}`,
      url: `http://127.0.0.1:${BOT_PORT}/__calls`,
      reuseExistingServer: false,
    },
    {
      // Builds once, then serves the production bundle against the mock bot.
      command: `npm run build && npx next start -p ${PORT}`,
      url: `http://127.0.0.1:${PORT}/`,
      timeout: 300_000,
      reuseExistingServer: false,
      env: {
        ALLOW_SAMPLE: '1',
        BALE_BOT_TOKEN: 'e2e',
        BALE_CHAT_ID: '1',
        BALE_API_BASE: `http://127.0.0.1:${BOT_PORT}`,
        TELEGRAM_BOT_TOKEN: '',
        DATA_DIR: 'test-results/e2e-data',
        RATE_LIMIT_PER_HOUR: '1000',
        ALLOWED_ORIGINS: '',
      },
    },
  ],
});

export const BOT_URL = `http://127.0.0.1:${BOT_PORT}`;
