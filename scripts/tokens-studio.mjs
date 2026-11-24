// Converts Sakuga's tokens into the token sets Tokens Studio holds, so Tokens Studio mirrors Sakuga and never becomes a second
// source. It keeps the three tiers apart, each in its own set, and keeps every reference as a reference:
//   core/<kind>        the raw values, one set per kind: core/color (the palette), core/space, core/radius, core/size,
//                      core/layout, core/blur, core/opacity, core/motion and core/font
//   semantic/<kind>    the roles the components read, one set per kind: semantic/color, shadow, type, space, line, size,
//                      frame, scale, lighting, sound and motion (roles.css and base.css supply the non-colour roles)
//   light              every token whose value differs by theme, semantic roles and the few component tokens that carry
//   dark               their own, each set holding the same names with that theme's value
//   component          the tokens each component reads: its colours from tokens.json, and its shape, space, type and motion
//                      tokens from the :root blocks in its own stylesheet
// A tier is read from the token itself, as tokens.json's colour note defines them: a raw colour or scale value is core; a token a
// component owns (its usage line names the component, or its name starts with the component's prefix) is component, and so is
// any token that aliases a role rather than a core value; what is left names a role and picks core values, and is semantic.
// The report lists the component tokens that point straight at core, skipping the semantic tier.
// Tokens Studio holds two projects: Sakuga (core, semantic, theme and component/* sets) and AniCanonKit (core, semantic, theme,
// core/anicanon, semantic/anicanon and kit/* sets). Kit tokens read only core, semantic and theme tokens, and nothing outside the kit reads a kit token, so each
// project resolves on its own. Writes { source, report, projects: { <name>: { projectId, setDescriptions, tokens } } } as JSON,
// each token { token_set_name, name, type, value, description }, to the path given or to stdout; with --check <dir> it also
// checks each project's sets with the Studio CLI (see the end of the file).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const d = JSON.parse(readFileSync(join(src, 'tokens/tokens.json'), 'utf8'));

const components = ['ui', 'anicanonkit'].flatMap((lib) => readdirSync(join(src, lib))
  // A component's folder is named as the component is (Button, CutSheet); lowercase folders (sound) are modules, not components.
  .filter((n) => /^[A-Z]/.test(n) && statSync(join(src, lib, n)).isDirectory())
  .map((n) => ({ lib, name: n, dir: join(src, lib, n) })));
const prefixOf = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
const prefixes = components.map((c) => prefixOf(c.name)).sort((a, b) => b.length - a.length);

const isRef = (v) => typeof v === 'string' && /^\{[\w-]+\}$/.test(v.trim());
const themed = (v) => v !== null && typeof v === 'object' && 'dark' in v && 'light' in v;
// CSS var() references become Tokens Studio references; anything else stays exactly as written.
// A var() fallback is dropped: the reference always resolves in Tokens Studio.
const fromCss = (v) => v.trim()
  .replace(/var\(--([\w-]+)\s*,(?:[^()]|\([^()]*\))*\)/g, '{$1}')
  .replace(/var\(--([\w-]+)\)/g, '{$1}');

/* What a component owns: its name starts with the component's prefix ("button-…"), or its usage line names it ("Timeline: …",
   "Button primary: fill"). Core tokens are never owned. */
function owner(name, usage = '') {
  // "Button primary: fill", "Notice, info: fill", "Kit LookPlate: edge", "Maki: message text" (the Maki family), "Fragments …"
  // The component is named the house way, its name (and a variant) before a colon, never just a first word ("Text and icons…").
  const head = usage.match(/^(?:Kit )?([A-Z][A-Za-z]+)(?:[ ,][^:.]{0,40})?:/);
  if (head) {
    const h = head[1], one = h.replace(/s$/, '');
    const exact = components.find((x) => x.name === h || x.name === one);
    if (exact) return exact.name;
    // A family name ("Maki", "Kit Activity") is the one of its components that reads the token; one no member reads
    // (a "Page strip" that only starts like PageHeader) belongs to none of them.
    const family = components.filter((x) => x.name.startsWith(h) || x.name.startsWith(one));
    const reader = soleReader(name);
    if (reader && family.some((x) => x.name === reader)) return reader;
    if (family.length === 1 && !reader) return family[0].name;
  }
  // Text's prefix is also the text- roles' (text-primary, text-on-media), so a name alone never makes a token Text's.
  const p = prefixes.find((x) => x !== 'text' && (name === x || name.startsWith(x + '-')));
  return p ? components.find((c) => prefixOf(c.name) === p).name : null;
}

/* A token's type, from its own value, or from the value its reference chain ends at. */
const all = new Map();
function finalValue(v, seen = new Set()) {
  let x = themed(v) ? v.dark : v;
  while (isRef(x)) {
    const n = x.trim().slice(1, -1);
    if (seen.has(n) || !all.has(n)) return x;
    seen.add(n);
    x = all.get(n);
    if (themed(x)) x = x.dark;
  }
  return x;
}
function typeOf(name, v, seen = new Set()) {
  if (v !== null && typeof v === 'object' && !themed(v) && 'fontSize' in v) return 'typography';
  // An alias is what it points at: a font token naming a type style is that style, not text.
  if (isRef(v)) {
    const n = v.trim().slice(1, -1);
    if (all.has(n) && !seen.has(n)) return typeOf(n, all.get(n), seen.add(n));
  }
  const f = String(finalValue(v)).trim();
  // A calc() of references is typed as what it adds up: lengths, durations.
  if (/^calc\(/.test(f) && /\{[\w-]+\}/.test(f)) {
    const t = refsOf(f).map((r) => (all.has(r) ? typeOf(r, all.get(r)) : 'number')).find((x) => x !== 'number');
    if (t) return t;
  }
  if (/^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|transparent)$/i.test(f)) return 'color';
  if (/^-?[\d.]+(px|rem|em|%|vw|vh)$/.test(f)) return 'dimension';
  if (/^-?[\d.]+m?s$/.test(f)) return 'duration';
  if (/^cubic-bezier\(/.test(f)) return 'cubicBezier';
  if (/weight/.test(name) && /^\d{3}$/.test(f)) return 'fontWeight';
  if (/^-?[\d.]+$/.test(f)) return 'number';
  if (/^font-/.test(name)) return 'fontFamily';
  if (/shadow/.test(name) && shadowItems(f)) return 'shadow';
  return 'text';
}

/* Tokens Studio takes a shadow as items (x, y, blur, spread, colour, inset) and a curve as four numbers; Sakuga writes both as
   CSS. A shadow that doesn't parse (one built from references, say) stays the CSS it is, as text. */
function shadowItems(css) {
  const parts = String(css).split(/,(?![^(]*\))/).map((p) => p.trim()).filter(Boolean);
  const items = [];
  for (const p of parts) {
    const inset = /^inset\s/.test(p);
    const body = p.replace(/^inset\s+/, '');
    const color = body.match(/(rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-f]{3,8}|\{[\w-]+\})\s*$/i);
    if (!color) return null;
    const lengths = body.slice(0, color.index).trim().split(/\s+/);
    if (lengths.length < 2 || lengths.length > 4 || !lengths.every((l) => /^-?[\d.]+(px)?$/.test(l))) return null;
    const px = (l) => (l === undefined ? '0px' : /px$/.test(l) ? l : l + 'px');
    items.push({ offsetX: px(lengths[0]), offsetY: px(lengths[1]), blur: px(lengths[2]), spread: px(lengths[3]), color: color[1], inset });
  }
  return items.length ? items : null;
}
function studioValue(type, v) {
  if (isRef(v)) return v;
  if (type === 'shadow') return shadowItems(v) || v;
  if (type === 'cubicBezier') {
    const m = String(v).match(/^cubic-bezier\(([^)]*)\)$/);
    return m ? m[1].split(',').map((n) => Number(n.trim())) : v;
  }
  return v;
}

