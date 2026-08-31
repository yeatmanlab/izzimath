// URL is the save file. The seed lives here, and nowhere else.
import { parseSeed, randomSeed } from './rng.js';

export function readSeed(fallback = 8817) {
  return parseSeed(new URLSearchParams(location.search).get('seed'), fallback);
}

export function writeSeed(seed, { replace = true } = {}) {
  const u = new URL(location.href);
  u.searchParams.set('seed', String(seed));
  history[replace ? 'replaceState' : 'pushState'](null, '', u);
}

export function newSeed() {
  const s = randomSeed();
  writeSeed(s, { replace: false });
  return s;
}

export function readParam(name, fallback = null) {
  return new URLSearchParams(location.search).get(name) ?? fallback;
}

export function base() {
  return document.documentElement.dataset.base === '/' ? '' : (document.documentElement.dataset.base || '');
}
