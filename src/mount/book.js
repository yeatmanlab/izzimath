import { activities } from '../../content/activities/index.js';
import { mountBook } from '../engine/book.js';

const a = activities.find((x) => x.id === window.__ACTIVITY__);
const root = document.querySelector('[data-activity]');
if (a && root) mountBook(a, root);
