import { array2d, numberLine, tickRange, fractionBar, esc } from '../../src/lib/widgets.js';
import { frac, fracText, simplify, valF, gcd } from '../../src/lib/frac.js';

const S = ['Multi-digit operations', 'Equivalent fractions and decimals', 'Angles and lines', 'Factors and multiples'];

/* ---------------------------------------------------------- BOOK: long multiplication */
const longMultiplication = {
  id: 'long-multiplication', title: 'Long Multiplication', kind: 'book', grade: '4', strand: S[0],
  glyph: '⨉',
  skill: 'Multiplying a two-digit number by one digit, then by two digits.',
  blurb: 'Break it into parts, multiply, put it back together.',
  ccss: ['4.NBT.B.5'],
  roam: [{ task: 'fluencyCalf', subscale: 'mult' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'CALF’s M1–M3 bands walk two-digit × one-digit from 11×2 up to 76×4, then ALPACA’s grade-4 items jump to genuine two-by-two (17×42). The area model is kept visible for the first pages because it shows why the partial products are what they are.',
  pages: 14, printItems: 16,
  printInstruction: 'Work these out. Show your partial products.',
  generate(seed, i, ch, r) {
    const stage = i < 4 ? 'm1' : i < 8 ? 'm2' : i < 11 ? 'm3' : 'two-digit';
    if (stage === 'two-digit') {
      const a = r.int(12, 49), b = r.int(12, 49);
      return {
        type: 'input', prompt: `<strong>${a} × ${b} =</strong>`,
        answer: String(a * b), placeholder: '?', printStem: `${a} × ${b} =`,
        hint: `Split ${b} into ${Math.floor(b / 10) * 10} and ${b % 10}. Work out ${a} × ${Math.floor(b / 10) * 10} and ${a} × ${b % 10}, then add.`,
        explain: `${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}, and ${a} × ${b % 10} = ${a * (b % 10)}. Together ${a * b}.`,
      };
    }
    const ranges = { m1: [11, 29, 2, 4], m2: [21, 59, 3, 6], m3: [36, 99, 4, 9] };
    const [lo, hi, blo, bhi] = ranges[stage];
    const a = r.int(lo, hi), b = r.int(blo, bhi);
    const tens = Math.floor(a / 10) * 10, ones = a % 10;
    return {
      type: 'input', prompt: `<strong>${a} × ${b} =</strong>`,
      visual: stage === 'm1' ? array2d(b, Math.min(a, 12), { cell: 12 }) : null, visualWidth: 200,
      answer: String(a * b), placeholder: '?', printStem: `${a} × ${b} =`,
      hint: `Split ${a} into ${tens} and ${ones}. Then ${tens} × ${b} and ${ones} × ${b}.`,
      explain: `${tens} × ${b} = ${tens * b}, ${ones} × ${b} = ${ones * b}. Add them: ${a * b}.`,
    };
  },
};

/* -------------------------------------------------------- BOOK: equivalent fractions */
const equivalentFractions = {
  id: 'equivalent-fractions', title: 'Equivalent Fractions', kind: 'book', grade: '4', strand: S[1],
  glyph: '≡',
  skill: 'Recognising and generating equal fractions, and simplifying to lowest terms.',
  blurb: 'Same amount, different name. 2/4 is 1/2.',
  ccss: ['4.NF.A.1', '4.NF.A.2'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }, { task: 'roamMagpi', subscale: 'numberline', block: '0_1' }],
  evidence: 'Equivalence is the hinge between grade-3 fraction placement and the grade-5 arithmetic ROAM tests with unlike denominators (3/4 + 5/6). If equivalence is not secure, common denominators are a memorised ritual.',
  pages: 14, printItems: 14,
  printInstruction: 'Complete each equivalent fraction, or simplify it.',
  generate(seed, i, ch, r) {
    const stage = i % 3;
    if (stage === 0) {
      const d = r.pick([2, 3, 4, 5]), n = r.int(1, d - 1), k = r.int(2, 4);
      return {
        type: 'input', prompt: `<strong>${n}/${d} = ?/${d * k}</strong>`,
        visual: fractionBar(n, d, { width: 300, height: 30 }) + fractionBar(n * k, d * k, { width: 300, height: 30 }),
        visualWidth: 320,
        answer: String(n * k), placeholder: '?', printStem: `${n}/${d} = ____/${d * k}`,
        hint: `The bottom was multiplied by ${k}, so do the same to the top.`,
        explain: `${d} × ${k} = ${d * k}, so ${n} × ${k} = ${n * k}. ${n}/${d} = ${n * k}/${d * k}.`,
      };
    }
    if (stage === 1) {
      const base = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]]);
      const k = r.int(2, 5);
      const n = base[0] * k, d = base[1] * k;
      return {
        type: 'input', accept: 'fraction',
        prompt: `Write <strong>${n}/${d}</strong> in its simplest form.`,
        answer: `${base[0]}/${base[1]}`, placeholder: 'e.g. 1/2',
        printStem: `${n}/${d} = ____`,
        hint: `What number divides both ${n} and ${d}?`,
        explain: `Both divide by ${k}: ${n}/${d} = ${base[0]}/${base[1]}.`,
      };
    }
    const a = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 6]]);
    const b = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 6]]);
    const va = a[0] / a[1], vb = b[0] / b[1];
    if (va === vb) {
      return {
        type: 'truefalse', prompt: `Is <strong>${a[0]}/${a[1]}</strong> equal to <strong>${b[0]}/${b[1]}</strong>?`,
        answer: true, printStem: `${a[0]}/${a[1]} = ${b[0]}/${b[1]}?  T / F`,
        hint: 'Try writing both with the same bottom number.',
        explain: `They are the same amount.`,
      };
    }
    return {
      type: 'compare', prompt: 'Which is larger?',
      left: `${a[0]}/${a[1]}`, right: `${b[0]}/${b[1]}`,
      answer: va > vb ? 'left' : 'right',
      hint: 'Compare each to one half, or give them the same bottom number.',
      explain: `${va > vb ? `${a[0]}/${a[1]}` : `${b[0]}/${b[1]}`} is larger.`,
    };
  },
};

