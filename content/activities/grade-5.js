import { numberLine, tickRange, fractionBar, array2d, esc } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { wordProblem } from '../wordproblems.js';
import { frac, fracText, simplify, addF, subF, mulF, divF, valF, cmpF, lcm } from '../../src/lib/frac.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['5'];

/* ------------------------------------------------------------- BOOK: fraction foundry */
const fractionFoundry = {
  id: 'fraction-foundry', title: 'Fraction Foundry', kind: 'book', grade: '5', strand: S[1],
  glyph: '⅝',
  skill: 'Adding, subtracting, multiplying and dividing fractions with unlike denominators.',
  trick: 'Adding needs the same denominator. Multiplying does not. Check which one you are doing before you start.',
  blurb: 'Common denominators, then the four operations.',
  ccss: ['5.NF.A.1', '5.NF.B.4', '5.NF.B.7'],
  im: [2, 3, 6],
  refs: ['fuchs-2013-fractions', 'fuchs-ffo-wwc', 'wwc-2021-math'],
  theory: 'Operating on fractions requires a common unit — the reason common denominators exist.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'The four operations on fractions with unlike denominators. Answers are compared as exact fractions rather than decimals, so 19/12 and 1 7/12 are both accepted and nothing is ever wrong by a rounding error.',
  pages: 16, printItems: 28,
  printPages: 2,   // two pages
  printInstruction: 'Work these out. Give each answer in its simplest form.',
  generate(seed, i, ch, r) {
    // Every fifth item is a word problem, tagged by schema rather than by
    // operation — the structure is the thing being taught. A fixed stride
    // rather than a tail slice, for two reasons: the printable generates fewer
    // items than the book, so a tail slice gave some sheets none and one sheet
    // sixteen; and a stride of 5 does not collide with the i % 4 staging these
    // activities already use, so no stage gets wiped out.
    if (i % 5 === 4) {
      return wordProblem(r.pick(['equalGroups','share']), ch, r, { max: 120, min: 12 });
    }
    const stage = i < 5 ? 'add' : i < 9 ? 'sub' : i < 13 ? 'mul' : 'div';
    const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    const d1 = r.pick(dens);
    let d2 = r.pick(dens.filter((d) => d !== d1));
    const n1 = r.int(1, d1 - 1);
    const n2 = r.int(1, d2 - 1);
    const A = frac(n1, d1), B = frac(n2, d2);

    if (stage === 'add') {
      const res = addF(A, B);
      return {
        type: 'input', accept: 'fraction',
        prompt: `<strong>${n1}/${d1} + ${n2}/${d2} =</strong>`,
        answer: fracText(res), placeholder: 'e.g. 19/12',
        printStem: `${n1}/${d1} + ${n2}/${d2} =`,
        hint: `The lowest common denominator of ${d1} and ${d2} is ${lcm(d1, d2)}.`,
        explain: `Over ${lcm(d1, d2)}: ${n1 * (lcm(d1, d2) / d1)}/${lcm(d1, d2)} + ${n2 * (lcm(d1, d2) / d2)}/${lcm(d1, d2)} = ${fracText(res)}.`,
      };
    }
    if (stage === 'sub') {
      const [hi, lo] = cmpF(A, B) >= 0 ? [A, B] : [B, A];
      const res = subF(hi, lo);
      return {
        type: 'input', accept: 'fraction',
        prompt: `<strong>${hi.n}/${hi.d} − ${lo.n}/${lo.d} =</strong>`,
        answer: fracText(res), placeholder: 'e.g. 1/12',
        printStem: `${hi.n}/${hi.d} − ${lo.n}/${lo.d} =`,
        hint: `Rewrite both over ${lcm(hi.d, lo.d)} first.`,
        explain: `Over ${lcm(hi.d, lo.d)} the difference is ${fracText(res)}.`,
      };
    }
    if (stage === 'mul') {
      const res = mulF(A, B);
      return {
        type: 'input', accept: 'fraction',
        prompt: `<strong>${n1}/${d1} × ${n2}/${d2} =</strong>`,
        answer: fracText(res), placeholder: 'e.g. 3/8',
        printStem: `${n1}/${d1} × ${n2}/${d2} =`,
        hint: 'Multiply the tops, multiply the bottoms, then simplify.',
        explain: `${n1} × ${n2} = ${n1 * n2} and ${d1} × ${d2} = ${d1 * d2}, which simplifies to ${fracText(res)}.`,
      };
    }
    const res = divF(A, B);
    return {
      type: 'input', accept: 'fraction',
      prompt: `<strong>${n1}/${d1} ÷ ${n2}/${d2} =</strong>`,
      answer: fracText(res), placeholder: 'e.g. 2/3',
      printStem: `${n1}/${d1} ÷ ${n2}/${d2} =`,
      hint: `Flip the second fraction and multiply: × ${d2}/${n2}.`,
      explain: `${n1}/${d1} × ${d2}/${n2} = ${fracText(res)}.`,
    };
  },
};

