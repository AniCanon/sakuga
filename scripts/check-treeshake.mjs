// Builds check/treeshake, a page that imports only Button, against dist/ as an app would install the package, and fails if
// anything it did not ask for reached its script or CSS. Run after npm run build. The page is typechecked here too, against dist's
// declarations as an app sees them, not in npm run typecheck, where dist may not exist yet.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, symlinkSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'check/treeshake');
const link = join(app, 'node_modules/@anicanon/sakuga');
if (!existsSync(link)) {
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync('../../../..', link);
}
execFileSync(join(root, 'node_modules/.bin/tsc'), ['-p', join(app, 'tsconfig.json'), '--noEmit'], { stdio: 'inherit' });
execFileSync(join(root, 'node_modules/.bin/vite'), ['build', '--config', join(app, 'vite.config.mjs')], { stdio: 'inherit' });

const out = join(app, 'out/assets');
const files = readdirSync(out);
const read = (f) => readFileSync(join(out, f), 'utf8');
const entry = files.find((f) => /^index-.*\.js$/.test(f));
const js = read(entry), css = files.filter((f) => f.endsWith('.css')).map(read).join('\n');
const problems = [];
const expect = (ok, what) => { if (!ok) problems.push(what); };

expect(js.includes('sk-btn'), 'Button is missing from the page script');
expect(!js.includes('#8B6CF0'), 'FragmentSoul (AniCanonKit) reached a page that uses only the core');
expect(!js.includes('sk-provider'), 'ProviderButton reached a page that never imports it');
expect(!js.includes('contenteditable'), 'focus helpers reached a page whose components do not use them');
expect(!js.includes('data:audio/mpeg'), 'the sound files are inside the page script');
expect(files.some((f) => f.endsWith('.js') && f !== entry && read(f).includes('data:audio/mpeg')), 'the sounds are not a chunk of their own');
expect(!js.includes('<symbol'), 'icon drawings are inside the page script');
expect(files.some((f) => f.endsWith('.svg')), 'the icon sprite was not emitted as a file');
expect(css.includes('.sk-btn{'), "Button's CSS is missing");
expect(css.includes('--button-gap'), "Button's tokens are missing");
expect(!css.includes('.sk-provider'), "ProviderButton's CSS reached a page that never imports it");
expect(css.includes('--bg-surface') || css.includes('--text-primary'), 'tokens.css is missing');
expect(css.includes('@font-face'), 'fonts.css is missing');

/* What a browser downloads for this page, compressed. Each limit sits a little above what the page measures, so a component or
   a token change that grows every page fails here instead of passing unseen. Raise one only for growth that is meant, and say here
   what every page now carries for it. The script carries the core's shared words (the words more than one part says; each component
   brings its own), so a page that only takes a button notices any word or part that reaches it. The CSS carries base.css: the roles
   block (radius, timing, size and opacity roles, the space steps from space-base), the greys and alphas derived from neutral-base,
   Sakuga's own scrollbars inside .sk-root, the warning role, and Button's busy state, which brings the Loader's drawing to every page
   with a button. The icons carry the sprite, the traced trait icons among them. */
const sprite = files.filter((f) => f.endsWith('.svg')).map(read).join('');
const gz = (s) => gzipSync(s, { level: 9 }).length;
const limits = { script: [gz(js), 62_050], css: [gz(css), 22_800], icons: [gz(sprite), 96_000] };
for (const [what, [size, limit]] of Object.entries(limits)) expect(size <= limit, `the page's ${what} is ${size} bytes compressed, over its ${limit}`);

/* The same for a page that uses one AniCanonKit component: SpendButton reaches the core through its public entry, so the page
   carries Button and the fragment mark and none of the core's other components. */
const kitApp = join(app, 'kit');
const kitLink = join(kitApp, 'node_modules/@anicanon/sakuga');
if (!existsSync(kitLink)) {
  mkdirSync(dirname(kitLink), { recursive: true });
  symlinkSync('../../../../..', kitLink);
}
execFileSync(join(root, 'node_modules/.bin/tsc'), ['-p', join(kitApp, 'tsconfig.json'), '--noEmit'], { stdio: 'inherit' });
execFileSync(join(root, 'node_modules/.bin/vite'), ['build', '--config', join(kitApp, 'vite.config.mjs')], { stdio: 'inherit' });
const kitOut = join(kitApp, 'out/assets'), kitFiles = readdirSync(kitOut);
const kitJs = readFileSync(join(kitOut, kitFiles.find((f) => /^index-.*\.js$/.test(f))), 'utf8');
const kitCss = kitFiles.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(kitOut, f), 'utf8')).join('\n');
expect(kitJs.includes('sk-btn') && kitCss.includes('.sk-btn{'), "SpendButton's page is missing Button");
/* A component's own class as its markup names it ("sk-dialog"), not a selector a shared helper lists (".sk-dialog-scrim") */
for (const part of ['sk-dialog', 'sk-timeline', 'sk-picker', 'sk-sidenav']) {
  expect(!kitJs.includes(`"${part}"`) && !kitCss.includes('.' + part + '{'), `${part} reached a page that uses only SpendButton`);
}
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`compressed: page script ${kb(limits.script[0])} (React included), CSS ${kb(limits.css[0])}, icons ${kb(limits.icons[0])}`);
if (problems.length) {
  console.error('\nTree-shaking check failed:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Tree-shaking check passed');
