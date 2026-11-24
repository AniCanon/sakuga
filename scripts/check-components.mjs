// The component list (docs/components.json) is what an updates page reads, so every component in it carries the version its
// README states, and every component folder is in it. The READMEs come from the design system with each port; the list is filled from
// them with --write, never edited by hand, so the two cannot drift. llms.txt, the index a model reads first, is written from the list
// in the same step and checked the same way.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { design, root } from './design.mjs';

const listPath = join(root, 'docs/components.json');
const list = JSON.parse(readFileSync(listPath, 'utf8'));
const internal = Object.keys(JSON.parse(readFileSync(join(root, 'scripts/css-owners.json'), 'utf8')).internal || {});
const write = process.argv.includes('--write');

const libraries = { ui: { library: 'Core', package: '@anicanon/sakuga/ui' }, anicanonkit: { library: 'Kit', package: '@anicanon/sakuga/anicanonkit' } };
const folders = Object.keys(libraries).flatMap((lib) =>
  readdirSync(join(root, 'src', lib), { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(root, 'src', lib, e.name, e.name + '.tsx')) && !internal.includes(e.name))
    .map((e) => ({ name: e.name, lib, readme: join(root, 'src', lib, e.name, 'README.md') })),
);

const line = (text, label) => (text.match(new RegExp('^' + label + ': (.+)$', 'm')) || [])[1]?.trim();
/* The Accessibility section's words, without the Used on and Version lines that close it */
const access = (text) => (text.split(/^## Accessibility\n/m)[1] || '').split(/^(Used on|Version): /m)[0].replace(/\s+/g, ' ').trim() || undefined;

/* The README's own words for a new entry: its first paragraph, its "Use it for" line and its "Not for … use X" lines */
function entryFrom(f, text) {
  const body = text.replace(/^# .*\n+/, '');
  const summary = body.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  const when = text.split('## When to use')[1] || '';
  const use = (when.match(/^Use it (?:for )?(.+)/m) || [])[1]?.trim();
  const instead = [...when.matchAll(/^- Not for (.+?): use `([^`]+)`/gm)].map((m) => ({ when: m[1], use: m[2] }));
  return {
    name: f.name, title: f.name, ...libraries[f.lib], summary, use, instead,
    url: list.site + '/components#' + f.name,
    accessibility_declared: { design: access(text), gap: '' },
  };
}

const problems = [];
/* Each README's own "Use it …" sentence, as written, for llms.txt */
const useLines = new Map();
for (const f of folders) {
  if (!existsSync(f.readme)) { problems.push(`${f.name}: no README`); continue; }
  const text = readFileSync(f.readme, 'utf8');
  const version = line(text, 'Version'), usedOn = line(text, 'Used on');
  for (const [label, value] of [['Version', version], ['Used on', usedOn]]) {
    if (!value) problems.push(`${f.name}: its README has no "${label}:" line`);
  }
  if (!access(text)) problems.push(`${f.name}: its README has no Accessibility section`);
  if (!text.includes('## When to use')) problems.push(`${f.name}: its README has no "When to use"`);
  let entry = list.components.find((c) => c.name === f.name);
  if (!entry) {
    if (!write) { problems.push(`${f.name}: not in the component list`); continue; }
    entry = entryFrom(f, text);
    list.components.push(entry);
  }
  const usedOnList = usedOn ? usedOn.split(',').map((s) => s.trim()) : undefined;
  useLines.set(f.name, ((text.split('## When to use')[1] || '').match(/^Use it .+$/m) || [])[0]);
  /* What the README says the component is and when to use it is the README's: the list follows it */
  const own = entryFrom(f, text);
  if (write) {
    for (const [k, v] of Object.entries(own)) if (!entry[k] || (Array.isArray(entry[k]) && !entry[k].length)) entry[k] = v;
    for (const k of ['summary', 'use', 'instead']) entry[k] = own[k];
    entry.accessibility_declared = { ...entry.accessibility_declared, design: own.accessibility_declared.design };
    entry.version = version;
    entry.used_on = usedOnList;
  } else {
    for (const k of ['summary', 'use', 'instead']) if (JSON.stringify(entry[k]) !== JSON.stringify(own[k])) problems.push(`${f.name}: the list's ${k} differs from its README's`);
    if (entry.version !== version) problems.push(`${f.name}: the list says ${entry.version ?? 'no version'}, its README ${version}`);
    if (JSON.stringify(entry.used_on) !== JSON.stringify(usedOnList)) problems.push(`${f.name}: the list's used_on differs from its README's "Used on"`);
    for (const k of ['summary', 'use', 'package', 'library']) if (!entry[k]) problems.push(`${f.name}: its list entry has no ${k}`);
  }
}
for (const c of list.components) if (!folders.some((f) => f.name === c.name)) problems.push(`${c.name}: in the list, but no component folder has it`);
const number = String(design.version);
if (list.version !== number) {
  if (write) list.version = number;
  else problems.push(`the list says Version ${list.version}, design.json pins ${number}`);
}

/* The README's "Use it …" sentence after the summary, unless it only says the summary again: fewer than four words of its own */
const words = (s) => new Set((s.toLowerCase().match(/[a-z]{4,}/g) || []));
function whenToUse(c) {
  const line = useLines.get(c.name);
  if (!line) return '';
  const said = words(c.summary);
  return [...words(line)].filter((w) => !said.has(w)).length < 4 ? '' : ' ' + line;
}
/* llms.txt: the package in a paragraph, then one line per component: its name linked to its README, what it is, and when to use it */
const llmsPath = join(root, 'llms.txt');
const librariesOrder = [['Core', '@anicanon/sakuga/ui', 'ui'], ['Kit', '@anicanon/sakuga/anicanonkit', 'anicanonkit']];
const llms = [
  '# Sakuga',
  '',
  '> AniCanon\u2122\'s design system for the web: typed, tree-shakeable React components in two libraries, the core (`@anicanon/sakuga/ui`) and AniCanonKit (`@anicanon/sakuga/anicanonkit`), built on AniCanon\'s tokens. Each component\'s README says what it is, when to use it and when not, how it works, its props (generated from the shipped types), an example that compiles, and how it is reached and read.',
  '',
  'Import a component from its library, wrap the app in `<Sakuga>` (from `@anicanon/sakuga/ui`), and load `@anicanon/sakuga/tokens.css` and `@anicanon/sakuga/fonts.css` once.',
  ...librariesOrder.flatMap(([library, pkg, dir]) => [
    '',
    `## ${library === 'Core' ? 'Core' : 'AniCanonKit'} (\`${pkg}\`)`,
    '',
    ...list.components.filter((c) => c.library === library).sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => `- [${c.name}](src/${dir}/${c.name}/README.md): ${c.summary}${whenToUse(c)}`),
  ]),
  '',
].join('\n');

if (write) {
  writeFileSync(listPath, JSON.stringify(list, null, 1) + '\n');
  writeFileSync(llmsPath, llms);
  console.log(`Filled ${listPath.slice(root.length + 1)} and llms.txt from the READMEs`);
} else if (!existsSync(llmsPath) || readFileSync(llmsPath, 'utf8') !== llms) problems.push('llms.txt differs from the component list');
if (!write && problems.length) {
  console.error('The component list and the READMEs disagree:\n' + problems.join('\n') + '\nRun node scripts/check-components.mjs --write once the READMEs are right.');
  process.exit(1);
}
if (!write) console.log(`Every one of the ${folders.length} components is in the list at its README's version`);
