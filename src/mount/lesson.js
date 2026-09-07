/* The animated lesson player.
 *
 * A STAGE PER LESSON KIND, chosen from `lesson.kind`. This started as
 * `if (isClock) paintClock() else paintCoins()` with a comment claiming a third
 * lesson would be data rather than code, which was aspirational rather than
 * true: the third and fourth lessons needed a bar that re-cuts and an array
 * that turns, and neither is a clock with different numbers. So the branch is a
 * registry now, and what a stage owes the player is small — build its DOM once,
 * paint a step, and say what its counter should read.
 *
 * WHAT EVERY STAGE HAS IN COMMON is the thing worth keeping: the picture and the
 * counter beside it are drawn from ONE state, so they cannot disagree. A counter
 * reading 30 minutes beside a hand pointing at the 9, or "two quarters" beside a
 * bar cut into eighths, teaches the opposite of the lesson.
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

import { LESSONS, lessonById, lessonSeenKey, LESSON_COUNT } from '../../content/lessons.js';
import { clockFace, clockDigital, coin, COINS, coinsValue, money, array2d } from '../lib/widgets.js';
import { currentCharacter } from '../lib/theme.js';
import { characters, getCharacter, fill } from '../../content/characters.js';

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

/* ------------------------------------------------------------------ the bar
   ONE BAR, BUILT ONCE, and that is the entire argument of the fractions lesson.
   Re-rendering it per step would replace the shaded rectangle with a new one of
   the same width, which looks identical and proves nothing. Keeping the SAME
   element and only scaling it means the child can see that it did not move.

   Every divider the lesson will ever need is drawn up front — seven of them, at
   the eighths — and each is shown or hidden by whether the current denominator
   has a cut there. Divider k belongs to denominator d when k is a multiple of
   8/d: at halves only the middle one, at quarters the even ones, at eighths all
   seven. Fading them in and out is a CSS transition, so no frame loop and
   nothing to drift. */
const BAR_MAX = 8;
const BAR_W = 320, BAR_H = 74;

function barStage() {
  const wrap = document.createElement('div');
  wrap.className = 'lsn-bar';
  const seg = BAR_W / BAR_MAX;
  let cuts = '';
  for (let k = 1; k < BAR_MAX; k++) {
    cuts += `<line class="lsn-cut" data-cut="${k}" x1="${(k * seg).toFixed(2)}" y1="0"`
      + ` x2="${(k * seg).toFixed(2)}" y2="${BAR_H}" stroke="var(--line2)" stroke-width="2"/>`;
  }
  wrap.innerHTML = `<svg viewBox="0 0 ${BAR_W} ${BAR_H}" width="100%" height="${BAR_H}" aria-hidden="true">
    <rect x="0" y="0" width="${BAR_W}" height="${BAR_H}" fill="rgba(255,255,255,.04)"/>
    <rect class="lsn-shade" x="0" y="0" width="${BAR_W}" height="${BAR_H}" fill="var(--a2)"/>
    ${cuts}
    <rect x="0" y="0" width="${BAR_W}" height="${BAR_H}" fill="none" stroke="var(--line2)" stroke-width="2.5"/>
  </svg>`;
  return wrap;
}

/* Words for the amount, so the counter can say "one half" three times over
   while the pieces and the shaded count both change underneath it. Reduced
   first, because that is the point being made. */
