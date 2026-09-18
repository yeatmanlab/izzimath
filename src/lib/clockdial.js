/* The clock dial you can move with a finger.
 *
 * ONE IMPLEMENTATION, TWO PLACES IT IS USED. The lesson at /learn/time/ hands
 * the clock over on three of its steps; the hint button on a clock question in
 * a book offers the same object. They were going to be two dials with two
 * copies of the drag arithmetic, and the second copy would have been the one
 * that was subtly wrong — so the dial, the grab targets and the sums all live
 * here and both callers import them.
 *
 * WHY THE HINT WANTS A CLOCK AT ALL, AND WHY IT IS FREE PLAY
 * The hint work on the clock activities gave a stuck child a labelled dial to
 * LOOK at. That closed half the gap: they could see that the 6 means thirty
 * minutes, but nothing connected a hand position to the digits they were being
 * asked for. Here they move the hands themselves and watch the digital face
 * change, which is the coupling the whole lesson is about.
 *
 * No goal and no right answer in the hint. The question on the page already has
 * one, and a widget that set its own target would be a second question asked of
 * a child who has just said they are stuck. It starts at 12:00 rather than at
 * the question's time, so the first thing it does is not hand over the answer.
 */

import { clockFace, clockDigital } from './widgets.js';

/* ------------------------------------------------- setting the clock by hand
   THE ARITHMETIC OF A DRAG, as a pure function, and that is deliberate: it is
   the part that can be wrong, and a pointer gesture is the one thing a test
   cannot fake convincingly. Given where the clock is, which hand is held, and
   where the pointer has got to, this says where the clock is now.

   `snap` is five minutes because that is the dial's own granularity and because
   a six-year-old aiming a finger at one minute in sixty will never hit it. It
   is also the unit the lesson has just spent an animation teaching.

   THE HOUR CARRIES WHEN THE LONG HAND PASSES THE 12, forwards or backwards,
   which is the whole relationship the lesson is about — and here the child
   discovers it with a finger rather than being told. Detected from the previous
   angle rather than from the minute value: at the boundary the minutes go 55 to
   0, which is indistinguishable from dragging backwards from 5 to 0 unless you
   know which way the pointer travelled.

   Exported for the harness, where it can be walked round the dial without a
   pointer, a frame or a layout. */
export function dragTo(state, grab, angle) {
  const wrap = ((angle % 360) + 360) % 360;
  /* Whole hours only. The hour hand's DISPLAYED position still comes from
     h + m/60, so it sits between two numbers whenever there are minutes on the
     clock — which is the misconception this lesson exists for, and it would be
     lost if a drag could put the hand anywhere it liked. */
  const h = Math.round(wrap / 30) % 12;
  return { h: h === 0 ? 12 : h, m: state.m };
}

/* How far from the middle the pointer is, as a fraction of the dial's width.
   Inside the pivot the angle means nothing, so a drag there moves nothing —
   which is also how a real clock behaves under a finger. */
export function radiusOf(rect, x, y) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.hypot(x - cx, y - cy) / (rect.width || 1);
}
export const DEAD_ZONE = 0.07;

/* ------------------------------------------- the long hand, as TRAVEL
   THE HOUR CARRIES WHEN THE LONG HAND PASSES THE 12, and working that out by
   watching for the angle to cross zero does not work. A pointer that drifts a
   hair to the left of the vertical takes the angle from 0 to 359.1, which is a
   move of nine tenths of a degree and reads as a full crossing backwards. A
   deterministic dial at 12:00, dragged from the top to the lower left, came
   out as 11:35 — and two earlier guards, a dead zone and a plausibility cap on
   the step size, caught neither that nor each other's cases.

   So the hand is tracked as TRAVEL instead: minutes since twelve o'clock on a
   12-hour dial, moved by the shortest arc between one pointer sample and the
   next. A wobble across the 12 contributes +0.9 and then -0.9 and nets to
   nothing. A real lap accumulates 360 degrees and carries exactly once. There
   is no boundary to detect, which is why there is nothing left to get wrong.

   The total is kept CONTINUOUS and snapped only for display, or the rounding
   would eat the accumulated travel a fifth of a minute at a time. */
