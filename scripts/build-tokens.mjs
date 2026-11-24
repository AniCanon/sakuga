// Compiles src/tokens/tokens.json into dist/tokens.css, and the copy the workbench reads (check/.generated/tokens.css): dark
// first, a light block that re-declares every alias, the theme-stable scales and the type classes, then the dimension roles
// (src/tokens/roles.css). It follows
// apps/site/scripts/compile_tokens.py in sakuga-web line for line, so the site and the package declare the same values.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] ?? join(root, 'dist/tokens.css');
const d = JSON.parse(readFileSync(join(root, 'src/tokens/tokens.json'), 'utf8'));
const roles = readFileSync(join(root, 'src/tokens/roles.css'), 'utf8');

const ref = (v) => String(v).replace(/\{([\w-]+)\}/g, 'var(--$1)');
const pick = (v, theme) => (v !== null && typeof v === 'object' ? v[theme] : v);
const line = (name, val, usage) => `  --${name}: ${ref(val)};` + (usage ? ` /* ${usage} */` : '');
const themed = (v) => v !== null && typeof v === 'object';

const L = [`/* ${d.name} — generated from tokens.json by scripts/build-tokens.mjs */`, ':root, [data-theme="dark"] {'];
for (const t of [...d.color.tokens, ...d.shadow.tokens]) L.push(line(t.name, pick(t.value, 'dark'), t.usage));
L.push('}', '[data-theme="light"] {');
for (const t of d.color.tokens) if (themed(t.value) || String(t.value).includes('{')) L.push(line(t.name, pick(t.value, 'light')));
for (const t of d.shadow.tokens) if (themed(t.value)) L.push(line(t.name, t.value.light));
L.push('}', ':root {');
/* Size and blur live in the roles block of base.css, not in tokens.json; a family the pinned version doesn't carry is skipped */
for (const group of ['spacing', 'radius', 'size', 'layout', 'blur', 'opacity', 'motion']) {
  for (const t of d[group]?.tokens ?? []) L.push(line(t.name, t.value, t.usage));
}
for (const [fam, stack] of Object.entries(d.type.families)) L.push(line('font-' + fam, stack));
const styles = d.type.groups.flatMap((g) => g.styles.map((s) => [g.family, s]));
for (const [fam, s] of styles) L.push(line('text-' + s.name, `${s.fontWeight} ${s.fontSize}/${s.lineHeight} var(--font-${fam})`, s.usage));
L.push('}');
for (const [fam, s] of styles) {
  L.push(`.${s.name} {`, `  font-family: var(--font-${fam});`, `  font-size: ${s.fontSize};`, `  line-height: ${s.lineHeight};`,
    `  font-weight: ${s.fontWeight};`, `  letter-spacing: ${s.letterSpacing ?? 0};`, '}');
}

const css = L.join('\n') + '\n' + roles;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);

/* The workbench and the parity page import this copy, not dist/tokens.css: npm run build empties dist/ first, and a running Ladle
   would lose its tokens until the build wrote them back. Written only when it changes, so a build does not reload them. */
const stable = join(root, 'check/.generated/tokens.css');
if (!existsSync(stable) || readFileSync(stable, 'utf8') !== css) {
  mkdirSync(dirname(stable), { recursive: true });
  writeFileSync(stable, css);
}
