/* Animated lessons — the one thing a paper workbook cannot do.
 *
 * TWO RULES EVERY LESSON KEEPS, and scripts/check.mjs fails the build without
 * them. They are here because the format is a departure from the rest of the
 * site — everything else prints — so it has to earn the screen every time.
 *
 *   1. AT LEAST ONE STEP ANIMATES, and the animation has to carry something a
 *      still picture cannot. Not decoration: the clock's sweep exists because
 *      the fix for the hour-hand misconception is watching the short hand
 *      creep, and the coin lesson's exists because the fix for "the bigger coin
 *      is worth more" is ten pennies arriving one at a time against one dime.
 *      A step with `sweep: true` is animated and counted; see src/mount/lesson.js.
 *
 *   2. THE LESSON IS SPOKEN BY THE CHOSEN FRIEND. Every step's `say` renders in
 *      that friend's frame — avatar, name, accent — and an optional `aside` adds
 *      a second beat from the same voice. ONE SET OF WORDS for all five: the
 *      friend is the frame, not the author. Per-character copy would be five
 *      times the text, five times the review, and it would drift; and the words
 *      have to stand alone anyway, because "Just math" is a first-class choice
 *      and takes the frame off. That is the same decision the printed sheet's
 *      trick box already made, so paper and screen now agree.
 *
 *      `aside` is dropped for Just math on purpose — it is written in the third
 *      person about a named friend, so `fill` would put "Just math" in its
 *      place.
 *
 * WHY THESE EXIST AT ALL, AND WHY ONLY FOR TIME AND MONEY
 * Every other activity on this site prints, and the printable is the point. A
 * lesson that only works on a screen is a departure, so it needs a reason
 * better than "animation is nice", and time has one: the research on telling
 * time is consistent that the fix for the hour-hand misconception is WATCHING
 * THE HANDS MOVE from the o'clock to the half hour. A still picture of 3:30
 * cannot show that the short hand travelled there; a printed sheet cannot
 * either. That is the only claim being made for movement, and it is why the
 * lesson teaches the hour hand rather than the minute hand.
 *
 * Money's case is weaker but real: the fix for "bigger coin means more" is
 * showing the equivalence physically — five pennies laid against one nickel,
 * ten against one dime. On paper that is two rows of circles; on screen the
 * pennies can become the nickel, which is nearer to the counters a teacher
 * would push around a desk.
 *
 * ADDRESSABLE, NOT A WARM-UP
 * These live at /learn/<id>/ rather than inside an activity, because a second
 * or third grader who is stuck needs to get BACK to them. Every time and money
 * activity carries a link. A warm-up routine (content/routines.js) plays once
 * before a book and cannot be returned to, which is the wrong shape for
 * something a child revisits.
 *
 * PITCHED AT GRADE 1
 * Deliberately. It is the first place the standard appears (1.MD.B.3 for time,
 * 2.MD.C.8 for money), and an older child coming back for a reminder is better
 * served by the version that assumes nothing than by a compressed one.
 *
 * MOVEMENT IS AN ENHANCEMENT, NEVER THE CONTENT
 * Every step reads correctly as a still. `prefers-reduced-motion` turns the
 * transitions off and the lesson becomes a step-through of the same captions
 * and the same figures — see src/mount/lesson.js. A step whose meaning depends
 * on the animation would be a step that excludes somebody.
 */

