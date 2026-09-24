/* The parent report — what a child has done here, and what to do next.
 *
 * WHAT THIS IS, AND MORE IMPORTANTLY WHAT IT IS NOT
 * A parent asked for something that "walks parents through their child's
 * knowledge and gaps and what they should be working on". That is the right
 * thing to want and the wrong thing to over-promise, so the line this module
 * walks is worth stating before any of the code:
 *
 *   It reports what happened ON THIS SITE. Nothing else. It is a record of
 *   practice, not an assessment, and the difference is not a disclaimer — it
 *   changes what may be computed. A child who has never opened the fractions
 *   book has no fraction record here, and that is NOT evidence they cannot do
 *   fractions. So an untouched strand is reported as untouched, never as a
 *   weakness, and `VERDICTS.none` exists to keep those two apart.
 *
 * NO PERCENTILE, NO GRADE LEVEL, NO COMPARISON
 * /parents/ already tells the reader, as its sixth point, that there are no
 * leaderboards or percentiles here on purpose, because maths anxiety is real
 * and comparison does not reduce it. A report bolted onto the top of that page
 * may not contradict it. So nothing here ranks a child against anybody, and
 * there is no "working at grade 2" sentence anywhere — the site does not know
 * the child's age and could not honestly say it if it did.
 *
 * COUNTS, NOT PERCENTAGES. "14 of 20" and not "70%". The ratio is what decides
 * the band internally, but a percentage on screen reads as a mark out of a
 * hundred, gets repeated to the child, and is the most score-like way to say
 * the least useful version of the same fact.
 *
 * THE FLOOR IS THE WHOLE DESIGN
 * One wrong answer out of two is fifty per cent and means nothing. Almost every
 * bad version of this feature comes from putting a confident label on four
 * items, so no verdict is given below FLOOR items — the honest answer is "not
 * enough yet", and it is a state with its own copy rather than a blank.
 *
 * THE THRESHOLDS ARE THE LADDER'S, NOT NEW ONES
 * `up` and `down` are imported from src/lib/ladder.js, which is the same pair
 * the adaptive difficulty uses to decide whether to make the questions harder
 * or easier. So "solid" here means exactly "the ladder would have stepped this
 * child up", and the report cannot drift from the thing it is reporting on. The
 * band between them is the hold zone straddling the 80-85% the research asks us
 * to target, which is why the middle band's advice is "this is the right place
 * to be practising" rather than a warning.
 *
 * PURE ON PURPOSE, exactly like ladder.js. Nothing here reads the DOM, a clock
 * or storage: (activities, progress) -> report. So scripts/check.mjs can feed
 * it invented progress and assert the verdicts with no browser, which is the
 * only way to test a judgement rather than a rendering.
 */

import { LADDER_DEFAULTS } from '../src/lib/ladder.js';
import { DOSE } from './roam.js';

export const REPORT_V = 1;

/* Below this many answered questions, no verdict. Eight is two thirds of a
   twelve-round game or one short book: enough that one unlucky question cannot
   swing the label, few enough that a single sitting can earn one. */
export const FLOOR = 8;

/* Straight from the ladder, so the report and the difficulty agree. */
export const SOLID_AT = LADDER_DEFAULTS.up;    // 0.85
export const COMING_AT = LADDER_DEFAULTS.down; // 0.70

/* `dose` names a row of content/roam.js's DOSE table rather than copying its
   numbers, because those minutes came out of the early-numeracy metaregression
   and there must be one copy of them. The mapping is the obvious one: a skill
   that needs a hand gets the most practice. */
