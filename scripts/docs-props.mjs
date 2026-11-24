// `npm run docs:props`: writes each component README's "## Props" table from the shipped declarations (scripts/readme-props.mjs).
// Change a prop's doc in the code, then run this; `npm run check:docs` fails while a README's table differs from what it writes.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { components, program, propsSection, root, withProps } from './readme-props.mjs';

const prog = program();
let changed = 0;
for (const c of components(prog)) {
  const path = join(c.dir, 'README.md');
  const text = readFileSync(path, 'utf8');
  if (!/^## Props$/m.test(text)) { console.error(`${relative(root, path)}: no "## Props" section`); process.exitCode = 1; continue; }
  const next = withProps(text, propsSection(prog, c));
  if (next !== text) { writeFileSync(path, next); changed++; console.log(`${relative(root, path)}: props written`); }
}
console.log(`${changed} README${changed === 1 ? '' : 's'} changed`);
