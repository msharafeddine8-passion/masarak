#!/usr/bin/env node
/**
 * CI guard: fail the build if any i18n key used in components/pages
 * is missing from src/lib/i18n.tsx.
 *
 * Catches the "mobile.dashboard rendered literally" class of bug.
 *
 * Usage: node scripts/check-i18n-keys.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

// fileURLToPath handles Windows drive letters correctly. The previous
// `new URL('..', import.meta.url).pathname` produced a leading-slash path
// (/C:/…) that Node resolved to a doubled drive (C:\C:\…) on Windows,
// breaking `npm run build` locally.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const I18N_PATH = join(ROOT, 'src/lib/i18n.tsx');
const SCAN_DIRS = ['src/app', 'src/components'];

const i18n = readFileSync(I18N_PATH, 'utf8');
// Collect defined keys (Arabic block is enough — keys are shared).
// Accept both single- and double-quoted key literals: the hand-written entries
// use 'single' quotes, while batch-inserted entries use "double" quotes. The
// guard must not be sensitive to quote style or it flags real keys as missing.
const defined = new Set();
for (const m of i18n.matchAll(/["']([a-z][a-z0-9_.]+)["']\s*:/g)) defined.add(m[1]);
// Also pick up TranslationKey union references like `key: 'foo.bar'`
// (already covered by the matcher above).

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (['.tsx', '.ts'].includes(extname(name))) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.flatMap(d => walk(join(ROOT, d)));

// Find `t('key.name')` and `key: 'key.name'` references.
const used = new Map(); // key → first file:line
const PATTERNS = [
  /\bt\(\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]/g,
  /\bkey:\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]/g,
  /\btKey:\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]/g,
  /\blabelKey:\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]/g,
  /\bdescKey:\s*['"]([a-z][a-z0-9_]*\.[a-z0-9_.]+)['"]/g,
];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const re of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const key = m[1];
      if (!used.has(key)) {
        const lineNo = text.slice(0, m.index).split('\n').length;
        used.set(key, `${file}:${lineNo}`);
      }
    }
  }
}

const missing = [...used.entries()].filter(([k]) => !defined.has(k));

if (missing.length === 0) {
  console.log(`✓ i18n check passed — ${used.size} keys referenced, all defined.`);
  process.exit(0);
}

console.error(`✗ i18n check FAILED — ${missing.length} missing key(s):\n`);
for (const [key, loc] of missing) {
  console.error(`  ${key}  ←  ${loc}`);
}
console.error(`\nAdd these keys to src/lib/i18n.tsx (both AR and EN blocks).`);
process.exit(1);