const out = [];
const push = (set, name, value, usage) => out.push({ token_set_name: set, name, value, description: usage || undefined });
/* Each component's tokens are a set of their own, named as the component is: component/Button for the core library,
   kit/CutSheet for AniCanonKit. A component token no single component owns (it aliases a role for several) stays in
   component/shared. */
const cssOf = (dir) => readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
const componentCss = new Map(components.map((c) => [c.name, cssOf(c.dir)]));
// A token no name or usage line places belongs to the one component that reads it, when only one does.
const soleReader = (name) => {
  const readers = components.filter((c) => componentCss.get(c.name).includes(`var(--${name})`));
  return readers.length === 1 ? readers[0].name : null;
};
const setOf = (name) => {
  const c = components.find((x) => x.name === name);
  return c ? `${c.lib === 'ui' ? 'component' : 'kit'}/${c.name}` : 'component/shared';
};
const place = (tier, t) => {
  if (themed(t.value)) {
    push('light', t.name, t.value.light, t.usage);
    push('dark', t.name, t.value.dark, t.usage);
  } else push(tier === 'component' ? setOf(owner(t.name, t.usage) || soleReader(t.name)) : tier, t.name, t.value, t.usage);
};

for (const t of [...d.color.tokens, ...d.shadow.tokens]) all.set(t.name, t.value);
const refsOf = (v) => (themed(v) ? [v.light, v.dark] : [v]).flatMap((x) => String(x).match(/\{[\w-]+\}/g) || []).map((r) => r.slice(1, -1));
const rawColour = (t) => !themed(t.value) && refsOf(t.value).length === 0;
const coreNames = new Set(d.color.tokens.filter(rawColour).map((t) => t.name));
const tierOf = (t) => (owner(t.name, t.usage) || refsOf(t.value).some((r) => !coreNames.has(r)) ? 'component' : 'semantic');
const skipsSemantic = [];
for (const t of d.color.tokens) {
  if (rawColour(t)) { place('core/color', t); continue; }
  const tier = tierOf(t);
  if (tier === 'component' && refsOf(t.value).every((r) => coreNames.has(r))) skipsSemantic.push(t.name);
  place(tier, t);
}
/* An alpha colour is core in Sakuga, named <base>-a<step>, and its usage line opens with what it is: "neutral-0 at opacity-08".
   Tokens Studio holds no alpha colours: a token that reads one gets ts_alpha_srgb({base}, {opacity-NN}) instead, the platform's
   own function, which its CSS export resolves (an alpha modifier, or rgba() around a reference, exports opaque or not at all).
   So Studio mirrors Sakuga's values, not its structure, and this check is what keeps the two equal: it reports an alpha that is
   not its named base at its named step. */
const opacityOf = new Map(d.opacity.tokens.map((t) => [t.name, Number(t.value)]));
const channels = (v) => (v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)?.slice(1).map((h) => parseInt(h, 16))
  ?? v.match(/^rgba?\(([^)]*)\)$/)?.[1].split(/[\s,/]+/).filter(Boolean).map(Number));
const alphaWarnings = [];
const alphas = new Map();
for (const t of out) {
  if (t.token_set_name !== 'core/color' || !/-a\d+$/.test(t.name)) continue;
  const m = (t.description || '').match(/^([\w-]+) at (opacity-[\w-]+)\b/);
  const base = m && d.color.tokens.find((x) => x.name === m[1] && rawColour(x));
  if (!base || !opacityOf.has(m[2])) { alphaWarnings.push(`${t.name}: its usage line names no core colour at an opacity step`); continue; }
  alphas.set(t.name, `ts_alpha_srgb({${m[1]}}, {${m[2]}})`);
  const [r, g, b, a] = channels(t.value) || [];
  const [br, bg, bb] = channels(base.value) || [];
  if (r !== br || g !== bg || b !== bb || a !== opacityOf.get(m[2])) {
    alphaWarnings.push(`${t.name}: ${t.value} is not ${m[1]} (${base.value}) at ${m[2]} (${opacityOf.get(m[2])})`);
  }
}
// A raw shadow is a role's value (shadow-raised, shadow-overlay), not a core colour.
for (const t of d.shadow.tokens) place(owner(t.name, t.usage) ? 'component' : 'semantic', t);
// Core is one set per kind, so each scale reads on its own; spacing is core/space, as the tokens are named.
const coreGroups = { spacing: 'space', radius: 'radius', size: 'size', layout: 'layout', blur: 'blur', opacity: 'opacity', motion: 'motion' };
for (const [group, kind] of Object.entries(coreGroups)) {
  for (const t of d[group]?.tokens || []) { all.set(t.name, t.value); place(`core/${kind}`, t); }
}
for (const [fam, stack] of Object.entries(d.type.families)) { all.set('font-' + fam, stack); push('core/font', 'font-' + fam, stack); }
for (const g of d.type.groups) {
  for (const s of g.styles) {
    const style = { fontFamily: `{font-${g.family}}`, fontWeight: String(s.fontWeight), fontSize: s.fontSize,
      lineHeight: s.lineHeight, letterSpacing: String(s.letterSpacing ?? 0) };
    all.set('text-' + s.name, style);
    push('semantic', 'text-' + s.name, style, s.usage);
  }
}

