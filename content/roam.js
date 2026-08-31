// ROAM linkage. Task and subscale definitions read from the yeatmanlab/roam-apps
// source and live item corpora — see docs/ROAM.md for provenance.
//
// Izzi Math is PRACTICE, not assessment. It never produces a score and never
// claims to predict one. This module only maps a ROAM result -> what to practise.

export const ROAM_URL = 'https://roam-apps.web.app/';

export const tasks = {
  roamAlpaca: {
    id: 'roamAlpaca',
    short: 'ALPACA',
    name: 'Core Math',
    full: 'Core Math: Algorithms, Procedures, and Calculations',
    measures: 'Grade-level math knowledge across counting, place value, operations, and fractions.',
    adaptive: true,
    note: 'Adaptive (4PL IRT, EAP). Returns an ability estimate rather than a raw count.',
    subscales: {
      cat1: { id: 'cat1', name: 'Early number', grades: ['K'], blurb: 'preK–K counting, number names, quantity, ordinal position.' },
      cat2: { id: 'cat2', name: 'Early operations', grades: ['1', '2'], blurb: 'Grades 1–2 addition and subtraction, place value, first fractions.' },
      cat3: { id: 'cat3', name: 'Elementary operations', grades: ['3', '4', '5'], blurb: 'Grades 3–5 multiplication, division, fractions, decimals.' },
    },
  },
  roamMagpi: {
    id: 'roamMagpi',
    short: 'MagPI',
    name: 'Magnitude Processing',
    full: 'Magnitude Processing Index',
    measures: 'The sense of how big a number is — the foundation everything else sits on.',
    subscales: {
      symbolic: {
        id: 'symbolic', name: 'Number comparison', grades: ['K', '1', '2', '3', '4', '5'],
        blurb: 'Which of two numbers is larger. Sensitive to the distance effect and to place-value traps.',
        bins: ['single digit (ratio)', 'decade compatible', 'decade incompatible', 'ones compare (decade matched)', 'tens compare (unit matched)', 'reversed digits'],
      },
      numberline: {
        id: 'numberline', name: 'Number line estimation', grades: ['K', '1', '2', '3', '4', '5'],
        blurb: 'Placing a number on a line. Covers whole numbers and fractions.',
        blocks: { '0_20': '0–20', '0_100': '0–100', '0_1': '0–1 (fractions)', '0_2': '0–2 (mixed and improper)' },
      },
    },
  },
  fluencyArf: {
    id: 'fluencyArf',
    short: 'ARF',
    name: 'Fact Retrieval',
    full: 'Arithmetic Retrieval Fluency',
    measures: 'Whether single-digit facts come back instantly, without counting.',
    subscales: {
      sum:   { id: 'sum',   name: 'Addition facts',       grades: ['K', '1', '2'], blurb: 'Single-digit sums, including crossing ten.' },
      minus: { id: 'minus', name: 'Subtraction facts',    grades: ['1', '2'],      blurb: 'Single-digit differences.' },
      mult:  { id: 'mult',  name: 'Multiplication facts', grades: ['3', '4'],      blurb: 'Times tables to 10.' },
      div:   { id: 'div',   name: 'Division facts',        grades: ['3', '4'],      blurb: 'Division facts, the inverse of the times tables.' },
    },
  },
  fluencyCalf: {
    id: 'fluencyCalf',
    short: 'CALF',
    name: 'Calculation Fluency',
    full: 'Calculation Fluency',
    measures: 'Running a multi-digit written procedure correctly — carrying, borrowing, long multiplication.',
    subscales: {
      'add-nocarry':   { id: 'add-nocarry',   name: 'Adding, no carry',        grades: ['1', '2'], blurb: 'Two-digit addition where no column exceeds nine.' },
      'add-carry':     { id: 'add-carry',     name: 'Adding with carry',       grades: ['2', '3'], blurb: 'Two-digit addition that regroups.' },
      'sub-noborrow':  { id: 'sub-noborrow',  name: 'Subtracting, no borrow',  grades: ['2'],      blurb: 'Two-digit subtraction with no regrouping.' },
      'sub-borrow':    { id: 'sub-borrow',    name: 'Subtracting with borrow', grades: ['2', '3'], blurb: 'Two-digit subtraction that regroups.' },
      mult:            { id: 'mult',          name: 'Multi-digit ×',           grades: ['4', '5'], blurb: 'Two-digit by one-digit and larger.' },
      div:             { id: 'div',           name: 'Multi-digit ÷',           grades: ['4', '5'], blurb: 'Dividing by a single digit.' },
    },
  },
};

