#!/usr/bin/env node
/* Read a browser harness's dumped DOM and print what it actually said.
 *
 * WHY THIS IS A FILE AND NOT A ONE-LINER
 * Because the one-liner has now been wrong twice, both times in the direction
 * that reads as a pass or invents a failure:
 *
 *   1. The first version grepped for lines starting `✗` or `FAIL`. pagefill.html
 *      reports `OVER` / `WIDE` / `THIN` / `COUNT`, so it could not see a
 *      page-fill failure at all.
 *   2. The second version sliced `id="out"` to `</pre>`. func.html and
 *      audit.html use `<pre id="out">`; sweep.html and pagefill.html use
 *      `<div id="out">`, so on those two the slice ran off the end of the
 *      document and swallowed the harness's own SOURCE — which contains the
 *      strings `OVER`, `WIDE`, `COUNT` and `no failures` in the code that emits
 *      them. It reported pagefill as 4 OVER / 2 WIDE / 1 COUNT on a run whose
 *      real verdict was the documented 201 THIN and nothing else. Twenty
 *      minutes went into a regression that did not exist.
 *
 * So: strip <script> and <style> FIRST, because the marker words live in the
 * code; accept either container; and read the harness's OWN verdict line
 * (`no failures` / `N FAILURES`) where it has one rather than a marker assumed
 * on its behalf. Where it has none — func.html and audit.html mark each failing
 * check and print no summary — count the marked lines and say so.
 *
 * CHECKS_RUN is always reported, and MISSING is a failure of the run rather
 * than a pass: an empty report is not a green one.
 *
 *   node tools/read-harness.mjs /tmp/func.html [...more]
 */

import fs from 'node:fs';

const unescape = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

export function readHarness(html) {
  /* Order matters: the source has to go before anything is matched in it. */
  const bare = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  const m = bare.match(/<(?:pre|div)\s+id="out"[^>]*>([\s\S]*)$/);
  const text = unescape((m ? m[1] : bare).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''));

  const run = text.match(/CHECKS_RUN=(\d+)/);
  const verdicts = [...text.matchAll(/(no failures|\d+ FAILURES?)/g)].map((x) => x[1]);
  const marked = text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('✗'));
  const markers = {};
  for (const l of text.split('\n')) {
    const k = l.trim().match(/^(OVER|WIDE|THIN|COUNT)\b/);
    if (k) markers[k[1]] = (markers[k[1]] || 0) + 1;
  }
  return {
    checksRun: run ? Number(run[1]) : null,
    verdict: verdicts.length ? verdicts[verdicts.length - 1] : null,
    marked, markers,
    /* Green means the harness RAN and said nothing bad. A missing CHECKS_RUN is
       neither pass nor fail — it is no result, and it has to read as a problem. */
    ok: !!run && Number(run[1]) > 0 && !marked.length
      && (verdicts.length ? verdicts[verdicts.length - 1] === 'no failures' : true),
  };
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node tools/read-harness.mjs <dumped-dom.html> [...]');
  process.exit(2);
}
let bad = 0;
for (const f of files) {
  const r = readHarness(fs.readFileSync(f, 'utf8'));
  const name = f.replace(/^.*\//, '');
  const bits = [
    `CHECKS_RUN=${r.checksRun ?? 'MISSING — the harness did not finish, which is not a pass'}`,
    r.verdict ? `verdict: ${r.verdict}` : `no verdict line; ${r.marked.length} check${r.marked.length === 1 ? '' : 's'} marked failing`,
  ];
  if (Object.keys(r.markers).length) bits.push(Object.entries(r.markers).map(([k, v]) => `${k}=${v}`).join(' '));
  console.log(`${name.padEnd(16)} ${bits.join('  ·  ')}`);
  for (const l of r.marked.slice(0, 12)) console.log(`   ${l.slice(0, 120)}`);
  if (!r.checksRun) bad++;
}
process.exit(bad ? 1 : 0);
