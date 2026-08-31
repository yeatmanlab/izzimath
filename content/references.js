// Reference registry.
//
// Every activity declares `refs: [...]` naming the citations that support it, and
// this file is the other half of that link. The /references/ page renders both
// directions: each citation lists the activities it supports, and each activity
// page links to its citations.
//
// Fields:
//   authors, year, title, venue, url / doi   the citation itself
//   kind      what sort of evidence it is
//   strength  how much weight it can carry (see STRENGTH below)
//   finding   what it actually found, with numbers where they exist
//   use       how Izzi Math uses it — and, where relevant, how it limits us
//   scope     'site' if it shapes a site-wide decision rather than one activity.
//   appliesTo activity ids this shaped, for sources that are not cited by an
//             activity's own `refs` but still changed how it was built
//   showsUpIn site pages where the effect of this source is visible
//
// The `strength` field is deliberately honest. Several references here are
// practitioner sources or null results, and they are labelled as such rather
// than quietly borrowing authority from the trials around them.

export const STRENGTH = {
  strong:   { id: 'strong',   label: 'Strong',        blurb: 'Randomised trials or a WWC strong-evidence rating.' },
  moderate: { id: 'moderate', label: 'Moderate',      blurb: 'Real trials, smaller or narrower, or a meta-analysis with caveats.' },
  limited:  { id: 'limited',  label: 'Limited',       blurb: 'One study, an open trial, or correlational evidence.' },
  design:   { id: 'design',   label: 'Design source', blurb: 'A curriculum, protocol or task specification — not an efficacy claim.' },
  null_:    { id: 'null_',    label: 'Null result',   blurb: 'Evidence that something does NOT work. Shapes what we avoid.' },
};

export const KINDS = {
  rct: 'Randomised trial', meta: 'Meta-analysis', guide: 'Practice guide',
  review: 'Review', report: 'Evidence report', curriculum: 'Curriculum',
  practitioner: 'Practitioner source', correlational: 'Correlational',
  assessment: 'Assessment instrument',
};

