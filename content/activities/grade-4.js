import { array2d, numberLine, tickRange, fractionBar, esc } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { fill } from '../characters.js';
import { wordProblem } from '../wordproblems.js';
import { frac, fracText, simplify, valF, gcd } from '../../src/lib/frac.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['4'];

/* ---------------------------------------------------------- BOOK: long multiplication */
const longMultiplication = {
  id: 'long-multiplication', title: 'Long Multiplication', kind: 'book', grade: '4', strand: S[0],
  glyph: '⨉',
  skill: 'Multiplying a two-digit number by one digit, then by two digits.',
  trick: 'Split the number, multiply the parts, then add. 24 × 6 is 20 × 6 plus 4 × 6.',
  blurb: 'Break it into parts, multiply, put it back together.',
  ccss: ['4.NBT.B.5'],
  im: [6],
  refs: ['im-scope-sequence', 'fyfe-2014-fading', 'barton-variation'],
  theory: 'Partial products, with the area model faded once the structure is understood.',
  roam: [{ task: 'fluencyCalf', subscale: 'mult' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Concreteness fading: the area model is visible for the early pages, then withdrawn, so partial products are understood before they become a written ritual. Two-digit by one-digit is secure before two-digit by two-digit appears.',
  pages: 14, printItems: 28,
  printPages: 2,   // two pages
  printInstruction: 'Work these out. Show your partial products.',
  generate(seed, i, ch, r) {
    // Every fifth item is a word problem, tagged by schema rather than by
    // operation — the structure is the thing being taught. A fixed stride
    // rather than a tail slice, for two reasons: the printable generates fewer
    // items than the book, so a tail slice gave some sheets none and one sheet
    // sixteen; and a stride of 5 does not collide with the i % 4 staging these
    // activities already use, so no stage gets wiped out.
    if (i % 5 === 4) {
      return wordProblem(r.pick(['equalGroups','share']), ch, r, { max: 96, min: 12 });
    }
    const stage = i < 4 ? 'm1' : i < 8 ? 'm2' : i < 11 ? 'm3' : 'two-digit';
    if (stage === 'two-digit') {
      const a = r.int(12, 49), b = r.int(12, 49);
      return {
        type: 'input', prompt: `<strong>${a} × ${b} =</strong>`,
        answer: String(a * b), placeholder: '?', printStem: `${a} × ${b} =`,
        hint: `Split ${b} into ${Math.floor(b / 10) * 10} and ${b % 10}. Work out ${a} × ${Math.floor(b / 10) * 10} and ${a} × ${b % 10}, then add.`,
        explain: `${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}, and ${a} × ${b % 10} = ${a * (b % 10)}. Together ${a * b}.`,
      };
    }
    const ranges = { m1: [11, 29, 2, 4], m2: [21, 59, 3, 6], m3: [36, 99, 4, 9] };
    const [lo, hi, blo, bhi] = ranges[stage];
    const a = r.int(lo, hi), b = r.int(blo, bhi);
    const tens = Math.floor(a / 10) * 10, ones = a % 10;
    return {
      type: 'input', prompt: `<strong>${a} × ${b} =</strong>`,
      visual: stage === 'm1' ? array2d(b, Math.min(a, 12), { fit: 150 }) : null, visualWidth: 200,
      answer: String(a * b), placeholder: '?', printStem: `${a} × ${b} =`,
      hint: `Split ${a} into ${tens} and ${ones}. Then ${tens} × ${b} and ${ones} × ${b}.`,
      explain: `${tens} × ${b} = ${tens * b}, ${ones} × ${b} = ${ones * b}. Add them: ${a * b}.`,
    };
  },
};

/* -------------------------------------------------------- BOOK: equivalent fractions */
const equivalentFractions = {
  id: 'equivalent-fractions', title: 'Equivalent Fractions', kind: 'book', grade: '4', strand: S[1],
  glyph: '≡',
  skill: 'Recognising and generating equal fractions, and simplifying to lowest terms.',
  trick: 'Multiply or divide the top and the bottom by the same number. Doing it to only one of them changes the fraction.',
  blurb: 'Same amount, different name. 2/4 is 1/2.',
  ccss: ['4.NF.A.1', '4.NF.A.2'],
  im: [2],
  refs: ['fuchs-2013-fractions', 'fuchs-ffo-wwc', 'wwc-2021-math'],
  theory: 'Equivalence: different names for the same position on the line.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'roamMagpi', subscale: 'numberline', block: '0_1' }],
  evidence: 'Equivalence is the hinge between placing a fraction on a line and doing arithmetic with unlike denominators. Without it, finding a common denominator is a memorised ritual with no meaning attached, and it collapses under any variation.',
  pages: 14, printItems: 13,
  printInstruction: 'Complete each equivalent fraction, or simplify it.',
  printInstructions: {
    input: 'Complete or simplify each fraction.',
    compare: 'Write < or > between each pair.',
    truefalse: 'Are they equal? Circle T or F.',
  },
  generate(seed, i, ch, r) {
    const stage = i % 3;
    if (stage === 0) {
      const d = r.pick([2, 3, 4, 5]), n = r.int(1, d - 1), k = r.int(2, 4);
      return {
        type: 'input', prompt: `<strong>${n}/${d} = ?/${d * k}</strong>`,
        visual: fractionBar(n, d, { width: 300, height: 30 }) + fractionBar(n * k, d * k, { width: 300, height: 30 }),
        visualWidth: 320,
        answer: String(n * k), placeholder: '?', printStem: `${n}/${d} = ____/${d * k}`,
        printVisual: fractionBar(n, d, { print: true, width: 190, height: 24 })
                   + fractionBar(n * k, d * k, { print: true, width: 190, height: 24 }),
        hint: `The bottom was multiplied by ${k}, so do the same to the top.`,
        explain: `${d} × ${k} = ${d * k}, so ${n} × ${k} = ${n * k}. ${n}/${d} = ${n * k}/${d * k}.`,
      };
    }
    if (stage === 1) {
      const base = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]]);
      const k = r.int(2, 5);
      const n = base[0] * k, d = base[1] * k;
      return {
        type: 'input', accept: 'fraction',
        prompt: `Write <strong>${n}/${d}</strong> in its simplest form.`,
        answer: `${base[0]}/${base[1]}`, placeholder: 'e.g. 1/2',
        printStem: `${n}/${d} = ____`,
        hint: `What number divides both ${n} and ${d}?`,
        explain: `Both divide by ${k}: ${n}/${d} = ${base[0]}/${base[1]}.`,
      };
    }
    const a = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 6]]);
    const b = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 6]]);
    const va = a[0] / a[1], vb = b[0] / b[1];
    if (va === vb) {
      return {
        type: 'truefalse', prompt: `Is <strong>${a[0]}/${a[1]}</strong> equal to <strong>${b[0]}/${b[1]}</strong>?`,
        answer: true, printStem: `${a[0]}/${a[1]} = ${b[0]}/${b[1]}?  T / F`,
        hint: 'Try writing both with the same bottom number.',
        explain: `They are the same amount.`,
      };
    }
    return {
      type: 'compare', prompt: 'Which is larger?',
      left: `${a[0]}/${a[1]}`, right: `${b[0]}/${b[1]}`,
      answer: va > vb ? 'left' : 'right',
      hint: 'Compare each to one half, or give them the same bottom number.',
      explain: `${va > vb ? `${a[0]}/${a[1]}` : `${b[0]}/${b[1]}`} is larger.`,
    };
  },
};

