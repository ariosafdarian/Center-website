import { handleForm } from '@/lib/handle-form';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(req: Request) {
  return handleForm(req, 'request');
}
