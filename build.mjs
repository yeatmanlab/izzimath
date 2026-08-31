// Static site generator. Zero dependencies — plain Node emitting plain HTML.
//   node build.mjs            -> dist/ with base ''      (local preview)
//   BASE=/izzimath node build.mjs  -> dist/ for GitHub Pages project site

import fs from 'node:fs';
import path from 'node:path';
import { page, activityCard, esc, GRADES, gradeName, gradeNum, roamBadges, grownUpsNote } from './scripts/templates.mjs';
import { sheet } from './src/lib/printsheet.js';
import { activities, byGrade, strandsFor, STRANDS } from './content/activities/index.js';
import { references, refIds, getRef, refShort, refCitation, buildReverseIndex, isSiteScope, STRENGTH, KINDS } from './content/references.js';
import { IM_UNITS, imUnit, imUnitsFor, imCourseGuide } from './content/curriculum.js';
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
    <a class="btn" href="${b}/parents/">How to help</a>
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
    <h2 style="font-size:15px">Where the content comes from</h2>
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
    <h1 style="font-size:30px">All grades</h1><p class="sub">Kindergarten through fifth.</p>
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
      <h1 style="font-size:30px">${kind === 'book' ? 'All books' : 'All games'}</h1>
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
        ${grownUpsNote(a)}
      </div>

      <div class="sec">
        <div class="roam">
          <h2 style="font-size:15px">What this practises</h2>
          <p>${esc(a.skill)}</p>
          ${a.evidence ? `<p style="font-size:13px">${esc(a.evidence)}</p>` : ''}
          ${a.theory ? `<dl class="refbody" style="margin-top:12px">
            <dt>The underlying idea</dt><dd>${esc(a.theory)}</dd>
            ${(a.im || []).length ? `<dt>Where this sits in Illustrative Mathematics</dt>
              <dd>${imUnitsFor(a.grade, a.im).map((u) => `<a href="${esc(u.url)}">${gradeName(a.grade)} Unit ${u.n}: ${esc(u.title)}</a>`).join(' &middot; ')}</dd>` : ''}
            ${(a.refs || []).length ? `<dt>Sources</dt>
              <dd>${a.refs.map((id) => `<a href="${b}/references/#ref-${esc(id)}">${esc(refShort(id))}</a>`).join(' &middot; ')}
              &nbsp;<a href="${b}/references/" style="color:var(--txt3)">all references &rarr;</a></dd>` : ''}
          </dl>` : ''}
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
        <button class="btn" data-style aria-pressed="false">Plain black &amp; white</button>
        <a class="btn" href="${b}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/">Do it on screen</a>
      </div>
      <div data-sheet></div>
      <div class="roam noprint" style="margin-top:22px">
        <h2 style="font-size:15px">Printing notes</h2>
        <p>Every sheet is one full page, line art only, with no solid fills anywhere.
        ${ITEMS_NOTE(a)} The answer key is a separate page.</p>
        <p style="font-size:13px"><strong>Two styles.</strong> The default has a proper header,
        rounded problem boxes and a self-check strip. <strong>Plain black and white</strong> strips all
        of that back to hairlines and nothing else — same problems, the least ink a printer can use.</p>
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
    <h1 style="font-size:30px">All printables</h1>
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
      <h2 style="font-size:15px">What ROAM is</h2>
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
  base: b, active: '', title: 'About and credits', desc: 'What Izzi Math is, how it works, and which curricula and research it draws on.',
  crumbs: [{ label: 'Home', href: '/' }, { label: 'About' }],
  body: `<section class="wrap"><div class="ahead"><div><h1>About Izzi Math</h1>
    <p>Free maths practice for families, kindergarten through fifth grade.</p></div></div>

    <div class="sec" style="max-width:76ch">
      <h2>What this is</h2>
      <p class="sub">Interactive maths books and games for K&ndash;5, where every activity also
      exists as a printable sheet with an answer key. It is built for parents at home rather than
      for schools. There are no accounts, no ads, and nothing to buy.</p>

      <h2 style="margin-top:30px">How it works</h2>
      <p class="sub">Problems come from seeded generators, and the seed lives in the page&rsquo;s web
      address. That means two useful things. A sheet is <strong>reproducible</strong> &mdash; the same
      link always gives the same problems, so you can print a page today and do it on screen tomorrow.
      And the practice <strong>never runs out</strong>, because a new seed gives a fresh set of
      problems from the same generator.</p>
      <p class="sub">There is no login because there is nothing to store. The address bar is the save
      file.</p>

      <h2 style="margin-top:30px">Books, games, and sheets</h2>
      <table class="tbl"><tbody>
        <tr><td><strong>Books</strong></td><td>Guided practice with hints and worked explanations.
          Never timed &mdash; thinking time is the point.</td></tr>
        <tr><td><strong>Games</strong></td><td>Short replayable rounds for building speed. Timers are
          off by default and always one click to disable. Nothing is scored against anyone else.</td></tr>
        <tr><td><strong>Practice sheets</strong></td><td>Problems grouped by type, with clear
          instructions. Use these while a skill is new.</td></tr>
        <tr><td><strong>Review sheets</strong></td><td>Eight problems, shuffled so no two next to each
          other need the same method. Use these a week or two later.</td></tr>
      </tbody></table>

      <h2 style="margin-top:30px">Where the content comes from</h2>
      <p class="sub">The order topics appear in follows the
      <a href="https://illustrativemathematics.org/math-curriculum/" style="color:var(--a1)">Illustrative
      Mathematics</a> K&ndash;5 sequence, which is free, openly licensed and coherent across the whole
      grade band.</p>
      <p class="sub">Which activities got built is a separate question, and that followed the research
      rather than the curriculum. The strongest evidence in primary maths is attached to particular
      <em>practices</em> rather than to any brand of curriculum &mdash; so the site leans on the ones
      that have held up: linear number lines, fraction number lines, brief-exposure subitizing,
      part-whole number bonds, area models, and mixed review.</p>
      <p class="sub">Two examples of that showing up in the build. <strong>The Great Race</strong> is a
      straight implementation of a game from Siegler and Ramani&rsquo;s work, including the detail that
      the child names the squares they pass through, counting on from where they are &mdash; that
      detail roughly doubled the effect in a later study, so tapping &ldquo;one, two&rdquo; is treated
      as an error and corrected. And <strong>review sheets</strong> hold eight mixed problems because a
      randomised trial of 787 students found the same problems shuffled that way scored 61% against 38%
      a month later.</p>

      <h2 style="margin-top:30px">Being honest about the evidence</h2>
      <p class="sub">Illustrative Mathematics is rated highly for design quality &mdash; EdReports
      places it at &ldquo;meets expectations&rdquo; in all three gateways at every grade K&ndash;5.
      That is not the same as proof that it raises attainment, and there are no high-quality studies of
      IM K&ndash;5 learning outcomes. The impressive effect sizes usually quoted for IM come from
      grades 6&ndash;8, not from primary. We use it as a well-vetted plan, not as a guarantee.</p>
      <p class="sub">Every citation, what it found, how it is used, and which activities rest on it
      is on the <a href="${b}/references/" style="color:var(--a1)">references page</a> &mdash;
      including the sources that shape what we deliberately do <em>not</em> build.</p>

      <h2 style="margin-top:30px">Assessment</h2>
      <p class="sub">Izzi Math is practice, not assessment. It never produces a score and never
      predicts one. If your child has taken the Rapid Online Assessment of Maths, the
      <a href="${b}/roam/" style="color:var(--a1)">score page</a> can point you at matching practice
      &mdash; but you do not need a score, or any assessment, to use anything here.</p>

      <h2 style="margin-top:30px">Credits</h2>
      <p class="sub">Built by the
      <a href="https://edneuro.stanford.edu/" style="color:var(--a1)">Brain Development &amp; Education
      Lab</a> at Stanford. Curriculum sequence from Illustrative Mathematics. Activity designs drawn
      from the maths education research literature, credited in full in the repository.</p>
      <p class="sub" style="margin-top:18px">
        <a class="btn sm" href="https://github.com/yeatmanlab/izzimath">Source on GitHub</a>
        <a class="btn sm" href="${b}/printables/">All printables</a>
      </p>
    </div></section>`,
}));

