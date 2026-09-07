// Static accessibility checks over the generated HTML. Not a substitute for a real
// audit, but it catches the regressions that matter and runs in CI.

import fs from 'node:fs';
import path from 'node:path';
import { activities } from '../content/activities/index.js';
import { LESSONS } from '../content/lessons.js';
/* The templates' OWN escaper, imported rather than reimplemented. A local copy
   was written first and it already disagreed — templates.mjs also escapes the
   apostrophe to &#39; — so a title with one in it would never have matched and
   the check would have failed for the wrong reason. */
import { esc } from './templates.mjs';

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

/* GitHub is offered as a third route now, so the rule is not "never mention it"
   but "mention it exactly when the route is on". The static half of the widget —
   the pinned button and its menu — must stay quiet either way: those two links
   go to whichever route is primary, and naming a developer tool at the door is
   what turns a parent away before they read the options. Scoped to the widget's
   own markup: the footer's "Source" link is a different thing and stays.
   Checked against the BUILT pages, because the mount's template strings nest
   and reading them for stray literals flags code as copy.

   This sees the STATIC half only — the pinned button and its menu, including
   the link a reader without JavaScript follows. The dialog is rendered by the
   mount at runtime and is checked in tools/func.html instead; switching the
   GitHub route back on changes only the dialog, so this guard alone would not
   notice and it is not the whole check. */
{
  let checked = 0, offenders = [];
/* ---------------------------------------------------- the lesson callout
   HERE rather than in scripts/check.mjs, and that is the whole point: this
   asserts something about the BUILT page, and check.mjs runs BEFORE the build —
   in CI and in `npm run verify` alike. The first version of this lived there,
   passed on my machine because dist was left over from a manual build, and
   failed in CI with "no activity pages were found to check". Its own
   empty-result guard is what turned that into a loud failure instead of a check
   that silently measured nothing.

   What it holds: the callout has two weights, and which one shows is decided in
   the browser from localStorage. The built page must therefore carry the LOUD
   one — a reader with no JavaScript, or on a fresh device, has never seen the
   lesson, and shipping the collapsed version would hide it from exactly the
   child meeting a clock for the first time. It also checks that the module
   which does the collapsing is on the page, because the first attempt recorded
   the visit and never read it back: lesson.js only shipped on /learn/. */
{
  console.log('');
  const withLesson = [...activities].filter((a) => a.lesson);
  let seen = 0, bad = 0;
  for (const a of withLesson) {
    const f = `${OUT}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/index.html`;
    let html;
    try { html = fs.readFileSync(f, 'utf8'); } catch {
      console.log(`  FAIL  ${a.id}: declares lesson "${a.lesson}" but ${f} was not built`);
      errors++; bad++; continue;
    }
    seen++;
    const say = (m) => { console.log(`  FAIL  ${a.id}: ${m}`); errors++; bad++; };
    if (!html.includes('data-lesson-call=')) say(`declares lesson "${a.lesson}" but the page has no callout`);
    if (/class="lsncall[^"]*\bseen\b/.test(html)) {
      say('the lesson callout ships already collapsed — loud has to be the default, or a reader without JavaScript never sees it');
    }
    if (!html.includes('/assets/src/mount/lesson.js')) {
      say('has a lesson callout but does not load lesson.js, so it can never collapse once the lesson has been read');
    }
    if (!html.includes(`/learn/${a.lesson}/`)) say(`callout does not link to /learn/${a.lesson}/`);
  }
  if (withLesson.length && !seen) {
    console.log('  FAIL  lessons: no activity pages were found to check — an empty result is not a pass');
    errors++;
  }
  console.log(`  ${seen} lesson callouts on activity pages${bad ? `, ${bad} PROBLEMS` : ', all shipping loud'}`);
}

