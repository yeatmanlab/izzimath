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
/* The snack is the pick-up check, and it is the one thing a child has to
   remember, so the list is long and most of it is silly. Both are deliberate.

   Long, because the snack is what separates two children sharing a tablet.
   Picking the same one by coincidence is roughly a one-in-five-hundred accident
   rather than a one-in-twenty-five one. (What a guesser faces at sign-in is still
   one in six, because six is how many are offered — see CHECK_DECOYS. Pool size
   is about siblings colliding, not about guessing.)

   Silly, because "Dragon pancakes" is far easier to remember a week later than
   "Apple", and remembering it is the entire job. Every silly snack is a whimsical
   prefix on a real food — never anything unpleasant, because it still has to be a
   snack a child would want to claim as their favourite.

   IDS ARE PERMANENT. A profile stores the id, so deleting an entry or renaming a
   prefix locks a child out of their own scores. Add; do not rearrange or remove.
   The original twenty-five ids are all still here, first, for that reason. */
const BASE = [
  { id: 'pizza',       name: 'Pizza',          glyph: '🍕' },
  { id: 'icecream',    name: 'Ice cream',      glyph: '🍦' },
  { id: 'banana',      name: 'Banana',         glyph: '🍌' },
  { id: 'apple',       name: 'Apple',          glyph: '🍎' },
  { id: 'carrot',      name: 'Carrot',         glyph: '🥕' },
  { id: 'noodles',     name: 'Noodles',        glyph: '🍜' },
  { id: 'taco',        name: 'Taco',           glyph: '🌮' },
  { id: 'cheese',      name: 'Cheese',         glyph: '🧀' },
  { id: 'grapes',      name: 'Grapes',         glyph: '🍇' },
  { id: 'watermelon',  name: 'Watermelon',     glyph: '🍉' },
  { id: 'strawberry',  name: 'Strawberry',     glyph: '🍓' },
  { id: 'cookie',      name: 'Cookie',         glyph: '🍪' },
  { id: 'pancakes',    name: 'Pancakes',       glyph: '🥞' },
  { id: 'popcorn',     name: 'Popcorn',        glyph: '🍿' },
  { id: 'sushi',       name: 'Sushi',          glyph: '🍣' },
  { id: 'broccoli',    name: 'Broccoli',       glyph: '🥦' },
  { id: 'orange',      name: 'Orange',         glyph: '🍊' },
  { id: 'bread',       name: 'Bread',          glyph: '🍞' },
  { id: 'honey',       name: 'Honey',          glyph: '🍯' },
  { id: 'mango',       name: 'Mango',          glyph: '🥭' },
  { id: 'corn',        name: 'Corn',           glyph: '🌽' },
  { id: 'peach',       name: 'Peach',          glyph: '🍑' },
  { id: 'pretzel',     name: 'Pretzel',        glyph: '🥨' },
  { id: 'blueberry',   name: 'Blueberries',    glyph: '🫐' },
  { id: 'avocado',     name: 'Avocado',        glyph: '🥑' },
  { id: 'pear',        name: 'Pear',           glyph: '🍐' },
  { id: 'cherry',      name: 'Cherries',       glyph: '🍒' },
  { id: 'pineapple',   name: 'Pineapple',      glyph: '🍍' },
  { id: 'lemon',       name: 'Lemon',          glyph: '🍋' },
  { id: 'coconut',     name: 'Coconut',        glyph: '🥥' },
  { id: 'kiwifruit',   name: 'Kiwi fruit',     glyph: '🥝' },
  { id: 'tomato',      name: 'Tomato',         glyph: '🍅' },
  { id: 'cucumber',    name: 'Cucumber',       glyph: '🥒' },
  { id: 'pepper',      name: 'Pepper',         glyph: '🫑' },
  { id: 'mushroom',    name: 'Mushroom',       glyph: '🍄' },
  { id: 'potato',      name: 'Potato',         glyph: '🥔' },
  { id: 'sweetpotato', name: 'Sweet potato',   glyph: '🍠' },
  { id: 'onion',       name: 'Onion',          glyph: '🧅' },
  { id: 'garlic',      name: 'Garlic',         glyph: '🧄' },
  { id: 'peas',        name: 'Peas',           glyph: '🫛' },
  { id: 'beans',       name: 'Beans',          glyph: '🫘' },
  { id: 'lettuce',     name: 'Lettuce',        glyph: '🥬' },
  { id: 'olive',       name: 'Olives',         glyph: '🫒' },
  { id: 'donut',       name: 'Doughnut',       glyph: '🍩' },
  { id: 'cupcake',     name: 'Cupcake',        glyph: '🧁' },
  { id: 'cake',        name: 'Cake',           glyph: '🍰' },
  { id: 'pie',         name: 'Pie',            glyph: '🥧' },
  { id: 'brownie',     name: 'Brownie',        glyph: '🍫' },
  { id: 'chocolate',   name: 'Chocolate',      glyph: '🍫' },
  { id: 'candy',       name: 'Sweets',         glyph: '🍬' },
  { id: 'lollipop',    name: 'Lollipop',       glyph: '🍭' },
  { id: 'marshmallow', name: 'Marshmallow',    glyph: '🍬' },
  { id: 'custard',     name: 'Custard',        glyph: '🍮' },
  { id: 'pudding',     name: 'Pudding',        glyph: '🍮' },
  { id: 'waffle',      name: 'Waffle',         glyph: '🧇' },
  { id: 'croissant',   name: 'Croissant',      glyph: '🥐' },
  { id: 'bagel',       name: 'Bagel',          glyph: '🥯' },
  { id: 'baguette',    name: 'Baguette',       glyph: '🥖' },
  { id: 'toast',       name: 'Toast',          glyph: '🍞' },
  { id: 'sandwich',    name: 'Sandwich',       glyph: '🥪' },
  { id: 'burger',      name: 'Burger',         glyph: '🍔' },
  { id: 'hotdog',      name: 'Hot dog',        glyph: '🌭' },
  { id: 'fries',       name: 'Chips',          glyph: '🍟' },
  { id: 'burrito',     name: 'Burrito',        glyph: '🌯' },
  { id: 'quesadilla',  name: 'Quesadilla',     glyph: '🫓' },
  { id: 'flatbread',   name: 'Flatbread',      glyph: '🫓' },
  { id: 'dumpling',    name: 'Dumpling',       glyph: '🥟' },
  { id: 'spaghetti',   name: 'Spaghetti',      glyph: '🍝' },
  { id: 'ramen',       name: 'Ramen',          glyph: '🍜' },
  { id: 'curry',       name: 'Curry',          glyph: '🍛' },
  { id: 'rice',        name: 'Rice',           glyph: '🍚' },
  { id: 'onigiri',     name: 'Rice ball',      glyph: '🍙' },
  { id: 'bento',       name: 'Bento box',      glyph: '🍱' },
  { id: 'tempura',     name: 'Tempura',        glyph: '🍤' },
  { id: 'shrimp',      name: 'Prawns',         glyph: '🍤' },
  { id: 'fishcake',    name: 'Fish cake',      glyph: '🍥' },
  { id: 'mochi',       name: 'Mochi',          glyph: '🍡' },
  { id: 'eggs',        name: 'Eggs',           glyph: '🥚' },
  { id: 'friedegg',    name: 'Fried egg',      glyph: '🍳' },
  { id: 'bacon',       name: 'Bacon',          glyph: '🥓' },
  { id: 'chicken',     name: 'Chicken',        glyph: '🍗' },
  { id: 'steak',       name: 'Steak',          glyph: '🥩' },
  { id: 'ribs',        name: 'Ribs',           glyph: '🍖' },
  { id: 'soup',        name: 'Soup',           glyph: '🍲' },
  { id: 'stew',        name: 'Stew',           glyph: '🍲' },
  { id: 'salad',       name: 'Salad',          glyph: '🥗' },
  { id: 'cereal',      name: 'Cereal',         glyph: '🥣' },
  { id: 'porridge',    name: 'Porridge',       glyph: '🥣' },
  { id: 'milk',        name: 'Milk',           glyph: '🥛' },
  { id: 'juice',       name: 'Juice',          glyph: '🧃' },
  { id: 'smoothie',    name: 'Smoothie',       glyph: '🥤' },
  { id: 'milkshake',   name: 'Milkshake',      glyph: '🥤' },
  { id: 'lemonade',    name: 'Lemonade',       glyph: '🍋' },
  { id: 'tea',         name: 'Tea',            glyph: '🍵' },
  { id: 'cocoa',       name: 'Hot cocoa',      glyph: '☕' },
  { id: 'butter',      name: 'Butter',         glyph: '🧈' },
  { id: 'jam',         name: 'Jam',            glyph: '🍓' },
  { id: 'peanut',      name: 'Peanuts',        glyph: '🥜' },
  { id: 'chestnut',    name: 'Chestnut',       glyph: '🌰' },
  { id: 'nachos',      name: 'Nachos',         glyph: '🧀' },
  { id: 'pickle',      name: 'Pickle',         glyph: '🥒' },
  { id: 'crackers',    name: 'Crackers',       glyph: '🍘' },
  { id: 'seaweed',     name: 'Seaweed',        glyph: '🥬' },
  { id: 'jelly',       name: 'Jelly',          glyph: '🍮' },
  { id: 'yogurt',      name: 'Yoghurt',        glyph: '🥣' },
  { id: 'oatcake',     name: 'Oat cake',       glyph: '🍘' },
  { id: 'scone',       name: 'Scone',          glyph: '🥐' },
  { id: 'muffin',      name: 'Muffin',         glyph: '🧁' },
  { id: 'granola',     name: 'Granola',        glyph: '🥣' },
  { id: 'trailmix',    name: 'Trail mix',      glyph: '🥜' },
];