/* ------------------------------------------------------------------ parents */
write('parents/index.html', page({
  base: b, active: 'parents', title: 'How to help', desc: 'Short, practical guidance for parents using Izzi Math at home — how long, how often, and what to say when your child is stuck.',
  crumbs: [{ label: 'Home', href: '/' }, { label: 'How to help' }],
  body: `<section class="wrap"><div class="ahead"><div><h1>How to help</h1>
    <p>Six things that make more difference than which activity you pick.</p></div></div>

    <div class="sec" style="max-width:76ch">
      <p class="sub">This page exists because of a specific finding. A 2024 review of 25 maths
      programmes delivered by parents at home found a modest average benefit &mdash; and that the
      benefit depended on whether the adult got any guidance and follow-up. Handing over good
      materials with no guidance is the version that barely works. So here is the guidance.</p>

      <h2 style="margin-top:30px">1. Short and often, not long and occasional</h2>
      <p class="sub">Ten minutes, a few times a week, for a few weeks. In the early-numeracy trials,
      the programmes with the <em>largest</em> effects were eight weeks or shorter. Long diffuse
      practice is not the thing that works.</p>

      <h2 style="margin-top:26px">2. Say why, not just right or wrong</h2>
      <p class="sub">This is the single easiest win available to you. Feedback that explains is worth
      roughly ten times feedback that only says correct or incorrect &mdash; and the gap is larger in
      maths than in any other subject. Every activity shows the working after an answer. Read it
      together instead of clicking on.</p>

      <h2 style="margin-top:26px">3. When they are stuck, give the strategy, not the answer</h2>
      <p class="sub">Every game names a strategy before it starts, and keeps it one tap away. Practice
      with a named strategy is dramatically more useful than the same practice without one &mdash; a
      bigger difference than anything to do with speed or timing. So the useful prompt is
      &ldquo;what did we say about counting on?&rdquo; rather than &ldquo;it&rsquo;s seven&rdquo;.</p>

      <h2 style="margin-top:26px">4. Books first, games second</h2>
      <p class="sub">Books are for learning something and are never timed. Games are for getting
      quicker at something already learned. Doing it in that order matters: practising speed on
      something not yet understood is the thing the research warns against most directly.</p>

      <h2 style="margin-top:26px">5. Print the same problems again later</h2>
      <p class="sub">Every activity prints. Doing the <em>same</em> page on paper a few days later is
      worth more than doing twice as much today. There is also a <strong>mixed review sheet</strong>
      on every print page &mdash; eight problems shuffled so no two in a row use the same method. It
      will feel harder and it is meant to. In a trial of 787 children, shuffled sheets scored 61%
      against 38% for the same problems grouped by type, on a test a month later.</p>

      <h2 style="margin-top:26px">6. Do not compare them to anyone</h2>
      <p class="sub">There are no leaderboards or percentiles here, on purpose. Maths anxiety is real,
      it is measurable, and counterintuitively it affects capable children at least as much. The
      evidence on reducing it is unglamorous: building competence lowers anxiety. Comparison does not.</p>

      <h2 style="margin-top:30px">A realistic expectation</h2>
      <p class="sub">The best-evidenced digital maths programmes, tested on thousands of children,
      move attainment by a small amount &mdash; not by a grade level. Anything promising more than
      that is overselling. What this site is for is regular, sensible, well-chosen practice that is
      free and does not waste your child&rsquo;s time.</p>

      <p class="sub" style="margin-top:22px">
        <a class="btn sm" href="${b}/grades/">Pick a grade</a>
        <a class="btn sm" href="${b}/references/">See the research</a>
        <a class="btn sm" href="${b}/printables/">All printables</a>
      </p>
    </div></section>`,
}));

