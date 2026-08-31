// Word problems.
//
// Tagged by SCHEMA rather than by operation. That is the Thinking Blocks /
// Cognitively Guided Instruction taxonomy, and it matters because children who
// only ever see "which operation is this?" learn to hunt for keywords, while
// children who learn the underlying structure can handle a problem whose wording
// they have not met. The schema is the thing being taught; the arithmetic is
// almost incidental.
//
// Stems are authored character-agnostic and filled from the character pack, so
// Kiwi counts crickets and Georgie counts treats with no duplicated authoring.

import { fill } from './characters.js';

export const SCHEMAS = {
  join:       { id: 'join',       name: 'Join',            blurb: 'Something is added to a starting amount.' },
  separate:   { id: 'separate',   name: 'Separate',        blurb: 'Something is taken away from a starting amount.' },
  partWhole:  { id: 'partWhole',  name: 'Part and whole',  blurb: 'Two parts together make a whole.' },
  compare:    { id: 'compare',    name: 'Compare',         blurb: 'Two amounts, and the difference between them.' },
  equalGroups:{ id: 'equalGroups',name: 'Equal groups',    blurb: 'Several groups of the same size.' },
  share:      { id: 'share',      name: 'Sharing',         blurb: 'A total split into equal shares.' },
};

/* Each template returns { stem, answer, schema, explain }.
   `u` is the unknown position — the same schema is much harder when the unknown
   is the start rather than the result, and varying it is the point. */
const T = {
  join: (ch, a, b, u = 'result') => {
    const C = fill('{collectible.many}', ch), A = fill('{Actor}', ch);
    if (u === 'result') return {
      stem: `${A} has ${a} ${C}. ${A} finds ${b} more. How many ${C} now?`,
      answer: a + b, explain: `${a} + ${b} = ${a + b}.` };
    if (u === 'change') return {
      stem: `${A} has ${a} ${C}. After finding some more, ${A} has ${a + b}. How many were found?`,
      answer: b, explain: `${a + b} − ${a} = ${b}.` };
    return {
      stem: `${A} finds ${b} ${C}, and now has ${a + b}. How many did ${A} start with?`,
      answer: a, explain: `${a + b} − ${b} = ${a}.` };
  },
  separate: (ch, a, b, u = 'result') => {
    const C = fill('{collectible.many}', ch), A = fill('{Actor}', ch);
    // The verb comes from the character: an animal eats its collectible, but
    // "Sam eats 18 counters" is nonsense, so plain maths gives them away.
    const v = fill('{verb.consume}', ch) || 'gives away';
    const vBase = fill('{verb.consumeBase}', ch) || 'give away';   // "did X eat", not "did X eats" 
    if (u === 'result') return {
      stem: `${A} has ${a} ${C} and ${v} ${b}. How many are left?`,
      answer: a - b, explain: `${a} − ${b} = ${a - b}.` };
    return {
      stem: `${A} has ${a} ${C}, and ${a - b} are left. How many did ${A} ${vBase}?`,
      answer: b, explain: `${a} − ${a - b} = ${b}.` };
  },
  partWhole: (ch, a, b) => {
    const C = fill('{collectible.many}', ch), A = fill('{Actor}', ch);
    return {
      stem: `${A} has ${a} big ${C} and ${b} small ${C}. How many ${C} altogether?`,
      answer: a + b, explain: `${a} and ${b} make ${a + b}.` };
  },
  compare: (ch, a, b) => {
    const C = fill('{collectible.many}', ch), A = fill('{Actor}', ch);
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return {
      stem: `${A} has ${hi} ${C}. A friend has ${lo}. How many more does ${A} have?`,
      answer: hi - lo, explain: `${hi} − ${lo} = ${hi - lo}.` };
  },
  equalGroups: (ch, groups, per) => {
    const C = fill('{collectible.many}', ch), K = fill('{container.many}', ch), A = fill('{Actor}', ch);
    const Cap = C[0].toUpperCase() + C.slice(1);   // sentence-initial
    return {
      stem: `${Cap} come in ${K} of ${per}. ${A} has ${groups} ${K}. How many ${C} altogether?`,
      answer: groups * per, explain: `${groups} × ${per} = ${groups * per}.` };
  },
  share: (ch, total, shares) => {
    const C = fill('{collectible.many}', ch), A = fill('{Actor}', ch);
    return {
      stem: `${A} shares ${total} ${C} equally between ${shares} friends. How many each?`,
      answer: total / shares, explain: `${total} ÷ ${shares} = ${total / shares}.` };
  },
};

/* Build one word problem. Returns a `input`-type problem object ready to render. */
export function wordProblem(schema, ch, r, { max = 20, min = 2, unknown = null } = {}) {
  let a, b, out;
  switch (schema) {
    case 'join': {
      a = r.int(min, Math.max(min + 1, Math.floor(max / 2))); b = r.int(min, Math.max(min + 1, Math.floor(max / 2)));
      out = T.join(ch, a, b, unknown ?? r.pick(['result', 'result', 'change', 'start']));
      break;
    }
    case 'separate': {
      a = r.int(Math.max(min + 1, Math.ceil(max / 2)), max); b = r.int(min, a - 1);
      out = T.separate(ch, a, b, unknown ?? r.pick(['result', 'result', 'change']));
      break;
    }
    case 'partWhole': {
      a = r.int(min, Math.max(min + 1, Math.floor(max / 2))); b = r.int(min, Math.max(min + 1, Math.floor(max / 2)));
      out = T.partWhole(ch, a, b); break;
    }
    case 'compare': {
      a = r.int(Math.max(4, min), max); b = r.int(Math.max(1, Math.floor(min / 2)), a - 1);
      out = T.compare(ch, a, b); break;
    }
    // For the multiplicative schemas the floor applies to the TOTAL, not to the
    // factors — "share 10 between 2" is trivial in grade 4 however it is drawn.
    case 'equalGroups': {
      let groups, per, tries = 0;
      do {
        groups = r.int(2, 9);
        per = r.int(2, Math.max(2, Math.min(12, Math.floor(max / groups))));
      } while (groups * per < min && ++tries < 12);
      out = T.equalGroups(ch, groups, per); break;
    }
    case 'share': {
      let shares, each, tries = 0;
      do {
        shares = r.int(2, 8);
        each = r.int(2, Math.max(2, Math.min(12, Math.floor(max / shares))));
      } while (shares * each < min && ++tries < 12);
      out = T.share(ch, shares * each, shares); break;
    }
    default: throw new Error('unknown schema ' + schema);
  }
  return {
    type: 'input',
    schema,
    prompt: out.stem,
    printStem: out.stem,
    answer: String(out.answer),
    placeholder: '?',
    hint: `This is a ${SCHEMAS[schema].name.toLowerCase()} problem. ${SCHEMAS[schema].blurb}`,
    explain: out.explain,
  };
}

export const schemasForGrade = (g) => ({
  K: ['join', 'separate', 'partWhole'],
  1: ['join', 'separate', 'partWhole', 'compare'],
  2: ['join', 'separate', 'compare', 'partWhole'],
  3: ['equalGroups', 'share', 'compare'],
  4: ['equalGroups', 'share', 'compare'],
  5: ['equalGroups', 'share', 'compare'],
}[g] ?? ['join', 'separate']);
