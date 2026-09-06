// Character packs. A character changes the SKIN — palette, world nouns, voice,
// motif — and never the math. Activities are authored character-agnostic with
// named slots; these fill them.

export const characters = {
  none: {
    id: 'none',
    name: 'Just math',
    species: 'No character',
    tagline: 'Plain problems, plain colours, lightest ink.',
    blurb: 'Some kids want the maths without a story. This is that.',
    palette: { a1: '#22E0F0', a2: '#7C5CFF', a3: '#FF4D9D', ok: '#B6FF3D' },
    printAccent: null,
    // `actor` is who appears in word problems; `name` is the UI label. They differ
    // for "none" so a word problem reads "Sam has 4 boxes", not "Just math has 4 boxes".
    actor: 'Sam',
    verb: { consume: 'gives away', consumeBase: 'give away' },
    world: { place: 'the page', places: 'pages', feature: 'table', features: 'tables' },
    collectible: { one: 'counter', many: 'counters' },
    container: { one: 'box', many: 'boxes' },
    unit: { one: 'step', many: 'steps' },
    voice: {
      correct: ['Correct.', 'That’s right.', 'Yes — correct.'],
      close: ['Not quite. Try again.', 'Close. Have another go.'],
      wrong: ['Not quite.', 'That’s not it — try again.'],
      done: ['All finished.'],
    },
    motif: 'grid',
  },

  kiwi: {
    id: 'kiwi',
    name: 'Kiwi',
    species: 'Bearded dragon',
    actor: 'Kiwi',
    verb: { consume: 'eats', consumeBase: 'eat' },
    tagline: '“Nice. No rush.”',
    blurb: 'Counts crickets, basks on warm rocks, and builds everything out of scales.',
    palette: { a1: '#FFC24D', a2: '#FF7A45', a3: '#C1440E', ok: '#7CE8B0' },
    // Print accent: the deep end of Kiwi's own palette. The neon a1/a2 tones are
    // built for a dark screen and vanish on white paper, so paper gets its own tone.
    printAccent: '#C1440E',
    world: { place: 'the canyon', places: 'canyons', feature: 'basking rock', features: 'basking rocks' },
    collectible: { one: 'cricket', many: 'crickets' },
    container: { one: 'cup', many: 'cups' },
    unit: { one: 'ledge', many: 'ledges' },
    voice: {
      correct: ['Nice. No rush.', 'That’s it. Steady.', 'Good — warm and right.'],
      close: ['Close. Take your time.', 'Nearly. No hurry.'],
      wrong: ['Not that one. Try again slowly.', 'Have another look.'],
      done: ['Whole ledge done. Time to bask.'],
    },
    motif: 'scales',
    // Kiwi's tessellation is genuinely useful geometry art: tiling, area, symmetry.
    affinity: 'geometry',
    timers: false,
  },

  georgie: {
    id: 'georgie',
    name: 'Georgie',
    species: 'Chihuahua',
    actor: 'Georgie',
    verb: { consume: 'eats', consumeBase: 'eat' },
    tagline: '“YES! Again!”',
    blurb: 'Chases tennis balls down number lines and counts treats at top speed.',
    palette: { a1: '#FF4D9D', a2: '#A855F7', a3: '#22E0F0', ok: '#B6FF3D' },
    printAccent: '#A3187C',
    world: { place: 'the park', places: 'parks', feature: 'bench', features: 'benches' },
    collectible: { one: 'treat', many: 'treats' },
    container: { one: 'bag', many: 'bags' },
    unit: { one: 'lap', many: 'laps' },
    voice: {
      correct: ['YES! Got it!', 'That’s IT!', 'Again again again!'],
      close: ['Ooh so close! Again!', 'Almost! One more go!'],
      wrong: ['Nope! Try again!', 'Not that one — again!'],
      done: ['ALL DONE! Best lap ever!'],
    },
    motif: 'bounce',
    // Georgie's bouncing ball is number-line art: intervals, skip counting, fractions.
    affinity: 'number-line',
    timers: true,
  },

  flame: {
    id: 'flame',
    name: 'Flame',
    species: 'Red panda',
    actor: 'Flame',
    verb: { consume: 'eats', consumeBase: 'eat' },
    tagline: '“Ooh — try it this way.”',
    blurb: 'Climbs bamboo towers, hunts for the trick, and counts on a ringed tail.',
    // Red panda reds. Was sharing Kiwi's yellow and orange almost exactly — see
    // the note in site.css. Kept in step with the CSS block there.
    palette: { a1: '#F2504A', a2: '#D02B22', a3: '#6B2318', ok: '#8FE388' },
    printAccent: '#8C1519',
    world: { place: 'the treetops', places: 'treetops', feature: 'branch', features: 'branches' },
    collectible: { one: 'berry', many: 'berries' },
    container: { one: 'basket', many: 'baskets' },
    unit: { one: 'branch', many: 'branches' },
    voice: {
      correct: ['Ooh — nice route.', 'That’s the trick.', 'Clever. That works.'],
      close: ['Hmm — nearly. Try another way.', 'Close. What if you climbed higher?'],
      wrong: ['Not that branch. Try another.', 'Hmm, try a different way.'],
      done: ['Top of the tree. Nice climbing.'],
    },
    motif: 'climb',
    // Flame's climbing and ringed tail is vertical structure: place value, patterns.
    affinity: 'place-value',
    timers: 'optional',
  },

  ash: {
    id: 'ash',
    name: 'Ash',
    species: 'Koala',
    actor: 'Ash',
    verb: { consume: 'eats', consumeBase: 'eat' },
    tagline: '“Mm. That’s the one.”',
    blurb: 'Dozes in the fork of a gum tree, wakes for the good leaves, and counts them in bundles.',
    /* Eucalyptus. The one open hue range: Kiwi holds amber at 39 degrees,
       Georgie pink at 333 and Flame red at 2, and the checker wants 20 clear of
       each, which leaves 60 to 313. Sage at 140 is a hundred degrees off the
       nearest. Unlike Flame it keeps the near-black gradient label, so it also
       differs from the other dark-accent character structurally. */
    palette: { a1: '#8FD9A8', a2: '#2FB6A0', a3: '#1B7F72', ok: '#FFD166' },
    printAccent: '#12615A',
    /* Flame is already arboreal — treetops, branches, berries, baskets. A koala
       in a canopy picking things into baskets would be Flame in different fur,
       so Ash gets leaves and bundles, and counts whole trees rather than
       branches. */
    world: { place: 'the gum grove', places: 'gum groves', feature: 'tree fork', features: 'tree forks' },
    collectible: { one: 'gum leaf', many: 'gum leaves' },
    container: { one: 'bundle', many: 'bundles' },
    unit: { one: 'tree', many: 'trees' },
    /* Drowsy and CONTENTED, never reluctant. A koala sleeps twenty hours a day,
       which is the joke; a mascot who would rather not be here is not, and the
       line between those two is entirely in this copy. Distinct from Kiwi, who
       is unhurried rather than half-asleep — Kiwi says "no rush", so Ash never
       does. */
    voice: {
      correct: ['Mm. That’s the one.', 'Yes — that one’s good.', 'Good. Back to resting.'],
      close: ['Nearly — have another look.', 'Almost. One more.'],
      wrong: ['Not that leaf. Try another.', 'Mm — not that one.'],
      done: ['All done. Time for a proper nap.'],
    },
    motif: 'leaves',
    // Patterns was the open affinity: Kiwi has geometry, Georgie the number
    // line, Flame place value. Declared for the record — no code reads it.
    affinity: 'patterns',
    // Sleepy means no clock. This is the ONLY field that changes gameplay:
    // src/engine/game.js starts a timer on `ch.timers === true` and nothing else.
    timers: false,
  },
};

export const characterList = ['kiwi', 'georgie', 'flame', 'ash', 'none'];
export const defaultCharacter = 'none';

export function getCharacter(id) {
  return characters[id] || characters[defaultCharacter];
}

// Fill a template string from a character pack.
//   t('{Name} has 4 {container.many} of {collectible.many}.', ch)
export function fill(template, ch) {
  return String(template).replace(/\{([\w.]+)\}/g, (_, path) => {
    const cap = path[0] === path[0].toUpperCase() && /^[A-Z]/.test(path);
    const key = cap ? path[0].toLowerCase() + path.slice(1) : path;
    let v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), ch);
    if (v == null) v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), characters.none);
    if (v == null) return '';
    v = String(v);
    return cap ? v[0].toUpperCase() + v.slice(1) : v;
  });
}
