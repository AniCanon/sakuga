// Builds dist/: one ES module per source file (tsc keeps the module graph, which is what lets a bundler drop what a page never
// imports), each component's CSS beside its module, tokens.css, the fonts and the icon sprite.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src'), dist = join(root, 'dist');

execFileSync(process.execPath, [join(root, 'scripts/build-icons.mjs')], { stdio: 'inherit' });

rmSync(dist, { recursive: true, force: true });
execFileSync(join(root, 'node_modules/.bin/tsc'), ['-p', join(root, 'tsconfig.build.json')], { stdio: 'inherit' });

function copy(dir, keep) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const from = join(dir, e.name);
    if (e.isDirectory()) { copy(from, keep); continue; }
    if (!keep(e.name)) continue;
    const to = join(dist, relative(src, from));
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to);
  }
}
copy(src, (name) => /\.(css|woff2|svg)$/.test(name) && name !== 'roles.css');
execFileSync(process.execPath, [join(root, 'scripts/build-tokens.mjs'), join(dist, 'tokens.css')], { stdio: 'inherit' });
