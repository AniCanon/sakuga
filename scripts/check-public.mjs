// Keeps private material out of the public repository. Fails on any tracked file that is
//  - an image, audio or video outside an explicit allowlist (the icon sprite, the fonts, the Sakuga logo),
//    or text that embeds one as a data: URI outside the same list (the sound files);
//  - anything under .design/, .snapshots/ or the old e2e/__screenshots__/;
//  - text that links to claude.ai, names an artifact id, or points at a private host (r2.dev, AniCanon's API, railway).
// Needs no install: `node scripts/check-public.mjs`. Runs in `npm run check`, the pre-commit hook and CI.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';

/* Sakuga's own media, and the only places it may live. Add to this list on purpose, never to get a check to pass. */
const ALLOWED_MEDIA = [
  'src/icons/icons.svg',
  /^src\/fonts\/[a-z0-9-]+\.woff2$/,
  'assets/sakuga-logo.png',
];
/* Sakuga's own UI sounds, embedded as data: URIs */
const ALLOWED_EMBEDDED_MEDIA = ['src/ui/sound/files.ts'];

const MEDIA = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.heic', '.bmp', '.tif', '.tiff', '.ico', '.svg',
  '.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus', '.mp4', '.m4v', '.mov', '.webm', '.mkv', '.avi',
  '.woff', '.woff2', '.ttf', '.otf', '.eot']);
const PRIVATE_DIRS = [/^\.design\//, /^\.snapshots\//, /^e2e\/__screenshots__\//, /^reference\//];
const SELF = 'scripts/check-public.mjs';
const SKIP_CONTENT = new Set([SELF, 'package-lock.json']);

/* Pieces are joined so this file does not match its own patterns */
const j = (...p) => p.join('');
const PRIVATE_TEXT = [
  [new RegExp(j('claude', String.raw`\.ai`), 'i'), 'a claude.ai link'],
  [/\bartifacts?[/_-][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, 'an artifact id'],
  [new RegExp(String.raw`\br2\.` + 'dev\\b', 'i'), 'a private host (r2' + '.dev)'],
  [new RegExp(String.raw`\banicanon\.app/(api|trpc|graphql|v\d)`, 'i'), "AniCanon's API"],
  [new RegExp(String.raw`\bapi\.anicanon\.app\b`, 'i'), "AniCanon's API"],
  [new RegExp(String.raw`\b[a-z0-9-]+\.` + 'railway' + String.raw`\.(app|internal)\b`, 'i'), 'a railway host'],
  [new RegExp(String.raw`\blinear\.app/`, 'i'), 'a Linear link'],
  [/data:(image\/(png|jpe?g|gif|webp|avif)|video\/[a-z0-9.+-]+|audio\/[a-z0-9.+-]+)[;,]/i, 'embedded image, video or audio'],
];

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean).filter(f => existsSync(f));
const allowedMedia = (f) => ALLOWED_MEDIA.some(a => (typeof a === 'string' ? a === f : a.test(f)));
const problems = [];

for (const f of tracked) {
  if (PRIVATE_DIRS.some(r => r.test(f))) { problems.push(`${f}: private folder, never committed`); continue; }
  if (MEDIA.has(extname(f).toLowerCase()) && !allowedMedia(f)) problems.push(`${f}: image, audio, video or font not on the allowlist in ${SELF}`);
  if (SKIP_CONTENT.has(f) || MEDIA.has(extname(f).toLowerCase())) continue;
  const text = readFileSync(f, 'utf8');
  if (text.includes('\0')) { problems.push(`${f}: unknown binary file`); continue; }
  const lines = text.split('\n');
  for (const [re, what] of PRIVATE_TEXT) {
    if (what === 'embedded image, video or audio' && ALLOWED_EMBEDDED_MEDIA.includes(f)) continue;
    const i = lines.findIndex(l => re.test(l));
    if (i >= 0) problems.push(`${f}:${i + 1}: ${what}`);
  }
}

const ignore = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8').split('\n').map(l => l.trim()) : [];
for (const need of ['.design/', '.snapshots/']) if (!ignore.includes(need)) problems.push(`.gitignore: must list ${need}`);

if (problems.length) {
  console.error('This repository must stay free of private material. Found:\n' + problems.map(p => '  ' + p).join('\n'));
  process.exit(1);
}
console.log(`Public check passed: ${tracked.length} tracked files hold no private media, folders, links or hosts`);