export const TOTAL_MAX = 720;              // minutes on a 12-hour dial

export const totalOf = (h, m) => ((((h % 12) * 60 + m) % TOTAL_MAX) + TOTAL_MAX) % TOTAL_MAX;

export function timeOf(total) {
  const t = ((total % TOTAL_MAX) + TOTAL_MAX) % TOTAL_MAX;
  /* Snapped on the TOTAL rather than on the minutes, so 58 minutes rounds to
     the next hour instead of to 0 minutes of the same one. */
  const snapped = (Math.round(t / 5) * 5) % TOTAL_MAX;
  const h = Math.floor(snapped / 60) % 12;
  return { h: h === 0 ? 12 : h, m: snapped % 60 };
}

/* The shortest way round from one angle to the next, signed. Two samples of a
   real drag are never more than a few degrees apart, so the shortest arc is
   always the one the pointer actually travelled. */
export function shortestArc(from, to) {
  const d = (((to - from) % 360) + 360) % 360;
  return d > 180 ? d - 360 : d;
}

/* One pointer sample's worth of the long hand. Six degrees to the minute. */
export const dragMinute = (total, angle, prevAngle) =>
  total + shortestArc(prevAngle, angle) / 6;

/* ------------------------------------------------------------ one drag
   THE CONTROLLER BOTH CALLERS USE, because the logic that was wrong lived in
   two copies of a handler and the second copy is always the one that keeps a
   bug. It holds the continuous total, the last accepted angle, and one more
   thing that turned out to matter more than either.

   CROSSING THE PIVOT BREAKS THE TRAVEL CHAIN. Ignoring the samples inside the
   dead zone is not enough: the last angle before the middle and the first one
   after it are most of a half-turn apart, and read as travel that is thirty
   spurious minutes. A drag from the top of the dial to the lower left came out
   an hour and twenty-five minutes behind. So going through the middle LIFTS the
   drag — the next sample outside re-seeds the angle and contributes no travel
   at all, which is what passing the pivot actually did.

   That also lets the arc guard go. Capping a sample at 150 degrees stopped a
   fast flick of the mouse from moving the hand at all, and with the chain
   broken at the pivot there is nothing left for it to catch. */
export function makeDrag() {
  let grab = null, total = 0, last = null, lifted = false;
  return {
    get grab() { return grab; },
    start(which, state, angle) {
      grab = which;
      total = totalOf(state.h, state.m);
      last = angle;
      lifted = false;
    },
    /* Returns the new time, or null when this sample changes nothing. */
    move(state, angle, radius) {
      if (!grab) return null;
      if (radius < DEAD_ZONE) { lifted = true; return null; }
      if (lifted) { last = angle; lifted = false; return null; }
      let next;
      if (grab === 'minute') {
        total = dragMinute(total, angle, last);
        next = timeOf(total);
      } else {
        next = dragTo(state, grab, angle);
        total = totalOf(next.h, next.m);
      }
      last = angle;
      return next;
    },
    end() { grab = null; last = null; lifted = false; },
  };
}



/* Where a pointer is, as an angle from the 12, clockwise. The rect is the
   drawn box of the dial, so this works whatever size it has been laid out at. */
export function angleOf(rect, x, y) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const deg = Math.atan2(x - cx, cy - y) * 180 / Math.PI;
  return ((deg % 360) + 360) % 360;
}

/* ---------------------------------------------------------------- the clock
   Built by hand rather than through clockFace(), because that returns a string
   and this needs to keep hold of the two hand elements to re-point them. The
   face itself is clockFace with its hands stripped, so the dial, the ticks and
   the numerals stay in one place. */
