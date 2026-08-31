// Static site generator. Zero dependencies — plain Node emitting plain HTML.
//   node build.mjs            -> dist/ with base ''      (local preview)
//   BASE=/izzimath node build.mjs  -> dist/ for GitHub Pages project site

import fs from 'node:fs';
import path from 'node:path';
import { page, activityCard, esc, GRADES, gradeName, gradeNum, roamBadges } from './scripts/templates.mjs';
import { sheet } from './src/lib/printsheet.js';
import { activities, byGrade, strandsFor, STRANDS } from './content/activities/index.js';
import { characters, characterList, getCharacter } from './content/characters.js';
import { tasks, bands, bandOrder, allSubscales, roamLabel, ROAM_URL, recommend } from './content/roam.js';

const BASE = (process.env.BASE ?? '').replace(/\/$/, '');
const SITE = process.env.SITE ?? 'https://yeatmanlab.github.io/izzimath';
const OUT = 'dist';

/* ------------------------------------------------------------------ helpers */
const rmrf = (p) => fs.rmSync(p, { recursive: true, force: true });
function write(rel, html) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
  pages.push(rel);
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
const pages = [];
const b = BASE;

rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------- assets
   The source tree is mirrored under assets/ so every relative import inside
   the client modules resolves exactly as it does in development. */
copyDir('src', path.join(OUT, 'assets/src'));
copyDir('content', path.join(OUT, 'assets/content'));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

/* --------------------------------------------------------------------- home */
{
  const featured = ['fraction-number-line', 'ten-frame-flash', 'times-table-tower']
    .map((id) => activities.find((a) => a.id === id)).filter(Boolean);
  const pick = featured.length ? featured : activities.slice(0, 3);
  write('index.html', page({
    base: b, active: '', title: 'Math that glows on screen and on paper',
    desc: 'Free interactive math workbooks and games for kindergarten through 5th grade. Every activity also prints. No account needed.',
    body: `
<section class="wrap hero">
  <div class="pill">◆ Every book prints</div>
  <h1>Math that <em>glows</em><br>on screen and on paper.</h1>
  <p class="lede">Interactive workbooks and games for kindergarten through 5th grade. Play it,
    then print the very same page. Free, no account, nothing to install.</p>
  <div style="display:flex;gap:11px;flex-wrap:wrap">
    <a class="btn pri" href="${b}/grades/">Pick your grade</a>
    <a class="btn" href="${b}/printables/">Browse printables</a>
    <a class="btn" href="${b}/roam/">Got a ROAM score?</a>
  </div>
</section>

<section class="wrap sec">
  <h2>Choose a grade</h2>
  <p class="sub">Grade is the only question we ask. Everything else follows from it.</p>
  <div class="grades">
    ${GRADES.map((g) => {
      const n = byGrade(g).length;
      return `<a class="gtile" href="${b}/grades/${g}/"><b>${g}</b><span>${n} ${n === 1 ? 'activity' : 'activities'}</span></a>`;
    }).join('')}
  </div>
</section>

<section class="wrap sec">
  <h2>Start here</h2>
  <p class="sub">Three that show what the rest are like.</p>
  <div class="cards">${pick.map((a) => activityCard(b, a)).join('')}</div>
</section>

<section class="wrap sec">
  <h2>How it works</h2>
  <div class="cards">
    <div class="card"><div class="cbody"><h3>◈ Interactive books</h3>
      <p>Chaptered practice with hints and worked explanations. Never timed — books are for
      learning, games are for speed.</p></div></div>
    <div class="card"><div class="cbody"><h3>◉ Fluency games</h3>
      <p>Short replayable rounds built on the same skills. Timers are off by default and
      always optional.</p></div></div>
    <div class="card"><div class="cbody"><h3>▤ Infinite printables</h3>
      <p>Every activity generates a fresh sheet plus an answer key. Click again for new
      problems. Designed to be light on ink.</p></div></div>
  </div>
</section>

<section class="wrap sec" style="padding-bottom:10px">
  <div class="roam">
    <h3>Where the content comes from</h3>
    <p>The order topics appear in follows the free
    <a href="https://illustrativemathematics.org/math-curriculum/" style="color:var(--a1)">Illustrative Mathematics</a>
    K&ndash;5 sequence, cross-checked against other well-evidenced curricula. The activity choices lean
    on what maths research actually supports &mdash; number line work, subitizing, fact families,
    area models &mdash; rather than on what gamifies most easily.</p>
    <a class="btn sm" href="${b}/about/">Read more</a>
  </div>
</section>`,
  }));
}