export const LESSONS = {
  time: {
    id: 'time',
    kind: 'clock',
    title: 'How a clock works',
    /* `topic` is the index's tag and `glyph` its mark. Both live here rather
       than at the call site because build.mjs used to pick the callout's glyph
       with `a.lesson === 'money' ? '¢' : '◔'` — a two-way branch that would
       have handed lesson number three a clock face without saying a word. */
    topic: 'Time',
    glyph: '◔',
    /* The index card's preview, written in the SAME `show` vocabulary as the
       steps below, so the one rule that tells a clock lesson from a coin lesson
       — does `show` have an `h`? — stays in one place. src/mount/lesson.js
       already branches on exactly that. 4:30 rather than an o'clock because the
       short hand sitting between two numbers is what the lesson is about. */
    card: { h: 4, m: 30 },
    lead: 'Two hands, and the short one is the one that catches people out.',
    /* `show` is what the player draws: a clock at h:m, optionally with a digital
       face beside it, optionally with one hand called out. The player animates
       BETWEEN consecutive steps, so the movement is a consequence of the script
       rather than something each step has to describe. */
    steps: [
      {
        show: { h: 3, m: 0, focus: null },
        head: 'This is a clock.',
        aside: 'The two hands are different lengths on purpose. That is how I tell them apart.',
        say: 'It has two hands. The short, fat one and the long, thin one. They do different jobs, '
          + 'and telling them apart is most of the work.',
      },
      {
        show: { h: 3, m: 0, focus: 'hour' },
        head: 'The SHORT hand says the hour.',
        aside: 'I look at the short fat one first, every time.',
        say: 'It is pointing at the 3. So it is 3 o’clock.',
      },
      {
        /* THE NUMBER 60 IS NAMED HERE, before anything moves, and then the sweep
           confirms it. It used to appear only as a clause inside the sweep's own
           caption — "that is what sixty minutes is one hour means" — which is
           the wrong way round for a six-year-old: they met the fact and the
           animation at the same moment and had nothing to hold on to. */
        show: { h: 3, m: 0, focus: 'minute' },
        head: 'The LONG hand says the minutes.',
        aside: 'I count round the dial in fives: 5, 10, 15, 20. Twelve numbers, sixty minutes.',
        say: 'An hour is made of 60 minutes — every hour, always 60. The long hand is the one '
          + 'that counts them. Right now it points straight up at the 12, which means no minutes '
          + 'have gone by yet. That is what “o’clock” means.',
      },
      /* TWO SWEEPS, AND THEY ARE WHERE THE LESSON EARNS ITS SCREEN.
         This was one step — a jump from 3:00 to 4:00 with the caption "watch the
         long hand go all the way round" — and the hands did move, but nothing
         counted. A child could watch the whole thing and still not know that the
         numbers round the dial are worth five minutes each, or why sixty of them
         make one hour.

         So a sweep step runs as an animation with a readout: minutes gone by,
         hours gone by, and what the clock says, all three driven from the same
         number as the hands, every frame. The teaching moment is the CARRY —
         the minutes reach 60, start again at 0, and the hours go up by one. That
         is the relationship between the two hands, and it is the one thing no
         printed sheet and no still picture can show.

         The first sweep stops at a quarter past on purpose: a short run, where
         the child can still count the numerals the hand passes. The second runs
         past the hour to 4:05, not to 4:00, so the carry HAPPENS on screen
         instead of being the frame it lands on. */
      {
        show: { h: 3, m: 15, focus: 'minute' },
        sweep: true, count: true,
        head: 'Watch the long hand count the minutes.',
        aside: 'Three numbers past the 12 is three fives, so 15.',
        say: 'Every number it passes is worth 5 minutes. Past the 1 is 5, past the 2 is 10, past '
          + 'the 3 is 15. The counter says 15 of 60 — fifteen minutes gone, and 60 is the whole '
          + 'hour, so there is a long way to go.',
      },
      {
        /* THE SWEEP STOPS ON 60 rather than running past it, and that is the
           point of the step. An earlier version ran on to 4:05 so the carry
           would happen on screen; the counter then never displayed 60 at all —
           it went 59, 0 — which hid the exact fact the lesson is trying to
           teach. Landing on the lap boundary makes the last frame read
           "60 of 60" beside "1 hour gone by", which is the identity, held still
           and readable for as long as the child wants to look at it. */
        show: { h: 4, m: 0, focus: 'both' },
        sweep: true, count: true,
        head: '60 minutes make 1 hour.',
        aside: 'The long hand does all the running. The short one barely moves.',
        say: 'Keep watching the counter. The long hand went all the way round and got back to the '
          + '12, and the counter stopped at 60 of 60 — one whole hour gone by. That is the rule: '
          + '60 minutes is 1 hour. And the short hand crept from the 3 to the 4 while it happened, '
          + 'which is how you know an hour has passed.',
      },
      {
        // The readout stays on for one more step, because "30 minutes" beside a
        // hand pointing straight down is the same lesson said twice.
        show: { h: 4, m: 30, focus: 'minute' },
        count: true,
        head: 'Halfway round is half past.',
        aside: 'Half of 60 is 30, and half of anything works the same way.',
        say: 'The long hand is pointing straight down at the 6, half of the way round. Half of 60 '
          + 'is 30, so the counter says 30 of 60 — half an hour.',
      },
      {
        /* The PHRASE, not the mechanics. The previous step explains that half an
           hour has gone; it does not explain what the words "half past" mean,
           and "past" is doing real work a six-year-old has no reason to know.
           Asked for by name after a read-through, and fair: the activity's
           hints all assume the phrase is understood. */
        show: { h: 4, m: 30, focus: 'minute' },
        head: 'That is what “half past” means.',
        aside: 'This one catches me out too. Past only ever means after.',
        say: '“Past” means after. So “half past 4” is the short way of saying half an hour AFTER '
          + '4 o’clock. First it was 4 o’clock, then half an hour went by, and now it is half '
          + 'past 4.',
      },
      {
        show: { h: 4, m: 30, focus: 'hour' },
        head: 'Now look at the short hand.',
        aside: 'I check the short hand last, to be sure of the hour.',
        say: 'It is not on the 4 any more, and it has not reached the 5. It is sitting BETWEEN them, '
          + 'halfway, because half of the hour has gone.',
      },
      {
        show: { h: 4, m: 30, focus: 'hour', digital: true },
        head: 'So this is half past 4 — not half past 5.',
        aside: 'When it sits between two numbers, I take the smaller one.',
        say: 'The short hand has left the 4 but has not got to the 5, so the hour is still 4. That is '
          + 'the one thing to remember: when the short hand is between two numbers, take the '
          + 'SMALLER one.',
      },
      {
        show: { h: 4, m: 30, focus: null, digital: true },
        count: true,
        head: 'A digital clock says the same thing.',
        aside: 'I read the digital one, then say the time out loud the long way.',
        say: '4:30 means 4 o’clock and 30 minutes. The number after the two dots is the minutes, '
          + 'and it never gets past 59 — because at 60 it becomes a whole hour and starts again '
          + 'at 0. So “half past 4” and “4:30” are two ways of saying one time.',
      },
    ],
    close: 'Three things to keep. There are 60 minutes in an hour, and half of that is 30. Short '
      + 'hand for the hour, long hand for the minutes. And when the short hand sits between two '
      + 'numbers, you take the smaller one.',
  },

  /* ------------------------------------------------------- EQUIVALENT FRACTIONS
     WHY THIS ONE EARNS A SCREEN. The misconception is the whole-number bias:
     eight is a bigger number than two, so one eighth must be bigger than one
     half. A printed page can only put two bars side by side and ask the child to
     trust that the shaded lengths match. Here ONE bar is re-cut and the shaded
     part does not move — it is the same element, unchanged, while the cuts
     multiply around it. That is not a nicer picture of the same argument; it is
     a different argument, and it is the only one this format can make.

     The lesson turns on TWO SWEEPS THAT LOOK ALIKE AND ARE NOT. In the first the
     shaded pieces double along with the cuts, so the amount holds and only the
     name changes: one half, two quarters, four eighths. In the second just one
     piece stays shaded, so the amount visibly shrinks while the bottom number
     grows — the misconception, shown rather than denied. */
  fractions: {
    id: 'fractions',
    kind: 'bar',
    title: 'Why one half and two quarters are the same',
    topic: 'Fractions',
    glyph: '\u00bd',
    card: { den: 4, num: 2 },
    lead: 'More pieces does not mean more.',
    steps: [
      {
        show: { den: 1, num: 1 },
        head: 'This is one whole bar.',
        say: 'All of it is shaded, and nothing has been cut yet. Before any fraction makes sense you '
          + 'have to know what the WHOLE is \u2014 everything else is a piece of this.',
        aside: 'I find the whole first. Everything after that is a piece of it.',
      },
      {
        show: { den: 2, num: 1 },
        sweep: true, count: true,
        head: 'Cut it in half.',
        say: 'One cut down the middle makes two pieces, and they have to be the SAME SIZE or they '
          + 'are not halves. One piece out of two is shaded: one half. A single piece like that has '
          + 'a name \u2014 a UNIT FRACTION \u2014 and every other fraction is built out of copies of one.',
        aside: 'Equal pieces. If one side is fatter it is not a half.',
      },
      {
        show: { den: 4, num: 2 },
        sweep: true, count: true,
        head: 'Now cut each half in two.',
        say: 'Watch the shaded part while the cuts go in. It did not move and it did not change '
          + 'size \u2014 it is the same shaded part it always was. But there are four pieces now, and '
          + 'two of them are shaded, so we call it two quarters.',
        aside: 'Nothing was added. The cuts went in, that is all that happened.',
      },
      {
        show: { den: 8, num: 4 },
        sweep: true, count: true,
        head: 'And again.',
        say: 'Eight pieces, four of them shaded: four eighths. Look at where the shading stops \u2014 '
          + 'exactly the same place as before. Halfway along the bar, all three times.',
        aside: 'One half, two quarters, four eighths. The shading stops on the same line every time.',
      },
      {
        show: { den: 8, num: 4 },
        count: true,
        head: 'So those are three names for one amount.',
        say: 'One half, two quarters and four eighths are the same amount of bar. Each time the '
          + 'pieces doubled, the shaded ones doubled too \u2014 double the top and the bottom by the '
          + 'same number and the amount does not change. That is the whole rule.',
        aside: 'Double both, or halve both. Never just one of them.',
      },
      {
        show: { den: 2, num: 1 },
        sweep: true, count: true,
        head: 'Now watch something different.',
        say: 'Back to one half: two pieces, one of them shaded. Keep your eye on HOW MUCH is '
          + 'shaded, because this next bit is where everybody gets caught.',
        aside: 'Here it comes. This is the one I got wrong for ages.',
      },
      {
        show: { den: 8, num: 1 },
        sweep: true, count: true,
        head: 'This time only ONE piece stays shaded.',
        say: 'Eight pieces, and just one of them shaded: one eighth. The shaded part got SMALLER. '
          + 'Eight is a bigger number than two, but one eighth is a smaller piece than one half \u2014 '
          + 'because cutting the bar into more pieces makes every piece thinner.',
        aside: 'A bigger bottom number means smaller pieces, not more of them.',
      },
    ],
    close: 'Double the top and the bottom together and the amount stays the same \u2014 one half, two '
      + 'quarters, four eighths. But a bigger bottom number on its own means SMALLER pieces: one '
      + 'eighth is much less than one half.',
  },

  /* -------------------------------------------------------------- COMMUTATIVITY
     THE PUREST MOVEMENT CASE ON THE SITE, and `array-architect` says so in its
     own trick already: "the shape can be turned". That is a claim a still
     picture cannot demonstrate \u2014 put a 3-by-8 array beside an 8-by-3 one and the
     child has to count both and take the equality on trust. Turn the SAME array
     a quarter turn and there is nothing left to trust: not one square was added,
     removed, or moved relative to its neighbours.

     Only ODD quarter turns transpose an array, which is why each array here
     starts at zero and turns once. Half a turn is the same array upside down and
     would teach nothing at all. */
  arrays: {
    id: 'arrays',
    kind: 'array',
    title: 'Turning an array',
    topic: 'Multiplying',
    glyph: '\u229e',
    card: { rows: 3, cols: 8, turn: 0 },
    lead: 'Three rows of eight is eight rows of three.',
    steps: [
      {
        show: { rows: 3, cols: 8, turn: 0 },
        count: true,
        head: 'This is an array.',
        say: 'Rows of squares, and every row the same length: three rows with eight in each row. '
          + 'You never have to count the squares one at a time \u2014 count ONE row, then count how '
          + 'many rows there are.',
        aside: 'I count one row, then the rows. Much quicker than counting squares.',
      },
      {
        show: { rows: 3, cols: 8, turn: 0 },
        count: true,
        head: 'Three rows of eight is 24.',
        say: 'Count on in eights, once for each row: 8, 16, 24. Twenty-four squares altogether. '
          + 'That is what 3 \u00d7 8 means \u2014 three eights.',
        aside: '8, 16, 24. Three jumps of eight and I am done.',
      },
      {
        show: { rows: 3, cols: 8, turn: 90 },
        sweep: true, count: true,
        head: 'Now turn it.',
        say: 'A quarter turn, and watch carefully: nothing was added and nothing was taken away. '
          + 'These are the same twenty-four squares. But now they read as eight rows with three in '
          + 'each row.',
        aside: 'Same squares. I did not touch a single one of them.',
      },
      {
        show: { rows: 3, cols: 8, turn: 90 },
        count: true,
        head: 'Eight rows of three is 24 as well.',
        say: 'Count on in threes this time: 3, 6, 9, 12, 15, 18, 21, 24. The same twenty-four. So '
          + '3 \u00d7 8 and 8 \u00d7 3 are two ways of describing one pile of squares, and they cannot come '
          + 'out different.',
        aside: 'Two facts for the price of one.',
      },
      {
        show: { rows: 4, cols: 7, turn: 0 },
        count: true,
        head: 'It is not a trick of that one array.',
        say: 'Here is a different one: four rows with seven in each row. Four sevens \u2014 7, 14, 21, '
          + '28. Twenty-eight squares.',
        aside: 'Four rows of seven, so I count on in sevens.',
      },
      {
        show: { rows: 4, cols: 7, turn: 90 },
        sweep: true, count: true,
        head: 'Turn it too.',
        say: 'Seven rows with four in each row, and twenty-eight either way. Turning an array '
          + 'always works, for every array there is \u2014 because turning something cannot change how '
          + 'many squares are in it.',
        aside: 'Any array, any time. Turning it never changes how many there are.',
      },
      {
        show: { rows: 4, cols: 7, turn: 90 },
        count: true,
        head: 'So you only have to learn half the table.',
        say: 'Every fact comes with a twin. Learn 4 \u00d7 7 = 28 and you have been given 7 \u00d7 4 = 28 '
          + 'for nothing, and that is true of every pair in the whole times table.',
        aside: 'I learn the easier one of each pair and turn it round for the other.',
      },
    ],
    close: 'Turning an array cannot add a square or lose one, so 3 \u00d7 8 and 8 \u00d7 3 have to be '
      + 'equal \u2014 and the same goes for every pair. Learn one of each twin and the other is free.',
  },

  money: {
    id: 'money',
    kind: 'coins',
    title: 'How coins work',
    topic: 'Money',
    glyph: '¢',
    card: { coins: ['quarter', 'nickel', 'dime', 'penny'] },
    lead: 'Four coins, and the smallest one is not the cheapest.',
    steps: [
      {
        show: { coins: ['quarter', 'nickel', 'penny', 'dime'], focus: null },
        head: 'These are the four coins.',
        aside: 'Look at the sizes now, before anyone tells you the values.',
        say: 'They are drawn the size they really are. Look at them for a moment before we say what '
          + 'each one is worth — because the sizes are about to surprise you.',
      },
      {
        show: { coins: ['penny'], focus: 'penny' },
        head: 'A penny is 1 cent.',
        aside: 'I count everything in pennies first, then swap up.',
        say: 'It is the brown one. Everything else is counted in pennies, so this is the one to '
          + 'start from.',
      },
      {
        show: { coins: ['nickel'], focus: 'nickel', pennies: 5 },
        sweep: true, count: true,
        head: 'A nickel is 5 cents.',
        aside: 'A nickel is five pennies squashed into one.',
        say: 'Five pennies are worth the same as one nickel. Count them: 1, 2, 3, 4, 5.',
      },
      {
        show: { coins: ['dime'], focus: 'dime', pennies: 10 },
        sweep: true, count: true,
        head: 'A dime is 10 cents.',
        aside: 'Ten pennies, one dime. The same swap as ten ones for a ten.',
        say: 'Ten pennies are worth the same as one dime.',
      },
      {
        show: { coins: ['nickel', 'dime'], focus: 'dime' },
        head: 'Here is the surprising bit.',
        aside: 'I got this one wrong the first time too. Size is no help at all.',
        say: 'The dime is SMALLER than the nickel — but it is worth twice as much. Coins are not '
          + 'worth what their size looks like. You have to know them.',
      },
      {
        show: { coins: ['quarter'], focus: 'quarter' },
        head: 'A quarter is 25 cents.',
        aside: 'This is the only coin whose size tells the truth.',
        say: 'It is the biggest of the four, and it is worth the most. This one does match its size.',
      },
      {
        show: { coins: ['quarter', 'dime', 'nickel', 'penny'], focus: null, running: true },
        head: 'To count a handful, start with the biggest value.',
        aside: 'I line them up biggest first, every single time.',
        say: 'Put them in order, then count on: 25, then 35, then 40, then 41. Forty-one cents. '
          + 'Starting from the biggest keeps the counting easy.',
      },
    ],
    close: 'Penny 1, nickel 5, dime 10, quarter 25. The dime is small and still beats the nickel, '
      + 'and a handful is easiest counted biggest first.',
  },
};