/* A whimsical word and the real foods it is funny on, written out as explicit
   pairs rather than every combination. Generating all 110 x 26 would be shorter
   and would also produce things no child wants to be asked to remember. */
const SILLY = [
  ['dragon',     'Dragon',       'pancakes toast cheese noodles eggs pie soup chicken ribs curry popcorn pretzel waffle bagel donut'],
  ['wizard',     'Wizard',       'cookie pudding stew tea cocoa bread jam custard marshmallow porridge cereal honey scone muffin granola'],
  ['robot',      'Robot',        'fries nachos crackers spaghetti burger hotdog sandwich rice peas beans pizza taco bento milk juice'],
  ['pirate',     'Pirate',       'cheese fishcake banana orange coconut lemonade apple baguette olive pickle shrimp tempura steak seaweed oatcake'],
  ['dinosaur',   'Dinosaur',     'broccoli lettuce salad watermelon corn ribs steak cake cupcake grapes carrot pineapple cucumber mushroom trailmix'],
  ['rainbow',    'Rainbow',      'candy lollipop icecream smoothie pancakes waffle donut jam juice popcorn marshmallow pudding cupcake jelly yogurt'],
  ['galaxy',     'Galaxy',       'cookie milkshake brownie chocolate custard mochi cake pie donut candy icecream pudding granola muffin scone'],
  ['moon',       'Moon',         'cheese rice pancakes bread milk custard pie cookie mochi dumpling onigiri porridge marshmallow butter eggs'],
  ['volcano',    'Volcano',      'curry nachos taco tomato soup noodles fries pepper burrito quesadilla ramen stew chicken beans flatbread'],
  ['thunder',    'Thunder',      'popcorn pretzel crackers cereal toast waffle ribs steak burger hotdog soup tea cocoa oatcake trailmix'],
  ['glitter',    'Glitter',      'cupcake donut cookie candy lollipop icecream cake brownie marshmallow pudding custard jam smoothie jelly yogurt'],
  ['sparkly',    'Sparkly',      'strawberry blueberry cherry grapes watermelon pineapple mango peach pear apple orange lemon kiwifruit coconut olive'],
  ['giant',      'Giant',        'pretzel cookie sandwich burger pizza donut cupcake banana watermelon corn potato carrot mushroom cake baguette'],
  ['tiny',       'Tiny',         'dumpling mochi onigiri sushi tempura shrimp peas beans blueberry cherry marshmallow candy cupcake pretzel crackers'],
  ['invisible',  'Invisible',    'soup salad noodles rice toast milk juice tea pudding custard jam butter honey porridge cereal'],
  ['upsidedown', 'Upside-down',  'cake pie pancakes pizza toast sandwich waffle bagel donut cupcake taco burrito dumpling sushi bento'],
  ['backwards',  'Backwards',    'spaghetti noodles ramen curry rice soup stew salad sandwich burger hotdog fries nachos taco pizza'],
  ['bouncy',     'Bouncy',       'mochi marshmallow pudding custard jelly dumpling cheese bagel donut waffle pancakes grapes blueberry peas yogurt'],
  ['wobbly',     'Wobbly',       'pudding custard jam beans noodles soup cake pie cheese eggs friedegg porridge cereal milk smoothie'],
  ['square',     'Square',       'watermelon orange apple pear peach banana grapes donut cookie pancakes pizza eggs cheese bread rice'],
  ['musical',    'Musical',      'pretzel popcorn crackers cereal soup noodles spaghetti pancakes waffle toast jam honey tea cocoa milk'],
  ['whispering', 'Whispering',   'soup tea porridge pudding custard honey jam butter toast bread cheese rice milk cereal cocoa'],
  ['turbo',      'Turbo',        'fries nachos burger hotdog pizza taco burrito ramen noodles curry chicken ribs steak popcorn smoothie'],
  ['midnight',   'Midnight',     'cookie brownie chocolate cake pie icecream milkshake cocoa cereal toast jam pudding custard donut popcorn'],
  ['sunrise',    'Sunrise',      'pancakes waffle toast bagel croissant eggs friedegg bacon porridge cereal juice smoothie jam butter honey'],
  ['snowy',      'Snowy',        'icecream marshmallow coconut milk milkshake pudding custard cake cupcake donut cookie porridge cereal mochi sushi'],
];

