/* The badge set. Design rule and its sources: docs/BADGES.md.
   The one-line version: a badge states a fact about what the child did.

   Every badge is DERIVED. `evaluate()` is a pure function of the progress
   records, so the shelf recomputes from scratch every time and cannot drift out
   of step with the scores. Only the earning date and which character was present
   get stored.

   `test` receives:
     prog   { activityId -> progress record }  (plays, printed, pagesDone,
                                                bestRight, bestStreak, bestTier,
                                                fixes, finished)
     acts   the activity list, so a badge can ask about grades and strands
     meta   { characters: Set of character ids played with }
*/

const byId = (acts) => new Map(acts.map((a) => [a.id, a]));
const rows = (prog) => Object.values(prog || {});
const played = (prog) => rows(prog).filter((p) => p.plays > 0 || p.finished || p.pagesDone > 0);
const sum = (prog, f) => rows(prog).reduce((t, p) => t + (f(p) || 0), 0);
const strandsTouched = (prog, acts) => {
  const m = byId(acts);
  return new Set(played(prog).map((p) => m.get(p.activityId)?.strand).filter(Boolean));
};
const gradesTouched = (prog, acts) => {
  const m = byId(acts);
  return new Set(played(prog).map((p) => m.get(p.activityId)?.grade).filter(Boolean));
};
/* Top rung of the adaptive ladder is tier 3 — see src/lib/ladder.js STEPS. */
const summits = (prog) => rows(prog).filter((p) => p.bestTier >= 3).length;

export const CATEGORIES = {
  climb:   { name: 'Climbing',   glyph: '▲', hue: 'a1' },
  streak:  { name: 'Streaks',    glyph: '✦', hue: 'a2' },
  finish:  { name: 'Finishing',  glyph: '✓', hue: 'ok' },
  breadth: { name: 'Exploring',  glyph: '◈', hue: 'a3' },
  paper:   { name: 'On paper',   glyph: '▤', hue: 'a1' },
  care:    { name: 'Care taken', glyph: '◉', hue: 'ok' },
  shelf:   { name: 'The shelf',  glyph: '★', hue: 'a2' },
};

/* Ordered easiest-first within each category, because a shelf a child can see
   the front of is a shelf they will try to fill. Khan Academy's six difficulty
   levels are the same idea; ours is three, marked by `rank`. */
