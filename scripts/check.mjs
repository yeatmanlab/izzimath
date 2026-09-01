// Content and build validator. Run with `npm run check`.
// Catches the failure modes that matter for generated content: a choice list that
// doesn't contain its own answer, a generator that isn't deterministic, an
// unreachable ROAM subscale, NaN leaking into a problem.

import fs from 'node:fs';
import { activities, STRANDS } from '../content/activities/index.js';
import { characters, getCharacter } from '../content/characters.js';
import { allSubscales, tasks, roamLabel } from '../content/roam.js';
import { isCorrect, answerText, TYPES } from '../content/types.js';
import { rng, deriveSeed } from '../src/lib/rng.js';
import { sheet } from '../src/lib/printsheet.js';
import { parseAnswer, cmpF } from '../src/lib/frac.js';
import { references, refIds, getRef, buildReverseIndex, isSiteScope, STRENGTH, KINDS } from '../content/references.js';
import { IM_UNITS, imUnit } from '../content/curriculum.js';
import { SCHEMAS } from '../content/wordproblems.js';
import { ssddSets } from '../content/ssdd.js';
import { plans, planActivityIds, FOUR_PART } from '../content/plans.js';
import { ladderConfig, initState, record, tierFor, atTop, indexFor, TIERS, STEPS, LADDER_V } from '../src/lib/ladder.js';
import { CREATURES, COLOURWAYS, AVATAR_COUNT, avatarSpec, avatarLabel, namesFor, NAMES_OFFERED, FOODS, NAME_POOL, foodChoicesFor, CHECK_DECOYS } from '../content/avatars.js';
import { avatarSvg, EAR_KINDS, EXTRA_KINDS, FACE_KINDS } from '../src/lib/avatarart.js';
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
  if (FOODS.length !== 25) fail('avatars', `${FOODS.length} foods, the design calls for 25`);
  if (new Set(FOODS.map((f) => f.id)).size !== FOODS.length) fail('avatars', 'duplicate food id');
  for (const f of FOODS) if (!f.name || !f.glyph) fail('avatars', `food ${f.id} missing name or glyph`);
  {
    const prof = { avatar: 42, name: 'Pip', food: 'mango' };
    const ch = foodChoicesFor(prof);
    if (ch.length !== CHECK_DECOYS + 1) fail('avatars', `food check offers ${ch.length}, want ${CHECK_DECOYS + 1}`);
    if (!ch.some((f) => f.id === 'mango')) fail('avatars', 'the right food is not among the choices');
    if (new Set(ch.map((f) => f.id)).size !== ch.length) fail('avatars', 'food check repeats a choice');
    if (JSON.stringify(foodChoicesFor(prof)) !== JSON.stringify(ch))
      fail('avatars', 'food choices change between visits — a child would think it is broken');
  }
  console.log(`  ${AVATAR_COUNT} avatars · ${CREATURES.length} creatures × ${COLOURWAYS.length} colourways · ${FOODS.length} foods · ${NAME_POOL.length} names`);
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
        const parts = { whole: p.whole, a: p.a, b: p.b };
        if (p.a + p.b !== p.whole) fail(a.id, `i=${i} bond ${p.a}+${p.b} != ${p.whole}`);
        if (Number(p.answer) !== Number(parts[p.blank])) fail(a.id, `i=${i} bond answer ${p.answer} != blank part ${parts[p.blank]}`);
      }

      // the stated answer must actually pass the checker
      if (['choice', 'compare', 'truefalse', 'tap', 'ordinal', 'bond'].includes(p.type)) {
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