export function clockStage({ size = 240, minutes = false } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'lsn-clock';
  const face = clockFace(12, 0, { size, minutes })
    .replace(/<line x1="50" y1="50"[\s\S]*?\/>/g, '')          // drop the two hands
    .replace('</svg>', `
      <line class="lsn-hand lsn-hour" x1="50" y1="50" x2="50" y2="26"
        stroke="var(--a1)" stroke-width="4.6" stroke-linecap="round"/>
      <line class="lsn-hand lsn-min" x1="50" y1="50" x2="50" y2="16"
        stroke="var(--a1)" stroke-width="2.4" stroke-linecap="round"/>
      <!-- GRAB TARGETS, invisible and fat. A hand drawn at 2.4 units is about
           six pixels on screen, which no six-year-old is going to hit with a
           finger, so these are 18 units wide and transparent.

           THEY ROTATE WITH THEIR HANDS, and the first version did not: they
           were drawn pointing at the 12 and only the visible hands ever got a
           transform, so the hands moved and the targets stayed at the top of
           the dial. A mouse worked on the 12 and nowhere else. See
           setHandAngles, which moves a hand and its target together for exactly
           this reason.

           NO BACKTICKS IN HERE. This comment is inside a template literal, so a
           backtick ends the string and turns whatever follows into an
           expression — which is how this very comment broke the widget the
           first time, with node --check perfectly happy because the result is
           still valid JavaScript. It is the second time that trap has been hit
           in this repo.

           AND THEY DO NOT OVERLAP. Both used to start at the centre, so the
           minute hand's target lay on top of the hour hand's along its whole
           length and the short hand was almost unhittable whenever the two
           pointed the same way. The hour owns the inner half of the dial, the
           minute owns the outer — which is also the intuitive split, because
           beyond the short hand's tip the long hand is the only one there.

           BUTT CAPS, NOT ROUND. A round cap extends a line by HALF ITS STROKE
           WIDTH past each endpoint, so at 18 units wide these two still
           overlapped by nine units at the join even after the spans were made
           adjacent — and the minute target, drawn second, won there. A real
           mouse aimed at the short hand got the long one, which then carried
           the hour as the pointer passed the pivot and turned "make it 8
           o'clock" into 11:40. An invisible target has no use for a rounded
           end. -->
      <line class="lsn-grab" data-grab="hour" x1="50" y1="50" x2="50" y2="25"
        stroke="transparent" stroke-width="18" stroke-linecap="butt"/>
      <line class="lsn-grab" data-grab="minute" x1="50" y1="25" x2="50" y2="9"
        stroke="transparent" stroke-width="18" stroke-linecap="butt"/>
      <circle cx="50" cy="50" r="3" fill="var(--a1)"/></svg>`);
  wrap.innerHTML = face;
  /* The dial's own label described hands this SVG no longer has. The live time
     is announced from the caption region instead, which is where a reader is
     already being told what to look at. */
  wrap.querySelector('svg')?.setAttribute('aria-hidden', 'true');
  return wrap;
}

/* ------------------------------------------------------------- the digital face
   Built ONCE and re-lettered, for exactly the reason the analog dial is: during
   a sweep it has to change every frame from the same number as the hands, and
   re-rendering the SVG sixty times a second to move four characters is waste
   that also throws away the element every test holds on to.

   It used to be rendered from `show.h`/`show.m` — the step's FINAL time — so
   through the whole sweep the digital clock sat on the answer while the hands
   travelled to it. Two faces of one clock disagreeing is the precise thing this
   player exists to prevent, and it was doing it on the step that shows a child
   what a digital clock is.

   `aria-hidden`, like the dial, because the label would be a frame behind the
   digits it describes. The settled time is announced from [data-readsay]. */