/* The sweep readout's labels. Here rather than in src/mount/lesson.js because
   they are copy, and because the player should not have to know that the thing
   being counted is time. */
export const LESSON_COUNT = {
  minutes: 'minutes gone by',
  hours: 'whole hours gone by',
  // The cell label is a column heading and stays plural whatever the number.
  // The spoken line is a sentence, so it needs the singular.
  hour1: 'whole hour gone by',
  now: 'the clock says',
  // The money lesson's two cells. Same two questions as the clock's: how many
  // have I counted, and what is that the same as.
  pennies: 'pennies counted',
  same: 'the same as',
  // the fraction bar: the name changes down the middle column while the amount
  // in the third does not, which is the lesson in two numbers.
  pieces: 'pieces',
  shaded: 'shaded',
  howMuch: 'how much of the bar',
  // the array: rows and columns swap on the turn, the total does not.
  rows: 'rows',
  each: 'in each row',
  all: 'altogether',
  /* THE DENOMINATOR IS ON SCREEN, every frame of every sweep, rendered beside
     the count as "15 of 60". It is the cheapest possible answer to "how many
     minutes are in an hour": the child reads it a hundred times across two
     sweeps without being told once, and the captions use the same words so the
     page and the voice agree. */
  per: 60,
  of: 'of',
};