/* ------------------------------------------------------------- BOOK: angles and lines */
const anglesAndLines = {
  id: 'angles-and-lines', title: 'Angles and Lines', kind: 'book', grade: '4', strand: S[2],
  glyph: '∠',
  skill: 'Naming angles by size, and adding angles that meet at a point or on a line.',
  blurb: 'Acute, right, obtuse — then work out the missing angle.',
  ccss: ['4.MD.C.5', '4.MD.C.7', '4.G.A.1'],
  roam: [{ task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'Angle sums are the first place children meet an unknown that must be deduced rather than computed, which is the step towards the algebraic reasoning ROAM tests from grade 6 on.',
  pages: 12, printItems: 12,
  printInstruction: 'Name each angle, or find the missing one.',
  generate(seed, i, ch, r) {
    const angleSvg = (deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = 20 + 100 * Math.cos(-rad), y = 100 - 100 * Math.sin(rad);
      return `<svg viewBox="0 0 150 120" width="100%" height="120" role="img" aria-label="angle of ${deg} degrees">
        <g stroke="var(--a1)" stroke-width="3" fill="none" stroke-linecap="round">
          <path d="M20 100 H140"/><path d="M20 100 L${(20 + 110 * Math.cos(rad)).toFixed(1)} ${(100 - 110 * Math.sin(rad)).toFixed(1)}"/>
        </g>
        <path d="M50 100 A30 30 0 0 0 ${(20 + 30 * Math.cos(rad)).toFixed(1)} ${(100 - 30 * Math.sin(rad)).toFixed(1)}"
          fill="none" stroke="var(--txt3)" stroke-width="1.6" stroke-dasharray="3 2"/></svg>`;
    };
    if (i % 3 === 0) {
      const deg = r.pick([25, 40, 55, 90, 90, 115, 140, 160]);
      const name = deg < 90 ? 'acute' : deg === 90 ? 'right' : 'obtuse';
      return {
        type: 'choice', prompt: `What kind of angle is this?`,
        visual: angleSvg(deg), visualWidth: 190,
        choices: r.shuffle(['acute', 'right', 'obtuse', 'straight']),
        answer: name, printStem: `An angle of ${deg}° is ____`,
        hint: 'A right angle is exactly 90°. Less is acute, more is obtuse.',
        explain: `${deg}° is ${name}${deg === 90 ? '' : deg < 90 ? ' — less than 90°' : ' — more than 90°'}.`,
      };
    }
    if (i % 3 === 1) {
      const a = r.int(20, 70);
      return {
        type: 'input', prompt: `Two angles sit on a straight line. One is <strong>${a}°</strong>. What is the other?`,
        answer: String(180 - a), placeholder: '?', printStem: `${a}° + ____ = 180°`,
        hint: 'Angles on a straight line add to 180°.',
        explain: `180 − ${a} = ${180 - a}°.`,
      };
    }
    const a = r.int(30, 120), b = r.int(30, Math.max(31, 200 - a));
    const c = 360 - a - b;
    return {
      type: 'input', prompt: `Three angles meet at a point. Two are <strong>${a}°</strong> and <strong>${b}°</strong>. What is the third?`,
      answer: String(c), placeholder: '?', printStem: `${a}° + ${b}° + ____ = 360°`,
      hint: 'Angles round a full point add to 360°.',
      explain: `360 − ${a} − ${b} = ${c}°.`,
    };
  },
};

/* ------------------------------------------------------------- GAME: division descent */
const divisionDescent = {
  id: 'division-descent', title: 'Division Descent', kind: 'game', grade: '4', strand: S[0],
  glyph: '÷',
  skill: 'Dividing a two- or three-digit number by a single digit.',
  blurb: 'Climb down: how many times does it go?',
  ccss: ['4.NBT.B.6'],
  roam: [{ task: 'fluencyCalf', subscale: 'div' }],
  evidence: 'CALF’s D1–D3 bands run 22÷2 up to 304÷4 — always by a single digit, and always exact. Rounds here follow the same ranges and stay exact, so the child is practising the procedure rather than wrestling remainders.',
  rounds: 12, seconds: 90, printItems: 14,
  printInstruction: 'Work these out. Every one divides exactly.',
  generate(seed, i, ch, r) {
    const band = i < 4 ? 'd1' : i < 8 ? 'd2' : 'd3';
    const cfg = { d1: [2, 9, 11, 22], d2: [3, 9, 30, 60], d3: [4, 9, 60, 99] }[band];
    const [dlo, dhi, qlo, qhi] = cfg;
    const d = r.int(dlo, dhi), q = r.int(qlo, qhi);
    const n = d * q;
    return {
      type: 'input', prompt: `<strong>${n} ÷ ${d} =</strong>`,
      answer: String(q), placeholder: '?', printStem: `${n} ÷ ${d} =`,
      hint: `How many ${d}s fit into ${n}? Try tens first: ${d} × 10 = ${d * 10}.`,
      explain: `${d} × ${q} = ${n}, so ${n} ÷ ${d} = ${q}.`,
    };
  },
};

/* ----------------------------------------------------------------- GAME: decimal drop */
const decimalDrop = {
  id: 'decimal-drop', title: 'Decimal Drop', kind: 'game', grade: '4', strand: S[1],
  glyph: '·',
  skill: 'Placing a decimal between 0 and 1, and matching it to its fraction.',
  blurb: 'Where does 0.35 land? And what fraction is that?',
  ccss: ['4.NF.C.6', '4.NF.C.7'],
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_1' }, { task: 'roamAlpaca', subscale: 'cat3' }],
  evidence: 'MagPI’s 0–1 block and ALPACA’s grade-4 decimal items (0.65 + 0.3) both live in this space. Putting decimals and fractions on the same line is what makes them one idea rather than two notations.',
  rounds: 12, seconds: 0, timerAvailable: true, printItems: 10,
  printInstruction: 'Mark each decimal on the line.',
  generate(seed, i, ch, r) {
    if (i % 3 === 2) {
      const pairs = [[0.5, '1/2'], [0.25, '1/4'], [0.75, '3/4'], [0.2, '1/5'], [0.4, '2/5'], [0.1, '1/10'], [0.3, '3/10']];
      const [dec, fr] = r.pick(pairs);
      const wrongs = pairs.filter((p) => p[1] !== fr).map((p) => p[1]);
      return {
        type: 'choice', prompt: `Which fraction equals <strong>${dec}</strong>?`,
        choices: r.shuffle([fr, ...r.sample(wrongs, 3)]),
        answer: fr, printStem: `${dec} = ____`,
        explain: `${dec} is ${fr}.`,
      };
    }
    const tenth = r.int(1, 19);
    const target = Math.round((tenth / 20) * 100) / 100;
    return {
      type: 'numberline', lo: 0, hi: 1, target, targetLabel: String(target),
      tolerance: 0.04,
      ticks: tickRange(0, 1, 0.1), majors: [0, 0.5, 1],
      labels: [[0, '0'], [0.5, '0.5'], [1, '1']],
      prompt: `Where does <strong>${target}</strong> go?`,
      printStem: `Mark <strong>${target}</strong> on the line.`,
      explain: `${target} is ${target < 0.5 ? 'less than' : target > 0.5 ? 'more than' : 'exactly'} a half.`,
    };
  },
};

export default [longMultiplication, equivalentFractions, anglesAndLines, divisionDescent, decimalDrop];
