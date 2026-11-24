// Every drawing a ported component carries (an SVG path's d) must be the one Sakuga Version 221 draws: a path typed by hand
// drifts by a digit and nothing else notices.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { readDesign, root, skipWithoutDesign } from './design.mjs';
skipWithoutDesign('check:reference');

const ref = readDesign('bundle.js');
const bad = [];
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx$/.test(e.name) && !e.name.endsWith('.test.tsx')) {
      for (const m of readFileSync(p, 'utf8').matchAll(/\bd="([^"]{12,})"/g)) if (!ref.includes(m[1])) bad.push(`${relative(root, p)}: ${m[1].slice(0, 48)}…`);
    }
  }
};
walk(join(root, 'src'));
if (bad.length) { console.error('Paths that are not in the reference bundle:\n' + bad.join('\n')); process.exit(1); }
console.log('Every path matches the reference');
