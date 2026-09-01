/* The 150 profile avatars, and the words that go with them.
   Data only — the drawing is in src/lib/avatarart.js.

   WHY THIS IS NOT THE CHARACTER SYSTEM
   Izzi Math already has characters: Kiwi, Georgie and Flame re-skin the palette,
   the world nouns and the voice. There are three because each one is a whole
   pack of authored content, and there will never be 150 of those.

   These are a different axis: an avatar is WHO THE CHILD IS, a face to find
   themselves by in a list. It carries no theme and no content. A profile
   remembers which themed character you play with as one of its fields, and the
   two never mix.

   HOW 150 IS BUILT
   25 creatures x 6 colourways. Composed from primitives rather than drawn one by
   one, because 150 hand-authored SVGs would be 150 things to keep in step, and
   the ones drawn last would be visibly worse than the ones drawn first.

   Avatar id 0-149:  creature = id % 25,  colourway = floor(id / 25)
   That ordering matters — it means the first screenful of a grid shows 25
   different animals rather than the same animal six times.
*/

/* Each creature is a handful of choices over shared primitives. `ears`, `face`
   and `extra` are drawn by avatarart.js; nothing here knows about SVG. */
export const CREATURES = [
  { id: 'cat',      name: 'Cat',      ears: 'pointy',  face: 'round', extra: 'whiskers' },
  { id: 'dog',      name: 'Dog',      ears: 'droopy',  face: 'round', extra: 'snout' },
  { id: 'bunny',    name: 'Bunny',    ears: 'long',    face: 'oval',  extra: 'buckteeth' },
  { id: 'bear',     name: 'Bear',     ears: 'tiny',    face: 'wide',  extra: 'snout' },
  { id: 'fox',      name: 'Fox',      ears: 'pointy',  face: 'tapered', extra: 'cheeks' },
  { id: 'owl',      name: 'Owl',      ears: 'tufted',  face: 'wide',  extra: 'beak' },
  { id: 'frog',     name: 'Frog',     ears: 'none',    face: 'wide',  extra: 'eyestalks' },
  { id: 'fish',     name: 'Fish',     ears: 'none',    face: 'oval',  extra: 'fin' },
  { id: 'dragon',   name: 'Dragon',   ears: 'horns',   face: 'tapered', extra: 'spikes' },
  { id: 'panda',    name: 'Panda',    ears: 'tiny',    face: 'wide',  extra: 'patches' },
  { id: 'koala',    name: 'Koala',    ears: 'round',   face: 'wide',  extra: 'bignose' },
  { id: 'hedgehog', name: 'Hedgehog', ears: 'tiny',    face: 'tapered', extra: 'spikes' },
  { id: 'turtle',   name: 'Turtle',   ears: 'none',    face: 'oval',  extra: 'shell' },
  { id: 'penguin',  name: 'Penguin',  ears: 'none',    face: 'oval',  extra: 'beak' },
  { id: 'deer',     name: 'Deer',     ears: 'antlers', face: 'tapered', extra: 'cheeks' },
  { id: 'mouse',    name: 'Mouse',    ears: 'big',     face: 'tapered', extra: 'whiskers' },
  { id: 'lion',     name: 'Lion',     ears: 'round',   face: 'round', extra: 'mane' },
  { id: 'monkey',   name: 'Monkey',   ears: 'big',     face: 'round', extra: 'muzzle' },
  { id: 'sheep',    name: 'Sheep',    ears: 'droopy',  face: 'wide',  extra: 'curls' },
  { id: 'pig',      name: 'Pig',      ears: 'pointy',  face: 'wide',  extra: 'snoutring' },
  { id: 'whale',    name: 'Whale',    ears: 'none',    face: 'wide',  extra: 'spout' },
  { id: 'crab',     name: 'Crab',     ears: 'eyes',    face: 'wide',  extra: 'claws' },
  { id: 'bee',      name: 'Bee',      ears: 'antennae', face: 'round', extra: 'stripes' },
  { id: 'axolotl',  name: 'Axolotl',  ears: 'frills',  face: 'round', extra: 'smile' },
  { id: 'narwhal',  name: 'Narwhal',  ears: 'none',    face: 'oval',  extra: 'horn' },
];

/* Six colourways. Vivid enough to tell apart at 40px in a grid, and each one is
   a body colour plus one accent for ears, cheeks and the distinguishing feature. */
export const COLOURWAYS = [
  { id: 'sun',   name: 'Sunny',     body: '#FFC24D', accent: '#FF7A45', ink: '#3A2410' },
  { id: 'berry', name: 'Berry',     body: '#FF6FA5', accent: '#A855F7', ink: '#3D1030' },
  { id: 'mint',  name: 'Mint',      body: '#7CE8B0', accent: '#22C2A8', ink: '#0E3428' },
  { id: 'sky',   name: 'Sky',       body: '#7FC8FF', accent: '#5C7CFF', ink: '#0F2547' },
  { id: 'ember', name: 'Ember',     body: '#FF8A6B', accent: '#D7263D', ink: '#40140F' },
  { id: 'moon',  name: 'Moonlight', body: '#CBD3E8', accent: '#8B93B8', ink: '#242A40' },
];

export const AVATAR_COUNT = CREATURES.length * COLOURWAYS.length;   // 150

export function avatarSpec(id) {
  const n = ((id % AVATAR_COUNT) + AVATAR_COUNT) % AVATAR_COUNT;
  return {
    id: n,
    creature: CREATURES[n % CREATURES.length],
    colour: COLOURWAYS[Math.floor(n / CREATURES.length)],
  };
}