export const LESSON_IDS = Object.keys(LESSONS);
export const lessonById = (id) => LESSONS[id] ?? null;

/* Which lesson an activity points back to. Set on the activity as
   `lesson: 'time'`, and the engine renders a link — so a second grader who has
   forgotten which hand is which can get to the grade-1 explanation without
   leaving the book. */
export const LESSON_LINK = {
  time: 'How does a clock work again?',
  money: 'How much is each coin again?',
  fractions: 'Why are one half and two quarters the same?',
  arrays: 'Why can an array be turned?',
};

/* TWO STATES, and the first one is the point. The link started as one line of
   small text above the book, which is the right weight for a second grader
   coming back for a reminder and the wrong weight entirely for a first grader
   meeting a clock for the first time — it was easy to miss on the page.

   So: a full callout until the lesson has been opened, then the quiet line.
   Prominent is the DEFAULT, so a reader with no JavaScript and a reader on a
   fresh device both get the loud version; src/mount/lesson.js records the visit
   and the activity page collapses it on the next load. Getting that the wrong
   way round would hide the lesson from exactly the child who needs it. */
export const LESSON_CALL = {
  time: {
    head: 'New to clocks? Start here.',
    say: 'A short lesson with a clock you can watch move. Nothing to get wrong, and it takes a minute.',
    cta: 'Show me how a clock works',
  },
  money: {
    head: 'New to coins? Start here.',
    say: 'A short lesson on what each coin is worth — including why the small one beats the big one.',
    cta: 'Show me how coins work',
  },
  fractions: {
    head: 'New to fractions? Start here.',
    say: 'A short lesson where one bar gets cut up while you watch, so you can see for yourself '
      + 'that one half and two quarters are the same amount.',
    cta: 'Show me how fractions work',
  },
  arrays: {
    head: 'Rows and columns muddling you up? Start here.',
    say: 'A short lesson where an array turns a quarter turn, so you can see why 3 × 8 and 8 × 3 '
      + 'have to come out the same.',
    cta: 'Show me why it can be turned',
  },
};

