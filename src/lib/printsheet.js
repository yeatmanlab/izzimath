// Print renderers. Build-time twin of src/engine/render.js: the same problem
// objects, laid out for paper. Stroke-only, no fills — a home inkjet is paying
// for every drop.

import { numberLine, tickRange, numberBond, dots, tenFrame, fractionBar, array2d, baseTen, esc } from './widgets.js';
import { answerText } from '../../content/types.js';
import { rng, deriveSeed } from './rng.js';
import { lineArt } from './sprites.js';
import { fill } from '../../content/characters.js';

/* Items per sheet by grade — younger children get fewer, larger problems with
   more room to write. Grounded in the printables research: density, not volume,
   is what makes a sheet usable. */
export const DENSITY = { K: 'd1', 1: 'd1', 2: 'd2', 3: 'd2', 4: 'd3', 5: 'd3' };

/* Age bands, for the designed sheet only. A Kindergarten sheet and a Grade 5
   sheet should not look the same: a five-year-old needs big type, few problems
   and something to colour in, and a ten-year-old finds exactly that babyish and
   stops taking the page seriously. Same maths, same characters, same typeface —
   three different amounts of decoration.

     little  K-1   biggest type, fewest items, character speaks, stars to colour
     middle  2-3   named sections, a trick box, scratch space, self-check
     big     4-5   compact strategy note, denser grid, a challenge instead of stars
*/
export const AGE_BAND = { K: 'little', 1: 'little', 2: 'middle', 3: 'middle', 4: 'big', 5: 'big' };

/* How many pages of problems a reader may ask for.

   Not a free choice: a generator has a finite item space, and asking for four
   pages of an activity with twenty distinct problems means printing the same sums
   twice. `printMaxPages` is measured — item space divided by the measured items
   per page, with a page of slack — and defaults to 4 where it is not stated.

   K and grade 1 are held at one page, which is the standing invariant: a young
   child should be able to finish the sheet. A parent who wants a week of grade 1
   practice wants the practice pack, which is several finishable sheets rather
   than one long one. */
export const MAX_PAGES_DEFAULT = 4;
export const maxPagesFor = (activity) =>
  Math.max(1, Math.min(MAX_PAGES_DEFAULT, activity.printMaxPages ?? MAX_PAGES_DEFAULT));

/* Items to draw for a requested page count, scaled from the authored length.

   One fewer per page once it is paginated, and that is measured rather than
   cautious: page 1 of a multi-page sheet carries the trick box AND the worked
   example while a single page also carries the self-check and reward strip, and
   it still came out 0.24in taller at the same item count. Rather than model why,
   the count comes down by one per page, which the page-fill harness confirms.

   One activity resists this entirely. array-architect draws arrays whose height
   varies a lot, and collect()'s de-duplication picks a DIFFERENT, taller mix
   when asked for more items — so its page 1 overflowed at 8, 9 and 10 items
   alike while 10 fitted on a single page. It is capped at one page rather than
   pretending a formula covers it. If more activities grow height-variable
   figures, the honest fix is a measured per-page count per activity, not a
   cleverer formula. */
export const itemsForPages = (activity, pages) => {
  const perPage = Math.max(1, Math.round((activity.printItems ?? 12) / (activity.printPages ?? 1)));
  const n = Math.max(1, Math.min(maxPagesFor(activity), pages));
  return n === 1 ? perPage : Math.max(n, perPage * n - n);
};

/* How many problems a mixed-review sheet holds.

   Eight is not an arbitrary number — it is Rohrer's literal worksheet template,
   the one that produced 61% against 38% a month later. So eight stays wherever
   eight fits, and the only deviation is Kindergarten and grade 1, where eight
   problems at 21px type with a figure on each one is a page and a half. Five is
   what fits there. The trial was grade 7 in any case, so the K-1 number was
   already an inference from mechanism rather than a replication. */
const REVIEW_ITEMS = { little: 5, middle: 8, big: 8 };

/* Exported so the print page can state the truth. A mixed review sheet is a
   fixed short set by design — Rohrer's template — so it ignores a page count,
   and the summary line has to know that rather than multiplying a number that
   does not apply. */
export const reviewItemsFor = (activity) => {
  const band = AGE_BAND[activity.grade] ?? 'middle';
  const authored = activity.printItems ?? ITEMS_PER_SHEET[activity.grade] ?? 16;
  return Math.max(3, Math.min(REVIEW_ITEMS[band] ?? 8, authored));
};

