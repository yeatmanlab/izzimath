import { tenFrame, dots, numberBond, numberLine, tickRange, array2d, esc } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { fill } from '../characters.js';
import { wordProblem } from '../wordproblems.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['K'];

/* ---------------------------------------------------------------- BOOK: counting crew */
const countingCrew = {
  id: 'counting-crew', title: 'Counting Crew', kind: 'book', grade: 'K', strand: S[0],
  glyph: '5',
  skill: 'Counting to 20, saying how many, naming what comes next, and finding a position in a line.',
  trick: 'Touch each thing once as you say the number. The last number you say is how many there are.',
  blurb: 'Count them, name the next number, and find who is 4th in line.',
  ccss: ['K.CC.A.2', 'K.CC.B.4', 'K.CC.B.5'],
  im: [2, 6],
  refs: ['im-scope-sequence', 'building-blocks-wwc', 'nelson-mcmaster-numeracy', 'geary-2011'],
  theory: 'Counting, cardinality and ordinality are separable skills that develop separately.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Counting, cardinality and ordinality are separate skills that develop separately — a child who can recite "one two three" may still not know that the last word said is how many there are. This book keeps all four apart: count a set, name the next number, produce a set of a given size, and find a position in a line.',
  pages: 10, printItems: 4,
  printInstruction: 'Count carefully. Write how many.',
  printInstructions: {
    choice: 'How many? Write the number.',
    tap: 'Draw the number of counters asked for.',
    ordinal: 'Circle the one in the position named.',
  },
  chapterLabel: 'Page {n} of {total}',
  generate(seed, i, ch, r) {
    // Every fifth item is a word problem, tagged by schema rather than by
    // operation — the structure is the thing being taught. A fixed stride
    // rather than a tail slice, for two reasons: the printable generates fewer
    // items than the book, so a tail slice gave some sheets none and one sheet
    // sixteen; and a stride of 5 does not collide with the i % 4 staging these
    // activities already use, so no stage gets wiped out.
    if (i % 5 === 4) {
      return wordProblem(r.pick(['join','partWhole']), ch, r, { max: 10 });
    }
    const mode = i % 4;
    if (mode === 0) {
      const n = r.int(3, 9);
      return {
        type: 'choice', prompt: 'How many dots?', visual: dots(n, { layout: n <= 6 ? 'dice' : 'random' }), visualWidth: 150,
        choices: r.shuffle([n, n - 1, n + 1, n + 2].filter((x) => x > 0).slice(0, 4)).map(String),
        answer: String(n), printStem: 'How many dots?',
        printVisual: dots(n, { print: true, layout: n <= 6 ? 'dice' : 'random', size: 96 }),
        hint: 'Touch each dot once as you count.',
        explain: `There are ${n}.`,
      };
    }
    if (mode === 1) {
      const start = r.int(1, 15);
      return {
        type: 'choice', prompt: `What number comes next?<br><strong>${start}, ${start + 1}, ${start + 2}, __</strong>`,
        choices: r.shuffle([start + 3, start + 2, start + 4, start + 1]).map(String),
        answer: String(start + 3),
        printStem: `${start}, ${start + 1}, ${start + 2}, ____`,
        hint: 'Count on from the last number you see.',
        explain: `After ${start + 2} comes ${start + 3}.`,
      };
    }
    if (mode === 2) {
      const n = r.int(2, 8);
      return {
        type: 'tap', prompt: fill(`Tap exactly ${n} {collectible.many}.`, ch), n, answer: n, total: 10,
        itemLabel: fill('{collectible.many}', ch),
        hint: 'Tap one at a time and count as you go.',
        explain: `That is ${n}.`,
      };
    }
    const total = 6, pos = r.int(1, total);
    const ord = ['1st', '2nd', '3rd', '4th', '5th', '6th'][pos - 1];
    return {
      type: 'ordinal', prompt: fill(`The {collectible.many} are in a line. Tap the <strong>${ord}</strong> one.`, ch),
      n: pos, answer: pos, total,
      printStem: `Circle the ${ord} one in a row of ${total}.`,
      hint: 'Start at the left end and count along.',
      explain: `The ${ord} one, counting from the left.`,
    };
  },
};

