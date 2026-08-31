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
    // _tools/ holds the dev harnesses, which are not site pages
    if (e.isDirectory()) { if (e.name !== '_tools') walk(p); }
    else if (e.name.endsWith('.html')) files.push(p);
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

// Distinguishing a DEAD link from a THROTTLED one is the whole job here.
// Publishers block automated agents aggressively: many return 403, and some
// simply stop answering once they have seen a few requests. Treating either as
// "broken" makes the checker cry wolf, and a checker that cries wolf is one
// nobody runs.
//
// curl exit codes we care about:
//   6  could not resolve host   -> the domain is gone. Real failure.
//   7  could not connect        -> nothing listening. Real failure.
//   28 timed out                -> almost always throttling. Warn.
const attempt = (u, timeout) => {
  try {
    const code = execFileSync('curl', ['-sL', '-o', '/dev/null', '-w', '%{http_code}',
      '--max-time', String(timeout), '-A', 'Mozilla/5.0 (izzimath link check)', u], { encoding: 'utf8' }).trim();
    return { code, exit: 0 };
  } catch (e) {
    return { code: '000', exit: e.status ?? -1 };
  }
};

// HTTP statuses that mean the document is not there.
const DEAD_STATUS = new Set(['404', '410']);
// curl failures that mean the host is not there.
const DEAD_EXIT = new Set([6, 7]);

const check = (u) => {
  let r = attempt(u, 30);
  // one retry, longer, before believing anything bad
  if (DEAD_STATUS.has(r.code) || r.exit !== 0) r = attempt(u, 45);
  if (DEAD_STATUS.has(r.code)) return r.code;
  if (r.exit === 28) return 'TIMEOUT';   // throttled — reported, not fatal
  if (DEAD_EXIT.has(r.exit)) return 'DEAD';
  if (r.exit !== 0) return 'TIMEOUT';    // unknown transport error, treat as soft
  return r.code;
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
const HARD = (c) => DEAD_STATUS.has(c) || c === 'DEAD';
const bad = results.filter(([, c]) => HARD(c));
const blocked = results.filter(([, c]) => !HARD(c) && c !== '200');

for (const [u, c] of results.sort((a, b) => a[0] > b[0] ? 1 : -1)) {
  const mark = c === '200' ? 'ok  ' : HARD(c) ? 'FAIL' : 'warn';
  if (c !== '200') console.log(`  ${mark} ${c}  ${u}`);
}
console.log(`\n=== external links ===`);
const timeouts = results.filter(([, c]) => c === 'TIMEOUT').length;
console.log(`${results.length} URLs · ${results.filter(([, c]) => c === '200').length} OK · ${blocked.length - timeouts} blocked/redirected · ${timeouts} throttled · ${bad.length} broken`);
if (timeouts) console.log(`(throttled = the publisher stopped answering us, not a dead link)`);
if (bad.length) {
  console.log('\nbroken, with referring pages:');
  for (const [u] of bad) console.log(`  ${u}\n     ${urls.get(u).slice(0, 3).join(', ')}`);
  console.log('\nEXTERNAL LINK CHECK FAILED\n');
  process.exit(1);
}
console.log('no broken external links\n');