export const avatarLabel = (id) => {
  const s = avatarSpec(id);
  return `${s.colour.name} ${s.creature.name}`;
};

/* Names. One shared pool; each avatar is OFFERED ten of them, chosen
   deterministically from its id, so the ten feel like that character's names
   rather than a dropdown of sixty. Short, sayable, and none of them a real
   child's name that a classmate could be teased with. */
export const NAME_POOL = [
  'Pip', 'Bo', 'Mango', 'Tuck', 'Wren', 'Ziggy', 'Olive', 'Bramble', 'Nib', 'Juno',
  'Cosmo', 'Poppy', 'Rusty', 'Marlow', 'Fig', 'Sunny', 'Bandit', 'Clover', 'Ash', 'Pebble',
  'Waffle', 'Dot', 'Biscuit', 'Nova', 'Sprout', 'Tango', 'Muffin', 'Echo', 'Cricket', 'Bean',
  'Pippin', 'Slate', 'Maple', 'Zephyr', 'Buttons', 'Comet', 'Noodle', 'Willow', 'Scout', 'Pesto',
  'Domino', 'Hazel', 'Turnip', 'Ripley', 'Sesame', 'Quill', 'Onyx', 'Peanut', 'Loop', 'Fern',
  'Cobble', 'Tinsel', 'Rhubarb', 'Vesper', 'Pickle', 'Halo', 'Gizmo', 'Brie', 'Otto', 'Saffron',
];

export const NAMES_OFFERED = 10;

/* Deterministic, so the same avatar always offers the same ten names — a child
   who backs out and comes in again sees the list they remember. */
export function namesFor(avatarId) {
  const out = [];
  const step = 7;                       // coprime with 60, so it never repeats early
  let k = (avatarId * 13) % NAME_POOL.length;
  while (out.length < NAMES_OFFERED) {
    const nm = NAME_POOL[k % NAME_POOL.length];
    if (!out.includes(nm)) out.push(nm);
    k += step;
  }
  return out;
}

/* Twenty-five foods. Drawn as a glyph plus a word so a pre-reader can still find
   theirs. Deliberately ordinary things a child would actually name. */
export const FOODS = [
  { id: 'pizza',      name: 'Pizza',       glyph: '🍕' },
  { id: 'icecream',   name: 'Ice cream',   glyph: '🍦' },
  { id: 'banana',     name: 'Banana',      glyph: '🍌' },
  { id: 'apple',      name: 'Apple',       glyph: '🍎' },
  { id: 'carrot',     name: 'Carrot',      glyph: '🥕' },
  { id: 'noodles',    name: 'Noodles',     glyph: '🍜' },
  { id: 'taco',       name: 'Taco',        glyph: '🌮' },
  { id: 'cheese',     name: 'Cheese',      glyph: '🧀' },
  { id: 'grapes',     name: 'Grapes',      glyph: '🍇' },
  { id: 'watermelon', name: 'Watermelon',  glyph: '🍉' },
  { id: 'strawberry', name: 'Strawberry',  glyph: '🍓' },
  { id: 'cookie',     name: 'Cookie',      glyph: '🍪' },
  { id: 'pancakes',   name: 'Pancakes',    glyph: '🥞' },
  { id: 'popcorn',    name: 'Popcorn',     glyph: '🍿' },
  { id: 'sushi',      name: 'Sushi',       glyph: '🍣' },
  { id: 'broccoli',   name: 'Broccoli',    glyph: '🥦' },
  { id: 'orange',     name: 'Orange',      glyph: '🍊' },
  { id: 'bread',      name: 'Bread',       glyph: '🍞' },
  { id: 'honey',      name: 'Honey',       glyph: '🍯' },
  { id: 'mango',      name: 'Mango',       glyph: '🥭' },
  { id: 'corn',       name: 'Corn',        glyph: '🌽' },
  { id: 'peach',      name: 'Peach',       glyph: '🍑' },
  { id: 'pretzel',    name: 'Pretzel',     glyph: '🥨' },
  { id: 'blueberry',  name: 'Blueberries', glyph: '🫐' },
  { id: 'avocado',    name: 'Avocado',     glyph: '🥑' },
];

export const foodById = (id) => FOODS.find((f) => f.id === id) ?? null;

/* The food is the pick-up check. Child-facing copy calls it a secret snack,
   because that is more fun and a child understands it instantly.

   For the record, and stated plainly in the grown-ups note rather than hidden in
   a comment: it is a one-in-twenty-five choice, not a password. It exists so that
   two siblings sharing a tablet land on their own scores, which is the entire
   threat model when nothing ever leaves the browser. Do not let it grow into
   something that guards anything that matters. */
export const CHECK_DECOYS = 5;

/* The decoys shown alongside the right answer. Deterministic from the profile so
   the same six appear every time — a child who is asked a different question each
   visit will think the game is broken. */
export function foodChoicesFor(profile) {
  const right = profile.food;
  const idx = FOODS.findIndex((f) => f.id === right);
  if (idx < 0) return FOODS.slice(0, CHECK_DECOYS + 1);
  const seedish = (profile.avatar * 31 + idx * 17 + profile.name.length * 7);
  const out = [FOODS[idx]];
  let k = seedish % FOODS.length;
  while (out.length < CHECK_DECOYS + 1) {
    const f = FOODS[k % FOODS.length];
    if (!out.includes(f)) out.push(f);
    k += 9;
  }
  // stable shuffle so the right answer is not always first
  return out.sort((a, b) => ((seedish + FOODS.indexOf(a)) % 7) - ((seedish + FOODS.indexOf(b)) % 7));
}
