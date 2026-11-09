import { PathsSchema, type PathKey } from './schema';

// Labels, audiences and CTA texts (fa) from RFP § "چهار مسیر مخاطب".
// English is a draft pending approval.
export const paths = PathsSchema.parse({
  sample: false,
  data: [
    {
      key: 'org',
      label: { fa: 'سازمان‌ها و کارفرمایان', en: 'Organizations and employers' },
      audience: {
        fa: 'سازمان‌های دولتی و خصوصی، بانک‌ها، شهرداری‌ها، هلدینگ‌ها',
        en: 'Public and private organizations, banks, municipalities, holdings',
      },
      cta: { fa: 'مسئلهٔ سازمانتان را ثبت کنید', en: 'Submit your organization’s problem' },
      source: 'rfp',
    },
    {
      key: 'talent',
      label: { fa: 'نخبگان و استعدادها', en: 'Experts and talent' },
      audience: {
        fa: 'متخصصان، پژوهشگران و دانشجویان هوش مصنوعی و ربات‌ها',
        en: 'AI and robotics specialists, researchers and students',
      },
      cta: { fa: 'درخواست عضویت در ایوان نخبگان', en: 'Apply to join the Elite Iwan' },
      source: 'rfp',
    },
    {
      key: 'partner',
      label: { fa: 'مجریان و شرکت‌ها', en: 'Implementers and companies' },
      audience: {
        fa: 'دانش‌بنیان‌ها، استارتاپ‌ها، تیم‌ها و دانشگاه‌ها',
        en: 'Knowledge-based firms, startups, teams and universities',
      },
      cta: { fa: 'پیوستن به شبکهٔ مجریان', en: 'Join the implementer network' },
      source: 'rfp',
    },
    {
      key: 'sponsor',
      label: { fa: 'حامیان و سرمایه‌گذاران', en: 'Sponsors and investors' },
      audience: {
        fa: 'صندوق‌ها، سرمایه‌گذاران، برندها و حامیان',
        en: 'Funds, investors, brands and supporters',
      },
      cta: { fa: 'حامی مرکز شوید', en: 'Become a sponsor' },
      source: 'rfp',
    },
    {
      key: 'other',
      label: { fa: 'بازدید یا پرسش دیگر', en: 'Visit or other question' },
      audience: { fa: 'هر کس دیگر', en: 'Anyone else' },
      cta: null,
      source: 'rfp',
    },
  ],
});

export const pathKeys = paths.data.map((p) => p.key) as PathKey[];
export const getPath = (key: PathKey) => paths.data.find((p) => p.key === key)!;
