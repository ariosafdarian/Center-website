import { NetworkSchema } from './schema';

// The seven rings are named only in reference/v1/content.py.
// Placeholders until `npm run import:v1`.
const pending = (n: number) => ({
  key: `ring-${n}`,
  title: { fa: `حلقهٔ ${'۱۲۳۴۵۶۷'[n - 1]}`, en: `Ring ${n}` },
  summary: null,
  source: 'pending' as const,
});

export const network = NetworkSchema.parse({
  sample: true,
  data: [1, 2, 3, 4, 5, 6, 7].map(pending),
});
