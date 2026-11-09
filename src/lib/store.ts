import { promises as fs } from 'node:fs';
import path from 'node:path';

/** Neutralize spreadsheet formulas: values starting with = + - @ (or tab/CR) get a leading '. */
export function neutralize(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function csvCell(value: string): string {
  return `"${neutralize(value).replace(/"/g, '""')}"`;
}

export const csvRow = (values: string[]) => values.map(csvCell).join(',') + '\r\n';

export const REQUEST_COLUMNS = [
  'time', 'jalali', 'id', 'type', 'name', 'phone', 'email', 'org', 'role', 'details', 'message', 'lang', 'ip', 'delivery',
] as const;
export const NEWSLETTER_COLUMNS = ['time', 'jalali', 'id', 'email', 'lang', 'ip', 'delivery'] as const;

export async function ensureDataDir(dir: string) {
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.chmod(dir, 0o700).catch(() => {});
}

// Serialize appends within this process so rows never interleave.
let queue: Promise<unknown> = Promise.resolve();

/** Append one row; writes a UTF-8 BOM + header when the file is new. Returns false on failure. */
export function appendCsv(dir: string, file: string, columns: readonly string[], row: Record<string, string>): Promise<boolean> {
  const job = queue.then(async () => {
    try {
      await ensureDataDir(dir);
      const target = path.join(dir, file);
      const exists = await fs.stat(target).then(() => true, () => false);
      const line = csvRow(columns.map((c) => row[c] ?? ''));
      const data = exists ? line : '﻿' + csvRow([...columns]) + line;
      await fs.appendFile(target, data, { encoding: 'utf8', mode: 0o600 });
      return true;
    } catch {
      return false;
    }
  });
  queue = job;
  return job;
}
