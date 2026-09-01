import { baseTen, numberLine, tickRange, array2d, tenFrame, barChart, esc } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { fill } from '../characters.js';
import { wordProblem } from '../wordproblems.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['2'];

/* ------------------------------------------------------------ BOOK: place value palace */
const placeValuePalace = {
  id: 'place-value-palace', title: 'Place Value Palace', kind: 'book', grade: '2', strand: S[0],
  glyph: '☰',
  skill: 'Reading, building and comparing numbers to 1000 in hundreds, tens and ones.',
  trick: 'Compare from the left. The first column where the digits differ decides it, and nothing to the right can change that.',
  blurb: 'Build the number from hundreds, tens and ones — then say which is bigger.',
  ccss: ['2.NBT.A.1', '2.NBT.A.3', '2.NBT.A.4'],
  im: [5, 7],
  refs: ['im-scope-sequence', 'holloway-ansari-2009'],
  theory: 'Place value determines magnitude; digit-by-digit comparison is the classic failure.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Three-digit place value, with comparison pairs chosen to expose the classic error rather than to be easy. When the tens and the ones point in opposite directions — 71 against 25 — children who compare digit by digit get it wrong, and a random pair rarely catches that.',
  pages: 12, printItems: 12,
  printPages: 2,   // two pages
  printInstruction: 'Write each number, then compare the pairs.',
  printInstructions: {
    input: 'Write each number.',
    compare: 'Write < or > between each pair.',
    choice: 'Write the digit in the place named.',
  },
  generate(seed, i, ch, r) {
    const mode = i % 4;
    if (mode === 0) {
      const h = r.int(1, 9), t = r.int(0, 9), o = r.int(0, 9);
      const n = h * 100 + t * 10 + o;
      return {
        type: 'input', prompt: 'What number is this?',
        visual: baseTen(h > 3 ? 1 : h, t, o), visualWidth: 300,
        answer: String(n), placeholder: '?',
        printStem: 'What number is this?',
        printVisual: baseTen(h > 3 ? 1 : h, t, o, { print: true, scale: .7 }),
        hint: 'Hundreds first, then tens, then ones.',
        explain: `${h} hundreds, ${t} tens, ${o} ones is ${n}.`,
      };
    }
    if (mode === 1) {
      const n = r.int(190, 989);
      return {
        type: 'input', prompt: `What number comes next?<br><strong>${n - 2}, ${n - 1}, __</strong>`,
        answer: String(n), placeholder: '?', printStem: `${n - 2}, ${n - 1}, ____`,
        hint: n % 100 === 0 ? 'Careful — this one crosses into a new hundred.' : 'Count on by one.',
        explain: `After ${n - 1} comes ${n}.`,
      };
    }
    if (mode === 2) {
      // decade-incompatible pair: tens say one thing, ones say the other
      const t1 = r.int(2, 8), t2 = r.int(1, t1 - 1);
      const o1 = r.int(0, 4), o2 = r.int(o1 + 3, 9);
      const a = t1 * 10 + o1, b = t2 * 10 + o2;
      return {
        type: 'compare', prompt: 'Which is greater?', left: a, right: b,
        answer: a > b ? 'left' : 'right',
        hint: 'Compare the tens first. The ones only matter if the tens are the same.',
        explain: `${a} has ${t1} tens and ${b} has ${t2} tens, so ${Math.max(a, b)} is greater — even though its ones digit is smaller.`,
      };
    }
    const n = r.int(101, 989);
    const place = r.pick(['hundreds', 'tens', 'ones']);
    const digit = place === 'hundreds' ? Math.floor(n / 100) : place === 'tens' ? Math.floor(n / 10) % 10 : n % 10;
    const others = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
    return {
      type: 'choice', prompt: `In <strong>${n}</strong>, what digit is in the ${place} place?`,
      choices: (() => {
        const distractors = [...new Set(others.concat([(digit + 1) % 10, (digit + 2) % 10]))].filter((x) => x !== digit);
        return r.shuffle([digit, ...r.sample(distractors, 3)]).map(String);
      })(),
      answer: String(digit),
      printStem: `In ${n}, the ${place} digit is ____`,
      hint: 'Hundreds is the leftmost digit of a three-digit number.',
      explain: `${n} — the ${place} digit is ${digit}.`,
    };
  },
};

