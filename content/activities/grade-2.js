import { baseTen, numberLine, tickRange, array2d, tenFrame, esc } from '../../src/lib/widgets.js';
import { fill } from '../characters.js';

const S = ['Place value to 1000', 'Add and subtract within 100', 'Measure and data', 'Arrays and equal groups'];

/* ------------------------------------------------------------ BOOK: place value palace */
const placeValuePalace = {
  id: 'place-value-palace', title: 'Place Value Palace', kind: 'book', grade: '2', strand: S[0],
  glyph: '☰',
  skill: 'Reading, building and comparing numbers to 1000 in hundreds, tens and ones.',
  blurb: 'Build the number from hundreds, tens and ones — then say which is bigger.',
  ccss: ['2.NBT.A.1', '2.NBT.A.3', '2.NBT.A.4'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Three-digit place value, with comparison pairs chosen to expose the classic error rather than to be easy. When the tens and the ones point in opposite directions — 71 against 25 — children who compare digit by digit get it wrong, and a random pair rarely catches that.',
  pages: 12, printItems: 14,
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
  blurb: 'The four cases: add with and without a carry, subtract with and without a borrow.',
  ccss: ['2.NBT.B.5', '2.NBT.B.7'],
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
  id: 'arrays-and-equal-groups', title: 'Arrays and Equal Groups', kind: 'book', grade: '2', strand: S[3],
  glyph: '▦',
  skill: 'Seeing repeated addition as rows and columns — the groundwork for multiplication.',
  blurb: 'Count the rows, count the columns, find the total.',
  ccss: ['2.OA.C.4'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'The array is the representation that carries children from repeated addition into multiplication, and later into the area model and volume. Introducing it in grade 2 means grade 3 multiplication has something to stand on besides memorisation.',
  pages: 10, printItems: 12,
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
        visual: array2d(rows, cols), visualWidth: 220,
        answer: String(rows * cols), placeholder: '?',
        printStem: 'How many altogether?',
        printVisual: array2d(rows, cols, { print: true, cell: 13 }),
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
      visual: array2d(rows, cols), visualWidth: 220,
      choices: r.shuffle([answer, ...r.sample(distinct, 3)]),
      answer,
      printStem: 'Write this array as an addition.',
      printVisual: array2d(rows, cols, { print: true, cell: 13 }),
      hint: `There are ${rows} rows, and each has ${cols}.`,
      explain: `${rows} rows of ${cols}: ${Array(rows).fill(cols).join(' + ')} = ${total}.`,
    };
  },
};

/* ------------------------------------------------------------ GAME: hundred line hop */
const hundredLineHop = {
  id: 'hundred-line-hop', title: 'Hundred Line Hop', kind: 'game', grade: '2', strand: S[0],
  glyph: '⇥',
  skill: 'Estimating where a number sits on a 0–100 line.',
  blurb: 'No tick marks this time. Where does 63 go?',
  ccss: ['2.NBT.A.1'],
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_100' }],
  evidence: 'The same number line, now without tick marks. Removing them is the point: the child has to reason from landmarks (nought, fifty, one hundred) instead of counting, which is what estimating a magnitude actually is.',
  rounds: 12, seconds: 0, timerAvailable: false, printItems: 8,
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
  blurb: 'Which is bigger: 65 or 49? Careful — the ones digit lies.',
  ccss: ['2.NBT.A.4'],
  roam: [{ task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Rounds cycle through the four specific ways two-digit comparison goes wrong: tens and ones agreeing, tens and ones disagreeing, a shared tens digit, and the same two digits reversed. Practising the traps deliberately is more useful than practising random pairs.',
  rounds: 16, seconds: 45, printItems: 12,
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

export default [placeValuePalace, carryAndBorrow, arraysAndEqualGroups, hundredLineHop, decadeDuel];
