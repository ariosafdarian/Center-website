import { test, expect } from '@playwright/test';

const PAGES = ['/', '/about', '/services', '/spaces', '/events', '/join', '/contact'];

test('every page renders in both languages with lang/dir and one h1', async ({ page }) => {
  for (const p of PAGES) {
    for (const [prefix, lang, dir] of [['', 'fa', 'rtl'], ['/en', 'en', 'ltr']] as const) {
      const url = prefix + (p === '/' && prefix ? '' : p);
      const res = await page.goto(url);
      expect(res?.status(), url).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', dir);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('header')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('footer')).toHaveCount(1);
      await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main');
    }
  }
});

test('every CTA goes to /contact?path=<key>', async ({ page }) => {
  for (const p of PAGES) {
    for (const prefix of ['', '/en']) {
      await page.goto(prefix + (p === '/' && prefix ? '' : p));
      const hrefs = await page.locator('[data-cta]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
      for (const h of hrefs) expect(h, `${prefix}${p}`).toMatch(new RegExp(`^${prefix}/contact\\?path=(org|talent|partner|sponsor|other)(&|$)`));
      if (p !== '/contact') expect(await page.locator('[data-final-cta]').count()).toBe(1);
      else expect(await page.locator('[data-final-cta]').count()).toBe(0);
    }
  }
});

test('language switch opens the same page in the other language', async ({ page }) => {
  await page.goto('/services');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/en\/services$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('unknown paths show the localized 404', async ({ page }) => {
  let res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('این صفحه پیدا نشد');
  res = await page.goto('/en/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
});

test('no horizontal scroll at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const p of PAGES) {
    await page.goto(p);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, p).toBeLessThanOrEqual(0);
  }
});
