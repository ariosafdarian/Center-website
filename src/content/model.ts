import { ModelSchema } from './schema';

// Verbatim from RFP §§ "دربارهٔ مرکز و پیام اصلی" and "مدل کار مرکز". English is a draft.
export const model = ModelSchema.parse({
  sample: false,
  data: {
    message: {
      fa: 'مرکز متعهد اصلی پروژه‌های هوش مصنوعی و ربات‌ها در ایران است؛ وصل می‌کند، می‌سنجد و تضمین می‌کند، ولی خودش اجرا نمی‌کند.',
      en: 'The Center is the prime party accountable for AI and robotics projects in Iran. It connects, measures and guarantees, but does not implement.',
    },
    steps: [
      {
        key: 'define',
        title: { fa: 'تعریف مسئله', en: 'Define the problem' },
        body: {
          fa: 'وضع موجود را اندازه می‌گیرد، مسئله را دقیق تعریف می‌کند و شرح کار و خط مبنا می‌نویسد.',
          en: 'Measures the current state, defines the problem precisely and writes the scope of work and the baseline.',
        },
        source: 'rfp',
      },
      {
        key: 'connect',
        title: { fa: 'اتصال مجری', en: 'Connect an implementer' },
        body: {
          fa: 'مناسب‌ترین مجری ایرانی را از شبکه‌ای رتبه‌بندی‌شده برمی‌گزیند.',
          en: 'Selects the best-suited Iranian implementer from a ranked network.',
        },
        source: 'rfp',
      },
      {
        key: 'measure',
        title: { fa: 'سنجش و تضمین', en: 'Measure and guarantee' },
        body: {
          fa: 'بر اجرا نظارت می‌کند و نتیجه و صرفه‌جویی را مستقل حسابرسی و تضمین می‌کند.',
          en: 'Oversees delivery and independently audits and guarantees the results and savings.',
        },
        source: 'rfp',
      },
    ],
    contract: {
      fa: 'مرکز قرارداد نتیجه‌محور را خودش با کارفرما می‌بندد و با مجری قراردادی جداگانه دارد؛ پس رقیب مجریان نیست و شریک همهٔ آن‌هاست.',
      en: 'The Center signs the outcome-based contract with the employer itself and holds a separate contract with the implementer, so it competes with no implementer and partners with all of them.',
    },
    gap: {
      groups: [
        { key: 'problem', title: { fa: 'مسئله', en: 'Problems' }, source: 'rfp' },
        { key: 'capability', title: { fa: 'توان ساختن', en: 'Capability to build' }, source: 'rfp' },
        { key: 'capital-market', title: { fa: 'سرمایه و بازار', en: 'Capital and market' }, source: 'rfp' },
      ],
      core: { fa: 'اعتماد و سنجش', en: 'Trust and measurement' },
    },
    domainsCount: 7,
    activitiesCount: 42,
  },
});
