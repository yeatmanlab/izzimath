// Screen renderers — one per problem type. Each mounts into a container, wires up
// the interaction, and calls back with (response, correct).

import { numberLine, tickRange, numberBond, dots, tenFrame, esc } from '../lib/widgets.js';
import { isCorrect } from '../../content/types.js';
import { parseAnswer, cmpF, fracText } from '../lib/frac.js';

const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

function check(problem, response) {
  if (problem.type === 'input' && problem.accept === 'fraction') {
    const got = parseAnswer(response);
    const want = parseAnswer(problem.answer);
    return !!(got && want && cmpF(got, want) === 0);
  }
  return isCorrect(problem, response);
}

/* ------------------------------------------------------------------ choice */
function renderChoice(host, p, cb) {
  const wrap = el(`<div class="choices" role="group" aria-label="Answer choices"></div>`);
  p.choices.forEach((c) => {
    const b = el(`<button class="choice" type="button">${esc(c)}</button>`);
    b.addEventListener('click', () => {
      if (wrap.dataset.locked) return;
      wrap.dataset.locked = '1';
      const ok = check(p, c);
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) {
        [...wrap.children].forEach((x) => { if (x.textContent === String(p.answer)) x.classList.add('right'); });
      }
      [...wrap.children].forEach((x) => { if (x !== b && !x.classList.contains('right')) x.classList.add('dim'); });
      cb(c, ok);
    });
    wrap.appendChild(b);
  });
  host.appendChild(wrap);
  return { reset: () => { delete wrap.dataset.locked; [...wrap.children].forEach((x) => x.className = 'choice'); } };
}

/* The button that RECORDS an answer is `.btn.go` in all three places it appears
   — "Check my answer" here, "Put 5 here" on a number line, "Done counting" for
   tap-counting. One shape, wider and taller than anything else on the page, so
   the thing that submits is recognisable before the words are read. It used to
   be .btn.pri, the same as "Next", which is what made the two indistinguishable.
   No tick and no green: both already mean "correct" elsewhere in the UI, and this
   button is pressed before anyone knows that. */

