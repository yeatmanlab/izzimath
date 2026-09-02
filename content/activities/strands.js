// Scope and sequence. Five strands per grade, ordered roughly as the year runs.
//
// Order follows Illustrative Mathematics K-5 — the only free, openly licensed,
// coherent K-5 sequence — cross-checked against Eureka Math², EngageNY/Zearn and
// Fishtank. Strand names are parent-facing; the IM units and CCSS clusters live
// on each activity as metadata.
//
// Two structural choices worth noting:
//  - Grade 2 gets "The number line itself" as its own strand. That is IM's most
//    distinctive move: the line is taught as a STRUCTURE (numbers as distances
//    from zero) before it is used as a computation model. We start it earlier
//    than IM, at K via The Great Race, because that is where the evidence sits.
//  - Story problems get their own strand from K. WWC Recommendation 5 (word
//    problems) is rated STRONG on 18 studies, and fact fluency transfers to word
//    problems only weakly (g=0.25) — so word problems have to be taught, not
//    assumed to fall out of arithmetic practice.
//    That argument does not stop at grade 1, and today the strand does: grades
//    2-5 have no story strand and no dedicated story activity, though word
//    problems still appear as ITEMS at every grade via wordProblem(). The strand
//    is due to extend upward, but only in step with an activity to fill it — an
//    empty strand still prints in the grade-page subtitle, which would advertise
//    something a parent cannot click.
//  - Grade 4's third strand was 'Angles and lines'. Widened to name shapes so
//    symmetry and classification (4.G.A.2, 4.G.A.3) have somewhere honest to
//    live; 4.G.A.1 work is unaffected because activities index the list (S[2]).
//    Renamed rather than added, to keep five per grade.

export const STRANDS = {
  K: [
    'Counting and cardinality',
    'Number bonds to 10',
    'Story problems',
    'Flat and solid shapes',
    'Compare and measure',
  ],
  1: [
    'Addition and subtraction to 20',
    'All kinds of story problems',
    'Place value to 100',
    'Measure and tell time',
    'Shapes and halves',
  ],
  2: [
    'Place value to 1000',
    'Add and subtract within 100',
    'The number line itself',
    'Measure and data',
    'Arrays and equal groups',
  ],
  3: [
    'Multiplication and division',
    'Fractions on the number line',
    'Area and perimeter',
    'Add, subtract and round within 1000',
    'Measurement and data',
  ],
  4: [
    'Multi-digit operations',
    'Equivalent fractions and decimals',
    'Shapes, angles and lines',
    'Factors and multiples',
    'Times as many',
  ],
  5: [
    'Decimals to thousandths',
    'Fraction operations',
    'Multi-digit multiplication and division',
    'Volume',
    'The coordinate plane',
  ],
};