/* The dimension roles, then every component's own tokens, from the :root blocks of the CSS that declares them, and from the
   `:root,[data-theme]` blocks that hold a component's aliases of a theme role (re-declared on [data-theme] so a nested theme
   re-resolves them; the value is the same in both). A name already in tokens.json is tokens.json's. */
const decls = (css) => [...css.matchAll(/:root(?:\s*,\s*\[data-theme\])?\s*\{([^}]*)\}/g)].flatMap((m) => [...m[1].matchAll(/--([\w-]+)\s*:\s*([^;]+)/g)]
  .map(([, n, v]) => [n, fromCss(v)]));
const known = new Set(out.map((t) => t.name));
// The dimension roles, then what base.css declares: shared values (the focus ring, the state dot) are semantic, and the few
// component tokens it carries (thumb-silhouette-…, field-help-icon-size) go to their component.
for (const [n, v] of decls(readFileSync(join(src, 'tokens/roles.css'), 'utf8'))) {
  if (!known.has(n)) { all.set(n, v); push('semantic', n, v); known.add(n); }
}
for (const [n, v] of decls(readFileSync(join(src, 'base.css'), 'utf8'))) {
  if (known.has(n)) continue;
  const c = owner(n);
  // Sakuga's scrollbars are the core's furniture, read by no component: component/shared keeps them in the Sakuga project alone,
  // where the semantic set would export them into AniCanonKit as well
  const set = c ? setOf(c) : /^(--)?scrollbar-/.test(n) ? 'component/shared' : 'semantic';
  all.set(n, v); push(set, n, v, c ? `${c}.` : undefined); known.add(n);
}
const componentDecls = components.flatMap((c) => decls(componentCss.get(c.name)).map(([n, v]) => [c, n, v]));
for (const [, n, v] of componentDecls) all.set(n, v);
for (const [c, n, v] of componentDecls) {
  if (known.has(n)) continue;
  known.add(n);
  push(setOf(c.name), n, v, `${c.name}.`);
}

/* Tokens Studio resolves a value with references in it as math, and knows no CSS function there. A calc() of references, numbers
   and px or ms lengths becomes the bare expression, typed as the references it adds. What has no Tokens Studio form (a viewport
   length, env(), color-mix(), currentColor) keeps its CSS, with its references written back as var(), so Tokens Studio holds it as
   text and exports it as written. color-mix() is not an alpha modifier: the CSS export drops a modifier on a reference. */