/* ------------------------------------------------------------ BOOK: carry and borrow */
const carryAndBorrow = {
  id: 'carry-and-borrow', title: 'Carry and Borrow', kind: 'book', grade: '2', strand: S[1],
  glyph: '⇄',
  skill: 'Two-digit addition and subtraction, with and without regrouping.',
  trick: 'Line the ones up under the ones. Start at the right. If a column makes ten or more, write the ones digit and carry the ten next door.',
  printScratch: true,
  blurb: 'The four cases: add with and without a carry, subtract with and without a borrow.',
  ccss: ['2.NBT.B.5', '2.NBT.B.7'],
  im: [2, 7],
  refs: ['im-scope-sequence', 'rohrer-2020', 'barton-variation'],
  theory: 'Regrouping as composing and decomposing a unit of ten.',
  roam: [
    { task: 'fluencyCalf', subscale: 'add-nocarry' },
    { task: 'fluencyCalf', subscale: 'add-carry' },
    { task: 'fluencyCalf', subscale: 'sub-noborrow' },
    { task: 'fluencyCalf', subscale: 'sub-borrow' },
  ],
  evidence: 'Four procedures that fail separately, so they are practised separately and then interleaved: add without carrying, add with carrying, subtract without borrowing, subtract with borrowing. Interleaving matters here — mixing the four is what forces a child to read the problem rather than repeat the last method.',
  pages: 16, printItems: 14,
  printInstruction: 'Work these out. Watch for the ones that regroup.',
  generate(seed, i, ch, r) {
    // Every fifth item is a word problem, tagged by schema rather than by
    // operation — the structure is the thing being taught. A fixed stride
    // rather than a tail slice, for two reasons: the printable generates fewer
    // items than the book, so a tail slice gave some sheets none and one sheet
    // sixteen; and a stride of 5 does not collide with the i % 4 staging these
    // activities already use, so no stage gets wiped out.
    if (i % 5 === 4) {
      return wordProblem(r.pick(['join','separate','compare']), ch, r, { max: 90, min: 12 });
    }
    const stage = i % 4;
    if (stage === 0) {
      // CALF A1 — no carry
      const t1 = r.int(1, 4), o1 = r.int(1, 4), t2 = r.int(1, 4), o2 = r.int(1, 9 - o1);
      const a = t1 * 10 + o1, b = t2 * 10 + o2;
      return { type: 'input', prompt: `<strong>${a} + ${b}</strong>`, answer: String(a + b), placeholder: '?',
        printStem: `${a} + ${b} =`, hint: 'No column goes past nine here — just add each column.',
        explain: `${a} + ${b} = ${a + b}. Nothing regrouped.` };
    }
    if (stage === 1) {
      // CALF A2/A4 — with carry
      const o1 = r.int(4, 9), o2 = r.int(10 - o1 + 1, 9);
      const a = r.int(1, 8) * 10 + o1, b = r.int(1, 8) * 10 + o2;
      return { type: 'input', prompt: `<strong>${a} + ${b}</strong>`, answer: String(a + b), placeholder: '?',
        printStem: `${a} + ${b} =`,
        hint: `${o1} + ${o2} is more than ten, so a ten carries into the tens column.`,
        explain: `${o1} + ${o2} = ${o1 + o2}, so write ${(o1 + o2) % 10} and carry 1. Total ${a + b}.` };
    }
    if (stage === 2) {
      // CALF S1 — no borrow
      const t1 = r.int(3, 9), o1 = r.int(5, 9);
      const t2 = r.int(1, t1 - 1), o2 = r.int(0, o1);
      const a = t1 * 10 + o1, b = t2 * 10 + o2;
      return { type: 'input', prompt: `<strong>${a} − ${b}</strong>`, answer: String(a - b), placeholder: '?',
        printStem: `${a} − ${b} =`, hint: 'Every ones digit on top is big enough — no borrowing needed.',
        explain: `${a} − ${b} = ${a - b}.` };
    }
    // CALF S2 — with borrow
    const o1 = r.int(0, 4), o2 = r.int(o1 + 1, 9);
    const t1 = r.int(3, 9), t2 = r.int(1, t1 - 1);
    const a = t1 * 10 + o1, b = t2 * 10 + o2;
    return { type: 'input', prompt: `<strong>${a} − ${b}</strong>`, answer: String(a - b), placeholder: '?',
      printStem: `${a} − ${b} =`,
      hint: `You cannot take ${o2} from ${o1}, so borrow a ten.`,
      explain: `Borrow a ten: ${o1 + 10} − ${o2} = ${o1 + 10 - o2}. Answer ${a - b}.` };
  },
};