/* ------------------------------------------------------------------- grades */
write('grades/index.html', page({
  base: b, active: 'grades', title: 'All grades', desc: 'Math books and games for kindergarten through grade 5.',
  crumbs: [{ label: 'Home', href: '/' }, { label: 'Grades' }],
  body: `<section class="wrap sec" style="padding-top:24px">
    <h2>All grades</h2><p class="sub">Kindergarten through fifth.</p>
    <div class="grades">${GRADES.map((g) => {
      const n = byGrade(g).length;
      return `<a class="gtile" href="${b}/grades/${g}/"><b>${g}</b><span>${n} ${n === 1 ? 'activity' : 'activities'}</span></a>`;
    }).join('')}</div>
    ${GRADES.map((g) => {
      const list = byGrade(g);
      if (!list.length) return '';
      return `<div class="sec"><h2>${gradeName(g)}</h2>
        <p class="sub">${strandsFor(g).join(' · ')}</p>
        <div class="cards">${list.map((a) => activityCard(b, a)).join('')}</div></div>`;
    }).join('')}
  </section>`,
}));

for (const g of GRADES) {
  const list = byGrade(g);
  const books = list.filter((a) => a.kind === 'book');
  const games = list.filter((a) => a.kind === 'game');
  write(`grades/${g}/index.html`, page({
    base: b, active: 'grades', title: gradeName(g),
    desc: `Math books, games and printables for ${gradeName(g).toLowerCase()}.`,
    crumbs: [{ label: 'Home', href: '/' }, { label: 'Grades', href: '/grades/' }, { label: gradeName(g) }],
    body: `<section class="wrap">
      <div class="ahead">
        <div class="gbadge" aria-hidden="true">${g}</div>
        <div><h1>${gradeName(g)}</h1>
          <p>${strandsFor(g).join(' · ')} — ${books.length} book${books.length === 1 ? '' : 's'},
             ${games.length} game${games.length === 1 ? '' : 's'}, all printable.</p></div>
      </div>
      ${books.length ? `<div class="sec"><h2>Books</h2><p class="sub">Guided practice with hints. Not timed.</p>
        <div class="cards">${books.map((a) => activityCard(b, a)).join('')}</div></div>` : ''}
      ${games.length ? `<div class="sec"><h2>Games</h2><p class="sub">Short rounds for building speed.</p>
        <div class="cards">${games.map((a) => activityCard(b, a)).join('')}</div></div>` : ''}
      <div class="sec"><h2>Nearby grades</h2><p class="sub">Practice is often most useful just below or just above.</p>
        <div class="grades">${GRADES.filter((x) => Math.abs(gradeNum(x) - gradeNum(g)) === 1)
          .map((x) => `<a class="gtile" href="${b}/grades/${x}/"><b>${x}</b><span>${gradeName(x)}</span></a>`).join('')}</div></div>
    </section>`,
  }));
}

/* -------------------------------------------------------- books/games index */
for (const kind of ['book', 'game']) {
  const dir = kind === 'book' ? 'books' : 'games';
  const list = activities.filter((a) => a.kind === kind);
  write(`${dir}/index.html`, page({
    base: b, active: dir, title: kind === 'book' ? 'All books' : 'All games',
    desc: kind === 'book' ? 'Every interactive math workbook, K-5.' : 'Every math game, K-5.',
    crumbs: [{ label: 'Home', href: '/' }, { label: kind === 'book' ? 'Books' : 'Games' }],
    body: `<section class="wrap sec" style="padding-top:24px">
      <h2>${kind === 'book' ? 'All books' : 'All games'}</h2>
      <p class="sub">${list.length} ${kind}s across K–5. Every one prints.</p>
      ${GRADES.map((g) => {
        const l = list.filter((a) => a.grade === g);
        if (!l.length) return '';
        return `<div class="sec"><h2 style="font-size:20px">${gradeName(g)}</h2>
          <div class="cards">${l.map((a) => activityCard(b, a)).join('')}</div></div>`;
      }).join('')}
    </section>`,
  }));
}

