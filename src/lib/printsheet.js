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
export const ITEMS_PER_SHEET = { K: 8, 1: 10, 2: 14, 3: 16, 4: 20, 5: 20 };

const ansLine = (w = '2.6em') => `<span class="ansline" style="min-width:${w}"></span>`;

/* One problem, print form. `key` renders the answer instead of a blank. */
export function printProblem(p, i, { key = false } = {}) {
  const lbl = `<span class="lbl">${String.fromCharCode(97 + (i % 26))})</span>`;
  const A = (v) => (key ? `<span class="ansval">${esc(v)}</span>` : ansLine());

  switch (p.type) {
    case 'input':
    case 'choice':
      return `<div class="pr">${lbl}${p.printStem ?? p.stem ?? stripTags(p.prompt)} ${A(answerText(p))}</div>`;

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

    case 'numberline':
      return `<div class="pr" style="grid-column:1/-1">${lbl}${p.printStem ?? `Mark <strong>${esc(p.targetLabel ?? p.target)}</strong> on the line.`}
        ${numberLine({
          lo: p.lo, hi: p.hi, ticks: p.ticks ?? [], majors: p.majors ?? [p.lo, p.hi],
          labels: p.labels ?? [[p.lo, String(p.lo)], [p.hi, String(p.hi)]],
          marker: key ? p.target : null, markerLabel: key ? (p.targetLabel ?? p.target) : null,
          print: true, width: 620,
        })}</div>`;

    default:
      return `<div class="pr">${lbl}${stripTags(p.prompt || '')} ${A(answerText(p))}</div>`;
  }
}

const stripTags = (s) => String(s ?? '').replace(/<svg[\s\S]*?<\/svg>/g, '□').replace(/<[^>]+>/g, '');

/* A full sheet: header, blocks of problems, footer with the seed + QR back. */
export function sheet({ activity, seed, ch, base, key = false, siteUrl }) {
  const n = activity.printItems ?? ITEMS_PER_SHEET[activity.grade] ?? 12;
  const density = DENSITY[activity.grade] ?? 'd2';
  const problems = [];
  for (let i = 0; i < n; i++) {
    problems.push(activity.generate(deriveSeed(seed, `pr${i}`), i, ch, rng(deriveSeed(seed, `pr${i}`)), seed));
  }

  // Number line problems get their own full-width block; everything else grids.
  const wide = problems.filter((p) => p.type === 'numberline');
  const narrow = problems.filter((p) => p.type !== 'numberline');

  const inst = fill(activity.printInstruction ?? 'Work these out. Show your thinking.', ch);
  const backUrl = `${siteUrl}/${activity.kind === 'book' ? 'books' : 'games'}/${activity.id}/?seed=${seed}`;

  return `<div class="sheet sheet-preview${key ? ' key' : ''}">
  <div class="sh-head">
    <div class="sh-id">${ch.id !== 'none' ? lineArt(ch.id) : ''}
      <div><b>${esc(activity.title)}</b>
        <small>${esc(activity.grade === 'K' ? 'Kindergarten' : 'Grade ' + activity.grade)} · ${esc(activity.strand)}${ch.id !== 'none' ? ' · with ' + esc(ch.name) : ''}</small></div>
    </div>
    <div class="sh-name">Name <u></u><br>Date <u></u></div>
  </div>

  ${narrow.length ? `<div class="sh-block">
    <p class="sh-inst">1. ${esc(inst)}</p>
    <div class="sh-grid ${density}">${narrow.map((p, i) => printProblem(p, i, { key })).join('')}</div>
  </div>` : ''}

  ${wide.length ? `<div class="sh-block">
    <p class="sh-inst">${narrow.length ? '2' : '1'}. Mark each value on the number line.</p>
    ${wide.map((p, i) => printProblem(p, i, { key })).join('')}
  </div>` : ''}

  <div class="sh-foot">
    <div>izzimath · seed ${seed} · ${esc((activity.ccss || []).join(', '))}
      ${key ? '' : `<br><strong>Scan to do this one on screen →</strong>`}</div>
    ${key ? '' : qr(backUrl)}
  </div>
</div>`;
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