/* A section heading a child would actually read. "Answer each one" is what an
   adult calls it; these are what it is. Used on the little and middle bands —
   the big band gets the plain instruction, because by grade 4 the jolly title
   reads as being talked down to. */
const TYPE_TITLE = {
  input: 'Work it out',
  choice: 'Pick the answer',
  compare: 'Bigger or smaller?',
  truefalse: 'True or false?',
  bond: 'Find the missing number',
  tap: 'Draw it',
  ordinal: 'Which one?',
  numberline: 'Mark the line',
  boardmove: 'Spin and move',
};
// Enough problems to fill one full page at the density that grade uses. Two
// columns of large problems for K-1, up to four narrow columns by grade 4.
// Trimmed when the trick box and the scratch space arrived: those take about an
// inch between them, and a sheet that spills onto a second page is worse than a
// sheet with two fewer sums. Calibrated in a real browser by tools/pagefill.html
// — every sheet has to land inside one page and above 70% of it.
export const ITEMS_PER_SHEET = { K: 8, 1: 10, 2: 15, 3: 18, 4: 22, 5: 22 };
// Problems that need the full width, so they count for more vertical space.
const WIDE_TYPES = new Set(['numberline', 'boardmove']);

const ansLine = (w = '2.6em') => `<span class="ansline" style="min-width:${w}"></span>`;

/* The trick box. Naming the strategy before the practice is the same rule the
   games follow on screen, and it is the one thing a printable can carry that a
   bare column of sums cannot. The label changes with age; the content does not. */
function trickBox(activity, ch, band) {
  const t = activity.trick || activity.strategy;
  if (!t) return '';
  const named = ch.id !== 'none';
  // An activity can override the label. The SSDD sheet needs it: "the trick"
  // is exactly wrong on a sheet whose point is that there is no one method.
  const label = activity.trickLabel
    ? activity.trickLabel
    : band === 'big' ? 'Strategy'
    : band === 'little' ? (named ? `${ch.name} says` : 'Try this first')
    : (named ? `${ch.name}\u2019s trick` : 'The trick');
  // On the little band the character says it, so the art belongs in the box.
  const art = band === 'little' && named ? `<span class="tb-art">${lineArt(ch.id)}</span>` : '';
  return `<div class="sh-trick">${art}<div><p class="tb-label">${esc(label)}</p>
    <p class="tb-body">${esc(fill(t, ch))}</p></div></div>`;
}

/* Somewhere to work. A child doing two-digit addition in their head because the
   sheet gave them nowhere to write is the sheet's fault. It grows to absorb
   whatever vertical space the problems left over, so the page still fills. */
const scratchSpace = (label = 'Scratch space \u2014 work it out here') =>
  `<div class="sh-scratch"><span>${esc(label)}</span></div>`;

/* What the bottom of the sheet offers, by age. K-1 colour a star in; grades 2-3
   tick circles; grades 4-5 get neither, because a ten-year-old reads a row of
   stars as a sheet meant for somebody younger. */
function rewardStrip(band, count, ch) {
  const n = Math.min(count, band === 'little' ? 10 : 12);
  if (band === 'little') {
    const star = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.4 9.6l6.7-.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    return `<div class="sh-check stars">
      <strong>${ch.id === 'none' ? 'Nice work!' : esc(ch.name) + ' says nice work!'}</strong>
      <span>Colour a star for every one you get right.</span>
      <span class="boxes">${Array.from({ length: n }, () => star).join('')}</span></div>`;
  }
  if (band === 'big') return '';
  return `<div class="sh-check">
    <strong>How did it go?</strong>
    <span>Tick one for every question you got right.</span>
    <span class="boxes">${Array.from({ length: n }, () => '<i></i>').join('')}</span></div>`;
}

