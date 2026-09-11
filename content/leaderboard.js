/* The character cup — the one comparison this site is allowed to make.
 *
 * WHY THIS IS NOT A LEADERBOARD OF CHILDREN, AND MUST NEVER BECOME ONE
 * `docs/SPEC.md` §4.1 item 8, and `docs/EVIDENCE.md` twice over: "Nothing is
 * ever compared between children. No leaderboards, no percentiles, no public
 * scores." That is not a style rule — comparison is the part of timed maths with
 * a real link to anxiety, and it is why `docs/next/04-adaptive-and-spacing.md`
 * rejected a per-child ability estimate.
 *
 * What this ranks is the FOUR CHARACTERS against each other. Nobody's child is
 * on it. A row says "Ash has been out for 12 badges", which is a fact about a
 * cartoon koala, and the only thing a child learns from reading it is which
 * friend is popular. Adding a per-child row, a name, or a position would cross
 * the line the three documents above draw, so `scripts/check.mjs` fails the
 * build if this module ever grows a profile id or a child-facing name field.
 *
 * WHAT IT COUNTS, AND WHY BADGES
 * Badges, with right answers as the tiebreak. Deliberately not speed and not a
 * score:
 *   - Badges are DERIVED from progress records (content/badges.js), so they
 *     cannot be inflated without actually doing the maths.
 *   - Because problems are a deterministic function of a seed, a future backend
 *     can re-derive any problem from (activityId, seed, index) and verify the
 *     answers were right. It can never verify that a human answered them, or how
 *     long it took. So a badge count is checkable and a time is not.
 *   - A time would also be a score, and the site says in three places that it
 *     never produces one.
 *
 * ONE DEVICE FOR NOW
 * There is no backend, so this sums the profiles on THIS device. The page says
 * so plainly rather than implying a global total, because a made-up global
 * number is the one thing that would make the whole page dishonest. The shape
 * here is already what a backend would aggregate: N counters, one per character,
 * with no per-child rows at all — see docs/next/07-backend-options.md.
 */

import { characters, characterList } from './characters.js';
import { levelFor } from './levels.js';

/* Ranked on badges, then right answers, then activities played, then name. The
   last one is not a real tiebreak — it is there so the order is total, and two
   characters that are genuinely level do not swap places between renders. */
export const RANK_FIELDS = ['badges', 'right', 'plays', 'name'];

export const CUP = {
  title: 'The character cup',
  /* Covers BOTH views, because the page's static body carries this line before
     the toggle has been read and a lead that describes only one of them is
     simply wrong half the time. The earlier version said "nobody is ranked here
     but Kiwi, Georgie, Flame and Ash", which stopped being true the moment the
     players view existed. */
  lead: 'Two ways to look at it: which of the friends has been out the most, or who on this '
    + 'device has done the most. Neither one says anything about how good anyone is at maths.',
  local: 'Counted on this device. There is no account and nothing is sent anywhere, so these are '
    + 'the profiles on this tablet or computer and no one else’s.',
  empty: 'Nothing counted yet. Pick a friend, do an activity, and they will show up here.',
  emptyHint: 'Badges are what count. They come from doing the maths, so they cannot be collected by '
    + 'being quick.',
  /* The rows are buttons, and this line is what tells a child so. Asked for by
     a first grader who saw that Kiwi had the fewest badges, wanted to go and
     help, and had no way to do it from this page — the picker is in the header,
     two screens up, and nothing connected the two. Switching here is the same
     cosmetic switch the header picker makes: it decides who a future badge
     counts for and touches nothing else. */
  pick: 'Tap a friend to play as them. It changes how the site looks and who the '
    + 'next badge counts for — never the maths.',
  picked: 'playing',
  pickSay: (name) => `Press to play as ${name}.`,
  pickedSay: (name) => `You are playing as ${name}.`,
  howHead: 'How it is counted',
  how: [
    'A badge counts for whichever friend was on screen when it was earned.',
    'Tap a friend here to play as them, so the next one counts for them.',
    'Right answers break a tie. Nothing is timed and there is no score.',
    'Every profile on this device adds to the same four totals.',
  ],
};

/* One row per character, from whatever the caller could gather. Everything is
   optional and missing means zero, so a caller with only badges still gets a
   sound table — which is what the site had before per-character tallies existed. */
export function blankRow(id) {
  return { id, badges: 0, right: 0, plays: 0, printed: 0, fixes: 0 };
}

/* `none` is a first-class choice in the picker — "Just math" — and it is not a
   character. It has no avatar to show, no palette of its own worth a bar, and
   putting it on a cup it cannot win reads as a bug. */
export const CUP_CHARACTERS = characterList.filter((id) => id !== 'none');

/* Pure: rows in, standings out. No DOM, no store, no clock — so scripts/check.mjs
   can put a table in and assert the order that comes out. */
