// The problem type system.
//
// Deliberately small: ten types, reused by every activity. They mirror
// ROAM's own item types, so a child meets the same response formats here that
// they met in the assessment.
//
//   choice     multiple choice                  <- ALPACA multiChoice
//   input      typed answer                     <- ALPACA textboxResponse
//   numberline place a value on a line          <- ALPACA / MagPI numberLine
//   compare    which of two is larger           <- MagPI symbolic comparison
//   tap        tap exactly N objects            <- ALPACA giveN
//   ordinal    pick the Nth item                <- ALPACA selectDuck
//   bond       number bond with one part blank  (fact families)
//   truefalse  is this equation true            (IM "True or False" routine)
//   boardmove  move along a numbered board       (Siegler & Ramani linear board)
//   pick       choose among PICTURES              (clock faces, coins)
//
// `pick` is the tenth and the only one whose options are figures rather than
// text. `choice` renders its options through esc() and matches on textContent,
// so it can only ever offer words — which is why "select the clock that shows
// dinner time" needed a type of its own rather than a flag.
//
// A generator returns problems shaped like these. One renderer per type serves
// every activity, on screen and in print.

/* A bond part can be a fraction from grade 4 on, so answer checking needs the
   fraction parser. This is the file's only import; it stayed dependency-free
   while every part was a whole number. */
import { parseRaw } from '../src/lib/frac.js';

export const TYPES = ['choice', 'input', 'numberline', 'compare', 'tap', 'ordinal', 'bond', 'truefalse', 'boardmove', 'pick'];

/* An option's accessible name is the FIGURE'S OWN LABEL, pulled out of the SVG
   rather than written twice. Two reasons, and the second is the important one:

   1. It cannot drift. A hand-written `say` beside a generated clock is two
      descriptions of one picture, and the repo has been bitten by exactly that
      shape before — a figure that said one thing and answered another.
   2. It keeps the maths. If an option were labelled "half past 4" then a
      screen-reader user answering "which clock shows half past 4?" would be
      string-matching, not reading a clock. The widget labels describe the HAND
      POSITIONS, so the interpretation still has to happen. */
export const figureLabel = (svg) => (String(svg ?? '').match(/aria-label="([^"]*)"/) || [, ''])[1];

// Answer checking. Kept in one place so screen and answer key never disagree.
export function isCorrect(problem, response) {
  switch (problem.type) {
    case 'choice':
    case 'pick':
      return String(response) === String(problem.answer);
    case 'compare':
      return response === problem.answer;
    case 'truefalse':
      return Boolean(response) === Boolean(problem.answer);
    case 'tap':
    case 'ordinal':
      return Number(response) === Number(problem.answer ?? problem.n);
    case 'bond': {
      /* Number() is not enough once a part can be a fraction: Number('2/6') is
         NaN, so every fraction bond would mark wrong.

         DENOMINATOR-STRICT on purpose. 1/2 must not pass for a 3/6 blank in a
         book whose whole point is that the size of the piece does not change —
         eqF would accept it, and so would parseAnswer, which reduces. parseRaw
         keeps the written denominator. Whole numbers are unaffected: parseRaw
         returns d = 1 for them. */
      const want = parseRaw(String(problem.answer));
      const got = parseRaw(String(response));
      if (!want || !got) return false;
      return got.n === want.n && got.d === want.d;
    }
    case 'numberline': {
      const tol = problem.tolerance ?? (problem.hi - problem.lo) * 0.04;
      return Math.abs(Number(response) - problem.target) <= tol;
    }
    case 'boardmove': {
      // The child must name the squares they pass THROUGH, counting on from
      // where the token is — not "1, 2". That distinction is the entire
      // intervention: count-on produced roughly double the gains of
      // count-from-1 in Laski & Siegler (2014).
      const want = problem.answer;
      if (!Array.isArray(response) || response.length !== want.length) return false;
      return want.every((v, i) => Number(response[i]) === Number(v));
    }
    case 'input': {
      if (problem.accept === 'fraction') return null; // caller uses frac compare
      const a = String(problem.answer).trim();
      const r = String(response).trim();
      if (a === r) return true;
      const na = parseFloat(a), nr = parseFloat(r);
      return Number.isFinite(na) && Number.isFinite(nr) && Math.abs(na - nr) < 1e-9;
    }
    default:
      return false;
  }
}

// Human-readable answer, for the answer key.
export function answerText(problem) {
  switch (problem.type) {
    case 'compare': return String(problem[problem.answer]);
    case 'truefalse': return problem.answer ? 'True' : 'False';
    case 'numberline': return String(problem.targetLabel ?? problem.target);
    case 'tap': case 'ordinal': return String(problem.answer ?? problem.n);
    case 'boardmove': return problem.answer.join(', ');
    /* The key prints words, not an option id: "b" tells a grown-up marking a
       sheet nothing. `answerSay` when the generator has a tidy phrase for it,
       otherwise the winning figure's own description. */
    case 'pick': return String(problem.answerSay
      ?? figureLabel(problem.options?.find((o) => o.id === problem.answer)?.figure)
      ?? problem.answer);
    /* `answerSay` for anything else too, and only the key reads it — `isCorrect`
       still compares the response to `answer`, so this cannot affect marking on
       screen. It exists because a printed stem may hold MORE BLANKS THAN THE
       ANSWER HAS NUMBERS: `add-three-numbers` prints the two-step scaffold a
       first grader brought in, "5 + 3 + 2:  ____ + 2 = ____", where the child
       writes the running total and then the answer. One value on the key cannot
       mark two boxes, and the "printed blanks the key can fill" check says so.
       Nothing but `pick` used this field before, so honouring it here changes no
       existing output. */
    default: return String(problem.answerSay ?? problem.answer);
  }
}
