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
      done: ['Sheet complete.'],
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
    palette: { a1: '#FFD166', a2: '#FF6B35', a3: '#D7263D', ok: '#8FE388' },
    printAccent: '#C42432',
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
};

export const characterList = ['kiwi', 'georgie', 'flame', 'none'];
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
