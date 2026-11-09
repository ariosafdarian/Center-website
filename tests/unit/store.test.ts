import { describe, it, expect } from 'vitest';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { neutralize, csvCell, appendCsv } from '@/lib/store';

describe('CSV', () => {
  it.each([
    ['=SUM(A1)', "'=SUM(A1)"],
    ['+989121234567', "'+989121234567"],
    ['-1', "'-1"],
    ['@cmd', "'@cmd"],
    ['سلام', 'سلام'],
  ])('neutralize %s', (v, out) => expect(neutralize(v)).toBe(out));

  it('quotes cells', () => expect(csvCell('a "b", c')).toBe('"a ""b"", c"'));

  it('appends with BOM + header once, dir mode 700', async () => {
    const dir = path.join(await mkdtemp(path.join(os.tmpdir(), 'csv-')), 'data');
    expect(await appendCsv(dir, 'r.csv', ['a', 'b'], { a: '1', b: 'ب' })).toBe(true);
    expect(await appendCsv(dir, 'r.csv', ['a', 'b'], { a: '2', b: '=x' })).toBe(true);
    const text = await readFile(path.join(dir, 'r.csv'), 'utf8');
    expect(text).toBe('﻿"a","b"\r\n"1","ب"\r\n"2","\'=x"\r\n');
    expect((await stat(dir)).mode & 0o777).toBe(0o700);
  });
});
