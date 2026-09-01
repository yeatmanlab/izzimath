import { tenFrame, numberBond, numberLine, tickRange, baseTen, dots, esc, band3 } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { fill } from '../characters.js';
import { wordProblem } from '../wordproblems.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['1'];

/* ------------------------------------------------------------ BOOK: adding to twenty */
const addingToTwenty = {
  id: 'adding-to-twenty', title: 'Adding to Twenty', kind: 'book', grade: '1', strand: S[0],
  glyph: '+',
  skill: 'Addition and subtraction facts within 20, including the ones that cross ten.',
  trick: 'To cross ten, fill ten first. For 8 + 5, give the 8 two from the 5 to make 10, and 3 is left over — so 13.',
  blurb: 'Sums and differences to 20, starting with the easy ones.',
  ccss: ['1.OA.C.6', '1.OA.B.4'],
  im: [1, 2, 3],
  refs: ['im-scope-sequence', 'fuchs-2012-timed', 'codding-2011', 'geary-2011'],
  theory: 'Crossing ten is where counting on stops being efficient and a strategy must take over.',
  roam: [{ task: 'fluencyArf', subscale: 'sum' }, { task: 'fluencyArf', subscale: 'minus' }, { task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Sums within ten come first, then the sums that cross ten, then the matching subtractions. Crossing ten is the genuine step change: it is where counting on stops being efficient and a strategy (make ten, then add the rest) has to take over.',
  pages: 12, printItems: 4,
  printInstruction: 'Work out each one. Write the answer.',
  printInstructions: {
    choice: 'Add these. Write the total.',
    input: 'Work these out. Write the answer.',
  },
  generate(seed, i, ch, r) {
    // Every fifth item is a word problem, tagged by schema rather than by
    // operation — the structure is the thing being taught. A fixed stride
    // rather than a tail slice, for two reasons: the printable generates fewer
    // items than the book, so a tail slice gave some sheets none and one sheet
    // sixteen; and a stride of 5 does not collide with the i % 4 staging these
    // activities already use, so no stage gets wiped out.
    if (i % 5 === 4) {
      return wordProblem(r.pick(['join','separate','compare']), ch, r, { max: 20 });
    }
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
  id: 'tens-and-ones', title: 'Tens and Ones', kind: 'book', grade: '1', strand: S[2],
  glyph: '⑽',
  skill: 'Place value to 100 — reading a number as tens and ones, and adding without regrouping.',
  trick: 'The left digit counts tens, the right digit counts ones. Add tens to tens and ones to ones, and keep each in its own column.',
  blurb: 'How many tens? How many ones? Then add them up.',
  ccss: ['1.NBT.B.2', '1.NBT.C.4'],
  im: [4, 5],
  refs: ['im-scope-sequence', 'fyfe-2014-fading'],
  theory: 'Place value as composed units: ten ones become one ten.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'fluencyCalf', subscale: 'add-nocarry' }],
  evidence: 'Place value before regrouping. This book stays deliberately inside the no-carry case, because a child who is still working out what the tens digit means cannot also be learning to carry — the two together overload working memory.',
  pages: 12, printItems: 5,
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
  id: 'halves-and-quarters', title: 'Halves and Quarters', kind: 'book', grade: '1', strand: S[4],
  glyph: '◑',
  skill: 'Splitting shapes into equal parts, and naming a half and a quarter.',
  trick: 'Equal parts have to match. Two matching pieces are halves. Four matching pieces are quarters.',
  blurb: 'Split the shape fairly. Is that a half or a quarter?',
  ccss: ['1.G.A.3'],
  im: [7],
  refs: ['im-scope-sequence', 'fuchs-2013-fractions'],
  theory: 'Equal partitioning precedes fraction notation.',
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
  id: 'number-line-hop', title: 'Number Line Hop', kind: 'game', grade: '1', strand: S[2],
  glyph: '↦',
  skill: 'Estimating where a number sits on a 0–20 line.',
  goal: 'Drag the number to where it belongs on the line. You do not have to be exact — close counts.',
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: 'Find the middle first — 10 is halfway to 20. Then decide whether your number comes before or after the middle.',
  blurb: 'Drag the number to the right spot on the line.',
  ccss: ['1.NBT.B.3'],
  im: [4, 6],
  refs: ['wwc-2021-math', 'schneider-2018', 'siegler-ramani-2009'],
  theory: 'Number line estimation: mapping a numeral onto a spatial position.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_20' }],
  evidence: 'Linear number line practice is among the best-evidenced early number interventions there is — Siegler and Ramani’s work on linear board games showed gains in numerical magnitude that transferred to broader arithmetic. Ticks are provided at this stage so the child can count as well as estimate.',
  strategy: { name: 'Use the middle', text: 'Look at the middle label first. Is your number smaller than it, or bigger? That tells you which half to drop it in.' },
  rounds: 12, printItems: 6, seconds: 0, timerAvailable: false,
  printInstruction: 'Mark each number on the line.',
  generate(seed, i, ch, r) {
    /* MagPI 0-20 uses odd and landmark targets; mirror that spread.

       Banded by distance to the nearest LABELLED landmark (0, 10, 20), because
       that is what actually makes a placement hard — a number sitting next to a
       label can be read off, one in the middle of a gap has to be estimated.
       The band comes from the level so the ladder still means something; the
       target comes from the rng so a held rung does not ask the same question
       twice. It used to be `pool[(i * 5 + 3) % pool.length]`, which ignored the
       rng entirely and served "Where does 5 go?" three rounds running. */
    const pool = [1, 2, 3, 5, 7, 9, 10, 11, 13, 15, 17, 19];
    const gap = (v) => Math.min(Math.abs(v - 0), Math.abs(v - 10), Math.abs(v - 20));
    const target = r.pick(band3(pool, gap, i));
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
  goal: 'The ten-frame is part full. Say how many more you need to make ten.',
  trick: 'Learn them as pairs, not as sums: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. Five pairs is the whole thing.',
  blurb: 'One number shows. Tap what it needs to make ten.',
  ccss: ['1.OA.C.6'],
  im: [3],
  refs: ['fuchs-2012-timed', 'codding-2011', 'van-der-kleij-2015'],
  theory: 'Automaticity on pairs to ten frees working memory for everything built on them.',
  roam: [{ task: 'fluencyArf', subscale: 'sum' }],
  evidence: 'Automaticity on the pairs to ten frees working memory for everything built on top of them. This is short and repetitive on purpose: retrieval practice, not explanation, is what moves a fact from worked out to known.',
  strategy: { name: 'Fill the frame', text: 'Count the empty spaces in the ten-frame — that is the number you need.' },
  rounds: 14, printItems: 10, seconds: 45,
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


/* --------------------------------------------------- BOOK: all kinds of stories */
const allKindsOfStories = {
  id: 'all-kinds-of-stories', title: 'All Kinds of Stories', kind: 'book', grade: '1', strand: S[1],
  glyph: '❞',
  skill: 'Recognising the structure of a word problem — join, separate, part-whole or compare — and solving it whichever part is missing.',
  trick: 'Find the two numbers, then ask what the story does to them: puts together, takes away, or compares.',
  printScratch: true,
  blurb: 'Every kind of story problem, and how to tell them apart.',
  ccss: ['1.OA.A.1', '1.OA.A.2'],
  im: [2],
  refs: ['wwc-2021-math', 'im-scope-sequence', 'van-der-kleij-2015'],
  theory: 'Four structures cover almost every one-step story problem. A child who knows the structures can solve a problem whose wording they have never seen; a child who hunts for keywords cannot.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'fluencyArf', subscale: 'sum' }, { task: 'fluencyArf', subscale: 'minus' }],
  evidence: 'The single highest-value gap the research identified. WWC Recommendation 5 — teach the structure of word problems — is rated STRONG on 18 studies, and arithmetic fluency transfers to word problems only weakly (g=0.25), so this cannot be left to fall out of fact practice. Follows Illustrative Mathematics grade 1 unit 2, which devotes one section to each structure, and moves the unknown so the same structure is met in its easy and its hard form.',
  pages: 16, printItems: 5,
  printInstruction: 'Read each story. Write the number that answers it.',
  printInstructions: { input: 'Read each story. Write the number that answers it.' },
  generate(seed, i, ch, r) {
    // One section per structure, as IM does, then a mixed final section — which is
    // also where the interleaving evidence says the gains actually come from.
    const plan = [
      ['join', 'result'], ['join', 'change'], ['join', 'start'],
      ['separate', 'result'], ['separate', 'change'],
      ['partWhole', null], ['partWhole', null],
      ['compare', null], ['compare', null],
      // mixed: no two adjacent problems share a structure
      ['join', 'change'], ['compare', null], ['separate', 'change'],
      ['partWhole', null], ['join', 'start'], ['compare', null], ['separate', 'result'],
    ][i % 16];
    const p = wordProblem(plan[0], ch, r, { max: 20, min: 2, unknown: plan[1] });
    // From the mixed section on, name the structure in the hint rather than the
    // question — the grade-3 interleaving study needed an explicit strategy
    // comparison prompt for the benefit to show up.
    if (i >= 9) p.hint = `Read it again. Is something joining, leaving, being put together, or being compared? ${p.hint}`;
    return p;
  },
};


/* --------------------------------------------------- BOOK: clocks and rulers (G1 S4) */
const clocksAndRulers = {
  id: 'clocks-and-rulers', title: 'Clocks and Rulers', kind: 'book', grade: '1', strand: S[3],
  glyph: '◷',
  skill: 'Telling the time to the hour and half hour, and measuring length in whole units.',
  trick: 'The short hand says the hour. Half past is the long hand pointing straight down. When you measure, start at 0, not at the end of the ruler.',
  blurb: 'What time does the clock say? How many units long is it?',
  ccss: ['1.MD.A.2', '1.MD.B.3'],
  im: [6, 7],
  refs: ['im-scope-sequence'],
  theory: 'Measuring is repeating a unit and counting the repeats — the same composed-unit idea as place value, in a different dress.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Included as required curriculum coverage rather than as an evidence claim: the WWC early-childhood guide rates measurement and data recommendations only "minimal", so this strand is here because grade 1 needs it, not because a trial says it moves attainment. Measuring is framed as iterating a unit, which does connect to the place-value work.',
  pages: 10, printItems: 4,
  printInstruction: 'Read each clock and measure each bar.',
  printInstructions: { choice: 'What time is it?', input: 'How many units long?' },
  generate(seed, i, ch, r) {
    if (i % 2 === 0) {
      const h = r.int(1, 12), half = r.chance(0.5);
      const clock = (print = false) => {
        const st = print ? '#111' : 'var(--a1)';
        const ang = (h % 12) * 30 + (half ? 15 : 0);
        const mAng = half ? 180 : 0;
        const pt = (a, len) => [50 + len * Math.sin(a * Math.PI / 180), 50 - len * Math.cos(a * Math.PI / 180)];
        const [hx, hy] = pt(ang, 24), [mx, my] = pt(mAng, 34);
        let t = `<svg viewBox="0 0 100 100" width="112" height="112" role="img" aria-label="clock">
          <circle cx="50" cy="50" r="45" fill="none" stroke="${st}" stroke-width="3"/>`;
        for (let k = 0; k < 12; k++) {
          const [x1, y1] = pt(k * 30, 38), [x2, y2] = pt(k * 30, 43);
          t += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${print ? '#555' : 'var(--txt3)'}" stroke-width="2"/>`;
        }
        t += `<line x1="50" y1="50" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="${st}" stroke-width="4" stroke-linecap="round"/>`;
        t += `<line x1="50" y1="50" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="${st}" stroke-width="2.5" stroke-linecap="round"/>`;
        return t + `<circle cx="50" cy="50" r="3" fill="${st}"/></svg>`;
      };
      const right = half ? `half past ${h}` : `${h} o'clock`;
      const others = [half ? `${h} o'clock` : `half past ${h}`, `${h === 12 ? 1 : h + 1} o'clock`, `half past ${h === 1 ? 12 : h - 1}`];
      return {
        type: 'choice', prompt: 'What time is it?', visual: clock(), visualWidth: 130,
        choices: r.shuffle([right, ...others.filter((o) => o !== right).slice(0, 3)]),
        answer: right,
        printStem: 'What time is it?', printVisual: clock(true),
        hint: 'The short hand tells you the hour. If the long hand points straight down, it is half past.',
        explain: `The short hand is ${half ? 'between ' + h + ' and ' + (h === 12 ? 1 : h + 1) : 'on ' + h}, so it is ${right}.`,
      };
    }
    const len = r.int(3, 9);
    const bar = (print = false) => {
      const u = 22, st = print ? '#111' : 'var(--a1)';
      let t = `<svg viewBox="0 0 ${len * u + 8} 34" width="100%" height="34" role="img" aria-label="bar ${len} units long">`;
      t += `<rect x="3" y="6" width="${len * u}" height="20" fill="none" stroke="${st}" stroke-width="2.4"/>`;
      for (let k = 1; k < len; k++) t += `<line x1="${3 + k * u}" y1="6" x2="${3 + k * u}" y2="26" stroke="${print ? '#777' : 'var(--line2)'}" stroke-width="1.2"/>`;
      return t + `</svg>`;
    };
    return {
      type: 'input', prompt: 'How many units long is this bar?',
      visual: bar(), visualWidth: 240,
      answer: String(len), placeholder: '?',
      printStem: 'How many units long?', printVisual: bar(true),
      hint: 'Count the equal parts from one end to the other.',
      explain: `${len} units.`,
    };
  },
};

export default [addingToTwenty, allKindsOfStories, tensAndOnes, clocksAndRulers, halvesAndQuarters, numberLineHop, makeTenRace];