export const BADGES = [
  /* --- climbing the adaptive ladder: the badges that mark real skill --- */
  { id: 'first-climb', cat: 'climb', rank: 1, name: 'First Climb',
    says: 'Got past the warm-up rungs in a game.',
    test: (p) => rows(p).some((r) => r.bestTier >= 1) },
  { id: 'hard-ones', cat: 'climb', rank: 2, name: 'Into the Hard Ones',
    says: 'Reached the hard ones in a game.',
    test: (p) => rows(p).some((r) => r.bestTier >= 2) },
  { id: 'summit', cat: 'climb', rank: 3, name: 'Summit',
    says: 'Reached the very hard ones — the top rung.',
    test: (p) => summits(p) >= 1 },
  { id: 'three-summits', cat: 'climb', rank: 3, name: 'Three Summits',
    says: 'Reached the top rung in three different games.',
    test: (p) => summits(p) >= 3 },
  { id: 'every-summit', cat: 'climb', rank: 3, name: 'Every Summit',
    says: 'Reached the top rung in every game that has one.',
    test: (p, acts) => summits(p) >= acts.filter((a) => a.adaptive).length },

  /* --- streaks: within one run, so they are about holding it together --- */
  { id: 'streak-5', cat: 'streak', rank: 1, name: 'Five in a Row',
    says: 'Five right without a miss.',
    test: (p) => rows(p).some((r) => r.bestStreak >= 5) },
  { id: 'streak-10', cat: 'streak', rank: 2, name: 'Ten in a Row',
    says: 'Ten right without a miss.',
    test: (p) => rows(p).some((r) => r.bestStreak >= 10) },
  { id: 'streak-15', cat: 'streak', rank: 3, name: 'Unbroken',
    says: 'Fifteen right without a miss.',
    test: (p) => rows(p).some((r) => r.bestStreak >= 15) },

  /* --- care taken: the behaviour most worth reinforcing --- */
  { id: 'second-look', cat: 'care', rank: 1, name: 'Second Look',
    says: 'Went back and fixed a wrong answer.',
    test: (p) => sum(p, (r) => r.fixes) >= 1 },
  { id: 'second-look-10', cat: 'care', rank: 2, name: 'Worth Checking',
    says: 'Went back and fixed ten answers.',
    test: (p) => sum(p, (r) => r.fixes) >= 10 },

  /* --- finishing what you started --- */
  { id: 'first-book', cat: 'finish', rank: 1, name: 'Book Finished',
    says: 'Worked all the way to the end of a book.',
    test: (p) => rows(p).some((r) => r.finished) },
  { id: 'five-books', cat: 'finish', rank: 2, name: 'Five Books',
    says: 'Finished five different books.',
    test: (p) => rows(p).filter((r) => r.finished).length >= 5 },
  { id: 'grade-of-books', cat: 'finish', rank: 3, name: 'A Whole Grade',
    says: 'Finished every book in one grade.',
    test: (p, acts) => {
      const m = byId(acts);
      const done = new Set(rows(p).filter((r) => r.finished).map((r) => r.activityId));
      const grades = [...new Set(acts.map((a) => a.grade))];
      return grades.some((g) => {
        const books = acts.filter((a) => a.grade === g && a.kind === 'book');
        return books.length > 0 && books.every((b) => done.has(b.id));
      });
    } },

  /* --- exploring: breadth, which volume badges cannot buy --- */
  { id: 'three-strands', cat: 'breadth', rank: 1, name: 'Three Corners',
    says: 'Tried three different kinds of maths.',
    test: (p, acts) => strandsTouched(p, acts).size >= 3 },
  { id: 'strand-sweep', cat: 'breadth', rank: 2, name: 'Every Corner',
    says: 'Tried every kind of maths in one grade.',
    test: (p, acts) => {
      const touched = strandsTouched(p, acts);
      const grades = [...new Set(acts.map((a) => a.grade))];
      return grades.some((g) => {
        const st = [...new Set(acts.filter((a) => a.grade === g).map((a) => a.strand))];
        return st.length > 0 && st.every((s) => touched.has(s));
      });
    } },
  { id: 'every-grade', cat: 'breadth', rank: 3, name: 'All the Way Up',
    says: 'Did something in every grade, Kindergarten to fifth.',
    test: (p, acts) => gradesTouched(p, acts).size >= new Set(acts.map((a) => a.grade)).size },
  { id: 'three-friends', cat: 'breadth', rank: 2, name: 'Three Friends',
    says: 'Played with Kiwi, Georgie and Flame.',
    test: (p, acts, meta) => ['kiwi', 'georgie', 'flame'].every((c) => meta?.characters?.has(c)) },

  /* --- on paper: the half of this site that is not a screen --- */
  { id: 'printer', cat: 'paper', rank: 1, name: 'Off the Screen',
    says: 'Printed a sheet to do on paper.',
    test: (p) => sum(p, (r) => r.printed) >= 1 },
  { id: 'ten-sheets', cat: 'paper', rank: 2, name: 'Ten Sheets',
    says: 'Printed ten sheets.',
    test: (p) => sum(p, (r) => r.printed) >= 10 },
  { id: 'both-ways', cat: 'paper', rank: 2, name: 'Both Ways',
    says: 'Did the same activity on screen and on paper.',
    test: (p) => rows(p).some((r) => r.printed > 0 && (r.plays > 0 || r.finished)) },

  /* --- milestones. Only two count raw totals, and they are not the point. --- */
  { id: 'hundred-right', cat: 'shelf', rank: 2, name: 'A Hundred Right',
    says: 'A hundred problems answered correctly.',
    test: (p) => sum(p, (r) => r.rightTotal) >= 100 },
  { id: 'five-hundred-right', cat: 'shelf', rank: 3, name: 'Five Hundred Right',
    says: 'Five hundred problems answered correctly.',
    test: (p) => sum(p, (r) => r.rightTotal) >= 500 },

  /* --- the shelf itself: set completion, about your own set only ---
     These two count the OTHER badges, so their thresholds are measured against
     the non-meta count rather than the total. Testing against BADGES.length made
     "The Whole Shelf" need more badges than could exist — it was unreachable,
     and a shelf with a slot that can never fill is worse than a smaller shelf. */
  { id: 'half-shelf', cat: 'shelf', rank: 2, name: 'Half the Shelf',
    says: 'Collected half the badges.',
    test: (p, acts, meta) => (meta?.earnedCount ?? 0) * 2 >= NON_META_COUNT },
  { id: 'full-shelf', cat: 'shelf', rank: 3, name: 'The Whole Shelf',
    says: 'Collected every other badge there is.',
    test: (p, acts, meta) => (meta?.earnedCount ?? 0) >= NON_META_COUNT },
];

/* The badges that are not about badges. */
export const META_BADGES = new Set(['half-shelf', 'full-shelf']);
const NON_META_COUNT = BADGES.filter((b) => !META_BADGES.has(b.id)).length;

export const BADGE_COUNT = BADGES.length;
export const badgeById = (id) => BADGES.find((b) => b.id === id) ?? null;

/* Which badges the records say are earned. Pure, and ordered as BADGES is.

   The two shelf badges depend on how many OTHERS are earned, so the pass runs
   twice: once without them to get the count, then once with it. Without that,
   "half the shelf" could never fire on the run that completed it. */
export function evaluate(prog, acts, meta = {}) {
  const base = BADGES.filter((b) => !META_BADGES.has(b.id))
    .filter((b) => safe(b, prog, acts, meta));
  const withCount = { ...meta, earnedCount: base.length };
  return BADGES.filter((b) => safe(b, prog, acts, withCount)).map((b) => b.id);
}

function safe(b, prog, acts, meta) {
  try { return !!b.test(prog, acts, meta); } catch { return false; }
}