/* ---------------------------------------------------- one page per activity */
for (const a of activities) {
  const dir = a.kind === 'book' ? 'books' : 'games';
  const engine = a.kind === 'book' ? 'book' : 'game';
  write(`${dir}/${a.id}/index.html`, page({
    base: b, active: dir, title: a.title, desc: a.blurb,
    crumbs: [
      { label: 'Home', href: '/' },
      { label: 'Grades', href: '/grades/' },
      { label: gradeName(a.grade), href: `/grades/${a.grade}/` },
      { label: a.title },
    ],
    body: `<section class="wrap">
      <div class="ahead">
        <div class="gbadge" aria-hidden="true">${a.grade}</div>
        <div><h1>${esc(a.title)}</h1><p>${esc(a.blurb)}</p></div>
      </div>
      <div class="meta" style="margin-top:16px">
        <span class="tag acc">${a.kind === 'book' ? 'Book' : 'Game'}</span>
        <span class="tag">${esc(a.strand)}</span>
        ${(a.ccss || []).map((c) => `<span class="tag">${esc(c)}</span>`).join('')}
        ${roamBadges(a)}
      </div>

      <div class="stage" data-activity="${a.id}">
        <div class="sbar" data-bar></div>
        <div class="sbody" data-stage></div>
      </div>

      <div class="sfoot noprint" style="justify-content:flex-start;margin-top:16px">
        <button class="btn" data-newseed>⟳ New problems</button>
        <a class="btn" href="${b}/print/${a.id}/">▤ Print this</a>
        <a class="btn" href="${b}/grades/${a.grade}/">All of ${gradeName(a.grade).toLowerCase()}</a>
      </div>

      <div class="sec">
        <div class="roam">
          <h3>What this practises</h3>
          <p>${esc(a.skill)}</p>
          ${a.evidence ? `<p style="font-size:13px">${esc(a.evidence)}</p>` : ''}
          ${(a.roam || []).length ? `<p style="font-size:12.5px;color:var(--txt3);margin:12px 0 0;border-top:1px solid var(--line);padding-top:10px">
            Related measured skill${a.roam.length > 1 ? 's' : ''}: ${a.roam.map((l) => esc(roamLabel(l))).join(', ')}.
            <a href="${b}/roam/" style="color:var(--txt2)">What this means</a></p>` : ''}
        </div>
      </div>
    </section>`,
    scripts: [`/assets/src/mount/${engine}.js`],
    head: `<script type="module">window.__ACTIVITY__ = ${JSON.stringify(a.id)};</script>`,
  }));
}

/* ------------------------------------------------------------------ print/ */
for (const a of activities) {
  const ch = getCharacter('none');
  write(`print/${a.id}/index.html`, page({
    base: b, active: 'printables', title: `${a.title} — printable`,
    desc: `Printable sheet and answer key for ${a.title}.`,
    crumbs: [{ label: 'Home', href: '/' }, { label: 'Printables', href: '/printables/' }, { label: a.title }],
    body: `<section class="wrap">
      <div class="ahead noprint">
        <div class="gbadge" aria-hidden="true">${a.grade}</div>
        <div><h1>${esc(a.title)}</h1><p>Printable sheet · ${gradeName(a.grade)} · ${esc(a.strand)}</p></div>
      </div>
      <div class="sfoot noprint" style="justify-content:flex-start;margin:18px 0 0">
        <button class="btn pri" onclick="window.print()">↓ Print or save as PDF</button>
        <button class="btn" data-newseed>⟳ New problems</button>
        <button class="btn" data-togglekey aria-pressed="false">Show answer key</button>
        <button class="btn" data-mode aria-pressed="false">Mixed review sheet</button>
        <a class="btn" href="${b}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/">Do it on screen</a>
      </div>
      <div data-sheet></div>
      <div class="roam noprint" style="margin-top:22px">
        <h3>Printing notes</h3>
        <p>This sheet is line art only — no solid fills anywhere — so it stays cheap on a home
        inkjet. ${ITEMS_NOTE(a)} The answer key is a separate page.</p>
        <p style="font-size:13px">The <strong>mixed review sheet</strong> is a different thing: eight
        problems, shuffled so that no two next to each other need the same method. In a randomised
        trial of 787 students, sheets shuffled that way scored 61% against 38% for the same problems
        grouped by type, on a test a month later. Use the practice sheet while a skill is new, and the
        review sheet a week or two afterwards.</p>
      </div>
    </section>`,
    scripts: ['/assets/src/mount/print.js'],
    head: `<script type="module">window.__ACTIVITY__ = ${JSON.stringify(a.id)};</script>`,
  }));
}
function ITEMS_NOTE(a) {
  const n = a.printItems ?? 12;
  return `It has ${n} problems, which is the density we use for ${gradeName(a.grade).toLowerCase()}.`;
}

