import { tenFrame, numberBond, numberLine, tickRange, baseTen, dots, esc } from '../../src/lib/widgets.js';
import { fill } from '../characters.js';

const S = ['Addition and subtraction to 20', 'Place value to 100', 'Measure and tell time', 'Shapes and halves'];

/* ------------------------------------------------------------ BOOK: adding to twenty */
const addingToTwenty = {
  id: 'adding-to-twenty', title: 'Adding to Twenty', kind: 'book', grade: '1', strand: S[0],
  glyph: '+',
  skill: 'Addition and subtraction facts within 20, including the ones that cross ten.',
  blurb: 'Sums and differences to 20, starting with the easy ones.',
  ccss: ['1.OA.C.6', '1.OA.B.4'],
  roam: [{ task: 'fluencyArf', subscale: 'sum' }, { task: 'fluencyArf', subscale: 'minus' }, { task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Sums within ten come first, then the sums that cross ten, then the matching subtractions. Crossing ten is the genuine step change: it is where counting on stops being efficient and a strategy (make ten, then add the rest) has to take over.',
  pages: 12, printItems: 10,
  printInstruction: 'Work out each one. Write the answer.',
  printInstructions: {
    choice: 'Add these. Write the total.',
    input: 'Work these out. Write the answer.',
  },
  generate(seed, i, ch, r) {
    const stage = i < 4 ? 'add-small' : i < 8 ? 'add-cross' : 'subtract';
    if (stage === 'add-small') {
      const a = r.int(1, 5), b = r.int(1, 9 - a);
      return {
        type: 'choice', prompt: `What is <strong>${a} + ${b}</strong>?`,
        visual: tenFrame(a + b),
        choices: r.shuffle([a + b, a + b + 1, a + b - 1, a + b + 2].filter((v, k, s2) => v > 0 && s2.indexOf(v) === k).slice(0, 4)).map(String),
        answer: String(a + b), printStem: `${a} + ${b} =`,
        printVisual: tenFrame(a + b, { print: true }),
        hint: 'Fill the frame and count what you have.',
        explain: `${a} + ${b} = ${a + b}.`,
      };
    }
    if (stage === 'add-cross') {
      const a = r.int(4, 9), b = r.int(11 - a, 9);
      const sum = a + b;
      return {
        type: 'input', prompt: `What is <strong>${a} + ${b}</strong>?`,
        answer: String(sum), placeholder: '?', printStem: `${a} + ${b} =`,
        hint: `Make ten first: ${a} needs ${10 - a} to reach ten, and ${b} is ${10 - a} and ${b - (10 - a)}.`,
        explain: `${a} + ${b} = 10 + ${sum - 10} = ${sum}.`,
      };
    }
    const total = r.int(11, 18), part = r.int(2, 9);
    return {
      type: 'input', prompt: `What is <strong>${total} − ${part}</strong>?`,
      answer: String(total - part), placeholder: '?', printStem: `${total} − ${part} =`,
      hint: `Count back from ${total}, or think: ${part} and what make ${total}?`,
      explain: `${total} − ${part} = ${total - part}.`,
    };
  },
};

/* --------------------------------------------------------------- BOOK: tens and ones */
const tensAndOnes = {
  id: 'tens-and-ones', title: 'Tens and Ones', kind: 'book', grade: '1', strand: S[1],
  glyph: '⑽',
  skill: 'Place value to 100 — reading a number as tens and ones, and adding without regrouping.',
  blurb: 'How many tens? How many ones? Then add them up.',
  ccss: ['1.NBT.B.2', '1.NBT.C.4'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'fluencyCalf', subscale: 'add-nocarry' }],
  evidence: 'Place value before regrouping. This book stays deliberately inside the no-carry case, because a child who is still working out what the tens digit means cannot also be learning to carry — the two together overload working memory.',
  pages: 12, printItems: 10,
  printInstruction: 'Write how many tens and ones, then find each total.',
  printInstructions: {
    input: 'Write the number, or find the total.',
    choice: 'How many tens? Write the digit.',
  },
  generate(seed, i, ch, r) {
    if (i % 3 === 0) {
      const tens = r.int(1, 9), ones = r.int(0, 9);
      const n = tens * 10 + ones;
      return {
        type: 'input', prompt: `How many is this?`,
        visual: baseTen(0, tens, ones), visualWidth: 340,
        answer: String(n), placeholder: '?', printStem: 'What number is this?',
        printVisual: baseTen(0, tens, ones, { print: true, scale: .8 }),
        hint: `Each tall block is ten. Count the tens, then the loose ones.`,
        explain: `${tens} tens and ${ones} ones is ${n}.`,
      };
    }
    if (i % 3 === 1) {
      const tens = r.int(2, 8), ones = r.int(1, 9);
      const n = tens * 10 + ones;
      return {
        type: 'choice', prompt: `In <strong>${n}</strong>, how many tens?`,
        choices: r.shuffle([tens, ones, tens + 1, Math.max(0, tens - 1)].filter((v, k, s2) => s2.indexOf(v) === k).slice(0, 4)).map(String),
        answer: String(tens), printStem: `${n} has ____ tens and ____ ones.`,
        hint: 'The first digit tells you the tens.',
        explain: `${n} is ${tens} tens and ${ones} ones.`,
      };
    }
    // no-carry addition: every column stays under ten (CALF A1)
    const t1 = r.int(1, 4), o1 = r.int(1, 4), t2 = r.int(1, 4), o2 = r.int(1, 9 - o1);
    const a = t1 * 10 + o1, b = t2 * 10 + o2;
    return {
      type: 'input', prompt: `What is <strong>${a} + ${b}</strong>?`,
      answer: String(a + b), placeholder: '?', printStem: `${a} + ${b} =`,
      hint: 'Add the ones, then add the tens. Nothing carries here.',
      explain: `${o1} + ${o2} = ${o1 + o2} ones, and ${t1} + ${t2} = ${t1 + t2} tens. So ${a + b}.`,
    };
  },
};

/* ------------------------------------------------------------ BOOK: halves and quarters */
const halvesAndQuarters = {
  id: 'halves-and-quarters', title: 'Halves and Quarters', kind: 'book', grade: '1', strand: S[3],
  glyph: '◑',
  skill: 'Splitting shapes into equal parts, and naming a half and a quarter.',
  blurb: 'Split the shape fairly. Is that a half or a quarter?',
  ccss: ['1.G.A.3'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Fractions begin as fair shares of a shape, with no symbols at all. The emphasis is on equal parts, since "split into four" and "split into four equal parts" are different claims and children routinely conflate them.',
  pages: 8, printItems: 8,
  printInstruction: 'Shade the part named under each shape.',
  printInstructions: {
    choice: 'Write how much of each bar is shaded.',
    truefalse: 'Are the parts equal? Circle T or F.',
  },
  generate(seed, i, ch, r) {
    const den = r.pick([2, 4]);
    const shaded = 1;
    const cols = den;
    const bar = (fillN, d, w = 260, print = false) => {
      const seg = w / d;
      let s = `<svg viewBox="0 0 ${w} 56" width="100%" height="56" role="img" aria-label="${fillN} of ${d} shaded">`;
      for (let k = 0; k < d; k++) {
        const on = k < fillN;
        s += `<rect x="${k * seg}" y="2" width="${seg}" height="52" fill="${print ? 'none' : (on ? 'var(--a2)' : 'none')}" stroke="${print ? '#111' : 'var(--line2)'}" stroke-width="1.5"/>`;
        if (print && on) for (let h = -52; h < seg; h += 5)
          s += `<line x1="${(k * seg + h).toFixed(1)}" y1="54" x2="${(k * seg + h + 52).toFixed(1)}" y2="2" stroke="#111" stroke-width=".8"/>`;
      }
      return s + `<rect x="0" y="2" width="${w}" height="52" fill="none" stroke="${print ? '#111' : 'var(--txt3)'}" stroke-width="2"/></svg>`;
    };
    if (i % 2 === 0) {
      const name = den === 2 ? 'one half' : 'one fourth';
      const wrong = den === 2 ? 'one fourth' : 'one half';
      return {
        type: 'choice', prompt: 'How much of the bar is shaded?',
        visual: bar(shaded, den), visualWidth: 300,
        choices: r.shuffle([name, wrong, 'one third', 'the whole thing']),
        answer: name,
        printStem: `Shade one ${den === 2 ? 'half' : 'fourth'}.`,
        printVisual: bar(0, den, 200, true),
        hint: `Count the equal parts. There are ${den}.`,
        explain: `One part out of ${den} equal parts is ${name}.`,
      };
    }
    const parts = r.pick([2, 3, 4]);
    const equal = r.chance(0.5);
    return {
      type: 'truefalse',
      prompt: `This bar is split into ${parts} parts. <strong>They are ${equal ? 'equal' : 'not equal'}.</strong> True or false?`,
      visual: bar(0, parts), visualWidth: 300,
      answer: equal,
      printStem: `Split into ${parts} parts. Are they equal?`,
      printVisual: bar(0, parts, 200, true),
      hint: 'Equal parts have to be exactly the same size.',
      explain: equal ? 'The parts are the same size, so they are equal.' : 'Parts must be the same size to be equal.',
    };
  },
};

/* ------------------------------------------------------------- GAME: number line hop */
const numberLineHop = {
  id: 'number-line-hop', title: 'Number Line Hop', kind: 'game', grade: '1', strand: S[1],
  glyph: '↦',
  skill: 'Estimating where a number sits on a 0–20 line.',
  blurb: 'Slide the marker to the right spot on the line.',
  ccss: ['1.NBT.B.3'],
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_20' }],
  evidence: 'Linear number line practice is among the best-evidenced early number interventions there is — Siegler and Ramani’s work on linear board games showed gains in numerical magnitude that transferred to broader arithmetic. Ticks are provided at this stage so the child can count as well as estimate.',
  rounds: 12, seconds: 0, timerAvailable: false, printItems: 8,
  printInstruction: 'Mark each number on the line.',
  generate(seed, i, ch, r) {
    // MagPI 0-20 uses odd and landmark targets; mirror that spread.
    const pool = [1, 2, 3, 5, 7, 9, 10, 11, 13, 15, 17, 19];
    const target = pool[(i * 5 + 3) % pool.length];
    return {
      type: 'numberline', lo: 0, hi: 20, target, targetLabel: String(target),
      tolerance: 1.2,
      ticks: tickRange(0, 20, 1), majors: [0, 10, 20],
      labels: [[0, '0'], [10, '10'], [20, '20']],
      prompt: `Where does <strong>${target}</strong> go?`,
      printStem: `Mark <strong>${target}</strong> on the line.`,
      explain: `${target} sits ${target < 10 ? 'left of' : target > 10 ? 'right of' : 'right at'} the middle.`,
    };
  },
};

/* -------------------------------------------------------------- GAME: make ten race */
const makeTenRace = {
  id: 'make-ten-race', title: 'Make Ten Race', kind: 'game', grade: '1', strand: S[0],
  glyph: '⑩',
  skill: 'Instant recall of the pairs that make ten.',
  blurb: 'One number shows. Tap what it needs to make ten.',
  ccss: ['1.OA.C.6'],
  roam: [{ task: 'fluencyArf', subscale: 'sum' }],
  evidence: 'Automaticity on the pairs to ten frees working memory for everything built on top of them. This is short and repetitive on purpose: retrieval practice, not explanation, is what moves a fact from worked out to known.',
  rounds: 14, seconds: 45, printItems: 12,
  printInstruction: 'Write the number that makes ten.',
  generate(seed, i, ch, r) {
    const a = r.int(1, 9);
    const need = 10 - a;
    return {
      type: 'choice',
      prompt: `<strong>${a}</strong> and what make <strong>10</strong>?`,
      visual: tenFrame(a),
      choices: r.shuffle([need, need + 1, Math.max(1, need - 1), 10 - Math.max(1, need - 2)]
        .filter((v, k, s2) => v >= 0 && v <= 10 && s2.indexOf(v) === k).slice(0, 4)).map(String),
      answer: String(need),
      printStem: `${a} + ____ = 10`,
      explain: `${a} + ${need} = 10.`,
    };
  },
};

export default [addingToTwenty, tensAndOnes, halvesAndQuarters, numberLineHop, makeTenRace];