/* ------------------------------------------------- the lessons index at /learn/
   Also here rather than in check.mjs, for the same reason: every assertion is
   about a built page.

   The index exists because the two lessons had no parent — their breadcrumb was
   `Home / How a clock works`, they are deliberately absent from the header nav,
   and the only global route to them was two footer links. So what has to hold is
   the WIRING, and every strand of it is the kind that breaks silently: a lesson
   missing from the index is an orphan again, a breadcrumb that skips the index is
   the bug this page was built to fix, and the reverse links are derived from a
   field nobody maintains in that direction. */
{
  console.log('');
  let errs = 0;
  const say = (m) => { console.log(`  FAIL  learn: ${m}`); errors++; errs++; };
  let idx = null;
  try { idx = fs.readFileSync(`${OUT}/learn/index.html`, 'utf8'); } catch {
    say('the index was not built at learn/index.html');
  }
  const lessons = Object.values(LESSONS);
  if (idx) {
    for (const l of lessons) {
      if (!idx.includes(`/learn/${l.id}/`)) say(`the index does not link to /learn/${l.id}/, so that lesson is an orphan again`);
      if (!idx.includes(esc(l.title))) say(`the index does not name "${l.title}"`);
      /* The card's figure is drawn by the same widgets the lesson draws with, so
         an empty card body means the preview silently failed rather than that a
         lesson has no figure. */
      if (!/class="lsnfig"[^>]*>\s*<svg/.test(idx)) say('a card is missing its figure — .lsnfig has no svg in it');
    }
    // Grade must not be the organising axis: that is the design, not a detail.
    if (/class="ctag">(Kindergarten|\dth grade|\dst grade|\dnd grade|\drd grade)/.test(idx)) {
      say('a card is tagged by GRADE — the index is organised by topic on purpose, because a grade ladder reads as a course to work through');
    }
  }
  // Each lesson page's breadcrumb has to pass through the index.
  for (const l of lessons) {
    let html;
    try { html = fs.readFileSync(`${OUT}/learn/${l.id}/index.html`, 'utf8'); } catch {
      say(`/learn/${l.id}/ was not built`); continue;
    }
    /* SCOPED TO THE BREADCRUMB, and the first version was not — it tested the
       whole page for a /learn/ link, which the FOOTER supplies on every page.
       So the assertion passed with the crumb deleted: a dead check that read as
       coverage. Only the nav element can answer "does this page have a parent". */
    const crumbNav = html.match(/<nav class="wrap noprint" aria-label="Breadcrumb"[\s\S]*?<\/nav>/);
    if (!crumbNav) say(`/learn/${l.id}/ has no breadcrumb at all`);
    else if (!/href="[^"]*\/learn\/"/.test(crumbNav[0])) {
      say(`/learn/${l.id}/ has a breadcrumb that skips the index, so the lesson still has no parent`);
    }
    /* The practice strip. Derived from `lesson:` on each activity, so if that
       filter ever comes back empty the page silently returns to being a dead
       end — which is what it was before, exiting to /grades/ generically. */
    const users = [...activities].filter((a) => a.lesson === l.id);
    if (!users.length) { say(`no activity declares lesson "${l.id}", so its practice strip is empty`); continue; }
    for (const a of users) {
      if (!html.includes(esc(a.title))) {
        say(`/learn/${l.id}/ does not offer ${a.id}, which declares this lesson`);
      }
    }
  }
  // One global route, and it has to be the index rather than a single lesson.
  const home = fs.readFileSync(`${OUT}/index.html`, 'utf8');
  /* SCOPED TO THE FOOTER ELEMENT. The first version matched `class="fin"` and
     the markup is `class="wrap fin"`, so it matched nothing and the assertion
     could not fail — the second dead strand in this one check, both found by
     reintroducing the bug rather than by reading the code. */
  const foot = home.match(/<footer class="foot noprint"[\s\S]*?<\/footer>/);
  if (!foot) say('the home page has no footer');
  else {
    if (!/href="[^"]*\/learn\/"/.test(foot[0])) {
      say('the footer does not link the index, so there is no global route to the lessons');
    }
    for (const l of lessons) {
      if (foot[0].includes(`/learn/${l.id}/`)) {
        say(`the footer links /learn/${l.id}/ directly — one "Short lessons" link is the point, or the footer grows by one link per lesson`);
      }
    }
  }
  console.log(`  ${lessons.length} lessons on the index${errs
    ? `, ${errs} PROBLEM${errs === 1 ? '' : 'S'}` : ', each linked both ways with its practice strip'}`);
}

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
    console.log(`  fail  the pinned button or its menu says GitHub to the reader on ${o}`);
    errors++;
  }
  console.log(offenders.length
    ? `  ${checked} pages carry the suggestion widget, ${offenders.length} name GitHub at the door`
    : `  ${checked} pages carry the suggestion widget, none name GitHub at the door`);
}

console.log(`\n=== accessibility ===`);
console.log(`${files.length} pages checked · ${errors} errors · ${warns} warnings`);
if (errors) { console.log('A11Y CHECK FAILED\n'); process.exit(1); }
console.log('no blocking issues\n');
