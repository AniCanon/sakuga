// Splits Sakuga Version 221's one stylesheet (the design's bundle.css, fetched by npm run design:fetch) by component, so each component ships only its own CSS.
//
// Who owns what:
//   - a custom property belongs to the component its `/* Name */` label names in bundle.css; an unlabelled one goes by the longest
//     labelled prefix it shares, and anything left to base;
//   - a selector belongs to the component that draws its first sk- class (sk-btn--md and sk-btn__cost are sk-btn), read from the
//     component functions in the design's bundle.js; scripts/css-owners.json settles a class two components draw, and a token
//     two components read ("props");
//   - keyframes, selectors with no sk- class, and a :where() reset naming several components' classes belong to base.
// A rule whose selector list spans components is split, so every owner's file holds its own selectors; @media wrappers follow.
//
//   node scripts/css-split.mjs --report            owners, with any class or label it could not place
//   node scripts/css-split.mjs --write Button Icon write src/<tier>/<Name>/<Name>.css (refuses to overwrite without --force)
//   node scripts/css-split.mjs --write base        write src/base.css
//   node scripts/css-split.mjs --coverage          what bundle.css declares that no file under src/ does yet
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import { readDesign as ref, root, skipWithoutDesign } from './design.mjs';
skipWithoutDesign('css-split');
const js = ref('bundle.js');
const css = postcss.parse(ref('bundle.css'));
const overrides = JSON.parse(readFileSync(join(root, 'scripts/css-owners.json'), 'utf8'));
/* The public components, and the internal parts scripts/css-owners.json names ("internal"): a part two components draw, with its own file */
const tiers = { ...Object.fromEntries(JSON.parse(readFileSync(join(root, 'docs/components.json'), 'utf8')).components.map((c) => [c.name, c.library === 'Core' ? 'ui' : 'anicanonkit'])), ...(overrides.internal || {}) };

