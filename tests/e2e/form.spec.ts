import { test, expect, type Page } from '@playwright/test';

const BOT = 'http://127.0.0.1:4010';
type Call = { body: { text: string } };
const calls = async (page: Page): Promise<Call[]> => (await page.request.get(`${BOT}/__calls`)).json();
const reset = async (page: Page) => page.request.post(`${BOT}/__reset`);

/** The server drops submissions made < 3 s after the form appeared; skip that wait with a fake clock. */
async function openForm(page: Page, url: string) {
  await page.clock.install();
  await page.goto(url);
  await expect(page.locator('form[action="/api/request"]')).toBeVisible();
}
async function submit(page: Page, button: RegExp) {
  await page.clock.fastForward(5000);
  await page.getByRole('button', { name: button }).click();
}

const common = async (page: Page) => {
  await page.locator('#f-name').fill('سارا احمدی');
  await page.locator('#f-phone').fill('۰۹۱۲ ۳۴۵ ۶۷۸۹');
  await page.locator('#f-message').fill('این یک درخواست آزمایشی برای مرکز است.');
};

const CASES: { path: string; label: string; fill: (p: Page) => Promise<void> }[] = [
  {
    path: 'org',
    label: 'سازمان‌ها و کارفرمایان',
    fill: async (p) => {
      await p.locator('#f-org').fill('بانک نمونه');
      await p.locator('#f-area').selectOption('banking-finance');
    },
  },
  { path: 'talent', label: 'نخبگان و استعدادها', fill: async (p) => void (await p.locator('#f-field').fill('بینایی ماشین')) },
  {
    path: 'partner',
    label: 'مجریان و شرکت‌ها',
    fill: async (p) => {
      await p.locator('#f-org').fill('شرکت نمونه');
      await p.locator('#f-field').fill('ربات‌های صنعتی');
      await p.locator('#f-link').fill('example.com/team');
    },
  },
  { path: 'sponsor', label: 'حامیان و سرمایه‌گذاران', fill: async (p) => void (await p.locator('#f-support').selectOption('events')) },
  { path: 'other', label: 'بازدید یا پرسش دیگر', fill: async (p) => void (await p.locator('#f-topic').selectOption('visit')) },
];

for (const c of CASES) {
  test(`submits the ${c.path} path with JS`, async ({ page }) => {
    await reset(page);
    await openForm(page, `/contact?path=${c.path}`);
    await expect(page.locator(`#f-type-${c.path}`)).toBeChecked();
    await common(page);
    await c.fill(page);
    await submit(page, /ارسال درخواست/);
    await expect(page.getByRole('heading', { name: 'درخواست شما ثبت شد' })).toBeFocused();
    await expect(page.getByText(/شناسهٔ درخواست: R\d{6}-\d{6}-[A-Z0-9]{4}/)).toBeVisible();
    const [call] = await calls(page);
    expect(call!.body.text).toContain(`مسیر: ${c.label}`);
    expect(call!.body.text).toContain('تلفن: 09123456789');
    await page.getByRole('button', { name: 'ثبت درخواست دیگر' }).click();
    await expect(page.locator('#f-name')).toHaveValue('');
  });
}

test('client validation: errors under fields, focus on the first invalid one, values kept', async ({ page }) => {
  await openForm(page, '/en/contact');
  await page.locator('#f-name').fill('A');
  await submit(page, /Send request/);
  await expect(page.locator('#f-type-org')).toBeFocused();
  await expect(page.getByText('Choose one of the paths.')).toBeVisible();
  await expect(page.locator('#f-name')).toHaveAttribute('aria-describedby', 'f-name-error');
  await expect(page.locator('#f-name-error')).toHaveText('Enter your full name, at least two letters.');
  await expect(page.locator('#f-name')).toHaveValue('A');
});

test('event registration link pre-fills path, topic, event and message', async ({ page }) => {
  await page.goto('/events');
  await page.locator('#robot-battle-league').getByRole('link', { name: 'ثبت‌نام در رویداد' }).click();
  await expect(page).toHaveURL(/\/contact\?path=other&topic=event&event=robot-battle-league$/);
  await expect(page.locator('#f-type-other')).toBeChecked();
  await expect(page.locator('#f-topic')).toHaveValue('event');
  await expect(page.locator('#f-event')).toHaveValue('robot-battle-league');
  await expect(page.locator('#f-message')).toHaveValue('می‌خواهم در رویداد «لیگ نبرد ربات‌ها» شرکت کنم.');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the form posts directly and lands on /contact?status=ok', async ({ page }) => {
    await reset(page);
    await page.goto('/en/contact');
    await expect(page.locator('#f-area')).toBeHidden();
    await page.locator('#f-type-org').check();
    await expect(page.locator('#f-area')).toBeVisible(); // CSS :has() shows the path fields
    await page.locator('#f-name').fill('Ali Rezaei');
    await page.locator('#f-phone').fill('+989121112233');
    await page.locator('#f-org').fill('Sample Bank');
    await page.locator('#f-area').selectOption('banking-finance');
    await page.locator('#f-message').fill('We want to reduce branch queues.');
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page).toHaveURL(/\/en\/contact\?status=ok&id=R\d{6}-\d{6}-[A-Z0-9]{4}$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your request has been received');
    const [call] = await calls(page);
    expect(call!.body.text).toContain('روش ارسال: فرم بدون جاوااسکریپت');
    expect(call!.body.text).toContain('زبان فرم: انگلیسی');
  });

  test('server errors come back as /contact?status=error', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('#f-type-sponsor').check();
    await page.locator('#f-name').fill('ab');
    await page.locator('#f-phone').fill('123');
    await page.locator('#f-message').fill('یک پیام آزمایشی');
    await page.getByRole('button', { name: 'ارسال درخواست' }).click();
    await expect(page).toHaveURL(/\/contact\?status=error&reason=invalid$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('درخواست ثبت نشد');
  });
});

test('newsletter subscribes with JS', async ({ page }) => {
  await reset(page);
  await page.clock.install();
  await page.goto('/about');
  await page.locator('#nl-email').fill('reader@example.com');
  await page.clock.fastForward(5000);
  await page.getByRole('button', { name: 'عضویت در خبرنامه' }).click();
  await expect(page.getByText('عضویت شما در خبرنامه ثبت شد.')).toBeVisible();
  const [call] = await calls(page);
  expect(call!.body.text).toContain('ایمیل: reader@example.com');
});