export const FOODS = [
  ...BASE,
  ...SILLY.flatMap(([pid, pname, bases]) => bases.split(' ').map((bid) => {
    const b = BASE.find((f) => f.id === bid);
    // Loud at module load rather than a blank button in a child's face.
    if (!b) throw new Error(`SILLY pair ${pid}-${bid}: no such base food`);
    return { id: `${pid}-${bid}`, name: `${pname} ${b.name.toLowerCase()}`,
      glyph: b.glyph, silly: true, base: bid };
  })),
];

/* The creation screen cannot show five hundred buttons, so it shows a tray:
   half plain and half silly, so both kinds are always on offer and the child can
   ask for a different draw. Half-and-half rather than a straight random sample,
   which at 500-to-110 would be almost all silly ones. */
export const TRAY_SIZE = 24;
export function foodTray(size = TRAY_SIZE, rand = Math.random) {
  const draw = (list, n) => {
    const pool = [...list], out = [];
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    return out;
  };
  const half = Math.floor(size / 2);
  const plain = draw(FOODS.filter((f) => !f.silly), half);
  /* One tray, one base food. Without this a draw could offer "Glitter
     marshmallow" next to "Snowy marshmallow" — same emoji, nearly the same word,
     hard to tell apart and harder to remember, which is the one thing the snack
     has to be. */
  const used = new Set(plain.map((f) => f.id));
  const sillyPool = FOODS.filter((f) => f.silly && !used.has(f.base));
  const seen = new Set(), spread = [];
  for (const f of draw(sillyPool, sillyPool.length)) {
    if (seen.has(f.base)) continue;
    seen.add(f.base); spread.push(f);
    if (spread.length >= size - half) break;
  }
  const tray = [...plain, ...spread];
  for (let i = tray.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [tray[i], tray[j]] = [tray[j], tray[i]];
  }
  return tray;
}

