/* Copy for the two-step walkthrough. Data, not markup, so scripts/check.mjs can
   read it and so the child line and the parent line always travel together.

   Two audiences, one artefact: the child line is short enough to be spoken and
   is the thing that appears when a real control has just been pressed; the
   parent line under it is the sentence that explains the product. Neither of the
   parent sentences below exists anywhere else on the site today, which is the
   real argument for this feature.

   The tour NEVER opens itself, so nothing here needs a "seen it" flag and there
   is no storage to degrade. */

export const TOUR = {
  door: 'Take a tour of Izzi Math',

  step1: {
    n: '1 of 3',
    ask: 'Press a friend.',
    // {name} resolved at build time, per character, so nothing is fetched on press
    /* {place} is the character's world noun from content/characters.js — "the
       canyon", "the park", "the treetops". It is what actually appears in the
       word problems, so the line is checkable against the content rather than a
       nice-sounding guess. My first draft said "{noun}" and reached for
       world.creature, which does not exist; every character would have read
       "friends". */
    said: 'You pressed {name}. {name}’s colours are on the whole site now, and the stories '
      + 'are set in {place}. Press Just math to take it off.',
    saidNone: 'That is Just math. Plain colours, and nobody in the stories. '
      + 'Press a face to put a friend back.',
    /* "Your choice", not "your child's": a child may well be the one running the
       tour, and a line that talks about them in the third person tells them the
       panel is not for them. */
    more: 'Your choice of character changes the colours, who appears in the word problems, and '
      + 'the wording of the encouragement. It never changes the maths — a link gives the same '
      + 'problems whichever face is on.',
  },

  step2: {
    n: '2 of 3',
    ask: 'Press it again.',
    said: 'New numbers. Same kind of question. Every book, every game and every sheet has this '
      + 'button — press it whenever you want more.',
    more: 'The problems come from the link. The same link always gives the same problems; a new '
      + 'one gives a fresh set. That is why the printed sheet and the screen can match, and why '
      + 'you never run out.',
  },

  /* The third panel answers what a new visitor — of either age — actually cannot
     work out: what is here, how much of it, and how to reach it.

     Written for WHOEVER is driving. Not a child line with an adult footnote: a
     nine-year-old exploring on her own is as likely to be reading this as a
     parent, and copy that discusses her in the third person tells her the panel
     is not for her. The second line in each panel is MORE DETAIL, not a different
     audience.

     The excitement is meant to come from the scale being real — {counts} are
     filled from content/ at runtime, so "29 books" is a fact and not a boast.
     This project does not claim effects and does not use praise words; a big true
     number is the honest way to make a catalogue look worth exploring. */
  step3: {
    n: '3 of 3',
    ask: 'Here’s what there is.',
    /* {n} placeholders resolved in src/mount/tour.js from the content modules. */
    ways: [
      ['Grades', '/grades/',
        'Six of them, Kindergarten to 5th. Pick yours and everything for it is on one page.'],
      ['Books', '/books/',
        '{books} of them. Hints when you want one, and the working shown after every answer. Never timed.'],
      ['Games', '/games/',
        '{games} of them. Short rounds that get harder as you get them right. The clock is off unless you turn it on.'],
      ['Printables', '/printables/',
        'All {total} activities print, each with an answer key.'],
      /* No href: there is no badges page, and pointing this at /guide/ made it a
         second copy of the button already at the bottom of the panel. The row
         says where the thing is instead, which is what the reader needs. */
      ['Badges', null,
        '{badges} to collect — for climbing to the hard ones, for streaks, for finishing a book, and for going back and fixing an answer. They live behind the Scores button, top right.'],
      ['By skill', '/skills/',
        'If you already know the tricky bit, go straight at it.'],
      /* Added after auditing the tour against the site's actual features. A
         sequenced plan is the answer to "what do I actually do?", and it is also
         the page with ZERO editorial inbound links in the whole site — a tour
         that never mentions it leaves it as invisible as it was. {plans} is
         filled from content/plans.js, because there is one plan today and a
         hand-typed "a plan" becomes wrong the moment there are three. */
      ['Plans', '/plans/',
        'What to do and in what order, three times a week. {plans}'],
      ['How to help', '/parents/',
        'For a grown-up: how long a session should be, how often, and what to say when someone is stuck.'],
    ],
    said: 'Three ways to a sheet: the Printables page, the Print button on any book or game, '
      + 'or a pack of several sheets at once.',
    more: 'Every route reaches the same activities — by grade, by kind, or by skill, whichever '
      + 'you think in. Nothing is behind an account, and every activity prints.',
    go: 'Pick your grade',
    map: 'See everything on one page',
  },
};
