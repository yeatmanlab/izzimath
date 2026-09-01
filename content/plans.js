/* Sequenced plans — a week order over activities that already exist.
   Recommendations 32 and 33 of the research pass.

   Everything else on the site is a single activity you can do in any order. A
   plan is the missing third shape: what to do, in what order, for how long. It
   holds no problems of its own — every week points at a book, a game and a
   printable that already exist, so a plan cannot drift out of step with the
   content.

   ---------------------------------------------------------------------------
   THE FOUR-PART LESSON (rec 32)

   Fuchs's Fraction Face-Off! runs every session to the same four-part shape:

     1. warm-up word problem   — one problem, read aloud, before anything new
     2. explicit instruction   — the method named and shown, not discovered
     3. speed game             — fluency on what was just taught, not new material
     4. worksheet              — independent practice, on paper

   This is the closest thing to a WWC-validated blueprint for what this site
   already is: the book/game/printable split maps onto parts 2, 3 and 4 almost
   exactly. What was missing was part 1, and the ORDER.

   THE WEEK ORDER (rec 33)

   Fraction Face-Off!'s week order is unusual, and adopting it costs nothing:
   magnitude reasoning and 0–1 ordering come in weeks 3–5, BEFORE equivalence
   (6–7) and BEFORE addition and subtraction (8–9). Most commercial materials
   sequence this the other way round, teaching equivalence as a procedure first.

   WHAT WE MAY AND MAY NOT CLAIM

   Fraction Face-Off! is WWC-reviewed, potentially positive in all three domains,
   with improvement indices of +33 / +31 / +24. That is the program's number,
   from the program's own trials, with its own materials and a trained
   interventionist. It is NOT ours. What we have adopted is the sequence and the
   session shape; the claim we are entitled to make is exactly that and no more.

   Honest about the joins, too: this is a grade-4 sequence, but weeks 1–5 lean on
   the grade-3 number-line book because that is where the magnitude work lives,
   and weeks 8–9 lean on the grade-5 book because that is where adding fractions
   lives. Each week says so.
--------------------------------------------------------------------------- */

export const FOUR_PART = [
  {
    part: 'Warm-up',
    minutes: '5',
    what: 'One word problem, read out loud together, before anything new.',
    why: 'It puts the fraction in a situation before it becomes a procedure, and it is short enough that nobody has to be persuaded into it.',
  },
  {
    part: 'Explicit instruction',
    minutes: '10',
    what: 'The method named and shown. Work the first one together, then hand it over.',
    why: 'Named before practised. The strategy box on every book and sheet is this part.',
  },
  {
    part: 'Speed game',
    minutes: '5',
    what: 'Fluency on what was just taught — never on something new.',
    why: 'A game is for getting quicker at something already met. That is why the games sit after the book and not before it.',
  },
  {
    part: 'Worksheet',
    minutes: '10',
    what: 'Independent practice, on paper, with the answer key kept back until afterwards.',
    why: 'Doing the same problems on paper a few days later is worth more than doing twice as many today.',
  },
];