/* --------------------------------------------------------------- references */
{
  const rev = buildReverseIndex(activities);
  const actLink = (a) => `<a href="${b}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/">${esc(a.title)}</a> <span style="color:var(--txt3)">(${a.grade})</span>`;

  const strengthOrder = ['strong', 'moderate', 'limited', 'design', 'null_'];
  const sorted = refIds.slice().sort((x, y) => {
    const rx = getRef(x), ry = getRef(y);
    return strengthOrder.indexOf(rx.strength) - strengthOrder.indexOf(ry.strength)
      || (rx.authors > ry.authors ? 1 : -1);
  });

  const card = (id) => {
    const r = refCitation(id);
    const cites = rev[id] || [];
    const st = STRENGTH[r.strength];
    return `<div class="ref" id="ref-${esc(id)}">
      <div class="refhead">
        <h3>${esc(r.authors)} (${r.year})</h3>
        <span class="tag str-${esc(r.strength)}">${esc(st.label)}</span>
        <span class="tag">${esc(KINDS[r.kind] || r.kind)}</span>
      </div>
      <p class="reftitle">${esc(r.title)}</p>
      <p class="refvenue">${esc(r.venue)}${r.link ? ` &middot; <a href="${r.link}">${r.doi ? 'doi:' + esc(r.doi) : 'link'}</a>` : ''}</p>
      <dl class="refbody">
        <dt>What it found</dt><dd>${esc(r.finding)}</dd>
        <dt>How Izzi Math uses it</dt><dd>${esc(r.use)}</dd>
        ${cites.length
          ? `<dt>Activities built on it <span class="refn">${cites.length}</span></dt><dd>${cites.map(actLink).join(' &middot; ')}</dd>`
          : `<dt>Scope</dt><dd>Informs a site-wide decision rather than one activity.</dd>`}
      </dl>
    </div>`;
  };

  write('references/index.html', page({
    base: b, active: 'references', title: 'References',
    desc: 'The research behind Izzi Math: every citation, what it found, how it is used, and which activities are built on it.',
    crumbs: [{ label: 'Home', href: '/' }, { label: 'References' }],
    body: `<section class="wrap">
      <div class="ahead"><div><h1>References</h1>
        <p>${refIds.length} sources. What each found, how it is used, and which activities rest on it.</p></div></div>

      <div class="sec" style="max-width:78ch">
        <p class="sub">This page exists so the research behind the site can be checked rather than
        taken on trust. Every activity page links to the citations behind it, and every citation
        below links back to the activities built on it. Where a source is a practitioner document or
        a null result rather than a trial, it says so &mdash; nothing here borrows authority from the
        references around it.</p>
        <p class="sub">The headline finding worth repeating: <strong>the strongest evidence in
        primary maths attaches to instructional practices, not to any brand of curriculum.</strong>
        That is why the design anchors on the WWC practice guide, and treats
        <a href="${esc(imCourseGuide('3'))}" style="color:var(--a1)">Illustrative Mathematics</a> as
        a well-built plan for topic order rather than as proof of outcomes.</p>
      </div>

      <div class="sec">
        <h2>How to read the strength labels</h2>
        <table class="tbl"><tbody>
          ${strengthOrder.map((k) => `<tr><td><span class="tag str-${k}">${esc(STRENGTH[k].label)}</span></td>
            <td>${esc(STRENGTH[k].blurb)}</td>
            <td style="color:var(--txt3)">${refIds.filter((i) => getRef(i).strength === k).length} sources</td></tr>`).join('')}
        </tbody></table>
      </div>

      <div class="sec">
        <h2>Curriculum map</h2>
        <p class="sub">Which Illustrative Mathematics unit each activity belongs to. Unit links go
        straight to that unit&rsquo;s lesson list.</p>
        ${GRADES.map((g) => {
          const list = byGrade(g);
          if (!list.length) return '';
          return `<div style="margin-bottom:26px">
            <h3 style="font-size:16px;margin-bottom:4px">${gradeName(g)}</h3>
            <p class="sub" style="margin-bottom:10px"><a href="${esc(imCourseGuide(g))}" style="color:var(--txt2)">IM ${gradeName(g).toLowerCase()} scope and sequence &rarr;</a></p>
            <table class="tbl"><thead><tr><th>Activity</th><th>IM unit</th><th>Underlying idea</th></tr></thead>
            <tbody>${list.map((a) => `<tr>
              <td>${actLink(a)}</td>
              <td>${imUnitsFor(a.grade, a.im || []).map((u) => `<a href="${esc(u.url)}">Unit ${u.n}: ${esc(u.title)}</a>`).join('<br>')}</td>
              <td>${esc(a.theory || '')}</td></tr>`).join('')}
            </tbody></table></div>`;
        }).join('')}
      </div>

      <div class="sec">
        <h2>Activity to citation</h2>
        <p class="sub">Every activity and the sources it rests on.</p>
        <table class="tbl"><thead><tr><th>Activity</th><th>Grade</th><th>Sources</th></tr></thead>
        <tbody>${activities.map((a) => `<tr>
          <td>${actLink(a)}</td><td>${a.grade}</td>
          <td>${(a.refs || []).map((id) => `<a href="#ref-${esc(id)}">${esc(refShort(id))}</a>`).join(' &middot; ')}</td>
        </tr>`).join('')}</tbody></table>
      </div>

      <div class="sec">
        <h2>The sources</h2>
        <p class="sub">Ordered by how much weight each can carry.</p>
        <div class="reflist">${sorted.map(card).join('')}</div>
      </div>

      <div class="sec">
        <h2>What we deliberately do not build</h2>
        <p class="sub">Null results are as useful as positive ones. These sources shape what is
        absent from the site.</p>
        <ul style="display:grid;gap:10px;padding-left:18px">
          ${refIds.filter((i) => getRef(i).strength === 'null_').map((i) => {
            const r = refCitation(i);
            return `<li style="font-size:14px;color:var(--txt2)"><a href="#ref-${esc(i)}" style="color:var(--a1)">${esc(r.short)}</a> &mdash; ${esc(r.use)}</li>`;
          }).join('')}
        </ul>
      </div>
    </section>`,
  }));
}

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
