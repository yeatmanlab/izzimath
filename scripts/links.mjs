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

// In-page anchors: every #ref-... style link must have a matching id somewhere.
const idsByPage = new Map();
for (const f of htmlFiles) {
  const h = fs.readFileSync(f, 'utf8');
  idsByPage.set(f, new Set([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])));
}
let badAnchors = 0;
for (const f of htmlFiles) {
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/(?:href)="([^"]*#[^"]+)"/g)) {
    const [pathPart, frag] = m[1].split('#');
    if (!frag) continue;
    let targetFile = f;
    if (pathPart) {
      let p2 = path.join(OUT, pathPart.replace(new RegExp('^' + BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), ''));
      if (fs.existsSync(p2) && fs.statSync(p2).isDirectory()) p2 = path.join(p2, 'index.html');
      else if (pathPart.endsWith('/')) p2 = path.join(p2, 'index.html');
      if (!fs.existsSync(p2)) continue; // already reported as a broken path
      targetFile = p2;
    }
    const ids = idsByPage.get(targetFile) || new Set();
    if (!ids.has(frag)) {
      badAnchors++;
      console.log(`  MISSING ANCHOR #${frag} in ${targetFile.replace(OUT + '/', '')} (from ${f.replace(OUT + '/', '')})`);
    }
  }
}

console.log(`\n=== links ===`);
console.log(`${htmlFiles.length} pages · ${checked} internal refs · ${external} external refs`);
if (badAnchors) console.log(`${badAnchors} broken in-page anchors`);
if (broken || badAnchors) {
  console.log(`\n${missing.size} distinct broken targets:`);
  for (const [r, from] of [...missing].sort()) {
    console.log(`  MISSING ${r}`);
    console.log(`          referenced by ${from.slice(0, 4).join(', ')}${from.length > 4 ? ` (+${from.length - 4} more)` : ''}`);
  }
  console.log(`\nLINK CHECK FAILED (${broken} broken refs, ${badAnchors} broken anchors)\n`);
  process.exit(1);
}
console.log(`all internal links and in-page anchors resolve\n`);

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
