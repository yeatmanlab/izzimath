// Static accessibility checks over the generated HTML. Not a substitute for a real
// audit, but it catches the regressions that matter and runs in CI.

import fs from 'node:fs';
import path from 'node:path';

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

let errors = 0, warns = 0;
const fail = (f, m) => { errors++; console.log(`  FAIL  ${f.replace(OUT + '/', '')}: ${m}`); };
const warn = (f, m) => { warns++; console.log(`  warn  ${f.replace(OUT + '/', '')}: ${m}`); };

for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');

  if (!/<html[^>]+lang="/.test(h)) fail(f, 'no lang on <html>');
  if (!/<title>[^<]+<\/title>/.test(h)) fail(f, 'no title');
  if (!/<meta name="description" content="[^"]+"/.test(h)) warn(f, 'no meta description');
  if (!/<meta name="viewport"/.test(h)) fail(f, 'no viewport');

  // exactly one h1
  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s === 0) warn(f, 'no h1');
  if (h1s > 1) fail(f, `${h1s} h1 elements`);

  // heading order: never skip a level going down
  const levels = [...h.matchAll(/<h([1-5])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) { warn(f, `heading jumps h${levels[i - 1]} -> h${levels[i]}`); break; }
  }

  // images and svg need a name
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) fail(f, 'img without alt');
  }
  for (const m of h.matchAll(/<svg\b[^>]*>/g)) {
    const t = m[0];
    if (!/aria-hidden="true"/.test(t) && !/role="img"/.test(t) && !/role="slider"/.test(t) && !/aria-label=/.test(t)) {
      warn(f, 'svg with no role/aria-hidden');
    }
  }
  // an svg with role=img must carry a name
  for (const m of h.matchAll(/<svg\b[^>]*role="img"[^>]*>/g)) {
    if (!/aria-label=/.test(m[0])) fail(f, 'role="img" svg without aria-label');
  }

  // form controls need labels
  for (const m of h.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
    const t = m[0];
    if (/type="hidden"/.test(t)) continue;
    const id = (t.match(/\bid="([^"]+)"/) || [])[1];
    const labelled = /aria-label=/.test(t) || /aria-labelledby=/.test(t) || (id && new RegExp(`<label[^>]*for="${id}"`).test(h));
    // a <label>text<select></label> wrapper also counts
    const wrapped = new RegExp(`<label[^>]*>[^<]*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(h);
    if (!labelled && !wrapped) warn(f, `${m[1]} without an accessible name`);
  }

  // icon-only buttons
  for (const m of h.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) {
    const inner = m[1].replace(/<[^>]+>/g, '').trim();
    if (!inner && !/aria-label=/.test(m[0])) fail(f, 'button with no text and no aria-label');
  }

  // links must have discernible text
  for (const m of h.matchAll(/<a\b[^>]*href=[^>]*>([\s\S]*?)<\/a>/g)) {
    const inner = m[1].replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '').trim();
    if (!inner && !/aria-label=/.test(m[0])) fail(f, 'link with no discernible text');
  }

  // progressbar/slider need values
  for (const m of h.matchAll(/role="progressbar"[^>]*/g)) {
    if (!/aria-valuenow/.test(m[0])) warn(f, 'progressbar without aria-valuenow');
  }
}

console.log(`\n=== accessibility ===`);
console.log(`${files.length} pages checked · ${errors} errors · ${warns} warnings`);
if (errors) { console.log('A11Y CHECK FAILED\n'); process.exit(1); }
console.log('no blocking issues\n');
