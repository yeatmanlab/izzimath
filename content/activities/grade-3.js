import { array2d, numberLine, tickRange, fractionBar, barChart, esc } from '../../src/lib/widgets.js';
import { STRANDS } from './strands.js';
import { frac, fracText, simplify, valF, gcd } from '../../src/lib/frac.js';
import { fill } from '../characters.js';
import { wordProblem } from '../wordproblems.js';

// Strand names come from the single source in strands.js — they used to be
// duplicated here, which silently desynced when the list grew to five.
const S = STRANDS['3'];

/* ------------------------------------------------------------ BOOK: times table tower */
const timesTableTower = {
  id: 'times-table-tower', title: 'Times Table Tower', kind: 'book', grade: '3', strand: S[0],
  glyph: '×',
  skill: 'Multiplication facts to 10 × 10, and the division facts that go with them.',
  trick: 'Every hard fact is an easy fact in a costume. ×4 is double, then double again. ×6 is ×3, then double. ×9 is ×10 take away one group.',
  blurb: 'Build the tower one times table at a time.',
  ccss: ['3.OA.C.7', '3.OA.A.1'],
  im: [1, 4],
  refs: ['im-scope-sequence', 'codding-2011', 'fyfe-2014-fading', 'fuchs-2012-timed'],
  theory: 'Multiplicative structure, ordered by real difficulty rather than by table.',
  roam: [{ task: 'fluencyArf', subscale: 'mult' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Facts are ordered by how hard they actually are, not by table. The identities and the twos, fives and tens come first; the awkward middle of the grid (six sevens, seven eights) comes last. Going 2s, 3s, 4s in order front-loads the wrong difficulty. Each block ends with the matching division fact.',
  pages: 14, printItems: 10,
  printInstruction: 'Work these out. Write the answer.',
  generate(seed, i, ch, r) {
    // Every fifth item is a word problem, tagged by schema rather than by
    // operation — the structure is the thing being taught. A fixed stride
    // rather than a tail slice, for two reasons: the printable generates fewer
    // items than the book, so a tail slice gave some sheets none and one sheet
    // sixteen; and a stride of 5 does not collide with the i % 4 staging these
    // activities already use, so no stage gets wiped out.
    if (i % 5 === 4) {
      return wordProblem(r.pick(['equalGroups','share']), ch, r, { max: 60, min: 6 });
    }
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
      visual: band <= 2 ? array2d(a, b, { fit: 150 }) : null, visualWidth: 200,
      answer: String(prod), placeholder: '?', printStem: `${a} × ${b} =`,
      printVisual: band <= 2 ? array2d(a, b, { print: true, fit: 96 }) : null,
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
  trick: 'The bottom number says how many equal jumps fit between 0 and 1. Make jumps that size, then take the top number of them.',
  printScratch: true,
  blurb: 'Halves, thirds, fourths and eighths — find them on the line.',
  ccss: ['3.NF.A.2', '3.NF.A.3'],
  im: [5],
  refs: ['fuchs-2013-fractions', 'fuchs-ffo-wwc', 'wwc-2021-math', 'schneider-2018'],
  theory: 'Fraction as a number with a position, not as one whole number over another.',
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_1' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'A fraction placed on a number line is a fraction understood as a number, rather than as one whole number stacked on another. That shift is the single best predictor of later fraction competence, and the number line is the representation that produces it — which is why this is the flagship of the site.',
  pages: 14, printItems: 5,
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
  trick: 'Perimeter is the walk around the edge, so add. Area is the tiles inside, so multiply.',
  printScratch: true,
  blurb: 'Squares inside, or fence around the edge?',
  ccss: ['3.MD.C.7', '3.MD.D.8'],
  im: [2, 7],
  refs: ['im-scope-sequence', 'youcubed-close-to-100'],
  theory: 'Area is the array model measured; perimeter is a different quantity on the same figure.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Area on a grid is the same array model used for multiplication, which is why it belongs immediately after the times tables. Perimeter is interleaved deliberately: mixing the two is what forces a child to read the question instead of multiplying whatever they are given.',
  pages: 12, printItems: 7,
  printInstruction: 'Find the area or perimeter as asked.',
  generate(seed, i, ch, r) {
    const w = r.int(2, 8), h = r.int(2, 6);
    const wantArea = i % 2 === 0;
    const area = w * h, per = 2 * (w + h);
    return {
      type: 'input',
      prompt: `This rectangle is <strong>${w}</strong> by <strong>${h}</strong>. What is its <strong>${wantArea ? 'area' : 'perimeter'}</strong>?`,
      visual: array2d(h, w, { fit: 150 }), visualWidth: 200,
      answer: String(wantArea ? area : per), placeholder: '?',
      printStem: `Find the ${wantArea ? 'area' : 'perimeter'}.`,
      printVisual: array2d(h, w, { print: true, fit: 96 }),
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
  goal: 'One number is missing from the fact. Work out which one it is.',
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: 'One family, four facts. If 6 × 7 = 42 then 42 ÷ 7 = 6 — the same three numbers read the other way round.',
  blurb: 'Three numbers make four facts. Find the missing one.',
  ccss: ['3.OA.B.6', '3.OA.C.7'],
  im: [4],
  refs: ['im-scope-sequence', 'codding-2011'],
  theory: 'Multiplication and division are one relation viewed from two directions.',
  roam: [{ task: 'fluencyArf', subscale: 'mult' }, { task: 'fluencyArf', subscale: 'div' }],
  evidence: 'Multiplication and division are one fact seen from two directions, and practising them together roughly halves what has to be memorised. Division facts usually lag precisely because they are rarely rehearsed as the inverse.',
  strategy: { name: 'Use the family', text: 'Three numbers make four facts. If 6 × 7 = 42, then 42 ÷ 7 = 6.' },
  rounds: 14, printItems: 24, seconds: 60,
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
  goal: 'Work out how many squares are in the array, without counting them one by one.',
  adaptive: {},   // graded item space — see docs/next/04-adaptive-and-spacing.md
  trick: 'The shape can be turned. 3 rows of 8 and 8 rows of 3 hold exactly the same number of squares.',
  blurb: 'How many squares? Then: does 4×6 match 6×4?',
  ccss: ['3.OA.A.1', '3.OA.B.5'],
  im: [1, 2],
  refs: ['youcubed-close-to-100', 'fyfe-2014-fading'],
  theory: 'Commutativity is visible in an array and invisible in a symbol string.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'fluencyArf', subscale: 'mult' }],
  evidence: 'The commutative property is obvious in an array and invisible in a string of symbols — turning the rectangle a quarter turn is the whole proof. Seeing it halves the number of facts a child has to store.',
  strategy: { name: 'Rows times columns', text: 'Count one row, then count how many rows. Turning the array does not change the total.' },
  rounds: 12, printItems: 10,
  printMaxPages: 1,   // its arrays vary in height, so a paginated page 1 cannot be
                      // guaranteed to fit — see the note in printsheet.js seconds: 60,
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
      visual: array2d(rows, cols, { fit: 150 }), visualWidth: 220,
      choices: r.shuffle([...new Set([rows * cols, rows * cols + rows, rows * cols - cols, rows + cols])].filter((x) => x > 0)).slice(0, 4).map(String),
      answer: String(rows * cols),
      printStem: 'How many squares?',
      printVisual: array2d(rows, cols, { print: true, fit: 96 }),
      explain: `${rows} × ${cols} = ${rows * cols}.`,
    };
  },
};


/* ------------------------------------------------ BOOK: four ways to subtract
   Three-digit subtraction is one procedure with four quite different faces, and
   a child who has only met the middle one stalls on the other three. The four
   here are named: no regrouping, one borrow, a borrow across a zero, and
   compensation.

   Why the true/false items are TRANSFORMATION claims and not preferences.
   content/types.js scores `truefalse` as strict boolean equality, so "this one
   is easier by compensating" has no truth value and its required `explain` would
   have to assert a taste as a fact. Every claim here is instead something that
   is true or false about the numbers — "503 - 298 gives the same answer as
   505 - 300" — and the explanation writes itself.

   Every true/false item prints its own subtraction in the stem. collect()
   resamples with a stride and both the type grouping and interleave() reorder
   items, so an item that says "the one above" is broken on paper. */
const fourWaysToSubtract = {
  id: 'four-ways-to-subtract', title: 'Four Ways to Subtract', kind: 'book', grade: '3', strand: S[3],
  glyph: '\u2212',
  skill: 'Three-digit subtraction across all four cases, and knowing which one you are looking at.',
  trick: 'Look at the columns before you start. If every top digit is bigger, just subtract. If one is smaller, borrow. If it is a zero, borrow from further along. And if the number you are taking away is nearly a hundred, move both numbers.',
  printScratch: true,
  printDensity: 'd2',
  blurb: 'Take away with no borrow, one borrow, a borrow across zero — and the trick that avoids borrowing altogether.',
  ccss: ['3.NBT.A.2'],
  im: [3],
  refs: ['im-scope-sequence', 'wwc-2021-math', 'rohrer-2020'],
  theory: 'A written method is not one skill. The regrouping cases differ enough that a child fluent in one can be stuck in another, and compensation is the case that shows subtraction is about the gap between two numbers rather than about digits.',
  /* sub-borrow declares grades 2-3, so a grade-3 activity is in its window.
     sub-noborrow is NOT declared even though the book contains the no-regroup
     form: that subscale is defined as two-digit and grades ['2'], so claiming it
     from a three-digit grade-3 book would misreport what was practised. */
  roam: [{ task: 'fluencyCalf', subscale: 'sub-borrow' }],
  evidence: 'Written subtraction is where the site had the thinnest coverage above grade 2: addition has a game and division has one, and subtraction with regrouping had a single grade-2 holder. The four cases are named rather than mixed silently, because the case a child is looking at determines what they should do first. The compensation case is the one that carries an idea rather than a procedure: adding the same amount to both numbers leaves the difference unchanged, which is why 503 - 298 can be done in your head and 503 - 298 in columns cannot. Interleaving warrant: Rohrer et al. (2020) found interleaved practice beat blocked practice 61% to 38% (d = 0.83) with the same problems and the same total practice, but that trial was grade 7, so applying it here is an inference from mechanism; it is claimed only for the compensation-versus-columns contrast and the word-problem stride, not for the regrouping cases, which differ in difficulty rather than in method.',
  pages: 12, printItems: 14,
  printInstruction: 'Work out each subtraction. For the true or false questions, circle T or F.',
  printInstructions: {
    input: 'Subtract. Show your borrowing.',
    truefalse: 'Is the claim true or false? Circle T or F.',
  },
  generate(seed, i, ch, r) {
    const mode = i % 4;

    // no regrouping: every top digit is larger, so the columns are independent
    if (mode === 0) {
      const h = r.int(4, 9), t = r.int(3, 9), o = r.int(3, 9);
      const bh = r.int(1, h - 3), bt = r.int(1, t - 2), bo = r.int(1, o - 2);
      const a = h * 100 + t * 10 + o, b = bh * 100 + bt * 10 + bo;
      return {
        type: 'input',
        prompt: `<strong>${a} &minus; ${b}</strong>`,
        answer: String(a - b), placeholder: '?',
        printStem: `${a} \u2212 ${b} =`,
        printKeyWorking: true,
        hint: `Every digit on top is bigger than the one below it, so no borrowing is needed. Take each column on its own.`,
        explain: `No borrowing here: ${o} \u2212 ${bo} = ${o - bo}, ${t} \u2212 ${bt} = ${t - bt}, ${h} \u2212 ${bh} = ${h - bh}. So ${a} \u2212 ${b} = ${a - b}.`,
      };
    }

    // one borrow, in the ones
    if (mode === 1) {
      const h = r.int(4, 9), t = r.int(2, 8), o = r.int(0, 4);
      const bh = r.int(1, h - 2), bt = r.int(0, t - 1), bo = r.int(o + 1, 9);
      const a = h * 100 + t * 10 + o, b = bh * 100 + bt * 10 + bo;
      return {
        type: 'input',
        prompt: `<strong>${a} &minus; ${b}</strong>`,
        answer: String(a - b), placeholder: '?',
        printStem: `${a} \u2212 ${b} =`,
        printKeyWorking: true,
        hint: `${o} is smaller than ${bo}, so borrow a ten: the ${o} becomes ${o + 10} and the ${t} becomes ${t - 1}.`,
        explain: `Borrow one ten: ${o + 10} \u2212 ${bo} = ${o + 10 - bo}, then ${t - 1} \u2212 ${bt} = ${t - 1 - bt}, then ${h} \u2212 ${bh} = ${h - bh}. So ${a} \u2212 ${b} = ${a - b}.`,
      };
    }

    /* a borrow across a zero — the case children get wrong most often, because
       there is no ten in the tens column to borrow, so it comes from the hundred */
    if (mode === 2) {
      /* Three digits on both sides: with a two-digit subtrahend the hundreds
         column is untouched and the case is much easier than the one it is
         meant to teach (400 - 137, where every column does something). */
      const h = r.int(3, 9);
      const a = h * 100;
      const bh = r.int(1, h - 1), bt = r.int(0, 8), bo = r.int(1, 9);
      const b = bh * 100 + bt * 10 + bo;
      return {
        type: 'input',
        prompt: `<strong>${a} &minus; ${b}</strong>`,
        answer: String(a - b), placeholder: '?',
        printStem: `${a} \u2212 ${b} =`,
        printKeyWorking: true,
        hint: `There are no tens to borrow from. Take one hundred and turn it into ten tens first, then borrow one of those.`,
        explain: `${a} is ${h - 1} hundreds and 10 tens. Borrow one of those tens: 10 \u2212 ${bo} = ${10 - bo}, then 9 \u2212 ${bt} = ${9 - bt}, then ${h - 1} \u2212 ${bh} = ${h - 1 - bh}. So ${a} \u2212 ${b} = ${a - b}.`,
      };
    }

    /* compensation, as a claim about the numbers. The false variants move only
       ONE side, which is exactly the mistake: the difference then changes. */
    const gap = r.pick([1, 2, 3, 4]);
    const near = 100 * r.int(2, 4);
    const sub = near - gap;                       // 298, 397, ...
    const top = r.int(sub + 105, sub + 480);
    const truth = r.pick([true, false, false]);   // false has two shapes
    const claim = truth
      ? { l: top + gap, rr: near }                // both moved: same answer
      : r.pick([{ l: top, rr: near }, { l: top + gap, rr: sub }]);  // one side only
    const same = (top - sub) === (claim.l - claim.rr);
    const stem = `${top} \u2212 ${sub} gives the same answer as ${claim.l} \u2212 ${claim.rr}`;
    return {
      type: 'truefalse',
      prompt: `<strong>${top} &minus; ${sub}</strong> gives the same answer as <strong>${claim.l} &minus; ${claim.rr}</strong>.`,
      printStem: stem,
      answer: same,
      hint: `Adding the same amount to BOTH numbers keeps the gap between them the same. Adding to only one changes it.`,
      explain: same
        ? `Both numbers went up by ${gap}, so the gap between them did not change: ${top} \u2212 ${sub} = ${top - sub} and ${claim.l} \u2212 ${claim.rr} = ${claim.l - claim.rr}. That is the whole trick \u2014 ${sub} is ${gap} short of ${near}, so take ${near} away (${top - near}) and give the ${gap} back: ${top - sub}.`
        : `Only one number moved, so the gap changed: ${top} \u2212 ${sub} = ${top - sub}, but ${claim.l} \u2212 ${claim.rr} = ${claim.l - claim.rr}. To keep the answer the same you have to add ${gap} to both.`,
    };
  },
};

/* ------------------------------------------------- BOOK: round and reckon (G3 S4) */
const roundAndReckon = {
  id: 'round-and-reckon', title: 'Round and Reckon', kind: 'book', grade: '3', strand: S[3],
  glyph: '≈',
  skill: 'Rounding to the nearest ten and hundred, and using it to check whether an answer is sensible.',
  trick: 'Look only at the digit one place to the right. Five or more rounds up; less than five stays put.',
  printScratch: true,
  blurb: 'Round it first, then work it out. Does your answer look right?',
  ccss: ['3.NBT.A.1', '3.NBT.A.2'],
  im: [3],
  refs: ['im-scope-sequence', 'wwc-2021-math', 'schneider-2018'],
  theory: 'Rounding is estimation with a rule, and estimation is what lets a child notice their own wrong answer.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'fluencyCalf', subscale: 'add-carry' }],
  evidence: 'Rounding is usually taught as a rule to follow and then never used. Here every rounding page is followed by a page that uses it to sanity-check a real calculation, which is the only reason estimation is worth knowing. It also leans on the number line: rounding is asking which ten or hundred a number is nearer to, which is a magnitude judgement, not a digit rule.',
  pages: 12, printItems: 18,
  printInstruction: 'Round each number, then check the calculations.',
  printInstructions: {
    input: 'Round each number as asked.',
    choice: 'Which estimate is closest?',
    truefalse: 'Could this answer be right? Circle T or F.',
  },
  generate(seed, i, ch, r) {
    const mode = i % 3;
    if (mode === 0) {
      const to = r.pick([10, 100]);
      const n = to === 10 ? r.int(11, 989) : r.int(101, 989);
      const rounded = Math.round(n / to) * to;
      return {
        type: 'input',
        prompt: `Round <strong>${n}</strong> to the nearest <strong>${to}</strong>.`,
        answer: String(rounded), placeholder: '?',
        printStem: `${n} to the nearest ${to} =`,
        hint: `Which ${to === 10 ? 'ten' : 'hundred'} is ${n} nearer to? Picture it on a number line.`,
        explain: `${n} is nearer to ${rounded} than to ${rounded === Math.floor(n / to) * to ? Math.floor(n / to) * to + to : Math.floor(n / to) * to}.`,
      };
    }
    if (mode === 1) {
      const a = r.int(120, 480), b = r.int(120, 480);
      const est = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
      const wrongs = [...new Set([est + 100, est - 100, est + 200])].filter((x) => x > 0 && x !== est);
      return {
        type: 'choice',
        prompt: `About how much is <strong>${a} + ${b}</strong>?`,
        choices: r.shuffle([String(est), ...r.sample(wrongs, 3).map(String)]),
        answer: String(est),
        printStem: `${a} + ${b} is about ____`,
        hint: `Round each number to the nearest hundred first.`,
        explain: `${a} rounds to ${Math.round(a / 100) * 100} and ${b} rounds to ${Math.round(b / 100) * 100}, so about ${est}. (The exact answer is ${a + b}.)`,
      };
    }
    // use the estimate to judge a stated answer — the point of estimating at all
    const a = r.int(210, 690), b = r.int(110, 290);
    const trueSum = a + b;
    const plausible = r.chance(0.5);
    const claimed = plausible ? trueSum : trueSum + r.pick([-300, 300, 450, -450]);
    return {
      type: 'truefalse',
      prompt: `Someone says <strong>${a} + ${b} = ${claimed}</strong>. Could that be right?`,
      answer: plausible,
      printStem: `${a} + ${b} = ${claimed}?`,
      hint: `Round both numbers and add them in your head first.`,
      explain: plausible
        ? `Yes — ${a} + ${b} really is ${trueSum}.`
        : `No. ${a} + ${b} is about ${Math.round(a / 100) * 100 + Math.round(b / 100) * 100}, so ${claimed} is far too ${claimed > trueSum ? 'big' : 'small'}. It is ${trueSum}.`,
    };
  },
};


/* ------------------------------------------------- BOOK: time and data (G3 S5) */
const timeAndData = {
  id: 'time-and-data', title: 'Time and Data', kind: 'book', grade: '3', strand: S[4],
  glyph: '⏱',
  skill: 'Elapsed time to the minute, and reading a scaled bar graph.',
  trick: 'Count on in whole hours first, then add the minutes. Never try to subtract times in a column like ordinary numbers.',
  printScratch: true,
  blurb: 'How long did it take? And what does the graph say when each square is worth five?',
  ccss: ['3.MD.A.1', '3.MD.B.3'],
  im: [6, 1],
  refs: ['im-scope-sequence', 'schneider-2018'],
  theory: 'Elapsed time is a distance on a number line whose units are sixties. A scaled graph is a number line with a multiplier.',
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'roamMagpi', subscale: 'numberline', block: '0_100' }],
  evidence: 'Required grade-3 coverage. Both halves are deliberately framed as number line work, which is the part with real support: elapsed time is a jump along a line in units of sixty, and a scaled bar graph is a line with a multiplier. That also makes the scale the thing being taught, which is where children actually go wrong.',
  pages: 12, printItems: 14,
  printPages: 2,   // two pages
  printInstruction: 'Work out the times, then read the graphs.',
  printInstructions: { input: 'Write the answer.', choice: 'Which is right?' },
  generate(seed, i, ch, r) {
    const mode = i % 3;
    if (mode === 0) {
      const startH = r.int(1, 11), startM = r.pick([0, 5, 10, 15, 20, 30, 40, 45, 50]);
      const mins = r.pick([15, 20, 25, 30, 40, 45, 50, 55, 70, 90]);
      const tot = startH * 60 + startM + mins;
      const eh = Math.floor(tot / 60) % 12 || 12, em = tot % 60;
      const fmt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
      return {
        type: 'input',
        prompt: `It starts at <strong>${fmt(startH, startM)}</strong> and lasts <strong>${mins} minutes</strong>. What time does it finish?`,
        answer: fmt(eh, em), placeholder: 'h:mm',
        printStem: `Starts ${fmt(startH, startM)}, lasts ${mins} min. Finishes at ____`,
        hint: `Jump to the next o'clock first, then carry on.`,
        explain: `${fmt(startH, startM)} plus ${mins} minutes is ${fmt(eh, em)}.`,
      };
    }
    const NAMES = ['Red', 'Blue', 'Green', 'Gold'];
    const scale = r.pick([2, 5, 10]);
    const counts = NAMES.map(() => r.int(1, 8) * scale);
    const bars = NAMES.map((n, k) => ({ label: n, v: counts[k] }));
    if (mode === 1) {
      const k = r.int(0, 3);
      return {
        type: 'input',
        prompt: `Each gridline is <strong>${scale}</strong>. How many for <strong>${NAMES[k]}</strong>?`,
        visual: barChart(bars, { step: scale }), visualWidth: 330,
        answer: String(counts[k]), placeholder: '?',
        printStem: `Each line is ${scale}. How many for ${NAMES[k]}?`,
        printVisual: barChart(bars, { print: true, step: scale, width: 220, height: 120 }),
        hint: `Count the gridlines up to the top of the bar, then multiply by ${scale}.`,
        explain: `${counts[k] / scale} gridlines × ${scale} = ${counts[k]}.`,
      };
    }
    const total = counts.reduce((n, v) => n + v, 0);
    const wrongs = [...new Set([total + scale, total - scale, Math.round(total / scale)])].filter((x) => x > 0 && x !== total);
    return {
      type: 'choice',
      prompt: `Each gridline is <strong>${scale}</strong>. What is the total?`,
      visual: barChart(bars, { step: scale }), visualWidth: 330,
      choices: r.shuffle([String(total), ...r.sample(wrongs, Math.min(3, wrongs.length)).map(String)]),
      answer: String(total),
      printStem: `Each line is ${scale}. Total = ____`,
      printVisual: barChart(bars, { print: true, step: scale, width: 220, height: 120 }),
      hint: `Read each bar using the scale before you add.`,
      explain: `${counts.join(' + ')} = ${total}.`,
    };
  },
};

export default [timesTableTower, fractionNumberLine, areaAndPerimeter, roundAndReckon, fourWaysToSubtract, timeAndData, factFamilyForge, arrayArchitect];