/* -------------------------------------------------------------- BOOK: number friends */
const numberFriends = {
  id: 'number-friends', title: 'Number Friends', kind: 'book', grade: 'K', strand: S[1],
  glyph: '◐',
  skill: 'Number bonds to 10 — the two parts that make a whole, in both directions.',
  trick: 'Hold the whole in your head. Count the part you can see, then count on up to the whole — what you counted is the missing part.',
  blurb: 'Find the missing part. 6 and what make 10?',
  ccss: ['K.OA.A.3', 'K.OA.A.4'],
  im: [4, 5],
  refs: ['im-scope-sequence', 'building-blocks-wwc', 'clements-1999'],
  theory: 'Part-whole structure: a quantity is composed of parts, and the bond makes that visible.',
  roam: [{ task: 'fluencyArf', subscale: 'sum' }, { task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Part-whole reasoning, in the Singapore-style bond rather than as a sum, so the relationship is visible rather than procedural. Pairs to ten are the highest-leverage facts in early arithmetic: they underwrite every make-ten strategy that follows.',
  pages: 10, printItems: 5,
  printInstruction: 'Fill in the missing number in each bond.',
  generate(seed, i, ch, r) {
    const whole = i < 4 ? 10 : r.pick([5, 6, 8, 10]);
    const a = r.int(1, whole - 1);
    const bl = r.pick(['a', 'b']);
    const missing = bl === 'a' ? a : whole - a;
    const shown = bl === 'a' ? whole - a : a;
    return {
      type: 'bond', whole, a, b: whole - a, blank: bl, answer: missing,
      prompt: `${shown} and what make <strong>${whole}</strong>?`,
      visual: tenFrame(shown, { total: 10 }),
      choices: r.shuffle([missing, missing + 1, Math.max(0, missing - 1), whole].filter((v, k, arr) => arr.indexOf(v) === k).slice(0, 4)).map(String),
      hint: `Fill in ${shown} counters, then count the empty spaces up to ${whole}.`,
      explain: `${shown} and ${missing} make ${whole}.`,
    };
  },
};

/* ------------------------------------------------------------------ BOOK: shape sorter */
const SHAPES = {
  circle: '<circle cx="40" cy="40" r="30"/>',
  square: '<rect x="12" y="12" width="56" height="56" rx="3"/>',
  triangle: '<path d="M40 10 L72 68 H8 Z"/>',
  rectangle: '<rect x="6" y="20" width="68" height="40" rx="3"/>',
  hexagon: '<path d="M40 8 L67 24 L67 56 L40 72 L13 56 L13 24 Z"/>',
};
const shapeSvg = (name, w = 92, print = false) =>
  `<svg viewBox="0 0 80 80" width="${w}" height="${w}" role="img" aria-label="${name}">
    <g fill="none" stroke="${print ? '#111' : 'var(--a1)'}" stroke-width="${print ? 2.4 : 3.5}" stroke-linejoin="round">${SHAPES[name]}</g></svg>`;

const shapeSorter = {
  id: 'shape-sorter', title: 'Shape Sorter', kind: 'book', grade: 'K', strand: S[3],
  glyph: '◇',
  skill: 'Naming flat shapes and counting their sides and corners.',
  trick: 'Count the corners, not the sides. It is the same number either way, and corners are easier to point at.',
  printDensity: 'd2',
  blurb: 'Name the shape, then count its sides.',
  ccss: ['K.G.A.2', 'K.G.B.4'],
  im: [3, 7],
  refs: ['im-scope-sequence'],
  theory: 'A shape is defined by its properties, not its orientation.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Naming shapes and counting their attributes is where children learn that a shape is defined by its properties, not its orientation — a triangle stood on its point is still a triangle. Kiwi’s scale tessellation makes this the natural home for early geometry.',
  pages: 8, printItems: 7,
  printInstruction: 'Name each shape and write how many sides it has.',
  generate(seed, i, ch, r) {
    const names = Object.keys(SHAPES);
    const name = names[i % names.length];
    const sides = { circle: 0, square: 4, triangle: 3, rectangle: 4, hexagon: 6 }[name];
    if (i % 2 === 0) {
      return {
        type: 'choice', prompt: 'What shape is this?', visual: shapeSvg(name), visualWidth: 120,
        choices: r.shuffle(r.sample(names.filter((n) => n !== name), 3).concat([name])),
        answer: name, printStem: 'Name this shape.',
        printVisual: shapeSvg(name, 74, true),
        hint: 'Count the straight sides.',
        explain: `A ${name}${sides ? ` has ${sides} sides` : ' has no straight sides'}.`,
      };
    }
    return {
      type: 'choice', prompt: `How many sides does this ${name} have?`, visual: shapeSvg(name), visualWidth: 120,
      choices: r.shuffle([sides, sides + 1, Math.max(0, sides - 1), sides + 2].filter((v, k, arr) => arr.indexOf(v) === k).slice(0, 4)).map(String),
      answer: String(sides), printStem: 'How many sides?',
      printVisual: shapeSvg(name, 74, true),
      hint: 'Trace round the edge with your finger and count each straight part.',
      explain: sides ? `A ${name} has ${sides} sides.` : 'A circle has no straight sides.',
    };
  },
};

/* -------------------------------------------------------------- GAME: ten-frame flash */
const tenFrameFlash = {
  id: 'ten-frame-flash', title: 'Ten-Frame Flash', kind: 'game', grade: 'K', strand: S[0],
  glyph: '⁙',
  skill: 'Subitizing — recognising how many without counting one by one.',
  goal: 'Dots flash up, then hide. Say how many you saw — see it, do not count it.',
  trick: 'A full row is five. So six is five and one more, and eight is five and three more.',
  printDensity: 'd2',
  blurb: 'The dots flash up. How many did you see?',
  ccss: ['K.CC.B.4', 'K.CC.B.5'],
  im: [2, 5],
  refs: ['clements-1999', 'building-blocks-wwc', 'qiu-2021-ans'],
  theory: 'Conceptual subitizing: seeing a quantity as composed groups rather than counting units.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Conceptual subitizing depends on brief exposure. If the dots stay visible a child simply counts them one at a time, which trains counting rather than recognising quantity, so the pattern is hidden after a beat and tightens as the rounds go on. Worth being straight about the evidence here: the ten-frame is long-established classroom practice and sits inside a well-supported family of representations, but we found no trial isolating the ten-frame itself. The quantities are exact and always mapped to a numeral, which is the part that matters \u2014 training approximate dot-cloud comparison on its own does not transfer to symbolic maths.',
  strategy: { name: 'See it in groups', text: 'Do not count one at a time. A full row is five, so seven is “five and two”.' },
  rounds: 12, printItems: 7, seconds: 60,
  printInstruction: 'How many dots in each frame? Write the number.',
  generate(seed, i, ch, r) {
    const n = i < 4 ? r.int(2, 5) : i < 8 ? r.int(3, 7) : r.int(4, 10);
    const useFrame = i % 2 === 1;
    return {
      type: 'choice', prompt: 'How many?',
      visual: useFrame ? tenFrame(n) : dots(n, { layout: n <= 6 ? 'dice' : 'random' }),
      visualWidth: useFrame ? 190 : 150,
      // Brief enough that counting one-by-one is impossible — that is the whole
      // point of a subitizing flash. Starts generous and tightens.
      flashMs: i < 4 ? 900 : i < 8 ? 650 : 450,
      choices: r.shuffle([n, n - 1, n + 1, n + 2].filter((x) => x > 0 && x <= 12).slice(0, 4)).map(String),
      answer: String(n),
      printStem: 'How many dots?',
      printVisual: useFrame ? tenFrame(n, { print: true }) : dots(n, { print: true, layout: n <= 6 ? 'dice' : 'random', size: 96 }),
      // Elaborated, not just the number: the point of conceptual subitizing is
      // seeing the quantity AS groups, so the feedback names the grouping rather
      // than confirming the count. Bare confirmation is the g=0.05 case.
      explain: n === 5 ? 'Five — a full row.'
        : n === 10 ? 'Ten — both rows full.'
        : n < 5 ? `${n} — fewer than a full row of five.`
        : `${n} — a full row of five, and ${n - 5} more.`,
    };
  },
};

/* ---------------------------------------------------------------- GAME: which is more */
const whichIsMore = {
  id: 'which-is-more', title: 'Which Is More', kind: 'game', grade: 'K', strand: S[4],
  glyph: '>',
  skill: 'Comparing two numbers — deciding which is larger, fast.',
  goal: 'Two numbers appear. Tap the bigger one.',
  trick: 'The number further along the counting line is the bigger one.',
  blurb: 'Two numbers. Tap the bigger one.',
  ccss: ['K.CC.C.6', 'K.CC.C.7'],
  im: [2, 6],
  refs: ['holloway-ansari-2009', 'wwc-2021-math', 'qiu-2021-ans'],
  theory: 'The symbolic numerical distance effect — closer numbers are harder to compare.',
  roam: [{ task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Comparing quantities is the foundation the rest of arithmetic sits on. Pairs are drawn by ratio rather than at random, because the difficulty of a comparison depends on how close the two numbers are — 9 against 1 is nearly automatic, 9 against 8 is not.',
  strategy: { name: 'Think of the line', text: 'Picture both numbers on a number line. The one further right is more.' },
  rounds: 14, printItems: 11, seconds: 45,
  printInstruction: 'Write < or > between each pair.',
  generate(seed, i, ch, r) {
    // Ratio bands mirror MagPI's own bins, so the numerical distance effect is
    // exercised on purpose. Pools are precomputed: no rejection loop, and no
    // chance of an equal pair (which would have no correct answer).
    const band = i < 5 ? 'large' : i < 10 ? 'medium' : 'small';
    const pool = [];
    for (let x = 1; x <= 9; x++) {
      for (let y = 1; y <= 9; y++) {
        if (x === y) continue;
        const ratio = Math.min(x, y) / Math.max(x, y);
        const inBand = band === 'large' ? ratio <= 0.5
          : band === 'medium' ? (ratio > 0.5 && ratio <= 0.75)
          : ratio > 0.75;
        if (inBand) pool.push([x, y]);
      }
    }
    const [a, bb] = r.pick(pool);
    return {
      type: 'compare', prompt: 'Which is more?', left: a, right: bb,
      answer: a > bb ? 'left' : 'right',
      explain: `${Math.max(a, bb)} is more than ${Math.min(a, bb)}.`,
    };
  },
};


/* ------------------------------------------------------------- GAME: the great race */
const greatRace = {
  id: 'great-race', title: 'The Great Race', kind: 'game', grade: 'K', strand: S[0],
  glyph: '⇉',
  skill: 'Moving along a numbered line by counting on from where you are.',
  goal: 'You are on a square. Spin a number, then work out which square you land on.',
  trick: 'Do not go back to one. Start on the number you are already on and count on from there.',
  blurb: 'Spin, then name the squares you move through. Not "one, two".',
  ccss: ['K.CC.A.2', 'K.CC.B.4', 'K.CC.C.7'],
  im: [2, 6],
  refs: ['siegler-ramani-2009', 'siegler-ramani-2008', 'laski-siegler-2014', 'wwc-2021-math', 'schneider-2018'],
  theory: 'A linear board maps number onto space, and counting on encodes magnitude rather than moves.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_20' }, { task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'A linear number board is the single best-evidenced early-number activity there is: Siegler and Ramani (2009) found large gains in number line estimation from about an hour of play, and the same game on a circular board produced far less — the left-to-right layout is doing the work. The second detail matters as much: the child must name the squares they pass through, counting on from where their token is. Laski and Siegler (2014) found that counting on produced roughly double the gains of counting from one, so tapping "1, 2" is treated as the error it is and corrected.',
  strategy: { name: 'Count on', text: 'Start from the square you are on, not from one. On 3 and spinning 2? Say “four, five”.' },
  rounds: 12, printItems: 5, seconds: 0, timerAvailable: false,
  printInstruction: 'Write the squares you move through each time.',
  generate(seed, i, ch, r) {
    const N = 10;
    // The token walks up the board across rounds, so later rounds start further
    // along — which is what makes counting on necessary rather than optional.
    const spin = r.int(1, 2);
    const from = Math.min(N - 2, (i * 2 + r.int(0, 1)) % (N - 1));
    const answer = [];
    for (let k = 1; k <= spin; k++) answer.push(from + k);
    return {
      type: 'boardmove', from, spin, hi: N, answer,
      hint: `You are on ${from === 0 ? 'Start' : from}. The next square is ${from + 1}.`,
      explain: `Counting on from ${from === 0 ? 'Start' : from}: ${answer.join(', ')}.`,
    };
  },
};


/* ------------------------------------------------------------- BOOK: story time */
const storyTime = {
  id: 'story-time', title: 'Story Time', kind: 'book', grade: 'K', strand: S[2],
  glyph: '❝',
  skill: 'Solving add-to, take-from and put-together story problems with numbers to 10.',
  trick: 'Read it, then act it out with counters. Things arriving means add. Things leaving means take away.',
  blurb: 'Little stories about counting. What happens, and how many end up?',
  ccss: ['K.OA.A.1', 'K.OA.A.2'],
  im: [4, 5],
  refs: ['wwc-2021-math', 'im-scope-sequence', 'building-blocks-wwc'],
  theory: 'A story problem has a structure — something joins, something leaves, or two parts make a whole — and the structure is what is being learned.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }, { task: 'fluencyArf', subscale: 'sum' }],
  evidence: 'Word problems are their own skill, not a by-product of arithmetic: the WWC practice guide rates teaching them STRONG on 18 studies, and fact fluency transfers to word problems only weakly. Starting at kindergarten with tiny numbers keeps the arithmetic out of the way so the structure is the only thing to work out.',
  pages: 10, printItems: 5,
  printInstruction: 'Read each story. Write how many.',
  printInstructions: { input: 'Read each story. Write how many.' },
  generate(seed, i, ch, r) {
    // One structure per page, cycled, with the unknown moving position — the same
    // structure is much harder when the start is unknown than when the result is.
    const plan = [
      ['join', 'result'], ['separate', 'result'], ['partWhole', null],
      ['join', 'change'], ['separate', 'change'], ['partWhole', null],
      ['join', 'start'], ['join', 'result'], ['separate', 'result'], ['partWhole', null],
    ][i % 10];
    return wordProblem(plan[0], ch, r, { max: 10, min: 1, unknown: plan[1] });
  },
};

export default [countingCrew, numberFriends, storyTime, shapeSorter, greatRace, tenFrameFlash, whichIsMore];