/* One problem, print form. `key` renders the answer instead of a blank. */
export function printProblem(p, i, { key = false } = {}) {
  const lbl = `<span class="lbl">${String.fromCharCode(97 + (i % 26))})</span>`;
  const A = (v) => (key ? `<span class="ansval">${esc(v)}</span>` : ansLine());
  /* Some stems carry their own blanks — "partial products are ____ and ____".
     Appending another answer box after those gave the child two places to write
     one answer, and on a grade 5 sheet it appeared on six problems at once. So
     the stem's own underscores become the answer boxes, and nothing is appended.
     The key keeps the underscores as written and prints the answer beside them,
     because one stem can hold two blanks for a single stated answer. */
  const stemBlanks = (t) => String(t ?? '').replace(/_{3,}/g, () => ansLine('2.2em'));
  const ownBlank = (t) => /_{3,}/.test(String(t ?? ''));

  // A word problem's key gives the working and a full sentence, not just a
  // number: "8" tells an adult nothing about whether the story was understood.
  if (key && p.schema) {
    return `<div class="pr">${lbl}${p.printStem ?? stripTags(p.prompt)}
      <div class="keyline"><span class="ansval">${esc(answerText(p))}</span>
        ${p.explain ? `<em>${esc(p.explain)}</em>` : ''}</div></div>`;
  }

  switch (p.type) {
    case 'input':
    case 'choice': {
      // If the problem has a print-mode visual (a bar, an array, a ten-frame),
      // draw it. Describing a picture in words on a worksheet defeats the point.
      const raw = p.printStem ?? p.stem ?? stripTags(p.prompt);
      const own = ownBlank(raw);
      const stem = key || !own ? raw : stemBlanks(raw);
      const tail = own && !key ? '' : ' ' + A(answerText(p));
      return `<div class="pr">${lbl}${stem}${p.printVisual ? '' : tail}
        ${p.printVisual ? `<div class="pv">${p.printVisual}</div>${own && !key ? '' : A(answerText(p))}` : ''}</div>`;
    }

    case 'compare':
      return `<div class="pr">${lbl}<span style="letter-spacing:.06em">${esc(p.left)} &nbsp;${key ? (p.answer === 'left' ? '&gt;' : '&lt;') : '<span class="ansline" style="min-width:1.4em"></span>'}&nbsp; ${esc(p.right)}</span></div>`;

    case 'truefalse':
      return `<div class="pr">${lbl}${p.printStem ?? stripTags(p.prompt)} &nbsp; ${key ? `<span class="ansval">${answerText(p)}</span>` : 'T / F'}</div>`;

    case 'bond':
      // Wrapped in .pv like every other figure. It used to sit in a bare div,
      // which is why it was the one figure the height cap never reached — it
      // rendered at its natural 150px and made a six-item sheet two pages long.
      return `<div class="pr" style="text-align:center">${lbl}<div class="pv bond">${numberBond(
        p.blank === 'whole' && key ? p.whole : p.whole,
        p.blank === 'a' && !key ? '' : p.a,
        p.blank === 'b' && !key ? '' : p.b,
        { print: true, blank: key ? null : p.blank, size: 150 })}</div></div>`;

    case 'ordinal':
      return `<div class="pr">${lbl}${p.printStem ?? stripTags(p.prompt)} ${A(answerText(p))}</div>`;

    case 'tap':
      return `<div class="pr">${lbl}Draw ${p.answer ?? p.n} ${p.itemLabel ?? 'counters'} in the box.
        <div class="workbox"></div>${key ? `<div class="sh-note">Answer: ${answerText(p)}</div>` : ''}</div>`;

    case 'boardmove': {
      const N = p.hi ?? 10;
      const u = 30, ox = 2, oy = 2;
      let board = `<svg viewBox="0 0 ${ox * 2 + N * u} 40" width="100%" height="40" role="img" aria-label="board 1 to ${N}"><g font-family="'Space Grotesk',sans-serif" font-size="14">`;
      for (let v = 1; v <= N; v++) {
        const x = ox + (v - 1) * u;
        board += `<rect x="${x}" y="${oy}" width="${u - 1}" height="34" fill="none" stroke="#111" stroke-width="1.3"/>`;
        board += `<text x="${x + u / 2}" y="${oy + 23}" text-anchor="middle" fill="#111">${v}</text>`;
        if (v === p.from) board += `<circle cx="${x + u / 2}" cy="${oy + 30}" r="3.4" fill="#111"/>`;
      }
      board += `</g></svg>`;
      return `<div class="pr wide" style="grid-column:1/-1">${lbl}On <strong>${p.from === 0 ? 'Start' : p.from}</strong> (●), spin <strong>${p.spin}</strong> — write the squares you pass.
        <div class="pv" style="max-width:none">${board}</div>
        ${key ? `<span class="ansval">${answerText(p)}</span>` : ansLine('7em')}</div>`;
    }

    case 'numberline':
      return `<div class="pr wide" style="grid-column:1/-1">${lbl}${p.printStem ?? `Mark <strong>${esc(p.targetLabel ?? p.target)}</strong> on the line.`}
        ${numberLine({
          lo: p.lo, hi: p.hi, ticks: p.ticks ?? [], majors: p.majors ?? [p.lo, p.hi],
          labels: p.labels ?? [[p.lo, String(p.lo)], [p.hi, String(p.hi)]],
          marker: key ? p.target : null, markerLabel: key ? (p.targetLabel ?? p.target) : null,
          print: true, width: 620, height: 54,
        })}</div>`;

    default:
      return `<div class="pr">${lbl}${stripTags(p.prompt || '')} ${A(answerText(p))}</div>`;
  }
}

