// Content and build validator. Run with `npm run check`.
// Catches the failure modes that matter for generated content: a choice list that
// doesn't contain its own answer, a generator that isn't deterministic, an
// unreachable ROAM subscale, NaN leaking into a problem.

import fs from 'node:fs';
import { activities, STRANDS } from '../content/activities/index.js';
import { ROUTINES, ROUTINE_IDS, warmUpFor, WODB_QUAD_COUNT, LADDER_COUNT } from '../content/routines.js';
import { characters, getCharacter } from '../content/characters.js';
import { allSubscales, tasks, roamLabel } from '../content/roam.js';
import { isCorrect, answerText, TYPES } from '../content/types.js';
import { rng, deriveSeed } from '../src/lib/rng.js';
import { sheet, printProblem } from '../src/lib/printsheet.js';
import { parseAnswer, cmpF, parseRaw, frac, simplify } from '../src/lib/frac.js';
import { references, refIds, getRef, buildReverseIndex, isSiteScope, STRENGTH, KINDS } from '../content/references.js';
import { IM_UNITS, imUnit } from '../content/curriculum.js';
import { SCHEMAS } from '../content/wordproblems.js';
import { ssddSets } from '../content/ssdd.js';
import { plans, planActivityIds, FOUR_PART } from '../content/plans.js';
import { ladderConfig, initState, record, tierFor, atTop, indexFor, TIERS, STEPS, LADDER_V } from '../src/lib/ladder.js';
import { CREATURES, COLOURWAYS, AVATAR_COUNT, avatarSpec, avatarLabel, namesFor, NAMES_OFFERED, FOODS, NAME_POOL, foodChoicesFor, CHECK_DECOYS } from '../content/avatars.js';
import { avatarSvg, EAR_KINDS, EXTRA_KINDS, FACE_KINDS } from '../src/lib/avatarart.js';
import { BADGES, BADGE_COUNT, CATEGORIES, badgeById, evaluate as evaluateBadges } from '../content/badges.js';
import { LEVELS, levelFor } from '../content/levels.js';
import { SPRITES } from '../src/lib/sprites.js';
import { badgeSvg, shelfHtml } from '../src/lib/badgeart.js';
import { createStore, nullDriver, localDriver, mergeProgress, MERGE, blankProgress } from '../src/lib/profile.js';

let errors = 0, warns = 0, checked = 0;
const fail = (...m) => { errors++; console.log('  FAIL ', ...m); };
const warn = (...m) => { warns++; console.log('  warn ', ...m); };

const GRADES = ['K', '1', '2', '3', '4', '5'];
const CHARS = ['none', 'kiwi', 'georgie', 'flame'];

console.log(`\n=== schema ===`);
const ids = new Set();
for (const a of activities) {
  const where = a.id || '(no id)';
  if (!a.id) fail('activity with no id');
  if (ids.has(a.id)) fail('duplicate id', a.id);
  ids.add(a.id);
  if (!/^[a-z0-9-]+$/.test(a.id || '')) fail(where, 'id not kebab-case');
  for (const f of ['title', 'kind', 'grade', 'strand', 'skill', 'blurb']) if (!a[f]) fail(where, 'missing', f);
  if (!['book', 'game'].includes(a.kind)) fail(where, 'bad kind', a.kind);
  if (!GRADES.includes(a.grade)) fail(where, 'bad grade', a.grade);
  if (!(STRANDS[a.grade] || []).includes(a.strand)) fail(where, `strand "${a.strand}" not in STRANDS[${a.grade}]`);
  if (!Array.isArray(a.ccss) || !a.ccss.length) fail(where, 'no ccss');
  if (!Array.isArray(a.roam) || !a.roam.length) fail(where, 'no roam link');
  for (const l of a.roam || []) {
    if (!tasks[l.task]) fail(where, 'unknown roam task', l.task);
    else if (!tasks[l.task].subscales[l.subscale]) fail(where, `unknown subscale ${l.task}:${l.subscale}`);
  }
  if (typeof a.generate !== 'function') fail(where, 'no generate()');
  if (a.kind === 'book' && !a.pages) fail(where, 'book with no pages');
  if (a.kind === 'game' && !a.rounds) fail(where, 'game with no rounds');
  // A game has to say what the child is being asked to do. Children testing
  // these could not always name the point of the game, and the strategy field
  // says how to do it, not what it is. See docs/GAME-DESIGN.md.
  if (a.kind === 'game' && !a.goal) fail(where, 'game with no goal — what is the child being asked to do?');
  if (!a.evidence) warn(where, 'no evidence note');
}

console.log(`\n=== generators (all activities x all characters) ===`);
/* --------------------------------------------------- character palettes
   A character's palette is defined twice: in content/characters.js (used by the
   print sheets) and as CSS variables in site.css (used by the screen). They have
   to agree, and nothing forces them to — Flame's two copies could drift apart
   silently and only the printable would be wrong. */
console.log('\n=== character palettes ===');
{
  const css = fs.readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8');
  for (const [id, ch] of Object.entries(characters)) {
    const line = css.split('\n').find((l) => l.includes(`data-ch="${id}"`));
    if (!line) { fail(`palette:${id}`, 'no CSS block for this character'); continue; }
    for (const [tok, hex] of Object.entries(ch.palette || {})) {
      if (!line.toLowerCase().includes(hex.toLowerCase()))
        fail(`palette:${id}`, `${tok} is ${hex} in characters.js but that hex is not in the CSS block`);
    }
    if (ch.printAccent && !/^#[0-9a-f]{6}$/i.test(ch.printAccent))
      fail(`palette:${id}`, `printAccent "${ch.printAccent}" is not a hex colour`);
  }

  /* And the characters have to be told apart. Flame shipped wearing Kiwi's
     yellow and orange — 2 degrees of hue apart on the primary accent, which is
     no difference at all. */
  const hue = (h) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    const t = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return t * 60;
  };
  const named = Object.entries(characters).filter(([id]) => id !== 'none');
  for (let i = 0; i < named.length; i++) {
    for (let j = i + 1; j < named.length; j++) {
      const [ia, a] = named[i], [ib, b] = named[j];
      let d = Math.abs(hue(a.palette.a1) - hue(b.palette.a1));
      d = Math.min(d, 360 - d);
      if (d < 20) fail('palette', `${ia} and ${ib} have primary accents only ${Math.round(d)}deg apart — they will read as the same character`);
    }
  }
  /* The --sp gradient is the BACKGROUND for the logo mark, primary buttons and
     grade badges, and --onsp is the label on it. Darkening a character's accents
     therefore darkens a text background, which is how Flame's button label
     silently fell to 2.81:1 while every other check stayed green. This measures
     the label against the gradient across the span text actually occupies. */
  const relLum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const contrast = (a, b) => {
    const [x, y] = [relLum(a), relLum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => {
    const s2 = parseInt(a.slice(i, i + 2), 16), e = parseInt(b.slice(i, i + 2), 16);
    return Math.round(s2 + (e - s2) * t).toString(16).padStart(2, '0');
  }).join('').toUpperCase();

  const cssVar = (line, name, fallback) => {
    const m = line.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
    return m ? m[1] : fallback;
  };
  const root = css.split('\n').find((l) => l.includes('--onsp:')) || '';
  const defaultOnsp = cssVar(root, 'onsp', '#05060E');

  for (const [id, ch] of Object.entries(characters)) {
    const block = css.split('\n').find((l) => l.includes(`data-ch="${id}"`)) || '';
    // the whole rule can span lines; take everything up to the closing brace
    const start = css.indexOf(`data-ch="${id}"`);
    const rule = css.slice(start, css.indexOf('}', start) + 1);
    const onsp = cssVar(rule, 'onsp', defaultOnsp);
    // which stops the gradient uses: a2->a3 if the rule overrides --sp, else a1->a2->a3
    const stops = /--sp:\s*linear-gradient\([^)]*var\(--a2\)[^)]*var\(--a3\)/.test(rule.replace(/\s+/g, ' '))
      ? [ch.palette.a2, ch.palette.a3]
      : [ch.palette.a1, ch.palette.a2, ch.palette.a3];
    let worst = Infinity, worstAt = 0;
    for (let i = 30; i <= 80; i++) {
      const p = i / 100;
      let c;
      if (stops.length === 2) c = mix(stops[0], stops[1], p);
      else c = p <= 0.55 ? mix(stops[0], stops[1], p / 0.55) : mix(stops[1], stops[2], (p - 0.55) / 0.45);
      const r = contrast(onsp, c);
      if (r < worst) { worst = r; worstAt = i; }
    }
    if (worst < 4.5)
      fail(`palette:${id}`, `the label on its gradient is only ${worst.toFixed(2)}:1 at ${worstAt}% — buttons and badges become unreadable`);
    else
      console.log(`  ${id.padEnd(8)} label on gradient ${worst.toFixed(2)}:1 (${onsp} on ${stops.length} stops)`);
  }
  console.log(`  ${Object.keys(characters).length} palettes agree with the CSS · primary accents all distinguishable`);
}

