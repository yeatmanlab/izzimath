/* The animated lesson player.
 *
 * One renderer for every lesson in content/lessons.js, driven by each step's
 * `show` block. Adding a third lesson should be data, not code.
 *
 * HOW THE MOVEMENT WORKS, AND WHY IT IS NOT A LOOP
 * The clock is drawn ONCE and only its two hands are re-pointed, with a CSS
 * transition on `transform`. So "watch the long hand go all the way round" is a
 * rotation from 0 to 360 degrees rather than an animation frame loop, which
 * means it costs nothing, cannot drift, and stops instantly when the reader
 * presses Next. The hour hand moves in the same transition, which is the entire
 * teaching point of that step: the child sees it creep.
 *
 * Rotations ACCUMULATE rather than being taken modulo 360. Going from 3:00 to
 * 4:00 has to be a forward sweep of the long hand; if the target were computed
 * as 0 degrees again the hand would sit still and the step would silently teach
 * nothing.
 *
 * REDUCED MOTION IS A FIRST-CLASS PATH, NOT A DEGRADATION
 * With `prefers-reduced-motion: reduce` the transition duration is zero and the
 * hands jump. Every caption still reads correctly, because no step's meaning is
 * carried by the movement alone — the step that says "did you see the short
 * hand move too?" is followed by one that states where it ended up.
 */

import { LESSONS, lessonById } from '../../content/lessons.js';
import { clockFace, clockDigital, coin, COINS, coinsValue, money } from '../lib/widgets.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = () => typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- the clock
   Built by hand rather than through clockFace(), because that returns a string
   and this needs to keep hold of the two hand elements to re-point them. The
   face itself is clockFace with its hands stripped, so the dial, the ticks and
   the numerals stay in one place. */
function clockStage() {
  const wrap = document.createElement('div');
  wrap.className = 'lsn-clock';
  const face = clockFace(12, 0, { size: 240 })
    .replace(/<line x1="50" y1="50"[\s\S]*?\/>/g, '')          // drop the two hands
    .replace('</svg>', `
      <line class="lsn-hand lsn-hour" x1="50" y1="50" x2="50" y2="26"
        stroke="var(--a1)" stroke-width="4.6" stroke-linecap="round"/>
      <line class="lsn-hand lsn-min" x1="50" y1="50" x2="50" y2="16"
        stroke="var(--a1)" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="var(--a1)"/></svg>`);
  wrap.innerHTML = face;
  /* The dial's own label described hands this SVG no longer has. The live time
     is announced from the caption region instead, which is where a reader is
     already being told what to look at. */
  wrap.querySelector('svg')?.setAttribute('aria-hidden', 'true');
  return wrap;
}

