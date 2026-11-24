// Keeps the repository's prose about the components, not about who decided them. A README, a doc or a comment states the rule;
// it never carries a person's name, the private design folder's name, or a dated or versioned ruling. Fails on any tracked text
// file that does, outside sample data: stories, tests and tokens.json, and the dates the component list records.
// `--fix` strips the dated and versioned asides a README copied from the design brings with it; a name or a ruling in prose is
// rewritten by hand, as a plain statement of the rule. Needs no install: `node scripts/check-provenance.mjs`.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

const SELF = 'scripts/check-provenance.mjs';
const fix = process.argv.includes('--fix');

/* Sample data may name people and dates; the component list records when each component was checked */
const SAMPLE = [/\.stories\.tsx?$/, /\.test\.(t|j)sx?$/, /\.test\.mjs$/, /^e2e\/.*\.spec\.ts$/, /(^|\/)tokens\.json$/, /^docs\/components\.json$/];
const SKIP = new Set([SELF, 'package-lock.json']);
const TEXT = new Set(['.md', '.mjs', '.js', '.ts', '.tsx', '.css', '.json', '.html', '.yml', '.yaml', '']);

/* Pieces are joined so this file does not match its own patterns */
const j = (...p) => p.join('');
/* Asides --fix can drop on its own: "(Name, 2026-10-30)", "(since Version 172)", "(Version 234)" */
const ASIDES = [
  [/ ?\([^()\n]*\b20\d\d-\d\d-\d\d\b[^()\n]*\)/g, 'a dated aside'],
  [new RegExp(String.raw` ?\((since )?` + j('Vers', 'ions?') + String.raw` \d+( to \d+)?\)`, 'g'), 'a versioned aside'],
];
const PROSE = [
  [new RegExp(String.raw`\b(${j('Ra', 'ul')}|${j('I', 'an')})\b`), "a person's name"],
  [new RegExp(j('anicanon', '-designs'), 'i'), "the private design folder's name"],
  [/\b20\d\d-\d\d-\d\d\b/, 'a date'],
  [new RegExp(String.raw`\b(${j('Deci', 'ded')} (on|by)|${j('rul', 'ing')}s?|${j('was', ' approved')}|${j('approved', ' by')}|${j('the ', 'call')} of|${j('the ', 'call')},)\b`, 'i'), 'a ruling'],
  /* A version as history ("Version 125 broke this", "with Version 244", "since Version 172"); the generated "split from Sakuga Version N's
     bundle.css" headers and the scripts that pin the reference name the version they read, which is a fact, not a ruling */
  [new RegExp(String.raw`\b(with|since|until|after|before) ${j('Vers', 'ions?')} \d+|\b${j('Vers', 'ions?')} \d+( to \d+)? (broke|folded|added|moved|mended|changed|gave|brought|introduced|dropped|went|made)\b`, 'i'), 'a version as history'],
];
/* In the docs and READMEs, any numbered version in prose: they describe the pinned design, never one version of it */
const DOC_VERSION = [new RegExp(String.raw`\b${j('Vers', 'ions?')} \d{2,}\b`), 'a numbered version in prose'];
/* Dates code needs, not prose: a calendar's fixed first week */
const CODE_DATES = new Set(['src/ui/DateField/DateField.tsx']);

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean)
  .filter((f) => existsSync(f) && !SKIP.has(f) && !SAMPLE.some((r) => r.test(f)) && TEXT.has(extname(f).toLowerCase()));
const problems = [];

for (const f of tracked) {
  let text = readFileSync(f, 'utf8');
  if (text.includes('\0')) continue;
  if (fix && f.endsWith('.md')) {
    const fixed = ASIDES.reduce((t, [re]) => t.replace(re, ''), text);
    if (fixed !== text) { writeFileSync(f, fixed); text = fixed; console.log(`${f}: dated and versioned asides stripped`); }
  }
  let fence = false;
  text.split('\n').forEach((line, i) => {
    /* A README's Example is sample data: its dates are the example's, never a record of when something was decided */
    if (f.endsWith('.md') && line.startsWith('```')) fence = !fence;
    for (const [re, what] of [...ASIDES, ...PROSE, ...(f.endsWith('.md') ? [DOC_VERSION] : [])]) {
      if (what === 'a date' && CODE_DATES.has(f)) continue;
      if (fence && (what === 'a date' || what === 'a dated aside')) continue;
      re.lastIndex = 0;
      if (re.test(line)) problems.push(`${f}:${i + 1}: ${what}`);
    }
  });
}

if (problems.length) {
  console.error('Docs and comments state the rule, not who decided it or when. Found:\n' + problems.map((p) => '  ' + p).join('\n') +
    '\nRewrite each as a plain statement of the rule; `node scripts/check-provenance.mjs --fix` strips dated and versioned asides in READMEs.');
  process.exit(1);
}
console.log(`Provenance check passed: ${tracked.length} tracked files state their rules without names, dates or rulings`);
