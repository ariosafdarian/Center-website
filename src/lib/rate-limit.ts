import { promises as fs, readFileSync } from 'node:fs';
import path from 'node:path';

const HOUR = 60 * 60 * 1000;
type State = Record<string, Record<string, number[]>>; // bucket → ip → timestamps

/**
 * Hourly sliding window per IP. Only accepted requests are recorded (`hit`).
 * Kept in memory and mirrored to DATA_DIR/ratelimit.json so a restart does not reset it.
 */
export class RateLimiter {
  private state: State = {};
  private loaded = false;
  private writing: Promise<void> = Promise.resolve();

  constructor(private readonly file: string | null) {}

  private load() {
    if (this.loaded) return;
    this.loaded = true;
    if (!this.file) return;
    try {
      const parsed = JSON.parse(readFileSync(this.file, 'utf8')) as State;
      if (parsed && typeof parsed === 'object') this.state = parsed;
    } catch {
      /* missing or corrupt file → start empty */
    }
  }

  private recent(bucket: string, ip: string, now: number) {
    const list = (this.state[bucket]?.[ip] ?? []).filter((t) => now - t < HOUR);
    (this.state[bucket] ??= {})[ip] = list;
    return list;
  }

  allowed(bucket: string, ip: string, limit: number, now = Date.now()): boolean {
    this.load();
    return this.recent(bucket, ip, now).length < limit;
  }

  async hit(bucket: string, ip: string, now = Date.now()): Promise<void> {
    this.load();
    this.recent(bucket, ip, now).push(now);
    this.prune(now);
    await this.persist();
  }

  private prune(now: number) {
    for (const bucket of Object.values(this.state)) {
      for (const [ip, list] of Object.entries(bucket)) {
        const keep = list.filter((t) => now - t < HOUR);
        if (keep.length) bucket[ip] = keep;
        else delete bucket[ip];
      }
    }
  }

  private persist(): Promise<void> {
    if (!this.file) return Promise.resolve();
    const file = this.file;
    const snapshot = JSON.stringify(this.state);
    this.writing = this.writing.then(async () => {
      try {
        await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
        const tmp = `${file}.${process.pid}.tmp`;
        await fs.writeFile(tmp, snapshot, { mode: 0o600 });
        await fs.rename(tmp, file);
      } catch {
        /* the in-memory limiter keeps working */
      }
    });
    return this.writing;
  }
}

const limiters = new Map<string, RateLimiter>();
export function limiterFor(dataDir: string | null): RateLimiter {
  const key = dataDir ?? '';
  let l = limiters.get(key);
  if (!l) limiters.set(key, (l = new RateLimiter(dataDir ? path.join(dataDir, 'ratelimit.json') : null)));
  return l;
}

/**
 * Client IP behind Nginx: the right-most X-Forwarded-For entry is the one Nginx
 * appended ($proxy_add_x_forwarded_for), so a spoofed left-most entry is ignored.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const last = xff.split(',').map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
