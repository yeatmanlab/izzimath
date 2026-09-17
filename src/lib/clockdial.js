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
export function dragTo(state, grab, angle, prevAngle = null) {
  const wrap = ((angle % 360) + 360) % 360;
  if (grab === 'hour') {
    /* Whole hours only. The hour hand's DISPLAYED position still comes from
       h + m/60, so it sits between two numbers whenever there are minutes on
       the clock — which is the misconception this lesson exists for, and it
       would be lost if a drag could put the hand anywhere it liked. */
    const h = Math.round(wrap / 30) % 12;
    return { h: h === 0 ? 12 : h, m: state.m };
  }
  const m = (Math.round(wrap / 6 / 5) * 5) % 60;
  let h = state.h;
  if (prevAngle != null) {
    const prev = ((prevAngle % 360) + 360) % 360;
    if (prev > 270 && wrap < 90) h = h === 12 ? 1 : h + 1;        // forward past the 12
    else if (prev < 90 && wrap > 270) h = h === 1 ? 12 : h - 1;   // and back again
  }
  return { h, m };
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
           finger; these are 14 units wide, transparent, and sit on top. They
           are only pointer targets while the step is interactive, which is what
           the .can-grab class on the wrapper decides. -->
      <line class="lsn-grab" data-grab="hour" x1="50" y1="50" x2="50" y2="26"
        stroke="transparent" stroke-width="15" stroke-linecap="round"/>
      <line class="lsn-grab" data-grab="minute" x1="50" y1="50" x2="50" y2="16"
        stroke="transparent" stroke-width="13" stroke-linecap="round"/>
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
export function pointHandsAt(wrap, h, m, ms = 0) {
  const hour = wrap.querySelector('.lsn-hour');
  const min = wrap.querySelector('.lsn-min');
  if (!hour || !min) return;
  for (const [el, ang] of [[hour, (h % 12) * 30 + m * 0.5], [min, m * 6]]) {
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.32,.06,.24,1)` : 'none';
    el.style.transformOrigin = '50px 50px';
    el.style.transform = `rotate(${ang.toFixed(2)}deg)`;
  }
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
  let grab = null;
  let last = null;
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
    grab = g.dataset.grab;
    last = angleOf(svg().getBoundingClientRect(), e.clientX, e.clientY);
    try { g.setPointerCapture(e.pointerId); } catch { /* unsupported: still works */ }
    e.preventDefault();
  };
  const move = (e) => {
    if (!grab) return;
    const a = angleOf(svg().getBoundingClientRect(), e.clientX, e.clientY);
    at = dragTo(at, grab, a, last);
    last = a;
    paint();
    e.preventDefault();
  };
  const up = () => { grab = null; last = null; };
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