/* --------------------------------------------------------- BOOK: fold and sort
   Symmetry judged by eye is guesswork. Symmetry judged by FOLDING is a test the
   child can run, and 4.G.A.3 defines a line of symmetry as exactly that — a fold
   into matching parts. On paper the sheet answers itself: you fold it and find
   out, which is the one thing paper does better than a screen here.

   Every answer is DERIVED, not asserted. The helpers below reflect the polygon
   across the candidate line and measure its interior angles, so a wrong claim
   cannot be authored by mistake. That caught two of my own: an "obtuse" triangle
   whose largest angle was 92.6 degrees — technically obtuse, visually a right
   angle, an unfair thing to ask a nine-year-old — and an "isosceles" triangle so
   close to equilateral that a child could reasonably see three lines of symmetry
   in it. Both are now unambiguous.

   The two difficulties this targets are the grade-4 ones: a rectangle's diagonal
   cuts it into congruent parts that do NOT coincide, and hierarchical
   classification (a square is also a rectangle and also a rhombus). No item ever
   claims a rhombus cannot have a right angle, because a square is one. */

const ang = (a, b, c) => {
  const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
  const d = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v));
  return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI;
};
const interior = (P) => P.map((p, k) => ang(P[(k - 1 + P.length) % P.length], p, P[(k + 1) % P.length]));
const reflectPt = ([px, py], [[x1, y1], [x2, y2]]) => {
  const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy;
  const t = ((px - x1) * dx + (py - y1) * dy) / L;
  return [2 * (x1 + t * dx) - px, 2 * (y1 + t * dy) - py];
};
// A fold works when every corner lands on a corner. 0.9 units on an 80-unit box.
const foldsOnto = (P, line) => P.every((p) => {
  const q = reflectPt(p, line);
  return P.some((o) => Math.hypot(o[0] - q[0], o[1] - q[1]) < 0.9);
});
const rotPt = ([x, y], deg) => {
  const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  return [40 + (x - 40) * c - (y - 40) * s, 40 + (x - 40) * s + (y - 40) * c];
};
/* Off-axis on purpose: a child who has only seen upright shapes reads "vertical"
   as "symmetric". Rotating the shape AND its candidate line together preserves
   the relationship, so the answer is unchanged and the shortcut stops working. */
