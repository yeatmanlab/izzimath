// Activity registry.
//
// An activity is authored ONCE as data plus a seeded generator. Three renderers
// consume it: the interactive player, the printable sheet, and the answer key.
// Nobody writes a worksheet twice.
//
// Required shape:
//   id, title, kind ('book'|'game'), grade, strand, skill, blurb
//   ccss   [..]  standard codes
//   roam   [{ task, subscale, block? }]  what this practises — see content/roam.js
//   generate(seed, index, ch, r) -> problem  (see content/types.js for the types)
// Books add: pages, chapterLabel?, hint/explain on problems
// Games add: rounds, seconds?, timerAvailable?

import { STRANDS } from './strands.js';

import k from './grade-k.js';
import g1 from './grade-1.js';
import g2 from './grade-2.js';
import g3 from './grade-3.js';
import g4 from './grade-4.js';
import g5 from './grade-5.js';

export const activities = [...k, ...g1, ...g2, ...g3, ...g4, ...g5];

export { STRANDS };
export const strandsFor = (g) => STRANDS[g] ?? [];
export const byGrade = (g) => activities.filter((a) => a.grade === g);
export const byId = (id) => activities.find((a) => a.id === id);
export const books = () => activities.filter((a) => a.kind === 'book');
export const games = () => activities.filter((a) => a.kind === 'game');