export const VERDICTS = {
  solid: {
    id: 'solid', label: 'Solid', rank: 3, dose: 'ach',
    means: 'Getting these right nearly every time.',
    doNext: 'Nothing to fix. One printed sheet a week keeps it warm.',
  },
  coming: {
    id: 'coming', label: 'Coming along', rank: 2, dose: 'dev',
    means: 'Getting most of these right, and missing some.',
    doNext: 'This is the right place to be practising. Keep going here.',
  },
  hand: {
    id: 'hand', label: 'Needs a hand', rank: 1, dose: 'need',
    means: 'Missing more than a few of these.',
    doNext: 'Sit with them for this one. Read the working out loud after each answer.',
  },
  thin: {
    id: 'thin', label: 'Not enough yet', rank: 4, dose: null,
    means: `Fewer than ${FLOOR} questions answered, which is too few to say anything.`,
    doNext: 'Another go at it would make this line mean something.',
  },
  /* Played, but before the site counted how many it asked. NOT the same as
     "not started", and getting that wrong was the first real bug in here: a
     child with fifteen sittings and 105 right answers behind them read as
     "Not started" on every line, which is the most misleading thing this page
     could possibly say to a parent. One more go writes a real denominator. */
  old: {
    id: 'old', label: 'Played before we counted', rank: 4.5, dose: null,
    means: 'Done, but from before the site kept track of how many it asked.',
    doNext: 'One more go at it and this line will say how it went.',
  },
  none: {
    id: 'none', label: 'Not started', rank: 5, dose: null,
    means: 'Never opened. That is not the same as being bad at it.',
    doNext: 'Worth a try if it is on their grade.',
  },
};

export const VERDICT_IDS = Object.keys(VERDICTS);

/* Ordered worst-first, which is the order a parent wants to read them in. The
   two no-evidence states sort last because they are not findings. */
export const readingOrder = ['hand', 'coming', 'solid', 'thin', 'old', 'none'];

export const doseFor = (verdictId) => {
  const key = VERDICTS[verdictId]?.dose;
  return key ? DOSE[key] : null;
};

/* ------------------------------------------------------------------ verdict
   The one judgement in the whole module, over one pooled pair of counts.

   `asked === 0 && right > 0` is not a perfect score, it is a profile written
   before askedTotal existed: the store kept the numerator for badges and never
   kept a denominator. Dividing there would report every such child as flawless,
   which is the worst possible failure for a page a parent makes decisions from.
   It reads as no evidence, because that is what it is. */
export function verdictOf({ right = 0, asked = 0 } = {}) {
  if (!asked) return VERDICTS.none;
  if (asked < FLOOR) return VERDICTS.thin;
  const rate = right / asked;
  if (rate >= SOLID_AT) return VERDICTS.solid;
  if (rate >= COMING_AT) return VERDICTS.coming;
  return VERDICTS.hand;
}

/* True when a record has a numerator and no denominator — the shape a profile
   from before this feature has. Surfaced so the page can say so once, rather
   than showing a child's whole history as "not started". */
export const isLegacy = (p) => !!p && !p.askedTotal && (p.rightTotal > 0 || p.plays > 0 || p.finished);

const countsOf = (p) => ({ right: p?.rightTotal || 0, asked: p?.askedTotal || 0 });

const pool = (rows) => rows.reduce((a, r) => ({
  right: a.right + r.counts.right, asked: a.asked + r.counts.asked,
}), { right: 0, asked: 0 });

/* --------------------------------------------------------------- the report
   `activities` is the whole catalogue; `progress` is the map allProgress()
   returns, keyed by activity id. Both are plain data, so this runs anywhere. */