/* ----------------------------------------------------------------- avatars */
console.log('\n=== profile avatars ===');
{
  if (AVATAR_COUNT !== 150) fail('avatars', `${AVATAR_COUNT} avatars, the design calls for 150`);

  /* Every spec must resolve to a primitive that actually draws something. The
     deer asked for antlers as an `extra` when antlers are an `ears` primitive,
     so it rendered a bare head and nothing anywhere failed. */
  for (const c of CREATURES) {
    const w = `avatar:${c.id}`;
    if (!EAR_KINDS.includes(c.ears)) fail(w, `ears "${c.ears}" is not a primitive`);
    if (!EXTRA_KINDS.includes(c.extra)) fail(w, `extra "${c.extra}" is not a primitive`);
    if (!FACE_KINDS.includes(c.face)) fail(w, `face "${c.face}" is not a primitive`);
  }

  /* Two creatures with the same silhouette AND the same feature are the same
     icon twice, which breaks the one thing that matters: finding yours. */
  const sig = new Map();
  for (const c of CREATURES) {
    const k = `${c.ears}|${c.face}|${c.extra}`;
    if (sig.has(k)) fail('avatars', `${c.id} and ${sig.get(k)} are visually identical (${k})`);
    sig.set(k, c.id);
  }

  // all 150 render, distinctly, and carry a label for screen readers
  const seen = new Set();
  for (let i = 0; i < AVATAR_COUNT; i++) {
    const svg = avatarSvg(i);
    if (!svg || svg.length < 200) fail('avatars', `avatar ${i} rendered ${svg?.length ?? 0} chars`);
    if (!/aria-label="/.test(svg)) fail('avatars', `avatar ${i} has no accessible label`);
    if (seen.has(svg)) fail('avatars', `avatar ${i} is byte-identical to an earlier one`);
    seen.add(svg);
    const sp = avatarSpec(i);
    if (!sp.creature || !sp.colour) fail('avatars', `avatar ${i} has no spec`);
  }
  // ids must be stable: creature varies fastest, so a grid shows variety first
  if (avatarSpec(0).creature.id === avatarSpec(1).creature.id)
    fail('avatars', 'consecutive ids are the same creature — the grid would show six of each');

  // names
  for (let i = 0; i < AVATAR_COUNT; i += 7) {
    const ns = namesFor(i);
    if (ns.length !== NAMES_OFFERED) fail('avatars', `avatar ${i} offers ${ns.length} names, want ${NAMES_OFFERED}`);
    if (new Set(ns).size !== ns.length) fail('avatars', `avatar ${i} offers a duplicate name`);
    if (ns.some((n) => !NAME_POOL.includes(n))) fail('avatars', `avatar ${i} offers a name not in the pool`);
    if (JSON.stringify(ns) !== JSON.stringify(namesFor(i))) fail('avatars', `namesFor(${i}) is not deterministic`);
  }

  // foods, and the pick-up check
  if (FOODS.length !== 500) fail('avatars', `${FOODS.length} foods, the design calls for 500`);
  if (new Set(FOODS.map((f) => f.id)).size !== FOODS.length) fail('avatars', 'duplicate food id');
  /* Two snacks reading the same is worse than two sharing an id, because the
     verify screen could then offer the right answer and a wrong one that look
     identical — an unanswerable question. */
  {
    const byName = new Map();
    for (const f of FOODS) byName.set(f.name, [...(byName.get(f.name) ?? []), f.id]);
    for (const [name, ids] of byName) {
      if (ids.length > 1) fail('avatars', `two snacks both read "${name}" (${ids.join(', ')})`);
    }
  }
  for (const f of FOODS) if (!f.name || !f.glyph) fail('avatars', `food ${f.id} missing name or glyph`);

  /* A profile stores the food ID. Dropping one locks whoever chose it out of
     their own scores, in a product whose whole premise is that there is no way to
     recover anything. These twenty-five were the entire list before the snacks
     grew to five hundred, so they are the ids most likely to be out there. */
  const ORIGINAL = ['pizza', 'icecream', 'banana', 'apple', 'carrot', 'noodles', 'taco', 'cheese',
    'grapes', 'watermelon', 'strawberry', 'cookie', 'pancakes', 'popcorn', 'sushi', 'broccoli',
    'orange', 'bread', 'honey', 'mango', 'corn', 'peach', 'pretzel', 'blueberry', 'avocado'];
  for (const id of ORIGINAL) {
    if (!FOODS.some((f) => f.id === id)) fail('avatars', `food id "${id}" is gone — that locks out any child who chose it`);
  }

  // the silly half has to resolve to a real food, and be marked as silly
  const plain = FOODS.filter((f) => !f.silly), silly = FOODS.filter((f) => f.silly);
  if (!plain.length || !silly.length) fail('avatars', 'the snack list needs both plain and silly foods');
  for (const f of silly) {
    if (!f.base) fail('avatars', `silly food ${f.id} does not say which food it is built on`);
    else if (!plain.some((b) => b.id === f.base)) fail('avatars', `silly food ${f.id} names a base that does not exist`);
    if (!f.id.endsWith(f.base ?? '')) fail('avatars', `silly food ${f.id} does not match its base ${f.base}`);
  }

  /* Every snack as the answer, not one sample. The two properties that keep the
     check worth one in six are easy to break by accident: a decoy of the other
     kind makes the answer the odd one out (the pool is 390 silly to 110 plain, so
     random decoys would do exactly that), and two decoys sharing a base food ask
     a six-year-old to tell "Snowy mochi" from "Tiny mochi" a week later. */
  {
    const prefixOf = (f) => (f.silly ? f.id.slice(0, f.id.length - f.base.length - 1) : '');
    let short = 0, missing = 0, mixed = 0, clashing = 0, samePrefix = 0, ambiguous = 0, unstable = 0;
    for (let i = 0; i < FOODS.length; i++) {
      const prof = { avatar: (i * 7) % AVATAR_COUNT, name: 'Pip', food: FOODS[i].id };
      const ch = foodChoicesFor(prof);
      if (ch.length !== CHECK_DECOYS + 1) short++;
      if (!ch.some((f) => f.id === prof.food)) missing++;
      if (new Set(ch.map((f) => !!f.silly)).size !== 1) mixed++;
      if (new Set(ch.map((f) => f.base ?? f.id)).size !== ch.length) clashing++;
      if (FOODS[i].silly && new Set(ch.map(prefixOf)).size !== ch.length) samePrefix++;
      if (new Set(ch.map((f) => f.name)).size !== ch.length) ambiguous++;
      if (JSON.stringify(foodChoicesFor(prof)) !== JSON.stringify(ch)) unstable++;
    }
    /* Counting the SHORT trays is what caught the prefix rule excluding every
       plain decoy: `prefixOf` is '' for a plain snack, so '' !== '' left 110
       answers alone on the screen with nothing to choose between. */
    if (short) fail('avatars', `${short} snacks offer the wrong number of choices`);
    if (samePrefix) fail('avatars', `${samePrefix} snacks get two choices with the same silly word`);
    if (ambiguous) fail('avatars', `${ambiguous} snacks get two choices that read the same`);
    if (missing) fail('avatars', `${missing} snacks are not among their own choices`);
    if (mixed) fail('avatars', `${mixed} snacks get a tray mixing silly and plain — the answer stands out`);
    if (clashing) fail('avatars', `${clashing} snacks get two choices built on the same food`);
    if (unstable) fail('avatars', `${unstable} snacks change their choices between visits — a child would think it is broken`);
  }

  console.log(`  ${AVATAR_COUNT} avatars · ${CREATURES.length} creatures × ${COLOURWAYS.length} colourways · ${FOODS.length} snacks (${plain.length} plain, ${silly.length} silly) · ${NAME_POOL.length} names`);
}

/* ------------------------------------------------------------------ badges
   The design rule is docs/BADGES.md: a badge states a fact about what the child
   did. The checks below are that rule made executable — most of all that nothing
   is earned for showing up, because a labour badge is both the hollow kind and,
   on the evidence, the kind that undermines motivation in children. */
/* No sheet may print the same item twice.
   There was no per-sheet distinctness test at all, which is how make-ten-race
   shipped ten items with nine distinct ones and halves-and-quarters eight with
   eight. collect() dedups on a key, but the key is only as good as what the
   generator varies: bake a random rotation into printVisual and every repeat
   looks distinct to the machine while reading as a repeat to the child. This
   compares the rendered problem blocks, which is what the child actually sees. */
console.log('\n=== sheet distinctness ===');
{
  const SEEDS = [8817, 4242, 1009, 60613];
  let worst = { n: 0 }, checkedSheets = 0;
  for (const a of activities) {
    for (const seed of SEEDS) {
      for (const mode of ['practice', 'review']) {
        let html;
        try {
          html = sheet({ activity: a, seed, ch: getCharacter('kiwi'), base: '',
            siteUrl: 'https://izzimath.com', style: 'plain', mode, key: false });
        } catch (e) { fail(a.id, `sheet threw (${mode}, seed ${seed}): ${e.message}`); continue; }
        checkedSheets++;
        const items = [...html.matchAll(/<div class="pr">([\s\S]*?)<\/div>\s*<\/div>/g)]
          .map((m) => m[1].replace(/<span class="lbl">[^<]*<\/span>/, '').replace(/\s+/g, ' ').trim())
          .filter((t) => t.length > 8);
        const seen = new Map();
        for (const it of items) seen.set(it, (seen.get(it) ?? 0) + 1);
        const repeats = [...seen.entries()].filter(([, n]) => n > 1);
        if (repeats.length) {
          const n = repeats.reduce((t, [, c]) => t + c - 1, 0);
          if (n > worst.n) worst = { n, id: a.id, mode, seed, sample: repeats[0][0].slice(0, 70) };
          fail(a.id, `${mode} sheet at seed ${seed} prints ${n} repeated item${n > 1 ? 's' : ''}: "${repeats[0][0].slice(0, 60)}"`);
        }
      }
    }
  }
  console.log(`  ${checkedSheets} sheets rendered across ${SEEDS.length} seeds · ${worst.n ? `worst ${worst.n} repeats (${worst.id})` : 'no sheet repeats an item'}`);
}

console.log('\n=== badges ===');
{
  const ids = new Set();
  for (const b of BADGES) {
    const w = `badge:${b.id}`;
    if (ids.has(b.id)) fail(w, 'duplicate id');
    ids.add(b.id);
    if (!b.name) fail(w, 'no name');
    if (!b.says) fail(w, 'no line saying what was done');
    if (!CATEGORIES[b.cat]) fail(w, `category "${b.cat}" does not exist`);
    if (![1, 2, 3].includes(b.rank)) fail(w, `rank ${b.rank} is not 1, 2 or 3`);
    if (typeof b.test !== 'function') fail(w, 'no test');
    /* A badge states a fact, so its line reads as one. Praise words mean the
       framing has slipped from informational to controlling. */
    if (/\b(great|well done|awesome|amazing|good job|congrat)/i.test(b.says))
      fail(w, `"${b.says}" praises rather than states what happened`);
    // and it must render, lit and locked
    if ((badgeSvg(b.id) || '').length < 200) fail(w, 'does not render');
    if ((badgeSvg(b.id, { locked: true }) || '').length < 100) fail(w, 'does not render locked');
    if (!/aria-label="/.test(badgeSvg(b.id))) fail(w, 'no accessible label');
  }

  /* THE important one. A brand-new profile has earned nothing — no badge for
     opening a page, playing a round, or existing. */
  const none = evaluateBadges({}, activities, { characters: new Set() });
  if (none.length) fail('badges', `${none.length} badges earned on an empty profile: ${none.join(', ')}`);

  // one round played, nothing achieved, still nothing earned
  const justPlayed = { 'decade-duel': { activityId: 'decade-duel', plays: 1, bestTier: 0,
    bestStreak: 1, bestRight: 1, rightTotal: 1, printed: 0, fixes: 0, finished: false, pagesDone: 0 } };
  const trivial = evaluateBadges(justPlayed, activities, { characters: new Set(['kiwi']) });
  if (trivial.length) fail('badges', `playing one round with nothing achieved earned: ${trivial.join(', ')}`);

  // a real accomplishment does earn one, and the right one
  const summited = { 'decade-duel': { ...justPlayed['decade-duel'], bestTier: 3 } };
  const got = evaluateBadges(summited, activities, { characters: new Set(['kiwi']) });
  for (const want of ['first-climb', 'hard-ones', 'summit'])
    if (!got.includes(want)) fail('badges', `reaching the top rung did not earn ${want}`);

  // monotonic: more progress never earns FEWER badges
  const more = { ...summited, 'halves-and-quarters': { activityId: 'halves-and-quarters',
    plays: 0, bestTier: 0, bestStreak: 0, bestRight: 0, rightTotal: 8, printed: 1, fixes: 2,
    finished: true, pagesDone: 8 } };
  const after = evaluateBadges(more, activities, { characters: new Set(['kiwi']) });
  if (after.length < got.length) fail('badges', `doing more earned fewer badges (${got.length} -> ${after.length})`);
  if (!got.every((id) => after.includes(id))) fail('badges', 'a badge was lost by doing more');

  // every badge must be reachable — a shelf with an impossible slot never fills
  const maxed = {};
  for (const a of activities) maxed[a.id] = { activityId: a.id, plays: 99, printed: 99,
    pagesDone: 99, bestRight: 99, bestStreak: 99, bestTier: 3, rightTotal: 9999, fixes: 99, finished: true };
  const all = evaluateBadges(maxed, activities, { characters: new Set(['kiwi', 'georgie', 'flame']) });
  const unreachable = BADGES.filter((b) => !all.includes(b.id)).map((b) => b.id);
  if (unreachable.length) fail('badges', `unreachable even with everything done: ${unreachable.join(', ')}`);

  // the shelf shows every badge, earned or not
  const shelf = shelfHtml(['summit']);
  const cells = (shelf.match(/class="bdcell/g) || []).length;
  if (cells !== BADGE_COUNT) fail('badges', `shelf shows ${cells} of ${BADGE_COUNT} badges`);
  if (!/bdcell got/.test(shelf)) fail('badges', 'shelf does not mark an earned badge');

  console.log(`  ${BADGE_COUNT} badges in ${Object.keys(CATEGORIES).length} categories · nothing earned for showing up · all reachable`);
}

/* ---------------------------------------------------------------- profiles */
console.log('\n=== profiles ===');
{
  const store = createStore(nullDriver());
  // the null driver must be genuinely inert: this is the default state, and the
  // default state must store nothing at all
  await store.record('nobody', 'times-table-tower', { played: true });
  if ((await store.listProfiles()).length !== 0) fail('profiles', 'the null driver kept something');

  // progress records are plain JSON, and every field has a declared merge rule
  const blank = blankProgress('x');
  for (const k of Object.keys(blank)) {
    if (['v', 'activityId'].includes(k)) continue;
    if (!MERGE[k]) fail('profiles', `progress field "${k}" has no declared merge rule`);
  }
  if (JSON.parse(JSON.stringify(blank)) === null) fail('profiles', 'progress is not JSON');

  // the merge rules do what they say — this is the spec a Firestore sync follows
  const a = { ...blank, plays: 3, bestRight: 9, finished: false, lastAt: '2026-01-01' };
  const b = { ...blank, plays: 2, bestRight: 4, finished: true, lastAt: '2026-02-01' };
  const m = mergeProgress(a, b);
  if (m.plays !== 5) fail('profiles', `sum-merge gave ${m.plays}, want 5`);
  if (m.bestRight !== 9) fail('profiles', `max-merge gave ${m.bestRight}, want 9 — a device would lose a best score`);
  if (m.finished !== true) fail('profiles', 'or-merge lost a completion');
  if (m.lastAt !== '2026-02-01') fail('profiles', 'latest-merge picked the older timestamp');
  /* The local driver's job is to behave like a document store, because that is
     what makes the Firestore swap a driver change. The subtle part is `list`:
     a collection query returns DIRECT CHILDREN, not everything under the prefix.
     Shimmed here because Node has no localStorage. */
  {
    const mem = new Map();
    globalThis.localStorage = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
    const st = createStore(localDriver('test.key'));
    const p1 = await st.createProfile({ avatar: 3, name: 'Pip', food: 'mango' });
    const p2 = await st.createProfile({ avatar: 90, name: 'Dot', food: 'taco' });
    if (p1.id === p2.id) fail('profiles', 'two profiles got the same id');
    if ((await st.listProfiles()).length !== 2) fail('profiles', 'listProfiles did not return both');

    await st.record(p1.id, 'decade-duel', { played: true, right: 9, streak: 4, tier: 2 });
    await st.record(p1.id, 'decade-duel', { played: true, right: 5, streak: 7 });
    const pr = await st.getProgress(p1.id, 'decade-duel');
    if (pr.plays !== 2) fail('profiles', `plays ${pr.plays}, want 2 (sum)`);
    if (pr.bestRight !== 9) fail('profiles', `bestRight ${pr.bestRight}, want 9 (max, not last)`);
    if (pr.bestStreak !== 7) fail('profiles', `bestStreak ${pr.bestStreak}, want 7`);

    // progress must not leak between profiles
    if ((await st.getProgress(p2.id, 'decade-duel')).plays !== 0)
      fail('profiles', "one profile's progress leaked into another");

    // a collection query returns direct children only
    await st.record(p1.id, 'times-table-tower', { printed: true });
    const all = await st.allProgress(p1.id);
    if (Object.keys(all).length !== 2) fail('profiles', `allProgress returned ${Object.keys(all).length}, want 2`);
    if ((await st.listProfiles()).some((x) => !x.id)) fail('profiles', 'listProfiles returned a non-profile doc — prefix leak');

    // active profile, and sign-out
    await st.setActive(p1.id);
    if ((await st.getActive())?.id !== p1.id) fail('profiles', 'setActive/getActive disagree');
    await st.signOut();
    if (await st.getActive()) fail('profiles', 'signOut left a profile active');

    // deleting a profile takes its progress with it
    await st.deleteProfile(p1.id);
    if (await st.getProfile(p1.id)) fail('profiles', 'deleted profile still readable');
    if (Object.keys(await st.allProgress(p1.id)).length !== 0)
      fail('profiles', 'deleting a profile orphaned its progress');

    // rejects anything a document store could not hold, or that is out of range
    for (const bad of [{ avatar: -1, name: 'x', food: 'mango' }, { avatar: 999, name: 'x', food: 'mango' },
                       { avatar: 1, name: '', food: 'mango' }, { avatar: 1, name: 'x', food: 'nope' }]) {
      let threw = false;
      try { await st.createProfile(bad); } catch { threw = true; }
      if (!threw) fail('profiles', `createProfile accepted ${JSON.stringify(bad)}`);
    }
    delete globalThis.localStorage;
  }
  console.log(`  ${Object.keys(MERGE).length} progress fields, each with a merge rule · both drivers exercised`);
}

/* ------------------------------------------------------------------ ladder
   The adaptive controller is a pure reducer, which is the whole reason it is
   worth testing here rather than in a browser. Each case below is one of the
   four guards from docs/next/04-adaptive-and-spacing.md, because a guard that
   is not tested is a guard that quietly stops working. */
console.log('\n=== adaptive ladder ===');
{
  const A = activities.find((a) => a.adaptive);
  const cfg = ladderConfig(A);
  if (!cfg) fail('ladder', 'no adaptive activity to test against');
  else {
    const feed = (st, outcomes) => outcomes.reduce((acc, ok) => record(cfg, acc, !!ok), st);

    // climbs on a good run
    let st = feed(initState(cfg), [1, 1, 1]);
    if (st.step <= 0) fail('ladder', `three right did not step up (rung ${st.step})`);

    // one rung at a time, never two
    const before = initState(cfg);
    const after = record(cfg, feed(before, [1, 1]), true);
    if (after.step - before.step > 1) fail('ladder', `stepped ${after.step - before.step} rungs at once`);

    // a rung change clears the window, so one signal cannot move it twice
    if (st.history.length !== 0) fail('ladder', 'window not cleared on a rung change');

    // no drop on the first miss
    if (feed(initState(cfg), [0]).step < 0) fail('ladder', 'dropped below the floor on the first item');
    if (feed(initState(cfg), [0, 0]).step < 0) fail('ladder', 'dropped on the second item — one miss is noise');

    // does drop once there is enough evidence
    const sunk = feed(initState(cfg), [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
    if (sunk.step > 0) warn('ladder', `six misses left it on rung ${sunk.step}`);

    // clamped in both directions, and the rungs span the authored range
    const high = feed(initState(cfg), Array(200).fill(1));
    if (high.step !== STEPS - 1) fail('ladder', `climbed to rung ${high.step} of ${STEPS - 1}`);
    if (high.level !== cfg.to) fail('ladder', `top rung serves index ${high.level}, not the authored ceiling ${cfg.to}`);
    const low = feed(initState(cfg), Array(200).fill(0));
    if (low.step !== 0 || low.level !== cfg.from) fail('ladder', `sank to rung ${low.step}/index ${low.level}`);

    /* The top rung has to be REACHABLE inside one game, or depth is a goal
       nobody can meet — which is exactly the bug the first build shipped. */
    const rounds = A.rounds ?? 12;
    const perfect = feed(initState(cfg), Array(rounds).fill(1));
    if (!atTop(perfect)) fail('ladder', `${rounds} perfect rounds only reach rung ${perfect.step} of ${STEPS - 1} — the top is unreachable`);

    // tiers are words, one per rung, never a number
    for (let k = 0; k < STEPS; k++) {
      const t = tierFor(cfg, k);
      if (!t.name || /\d/.test(t.name)) fail('ladder', `rung ${k} tier is not a word: "${t.name}"`);
    }
    if (TIERS.length !== STEPS) fail('ladder', `${TIERS.length} tier names for ${STEPS} rungs — they must pair up`);
    if (!atTop(high)) fail('ladder', 'atTop false at the top rung');

    // state is serialisable and versioned, for the account migration
    const round = JSON.parse(JSON.stringify(high));
    if (round.v !== LADDER_V) fail('ladder', 'state is not versioned');
    if (JSON.stringify(round) !== JSON.stringify(high)) fail('ladder', 'state does not survive JSON round-trip');
  }

  // every adaptive activity must declare a usable range, and only games adapt
  let n = 0;
  for (const a of activities) {
    if (!a.adaptive) continue;
    n++;
    const w = `adaptive:${a.id}`;
    const c = ladderConfig(a);
    const total = a.rounds ?? a.pages ?? 0;
    if (a.kind !== 'game') fail(w, `only games adapt for now — this is a ${a.kind}`);
    if (c.from < 0) fail(w, `floor ${c.from} is below zero`);
    if (c.to >= total) fail(w, `ceiling ${c.to} is outside the ${total} rounds authored`);
    if (c.to - c.from < 3) fail(w, `range ${c.from}-${c.to} is too short to be a ladder`);
    if (!(c.up > c.down)) fail(w, `step-up rate ${c.up} is not above step-down rate ${c.down}`);
  }
  console.log(`  ${n} adaptive activities · ${activities.filter((a) => a.kind === 'game').length - n} left on fixed ladders`);
}

/* -------------------------------------------------------------------- plans
   A plan holds no problems of its own — it is entirely pointers. So the only
   thing that can break it is a pointer, and that is what gets checked: every
   activity a plan names must exist, every game slot must actually be a game,
   every book slot a book, and every SSDD reference a real set. A plan whose
   links have rotted is worse than no plan. */
console.log('\n=== plans ===');
{
  const byId = new Map(activities.map((a) => [a.id, a]));
  const ssddIds = new Set(ssddSets.map((x) => x.id));
  for (const plan of plans) {
    const w0 = `plan:${plan.id}`;
    for (const f of ['id', 'title', 'grade', 'weeks', 'blurb', 'credit']) {
      if (!plan[f]) fail(w0, `missing ${f}`);
    }
    if (!GRADES.includes(plan.grade)) fail(w0, 'bad grade', plan.grade);
    if (!getRef(plan.credit)) fail(w0, `credit "${plan.credit}" is not a reference id`);
    if (plan.schedule.length !== plan.weeks)
      fail(w0, `says ${plan.weeks} weeks but the schedule has ${plan.schedule.length}`);
    plan.schedule.forEach((wk, i) => {
      const w = `${w0}#wk${wk.n}`;
      if (wk.n !== i + 1) fail(w, `weeks out of order — index ${i} is numbered ${wk.n}`);
      if (!wk.focus) fail(w, 'no focus');
      if (!wk.warmUp?.text) fail(w, 'no warm-up problem');
      if (wk.warmUp?.schema && !SCHEMAS[wk.warmUp.schema])
        fail(w, `warm-up schema "${wk.warmUp.schema}" is not a CGI schema`);
      // the four parts must all be there, and be the right KIND of thing
      const inst = byId.get(wk.instruction?.activity);
      if (!inst) fail(w, `instruction points at "${wk.instruction?.activity}", which does not exist`);
      else if (inst.kind !== 'book') fail(w, `instruction points at a ${inst.kind}, not a book`);
      const gm = byId.get(wk.game?.activity);
      if (!gm) fail(w, `game points at "${wk.game?.activity}", which does not exist`);
      else if (gm.kind !== 'game') fail(w, `game points at a ${gm.kind}, not a game`);
      if (!byId.get(wk.sheet?.activity)) fail(w, `sheet points at "${wk.sheet?.activity}", which does not exist`);
      if (wk.sheet?.mode && !['practice', 'review'].includes(wk.sheet.mode))
        fail(w, `sheet mode "${wk.sheet.mode}" is not a print mode`);
      if (wk.ssdd && !ssddIds.has(wk.ssdd)) fail(w, `ssdd "${wk.ssdd}" is not a set`);
    });
    console.log(`  ${plan.id}: ${plan.weeks} weeks · ${planActivityIds(plan).length} activities referenced · all resolve`);
  }
  if (FOUR_PART.length !== 4) fail('plans', `the four-part lesson has ${FOUR_PART.length} parts`);
}

/* --------------------------------------------------------------------- ssdd
   An SSDD set is only doing its job if the four questions genuinely need
   DIFFERENT methods. A set where two items share a procedure is a normal
   worksheet wearing the format's clothes, so that is the thing to check. */
console.log('\n=== ssdd sheets ===');
{
  const seen = new Set();
  for (const set of ssddSets) {
    const w = `ssdd:${set.id}`;
    for (const f of ['id', 'grade', 'title', 'strand', 'surface', 'notice']) {
      if (!set[f]) fail(w, `missing ${f}`);
    }
    if (seen.has(set.id)) fail(w, 'duplicate id');
    seen.add(set.id);
    if (!GRADES.includes(set.grade)) fail(w, 'bad grade', set.grade);
    if (!STRANDS[set.grade]?.includes(set.strand)) warn(w, 'strand not in strands.js', set.strand);
    if (!Array.isArray(set.items) || set.items.length !== 4)
      fail(w, `SSDD is four items by definition, found ${set.items?.length}`);
    const procs = new Set();
    for (const [i, it] of (set.items || []).entries()) {
      const wi = `${w}#${i}`;
      if (!it.ask) fail(wi, 'no question');
      if (it.answer === undefined || it.answer === '') fail(wi, 'no answer');
      if (!it.explain) fail(wi, 'no worked explanation');
      if (!it.procedure) fail(wi, 'no named procedure — the key has nothing to teach from');
      if (it.procedure) procs.add(it.procedure.trim().toLowerCase());
    }
    if (procs.size !== (set.items || []).length)
      fail(w, `procedures repeat (${procs.size} distinct for ${set.items.length} items) — same surface, but not different deep`);
  }
  console.log(`  ${ssddSets.length} sets · ${ssddSets.length * 4} questions · one per grade`);
  for (const g of GRADES) {
    if (!ssddSets.some((x) => x.grade === g)) warn('ssdd', `no set for grade ${g}`);
  }
}

for (const a of activities) {
  const n = a.pages ?? a.rounds ?? 10;
  for (const cid of CHARS) {
    const ch = getCharacter(cid);
    for (let i = 0; i < n; i++) {
      const sd = deriveSeed(8817, `p${i}`);
      let p;
      try { p = a.generate(sd, i, ch, rng(sd), 8817); }
      catch (e) { fail(a.id, `ch=${cid} i=${i} threw:`, e.message); continue; }
      checked++;
      if (!p || typeof p !== 'object') { fail(a.id, `ch=${cid} i=${i} returned`, typeof p); continue; }
      if (!TYPES.includes(p.type)) fail(a.id, `i=${i} unknown type`, p.type);

      const blob = JSON.stringify(p);
      if (blob.includes('undefined')) fail(a.id, `ch=${cid} i=${i} "undefined" in payload`);
      if (blob.includes('NaN')) fail(a.id, `ch=${cid} i=${i} NaN in payload`);
      if (/\{[a-zA-Z][\w.]*\}/.test(String(p.prompt || '')) ) fail(a.id, `i=${i} unfilled template slot in prompt: ${p.prompt}`);

      // determinism: same seed must give the same problem
      const again = a.generate(sd, i, ch, rng(sd), 8817);
      if (JSON.stringify(again) !== blob) fail(a.id, `ch=${cid} i=${i} NOT deterministic`);

      // type-specific
      if (p.type === 'choice' || (p.type === 'bond' && p.choices)) {
        if (!p.choices?.length) fail(a.id, `i=${i} choice with no choices`);
        else {
          const cs = p.choices.map(String);
          if (!cs.includes(String(p.answer))) fail(a.id, `i=${i} answer ${p.answer} not in choices ${JSON.stringify(cs)}`);
          if (new Set(cs).size !== cs.length) fail(a.id, `i=${i} duplicate choices ${JSON.stringify(cs)}`);
          /* Two options can differ as strings and still be the same NUMBER, which
             makes a distractor a second right answer. cmpF has been imported here
             since fractions arrived and never called; this is what it was for.
             A proposal reached review offering "3/4 + 1/8" as a wrong way to make
             7/8, and nothing in the build would have objected. */
          for (let x = 0; x < cs.length; x++) {
            for (let y = x + 1; y < cs.length; y++) {
              const fx = parseAnswer(cs[x]), fy = parseAnswer(cs[y]);
              if (fx && fy && cmpF(fx, fy) === 0) {
                fail(a.id, `i=${i} choices ${JSON.stringify(cs[x])} and ${JSON.stringify(cs[y])} are the same value`);
              }
            }
          }
          if (cs.length < 2) fail(a.id, `i=${i} only ${cs.length} choice`);
        }
      }
      if (p.type === 'compare') {
        if (p.left === p.right) fail(a.id, `i=${i} equal compare pair (${p.left})`);
        // Operands can be plain numbers or fraction strings ("3/4"), so resolve
        // both through the fraction parser before comparing.
        const val = (v) => {
          const n = Number(v);
          if (Number.isFinite(n)) return n;
          const f = parseAnswer(String(v));
          return f ? f.n / f.d : NaN;
        };
        const lv = val(p.left), rv = val(p.right);
        if (!Number.isFinite(lv) || !Number.isFinite(rv)) fail(a.id, `i=${i} compare operand unparseable (${p.left} / ${p.right})`);
        else if (lv === rv) fail(a.id, `i=${i} compare operands equal in value (${p.left} = ${p.right})`);
        else {
          const want = lv > rv ? 'left' : 'right';
          if (p.answer !== want) fail(a.id, `i=${i} compare answer ${p.answer} but ${p.left} vs ${p.right}`);
        }
      }
      if (p.type === 'numberline') {
        if (!(p.target >= p.lo && p.target <= p.hi)) fail(a.id, `i=${i} target ${p.target} outside [${p.lo},${p.hi}]`);
      }
      if (p.type === 'input') {
        if (p.answer === undefined || p.answer === '') fail(a.id, `i=${i} input with no answer`);
        if (p.accept === 'fraction') {
          const parsed = parseAnswer(String(p.answer));
          if (!parsed) fail(a.id, `i=${i} fraction answer unparseable: ${p.answer}`);
        }
      }
      // The spec treats this as a ship-blocker, and it is the single largest
      // effect in the feedback literature: elaborated feedback g=0.49 against
      // g=0.05 for bare right/wrong. An activity without a worked explanation
      // on every problem is incomplete.
      if (!p.explain) fail(a.id, `i=${i} no explain — every problem needs a worked explanation`);
      if (p.explain && String(p.explain).trim().length < 4) fail(a.id, `i=${i} explain too short: ${p.explain}`);

      // word problems must name a known schema and read as a sentence
      if (p.schema) {
        if (!SCHEMAS[p.schema]) fail(a.id, `i=${i} unknown word-problem schema "${p.schema}"`);
        const stem = String(p.prompt || '');
        if (!/[?.]$/.test(stem.trim())) fail(a.id, `i=${i} word problem does not end in punctuation: ${stem}`);
        if (!/^[A-Z]/.test(stem.trim())) fail(a.id, `i=${i} word problem does not start capitalised: ${stem}`);
        if (/\b(\w+)s\s+\1/.test(stem)) warn(a.id, `i=${i} possible doubled word: ${stem}`);
        if (/ (gives away|eats) \?/.test(stem)) fail(a.id, `i=${i} malformed verb slot: ${stem}`);
      }
      if (p.type === 'bond') {
        /* Both of these were plain JS coercions, which is fine while every part
           is a whole number and silently wrong the moment one is a fraction:
           '2/6' + '3/6' string-concatenates to "2/63/6", and Number('2/6') is
           NaN, so `NaN !== NaN` made the answer check pass for anything.

           parseRaw, not parseAnswer: the sum is checked by value (2/6 + 3/6 does
           equal 5/6), but the ANSWER is checked denominator-strict, because a
           book about pieces not changing size must not accept 1/2 for 3/6. */
        const parts = { whole: p.whole, a: p.a, b: p.b };
        const pa = parseRaw(String(p.a)), pb = parseRaw(String(p.b)), pw = parseRaw(String(p.whole));
        if (!pa || !pb || !pw) {
          fail(a.id, `i=${i} bond part is not a number or a fraction: ${JSON.stringify([p.whole, p.a, p.b])}`);
        } else if (cmpF(simplify(frac(pa.n * pb.d + pb.n * pa.d, pa.d * pb.d)), simplify(pw)) !== 0) {
          fail(a.id, `i=${i} bond ${p.a} + ${p.b} != ${p.whole}`);
        }
        const want = parseRaw(String(parts[p.blank])), got = parseRaw(String(p.answer));
        if (!want || !got || want.n !== got.n || want.d !== got.d) {
          fail(a.id, `i=${i} bond answer ${p.answer} != blank part ${parts[p.blank]} (denominator-strict)`);
        }
      }

      // the stated answer must actually pass the checker
      /* If a problem provides a figure, the figure must reach the paper. The
         truefalse print case dropped printVisual silently, which made a grade-1
         item unanswerable on the sheet while every check stayed green. This is
         type-agnostic on purpose: the next type to grow a figure gets it free. */
      if (p.printVisual) {
        for (const asKey of [false, true]) {
          const out = printProblem(p, i, { key: asKey });
          if (!out.includes(p.printVisual)) {
            fail(a.id, `i=${i} printVisual is dropped from the ${asKey ? 'key' : 'sheet'} (${p.type})`);
          }
        }
      }

      /* boardmove needs a STRUCTURAL check, not a round trip. isCorrect compares
         the response element-wise against problem.answer, so feeding the answer
         back to itself passes for any array whatsoever — the round trip below
         catches only a non-array answer, which is worth having but is not the
         thing that matters.

         What matters is that the squares are the ones you COUNT ON to. Laski &
         Siegler (2014) found counting on produced roughly double the gains of
         counting from one, and great-race's own evidence field says so; if the
         sequence ever started at 1 instead of at the token, the activity would
         still pass every check while teaching the thing the citation warns
         against. */
      if (p.type === 'boardmove') {
        const want = [];
        for (let k = 1; k <= p.spin; k++) want.push(p.from + k);
        if (!Array.isArray(p.answer)) fail(a.id, `i=${i} boardmove answer is not an array`);
        else if (p.answer.length !== p.spin) {
          fail(a.id, `i=${i} boardmove moves ${p.answer.length} squares on a spin of ${p.spin}`);
        } else if (p.answer.some((v, k) => Number(v) !== want[k])) {
          fail(a.id, `i=${i} boardmove counts ${JSON.stringify(p.answer)} from ${p.from}, not on: want ${JSON.stringify(want)}`);
        } else if (p.hi !== undefined && p.answer[p.answer.length - 1] > p.hi) {
          fail(a.id, `i=${i} boardmove runs past the last square (${p.answer[p.answer.length - 1]} > ${p.hi})`);
        }
      }

      // and the round trip, which for boardmove catches a non-array answer only
      if (['choice', 'compare', 'truefalse', 'tap', 'ordinal', 'bond', 'boardmove'].includes(p.type)) {
        const resp = p.type === 'compare' ? p.answer
          : p.type === 'truefalse' ? p.answer
          : p.type === 'tap' || p.type === 'ordinal' ? (p.answer ?? p.n)
          : p.answer;
        if (isCorrect(p, resp) !== true) fail(a.id, `i=${i} own answer fails isCorrect (${p.type}, ${JSON.stringify(resp)})`);
      }
      if (p.type === 'input' && p.accept !== 'fraction') {
        if (isCorrect(p, p.answer) !== true) fail(a.id, `i=${i} own input answer fails isCorrect (${p.answer})`);
      }
      if (p.type === 'numberline') {
        if (isCorrect(p, p.target) !== true) fail(a.id, `i=${i} own target fails isCorrect`);
      }
    }
  }
}

console.log(`\n=== manipulatives must not vary by character ===`);
// Petersen & McNeil: perceptually rich, highly familiar objects HELP children who
// don't know the object and HURT children who do — a child who loves Georgie thinks
// about tennis balls instead of quantity. So characters own the word-problem nouns,
// the palette and the voice, but the countable units inside a manipulative stay
// plain and identical for everyone.
{
  let varied = 0;
  for (const a of activities) {
    const n = a.pages ?? a.rounds ?? 8;
    for (let i = 0; i < n; i++) {
      const sd = deriveSeed(8817, `p${i}`);
      const seen = new Map();
      for (const cid of CHARS) {
        const p = a.generate(sd, i, getCharacter(cid), rng(sd), 8817);
        seen.set(cid, String(p.visual ?? '') + '\u0000' + String(p.printVisual ?? ''));
      }
      const distinct = new Set(seen.values());
      if (distinct.size > 1) {
        fail(a.id, `i=${i} manipulative differs by character (${distinct.size} variants) — countable units must stay plain`);
        varied++;
      }
    }
  }
  if (!varied) console.log('  ok    every manipulative is identical across all 4 characters');
}

console.log(`\n=== print sheets (sheet + answer key, all characters) ===`);
for (const a of activities) {
  for (const cid of CHARS) {
    const ch = getCharacter(cid);
    for (const key of [false, true]) {
      try {
        const html = sheet({ activity: a, seed: 8817, ch, base: '', siteUrl: 'https://example.org', key });
        if (!html || html.length < 400) fail(a.id, `${cid} key=${key} sheet suspiciously short (${html?.length})`);
        if (html.includes('undefined')) fail(a.id, `${cid} key=${key} "undefined" in sheet`);
        if (html.includes('NaN')) fail(a.id, `${cid} key=${key} NaN in sheet`);
        if (/\{[a-zA-Z][\w.]*\}/.test(html.replace(/\{[^}]*:[^}]*\}/g, ''))) {
          const m = html.match(/\{[a-zA-Z][\w.]*\}/);
          if (m) fail(a.id, `${cid} unfilled slot in sheet: ${m[0]}`);
        }
      } catch (e) { fail(a.id, `${cid} key=${key} sheet threw:`, e.message); }
    }
  }
}

/* The worked example renders its item AS A KEY and then prints `explain`
   underneath. An item carrying printKeyWorking already printed that sentence
   inside the box, so the panel showed it twice — four-ways-to-subtract shipped
   like that, on every grouped-practice sheet, and nothing here could see it.
   This reads the rendered panel and refuses any sentence that appears twice. */
console.log('\n=== worked example says each thing once ===');
{
  let panels = 0, bad = 0;
  for (const a of activities) {
    const html = sheet({ activity: a, seed: 8817, ch: getCharacter('kiwi'), base: '',
      siteUrl: 'https://example.org', style: 'designed', mode: 'practice', key: false });
    const m = html.match(/<div class="sh-example">([\s\S]*?)<p class="ex-next">/);
    if (!m) continue;                    // this activity's first block gets no panel
    panels++;
    const seen = new Map();
    for (const part of m[1].replace(/<[^>]+>/g, '|').split('|').map((x) => x.trim())) {
      if (part.length < 26) continue;
      seen.set(part, (seen.get(part) ?? 0) + 1);
    }
    for (const [part, n] of seen) {
      if (n > 1) { bad++; fail(a.id, `worked example prints the same sentence ${n} times: "${part.slice(0, 60)}…"`); }
    }
  }
  // Not "none repeating themselves" when some are — a summary line that
  // contradicts the failures above it is worse than no summary line.
  console.log(`  ${panels} worked-example panels, ${bad ? `${bad} repeating themselves` : 'none repeating themselves'}`);
}

console.log(`\n=== references and curriculum wiring ===`);
{
  // every reference must be well formed
  for (const id of refIds) {
    const r = getRef(id);
    for (const f of ['authors', 'year', 'title', 'venue', 'kind', 'strength', 'finding', 'use'])
      if (!r[f]) fail(`ref:${id}`, 'missing ' + f);
    if (!STRENGTH[r.strength]) fail(`ref:${id}`, 'unknown strength ' + r.strength);
    if (!KINDS[r.kind]) fail(`ref:${id}`, 'unknown kind ' + r.kind);
    if (!r.url && !r.doi) fail(`ref:${id}`, 'no url or doi');
    // appliesTo must name real activities, or the link silently disappears
    for (const aid of r.appliesTo || []) {
      if (!activities.some((a) => a.id === aid)) fail(`ref:${id}`, `appliesTo names unknown activity "${aid}"`);
    }
    for (const entry of r.showsUpIn || []) {
      if (!Array.isArray(entry) || entry.length !== 2) fail(`ref:${id}`, 'showsUpIn entries must be [url, label]');
      else if (!String(entry[0]).startsWith('/')) fail(`ref:${id}`, `showsUpIn url must be site-relative: ${entry[0]}`);
    }
    // Every reference needs at least one route into the site, so a reader can
    // always get from the evidence to the thing built on it.
    const citedBy = (buildReverseIndex(activities)[id] || []).length;
    if (!citedBy && !(r.appliesTo || []).length && !(r.showsUpIn || []).length) {
      fail(`ref:${id}`, 'no route into the site — needs an activity citing it, appliesTo, or showsUpIn');
    }
  }
  // every activity must cite something real and sit in a real IM unit
  for (const a of activities) {
    if (!a.refs?.length) fail(a.id, 'no refs');
    if (!a.im?.length) fail(a.id, 'no IM unit');
    if (!a.theory) fail(a.id, 'no theory line');
    for (const id of a.refs || []) if (!getRef(id)) fail(a.id, 'unknown ref ' + id);
    for (const n of a.im || []) if (!imUnit(a.grade, n)) fail(a.id, `IM unit ${n} does not exist for grade ${a.grade}`);
    if (new Set(a.refs).size !== a.refs.length) fail(a.id, 'duplicate refs');
  }
  // no activity-scope reference should be unused
  const rev = buildReverseIndex(activities);
  for (const id of refIds) {
    if (!isSiteScope(id) && !(rev[id] || []).length)
      fail(`ref:${id}`, 'activity-scope reference cited by no activity (mark scope:"site" if intended)');
  }
  const routed = refIds.filter((id) => (rev[id] || []).length || (getRef(id).appliesTo || []).length || (getRef(id).showsUpIn || []).length);
  console.log(`  ok    ${routed.length}/${refIds.length} references have a route into the site`);
  const units = Object.values(IM_UNITS).reduce((n, u) => n + u.length, 0);
  console.log(`  ok    ${refIds.length} references (${refIds.filter((i) => !isSiteScope(i)).length} activity-scope, ${refIds.filter(isSiteScope).length} site-scope)`);
  console.log(`  ok    ${units} IM units mapped; every activity cites >=1 source and >=1 unit`);
}

console.log(`\n=== ROAM coverage ===`);
const subs = allSubscales();
for (const s of subs) {
  const hits = activities.filter((a) => (a.roam || []).some((l) => l.task === s.task && l.subscale === s.id));
  if (!hits.length) fail(`NO activity covers ${s.task}:${s.id} (${s.name})`);
  else console.log(`  ok    ${(s.task + ':' + s.id).padEnd(28)} ${String(hits.length).padStart(2)} activit${hits.length === 1 ? 'y' : 'ies'}`);
}

/* Badge glyph legibility, per character.
   A badge glyph is drawn in --bi-<accent> on a disc filled with that accent, and
   both sides change with the character. Twice now a fixed foreground has been
   written onto a per-character background and gone out looking fine on the one
   character it was authored against (--onsp, then this). So measure it: composite
   the disc over the page and check the glyph against the worst point.
   3:1 is the WCAG floor for a graphical object, which is what the glyph is: the
   badge's name is always present as real text beside it. So 3:1 fails and 3.5:1
   warns — a margin, not a second standard. Warning at the 4.5 text threshold
   would have flagged five pairs that are fine and left standing noise, which is
   the failure mode a11y.mjs just had. */
/* Character levels — the gear a character puts on as badges accumulate. */
/* Counts written into the docs, checked against the code.

   Prose is the one thing in this repo nothing verified, and it drifts every time
   the catalogue grows. In one session the printing notes said "Six of the
   forty-one sheets" on all 43 print pages, the README said 41 activities when
   there were 45, and two files disagreed with each other about how many pages the
   responsive audit covers. A doc that states a wrong number is worse than one
   that states none, because it gets believed.

   Only claims about the CURRENT build are listed. docs/SPEC.md is the research
   output kept verbatim and its numbers are the spec's, not the repo's. */
console.log('\n=== documented counts ===');
{
  const auditPages = (() => {
    const h = fs.readFileSync(new URL('../tools/audit.html', import.meta.url), 'utf8');
    const m = h.match(/const PAGES = \[([\s\S]*?)\n\];/);
    return m ? [...m[1].matchAll(/\['([^']+)'/g)].length : 0;
  })();
  const truth = {
    routines: ROUTINE_IDS.length,
    routineTotal: 10,          // IM ships ten; this one is the target, not the code
    quads: WODB_QUAD_COUNT,
    ladders: LADDER_COUNT,
    activities: activities.length,
    books: activities.filter((a) => a.kind === 'book').length,
    games: activities.filter((a) => a.kind === 'game').length,
    badges: BADGE_COUNT,
    snacks: FOODS.length,
    avatars: AVATAR_COUNT,
    auditPages,
  };
  const CLAIMS = [
    ['README.md', /(\d+) activities across K–5 — (\d+) books and (\d+) games/, ['activities', 'books', 'games']],
    ['docs/next/README.md', /\| Activities \| (\d+) — (\d+) books, (\d+) games/, ['activities', 'books', 'games']],
    ['docs/DISCOVERY.md', /`(\d+) books`, `(\d+) games`, `(\d+) activities`, `(\d+)\s*\n?\s*badges`/, ['books', 'games', 'activities', 'badges']],
    ['CLAUDE.md', /responsive audit\*\* \((\d+) pages × \d+ widths/, ['auditPages']],
    ['tools/README.md', /responsive audit\. (\d+) pages ×/, ['auditPages']],
    ['docs/next/01-lesson-structure.md',
      /\*\*(\d+) of (\d+) routines\*\* built, from (\d+) defensible quadruples and (\d+)\s*\n?perturbation ladders/,
      ['routines', 'routineTotal', 'quads', 'ladders']],
  ];
  let checkedClaims = 0;
  for (const [file, re, keys] of CLAIMS) {
    let text;
    try { text = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'); }
    catch { fail(`docs: cannot read ${file}`); continue; }
    const m = text.match(re);
    if (!m) { fail(`docs: ${file} no longer states its counts in the form this check knows — reword the check or the doc, do not drop it`); continue; }
    keys.forEach((k, i) => {
      checkedClaims++;
      if (Number(m[i + 1]) !== truth[k]) {
        fail(`docs: ${file} says ${m[i + 1]} ${k}, the code says ${truth[k]}`);
      }
    });
  }
  console.log(`  ${checkedClaims} documented counts agree with the code across ${CLAIMS.length} files`);
}

/* An activity field swallowed by a trailing `//` comment is invisible: the file
   still parses, the object is still valid, and the field is simply gone. It
   happened to NINE activities here — a bulk edit that inserted
   `printMaxPages: n,  // note` ate the newline before `seconds:`, so three
   number-line games silently offered the timer their author had switched off.
   Nothing caught it, because a missing optional field looks exactly like a
   field that was never authored. This reads the SOURCE, which is the only place
   the evidence survives. */
console.log('\n=== fields swallowed by comments ===');
{
  const FIELDS = ['seconds', 'timerAvailable', 'printItems', 'printPages', 'printMaxPages',
    'printDensity', 'printScratch', 'printInstruction', 'rounds', 'pages', 'adaptive', 'glyph'];
  const re = new RegExp(`//[^\\n]*\\b(${FIELDS.join('|')})\\s*:`);
  const files = ['content/activities/grade-k.js', 'content/activities/grade-1.js',
    'content/activities/grade-2.js', 'content/activities/grade-3.js',
    'content/activities/grade-4.js', 'content/activities/grade-5.js'];
  let lines = 0;
  for (const file of files) {
    const text = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    text.split('\n').forEach((ln, i) => {
      lines++;
      const m = ln.match(re);
      if (m) fail(`${file}:${i + 1} has \`${m[1]}:\` inside a comment — a field was swallowed by the note beside it`);
    });
  }
  console.log(`  ${lines} lines of activity source, no field lost inside a comment`);
}

/* ---------------------------------------------------------- warm-up routines
   IM's warm-up is the one shape this build was missing, and two of its rules are
   the whole difference between a routine and a warm-up worksheet: a string
   changes exactly one thing at a time, and it CLOSES WITH A COMPARE QUESTION
   rather than "any questions?". Both are asserted here.

   The arithmetic and the Which-One-Doesn't-Belong defences are recomputed from
   the numbers by this file's own predicates, not by calling back into
   content/routines.js — asking a generator to confirm its own output is the
   tautology this repo keeps catching itself in. A routine that grows a new
   property will fail here until this list is taught it, which is the intended
   direction: the check should not silently accept a claim it cannot verify. */
/* A printed stem cannot ask for more numbers than its answer key supplies.
   tens-and-ones asked "28 has ____ tens and ____ ones." and the key printed
   "2" — one value against two blanks, so the second blank had nothing to check
   it against, on every sheet that item ever appeared on. close-to-hundred and
   standard-algorithm both have two-blank stems and answer both, which is why
   the rule counts values rather than banning the second blank. */
console.log('\n=== printed blanks the key can fill ===');
{
  let stems = 0, blanked = 0;
  for (const a of activities) {
    const n = a.pages ?? a.rounds ?? 10;
    for (let i = 0; i < n; i++) {
      const sd = deriveSeed(8817, `p${i}`);
      let p;
      try { p = a.generate(sd, i, getCharacter('kiwi'), rng(sd), 8817); } catch { continue; }
      const stem = String(p.printStem ?? '');
      if (!stem) continue;
      stems++;
      const blanks = (stem.match(/_{2,}/g) ?? []).length;
      if (!blanks) continue;
      blanked++;
      // A non-numeric answer (True, "one half", "4 boxes of 6") is one value.
      const values = (answerText(p).match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g) ?? []).length || 1;
      if (blanks > values) {
        fail(a.id, `i=${i} printed stem has ${blanks} blanks but the key supplies ${
          values} value${values === 1 ? '' : 's'}: "${stem}" -> "${answerText(p)}"`);
      }
    }
  }
  console.log(`  ${stems} printed stems, ${blanked} with blanks, every blank answerable from the key`);
}

console.log('\n=== warm-up routines ===');
{
  const CLAIMS = [
    ['it is the only even one', (n) => n % 2 === 0],
    ['it is the only odd one', (n) => n % 2 === 1],
    ['it is the only one with no ones left over', (n) => n % 10 === 0],
    ['it is the only one whose two digits are the same', (n) => ((n / 10) | 0) === n % 10],
    ['it is the only one with more tens than ones', (n) => ((n / 10) | 0) > n % 10],
    ['it is the only one with more ones than tens', (n) => ((n / 10) | 0) < n % 10],
    ['it is the only one whose digits add up to ten', (n) => ((n / 10) | 0) + (n % 10) === 10],
    ['it is the only one you can split into two equal piles of tens', (n) => n % 20 === 0],
  ];
  const claimTest = new Map(CLAIMS);

  // The renderer decides which uis exist; a routine declaring one it does not
  // implement would render a blank warm-up.
  const uiSrc = fs.readFileSync(new URL('../src/engine/routine.js', import.meta.url), 'utf8');
  const uiMatch = uiSrc.match(/const UIS = \{([^}]*)\}/);
  const UIS = uiMatch ? [...uiMatch[1].matchAll(/(\w+)\s*:/g)].map((m) => m[1]) : [];
  if (!UIS.length) fail('routines', 'could not read the ui registry out of src/engine/routine.js');
  for (const id of ROUTINE_IDS) {
    const r = ROUTINES[id];
    for (const f of ['name', 'ui', 'blurb', 'build']) if (!r[f]) fail(`routine:${id}`, 'missing ' + f);
    if (r.ui && !UIS.includes(r.ui)) fail(`routine:${id}`, `ui "${r.ui}" has no renderer (have: ${UIS.join(', ')})`);
  }

  const withWarmUp = activities.filter((a) => a.warmUp);
  let built = 0, oracled = 0;
  for (const a of withWarmUp) {
    if (!ROUTINES[a.warmUp.routine]) {
      fail(a.id, `warmUp names an unknown routine "${a.warmUp.routine}"`);
      continue;
    }
    for (const seed of [8817, 1, 7, 99, 4242, 31337]) {
      const sd = deriveSeed(seed, 'warmup');
      // A routine is chrome-free maths: it must not vary by character, for the
      // same reason a manipulative must not.
      const perChar = CHARS.map((cid) => JSON.stringify(warmUpFor(a, rng(sd), getCharacter(cid))));
      if (new Set(perChar).size !== 1) fail(a.id, `warm-up differs by character at seed ${seed}`);
      // And it must be a function of the seed, or a printed warm-up and the
      // screen would disagree.
      if (JSON.stringify(warmUpFor(a, rng(sd))) !== perChar[0])
        fail(a.id, `warm-up is not deterministic at seed ${seed}`);

      const w = warmUpFor(a, rng(sd));
      built++;
      if (!w) { fail(a.id, `warm-up built nothing at seed ${seed}`); continue; }
      for (const f of ['name', 'ui', 'intro', 'close']) if (!w[f]) fail(a.id, `warm-up missing ${f}`);
      if (!w.close?.prompt) fail(a.id, 'warm-up does not close with a question');
      if (!w.close?.synthesis) fail(a.id, 'warm-up closes with a question it cannot answer — no synthesis');

      if (w.ui === 'reveal') {
        if (w.steps?.length !== 4) fail(a.id, `string has ${w.steps?.length} steps, IM strings have 4`);
        const ops = [];
        for (const st of w.steps ?? []) {
          if (!st.explain) fail(a.id, `step "${st.expr}" has no explanation`);
          const m = String(st.expr).match(/^(\d+)\s*([+−-])\s*(\d+)$/);
          if (!m) { fail(a.id, `step "${st.expr}" is not an expression this check can verify`); continue; }
          const x = Number(m[1]), y = Number(m[3]);
          const truth = m[2] === '+' ? x + y : x - y;
          oracled++;
          if (st.answer !== truth) fail(a.id, `step "${st.expr}" claims ${st.answer}, the arithmetic says ${truth}`);
          ops.push([x, y]);
        }
        /* The perturbation ladder: the four come in two pairs, and inside a pair
           exactly ONE operand moves. That is the rule that makes the closing
           comparison answerable — if both numbers changed there is nothing to
           compare. */
        for (const [p, q] of [[0, 1], [2, 3]]) {
          if (!ops[p] || !ops[q]) continue;
          const same = (ops[p][0] === ops[q][0] ? 1 : 0) + (ops[p][1] === ops[q][1] ? 1 : 0);
          if (same !== 1) fail(a.id, `steps ${p + 1} and ${q + 1} (${w.steps[p].expr} / ${w.steps[q].expr}) change ${
            same === 2 ? 'nothing' : 'both numbers'} — a string changes exactly one thing`);
        }
        const [i, j] = w.close.compare ?? [];
        if (!(Number.isInteger(i) && Number.isInteger(j) && i !== j && i >= 0 && j < w.steps.length))
          fail(a.id, `close.compare ${JSON.stringify(w.close.compare)} does not name two of the four steps`);
        else for (const k of [i, j]) {
          if (!w.close.prompt.includes(w.steps[k].expr))
            fail(a.id, `the closing question does not quote step ${k + 1} (${w.steps[k].expr}) that it compares`);
        }
      }

      if (w.ui === 'grid') {
        const items = w.items ?? [];
        if (items.length !== 4) fail(a.id, `Which One Doesn't Belong has ${items.length} items, not 4`);
        if (new Set(items.map((it) => it.label)).size !== items.length)
          fail(a.id, 'two items in the grid are the same');
        const nums = items.map((it) => Number(it.label));
        items.forEach((it, k) => {
          if (!it.why) { fail(a.id, `item ${it.label} has no defence — every one of the four must be defensible`); return; }
          const test = claimTest.get(it.why);
          if (!test) { fail(a.id, `defence "${it.why}" is one this check cannot verify — teach it the predicate`); return; }
          oracled++;
          const others = nums.filter((_, m) => m !== k);
          if (!test(nums[k])) fail(a.id, `${it.label} is claimed to be "${it.why}" and is not`);
          if (others.some(test)) fail(a.id, `"${it.why}" is claimed of ${it.label} but is true of another item too`);
        });
      }
    }
  }
  console.log(`  ${ROUTINE_IDS.length} routines · ${withWarmUp.length} activities open with one · ${
    built} warm-ups built across ${CHARS.length} characters · ${oracled} claims recomputed independently`);
}

console.log('\n=== character levels ===');
{
  const sprites = SPRITES;
  const css = fs.readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8');
  let prevAt = -1, prevN = -1;
  for (const l of LEVELS) {
    if (l.at <= prevAt && l.n > 0) fail(`level ${l.n} threshold ${l.at} does not increase`);
    if (l.n !== prevN + 1) fail(`level numbers skip: ${prevN} then ${l.n}`);
    prevAt = l.at; prevN = l.n;
    if (l.n === 0) continue;
    if (!l.name || !l.gear || !l.says) fail(`level ${l.n} is missing a name, gear or line`);
    // the gear it promises has to exist as a sprite, or the level shows nothing
    if (!sprites.includes(`id="gear-${l.n}"`)) fail(`level ${l.n} has no gear-${l.n} sprite`);
    // and CSS has to reveal every layer up to it, or later gear never appears
    for (let k = 1; k <= l.n; k++) {
      if (!new RegExp(`html\\[data-lv="${l.n}"\\] \\.g${k}\\b`).test(css)) {
        fail(`level ${l.n} does not reveal .g${k} in site.css`);
      }
    }
    if (!l.says.includes('{name}')) fail(`level ${l.n} line does not name the character`);
    /* The title is the CHARACTER's, so a praise word aimed at the child is the
       thing to keep out — the same rule badges follow. */
    if (/\b(great|awesome|amazing|well done|good job|clever|smart)\b/i.test(l.says + ' ' + l.name)) {
      fail(`level ${l.n} uses a praise word: ${l.name} / ${l.says}`);
    }
  }
  /* The top level must be exactly reachable. One badge short and the crown is
     decoration nobody can earn — the same defect The Whole Shelf had. */
  const top = LEVELS[LEVELS.length - 1];
  if (top.at > BADGE_COUNT) fail(`top level needs ${top.at} badges but only ${BADGE_COUNT} exist`);
  if (levelFor(BADGE_COUNT).n !== top.n) fail(`earning every badge does not reach the top level`);
  if (levelFor(0).n !== 0) fail('a profile with no badges is not at level 0');
  console.log(`  ${LEVELS.length - 1} levels, ${LEVELS.slice(1).map((l) => l.at).join('/')} badges · top reachable at ${BADGE_COUNT} · gear layers all present`);
}

console.log('\n=== badge legibility ===');
{
  const css = fs.readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8');
  const hex = (t, n) => ((t.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1] || '').toLowerCase();
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lum = (c) => {
    const v = c.map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (f, b, a) => f.map((c, i) => c * a + b[i] * (1 - a));

  // every :root block, folded in source order — the accents and the badge inks
  // are declared in different ones, and a single-block read silently missed the
  // second, reporting the inks as absent when they were right there.
  const root = [...css.matchAll(/:root\s*\{([^{}]*)\}/g)].map((m) => m[1]).join('\n');
  // later blocks win on source order at equal specificity, so fold them in order
  const blocks = [...css.matchAll(/html\[data-ch="(\w+)"\]\s*\{([^}]*)\}/g)];
  const names = [...new Set(blocks.map((b) => b[1]))];
  const VARS = ['a1', 'a2', 'a3', 'ok', 'bi-a1', 'bi-a2', 'bi-a3', 'bi-ok'];
  const bg = rgb(hex(root, 'ink'));
  if (!hex(root, 'ink')) fail('badge legibility: cannot find --ink to measure against');

  // the disc gradient, read out of badgeart.js rather than assumed
  const art = fs.readFileSync(new URL('../src/lib/badgeart.js', import.meta.url), 'utf8');
  const stops = [...art.matchAll(/stop-opacity="\.(\d+)"/g)].map((m) => Number(`0.${m[1]}`));
  if (stops.length < 2) fail('badge legibility: cannot read the disc gradient stops');
  const worstA = Math.min(...stops), bestA = Math.max(...stops);

  let n = 0, worst = { r: Infinity };
  for (const ch of names) {
    const scope = { };
    for (const v of VARS) scope[v] = hex(root, v);
    for (const [, name, body] of blocks) {
      if (name !== ch) continue;
      for (const v of VARS) { const got = hex(body, v); if (got) scope[v] = got; }
    }
    for (const cat of Object.values(CATEGORIES)) {
      const hue = scope[cat.hue], ink = scope[`bi-${cat.hue}`];
      if (!hue) { fail(`badge legibility: ${ch} has no --${cat.hue}`); continue; }
      if (!ink) { fail(`badge legibility: no --bi-${cat.hue} for ${ch}`); continue; }
      const r = Math.min(ratio(rgb(ink), over(rgb(hue), bg, worstA)),
                         ratio(rgb(ink), over(rgb(hue), bg, bestA)));
      n++;
      if (r < worst.r) worst = { r, where: `${ch} · ${cat.name} · --${cat.hue}` };
      if (r < 3) fail(`badge glyph unreadable: ${ch} ${cat.name} (--${cat.hue}) at ${r.toFixed(2)}:1`);
      else if (r < 3.5) warn(`badge glyph close to the floor: ${ch} ${cat.name} (--${cat.hue}) at ${r.toFixed(2)}:1`);
    }
  }
  console.log(`  ${n} character x category pairs · worst ${worst.r.toFixed(2)}:1 (${worst.where})`);
}

console.log(`\n=== distribution ===`);
for (const g of GRADES) {
  const l = activities.filter((a) => a.grade === g);
  const bk = l.filter((a) => a.kind === 'book').length, gm = l.filter((a) => a.kind === 'game').length;
  console.log(`  ${g.padEnd(2)} ${String(l.length).padStart(2)} total — ${bk} book${bk === 1 ? ' ' : 's'} ${gm} game${gm === 1 ? '' : 's'}`);
  if (!l.length) fail(`grade ${g} has no activities`);
}

console.log(`\n${'='.repeat(60)}`);
console.log(`${checked} problems checked · ${activities.length} activities · ${errors} errors · ${warns} warnings`);
if (errors) { console.log('CHECK FAILED\n'); process.exit(1); }
console.log('CHECK PASSED\n');