/* ---------------------------------------------------------------- BOOK: decimal place */
const decimalPlace = {
  id: 'decimal-place', title: 'Decimal Place', kind: 'book', grade: '5', strand: S[0],
  glyph: '0.1',
  skill: 'Reading, comparing and adding decimals to thousandths.',
  trick: 'Line up the decimal points, then pad the shorter number with zeros so both have the same number of places.',
  blurb: 'Tenths, hundredths, thousandths — line up the point.',
  ccss: ['5.NBT.A.3', '5.NBT.B.7'],
  im: [5, 6],
  refs: ['im-scope-sequence', 'holloway-ansari-2009'],
  theory: 'Decimal place value, and the misconception that a longer decimal is larger.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'roamMagpi', subscale: 'symbolic' }],
  evidence: 'Comparison pairs use the durable misconception that a longer decimal is a bigger number — 0.4 against 0.38. It is the decimal cousin of comparing two-digit numbers digit by digit, and it survives a long time unless it is confronted directly.',
  pages: 14, printItems: 24,
  printInstruction: 'Compare or add each pair. Line up the decimal points.',
  printInstructions: {
    compare: 'Write < or > between each pair.',
    input: 'Add these. Line up the decimal points.',
    choice: 'Write the digit in the place named.',
  },
  generate(seed, i, ch, r) {
    const mode = i % 3;
    if (mode === 0) {
      // the "longer looks bigger" trap
      const whole = r.int(0, 3);
      const aT = r.int(1, 8);
      const a = whole + aT / 10;
      const b = whole + aT / 10 - r.int(1, 9) / 100;
      const av = Math.round(a * 1000) / 1000, bv = Math.round(b * 1000) / 1000;
      return {
        type: 'compare', prompt: 'Which is greater?',
        left: av.toFixed(1), right: bv.toFixed(2),
        answer: av > bv ? 'left' : 'right',
        hint: 'More digits does not mean a bigger number. Compare tenths first.',
        explain: `${Math.max(av, bv)} is greater. Compare the tenths before the hundredths.`,
      };
    }
    if (mode === 1) {
      const a = r.int(1, 89) / 100, b = r.int(1, 9) / 10;
      const sum = Math.round((a + b) * 100) / 100;
      return {
        type: 'input', prompt: `<strong>${a.toFixed(2)} + ${b.toFixed(1)} =</strong>`,
        answer: String(sum), placeholder: '?',
        printStem: `${a.toFixed(2)} + ${b.toFixed(1)} =`,
        hint: `Write ${b.toFixed(1)} as ${b.toFixed(2)} so the places line up.`,
        explain: `${a.toFixed(2)} + ${b.toFixed(2)} = ${sum}.`,
      };
    }
    const th = r.int(101, 999) / 1000;
    const place = r.pick(['tenths', 'hundredths', 'thousandths']);
    const s = th.toFixed(3);
    const digit = place === 'tenths' ? s[2] : place === 'hundredths' ? s[3] : s[4];
    return {
      type: 'choice', prompt: `In <strong>${s}</strong>, which digit is in the ${place} place?`,
      choices: r.shuffle([...new Set([s[2], s[3], s[4], String((Number(digit) + 1) % 10)])]).slice(0, 4).includes(digit)
        ? r.shuffle([...new Set([s[2], s[3], s[4], String((Number(digit) + 1) % 10)])]).slice(0, 4)
        : [digit, s[2], s[3], s[4]].filter((v, k, arr) => arr.indexOf(v) === k).slice(0, 4),
      answer: digit,
      printStem: `In ${s}, the ${place} digit is ____`,
      hint: 'First place after the point is tenths, then hundredths, then thousandths.',
      explain: `${s} — the ${place} digit is ${digit}.`,
    };
  },
};