export function reportFor({ activities = [], progress = {} } = {}) {
  const rows = activities.map((a) => {
    const p = progress[a.id] || null;
    const counts = countsOf(p);
    return {
      id: a.id, title: a.title, kind: a.kind, grade: a.grade, strand: a.strand,
      lesson: a.lesson || null,
      href: `/${a.kind === 'game' ? 'games' : 'books'}/${a.id}/`,
      counts,
      plays: p?.plays || 0,
      finished: !!p?.finished,
      tier: p?.bestTier || 0,
      fixes: p?.fixes || 0,
      lastAt: p?.lastAt || null,
      legacy: isLegacy(p),
      /* The override, rather than a branch inside verdictOf(): that function is
         pure over two counts and must stay that way, because it is the one
         piece of judgement here and the checker tests it on numbers alone. */
      verdict: isLegacy(p) ? VERDICTS.old : verdictOf(counts),
    };
  });

  const touched = rows.filter((r) => r.plays > 0 || r.finished || r.counts.asked > 0 || r.legacy);
  const totals = pool(rows);

  /* Which grades they have actually been working in. Used to decide which
     untouched strands count as a GAP: an untouched grade-5 strand is not a gap
     for a first grader, it is the rest of school. */
  const gradeUse = new Map();
  for (const r of touched) gradeUse.set(r.grade, (gradeUse.get(r.grade) || 0) + 1);
  const workingGrades = [...gradeUse.keys()].sort();

  /* Grade -> strand -> rows, keeping only the grades they have touched. A
     report listing all six grades is a catalogue, not a report. */
  const grades = workingGrades.map((grade) => {
    const inGrade = rows.filter((r) => r.grade === grade);
    const byStrand = new Map();
    for (const r of inGrade) {
      if (!byStrand.has(r.strand)) byStrand.set(r.strand, []);
      byStrand.get(r.strand).push(r);
    }
    const strands = [...byStrand.entries()].map(([strand, list]) => {
      const counts = pool(list);
      /* A strand with real counts is judged on them even if one activity in it
         predates the denominator — some evidence beats none. It only reads as
         `old` when that is ALL there is. */
      const stale = !counts.asked && list.some((r) => r.legacy);
      return {
        strand, counts, stale,
        verdict: stale ? VERDICTS.old : verdictOf(counts),
        rows: list.slice().sort((x, y) => VERDICTS[x.verdict.id].rank - VERDICTS[y.verdict.id].rank),
        started: list.filter((r) => r.plays > 0 || r.finished || r.counts.asked > 0).length,
        of: list.length,
      };
    }).sort((x, y) => VERDICTS[x.verdict.id].rank - VERDICTS[y.verdict.id].rank
      || x.strand.localeCompare(y.strand));
    return { grade, strands, counts: pool(inGrade) };
  });

  return {
    v: REPORT_V,
    rows, grades, workingGrades, totals,
    seen: touched.length,
    legacy: touched.some((r) => r.legacy),
    next: nextSteps(rows, workingGrades),
  };
}

/* ------------------------------------------------------------- what to do
   Four rules, in this order, under a hard cap. The cap is the point: a parent
   handed nine things to do this week does none of them, so the report names the
   few that matter and stops. Each step says WHY it is being suggested, because
   "do this" with no reason is the version of advice a parent cannot adapt.

   THREE THINGS THE FIRST VERSION GOT WRONG, all of them visible only once it
   was run on an invented child rather than reasoned about:

     - It suggested the same LESSON twice, once for the game and once for the
       book that shares it. Two lines, one link, and a parent reading it wonders
       what the difference is. Deduplicated by destination.
     - It named the same ACTIVITY under two rules — "finish this book" and then
       "watch this book's lesson". Once something is named, it is named.
     - Four struggling activities filled the list and no GAP ever appeared,
       which throws away half of what the report is for: a parent wants to know
       what has not been touched as much as what is going badly. So a slot is
       RESERVED, and the fixing rules may not take the last one. */
export const NEXT_MAX = 4;
export const GAP_SLOTS = 1;     // kept back from the rules above, always