const figure = (P, line, deg, print) => {
  const pts = P.map((p) => rotPt(p, deg)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const ink = print ? '#111' : 'var(--a1)';
  const l = line ? line.map((p) => rotPt(p, deg)) : null;
  return `<svg viewBox="0 0 80 80" width="${print ? 108 : 132}" height="${print ? 108 : 132}" role="img" aria-hidden="true">
    <polygon points="${pts}" fill="none" stroke="${ink}" stroke-width="${print ? 2.2 : 3}" stroke-linejoin="round"/>
    ${l ? `<line x1="${l[0][0].toFixed(1)}" y1="${l[0][1].toFixed(1)}" x2="${l[1][0].toFixed(1)}" y2="${l[1][1].toFixed(1)}"
      stroke="${ink}" stroke-width="${print ? 1.4 : 2}" stroke-dasharray="5 4" opacity=".85"/>` : ''}
  </svg>`;
};

const SH = {
  square:   { P: [[15, 15], [65, 15], [65, 65], [15, 65]], name: 'square' },
  rect:     { P: [[10, 22], [70, 22], [70, 58], [10, 58]], name: 'rectangle' },
  rhombus:  { P: [[40, 14], [76, 40], [40, 66], [4, 40]], name: 'rhombus' },
  parallel: { P: [[12, 55], [45, 20], [75, 20], [42, 55]], name: 'parallelogram' },
  isoTri:   { P: [[40, 8], [68, 70], [12, 70]], name: 'triangle' },
  scalene:  { P: [[14, 64], [70, 58], [36, 16]], name: 'triangle' },
  rightTri: { P: [[14, 66], [66, 66], [14, 20]], name: 'triangle' },
  obtuse:   { P: [[8, 58], [74, 58], [30, 40]], name: 'triangle' },
  acuteTri: { P: [[40, 14], [63, 62], [17, 62]], name: 'triangle' },
  isoTrap:  { P: [[22, 20], [58, 20], [72, 62], [8, 62]], name: 'trapezoid' },
  /* Added because a pool of five triangles cannot fill ten slots: collect()
     wanders the index space hunting a distinct item and lands back on the same
     questions. Each was measured through the helpers before being written down.
     Two candidates were thrown out by that: a 94-degree "obtuse" triangle, which
     is obtuse to a protractor and a right angle to a nine-year-old, and a "right
     trapezoid" whose coordinates made a square. */
  rightTri2: { P: [[20, 20], [20, 68], [64, 68]], name: 'triangle' },
  obtuse2:   { P: [[10, 30], [70, 30], [50, 50]], name: 'triangle' },
  acute2:    { P: [[16, 64], [64, 64], [34, 18]], name: 'triangle' },
  rightTrap: { P: [[14, 22], [54, 22], [70, 62], [14, 62]], name: 'trapezoid' },
  kite:      { P: [[40, 8], [66, 38], [40, 72], [14, 38]], name: 'kite' },
};
const VERT = [[40, 2], [40, 78]], HORZ = [[2, 40], [78, 40]];
const ROTS = [18, 35, 52, 74, 108, 143, 200, 250, 310];
// Candidate folds, mixing real lines of symmetry with plausible fakes. The
// rectangle's and parallelogram's diagonals are the fakes worth having.
const FOLDS = [
  ['square', VERT], ['square', [[15, 15], [65, 65]]],
  ['rect', VERT], ['rect', HORZ], ['rect', [[10, 22], [70, 58]]],
  ['rhombus', VERT], ['rhombus', HORZ],
  ['parallel', [[12, 55], [75, 20]]], ['parallel', VERT], ['parallel', HORZ],
  ['isoTri', VERT], ['isoTri', HORZ],
  ['scalene', VERT], ['scalene', HORZ],
  ['isoTrap', VERT], ['isoTrap', HORZ],
  ['rightTri', VERT], ['acuteTri', VERT],
  ['kite', VERT], ['kite', HORZ], ['kite', [[14, 38], [66, 38]]],
  ['rightTrap', VERT], ['rightTrap', HORZ],
  ['obtuse2', VERT], ['acute2', VERT], ['rightTri2', HORZ],
  ['square', HORZ], ['rhombus', [[8, 40], [72, 40]]],
];
/* A right-angle question is only fair if the corners that are NOT right angles
   are visibly not right angles. The print cap is 0.72in, so a corner within 10
   degrees of square is a coin flip on paper. The kite sits 8.2 degrees off, which
   is why the first threshold here (8) let it through when I tested the guard. The kite is excluded for exactly that
   reason — its axis corners sit near 90 whatever the proportions — and it stays
   in FOLDS, where the question is symmetry and the angle does not matter.
   Enforced below, at module load, rather than left to whoever edits this next. */
const CORNERS = ['square', 'rect', 'rightTri', 'rhombus', 'parallel', 'isoTri', 'scalene',
  'obtuse', 'acuteTri', 'isoTrap', 'rightTri2', 'obtuse2', 'acute2', 'rightTrap'];
const TRIS = ['rightTri', 'obtuse', 'acuteTri', 'isoTri', 'scalene', 'rightTri2', 'obtuse2', 'acute2'];

/* Loud at module load rather than an unfair question on a child's sheet. */
for (const k of CORNERS) {
  const a = interior(SH[k].P);
  const off = a.filter((x) => Math.abs(x - 90) >= 0.6).map((x) => Math.abs(x - 90));
  const tight = off.length ? Math.min(...off) : 90;
  if (tight < 10) {
    throw new Error(`fold-and-sort: "${k}" has a corner ${tight.toFixed(1)} degrees off square, `
      + `which is not decidable at the 0.72in print cap. Use it in FOLDS, not CORNERS.`);
  }
}

const foldAndSort = {
  id: 'fold-and-sort', title: 'Fold and Sort', kind: 'book', grade: '4', strand: S[2],
  glyph: '◿',
  skill: 'Finding lines of symmetry by folding, and sorting triangles by their angles.',
  trick: 'A fold line only counts if the two halves land exactly on top of each other. Same size is not enough — a rectangle cut corner to corner gives two matching halves that will not stack.',
  printDensity: 'd2',
  printMaxPages: 1,
  blurb: 'Would it fold in half exactly? Then sort the triangles by their corners.',
  ccss: ['4.G.A.2', '4.G.A.3'],
  im: [8],
  refs: ['im-k5', 'im-scope-sequence'],
  theory: 'A line of symmetry is defined by a fold, so the test is physical rather than visual. Shapes are drawn off-axis because a child who has only met upright figures learns "upright" as part of the definition.',
  /* ROAM has no geometry construct: roamAlpaca cat3 is "grades 3-5 multiplication,
     division, fractions, decimals" and every other grade-4 subscale is numeric.
     This is a GRADE-BAND placement, not a construct match, and it is recorded here
     rather than in user-visible text. shape-sorter does the same at K. */
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Geometry was the largest hole in the catalogue: 4.G.A.2 and 4.G.A.3 appeared nowhere, and IM grade-4 Unit 8 had no activity at all. Stated plainly, because the site does not claim what it cannot support: there is no efficacy evidence behind this one. references.js holds 37 sources and not one is geometry; the WWC practice guide that touches it rates geometry Minimal and is a preschool/K guide. im-k5 is cited as a design source for the sequence, not as evidence of effect. What this activity is defended on is coverage, and one affordance paper has and screens do not — you can fold the sheet and find out.',
  /* Six, because that is what fits. The print grid is three columns and the
     figures are capped at 0.72in by printDensity d2; six items fill two rows and
     land at 9.9in, and the seventh starts a third row that takes the sheet to
     11.75in — a cliff, not a slope. d3 would allow more rows at a 0.6in cap, but
     these figures have to be judged by eye and folded, so the smaller cap is the
     wrong trade. A reader who wants more gets the practice pack: several
     finishable sheets on different seeds, which is this project's answer to
     wanting more practice rather than one long sheet. Twelve pages on screen. */
  pages: 12, printItems: 6,
  printInstruction: 'Fold lines are dashed. For each one, would the two halves land exactly on top of each other?',
  printInstructions: {
    truefalse: 'Would it fold along the dashed line so the halves land exactly on top of each other? Circle T or F.',
    choice: 'Sort each triangle by its biggest corner.',
  },
  generate(seed, i, ch, r, bookSeed = 0) {
    const mode = i % 3;
    /* The rotation is DERIVED from which question this is, never rolled. Rotation
       is baked into the SVG string and collect()'s dedup key includes
       printVisual, so a random angle made every repeat look distinct to the
       machine while reading as the same question to the child: measured at 100%
       of ten-item sheets carrying a duplicate. Same question, same angle, and the
       existing dedup does its job. */
    const rotFor = (idx) => ROTS[(idx * 4 + mode) % ROTS.length];
    /* WHICH question this is, is derived too. Rolling it left 48% of real sheets
       carrying a repeated figure even with the rotation fixed, because
       collect()'s dedup retry walks idx = i + tries*7 — which changes `mode`, so
       it escapes sideways instead of finding a fresh question. Indexed by `i`
       with a stride coprime to each pool, so neighbouring items cannot collide;
       bookSeed moves the starting point, so "new problems" still works. */
    const pick = (pool, stride) => (Math.floor(Math.abs(bookSeed) / 7) + i * stride) % pool;

    // would it fold? — answer derived by reflecting the corners
    if (mode === 0) {
      const fi = pick(FOLDS.length, 7);        // 29 folds, stride 7
      const [k, line] = FOLDS[fi];
      const deg = rotFor(fi);
      const sh = SH[k];
      const folds = foldsOnto(sh.P, line);
      return {
        type: 'truefalse',
        prompt: `Would this ${sh.name} fold along the dashed line so the two halves land exactly on top of each other?${figure(sh.P, line, deg, false)}`,
        printStem: `Would this ${sh.name} fold exactly in half along the dashed line?`,
        printVisual: figure(sh.P, line, deg, true),
        answer: folds,
        hint: `Imagine folding along the dashed line. Do the corners land on corners?`,
        explain: folds
          ? `Yes. Every corner lands on another corner, so the two halves sit exactly on top of each other.`
          : `No. The two parts are the same size, but they do not land on top of each other, so the dashed line is not a line of symmetry.`,
      };
    }

    // sort a triangle by its biggest corner — class derived from the angles
    if (mode === 1) {
      const ti = pick(TRIS.length, 3);         // 8 triangles, stride 3
      const k = TRIS[ti];
      const deg = rotFor(ti);
      const sh = SH[k];
      const big = Math.max(...interior(sh.P));
      const cls = big > 90.6 ? 'Obtuse' : big > 89.4 ? 'Right' : 'Acute';
      return {
        type: 'choice',
        prompt: `What kind of triangle is this?${figure(sh.P, null, deg, false)}`,
        /* printProblem never renders p.choices, so on paper a choice item is a
           blank box unless the options are written into the stem. Without this the
           sheet asked "What kind of triangle is this?" and gave nothing to pick
           from. */
        printStem: `What kind of triangle is this?  (acute / right / obtuse)`,
        printVisual: figure(sh.P, null, deg, true),
        choices: ['Acute', 'Right', 'Obtuse'],
        answer: cls,
        hint: `Look at the biggest corner. Is it smaller than a square corner, exactly a square corner, or bigger?`,
        explain: cls === 'Right'
          ? `Its biggest corner is exactly a square corner, so it is a right triangle.`
          : cls === 'Obtuse'
            ? `Its biggest corner opens wider than a square corner, so it is an obtuse triangle.`
            : `Every corner is smaller than a square corner, so it is an acute triangle.`,
      };
    }

    /* does it have a right angle? — one shape, one claim, so the item stands on
       its own when collect() reorders the sheet. Never phrased as a fact about
       the CLASS: a square is a rhombus, so "a rhombus has no right angles" is
       false, and this asks only about the shape that is drawn. */
    const ci = pick(CORNERS.length, 4);        // 15 shapes, stride 4
    const k = CORNERS[ci];
    const deg = rotFor(ci);
    const sh = SH[k];
    const angles = interior(sh.P);
    const has = angles.some((x) => Math.abs(x - 90) < 0.6);
    const biggest = Math.round(Math.max(...angles));
    return {
      type: 'truefalse',
      prompt: `This ${sh.name} has at least one right angle.${figure(sh.P, null, deg, false)}`,
      printStem: `This ${sh.name} has at least one right angle.`,
      printVisual: figure(sh.P, null, deg, true),
      answer: has,
      hint: `A right angle is a square corner. Turning the shape does not change its corners.`,
      explain: has
        ? `Yes — one of its corners is a square corner, and turning the shape does not change that.`
        : `No — this one's corners are about ${angles.map((x) => Math.round(x)).join('°, ')}°, and none of them is a square corner. The widest is ${biggest}°.`,
    };
  },
};

/* ------------------------------------------------------------- BOOK: angles and lines */
const anglesAndLines = {
  id: 'angles-and-lines', title: 'Angles and Lines', kind: 'book', grade: '4', strand: S[2],
  glyph: '∠',
  skill: 'Naming angles by size, and adding angles that meet at a point or on a line.',
  trick: 'A square corner is 90. A straight line is 180. All the way round is 360. Every question here is one of those three, split up.',
  blurb: 'Acute, right, obtuse — then work out the missing angle.',
  ccss: ['4.MD.C.5', '4.MD.C.7', '4.G.A.1'],
  im: [7],
  refs: ['im-scope-sequence'],
  theory: 'An unknown deduced from a constraint rather than computed.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Angle sums are among the first places a child meets an unknown that has to be deduced rather than computed, which is the beginning of algebraic reasoning rather than the end of arithmetic.',
  pages: 12, printItems: 13,
  printInstruction: 'Name each angle, or find the missing one.',
  printInstructions: {
    choice: 'Name each angle.',
    input: 'Find the missing angle.',
  },
  generate(seed, i, ch, r) {
    const angleSvg = (deg, print = false) => {
      const rad = (deg * Math.PI) / 180;
      const x = 20 + 100 * Math.cos(-rad), y = 100 - 100 * Math.sin(rad);
      return `<svg viewBox="0 0 150 120" width="100%" height="120" role="img" aria-label="angle of ${deg} degrees">
        <g stroke="${print ? '#111' : 'var(--a1)'}" stroke-width="${print ? 2 : 3}" fill="none" stroke-linecap="round">
          <path d="M20 100 H140"/><path d="M20 100 L${(20 + 110 * Math.cos(rad)).toFixed(1)} ${(100 - 110 * Math.sin(rad)).toFixed(1)}"/>
        </g>
        <path d="M50 100 A30 30 0 0 0 ${(20 + 30 * Math.cos(rad)).toFixed(1)} ${(100 - 30 * Math.sin(rad)).toFixed(1)}"
          fill="none" stroke="${print ? '#555' : 'var(--txt3)'}" stroke-width="1.4" stroke-dasharray="3 2"/></svg>`;
    };
    if (i % 3 === 0) {
      const deg = r.pick([25, 40, 55, 90, 90, 115, 140, 160]);
      const name = deg < 90 ? 'acute' : deg === 90 ? 'right' : 'obtuse';
      return {
        type: 'choice', prompt: `What kind of angle is this?`,
        visual: angleSvg(deg), visualWidth: 190,
        choices: r.shuffle(['acute', 'right', 'obtuse', 'straight']),
        answer: name, printStem: 'What kind of angle is this?',
        printVisual: angleSvg(deg, true),
        hint: 'A right angle is exactly 90°. Less is acute, more is obtuse.',
        explain: `${deg}° is ${name}${deg === 90 ? '' : deg < 90 ? ' — less than 90°' : ' — more than 90°'}.`,
      };
    }
    if (i % 3 === 1) {
      const a = r.int(20, 70);
      return {
        type: 'input', prompt: `Two angles sit on a straight line. One is <strong>${a}°</strong>. What is the other?`,
        answer: String(180 - a), placeholder: '?', printStem: `${a}° + ____ = 180°`,
        hint: 'Angles on a straight line add to 180°.',
        explain: `180 − ${a} = ${180 - a}°.`,
      };
    }
    const a = r.int(30, 120), b = r.int(30, Math.max(31, 200 - a));
    const c = 360 - a - b;
    return {
      type: 'input', prompt: `Three angles meet at a point. Two are <strong>${a}°</strong> and <strong>${b}°</strong>. What is the third?`,
      answer: String(c), placeholder: '?', printStem: `${a}° + ${b}° + ____ = 360°`,
      hint: 'Angles round a full point add to 360°.',
      explain: `360 − ${a} − ${b} = ${c}°.`,
    };
  },
};

/* ------------------------------------------------------------- GAME: division descent */
const divisionDescent = {
  id: 'division-descent', title: 'Division Descent', kind: 'game', grade: '4', strand: S[0],
  glyph: '÷',
  skill: 'Dividing a two- or three-digit number by a single digit.',
  goal: 'Share the big number into equal groups, and say how many are in each group.',
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: 'Divide the biggest place first. Write down what fits, then carry the leftover into the next digit.',
  blurb: 'Climb down: how many times does it go?',
  ccss: ['4.NBT.B.6'],
  im: [6],
  refs: ['im-scope-sequence', 'codding-2011', 'fuchs-2012-timed'],
  theory: 'Division as repeated subtraction of a composed unit.',
  roam: [{ task: 'fluencyCalf', subscale: 'div' }],
  evidence: 'Every division here comes out exactly. That is deliberate: remainders are a separate idea, and introducing them while the procedure is still being learned means failures are ambiguous — did the method go wrong, or is the answer just untidy?',
  strategy: { name: 'Multiply up', text: 'Ask how many of the smaller number fit. Try tens first: how about ten of them?' },
  rounds: 12, printItems: 30, seconds: 90,
  printInstruction: 'Work these out. Every one divides exactly.',
  generate(seed, i, ch, r) {
    const band = i < 4 ? 'd1' : i < 8 ? 'd2' : 'd3';
    const cfg = { d1: [2, 9, 11, 22], d2: [3, 9, 30, 60], d3: [4, 9, 60, 99] }[band];
    const [dlo, dhi, qlo, qhi] = cfg;
    const d = r.int(dlo, dhi), q = r.int(qlo, qhi);
    const n = d * q;
    return {
      type: 'input', prompt: `<strong>${n} ÷ ${d} =</strong>`,
      answer: String(q), placeholder: '?', printStem: `${n} ÷ ${d} =`,
      hint: `How many ${d}s fit into ${n}? Try tens first: ${d} × 10 = ${d * 10}.`,
      explain: `${d} × ${q} = ${n}, so ${n} ÷ ${d} = ${q}.`,
    };
  },
};

/* ----------------------------------------------------------------- GAME: decimal drop */
const decimalDrop = {
  id: 'decimal-drop', title: 'Decimal Drop', kind: 'game', grade: '4', strand: S[1],
  glyph: '·',
  skill: 'Placing a decimal between 0 and 1, and matching it to its fraction.',
  goal: 'Drag the decimal to where it belongs between 0 and 1. Close counts.',
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: '0.5 is a half, 0.25 is a quarter, 0.1 is a tenth. Find the nearest of those you know, then adjust from it.',
  blurb: 'Where does 0.35 land? And what fraction is that?',
  ccss: ['4.NF.C.6', '4.NF.C.7'],
  im: [4],
  refs: ['wwc-2021-math', 'schneider-2018', 'riconscente-2013'],
  theory: 'Decimals and fractions as one idea in two notations, on one line.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_1' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Decimals and fractions on the same number line, so they read as one idea in two notations rather than two unrelated topics. Matching 0.25 to a quarter is the link that makes both easier.',
  strategy: { name: 'Tenths first', text: 'The first digit after the point is tenths. 0.35 is between three tenths and four tenths.' },
  rounds: 12, printItems: 7,
  printMaxPages: 3,   // only 26 distinct problems exist seconds: 0, timerAvailable: true,
  printInstruction: 'Mark each decimal on the line.',
  printInstructions: {
    numberline: 'Mark each decimal on the number line.',
    choice: 'Write the fraction that matches each decimal.',
  },
  generate(seed, i, ch, r) {
    if (i % 3 === 2) {
      const pairs = [[0.5, '1/2'], [0.25, '1/4'], [0.75, '3/4'], [0.2, '1/5'], [0.4, '2/5'], [0.1, '1/10'], [0.3, '3/10']];
      const [dec, fr] = r.pick(pairs);
      const wrongs = pairs.filter((p) => p[1] !== fr).map((p) => p[1]);
      return {
        type: 'choice', prompt: `Which fraction equals <strong>${dec}</strong>?`,
        choices: r.shuffle([fr, ...r.sample(wrongs, 3)]),
        answer: fr, printStem: `${dec} = ____`,
        explain: `${dec} is ${fr}.`,
      };
    }
    const tenth = r.int(1, 19);
    const target = Math.round((tenth / 20) * 100) / 100;
    return {
      type: 'numberline', lo: 0, hi: 1, target, targetLabel: String(target),
      tolerance: 0.04,
      ticks: tickRange(0, 1, 0.1), majors: [0, 0.5, 1],
      labels: [[0, '0'], [0.5, '0.5'], [1, '1']],
      prompt: `Where does <strong>${target}</strong> go?`,
      printStem: `Mark <strong>${target}</strong> on the line.`,
      explain: `${target} is ${target < 0.5 ? 'less than' : target > 0.5 ? 'more than' : 'exactly'} a half.`,
    };
  },
};


/* ---------------------------------------------------- BOOK: factor forest (G4 S4) */
const factorForest = {
  id: 'factor-forest', title: 'Factor Forest', kind: 'book', grade: '4', strand: S[3],
  glyph: '⋔',
  skill: 'Finding factor pairs, listing multiples, and telling a prime from a composite.',
  trick: 'Work up in pairs from 1 and stop when the pairs start repeating — that is when you have them all.',
  blurb: 'Which numbers divide it exactly? And which numbers have no pairs at all?',
  ccss: ['4.OA.B.4'],
  im: [1],
  refs: ['im-scope-sequence', 'youcubed-close-to-100', 'fyfe-2014-fading'],
  theory: 'A factor pair is the two sides of a rectangle with that many squares. Primes are the numbers that can only be a single line.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'fluencyArf', subscale: 'div' }],
  evidence: 'Factors are usually taught as a list to memorise. Presented as rectangle dimensions they become a search with a visible answer — and it explains primes properly: a prime is a number you cannot make into any rectangle except a single row.',
  pages: 12, printItems: 16,
  printInstruction: 'Find the factors and multiples asked for.',
  printInstructions: {
    input: 'Write the missing factor or multiple.',
    choice: 'Choose the right answer.',
    truefalse: 'Prime or not? Circle T for prime.',
  },
  generate(seed, i, ch, r) {
    const mode = i % 4;
    if (mode === 0) {
      const a = r.int(2, 9), b = r.int(2, 12);
      const n = a * b;
      return {
        type: 'input',
        prompt: `<strong>${a}</strong> × ? = <strong>${n}</strong>. What is the missing factor?`,
        visual: array2d(a, b, { fit: 150 }), visualWidth: 200,
        answer: String(b), placeholder: '?',
        printStem: `${a} × ____ = ${n}`,
        printVisual: array2d(a, b, { print: true, fit: 96 }),
        hint: `How many rows of ${a} make ${n}?`,
        explain: `${a} × ${b} = ${n}, so the missing factor is ${b}.`,
      };
    }
    if (mode === 1) {
      const n = r.pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 48]);
      const factors = [];
      for (let k = 1; k * k <= n; k++) if (n % k === 0) factors.push(k);
      const target = r.pick(factors.filter((f) => f > 1)) ?? 2;
      const wrongs = [...new Set([target + 1, target - 1, target + 3, n / target + 1])]
        .filter((x) => x > 1 && x < n && n % x !== 0);
      return {
        type: 'choice',
        prompt: `Which of these is a factor of <strong>${n}</strong>?`,
        choices: r.shuffle([String(target), ...r.sample(wrongs, Math.min(3, wrongs.length)).map(String)]),
        answer: String(target),
        printStem: `Circle the factor of ${n}.`,
        hint: `A factor divides ${n} exactly, with nothing left over.`,
        explain: `${n} ÷ ${target} = ${n / target}, exactly. The others leave a remainder.`,
      };
    }
    if (mode === 2) {
      const base = r.int(3, 12), k = r.int(3, 7);
      return {
        type: 'input',
        prompt: `Count in <strong>${base}</strong>s. What is the <strong>${k}${['th','st','nd','rd'][k % 10 > 3 ? 0 : k % 10] || 'th'}</strong> multiple of ${base}?`,
        answer: String(base * k), placeholder: '?',
        printStem: `${k}th multiple of ${base} =`,
        hint: `${base}, ${base * 2}, ${base * 3}, …`,
        explain: `${base} × ${k} = ${base * k}.`,
      };
    }
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
    const isPrime = r.chance(0.5);
    const n = isPrime ? r.pick(primes) : r.pick([9, 12, 15, 16, 18, 21, 25, 27, 33, 35, 39]);
    return {
      type: 'truefalse',
      prompt: `Is <strong>${n}</strong> a prime number?`,
      answer: isPrime,
      printStem: `${n} is prime?`,
      hint: 'A prime has exactly two factors: one, and itself.',
      explain: isPrime
        ? `Yes. Nothing divides ${n} except 1 and ${n}.`
        : (() => { for (let k = 2; k * k <= n; k++) if (n % k === 0) return `No — ${n} = ${k} × ${n / k}.`; return `No.`; })(),
    };
  },
};