/* -------------------------------------------------------------- printables */
write('printables/index.html', page({
  base: b, active: 'printables', title: 'All printables', desc: 'Every Izzi Math sheet, free to print. Fresh problems on every click.',
  crumbs: [{ label: 'Home', href: '/' }, { label: 'Printables' }],
  body: `<section class="wrap sec" style="padding-top:24px">
    <h2>All printables</h2>
    <p class="sub">${activities.length} sheets, each with an answer key. Click "new problems" for a
    fresh set — the generator never runs out.</p>
    ${GRADES.map((g) => {
      const l = byGrade(g);
      if (!l.length) return '';
      return `<div class="sec"><h2 style="font-size:20px">${gradeName(g)}</h2>
        <table class="tbl"><thead><tr><th>Sheet</th><th>Skill</th><th>Standard</th><th></th></tr></thead>
        <tbody>${l.map((a) => `<tr>
          <td><strong>${esc(a.title)}</strong></td>
          <td>${esc(a.skill)}</td>
          <td>${esc((a.ccss || []).join(', '))}</td>
          <td><a class="btn sm" href="${b}/print/${a.id}/">Print</a></td></tr>`).join('')}
        </tbody></table></div>`;
    }).join('')}
  </section>`,
}));

/* --------------------------------------------------------------------- roam */
write('roam/index.html', page({
  base: b, active: '', title: 'Have an assessment score?', desc: 'If your child has taken the Rapid Online Assessment of Math, find matching Izzi Math practice for each score band.',
  crumbs: [{ label: 'Home', href: '/' }, { label: 'Assessment scores' }],
  body: `<section class="wrap">
    <div class="ahead"><div><h1>Have an assessment score?</h1>
      <p>If your child has taken ROAM, this page points you at matching practice.</p></div></div>

    <div class="sec"><div class="roam">
      <h3>What ROAM is</h3>
      <p>The <a href="${ROAM_URL}" style="color:var(--a1)">Rapid Online Assessment of Math</a> is a
      free, fast math assessment from the Brain Development &amp; Education Lab at Stanford. It has
      four parts, and each one measures something different.</p>
      <p><strong>Izzi Math is practice, not assessment.</strong> It never produces a score, never
      predicts one, and never replaces ROAM. The link runs one way: if you happen to have a ROAM
      result, this page can point you at the right practice here.</p>
      <p>ROAM is one of several influences on what Izzi Math contains &mdash; the topic order comes
      from Illustrative Mathematics, and the activity designs come from the wider maths education
      research. You do not need a ROAM score, or any score, to use this site.</p>
    </div></div>

    <div class="sec"><h2>The four parts</h2>
      <div class="cards">${Object.values(tasks).map((t) => `<div class="card"><div class="cbody">
        <h3>${esc(t.short)} — ${esc(t.name)}</h3>
        <p>${esc(t.measures)}</p>
        <div class="meta">${Object.values(t.subscales).map((s) => `<span class="tag roam">${esc(s.name)}</span>`).join('')}</div>
      </div></div>`).join('')}</div>
    </div>

    <div class="sec"><h2>Reading the score</h2>
      <p class="sub">ROAM reports a support category. These are the lab's own thresholds and wording.</p>
      <table class="tbl"><thead><tr><th>Band</th><th>Percentile</th><th>What it means</th><th>What to do</th></tr></thead>
      <tbody>${bandOrder.map((k) => { const x = bands[k]; return `<tr>
        <td><span class="band ${x.cls}"><span class="dot"></span>${esc(x.label)}</span></td>
        <td>${esc(x.pct)}</td><td>${esc(x.meaning)}</td><td>${esc(x.action)}</td></tr>`; }).join('')}
      </tbody></table>
      <p class="sub" style="margin-top:14px">The lab says "needs extra support" rather than
      "high risk" on purpose — it names the action to take, not a label for the child. We use the
      same words.</p>
    </div>

    <div class="sec"><h2>Find your practice</h2>
      <p class="sub">Pick the part of ROAM and the band you were given.</p>
      <div id="rec" data-recommender>
        <noscript><p class="fb hint">The picker needs JavaScript. The full table below works without it.</p></noscript>
      </div>
    </div>

    <div class="sec"><h2>Every skill, and what practises it</h2>
      <table class="tbl"><thead><tr><th>Part</th><th>Skill</th><th>Activities</th></tr></thead>
      <tbody>${allSubscales().map((s) => {
        const hits = activities.filter((a) => (a.roam || []).some((l) => l.task === s.task && l.subscale === s.id));
        return `<tr><td><strong>${esc(s.taskShort)}</strong></td><td>${esc(s.name)}</td>
          <td>${hits.length ? hits.map((a) => `<a href="${b}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/" style="color:var(--a1);text-decoration:none">${esc(a.title)}</a> <span style="color:var(--txt3)">(${a.grade})</span>`).join('<br>') : '<span style="color:var(--txt3)">—</span>'}</td></tr>`;
      }).join('')}</tbody></table>
    </div>
  </section>`,
  scripts: ['/assets/src/mount/roam.js'],
}));