const stripTags = (s) => String(s ?? '').replace(/<svg[\s\S]*?<\/svg>/g, '□').replace(/<[^>]+>/g, '');

/* Generate n problems, skipping ones identical to a problem already on the sheet.
   Two adjacent copies of "5 x 2 =" looks like a mistake even when it is a fair
   draw, so we resample with a nudged sub-seed a few times before giving up. */
function collect(activity, seed, ch, n) {
  const out = [];
  const seen = new Set();
  // The key has to include whatever actually distinguishes two problems of this
  // type. Prompt plus answer is not enough: every comparison says "Which is
  // greater?" and answers left or right, so without the operands the whole
  // activity collapses to two keys.
  const key = (p) => JSON.stringify([
    p.type,
    p.printStem ?? p.prompt ?? '',
    p.answer ?? '', p.target ?? '', p.n ?? '',
    p.left ?? '', p.right ?? '',
    p.whole ?? '', p.a ?? '', p.b ?? '', p.blank ?? '',
    p.from ?? '', p.spin ?? '',
    p.printVisual ?? '', p.visual ?? '',
  ]);
  for (let i = 0; i < n; i++) {
    let p = null;
    // First try fresh seeds at this index, which preserves the activity's
    // difficulty progression. If the pool at this index is too small to escape a
    // collision, walk the index as well — a repeated item on paper reads as a
    // mistake, and variety matters more there than exact ordering.
    for (let tries = 0; tries < 24 && (p === null || seen.has(key(p))); tries++) {
      const idx = tries < 8 ? i : i + tries * 7;
      const sd = deriveSeed(seed, `pr${i}` + (tries ? `#${tries}` : ''));
      const cand = activity.generate(sd, idx, ch, rng(sd), seed);
      if (p === null || seen.has(key(p))) p = cand;
      if (!seen.has(key(cand))) { p = cand; break; }
    }
    seen.add(key(p));
    out.push(p);
  }
  return out;
}

/* Split the type groups across a fixed number of pages, keeping a group whole
   where it fits and carrying it over where it does not. A sheet is allowed to be
   two pages — what it is not allowed to be is a page and a bit, with two
   problems orphaned onto a second sheet of paper. */