export function nextSteps(rows, workingGrades = []) {
  const out = [];
  const seenStep = new Set();
  const seenHref = new Set();
  const seenActivity = new Set();

  const push = (step, limit) => {
    if (out.length >= limit) return;
    if (seenStep.has(step.id) || seenHref.has(step.href)) return;
    if (step.activityId && seenActivity.has(step.activityId)) return;
    seenStep.add(step.id); seenHref.add(step.href);
    if (step.activityId) seenActivity.add(step.activityId);
    out.push(step);
  };

  /* Worst first, by how much of it they are getting wrong. */
  const rate = (r) => r.counts.right / r.counts.asked;
  const struggling = rows.filter((r) => r.verdict.id === 'hand')
    .sort((a, b) => rate(a) - rate(b));

  /* How many slots the fixing rules may use. Never all of them. */
  const fixLimit = Math.max(1, NEXT_MAX - GAP_SLOTS);

  /* RULES 1a AND 3b — a game going badly, and a book in the same strand that
     would teach it. "Games sit downstream of books" is an invariant of this
     codebase, and this is the one place it becomes advice to a parent:
     practising speed on something not yet understood is what the evidence warns
     against most directly, and a child grinding a game they do not understand
     reads the result as "I cannot do this" rather than "I have not been taught
     this yet".

     SPLIT IN TWO, because the first version was not one rule. It reached for
     any book in the strand that was not `finished`, which is true both of a
     book they worked through half of AND of one they have never opened — and
     then told the parent it was "not finished yet" either way. A check caught
     it firing on a strand whose book was done, recommending a different book
     nobody had touched, with copy describing something else entirely.

     They are different claims and they rank differently:
       1a  STARTED AND ABANDONED — the strongest signal in the whole report.
           They were being taught this and stopped. Outranks the lesson.
       3b  NEVER OPENED — real advice, but a whole book is ten minutes and the
           lesson is four, so for a struggling child the lesson goes first. */
  const teachingBookFor = (g, want) => rows.find((r) => r.kind === 'book'
    && r.strand === g.strand && !r.finished
    && (want === 'started' ? (r.plays > 0 || r.counts.asked > 0) : (!r.plays && !r.counts.asked)));

  for (const g of struggling.filter((r) => r.kind === 'game')) {
    const book = teachingBookFor(g, 'started');
    if (!book) continue;
    push({
      id: `book-first:${g.id}`, kind: 'book-before-game',
      activityId: book.id, title: book.title, href: book.href,
      why: `${g.title} is a game, and games are for getting quicker at something already learned. `
        + `${book.title} teaches it, and it was started and left unfinished.`,
      because: g.title,
    }, fixLimit);
  }

  /* RULE 2 — a struggling activity that has a lesson behind it. The lesson
     animates and a sheet cannot, so this is the cheapest thing that can change
     the picture. */
  for (const r of struggling.filter((x) => x.lesson)) {
    push({
      id: `lesson:${r.id}`, kind: 'lesson',
      activityId: r.id, title: r.title, href: `/learn/${r.lesson}/`,
      why: `${r.counts.right} of ${r.counts.asked} right so far. There is a short lesson for this one, and it moves.`,
      because: r.title,
    }, fixLimit);
  }

  /* RULE 3b — the untouched teaching book behind a struggling game. Honest
     about being untouched rather than about being unfinished. */
  for (const g of struggling.filter((r) => r.kind === 'game')) {
    const book = teachingBookFor(g, 'fresh');
    if (!book) continue;
    push({
      id: `book-fresh:${g.id}`, kind: 'book-before-game',
      activityId: book.id, title: book.title, href: book.href,
      why: `${g.title} is a game, and games are for getting quicker at something already learned. `
        + `${book.title} teaches the same thing and has not been opened yet.`,
      because: g.title,
    }, fixLimit);
  }

  /* RULE 3c — the rest of the struggling list: sit with them, and print it. */
  for (const r of struggling) {
    push({
      id: `practise:${r.id}`, kind: 'practise',
      activityId: r.id, title: r.title, href: r.href,
      why: `${r.counts.right} of ${r.counts.asked} right so far. Print the same page and do it again in a few days.`,
      because: r.title,
    }, fixLimit);
  }

  /* RULE 4 — a strand at a grade they are working in with nothing started.
     Named as a GAP IN THE RECORD and never as a weakness: the child may be
     perfectly good at it and simply never have clicked on it. This one may use
     the slots the rules above were not allowed to touch. */
  for (const grade of workingGrades) {
    const inGrade = rows.filter((r) => r.grade === grade);
    for (const strand of [...new Set(inGrade.map((r) => r.strand))]) {
      const list = inGrade.filter((r) => r.strand === strand);
      if (list.some((r) => r.plays > 0 || r.finished || r.counts.asked > 0)) continue;
      const book = list.find((r) => r.kind === 'book') || list[0];
      push({
        id: `gap:${grade}:${strand}`, kind: 'gap',
        activityId: book.id, title: book.title, href: book.href,
        why: `Nothing in "${strand}" has been tried yet, so there is no record of it either way.`,
        because: strand,
      }, NEXT_MAX);
    }
  }

  return out;
}
