/**
 * npm run import:v1 — one-off import of the first prototype's texts.
 *
 * Step 1 (works now): runs reference/v1/content.py in an isolated Python
 * (python3 -I) and dumps every top-level JSON-serializable value, plus
 * reference/v1/site_config.json, to reference/v1/content.json, then prints
 * the structure.
 *
 * Step 2 (written once the file exists): maps that dump verbatim onto
 * src/content/*.ts and messages/*.json. The mapping is deliberately not
 * guessed before the real content.py is in the repository (RFP rule 8).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const V1 = path.resolve('reference/v1');
const CONTENT_PY = path.join(V1, 'content.py');
const SITE_CONFIG = path.join(V1, 'site_config.json');
const OUT = path.join(V1, 'content.json');

if (!fs.existsSync(CONTENT_PY)) {
  console.error(`✗ ${path.relative('.', CONTENT_PY)} not found. Put the _source folder of center-website.zip in reference/v1/ first.`);
  process.exit(1);
}

// The script path is passed as an argument; python -I ignores the cwd and env.
const DUMP = `
import json, runpy, sys, types
ns = runpy.run_path(sys.argv[1], run_name="content")
out = {}
for k, v in ns.items():
    if k.startswith("_") or isinstance(v, (types.ModuleType, types.FunctionType, type)):
        continue
    try:
        json.dumps(v, ensure_ascii=False)
        out[k] = v
    except TypeError:
        pass
print(json.dumps(out, ensure_ascii=False, indent=2))
`;

const json = execFileSync('python3', ['-I', '-c', DUMP, CONTENT_PY], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const dump = { content: JSON.parse(json), site_config: fs.existsSync(SITE_CONFIG) ? JSON.parse(fs.readFileSync(SITE_CONFIG, 'utf8')) : null };
fs.writeFileSync(OUT, JSON.stringify(dump, null, 2) + '\n');

function shape(v: unknown, depth = 0): string {
  if (Array.isArray(v)) return `array(${v.length})${v.length ? ' of ' + shape(v[0], depth + 1) : ''}`;
  if (v && typeof v === 'object') {
    if (depth > 2) return 'object';
    return `{ ${Object.entries(v).map(([k, x]) => `${k}: ${shape(x, depth + 1)}`).join(', ')} }`;
  }
  return typeof v;
}
console.log(`✓ wrote ${path.relative('.', OUT)}\n`);
for (const [k, v] of Object.entries(dump.content)) console.log(`${k}: ${shape(v)}`);
console.log('\nNext: map these keys onto src/content/*.ts and messages/*.json (step 2).');