/* --------------------------------------------------- BOOK: times as many (G4 S5) */
const timesAsMany = {
  id: 'times-as-many', title: 'Times As Many', kind: 'book', grade: '4', strand: S[4],
  glyph: '⨯',
  skill: 'Multiplicative comparison — reading "four times as many" as multiplication rather than addition.',
  trick: '“Times as many” means multiply, not add. Draw one bar for the smaller amount, then repeat that bar.',
  blurb: 'Three times as many is not three more. Here is the difference.',
  ccss: ['4.OA.A.1', '4.OA.A.2'],
  im: [5],
  refs: ['wwc-2021-math', 'im-scope-sequence'],
  theory: 'Additive comparison asks how many more; multiplicative comparison asks how many times as many. Children routinely read the second as the first.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'fluencyArf', subscale: 'mult' }],
  evidence: 'Its own strand in Illustrative Mathematics grade 4, and a well-documented sticking point: "three times as many" gets read as "three more". Every page pairs the two comparisons so the difference is the thing being noticed, which is the variation-theory move — change one feature, hold the rest.',
  pages: 12, printItems: 16,
  printInstruction: 'Read carefully — some ask how many more, some how many times as many.',
  printInstructions: { input: 'Read carefully. Some ask how many more, some how many times as many.' },
  generate(seed, i, ch, r) {
    const C = fill('{collectible.many}', ch), A = fill('{Actor}', ch);
    const mode = i % 3;
    const small = r.int(3, 12), times = r.int(2, 6);
    if (mode === 0) {
      return {
        type: 'input',
        prompt: `${A} has ${small} ${C}. A friend has <strong>${times} times as many</strong>. How many does the friend have?`,
        answer: String(small * times), placeholder: '?',
        printStem: `${small} ${C}; friend has ${times} times as many =`,
        hint: `"Times as many" means multiply, not add.`,
        explain: `${small} × ${times} = ${small * times}. (${times} MORE would only be ${small + times}.)`,
      };
    }
    if (mode === 1) {
      return {
        type: 'input',
        prompt: `${A} has ${small} ${C}. A friend has <strong>${times} more</strong>. How many does the friend have?`,
        answer: String(small + times), placeholder: '?',
        printStem: `${small} ${C}; friend has ${times} more =`,
        hint: `"More" means add. Careful — this is not the same as "times as many".`,
        explain: `${small} + ${times} = ${small + times}. (${times} TIMES as many would be ${small * times}.)`,
      };
    }
    const big = small * times;
    return {
      type: 'input',
      prompt: `${A} has ${big} ${C} and a friend has ${small}. <strong>How many times as many</strong> does ${A} have?`,
      answer: String(times), placeholder: '?',
      printStem: `${big} is how many times as many as ${small}?`,
      hint: `Ask: ${small} times what makes ${big}?`,
      explain: `${small} × ${times} = ${big}, so ${times} times as many.`,
    };
  },
};

export default [longMultiplication, foldAndSort, equivalentFractions, anglesAndLines, factorForest, timesAsMany, divisionDescent, decimalDrop];