export const foodById = (id) => FOODS.find((f) => f.id === id) ?? null;

/* The food is the pick-up check. Child-facing copy calls it a secret snack,
   because that is more fun and a child understands it instantly.

   For the record, and stated plainly in the grown-ups note rather than hidden in
   a comment: what a guesser faces is one in six, because six is what is offered.
   The five hundred in the pool make it unlikely two siblings pick the same snack;
   they do not make the check stronger. It exists so that two children sharing a
   tablet land on their own scores, which is the entire threat model when nothing
   ever leaves the browser. Do not let it grow into something that guards anything
   that matters. */
export const CHECK_DECOYS = 5;

/* The decoys shown alongside the right answer. Deterministic from the profile so
   the same six appear every time — a child who is asked a different question each
   visit will think the game is broken.

   Two rules on which decoys are eligible, and both are about keeping the check
   worth one in six rather than one in one:

   Same kind. The pool is 390 silly to 110 plain, so drawing decoys at random
   would show a child who chose Pizza five silly snacks and one plain one, and the
   answer would be the odd one out. Silly answers get silly decoys and plain
   answers get plain ones.

   Different base food. "Dragon pancakes" next to "Moon pancakes" is not a fair
   question to put to a six-year-old a week later. */
export function foodChoicesFor(profile) {
  const right = profile.food;
  const idx = FOODS.findIndex((f) => f.id === right);
  if (idx < 0) return FOODS.slice(0, CHECK_DECOYS + 1);
  const answer = FOODS[idx];
  const base = answer.base ?? answer.id;
  const eligible = FOODS.filter((f) =>
    f !== answer && !!f.silly === !!answer.silly && (f.base ?? f.id) !== base);
  const seedish = (profile.avatar * 31 + idx * 17 + profile.name.length * 7);
  const out = [answer];
  const bases = new Set([base]);
  let k = seedish % Math.max(1, eligible.length);
  // The no-two-of-a-base rule has to hold between the decoys as well, not just
  // against the answer, or a tray offers "Snowy mochi" beside "Tiny mochi".
  for (let tries = 0; out.length < CHECK_DECOYS + 1 && tries < eligible.length; tries++) {
    const f = eligible[k % eligible.length];
    const fb = f.base ?? f.id;
    if (!bases.has(fb)) { bases.add(fb); out.push(f); }
    k += 9;
  }
  /* Stable shuffle, so the right answer is not always first and the same six
     appear in the same order every visit. The key was `% 7`, which tied often
     enough that the answer landed in the last slot about a quarter as often as
     anywhere else — not exploitable, but a pattern with no reason to exist. */
  const key = (f) => (seedish * 31 + FOODS.indexOf(f) * 7919) % 10007;
  return out.sort((a, b) => key(a) - key(b));
}