/* The public components and the functions that draw them: window.Sakuga = { Icon: Icon, ... } and window.AniCanonKit = { Loader: MarkLoader, ... } */
const publicOf = {};
for (const ns of ['Sakuga', 'AniCanonKit']) {
  const m = js.match(new RegExp(`window\\.${ns} = \\{([^}]*)\\}`));
  for (const pair of m[1].split(',')) {
    const [key, fn] = pair.split(':').map((s) => s.trim());
    /* AniCanonKit.Loader is the AniCanonLoader component, beside the core's own Loader */
    const name = ns === 'AniCanonKit' && tiers[key] !== 'anicanonkit' ? 'AniCanon' + key : key;
    if (tiers[name] && !(fn in publicOf)) publicOf[fn] = name;
  }
}
/* Each top-level function's own body, to its closing brace: the constants between functions belong to none of them */
function closing(at) {
  let depth = 0, quote = null;
  for (let i = js.indexOf('{', at); i < js.length; i++) {
    const c = js[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  return js.length;
}
const fnRe = /^ {2}function ([A-Za-z]\w*)\(/gm;
const starts = [];
for (let m; (m = fnRe.exec(js));) starts.push({ name: m[1], at: m.index });
/* A regex literal can fool the brace count; a body never runs past the next top-level function */
const fns = starts.map((f, i) => ({ name: f.name, body: js.slice(f.at, Math.min(closing(f.at), starts[i + 1]?.at ?? js.length)) }));

/* A helper's classes belong to the public components that call it */
function publicCallers(fn, seen = new Set()) {
  if (publicOf[fn]) return [publicOf[fn]];
  if (seen.has(fn)) return [];
  seen.add(fn);
  const callers = fns.filter((f) => f.name !== fn && new RegExp(`\\b${fn}\\b`).test(f.body)).map((f) => f.name);
  return [...new Set(callers.flatMap((c) => publicCallers(c, seen)))];
}

const blockOf = (cls) => cls.replace(/(--|__).*$/, '');
const classOwners = {};
for (const f of fns) {
  for (const m of f.body.matchAll(/sk-[a-z0-9]+(?:-[a-z0-9]+)*/g)) {
    const b = blockOf(m[0]);
    (classOwners[b] ??= new Set());
    for (const p of publicCallers(f.name)) classOwners[b].add(p);
  }
}
const ambiguous = {};
function ownerOfClass(b) {
  if (overrides.classes[b]) return overrides.classes[b];
  const set = classOwners[b];
  if (!set || set.size === 0) return null;
  if (set.size === 1) return [...set][0];
  ambiguous[b] = [...set];
  return null;
}

/* Labels: a /* Name *\/ comment inside a :root block owns the declarations after it. Every segment prefix of a labelled
   property (--button, --button-icon) remembers its owners; an unlabelled property takes the owner of its longest prefix that
   has exactly one, and a prefix two components share sends it to base. */
const prefixOwners = new Map();
const segmentPrefixes = (prop) => {
  const parts = prop.slice(2).split('-');
  return parts.map((_, k) => '--' + parts.slice(0, k + 1).join('-')).reverse();
};
const labelOwner = (text) => {
  const t = text.trim();
  if (overrides.labels[t] !== undefined) return overrides.labels[t];
  return tiers[t] ? t : null;
};
css.walkComments((c) => {
  const owner = labelOwner(c.text);
  if (!owner || c.parent.type !== 'rule') return;
  for (let n = c.next(); n && n.type === 'decl'; n = n.next()) {
    for (const p of segmentPrefixes(n.prop)) {
      if (!prefixOwners.has(p)) prefixOwners.set(p, new Set());
      prefixOwners.get(p).add(owner);
    }
  }
});
/* tokens.css already declares the dimension roles, so no component file repeats them */
const roles = new Set();
postcss.parse(readFileSync(join(root, 'src/tokens/roles.css'), 'utf8')).walkDecls((d) => roles.add(d.prop));
/* A pass-through alias is named for the class it serves: --listrow-text-primary is sk-listrow's */
function ownerOfProp(prop) {
  if (roles.has(prop)) return 'tokens';
  for (const p of segmentPrefixes(prop)) {
    const set = prefixOwners.get(p);
    if (set?.size === 1) return [...set][0];
    const byClass = classOwners['sk-' + p.slice(2)] || overrides.classes['sk-' + p.slice(2)] ? ownerOfClass('sk-' + p.slice(2)) : null;
    if (byClass) return byClass;
    if (set) return 'base';
  }
  return 'base';
}

const unplaced = new Set();
function ownerOfSelector(sel) {
  /* A :where() reset that names several components' classes at once (134's links that became buttons) is shared: base */
  if (sel.startsWith(':where(')) {
    const all = new Set([...sel.matchAll(/\.(sk-[a-z0-9-_]+)/g)].map((m) => ownerOfClass(blockOf(m[1]))));
    if (all.size > 1) return 'base';
  }
  /* A page-wide state (.sk-is-dragging on the body) owns nothing: the component the rule draws is the next class */
  const first = [...sel.matchAll(/\.(sk-[a-z0-9-_]+)/g)].find((m) => !m[1].startsWith('sk-is-'));
  if (!first) return 'base';
  const b = blockOf(first[1]);
  const o = ownerOfClass(b);
  if (!o) { unplaced.add(b); return 'base'; }
  return o;
}

/* Assign every piece of the sheet to an owner, keeping the order and the at-rule wrappers */
const pieces = [];
function visit(node, wrap) {
  if (node.type === 'comment') return;
  if (node.type === 'atrule' && node.name === 'keyframes') { pieces.push({ owner: 'base', wrap, node: node.clone() }); return; }
  if (node.type === 'atrule') { node.each((n) => visit(n, [...wrap, node])); return; }
  if (node.type !== 'rule') return;
  const custom = node.nodes.every((n) => n.type === 'comment' || n.prop.startsWith('--'));
  if (custom && /^(:root|\[data-theme)/.test(node.selector)) {
    let label = null;
    node.each((n) => {
      if (n.type === 'comment') { label = labelOwner(n.text) ?? (n.text.trim().startsWith('(shared)') ? 'base' : null); return; }
      const owner = roles.has(n.prop) ? 'tokens' : overrides.props?.[n.prop] ?? label ?? ownerOfProp(n.prop);
      pieces.push({ owner, wrap, selector: node.selector, decl: n.clone() });
    });
    return;
  }
  const bySel = new Map();
  for (const s of node.selectors) {
    const o = ownerOfSelector(s);
    bySel.set(o, [...(bySel.get(o) ?? []), s]);
  }
  for (const [owner, sels] of bySel) {
    const r = node.clone({ selectors: sels });
    pieces.push({ owner, wrap, node: r });
  }
}
css.each((n) => visit(n, []));

function render(owner) {
  const out = [];
  let i = 0;
  const mine = pieces.filter((p) => p.owner === owner);
  while (i < mine.length) {
    const p = mine[i];
    if (p.decl) {
      /* Consecutive declarations for one selector become one block */
      const decls = [];
      while (i < mine.length && mine[i].decl && mine[i].selector === p.selector && sameWrap(mine[i].wrap, p.wrap)) decls.push(mine[i++].decl.toString());
      out.push(wrapIn(p.wrap, `${p.selector}{${decls.join(';')}}`));
    } else {
      out.push(wrapIn(p.wrap, p.node.toString()));
      i++;
    }
  }
  return out.join('\n') + '\n';
}
const sameWrap = (a, b) => a.length === b.length && a.every((w, k) => w === b[k]);
const wrapIn = (wrap, text) => wrap.reduceRight((t, w) => `@${w.name} ${w.params}{${t}}`, text);

const args = process.argv.slice(2);
const owners = [...new Set(pieces.map((p) => p.owner))].sort();

if (args[0] === '--report') {
  for (const o of owners) console.log(o.padEnd(20), pieces.filter((p) => p.owner === o).length);
  if (Object.keys(ambiguous).length) console.log('\nClasses more than one component draws (settle in css-owners.json "classes"):', ambiguous);
  if (unplaced.size) console.log('\nClasses no component draws (left in base):', [...unplaced].join(' '));
} else if (args[0] === '--write') {
  const force = args.includes('--force');
  for (const name of args.slice(1).filter((a) => !a.startsWith('--'))) {
    const file = name === 'base' ? join(root, 'src/base.css') : join(root, 'src', tiers[name], name, `${name}.css`);
    if (name !== 'base' && !tiers[name]) { console.error(`${name} is not a Sakuga component`); process.exitCode = 1; continue; }
    if (existsSync(file) && !force) { console.error(`${file} exists; pass --force to replace it`); process.exitCode = 1; continue; }
    const head = `/* ${name === 'base' ? 'Shared by every component' : name}: split from Sakuga Version 221's bundle.css by scripts/css-split.mjs. */\n`;
    writeFileSync(file, head + render(name));
    console.log('wrote', file.replace(root + '/', ''));
  }
} else if (args[0] === '--coverage') {
  const files = [];
  const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach((e) => e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.css') && files.push(join(d, e.name)));
  walk(join(root, 'src'));
  const have = { props: new Set(), sels: new Set() };
  for (const f of files) postcss.parse(readFileSync(f, 'utf8')).walk((n) => {
    if (n.type === 'decl' && n.prop.startsWith('--')) have.props.add(n.prop);
    if (n.type === 'rule') n.selectors.forEach((s) => have.sels.add(s));
  });
  const missing = {};
  for (const p of pieces) {
    const items = p.decl ? [p.decl.prop].filter((x) => !have.props.has(x)) : p.node.selectors ? p.node.selectors.filter((s) => !have.sels.has(s)) : [];
    if (items.length) (missing[p.owner] ??= []).push(...items);
  }
  for (const o of ['Sheet', 'TabBar']) delete missing[o]; /* Not ported: docs/PORTING.md · Not ported, and every glass part */
  /* PromptComposer's media variant is the phone's glass dock: its rules, its own tokens and the colours only it reads */
  const excluded = /glass|composer--media|^--composer-media-|^--composer-text-on-media/;
  for (const o of Object.keys(missing)) { missing[o] = missing[o].filter((x) => !excluded.test(x)); if (!missing[o].length) delete missing[o]; }
  const total = Object.values(missing).reduce((n, l) => n + l.length, 0);
  for (const [o, l] of Object.entries(missing).sort()) console.log(o.padEnd(20), l.length);
  console.log(`\n${total} selectors and properties still only in the reference`);
} else {
  console.log('usage: css-split.mjs --report | --write <Name|base>... [--force] | --coverage');
}
