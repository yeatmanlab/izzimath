import { tenFrame, dots, numberBond, numberLine, tickRange, array2d, esc,
  clockFace, pickRow, pickDecoys } from '../../src/lib/widgets.js';
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
  printMaxPages: 1,   // K/1 stay one page
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
  printMaxPages: 1,   // K/1 stay one page
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
/* What the figure ANNOUNCES, and it is not always the name. "What shape is this?"
   was labelled `aria-label="circle"` beside four options including circle, so
   four of the eight pages read the answer out to a screen reader before the
   child had a chance at it. The naming question gets the shape's ATTRIBUTES
   instead — the same thing a sighted child reads off the picture, and the
   reasoning K.G.A.2 is asking for. The counting question already names the shape
   in its own prompt, so there the name is all the label needs to add, and saying
   "four straight sides" would give that one away instead.

   fold-and-sort at grade 4 had the opposite bug: silent figures, and the
   question lived entirely in the picture. Both are fixed the same way — state
   the attributes, never the conclusion. */
const SHAPE_DESC = {
  circle: 'a round shape with no corners',
  square: 'a shape with four straight sides, all the same length, and four square corners',
  triangle: 'a shape with three straight sides',
  rectangle: 'a shape with four straight sides and four square corners, two long ones and two short ones',
  hexagon: 'a shape with six straight sides',
};
const shapeSvg = (name, w = 92, print = false, describe = false) =>
  `<svg viewBox="0 0 80 80" width="${w}" height="${w}" role="img" aria-label="${describe ? SHAPE_DESC[name] : name}">
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
  printMaxPages: 1,   // K/1 stay one page
  printInstruction: 'Name each shape and write how many sides it has.',
  generate(seed, i, ch, r) {
    const names = Object.keys(SHAPES);
    const name = names[i % names.length];
    const sides = { circle: 0, square: 4, triangle: 3, rectangle: 4, hexagon: 6 }[name];
    if (i % 2 === 0) {
      return {
        type: 'choice', prompt: 'What shape is this?', visual: shapeSvg(name, 92, false, true), visualWidth: 120,
        choices: r.shuffle(r.sample(names.filter((n) => n !== name), 3).concat([name])),
        answer: name, printStem: 'Name this shape.',
        printVisual: shapeSvg(name, 74, true, true),
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
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
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
  rounds: 12, printItems: 7,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 60,
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
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: 'The number further along the counting line is the bigger one.',
  blurb: 'Two numbers. Tap the bigger one.',
  ccss: ['K.CC.C.6', 'K.CC.C.7'],
  im: [2, 6],
  refs: ['holloway-ansari-2009', 'wwc-2021-math', 'qiu-2021-ans'],
  theory: 'The symbolic numerical distance effect — closer numbers are harder to compare.',
  roam: [{ task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Comparing quantities is the foundation the rest of arithmetic sits on. Pairs are drawn by ratio rather than at random, because the difficulty of a comparison depends on how close the two numbers are — 9 against 1 is nearly automatic, 9 against 8 is not.',
  strategy: { name: 'Think of the line', text: 'Picture both numbers on a number line. The one further right is more.' },
  rounds: 14, printItems: 11,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 45,
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
  rounds: 12, printItems: 5,
  printMaxPages: 1,   // K/1 stay one page
  seconds: 0, timerAvailable: false,
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
  printMaxPages: 1,   // K/1 stay one page
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


/* ------------------------------------------------ BOOK: longer and shorter (K S5)
   TIME AT KINDERGARTEN, WITH THE STANDARD STATED HONESTLY
   CCSS has no time standard at K — K.MD is measurable attributes, direct
   comparison and classification, and its own examples are length and weight.
   Neither does IM. So this activity does NOT teach telling the time: reading a
   clock is 1.MD.B.3 and belongs to grade 1, where Clocks and Time does it.

   What it does is the K.MD work with time as the attribute. Duration IS a
   measurable attribute, and "which takes longer, brushing your teeth or
   sleeping?" is K.MD.A.2's direct comparison in the same shape as "which is
   taller". The clock appears only as an object to recognise and as a pattern to
   match — long hand straight up — never as something to read. That line is the
   whole design, and the moment an item asks what time it says, it has become a
   grade-1 activity sitting in the wrong year.

   The events are things a five-year-old has done, because a comparison of two
   durations is only checkable if the child has felt both. */
const longerAndShorter = {
  id: 'longer-and-shorter', title: 'Longer and Shorter', kind: 'book', grade: 'K', strand: S[4],
  glyph: '◷',
  skill: 'Comparing how long things take, putting a day in order, and knowing a clock when you see one.',
  trick: 'Some things are quick and some things take ages. You do not need numbers to say which is longer — you just need to have done both.',
  printDensity: 'd2',
  printMaxPages: 1,   // K/1 stay one page
  blurb: 'Which takes longer? What comes first? And which one is the clock?',
  ccss: ['K.MD.A.1', 'K.MD.A.2'],
  im: [1],
  refs: ['im-scope-sequence', 'im-k5'],
  theory: 'Time is a measurable attribute before it is a number. A child who can say that sleeping takes longer than a sneeze has the idea that durations can be compared, which is what reading a clock will later put numbers to. Comparing before measuring is the order K.MD uses for length, and it is the order used here.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Said plainly: there is NO Common Core time standard at Kindergarten, and no Illustrative Mathematics unit either. This activity is mapped to K.MD.A.1 and K.MD.A.2 — describing and directly comparing a measurable attribute — with duration as the attribute, which is a defensible reading of a standard whose own examples are length and weight, and not a claim that CCSS asks for time at K. It is here because several state frameworks do place clock familiarity at K, because grade 1 assumes it, and because comparing durations is genuine K.MD work. No item asks a Kindergarten child to read a clock; that is 1.MD.B.3 and Clocks and Time does it.',
  pages: 8, printItems: 7,
  printInstruction: 'Which one takes longer? Circle it.',
  printInstructions: {
    choice: 'Circle the answer.',
    pick: 'Circle the clock that matches.',
  },
  generate(seed, i, ch, r, bookSeed = 0) {
    const mode = i % 4;

    /* Quick things and long things, kept far apart on purpose. "Eating lunch"
       against "eating dinner" is not a fair question to put to a five-year-old;
       "a sneeze" against "a night's sleep" is. */
    const QUICK = ['a sneeze', 'clapping your hands', 'blinking', 'saying your name',
      'putting on one sock', 'drinking a sip of water'];
    const LONG = ['sleeping all night', 'a whole school day', 'growing a sunflower',
      'a long car trip', 'winter', 'growing one year older'];

    // 0 — which takes longer: the direct comparison K.MD.A.2 asks for
    if (mode === 0) {
      const quick = r.pick(QUICK), slow = r.pick(LONG);
      const flip = r.chance(0.5);
      return {
        type: 'choice',
        prompt: `Which one takes <strong>longer</strong>?`,
        choices: flip ? [quick, slow] : [slow, quick],
        answer: slow,
        printStem: `Which takes longer: ${flip ? `${quick} or ${slow}` : `${slow} or ${quick}`}?`,
        hint: 'Think about doing both. Which one would still be going when the other had finished?',
        explain: `${slow[0].toUpperCase()}${slow.slice(1)} takes much longer. ${quick[0].toUpperCase()}${quick.slice(1)} is over almost straight away.`,
      };
    }

    // 1 — which takes SHORTER, so the question is not always the same question
    if (mode === 1) {
      const quick = r.pick(QUICK), slow = r.pick(LONG);
      const flip = r.chance(0.5);
      return {
        type: 'choice',
        prompt: `Which one is <strong>quicker</strong>?`,
        choices: flip ? [slow, quick] : [quick, slow],
        answer: quick,
        printStem: `Which is quicker: ${flip ? `${slow} or ${quick}` : `${quick} or ${slow}`}?`,
        hint: 'One of these is finished before you can count to five.',
        explain: `${quick[0].toUpperCase()}${quick.slice(1)} is quicker. ${slow[0].toUpperCase()}${slow.slice(1)} goes on for ages.`,
      };
    }

    // 2 — the order of a day, which is time without any measuring
    if (mode === 2) {
      const DAY = [
        ['you wake up', 'morning'], ['you eat breakfast', 'morning'],
        ['you eat lunch', 'the middle of the day'], ['you eat dinner', 'evening'],
        ['you go to bed', 'night'], ['the sun comes up', 'morning'], ['the stars come out', 'night'],
      ];
      const [what, when] = r.pick(DAY);
      const parts = ['morning', 'the middle of the day', 'evening', 'night'];
      return {
        type: 'choice',
        prompt: `When does this happen: <strong>${esc(what)}</strong>?`,
        choices: r.shuffle([when, ...pickDecoys(when, parts)]),
        answer: when,
        printStem: `When does this happen: ${what}? (morning / middle of the day / evening / night)`,
        hint: 'Think about your own day, from waking up to going to sleep.',
        explain: `${what[0].toUpperCase()}${what.slice(1)} happens in the ${when === 'the middle of the day' ? 'middle of the day' : when}.`,
      };
    }

    /* 3 — the o'clock PATTERN, and deliberately not the time. A child is asked
       which clock has its long hand pointing straight up, which is looking at a
       picture rather than reading it. Naming the hour would make this grade 1's
       activity. */
    const upH = r.int(1, 12);
    const decoys = [{ h: upH, m: 30 }, { h: upH, m: 15 }, { h: upH, m: 45 }];
    const opts = r.shuffle([{ h: upH, m: 0, right: true }, ...decoys.map((d) => ({ ...d, right: false }))])
      .map((o, k) => ({ id: 'abcd'[k], figure: clockFace(o.h, o.m, { size: 96, numerals: false }),
        printFigure: clockFace(o.h, o.m, { print: true, size: 66, numerals: false }), right: o.right }));
    const answer = opts.find((o) => o.right).id;
    return {
      type: 'pick',
      prompt: `On which clock is the <strong>long hand pointing straight up</strong>?`,
      options: opts.map(({ id, figure }) => ({ id, figure })),
      answer,
      answerSay: 'the one with the long hand straight up at the top',
      printStem: 'Circle the clock with the long hand pointing straight up.',
      printVisual: pickRow(opts.map(({ id, printFigure }) => ({ id, figure: printFigure })), { print: true }),
      hint: 'Two hands on each clock. Find the LONG one, then find the one pointing at the very top.',
      explain: 'The long hand points straight up at the top. When it does that, grown-ups say "o’clock" — you will learn to read the rest next year.',
    };
  },
};

export default [countingCrew, numberFriends, storyTime, shapeSorter, greatRace, tenFrameFlash, whichIsMore, longerAndShorter];