/* -------------------------------------------------------------------- about */
write('about/index.html', page({
  base: b, active: '', title: 'About and credits', desc: 'What Izzi Math is, how it was built, and which curricula and research it draws on.',
  crumbs: [{ label: 'Home', href: '/' }, { label: 'About' }],
  body: `<section class="wrap"><div class="ahead"><div><h1>About Izzi Math</h1>
    <p>Free math practice for families, K–5.</p></div></div>
    <div class="sec" style="max-width:74ch">
      <h2>What this is</h2>
      <p class="sub">Interactive math books and games for kindergarten through fifth grade, where
      every activity also exists as a printable sheet with an answer key. It is built for parents
      at home. There are no accounts, no ads, and nothing to buy.</p>
      <h2 style="margin-top:28px">How it works</h2>
      <p class="sub">Problems come from seeded generators, and the seed lives in the page's web
      address. That means a sheet is reproducible — the same link always gives the same problems,
      so you can print a page today and do it on screen tomorrow — and it also means the practice
      never runs out, because a new seed gives a fresh set.</p>
      <h2 style="margin-top:28px">Credits</h2>
      <p class="sub">See <a href="${b}/roam/" style="color:var(--a1)">the ROAM page</a> for the
      assessment link, and the repository for the full source and the research notes behind the
      content choices.</p>
      <p class="sub"><a class="btn sm" href="https://github.com/yeatmanlab/izzimath">Source on GitHub</a></p>
    </div></section>`,
}));

/* -------------------------------------------------------------------- 404 */
write('404.html', page({
  base: b, title: 'Page not found', desc: 'That page does not exist.',
  body: `<section class="wrap sec" style="padding-top:60px"><h1 style="font-size:40px">Page not found</h1>
    <p class="lede">That link does not go anywhere. Try picking a grade.</p>
    <div class="grades">${GRADES.map((g) => `<a class="gtile" href="${b}/grades/${g}/"><b>${g}</b><span>${gradeName(g)}</span></a>`).join('')}</div>
  </section>`,
}));

// manifest, so the link checker can assert every activity has every surface
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(
  activities.map((a) => ({ id: a.id, kind: a.kind, grade: a.grade, title: a.title, roam: a.roam })), null, 2));

console.log(`built ${pages.length} pages into ${OUT}/  (base="${BASE || '/'}")`);
console.log(`  ${activities.length} activities · ${activities.filter(a=>a.kind==='book').length} books · ${activities.filter(a=>a.kind==='game').length} games`);