/* ------------------------------------------------------------------- BOOK: volume */
const volumeAndSpace = {
  id: 'volume-and-space', title: 'Volume and Space', kind: 'book', grade: '5', strand: S[3],
  glyph: '◱',
  skill: 'Finding the volume of a rectangular prism by counting or multiplying.',
  trick: 'Volume is one layer, repeated. Find a layer with length × width, then multiply by the height.',
  blurb: 'Length times width times height — how many cubes fit?',
  ccss: ['5.MD.C.3', '5.MD.C.5'],
  im: [1],
  refs: ['im-scope-sequence', 'fyfe-2014-fading'],
  theory: 'Volume extends the area model into a third dimension.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Volume extends the area model into a third dimension, reusing the multiplicative structure built in grades 3 and 4 rather than arriving as a new formula to memorise.',
  pages: 12, printItems: 12,
  printPages: 2,   // two pages
  printInstruction: 'Find the volume of each prism.',
  printInstructions: {
    input: 'Find the volume of each prism.',
    choice: 'Choose the expression that gives the volume.',
  },
  generate(seed, i, ch, r) {
    const l = r.int(2, 8), w = r.int(2, 6), h = r.int(2, 5);
    const boxSvg = (print = false) => {
      const u = 15, ox = 22, oy = 20, dx = 9, dy = -7;
      const W = ox + l * u + w * dx + 20, H = oy + h * u - w * dy + 20;
      let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${Math.min(H, 150)}" role="img" aria-label="prism ${l} by ${w} by ${h}"><g stroke="${print ? '#111' : 'var(--a1)'}" stroke-width="1.8" fill="none">`;
      s += `<rect x="${ox}" y="${oy}" width="${l * u}" height="${h * u}"/>`;
      s += `<path d="M${ox} ${oy} l${w * dx} ${w * dy} h${l * u} M${ox + l * u} ${oy} l${w * dx} ${w * dy} l0 ${h * u}"/>`;
      s += `</g><g stroke="${print ? '#777' : 'var(--line2)'}" stroke-width=".8" fill="none">`;
      for (let k = 1; k < l; k++) s += `<line x1="${ox + k * u}" y1="${oy}" x2="${ox + k * u}" y2="${oy + h * u}"/>`;
      for (let k = 1; k < h; k++) s += `<line x1="${ox}" y1="${oy + k * u}" x2="${ox + l * u}" y2="${oy + k * u}"/>`;
      return s + `</g></svg>`;
    };
    if (i % 3 === 2) {
      const vol = l * w * h;
      return {
        type: 'choice', prompt: `A prism is ${l} × ${w} × ${h}. Which gives its volume?`,
        choices: r.shuffle([`${l} × ${w} × ${h}`, `${l} + ${w} + ${h}`, `2 × (${l} + ${w} + ${h})`, `${l} × ${w}`]),
        answer: `${l} × ${w} × ${h}`,
        printStem: `Volume of a ${l} × ${w} × ${h} prism =`,
        hint: 'Volume fills the inside — all three dimensions multiply.',
        explain: `${l} × ${w} × ${h} = ${vol} cubic units.`,
      };
    }
    return {
      type: 'input', prompt: `What is the volume of this <strong>${l} × ${w} × ${h}</strong> prism?`,
      visual: boxSvg(), visualWidth: 260,
      answer: String(l * w * h), placeholder: '?',
      printStem: `Volume of this ${l} × ${w} × ${h} prism?`,
      printVisual: boxSvg(true),
      hint: `One layer holds ${l} × ${w} = ${l * w} cubes, and there are ${h} layers.`,
      explain: `${l} × ${w} × ${h} = ${l * w * h} cubic units.`,
    };
  },
};