/* ------------------------------------------------------- BOOK: arrays and equal groups */
const arraysAndEqualGroups = {
  id: 'arrays-and-equal-groups', title: 'Arrays and Equal Groups', kind: 'book', grade: '2', strand: S[4],
  glyph: '▦',
  skill: 'Seeing repeated addition as rows and columns — the groundwork for multiplication.',
  trick: 'Count one row, then count how many rows. Rows that are all the same size can be multiplied instead of added up.',
  blurb: 'Count the rows, count the columns, find the total.',
  ccss: ['2.OA.C.4'],
  im: [8],
  refs: ['im-scope-sequence', 'youcubed-close-to-100', 'fyfe-2014-fading'],
  theory: 'The array turns repeated addition into a two-dimensional structure.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'The array is the representation that carries children from repeated addition into multiplication, and later into the area model and volume. Introducing it in grade 2 means grade 3 multiplication has something to stand on besides memorisation.',
  pages: 10, printItems: 7,
  printInstruction: 'Write the total for each array.',
  printInstructions: {
    input: 'Write the total for each array.',
    choice: 'Write the addition that matches each array.',
  },
  generate(seed, i, ch, r) {
    const rows = r.int(2, 5), cols = r.int(2, 6);
    if (i % 2 === 0) {
      return {
        type: 'input', prompt: `How many altogether?`,
        visual: array2d(rows, cols, { fit: 150 }), visualWidth: 220,
        answer: String(rows * cols), placeholder: '?',
        printStem: 'How many altogether?',
        printVisual: array2d(rows, cols, { print: true, fit: 96 }),
        hint: `Count one row (${cols}), then add it ${rows} times.`,
        explain: `${rows} rows of ${cols} is ${rows * cols}.`,
      };
    }
    const total = rows * cols;
    const answer = Array(rows).fill(cols).join(' + ');
    // Distractors must be genuinely different strings — with a square array,
    // "rows of cols" and "cols of rows" are the same text.
    const cands = [
      Array(cols).fill(rows).join(' + '),
      Array(Math.max(2, rows + 1)).fill(cols).join(' + '),
      Array(rows).fill(cols + 1).join(' + '),
      `${rows} + ${cols}`,
    ];
    const distinct = [...new Set(cands)].filter((c) => c !== answer);
    return {
      type: 'choice', prompt: `Which addition matches this array?`,
      visual: array2d(rows, cols, { fit: 150 }), visualWidth: 220,
      choices: r.shuffle([answer, ...r.sample(distinct, 3)]),
      answer,
      printStem: 'Write this array as an addition.',
      printVisual: array2d(rows, cols, { print: true, fit: 96 }),
      hint: `There are ${rows} rows, and each has ${cols}.`,
      explain: `${rows} rows of ${cols}: ${Array(rows).fill(cols).join(' + ')} = ${total}.`,
    };
  },
};

/* ------------------------------------------------------------ GAME: hundred line hop */
const hundredLineHop = {
  id: 'hundred-line-hop', title: 'Hundred Line Hop', kind: 'game', grade: '2', strand: S[2],
  glyph: '⇥',
  skill: 'Estimating where a number sits on a 0–100 line.',
  goal: 'Slide the marker to where the number belongs between 0 and 100.',
  trick: 'Anchor on 50, then 25 and 75. Place your number next to the nearest anchor instead of counting up from zero.',
  blurb: 'No tick marks this time. Where does 63 go?',
  ccss: ['2.NBT.A.1'],
  im: [4, 5],
  refs: ['wwc-2021-math', 'schneider-2018', 'geary-2011'],
  theory: 'Landmark-based estimation rather than counting.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_100' }],
  evidence: 'The same number line, now without tick marks. Removing them is the point: the child has to reason from landmarks (nought, fifty, one hundred) instead of counting, which is what estimating a magnitude actually is.',
  strategy: { name: 'Use landmarks', text: 'Fifty is the middle. Twenty-five is halfway to the middle. Work from those.' },
  rounds: 12, printItems: 7, seconds: 0, timerAvailable: false,
  printInstruction: 'Mark each number on the line.',
  generate(seed, i, ch, r) {
    // MagPI's own 0-100 targets
    const pool = [3, 7, 14, 19, 24, 32, 44, 51, 63, 76, 84, 98];
    const target = pool[(i * 7 + 2) % pool.length];
    return {
      type: 'numberline', lo: 0, hi: 100, target, targetLabel: String(target),
      tolerance: 5,
      ticks: [], majors: [0, 50, 100],
      labels: [[0, '0'], [50, '50'], [100, '100']],
      prompt: `Where does <strong>${target}</strong> go?`,
      printStem: `Mark <strong>${target}</strong> on the line.`,
      explain: `${target} is ${target < 50 ? `${50 - target} less than half way` : target > 50 ? `${target - 50} past half way` : 'exactly half way'}.`,
    };
  },
};

