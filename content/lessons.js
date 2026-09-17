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
 * AN ANIMATION THAT PAUSES TO EXPLAIN ITSELF
 * A sweep step may declare `stops` — times it pauses at, each holding up one
 * short sentence about the number that just changed. The reason is a first
 * grader who watched a whole hour go by and pressed on without meeting the
 * carry: the hands moved, and nothing said anything while they were moving.
 *
 * A stop states the time it lands on, in the same `{ h, m }` words a step's
 * `show` uses, so an author thinking "pause at half past" does not have to
 * convert that into minutes-since-the-start. It must fall strictly inside the
 * run, and `scripts/check.mjs` fails one that does not — the player can only
 * drop such a stop, silently, leaving the lesson a caption short.
 *
 * The pacing is deliberate and was too fast: 90ms a minute meant a quarter of
 * an hour went by in 1.35 seconds, long enough to see that something moved and
 * not long enough to see WHICH hand moved how far. It is 140ms now.
 *
 * Only the clock and the coins can pause: they walk a value through a frame
 * loop, so there is something to stop. The bar and the array animate one CSS
 * property in one continuous move, and for the fractions lesson the continuity
 * IS the argument — the shaded part not moving while the cuts multiply is the
 * whole proof. So `scripts/check.mjs` fails a `stops` declared on either of
 * them rather than letting the field sit there doing nothing.
 *
 * HOW THE WORDS ARE WRITTEN, AND WHY IT IS MEASURED
 * These are read by six-year-olds and read ALOUD to six-year-olds, so the thing
 * that makes them hard is not vocabulary — it is sentence construction. Three
 * clauses chained with "and" and "— because" is unreadable to a first grader
 * and worse through a speech synthesiser, which has no idea where the thought
 * breaks.
 *
 * So it is measured rather than judged by eye, because judging prose by eye is
 * exactly how it drifted: a step in this file was a Flesch-Kincaid grade 8.4
 * with a 28-word sentence in it, in a lesson for six-year-olds, and it read
 * fine to whoever wrote it. `scripts/check.mjs` now caps the longest sentence
 * at 18 words and the mean at 12 over every piece of prose here — captions,
 * asides, stop lines, questions and the reasons behind answers.
 *
 * One rule per sentence. If a sentence needs "and" to hold two facts, it is two
 * sentences.
 *
 * AND A CHECK THAT IT LANDED
 * A step may declare `ask` — one question, two or three answers, and a reason
 * attached to EVERY one of them. The wrong ones are where the value is: "no"
 * teaches nothing, and "the hand has not reached the 8 yet" teaches the thing
 * the child got wrong. That is the site's oldest rule (bare right-or-wrong
 * feedback is worth about a tenth of elaborated feedback, and the gap is widest
 * in maths) applied to the one place that had no feedback at all.
 *
 * Each lesson's check is aimed at its own misconception rather than at recall:
 * which hand says the hour, whether the dime beats the nickel, whether one
 * eighth beats one half, whether 9 x 6 has to be worked out. Never scored and
 * never a gate. And the figure must not carry the answer — the clock's closing
 * check hides the digital face, and check.mjs fails one that does not.
 *
 * AND THEN THE CHILD HAS A GO
 * A step may declare `try` — a goal to reach by moving the figure themselves,
 * with what to make shown right beside the number it has to match. Every stage
 * has one: set the clock, build an amount out of coins, shade part of the bar,
 * build an array. The goal is stated in that stage's own units, because the
 * child is working in them.
 *
 * Each is chosen so the lesson's own claim is the only way through. The bar is
 * cut into quarters and asks for one half, so a child who thinks one half means
 * one piece cannot do it. The coin goal has SEVERAL right answers — a dime, two
 * nickels, ten pennies — because the thing being learned is that a handful of
 * coins and an amount of money are different questions. The array asks for a
 * shape rather than a total, since 6 rows of 4 has the same 24 squares. And
 * dragging the clock's long hand past the 12 carries the hour, which is the
 * relationship the whole lesson is about, found with a finger.
 *
 * Never scored, never a gate. Getting it right says so and that is all; Next
 * stays available throughout, because a child who cannot manage the drag must
 * not be stuck in a lesson.
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
        /* THE DIGITAL FACE ARRIVES HERE, not at the end. It used to appear in
           the last two steps as a footnote, which meant the animation — the
           part that shows an hour going by — ran on the analog dial alone. A
           child who is going to watch both faces change together has to have
           been introduced to the second one first. */
        show: { h: 3, m: 0, focus: 'hour', digital: true },
        head: 'This clock says it too.',
        aside: 'Two clocks, one time. I check one against the other.',
        say: 'That is the same time, written down: 3:00. The first number is the hour. It says '
          + '3, just like the short hand. Watch both clocks from now on. They always agree.',
      },
      {
        /* THE NUMBER 60 IS NAMED HERE, before anything moves, and then the
           animation confirms it. It used to appear only as a clause inside the
           sweep's own caption — "that is what sixty minutes is one hour means" —
           which is the wrong way round for a six-year-old: they met the fact and
           the animation at the same moment and had nothing to hold on to. */
        show: { h: 3, m: 0, focus: 'minute', digital: true },
        head: 'The LONG hand says the minutes.',
        aside: 'I count round the dial in fives: 5, 10, 15, 20. Twelve numbers, sixty minutes.',
        say: 'An hour is made of 60 minutes. Every hour. Always 60. The long hand is the one '
          + 'that counts them. Right now it points straight up at the 12. No minutes have '
          + 'gone by yet. That is what “o’clock” means.',
      },
      {
        /* A CHECK FOR UNDERSTANDING, right after both hands have been named and
           before anything moves. The whole lesson rests on telling them apart,
           so this is the one worth asking early. */
        show: { h: 3, m: 0, focus: null, digital: true },
        ask: {
          q: 'Which hand tells you the hour?',
          options: [
            { say: 'The short fat one', right: true,
              why: 'Yes. The short fat hand always says the hour.' },
            { say: 'The long thin one',
              why: 'That is the one that counts the minutes. The hour is the short fat hand.' },
          ],
        },
        head: 'Quick check.',
        aside: 'Short and fat for the hour. I say it to myself every time.',
        say: 'Two hands, two jobs. Pick the one that tells you the hour.',
      },
      {
        /* ONE NUMBER, ON ITS OWN, BEFORE THE HOUR. The lesson used to jump
           straight to a fifteen-minute run, so the fact that each numeral is
           worth five arrived as a caption over a hand already in motion. A
           five-minute move is short enough to watch the whole way and long
           enough to see the digits change, and it is the unit everything after
           it counts in. */
        show: { h: 3, m: 5, focus: 'minute', digital: true },
        sweep: true, count: true,
        head: 'One number is 5 minutes.',
        aside: 'One step of the long hand, five minutes. Always five.',
        say: 'The long hand moved on by one number, from the 12 to the 1. That is 5 minutes. '
          + 'Look at the other clock. It went from 3:00 to 3:05.',
      },
      {
        /* THE FIRST TASTE OF THE INTERACTION, and the smallest possible one:
           the long hand has just moved on by one number, so move it on by one
           more. Placed here rather than later because a child should find out
           that the hands can be touched BEFORE being asked to set a whole time
           — and because doing it once makes the animation that follows about
           something they have already felt. */
        show: { h: 3, m: 5, focus: 'minute', digital: true },
        try: { h: 3, m: 10 },
        head: 'Your turn. Move it on one more number.',
        aside: 'Slide the long hand. It is the thin one.',
        say: 'Put your finger on the long thin hand. Slide it round to the 2. Watch the other '
          + 'clock while you do it. It should change to 3:10.',
      },
      {
        /* THE ONE THAT EARNS THE SCREEN, and it is now a run with pauses rather
           than a single dash to the hour.

           It was two sweeps and a caption, and a first grader watched the whole
           thing and pressed on without meeting the carry. The hands did move;
           nothing said anything while they were moving. So the run stops four
           times — at each quarter and again just before the hour — and holds up
           one short sentence about the number that has just changed. The child
           who waits gets the count narrated; the child who presses Next still
           gets a step that reads correctly as a still, which is the rule every
           step here keeps.

           A stop states the time it lands on, in the same words `show` uses.
           The last one is at 3:55 on purpose: the hour changing is the thing to
           be looking for BEFORE it happens, not a surprise after. */
        show: { h: 4, m: 0, focus: 'both', digital: true },
        sweep: true, count: true,
        stops: [
          { h: 3, m: 15, say: '15 minutes gone. Three numbers past the 12, and three fives make 15.' },
          { h: 3, m: 30, say: 'Halfway round. 30 minutes — and 30 is half of 60.' },
          { h: 3, m: 45, say: '45 minutes. The short hand is nearly at the 4 now.' },
          { h: 3, m: 55, say: '55 minutes. Watch what the hour does when the minutes reach 60.' },
        ],
        head: 'Now watch a whole hour go by.',
        aside: 'I watch the short hand out of the corner of my eye. It creeps.',
        say: 'The long hand goes all the way round. Every number it passes is another 5 '
          + 'minutes. The counter keeps the total. Both clocks change together. Watch the '
          + 'minutes climb to 60.',
      },
      {
        /* THE LANDING, HELD STILL. The counter reads 60 of 60 beside 1 hour
           gone by, and the step does nothing else. An earlier version ran on to
           4:05 so the carry would happen on screen; the counter then never
           displayed 60 at all — it went 59, 0 — which hid the exact fact the
           lesson is trying to teach. */
        show: { h: 4, m: 0, focus: 'minute', digital: true },
        count: true,
        head: '60 minutes make 1 hour.',
        aside: 'This is the one I had to learn by heart. Sixty, every time.',
        say: 'The long hand got back to the 12. The counter stopped at 60 of 60. That is one '
          + 'whole hour gone by. And that is the rule. It never changes. 60 minutes is 1 '
          + 'hour.',
      },
      {
        /* THE HOUR CHANGING, as its own step. It happened during the run, while
           the child was watching the long hand and the counter; saying so
           afterwards, with both faces sitting still on 4:00, is what makes it
           stick. */
        show: { h: 4, m: 0, focus: 'hour', digital: true },
        count: true,
        head: 'And the hour changed.',
        aside: 'The long hand does all the running. The short one barely moves.',
        say: 'While all that happened, the short hand crept from the 3 to the 4. The other '
          + 'clock went from 3:00 to 4:00. When the minutes reach 60 they start again at 0. '
          + 'The hour goes up by one. That is how the two hands work together.',
      },
      {
        /* AN O'CLOCK, SET BY HAND, straight after the hour changed on screen.
           Both hands have to move: the long one to the 12 and the short one to
           the 7 — which is the pair of facts the first four steps taught, asked
           for together for the first time. */
        show: { h: 4, m: 0, focus: null, digital: true },
        try: { h: 7, m: 0 },
        head: 'Your turn. Make it 7 o’clock.',
        aside: 'Short hand to the 7, long hand straight up. That is an o’clock.',
        say: 'Slide the short fat hand round to the 7. Then put the long thin hand straight up '
          + 'at the 12. The clock beside it should say 7:00.',
      },
      {
        // The readout stays on for one more step, because "30 minutes" beside a
        // hand pointing straight down is the same lesson said twice.
        show: { h: 4, m: 30, focus: 'minute', digital: true },
        sweep: true, count: true,
        head: 'Halfway round is half past.',
        aside: 'Half of 60 is 30, and half of anything works the same way.',
        say: 'The long hand points straight down at the 6. That is half of the way round. Half '
          + 'of 60 is 30. So the counter says 30 of 60. Half an hour.',
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
        say: '“Past” means after. So “half past 4” means half an hour AFTER 4 o’clock. First '
          + 'it was 4 o’clock. Then half an hour went by. Now it is half past 4.',
      },
      {
        show: { h: 4, m: 30, focus: 'hour' },
        head: 'Now look at the short hand.',
        aside: 'I check the short hand last, to be sure of the hour.',
        say: 'It is not on the 4 any more. It has not reached the 5 either. It sits BETWEEN '
          + 'them, halfway. That is because half of the hour has gone.',
      },
      {
        show: { h: 4, m: 30, focus: 'hour', digital: true },
        head: 'So this is half past 4 — not half past 5.',
        aside: 'When it sits between two numbers, I take the smaller one.',
        say: 'The short hand has left the 4. It has not got to the 5. So the hour is still 4. '
          + 'Remember this one. When the short hand sits between two numbers, take the '
          + 'SMALLER one.',
      },
      {
        /* HALF PAST, SET BY HAND, and this is the one that catches people out —
           so it is the one worth doing with a finger. Getting 9:30 means
           leaving the short hand BETWEEN the 9 and the 10, which the player
           does by itself once there are 30 minutes on the clock. A child who
           drags the long hand round to the 6 and watches the short hand slide
           off the number has been shown the misconception's answer rather than
           told it. */
        show: { h: 4, m: 30, focus: null, digital: true },
        try: { h: 9, m: 30 },
        head: 'Your turn. Make it half past 9.',
        aside: 'Long hand straight down. Then nudge the short one until it says 9:30.',
        say: 'Half past means the long hand points straight down at the 6. Slide it there. '
          + 'Then move the short hand until the other clock says 9:30. Look closely. The '
          + 'short hand does not sit ON the 9. It sits just past it.',
      },
      {
        show: { h: 4, m: 30, focus: null, digital: true },
        count: true,
        head: 'Two clocks, one time.',
        aside: 'I read the digital one, then say the time out loud the long way.',
        say: '4:30 means 4 o’clock and 30 minutes. The number after the two dots is the '
          + 'minutes. It never gets past 59. At 60 it becomes a whole hour and starts again '
          + 'at 0. So “half past 4” and “4:30” are two ways of saying one time.',
      },
      {
        /* THE MISCONCEPTION, ASKED STRAIGHT OUT, at the end. Setting 9:30 with
           two fingers does not prove a child would READ 7:30 off a dial, and
           reading it is the thing this lesson exists for.

           No digital face on this step: it would print the answer on the
           figure. scripts/check.mjs fails an ask step that shows one. */
        show: { h: 7, m: 30, focus: 'hour' },
        ask: {
          q: 'The short hand is between the 7 and the 8. What is the hour?',
          options: [
            { say: '7 o\u2019clock', right: true,
              why: 'Yes. It has left the 7 and not reached the 8. So the hour is 7.' },
            { say: '8 o\u2019clock',
              why: 'Not yet. The hand has not got to the 8. Take the smaller number.' },
          ],
        },
        head: 'Last check.',
        aside: 'Between two numbers, I take the smaller one. Every time.',
        say: 'Look at the short hand. It is sitting between two numbers again.',
      },
    ],
    close: 'Three things to keep. There are 60 minutes in an hour. Half of that is 30. Short '
      + 'hand for the hour. Long hand for the minutes. And when the short hand sits between '
      + 'two numbers, take the smaller one.',
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
        say: 'All of it is shaded. Nothing has been cut yet. Before any fraction makes sense '
          + 'you have to know what the WHOLE is. Everything else is a piece of this.',
        aside: 'I find the whole first. Everything after that is a piece of it.',
      },
      {
        show: { den: 2, num: 1 },
        sweep: true, count: true,
        head: 'Cut it in half.',
        say: 'One cut down the middle makes two pieces. They have to be the SAME SIZE, or they '
          + 'are not halves. One piece out of two is shaded: one half. A single piece like '
          + 'that has a name. It is a UNIT FRACTION. Every other fraction is built out of '
          + 'copies of one.',
        aside: 'Equal pieces. If one side is fatter it is not a half.',
      },
      {
        show: { den: 4, num: 2 },
        sweep: true, count: true,
        head: 'Now cut each half in two.',
        say: 'Watch the shaded part while the cuts go in. It did not move. It did not change '
          + 'size. It is the same shaded part it always was. But there are four pieces now, '
          + 'and two of them are shaded. So we call it two quarters.',
        aside: 'Nothing was added. The cuts went in, that is all that happened.',
      },
      {
        show: { den: 8, num: 4 },
        sweep: true, count: true,
        head: 'And again.',
        say: 'Eight pieces, four of them shaded: four eighths. Look at where the shading '
          + 'stops. It is exactly the same place as before. Halfway along the bar, all three '
          + 'times.',
        aside: 'One half, two quarters, four eighths. The shading stops on the same line every time.',
      },
      {
        /* YOUR TURN, and the bar is already cut into QUARTERS — so the only way
           to shade one half is to shade two of them. The lesson's claim turned
           into a task: a child who believes more pieces means more cannot do
           it, and neither can one who thinks "one half" means shade one piece. */
        show: { den: 4, num: 0 },
        try: { num: 1, den: 2 },
        head: 'Your turn. Shade one half.',
        aside: 'The bar is in quarters. How many quarters make a half?',
        say: 'Tap the pieces to shade them. The bar is cut into quarters this time. So you '
          + 'will need more than one piece. Keep going until the counter says one half.',
      },
      {
        show: { den: 8, num: 4 },
        count: true,
        head: 'So those are three names for one amount.',
        say: 'One half, two quarters and four eighths are the same amount of bar. Each time '
          + 'the pieces doubled, the shaded ones doubled too. Double the top and the bottom '
          + 'by the same number. The amount does not change. That is the whole rule.',
        aside: 'Double both, or halve both. Never just one of them.',
      },
      {
        show: { den: 2, num: 1 },
        sweep: true, count: true,
        head: 'Now watch something different.',
        say: 'Back to one half: two pieces, one of them shaded. Keep your eye on HOW MUCH is '
          + 'shaded. This next bit is where everybody gets caught.',
        aside: 'Here it comes. This is the one I got wrong for ages.',
      },
      {
        show: { den: 8, num: 1 },
        sweep: true, count: true,
        head: 'This time only ONE piece stays shaded.',
        say: 'Eight pieces, and just one of them shaded: one eighth. The shaded part got '
          + 'SMALLER. Eight is a bigger number than two. But one eighth is a smaller piece '
          + 'than one half. Cutting the bar into more pieces makes every piece thinner.',
        aside: 'A bigger bottom number means smaller pieces, not more of them.',
      },
      {
        /* THE SAME GOAL, ON EIGHTHS. Half of a bar in eighths is four pieces
           rather than two, and the amount shaded is identical — which is the
           lesson's whole argument, asked for rather than shown. A child who did
           the quarters one and reaches for two pieces here will see the counter
           say one quarter and have to think again. */
        show: { den: 8, num: 0 },
        try: { num: 1, den: 2 },
        head: 'Your turn again. Shade one half of this one.',
        aside: 'Eighths this time. It will take more pieces for the same amount.',
        say: 'Same job, but the bar is cut into eighths now. Shade one half of it. You will '
          + 'need more pieces than last time. The shaded part will come out exactly the same '
          + 'size.',
      },
      {
        /* THE WHOLE-NUMBER BIAS, asked out loud: eight is a bigger number than
           two, so one eighth must be bigger. The lesson's second sweep shows
           that it is not. This finds out whether the child believes it. */
        show: { den: 8, num: 1 },
        ask: {
          q: 'Which is bigger, one half or one eighth?',
          options: [
            { say: 'One half', right: true,
              why: 'Yes. More pieces means each piece is thinner, not bigger.' },
            { say: 'One eighth, because 8 is bigger',
              why: 'The 8 is the bigger number, but the piece is smaller. Cutting into more pieces makes each one thinner.' },
          ],
        },
        head: 'Quick check.',
        aside: 'Bigger bottom number, smaller pieces. That is the one to hold on to.',
        say: 'One piece of this bar is shaded. Think about the size of the piece.',
      },
    ],
    close: 'Double the top and the bottom together and the amount stays the same. One half, two '
      + 'quarters, four eighths. But a bigger bottom number on its own means SMALLER pieces. '
      + 'One eighth is much less than one half.',
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
        say: 'Rows of squares, and every row the same length. Here there are three rows with '
          + 'eight in each row. You never have to count the squares one at a time. Count ONE '
          + 'row. Then count how many rows there are.',
        aside: 'I count one row, then the rows. Much quicker than counting squares.',
      },
      {
        show: { rows: 3, cols: 8, turn: 0 },
        count: true,
        head: 'Three rows of eight is 24.',
        say: 'Count on in eights, once for each row: 8, 16, 24. Twenty-four squares '
          + 'altogether. That is what 3 × 8 means. Three eights.',
        aside: '8, 16, 24. Three jumps of eight and I am done.',
      },
      {
        show: { rows: 3, cols: 8, turn: 90 },
        sweep: true, count: true,
        head: 'Now turn it.',
        say: 'A quarter turn. Watch carefully. Nothing was added and nothing was taken away. '
          + 'These are the same twenty-four squares. But now they read as eight rows with '
          + 'three in each row.',
        aside: 'Same squares. I did not touch a single one of them.',
      },
      {
        show: { rows: 3, cols: 8, turn: 90 },
        count: true,
        head: 'Eight rows of three is 24 as well.',
        say: 'Count on in threes this time: 3, 6, 9, 12, 15, 18, 21, 24. The same twenty-four. '
          + 'So 3 × 8 and 8 × 3 describe one pile of squares. They cannot come out different.',
        aside: 'Two facts for the price of one.',
      },
      {
        /* YOUR TURN. Building 4 rows of 6 means finding 24 a second way, by
           hand, right after watching 3 rows of 8 turn into 8 rows of 3. */
        show: { rows: 2, cols: 3, turn: 0 },
        try: { rows: 4, cols: 6 },
        head: 'Your turn. Make 4 rows of 6.',
        aside: 'Drag sideways for a longer row, up and down for more rows.',
        say: 'Drag across the squares to change the array. Make it 4 rows with 6 in each row. '
          + 'Watch what the total does on the way.',
      },
      {
        show: { rows: 4, cols: 7, turn: 0 },
        count: true,
        head: 'It is not a trick of that one array.',
        say: 'Here is a different one: four rows with seven in each row. Four sevens. 7, 14, '
          + '21, 28. Twenty-eight squares.',
        aside: 'Four rows of seven, so I count on in sevens.',
      },
      {
        show: { rows: 4, cols: 7, turn: 90 },
        sweep: true, count: true,
        head: 'Turn it too.',
        say: 'Seven rows with four in each row. Twenty-eight either way. This works for every '
          + 'array there is. Turning something cannot change how many squares are in it.',
        aside: 'Any array, any time. Turning it never changes how many there are.',
      },
      {
        show: { rows: 4, cols: 7, turn: 90 },
        count: true,
        head: 'So you only have to learn half the table.',
        say: 'Every fact comes with a twin. Learn 4 × 7 = 28 and you get 7 × 4 = 28 for '
          + 'nothing. That is true of every pair in the whole times table.',
        aside: 'I learn the easier one of each pair. Then I turn it round for the other.',
      },
      {
        /* AND NOW ITS TURN, by hand. 6 rows of 4 is the array they just built
           stood on its end, and building it deliberately is a different act
           from watching one rotate. The total does not move either way. */
        show: { rows: 2, cols: 2, turn: 0 },
        try: { rows: 6, cols: 4 },
        head: 'Your turn. Now make 6 rows of 4.',
        aside: 'Same 24 squares, standing up instead of lying down.',
        say: 'Build the turn of the one you just made: 6 rows with 4 in each. The total will '
          + 'be the same 24. Turning an array never adds or takes away a square.',
      },
      {
        /* THE PAYOFF, asked as a question: does the child know they get the
           twin for free, or do they still think it is a second fact to learn? */
        show: { rows: 6, cols: 9, turn: 0 },
        ask: {
          q: 'You know 6 \u00d7 9 = 54. What is 9 \u00d7 6?',
          options: [
            { say: '54', right: true,
              why: 'Yes. It is the same array turned round, so the total is the same.' },
            { say: 'You have to work it out',
              why: 'You do not. Turn the array and no square moves, so it is 54 as well.' },
          ],
        },
        head: 'Last check.',
        aside: 'Two facts for the price of one. I only learn the easier one.',
        say: 'Here is an array of 6 rows with 9 in each row.',
      },
    ],
    close: 'Turning an array cannot add a square or lose one. So 3 × 8 and 8 × 3 have to be '
      + 'equal. The same goes for every pair. Learn one of each twin and the other is free.',
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
        say: 'They are drawn the size they really are. Look at them for a moment. Do not read '
          + 'the values yet. The sizes are about to surprise you.',
      },
      {
        show: { coins: ['penny'], focus: 'penny' },
        head: 'A penny is 1 cent.',
        aside: 'I count everything in pennies first, then swap up.',
        say: 'It is the brown one. Every other coin is counted in pennies. So this is the one '
          + 'to start from.',
      },
      {
        /* A STOP PART WAY, because five pennies arriving in under two seconds
           is a thing that happened rather than a thing that was counted. A coin
           stop names a point in the count — `at: 3` is after the third penny. */
        show: { coins: ['nickel'], focus: 'nickel', pennies: 5 },
        sweep: true, count: true,
        stops: [
          { at: 3, say: 'Three pennies so far. That is 3 cents — not a nickel yet.' },
        ],
        head: 'A nickel is 5 cents.',
        aside: 'A nickel is five pennies squashed into one.',
        say: 'Five pennies are worth the same as one nickel. Count them: 1, 2, 3, 4, 5.',
      },
      {
        show: { coins: ['dime'], focus: 'dime', pennies: 10 },
        sweep: true, count: true,
        /* TWO STOPS, and the first is the one that teaches: at five pennies the
           pile is worth a nickel and the dime is still only half paid for. That
           is the equivalence the whole lesson is about, caught halfway. */
        stops: [
          { at: 5, say: 'Five pennies. That is a nickel’s worth — and only HALF of the dime.' },
          { at: 8, say: 'Eight. Nearly there, and still smaller than the dime.' },
        ],
        
        head: 'A dime is 10 cents.',
        aside: 'Ten pennies, one dime. The same swap as ten ones for a ten.',
        say: 'Ten pennies are worth the same as one dime.',
      },
      {
        /* YOUR TURN, and the first one is deliberately the easy sort: there is
           more than one right answer. A dime, or two nickels, or ten pennies —
           the widget says yes to all of them, because the thing being learned
           is that a handful of coins and an amount of money are different
           questions. */
        show: { coins: ['dime'], focus: null, pennies: 0 },
        try: { cents: 10 },
        head: 'Your turn. Make 10 cents.',
        aside: 'More than one way to do this one. Any of them counts.',
        say: 'Tap coins to take them. You can do it with one dime. Or two nickels. Or ten '
          + 'pennies. They are all 10 cents, and that is the point.',
      },
      {
        show: { coins: ['nickel', 'dime'], focus: 'dime' },
        head: 'Here is the surprising bit.',
        aside: 'I got this one wrong the first time too. Size is no help at all.',
        say: 'The dime is SMALLER than the nickel. But it is worth twice as much. Coins are '
          + 'not worth what their size looks like. You have to know them.',
      },
      {
        show: { coins: ['quarter'], focus: 'quarter' },
        head: 'A quarter is 25 cents.',
        aside: 'This is the only coin whose size tells the truth.',
        say: 'It is the biggest of the four. It is also worth the most. This one does match '
          + 'its size.',
      },
      {
        /* THE HARDER ONE, after the quarter. 25 cents needs either the quarter
           or a real count, and the running total makes the difference visible
           while they build it. */
        show: { coins: ['quarter'], focus: null, pennies: 0 },
        try: { cents: 25 },
        head: 'Your turn. Make 25 cents.',
        aside: 'I go biggest first. One quarter and I am done.',
        say: 'Tap coins until the total says 25 cents. One quarter does it in one go. Two '
          + 'dimes and a nickel is 25 cents too. Watch the total as you tap.',
      },
      {
        show: { coins: ['quarter', 'dime', 'nickel', 'penny'], focus: null, running: true },
        head: 'To count a handful, start with the biggest value.',
        aside: 'I line them up biggest first, every single time.',
        say: 'Put them in order first. Then count on: 25, then 35, then 40, then 41. Forty-one '
          + 'cents. Starting from the biggest keeps the counting easy.',
      },
      {
        /* THE SIZE MISCONCEPTION, asked out loud. The lesson shows it twice;
           this finds out whether it landed. */
        show: { coins: ['nickel', 'dime'], focus: null },
        ask: {
          q: 'Which is worth more, the nickel or the dime?',
          options: [
            { say: 'The dime', right: true,
              why: 'Yes. The dime is smaller and worth twice as much.' },
            { say: 'The nickel, it is bigger',
              why: 'Size is no help here. The dime is smaller and still worth more.' },
          ],
        },
        head: 'Quick check.',
        aside: 'The small one wins this round. It still catches me out.',
        say: 'Both coins are here. One of them is worth more than the other.',
      },
    ],
    close: 'Penny 1, nickel 5, dime 10, quarter 25. The dime is small and still beats the '
      + 'nickel. And a handful is easiest counted biggest first.',
  },
};