/* -------------------------------------------------------- GAME: mixed number line */
const mixedNumberLine = {
  id: 'mixed-number-line', title: 'Mixed Number Line', kind: 'game', grade: '5', strand: S[1],
  glyph: '1½',
  skill: 'Placing mixed numbers and improper fractions on a 0–2 line.',
  goal: 'Place the number on the line between 0 and 2.',
  trick: 'Land on the whole number first, then move the fraction part of the way towards the next one.',
  blurb: 'Past one and under two. Where does 7/4 go?',
  ccss: ['5.NF.A.1', '4.NF.B.3'],
  im: [2, 3],
  refs: ['fuchs-2013-fractions', 'schneider-2018', 'wwc-2021-math', 'riconscente-2013'],
  theory: 'A fraction greater than one still has a single position on the line.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_2' }],
  evidence: 'An improper fraction on a nought-to-two line is the clearest test of whether a child treats a fraction as a number: 7/4 has to go somewhere specific, and "seven over four" gives no help in finding it.',
  strategy: { name: 'Whole first', text: 'Decide which two whole numbers it sits between, then split that gap.' },
  rounds: 12, printItems: 6, seconds: 0, timerAvailable: true,
  printInstruction: 'Mark each value on the 0 to 2 line.',
  generate(seed, i, ch, r) {
    // MagPI's own 0-2 targets
    const pool = [
      [2, 3, '2/3'], [1, 2, '1/2'], [11, 12, '11/12'], [12, 13, '12/13'],
      [6, 4, '1 2/4'], [9, 6, '1 3/6'], [12, 8, '1 4/8'], [11, 6, '1 5/6'],
      [13, 7, '1 6/7'], [15, 8, '1 7/8'], [7, 4, '7/4'], [5, 4, '5/4'], [7, 6, '7/6'], [6, 5, '6/5'],
    ];
    const [n, d, label] = pool[(i * 5 + 1) % pool.length];
    const target = n / d;
    return {
      type: 'numberline', lo: 0, hi: 2, target, targetLabel: label,
      tolerance: 0.07,
      ticks: tickRange(0, 2, 1 / d), majors: [0, 1, 2],
      labels: [[0, '0'], [1, '1'], [2, '2']],
      prompt: `Where does <strong>${label}</strong> go?`,
      printStem: `Mark <strong>${label}</strong> on the line.`,
      showReadout: false,
      explain: `${label} is ${target > 1 ? `${(target - 1).toFixed(2).replace(/0+$/, '')} past 1` : 'less than 1'}.`,
    };
  },
};

/* ------------------------------------------------------------ GAME: coordinate quest */
const coordinateQuest = {
  id: 'coordinate-quest', title: 'Coordinate Quest', kind: 'game', grade: '5', strand: S[4],
  glyph: '⊹',
  skill: 'Reading and plotting points in the first quadrant.',
  goal: 'Plot the point on the grid. Across first, then up.',
  trick: 'Along the corridor, then up the stairs. The first number goes across, the second goes up — always that order.',
  blurb: 'Across first, then up. Where is (3, 5)?',
  ccss: ['5.G.A.1', '5.G.A.2'],
  im: [7],
  refs: ['im-scope-sequence'],
  theory: 'An ordered pair locates a point; the order is a convention that must be learned.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Reading x before y is a convention, and swapping them is a common and durable error. Showing the point already plotted and asking for its name isolates the ordering from the mechanics of plotting.',
  strategy: { name: 'Across, then up', text: 'Always read the across number first, then the up number. (3, 5) means 3 across and 5 up.' },
  rounds: 12, printItems: 9, seconds: 60,
  printInstruction: 'Write the coordinates of each marked point.',
  generate(seed, i, ch, r) {
    const x = r.int(1, 8), y = r.int(1, 8);
    const grid = (px, py, showPoint = true, print = false) => {
      const u = 22, ox = 26, oy = 14, N = 9;
      let s = `<svg viewBox="0 0 ${ox + N * u + 10} ${oy + N * u + 26}" width="100%" height="${print ? 150 : 230}" role="img" aria-label="grid with point at ${px}, ${py}"><g stroke="${print ? '#999' : 'var(--line2)'}" stroke-width=".8">`;
      for (let k = 0; k <= N; k++) {
        s += `<line x1="${ox}" y1="${oy + k * u}" x2="${ox + N * u}" y2="${oy + k * u}"/>`;
        s += `<line x1="${ox + k * u}" y1="${oy}" x2="${ox + k * u}" y2="${oy + N * u}"/>`;
      }
      s += `</g><g stroke="${print ? '#111' : 'var(--txt3)'}" stroke-width="2">
        <line x1="${ox}" y1="${oy + N * u}" x2="${ox + N * u}" y2="${oy + N * u}"/>
        <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy + N * u}"/></g><g font-size="10" fill="${print ? '#333' : 'var(--txt3)'}" font-family="'Space Grotesk',sans-serif">`;
      for (let k = 1; k <= 8; k++) {
        s += `<text x="${ox + k * u}" y="${oy + N * u + 15}" text-anchor="middle">${k}</text>`;
        s += `<text x="${ox - 8}" y="${oy + (N - k) * u + 4}" text-anchor="middle">${k}</text>`;
      }
      s += `</g>`;
      if (showPoint) s += `<circle cx="${ox + px * u}" cy="${oy + (N - py) * u}" r="6.5" fill="${print ? '#111' : 'var(--a2)'}"/>`;
      return s + `</svg>`;
    };
    const wrongs = [`(${y}, ${x})`, `(${x}, ${y + 1})`, `(${x + 1}, ${y})`].filter((w) => w !== `(${x}, ${y})`);
    return {
      type: 'choice', prompt: 'What are the coordinates of the point?',
      visual: grid(x, y), visualWidth: 300,
      choices: r.shuffle([`(${x}, ${y})`, ...r.sample([...new Set(wrongs)], 3)]),
      answer: `(${x}, ${y})`,
      printStem: 'Write the coordinates.',
      printVisual: grid(x, y, true, true),
      explain: `Across ${x}, up ${y}, so (${x}, ${y}). The x value always comes first.`,
    };
  },
};


