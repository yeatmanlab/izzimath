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

import { LESSONS, lessonById, lessonSeenKey, LESSON_COUNT, LESSON_TRY, lessonLegs } from '../../content/lessons.js';
import { sweepMs as paceSweep, coinMs as paceCoin, dwellFor as paceDwell } from '../lib/pace.js';
import { clockFace, clockDigital, coin, COINS, coinsValue, money, array2d,
  numberLine, numberLinePos } from '../lib/widgets.js';
import { currentCharacter } from '../lib/theme.js';
import { getCharacter, fill } from '../../content/characters.js';
import { speechAvailable, audioOn, audioEverUsed, speak, stopSpeaking,
  voiceButton, wireVoiceButtons } from '../lib/speech.js';
import { clockStage, digitalStage, dragTo, angleOf,
  pointHandsAt as pointHandsOn, timeText } from '../lib/clockdial.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = () => typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* THE DIAL AND THE DRAG ARITHMETIC MOVED to src/lib/clockdial.js, because the
   hint button on a clock question now offers the same object — see that file's
   header. Re-exported here because tools/func.html drives them through this
   module, and because they are still this lesson's arithmetic as much as the
   widget's. */
export { dragTo, angleOf } from '../lib/clockdial.js';

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

/* --------------------------------------------------------- the number line
   DRAWN ONCE, AND ONE MARKER SLIDES ALONG IT — the same trick as the clock's
   hands, and for the same reason: what the lesson claims is that a jump of ten
   is the same size wherever you make it, and the only way to show that is to
   move the same marker the same distance twice. Two drawings of two markers
   would be asking the child to trust two pictures, which is the thing this
   format exists to avoid.

   The axis, the ticks and the labels come from numberLine() so the line looks
   like every other number line on the site; the marker is stripped out of it
   and replaced with one this stage keeps hold of. */
const LINE_W = 560, LINE_LO = 0, LINE_HI = 100;
const linePos = numberLinePos({ lo: LINE_LO, hi: LINE_HI, width: LINE_W });

function lineStage() {
  const wrap = document.createElement('div');
  wrap.className = 'lsn-line';
  const ticks = Array.from({ length: 101 }, (_, i) => i).filter((v) => v % 5 === 0 && v % 10 !== 0);
  const majors = Array.from({ length: 11 }, (_, i) => i * 10);
  const svg = numberLine({
    lo: LINE_LO, hi: LINE_HI, ticks, majors,
    labels: majors.map((v) => [v, String(v)]),
    width: LINE_W, marker: null,
  }).replace('</svg>', `
    <g class="lsn-mark">
      <line x1="0" y1="30" x2="0" y2="74" stroke="var(--a1)" stroke-width="2.5"/>
      <circle cx="0" cy="52" r="12" fill="var(--a2)" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
    </g></svg>`);
  wrap.innerHTML = svg;
  wrap.querySelector('svg')?.setAttribute('aria-hidden', 'true');
  return wrap;
}

/* ------------------------------------------------------------- the balance
   THE BEAM TIPS, AND THAT IS THE WHOLE LESSON. A printed page can draw a
   balanced scale or a tipping one; only a screen can tip it in response to a
   number the child chose, and that feedback is the argument. The misconception
   is the operational reading of the equals sign — that it means "the answer
   comes next" rather than "the same as" — which is why `8 + 4 = __ + 5` gets
   12 from most children who have only ever seen sums written left to right.

   Drawn once and rotated, like the array: the same beam, the same two pans, so
   what changes is the tilt and nothing else. The pans are counter-moved
   vertically rather than rotated with the beam, because a real pan hangs level
   and a tilted box full of numbers is harder to read at the moment a child is
   trying to read it. */
const BEAM_W = 460, BEAM_H = 200, BEAM_ARM = 168, BEAM_Y = 58, PAN_DROP = 44;

function scaleStage() {
  const wrap = document.createElement('div');
  wrap.className = 'lsn-scale';
  const cx = BEAM_W / 2;
  const pan = (side) => `
    <g class="lsn-pan" data-pan="${side}">
      <line x1="0" y1="${BEAM_Y}" x2="0" y2="${BEAM_Y + PAN_DROP}" stroke="var(--line2)" stroke-width="2"/>
      <rect x="-54" y="${BEAM_Y + PAN_DROP}" width="108" height="56" rx="10"
        fill="var(--glass)" stroke="var(--line2)" stroke-width="2"/>
      <text class="lsn-pantxt" x="0" y="${BEAM_Y + PAN_DROP + 36}" text-anchor="middle"
        font-size="22" font-weight="700" fill="var(--txt)"
        font-family="'Space Grotesk',sans-serif"></text>
    </g>`;
  wrap.innerHTML = `<svg viewBox="0 0 ${BEAM_W} ${BEAM_H}" width="100%" height="${BEAM_H}" aria-hidden="true">
    <g class="lsn-beam">
      <line x1="${cx - BEAM_ARM}" y1="${BEAM_Y}" x2="${cx + BEAM_ARM}" y2="${BEAM_Y}"
        stroke="var(--a1)" stroke-width="6" stroke-linecap="round"/>
    </g>
    <path d="M${cx} ${BEAM_Y} L${cx - 26} ${BEAM_H - 18} L${cx + 26} ${BEAM_H - 18} Z"
      fill="none" stroke="var(--line2)" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${BEAM_Y}" r="6" fill="var(--a1)"/>
    <g transform="translate(${cx - BEAM_ARM} 0)">${pan('left')}</g>
    <g transform="translate(${cx + BEAM_ARM} 0)">${pan('right')}</g>
  </svg>`;
  return wrap;
}