export const plans = [
  {
    id: 'grade-4-fractions',
    title: 'Fractions in twelve weeks',
    grade: '4',
    weeks: 12,
    minutesPerSession: 30,
    sessionsPerWeek: 3,
    blurb: 'The week order from a WWC-reviewed fraction program, over the books, games and sheets already here.',
    credit: 'fuchs-ffo-wwc',
    // Each week: the four parts, pointing only at things that exist.
    schedule: [
      {
        n: 1, focus: 'A fraction is a number, not two numbers',
        warmUp: { schema: 'partWhole', text: 'A pizza is cut into 4 equal slices and you eat 1. Say what you ate, using a fraction.' },
        instruction: { activity: 'fraction-number-line', pages: '1–3' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'fraction-number-line' },
        note: 'Grade 3 book: this is where the measurement interpretation lives, and it is the foundation the rest of the sequence sits on.',
      },
      {
        n: 2, focus: 'Naming the unit — how many equal jumps from 0 to 1',
        warmUp: { schema: 'share', text: 'Three friends share one strip of paper equally. How much does each get?' },
        instruction: { activity: 'fraction-number-line', pages: '4–6' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'fraction-number-line' },
        note: 'Include odd denominators from the start — children over-generalise from halving if you only ever fold in two.',
      },
      {
        n: 3, focus: 'Where does it sit? Ordering on 0 to 1',
        warmUp: { schema: 'compare', text: 'You ran 3/4 of a mile and a friend ran 2/4. Who went further, and how do you know?' },
        instruction: { activity: 'fraction-number-line', pages: '7–10' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'fraction-number-line', mode: 'review' },
        note: 'Magnitude BEFORE equivalence. This is the part of the order most materials get the other way round.',
      },
      {
        n: 4, focus: 'The 1/2 benchmark',
        warmUp: { schema: 'compare', text: 'Is 5/8 more or less than half a cake? Say how you decided.' },
        instruction: { activity: 'equivalent-fractions', pages: '1–3' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'equivalent-fractions' },
        note: 'WWC names benchmark equivalence for 1/2 and 1 as the specific subskill that makes comparing and ordering possible. Tiny item space, large payoff.',
      },
      {
        n: 5, focus: 'Past 1 — improper fractions and mixed numbers',
        warmUp: { schema: 'join', text: 'You drink 3/4 of a bottle and then another 3/4. Is that more or less than one bottle?' },
        instruction: { activity: 'fraction-number-line', pages: '11–14' },
        game: { activity: 'mixed-number-line' },
        sheet: { activity: 'fraction-number-line', mode: 'review' },
        note: 'Grade 5 game. Go past 1 deliberately — a child who only ever sees fractions under 1 concludes that is what fractions are.',
      },
      {
        n: 6, focus: 'Equivalence — different names for the same point',
        warmUp: { schema: 'partWhole', text: 'Half a chocolate bar is the same as how many quarters?' },
        instruction: { activity: 'equivalent-fractions', pages: '4–7' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'equivalent-fractions' },
        note: 'Only now, and taught as the same POINT on the line rather than as a rule about multiplying.',
      },
      {
        n: 7, focus: 'Comparing with unlike denominators',
        warmUp: { schema: 'compare', text: 'Which is bigger, 2/3 or 3/5? Use a benchmark rather than a calculation.' },
        instruction: { activity: 'equivalent-fractions', pages: '8–11' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'equivalent-fractions', mode: 'review' },
      },
      {
        n: 8, focus: 'Adding and subtracting with the same denominator',
        warmUp: { schema: 'join', text: 'You read 2/8 of a book on Monday and 3/8 on Tuesday. How much have you read?' },
        instruction: { activity: 'fraction-foundry', pages: '1–4' },
        game: { activity: 'mixed-number-line' },
        sheet: { activity: 'fraction-foundry' },
        note: 'Grade 5 book: adding fractions lives there. Weeks 8–9 are where the sequence needs it, so that is where it is used.',
      },
      {
        n: 9, focus: 'Adding and subtracting with unlike denominators',
        warmUp: { schema: 'separate', text: 'You had 3/4 of a jug and poured out 1/2. How much is left?' },
        instruction: { activity: 'fraction-foundry', pages: '5–8' },
        game: { activity: 'mixed-number-line' },
        sheet: { activity: 'fraction-foundry', mode: 'review' },
        note: 'Adding needs a common denominator; comparing did not. Say that difference out loud — it is the commonest confusion here.',
      },
      {
        n: 10, focus: 'Tenths and hundredths',
        warmUp: { schema: 'partWhole', text: 'A metre stick is split into 10 equal parts. What fraction of a metre is one part?' },
        instruction: { activity: 'equivalent-fractions', pages: '12–14' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'equivalent-fractions' },
        note: 'The bridge into decimals: 3/10 and 30/100 and 0.3 are three names for one point.',
      },
      {
        n: 11, focus: 'Fractions and decimals as the same number',
        warmUp: { schema: 'compare', text: 'Which is closer to 1: 0.8 or 3/4?' },
        instruction: { activity: 'decimal-place', pages: '1–4' },
        game: { activity: 'decimal-drop' },
        sheet: { activity: 'decimal-place' },
        note: 'Grade 5 book, used lightly — only the tenths and hundredths pages.',
      },
      {
        n: 12, focus: 'Putting it together',
        warmUp: { schema: 'share', text: 'Four friends share 3 pizzas equally. How much does each get?' },
        instruction: { activity: 'equivalent-fractions', pages: 'mixed review' },
        game: { activity: 'mixed-number-line' },
        sheet: { activity: 'equivalent-fractions', mode: 'review' },
        ssdd: 'g4-three-quarters',
        note: 'Finish on the SSDD sheet: one fraction, four questions, four different methods. Deciding which method a question wants is the thing twelve weeks of practice is for.',
      },
    ],
  },
];

export const planById = (id) => plans.find((p) => p.id === id) ?? null;
export const plansForGrade = (g) => plans.filter((p) => p.grade === g);

/* Every activity a plan references, so the checker can prove there are no dead
   pointers and the build can prove the links resolve. */
export function planActivityIds(plan) {
  const out = new Set();
  for (const w of plan.schedule) {
    for (const k of ['instruction', 'game', 'sheet']) if (w[k]?.activity) out.add(w[k].activity);
  }
  return [...out];
}
