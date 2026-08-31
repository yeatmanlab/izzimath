// Reads docs/next/BACKLOG.md and prints a short reminder of what is left.
// Runs at the end of `npm run verify`, so the backlog surfaces every time
// someone touches the tooling rather than only when they go looking for it.

import fs from 'node:fs';

const FILE = 'docs/next/BACKLOG.md';

export function backlogSummary() {
  if (!fs.existsSync(FILE)) return null;
  const md = fs.readFileSync(FILE, 'utf8');
  const open = [...md.matchAll(/^- \[ \] \*\*(.+?)\*\*/gm)].map((m) => m[1].replace(/\s+/g, ' '));
  const done = [...md.matchAll(/^- \[x\] \*\*(.+?)\*\*/gim)].map((m) => m[1]);
  // section headings, in file order, so "top" means "highest priority section"
  const sections = [...md.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => m[2].trim());
  return { open, done, sections };
}

const s = backlogSummary();
if (!s) {
  console.log('\n(no backlog file found at ' + FILE + ')\n');
} else if (!s.open.length) {
  console.log('\n=== backlog ===\nnothing open. Worth a look at ' + FILE + ' to confirm that is right.\n');
} else {
  console.log('\n=== backlog ===');
  console.log(`${s.open.length} items still to build${s.done.length ? `, ${s.done.length} done` : ''}. Next up:`);
  for (const item of s.open.slice(0, 3)) {
    console.log(`  · ${item.length > 92 ? item.slice(0, 89) + '…' : item}`);
  }
  console.log(`\nFull list: ${FILE}`);
  console.log(`Highest-priority area: ${s.sections[0] ?? '(see the file)'}\n`);
}
