// Link and asset checker. Walks every generated page, resolves every internal
// href/src, and reports anything that does not exist on disk.

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'dist';
const BASE = (process.env.BASE ?? '').replace(/\/$/, '');

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(OUT);

let broken = 0, checked = 0, external = 0;
const missing = new Map();

const exists = (rel) => {
  const clean = rel.split('#')[0].split('?')[0];
  if (!clean) return true;
  let p = path.join(OUT, clean.replace(new RegExp('^' + BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), ''));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  else if (clean.endsWith('/')) p = path.join(p, 'index.html');
  return fs.existsSync(p);
};

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const r of refs) {
    if (/^(https?:|mailto:|data:|#|javascript:)/.test(r)) { external++; continue; }
    checked++;
    if (!exists(r)) {
      broken++;
      if (!missing.has(r)) missing.set(r, []);
      missing.get(r).push(f.replace(OUT + '/', ''));
    }
  }
}

console.log(`\n=== links ===`);
console.log(`${htmlFiles.length} pages · ${checked} internal refs · ${external} external refs`);
if (broken) {
  console.log(`\n${missing.size} distinct broken targets:`);
  for (const [r, from] of [...missing].sort()) {
    console.log(`  MISSING ${r}`);
    console.log(`          referenced by ${from.slice(0, 4).join(', ')}${from.length > 4 ? ` (+${from.length - 4} more)` : ''}`);
  }
  console.log(`\nLINK CHECK FAILED (${broken} broken refs)\n`);
  process.exit(1);
}
console.log(`all internal links resolve\n`);

// Every activity must have all four surfaces reachable.
const acts = JSON.parse(fs.readFileSync('dist/_manifest.json', 'utf8'));
let gaps = 0;
for (const a of acts) {
  const dir = a.kind === 'book' ? 'books' : 'games';
  for (const p of [`${dir}/${a.id}/index.html`, `print/${a.id}/index.html`]) {
    if (!fs.existsSync(path.join(OUT, p))) { console.log(`  MISSING surface ${p}`); gaps++; }
  }
}
console.log(`=== surfaces ===`);
console.log(`${acts.length} activities × (interactive + print) ${gaps ? `— ${gaps} MISSING` : '— all present'}\n`);
if (gaps) process.exit(1);