const refType = (r) => (all.has(r) ? typeOf(r, all.get(r)) : 'number');
function toStudio(t) {
  if (typeof t.value !== 'string' || !/\{[\w-]+\}/.test(t.value) || !/[a-z-]+\(/i.test(t.value)) return t;
  const v = t.value;
  const calc = v.match(/^calc\((.*)\)$/);
  if (calc && /^[\s\d.+\-*/()]*$/.test(calc[1].replace(/\{[\w-]+\}/g, '').replace(/\d(px|m?s|vw|vh|%)/g, '0'))) {
    const types = refsOf(v).map(refType).filter((x) => x !== 'number');
    return { ...t, value: calc[1].trim(), type: types[0] || 'number' };
  }
  // min() and max() are math Tokens Studio reads, as long as every argument is a reference or a length.
  const minmax = v.match(/^(min|max)\((.*)\)$/);
  const args = minmax ? (minmax[2].match(/(?:[^,(]|\([^)]*\))+/g) || []).map((a) => a.trim()) : [];
  if (minmax && args.every((a) => /^\{[\w-]+\}$/.test(a) || /^-?[\d.]+(px|vw|vh|%)?$/.test(a))) {
    return { ...t, value: `${minmax[1]}(${args.join(', ')})`, type: 'dimension' };
  }
  // env() is the device's, read only at runtime: Tokens Studio holds the rest of the max() and says where the env() went.
  const env = minmax?.[1] === 'max' && args.length === 2 && args.find((a) => /^env\(/.test(a)) && args.find((a) => /^\{[\w-]+\}$/.test(a));
  if (env) {
    const css = v.replace(/\{([\w-]+)\}/g, 'var(--$1)');
    return { ...t, value: env, type: refType(env.slice(1, -1)),
      description: `${t.description ? t.description + ' ' : ''}In CSS it is ${css}; Tokens Studio cannot read env(), so it holds the reference alone.` };
  }
  return { ...t, value: v.replace(/\{([\w-]+)\}/g, 'var(--$1)'), type: 'text' };
}
/* Tokens Studio reads a bare word that names a token as that token, so a CSS colour keyword with a token of its name (black)
   breaks a raw value such as clip-mask's -webkit-radial-gradient(white,black); it is written as its hex, the same colour. */
const keywordHex = { black: '#000', white: '#fff' };
function keywordsAsHex(t) {
  if (typeof t.value !== 'string' || !/[a-z-]+\(/i.test(t.value)) return t;
  const value = t.value.replace(/(?<![\w#-])(black|white)(?![\w-])/g, (w) => (known.has(w) || all.has(w) ? keywordHex[w] : w));
  return value === t.value ? t : { ...t, value };
}

/* The component's README is its documentation: its opening paragraph and version describe its set, and a README line that
   names a token by name describes that token. */
const plain = (line) => line.replace(/^\s*-\s+/, '').replace(/\*\*|`/g, '').trim();
const docs = new Map(components.filter((c) => existsSync(join(c.dir, 'README.md'))).map((c) => {
  const md = readFileSync(join(c.dir, 'README.md'), 'utf8');
  const version = (md.match(/^Version: (.+)$/m) || [])[1];
  const opening = plain((md.split(/\n\s*\n/).find((para) => !/^\s*#/.test(para) && /[.:]\s*$/.test(para.trim())) || '').replace(/\n/g, ' '));
  return [c.name, { set: version ? `${opening} Version ${version}.` : opening, lines: md.split('\n') }];
}));
/* The tier sets are described by tokens.json's colour note; a component without a README by the comment over its export. */
const setDescriptions = {
  'core/color': 'Core colour: the raw, theme-stable palette the semantic roles pick from.',
  'core/space': 'Core space: the raw spacing scale, theme-stable.',
  'core/radius': 'Core radius: the raw corner-radius scale, theme-stable.',
  'core/size': 'Core size: the raw size scale, theme-stable.',
  'core/layout': 'Core layout: the raw layout widths, theme-stable.',
  'core/blur': 'Core blur: the raw blur values, theme-stable.',
  'core/opacity': 'Core opacity: the raw opacity values, theme-stable.',
  'core/motion': 'Core motion: the raw durations and easing curves, theme-stable.',
  'core/font': 'Core font: the font family stacks the type styles use.',
  semantic: 'Semantic tokens name a role and pick a core token: the theme-stable colour roles, shadows, type styles and dimension roles. A role whose value changes with the theme takes it from light or dark.',
  light: 'The Light value of every token that changes with the theme: semantic colour and shadow roles, and the few component tokens that carry their own.',
  dark: 'The Dark value of every token that changes with the theme, under the same names as light.',
  'component/shared': 'Component tokens that several components read and no one component owns.',
};
// A core kind with its own note in tokens.json is described by it.
for (const [group, kind] of Object.entries(coreGroups)) if (d[group]?.note) setDescriptions[`core/${kind}`] = `Core ${kind}, theme-stable. ${d[group].note}`;
for (const c of components) {
  if (docs.has(c.name)) continue;
  const tsx = join(c.dir, `${c.name}.tsx`);
  const note = existsSync(tsx) && readFileSync(tsx, 'utf8').match(new RegExp(`/\\*+\\s*((?:(?!\\*/)[\\s\\S])*?)\\s*\\*/\\s*export function ${c.name}\\b`));
  if (note) setDescriptions[setOf(c.name)] = plain(note[1].replace(/\s*\n\s*\*?\s*/g, ' ')).replace(/([^.])$/, '$1.');
}
for (const [name, doc] of docs) setDescriptions[setOf(name)] = doc.set;
for (const t of out) {
  const c = t.token_set_name.match(/^(?:component|kit)\/(.+)$/)?.[1];
  if (!c || (t.description && t.description !== `${c}.`)) continue;
  // A line that only lists the tokens ("Tokens: --a, --b") says nothing about any one of them.
  const line = docs.get(c)?.lines.find((l) => !/Tokens:\s*--/.test(plain(l)) && (l.includes('`' + t.name + '`') || l.includes('`--' + t.name + '`')));
  if (line) t.description = plain(line).slice(0, 1000);
}

const tokens = out.map(toStudio).map(keywordsAsHex).map((t) => {
  if (t.type) return t;
  let type = typeOf(t.name, t.value);
  // A curve or a shadow written in a form Tokens Studio can't hold as one (a keyword, references inside) stays text.
  if (type === 'cubicBezier' && !isRef(t.value) && !Array.isArray(studioValue(type, t.value))) type = 'text';
  if (type === 'shadow' && !isRef(t.value) && !shadowItems(t.value)) type = 'text';
  return { ...t, type, value: studioValue(type, t.value) };
});
// A token that reads an alpha takes its function; the alphas themselves stay out of Studio. An alpha the check could not
// match to a base at a step stays a literal in core/color.
for (const t of tokens) if (isRef(t.value) && alphas.has(t.value.slice(1, -1))) Object.assign(t, { value: alphas.get(t.value.slice(1, -1)), type: 'color' });
for (let i = tokens.length - 1; i >= 0; i--) if (alphas.has(tokens[i].name) && tokens[i].token_set_name === 'core/color') tokens.splice(i, 1);
/* Semantic is one set per kind, as core is: semantic/color, semantic/type, semantic/space and the rest. A role whose value
   changes with the theme stays in light and dark. A kind is read from the token's type, then from its name. */
const semanticKinds = [
  ['anicanon', (t) => /^(accent-spirit|bg-vault)$/.test(t.name)],
  ['color', (t) => t.type === 'color'],
  ['shadow', (t) => t.type === 'shadow'],
  ['type', (t) => t.type === 'typography' || /^(text|weight|tracking|underline|font)-/.test(t.name)],
  ['radius', (t) => /^radius-/.test(t.name)],
  ['opacity', (t) => /^opacity-/.test(t.name)],
  ['blur', (t) => /^blur-/.test(t.name)],
  ['space', (t) => /^(gap|inset)-/.test(t.name)],
  ['line', (t) => /^(line|ring|focus-ring)-|-width$/.test(t.name)],
  ['size', (t) => /^(icon-size|state-dot|size|target)-/.test(t.name)],
  ['frame', (t) => /^ratio-|^clip-mask$/.test(t.name)],
  ['scale', (t) => /^scale-/.test(t.name)],
  ['lighting', (t) => /^light-/.test(t.name)],
  ['sound', (t) => /^sound-/.test(t.name)],
  ['motion', (t) => /^(motion|stagger|glide|duration|ease)-|^sk-ease$|-animation$/.test(t.name)],
];
/* Maki's tokens (mk-*) are shared by Maki's own components (MakiPanel, MakiCard, MakiComposer, MakiFinding, MakiStep,
   ChatMessage), so no one component owns them; they are AniCanonKit's, in kit/Maki, never a Sakuga semantic set. A
   semantic token that no kind takes fails the run, so nothing reaches Studio in a bare "semantic" set. */
const unsorted = [];
for (const t of tokens) {
  if (t.token_set_name !== 'semantic') continue;
  if (/^mk-/.test(t.name)) { t.token_set_name = 'kit/Maki'; continue; }
  const kind = semanticKinds.find(([, test]) => test(t))?.[0];
  if (kind) t.token_set_name = `semantic/${kind}`;
  else unsorted.push(t.name);
}
if (unsorted.length) process.exitCode = 1;
setDescriptions['kit/Maki'] = 'Maki\'s shared tokens: what MakiPanel, MakiTurn, MakiCard, MakiComposer, MakiFinding, MakiStep and ChatMessage read alike.';
Object.assign(setDescriptions, {
  'semantic/color': 'Semantic colour: the colour roles that hold in both themes, such as media, scrims and paper. A colour role that changes with the theme is in light and dark.',
  'semantic/shadow': 'Semantic shadow: the shadow roles that hold in both themes.',
  'semantic/type': 'Semantic type: the type styles, and each style\'s size, line height and weight for parts set one at a time; weights, tracking and the underline offset.',
  'semantic/space': 'Semantic space: gaps (space between things) and insets (space inside things), each a step of core space.',
  'semantic/line': 'Semantic line: line weights, the focus ring and the rings around a selection.',
  'semantic/size': 'Semantic size: icon sizes and the state dot.',
  'semantic/frame': 'Semantic frame: the aspect ratios pictures are framed in, and the mask that clips a frame to its corners.',
  'semantic/scale': 'Semantic scale: how far a pressed, zoomed or lifted thing scales.',
  'semantic/lighting': 'Semantic lighting: the light that follows the pointer over a picture, its strength, reach and timing.',
  'semantic/sound': 'Semantic sound: the level of each kind of interface sound, and the least time between two.',
  'semantic/motion': 'Semantic motion: the motion moments (a keyframe at the timing it always plays at), how far they travel, and the stagger.',
});
delete setDescriptions.semantic;
const missing = tokens.flatMap((t) => JSON.stringify(t.value).match(/\{[\w-]+\}/g) || []).map((r) => r.slice(1, -1)).filter((n) => !all.has(n) && !known.has(n));
const report = {
  sets: Object.fromEntries([...new Set(tokens.map((t) => t.token_set_name))].map((s) => [s, tokens.filter((t) => t.token_set_name === s).length])),
  unresolvedReferences: [...new Set(missing)],
  componentTokensPointingAtCore: skipsSemantic,
  alphaWarnings,
  semanticUnsorted: unsorted,
};
/* Tokens Studio names a token by its path: every hyphen in a Sakuga name is a dot there (camellia-600 is camellia.600,
   media-card-title-font-size is media.card.title.font.size), so its sets read as folders. Its CSS export joins the path with
   hyphens again, so every exported custom property keeps Sakuga's name. References follow; a var() in a CSS-only value stays
   as CSS writes it. A name that is both a token and a folder (accent, accent.subtle) is allowed. */
const dotted = (n) => n.replace(/-/g, '.');
const dotRefs = (v) => JSON.parse(JSON.stringify(v).replace(/\{([\w-]+)\}/g, (_, n) => `{${dotted(n)}}`));
for (const t of tokens) Object.assign(t, { name: dotted(t.name), value: dotRefs(t.value) });

/* Tokens Studio's shape. Camellia is the brand palette, so it is named brand; black is the dark end of the neutral scale, neutral.1000.
   The spacing scale is math on one base: space.base is 4px and each step is the base times its number over 100 (space.50 is
   2px, space.1200 is 48px), the step Sakuga's scale lacks added. A component's or kit's own length that falls on the 4px grid
   is the base times its multiple too, so the whole system scales from one value. The theme sets are theme/light and
   theme/dark. */
const studioNames = new Map();
const spaceOnBase = tokens.some((t) => t.name === 'space.base');
for (const t of tokens) {
  if (t.token_set_name === 'core/color') {
    const n = t.name.replace(/^camellia\./, 'brand.').replace(/^black$/, 'neutral.1000');
    if (n !== t.name) studioNames.set(t.name, n);
  }
  const step = !spaceOnBase && t.token_set_name === 'core/space' && t.name.match(/^space\.(\d+)(?:\.(\d+))?$/);
  if (step) studioNames.set(t.name, `space.${Number(step[1]) * 100 + Number(step[2] || 0) * 10}`);
}
const renameRefs = (v) => JSON.parse(JSON.stringify(v).replace(/\{([\w.]+)\}/g, (r, n) => (studioNames.has(n) ? `{${studioNames.get(n)}}` : r)));
for (const t of tokens) Object.assign(t, { name: studioNames.get(t.name) || t.name, value: renameRefs(t.value) });
if (!spaceOnBase) {
  tokens.splice(tokens.findIndex((t) => t.token_set_name === 'core/space'), 0, { token_set_name: 'core/space', name: 'space.base',
    value: '4px', type: 'space', description: 'Core. The base of the spacing scale: every step is this times its number over 100.' });
  tokens.splice(tokens.findIndex((t) => t.name === 'space.1400'), 0, { token_set_name: 'core/space', name: 'space.1200',
    value: '48px', type: 'space', description: 'Core. Twelve base steps.' });
}
/* Spirit is AniCanon's colour (the Fragments violet and the vault it sits on), so it lives only in the AniCanonKit project:
   core/anicanon holds the palette on a numbered step like every other, semantic/anicanon the two roles FragmentBalance reads
   instead of the palette itself. Every core colour's description opens with "Core." and says how it is reached; the brand
   steps describe themselves as brand. */
const spirit = { 'spirit.500': 'spirit.500', 'spirit.vault': 'spirit.950', 'spirit.950': 'spirit.950' };
const spiritRoles = [
  ['accent.spirit', 'spirit.500', 'The Fragments colour: the rim and watermark of the balance card, in both themes.'],
  ['bg.vault', 'spirit.950', "The soul vault: the Fragments balance card's ground, dark in both themes."],
];
const spiritDescriptions = {
  'spirit.500': 'Core. Spirit violet, the Fragments colour. Reached only through semantic tokens.',
  'spirit.950': "Core. The soul vault, Fragments' dark ground. Reached only through semantic tokens.",
};
for (const t of tokens) {
  if (t.token_set_name === 'core/color' && spirit[t.name]) {
    t.name = spirit[t.name];
    t.token_set_name = 'core/anicanon';
    t.description = spiritDescriptions[t.name];
  }
  if (t.token_set_name === 'core/color' && /^vermilion\./.test(t.name) && !/^Core\./.test(t.description || '')) {
    t.description = `Core. ${t.description.replace(/\.$/, '')}. Reached only through semantic tokens.`;
  }
  if (t.token_set_name === 'core/color' && /^brand\./.test(t.name)) {
    t.description = t.description.replace(/Deep camellia/, 'Deep brand').replace(/Camellia a step deeper/, 'Brand a step deeper')
      .replace(/Camellia/, 'Brand');
  }
}
const spiritRole = { '{spirit.500}': '{accent.spirit}', '{spirit.vault}': '{bg.vault}' };
for (const t of tokens) {
  if (!t.token_set_name.startsWith('kit/') || typeof t.value !== 'string') continue;
  t.value = t.value.replace(/\{spirit\.(500|vault)\}/g, (r) => spiritRole[r]);
}
tokens.splice(tokens.findIndex((t) => t.token_set_name === 'theme/light' || t.token_set_name === 'light'), 0,
  ...spiritRoles.filter(([name]) => !tokens.some((t) => t.name === name)).map(([name, core, description]) => ({ token_set_name: 'semantic/anicanon', name, value: `{${core}}`, type: 'color', description })));
setDescriptions['core/anicanon'] = "Core AniCanon colour, theme-stable: the palette only AniCanon's own components pick from, through semantic/anicanon.";
setDescriptions['semantic/anicanon'] = "Semantic AniCanon colour: the roles only AniCanon's own components read, in both themes.";
/* The state dot is one part several components draw (Badge, DateField, ListRow, the navs, CastCard): StateDot, a core
   component, wherever its label first filed it. */
for (const t of tokens) if (/^state\.dot\./.test(t.name)) t.token_set_name = 'component/StateDot';
setDescriptions['component/StateDot'] = 'StateDot is the small dot that marks the current or live item: a nav row, a list row, a badge, today in a date field.';
/* ListRow's own colours reach the sync unlabelled from base.css; they are ListRow's, not semantic roles. */
for (const t of tokens) if (/^listrow\./.test(t.name) && /^semantic\//.test(t.token_set_name)) t.token_set_name = 'component/ListRow';
/* CSS that Studio has a type for becomes that type: a relative-colour alpha (oklch(from var(--x) l c h / var(--o))) is
   ts_alpha_srgb, and a ring drawn as a spread-only box shadow is a shadow, so neither reaches Studio as text. */
for (const t of tokens) {
  if (typeof t.value !== 'string') continue;
  const alpha = t.value.match(/^oklch\(from \{([\w.]+)\} l c h \/ \{([\w.]+)\}\)$/) || t.value.match(/^oklch\(from var\(--([\w-]+)\) l c h \/ var\(--([\w-]+)\)\)$/);
  if (alpha) { Object.assign(t, { value: `ts_alpha_srgb({${alpha[1].replace(/-/g, '.')}}, {${alpha[2].replace(/-/g, '.')}})`, type: 'color' }); continue; }
  const ring = t.value.match(/^0 0 0 (\{[\w.]+\}|\d+px) (\{[\w.]+\}|ts_alpha_srgb\(.*\))$/);
  if (ring) Object.assign(t, { value: [{ offsetX: '0px', offsetY: '0px', blur: '0px', spread: ring[1], color: ring[2], inset: false }], type: 'shadow' });
}
/* A type style is stored once. Its composite reads its own parts where they exist (text.label.size, .line.height,
   .weight), its family reads the font role (font.body, font.heading), and every weight, the composite's or a part's,
   reads a weight role; a style whose parts nothing read keeps its size and line height in the composite alone. */
const weightRole = { 400: '{weight.regular}', 500: '{weight.medium}', 600: '{weight.strong}', 700: '{weight.bold}' };
const familyRole = { '{font.sans}': '{font.body}', '{font.display}': '{font.heading}' };
const typeNames = new Set(tokens.map((t) => t.name));
for (const t of tokens) {
  if (t.token_set_name !== 'semantic/type') continue;
  if (/^text\.[\w.]+\.weight$/.test(t.name) && weightRole[t.value]) { t.value = weightRole[t.value]; continue; }
  if (!t.value || typeof t.value !== 'object' || Array.isArray(t.value) || !('fontSize' in t.value)) continue;
  const part = (p) => (typeNames.has(`${t.name}.${p}`) ? `{${t.name}.${p}}` : null);
  t.value = { ...t.value,
    fontFamily: familyRole[t.value.fontFamily] || t.value.fontFamily,
    fontSize: part('size') || t.value.fontSize,
    lineHeight: part('line.height') || t.value.lineHeight,
    fontWeight: part('weight') || weightRole[t.value.fontWeight] || t.value.fontWeight };
}
/* The type scale is core, as the space scale is: every font size and line height a style uses is one step in core/font
   (font.size.14, font.line.height.20), and each style's part reads its step, so a number is written once. */
const sizeSteps = new Map(), leadSteps = new Map();
for (const t of tokens) {
  if (t.token_set_name !== 'semantic/type' || typeof t.value !== 'string' || !/^\d+px$/.test(t.value)) continue;
  if (/\.size$/.test(t.name)) { sizeSteps.set(t.value, `font.size.${parseInt(t.value)}`); t.value = `{font.size.${parseInt(t.value)}}`; }
  else if (/\.line\.height$/.test(t.name)) { leadSteps.set(t.value, `font.line.height.${parseInt(t.value)}`); t.value = `{font.line.height.${parseInt(t.value)}}`; }
}
const fontAt = tokens.findIndex((t) => t.token_set_name === 'core/font') + 1;
tokens.splice(fontAt, 0,
  ...[...sizeSteps].sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([v, n]) => ({ token_set_name: 'core/font', name: n, value: v, type: 'fontSize', description: `Core. A step of the type scale: ${v}. Reached only through the type styles.` })),
  ...[...leadSteps].sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([v, n]) => ({ token_set_name: 'core/font', name: n, value: v, type: 'lineHeight', description: `Core. A line height of the type scale: ${v}. Reached only through the type styles.` })));
/* A type style is one token. It reads the scale and the roles itself (font.size.15, font.line.height.24, weight.regular,
   font.body), and anything that needs one of its properties reads that property of the style (text.body.lg.fontSize), so
   there are no per-style part tokens to keep in step. */
const partOf = { size: 'fontSize', 'line.height': 'lineHeight', weight: 'fontWeight' };
const partValue = new Map(tokens.filter((t) => t.token_set_name === 'semantic/type' && /^text\.[\w.]+\.(size|line\.height|weight)$/.test(t.name)).map((t) => [t.name, t.value]));
for (const t of tokens) {
  if (t.token_set_name !== 'semantic/type' || !t.value || typeof t.value !== 'object' || Array.isArray(t.value) || !('fontSize' in t.value)) continue;
  const v = { ...t.value };
  for (const [k, prop] of Object.entries(partOf)) {
    const m = typeof v[prop] === 'string' && v[prop].match(/^\{(text\.[\w.]+)\}$/);
    if (m && partValue.has(m[1])) v[prop] = partValue.get(m[1]);
  }
  t.value = v;
}
for (let i = tokens.length - 1; i >= 0; i--) if (partValue.has(tokens[i].name) && tokens[i].token_set_name === 'semantic/type') tokens.splice(i, 1);
const toProperty = (v) => JSON.parse(JSON.stringify(v).replace(/\{(text\.[\w.]+?)\.(size|line\.height|weight)\}/g, (r, style, part) => (partValue.has(`${style}.${part}`) ? `{${style}.${partOf[part]}}` : r)));
for (const t of tokens) t.value = toProperty(t.value);
/* Derived colours, in sRGB only (Sakuga's colours are sRGB; nothing reaches Studio as OKLCH). The greys are one tinted base
   lightened toward white or darkened toward black (ts_lighten_srgb, ts_darken_srgb), which is how the hand-picked ramp
   behaves: its tint fades toward both ends. Each step's amount is fitted to its own hex, so the derived grey is the swatch
   within ΔE 0.01. An accent step whose usage line names its base is that base lightened or darkened the same way when that
   lands within ΔE 0.005, and stays its literal hex when it does not: the accent steps were tuned by hand for contrast
   (brand.700 holds 4.5:1 on the accent tint), and an sRGB mix shifts their hue. Text on the accent and on danger is whichever of white and ink reads better, so a new accent brings its own. */
const NEUTRAL_BASE = '#3a3946';
const srgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const oklab = (rgb) => {
  const [R, G, B] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const deltaE = (a, b) => Math.hypot(...oklab(a).map((v, i) => v - oklab(b)[i]));
const fitStep = (baseHex, targetHex) => {
  let best = { e: Infinity };
  for (const [fn, end] of [['ts_lighten_srgb', [1, 1, 1]], ['ts_darken_srgb', [0, 0, 0]]]) {
    for (let k = 0; k <= 1000; k++) {
      const t = k / 1000, mixed = srgb(baseHex).map((v, i) => v + (end[i] - v) * t), e = deltaE(mixed, srgb(targetHex));
      if (e < best.e) best = { e, t, fn };
    }
  }
  return best;
};
const literalHex = new Map(tokens.filter((t) => t.token_set_name === 'core/color' && /^#[0-9a-f]{6}$/i.test(t.value)).map((t) => [t.name, t.value]));
for (const t of tokens) {
  if (t.token_set_name !== 'core/color' || typeof t.value !== 'string') continue;
  if (t.name === 'neutral.base') { Object.assign(t, { value: NEUTRAL_BASE, type: 'color' }); continue; }
  const stated = (t.description || '').match(/neutral-base (darkened|lightened) ([\d.]+)\.$/);
  if (stated) { t.value = `${stated[1] === 'darkened' ? 'ts_darken_srgb' : 'ts_lighten_srgb'}({neutral.base}, ${Number(stated[2])})`; continue; }
  const grey = /neutral-base at lightness [\d.]+, tint [\d.]+\.$/.test(t.description || '') && literalHex.get(t.name);
  if (grey) {
    const f = fitStep(NEUTRAL_BASE, grey);
    if (f.e <= 0.01) t.value = f.t === 0 ? '{neutral.base}' : `${f.fn}({neutral.base}, ${f.t})`;
    continue;
  }
  const step = (t.description || '').match(/([a-z]+-\d+) at lightness [\d.]+\.$/);
  const baseName = step && step[1].replace(/-/g, '.');
  if (step && literalHex.has(baseName) && literalHex.has(t.name)) {
    const f = fitStep(literalHex.get(baseName), literalHex.get(t.name));
    t.value = f.e <= 0.005 ? `${f.fn}({${baseName}}, ${f.t})` : literalHex.get(t.name);
  }
}
for (const t of tokens) {
  if (!/^theme\/|^(light|dark)$/.test(t.token_set_name)) continue;
  if (t.name === 'on.accent') t.value = 'best_contrast({accent}, [{neutral.0}, {neutral.925}])';
  if (t.name === 'on.danger') t.value = 'best_contrast({danger}, [{neutral.0}, {neutral.925}])';
}
const grid = (px) => (px !== 0 && px % 4 === 0 ? `{space.base} * ${px / 4}` : null);
for (const t of tokens) {
  const px = typeof t.value === 'string' && t.value.match(/^(-?\d+)px$/);
  if (!px) continue;
  if (t.token_set_name === 'core/space' && t.name !== 'space.base') t.value = `{space.base} * ${Number(px[1]) / 4}`;
  else if (/^(component|kit)\//.test(t.token_set_name) && grid(Number(px[1]))) t.value = grid(Number(px[1]));
}
for (const t of tokens) if (t.token_set_name === 'light' || t.token_set_name === 'dark') t.token_set_name = `theme/${t.token_set_name}`;
for (const m of ['light', 'dark']) { setDescriptions[`theme/${m}`] = setDescriptions[m]; delete setDescriptions[m]; }

/* Every token carries the type that says what it is, as Tokens Studio's registry names them: an opacity is opacity, a gap or a
   padding is space, a width or a size is size, a corner is borderRadius, a line's weight borderWidth, and a type style's parts
   fontSize, lineHeight and letterSpacing. An alias is what it points at; math is what its name says it measures, or else what
   it is made of (the grid's base aside: a length on the grid is not a space for being on it). An offset is a distance whatever it
   is made of: -1 * {focus.ring.width} moves an outline inward and is no border width, which cannot be negative; so is a
   translate ({scrub.handle.border.left.width} / -2 centres a handle on its line). */
const lengthTypes = new Set(['dimension', 'space', 'size', 'borderRadius', 'borderWidth', 'fontSize', 'lineHeight', 'letterSpacing']);
function roleType(t) {
  const n = t.name, s = t.token_set_name;
  if (t.type === 'number') {
    if (s === 'core/opacity' || /(^|\.)opacity$/.test(n)) return 'opacity';
    if (/line\.height$/.test(n)) return 'lineHeight';
    return 'number';
  }
  if (!lengthTypes.has(t.type)) return t.type;
  if (s === 'core/space' || s === 'semantic/space') return 'space';
  if (s === 'core/radius' || /(^|\.)radius(\.|$)/.test(n)) return 'borderRadius';
  if (s === 'semantic/line' && !/offset/.test(n)) return 'borderWidth';
  if (/(ring|border|edge|outline|stroke)(\.\w+)?\.width$|thickness$/.test(n)) return 'borderWidth';
  if (/font\.size$|^text\.[\w.]+\.size$/.test(n)) return 'fontSize';
  if (/line\.height$/.test(n)) return 'lineHeight';
  if (/letter\.spacing$|^tracking\./.test(n)) return 'letterSpacing';
  if (/(^|\.)(gap|padding|margin|inset|spacing)(\.|$)/.test(n)) return 'space';
  if (/^core\/(size|layout)$|^semantic\/size$/.test(s) || /(^|\.)(size|width|height)(\.|$)|(^|\.)(min|max)\./.test(n)) return 'size';
  return 'dimension';
}
const distance = (t) => /(offset|translate(\.[xyz])?)$/.test(t.name);
const byName = new Map(tokens.map((t) => [t.name, t]));
const isAlias = (v) => typeof v === 'string' && /^\{[\w.]+\}$/.test(v.trim());
for (const t of tokens) t.type = roleType(t);
for (let pass = 0; pass < 8; pass++) {
  for (const t of tokens) {
    if (isAlias(t.value)) {
      const target = byName.get(t.value.trim().slice(1, -1));
      if (target && target.type !== t.type) t.type = target.type;
    } else if (t.type === 'dimension' && !distance(t) && typeof t.value === 'string' && /\{[\w.]+\}/.test(t.value)) {
      const made = (t.value.match(/\{[\w.]+\}/g) || []).filter((r) => r !== '{space.base}')
        .map((r) => byName.get(r.slice(1, -1))?.type).find((x) => lengthTypes.has(x));
      if (made) t.type = made;
    }
  }
}
const shared = (set) => !/^(component|kit)\/|\/anicanon$/.test(set);
const projects = Object.fromEntries([
  ['Sakuga', '1f5ca70b-0807-49c0-9826-cc6f20730345', /^component\//],
  ['AniCanonKit', '115a6ab6-3d43-47ec-9914-755eb5b9a56b', /^kit\/|\/anicanon$/],
].map(([name, projectId, own]) => {
  const read = new Set();
  if (name === 'AniCanonKit') {
    const setOfName = new Map(tokens.map((t) => [t.name, t.token_set_name]));
    let queue = tokens.filter((t) => own.test(t.token_set_name));
    while (queue.length) {
      const next = [];
      for (const t of queue) for (const r of JSON.stringify(t.value).match(/\{[\w.]+\}/g) || []) {
        const set = setOfName.get(r.slice(1, -1));
        if (set && /^component\//.test(set) && !read.has(set)) { read.add(set); next.push(...tokens.filter((x) => x.token_set_name === set)); }
      }
      queue = next;
    }
  }
  const keep = (set) => shared(set) || own.test(set) || read.has(set);
  const held = new Set(tokens.map((t) => t.token_set_name).filter(keep));
  return [name, { projectId, setDescriptions: Object.fromEntries(Object.entries(setDescriptions).filter(([set]) => held.has(set))),
    tokens: tokens.filter((t) => keep(t.token_set_name)) }];
}));
for (const [name, p] of Object.entries(projects)) {
  const names = new Set(p.tokens.map((t) => t.name));
  const outside = [...new Set(p.tokens.flatMap((t) => JSON.stringify(t.value).match(/\{[\w.]+\}/g) || [])
    .map((r) => r.slice(1, -1)).filter((n) => byName.has(n) && !names.has(n)))];
  report[`${name}CrossProjectReferences`] = outside;
  if (outside.length) process.exitCode = 1;
}
const json = JSON.stringify({ source: `${d.name} tokens.json`, report, projects }, null, 1) + '\n';
const args = process.argv.slice(2);
const checkAt = args.indexOf('--check');
const checkDir = checkAt >= 0 ? args.splice(checkAt, 2)[1] : null;
if (args[0]) writeFileSync(args[0], json);
else process.stdout.write(json);
console.error(JSON.stringify(report));

/* --check <dir> writes the sets as a Tokens Studio bundle (one file per set, $metadata.json, $themes.json with both modes) and
   runs the Studio CLI over it before anything is uploaded: `studio lint` for the authoring rules and `studio resolve` for every
   reference, type and function in both modes. It resolves each value itself, so it cannot see what the CSS export emits (a
   dropped modifier, a declaration skipped): the export preview stays the gate on output, this one on structure. */
if (checkDir) rmSync(checkDir, { recursive: true, force: true });
for (const [project, { tokens }] of checkDir ? Object.entries(projects) : []) {
  const dir = join(checkDir, project);
  const sets = [...new Set(tokens.map((t) => t.token_set_name))];
  // Studio lists the sets in this order: core, semantic, the two themes, then the component and kit sets.
  const rank = (x) => (x.startsWith('core/') ? 0 : x.startsWith('semantic/') ? 1 : x === 'theme/light' ? 2 : x === 'theme/dark' ? 3 : 4);
  const order = [...sets].sort((a, b) => rank(a) - rank(b) || (rank(a) === 4 ? a.localeCompare(b) : sets.indexOf(a) - sets.indexOf(b)));
  for (const set of order) {
    const file = join(dir, `${set}.json`);
    mkdirSync(dirname(file), { recursive: true });
    const body = Object.fromEntries(tokens.filter((t) => t.token_set_name === set).map((t) => [t.name,
      { $type: t.type, $value: t.value, ...(t.description ? { $description: t.description } : {}) }]));
    writeFileSync(file, JSON.stringify(body, null, 1));
  }
  writeFileSync(join(dir, '$metadata.json'), JSON.stringify({ tokenSetOrder: order }));
  const mode = (name, off) => ({ id: name, name, group: 'mode',
    selectedTokenSets: Object.fromEntries(order.filter((x) => x !== off).map((x) => [x, 'enabled'])) });
  writeFileSync(join(dir, '$themes.json'), JSON.stringify([mode('light', 'theme/dark'), mode('dark', 'theme/light')]));
  for (const cmd of [['lint', dir, '--json'], ['resolve', dir, '--env', 'production', '--json']]) {
    const run = spawnSync('studio', cmd, { encoding: 'utf8', maxBuffer: 1 << 28 });
    let summary;
    try { summary = JSON.parse(run.stdout).data?.summary; } catch { summary = run.stdout.slice(0, 2000) || run.stderr.slice(0, 2000); }
    console.error(`${project} studio ${cmd[0]}: ${run.status === 0 ? 'clean' : 'FAILED'} ${JSON.stringify(summary)}`);
    if (run.status !== 0) process.exitCode = 1;
  }
}