/* ------------------------------------------------------ the index at /learn/
   ONE FLAT PAGE, NOT A GRADE LADDER, and that is the whole design.

   The point of this site is practice a child wants to do, not lessons to sit
   through. Organising these by grade would imply a course you work from the top
   of; tagging them by TOPIC says what they are, which is two explainers you
   reach when something has not landed. So there is no grade column, no ordering,
   no filter, and this is deliberately NOT in the header nav — seven items are
   there already, and a top-level "Lessons" tab beside Grades, Books and Games is
   exactly the framing being avoided.

   Reached four ways, in the order a reader actually meets them: the callout on
   an activity that has one (the main path, and it points at the lesson itself
   rather than through here), one footer link on every page, the tour's "Short
   lessons" door, and the breadcrumb on a lesson page — which is how you find out
   the other lesson exists while you are reading one. */
export const LESSON_INDEX = {
  title: 'Short lessons',
  lead: 'Two things a printed sheet cannot do: show you a clock’s hands moving, and lay pennies '
    + 'against a nickel.',
  glyph: '▶',
  head: 'What these are for',
  /* Says out loud why there are only two, because the site answers that kind of
     question rather than leaving a thin page looking unfinished. */
  say: 'Not a course, and not organised by grade — you get here from an activity when something '
    + 'is not landing, and every time and money activity links back. There are two because '
    + 'movement is only worth it where a still picture genuinely cannot do the job: the fix for '
    + 'reading 2:30 as “half past three” is watching the short hand creep, and the fix for '
    + '“the bigger coin is worth more” is seeing ten pennies against one dime.',
  practice: 'Practice it in',
  empty: 'No activity links here yet.',
};

// Where a visit gets recorded, so the callout can stand down afterwards.
export const lessonSeenKey = (id) => `izzimath.lesson.${id}`;
