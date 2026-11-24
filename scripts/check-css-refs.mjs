// A component's CSS may only read a token that its page is sure to have. That means tokens.css, base.css, its own file, or the CSS
// files its module imports. Splitting the sheet by owner can leave a rule reading a token another component declares, and on a page
// without that component the value silently falls back. Run after npm run build (it reads dist/tokens.css).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const declared = (file) => {
  const set = new Set();
  postcss.parse(readFileSync(file, 'utf8')).walkDecls((d) => { if (d.prop.startsWith('--')) set.add(d.prop); });
  return set;
};
const always = new Set([...declared(join(root, 'dist/tokens.css')), ...declared(join(root, 'src/base.css'))]);

const modules = [];
const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = join(d, e.name);
  if (e.isDirectory()) walk(p);
  else if (/\.tsx$/.test(e.name) && !e.name.endsWith('.test.tsx')) modules.push(p);
});
walk(join(root, 'src'));

const problems = [];
for (const mod of modules) {
  const sheets = [...readFileSync(mod, 'utf8').matchAll(/^import '([^']+\.css)';/gm)].map((m) => resolve(dirname(mod), m[1]));
  const own = sheets.filter((s) => !s.endsWith('base.css') && existsSync(s));
  /* A custom property the component sets in its own style object ({ '--list-columns': cols }) is there on the element it draws */
  const inline = [...readFileSync(mod, 'utf8').matchAll(/'(--[\w-]+)':/g)].map((m) => m[1]);
  /* A token another component sets in its own style object is there on every element that component draws, and only its rules
     read it, so a page importing that component's sheet (CanvasStage imports Monitor.css for its guides) is not missing it */
  const owners = own.map((s) => s.replace(/\.css$/, '.tsx')).filter((t) => t !== mod && existsSync(t));
  const theirs = owners.flatMap((t) => [...readFileSync(t, 'utf8').matchAll(/'(--[\w-]+)':/g)].map((m) => m[1]));
  const have = new Set([...always, ...inline, ...theirs, ...own.flatMap((s) => [...declared(s)])]);
  for (const sheet of own) {
    postcss.parse(readFileSync(sheet, 'utf8')).walkDecls((d) => {
      for (const m of d.value.matchAll(/var\((--[\w-]+)\s*(,)?/g)) {
        if (!m[2] && !have.has(m[1])) problems.push(`${relative(root, sheet)} reads ${m[1]}, which ${relative(root, mod)}'s page may not have`);
      }
    });
  }
}
const unique = [...new Set(problems)];
if (unique.length) { console.error(unique.join('\n')); process.exit(1); }
console.log('Every token a component reads is declared on its page');
