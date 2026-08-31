import { array2d, numberLine, tickRange, fractionBar, esc } from '../../src/lib/widgets.js';
import { frac, fracText, simplify, valF, gcd } from '../../src/lib/frac.js';
import { fill } from '../characters.js';

const S = ['Multiplication and division', 'Fractions on the number line', 'Area and perimeter', 'Data and graphs'];

/* ------------------------------------------------------------ BOOK: times table tower */
const timesTableTower = {
  id: 'times-table-tower', title: 'Times Table Tower', kind: 'book', grade: '3', strand: S[0],
  glyph: '×',
  skill: 'Multiplication facts to 10 × 10, and the division facts that go with them.',
  blurb: 'Build the tower one times table at a time.',
  ccss: ['3.OA.C.7', '3.OA.A.1'],
  im: [1, 4],
  refs: ['im-scope-sequence', 'codding-2011', 'fyfe-2014-fading', 'fuchs-2012-timed'],
  theory: 'Multiplicative structure, ordered by real difficulty rather than by table.',
  roam: [{ task: 'fluencyArf', subscale: 'mult' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Facts are ordered by how hard they actually are, not by table. The identities and the twos, fives and tens come first; the awkward middle of the grid (six sevens, seven eights) comes last. Going 2s, 3s, 4s in order front-loads the wrong difficulty. Each block ends with the matching division fact.',
  pages: 14, printItems: 12,
  printInstruction: 'Work these out. Write the answer.',
  generate(seed, i, ch, r) {
    // ARF-style bands: identities and small first, then the hard middle facts.
    const band = i < 4 ? 1 : i < 8 ? 2 : i < 11 ? 3 : 4;
    let a, b;
    if (band === 1) { a = r.int(1, 5); b = r.pick([1, 2, 5, 10]); }
    else if (band === 2) { a = r.int(2, 5); b = r.int(2, 6); }
    else if (band === 3) { a = r.int(3, 8); b = r.int(3, 8); }
    else { a = r.int(6, 9); b = r.int(6, 9); }
    const prod = a * b;
    if (i % 4 === 3) {
      // the matching division fact, so the inverse is practised alongside
      return {
        type: 'input', prompt: `<strong>${prod} ÷ ${b} =</strong>`,
        answer: String(a), placeholder: '?', printStem: `${prod} ÷ ${b} =`,
        hint: `Ask: ${b} times what makes ${prod}?`,
        explain: `${b} × ${a} = ${prod}, so ${prod} ÷ ${b} = ${a}.`,
      };
    }
    return {
      type: 'input', prompt: `<strong>${a} × ${b} =</strong>`,
      visual: band <= 2 ? array2d(a, b, { cell: 15 }) : null, visualWidth: 200,
      answer: String(prod), placeholder: '?', printStem: `${a} × ${b} =`,
      printVisual: band <= 2 ? array2d(a, b, { print: true, cell: 12 }) : null,
      hint: band <= 2 ? `Count the array: ${a} rows of ${b}.` : `${a} × ${b} is ${a} lots of ${b}. Try ${a} × ${b - 1} = ${a * (b - 1)}, then add ${a}.`,
      explain: `${a} × ${b} = ${prod}.`,
    };
  },
};

/* ------------------------------------------------- BOOK: fraction number line (flagship) */
const fractionNumberLine = {
  id: 'fraction-number-line', title: 'Fraction Number Line', kind: 'book', grade: '3', strand: S[1],
  glyph: '¾',
  skill: 'Placing a fraction on a number line, and seeing which fractions are equal.',
  blurb: 'Halves, thirds, fourths and eighths — find them on the line.',
  ccss: ['3.NF.A.2', '3.NF.A.3'],
  im: [5],
  refs: ['fuchs-2013-fractions', 'fuchs-ffo-wwc', 'wwc-2021-math', 'schneider-2018'],
  theory: 'Fraction as a number with a position, not as one whole number over another.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_1' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'A fraction placed on a number line is a fraction understood as a number, rather than as one whole number stacked on another. That shift is the single best predictor of later fraction competence, and the number line is the representation that produces it — which is why this is the flagship of the site.',
  pages: 14, printItems: 4,
  printInstruction: 'Mark each fraction on the number line.',
  printInstructions: {
    numberline: 'Mark each fraction on the number line.',
    choice: 'Write the fraction shaded in each bar.',
    truefalse: 'Are the two fractions equal? Circle T or F.',
  },
  generate(seed, i, ch, r, bookSeed = 0) {
    const stage = i < 5 ? 'place' : i < 9 ? 'name' : i < 12 ? 'equal' : 'compare';
    const dens = i < 5 ? [2, 3, 4] : [2, 3, 4, 5, 6, 8];

    if (stage === 'place') {
      // Explicit pool, walked by page index. Two reasons: with a random
      // denominator, d=2 forces 1/2 as the only option and the book repeats
      // itself; and these are MagPI's own 0-1 targets, so the practice matches
      // the assessment item for item.
      const pool = [
        [1, 2], [1, 4], [1, 3], [3, 4], [1, 5], [2, 3],
        [3, 8], [5, 8], [1, 6], [4, 5], [5, 6], [2, 5], [7, 8], [3, 5],
      ];
      // Offset comes from the BOOK seed, not the page seed, so 3 and 14 being
      // coprime makes consecutive pages walk the whole pool without repeating.
      const offset = bookSeed % pool.length;
      const [n, d] = pool[(i * 3 + offset) % pool.length];
      return {
        type: 'numberline', lo: 0, hi: 1, target: n / d, targetLabel: `${n}/${d}`,
        tolerance: 0.045,
        ticks: tickRange(0, 1, 1 / d), majors: [0, 0.5, 1],
        labels: [[0, '0'], [0.5, '1/2'], [1, '1']],
        prompt: `Drag the marker to <strong>${n}/${d}</strong>.`,
        printStem: `Mark <strong>${n}/${d}</strong> on the line.`,
        showReadout: false,
        hint: `The line is split into ${d} equal parts. Count ${n} of them from zero.`,
        explain: `${n}/${d} is ${n} of the ${d} equal parts, so it sits ${n / d < 0.5 ? 'left of' : n / d > 0.5 ? 'right of' : 'exactly at'} one half.`,
      };
    }

    if (stage === 'name') {
      const d = r.pick(dens), n = r.int(1, d - 1);
      const wrongs = [...new Set([`${n + 1}/${d}`, `${n}/${d + 1}`, `${d - n}/${d}`])].filter((x) => x !== `${n}/${d}`);
      return {
        type: 'choice', prompt: 'What fraction is shaded?',
        visual: fractionBar(n, d), visualWidth: 320,
        choices: r.shuffle([`${n}/${d}`, ...r.sample(wrongs, Math.min(3, wrongs.length))]),
        answer: `${n}/${d}`,
        printStem: `What fraction is shaded?`,
        printVisual: fractionBar(n, d, { print: true, width: 200, height: 30 }),
        hint: `Count the parts in the whole bar, then count the shaded ones.`,
        explain: `${n} shaded out of ${d} equal parts is ${n}/${d}.`,
      };
    }

    if (stage === 'equal') {
      const pairs = [[1, 2, 2, 4], [1, 2, 4, 8], [1, 2, 3, 6], [1, 3, 2, 6], [2, 3, 4, 6], [1, 4, 2, 8], [3, 4, 6, 8], [2, 4, 4, 8]];
      const [n1, d1, n2, d2] = r.pick(pairs);
      const isEqual = r.chance(0.6);
      const shownN = isEqual ? n2 : (n2 % d2) + (n2 + 1 <= d2 ? 1 : -1);
      const sn = isEqual ? n2 : Math.max(1, Math.min(d2 - 1, n2 + 1));
      const same = (n1 / d1) === (sn / d2);
      return {
        type: 'truefalse',
        prompt: `Is <strong>${n1}/${d1}</strong> the same as <strong>${sn}/${d2}</strong>?`,
        visual: fractionBar(n1, d1, { width: 300, height: 30 }) + fractionBar(sn, d2, { width: 300, height: 30 }),
        visualWidth: 320,
        answer: same,
        printStem: `Is ${n1}/${d1} the same as ${sn}/${d2}?`,
        printVisual: fractionBar(n1, d1, { print: true, width: 200, height: 26 })
                   + fractionBar(sn, d2, { print: true, width: 200, height: 26 }),
        hint: 'Line the two bars up. Do the shaded parts reach the same place?',
        explain: same
          ? `Yes — ${n1}/${d1} and ${sn}/${d2} land on the same spot.`
          : `No — ${n1}/${d1} is ${n1 / d1 > sn / d2 ? 'more' : 'less'} than ${sn}/${d2}.`,
      };
    }

    const d1 = r.pick([2, 3, 4, 6, 8]);
    let d2 = r.pick([2, 3, 4, 6, 8]);
    const n1 = r.int(1, d1 - 1);
    let n2 = r.int(1, d2 - 1);
    if (n1 / d1 === n2 / d2) { n2 = n2 === d2 - 1 ? Math.max(1, n2 - 1) : n2 + 1; }
    const leftBigger = n1 / d1 > n2 / d2;
    return {
      type: 'compare', prompt: 'Which fraction is larger?',
      left: `${n1}/${d1}`, right: `${n2}/${d2}`,
      answer: leftBigger ? 'left' : 'right',
      hint: 'Think where each one sits on the line. Is it past a half?',
      explain: `${leftBigger ? `${n1}/${d1}` : `${n2}/${d2}`} is larger.`,
    };
  },
};

/* ---------------------------------------------------------- BOOK: area and perimeter */
const areaAndPerimeter = {
  id: 'area-and-perimeter', title: 'Area and Perimeter', kind: 'book', grade: '3', strand: S[2],
  glyph: '▭',
  skill: 'Finding the area and the perimeter of a rectangle, and telling them apart.',
  blurb: 'Squares inside, or fence around the edge?',
  ccss: ['3.MD.C.7', '3.MD.D.8'],
  im: [2, 7],
  refs: ['im-scope-sequence', 'youcubed-close-to-100'],
  theory: 'Area is the array model measured; perimeter is a different quantity on the same figure.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Area on a grid is the same array model used for multiplication, which is why it belongs immediately after the times tables. Perimeter is interleaved deliberately: mixing the two is what forces a child to read the question instead of multiplying whatever they are given.',
  pages: 12, printItems: 9,
  printInstruction: 'Find the area or perimeter as asked.',
  generate(seed, i, ch, r) {
    const w = r.int(2, 8), h = r.int(2, 6);
    const wantArea = i % 2 === 0;
    const area = w * h, per = 2 * (w + h);
    return {
      type: 'input',
      prompt: `This rectangle is <strong>${w}</strong> by <strong>${h}</strong>. What is its <strong>${wantArea ? 'area' : 'perimeter'}</strong>?`,
      visual: array2d(h, w, { cell: 16 }), visualWidth: 200,
      answer: String(wantArea ? area : per), placeholder: '?',
      printStem: `Find the ${wantArea ? 'area' : 'perimeter'}.`,
      printVisual: array2d(h, w, { print: true, cell: 13 }),
      hint: wantArea ? 'Area is how many squares fit inside: rows times columns.' : 'Perimeter is the distance all the way round the edge.',
      explain: wantArea
        ? `Area = ${w} × ${h} = ${area} square units.`
        : `Perimeter = ${w} + ${h} + ${w} + ${h} = ${per} units.`,
    };
  },
};

/* ------------------------------------------------------------ GAME: fact family forge */
const factFamilyForge = {
  id: 'fact-family-forge', title: 'Fact Family Forge', kind: 'game', grade: '3', strand: S[0],
  glyph: '⟷',
  skill: 'Linking multiplication and division as the same fact seen two ways.',
  blurb: 'Three numbers make four facts. Find the missing one.',
  ccss: ['3.OA.B.6', '3.OA.C.7'],
  im: [4],
  refs: ['im-scope-sequence', 'codding-2011'],
  theory: 'Multiplication and division are one relation viewed from two directions.',
  roam: [{ task: 'fluencyArf', subscale: 'mult' }, { task: 'fluencyArf', subscale: 'div' }],
  evidence: 'Multiplication and division are one fact seen from two directions, and practising them together roughly halves what has to be memorised. Division facts usually lag precisely because they are rarely rehearsed as the inverse.',
  strategy: { name: 'Use the family', text: 'Three numbers make four facts. If 6 × 7 = 42, then 42 ÷ 7 = 6.' },
  rounds: 14, printItems: 18, seconds: 60,
  printInstruction: 'Fill in the missing number in each fact.',
  generate(seed, i, ch, r) {
    const a = r.int(2, 9), b = r.int(2, 9);
    const p = a * b;
    const form = i % 4;
    const q =
      form === 0 ? { stem: `${a} × ${b} = ?`, ans: p }
      : form === 1 ? { stem: `? × ${b} = ${p}`, ans: a }
      : form === 2 ? { stem: `${p} ÷ ${b} = ?`, ans: a }
      : { stem: `${p} ÷ ? = ${a}`, ans: b };
    const near = [...new Set([q.ans, q.ans + 1, Math.max(1, q.ans - 1), q.ans + b, Math.max(1, q.ans - 2)])].filter((x) => x > 0);
    return {
      type: 'choice', prompt: `<strong>${q.stem}</strong>`,
      choices: r.shuffle([q.ans, ...r.sample(near.filter((x) => x !== q.ans), 3)]).map(String),
      answer: String(q.ans),
      printStem: q.stem.replace('?', '____'),
      explain: `${a} × ${b} = ${p}, so ${p} ÷ ${b} = ${a} and ${p} ÷ ${a} = ${b}.`,
    };
  },
};

/* -------------------------------------------------------------- GAME: array architect */
const arrayArchitect = {
  id: 'array-architect', title: 'Array Architect', kind: 'game', grade: '3', strand: S[0],
  glyph: '▩',
  skill: 'Recognising a product from its shape, and knowing that order does not change it.',
  blurb: 'How many squares? Then: does 4×6 match 6×4?',
  ccss: ['3.OA.A.1', '3.OA.B.5'],
  im: [1, 2],
  refs: ['youcubed-close-to-100', 'fyfe-2014-fading'],
  theory: 'Commutativity is visible in an array and invisible in a symbol string.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'fluencyArf', subscale: 'mult' }],
  evidence: 'The commutative property is obvious in an array and invisible in a string of symbols — turning the rectangle a quarter turn is the whole proof. Seeing it halves the number of facts a child has to store.',
  strategy: { name: 'Rows times columns', text: 'Count one row, then count how many rows. Turning the array does not change the total.' },
  rounds: 12, printItems: 9, seconds: 60,
  printInstruction: 'Write the total for each array.',
  printInstructions: {
    choice: 'Write how many squares.',
    truefalse: 'Do the two products match? Circle T or F.',
  },
  generate(seed, i, ch, r) {
    const rows = r.int(2, 8), cols = r.int(2, 8);
    if (i % 3 === 2) {
      const same = r.chance(0.6);
      const r2 = same ? cols : Math.max(2, Math.min(9, cols + r.pick([1, -1])));
      const c2 = same ? rows : rows;
      const isSame = rows * cols === r2 * c2;
      return {
        type: 'truefalse',
        prompt: `Does <strong>${rows} × ${cols}</strong> give the same total as <strong>${r2} × ${c2}</strong>?`,
        answer: isSame,
        printStem: `${rows} × ${cols} = ${r2} × ${c2}?  T / F`,
        explain: isSame
          ? `Yes — ${rows} × ${cols} = ${r2} × ${c2} = ${rows * cols}. Turning an array does not change how many squares it has.`
          : `No — ${rows} × ${cols} = ${rows * cols} but ${r2} × ${c2} = ${r2 * c2}.`,
      };
    }
    return {
      type: 'choice', prompt: 'How many squares?',
      visual: array2d(rows, cols, { cell: 15 }), visualWidth: 220,
      choices: r.shuffle([...new Set([rows * cols, rows * cols + rows, rows * cols - cols, rows + cols])].filter((x) => x > 0)).slice(0, 4).map(String),
      answer: String(rows * cols),
      printStem: 'How many squares?',
      printVisual: array2d(rows, cols, { print: true, cell: 12 }),
      explain: `${rows} × ${cols} = ${rows * cols}.`,
    };
  },
};

export default [timesTableTower, fractionNumberLine, areaAndPerimeter, factFamilyForge, arrayArchitect];
