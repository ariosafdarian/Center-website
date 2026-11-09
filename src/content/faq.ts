import { FaqsSchema } from './schema';

// The 8 questions live only in reference/v1/content.py; filled by `npm run import:v1`.
export const faq = FaqsSchema.parse({ sample: true, data: [] });
