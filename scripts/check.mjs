// Content and build validator. Run with `npm run check`.
// Catches the failure modes that matter for generated content: a choice list that
// doesn't contain its own answer, a generator that isn't deterministic, an
// unreachable ROAM subscale, NaN leaking into a problem.

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
