import { SpacesSchema } from './schema';

// Titles and access rules from RFP § "سه لایهٔ فضا". Components come from v1.
export const spaces = SpacesSchema.parse({
  sample: true,
  data: [
    {
      key: 'trade-hall',
      layer: 1,
      title: { fa: 'تالار تجارت', en: 'Trade Hall' },
      access: { fa: 'به روی همه باز', en: 'Open to everyone' },
      components: [],
      source: 'rfp',
    },
    {
      key: 'elite-iwan',
      layer: 2,
      title: { fa: 'ایوان نخبگان', en: 'Elite Iwan' },
      access: { fa: 'با کارت عضویت', en: 'With a membership card' },
      components: [],
      source: 'rfp',
    },
    {
      key: 'tech-garden',
      layer: 3,
      title: { fa: 'باغ فناوری', en: 'Technology Garden' },
      access: { fa: 'ساکنان و مهمانان دعوت‌شده', en: 'Residents and invited guests' },
      components: [],
      source: 'rfp',
    },
  ],
});