/* How far it tips, from the difference. Capped so a difference of twenty does
   not stand the beam on end, and PURE so the harness can assert the direction
   without waiting for a transition: left heavier tips left down, which is
   negative in SVG's clockwise-positive world. */
export function tiltOf(leftSum, rightSum) {
  const d = leftSum - rightSum;
  return Math.max(-13, Math.min(13, d * 1.7));
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
      <!-- WHERE THE ANIMATION STOPS TO TALK. A sweep that runs start to finish
           is one thing to watch and nothing to read; a first grader watched the
           hour go by and pressed on without having met the carry. So the run
           pauses at the places that teach — the first numeral, half past, the
           three-quarter mark, and the hour itself — and holds a sentence up
           here while it waits. Directly under the counter, because the sentence
           is about the numbers in it.
           A live region: unlike the counter, it changes a handful of times per
           step rather than sixty times a second, so it is safe to announce. -->
      <p class="lsn-hold" data-hold aria-live="polite" hidden></p>
      <!-- YOUR TURN. How to move the hands, and then whether it worked. A live
           region because the answer to "have I done it" must reach a reader who
           cannot see the hands they just moved. -->
      <p class="lsn-try" data-try aria-live="polite" hidden></p>
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
      <!-- CHECK YOURSELF, and it sits AFTER the friend has spoken rather than
           above the figure, because the question is the last beat of the step:
           the caption sets it up and the question follows. The first version
           put it beside the counter like the "your turn" box, and a child read
           the question before the sentence explaining what to look at.

           One question, two or three answers, and a reason attached to every
           one of them — including the wrong ones, which is where the value is:
           "no" teaches nothing, and "the hand has not reached the 8 yet"
           teaches the thing the child got wrong. Never scored, never a gate;
           Next works throughout and the answer can be changed as often as
           they like. -->
      <div class="lsn-ask" data-ask hidden></div>
      <div class="lsn-foot">
        <button class="btn" type="button" data-back>&larr; Back</button>
        <button class="btn pri" type="button" data-next>Next &rarr;</button>
        <!-- A child who pressed Next through the animation has no way back to
             it except Back-then-Next, which re-reads as going backwards. On the
             steps that move, the move itself is the content. -->
        <button class="btn" type="button" data-replay hidden>&#9655; Watch it again</button>
        <!-- Only while a check sent the reader here. -->
        <button class="btn" type="button" data-toask hidden></button>
        <!-- READ IT TO ME. The lesson is pitched at grade 1 and all of its
             content is text, so the child it was built for may not be able to
             read it — and narration beside an animation beats text beside the
             same animation, because text and picture compete for one channel.
             A toggle with the chosen friend's face on it, off until pressed.
             Absent entirely where the browser cannot speak, rather than
             present and dead. -->
        ${speechAvailable() ? voiceButton({ pulse: !audioEverUsed() }) : ''}
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
  const clock = isClock ? clockStage({ size: 240 }) : null;
  if (clock) stage.appendChild(clock);
  const digital = isClock ? digitalStage({ size: 150 }) : null;
  if (digital) { digital.hidden = true; stage.appendChild(digital); }
  /* THE GOAL GOES NEXT TO THE NUMBER IT HAS TO MATCH. For a clock that is the
     digital face, which is where it was asked for and where it belongs — the
     two numbers a child compares should be one glance apart. Every other stage
     compares against its counter, so there it goes above the counter. One
     element either way, placed rather than duplicated. */
  if (!isClock) {
    const g = document.createElement('p');
    g.className = 'lsn-goal lsn-goal-read';
    g.dataset.goal = '';
    g.hidden = true;
    host.querySelector('[data-read]').before(g);
  }
  const scale = kind === 'scale' ? scaleStage() : null;
  if (scale) stage.appendChild(scale);
  const line = kind === 'line' ? lineStage() : null;
  if (line) stage.appendChild(line);
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
  let hold = null;            // the timer that holds a stop open
  const stopSweep = () => {
    if (raf != null) { cancelAnimationFrame(raf); raf = null; }
    /* The HOLD timer has to die with the frame loop. Without this, pressing
       Next during a pause left a setTimeout alive that resumed the old step's
       animation over the new step's clock a second and a half later. */
    if (hold != null) { clearTimeout(hold); hold = null; }
  };
  const startCum = () => elapsedAt(0);

  /* Duration from the distance swept, so a fifteen-minute run and a
     sixty-five-minute one do not take the same time on screen.

     140ms a minute rather than 90. At 90 a quarter of an hour went by in 1.35
     seconds, which is long enough to see that something moved and not long
     enough to watch WHICH hand moved how far — and watching the short hand
     creep is the entire reason this lesson is animated. A first grader went
     through it and came out still reading the hour off the wrong number.

     IMPORTED rather than written here, because the lessons index advertises how
     long each lesson takes and src/lib/pace.js works that out from these very
     numbers. Two copies would drift, and the drift would show as a page
     confidently disagreeing with the thing it was timing. */
  const sweepMs = paceSweep;

  /* WHERE THE RUN PAUSES, as a plain list, computed from the step rather than
     from anything the animation is doing.

     PURE, and that is deliberate for the same reason readAt is: a stop plan
     that is only observable while frames are running is a plan no test can
     check, because requestAnimationFrame does not run in a hidden tab. This
     returns the legs a sweep will walk — every one of them, in order, ending at
     the step's own time — and tools/func.html asserts the plan instead of
     trying to catch the pauses as they happen.

     A stop states the time it lands on, in the same `{ h, m }` vocabulary a
     step's `show` uses, because an author thinking "pause at half past" should
     not have to convert that into minutes-since-the-start. `cum % 720` is the
     dial position, so the arithmetic wraps past 12 by itself. A stop that is
     not strictly inside the sweep is dropped here and failed by check.mjs —
     silently skipping one would leave the lesson a caption short with nothing
     to show it. */
  /* MOVED TO content/lessons.js, because src/lib/pace.js needs the same plan to
     say how long a lesson takes and two copies would drift. What is left here
     is the wrapper the harness drives.

     scripts/check.mjs deliberately keeps its OWN arithmetic for validating
     stops: a checker that asks the content to agree with itself proves only
     that one function is self-consistent, and a stop silently dropped for
     falling outside its run is exactly the bug it exists to catch. */
  const legsAt = (k) => lessonLegs(lesson, k);

  /* How long a stop stays up. From the length of what it says, because the only
     thing the reader is doing is reading it — a fixed delay is either too long
     for "60 minutes!" or too short for a sentence. */
  const dwellFor = paceDwell;

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

  /* The digital face, from the SAME cum the hands just took. Only the four
     characters change, so the element the reader is looking at is never
     replaced. */
  function pointDigital(cum) {
    if (!digital) return '';
    const r = readAt(cum);
    const text = `${r.h12}:${String(r.m60).padStart(2, '0')}`;
    const t = digital.querySelector('text');
    if (t) t.textContent = text;
    return text;
  }

  /* From the shared dial module, bound to this stage's wrapper. */
  const pointHandsAt = (h, m, ms = 0) => pointHandsOn(clock, h, m, ms);

  function setDigits(h, m) {
    const t = digital?.querySelector('text');
    if (t) t.textContent = timeText(h, m);
  }

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

  /* WALKED LEG BY LEG. With no stops declared this is one leg and behaves
     exactly as a single sweep did. With stops it runs, holds a sentence up, and
     carries on — which is the difference between an hour going by and a child
     being told what happened while it did.

     Shared by the clock and the coins rather than copied, because the two were
     already sharing `runSweep` for the same reason: they are the same shape of
     thing, a value walked from one number to another with a picture and a
     readout drawn from it. */
  function walkLegs(k, from, onFrame, onSettled, msFor) {
    const legs = legsAt(k);
    const holdEl = host.querySelector('[data-hold]');
    const walk = (i, at0) => {
      const leg = legs[i];
      runSweep(at0, leg.cum, msFor(leg.cum - at0),
        (c) => onFrame(c),
        (c) => {
          onSettled(onFrame(c));
          const last = i === legs.length - 1;
          if (last) { holdEl.hidden = true; return; }
          holdEl.textContent = leg.say || '';
          holdEl.hidden = !leg.say;
          /* The pause reads its own line. This is the moment the feature is
             for: the picture has stopped, there is one sentence on screen, and
             a child who cannot read it is otherwise looking at a still
             figure. */
          if (leg.say && audioOn()) speak(leg.say, currentCharacter());
          hold = setTimeout(() => { hold = null; walk(i + 1, leg.cum); },
            leg.dwell ?? dwellFor(leg.say));
        });
    };
    walk(0, from);
  }

  /* One frame of the clock: both faces and the counter, all three from `c`. The
     reason they are in one function is that it is impossible to call one and
     forget another — which is how the digital face came to sit on the step's
     final time for the whole length of the sweep. */
  function frameAt(c) {
    pointHands(c, 0);
    pointDigital(c);
    return paintRead(c);
  }

  /* ------------------------------------------------------------ YOUR TURN
     A step may declare `try: { h, m }` — a time for the child to SET, by
     dragging the hands. The lesson so far has been something to watch; this is
     the same clock with the child's hand on it, which is the difference between
     being shown that the hour hand creeps and feeling it creep.

     `show` is where the hands start, `try` is where they are asked to get to.
     Nothing about the lesson's timeline changes: the next step still comes from
     its own `show`, so Back and Next stay reproducible however long a child
     plays with it.

     Deliberately NOT scored and NOT a gate. Getting it right says so and that
     is all; Next is available throughout, because a child who cannot manage the
     drag must not be stuck in a lesson. */
  let tryAt = null;        // the clock the child is holding, while a try step is up
  let grab = null;         // 'hour' | 'minute'
  let lastAngle = null;
  let wasTry = false;      // so the step AFTER a try step does not animate from nowhere
  let solved = false;

  const tryGoal = () => lesson.steps[at]?.try || null;

  /* THE TWO THINGS EVERY TRY STEP SHOWS, whatever the stage: what to make, and
     whether you have made it. Shared so the four stages cannot drift into four
     different ways of saying "yes, that's it".

     `said` is what the goal looks like written down — a time, an amount, a
     fraction, an array — because the goal has to be stated in the units the
     child is working in. */
  /* `lead` is overridable because "Make it say 7" is the wrong sentence for a
     balance — the number that balances it is the answer, and printing it above
     the beam would be printing the answer. There the goal is the condition. */
  function showGoal(said, lead = LESSON_TRY.goal) {
    const goalEl = host.querySelector('[data-goal]');
    if (!goalEl) return;
    goalEl.textContent = `${lead} ${said}`.trim();
    goalEl.hidden = false;
  }

  /* `gotText` overrides the success line. "Yes — that is 7:00" is right for a
     clock and nonsense for a balance, where what was achieved is a condition
     rather than a value: passing the sentence through LESSON_TRY.got produced
     "Yes — that is Balanced. Both sides are the same, so the two are equal.." */
  function showTry(hit, said, how, gotText = null) {
    const box = host.querySelector('[data-try]');
    if (box) {
      box.hidden = false;
      box.textContent = hit ? (gotText ?? LESSON_TRY.got(said)) : how;
      box.classList.toggle('done', hit);
    }
    /* Said once, on the transition into being right. Repeating it on every
       further nudge would talk over a child still playing. */
    if (hit && !solved) {
      solved = true;
      if (audioOn()) speak(gotText ?? LESSON_TRY.got(said), currentCharacter());
    }
    if (!hit) solved = false;
  }

  /* ------------------------------------------------- CHECK FOR UNDERSTANDING
     A `try` step asks a child to DO the thing; an ask step asks whether they
     know it. Both are needed and they are not the same: setting 9:30 with two
     fingers does not prove you would read 7:30 off a dial, which is the
     misconception the whole clock lesson exists for.

     Every option carries its own `why`, wrong ones included. That is the site's
     oldest rule — bare right-or-wrong feedback is worth about a tenth of
     elaborated feedback, and the gap is widest in maths — and here it is the
     whole point of asking: the child who picks "8 o'clock" needs to hear that
     the hand has not reached the 8 yet, not that they are wrong. */
  let asked = null;
  /* WHERE TO COME BACK TO. A check that says "wrong, and here is why" is still
     a dead end: the child who needed the explaining is the one least likely to
     go hunting for the step that teaches it. So a wrong answer can carry `back`
     — the step that explains it — and pressing it goes there and remembers the
     question, so there is a way home rather than a walk forward through
     everything in between. */
  let returnTo = null;

  function paintAsk(step) {
    const box = host.querySelector('[data-ask]');
    if (!box) return;
    const a = step.ask;
    box.hidden = false;
    box.innerHTML = `<p class="lsn-q">${esc(a.q)}</p>
      <div class="lsn-opts">${a.options.map((o, i) => `
        <button type="button" class="lsn-opt${asked === i ? (o.right ? ' right' : ' wrong') : ''}"
          data-opt="${i}" aria-pressed="${asked === i}">${esc(o.say)}</button>`).join('')}</div>
      ${asked != null ? `<p class="lsn-why${a.options[asked].right ? ' right' : ''}">${
        esc(a.options[asked].why)}</p>` : ''}
      ${asked != null && a.options[asked].back
        ? `<p class="lsn-again"><button type="button" class="btn sm" data-reteach="${
          a.options[asked].back}">${LESSON_TRY.again}</button></p>` : ''}`;
  }

  if (host) {
    host.querySelector('[data-ask]').addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-opt]');
      const step = lesson.steps[at];
      if (!step?.ask) return;
      if (!b && !e.target.closest?.('[data-reteach]')) return;
      const again = e.target.closest?.('[data-reteach]');
      if (again) {
        returnTo = at;
        at = Math.max(0, Number(again.dataset.reteach) - 1);
        dir = 1;
        paint();
        return;
      }
      asked = Number(b.dataset.opt);
      paintAsk(step);
      /* Read the reason out, not the verdict. The words a child needs are the
         ones explaining their own answer. */
      if (audioOn()) speak(step.ask.options[asked].why, currentCharacter());
    });
  }

  function paintTry() {
    const goal = tryGoal();
    if (!goal || !tryAt) return;
    pointHandsAt(tryAt.h, tryAt.m, 0);
    setDigits(tryAt.h, tryAt.m);
    const said = timeText(goal.h, goal.m);
    showGoal(said);
    showTry(tryAt.h === goal.h && tryAt.m === goal.m, said, LESSON_TRY.how);
  }

  /* ONE HANDLER SET, INSTALLED ONCE, and it does nothing unless a try step is
     on screen. Pointer events rather than mouse or touch: one code path covers
     a finger, a stylus and a mouse, which is the whole reason they exist. */
  if (clock) {
    const dial = () => clock.querySelector('svg');
    clock.addEventListener('pointerdown', (e) => {
      if (!tryGoal()) return;
      const g = e.target.closest?.('[data-grab]');
      if (!g) return;
      grab = g.dataset.grab;
      lastAngle = angleOf(dial().getBoundingClientRect(), e.clientX, e.clientY);
      /* Captured so the drag survives the pointer leaving the hand — which it
         does immediately, because the hand moves out from under the finger. */
      try { g.setPointerCapture(e.pointerId); } catch { /* not supported: still works */ }
      e.preventDefault();
    });
    clock.addEventListener('pointermove', (e) => {
      if (!grab || !tryGoal() || !tryAt) return;
      const a = angleOf(dial().getBoundingClientRect(), e.clientX, e.clientY);
      tryAt = dragTo(tryAt, grab, a, lastAngle);
      lastAngle = a;
      paintTry();
      e.preventDefault();
    });
    for (const done of ['pointerup', 'pointercancel']) {
      clock.addEventListener(done, () => { grab = null; lastAngle = null; });
    }
  }

  function paintClock(show, { sweep = false } = {}) {
    const hour = clock.querySelector('.lsn-hour');
    const min = clock.querySelector('.lsn-min');
    const cum = elapsedAt(at);
    const read = host.querySelector('[data-read]');
    const holdEl = host.querySelector('[data-hold]');
    stopSweep();
    read.hidden = !lesson.steps[at].count;
    holdEl.hidden = true;
    holdEl.textContent = '';
    if (digital) digital.hidden = !show.digital;

    const goal = tryGoal();
    const goalEl = host.querySelector('[data-goal]');
    const tryBox = host.querySelector('[data-try]');
    clock.classList.toggle('can-grab', !!goal);
    if (!goal) {
      if (goalEl) { goalEl.hidden = true; goalEl.textContent = ''; }
      if (tryBox) { tryBox.hidden = true; tryBox.textContent = ''; tryBox.classList.remove('done'); }
      tryAt = null;
    }
    if (goal) {
      /* The hands start where the step says and stay wherever the child leaves
         them — repainting on every nudge would undo the drag. */
      tryAt = { h: show.h, m: show.m };
      solved = false;
      wasTry = true;
      paintTry();
      hour.classList.toggle('on', show.focus === 'hour' || show.focus === 'both');
      min.classList.toggle('on', show.focus === 'minute' || show.focus === 'both');
      return;
    }

    if (sweep && !reduced() && at > 0) {
      const from = elapsedAt(at - 1);
      /* Painted at the START before the loop begins, so the row is never blank.
         requestAnimationFrame does not run in a hidden tab, so without this a
         reader who switches away mid-sweep and comes back finds an empty
         counter under a still clock. */
      frameAt(from);
      walkLegs(at, from, (c) => frameAt(c), (r) => sayRead(r), (ms) => sweepMs(ms));
    } else {
      /* No transition on the step straight after a try step. The hands are
         wherever the child put them, and the lesson's own angles accumulate, so
         a transition there is a long unexplained spin rather than a move. */
      pointHands(cum, reduced() || wasTry ? 0 : 900);
      pointDigital(cum);
      if (!read.hidden) sayRead(paintRead(cum));
      wasTry = false;
    }
    hour.classList.toggle('on', show.focus === 'hour' || show.focus === 'both');
    min.classList.toggle('on', show.focus === 'minute' || show.focus === 'both');
  }

  /* -------------------------------------------- YOUR TURN, WITH THE BAR
     "Shade one half" — on a bar already cut into quarters, so the only way to
     do it is to shade two of them. That is the lesson's own claim turned into a
     task: the child cannot succeed by believing that more pieces means more,
     and they cannot succeed by counting to one either.

     Tap a piece to shade or unshade it. The pieces are plain rectangles laid
     over the bar rather than a second drawing of it, so what is being tapped is
     the figure the lesson has been using all along. */
  let shaded = new Set();

  function paintBarTry() {
    const goal = tryGoal();
    if (!goal) return;
    const den = lesson.steps[at].show.den;
    const seg = BAR_W / den;
    bar.querySelector('.lsn-shade')?.setAttribute('opacity', '0');
    /* Drawn as one rect per piece, in place, so a piece that is shaded is
       exactly the piece that was tapped. */
    let cells = '';
    for (let k = 0; k < den; k++) {
      cells += `<rect class="lsn-piece${shaded.has(k) ? ' on' : ''}" data-piece="${k}"
        x="${(k * seg).toFixed(2)}" y="0" width="${seg.toFixed(2)}" height="${BAR_H}"/>`;
    }
    let layer = bar.querySelector('.lsn-pieces');
    if (!layer) {
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      layer.setAttribute('class', 'lsn-pieces');
      bar.querySelector('svg').appendChild(layer);
    }
    layer.innerHTML = cells;
    const want = goal.num / goal.den;
    const got = shaded.size / den;
    paintCells([
      { label: LESSON_COUNT.pieces, value: den },
      { label: LESSON_COUNT.shaded, value: shaded.size },
      { label: LESSON_COUNT.howMuch, value: fracWords(shaded.size, den) },
    ]);
    host.querySelector('[data-read]').hidden = false;
    const said = fracWords(goal.num, goal.den);
    showGoal(said);
    showTry(Math.abs(got - want) < 1e-9, said, LESSON_TRY.howTap);
  }

  /* -------------------------------------------- YOUR TURN, WITH THE ARRAY
     "Make 4 rows of 6." Drag on the array and it grows or shrinks: sideways
     changes the row length, up and down changes the number of rows. One gesture
     doing two things is a real risk with a six-year-old, so whichever axis the
     finger has moved furthest along is the one that wins — a diagonal drag does
     one thing at a time rather than both at once. */
  let arrAt = null;
  let dragFrom = null;

  function paintArrayTry() {
    const goal = tryGoal();
    if (!goal || !arrAt) return;
    paintArray({ ...arrAt, turn: 0 }, { sweep: false });
    paintCells(arrayCells({ ...arrAt, turn: 0 }));
    host.querySelector('[data-read]').hidden = false;
    const said = `${goal.rows} ${LESSON_COUNT.rows} ${LESSON_TRY.of} ${goal.cols}`;
    showGoal(said);
    showTry(arrAt.rows === goal.rows && arrAt.cols === goal.cols, said, LESSON_TRY.howArr);
  }

  if (kind === 'array') {
    /* The cell pitch the array is drawn at, so a finger moving one square's
       width changes the array by one square. */
    const PITCH = 30;
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
    stage.addEventListener('pointerdown', (e) => {
      if (!tryGoal() || !arrAt) return;
      dragFrom = { x: e.clientX, y: e.clientY, rows: arrAt.rows, cols: arrAt.cols, axis: null };
      e.preventDefault();
    });
    stage.addEventListener('pointermove', (e) => {
      if (!dragFrom || !tryGoal() || !arrAt) return;
      const dx = e.clientX - dragFrom.x, dy = e.clientY - dragFrom.y;
      /* THE AXIS LOCKS ON THE FIRST REAL MOVEMENT. Deciding it per event meant
         a wobbly finger flipped between changing rows and changing columns,
         which reads as the array fighting back. */
      if (!dragFrom.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
        dragFrom.axis = Math.abs(dx) >= Math.abs(dy) ? 'cols' : 'rows';
      }
      if (!dragFrom.axis) return;
      const next = { ...arrAt };
      if (dragFrom.axis === 'cols') next.cols = clamp(dragFrom.cols + Math.round(dx / PITCH), 1, 10);
      else next.rows = clamp(dragFrom.rows + Math.round(dy / PITCH), 1, 10);
      if (next.rows !== arrAt.rows || next.cols !== arrAt.cols) { arrAt = next; paintArrayTry(); }
      e.preventDefault();
    });
    for (const d of ['pointerup', 'pointercancel']) {
      stage.addEventListener(d, () => { dragFrom = null; });
    }
  }

  if (kind === 'bar' && bar) {
    bar.addEventListener('click', (e) => {
      if (!tryGoal()) return;
      const p = e.target.closest?.('[data-piece]');
      if (!p) return;
      const k = Number(p.dataset.piece);
      if (shaded.has(k)) shaded.delete(k); else shaded.add(k);
      paintBarTry();
    });
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
    const holdEl = host.querySelector('[data-hold]');
    stopSweep();
    read.hidden = !lesson.steps[at].count;
    holdEl.hidden = true;
    holdEl.textContent = '';

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
      walkLegs(at, 0,
        (v) => { draw(Math.min(show.pennies, Math.floor(v) + 1)); return paintCoinRead(v, show); },
        (r) => sayCoinRead(r),
        paceCoin);
    } else {
      draw(show.pennies || 0);
      if (!read.hidden) sayCoinRead(paintCoinRead(show.pennies || 0, show));
    }
  }

  /* ------------------------------------------------------- the line's paint
     The marker goes where the value says, and the readout says the same value.
     One number, two places to read it, which is the rule every stage here
     keeps. */
  function markAt(v, ms = 0) {
    const g = line?.querySelector('.lsn-mark');
    if (!g) return;
    g.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
    g.style.transform = `translateX(${linePos(v).toFixed(2)}px)`;
  }

  const lineCells = (v, jumps = null) => [
    { label: LESSON_COUNT.youAre, value: Math.round(v) },
    ...(jumps == null ? [] : [{ label: LESSON_COUNT.jumps, value: jumps }]),
  ];

  function paintLine(show, { sweep = false } = {}) {
    const read = host.querySelector('[data-read]');
    const holdEl = host.querySelector('[data-hold]');
    stopSweep();
    read.hidden = !lesson.steps[at].count;
    holdEl.hidden = true;
    holdEl.textContent = '';
    const to = show.at || 0;
    if (sweep && !reduced() && at > 0) {
      const from = lesson.steps[at - 1].show.at || 0;
      markAt(from, 0);
      paintCells(lineCells(from));
      walkLegs(at, from,
        (v) => { markAt(v, 0); paintCells(lineCells(v)); return lineCells(v); },
        () => {},
        (units) => sweepMs(Math.abs(units) * 3));
    } else {
      markAt(to, reduced() ? 0 : 700);
      if (!read.hidden) paintCells(lineCells(to));
    }
  }

  /* ----------------------------------------------------- the balance's paint
     Both sums, the tilt and the two pans all come from one pair of numbers, so
     a beam that leans left cannot sit above a readout claiming the sides match.

     `null` in a side is the blank the child is filling. Before they touch it the
     pan shows a question mark rather than a zero — a zero is an answer, and it
     would be a wrong one sitting there looking deliberate. */
  const sideSum = (side, fill) => (side || [])
    .reduce((n, v) => n + (v === null ? (fill ?? 0) : v), 0);
  const sideText = (side, fill) => (side || [])
    .map((v) => (v === null ? (fill == null ? '?' : String(fill)) : String(v))).join(' + ');

  function paintScale(show, { sweep = false, fill = null, cells = null } = {}) {
    const read = host.querySelector('[data-read]');
    stopSweep();
    /* `cells` is forced on in try mode. Without it the readout was HIDDEN while
       this function ran — a try step declares no `count` — so paintCells was
       skipped, and then the widget un-hid the row a moment later revealing the
       PREVIOUS step's numbers. The beam went level above a readout still
       claiming 12 against 17. */
    read.hidden = cells == null ? !lesson.steps[at].count : !cells;
    const l = sideSum(show.left, fill);
    const r = sideSum(show.right, fill);
    const tilt = tiltOf(l, r);
    const beam = scale.querySelector('.lsn-beam');
    const ms = sweep && !reduced() ? 900 : 0;
    beam.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
    beam.style.transformOrigin = `${BEAM_W / 2}px ${BEAM_Y}px`;
    beam.style.transform = `rotate(${(-tilt).toFixed(2)}deg)`;
    /* The pans hang level rather than tilting with the beam: a real pan does,
       and a tilted box of numbers is harder to read at exactly the moment a
       child is trying to read it. */
    for (const [side, sum, dir] of [['left', l, 1], ['right', r, -1]]) {
      const pan = scale.querySelector(`[data-pan="${side}"]`);
      pan.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
      pan.style.transform = `translateY(${(dir * tilt * 2.1).toFixed(2)}px)`;
      pan.querySelector('.lsn-pantxt').textContent = sideText(show[side], fill);
      void sum;
    }
    if (!read.hidden) {
      paintCells([
        { label: LESSON_COUNT.thisSide, value: l },
        { label: LESSON_COUNT.thatSide, value: r },
        { label: LESSON_COUNT.same, value: l === r ? LESSON_COUNT.yes : LESSON_COUNT.no },
      ]);
    }
  }

  /* ----------------------------------------- YOUR TURN, ON THE BALANCE
     Steppers rather than a keypad. The number wanted is always small, the child
     is watching the beam rather than the button, and every press gives the
     feedback the lesson is made of: it tips a little less. */
  let fillAt = null;

  function paintScaleTry() {
    const goal = tryGoal();
    if (!goal) return;
    const show = lesson.steps[at].show;
    paintScale(show, { sweep: false, fill: fillAt, cells: true });
    let pad = host.querySelector('[data-step-pad]');
    if (!pad) {
      pad = document.createElement('div');
      pad.className = 'lsn-jumps';
      pad.dataset.stepPad = '';
      stage.appendChild(pad);
    }
    pad.innerHTML = `<button type="button" class="lsn-jump" data-fill="-1">\u2212 1</button>
      <span class="lsn-fillnow">${fillAt == null ? '?' : fillAt}</span>
      <button type="button" class="lsn-jump" data-fill="1">+ 1</button>`;
    const hit = sideSum(show.left, fillAt) === sideSum(show.right, fillAt);
    showGoal(LESSON_TRY.balance, '');
    showTry(hit, '', LESSON_TRY.howFill, LESSON_TRY.balanced);
  }

  if (kind === 'scale') {
    stage.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-fill]');
      if (!b || !tryGoal()) return;
      const next = Math.max(0, Math.min(20, (fillAt ?? 0) + Number(b.dataset.fill)));
      fillAt = next;
      paintScaleTry();
    });
  }

  /* -------------------------------------------- YOUR TURN, ON THE LINE
     JUMP BUTTONS, NOT A DRAGGABLE MARKER, and that is the pedagogy rather than
     the easy way out. Dragging a marker to 47 teaches a child to aim; the thing
     being learned is that 47 is four tens and seven ones, so the widget only
     offers jumps of ten and jumps of one and lets them count what it took.

     The jump counter is the point of the readout: getting to 40 in four jumps
     and in forty jumps both land on 40, and only one of them is the lesson. */
  let lineAt = 0;
  let jumps = 0;

  function paintLineTry() {
    const goal = tryGoal();
    if (!goal) return;
    markAt(lineAt, 260);
    let pad = host.querySelector('[data-jumps]');
    if (!pad) {
      pad = document.createElement('div');
      pad.className = 'lsn-jumps';
      pad.dataset.jumps = '';
      stage.appendChild(pad);
    }
    pad.innerHTML = [['+10', 10], ['+1', 1], ['\u22121', -1], ['\u221210', -10]]
      .map(([lab, d]) => `<button type="button" class="lsn-jump" data-jump="${d}">${lab}</button>`).join('');
    paintCells(lineCells(lineAt, jumps));
    host.querySelector('[data-read]').hidden = false;
    const said = String(goal.at);
    showGoal(said);
    showTry(lineAt === goal.at, said, LESSON_TRY.howJump);
  }

  if (kind === 'line') {
    stage.addEventListener('click', (e) => {
      const b = e.target.closest?.('[data-jump]');
      if (!b || !tryGoal()) return;
      const d = Number(b.dataset.jump);
      const next = Math.max(LINE_LO, Math.min(LINE_HI, lineAt + d));
      if (next === lineAt) return;
      lineAt = next;
      jumps += 1;
      paintLineTry();
    });
  }

  /* ------------------------------------------------- YOUR TURN, WITH COINS
     "Make 25 cents." A tray of the four coins to tap from, a pile of what has
     been taken, and a running total against the goal.

     The interesting part pedagogically is that there is more than one right
     answer — a quarter, or two dimes and a nickel, or five nickels — and the
     widget says yes to all of them, because the thing being learned is that
     value is not the same as the number of coins. That is the same
     misconception the lesson's sweep is about, from the other side.

     Tap to add, tap a coin in the pile to put it back. No dragging: a tap is
     the whole gesture a five-year-old needs, and a drag between two boxes on a
     tablet is fiddly enough to become the lesson. */
  let purse = [];

  function coinsTotal() { return purse.reduce((n, k) => n + (COINS[k]?.value || 0), 0); }

  function paintCoinTry() {
    const goal = tryGoal();
    if (!goal) return;
    const total = coinsTotal();
    const tray = ['quarter', 'dime', 'nickel', 'penny'];
    stage.innerHTML = `
      <div class="lsn-tray">
        <p class="lsn-traylab">${LESSON_TRY.trayLab}</p>
        <div class="lsn-trayrow">${tray.map((k) =>
          `<button type="button" class="lsn-take" data-take="${k}"
            aria-label="add a ${COINS[k].name}">${coin(k, { size: 62 })}</button>`).join('')}</div>
      </div>
      <div class="lsn-purse" data-purse>
        ${purse.length
          ? purse.map((k, i) => `<button type="button" class="lsn-drop" data-drop="${i}"
              aria-label="put the ${COINS[k].name} back">${coin(k, { size: 54 })}</button>`).join('')
          : `<p class="lsn-empty">${LESSON_TRY.empty}</p>`}
      </div>`;
    paintCells([
      { label: LESSON_COUNT.coinsTaken, value: purse.length },
      { label: LESSON_COUNT.worth, value: money(total) },
    ]);
    host.querySelector('[data-read]').hidden = false;
    const said = money(goal.cents);
    showGoal(said);
    showTry(total === goal.cents, said, LESSON_TRY.howCoin);
  }

  /* Delegated, because the tray is rebuilt on every tap. */
  if (kind === 'coins') {
    stage.addEventListener('click', (e) => {
      if (!tryGoal()) return;
      const take = e.target.closest?.('[data-take]');
      if (take) { purse = [...purse, take.dataset.take]; paintCoinTry(); return; }
      const drop = e.target.closest?.('[data-drop]');
      if (drop) {
        const i = Number(drop.dataset.drop);
        purse = purse.filter((_, k) => k !== i);
        paintCoinTry();
      }
    });
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

  /* WHAT A STEP SOUNDS LIKE. The heading, the sentence, and the friend's second
     beat — which is the same order they are read in, and the same words. There
     is no separate audio script: one set of words was the decision the printed
     sheet's trick box made and the captions kept, and a third version that
     could drift from both is the one thing not to build.

     The aside is dropped for Just math on screen, because it is written in the
     third person about a named friend; it is dropped here for the same reason. */
  function stepWords(step) {
    const ch = getCharacter(currentCharacter());
    const named = ch.id !== 'none';
    /* The question and its answers come last, and they are read out with the
       rest: a check a child cannot read is a check of their reading. */
    const ask = step.ask
      ? [step.ask.q, ...step.ask.options.map((o) => o.say)].join(' ') : '';
    return [step.head, step.say, named && step.aside ? step.aside : '', ask]
      .filter(Boolean).join(' ');
  }

  function sayStep() {
    if (!audioOn()) return null;
    return speak(stepWords(lesson.steps[at]), currentCharacter());
  }

  /* ONE DISPATCHER. paint(), settle() and the replay button all drew the step
     themselves, each with its own copy of the four-way branch — so a try step
     reached through settle() came out as a picture rather than as something to
     touch, and adding a stage meant remembering three places. */
  function drawStep(step, { sweep = false } = {}) {
    if (step.ask) { asked = null; }
    /* STOP WHATEVER WAS MOVING, first and unconditionally. The individual
       painters each did this, but the try branch below goes straight to the
       widget and skipped it — so arriving on "Make 10 cents" from the step that
       lays ten pennies down left the previous sweep running, and it painted its
       pennies over the coin tray a moment later. Found on the page. */
    stopSweep();
    if (step.try) {
      solved = false;
      if (kind === 'clock') { paintClock(step.show, { sweep: false }); return; }
      if (kind === 'coins') { purse = []; paintCoinTry(); return; }
      if (kind === 'bar') { shaded = new Set(); paintBar(step.show, { sweep: false }); paintBarTry(); return; }
      if (kind === 'array') { arrAt = { rows: step.show.rows, cols: step.show.cols }; paintArrayTry(); return; }
      if (kind === 'line') { lineAt = step.show.at || 0; jumps = 0; paintLineTry(); return; }
      if (kind === 'scale') { fillAt = null; paintScaleTry(); return; }
    }
    if (kind === 'clock') paintClock(step.show, { sweep });
    else if (kind === 'coins') paintCoins(step.show, { sweep });
    else if (kind === 'line') paintLine(step.show, { sweep });
    else if (kind === 'scale') paintScale(step.show, { sweep });
    else if (kind === 'bar') { paintBar(step.show, { sweep }); if (step.count) paintCells(barCells(step.show)); }
    else if (kind === 'array') { paintArray(step.show, { sweep }); if (step.count) paintCells(arrayCells(step.show)); }
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
    /* A try step's goal and feedback are cleared here for every OTHER step, so
       a goal cannot be left hanging over a figure nobody is being asked to
       touch. The stage's own paint puts them back when there is one. */
    if (!step.try) {
      const g = host.querySelector('[data-goal]');
      if (g) { g.hidden = true; g.textContent = ''; }
      const tb = host.querySelector('[data-try]');
      if (tb) { tb.hidden = true; tb.textContent = ''; tb.classList.remove('done'); }
      bar?.querySelector('.lsn-pieces')?.remove();
      stage.querySelector('[data-jumps]')?.remove();
      stage.querySelector('[data-step-pad]')?.remove();
      bar?.querySelector('.lsn-shade')?.setAttribute('opacity', '1');
    }
    drawStep(step, { sweep });
    const askBox = host.querySelector('[data-ask]');
    if (step.ask) paintAsk(step);
    else if (askBox) { askBox.hidden = true; askBox.innerHTML = ''; }
    host.querySelector('[data-back]').disabled = at === 0;
    /* Offered on every step that moves, including one reached by going Back —
       where the sweep deliberately did not run. That is the case a child is
       most likely to want it in. */
    host.querySelector('[data-replay]').hidden = !(step.sweep && at > 0);
    /* The way home from a re-teach. Cleared once the reader is back at the
       question, or has walked past it themselves — a button offering to return
       to a question they have already answered and moved on from is clutter. */
    if (returnTo != null && at >= returnTo) returnTo = null;
    const home = host.querySelector('[data-toask]');
    home.hidden = returnTo == null;
    home.textContent = returnTo == null ? '' : LESSON_TRY.backToQ;
    const next = host.querySelector('[data-next]');
    const last = at === lesson.steps.length - 1;
    next.textContent = last ? 'Done' : 'Next →';
    const close = host.querySelector('[data-close]');
    close.hidden = !last;
    close.textContent = last ? lesson.close : '';
    /* Said last, after the step is on the page. Speaking first would narrate a
       step the reader cannot see yet, and `speak` cancels whatever was being
       said — so stepping quickly through reads only the step you land on. */
    sayStep();
  }

  host.querySelector('[data-next]').addEventListener('click', () => {
    if (at < lesson.steps.length - 1) { at++; dir = 1; paint(); }
  });
  /* Turning it ON says the step you are looking at, immediately. Two reasons:
     a toggle that lights up and stays silent reads as broken, and on iOS Safari
     speech does not work at all until a user gesture has happened — so this
     press is what unlocks the rest of the lesson. */
  wireVoiceButtons(host, (on) => { if (on) sayStep(); else stopSpeaking(); });

  host.querySelector('[data-toask]').addEventListener('click', () => {
    if (returnTo == null) return;
    const k = returnTo;
    returnTo = null;
    at = k; dir = 1; paint();
  });
  host.querySelector('[data-replay]').addEventListener('click', () => {
    const step = lesson.steps[at];
    if (!step.sweep || at === 0) return;
    /* Runs the step's own animation again from its start. `dir` is left alone:
       this is not a move through the lesson, and setting it would change what
       Back does next. */
    drawStep(step, { sweep: true });
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
      drawStep(lesson.steps[at], { sweep: false });
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
    /* The stop plan, for the same reason: it is the part that can be wrong — a
       stop outside the sweep, out of order, or silently dropped — and none of
       it needs a frame to have run. */
    legsAt,
    dwellFor,
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