/* The sweep readout's labels. Here rather than in src/mount/lesson.js because
   they are copy, and because the player should not have to know that the thing
   being counted is time. */
export const LESSON_COUNT = {
  /* The two the coin widget counts. `worth` rather than "total" on purpose: the
     whole point of the step is that four coins can be worth less than one. */
  coinsTaken: 'coins taken',
  worth: 'worth',
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

/* THE LAST OFFER, inside the hint box. A first grader reached a clock question,
   pressed for a hint, read it, and still did not know what to do — and the way
   back to the lesson was a callout at the top of the page they had scrolled
   past twenty minutes earlier. A hint is where a stuck child actually is, so
   that is where the route belongs.

   Generic on purpose: any activity declaring `lesson` gets it, so the next
   lesson does not need a line of code to be findable from the work it
   explains. */
export const LESSON_STUCK = 'Still stuck?';

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
/* YOUR TURN — the words a try step uses. One set for all four lessons and all
   five friends, same as every other caption here.

   `how` is scaffolding rather than decoration: a first grader shown a clock
   does not know that the hands can be touched, and there is nothing about a
   drawing of a clock that says so. */
export const LESSON_TRY = {
  goal: 'Make it say',
  how: 'Put your finger on a hand and slide it round the clock.',
  howCoin: 'Tap a coin to take one. Tap it again in the row below to put it back.',
  trayLab: 'Tap a coin to take it',
  empty: 'Nothing taken yet.',
  got: (t) => `Yes — that is ${t}.`,
  /* The bar and array lessons move one thing rather than two, so they get
     their own nudge; the clock's mentions hands it does not have. */
  howTap: 'Tap the pieces to shade them.',
  howArr: 'Drag across the squares to change the array — sideways for a longer row, up and down for more rows.',
  of: 'of',
};

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
