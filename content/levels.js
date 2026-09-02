/* Character levels — the kids' idea: after enough badges, Kiwi, Georgie and
   Flame level up and put something on.

   Two rules borrowed from docs/BADGES.md, because they apply here too:

   The title belongs to the CHARACTER, not the child. "Kiwi is a Pathfinder", not
   "you are a Pathfinder". That distance is the same one the badge shelf uses, and
   it is why a title is allowed at all where a praise word is not — it names what
   the character has become, which is a fact about the badges earned.

   Nothing is ever lost. Gear only accumulates, and a level never drops.

   The gear is cumulative and layered: at level 3 the character is wearing the
   band AND the goggles AND the scarf. That is the whole appeal — you can see how
   far someone has got at a glance. */

export const LEVELS = [
  { n: 0, at: 0, name: null, gear: null, says: null },
  { n: 1, at: 3, name: 'Explorer', gear: 'a headband',
    says: '{name} put a headband on.' },
  { n: 2, at: 8, name: 'Adventurer', gear: 'goggles',
    says: '{name} found some goggles.' },
  { n: 3, at: 15, name: 'Pathfinder', gear: 'a scarf',
    says: '{name} has a scarf now.' },
  { n: 4, at: 24, name: 'Champion', gear: 'a crown',
    says: '{name} is wearing a crown.' },
];

/* Highest level whose threshold the badge count has reached. */
export const levelFor = (badges = 0) =>
  LEVELS.reduce((best, l) => (badges >= l.at ? l : best), LEVELS[0]);

export const nextLevel = (badges = 0) => LEVELS.find((l) => l.at > badges) ?? null;

export const MAX_LEVEL = LEVELS[LEVELS.length - 1].n;