/* ------------------------------------------- BOOK: the standard algorithm (G5 S3) */
const standardAlgorithm = {
  id: 'standard-algorithm', title: 'The Standard Algorithm', kind: 'book', grade: '5', strand: S[2],
  glyph: '⟌',
  skill: 'Multiplying multi-digit numbers and dividing by two digits, fluently.',
  trick: 'One column at a time, and write every carry down where you can see it. Slow is fast here.',
  blurb: 'The written methods, at full size. Two digits by two, and long division.',
  ccss: ['5.NBT.B.5', '5.NBT.B.6'],
  im: [4],
  refs: ['im-scope-sequence', 'fyfe-2014-fading', 'codding-2011', 'fuchs-2012-timed'],
  theory: 'The standard algorithm is the endpoint of a progression, not the starting point: it compresses partial products into a notation that only makes sense once the parts are understood.',
  roam: [{ task: 'fluencyCalf', subscale: 'mult' }, { task: 'fluencyCalf', subscale: 'div' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Grade 5 is where Illustrative Mathematics expects the standard algorithms to become fluent, having built them from partial products in grade 4. This book assumes that groundwork and drills the compressed form — with a partial-product page every third item so the compression stays connected to what it compresses.',
  pages: 16, printItems: 18,
  printInstruction: 'Work these out. Show your partial products or your long division.',
  printInstructions: { input: 'Work these out. Show your working.' },
  generate(seed, i, ch, r) {
    const mode = i % 3;
    if (mode === 0) {
      const a = r.int(12, 99), b = r.int(12, 99);
      return {
        type: 'input', prompt: `<strong>${a} × ${b} =</strong>`,
        answer: String(a * b), placeholder: '?', printStem: `${a} × ${b} =`,
        hint: `Split ${b} into ${Math.floor(b / 10) * 10} and ${b % 10}.`,
        explain: `${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}, and ${a} × ${b % 10} = ${a * (b % 10)}. Together ${a * b}.`,
      };
    }
    if (mode === 1) {
      // exact division by a two-digit divisor
      const d = r.int(12, 40), q = r.int(12, 60);
      const n = d * q;
      return {
        type: 'input', prompt: `<strong>${n} ÷ ${d} =</strong>`,
        answer: String(q), placeholder: '?', printStem: `${n} ÷ ${d} =`,
        hint: `How many ${d}s in ${n}? Start with tens: ${d} × 10 = ${d * 10}.`,
        explain: `${d} × ${q} = ${n}, so ${n} ÷ ${d} = ${q}.`,
      };
    }
    // keep the compressed form tied to the partial products it compresses
    const a = r.int(12, 49), b = r.int(12, 49);
    const t = Math.floor(b / 10) * 10, o = b % 10;
    return {
      type: 'choice',
      prompt: `For <strong>${a} × ${b}</strong>, which pair of partial products do you add?`,
      choices: r.shuffle([
        `${a * t} and ${a * o}`,
        `${a * t} and ${a}`,
        `${a + t} and ${a + o}`,
        `${a * Math.floor(b / 10)} and ${a * o}`,
      ]),
      answer: `${a * t} and ${a * o}`,
      printStem: `${a} × ${b}: partial products are ____ and ____`,
      hint: `Split ${b} into ${t} and ${o}, then multiply ${a} by each.`,
      explain: `${a} × ${t} = ${a * t} and ${a} × ${o} = ${a * o}. They add to ${a * b}.`,
    };
  },
};

export default [fractionFoundry, decimalPlace, standardAlgorithm, volumeAndSpace, mixedNumberLine, coordinateQuest];
