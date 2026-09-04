// Warm-up routines — Illustrative Mathematics' third shape, after the book and
// the game.
//
// An IM lesson opens with a named routine, and the routine is a tiny GENERATOR
// rather than bespoke content: a number-range spec goes in, a five-minute
// opening comes out. That is the leverage a digital product has over a printed
// book, and it is recommendation #1 of the 108 in docs/SPEC.md.
//
// Two rules from IM are load-bearing here and both are enforced by
// scripts/check.mjs, because they are the whole difference between a routine and
// a warm-up worksheet:
//
//   1. A string of expressions CHANGES EXACTLY ONE THING at each step, so the
//      naive method breaks and the target strategy becomes obviously cheaper.
//      This is the perturbation ladder, and it is the most portable design rule
//      in IM.
//   2. A string always closes with a COMPARE-TWO-ITEMS question, never with
//      "any questions?". The comparison is where the strategy gets named.
//
// There is no teacher in the room, so every routine also ships the thing a
// teacher would supply: a `synthesis` — the pre-written answer to its own
// closing question. That is IM's synthesis script, stolen wholesale.
//
// A routine is a CONTAINER, not a tenth problem type. It does not go in
// content/types.js and it is not scored.

/* ------------------------------------------------------------------ ladders
   Each ladder returns four steps. Step 2 changes one thing about step 1, step 3
   changes one thing about step 1 in a different direction, and step 4 is step 3
   with step 2's change applied — which is what makes "how are 3 and 4 alike?"
   a question with an answer. */
const LADDERS = {
  /* 8+2, 8+3, 7+3, 7+4 — the make-ten string. The first of each pair lands
     exactly on ten; the second is one past it, which is the whole method. */
  'make-ten': (a) => {
    const b = 10 - a;
    return {
      target: 'Make ten, then add what is left',
      steps: [
        [a, b], [a, b + 1], [a - 1, b + 1], [a - 1, b + 2],
      ].map(([x, y]) => ({
        expr: `${x} + ${y}`, answer: x + y,
        explain: x + y === 10
          ? `${x} and ${y} make exactly ten.`
          : `${x} + ${10 - x} is ten, and ${y - (10 - x)} more makes ${x + y}.`,
      })),
      compare: [2, 3],
    };
  },

  /* 17−7, 17−8, 26−6, 26−8 — subtract to a ten, then the rest. IM's own grade-2
     string, kept to the numbers it uses. */
  'subtract-to-ten': (a) => {
    const ones = a % 10;
    return {
      target: 'Subtract down to a ten, then subtract the rest',
      steps: [
        [a, ones], [a, ones + 1], [a + 9, ones - 1 < 1 ? ones : ones - 1], [a + 9, ones + 1],
      ].map(([x, y]) => ({
        expr: `${x} − ${y}`, answer: x - y,
        explain: (x - y) % 10 === 0
          ? `Taking ${y} from ${x} lands exactly on ${x - y}.`
          : `${x} − ${x % 10} is ${x - (x % 10)}, and ${y - (x % 10)} more off makes ${x - y}.`,
      })),
      compare: [1, 3],
    };
  },
};

/* -------------------------------------------------------- properties for WODB
   Which One Doesn't Belong needs every item to be defensible — that is the
   point of the routine, and an item with no defence turns it back into a
   multiple-choice question with three wrong answers. So each of the four
   numbers must hold a property the other three do not, and the property is
   what the child's reason will be. */
const PROPS = [
  ['it is the only even one', (n) => n % 2 === 0],
  ['it is the only odd one', (n) => n % 2 === 1],
  ['it is the only one with no ones left over', (n) => n % 10 === 0],
  ['it is the only one whose two digits are the same', (n) => Math.floor(n / 10) === n % 10],
  ['it is the only one with more tens than ones', (n) => Math.floor(n / 10) > n % 10],
  ['it is the only one with more ones than tens', (n) => Math.floor(n / 10) < n % 10],
  ['it is the only one whose digits add up to ten', (n) => Math.floor(n / 10) + (n % 10) === 10],
  ['it is the only one you can split into two equal piles of tens', (n) => n % 20 === 0],
];