// The lab's three-level Support Category, elementary (K-5) thresholds.
// Language is deliberate: "needs extra support", never "high risk".
export const bands = {
  need: {
    id: 'need', label: 'Needs extra support', cls: 'need', pct: 'below the 20th percentile',
    meaning: 'This skill is likely holding them back from grade-level material.',
    action: 'Start below grade level and build the foundation first. Short, frequent sessions.',
  },
  dev: {
    id: 'dev', label: 'Developing skill', cls: 'dev', pct: 'the 20th to 40th percentile',
    meaning: 'Below average for their age, but growing.',
    action: 'Practise this skill directly alongside grade-level work.',
  },
  ach: {
    id: 'ach', label: 'Achieved skill', cls: 'ach', pct: 'above the 40th percentile',
    meaning: 'Not holding them back from grade-level material.',
    action: 'Keep it warm with light practice, and push into the next thing.',
  },
};

export const bandOrder = ['need', 'dev', 'ach'];

export function bandFromPercentile(pct) {
  if (pct == null || Number.isNaN(pct)) return null;
  if (pct < 20) return bands.need;
  if (pct <= 40) return bands.dev;
  return bands.ach;
}

// Flat list of every task+subscale pair, for coverage checks and browsing.
export function allSubscales() {
  const out = [];
  for (const t of Object.values(tasks))
    for (const s of Object.values(t.subscales))
      out.push({ task: t.id, taskShort: t.short, taskName: t.name, ...s });
  return out;
}

export function subscaleOf(taskId, subId) {
  return tasks[taskId]?.subscales?.[subId] ?? null;
}

export function roamLabel(link) {
  const t = tasks[link.task];
  const s = subscaleOf(link.task, link.subscale);
  if (!t) return link.task;
  return s ? `${t.short} · ${s.name}` : t.short;
}

// The reliability flag ROAM sets when a child clicks too fast. If it's set we
// deliberately soften the recommendation rather than acting confidently on noise.
export const RELIABILITY = {
  responseTimeLowThreshold: 250,
  accuracyThreshold: 0.6,
  minResponsesRequired: 3,
  caveat: 'This score was flagged as unreliable because of very fast responses. Treat it as a hint, not a finding — and consider re-running ROAM when your child is fresh.',
};

/* ---------------------------------------------------------------------------
   Recommendation engine.
   Given { task, subscale, band } plus the activity registry, return an ordered
   list of activities to practise. Ordering rules:
     need -> easiest first, and allow a grade below the child's
     dev  -> at grade level, targeted at that subscale
     ach  -> at or one above grade level, lighter touch
--------------------------------------------------------------------------- */
export function recommend({ task, subscale, band, grade, activities, limit = 6 }) {
  const gradeNum = (g) => (g === 'K' ? 0 : parseInt(g, 10));
  const g = gradeNum(grade ?? 'K');

  const hits = activities.filter((a) =>
    (a.roam || []).some((l) => l.task === task && (!subscale || l.subscale === subscale))
  );

  let window;
  if (band === 'need') window = [g - 2, g];
  else if (band === 'dev') window = [g - 1, g];
  else window = [g, g + 1];

  const inWindow = hits.filter((a) => {
    const ag = gradeNum(a.grade);
    return ag >= window[0] && ag <= window[1];
  });

  const pool = inWindow.length ? inWindow : hits;
  const dir = band === 'ach' ? -1 : 1;
  return pool
    .slice()
    .sort((a, b) => dir * (gradeNum(a.grade) - gradeNum(b.grade)) || (a.kind === b.kind ? 0 : a.kind === 'book' ? -1 : 1))
    .slice(0, limit);
}
