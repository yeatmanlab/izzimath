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

/* ------------------------------------------------------------------- input */
function renderInput(host, p, cb) {
  const row = el(`<div class="ansrow">
    <input class="ans" type="text" inputmode="${p.accept === 'fraction' ? 'text' : 'decimal'}"
      autocomplete="off" autocapitalize="off" spellcheck="false"
      aria-label="Your answer" placeholder="${esc(p.placeholder || '?')}">
    <button class="btn pri" type="button">Check</button>
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
  return { reset: () => { input.value = ''; err.hidden = true; input.focus(); }, focus: () => input.focus() };
}

/* -------------------------------------------------------------- numberline */
function renderNumberLine(host, p, cb) {
  const lo = p.lo, hi = p.hi;
  const wrap = el(`<div class="svgwrap"></div>`);
  const W = 660, H = 130, padX = 42, y = 64;
  const toX = (v) => padX + ((v - lo) / (hi - lo)) * (W - padX * 2);
  const toV = (x) => lo + ((x - padX) / (W - padX * 2)) * (hi - lo);

  const ticks = p.ticks ?? [];
  const majors = p.majors ?? [lo, hi];
  const labels = p.labels ?? [[lo, String(lo)], [hi, String(hi)]];

  let val = (lo + hi) / 2;
  const svg = el(`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" tabindex="0"
      role="slider" aria-label="Place the value on the number line"
      aria-valuemin="${lo}" aria-valuemax="${hi}" aria-valuenow="${val}" style="touch-action:none;cursor:grab">
    <line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" stroke="var(--line2)" stroke-width="3" stroke-linecap="round"/>
    ${ticks.map((t) => `<line x1="${toX(t).toFixed(2)}" y1="${y - 6}" x2="${toX(t).toFixed(2)}" y2="${y + 6}" stroke="var(--txt3)" stroke-width="1.5"/>`).join('')}
    ${majors.map((t) => `<line x1="${toX(t).toFixed(2)}" y1="${y - 11}" x2="${toX(t).toFixed(2)}" y2="${y + 11}" stroke="var(--txt3)" stroke-width="2.4"/>`).join('')}
    ${labels.map(([v, l]) => `<text x="${toX(v).toFixed(2)}" y="${y + 32}" text-anchor="middle" font-size="14" fill="var(--txt2)" font-family="'Space Grotesk',sans-serif">${esc(l)}</text>`).join('')}
    <g class="knob"><circle cx="${toX(val)}" cy="${y}" r="15" fill="var(--a2)" stroke="#fff" stroke-opacity=".4" stroke-width="2.5"/></g>
    <text class="rdout" x="${toX(val)}" y="${y - 28}" text-anchor="middle" font-size="17" font-weight="700" fill="var(--txt)" font-family="'Space Grotesk',sans-serif"></text>
  </svg>`);
  const knob = svg.querySelector('.knob circle');
  const rd = svg.querySelector('.rdout');
  const dp = (hi - lo) <= 2 ? 3 : (hi - lo) <= 20 ? 1 : 0;

  const paint = () => {
    const x = toX(val);
    knob.setAttribute('cx', x.toFixed(2));
    rd.setAttribute('x', x.toFixed(2));
    rd.textContent = p.showReadout === false ? '' : Number(val).toFixed(dp).replace(/\.0+$/, '');
    svg.setAttribute('aria-valuenow', String(Number(val.toFixed(dp))));
  };
  paint();

  const pt = (ev) => {
    const r = svg.getBoundingClientRect();
    const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    return (cx / r.width) * W;
  };
  const move = (ev) => { ev.preventDefault(); val = Math.min(hi, Math.max(lo, toV(pt(ev)))); paint(); };
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
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { val = Math.min(hi, val + step); paint(); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { val = Math.max(lo, val - step); paint(); e.preventDefault(); }
    if (e.key === 'Enter') submit();
  });

  const btn = el(`<div class="ansrow"><button class="btn pri" type="button">Place it here</button></div>`);
  const submit = () => {
    if (svg.dataset.locked) return;
    svg.dataset.locked = '1';
    const ok = check(p, val);
    // show the true position
    const tx = toX(p.target);
    svg.insertAdjacentHTML('beforeend',
      `<g><line x1="${tx.toFixed(2)}" y1="${y - 20}" x2="${tx.toFixed(2)}" y2="${y + 20}" stroke="${ok ? 'var(--ok)' : 'var(--pink, #FF6B8A)'}" stroke-width="2.5" stroke-dasharray="4 3"/>
       <text x="${tx.toFixed(2)}" y="${y + 52}" text-anchor="middle" font-size="13" fill="${ok ? 'var(--ok)' : '#FF6B8A'}" font-family="'Space Grotesk',sans-serif">${esc(p.targetLabel ?? p.target)}</text></g>`);
    knob.setAttribute('fill', ok ? 'var(--ok)' : '#FF6B8A');
    cb(val, ok);
  };
  btn.querySelector('button').addEventListener('click', submit);
  wrap.appendChild(svg);
  host.appendChild(wrap); host.appendChild(btn);
  return { reset: () => { delete svg.dataset.locked; val = (lo + hi) / 2; paint(); } };
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
  const btn = el(`<div class="ansrow"><button class="btn pri" type="button">Done</button></div>`);
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

const RENDERERS = {
  choice: renderChoice, input: renderInput, numberline: renderNumberLine,
  compare: renderCompare, tap: renderTap, ordinal: renderOrdinal,
  bond: renderBond, truefalse: renderTrueFalse,
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
