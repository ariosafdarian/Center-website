import { SiteSchema } from './schema';

// Sample values from RFP § "داده‌های نمونه". Replace before public launch (stage 4).
export const site = SiteSchema.parse({
  sample: true,
  data: {
    name: {
      full: { fa: 'مرکز پیشرفت هوش مصنوعی و انقلاب ربات‌ها', en: 'Center for AI Advancement and the Robot Revolution' },
      line1: { fa: 'مرکز پیشرفت هوش مصنوعی', en: 'Center for AI Advancement' },
      line2: { fa: 'و انقلاب ربات‌ها', en: 'and the Robot Revolution' },
      short: { fa: 'مرکز', en: 'the Center' },
    },
    slogan: {
      parts: [
        { fa: 'وصل می‌کنیم', en: 'We connect' },
        { fa: 'می‌سنجیم', en: 'We measure' },
        { fa: 'تضمین می‌کنیم', en: 'We guarantee' },
      ],
    },
    address: { fa: 'تهران، نیاوران', en: 'Niavaran, Tehran' },
    phone: { e164: '+982122000000', display: { fa: '۰۲۱-۲۲۰۰ ۰۰۰۰', en: '021-2200 0000' } },
    email: 'info@example.com',
    hours: { fa: 'شنبه تا چهارشنبه، ساعت ۹ تا ۱۸', en: 'Saturday to Wednesday, 9:00 to 18:00' },
    socials: [
      { key: 'bale', label: { fa: 'بله', en: 'Bale' }, url: 'https://ble.ir/' },
      { key: 'instagram', label: { fa: 'اینستاگرام', en: 'Instagram' }, url: 'https://instagram.com/' },
      { key: 'linkedin', label: { fa: 'لینکدین', en: 'LinkedIn' }, url: 'https://linkedin.com/' },
    ],
    domain: '',
  },
});