export function digitalStage({ size = 150 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'lsn-digital';
  /* THE GOAL SITS DIRECTLY ABOVE THE DIGITAL FACE, which is where it was asked
     for and where it belongs: the two numbers a child is comparing — what I am
     aiming for, what the clock says now — should be one glance apart, not one
     at the top of the page and one at the bottom. */
  wrap.innerHTML = `<p class="lsn-goal" data-goal hidden></p>${clockDigital(12, 0, { size })}`;
  wrap.querySelector('svg')?.setAttribute('aria-hidden', 'true');
  wrap.querySelector('svg')?.removeAttribute('role');
  wrap.querySelector('svg')?.removeAttribute('aria-label');
  return wrap;
}


/* ------------------------------------------------ hands and digits, directly
   From a clock time rather than from accumulated minutes. The lesson's sweeps
   accumulate so a run always goes forward; under a finger the hands should
   point where the clock says and nowhere else. The hour hand still comes from
   h AND m, so it sits between two numbers the moment there are minutes on it —
   the misconception, kept. */
/* THE ONE PLACE A HAND MOVES, and it moves the hand's GRAB TARGET with it.

   Four elements, two angles, one loop — because the bug this exists to prevent
   was two of those elements being left behind. The targets were drawn pointing
   at the 12 and only the visible hands were ever rotated, so a mouse could
   grab a hand at twelve o'clock and nowhere else. Anything that re-points a
   hand goes through here; the lesson's accumulating sweep calls it with its own
   angles. */
export function setHandAngles(wrap, hourAng, minAng, ms = 0) {
  if (!wrap) return;
  const pairs = [
    ['.lsn-hour', hourAng], ['[data-grab="hour"]', hourAng],
    ['.lsn-min', minAng], ['[data-grab="minute"]', minAng],
  ];
  for (const [sel, ang] of pairs) {
    const el = wrap.querySelector(sel);
    if (!el) continue;
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
    el.style.transformOrigin = '50px 50px';
    el.style.transform = `rotate(${ang.toFixed(2)}deg)`;
  }
}

/* The hour hand's angle comes from h AND m, so it sits between two numbers the
   moment there are minutes on the clock — the misconception, kept. */
export const handAngles = (h, m) => ({ hour: (h % 12) * 30 + m * 0.5, minute: m * 6 });

export function pointHandsAt(wrap, h, m, ms = 0) {
  const a = handAngles(h, m);
  setHandAngles(wrap, a.hour, a.minute, ms);
}

export const timeText = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;

/* ---------------------------------------------------- the standalone widget
   What the hint button mounts: a dial with the minutes written round it, two
   hands you can drag, and a digital face that follows them. Free play — see the
   header for why it has no goal.

   Returns the current time and a `destroy`, so a caller can read the state in a
   test and take the listeners away when the box closes. */
export function mountTryClock(host, { h = 12, m = 0, size = 210, say = '' } = {}) {
  let at = { h, m };
  const drag = makeDrag();
  const dial = clockStage({ size, minutes: true });
  dial.classList.add('can-grab');
  const digits = digitalStage({ size: 120 });
  /* The digital stage carries the lesson's goal slot, and this widget has no
     goal — see the header. Taken out rather than left hidden, so "does it set a
     target of its own" has an honest answer in the DOM. */
  digits.querySelector('[data-goal]')?.remove();
  const wrap = document.createElement('div');
  wrap.className = 'trycl';
  wrap.appendChild(dial);
  wrap.appendChild(digits);
  const note = document.createElement('p');
  note.className = 'trycl-say';
  note.textContent = say;
  host.appendChild(wrap);
  if (say) host.appendChild(note);

  const paint = () => {
    pointHandsAt(dial, at.h, at.m, 0);
    const t = digits.querySelector('text');
    if (t) t.textContent = timeText(at.h, at.m);
  };
  paint();

  const svg = () => dial.querySelector('svg');
  const down = (e) => {
    const g = e.target.closest?.('[data-grab]');
    if (!g) return;
    const box = svg().getBoundingClientRect();
    drag.start(g.dataset.grab, at, angleOf(box, e.clientX, e.clientY));
    try { g.setPointerCapture(e.pointerId); } catch { /* unsupported: still works */ }
    e.preventDefault();
  };
  const move = (e) => {
    if (!drag.grab) return;
    const box = svg().getBoundingClientRect();
    const next = drag.move(at, angleOf(box, e.clientX, e.clientY),
      radiusOf(box, e.clientX, e.clientY));
    if (next) { at = next; paint(); }
    e.preventDefault();
  };
  const up = () => drag.end();
  dial.addEventListener('pointerdown', down);
  dial.addEventListener('pointermove', move);
  dial.addEventListener('pointerup', up);
  dial.addEventListener('pointercancel', up);

  return {
    get at() { return { ...at }; },
    get reads() { return timeText(at.h, at.m); },
    destroy() {
      dial.removeEventListener('pointerdown', down);
      dial.removeEventListener('pointermove', move);
      dial.removeEventListener('pointerup', up);
      dial.removeEventListener('pointercancel', up);
      wrap.remove();
      note.remove();
    },
  };
}
