// External link checker. Hits the network, so it is a separate script from the
// static checks — run it before a release, not on every build.
//   node scripts/extlinks.mjs

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUT = 'dist';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p);
  }
})(OUT);

const urls = new Map(); // url -> pages referencing it
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  // Strip rel="preconnect" / "dns-prefetch" tags first: their href is an origin
  // to warm a connection to, not a document, so a 404 on it means nothing.
  const body = h.replace(/<link\b[^>]*rel="(?:preconnect|dns-prefetch)"[^>]*>/g, '');
  for (const m of body.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    if (!urls.has(u)) urls.set(u, []);
    urls.get(u).push(f.replace(OUT + '/', ''));
  }
}

const list = [...urls.keys()].sort();
console.log(`\nchecking ${list.length} distinct external URLs from ${files.length} pages\n`);

const check = (u) => {
  try {
    const code = execFileSync('curl', ['-sL', '-o', '/dev/null', '-w', '%{http_code}',
      '--max-time', '30', '-A', 'Mozilla/5.0 (izzimath link check)', u], { encoding: 'utf8' }).trim();
    return code;
  } catch { return 'ERR'; }
};

const results = [];
const CONC = 6;
let i = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < list.length) {
    const u = list[i++];
    const code = check(u);
    results.push([u, code]);
  }
}));

// 403/999 are common for publishers that block automated agents — report but don't fail
const HARD = (c) => c === '404' || c === '410' || c === 'ERR' || c === '000';
const bad = results.filter(([, c]) => HARD(c));
const blocked = results.filter(([, c]) => !HARD(c) && c !== '200');

for (const [u, c] of results.sort((a, b) => a[0] > b[0] ? 1 : -1)) {
  const mark = c === '200' ? 'ok  ' : HARD(c) ? 'FAIL' : 'warn';
  if (c !== '200') console.log(`  ${mark} ${c}  ${u}`);
}
console.log(`\n=== external links ===`);
console.log(`${results.length} URLs · ${results.filter(([, c]) => c === '200').length} OK · ${blocked.length} blocked-or-redirected · ${bad.length} broken`);
if (bad.length) {
  console.log('\nbroken, with referring pages:');
  for (const [u] of bad) console.log(`  ${u}\n     ${urls.get(u).slice(0, 3).join(', ')}`);
  console.log('\nEXTERNAL LINK CHECK FAILED\n');
  process.exit(1);
}
console.log('no broken external links\n');
