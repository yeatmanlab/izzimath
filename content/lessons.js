/* Animated lessons — the one thing a paper workbook cannot do.
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
        say: 'It has two hands. The short, fat one and the long, thin one. They do different jobs, '
          + 'and telling them apart is most of the work.',
      },
      {
        show: { h: 3, m: 0, focus: 'hour' },
        head: 'The SHORT hand says the hour.',
        say: 'It is pointing at the 3. So it is 3 o’clock.',
      },
      {
        show: { h: 3, m: 0, focus: 'minute' },
        head: 'The LONG hand says the minutes.',
        say: 'When it points straight up at the 12, there are no extra minutes. That is what '
          + '“o’clock” means.',
      },
      {
        show: { h: 4, m: 0, focus: 'both' },
        head: 'Watch the long hand go all the way round.',
        say: 'One whole trip round is one hour. It went from 3 o’clock to 4 o’clock — and did you '
          + 'see the short hand move too? It crept from the 3 to the 4.',
      },
      {
        show: { h: 4, m: 30, focus: 'minute' },
        head: 'Halfway round is half past.',
        say: 'The long hand is pointing straight down at the 6. It has gone half of the way round, '
          + 'so half an hour has gone by.',
      },
      {
        /* The PHRASE, not the mechanics. The previous step explains that half an
           hour has gone; it does not explain what the words "half past" mean,
           and "past" is doing real work a six-year-old has no reason to know.
           Asked for by name after a read-through, and fair: the activity's
           hints all assume the phrase is understood. */
        show: { h: 4, m: 30, focus: 'minute' },
        head: 'That is what “half past” means.',
        say: '“Past” means after. So “half past 4” is the short way of saying half an hour AFTER '
          + '4 o’clock. First it was 4 o’clock, then half an hour went by, and now it is half '
          + 'past 4.',
      },
      {
        show: { h: 4, m: 30, focus: 'hour' },
        head: 'Now look at the short hand.',
        say: 'It is not on the 4 any more, and it has not reached the 5. It is sitting BETWEEN them, '
          + 'halfway, because half of the hour has gone.',
      },
      {
        show: { h: 4, m: 30, focus: 'hour', digital: true },
        head: 'So this is half past 4 — not half past 5.',
        say: 'The short hand has left the 4 but has not got to the 5, so the hour is still 4. That is '
          + 'the one thing to remember: when the short hand is between two numbers, take the '
          + 'SMALLER one.',
      },
      {
        show: { h: 4, m: 30, focus: null, digital: true },
        head: 'A digital clock says the same thing.',
        say: '4:30 means 4 o’clock and 30 minutes. Half an hour is 30 minutes, so “half past 4” and '
          + '“4:30” are two ways of saying one time.',
      },
    ],
    close: 'Short hand for the hour, long hand for the minutes. “Half past” means half an hour '
      + 'after the hour — and when the short hand sits between two numbers, you take the '
      + 'smaller one.',
  },

  money: {
    id: 'money',
    title: 'How coins work',
    topic: 'Money',
    glyph: '¢',
    card: { coins: ['quarter', 'nickel', 'dime', 'penny'] },
    lead: 'Four coins, and the smallest one is not the cheapest.',
    steps: [
      {
        show: { coins: ['quarter', 'nickel', 'penny', 'dime'], focus: null },
        head: 'These are the four coins.',
        say: 'They are drawn the size they really are. Look at them for a moment before we say what '
          + 'each one is worth — because the sizes are about to surprise you.',
      },
      {
        show: { coins: ['penny'], focus: 'penny' },
        head: 'A penny is 1 cent.',
        say: 'It is the brown one. Everything else is counted in pennies, so this is the one to '
          + 'start from.',
      },
      {
        show: { coins: ['nickel'], focus: 'nickel', pennies: 5 },
        head: 'A nickel is 5 cents.',
        say: 'Five pennies are worth the same as one nickel. Count them: 1, 2, 3, 4, 5.',
      },
      {
        show: { coins: ['dime'], focus: 'dime', pennies: 10 },
        head: 'A dime is 10 cents.',
        say: 'Ten pennies are worth the same as one dime.',
      },
      {
        show: { coins: ['nickel', 'dime'], focus: 'dime' },
        head: 'Here is the surprising bit.',
        say: 'The dime is SMALLER than the nickel — but it is worth twice as much. Coins are not '
          + 'worth what their size looks like. You have to know them.',
      },
      {
        show: { coins: ['quarter'], focus: 'quarter' },
        head: 'A quarter is 25 cents.',
        say: 'It is the biggest of the four, and it is worth the most. This one does match its size.',
      },
      {
        show: { coins: ['quarter', 'dime', 'nickel', 'penny'], focus: null, running: true },
        head: 'To count a handful, start with the biggest value.',
        say: 'Put them in order, then count on: 25, then 35, then 40, then 41. Forty-one cents. '
          + 'Starting from the biggest keeps the counting easy.',
      },
    ],
    close: 'Penny 1, nickel 5, dime 10, quarter 25. The dime is small and still beats the nickel, '
      + 'and a handful is easiest counted biggest first.',
  },
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
