/**
 * Build guard (runs as `prebuild`):
 *  1. every content file parses against its zod schema (parsing happens on import);
 *  2. messages/fa.json and messages/en.json have exactly the same keys and ICU arguments;
 *  3. cross references (activity → domain, unique slugs, counts once not sample);
 *  4. with --build: any `sample: true` fails the build unless ALLOW_SAMPLE=1.
 */
import fa from '../messages/fa.json';
import en from '../messages/en.json';
import * as content from '../src/content';

const errors: string[] = [];
const warn: string[] = [];

type Tree = { [k: string]: string | Tree };

function flatten(t: Tree, prefix = '', out = new Map<string, string>()) {
  for (const [k, v] of Object.entries(t)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.set(key, v);
    else flatten(v, key, out);
  }
  return out;
}

const args = (s: string) =>
  [...s.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*[,}]/g)].map((m) => m[1]).sort().join(',');

const mfa = flatten(fa as Tree);
const men = flatten(en as Tree);
for (const [k, v] of mfa) {
  if (!men.has(k)) errors.push(`messages/en.json is missing "${k}"`);
  else if (args(v) !== args(men.get(k)!)) errors.push(`ICU arguments differ for "${k}": fa {${args(v)}} vs en {${args(men.get(k)!)}}`);
  if (!v.trim()) errors.push(`messages/fa.json "${k}" is empty`);
}
for (const k of men.keys()) if (!mfa.has(k)) errors.push(`messages/fa.json is missing "${k}"`);
for (const [k, v] of men) if (!v.trim()) errors.push(`messages/en.json "${k}" is empty`);

// Cross references
const { activities, events, faq, network, spaces, paths, site, model, formOptions } = content;
const domainKeys = new Set(activities.data.domains.map((d) => d.key));
for (const a of activities.data.activities) {
  if (!domainKeys.has(a.domain)) errors.push(`activity ${a.id}: unknown domain ${a.domain}`);
}
const dupes = (list: string[], what: string) => {
  const seen = new Set<string>();
  for (const x of list) {
    if (seen.has(x)) errors.push(`duplicate ${what}: ${x}`);
    seen.add(x);
  }
};
dupes(activities.data.activities.map((a) => a.id), 'activity id');
dupes(events.data.map((e) => e.slug), 'event slug');
dupes(faq.data.map((f) => f.id), 'faq id');
if (!activities.sample && activities.data.activities.length !== 42)
  errors.push(`activities: expected 42, got ${activities.data.activities.length}`);
if (!faq.sample && faq.data.length !== 8) errors.push(`faq: expected 8, got ${faq.data.length}`);

const files = { site, paths, activities, spaces, network, events, faq, model, formOptions };
const sampleFiles = Object.entries(files)
  .filter(([, f]) => f.sample)
  .map(([n]) => n);

const pendingCount = JSON.stringify(files).match(/"source":"(pending|draft)"/g)?.length ?? 0;
if (pendingCount) warn.push(`${pendingCount} item(s) are still pending/draft (run npm run import:v1 once reference/v1 exists)`);

if (sampleFiles.length) {
  const msg = `sample data in: ${sampleFiles.join(', ')}`;
  if (process.argv.includes('--build') && process.env.ALLOW_SAMPLE !== '1')
    errors.push(`${msg}. Production builds need real data, or ALLOW_SAMPLE=1.`);
  else warn.push(msg);
}

for (const w of warn) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log(`✓ content OK (${mfa.size} message keys per language)`);
