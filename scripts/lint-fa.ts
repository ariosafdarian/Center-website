/**
 * npm run lint:fa — guards the Persian writing rules (RFP § "نگهبان خودکار").
 * Reads every Persian string in messages/fa.json and src/content/ (the `fa`
 * side of bilingual values) and fails on:
 *  - banned terms and the plan/ladder/company names that must not appear;
 *  - banned verbs and phrases (می‌باشد، انجام می‌دهد، صورت می‌گیرد، توسط، در راستای، از طریق);
 *  - Arabic «ي» and «ك»;
 *  - Latin digits in Persian text (except inside URLs, emails, code and tokens such as API);
 *  - «می » or « ها» written with a full space instead of ZWNJ.
 * It never modifies strings, so ZWNJ (U+200C) is never removed.
 */
import fa from '../messages/fa.json';
import * as content from '../src/content';
import { lintFaText } from './fa-rules';

type Found = { where: string; text: string; rule: string; hint: string };
const found: Found[] = [];

function check(where: string, text: string) {
  for (const f of lintFaText(text)) found.push({ where, text, ...f });
}

/** Walk messages: every string. */
function walkMessages(node: unknown, path: string) {
  if (typeof node === 'string') return check(path, node);
  if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) walkMessages(v, path ? `${path}.${k}` : k);
}

/** Walk content: the `fa` side of bilingual values, plus any other string containing Persian. */
function walkContent(node: unknown, path: string, inEn = false) {
  if (typeof node === 'string') return inEn ? undefined : check(path, node);
  if (Array.isArray(node)) return node.forEach((v, i) => walkContent(v, `${path}[${i}]`, inEn));
  if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) walkContent(v, `${path}.${k}`, inEn || k === 'en');
}

walkMessages(fa, 'messages/fa.json:');
for (const [name, mod] of Object.entries(content)) {
  if (typeof mod === 'function') continue;
  walkContent(mod, `src/content/${name}`);
}

if (found.length) {
  for (const f of found) console.error(`✗ ${f.where}  [${f.rule}] → ${f.hint}\n    ${f.text}`);
  console.error(`\n${found.length} problem(s).`);
  process.exit(1);
}
console.log('✓ lint:fa — Persian text follows the writing rules');