// The defence for each item: a property true of it and false of the other three.
function defences(quad) {
  return quad.map((n) => {
    const others = quad.filter((m) => m !== n);
    const p = PROPS.find(([, test]) => test(n) && others.every((m) => !test(m)));
    return p ? p[0] : null;
  });
}

/* Every fully defensible quadruple, worked out once at load rather than searched
   for at generation time. Searching was the first attempt and it was wrong: a
   sliding window over one shuffle tried about eighty candidates, missed on some
   seeds, and fell through to a hard-coded quadruple whose middle two items had
   no unique property at all — a Which One Doesn't Belong where two of the four
   cannot be defended is just a multiple-choice question with a wrong answer key.
   Enumerating instead means the routine cannot be undefendable for any seed,
   which is a guarantee rather than a sample.

   The four families are chosen so their signature properties rarely collide:
   a round ten, a repeated digit, an odd number with more ones than tens, and a
   pair of digits adding to ten. `defences` still has the last word. */
const QUADS = (() => {
  const tens = [30, 50, 70, 90];
  const twins = [22, 33, 44, 66, 77, 88];
  const oddTopHeavy = [];
  for (let t = 1; t <= 8; t++) {
    for (let o = t + 1; o <= 9; o++) {
      const n = t * 10 + o;
      if (n % 2 === 1) oddTopHeavy.push(n);
    }
  }
  const tenSum = [19, 28, 37, 46, 64, 73, 82, 91];
  const out = [];
  for (const a of tens) {
    for (const b of twins) {
      for (const c of oddTopHeavy) {
        for (const d of tenSum) {
          const q = [a, b, c, d];
          if (new Set(q).size !== 4) continue;
          if (defences(q).every(Boolean)) out.push(q);
        }
      }
    }
  }
  return out;
})();

export const WODB_QUAD_COUNT = QUADS.length;

export const ROUTINES = {
  'number-talk': {
    name: 'Number Talk',
    ui: 'reveal',
    blurb: 'Four of them, one at a time, in your head. Then compare two.',
    /* params: { ladder, span: [lo, hi] } */
    build(params, r) {
      const make = LADDERS[params.ladder];
      const [lo, hi] = params.span;
      const built = make(r.int(lo, hi));
      const [i, j] = built.compare;
      return {
        intro: 'Do these in your head, one at a time. No writing.',
        target: built.target,
        steps: built.steps,
        close: {
          compare: built.compare,
          prompt: `How are <strong>${built.steps[i].expr}</strong> and <strong>${built.steps[j].expr}</strong> alike, and how are they different?`,
          synthesis: `Both start from the same number. ${built.steps[j].expr} is ${
            Math.abs(built.steps[j].answer - built.steps[i].answer)} more than ${built.steps[i].expr}, so once you know one you know the other without starting again.`,
        },
      };
    },
  },

  'wodb': {
    name: "Which One Doesn't Belong?",
    ui: 'grid',
    blurb: 'Four of them. Pick the odd one out — and every one of them works.',
    /* params: { max } — the largest number allowed, so a younger grade can have
       the same routine over smaller numbers. */
    build(params, r) {
      const max = params.max ?? 99;
      const pool = QUADS.filter((q) => Math.max(...q) <= max);
      const quad = r.shuffle(r.pick(pool.length ? pool : QUADS));
      const why = defences(quad);
      return {
        intro: 'Any of these four can be the odd one out. Pick one and say why.',
        target: 'There is more than one right answer — the reason is the answer',
        items: quad.map((n, k) => ({ label: String(n), why: why[k] })),
        close: {
          prompt: 'Could somebody else have picked a different one and still been right?',
          synthesis: `Yes — all four work. ${quad.map((n, k) => `${n}: ${why[k]}`).join('. ')}.`,
        },
      };
    },
  },
};

export const ROUTINE_IDS = Object.keys(ROUTINES);
export const LADDER_COUNT = Object.keys(LADDERS).length;
export const routineById = (id) => ROUTINES[id] ?? null;

/* Build an activity's warm-up, or null if it has none. Seeded off the activity's
   seed like everything else, so a printed warm-up and the screen agree. */
export function warmUpFor(activity, r) {
  const w = activity.warmUp;
  if (!w) return null;
  const routine = ROUTINES[w.routine];
  if (!routine) return null;
  return { id: w.routine, name: routine.name, ui: routine.ui, ...routine.build(w.params ?? {}, r) };
}
