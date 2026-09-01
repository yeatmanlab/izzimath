/* SSDD sheets — Same Surface, Different Deep.
   Four questions that LOOK the same and need four different procedures.

   The point is the discrimination, not the arithmetic. A column of twenty sums
   trains the procedure; it does not train deciding which procedure the question
   wants, because on a page of subtraction the answer to "what do I do here" is
   always the same. That decision is where most wrong answers on mixed work come
   from, and the only way to practise it is to put the choice back in.

   These are authored rather than generated, and that is not a shortcut. An SSDD
   set is cross-topic by construction: the four questions have to come from
   different parts of the curriculum while sharing one surface, which is
   precisely what a single activity's seeded generator cannot produce.

   `surface` is the shared thing all four questions are about, and it is stated
   ONCE at the top. `notice` is the instruction to read carefully. Each item
   names its `procedure`, which appears only on the answer key — that is the
   column an adult reads to see which method each question actually needed.

   Credit: the format is Craig Barton's, published as a large open bank at
   ssddproblems.com. The sets here are ours; the idea is his. */

export const ssddSets = [
  {
    id: 'k-two-rows',
    grade: 'K',
    title: 'Two rows of counters',
    strand: 'Counting and cardinality',
    surface: 'The top row has 5 counters. The bottom row has 3 counters.',
    figure: { rows: [5, 3] },
    notice: 'All four are about the same two rows. But they are not the same question — read each one twice.',
    ccss: ['K.CC.C.6', 'K.OA.A.1', 'K.OA.A.2'],
    items: [
      {
        ask: 'How many counters altogether?',
        answer: '8', procedure: 'Put together — add',
        explain: '5 and 3 more is 8. Count on from 5: six, seven, eight.',
      },
      {
        ask: 'How many more are in the top row than the bottom row?',
        answer: '2', procedure: 'Compare — find the difference',
        explain: 'Match them up in pairs. 3 pairs up, and 2 are left over in the top row.',
      },
      {
        ask: 'Which row has fewer counters?',
        answer: 'the bottom row', procedure: 'Compare — name the smaller',
        explain: '3 is less than 5, so the bottom row has fewer. This one wants a row, not a number.',
      },
      {
        ask: 'Take 2 away from the top row. How many are left in it?',
        answer: '3', procedure: 'Take from — subtract',
        explain: '5 take away 2 is 3. Only the top row changes; the bottom row is not part of this one.',
      },
    ],
  },

  {
    id: 'g1-the-number-47',
    grade: '1',
    title: 'One number, four questions',
    strand: 'Place value to 100',
    surface: 'The number is 47.',
    notice: 'Every question is about 47. Each one wants something different from it.',
    ccss: ['1.NBT.B.2', '1.NBT.C.5'],
    items: [
      {
        ask: 'How many tens are in 47?',
        answer: '4', procedure: 'Read the tens digit',
        explain: 'The left digit counts tens. 47 is 4 tens and 7 ones.',
      },
      {
        ask: 'How many ones are in 47?',
        answer: '7', procedure: 'Read the ones digit',
        explain: 'The right digit counts ones. Same number, different column.',
      },
      {
        ask: 'What is 10 more than 47?',
        answer: '57', procedure: 'Add a ten — only the tens digit moves',
        explain: '4 tens becomes 5 tens. The 7 ones do not change, so 57.',
      },
      {
        ask: 'What is 1 less than 47?',
        answer: '46', procedure: 'Count back one — only the ones digit moves',
        explain: 'One less than 7 ones is 6 ones. The 4 tens do not change, so 46.',
      },
    ],
  },

  {
    id: 'g2-63-and-28',
    grade: '2',
    title: 'Two numbers, four questions',
    strand: 'Add and subtract within 100',
    surface: 'The two numbers are 63 and 28.',
    notice: 'The same two numbers every time. Look at what each question actually asks for.',
    ccss: ['2.NBT.B.5', '2.NBT.A.1', '2.NBT.A.4'],
    items: [
      {
        ask: 'Add them.',
        answer: '91', procedure: 'Add with regrouping',
        explain: '3 + 8 is 11, so write 1 and carry a ten. 6 + 2 + 1 is 9 tens. 91.',
      },
      {
        ask: 'Take the smaller from the larger.',
        answer: '35', procedure: 'Subtract with borrowing',
        explain: 'You cannot take 8 from 3, so borrow a ten: 13 − 8 is 5, and 5 − 2 is 3. 35.',
      },
      {
        ask: 'Round each one to the nearest ten.',
        answer: '60 and 30', procedure: 'Round — no calculating at all',
        explain: '63 is nearer 60 than 70. 28 is nearer 30 than 20. Nothing is added or subtracted here.',
      },
      {
        ask: 'Is 63 − 28 more or less than 40? Answer without working it out.',
        answer: 'less', procedure: 'Estimate and justify — no exact answer wanted',
        explain: 'Round first: about 60 − 30 is about 30, which is less than 40. The rounded numbers are enough to decide.',
      },
    ],
  },

  {
    id: 'g3-four-by-six',
    grade: '3',
    title: 'One array, four questions',
    strand: 'Multiplication and division',
    surface: 'A rectangle is made of squares: 4 rows with 6 squares in each row.',
    figure: { array: [4, 6] },
    notice: 'All four are about this one rectangle. Four different jobs.',
    ccss: ['3.OA.A.3', '3.MD.D.8', '3.OA.A.2', '3.NF.A.1'],
    items: [
      {
        ask: 'How many squares are there?',
        answer: '24', procedure: 'Multiply — rows times columns',
        explain: '4 rows of 6 is 4 × 6 = 24.',
      },
      {
        ask: 'How far is it all the way round the outside, in square-side lengths?',
        answer: '20', procedure: 'Perimeter — add the edges',
        explain: 'The long sides are 6 each and the short sides are 4 each: 6 + 6 + 4 + 4 = 20. Around the edge means add, not multiply.',
      },
      {
        ask: 'Share all the squares equally into 3 groups. How many in each group?',
        answer: '8', procedure: 'Divide',
        explain: '24 shared into 3 groups is 24 ÷ 3 = 8. You need the answer to the first question before you can do this one.',
      },
      {
        ask: 'Half of the squares are shaded. How many are shaded?',
        answer: '12', procedure: 'Fraction of a quantity',
        explain: 'Half of 24 is 12. This one is a fraction of the total, not a count of rows.',
      },
    ],
  },

  {
    id: 'g4-three-quarters',
    grade: '4',
    title: 'One fraction, four questions',
    strand: 'Equivalent fractions and decimals',
    surface: 'The fraction is 3/4.',
    notice: 'Every question is about 3/4. None of them is answered the same way.',
    ccss: ['4.NF.A.1', '4.NF.A.2', '4.NF.C.6', '4.NF.B.4'],
    items: [
      {
        ask: 'Is 3/4 more or less than 1/2?',
        answer: 'more', procedure: 'Compare to a benchmark',
        explain: 'Half of 4 quarters is 2 quarters. 3 quarters is more than 2, so 3/4 is more than 1/2.',
      },
      {
        ask: 'Write a fraction equal to 3/4 with 8 on the bottom.',
        answer: '6/8', procedure: 'Equivalence — scale top and bottom together',
        explain: '4 × 2 is 8, so do the same to the top: 3 × 2 is 6. Same point on the line, different name.',
      },
      {
        ask: 'Write 3/4 as a decimal.',
        answer: '0.75', procedure: 'Convert to hundredths',
        explain: '3/4 is 75/100, and 75 hundredths is written 0.75.',
      },
      {
        ask: 'What is 3/4 of 20?',
        answer: '15', procedure: 'Fraction of a quantity',
        explain: 'A quarter of 20 is 5, so three quarters is 3 × 5 = 15. This one needs a whole to take a fraction OF.',
      },
    ],
  },

  {
    id: 'g5-decimals-24-and-06',
    grade: '5',
    title: 'Two decimals, four questions',
    strand: 'Decimals to thousandths',
    surface: 'The two numbers are 2.4 and 0.6.',
    notice: 'Same pair of decimals in all four. The operation is the thing that changes.',
    ccss: ['5.NBT.B.7', '5.NBT.A.3'],
    items: [
      {
        ask: 'Add them.',
        answer: '3', procedure: 'Add — line up the points',
        explain: '2.4 + 0.6: 4 tenths and 6 tenths make 10 tenths, which is a whole. 3.0, written 3.',
      },
      {
        ask: 'Multiply them.',
        answer: '1.44', procedure: 'Multiply — count the decimal places',
        explain: '24 × 6 is 144. There is one decimal place in each number, so two altogether: 1.44.',
      },
      {
        ask: 'Divide 2.4 by 0.6.',
        answer: '4', procedure: 'Divide — how many of the small fit in the big',
        explain: 'How many 0.6s fit in 2.4? Scale both by 10: 24 ÷ 6 = 4. Notice dividing made it bigger.',
      },
      {
        ask: 'Which of the two is closer to 1?',
        answer: '0.6', procedure: 'Compare distances — no arithmetic on the pair',
        explain: '0.6 is 0.4 away from 1. 2.4 is 1.4 away from 1. So 0.6 is closer.',
      },
    ],
  },
];

export const ssddById = (id) => ssddSets.find((s) => s.id === id) ?? null;
export const ssddForGrade = (g) => ssddSets.filter((s) => s.grade === g);
