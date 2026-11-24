// AniCanonKit is built on Sakuga, never the other way: nothing in the core (src/ui, src/internal, src/icons, src/tokens) may import
// from src/anicanonkit. A core that knows AniCanon's parts cannot be used without them.
// AniCanonKit takes the core the way an app does, from '@anicanon/sakuga/ui', so the core's public entry is all it leans on. The
// exceptions are named: the core parts AniCanonKit draws with that are not for apps (PARTS), and a core component's CSS where a kit
// component draws that component's markup itself. A new one is then a decision, not an accident.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const kit = join(root, 'src/anicanonkit'), core = join(root, 'src/ui');
const PARTS = ['CutFace/CutFace', 'MoreWrap/MoreWrap', 'Picker/option', 'SliderRow/SliderRow', 'sound/sound'].map((p) => join(core, p));
const bad = [];
const walk = (d, visit) => readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = join(d, e.name);
  if (e.isDirectory()) return walk(p, visit);
  if (/\.(ts|tsx)$/.test(e.name)) visit(p);
});
const imports = (p) => [...readFileSync(p, 'utf8').matchAll(/(?:from|import)\s*\(?\s*'(\.[^']+)'/g)].map((m) => [m[1], resolve(dirname(p), m[1])]);

walk(join(root, 'src'), (p) => {
  if (p.startsWith(kit)) return;
  for (const [spec, to] of imports(p)) if (to.startsWith(kit)) bad.push(`${relative(root, p)} imports ${spec}: the core imports AniCanonKit`);
});
walk(kit, (p) => {
  if (/\.(test|stories)\.tsx?$/.test(p)) return;
  for (const [spec, to] of imports(p)) {
    if (!to.startsWith(core + '/') || to.endsWith('.css') || PARTS.includes(to)) continue;
    bad.push(`${relative(root, p)} imports ${spec}: AniCanonKit takes the core from '@anicanon/sakuga/ui'`);
  }
});
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log('The core imports nothing from AniCanonKit, and AniCanonKit takes the core from its public entry');