/* ------------------------------------------------------------------- input */
function renderInput(host, p, cb) {
  const row = el(`<div class="ansrow">
    <input class="ans" type="text" inputmode="${p.accept === 'fraction' ? 'text' : 'decimal'}"
      autocomplete="off" autocapitalize="off" spellcheck="false"
      aria-label="Your answer" placeholder="${esc(p.placeholder || '?')}">
    <button class="btn go" type="button">Check my answer</button>
  </div>`);
  const input = row.querySelector('input');
  const btn = row.querySelector('button');
  const err = el(`<p class="fb hint" hidden style="margin-top:10px"></p>`);
  const submit = () => {
    const v = input.value.trim();
    if (!v) { err.textContent = 'Type an answer first.'; err.hidden = false; input.focus(); return; }
    err.hidden = true;
    cb(v, check(p, v));
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  input.addEventListener('input', () => { err.hidden = true; });
  host.appendChild(row); host.appendChild(err);
  setTimeout(() => input.focus(), 40);
  return {
    reset: () => { input.value = ''; err.hidden = true; input.focus(); },
    focus: () => input.focus(),
    // After a wrong answer, put the cursor back and SELECT what is there, so the
    // next keystroke replaces it rather than appending to it.
    refocus: () => { input.focus(); input.select(); },
  };
}

/* -------------------------------------------------------------- numberline
   Rebuilt after a third grader could not tell what this game wanted.

   What they were looking at: the prompt "Where does 5 go?", a line marked
   0-10-20, a plain dot ALREADY SITTING AT THE MIDDLE with a readout saying
   "10", and a button labelled "Place it here". Three separate problems, all of
   them the interface's fault:

     - nothing said the dot could move. `cursor: grab` is invisible on a tablet
       and means nothing to an eight-year-old.
     - the dot was anonymous, and the number it displayed (10) was not the number
       being asked about (5). Two numbers on screen, neither of them explained.
     - it started on a plausible answer, so pressing the button straight away
       submitted the midpoint — and on "where does 10 go" that is CORRECT, which
       teaches the wrong lesson and feeds the adaptive ladder a false success.

   So, per docs/GAME-DESIGN.md principle 1 — the interface states the goal, text
   is the last resort — the thing you drag is now the number itself. You drag a
   token labelled 5 to where 5 goes. It parks off to the left so its position is
   visibly not an answer yet, it carries grab arrows and a dashed track so it
   reads as movable, and pressing the button before moving anything teaches the
   two ways to move it rather than silently submitting. */
function renderNumberLine(host, p, cb) {
  const lo = p.lo, hi = p.hi;
  const wrap = el(`<div class="svgwrap"></div>`);
  const W = 660, H = 130, padX = 42, y = 64;
  const toX = (v) => padX + ((v - lo) / (hi - lo)) * (W - padX * 2);
  const toV = (x) => lo + ((x - padX) / (W - padX * 2)) * (hi - lo);

  const ticks = p.ticks ?? [];
  const majors = p.majors ?? [lo, hi];
  const labels = p.labels ?? [[lo, String(lo)], [hi, String(hi)]];

  // Parked at the left edge, not the middle: wherever it starts it must not look
  // like an answer, and the midpoint is the one position that sometimes IS one.
  let val = lo;
  let moved = false;
  const label = String(p.targetLabel ?? p.target ?? '');
  const pillW = Math.max(38, 15 + label.length * 12);
  const svg = el(`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" tabindex="0"
      role="slider" aria-label="Drag ${esc(label)} to where it belongs between ${lo} and ${hi}"
      aria-valuemin="${lo}" aria-valuemax="${hi}" aria-valuenow="${val}" style="touch-action:none;cursor:grab">
    <line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" stroke="var(--line2)" stroke-width="3" stroke-linecap="round"/>
    ${ticks.map((t) => `<line x1="${toX(t).toFixed(2)}" y1="${y - 6}" x2="${toX(t).toFixed(2)}" y2="${y + 6}" stroke="var(--txt3)" stroke-width="1.5"/>`).join('')}
    ${majors.map((t) => `<line x1="${toX(t).toFixed(2)}" y1="${y - 11}" x2="${toX(t).toFixed(2)}" y2="${y + 11}" stroke="var(--txt3)" stroke-width="2.4"/>`).join('')}
    ${labels.map(([v, l]) => `<text x="${toX(v).toFixed(2)}" y="${y + 32}" text-anchor="middle" font-size="14" fill="var(--txt2)" font-family="'Space Grotesk',sans-serif">${esc(l)}</text>`).join('')}
    <!-- the road the token can travel, so it reads as movable before it moves -->
    <line class="track" x1="${padX}" y1="${y - 30}" x2="${W - padX}" y2="${y - 30}"
      stroke="var(--a1)" stroke-width="1.4" stroke-dasharray="5 6" opacity=".38"/>
    <g class="knob">
      <rect x="${(toX(val) - pillW / 2).toFixed(2)}" y="${y - 30 - 15}" width="${pillW}" height="30" rx="15"
        fill="var(--a2)" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
      <text x="${toX(val).toFixed(2)}" y="${y - 30 + 6}" text-anchor="middle" font-size="16" font-weight="700"
        fill="var(--onsp, #05060E)" font-family="'Space Grotesk',sans-serif">${esc(label)}</text>
      <path class="grip" d="M${(toX(val) - pillW / 2 - 9).toFixed(2)} ${y - 30} l6 -5 v10 z
                            M${(toX(val) + pillW / 2 + 9).toFixed(2)} ${y - 30} l-6 -5 v10 z"
        fill="var(--a1)" opacity=".85"/>
    </g>
    <line class="drop" x1="${toX(val).toFixed(2)}" y1="${y - 15}" x2="${toX(val).toFixed(2)}" y2="${y + 12}"
      stroke="var(--a1)" stroke-width="2" stroke-dasharray="3 3" opacity=".55"/>
    <text class="rdout" x="${toX(val)}" y="${y - 54}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--txt2)" font-family="'Space Grotesk',sans-serif"></text>
  </svg>`);
  const knobRect = svg.querySelector('.knob rect');
  const knobText = svg.querySelector('.knob text');
  const grip = svg.querySelector('.grip');
  const drop = svg.querySelector('.drop');
  const rd = svg.querySelector('.rdout');
  /* Readout precision follows the LINE, not the range. On a line ticked in whole
     numbers, dragging used to show "7.3", which on an integer line looks broken.
     Fraction lines keep their finer readout. */
  const allTicksWhole = ticks.length > 1 && ticks.every((t) => Number.isInteger(t));
  const dp = allTicksWhole ? 0 : (hi - lo) <= 2 ? 3 : (hi - lo) <= 20 ? 1 : 0;

  const paint = () => {
    const x = toX(val);
    knobRect.setAttribute('x', (x - pillW / 2).toFixed(2));
    knobText.setAttribute('x', x.toFixed(2));
    grip.setAttribute('d', `M${(x - pillW / 2 - 9).toFixed(2)} ${y - 30} l6 -5 v10 z
                            M${(x + pillW / 2 + 9).toFixed(2)} ${y - 30} l-6 -5 v10 z`);
    drop.setAttribute('x1', x.toFixed(2));
    drop.setAttribute('x2', x.toFixed(2));
    rd.setAttribute('x', x.toFixed(2));
    // The running readout only appears once they have moved it — before that it
    // would be a second number on screen with nothing to do with the question.
    rd.textContent = (p.showReadout === false || !moved) ? '' : Number(val).toFixed(dp).replace(/\.0+$/, '');
    svg.setAttribute('aria-valuenow', String(Number(val.toFixed(dp))));
  };
  paint();

  const pt = (ev) => {
    const r = svg.getBoundingClientRect();
    const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    return (cx / r.width) * W;
  };
  const move = (ev) => { ev.preventDefault(); moved = true; val = Math.min(hi, Math.max(lo, toV(pt(ev)))); paint(); nudgeOff(); };
  let dragging = false;
  const down = (ev) => { if (svg.dataset.locked) return; dragging = true; svg.style.cursor = 'grabbing'; move(ev); };
  const up = () => { dragging = false; svg.style.cursor = 'grab'; };
  svg.addEventListener('pointerdown', (e) => { down(e); svg.setPointerCapture?.(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (dragging) move(e); });
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  svg.addEventListener('keydown', (e) => {
    if (svg.dataset.locked) return;
    const step = (hi - lo) / (e.shiftKey ? 10 : 100);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { moved = true; val = Math.min(hi, val + step); paint(); nudgeOff(); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { moved = true; val = Math.max(lo, val - step); paint(); nudgeOff(); e.preventDefault(); }
    if (e.key === 'Enter') submit();
  });

  /* One line, stating both ways in. Principle 2 warns against walls of pre-game
     text; one sentence naming the interaction is not a wall, and it is the
     difference between a child playing and a child stuck. */
  const how = el(`<p class="nlhow">Drag the <strong>${esc(label)}</strong> along the line &mdash; or just tap the line where you think it goes.</p>`);

  // The button says what it does TO WHAT. "Place it here" left "it" undefined.
  const btn = el(`<div class="ansrow"><button class="btn go" type="button">Put ${esc(label)} here</button></div>`);

  /* The nudge is the "this moves" cue, and it stops the moment anything moves.
     Skipped entirely for reduced motion, where the arrows and dashed track carry
     the same message statically. */
  const reduced = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  if (!reduced) svg.querySelector('.knob')?.classList.add('nudge');
  function nudgeOff() { svg.querySelector('.knob')?.classList.remove('nudge'); }

  const submit = () => {
    if (svg.dataset.locked) return;
    /* Pressing before moving anything used to submit the starting position as an
       answer. It now teaches instead — and this is why the token parks at the
       left rather than the middle, where "where does 10 go" would have been
       marked CORRECT for touching nothing. */
    if (!moved) {
      how.classList.add('nudgeme');
      how.innerHTML = `<strong>Move the ${esc(label)} first.</strong> Drag it along the line, or tap the line where you think it goes.`;
      svg.focus();
      return;
    }
    svg.dataset.locked = '1';
    const ok = check(p, val);
    const tx = toX(p.target), vx = toX(val);

    // Feedback on an estimate should name a REFERENCE POINT, not deliver a
    // verdict. Estimation improves abruptly — often after a single trial — and
    // apparently because the feedback supplies a landmark to reason from. So we
    // show the true position, draw the gap, and name the nearest benchmark.
    const marks = (p.labels ?? []).map(([v, lab]) => ({ v, lab }));
    let near = null;
    for (const m of marks) if (!near || Math.abs(m.v - p.target) < Math.abs(near.v - p.target)) near = m;
    const side = near == null || Math.abs(p.target - near.v) < (hi - lo) * 0.01 ? 'at'
      : (p.target > near.v ? 'just after' : 'just before');

    let g = `<g><line x1="${tx.toFixed(2)}" y1="${y - 20}" x2="${tx.toFixed(2)}" y2="${y + 20}" stroke="${ok ? 'var(--ok)' : 'var(--pink, #FF6B8A)'}" stroke-width="2.5" stroke-dasharray="4 3"/>
      <text x="${tx.toFixed(2)}" y="${y + 52}" text-anchor="middle" font-size="13" fill="${ok ? 'var(--ok)' : '#FF6B8A'}" font-family="'Space Grotesk',sans-serif">${esc(p.targetLabel ?? p.target)}</text>`;
    // draw the gap between where they put it and where it goes
    if (!ok && Math.abs(vx - tx) > 3) {
      const my = y - 34;
      g += `<line x1="${vx.toFixed(2)}" y1="${my}" x2="${tx.toFixed(2)}" y2="${my}" stroke="#FF6B8A" stroke-width="1.6"/>
        <line x1="${vx.toFixed(2)}" y1="${my - 4}" x2="${vx.toFixed(2)}" y2="${my + 4}" stroke="#FF6B8A" stroke-width="1.6"/>
        <line x1="${tx.toFixed(2)}" y1="${my - 4}" x2="${tx.toFixed(2)}" y2="${my + 4}" stroke="#FF6B8A" stroke-width="1.6"/>
        <text x="${((vx + tx) / 2).toFixed(2)}" y="${my - 7}" text-anchor="middle" font-size="11" fill="#FF6B8A" font-family="'Space Grotesk',sans-serif">this far off</text>`;
    }
    svg.insertAdjacentHTML('beforeend', g + `</g>`);
    // The token itself turns green or pink, so the thing they placed is the thing
    // that reports back. (This line referenced the old circle after the token
    // became a labelled pill, and threw before the callback ever fired — the
    // round silently stopped responding.)
    knobRect.setAttribute('fill', ok ? 'var(--ok)' : '#FF6B8A');
    knobText.setAttribute('fill', '#05060E');

    // name the landmark under the line
    if (near) {
      const note = el(`<p class="benchmark">${esc(p.targetLabel ?? p.target)} sits <strong>${side} ${esc(near.lab)}</strong>.</p>`);
      wrap.appendChild(note);
    }
    cb(val, ok);
  };
  btn.querySelector('button').addEventListener('click', submit);
  wrap.appendChild(svg);
  host.appendChild(wrap); host.appendChild(how); host.appendChild(btn);
  return {
    reset: () => {
      delete svg.dataset.locked;
      val = lo; moved = false;
      if (!reduced) svg.querySelector('.knob')?.classList.add('nudge');
      paint();
    },
  };
}

/* ----------------------------------------------------------------- compare */
function renderCompare(host, p, cb) {
  const wrap = el(`<div class="choices" role="group" aria-label="Which is larger"></div>`);
  ['left', 'right'].forEach((side) => {
    const b = el(`<button class="choice" type="button" style="min-width:132px;font-size:clamp(28px,5vw,44px)">${esc(p[side])}</button>`);
    b.addEventListener('click', () => {
      if (wrap.dataset.locked) return;
      wrap.dataset.locked = '1';
      const ok = check(p, side);
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) [...wrap.children].forEach((x, i) => { if ((i === 0 ? 'left' : 'right') === p.answer) x.classList.add('right'); });
      cb(side, ok);
    });
    wrap.appendChild(b);
  });
  host.appendChild(wrap);
  return { reset: () => { delete wrap.dataset.locked; [...wrap.children].forEach((x) => x.className = 'choice'); } };
}

/* --------------------------------------------------------------------- tap */
function renderTap(host, p, cb) {
  let picked = 0;
  const total = p.total ?? 10;
  const grid = el(`<div style="display:grid;grid-template-columns:repeat(${Math.min(total, 5)},1fr);gap:12px;max-width:420px;margin:0 auto"></div>`);
  for (let i = 0; i < total; i++) {
    const b = el(`<button type="button" class="choice" style="min-width:0;padding:0;aspect-ratio:1;display:grid;place-items:center;font-size:26px" aria-label="item ${i + 1}">●</button>`);
    b.addEventListener('click', () => {
      if (grid.dataset.locked) return;
      b.classList.toggle('right');
      picked = [...grid.children].filter((x) => x.classList.contains('right')).length;
      count.textContent = `${picked} chosen`;
    });
    grid.appendChild(b);
  }
  const count = el(`<p style="color:var(--txt2);font-family:var(--fdisp);margin-top:12px">0 chosen</p>`);
  const btn = el(`<div class="ansrow"><button class="btn go" type="button">Done counting</button></div>`);
  btn.querySelector('button').addEventListener('click', () => {
    if (grid.dataset.locked) return;
    grid.dataset.locked = '1';
    cb(picked, check(p, picked));
  });
  host.appendChild(grid); host.appendChild(count); host.appendChild(btn);
  return { reset: () => { delete grid.dataset.locked; [...grid.children].forEach((x) => x.className = 'choice'); picked = 0; count.textContent = '0 chosen'; } };
}

/* ----------------------------------------------------------------- ordinal */
function renderOrdinal(host, p, cb) {
  const total = p.total ?? 6;
  const row = el(`<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"></div>`);
  for (let i = 1; i <= total; i++) {
    const b = el(`<button type="button" class="choice" style="min-width:60px;padding:14px 8px" aria-label="position ${i}">${p.glyph ?? '🦆'.replace('🦆', '●')}</button>`);
    b.addEventListener('click', () => {
      if (row.dataset.locked) return;
      row.dataset.locked = '1';
      const ok = check(p, i);
      b.classList.add(ok ? 'right' : 'wrong');
      if (!ok) row.children[Number(p.answer ?? p.n) - 1]?.classList.add('right');
      cb(i, ok);
    });
    row.appendChild(b);
  }
  host.appendChild(row);
  const legend = el(`<p style="color:var(--txt3);font-size:12.5px;margin-top:12px">Counting from the left</p>`);
  host.appendChild(legend);
  return { reset: () => { delete row.dataset.locked; [...row.children].forEach((x) => x.className = 'choice'); } };
}

/* -------------------------------------------------------------------- bond */
function renderBond(host, p, cb) {
  const wrap = el(`<div class="svgwrap" style="max-width:260px">${numberBond(p.whole, p.a, p.b, { blank: p.blank })}</div>`);
  host.appendChild(wrap);
  const opts = p.choices ?? null;
  if (opts) return renderChoice(host, { ...p, type: 'choice', choices: opts, answer: String(p.answer) }, cb);
  return renderInput(host, { ...p, type: 'input', answer: String(p.answer) }, cb);
}

/* --------------------------------------------------------------- truefalse */
function renderTrueFalse(host, p, cb) {
  const wrap = el(`<div class="choices" role="group" aria-label="True or false"></div>`);
  [['True', true], ['False', false]].forEach(([lab, v]) => {
    const b = el(`<button class="choice" type="button" style="min-width:118px">${lab}</button>`);
    b.addEventListener('click', () => {
      if (wrap.dataset.locked) return;
      wrap.dataset.locked = '1';
      const ok = check(p, v);
      b.classList.add(ok ? 'right' : 'wrong');
      cb(v, ok);
    });
    wrap.appendChild(b);
  });
  host.appendChild(wrap);
  return { reset: () => { delete wrap.dataset.locked; [...wrap.children].forEach((x) => x.className = 'choice'); } };
}


/* ------------------------------------------------------------------ boardmove
   The linear number board from Siegler & Ramani (2009) — the mechanic with the
   largest effect size in early-number research (d=1.01 on number line
   estimation, versus d=0.43 for the same game on a circular board).
   Two details are load-bearing and both are enforced here:
     1. The board is LINEAR with magnitudes increasing left to right.
     2. The child names the squares they pass THROUGH, counting on from where
        the token is. Saying "1, 2" (counting spaces moved) is the documented
        common error, so tapping that sequence is rejected and corrected. */
function renderBoardMove(host, p, cb) {
  const N = p.hi ?? 10;
  const picked = [];
  const wrap = el(`<div class="board${p.cols ? ' big' : ''}" role="group" aria-label="Number board from 1 to ${N}"></div>`);

  /* Two layouts, and the choice is forced by measurement rather than taste. A
     single flex row is right up to about ten squares; at twenty each square is
     already 17px wide on a phone, under the 24px tap minimum, and at a hundred
     it is 3.8px inside a strip wider than the viewport. So a board above ten
     wraps into a column-aligned matrix: `cols` squares per row, rows emitted
     from the TOP decade down, so 1 sits bottom-left and 11 lands directly above
     it. Decades are rows and units are columns, which is the place-value
     reading. Deliberately not the Chutes-and-Ladders serpentine — reversing
     every other row breaks the column alignment that is the whole point. */
  const cols = p.cols ?? 0;
  const strip = el(`<div class="${cols ? 'bgrid' : 'bstrip'}" style="--bcols:${cols || N}"></div>`);
  const cell = (v) => {
    const b = el(`<button type="button" class="bsq" data-v="${v}" aria-label="square ${v}">${v}</button>`);
    if (v === p.from) b.classList.add('here');
    return b;
  };
  if (cols) {
    for (let top = Math.ceil(N / cols) * cols; top > 0; top -= cols) {
      for (let v = top - cols + 1; v <= Math.min(top, N); v++) strip.appendChild(cell(v));
    }
  } else {
    strip.appendChild(el(`<span class="bend">Start</span>`));
    for (let v = 1; v <= N; v++) strip.appendChild(cell(v));
    strip.appendChild(el(`<span class="bend">End</span>`));
  }

  const spin = el(`<p class="bspin">You are on <strong>${p.from === 0 ? 'Start' : p.from}</strong>.
    You spun <strong>${p.spin}</strong>. Tap the ${p.spin === 1 ? 'square' : `${p.spin} squares`} you move through, in order.</p>`);
  const trail = el(`<p class="btrail" aria-live="polite"></p>`);

  strip.addEventListener('click', (ev) => {
    const b = ev.target.closest('.bsq');
    if (!b || wrap.dataset.locked) return;
    const v = Number(b.dataset.v);
    if (picked.includes(v)) return;
    picked.push(v);
    b.classList.add('tapped');
    trail.textContent = picked.join(', ');
    if (picked.length < p.answer.length) return;

    wrap.dataset.locked = '1';
    const ok = check(p, picked);
    if (ok) {
      picked.forEach((v2) => strip.querySelector(`[data-v="${v2}"]`)?.classList.add('right'));
      strip.querySelector('.here')?.classList.remove('here');
      strip.querySelector(`[data-v="${p.answer[p.answer.length - 1]}"]`)?.classList.add('here');
    } else {
      picked.forEach((v2) => strip.querySelector(`[data-v="${v2}"]`)?.classList.add('wrong'));
      p.answer.forEach((v2) => strip.querySelector(`[data-v="${v2}"]`)?.classList.add('right'));
      trail.innerHTML = `You tapped <strong>${picked.join(', ')}</strong>. Count on from
        ${p.from === 0 ? 'Start' : p.from}: <strong>${p.answer.join(', ')}</strong>.`;
    }
    cb(picked, ok);
  });

  wrap.appendChild(spin); wrap.appendChild(strip); wrap.appendChild(trail);
  host.appendChild(wrap);
  return { reset: () => { delete wrap.dataset.locked; picked.length = 0; trail.textContent = '';
    strip.querySelectorAll('.bsq').forEach((b) => b.className = 'bsq'); } };
}

const RENDERERS = {
  choice: renderChoice, input: renderInput, numberline: renderNumberLine,
  compare: renderCompare, tap: renderTap, ordinal: renderOrdinal,
  bond: renderBond, truefalse: renderTrueFalse, boardmove: renderBoardMove,
};

// Render the visual + prompt + interaction for one problem.
export function renderProblem(host, p, onAnswer) {
  host.innerHTML = '';
  if (p.prompt) host.appendChild(el(`<p class="qtext">${p.prompt}</p>`));
  if (p.visual) {
    const v = el(`<div class="svgwrap" style="margin:0 auto 26px;max-width:${p.visualWidth || 420}px">${p.visual}</div>`);
    host.appendChild(v);
    // Subitizing needs BRIEF exposure — if the dots stay on screen the child just
    // counts them one by one, which trains the wrong thing. flashMs hides the
    // visual after a beat and leaves a reminder in its place.
    if (p.flashMs) {
      setTimeout(() => {
        const h = v.offsetHeight;
        v.style.minHeight = h + 'px';
        v.innerHTML = `<p style="color:var(--txt3);font-family:var(--fdisp);font-size:13px;display:grid;place-items:center;height:${h}px;margin:0">(hidden — how many did you see?)</p>`;
      }, p.flashMs);
    }
  }
  const r = RENDERERS[p.type];
  if (!r) { host.appendChild(el(`<p class="fb bad">Unknown problem type: ${esc(p.type)}</p>`)); return null; }
  return r(host, p, onAnswer);
}

export { check as checkAnswer };
