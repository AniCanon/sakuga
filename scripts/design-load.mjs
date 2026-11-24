// Loads a version of the reference files into .design/: `node scripts/design-load.mjs <dir>`, with <dir> holding bundle.js, bundle.css,
// index.d.ts, tokens.json, README.md, previews/ and blobs/. Replaces .design/ with them and prints the hashes design.json pins.
// .design/ is git-ignored and never committed.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { designDir } from './design.mjs';

const [dir] = process.argv.slice(2);
if (!dir) { console.error('Usage: node scripts/design-load.mjs <dir>'); process.exit(1); }
const pinned = ['bundle.js', 'bundle.css', 'index.d.ts', 'tokens.json'];
for (const f of [...pinned, 'README.md', 'previews', 'blobs']) if (!existsSync(join(dir, f))) { console.error(`${dir} has no ${f}`); process.exit(1); }
rmSync(designDir, { recursive: true, force: true });
cpSync(resolve(dir), designDir, { recursive: true });
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
console.log(JSON.stringify(Object.fromEntries(pinned.map((f) => [f, sha(join(designDir, f))])), null, 2));
