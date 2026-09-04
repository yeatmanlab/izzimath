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

  // form controls need labels.
  //
  // A wrapping <label> names its control, and the label's text is allowed to sit
  // inside a child element: <label><span>How much</span><select>…</select></label>
  // is valid and properly named. The old test demanded bare text immediately
  // before the control, so every print page's length select warned falsely — and
  // 41 warnings that are all wrong are worse than none, because they hide the one
  // that is right. Text belonging to the control itself (a <select>'s own
  // <option>s) does not count as a label.
  const labels = [...h.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)].map((L) => ({
    from: L.index, to: L.index + L[0].length,
    text: L[1].replace(/<(select|textarea)\b[\s\S]*?<\/\1>/g, '')
               .replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').trim(),
  }));
  for (const m of h.matchAll(/<(input|select|textarea)\b[^>]*>/g)) {
    const t = m[0];
    if (/type="hidden"/.test(t)) continue;
    const id = (t.match(/\bid="([^"]+)"/) || [])[1];
    const labelled = /aria-label=/.test(t) || /aria-labelledby=/.test(t) || (id && new RegExp(`<label[^>]*for="${id}"`).test(h));
    const wrapped = labels.some((L) => L.from < m.index && m.index < L.to && L.text.length > 0);
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

/* Every page SHAPE has to be in the responsive audit's list.

   tools/audit.html says it itself: "a new page type that the responsive audit
   does not list is a page type nobody is checking, which is how the print
   overflow went unnoticed for so long." /guide/ was then added to the site and
   not to that list, and when it finally was, five of its links turned out to be
   20px tall. Nobody remembers to update a list; a check does.

   Shapes, not pages — one book page stands for all 31, because they are one
   template. */
{
  const shape = (p) => ('/' + path.relative(OUT, p).replace(/index\.html$/, ''))
    .replace(/^\/(books|games|print|plans|ssdd)\/[^/]+\/$/, '/$1/<id>/')
    .replace(/^\/grades\/[^/]+\/$/, '/grades/<g>/');
  const built = new Set(files.map(shape));
  let listed = new Set();
  try {
    const h = fs.readFileSync(new URL('../tools/audit.html', import.meta.url), 'utf8');
    const m = h.match(/const PAGES = \[([\s\S]*?)\n\];/);
    listed = new Set([...m[1].matchAll(/\['([^']+)'/g)]
      .map((x) => shape(path.join(OUT, x[1].replace(/\/$/, '/index.html')))));
  } catch (e) {
    console.log(`  fail  cannot read tools/audit.html to check page coverage: ${e.message}`);
    errors++;
  }
  const gaps = [...built].sort().filter((s) => !listed.has(s));
  for (const s of gaps) {
    console.log(`  fail  page shape ${s} is in the build but not in tools/audit.html PAGES — nothing checks it at any width`);
    errors++;
  }
  console.log(gaps.length
    ? `  ${built.size} page shapes, ${gaps.length} of them checked by nothing`
    : `  ${built.size} page shapes, all listed in the responsive audit`);
}

/* The suggestion widget must not mention GitHub to a reader — asked for
   directly, and worth a check because the route seam still has the code and it
   would be easy to switch back on without noticing the copy. Scoped to the
   widget's own markup: the footer's "Source" link is a different thing and
   stays. Checked against the BUILT pages, because the mount's template strings
   nest and reading them for stray literals flags code as copy.

   This sees the STATIC half only — the pinned button and its menu, including
   the link a reader without JavaScript follows. The dialog is rendered by the
   mount at runtime and is checked in tools/func.html instead; switching the
   GitHub route back on changes only the dialog, so this guard alone would not
   notice and it is not the whole check. */
{
  let checked = 0, offenders = [];
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    const i = html.indexOf('data-feedback');
    if (i < 0) continue;
    checked++;
    // from the widget's opening div to the end of its container
    const block = html.slice(html.lastIndexOf('<div', i), html.indexOf('</div>', html.indexOf('</button>', i)) + 6);
    if (/github/i.test(block)) offenders.push(path.relative(OUT, f));
  }
  for (const o of offenders.slice(0, 4)) {
    console.log(`  fail  the suggestion widget says GitHub to the reader on ${o}`);
    errors++;
  }
  console.log(offenders.length
    ? `  ${checked} pages carry the suggestion widget, ${offenders.length} of them mention GitHub`
    : `  ${checked} pages carry the suggestion widget, none mention GitHub`);
}

console.log(`\n=== accessibility ===`);
console.log(`${files.length} pages checked · ${errors} errors · ${warns} warnings`);
if (errors) { console.log('A11Y CHECK FAILED\n'); process.exit(1); }
console.log('no blocking issues\n');