/* ---------------------------------------------------------------- GAME: decade duel */
const decadeDuel = {
  id: 'decade-duel', title: 'Decade Duel', kind: 'game', grade: '2', strand: S[0],
  glyph: '⚖',
  skill: 'Comparing two-digit numbers, including the pairs designed to trick you.',
  goal: 'Two numbers appear. Tap the bigger one — the ones digit is there to trick you.',
  trick: 'Look at the tens first. The ones only matter if the tens are the same.',
  blurb: 'Which is bigger: 65 or 49? Careful — the ones digit lies.',
  ccss: ['2.NBT.A.4'],
  im: [5],
  refs: ['holloway-ansari-2009', 'wwc-2021-math'],
  theory: 'Place-value comparison, and the specific traps that defeat digit-by-digit reading.',
  roam: [{ task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Rounds cycle through the four specific ways two-digit comparison goes wrong: tens and ones agreeing, tens and ones disagreeing, a shared tens digit, and the same two digits reversed. Practising the traps deliberately is more useful than practising random pairs.',
  strategy: { name: 'Tens first', text: 'Compare the tens digits. Only look at the ones if the tens are the same.' },
  rounds: 16, printItems: 24, seconds: 45,
  printInstruction: 'Write < or > between each pair.',
  generate(seed, i, ch, r) {
    const kind = ['compatible', 'incompatible', 'onesMatched', 'reversed'][i % 4];
    let a, b, why;
    if (kind === 'compatible') {
      const t1 = r.int(2, 8), t2 = r.int(1, t1 - 1);
      const o1 = r.int(5, 9), o2 = r.int(0, 4);
      a = t1 * 10 + o1; b = t2 * 10 + o2;
      why = 'Both the tens and the ones point the same way.';
    } else if (kind === 'incompatible') {
      const t1 = r.int(2, 8), t2 = r.int(1, t1 - 1);
      const o1 = r.int(0, 3), o2 = r.int(6, 9);
      a = t1 * 10 + o1; b = t2 * 10 + o2;
      why = 'The ones digit is bigger on the smaller number — the tens decide it.';
    } else if (kind === 'onesMatched') {
      const t = r.int(1, 9), o1 = r.int(0, 8), o2 = r.int(o1 + 1, 9);
      a = t * 10 + o1; b = t * 10 + o2;
      why = 'Same tens, so compare the ones.';
    } else {
      const x = r.int(1, 9), y = r.int(1, 9);
      const [hi, lo] = x > y ? [x, y] : [y, x];
      if (hi === lo) { a = 73; b = 37; } else { a = hi * 10 + lo; b = lo * 10 + hi; }
      why = 'Same two digits, swapped round. The tens digit decides.';
    }
    if (a === b) { a = 62; b = 26; }
    if (r.chance(0.5)) { const t = a; a = b; b = t; }
    return {
      type: 'compare', prompt: 'Which is greater?', left: a, right: b,
      answer: a > b ? 'left' : 'right',
      explain: `${Math.max(a, b)} is greater. ${why}`,
    };
  },
};


/* ------------------------------------------------------- GAME: close to a hundred */
const closeToHundred = {
  id: 'close-to-hundred', title: 'Close to a Hundred', kind: 'game', grade: '2', strand: S[1],
  glyph: '⌾',
  skill: 'Choosing where to put digits to land as close to a target as possible.',
  goal: 'Choose where to put each digit so your number lands as close to the target as you can.',
  trick: 'Put your biggest digit in the tens place. A ten is worth ten times a one, so that is where the game is won.',
  blurb: 'Four digits, two numbers. Get as close to 100 as you can.',
  ccss: ['2.NBT.B.5', '2.NBT.B.6'],
  im: [1, 2, 7],
  refs: ['youcubed-close-to-100', 'im-scope-sequence', 'barton-variation'],
  theory: 'A target-number game turns arithmetic into a decision. The child must estimate before committing, which is what makes place value matter rather than just being recited.',
  roam: [{ task: 'fluencyCalf', subscale: 'add-carry' }, { task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'The catalogue had no target-number game, which is the format the classroom tradition singles out — the youcubed "How Close to 100?" task is the canonical version. Unlike a drill, the arithmetic here serves a decision: you cannot choose where to put a digit without estimating the total first, so place value becomes load-bearing rather than recited.',
  rounds: 12, seconds: 0, timerAvailable: false, printItems: 13,
  strategy: { name: 'Tens first', text: 'The tens digits decide most of it. Put your big digits in the tens places, then check what the ones do.' },
  printInstruction: 'Arrange each set of digits to get as close to the target as you can.',
  printInstructions: { choice: 'Which arrangement lands closest to the target?' },
  generate(seed, i, ch, r) {
    // Target is fixed at 100, as the name says. Digits are drawn so that 100 is
    // actually approachable: two tens digits summing to 9 or 10, then two free
    // ones digits. Drawing four digits at random makes most rounds unwinnable.
    const target = 100;
    const t1 = r.int(1, 8);
    const t2 = Math.min(9, Math.max(1, (r.chance(0.5) ? 9 : 10) - t1));
    let o1 = r.int(1, 9), o2 = r.int(1, 9), guard = 0;
    // At least three distinct digits, or the four-digit set collapses to two
    // arrangements and the puzzle becomes a coin flip.
    while (new Set([t1, t2, o1, o2]).size < 3 && guard++ < 20) {
      o1 = r.int(1, 9); o2 = r.int(1, 9);
    }
    const digits = r.shuffle([t1, t2, o1, o2]);

    // Every distinct way of splitting the four digits into two two-digit numbers.
    const options = [];
    const seen = new Set();
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      if (a === b) continue;
      const rest = [0, 1, 2, 3].filter((k) => k !== a && k !== b);
      for (const [c, d] of [[rest[0], rest[1]], [rest[1], rest[0]]]) {
        const x = digits[a] * 10 + digits[b], y = digits[c] * 10 + digits[d];
        const key = Math.min(x, y) + ':' + Math.max(x, y);
        if (seen.has(key)) continue;
        seen.add(key);
        options.push({ x, y, sum: x + y, gap: Math.abs(x + y - target) });
      }
    }
    options.sort((a, b) => a.gap - b.gap);
    const best = options[0];
    const label = (o) => `${o.x} + ${o.y}`;

    // Three distractors spread across the range, all strictly worse than best.
    const pool = options.filter((o) => o.gap > best.gap);
    const picks = [];
    for (const frac of [0.2, 0.55, 0.95]) {
      const cand = pool[Math.min(pool.length - 1, Math.floor(pool.length * frac))];
      if (cand && !picks.some((p2) => label(p2) === label(cand))) picks.push(cand);
    }
    // If repeated digits collapsed the option space, top up from whatever is left.
    for (const o of pool) {
      if (picks.length >= 3) break;
      if (!picks.some((p2) => label(p2) === label(o))) picks.push(o);
    }

    return {
      type: 'choice',
      prompt: `Target <strong>${target}</strong>. Using <strong>${digits.join(', ')}</strong> — which lands closest?`,
      choices: r.shuffle([label(best), ...picks.map(label)]),
      answer: label(best),
      printStem: `Target ${target}. Digits ${digits.join(', ')}. Closest pair: ____ + ____`,
      hint: 'Make the two tens digits add to about 9 or 10, then see what the ones do.',
      explain: `${label(best)} = ${best.sum}${best.gap === 0 ? ', exactly 100' : `, which is ${best.gap} away`}.`,
    };
  },
};


/* ------------------------------------------------ BOOK: measure and chart (G2 S4) */
const measureAndChart = {
  id: 'measure-and-chart', title: 'Measure and Chart', kind: 'book', grade: '2', strand: S[3],
  glyph: '▥',
  skill: 'Measuring length in units, and reading a bar chart to compare and total.',
  trick: 'Read the scale up the side before you read the bars. Check what one step is worth first.',
  printDensity: 'd2',
  printScratch: true,
  blurb: 'How long is it? And what does the chart tell you?',
  ccss: ['2.MD.A.1', '2.MD.D.10'],
  im: [3, 6],
  refs: ['im-scope-sequence', 'wwc-2021-math'],
  theory: 'A bar chart is a set of number lines standing up. Reading one is a magnitude comparison with a scale attached.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Required grade-2 coverage, and included on that basis rather than as an evidence claim — the WWC guidance on measurement and data is weak. It is framed to lean on what does have support: reading a bar off a scaled axis is a magnitude judgement, and comparing two bars is the same comparison the number work practises.',
  pages: 12, printItems: 12,
  printPages: 2,   // two pages
  printInstruction: 'Measure, then read the charts.',
  printInstructions: { input: 'Read the chart and write the answer.', choice: 'Which is right?' },
  generate(seed, i, ch, r) {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu'];
    const step = i % 4 === 3 ? 2 : 1;          // a scaled axis on every fourth page
    const vals = DAYS.map(() => r.int(1, 9) * step);
    const bars = DAYS.map((d, k) => ({ label: d, v: vals[k] }));
    const mode = i % 4;
    if (mode === 0) {
      const k = r.int(0, 3);
      return {
        type: 'input',
        prompt: `How many on <strong>${DAYS[k]}</strong>?`,
        visual: barChart(bars, { step }), visualWidth: 320,
        answer: String(vals[k]), placeholder: '?',
        printStem: `How many on ${DAYS[k]}?`,
        printVisual: barChart(bars, { print: true, step, width: 220, height: 120 }),
        hint: step > 1 ? `Careful — the scale goes up in ${step}s.` : 'Read across from the top of the bar.',
        explain: `${DAYS[k]} is ${vals[k]}.`,
      };
    }
    if (mode === 1) {
      const hi = vals.indexOf(Math.max(...vals));
      return {
        type: 'choice',
        prompt: 'Which day had the most?',
        visual: barChart(bars, { step }), visualWidth: 320,
        choices: r.shuffle(DAYS.slice()),
        answer: DAYS[hi],
        printStem: 'Which day had the most?',
        printVisual: barChart(bars, { print: true, step, width: 220, height: 120 }),
        hint: 'The tallest bar.',
        explain: `${DAYS[hi]}, with ${vals[hi]}.`,
      };
    }
    if (mode === 2) {
      const a = r.int(0, 3);
      let b = r.int(0, 3);
      if (b === a) b = (a + 1) % 4;
      const diff = Math.abs(vals[a] - vals[b]);
      return {
        type: 'input',
        prompt: `How many more on <strong>${DAYS[vals[a] >= vals[b] ? a : b]}</strong> than <strong>${DAYS[vals[a] >= vals[b] ? b : a]}</strong>?`,
        visual: barChart(bars, { step }), visualWidth: 320,
        answer: String(diff), placeholder: '?',
        printStem: `Difference between ${DAYS[a]} and ${DAYS[b]}?`,
        printVisual: barChart(bars, { print: true, step, width: 220, height: 120 }),
        hint: 'Read both bars, then subtract.',
        explain: `${Math.max(vals[a], vals[b])} − ${Math.min(vals[a], vals[b])} = ${diff}.`,
      };
    }
    const total = vals.reduce((n, v) => n + v, 0);
    return {
      type: 'input',
      prompt: 'How many altogether across all four days?',
      visual: barChart(bars, { step }), visualWidth: 320,
      answer: String(total), placeholder: '?',
      printStem: 'Total across all four days?',
      printVisual: barChart(bars, { print: true, step, width: 220, height: 120 }),
      hint: step > 1 ? `The scale goes up in ${step}s — read each bar carefully first.` : 'Add all four bars.',
      explain: `${vals.join(' + ')} = ${total}.`,
    };
  },
};

export default [placeValuePalace, carryAndBorrow, measureAndChart, arraysAndEqualGroups, closeToHundred, hundredLineHop, decadeDuel];
