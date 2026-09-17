/* How long a lesson takes, and the one place the timing numbers live.
 *
 * WHY A SHARED MODULE RATHER THAN CONSTANTS IN THE PLAYER
 * The lessons index used to advertise "Time · 18 steps", which is true and
 * useless: a step count tells a parent nothing about whether this is a
 * two-minute detour or a course, and on a page headed "Short lessons" a count
 * of 18 reads as the second one. What a parent wants is minutes.
 *
 * An estimate is only worth showing if it cannot drift from the thing it is
 * estimating, so the player imports its sweep and dwell durations FROM HERE
 * rather than keeping its own. Change a duration and the advertised time
 * changes with it, in the same commit.
 *
 * WHAT IS BEING ESTIMATED, honestly:
 *   reading    the words, at 150 a minute. Slower than an adult reads, faster
 *              than a six-year-old sounds out — it is the pace the read-aloud
 *              speaks at, and a child reading it themselves will take longer.
 *   animation  the real leg durations, from the content's own plan in
 *              content/lessons.js, plus the real dwell at every pause.
 *   doing      a flat allowance per interactive step and per question. A child
 *              dragging the hands to 9:30 might take ten seconds or ninety, and
 *              there is no honest way to predict which — so it is deliberately
 *              a small fixed number.
 *
 * Which makes the figure a FLOOR, and that is why the copy says "about".
 * Rounded to whole minutes, never below one: "about 40 seconds" would invite a
 * precision this cannot support.
 */

import { lessonLegs, lessonSpan } from '../../content/lessons.js';

/* The player's own durations. Both were inline in src/mount/lesson.js; they are
   here so the estimate and the animation cannot disagree. */
export const sweepMs = (units) => Math.max(1400, Math.min(7000, Math.abs(units) * 140));
export const coinMs = (units) => Math.max(1000, Math.abs(units) * 260);
/* A step that does not sweep still slides its figure on a CSS transition. */
export const SETTLE_MS = 900;

const words = (t) => String(t || '').split(/\s+/).filter(Boolean).length;

export const dwellFor = (say) => Math.max(1800, Math.min(4200, 400 + words(say) * 260));

export const READ_MS_PER_WORD = 400;      // 150 words a minute
export const DO_MS = 12000;               // a turn at the figure
export const ASK_MS = 9000;               // reading a question and picking

/* One animated step, walked the way the player walks it: each leg's own
   duration from where the leg before it ended, plus the dwell at every pause
   but the last. */
function animationMs(lesson, k) {
  const legs = lessonLegs(lesson, k);
  if (!legs.length) return SETTLE_MS;
  const [from] = lessonSpan(lesson, k) ?? [0, 0];
  const ms = lesson.kind === 'coins' ? coinMs : sweepMs;
  let total = 0;
  legs.forEach((leg, i) => {
    total += ms(leg.cum - (i === 0 ? from : legs[i - 1].cum));
    if (i < legs.length - 1) total += leg.dwell ?? dwellFor(leg.say);
  });
  return total;
}

export function lessonMs(lesson) {
  let ms = words(lesson.lead) * READ_MS_PER_WORD + words(lesson.close) * READ_MS_PER_WORD;
  lesson.steps.forEach((st, k) => {
    ms += words(`${st.head} ${st.say} ${st.aside || ''}`) * READ_MS_PER_WORD;
    ms += st.sweep ? animationMs(lesson, k) : SETTLE_MS;
    if (st.try) ms += DO_MS;
    if (st.ask) {
      ms += ASK_MS + words(st.ask.q) * READ_MS_PER_WORD;
      for (const o of st.ask.options || []) ms += words(o.say) * READ_MS_PER_WORD;
    }
  });
  return ms;
}

export const lessonMinutes = (lesson) => Math.max(1, Math.round(lessonMs(lesson) / 60000));

/* The words on the card. "about" is load-bearing: this is a floor, and a child
   who stops to play with the clock will take longer — which is the point of the
   clock. */
export const lessonTime = (lesson) => {
  const m = lessonMinutes(lesson);
  return `about ${m} minute${m === 1 ? '' : 's'}`;
};
