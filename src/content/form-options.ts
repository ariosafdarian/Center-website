import { FormOptionsSchema } from './schema';

// RFP: option lists live in content.py (key `contact`). Until import:v1 runs,
// `area`, `size` and `support` are DRAFT lists so the form works end to end.
// `topic` values are fixed by the RFP; their labels are drafts.
export const formOptions = FormOptionsSchema.parse({
  sample: true,
  data: {
    source: 'draft',
    area: [
      { value: 'banking-finance', label: { fa: 'بانک و مالی', en: 'Banking and finance' } },
      { value: 'urban', label: { fa: 'شهر و شهرداری', en: 'Cities and municipalities' } },
      { value: 'industry-energy', label: { fa: 'صنعت و انرژی', en: 'Industry and energy' } },
      { value: 'health', label: { fa: 'سلامت', en: 'Health' } },
      { value: 'government', label: { fa: 'خدمات دولتی', en: 'Public services' } },
      { value: 'other', label: { fa: 'حوزهٔ دیگر', en: 'Other' } },
    ],
    size: [
      { value: 'lt-50', label: { fa: 'کمتر از ۵۰ نفر', en: 'Fewer than 50 people' } },
      { value: '50-250', label: { fa: '۵۰ تا ۲۵۰ نفر', en: '50 to 250 people' } },
      { value: '250-1000', label: { fa: '۲۵۰ تا ۱۰۰۰ نفر', en: '250 to 1,000 people' } },
      { value: 'gt-1000', label: { fa: 'بیش از ۱۰۰۰ نفر', en: 'More than 1,000 people' } },
    ],
    support: [
      { value: 'events', label: { fa: 'حمایت از رویدادها', en: 'Event sponsorship' } },
      { value: 'talent', label: { fa: 'حمایت از استعدادها', en: 'Talent support' } },
      { value: 'infrastructure', label: { fa: 'زیرساخت مشترک', en: 'Shared infrastructure' } },
      { value: 'investment', label: { fa: 'سرمایه‌گذاری در پروژه‌ها', en: 'Project investment' } },
      { value: 'other', label: { fa: 'شکل دیگر', en: 'Other' } },
    ],
    topic: [
      { value: 'event', label: { fa: 'ثبت‌نام در رویداد', en: 'Event registration' } },
      { value: 'visit', label: { fa: 'بازدید از مرکز', en: 'Visiting the Center' } },
      { value: 'venue', label: { fa: 'اجارهٔ فضا برای رویداد', en: 'Booking a space' } },
      { value: 'press', label: { fa: 'رسانه و مطبوعات', en: 'Press and media' } },
      { value: 'other', label: { fa: 'پرسش دیگر', en: 'Other question' } },
    ],
  },
});

export const optionValues = {
  area: formOptions.data.area.map((o) => o.value),
  size: formOptions.data.size.map((o) => o.value),
  support: formOptions.data.support.map((o) => o.value),
} as const;
