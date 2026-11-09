import { ActivitiesSchema } from './schema';

// Domain titles (fa) from RFP § "هفت حوزهٔ فعالیت". The 42 activities live only
// in reference/v1/content.py and are filled by `npm run import:v1`.
export const activities = ActivitiesSchema.parse({
  sample: true,
  data: {
    domains: [
      { key: 'problem-to-project', title: { fa: 'تعریف مسئله و اجرای پروژه', en: 'Problem definition and project delivery' }, source: 'rfp' },
      { key: 'measurement-trust', title: { fa: 'سنجش و اعتماد', en: 'Measurement and trust' }, source: 'rfp' },
      { key: 'talent', title: { fa: 'پرورش و نگهداشت استعداد', en: 'Developing and retaining talent' }, source: 'rfp' },
      { key: 'network-infrastructure', title: { fa: 'شبکه و زیرساخت مشترک', en: 'Network and shared infrastructure' }, source: 'rfp' },
      { key: 'innovation-to-market', title: { fa: 'نوآوری تا بازار', en: 'Innovation to market' }, source: 'rfp' },
      { key: 'governance-narrative', title: { fa: 'حکمرانی و روایت ملی', en: 'Governance and the national narrative' }, source: 'rfp' },
      { key: 'events-media', title: { fa: 'رویداد، رسانه و تجربهٔ عمومی', en: 'Events, media and public experience' }, source: 'rfp' },
    ],
    activities: [],
  },
});
