/**
 * npm run shots -- <round> [baseURL] [path ...]
 * Full-page screenshots at 1440 px (desktop) and 390 px (mobile) into
 * design/reviews/<round>/, for the stage 1 review gates.
 * Example: npm run shots -- 01 http://localhost:3000 /lab/a /lab/b /lab/c
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [round, base = 'http://localhost:3000', ...rest] = process.argv.slice(2);
if (!round || !/^\d{2}$/.test(round)) {
  console.error('Usage: npm run shots -- <NN> [baseURL] [path ...]   e.g. npm run shots -- 01');
  process.exit(1);
}
const pages = rest.length
  ? rest
  : ['/', '/about', '/services', '/spaces', '/events', '/join', '/contact'].flatMap((p) => [p, p === '/' ? '/en' : `/en${p}`]);
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const SYSTEM_CHROMIUM = '/opt/pw-browsers/chromium';

async function main() {
  const out = path.join('design', 'reviews', round!);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(fs.existsSync(SYSTEM_CHROMIUM) ? { executablePath: SYSTEM_CHROMIUM } : {});
  for (const vp of VIEWPORTS) {
    // Reduced motion: scroll-driven reveals would leave off-screen sections blank in a full-page capture.
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(new URL(p, base).toString(), { waitUntil: 'networkidle' });
      // Lab chrome stays out of review screenshots; give the hero canvas time to draw.
      await page.addStyleTag({ content: '[data-lab-switcher]{display:none!important}' });
      await page.waitForSelector('canvas[data-ready]', { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1200);
      const slug = p.replace(/^\//, '').replace(/[/?&=]+/g, '_') || 'home';
      const file = path.join(out, `${slug}--${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`✓ ${file}`);
    }
    await ctx.close();
  }
  await browser.close();
}
void main();
