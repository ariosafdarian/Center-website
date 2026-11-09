import http from 'node:http';
import type { AddressInfo } from 'node:net';

export type BotCall = { path: string; body: { chat_id: string; text: string; disable_web_page_preview: boolean } };

/** Fake Bale/Telegram API. A token containing "fail" gets {ok:false}. */
export async function startMockBot(port = 0) {
  const calls: BotCall[] = [];
  const server = http.createServer((req, res) => {
    // Introspection for e2e tests
    if (req.method === 'GET' && req.url === '/__calls') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(calls));
    }
    if (req.method === 'POST' && req.url === '/__reset') {
      calls.length = 0;
      res.writeHead(204);
      return res.end();
    }
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      const body = JSON.parse(data || '{}');
      calls.push({ path: req.url ?? '', body });
      const ok = !(req.url ?? '').includes('fail');
      res.writeHead(ok ? 200 : 401, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok }));
    });
  });
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r));
  const actual = (server.address() as AddressInfo).port;
  return {
    base: `http://127.0.0.1:${actual}`,
    calls,
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}

// `tsx tests/helpers/mock-bot.ts 4010` runs it standalone (used by Playwright).
if (process.argv[1]?.endsWith('mock-bot.ts')) {
  const port = Number(process.argv[2] ?? 4010);
  startMockBot(port).then((b) => console.log(`mock bot on ${b.base}`));
}