export const references = {
  /* ---------------------------------------------------------- number lines */
  'wwc-2021-math': {
    authors: 'Institute of Education Sciences / What Works Clearinghouse',
    year: 2021,
    title: 'Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades',
    venue: 'IES Educator’s Practice Guide WWC 2021006',
    url: 'https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC2021006-Math-PG.pdf',
    kind: 'guide', strength: 'strong',
    finding: 'The only WWC maths guide in which all six recommendations reach STRONG evidence. Study counts: systematic instruction 43, representations 28, timed activities 27, word problems 18, mathematical language 16, number lines 14. Number line meta-analytic effects: rational-number computation 1.46, rational-number magnitude 1.00, whole-number computation 0.62, general achievement 0.34 — but whole-number magnitude understanding −0.05 (not significant, k=1).',
    use: 'The backbone of the whole site. It is also the reason we treat practices as the unit of evidence rather than curricula. Note the null: the number line is overwhelmingly validated for fractions and for computation, and essentially untested for whole-number magnitude.',
  },
  'schneider-2018': {
    authors: 'Schneider, Merz, Stricker, De Smedt, Torbeyns, Verschaffel & Luwel',
    year: 2018, title: 'Associations of number line estimation with mathematical competence: a meta-analysis',
    venue: 'Child Development 89(5)', doi: '10.1111/cdev.13068',
    kind: 'meta', strength: 'strong',
    finding: 'Number line estimation correlates r = .443 with mathematical competence across 263 effect sizes and 10,576 participants aged 4–14. Stronger for fractions than for whole numbers.',
    use: 'Why the number line is the spine of the site rather than one activity among many.',
  },
  'siegler-ramani-2009': {
    authors: 'Siegler & Ramani', year: 2009,
    title: 'Playing linear number board games — but not circular ones — improves low-income preschoolers’ numerical understanding',
    venue: 'Journal of Educational Psychology',
    url: 'https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram09.pdf',
    kind: 'rct', strength: 'strong',
    finding: 'N=88, four sessions totalling about an hour. Number line estimation error 29%→21% (d=1.01). The identical game on a CIRCULAR board: 29%→26% (d=0.43). Magnitude comparison 68%→77% (d=0.75). Gains held at 9 weeks.',
    use: 'The exact specification for The Great Race: ten equal squares, numerals increasing left to right, a 1-or-2 spinner. The circular-board comparison is why no number line on this site ever loops.',
  },
  'siegler-ramani-2008': {
    authors: 'Siegler & Ramani', year: 2008,
    title: 'Playing linear numerical board games promotes low-income children’s numerical development',
    venue: 'Developmental Science',
    url: 'https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram08.pdf',
    kind: 'rct', strength: 'moderate',
    finding: 'The earlier experiment, whose control group played an identical game with squares varying in COLOUR rather than number. That control improved on nothing at all.',
    use: 'Establishes that the numbers on the board are the active ingredient, not the game-ness of it. A decorative board game would do nothing.',
  },
  'laski-siegler-2014': {
    authors: 'Laski & Siegler', year: 2014,
    title: 'Learning from number board games: you learn what you encode',
    venue: 'Developmental Psychology',
    url: 'https://www.cmu.edu/dietrich/psychology/cs/research-teaching/docs/2013LaskiSieglerNumberBoardGames.pdf',
    kind: 'rct', strength: 'strong',
    finding: 'The only manipulation was counting on from the token’s position versus counting from one. Count-on produced roughly double the gains (number line error ~21%→~14%).',
    use: 'Why The Great Race rejects "1, 2" and corrects it to "count on from 3: 4, 5". This is enforced in the boardmove problem type rather than left as advice.',
  },

  'roam-apps': {
    // scope:'site' deliberately. Activities do NOT list ROAM in their own `refs`,
    // because that would print it in the Sources line on ten activity pages and
    // undo the decision to keep the assessment subtle. The route to the
    // activities it shaped runs through `appliesTo` instead.
    scope: 'site',
    authors: 'Yeatman Lab, Stanford Brain Development and Education Lab',
    year: 2026,
    title: 'ROAM — Rapid Online Assessment of Math',
    venue: 'roam-apps.web.app; item corpora on storage.googleapis.com/roam-apps',
    url: 'https://roam-apps.web.app/',
    kind: 'assessment', strength: 'design',
    finding: 'Four adaptive tasks: ALPACA (core maths, 4PL IRT over 339 items, preK to calculus), MagPI (symbolic comparison binned by ratio and by place-value trap, plus number line estimation over 0-20, 0-100, 0-1 and 0-2), ARF (single-digit fact retrieval, separately parameterised for sum, minus, mult and div) and CALF (multi-digit procedure, with an explicit skill field naming carry and borrow).',
    use: 'The source of the DIFFICULTY PROGRESSIONS, not of the topic order. Read off the published item corpora rather than inferred: CALF\u2019s four named carry/borrow skills became the four stages of Carry and Borrow; ARF\u2019s band walk set the order of the times tables; MagPI\u2019s own number line targets and comparison bins are used directly. Two structural facts mattered most \u2014 fraction placement on a number line is literally a MagPI construct, which is why it is the flagship; and ARF and CALF measure different things, which is why the recommender will not drill a procedure on top of missing facts. Izzi Math is practice, not assessment: it produces no score and predicts none.',
    appliesTo: ['carry-and-borrow', 'times-table-tower', 'number-line-hop', 'hundred-line-hop',
                'fraction-number-line', 'mixed-number-line', 'which-is-more', 'decade-duel',
                'fraction-foundry', 'great-race'],
    showsUpIn: [['/roam/', 'The score-to-practice page']],
  },

  /* ------------------------------------------------------------- fractions */
  'fuchs-ffo-wwc': {
    authors: 'What Works Clearinghouse', year: 2020,
    title: 'Fraction Face-Off! intervention report',
    venue: 'WWC, March 2020',
    url: 'https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_STEM_FFO_IR_mar2020.pdf',
    kind: 'report', strength: 'strong',
    finding: 'Potentially positive effects in all three domains reviewed. Improvement index +33 (geometry and measurement), +31 (number and operations), +24 (general achievement). Author-reported effects around 1 SD on number line estimation and 1–2.5 SD on fraction calculation.',
    use: 'The closest thing to a validated blueprint for what this site is. Its lesson shape — warm-up, explicit instruction, speed game, worksheet — is the book-plus-game-plus-printable model, already tested.',
  },
  'fuchs-2013-fractions': {
    authors: 'Fuchs, Schumacher, Long, Namkung, Hamlett & Cirino', year: 2013,
    title: 'Improving at-risk learners’ understanding of fractions',
    venue: 'Journal of Educational Psychology 105(3), 683–700', doi: '10.1037/a0032446',
    kind: 'rct', strength: 'strong',
    finding: '259 at-risk fourth graders randomised. A measurement-interpretation (number line) fractions intervention beat a part-whole/procedural control.',
    use: 'Why fractions are introduced on the number line rather than as shaded pizza slices — fraction-as-a-number is the interpretation that transfers.',
  },

  /* ------------------------------------------------ practice and ordering */
  'rohrer-2020': {
    authors: 'Rohrer, Dedrick, Hartwig & Cheung', year: 2020,
    title: 'A randomized controlled trial of interleaved mathematics practice',
    venue: 'Journal of Educational Psychology 112(1), 40–52', doi: '10.1037/edu0000367',
    kind: 'rct', strength: 'strong',
    finding: 'Preregistered cluster RCT, 787 students, 54 classes. Four months of interleaved versus blocked assignments, then an unannounced test a month later: 61% versus 38%, d = 0.83 [0.68, 0.97]. Same problems, same total practice — only the ordering differed. Worksheets held exactly eight problems.',
    use: 'The specification for mixed review sheets: eight problems, arranged so no two consecutive problems need the same method. Kindergarten and grade 1 sheets hold five instead, because eight problems at the type size those grades use do not fit on one page. Caveat we state openly: this was grade 7, so applying it to K–5 is an inference from mechanism either way.',
  },
  'rohrer-2014': {
    appliesTo: ['fraction-foundry', 'carry-and-borrow', 'equivalent-fractions'],
    showsUpIn: [['/printables/', 'Every sheet has a mixed review version']],
    scope: 'site',
    authors: 'Rohrer, Dedrick & Burgess', year: 2014,
    title: 'The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems',
    venue: 'Psychonomic Bulletin & Review 21, 1323–1330', doi: '10.3758/s13423-014-0588-3',
    kind: 'rct', strength: 'moderate',
    finding: '140 students, unannounced test two weeks later: interleaved 72% versus blocked 38%, d = 1.05 — and the benefit held even for problem types that were not superficially similar.',
    use: 'Supports interleaving across genuinely different problem types on one sheet, not just near-neighbours.',
  },
  'rohrer-taylor-2006': {
    appliesTo: ['times-table-tower', 'carry-and-borrow'],
    showsUpIn: [['/printables/', 'All printables — sheet length'], ['/parents/', 'How to help — print it again later']],
    scope: 'site',
    authors: 'Rohrer & Taylor', year: 2006,
    title: 'The effects of overlearning and distributed practice on the retention of mathematics knowledge',
    venue: 'Applied Cognitive Psychology',
    doi: '10.1002/acp.1266',
    kind: 'rct', strength: 'moderate',
    finding: 'Three versus nine practice problems produced no difference at one or four weeks. Massed practice lost to distributed practice at the same total volume.',
    use: 'Why sheets are short and why we tell parents that doing the same page again in a few days beats doing twice as many today.',
  },
  'van-der-kleij-2015': {
    authors: 'van der Kleij, Feskens & Eggen', year: 2015,
    title: 'Effects of feedback in a computer-based learning environment on students’ learning outcomes: a meta-analysis',
    venue: 'Review of Educational Research 85(4), 475–511', doi: '10.3102/0034654314564881',
    kind: 'meta', strength: 'strong',
    finding: '40 studies, 70 effect sizes. Elaborated feedback g = 0.49; giving the correct answer g = 0.32; knowledge of correctness alone g = 0.05. Effects larger in mathematics than in any other subject.',
    use: 'Every problem carries a worked explanation, and it is shown after a WRONG answer as well as a right one. Showing it only on success was the g = 0.05 case, and it was a bug.',
  },

  /* ------------------------------------------------- fluency and timing */
  'fuchs-2012-timed': {
    authors: 'Fuchs, Geary, Compton, Fuchs, Schatschneider & Hamlett', year: 2012,
    title: 'Effects of first-grade number knowledge tutoring with contrasting forms of practice',
    venue: 'Journal of Educational Psychology 105(1), 58–77',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3779611/',
    kind: 'rct', strength: 'strong',
    finding: '648 at-risk first graders randomised to identical tutoring differing only in the final five minutes: speeded versus non-speeded practice. The speeded condition produced ES 0.51 on arithmetic, with NO difference in attitudes, motivation or effort.',
    use: 'The cleanest experiment in the timed-practice debate, and the reason our position is not "timers are harmful". Short, self-paced, low-stakes speed practice on already-learned content is beneficial.',
  },
  'boaler-confer': {
    appliesTo: ['make-ten-race', 'decade-duel', 'fact-family-forge'],
    showsUpIn: [['/parents/', 'How to help — on timers']],
    scope: 'site',
    authors: 'Boaler & Confer', year: 2015,
    title: 'Fluency without fear',
    venue: 'youcubed, Stanford',
    url: 'https://www.youcubed.org/evidence/fluency-without-fear/',
    kind: 'practitioner', strength: 'limited',
    finding: 'The primary statement of the anti-timed-testing position: time pressure blocks working memory for roughly a third of students, and fluency should be understood as flexibility rather than speed.',
    use: 'Included because it is the most influential source on this question and shapes what parents expect. Read carefully, it cites no experiment that manipulated timing in children — its sources are adult working-memory studies and correlational anxiety work. We follow its design implications (nothing public, nothing graded, nothing compared) without adopting the claim that timing itself is harmful.',
  },
  'ramirez-2013': {
    appliesTo: ['make-ten-race', 'ten-frame-flash'],
    showsUpIn: [['/parents/', 'How to help — do not compare them to anyone']],
    scope: 'site',
    authors: 'Ramirez, Gunderson, Levine & Beilock', year: 2013,
    title: 'Math anxiety, working memory, and math achievement in early elementary school',
    venue: 'Journal of Cognition and Development 14(2), 187–202', doi: '10.1080/15248372.2012.664593',
    kind: 'correlational', strength: 'limited',
    finding: '154 first and second graders. Maths anxiety related negatively to achievement only for children with HIGHER working memory — the children who rely on the most demanding strategies.',
    use: 'Why we take anxiety seriously without assuming it only affects struggling children, and why there are no leaderboards or public scores anywhere on the site.',
  },
  'codding-2011': {
    authors: 'Codding, Burns & Lukito', year: 2011,
    title: 'Meta-analysis of mathematic basic-fact fluency interventions: a component analysis',
    venue: 'Learning Disabilities Research & Practice 26(1), 36–47', doi: '10.1111/j.1540-5826.2010.00323.x',
    kind: 'meta', strength: 'moderate',
    finding: 'Drill and practice WITH MODELLING produced the largest effects. More than three components beat fewer than three.',
    use: 'Why every game names and models a strategy before play rather than simply presenting items faster.',
  },

  /* ----------------------------------------------- early number, subitizing */
  'clements-1999': {
    authors: 'Clements', year: 1999, title: 'Subitizing: what is it? Why teach it?',
    venue: 'Teaching Children Mathematics 5(7), 400–405', doi: '10.5951/tcm.5.7.0400',
    kind: 'practitioner', strength: 'design',
    finding: 'Origin of the perceptual (instant, up to about four or five) versus conceptual (seeing seven as five and two) subitizing distinction, and of the "quick images" activity in which brief exposure is essential because it prevents counting.',
    use: 'The construct behind Ten-Frame Flash and its 900→450 ms exposure. Cited for the construct, not for efficacy — we found no trial isolating the ten-frame itself, and say so.',
  },
  'building-blocks-wwc': {
    authors: 'What Works Clearinghouse', year: 2023,
    title: 'Building Blocks for Math intervention report',
    venue: 'WWC, December 2023',
    url: 'https://ies.ed.gov/ncee/wwc/Intervention/536',
    kind: 'report', strength: 'moderate',
    finding: 'Potentially positive effects on mathematics, Tier 2 moderate, 3,221 students, three studies meeting standards. The TRIAD scale-up produced +0.47 against another maths curriculum and +1.07 against no-treatment control.',
    use: 'The best-evidenced early-maths curriculum there is, and the source of the subitizing and number-sense learning trajectories our K–1 content follows.',
  },
  'bailey-2020-fadeout': {
    showsUpIn: [['/parents/', 'How to help — short and often'], ['/about/', 'About']],
    scope: 'site',
    authors: 'Bailey, Duncan, Cunha, Foorman & Yeager', year: 2020,
    title: 'Persistence and fade-out of educational intervention effects',
    venue: 'Psychological Science in the Public Interest',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7787577/',
    kind: 'review', strength: 'strong',
    finding: 'Building Blocks’ 0.63 SD end-of-preschool impact retained only about 40% by the end of grade 1 and nearly nothing by grade 4. Decay of roughly 60% per year is typical.',
    use: 'Why we make modest claims, and why the site is built for regular ongoing use rather than as a one-off intervention.',
  },
  'dyson-2013': {
    appliesTo: ['counting-crew', 'number-friends', 'ten-frame-flash', 'story-time'],
    scope: 'site',
    authors: 'Dyson, Jordan & Glutting', year: 2013,
    title: 'A number sense intervention for low-income kindergartners at risk for mathematics difficulties',
    venue: 'Journal of Learning Disabilities',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3566272/',
    kind: 'rct', strength: 'moderate',
    finding: 'N=121, eight weeks, 24 sessions of 30 minutes. Significant and sustained gains on every Number Sense Brief subscale. But Woodcock-Johnson Calculation was significant at posttest only, and Applied Problems was not significant at either point.',
    use: 'Shows that early number-sense work reliably improves number sense, and that transfer distance is short. We describe activities in terms of the skill they train rather than promising general gains.',
  },
  'geary-2011': {
    authors: 'Geary', year: 2011,
    title: 'Cognitive predictors of achievement growth in mathematics: a five-year longitudinal study',
    venue: 'Developmental Psychology 47(6), 1539–1552', doi: '10.1037/a0025510',
    kind: 'correlational', strength: 'moderate',
    finding: '177 children from grade 1 to grade 5, controlling IQ, working memory and processing speed. The unique predictors of achievement were fluency with set size and numerals, sophisticated counting procedures, and number line placement.',
    use: 'Why fluency and number line placement both get their own activities rather than being treated as incidental.',
  },

  /* --------------------------------------------------- comparison, ANS */
  'holloway-ansari-2009': {
    authors: 'Holloway & Ansari', year: 2009,
    title: 'Mapping numerical magnitudes onto symbols: the numerical distance effect and individual differences in children’s mathematics achievement',
    venue: 'Journal of Experimental Child Psychology 103, 17–29', doi: '10.1016/j.jecp.2008.04.001',
    kind: 'correlational', strength: 'moderate',
    finding: 'The SYMBOLIC numerical distance effect, and not the non-symbolic one, relates to individual differences in six- to eight-year-olds’ maths achievement.',
    use: 'Why Which Is More and Decade Duel compare NUMERALS, and why their difficulty is graded by numerical distance.',
  },
  'qiu-2021-ans': {
    authors: 'Qiu, Chen, Wan & Bailey', year: 2021,
    title: 'Doubting the reliability of ANS training effects on symbolic mathematics: a multilevel meta-analysis',
    venue: 'Journal of Experimental Psychology: Learning, Memory and Cognition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34694827/',
    kind: 'meta', strength: 'null_',
    finding: 'Approximate number system training transfers to symbolic mathematics at g = .11 (not significant), and −.04 after publication-bias correction. No moderation by training type or duration.',
    use: 'Why there is no dot-cloud comparison game on this site. Where dots appear they are exact, small, structured, and mapped to a numeral.',
  },
  'kim-2018-ans': {
    appliesTo: ['which-is-more', 'ten-frame-flash'],
    scope: 'site',
    authors: 'Kim et al.', year: 2018,
    title: 'Comprehensive early numeracy home training and transfer to symbolic mathematics',
    venue: 'Frontiers in Psychology 9:1775',
    doi: '10.3389/fpsyg.2018.01775',
    kind: 'rct', strength: 'null_',
    finding: '56 first graders, six weeks of home training at 30 minutes a day on numerosity comparison, number line, approximate arithmetic and symbol-numerosity mapping. ANS acuity improved; there was no transfer to symbolic or exact calculation.',
    use: 'A home-delivered null on the same design we would otherwise have been tempted by. Corroborates the meta-analysis above.',
  },

  /* -------------------------------------------- representations, examples */
  'petersen-mcneil-2013': {
    appliesTo: ['ten-frame-flash', 'number-friends', 'arrays-and-equal-groups', 'counting-crew'],
    showsUpIn: [['/about/', 'Which parts are evidence, and which are taste']],
    scope: 'site',
    authors: 'Petersen & McNeil', year: 2013,
    title: 'Effects of perceptually rich manipulatives on preschoolers’ counting performance: established knowledge counts',
    venue: 'Child Development 84(3), 1020–1033', doi: '10.1111/cdev.12028',
    kind: 'rct', strength: 'strong',
    finding: '133 preschoolers, crossing perceptual richness with established knowledge of the objects. Rich objects HELPED when knowledge of the object was low and HINDERED when it was high.',
    use: 'The direct reason a character never changes the countable units inside a manipulative — the children most attached to Georgie are exactly the ones tennis-ball counters would hurt. Enforced by scripts/check.mjs.',
  },
  'fyfe-2014-fading': {
    authors: 'Fyfe, McNeil, Son & Goldstone', year: 2014,
    title: 'Concreteness fading in mathematics and science instruction: a systematic review',
    venue: 'Educational Psychology Review 26(1), 9–25', doi: '10.1007/s10648-014-9249-3',
    kind: 'review', strength: 'moderate',
    finding: 'Specifies the three-step enact → iconic → abstract progression over the same concept, and finds it beats staying concrete or starting abstract.',
    use: 'Why the area model is visible on the first pages of Long Multiplication and withdrawn later, and why arrays appear before bare symbols in the times tables.',
  },

  /* ---------------------------------------------------------- curriculum */
  'im-k5': {
    showsUpIn: [['/grades/', 'Every grade follows this sequence']],
    scope: 'site',
    authors: 'Illustrative Mathematics', year: 2024,
    title: 'IM K–5 Math (v.360)',
    venue: 'Illustrative Mathematics / Kendall Hunt, CC BY-NC',
    url: 'https://illustrativemathematics.org/math-curriculum/',
    kind: 'curriculum', strength: 'design',
    finding: 'A complete, free, openly licensed K–5 curriculum with a published scope and sequence per grade.',
    use: 'The topic order for every grade on this site, and the choice of representations. A design source, not an efficacy claim.',
  },
  'im-scope-sequence': {
    authors: 'Illustrative Mathematics / Kendall Hunt', year: 2024,
    title: 'IM K–5 Math scope and sequence, by grade',
    venue: 'im.kendallhunt.com course guides',
    url: 'https://im.kendallhunt.com/k5/teachers/kindergarten/course-guide/scope-and-sequence.html',
    kind: 'curriculum', strength: 'design',
    finding: 'Unit titles, section titles and estimated instructional days for each of grades K–5.',
    use: 'The specific strand names in content/activities/strands.js are derived from these.',
  },
  'edreports-im': {
    showsUpIn: [['/about/', 'About — being honest about the evidence']],
    scope: 'site',
    authors: 'EdReports', year: 2021,
    title: 'Kendall Hunt’s Illustrative Mathematics review',
    venue: 'edreports.org',
    url: 'https://edreports.org/reports/overview/kendall-hunts-illustrative-mathematics-2021',
    kind: 'report', strength: 'design',
    finding: 'All K–5 grades meet expectations: Focus and Coherence 100%, Rigor and Mathematical Practices 100%, Usability 92%.',
    use: 'Evidence that IM is a well-built curriculum. Explicitly NOT evidence that it raises attainment — that is a design review.',
  },
  'curate-im-k5': {
    showsUpIn: [['/about/', 'About — being honest about the evidence']],
    scope: 'site',
    authors: 'Massachusetts Department of Elementary and Secondary Education (CURATE)', year: 2024,
    title: 'CURATE panel review: Illustrative Mathematics K–5 (2021)',
    venue: 'doe.mass.edu, October 2024',
    url: 'https://www.doe.mass.edu/instruction/curate/math-k-5-2021-illustrative-math-kendall-hunt.pdf',
    kind: 'report', strength: 'null_',
    finding: '"High-quality studies of student learning impacts are not yet available for Illustrative Mathematics K–5 (2021)." No rating given on Impact on Learning.',
    use: 'Why we describe IM as a well-vetted plan rather than an efficacy-proven programme. The +0.18 to +0.50 SD figures often quoted for IM are from grades 6–8.',
  },

  /* ----------------------------------------------------- parents at home */
  'nelson-2024-caregivers': {
    showsUpIn: [['/parents/', 'How to help — the whole page exists because of this']],
    scope: 'site',
    authors: 'Nelson, Carter, Boedeker et al.', year: 2024,
    title: 'Mathematics interventions in informal learning environments: a meta-analysis',
    venue: 'Review of Educational Research',
    url: 'https://journals.sagepub.com/doi/full/10.3102/00346543231156182',
    kind: 'meta', strength: 'moderate',
    finding: '25 studies, 83 effect sizes, g = 0.26 [0.07, 0.45] for maths interventions delivered by caregivers. Significant moderators: intensity of caregiver training, and whether the intervention included follow-up support.',
    use: 'The single most relevant reference for what this site actually is. It is why the "How to help" page exists and why every activity carries a note for the adult — handing over materials with no guidance picks the bottom of that interval.',
  },
  'nelson-mcmaster-numeracy': {
    authors: 'Nelson & McMaster', year: 2019,
    title: 'The effects of early numeracy interventions for students in preschool and early elementary grades: a motion of meta-analysis',
    venue: 'Journal of Educational Psychology / related synthesis',
    url: 'https://link.springer.com/article/10.1007/s43545-021-00094-w',
    kind: 'meta', strength: 'moderate',
    finding: '34 studies, 52 treatment groups, weighted g = 0.64 [0.52, 0.76]. Metaregression predicted LARGER effects for interventions including counting with one-to-one correspondence, and for durations of eight weeks or less.',
    use: 'Why the guidance says short and focused, and why counting with one-to-one correspondence is explicit in the K activities rather than assumed.',
  },
  'zearn-rand': {
    showsUpIn: [['/parents/', 'How to help — a realistic expectation']],
    scope: 'site',
    authors: 'RAND Corporation', year: 2024,
    title: 'Evaluation of Zearn Math',
    venue: 'Evidence for ESSA / RAND RCT 2022–24',
    url: 'https://www.evidenceforessa.org/',
    kind: 'rct', strength: 'strong',
    finding: '64 schools, around 10,000 students in grades 3–5. +0.11 SD on NWEA MAP (+0.13 for students starting below proficiency), and +0.07 non-significant on the Texas STAAR. Average across its three studies is +0.09.',
    use: 'Our realistic ceiling. The best-evidenced digital maths programmes move attainment by about a tenth of a standard deviation, so any claim of a grade level from a light-touch home product is overselling. Stated as such on the parents page.',
  },

  /* ------------------------------------------------- task design sources */
  'parrish-number-talks': {
    appliesTo: ['ten-frame-flash', 'number-friends'],
    scope: 'site',
    authors: 'Parrish', year: 2010, title: 'Number Talks',
    venue: 'Math Solutions (protocol document)',
    url: 'https://www.mathedleadership.org/docs/coaching/NumberTalks.pdf',
    kind: 'practitioner', strength: 'design',
    finding: 'A five- to fifteen-minute conversation around purposefully crafted problems solved mentally, in which all answers are recorded before any is evaluated.',
    use: 'The source of the "hold the answer, then explain how you saw it" framing used in the subitizing and fact activities.',
  },
  'barton-variation': {
    authors: 'Barton', year: 2018, title: 'Variation theory and intelligent practice',
    venue: 'variationtheory.com / How I Wish I’d Taught Maths',
    url: 'https://variationtheory.com/what-is-variation-theory/',
    kind: 'practitioner', strength: 'design',
    finding: 'Hold features constant and vary exactly one, so the connection between consecutive questions is visible. When everything changes from question to question, the pattern is invisible.',
    use: 'Why generated problem sequences perturb one feature at a time inside a practice block, rather than randomising everything.',
  },
  'youcubed-close-to-100': {
    authors: 'youcubed, Stanford', year: 2015, title: 'How Close to 100?',
    venue: 'youcubed.org tasks',
    url: 'https://www.youcubed.org/tasks/how-close-to-100/',
    kind: 'practitioner', strength: 'design',
    finding: 'Two dice and a blank 10×10 grid: build the array the dice describe anywhere on the grid, record the number sentence, and try to fill the grid.',
    use: 'The task behind Array Architect and the array work in grade 2.',
  },
  'riconscente-2013': {
    authors: 'Riconscente', year: 2013,
    title: 'Results from a controlled study of the iPad fractions game Motion Math',
    venue: 'Games and Culture', doi: '10.1177/1555412013496894',
    kind: 'rct', strength: 'moderate',
    finding: '122 grade-5 students, randomised crossover, 20 minutes a day for five days: +15% on a fractions test (p<.001), plus +10% on attitude and self-efficacy.',
    use: 'Evidence that a game helps when the mechanic IS the mathematical representation — here, a number line. It is the reason our games are number lines, arrays and comparisons rather than arithmetic wrapped in an unrelated reward loop.',
  },
};

/* ------------------------------------------------------------------ helpers */
export const refIds = Object.keys(references);
export const getRef = (id) => references[id] ?? null;

export function refShort(id) {
  const r = references[id];
  if (!r) return id;
  const first = r.authors.split(/,| & /)[0].trim();
  const etal = /,| & /.test(r.authors) ? ' et al.' : '';
  return `${first}${etal} (${r.year})`;
}

export function refCitation(id) {
  const r = references[id];
  if (!r) return id;
  const link = r.doi ? `https://doi.org/${r.doi}` : r.url;
  return { ...r, id, link, short: refShort(id) };
}

export const isSiteScope = (id) => references[id]?.scope === 'site';

// Reverse index: which activities cite each reference.
export function buildReverseIndex(activities) {
  const idx = {};
  for (const id of refIds) idx[id] = [];
  for (const a of activities) {
    for (const id of a.refs || []) {
      if (!idx[id]) idx[id] = [];
      idx[id].push(a);
    }
  }
  return idx;
}
