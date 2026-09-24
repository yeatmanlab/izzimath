/* The parent report, rendered into /parents/.
 *
 * Reads through `window.__izziProfile` rather than importing the profile module,
 * for the same reason leaderboard.js and the engines do: profile.js is already
 * on every page, and importing it a second time would re-run its side effects —
 * the global, the listeners, the Scores button.
 *
 * All the judgement is in content/report.js, which is pure. This file only turns
 * a report into markup, which is the split that lets scripts/check.mjs test the
 * decisions on invented numbers with no browser.
 *
 * THREE STATES, AND THE DEFAULT ONE IS "NO PROFILE"
 * Keeping score is opt-in and most readers will never have done it, so the
 * empty state is not an error path — it is the common case, and it has to be
 * worth reading on its own. It says what a report would contain and how to
 * start one, and then the six pieces of guidance below it carry the page the
 * way they always have.
 *
 * WHAT IS DELIBERATELY ABSENT
 * No percentage, no percentile, no grade level, no chart, and no comparison to
 * another child. The page's own sixth point says there are no percentiles here
 * on purpose, and a report bolted to the top of it may not contradict the
 * advice underneath. Counts and a word, and the word is doing the work.
 */

import { reportFor, VERDICTS, doseFor, FLOOR } from '../../content/report.js';
import { activities } from '../../content/activities/index.js';
import { base } from '../lib/url.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* Through src/lib/url.js rather than reading the attribute here: `base()`
   already knows that a base of "/" means the empty string, and a second copy of
   that rule would emit "//grades/" on the live site. */
const href = (p) => `${base()}${p}`;

/* One row of the grade table. `stale` and `none` carry no counts, so they show
   a dash rather than "0 of 0", which reads as a score of zero. */
const countText = (c) => (c.asked ? `${c.right} of ${c.asked}` : '&mdash;');

/* Two strings per kind, and they are separate for a reason. The heading says
   what this step is ABOUT and the button says where it GOES, and on a lesson
   step those are different things: the child is struggling at The Hundred
   Board, and the link opens the number line lesson. One shared string made the
   button read "Open The Hundred Board" above a link to /learn/jumps/ — a label
   that lied about its own destination. */
const KIND = {
  'book-before-game': { word: 'Do the book first', cta: (s) => `Open ${s.title} &rarr;` },
  lesson: { word: 'Watch the lesson', cta: () => 'Watch the short lesson &rarr;' },
  practise: { word: 'Practise this', cta: (s) => `Open ${s.title} &rarr;` },
  gap: { word: 'Nothing tried here yet', cta: (s) => `Try ${s.title} &rarr;` },
};
const FALLBACK = { word: 'Try this', cta: (s) => `Open ${s.title} &rarr;` };

function stepCard(s, k) {
  const kind = KIND[s.kind] ?? FALLBACK;
  return `<li class="rpstep">
    <span class="rpstep-n" aria-hidden="true">${k + 1}</span>
    <div class="rpstep-body">
      <p class="rpstep-kind">${esc(kind.word)}</p>
      <h4 class="rpstep-title">${esc(s.kind === 'lesson' ? s.because : s.title)}</h4>
      <p class="rpstep-why">${esc(s.why)}</p>
      <a class="btn sm" href="${href(s.href)}">${kind.cta({ ...s, title: esc(s.title) })}</a>
    </div>
  </li>`;
}

function strandRow(s) {
  const v = s.verdict;
  const dose = doseFor(v.id);
  return `<div class="rprow rp-${v.id}">
    <div class="rprow-head">
      <h4>${esc(s.strand)}</h4>
      <span class="rpband rpband-${v.id}">${esc(v.label)}</span>
    </div>
    <p class="rprow-count">${s.counts.asked ? `${countText(s.counts)} right ` : ''}<span
      class="rprow-of">${s.counts.asked ? '&middot; ' : ''}${s.started} of ${
      plural(s.of, 'activity', 'activities')} tried</span></p>
    <p class="rprow-say">${esc(v.means)} ${esc(v.doNext)}</p>
    ${dose ? `<p class="rprow-dose">Suggested: about ${dose.minutesPerDay} minutes,
      ${plural(dose.daysPerWeek, 'day', 'days')} a week. ${esc(dose.note)}</p>` : ''}
    ${s.rows.filter((r) => r.counts.asked || r.legacy).length
      ? `<ul class="rpacts">${s.rows.filter((r) => r.counts.asked || r.legacy).map((r) => `<li>
          <a href="${href(r.href)}">${esc(r.title)}</a>
          <span class="rpacts-kind">${r.kind}</span>
          <span class="rpacts-n">${countText(r.counts)}</span>
        </li>`).join('')}</ul>`
      : ''}
  </div>`;
}

