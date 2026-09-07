import { tenFrame, doubleFrame, numberBond, numberLine, tickRange, baseTen, dots, esc, band3,
  clockFace, clockDigital, addMinutes, timeWords, pickRow, pickDecoys,
  coin, coinRow, COINS } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { fill } from '../characters.js';
import { wordProblem } from '../wordproblems.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['1'];

/* ------------------------------------------------------------ BOOK: adding to twenty */
const addingToTwenty = {
  id: 'adding-to-twenty', title: 'Adding to Twenty', kind: 'book', grade: '1', strand: S[0],
  /* IM opens with a routine, and the make-ten string is this book's own method
     said out loud before any of it is written down. */
  warmUp: { routine: 'number-talk', params: { ladder: 'make-ten', span: [6, 9] } },
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
  printMaxPages: 1,   // K/1 stay one page
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
  /* Every defence in this one is a place-value observation — a round ten, a
     repeated digit, more ones than tens — which is exactly what the book is
     about, argued rather than answered. */
  warmUp: { routine: 'wodb', params: { max: 99 } },
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
  printMaxPages: 1,   // K/1 stay one page
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
        /* `ones` first: reading the wrong digit is the mistake this item exists
           to catch. Then the off-by-ones, then wider fillers so a collision
           still leaves four options. */
        choices: r.shuffle([tens, ...pickDecoys(tens,
          [ones, tens + 1, tens - 1, tens + 2, tens - 2, ones + 1, 9, 0].filter((v) => v >= 0 && v <= 9))]).map(String),
        /* The printed stem used to be `${n} has ____ tens and ____ ones.` — two
           blanks against an answer of one digit, so the key printed "2" beside
           a question asking for two numbers and a parent marking it had nothing
           to check the second blank against. One blank, and the decomposition
           goes on the key as working instead. */
        answer: String(tens), printStem: `In ${n}, how many tens?`,
        printKeyWorking: true,
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
  lesson: 'fractions',
  skill: 'Splitting shapes into equal parts, and naming a half and a quarter.',
  trick: 'Equal parts have to match. Two matching pieces are halves. Four matching pieces are quarters.',
  blurb: 'Split the shape fairly. Is that a half or a quarter?',
  ccss: ['1.G.A.3'],
  im: [7],
  refs: ['im-scope-sequence', 'fuchs-2013-fractions'],
  theory: 'Equal partitioning precedes fraction notation.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Fractions begin as fair shares of a shape, with no symbols at all. The emphasis is on equal parts, since "split into four" and "split into four equal parts" are different claims and children routinely conflate them.',
  pages: 8, printItems: 5,   // measured: the wider set of stems wraps, so 6 spills
  printMaxPages: 1,   // K/1 stay one page
  printInstruction: 'Shade the part named under each shape.',
  printInstructions: {
    choice: 'Write how much of each bar is shaded.',
    truefalse: 'Are the parts equal? Circle T or F.',
  },
  generate(seed, i, ch, r) {
    const den = r.pick([2, 4]);
    /* Which parts are shaded, not just how many. A child who only ever sees the
       left-hand parts shaded can answer by looking at the picture's shape; making
       the shaded parts non-contiguous forces them to attend to the fraction. It
       also widens a very small item space — this sheet used to repeat itself. */
    const howMany = den === 2 ? 1 : r.pick([1, 1, 2, 3]);
    const shadedSet = r.sample([...Array(den).keys()], howMany);
    const shaded = howMany;
    const bar = (fillN, d, w = 260, print = false, set = null) => {
      const seg = w / d;
      let s = `<svg viewBox="0 0 ${w} 56" width="100%" height="56" role="img" aria-label="${fillN} of ${d} shaded">`;
      for (let k = 0; k < d; k++) {
        const on = set ? set.includes(k) : k < fillN;
        s += `<rect x="${k * seg}" y="2" width="${seg}" height="52" fill="${print ? 'none' : (on ? 'var(--a2)' : 'none')}" stroke="${print ? '#111' : 'var(--line2)'}" stroke-width="1.5"/>`;
        if (print && on) for (let h = -52; h < seg; h += 5)
          s += `<line x1="${(k * seg + h).toFixed(1)}" y1="54" x2="${(k * seg + h + 52).toFixed(1)}" y2="2" stroke="#111" stroke-width=".8"/>`;
      }
      return s + `<rect x="0" y="2" width="${w}" height="52" fill="none" stroke="${print ? '#111' : 'var(--txt3)'}" stroke-width="2"/></svg>`;
    };
    if (i % 2 === 0) {
      // 2 of 4 IS one half, and saying so is the point of the activity.
      const NAMES = { '1/2': 'one half', '1/4': 'one fourth', '2/4': 'one half', '3/4': 'three fourths' };
      const name = NAMES[`${shaded}/${den}`];
      const others = ['one half', 'one fourth', 'three fourths', 'one third', 'the whole thing']
        .filter((x) => x !== name);
      return {
        type: 'choice', prompt: 'How much of the bar is shaded?',
        visual: bar(shaded, den, 260, false, shadedSet), visualWidth: 300,
        choices: r.shuffle([name, ...r.sample(others, 3)]),
        answer: name,
        printStem: `Shade ${name}.`,
        printVisual: bar(0, den, 200, true),
        hint: `Count the equal parts. There are ${den}.`,
        explain: `${shaded} part${shaded === 1 ? '' : 's'} out of ${den} equal parts is ${name}.`,
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
  rounds: 12, printItems: 6,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 0, timerAvailable: false,
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
  rounds: 14, printItems: 10,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 45,
  printInstruction: 'Write the number that makes ten.',
  generate(seed, i, ch, r) {
    const a = r.int(1, 9);
    const need = 10 - a;
    /* There are only nine pairs that make ten, so nine problems — and the sheet
       asks for ten of them, which meant every printed sheet repeated one. Asking
       the same fact three ways fixes that honestly rather than by padding: the
       unknown moves (which is a real difficulty variation, the same one the CGI
       word problems use), and one form drops the numeral and asks the ten-frame
       directly. 9 pairs x 3 forms = 27. */
    const form = i % 3;
    const prompt = form === 0 ? `<strong>${a}</strong> and what make <strong>10</strong>?`
      : form === 1 ? `What and <strong>${a}</strong> make <strong>10</strong>?`
      : 'How many empty squares?';
    const printStem = form === 0 ? `${a} + ____ = 10`
      : form === 1 ? `____ + ${a} = 10`
      : `10 &minus; ${a} = ____`;   // the same fact, worded so paper needs no figure
    return {
      type: 'choice',
      prompt,
      visual: tenFrame(a),
      choices: r.shuffle([need, ...pickDecoys(need,
        [need + 1, need - 1, a, 10 - need + 1, need + 2, need - 2, 10, 1]
          .filter((v) => v >= 0 && v <= 10))]).map(String),
      answer: String(need),
      printStem,
      explain: form === 2
        ? `${a} squares are filled, so ${need} are empty. ${a} + ${need} = 10.`
        : `${a} + ${need} = 10.`,
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
  /* 1.OA.A.2 — "add three whole numbers" — used to be claimed here and was never
     generated: 96 items across six seeds, not one of them naming three numbers.
     It belongs to `add-three-numbers`, which meets it. */
  ccss: ['1.OA.A.1'],
  im: [2],
  refs: ['wwc-2021-math', 'im-scope-sequence', 'van-der-kleij-2015'],
  theory: 'Four structures cover almost every one-step story problem. A child who knows the structures can solve a problem whose wording they have never seen; a child who hunts for keywords cannot.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'fluencyArf', subscale: 'sum' }, { task: 'fluencyArf', subscale: 'minus' }],
  evidence: 'The single highest-value gap the research identified. WWC Recommendation 5 — teach the structure of word problems — is rated STRONG on 18 studies, and arithmetic fluency transfers to word problems only weakly (g=0.25), so this cannot be left to fall out of fact practice. Follows Illustrative Mathematics grade 1 unit 2, which devotes one section to each structure, and moves the unknown so the same structure is met in its easy and its hard form.',
  pages: 16, printItems: 5,
  printMaxPages: 1,   // K/1 stay one page
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
  lesson: 'time',
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
  printMaxPages: 1,   // K/1 stay one page
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
        /* The label was the word "clock", which told a screen reader nothing and
           left the hands unverifiable — the same defect barChart had when its
           label was "bar chart", and that is what let a tied tallest bar ship.
           It states the time the hands are drawn at, which does mean a
           screen-reader user is told the answer on the read-the-clock items.
           That is the trade the repo already makes for numberBond, and an
           unanswerable question is worse than a leaky one. */
        let t = `<svg viewBox="0 0 100 100" width="112" height="112" role="img" aria-label="clock showing ${h}:${half ? '30' : '00'}">
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

/* -------------------------------------------------------- GAME: double-frame flash */
const doubleFrameFlash = {
  id: 'double-frame-flash', title: 'Double-Frame Flash', kind: 'game', grade: '1', strand: S[0],
  glyph: '⁙',
  skill: 'Seeing a teen number as ten and some more, without counting all of it.',
  goal: 'Two frames flash up, then hide. Say how many dots there were altogether.',
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: 'The first frame is full, so it is ten. You only have to see the second one. Ten and three is thirteen.',
  printDensity: 'd2',
  blurb: 'Two frames flash. How many dots altogether?',
  ccss: ['1.NBT.B.2', '1.NBT.B.2.B', '1.OA.C.6'],
  im: [3, 4],
  refs: ['clements-1999', 'building-blocks-wwc', 'qiu-2021-ans', 'im-scope-sequence'],
  theory: 'A teen number is one ten and some ones, and the double frame makes that structure visible rather than asserted.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }, { task: 'fluencyArf', subscale: 'sum' }],
  evidence: 'Ten-Frame Flash trains subitizing up to ten; this is the same mechanic aimed at the place-value idea that follows it. The teens are where children who count everything start to fall behind children who see ten as a unit, and the double frame is the standard representation for that step — the first frame fills, so the answer is ten and whatever is in the second. The same caveat applies as at kindergarten: the ten-frame itself has no isolating trial behind it, but the exposure is brief and the quantity is always tied to a numeral, which is the part the evidence supports.',
  strategy: { name: 'Ten and some more', text: 'Do not count from one. The full frame is ten — start there and count on through the second frame.' },
  rounds: 12, printItems: 6,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 60,
  printInstruction: 'How many dots altogether? Write the number.',
  generate(seed, i, ch, r) {
    /* Banded so the ladder means something, and the band is about where the
       SECOND frame sits: 11 and 12 can be read off almost as a shape, and the
       upper teens are where "ten and some more" stops being optional. The full
       first frame is never varied — varying it turns this back into
       Ten-Frame Flash with more dots. */
    const n = i < 4 ? r.int(11, 14) : i < 8 ? r.int(13, 17) : r.int(15, 20);
    const ones = n - 10;
    /* Ordered: the off-by-ones first because those are the real miscounts, then
       the teen-reversal, then fillers so the pool cannot run short. */
    const near = [n + 1, n - 1, n + 2, n - 2, 10 + (10 - ones), ones + 10, n + 3, n - 3, 11, 20]
      .filter((v) => v >= 10 && v <= 20 && v !== n);
    return {
      type: 'choice', prompt: 'How many altogether?',
      visual: doubleFrame(n), visualWidth: 260,
      // Long enough to see two frames rather than one, short enough that
      // counting sixteen dots one at a time is not on the table.
      flashMs: i < 4 ? 1100 : i < 8 ? 850 : 650,
      choices: r.shuffle([String(n), ...pickDecoys(n, near, 3).map(String)]),
      answer: String(n),
      printStem: 'How many dots altogether?',
      printVisual: doubleFrame(n, { print: true }),
      hint: 'The first frame is full. That is ten. Now count on through the second frame.',
      explain: `The full frame is 10 and the second frame has ${ones}, so 10 and ${ones} makes ${n}.`,
    };
  },
};

/* ----------------------------------------------------------- GAME: hundred board
   The Great Race grown up. Same mechanic, same count-on rule, a hundred squares
   instead of ten — and laid out as a COLUMN-ALIGNED matrix, ten to a row with 1
   at the bottom left, so 11 sits directly above 1 and every column is a units
   digit. That is the place-value reading, and it is why this is not the
   Chutes-and-Ladders serpentine: reversing every other row would destroy the
   one alignment the board exists to show. */
const hundredBoard = {
  id: 'hundred-board', title: 'The Hundred Board', kind: 'game', grade: '1', strand: S[2],
  glyph: '⊞',
  skill: 'Counting on across a ten, on a board where the tens are rows and the ones are columns.',
  goal: 'You are on a square. Spin a number, then tap the squares you move through.',
  trick: 'Do not go back to one. Count on from the square you are on. Crossing the end of a row just means the next ten has started.',
  blurb: 'A hundred squares, ten to a row. Count on from where you are.',
  ccss: ['1.NBT.A.1', '1.NBT.B.2', '1.NBT.C.5'],
  im: [4, 5],
  refs: ['siegler-ramani-2009', 'laski-siegler-2014', 'wwc-2021-math', 'schneider-2018', 'im-scope-sequence'],
  theory: 'A hundred board is two structures at once: a linear count, and a base-ten grid in which moving up a row adds ten.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_100' }, { task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'The linear board game is the strongest causal result in early number — Siegler and Ramani (2009) found number-line error dropping from 29% to 21% after about an hour of play, and the same game on a circular board did almost nothing, so the left-to-right layout is doing the work. Laski and Siegler (2014) then showed the counting rule matters as much as the board: counting on from where the token is produced roughly double the gains of counting from one. This is the 0–100 version of that, and the column alignment adds the base-ten reading the ten-square board cannot show — the squares directly above each other share a ones digit, so crossing a row is what adding ten looks like. Expectations belong at the pooled meta-analytic g = 0.21 (Nelson 2025), not the original d.',
  strategy: { name: 'Count on', text: 'Start on the number you are already on and count on. On 38 and spinning 3? Say “thirty-nine, forty, forty-one”.' },
  /* Measured, not guessed: the board is 2.5in of the page, and eight spin lines
     under it runs to 10.14in. Seven fits at 9.67in. */
  rounds: 12, printItems: 7,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 0, timerAvailable: false,
  printInstruction: 'Use the board. For each spin, write the squares you move through.',
  generate(seed, i, ch, r) {
    const N = 100, COLS = 10;
    const spin = r.int(1, 5);
    /* The token climbs the board across the rounds, so later rounds start
       further along — and the START is chosen to sit near the end of a row for
       most of them, because crossing from 39 to 40 is the whole difficulty and
       a spin inside a row is nearly free. */
    /* Banded, then picked with the rng. Pinning the decade straight to `i`
       collapsed the item space to about fifteen combinations, and rounds 4 and 5
       came out identical; the game passes the LADDER RUNG as `i`, so a held rung
       has to stay fresh too. */
    const [lo, hi] = i < 4 ? [1, 4] : i < 8 ? [3, 7] : [5, 9];
    const decade = r.int(lo, hi);
    const nearEdge = i % 3 !== 0;
    const from = nearEdge
      ? decade * 10 - r.int(0, Math.min(3, spin - 1))   // about to cross into the next ten
      : decade * 10 + r.int(1, Math.max(1, 9 - spin));  // comfortably inside a row
    const start = Math.max(1, Math.min(N - spin, from));
    const answer = [];
    for (let k = 1; k <= spin; k++) answer.push(start + k);
    // A row change is a change of DECADE, not a multiple of ten in the trail:
    // 40 -> 41, 42 crosses a row and contains no multiple of ten at all.
    const row = (v) => Math.floor((v - 1) / 10);
    const crosses = row(answer[answer.length - 1]) !== row(start);
    return {
      type: 'boardmove', from: start, spin, hi: N, cols: COLS, answer,
      hint: `You are on ${start}. The next square is ${start + 1}.`,
      explain: `Counting on from ${start}: ${answer.join(', ')}.${
        crosses ? ` The row ended at ${row(start) * 10 + 10}, so ${answer[answer.length - 1]} is in the row above ${start} — one row up is ten more.` : ''}`,
    };
  },
};


/* ------------------------------------------------- BOOK: clocks and time (G1 S4)
   The dedicated time module. `clocks-and-rulers` stays as it is — it pairs
   reading a clock with measuring a bar, which is how IM's grade-1 Unit 7 runs —
   but a child who cannot tell the time needs more than every other page.

   WHAT THE RESEARCH SAYS, AND WHAT THAT CHANGES
   The acquisition order confirmed for grades 1-3 is hour, half hour, quarter
   hour, five minutes, minute, and "past" is easier than "to". Grade 1 owns the
   first two (1.MD.B.3), so nothing here goes past the half hour and nothing
   says "to".

   The misconception worth building around is not the minute hand. Children read
   2:30 as "half past three", because they were told the short hand points at
   the hour and right now it looks nearest the 3. So the short hand is the
   subject of the trick, of the hint, of two of the six item kinds, and of the
   animated lesson at /learn/time/ — which exists because the fix reported
   everywhere is WATCHING THE HAND MOVE from the o'clock, and that is the one
   thing a printed sheet cannot do.

   1.MD.B.3 says analog AND digital, and the sources are consistent that showing
   the two together is what builds the association, so mode 2 pairs them
   directly rather than teaching them in separate halves. */
const clocksAndTime = {
  id: 'clocks-and-time', title: 'Clocks and Time', kind: 'book', grade: '1', strand: S[3],
  glyph: '◔',
  lesson: 'time',
  skill: 'Telling and writing time to the hour and half hour, on analog and digital clocks.',
  trick: 'The SHORT hand says the hour and the LONG hand says the minutes. When the short hand sits between two numbers, the hour is the smaller one — half past 4 has the short hand between the 4 and the 5.',
  printDensity: 'd2',
  printMaxPages: 1,   // K/1 stay one page
  blurb: 'What time is it? Read the clock, then find the clock that matches.',
  ccss: ['1.MD.B.3'],
  im: [7],
  refs: ['im-scope-sequence', 'im-k5'],
  theory: 'The hour hand is the difficult one. It moves continuously, so at half past it sits between two numbers, and a child taught only "the short hand points at the hour" will read the larger of the two. Every item kind here either states where the short hand is or asks for it.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Stated plainly, because the site does not claim what it cannot support: there is no efficacy trial behind this activity. What exists is a descriptive literature on the acquisition order — hour, half hour, quarter, five minutes, minute, confirmed across grades 1 to 3, with "past" easier than "to" — and consistent teaching guidance that the hour-hand error is corrected by watching the hand travel rather than by being told. That is a claim about a mechanism, not an effect size, and it is why the animated lesson exists and why the ordering stops at the half hour. The coverage argument is the stronger one: 1.MD.B.3 asks for analog and digital, and the catalogue had one activity that mixed clocks with rulers.',
  /* Measured, not chosen. At the screen figure size this fitted only two items
     a page; giving the pick options their own 54px print figures took it to
     five. Six is a cliff rather than a slope — 9.90in at five, 11.64in at six —
     which is the same shape fold-and-sort found. */
  pages: 12, printItems: 5,
  printInstruction: 'Read each clock. The short hand is the hour.',
  printInstructions: {
    choice: 'Write the time, or the word, on the line.',
    pick: 'Circle the clock that matches.',
  },
  generate(seed, i, ch, r, bookSeed = 0) {
    const mode = i % 6;
    const h = r.int(1, 12);
    const half = r.chance(0.5);
    const m = half ? 30 : 0;
    const nextH = h === 12 ? 1 : h + 1;

    // 0 — read an analog clock
    if (mode === 0) {
      const right = timeWords(h, m);
      const prevH = h === 1 ? 12 : h - 1;
      /* Three DISTINCT decoys. The third used to be `timeWords(nextH, 30)` on
         half-past items, which is the same string as the second one — so a
         quarter of these questions collapsed to three options after the dedupe,
         and the one that mattered ("half past 5" for 4:30) still appeared but
         the item looked malformed. Half past the PREVIOUS hour is distinct from
         both and is a plausible misread in its own right. */
      const wrong = [
        timeWords(h, half ? 0 : 30),                     // the other half of this hour
        timeWords(nextH, m),                             // the next hour: the hour-hand misread
        half ? timeWords(prevH, 30) : timeWords(prevH, 0),
      ].filter((w) => w !== right);
      return {
        type: 'choice',
        prompt: `What time is it?${clockFace(h, m, { size: 150 })}`,
        visualWidth: 170,
        choices: r.shuffle([right, ...r.sample([...new Set(wrong)], 3)]),
        answer: right,
        printStem: 'What time is it?',
        printVisual: clockFace(h, m, { print: true, size: 72 }),
        hint: half
          ? 'The long hand points straight down, so it is half past. The short hand is between two numbers — take the smaller one.'
          : 'The long hand points straight up at the 12, so it is an o’clock. The short hand tells you which one.',
        explain: half
          ? `Half past ${h}. The long hand is halfway round, and the short hand is between the ${h} and the ${nextH} — it has left the ${h} but not reached the ${nextH}, so the hour is still ${h}.`
          : `${h} o’clock. The long hand is straight up, so there are no extra minutes, and the short hand points at the ${h}.`,
      };
    }

    // 1 — pick the clock that shows a stated time
    if (mode === 1) {
      const said = timeWords(h, m);
      const decoys = [
        { h, m: half ? 0 : 30 },
        { h: nextH, m },
        { h: h === 1 ? 12 : h - 1, m: half ? 30 : 0 },
      ];
      /* Two sets of figures, not one recoloured set. Print gets its own at 66px
         because four clock faces at screen size took the sheet to 10.57in of a
         10.1in page — measured, not guessed. 66 rather than the 54 this first
         shipped at: a block of picks now lays out in two columns whatever the
         sheet's density (see printsheet.js), and a two-column cell has room for
         four faces at 66px on one line with nothing shrunk.
         `print: true` also gives the ink colours properly rather than by
         string-replacing CSS variables out of the screen SVG. */
      const opts = r.shuffle([{ h, m, right: true }, ...decoys.map((d) => ({ ...d, right: false }))])
        .map((o, k) => ({ id: 'abcd'[k], figure: clockFace(o.h, o.m, { size: 96 }),
          printFigure: clockFace(o.h, o.m, { print: true, size: 66 }), right: o.right }));
      const answer = opts.find((o) => o.right).id;
      return {
        type: 'pick',
        prompt: `Which clock shows <strong>${said}</strong>?`,
        options: opts.map(({ id, figure }) => ({ id, figure })),
        answer,
        answerSay: said,
        printStem: `Which clock shows ${said}?`,
        printVisual: pickRow(opts.map(({ id, printFigure }) => ({ id, figure: printFigure })), { print: true }),
        hint: half
          ? 'Half past means the long hand points straight down.'
          : 'An o’clock means the long hand points straight up at the 12.',
        explain: half
          ? `Half past ${h} has the long hand straight down and the short hand between the ${h} and the ${nextH}.`
          : `${h} o’clock has the long hand straight up and the short hand on the ${h}.`,
      };
    }

    // 2 — analog and digital say the same thing (1.MD.B.3 asks for both)
    if (mode === 2) {
      const said = timeWords(h, m);
      const decoys = [{ h, m: half ? 0 : 30 }, { h: nextH, m }, { h: h === 1 ? 12 : h - 1, m }];
      const opts = r.shuffle([{ h, m, right: true }, ...decoys.map((d) => ({ ...d, right: false }))])
        .map((o, k) => ({ id: 'abcd'[k], figure: clockDigital(o.h, o.m, { size: 104 }),
          printFigure: clockDigital(o.h, o.m, { print: true, size: 66 }), right: o.right }));
      const answer = opts.find((o) => o.right).id;
      return {
        type: 'pick',
        prompt: `This clock says <strong>${said}</strong>. Which digital clock says the same time?${clockFace(h, m, { size: 132 })}`,
        visualWidth: 150,
        options: opts.map(({ id, figure }) => ({ id, figure })),
        answer,
        answerSay: `${h}:${String(m).padStart(2, '0')}`,
        printStem: `The clock says ${said}. Which digital clock says the same?`,
        printVisual: pickRow(opts.map(({ id, printFigure }) => ({ id, figure: printFigure })), { print: true }),
        hint: 'A digital clock writes the hour, then the minutes. Half an hour is 30 minutes.',
        explain: `${said} is written ${h}:${String(m).padStart(2, '0')}. The hour comes first, then the minutes — and half an hour is 30 minutes, not 50.`,
      };
    }

    // 3 — a word problem, whole hours only at this grade
    if (mode === 3) {
      const add = r.int(1, 3);
      const then = addMinutes(h, m, add * 60);
      const said = timeWords(h, m);
      const decoys = [
        addMinutes(h, m, (add + 1) * 60),
        addMinutes(h, m, (add - 1) * 60 || 30),
        { h: then.h, m: then.m === 30 ? 0 : 30 },
      ];
      const opts = r.shuffle([{ ...then, right: true }, ...decoys.map((d) => ({ ...d, right: false }))])
        .map((o, k) => ({ id: 'abcd'[k], figure: clockFace(o.h, o.m, { size: 96 }),
          printFigure: clockFace(o.h, o.m, { print: true, size: 66 }), right: o.right }));
      const answer = opts.find((o) => o.right).id;
      const stem = `It is ${said}. ${fill('{Actor}', ch)} gets dinner in ${add} ${add === 1 ? 'hour' : 'hours'}.`;
      return {
        type: 'pick',
        prompt: `${esc(stem)} Which clock shows dinner time?`,
        options: opts.map(({ id, figure }) => ({ id, figure })),
        answer,
        answerSay: timeWords(then.h, then.m),
        printStem: `${stem} Which clock shows dinner time?`,
        printVisual: pickRow(opts.map(({ id, printFigure }) => ({ id, figure: printFigure })), { print: true }),
        hint: `Count on ${add} ${add === 1 ? 'hour' : 'hours'} from ${said}. The long hand ends up where it started.`,
        explain: `${said} and ${add} more ${add === 1 ? 'hour' : 'hours'} is ${timeWords(then.h, then.m)}. Adding whole hours moves the short hand and leaves the long hand where it was.`,
      };
    }

    // 4 — which hand is which. The vocabulary the other five kinds assume.
    if (mode === 4) {
      const askHour = r.chance(0.5);
      const right = askHour ? 'the short hand' : 'the long hand';
      return {
        type: 'choice',
        prompt: `Which hand tells you the <strong>${askHour ? 'hour' : 'minutes'}</strong>?${clockFace(h, m, { size: 132 })}`,
        visualWidth: 150,
        choices: r.shuffle(['the short hand', 'the long hand', 'both hands', 'the numbers round the edge']),
        answer: right,
        printStem: `Which hand tells you the ${askHour ? 'hour' : 'minutes'}? (short / long)`,
        printVisual: clockFace(h, m, { print: true, size: 66 }),
        hint: 'One hand is short and fat, the other is long and thin. They do different jobs.',
        explain: askHour
          ? 'The short hand tells you the hour. It moves slowly — all the way round takes twelve hours.'
          : 'The long hand tells you the minutes. It moves quickly — all the way round takes one hour.',
      };
    }

    // 5 — the misconception, asked directly and in words
    const lo = r.int(1, 12);
    const hi = lo === 12 ? 1 : lo + 1;
    return {
      type: 'choice',
      prompt: `The short hand is <strong>between the ${lo} and the ${hi}</strong>, and the long hand points straight down. What time is it?`,
      choices: r.shuffle([`half past ${lo}`, `half past ${hi}`, `${lo} o’clock`, `${hi} o’clock`]),
      answer: `half past ${lo}`,
      printStem: `The short hand is between the ${lo} and the ${hi} and the long hand points straight down. What time is it?`,
      hint: 'The long hand straight down means half past. Now: which hour has the short hand not finished yet?',
      explain: `Half past ${lo}. The short hand has left the ${lo} but has not reached the ${hi}, so the hour is still ${lo} — this is the one that catches people out.`,
    };
  },
};


/* ------------------------------------------- BOOK: dimes and pennies (G1 S3)
   MONEY AT GRADE 1, WITHOUT A MONEY STANDARD
   CCSS has no grade-1 money standard. Money is 2.MD.C.8 and nothing earlier;
   IM agrees, putting it in grade-2 Unit 6. So this is not a money activity
   pretending to be in the sequence — it is a PLACE VALUE activity, 1.NBT.B.2
   and IM Unit 4 "Numbers to 99", that uses coins as the manipulative.

   And the fit is exact rather than convenient. A dime is ten cents and a penny
   is one, so three dimes and four pennies is thirty-four — which is the tens
   and ones of 34, made of objects a child has held. `tens-and-ones` teaches the
   same structure with base-ten blocks; this is the same lesson with the
   manipulative swapped for something that exists outside school.

   WHICH COINS, AND WHY NOT ALL FOUR
   Dimes and pennies only, plus the nickel named and set beside two-of-it. A
   quarter is twenty-five, which is not a place, and a nickel is five, which is
   not either — so counting a handful of all four is grade 2's job and Money
   Math does it. Every source says one coin at a time before mixing, which
   points the same way. */
const dimesAndPennies = {
  id: 'dimes-and-pennies', title: 'Dimes and Pennies', kind: 'book', grade: '1', strand: S[2],
  glyph: '⑽',
  lesson: 'money',
  skill: 'Knowing the coins by name, and counting dimes and pennies as tens and ones.',
  trick: 'A dime is ten and a penny is one. So dimes are the tens and pennies are the ones — three dimes and four pennies is 34 cents, exactly like 3 tens and 4 ones is 34.',
  printDensity: 'd2',
  printMaxPages: 1,   // K/1 stay one page
  blurb: 'A dime is ten pennies. Count the dimes, then the pennies.',
  ccss: ['1.NBT.B.2'],
  im: [4],
  refs: ['im-scope-sequence', 'im-k5'],
  theory: 'Dimes and pennies are a place-value manipulative that exists outside the classroom. The structure is identical to base-ten blocks — ten of the small one makes the big one — with the difference that a child has seen coins used, which is the case for almost no other manipulative on this site.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Stated plainly, because it matters here more than usual: Common Core has NO grade-1 money standard, and neither does Illustrative Mathematics. This activity is mapped to 1.NBT.B.2 — that ten ones make a ten — and to IM Unit 4 "Numbers to 99", because counting dimes and pennies IS counting tens and ones and the mapping is structural rather than a stretch. It is not offered as money instruction ahead of the standard: quarters and mixed handfuls are 2.MD.C.8 and Money Math has them. Coin NAMING is included because grade 2 assumes it and several state frameworks place it at grade 1, and the literature is consistent that coins should be met one at a time before being mixed. No efficacy trial sits behind any of that.',
  pages: 10, printItems: 4,
  printInstruction: 'A dime is 10 and a penny is 1. Count the dimes first.',
  printInstructions: {
    input: 'How many cents? Write the number.',
    pick: 'Circle the coin.',
    choice: 'Circle the answer.',
  },
  generate(seed, i, ch, r, bookSeed = 0) {
    const mode = i % 5;

    // 0 — count dimes and pennies: tens and ones with coins
    if (mode === 0) {
      const tens = r.int(1, 8), ones = r.int(1, 9);
      const hand = [...Array(tens).fill('dime'), ...Array(ones).fill('penny')];
      const total = tens * 10 + ones;
      return {
        type: 'input', accept: null,
        prompt: `How many cents?${coinRow(hand, { size: 44 })}`,
        visualWidth: 420,
        answer: String(total),
        placeholder: 'cents',
        printStem: 'How many cents?',
        printVisual: coinRow(hand, { print: true, size: 32 }),
        hint: 'Count the dimes in tens first: 10, 20, 30… then count the pennies on, one at a time.',
        explain: `${total} cents. ${tens} ${tens === 1 ? 'dime' : 'dimes'} is ${tens * 10}, and ${ones} more ${ones === 1 ? 'penny' : 'pennies'} makes ${total} — the same as ${tens} tens and ${ones} ones.`,
      };
    }

    // 1 — the place-value link, said out loud
    if (mode === 1) {
      const tens = r.int(2, 8), ones = r.int(1, 9);
      const total = tens * 10 + ones;
      const askDimes = r.chance(0.5);
      return {
        type: 'input', accept: null,
        prompt: `${esc(`You have ${total} cents in dimes and pennies.`)} How many <strong>${askDimes ? 'dimes' : 'pennies'}</strong> is that?`,
        answer: String(askDimes ? tens : ones),
        placeholder: askDimes ? 'dimes' : 'pennies',
        printStem: `${total} cents in dimes and pennies. How many ${askDimes ? 'dimes' : 'pennies'}?`,
        hint: askDimes ? 'How many tens are in the number?' : 'How many ones are in the number?',
        explain: askDimes
          ? `${tens} dimes. ${total} has ${tens} tens in it, and each dime is a ten.`
          : `${ones} pennies. ${total} has ${ones} ones in it, and each penny is a one.`,
      };
    }

    // 2 — name the coin. Three only: the quarter is grade 2's.
    if (mode === 2) {
      const kinds = ['penny', 'nickel', 'dime'];
      const want = r.pick(kinds);
      const opts = r.shuffle(kinds).map((k, n) => ({ id: 'abc'[n], kind: k, figure: coin(k, { size: 62 }) }));
      const answer = opts.find((o) => o.kind === want).id;
      return {
        type: 'pick',
        prompt: `Which one is the <strong>${COINS[want].name}</strong>?`,
        options: opts.map(({ id, figure }) => ({ id, figure })),
        answer,
        answerSay: `the ${COINS[want].name}, ${COINS[want].value} ${COINS[want].value === 1 ? 'cent' : 'cents'}`,
        printStem: `Which one is the ${COINS[want].name}?`,
        printVisual: pickRow(opts.map(({ id, kind }) => ({ id, figure: coin(kind, { print: true, size: 44 }) })), { print: true }),
        hint: 'Each coin has its own number written on it.',
        explain: `A ${COINS[want].name} is ${COINS[want].value} ${COINS[want].value === 1 ? 'cent' : 'cents'}.${
          want === 'dime' ? ' It is the smallest one, and it is still worth the most of these three.' : ''}`,
      };
    }

    // 3 — how many pennies make one, which is the ten-ones-make-a-ten idea
    if (mode === 3) {
      const which = r.chance(0.5) ? 'dime' : 'nickel';
      const n = COINS[which].value;
      return {
        type: 'input', accept: null,
        prompt: `How many <strong>pennies</strong> are worth the same as one <strong>${which}</strong>?${coinRow([which], { size: 54 })}`,
        visualWidth: 200,
        answer: String(n),
        placeholder: 'pennies',
        printStem: `How many pennies are worth one ${which}?`,
        printVisual: coinRow([which], { print: true, size: 38 }),
        hint: `Look at the number written on the ${which}.`,
        explain: `${n} pennies. A ${which} is ${n} cents, and a penny is 1 cent, so it takes ${n} of them.${
          which === 'dime' ? ' Ten ones make a ten — the same rule as the blocks.' : ''}`,
      };
    }

    // 4 — worth more, where size is the wrong guide
    const pair = r.pick([['dime', 'penny'], ['dime', 'nickel'], ['nickel', 'penny']]);
    const [big, small] = pair;
    const flip = r.chance(0.5);
    return {
      type: 'choice',
      prompt: `Which is worth <strong>more</strong>?`,
      choices: flip ? [`a ${big}`, `a ${small}`] : [`a ${small}`, `a ${big}`],
      answer: `a ${big}`,
      printStem: `Which is worth more: a ${big} or a ${small}?`,
      hint: 'Go by the number on the coin, not by how big the coin is.',
      explain: `A ${big} is ${COINS[big].value} cents and a ${small} is ${COINS[small].value}, so the ${big} is worth more.${
        big === 'dime' && small === 'nickel' ? ' And the dime is the SMALLER coin — size is no help at all.' : ''}`,
    };
  },
};


/* ---------------------------------------------------- BOOK: adding three numbers
   REQUESTED BY A FIRST GRADER, from an IXL page, and it turned out to fill two
   holes rather than add a fourth addition activity:

     · 1.OA.A.2 is "add three whole numbers whose sum is at most 20", and
       `all-kinds-of-stories` CLAIMED it while generating nothing of the kind —
       96 items across six seeds, none of them naming three numbers. The claim
       has moved here, to the activity that earns it.
     · 1.OA.B.3, properties of operations used as strategies, was not covered
       anywhere on the site. That is the interesting half: given 7 + 3 + 5 you
       may add any pair first, so add the pair that makes ten.

   Nothing else on the site adds three numbers in one expression — the only
   three-term stem anywhere is a grade-4 angle sum.

   WHERE IT SITS IN THE SEQUENCE. Downstream of two things grade 1 already has,
   and it is placed second in the export list so it appears directly after its
   prerequisite on the grade page: `make-ten-race` drills the pairs that make ten
   (1 and 9, 2 and 8 …) and `adding-to-twenty` teaches filling ten first. This
   activity is where that pair knowledge stops being a fact to recall and becomes
   a CHOICE — which two of these three do I start with. The trick says so, and
   the hints name make-ten by the same words the other two use, because a
   strategy called something different in two places reads as two strategies. */
const addThreeNumbers = {
  id: 'add-three-numbers', title: 'Adding Three Numbers', kind: 'book', grade: '1', strand: S[0],
  glyph: '⊕',
  skill: 'Adding three one-digit numbers, and choosing which two to add first.',
  trick: 'Add two of them first, then add the last one. You may start with ANY two — so look for a pair that makes ten, because that is the easiest pair to start from.',
  blurb: 'Three numbers at once. Find the pair that makes ten and start there.',
  ccss: ['1.OA.A.2', '1.OA.B.3'],
  im: [2, 3],
  refs: ['im-scope-sequence', 'im-k5', 'fuchs-2012-timed', 'codding-2011'],
  theory: 'Three addends are where the associative property stops being a fact about arithmetic and becomes a decision the child makes. The sum is fixed; the route is not, and choosing the route is the skill.',
  roam: [{ task: 'fluencyArf', subscale: 'sum' }, { task: 'roamAlpaca', subscale: 'cat2' }],
  evidence: 'Two standards, and both were gaps. 1.OA.A.2 (add three whole numbers whose sum is at most 20) was claimed by all-kinds-of-stories, which generated no three-addend item in 96 tries; the claim now sits on the activity that meets it. 1.OA.B.3 (use properties of operations as strategies) was not covered anywhere. The make-ten route is the same one adding-to-twenty already teaches and make-ten-race already drills, so this asks for no new strategy — only for the child to spot where to apply it. No efficacy trial sits behind the three-addend format specifically; it is in the standard, it is in IM Units 2 and 3, and it is what a first grader asked for.',
  pages: 12, printItems: 4,   // measured: 5 spills to 10.63in of a 10.1in page
  printMaxPages: 1,   // K/1 stay one page
  printInstruction: 'Add two of them first, then add the last one.',
  printInstructions: {
    input: 'Add two first, then add the last. Write the answer.',
    /* Both, because both are on the page: a `choice` prints its stem and an
       answer line, and this stem carries the three pairs. Saying only "circle"
       leaves the box unexplained; saying only "write" ignores that circling is
       easier for a six-year-old. */
    choice: 'Circle the pair you would add first, or write it in the box.',
  },
  generate(seed, i, ch, r, bookSeed = 0) {
    const mode = i % 5;

    // A trio where exactly one pair makes ten, so "find the pair" has one answer.
    const makeTenTrio = () => {
      /* NOT 5. a = 5 makes b = 5 too, and then the three pairs are 5+5, 5+c and
         5+c — the same option twice, which is the repeated-option defect the
         checker looks for and which reads as a broken question on the page. */
      const a = r.pick([2, 3, 4, 6, 7, 8]);
      const b = 10 - a;
      /* The third addend must not make ten with either of the others, or the
         "which pair" question has two right answers — which is the tied-answer
         defect the checker looks for. */
      let c = r.int(2, 9);
      let guard = 0;
      while ((a + c === 10 || b + c === 10 || c === a || c === b) && guard++ < 40) c = r.int(2, 9);
      return r.shuffle([a, b, c]);
    };

    // 0 — the total, with a make-ten pair sitting in it
    if (mode === 0) {
      const [x, y, z] = makeTenTrio();
      const pair = [x, y, z].find((n, k) => [x, y, z].some((m, j) => j !== k && n + m === 10));
      const other = [x, y, z].filter((n, k) => k !== [x, y, z].indexOf(pair)).find((n) => pair + n === 10);
      const rest = x + y + z - pair - other;
      return {
        type: 'input', accept: null,
        prompt: `${x} + ${y} + ${z} = ?`,
        answer: String(x + y + z),
        placeholder: 'total',
        printStem: `${x} + ${y} + ${z} = ____`,
        hint: 'Two of these three make ten. Find them, add them first, then add the one that is left.',
        explain: `${x + y + z}. ${pair} and ${other} make 10, and then 10 and ${rest} is ${x + y + z}. Starting with the pair that makes ten is the easy route.`,
      };
    }

    // 1 — which pair would you add first? The strategy, on its own.
    if (mode === 1) {
      const [x, y, z] = makeTenTrio();
      const pairs = [[x, y], [y, z], [x, z]];
      const right = pairs.find(([a, b]) => a + b === 10);
      const say = ([a, b]) => `${a} and ${b}`;
      return {
        type: 'choice',
        prompt: `${x} + ${y} + ${z}<br>Which two would you add first?`,
        choices: r.shuffle(pairs.map(say)),
        answer: say(right),
        /* The options are written into the STEM, because a choice item prints as
           a write-in and never emits its options — so "circle the pair" is only
           a true instruction if the pairs are on the page. */
        printStem: `${x} + ${y} + ${z} — which two first: ${
          pairs.slice(0, -1).map(say).join(', ')}, or ${say(pairs[pairs.length - 1])}?`,
        hint: 'You are looking for the two that make ten.',
        explain: `${say(right)}, because they make 10. Then 10 and ${x + y + z - 10} is ${x + y + z}. You are allowed to start with any two, so start with the easiest.`,
      };
    }

    // 2 — the two-step scaffold, written out. This is the page a first grader
    //     brought in: add the first two, write it down, then add the last.
    if (mode === 2) {
      const x = r.int(2, 6), y = r.int(1, 4), z = r.int(1, 5);
      const first = x + y;
      return {
        type: 'input', accept: null,
        prompt: `${x} + ${y} + ${z}<br><span class="sub">Add the first two, then add the last one.</span>`,
        answer: String(first + z),
        /* Two blanks on paper, so the key needs two numbers — the running total
           and the answer. `answer` stays the single value the screen marks. */
        answerSay: `${first}, then ${first + z}`,
        placeholder: 'total',
        printStem: `${x} + ${y} + ${z}:&nbsp; ____ + ${z} = ____`,
        hint: `Start at the left. ${x} and ${y} first, then add the ${z}.`,
        explain: `${x} + ${y} is ${first}, and ${first} + ${z} is ${first + z}. Two small steps instead of one big one.`,
      };
    }

    // 3 — a story with three quantities in it, which is what 1.OA.A.2 asks for
    if (mode === 3) {
      const [x, y, z] = makeTenTrio();
      /* `.many`, not the bare field — `collectible` is `{one, many}` and
         interpolating the object printed "[object Object]" in every story.
         content/wordproblems.js has always used `{collectible.many}`; this was
         the one place that did not. */
      const thing = fill('{collectible.many}', ch);
      const where = fill('{unit.one}', ch);
      /* `{Actor}`, not `{Name}` — with Just math selected the name is the words
         "Just math", so the story read "Just math found 8 counters". `actor` is
         the field that carries a person for every pack, "Sam" when nobody is
         chosen, which is what content/wordproblems.js has always used. */
      const stem = fill(`{Actor} found ${x} ${thing} on one ${where}, ${y} on the next one and ${z} on the one after that.`, ch);
      return {
        type: 'input', accept: null, schema: 'partWhole',
        prompt: `${esc(stem)} How many did ${esc(fill('{Actor}', ch))} find altogether?`,
        answer: String(x + y + z),
        placeholder: 'how many',
        printStem: `${stem} How many altogether?`,
        hint: 'Three numbers to put together. Add two of them first, and look for a pair that makes ten.',
        explain: `${x + y + z} altogether. Two of the three make ten, so add those first and then add the last one on.`,
      };
    }

    // 4 — the same three numbers in a different order. The point is that you do
    //     NOT have to add again, which is the property rather than the sum.
    const [x, y, z] = makeTenTrio();
    const total = x + y + z;
    return {
      type: 'input', accept: null,
      prompt: `${x} + ${y} + ${z} = ${total}.<br>So what is ${z} + ${x} + ${y}?`,
      answer: String(total),
      placeholder: 'total',
      printStem: `${x} + ${y} + ${z} = ${total}.  So ${z} + ${x} + ${y} = ____`,
      hint: 'Look carefully. Are they the same three numbers?',
      explain: `${total}, the same as before. They are the same three numbers in a different order, and moving them round cannot change how many there are — so you do not have to add it again.`,
    };
  },
};

export default [addingToTwenty, addThreeNumbers, allKindsOfStories, tensAndOnes, clocksAndRulers, halvesAndQuarters, numberLineHop, makeTenRace, doubleFrameFlash, hundredBoard, clocksAndTime, dimesAndPennies];
