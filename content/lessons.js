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
    close: 'Short hand for the hour, long hand for the minutes, and when the short hand is between '
      + 'two numbers you take the smaller one.',
  },

  money: {
    id: 'money',
    title: 'How coins work',
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
