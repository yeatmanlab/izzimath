import { activities } from '../../content/activities/index.js';
import { mountGame } from '../engine/game.js';

const a = activities.find((x) => x.id === window.__ACTIVITY__);
const root = document.querySelector('[data-activity]');
if (a && root) mountGame(a, root);