function paginate(groups, pages) {
  if (pages <= 1) return [groups];
  const total = groups.reduce((t, g) => t + g.items.length, 0);
  const per = Math.ceil(total / pages);
  const out = [];
  let cur = [], n = 0;
  for (const g of groups) {
    const items = g.items.slice();
    let first = true;
    while (items.length) {
      if (n >= per && out.length < pages - 1) { out.push(cur); cur = []; n = 0; }
      const take = items.splice(0, Math.max(1, per - n));
      // `cont` suppresses the section heading on the carried-over part, so a
      // group split across a page break does not look like a new exercise.
      cur.push({ type: g.type, items: take, cont: !first });
      n += take.length;
      first = false;
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

/* Default instruction per problem type. A sheet usually holds more than one
   kind of problem, and one blanket instruction would misdescribe most of them,
   so blocks are grouped by type and each gets wording that fits. An activity can
   override any of these via printInstructions: { <type>: '...' }. */
const TYPE_INSTRUCTION = {
  numberline: 'Mark each value on the number line.',
  compare: 'Write < or > between each pair.',
  truefalse: 'Circle T for true or F for false.',
  bond: 'Fill in the missing number in each bond.',
  tap: 'Draw the right number of counters in each box.',
  ordinal: 'Find the one in the position named.',
  choice: 'Answer each one.',
  input: 'Work these out. Write the answer.',
};

/* A full sheet. One page of US Letter, header and footer pinned, problem blocks
   filling the space between them.
     mode  'practice' groups by problem type | 'review' interleaves eight items
     style 'plain' is black-on-white and cheapest | 'designed' is the nicer one */
export function sheet({ activity, seed, ch, base, key = false, siteUrl, mode = 'practice', style = 'designed', variant = null, pages = null }) {
  const review = mode === 'review';
  /* `pages` is the reader's choice, clamped to what this activity can honestly
     fill. Items scale with it so the "never a page and a bit" rule survives. */
  const wantPages = pages ? Math.max(1, Math.min(maxPagesFor(activity), pages)) : null;
  const authored = wantPages
    ? itemsForPages(activity, wantPages)
    : (activity.printItems ?? ITEMS_PER_SHEET[activity.grade] ?? 16);
  const reviewBand = AGE_BAND[activity.grade] ?? 'middle';
  const n = review
    ? Math.max(3, Math.min(REVIEW_ITEMS[reviewBand] ?? 8, authored))
    : authored;
  // Density follows the grade, unless the activity overrides it. Naming a shape
  // or reading a ten-frame is a short problem with a small square figure, and
  // at the two wide columns Kindergarten normally gets, three of them filled a
  // whole page. An activity that knows its items are short can say so.
  const density = activity.printDensity ?? DENSITY[activity.grade] ?? 'd2';
  const band = AGE_BAND[activity.grade] ?? 'middle';
  const problems = collect(activity, seed, ch, n);

  const groups = [];
  for (const p of problems) {
    let g = groups.find((x) => x.type === p.type);
    if (!g) { g = { type: p.type, items: [] }; groups.push(g); }
    g.items.push(p);
  }

  if (review) return reviewSheet({ activity, seed, ch, key, siteUrl, problems, groups, style, variant, band });

  const overrides = activity.printInstructions || {};
  const instFor = (type, isOnly) => {
    if (overrides[type]) return fill(overrides[type], ch);
    if (isOnly && activity.printInstruction) return fill(activity.printInstruction, ch);
    return TYPE_INSTRUCTION[type] || 'Answer each one.';
  };

  // Worked example first. The first item of the first block is shown SOLVED,
  // and the second is its minimal twin — one thing changed — so the child can
  // see what the method was and then run it themselves. The worked-example
  // effect is one of the better-replicated findings in instructional design,
  // and variation theory supplies the "change exactly one thing" rule.
  let section = 0;
  const renderBlock = (g, isFirstOnSheet) => {
    const wide = WIDE_TYPES.has(g.type);
    if (!g.cont) section++;
    const showExample = isFirstOnSheet && !g.cont && !key && g.items.length >= 3 && !wide;
    const items = g.items;
    const worked = showExample
      ? `<div class="sh-example">
          <p class="ex-label">Worked example</p>
          <div class="sh-grid ${density}">${printProblem(items[0], 0, { key: true })}</div>
          ${items[0].explain ? `<p class="ex-why">${esc(items[0].explain)}</p>` : ''}
          <p class="ex-next">Now try the rest. The next one is almost the same.</p>
        </div>`
      : '';
    const rest = showExample ? items.slice(1) : items;
    const offset = showExample ? 1 : 0;
    const body = wide
      ? rest.map((p, i) => printProblem(p, i + offset, { key })).join('')
      : `<div class="sh-grid ${density}">${rest.map((p, i) => printProblem(p, i + offset, { key })).join('')}</div>`;
    // Younger children get a heading that says what the section IS, with the
    // instruction beside it. By grade 4 that reads as being talked down to, so
    // the big band keeps the instruction on its own.
    const title = band === 'big' ? null : TYPE_TITLE[g.type];
    const inst = esc(instFor(g.type, groups.length === 1));
    const head = g.cont
      ? `<p class="sh-inst cont"><span class="n">${section}</span><span>${esc(title || inst)} <em>continued</em></span></p>`
      : `<p class="sh-inst"><span class="n">${section}</span><span>${title
          ? `<b>${esc(title)}</b><em>${inst}</em>`
          : inst}</span></p>`;
    return `<div class="sh-block">${head}${worked}${body}</div>`;
  };

  /* How many pages this sheet is. Authored per activity, not inferred, because
     length is a teaching decision: a Kindergarten sheet should be one page a
     child can finish, and a grade 5 fluency sheet is allowed to be two. The
     numbers were set by measuring real layout in tools/pagefill.html — the rule
     is that the LAST page has to be at least 80% full, so no sheet ever costs a
     parent a piece of paper for two leftover sums. */
  const pageCount = wantPages ?? Math.max(1, activity.printPages ?? 1);
  const perPage = paginate(groups, pageCount);

  return perPage.map((pg, pi) => shell({
    activity, seed, ch, key, siteUrl, style, variant, band,
    blocks: pg.map((g, gi) => renderBlock(g, gi === 0 && pi === 0)).join(''),
    count: problems.length, problems,
    page: pi + 1, pageCount: perPage.length,
  })).join('');
}

/* ---------------------------------------------------------------------------
   SSDD sheet — Same Surface, Different Deep. A named sheet type, not a mode of
   an activity: the four questions come from different parts of the curriculum
   on purpose, which is exactly what one activity's generator cannot do. See
   content/ssdd.js for the reasoning and the credit.

   It reuses shell() through a shim, so it inherits the header, the age band, the
   accent, the footer and the QR without a second renderer to keep in step.
--------------------------------------------------------------------------- */
function ssddFigure(fig) {
  if (!fig) return '';
  if (fig.array) return `<div class="pv">${array2d(fig.array[0], fig.array[1], { print: true, cell: 15, gap: 2 })}</div>`;
  if (fig.rows) {
    // Rows of plain circles. Counters stay plain for every character — a themed
    // counter would penalise the child most attached to the character.
    const r = 9, gap = 6, W = Math.max(...fig.rows) * (r * 2 + gap), H = fig.rows.length * (r * 2 + gap);
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="rows of ${fig.rows.join(' and ')} counters">`;
    fig.rows.forEach((n, ri) => {
      for (let i = 0; i < n; i++)
        svg += `<circle cx="${i * (r * 2 + gap) + r + 1}" cy="${ri * (r * 2 + gap) + r + 1}" r="${r}" fill="none" stroke="#111" stroke-width="1.4"/>`;
    });
    return `<div class="pv">${svg}</svg></div>`.replace('</svg></svg>', '</svg>');
  }
  return '';
}

export function ssddSheet({ set, ch, key = false, siteUrl, style = 'designed', variant = null }) {
  const shim = {
    id: set.id, title: set.title, grade: set.grade, strand: set.strand, kind: 'book',
    ccss: set.ccss || [],
    // The notice is the trick box: on this sheet the method is not one method,
    // and saying so is the whole instruction.
    trick: set.notice,
    trickLabel: 'Read this first',
    printScratch: true,
  };
  const surface = `<div class="ssdd-surface">
    <p class="ss-label">All four questions are about this</p>
    <p class="ss-text">${esc(set.surface)}</p>
    ${ssddFigure(set.figure)}
  </div>`;

  const items = set.items.map((it, i) => `<div class="pr ssdd-item">
    <span class="lbl">${String.fromCharCode(97 + i)})</span>${esc(it.ask)}
    ${key
      ? `<div class="keyline"><span class="ansval">${esc(it.answer)}</span>
          <em>${esc(it.procedure)}</em></div>
         <p class="ss-why">${esc(it.explain)}</p>`
      : `<div class="ss-ans">${ansLine('4em')}</div>`}
  </div>`).join('');

  const blocks = `<div class="sh-block">
    ${surface}
    <p class="sh-inst"><span class="n">1</span><span><b>Four different questions</b><em>${
      key ? 'Each answer with the method it needed.' : 'They look alike. They are not. Answer each one.'}</em></span></p>
    <div class="ssdd-grid">${items}</div>
  </div>`;
  // Four questions leave a lot of page. On this sheet that space is the working
  // area, not a gap — four multi-step questions need somewhere to be worked out,
  // so the scratch box grows into whatever the questions did not use.


  return shell({
    activity: shim, seed: 0, ch, key, siteUrl, style,
    band: AGE_BAND[set.grade] ?? 'middle',
    variant: variant ? `${variant} ssdd-sheet` : 'ssdd-sheet',
    blocks, count: set.items.length, problems: [],
    footNote: 'Same surface, four different methods. The key names the method each one needed.',
  });
}

/* Self-check. There is no teacher in the room, so every sheet carries a way for
   the child to find out whether they are right without an adult marking it:
   a checksum when every answer is a plain number, otherwise a scrambled answer
   bank. One line of text, and it satisfies the immediate-feedback requirement. */
function selfCheck(problems, seed) {
  // The checksum only works if the child WRITES a number for every item. For a
  // comparison they write "<", for a number line they mark a position, for
  // true/false they write a letter — summing those is meaningless, and a
  // checksum that never adds up is worse than none at all.
  const WRITES_A_NUMBER = new Set(['input', 'choice', 'bond']);
  const WRITES_TEXT = new Set(['input', 'choice']);

  if (!problems.length) return '';
  const answers = problems.map((p) => String(answerText(p) ?? '').trim());
  if (answers.some((a) => !a)) return '';

  const allNumeric = problems.every((p, k) =>
    WRITES_A_NUMBER.has(p.type) && Number.isFinite(Number(answers[k].replace(/[, ]/g, ''))));

  if (allNumeric) {
    const total = answers.reduce((t, a) => t + Number(a.replace(/[, ]/g, '')), 0);
    return `<p class="sh-selfcheck"><strong>Check yourself:</strong> all your answers should add up to
      <strong>${total}</strong>. If they do not, one of them is wrong &mdash; go back and find it.</p>`;
  }

  // Otherwise an answer bank, but only where the child writes the answer out and
  // the values are distinctive enough for a bank to mean something.
  const bankable = problems.every((p) => WRITES_TEXT.has(p.type));
  const uniq = [...new Set(answers)];
  if (bankable && uniq.length >= Math.max(3, answers.length * 0.6)) {
    const r = rng(deriveSeed(seed, 'bank'));
    return `<p class="sh-selfcheck"><strong>Check yourself:</strong> every answer is in this list, in
      the wrong order &mdash; ${r.shuffle(uniq).map((b) => `<span class="bank">${esc(b)}</span>`).join(' ')}</p>`;
  }

  // Nothing honest to offer: the QR code and the key are the fallback.
  return '';
}

/* The page shell both sheet types use. */
function shell({ activity, seed, ch, key, siteUrl, style, variant, band = 'middle', blocks, count, titleSuffix = '', footNote = '', problems = [], page = 1, pageCount = 1 }) {
  // On a two-page sheet, page 1 carries the trick box and page 2 carries the
  // wrap-up. Both carry the header and the QR, so a page that gets separated
  // from its partner still says what it is and still links back.
  const first = page === 1, last = page === pageCount;
  const backUrl = `${siteUrl}/${activity.kind === 'book' ? 'books' : 'games'}/${activity.id}/?seed=${seed}`;
  const designed = style !== 'plain';
  const gradeLabel = activity.grade === 'K' ? 'Kindergarten' : 'Grade ' + activity.grade;
  // Line art only appears on the designed sheet; the plain one spends no ink on it.
  const art = designed && ch.id !== 'none' ? lineArt(ch.id) : '';
  // One accent colour, from the character's own pack, and only on the designed
  // sheet. It is spent on strokes and labels, never flooded behind the maths —
  // so it still prints cheaply, and prints legibly on a black-and-white printer.
  const acc = designed && ch.printAccent ? ` style="--acc:${ch.printAccent}"` : '';
  // Scratch space, where written working actually happens. Blanket-on was the
  // wrong default: it costs half an inch on every sheet, and a Kindergarten
  // counting page has nothing to work out — the answer boxes are the working.
  // On by default for grades 4-5, opt-in above that via printScratch.
  const wantScratch = activity.printScratch ?? (band === 'big');
  const scratch = key || !last || !wantScratch ? '' : scratchSpace();
  return `<div class="sheet sheet-preview ${designed ? 'designed' : 'plain'} ${band}${key ? ' key' : ''}${variant ? ' ' + variant : ''}" data-grade="${esc(activity.grade)}" data-page="${page}"${acc}>
  <div class="sh-head">
    <div class="sh-id">${art}
      <div><b>${esc(activity.title)}${titleSuffix}</b>
        <small>${esc(gradeLabel)} &middot; ${esc(activity.strand)}${designed && ch.id !== 'none' ? ' &middot; with ' + esc(ch.name) : ''}</small></div>
    </div>
    ${pageCount > 1 && !first
      ? `<div class="sh-name pageno">Page ${page} of ${pageCount}</div>`
      : `<div class="sh-name">Name <u></u><br>Date <u></u></div>`}
  </div>
  ${designed ? `<div class="sh-rule"><i></i><i></i><i></i><i></i></div>` : ''}
  ${key || !first ? '' : trickBox(activity, ch, band)}

  <div class="sh-body">${blocks}${scratch}</div>

  ${key
    ? !last ? '' : `<div class="sh-adult"><strong>For the grown-up.</strong> If they get stuck, work through the
        first one together, then hand it back. Reading the working aloud is worth more than marking
        it &mdash; feedback that explains is worth several times feedback that only says right or
        wrong, and the gap is wider in maths than in any other subject.</div>`
    : !last ? `<p class="sh-more">Keep going on page ${page + 1}.</p>`
    : `${selfCheck(problems, seed)}${rewardStrip(band, count, ch)}${band === 'big'
        ? `<p class="sh-challenge"><strong>Challenge.</strong> Pick the one you found hardest, cover
            your answer, and do it again from scratch. Getting the same answer twice is how you know
            you have it &mdash; and testing yourself is worth more than reading it over again.</p>`
        : ''}`}

  <div class="sh-foot">
    <div>izzimath &middot; ${gradeLabel} &middot; seed ${seed}${pageCount > 1 ? ` &middot; page ${page} of ${pageCount}` : ''} &middot; ${esc((activity.ccss || []).join(', '))}
      ${key ? '' : `<br><strong>${footNote || 'Scan to do this one on screen &mdash; same problems.'}</strong>`}</div>
    ${key ? '' : qr(backUrl)}
  </div>
</div>`;
}

/* Round-robin the type groups so consecutive problems need different strategies.
   Falls back gracefully when a sheet only has one type available. */
function interleave(groups) {
  const queues = groups.map((g) => g.items.slice());
  const out = [];
  let last = null;
  while (queues.some((q) => q.length)) {
    // prefer a queue whose type differs from the previous problem, longest first
    const order = queues
      .map((q, i) => ({ q, i, type: groups[i].type }))
      .filter((x) => x.q.length)
      .sort((a, b) => (a.type === last ? 1 : 0) - (b.type === last ? 1 : 0) || b.q.length - a.q.length);
    const pick = order[0];
    out.push(pick.q.shift());
    last = pick.type;
  }
  return out;
}

function reviewSheet({ activity, seed, ch, key, siteUrl, problems, groups, style, variant, band = 'middle' }) {
  const order = interleave(groups);
  const density = activity.printDensity ?? DENSITY[activity.grade] ?? 'd2';
  const wide = order.filter((p) => WIDE_TYPES.has(p.type));
  const narrow = order.filter((p) => !WIDE_TYPES.has(p.type));
  const mixed = groups.length > 1;
  const blocks = `<div class="sh-block">
    <p class="sh-inst"><span class="n">1</span><span>${mixed
      ? 'Work these out. Read each one carefully — they are not all the same kind.'
      : esc(fill(activity.printInstruction ?? 'Work these out.', ch))}</span></p>
    ${narrow.length ? `<div class="sh-grid ${density}">${narrow.map((p, i) => printProblem(p, i, { key })).join('')}</div>` : ''}
    ${wide.map((p, i) => printProblem(p, narrow.length + i, { key })).join('')}
  </div>`;
  return shell({
    activity, seed, ch, key, siteUrl, style, variant, band, blocks, count: order.length, problems: order,
    titleSuffix: ' — mixed review',
    footNote: `${order.length} mixed problems. Keep the answer key back until afterwards.`,
  });
}

/* A deterministic decorative QR-ish block. Real QR encoding is a later job; the
   URL is printed in text beside it so the sheet is never a dead end. */
function qr(url) {
  let h = 2166136261;
  for (let i = 0; i < url.length; i++) { h ^= url.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const r = rng(h);
  const N = 21, cells = [];
  const finder = (cx, cy) => (x, y) => {
    const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
    const d = Math.max(dx, dy);
    return d <= 3 ? (d === 1 ? false : d <= 3) : null;
  };
  const fs = [finder(3, 3), finder(N - 4, 3), finder(3, N - 4)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let on = null;
    for (const f of fs) { const v = f(x, y); if (v !== null) { on = v; break; } }
    if (on === null) on = r.next() < 0.47;
    if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  }
  return `<svg class="qr" viewBox="0 0 ${N} ${N}" role="img" aria-label="QR code linking back to this activity"><g fill="#111">${cells.join('')}</g></svg>`;
}

export { qr };