export function standings(rows = []) {
  const by = new Map(CUP_CHARACTERS.map((id) => [id, blankRow(id)]));
  for (const r of rows) {
    if (!r?.id || !by.has(r.id)) continue;          // unknown or `none`: ignored
    const t = by.get(r.id);
    for (const k of ['badges', 'right', 'plays', 'printed', 'fixes']) {
      t[k] += Number.isFinite(r[k]) ? r[k] : 0;
    }
  }
  const out = [...by.values()].map((t) => ({
    ...t,
    name: characters[t.id]?.name ?? t.id,
    accent: characters[t.id]?.palette?.a1 ?? '#888888',
    level: levelFor(t.badges),
  }));

  out.sort((a, b) => b.badges - a.badges || b.right - a.right || b.plays - a.plays
    || a.name.localeCompare(b.name));

  /* Ties share a place, and the next place skips — 1, 1, 3, not 1, 1, 2. A child
     reading two friends on the same row should see the same number on both, or
     the row is lying about being level. */
  const top = out[0]?.badges ?? 0;
  let place = 0, seen = 0;
  let prev = null;
  for (const r of out) {
    seen++;
    const key = `${r.badges}|${r.right}|${r.plays}`;
    if (key !== prev) { place = seen; prev = key; }
    r.rank = place;
    r.tied = out.filter((o) => `${o.badges}|${o.right}|${o.plays}` === key).length > 1;
    /* The bar is scaled against the LEADER, not against the total. Against the
       total, four evenly matched friends each get a 25% bar and the chart says
       nothing; against the leader, the front runner fills the row and everyone
       else reads as a fraction of it, which is the comparison being made. */
    r.share = top > 0 ? r.badges / top : 0;
  }
  return out;
}

/* ------------------------------------------------------- the players' view
   The second view, and it needs a different metric to be honest.

   The argument for showing players at all is that it says nothing about skill —
   it is a wall of fun avatar-and-name combinations, ordered by how much someone
   has done. That argument is TRUE ONLY IF THE METRIC IS VOLUME. It is false if
   the metric is badges: 8 of the 24 are skill gates rather than counts — the
   five Climbing badges are reached depth ("Into the Hard Ones", "Summit",
   "Every Summit") and the three Streaks badges are consecutive right answers
   ("Ten in a Row", "Unbroken"). Ranking players on badges would put the child
   who goes deepest at the top and quietly make it a skill board.

   So this ranks on ACTIVITIES DONE and SHEETS PRINTED, which are effort and
   nothing else. A child who does twenty activities badly outranks one who does
   three perfectly, and that is the intended and honest behaviour.

   And no places. The character view numbers its rows 1..4 because ranking four
   cartoons is the joke; numbering CHILDREN is the thing docs/SPEC.md §4.1
   forbids, and an ordered gallery carries "who has been busy" without telling
   anyone they are third. The bar still shows relative volume, so nothing is
   hidden — there is just no ordinal to be told you are. */
export function playerStandings(players = []) {
  const rows = players
    .filter((p) => p && p.id)
    .map((p) => ({
      id: p.id,
      name: p.name ?? '',
      avatar: Number.isFinite(p.avatar) ? p.avatar : 0,
      activities: Number.isFinite(p.activities) ? p.activities : 0,
      sheets: Number.isFinite(p.sheets) ? p.sheets : 0,
      badges: Number.isFinite(p.badges) ? p.badges : 0,
    }));
  rows.sort((a, b) => b.activities - a.activities || b.sheets - a.sheets
    || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const top = rows[0]?.activities ?? 0;
  for (const r of rows) r.share = top > 0 ? r.activities / top : 0;
  return rows;
}

/* One player row from what the store actually hands back. Pure, and it exists
   because the arithmetic was wrong in the mount and nothing could see it:
   store.allProgress() returns an OBJECT KEYED BY activityId, not an array, so
   `prog.filter(...)` threw, the caller's try/catch swallowed it, and the players
   view rendered empty on every real device. The harness missed it because it
   called the renderer with synthetic rows and never went through the store.

   So the shape is pinned here, in a function scripts/check.mjs can drive with a
   real store. `activities` counts records that were actually PLAYED, not every
   record, so opening a book and leaving does not count as doing it. */
export function playerRowFrom(profile, progressByActivity = {}, badgeCount = 0) {
  const records = Object.values(progressByActivity ?? {});
  return {
    id: profile.id,
    name: profile.name ?? '',
    avatar: Number.isFinite(profile.avatar) ? profile.avatar : 0,
    /* "Did it" means ANY engagement signal, not plays > 0. The engines do not
       agree on what they send: a game sends `played: true`, so plays increments;
       a book records once at its finish screen and sends `finished`, `pagesDone`,
       `right` and `fixes` with NO `played`, so plays stays zero forever. Counting
       plays alone therefore counted games only — and 32 of the 49 activities are
       books, so a child who had worked through ten of them showed nothing. */
    activities: records.filter((r) => (r?.plays || 0) > 0 || r?.finished || (r?.pagesDone || 0) > 0).length,
    sheets: records.reduce((n, r) => n + (r?.printed || 0), 0),
    badges: badgeCount,
  };
}

export const PLAYERS = {
  label: 'By player',
  charLabel: 'By friend',
  lead: 'Everyone who keeps score on this device, and how much they have done. '
    + 'Ordered by how many activities, never by how well — there are no places here.',
  empty: 'No one is keeping score on this device yet. It is optional, and the Scores button top right is where it starts.',
  unit: (n) => `${n} ${n === 1 ? 'activity' : 'activities'}`,
  sheets: (n) => `${n} ${n === 1 ? 'sheet' : 'sheets'}`,
};

export const cupTotals = (rows = []) => {
  const s = standings(rows);
  return {
    characters: s.length,
    badges: s.reduce((n, r) => n + r.badges, 0),
    right: s.reduce((n, r) => n + r.right, 0),
    plays: s.reduce((n, r) => n + r.plays, 0),
    counted: s.some((r) => r.badges > 0 || r.right > 0 || r.plays > 0),
  };
};