const NUM_WORDS = ['nought', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const DEN_WORDS = { 1: ['whole', 'wholes'], 2: ['half', 'halves'], 3: ['third', 'thirds'],
  4: ['quarter', 'quarters'], 8: ['eighth', 'eighths'] };
function fracWords(num, den) {
  const g = (a, b) => (b ? g(b, a % b) : a);
  const k = g(num, den) || 1;
  const n = num / k, d = den / k;
  const names = DEN_WORDS[d];
  if (!names || !NUM_WORDS[n]) return `${n}/${d}`;
  return `${NUM_WORDS[n]} ${n === 1 ? names[0] : names[1]}`;
}

export function renderLesson(host, id) {
  const lesson = lessonById(id);
  if (!lesson) { host.innerHTML = '<p class="sub">No such lesson.</p>'; return null; }

  let at = 0;
  let dir = 1;   // which way the reader last moved, so a sweep only runs forward

  host.innerHTML = `
    <div class="lsn">
      <div class="lsn-stage" data-stage></div>
      <!-- aria-hidden, because a sweep rewrites these numbers sixty times a
           second and a live region would read every one of them. The meaning
           reaches a screen reader twice over: each step's caption below is the
           live region, and [data-readsay] announces the settled figures ONCE
           when a sweep finishes. -->
      <p class="lsn-read" data-read aria-hidden="true" hidden></p>
      <span class="sr" data-readsay aria-live="polite"></span>
      <p class="lsn-step" data-count></p>
      <h2 class="lsn-head" data-head></h2>
      <!-- THE LESSON IS SPOKEN BY THE CHOSEN FRIEND. One voice, not a narrator
           with a sidekick chipping in — that was the first attempt and the two
           of them restated each other. The avatar sits BESIDE the words and
           never inside the figure, which is the invariant in CLAUDE.md; and
           "data-avatar" is the hook src/lib/theme.js already swaps on every
           page, so changing friend in the header re-skins this for free.
           ONE SET OF WORDS for all five. The friend is the frame — face, name,
           colour — and per-character copy would be five times the text and
           would drift. Same decision the printed sheet's trick box made.
           With Just math the frame comes off and the same words read plain. -->
      <div class="lsn-voice" data-voice>
        <span class="lsn-face" aria-hidden="true"><svg data-avatar="idle"><use href="#av-none"/></svg></span>
        <div class="lsn-lines">
          <span class="lsn-whoname" data-whoname></span>
          <p class="lsn-say" data-say aria-live="polite"></p>
          <p class="lsn-aside" data-whosay hidden></p>
        </div>
      </div>
      <div class="lsn-foot">
        <button class="btn" type="button" data-back>&larr; Back</button>
        <button class="btn pri" type="button" data-next>Next &rarr;</button>
      </div>
      <p class="lsn-close" data-close hidden></p>
    </div>`;

  const stage = host.querySelector('[data-stage]');
  /* `kind` is declared on the lesson rather than sniffed from the first step's
     `show`. The old version tested `!!show.h` — true for a clock, falsely true
     for anything else that ever grew an `h`, and silently wrong rather than
     loud. */
  const kind = lesson.kind || 'clock';
  const isClock = kind === 'clock';
  const clock = isClock ? clockStage() : null;
  if (clock) stage.appendChild(clock);
  const bar = kind === 'bar' ? barStage() : null;
  if (bar) stage.appendChild(bar);

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

  /* ------------------------------------------------------------- the sweep
     A SWEEP IS THE ONE PLACE THIS PLAYER RUNS A FRAME LOOP, and the reason is
     the readout rather than the movement. The hands alone are better off on a
     CSS transition — that is what the note at the top of this file says, and it
     is still true. But a counter has to be animated too, and if the counter is
     driven separately from the hands then a readout saying thirty minutes can
     appear beside a long hand pointing at the 9. That teaches the opposite of
     the lesson. So on a sweep both come from ONE number, recomputed every
     frame, and they cannot disagree.

     Linear, not eased. The point of the step is a steady count; easing would
     make the minutes crawl, race and crawl again. */
  let raf = null;
  const stopSweep = () => { if (raf != null) { cancelAnimationFrame(raf); raf = null; } };
  const startCum = () => elapsedAt(0);

  // Duration from the distance swept, so a fifteen-minute run and a
  // sixty-five-minute one do not take the same time on screen.
  const sweepMs = (units) => Math.max(1200, Math.min(6000, Math.abs(units) * 90));

  /* ONE RUNNER FOR BOTH LESSONS. The clock sweeps its hands and the coin lesson
     lays out its pennies one at a time; they are the same shape of thing — a
     value walked from `from` to `to` with the picture and its readout redrawn
     from that one value — so they share the loop rather than growing a second
     copy that could drift. `onFrame` gets the interpolated value; `onDone` gets
     the final one, once, which is where anything announced to a screen reader
     belongs. */
  function runSweep(from, to, ms, onFrame, onDone) {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      onFrame(from + (to - from) * p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else { raf = null; onDone(to); }
    };
    raf = requestAnimationFrame(tick);
  }

  function pointHands(cum, ms) {
    const hour = clock.querySelector('.lsn-hour');
    const min = clock.querySelector('.lsn-min');
    const a = anglesAt(cum);
    for (const [el, ang] of [[hour, a.hour], [min, a.minute]]) {
      el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
      el.style.transformOrigin = '50px 50px';
      el.style.transform = `rotate(${ang.toFixed(2)}deg)`;
    }
  }

  /* The readout, from the same `cum` the hands just used. `gone` is measured
     from the FIRST step rather than from midnight, so "hours gone by" answers
     "since we started watching" — which is what the caption promises. The
     minutes deliberately wrap at 60 and the hours tick up, because that carry is
     the whole point of the step. */
  /* PURE, AND SEPARATE FROM THE PAINT ON PURPOSE. requestAnimationFrame does
     not run in a hidden tab, so a test that watches the frame loop measures
     nothing and reports a pass — the exact shape of dead check this repo has
     been bitten by before. The arithmetic that could actually be wrong is all
     here, where tools/func.html can assert it directly at any point of the
     sweep without waiting for a frame. */
  function readAt(cum) {
    const per = LESSON_COUNT.per;
    const gone = Math.floor(Math.max(0, cum - startCum()));
    /* 60 IS DISPLAYED, not skipped. `gone % 60` is 0 at the lap boundary, so a
       sweep that lands on a whole hour counted 59 and then 0 and never showed
       the number the whole step is about. At the boundary the lap reads full. */
    const mins = gone > 0 && gone % per === 0 ? per : gone % per;
    return {
      mins,
      hrs: Math.floor(gone / per),
      h12: (Math.floor(cum / 60) % 12) || 12,
      m60: Math.floor(cum) % 60,
      per,
    };
  }

  // Where the hands point for a given cum, in degrees. The readout and the
  // hands take the same `cum`, which is what stops them disagreeing.
  const anglesAt = (cum) => ({ hour: (cum / 720) * 360, minute: (cum / 60) * 360 });

  function paintRead(cum) {
    const r = readAt(cum);
    const cell = (label, v, sub) => `<span class="lsn-cell"><small>${esc(label)}</small>`
      + `<b>${esc(v)}${sub ? `<i>${esc(sub)}</i>` : ''}</b></span>`;
    host.querySelector('[data-read]').innerHTML =
      cell(LESSON_COUNT.minutes, r.mins, `${LESSON_COUNT.of} ${r.per}`)
      + cell(LESSON_COUNT.hours, r.hrs)
      + cell(LESSON_COUNT.now, `${r.h12}:${String(r.m60).padStart(2, '0')}`);
    return r;
  }

  // Announced once, when the numbers have settled — never per frame.
  function sayRead(r) {
    host.querySelector('[data-readsay]').textContent =
      `${r.mins} ${LESSON_COUNT.of} ${r.per} ${LESSON_COUNT.minutes}, `
      + `${r.hrs} ${r.hrs === 1 ? LESSON_COUNT.hour1 : LESSON_COUNT.hours}, `
      + `the clock says ${r.h12}:${String(r.m60).padStart(2, '0')}`;
  }

  function paintClock(show, { sweep = false } = {}) {
    const hour = clock.querySelector('.lsn-hour');
    const min = clock.querySelector('.lsn-min');
    const cum = elapsedAt(at);
    const read = host.querySelector('[data-read]');
    stopSweep();
    read.hidden = !lesson.steps[at].count;

    if (sweep && !reduced() && at > 0) {
      const from = elapsedAt(at - 1);
      /* Painted at the START before the loop begins, so the row is never blank.
         requestAnimationFrame does not run in a hidden tab, so without this a
         reader who switches away mid-sweep and comes back finds an empty
         counter under a still clock. */
      pointHands(from, 0);
      paintRead(from);
      runSweep(from, cum, sweepMs(cum - from),
        (c) => { pointHands(c, 0); paintRead(c); },
        (c) => sayRead(paintRead(c)));
    } else {
      pointHands(cum, reduced() ? 0 : 900);
      if (!read.hidden) sayRead(paintRead(cum));
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

  /* THE COIN READOUT, and it is the money lesson's answer to the clock's
     counter. Same two questions: how many have I counted, and what is that the
     same as. */
  function coinReadAt(shown, show) {
    const want = show.pennies || 0;
    const kind = show.coins?.[0];
    return {
      shown: Math.min(want, Math.floor(shown)),
      want,
      name: COINS[kind]?.name ?? '',
      value: COINS[kind]?.value ?? 0,
    };
  }

  function paintCoinRead(shown, show) {
    const r = coinReadAt(shown, show);
    const cell = (label, v, sub) => `<span class="lsn-cell"><small>${esc(label)}</small>`
      + `<b>${esc(v)}${sub ? `<i>${esc(sub)}</i>` : ''}</b></span>`;
    host.querySelector('[data-read]').innerHTML =
      cell(LESSON_COUNT.pennies, r.shown, `${LESSON_COUNT.of} ${r.want}`)
      + cell(LESSON_COUNT.same, `1 ${r.name}`);
    return r;
  }

  const sayCoinRead = (r) => {
    host.querySelector('[data-readsay]').textContent =
      `${r.shown} ${LESSON_COUNT.of} ${r.want} ${LESSON_COUNT.pennies}, `
      + `${LESSON_COUNT.same} 1 ${r.name}`;
  };

  function paintCoins(show, { sweep = false } = {}) {
    const total = coinsValue(show.coins);
    const read = host.querySelector('[data-read]');
    stopSweep();
    read.hidden = !lesson.steps[at].count;

    /* The equivalence step: the pennies are shown BESIDE the coin they add up
       to, because that is the comparison, not a sum to be worked out. On a
       sweep they arrive ONE AT A TIME, which is the thing this lesson's own
       header claims a screen can do and paper cannot — pennies becoming the
       coin, the way counters get pushed around a desk. */
    const draw = (n) => {
      const pennies = show.pennies
        ? `<div class="lsn-equiv"><span class="lsn-eqlabel">${n} pennies</span>
            <span class="lsn-pennies">${Array.from({ length: n }, () => coin('penny', { size: 34 })).join('')}</span>
            <span class="lsn-eq" aria-hidden="true">=</span></div>` : '';
      stage.innerHTML = `${pennies}
        <div class="lsn-coins">${show.coins.map((k) =>
          `<span class="lsn-coin${show.focus === k ? ' on' : ''}">${coin(k, { size: 86 })}</span>`).join('')}</div>
        ${show.running ? `<p class="lsn-run">${
          [...show.coins].sort((a, b) => COINS[b].value - COINS[a].value)
            .reduce((acc, k) => { const run = (acc.run ?? 0) + COINS[k].value;
              acc.parts.push(String(run)); acc.run = run; return acc; }, { parts: [] }).parts
            .join(' &rarr; ')} &nbsp;=&nbsp; <b>${money(total)}</b></p>` : ''}`;
    };

    if (sweep && show.pennies && !reduced()) {
      draw(1);                      // never a blank frame; see the note above
      paintCoinRead(1, show);
      // 260ms a penny, so five is brisk and ten is still watchable.
      runSweep(0, show.pennies, Math.max(1200, show.pennies * 260),
        (v) => { draw(Math.min(show.pennies, Math.floor(v) + 1)); paintCoinRead(v, show); },
        (v) => { draw(show.pennies); sayCoinRead(paintCoinRead(v, show)); });
    } else {
      draw(show.pennies || 0);
      if (!read.hidden) sayCoinRead(paintCoinRead(show.pennies || 0, show));
    }
  }

  /* Just math takes the frame off rather than showing a blank face — the same
     rule the printed sheet's trick box follows, where `named` gates the art.
     The follow-up line is dropped there too, because it is written in the third
     person about a named friend and `fill` would put "Just math" in its place. */
  function paintWho(step) {
    const box = host.querySelector('[data-voice]');
    const id = currentCharacter();
    const ch = getCharacter(id);
    const named = id !== 'none';
    box.classList.toggle('plain', !named);
    host.querySelector('[data-whoname]').textContent = named ? `${ch.name} says` : '';
    box.querySelector('use')?.setAttribute('href', `#av-${id}`);
    const extra = host.querySelector('[data-whosay]');
    const on = named && !!step.aside;
    extra.hidden = !on;
    extra.textContent = on ? fill(step.aside, ch) : '';
  }

  /* ------------------------------------------------------------- the bar
     The shaded part is SCALED, never redrawn: `scaleX(num/den)` from a left
     origin. For one half, two quarters and four eighths that is 0.5 every time,
     so the element is handed the identical transform three steps running and
     does not budge — which is exactly what the child is being asked to notice.
     In the last two steps it goes 0.5 to 0.125 and visibly shrinks, which is
     the misconception being shown rather than argued with. */
  function paintBar(show, { sweep = false } = {}) {
    const ms = sweep && !reduced() ? 900 : 0;
    const shade = bar.querySelector('.lsn-shade');
    shade.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
    shade.style.transformOrigin = 'left center';
    shade.style.transform = `scaleX(${(show.num / show.den).toFixed(4)})`;
    for (const cut of bar.querySelectorAll('.lsn-cut')) {
      const k = Number(cut.dataset.cut);
      const on = show.den > 1 && k % (BAR_MAX / show.den) === 0;
      cut.style.transition = ms ? `opacity ${ms}ms ease` : 'none';
      cut.style.opacity = on ? '1' : '0';
    }
  }

  const barCells = (show) => [
    { label: LESSON_COUNT.pieces, value: show.den },
    { label: LESSON_COUNT.shaded, value: show.num },
    { label: LESSON_COUNT.howMuch, value: fracWords(show.num, show.den) },
  ];

  /* ----------------------------------------------------------- the array
     Rebuilt when the array changes, TURNED when only the turn changes — and the
     difference matters: a turn has to be the same squares moving, or the lesson
     is back to asking the child to trust two pictures. Each array starts at
     zero and turns once, because only odd quarter turns transpose; half a turn
     is the same array upside down and teaches nothing. */
  let arrayKey = null;
  function paintArray(show, { sweep = false } = {}) {
    const key = `${show.rows}x${show.cols}`;
    if (key !== arrayKey) {
      arrayKey = key;
      stage.innerHTML = `<div class="lsn-arraywrap"><div class="lsn-array">${
        array2d(show.rows, show.cols, { cell: 26, gap: 4 })}</div></div>`;
      stage.querySelector('svg')?.setAttribute('aria-hidden', 'true');
    }
    const el = stage.querySelector('.lsn-array');
    const ms = sweep && !reduced() ? 900 : 0;
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
    el.style.transform = `rotate(${show.turn || 0}deg)`;
  }

  // A quarter turn swaps what reads as a row and what reads as a column; the
  // total is the one number that cannot change, which is the whole point.
  const arrayCells = (show) => {
    const turned = ((show.turn || 0) / 90) % 2 !== 0;
    return [
      { label: LESSON_COUNT.rows, value: turned ? show.cols : show.rows },
      { label: LESSON_COUNT.each, value: turned ? show.rows : show.cols },
      { label: LESSON_COUNT.all, value: show.rows * show.cols },
    ];
  };

  // Generic renderer for whatever cells a stage hands back.
  function paintCells(cells) {
    const cell = (c) => `<span class="lsn-cell"><small>${esc(c.label)}</small>`
      + `<b>${esc(c.value)}${c.sub ? `<i>${esc(c.sub)}</i>` : ''}</b></span>`;
    host.querySelector('[data-read]').innerHTML = cells.map(cell).join('');
    host.querySelector('[data-readsay]').textContent =
      cells.map((c) => `${c.label}: ${c.value}${c.sub ? ' ' + c.sub : ''}`).join(', ');
  }

  function paint() {
    const step = lesson.steps[at];
    host.querySelector('[data-count]').textContent = `Step ${at + 1} of ${lesson.steps.length}`;
    host.querySelector('[data-head]').textContent = step.head;
    host.querySelector('[data-say]').textContent = step.say;
    /* Only forward. Back is supposed to rewind honestly — see the handler
       below — and re-running a six-second sweep because the reader asked to see
       the previous state would be the opposite of that. */
    paintWho(step);
    const sweep = !!step.sweep && dir > 0;
    const read = host.querySelector('[data-read]');
    read.hidden = !step.count;
    if (kind === 'clock') paintClock(step.show, { sweep });
    else if (kind === 'coins') paintCoins(step.show, { sweep });
    else if (kind === 'bar') { paintBar(step.show, { sweep }); if (step.count) paintCells(barCells(step.show)); }
    else if (kind === 'array') { paintArray(step.show, { sweep }); if (step.count) paintCells(arrayCells(step.show)); }
    host.querySelector('[data-back]').disabled = at === 0;
    const next = host.querySelector('[data-next]');
    const last = at === lesson.steps.length - 1;
    next.textContent = last ? 'Done' : 'Next →';
    const close = host.querySelector('[data-close]');
    close.hidden = !last;
    close.textContent = last ? lesson.close : '';
  }

  host.querySelector('[data-next]').addEventListener('click', () => {
    if (at < lesson.steps.length - 1) { at++; dir = 1; paint(); }
  });
  host.querySelector('[data-back]').addEventListener('click', () => {
    /* Going back re-points the hands backwards, which is honest: the reader
       asked to see the previous state, not to watch another forward sweep. */
    if (at > 0) { at--; dir = -1; paint(); }
  });
  paint();
  // theme.js fires this when the header picker is used; the aside is copy in
  // that friend's name, so it has to follow.
  document.addEventListener('characterchange', () => paintWho(lesson.steps[at]));
  return {
    paint,
    get step() { return at; },
    /* For tools/func.html. It used to walk to the sweep by clicking Next a
       hard-coded number of times, which broke the moment a step was inserted
       ahead of it — and inserting steps is exactly what a lesson does as it
       grows. */
    goto(k) { at = Math.max(0, Math.min(lesson.steps.length - 1, k)); dir = 1; paint(); },
    /* Finish wherever a sweep is: the end state, without waiting for frames.
       Repaints the current step with the sweep off rather than reimplementing
       the end state, which is what the first version did — and it returned
       early for anything that was not a clock, so once the coin lesson started
       animating too, settling it left one penny on the table. */
    settle() {
      stopSweep();
      const st = lesson.steps[at];
      if (kind === 'clock') paintClock(st.show, { sweep: false });
      else if (kind === 'coins') paintCoins(st.show, { sweep: false });
      else if (kind === 'bar') { paintBar(st.show, { sweep: false }); if (st.count) paintCells(barCells(st.show)); }
      else if (kind === 'array') { paintArray(st.show, { sweep: false }); if (st.count) paintCells(arrayCells(st.show)); }
    },
    // For assertions: what a stage's counter would read for a given state.
    cells(show) {
      if (kind === 'bar') return barCells(show);
      if (kind === 'array') return arrayCells(show);
      return null;
    },
    get kind() { return kind; },
    // The arithmetic, for assertions. cumAt/readAt/anglesAt are the three things
    // that can be wrong; none of them needs the animation to be running.
    cumAt: elapsedAt,
    readAt,
    anglesAt,
  };
}

function mount() {
  /* On an activity page there is no lesson to draw, only a callout to stand
     down. Both live here because both are about the same fact — has this reader
     seen the lesson — and splitting them across two modules would put the key in
     two places. */
  const call = document.querySelector('[data-lesson-call]');
  if (call) {
    try {
      if (localStorage.getItem(lessonSeenKey(call.dataset.lessonCall))) call.classList.add('seen');
    } catch { /* private mode: leave it loud, which is the safe direction */ }
  }
  const host = document.querySelector('[data-lesson]');
  if (!host) return;
  /* Recorded on ARRIVAL rather than on finishing. Someone who opens the lesson
     and leaves has still met it, and a callout that keeps shouting at a reader
     who has already been is the same nuisance as one that never shows. */
  try { localStorage.setItem(lessonSeenKey(host.dataset.lesson), new Date().toISOString()); } catch {}
  renderLesson(host, host.dataset.lesson);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
}

export { LESSONS };
