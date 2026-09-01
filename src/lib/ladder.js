/* Within-session adaptive difficulty. Recommendation 105.
   The reasoning, and why it is shaped this way, is in
   docs/next/04-adaptive-and-spacing.md.

   THE WHOLE IDEA IN ONE LINE
   Every generator already takes an index `i` and already uses it as its
   difficulty parameter — the progression comments across content/activities say
   so ("1-2 sort; 3-5 benchmark distance; 6-7 equivalence"). So each activity
   already ships a hand-authored difficulty ladder. Adaptivity is choosing which
   index to serve next instead of walking 0, 1, 2, 3 in order. No generator is
   touched.

   PURE ON PURPOSE
   Nothing here reads the DOM, a clock, or storage. `record()` is a reducer:
   (config, state, outcome) -> state. That buys three things — the checker can
   test it without a browser, state cannot leak between activities, and the same
   function works unchanged whether the state came from memory today or from an
   account later.

   NOT FOR PRINTABLES
   A sheet has to be reproducible from its seed alone; that is the invariant the
   architecture rests on. Printables walk their authored indices, forever. This
   is interactive-only.
*/

export const LADDER_V = 1;

/* Defaults, all overridable per activity.
     window  how many recent outcomes the decision looks at
     up      step up above this success rate
     down    step down below it
   The band between `down` and `up` is the hold zone, and it straddles the
   80-85% the research asks us to target. */
export const LADDER_DEFAULTS = { window: 6, up: 0.85, down: 0.7, minBeforeMove: 3, minBeforeDrop: 3 };

/* How many rungs the ladder has — and this number is not free.

   The first build ran the ladder over the raw generator indices, one step at a
   time. With a 14-round game, a 0-13 index range, and a step needing at least
   three items of evidence, a child playing perfectly reached about level 3 of 13
   and finished the game still labelled "warming up". The depth goal was
   unreachable, which defeats the entire point of making depth the goal.

   So the ladder has FOUR rungs spread across whatever range the activity
   authored, and a rung maps to an index. Four is chosen from the arithmetic
   rather than by taste: three moves at three items each is nine items, so the
   top rung is reachable inside a twelve-round game on a strong run — and only on
   a strong run, which is what makes it worth aiming at. */
export const STEPS = 4;

/* What depth is called. Never a number: a game is not a test, the items are not
   calibrated, and a number is both illegible to a child and the one quantity
   that invites comparison between children. */
export const TIERS = ['warming up', 'getting there', 'the hard ones', 'the very hard ones'];

export function ladderConfig(activity) {
  if (!activity?.adaptive) return null;
  const total = activity.rounds ?? activity.pages ?? 12;
  const from = activity.adaptive.from ?? 0;
  const to = activity.adaptive.to ?? total - 1;
  return { ...LADDER_DEFAULTS, ...activity.adaptive, from, to, id: activity.id };
}

/* Rung -> the difficulty index the generator is actually given. The rungs span
   the activity's whole authored range, so the hardest rung really is its hardest
   material rather than a fifth of the way in. */
export function indexFor(config, step) {
  const s = Math.min(STEPS - 1, Math.max(0, step));
  return config.from + Math.round((s / (STEPS - 1)) * (config.to - config.from));
}

export function initState(config) {
  return { v: LADDER_V, activityId: config.id, step: 0, level: indexFor(config, 0), history: [], seen: 0 };
}

/* One outcome in, new state out. */
export function record(config, state, ok) {
  const history = [...state.history, ok ? 1 : 0].slice(-config.window);
  const seen = state.seen + 1;
  let step = state.step;

  if (history.length >= config.minBeforeMove) {
    const rate = history.reduce((a, b) => a + b, 0) / history.length;
    if (rate > config.up) {
      step = Math.min(STEPS - 1, step + 1);
    } else if (rate < config.down && seen > config.minBeforeDrop) {
      // One miss is noise. Dropping a child down on their first mistake teaches
      // them that a mistake is expensive, which is the opposite of the point.
      step = Math.max(0, step - 1);
    }
  }

  // A rung change clears the window. Without this the same six outcomes decide
  // the next move too, and the ladder takes two or three steps on one signal —
  // which reads to a child as the game lurching rather than responding.
  return {
    ...state, step, seen,
    level: indexFor(config, step),
    history: step === state.step ? history : [],
  };
}

export const levelFor = (state) => state.level;

/* Which rung, as a name. One rung, one name — so the readout changes exactly
   when the difficulty does, and never says a number. */
export function tierFor(config, step) {
  const names = config.tiers ?? TIERS;
  const index = Math.min(names.length - 1, Math.max(0, step));
  return { name: names[index], index, of: names.length, pct: Math.round((index / (names.length - 1)) * 100) };
}

export const atTop = (state) => state.step >= STEPS - 1;

/* ---------------------------------------------------------------- the store
   The engines talk to this and never to storage. Today there is one
   implementation and it forgets everything on reload, which is currently a
   truthful thing to tell a parent. When accounts arrive, a second
   implementation with the same two methods slots in here and no engine changes.
   The records are versioned so they can be migrated, and they are the same
   records a spaced-review scheduler will later read from. */
export function memoryStore() {
  const m = new Map();
  return {
    kind: 'memory',
    get: (id) => m.get(id) ?? null,
    set: (id, state) => { m.set(id, state); return state; },
    clear: () => m.clear(),
  };
}
