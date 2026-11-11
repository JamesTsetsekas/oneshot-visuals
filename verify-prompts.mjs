import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const path = new URL('./prompts.md', import.meta.url);
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
if (process.argv.includes('--repair')) {
  text = text.slice(text.indexOf('# Oneshot Canvas:'));
  text = text.replace('If budget allows, run each of the 30 cells twice and score the better (report both).', 'A later registered cohort should use three trials and average all attempts; never select the better attempt.');
}
let count = 0;
for (const m of text.matchAll(/^````frozen-([A-Za-z0-9-]+)\n([\s\S]*?)\n````$/gm)) {
  const hash = createHash('sha256').update(m[2]).digest('hex');
  const row = new RegExp('(\\| ' + m[1] + ' \\|[^\\n]*`)([a-f0-9]+)(` \\|)');
  const actual = text.match(row)?.[2];
  if (process.argv.includes('--repair')) text = text.replace(row, (_, a, b, c) => a + hash + c);
  else if (actual !== hash) throw new Error(`Manifest mismatch: ${m[1]}`);
  count++;
}
if (count !== 7) throw new Error(`Expected seven blocks, found ${count}`);
if (process.argv.includes('--repair')) writeFileSync(path, text);
console.log(`Verified ${count} candidate block hashes. This does not validate the mathematics or freeze the suite.`);