/* The honesty block. Not a legal disclaimer at the bottom in small type — it is
   the frame the numbers above only make sense inside, so it sits with them. */
const caveat = (r) => `<div class="rpcaveat">
  <h3>What this is, and what it is not</h3>
  <ul>
    <li>This is a record of <strong>what happened on this site</strong>, and nothing else.
      It is not a test and it is not an assessment.</li>
    <li>An activity nobody opened says <strong>nothing</strong> about whether your child can
      do it. &ldquo;Not started&rdquo; is a gap in the record, not a gap in their maths.</li>
    <li>There is no percentile and no grade level here, for the reason given in point 6
      below: comparison does not reduce maths anxiety, and building competence does.</li>
    <li>Fewer than ${FLOOR} questions answered is too few to say anything, so those lines
      say so instead of guessing.</li>
    ${r.legacy ? `<li>Some of this was played before the site started counting how many
      questions it asked, so those lines have no ratio yet. One more go fixes that.</li>` : ''}
  </ul>
</div>`;

function renderReport(host, { profile, report }) {
  if (!profile) {
    host.innerHTML = `<div class="rpempty">
      <h2>Your child&rsquo;s progress</h2>
      <p class="sub">Nobody is keeping score in this browser, so there is nothing to report yet
      &mdash; which is the default, and it costs nothing.</p>
      <p class="sub">Keeping score is a creature, a name and a secret snack. No account, no email,
      and nothing leaves this device. Once a few activities have been done, this is where you get
      a strand-by-strand picture of how they went and what to do next.</p>
      <p class="sub"><a class="btn pri" href="${href('/grades/')}">Pick a grade and start &rarr;</a>
        <a class="btn sm" href="${href('/badges/')}">What keeping score gets you</a></p>
    </div>`;
    return;
  }

  const name = esc(profile.name);
  if (!report.seen) {
    host.innerHTML = `<div class="rpempty">
      <h2>${name}&rsquo;s progress</h2>
      <p class="sub">${name} is keeping score, but has not finished anything yet. One book or one
      game is enough to start this off.</p>
      <p class="sub"><a class="btn pri" href="${href('/grades/')}">Pick a grade &rarr;</a></p>
    </div>`;
    return;
  }

  const t = report.totals;
  host.innerHTML = `<div class="rpwrap">
    <h2>${name}&rsquo;s progress</h2>
    <p class="sub rplede">${plural(report.seen, 'activity', 'activities')} tried${
      t.asked ? `, ${t.right} of ${t.asked} questions right` : ''}.
      ${report.workingGrades.length
        ? `Working in ${report.workingGrades.length === 1 ? 'grade' : 'grades'} ${
          report.workingGrades.map((g) => (g === 'K' ? 'K' : g)).join(', ')}.`
        : ''}</p>

    ${report.next.length ? `<section class="rpnext">
      <h3>What to work on next</h3>
      <p class="sub">${plural(report.next.length, 'thing', 'things')}, in this order. Deliberately
      short: a list of nine gets none of them done.</p>
      <ol class="rpsteps">${report.next.map(stepCard).join('')}</ol>
    </section>` : ''}

    <section class="rpstrands">
      <h3>Strand by strand</h3>
      ${report.grades.map((g) => `<div class="rpgrade">
        <h4 class="rpgrade-h">${g.grade === 'K' ? 'Kindergarten' : `Grade ${g.grade}`}</h4>
        ${g.strands.map(strandRow).join('')}
      </div>`).join('')}
    </section>

    ${caveat(report)}
  </div>`;
}

async function mount() {
  const host = document.querySelector('[data-report]');
  if (!host) return;

  const draw = async () => {
    const P = window.__izziProfile;
    let profile = null, progress = {};
    try {
      profile = (await P?.store?.getActive?.()) ?? null;
      if (profile) progress = (await P?.store?.allProgress?.(profile.id)) ?? {};
    } catch {
      /* Storage blocked (private browsing). The empty state is the honest
         answer there, and it is the same one a reader with no profile gets. */
      profile = null; progress = {};
    }
    renderReport(host, { profile, report: reportFor({ activities, progress }) });
  };

  await draw();
  /* Redrawn when anything is recorded or the profile changes, so a parent who
     leaves this tab open beside a child playing in another one sees it move. */
  document.addEventListener('izzi:progress', draw);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
}
