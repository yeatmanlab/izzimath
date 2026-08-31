import { tenFrame, dots, numberBond, numberLine, tickRange, array2d, esc } from '../../src/lib/widgets.js';
import { fill } from '../characters.js';

const S = ['Counting and cardinality', 'Number bonds to 10', 'Flat and solid shapes', 'Compare and measure'];

/* ---------------------------------------------------------------- BOOK: counting crew */
const countingCrew = {
  id: 'counting-crew', title: 'Counting Crew', kind: 'book', grade: 'K', strand: S[0],
  glyph: '5',
  skill: 'Counting to 20, saying how many, naming what comes next, and finding a position in a line.',
  blurb: 'Count them, name the next number, and find who is 4th in line.',
  ccss: ['K.CC.A.2', 'K.CC.B.4', 'K.CC.B.5'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Mirrors ALPACA’s own cat1 item formats — "what number comes next", "how many dots", give-N, and ordinal position — so the practice matches the response formats a child already met in ROAM.',
  pages: 10, printItems: 8,
  printInstruction: 'Count carefully. Write how many.',
  printInstructions: {
    choice: 'How many? Write the number.',
    tap: 'Draw the number of counters asked for.',
    ordinal: 'Circle the one in the position named.',
  },
  chapterLabel: 'Page {n} of {total}',
  generate(seed, i, ch, r) {
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
  blurb: 'Find the missing part. 6 and what make 10?',
  ccss: ['K.OA.A.3', 'K.OA.A.4'],
  roam: [{ task: 'fluencyArf', subscale: 'sum' }, { task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Bonds to 10 are the substrate for ARF addition-fact retrieval. Presented as a bond rather than a sum so the part-whole relationship is visible, then practised in both directions.',
  pages: 10, printItems: 8,
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
  id: 'shape-sorter', title: 'Shape Sorter', kind: 'book', grade: 'K', strand: S[2],
  glyph: '◇',
  skill: 'Naming flat shapes and counting their sides and corners.',
  blurb: 'Name the shape, then count its sides.',
  ccss: ['K.G.A.2', 'K.G.B.4'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'ALPACA cat1 includes shape and attribute items alongside counting. Kiwi’s scale tessellation makes this the natural home for early geometry.',
  pages: 8, printItems: 8,
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
  blurb: 'The dots flash up. How many did you see?',
  ccss: ['K.CC.B.4', 'K.CC.B.5'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat1' }],
  evidence: 'Conceptual subitizing depends on brief exposure — if the dots stay visible the child counts them one at a time, which trains counting rather than quantity recognition. The pattern is hidden after a beat.',
  rounds: 12, seconds: 60, printItems: 10,
  printInstruction: 'How many dots in each frame? Write the number.',
  generate(seed, i, ch, r) {
    const n = i < 4 ? r.int(2, 5) : i < 8 ? r.int(3, 7) : r.int(4, 10);
    const useFrame = i % 2 === 1;
    return {
      type: 'choice', prompt: 'How many?',
      visual: useFrame ? tenFrame(n) : dots(n, { layout: n <= 6 ? 'dice' : 'random' }),
      visualWidth: useFrame ? 190 : 150,
      flashMs: i < 4 ? 1600 : i < 8 ? 1200 : 900,
      choices: r.shuffle([n, n - 1, n + 1, n + 2].filter((x) => x > 0 && x <= 12).slice(0, 4)).map(String),
      answer: String(n),
      printStem: 'How many dots?',
      printVisual: useFrame ? tenFrame(n, { print: true }) : dots(n, { print: true, layout: n <= 6 ? 'dice' : 'random', size: 96 }),
      explain: `${n}.`,
    };
  },
};

/* ---------------------------------------------------------------- GAME: which is more */
const whichIsMore = {
  id: 'which-is-more', title: 'Which Is More', kind: 'game', grade: 'K', strand: S[3],
  glyph: '>',
  skill: 'Comparing two numbers — deciding which is larger, fast.',
  blurb: 'Two numbers. Tap the bigger one.',
  ccss: ['K.CC.C.6', 'K.CC.C.7'],
  roam: [{ task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Built on MagPI’s own difficulty structure: pairs are drawn by ratio so the numerical distance effect is exercised deliberately — 9 vs 1 is easy, 9 vs 8 is not.',
  rounds: 14, seconds: 45, printItems: 12,
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

export default [countingCrew, numberFriends, shapeSorter, tenFrameFlash, whichIsMore];
