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
// Enough problems to fill one full page at the density that grade uses. Two
// columns of large problems for K-1, up to four narrow columns by grade 4.
export const ITEMS_PER_SHEET = { K: 10, 1: 12, 2: 18, 3: 21, 4: 28, 5: 28 };
// Problems that need the full width, so they count for more vertical space.
const WIDE_TYPES = new Set(['numberline', 'boardmove']);

const ansLine = (w = '2.6em') => `<span class="ansline" style="min-width:${w}"></span>`;

/* One problem, print form. `key` renders the answer instead of a blank. */
export function printProblem(p, i, { key = false } = {}) {
  const lbl = `<span class="lbl">${String.fromCharCode(97 + (i % 26))})</span>`;
  const A = (v) => (key ? `<span class="ansval">${esc(v)}</span>` : ansLine());

  // A word problem's key gives the working and a full sentence, not just a
  // number: "8" tells an adult nothing about whether the story was understood.
  if (key && p.schema) {
    return `<div class="pr">${lbl}${p.printStem ?? stripTags(p.prompt)}
      <div class="keyline"><span class="ansval">${esc(answerText(p))}</span>
        ${p.explain ? `<em>${esc(p.explain)}</em>` : ''}</div></div>`;
  }

  switch (p.type) {
    case 'input':
    case 'choice':
      // If the problem has a print-mode visual (a bar, an array, a ten-frame),
      // draw it. Describing a picture in words on a worksheet defeats the point.
      return `<div class="pr">${lbl}${p.printStem ?? p.stem ?? stripTags(p.prompt)}${p.printVisual ? '' : ' ' + A(answerText(p))}
        ${p.printVisual ? `<div class="pv">${p.printVisual}</div>${A(answerText(p))}` : ''}</div>`;

    case 'compare':
      return `<div class="pr">${lbl}<span style="letter-spacing:.06em">${esc(p.left)} &nbsp;${key ? (p.answer === 'left' ? '&gt;' : '&lt;') : '<span class="ansline" style="min-width:1.4em"></span>'}&nbsp; ${esc(p.right)}</span></div>`;

    case 'truefalse':
      return `<div class="pr">${lbl}${p.printStem ?? stripTags(p.prompt)} &nbsp; ${key ? `<span class="ansval">${answerText(p)}</span>` : 'T / F'}</div>`;

    case 'bond':
      return `<div class="pr" style="text-align:center">${lbl}<div style="max-width:150px;margin:4px auto 0">${numberBond(
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
export function sheet({ activity, seed, ch, base, key = false, siteUrl, mode = 'practice', style = 'designed' }) {
  const review = mode === 'review';
  const n = review ? 8 : (activity.printItems ?? ITEMS_PER_SHEET[activity.grade] ?? 16);
  const density = DENSITY[activity.grade] ?? 'd2';
  const problems = collect(activity, seed, ch, n);

  const groups = [];
  for (const p of problems) {
    let g = groups.find((x) => x.type === p.type);
    if (!g) { g = { type: p.type, items: [] }; groups.push(g); }
    g.items.push(p);
  }

  if (review) return reviewSheet({ activity, seed, ch, key, siteUrl, problems, groups, style });

  const overrides = activity.printInstructions || {};
  const instFor = (type, isOnly) => {
    if (overrides[type]) return fill(overrides[type], ch);
    if (isOnly && activity.printInstruction) return fill(activity.printInstruction, ch);
    return TYPE_INSTRUCTION[type] || 'Answer each one.';
  };

  const blocks = groups.map((g, gi) => {
    const wide = WIDE_TYPES.has(g.type);
    const body = wide
      ? g.items.map((p, i) => printProblem(p, i, { key })).join('')
      : `<div class="sh-grid ${density}">${g.items.map((p, i) => printProblem(p, i, { key })).join('')}</div>`;
    return `<div class="sh-block">
      <p class="sh-inst"><span class="n">${gi + 1}</span><span>${esc(instFor(g.type, groups.length === 1))}</span></p>
      ${body}
    </div>`;
  }).join('');

  return shell({ activity, seed, ch, key, siteUrl, style, blocks, count: problems.length, problems });
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
function shell({ activity, seed, ch, key, siteUrl, style, blocks, count, titleSuffix = '', footNote = '', problems = [] }) {
  const backUrl = `${siteUrl}/${activity.kind === 'book' ? 'books' : 'games'}/${activity.id}/?seed=${seed}`;
  const designed = style !== 'plain';
  const gradeLabel = activity.grade === 'K' ? 'Kindergarten' : 'Grade ' + activity.grade;
  // Line art only appears on the designed sheet; the plain one spends no ink on it.
  const art = designed && ch.id !== 'none' ? lineArt(ch.id) : '';
  return `<div class="sheet sheet-preview ${designed ? 'designed' : 'plain'}${key ? ' key' : ''}">
  <div class="sh-head">
    <div class="sh-id">${art}
      <div><b>${esc(activity.title)}${titleSuffix}</b>
        <small>${esc(gradeLabel)} &middot; ${esc(activity.strand)}${designed && ch.id !== 'none' ? ' &middot; with ' + esc(ch.name) : ''}</small></div>
    </div>
    <div class="sh-name">Name <u></u><br>Date <u></u></div>
  </div>
  ${designed ? `<div class="sh-rule"><i></i><i></i><i></i><i></i></div>` : ''}

  <div class="sh-body">${blocks}</div>

  ${key
    ? `<div class="sh-adult"><strong>For the grown-up.</strong> If they get stuck, work through the
        first one together, then hand it back. Reading the working aloud is worth more than marking
        it &mdash; feedback that explains is worth several times feedback that only says right or
        wrong, and the gap is wider in maths than in any other subject.</div>`
    : `${selfCheck(problems, seed)}
      <div class="sh-check">
        <strong>How did it go?</strong>
        <span>Colour one for every question you got right.</span>
        <span class="boxes">${Array.from({ length: Math.min(count, 12) }, () => '<i></i>').join('')}</span>
      </div>`}

  <div class="sh-foot">
    <div>izzimath &middot; ${gradeLabel} &middot; seed ${seed} &middot; ${esc((activity.ccss || []).join(', '))}
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

function reviewSheet({ activity, seed, ch, key, siteUrl, problems, groups, style }) {
  const order = interleave(groups);
  const density = DENSITY[activity.grade] ?? 'd2';
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
    activity, seed, ch, key, siteUrl, style, blocks, count: order.length, problems: order,
    titleSuffix: ' — mixed review',
    footNote: 'Eight mixed problems. Keep the answer key back until afterwards.',
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