export function renderLesson(host, id) {
  const lesson = lessonById(id);
  if (!lesson) { host.innerHTML = '<p class="sub">No such lesson.</p>'; return null; }

  let at = 0;

  host.innerHTML = `
    <div class="lsn">
      <div class="lsn-stage" data-stage></div>
      <p class="lsn-step" data-count></p>
      <h2 class="lsn-head" data-head></h2>
      <p class="lsn-say" data-say aria-live="polite"></p>
      <div class="lsn-foot">
        <button class="btn" type="button" data-back>&larr; Back</button>
        <button class="btn pri" type="button" data-next>Next &rarr;</button>
      </div>
      <p class="lsn-close" data-close hidden></p>
    </div>`;

  const stage = host.querySelector('[data-stage]');
  const isClock = !!lesson.steps[0]?.show?.h;
  const clock = isClock ? clockStage() : null;
  if (clock) stage.appendChild(clock);

  /* Both hands come from ONE number: minutes elapsed since the first step,
     accumulated forward. Deriving them independently is what broke the first
     version — 3:00 and 4:00 have the SAME minute angle, so a "did the angle go
     backwards" test saw no change and the sweep step, whose entire purpose is
     the movement, sat perfectly still. The comment above it had warned about
     exactly that and the code did it anyway; only reading the transform caught
     it.

     Walked from step 0 on every paint rather than kept in a mutable counter, so
     Back rewinds honestly instead of sweeping forward to an earlier time.

     A delta of ZERO means the step shows the same time with a different hand
     called out — steps 1 to 3 are all 3:00 — so it must not move. Only a
     negative delta means the clock has gone round past 12. */
  function elapsedAt(k) {
    const mins = (st) => ((st.show.h % 12) * 60) + st.show.m;
    let cum = mins(lesson.steps[0]);
    for (let i = 1; i <= k; i++) {
      let d = mins(lesson.steps[i]) - mins(lesson.steps[i - 1]);
      if (d < 0) d += 720;
      cum += d;
    }
    return cum;
  }

  function paintClock(show) {
    const hour = clock.querySelector('.lsn-hour');
    const min = clock.querySelector('.lsn-min');
    const cum = elapsedAt(at);
    const hAng = (cum / 720) * 360;
    const mAng = (cum / 60) * 360;
    const ms = reduced() ? 0 : 900;
    for (const [el, ang] of [[hour, hAng], [min, mAng]]) {
      el.style.transition = `transform ${ms}ms cubic-bezier(.32,.06,.24,1)`;
      el.style.transformOrigin = '50px 50px';
      el.style.transform = `rotate(${ang.toFixed(2)}deg)`;
    }
    hour.classList.toggle('on', show.focus === 'hour' || show.focus === 'both');
    min.classList.toggle('on', show.focus === 'minute' || show.focus === 'both');
    let extra = stage.querySelector('.lsn-digital');
    if (show.digital && !extra) {
      extra = document.createElement('div');
      extra.className = 'lsn-digital';
      stage.appendChild(extra);
    }
    if (extra) {
      extra.innerHTML = show.digital ? clockDigital(show.h, show.m, { size: 150 }) : '';
      extra.hidden = !show.digital;
    }
  }

  function paintCoins(show) {
    const total = coinsValue(show.coins);
    /* The equivalence step: the pennies are shown BESIDE the coin they add up
       to, because that is the comparison, not a sum to be worked out. */
    const pennies = show.pennies
      ? `<div class="lsn-equiv"><span class="lsn-eqlabel">${show.pennies} pennies</span>
          <span class="lsn-pennies">${Array.from({ length: show.pennies }, () => coin('penny', { size: 34 })).join('')}</span>
          <span class="lsn-eq" aria-hidden="true">=</span></div>` : '';
    stage.innerHTML = `${pennies}
      <div class="lsn-coins">${show.coins.map((k) =>
        `<span class="lsn-coin${show.focus === k ? ' on' : ''}">${coin(k, { size: 86 })}</span>`).join('')}</div>
      ${show.running ? `<p class="lsn-run">${
        [...show.coins].sort((a, b) => COINS[b].value - COINS[a].value)
          .reduce((acc, k) => { const run = (acc.run ?? 0) + COINS[k].value;
            acc.parts.push(String(run)); acc.run = run; return acc; }, { parts: [] }).parts
          .join(' &rarr; ')} &nbsp;=&nbsp; <b>${money(total)}</b></p>` : ''}`;
  }

  function paint() {
    const step = lesson.steps[at];
    host.querySelector('[data-count]').textContent = `Step ${at + 1} of ${lesson.steps.length}`;
    host.querySelector('[data-head]').textContent = step.head;
    host.querySelector('[data-say]').textContent = step.say;
    if (isClock) paintClock(step.show); else paintCoins(step.show);
    host.querySelector('[data-back]').disabled = at === 0;
    const next = host.querySelector('[data-next]');
    const last = at === lesson.steps.length - 1;
    next.textContent = last ? 'Done' : 'Next →';
    const close = host.querySelector('[data-close]');
    close.hidden = !last;
    close.textContent = last ? lesson.close : '';
  }

  host.querySelector('[data-next]').addEventListener('click', () => {
    if (at < lesson.steps.length - 1) { at++; paint(); }
  });
  host.querySelector('[data-back]').addEventListener('click', () => {
    /* Going back re-points the hands backwards, which is honest: the reader
       asked to see the previous state, not to watch another forward sweep. */
    if (at > 0) { at--; paint(); }
  });
  paint();
  return { paint, get step() { return at; } };
}

function mount() {
  const host = document.querySelector('[data-lesson]');
  if (!host) return;
  renderLesson(host, host.dataset.lesson);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
}

export { LESSONS };
