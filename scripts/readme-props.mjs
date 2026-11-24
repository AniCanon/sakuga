// Builds each component README's "## Props" table from the shipped declarations: the members its props type declares (its own and
// those it takes from another part of this package), their declared type, their default and their doc. A README never carries a
// hand-written props table: `npm run docs:props` writes the tables, and `npm run check:docs` fails while one differs.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libraries = { ui: '@anicanon/sakuga/ui', anicanonkit: '@anicanon/sakuga/anicanonkit' };

/** The TypeScript program over both entry points, with the package paths an example imports from. */
export function program(extraFiles = {}) {
  const config = ts.getParsedCommandLineOfConfigFile(join(root, 'tsconfig.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  const options = { ...config.options, noEmit: true,
    paths: { ...config.options.paths, '@anicanon/sakuga/anicanonkit': ['./src/anicanonkit/index.ts'] } };
  const entries = Object.keys(libraries).map((l) => join(root, 'src', l, 'index.ts'));
  const host = ts.createCompilerHost(options);
  const read = host.readFile.bind(host), exists = host.fileExists.bind(host), getSource = host.getSourceFile.bind(host);
  host.readFile = (f) => (f in extraFiles ? extraFiles[f] : read(f));
  host.fileExists = (f) => f in extraFiles || exists(f);
  host.getSourceFile = (f, lang, ...rest) => (f in extraFiles ? ts.createSourceFile(f, extraFiles[f], lang, true, ts.ScriptKind.TSX) : getSource(f, lang, ...rest));
  return ts.createProgram([...entries, ...Object.keys(extraFiles)], options, host);
}

/** Every component folder (`src/<lib>/<Name>/<Name>.tsx`), outside the internal parts, with the name and path its package exports it under. */
export function components(prog) {
  const checker = prog.getTypeChecker();
  const internal = Object.keys(JSON.parse(readFileSync(join(root, 'scripts/css-owners.json'), 'utf8')).internal || {});
  const out = [];
  for (const [lib, pkg] of Object.entries(libraries)) {
    const mod = checker.getSymbolAtLocation(prog.getSourceFile(join(root, 'src', lib, 'index.ts')));
    const exported = new Map();
    for (const sym of checker.getExportsOfModule(mod)) {
      const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
      for (const d of target.declarations || []) exported.set(d, sym.getName());
    }
    for (const e of readdirSync(join(root, 'src', lib), { withFileTypes: true })) {
      const file = join(root, 'src', lib, e.name, e.name + '.tsx');
      if (!e.isDirectory() || !existsSync(file) || internal.includes(e.name)) continue;
      const sf = prog.getSourceFile(file);
      const decl = sf && [...exported.keys()].find((d) => d.getSourceFile() === sf && declName(d) === e.name);
      out.push({ name: e.name, lib, pkg, dir: join(root, 'src', lib, e.name), file, decl, exportName: decl ? exported.get(decl) : undefined });
    }
  }
  return out;
}

function declName(d) {
  if (ts.isFunctionDeclaration(d) && d.name) return d.name.text;
  if (ts.isVariableDeclaration(d) && ts.isIdentifier(d.name)) return d.name.text;
  return undefined;
}

/* The component's function: a declaration, or the function a const holds (memo, forwardRef or an arrow) */
function fnOf(decl) {
  if (ts.isFunctionDeclaration(decl)) return decl;
  let init = decl.initializer;
  while (init && ts.isCallExpression(init)) init = init.arguments[0];
  return init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? init : undefined;
}

/* The defaults a component gives its props, where it destructures them: in its parameter or from the parameter's name */
function defaultsOf(fn) {
  const out = new Map();
  const take = (pattern) => {
    for (const el of pattern.elements) {
      if (!el.initializer) continue;
      const key = (el.propertyName || el.name).getText();
      out.set(key, el.initializer.getText().replace(/\s+/g, ' '));
    }
  };
  const param = fn?.parameters[0];
  if (!param) return out;
  if (ts.isObjectBindingPattern(param.name)) take(param.name);
  else if (ts.isIdentifier(param.name)) {
    const own = param.name.text;
    const visit = (n) => {
      if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer && ts.isIdentifier(n.initializer) && n.initializer.text === own) take(n.name);
      ts.forEachChild(n, visit);
    };
    if (fn.body) visit(fn.body);
  }
  return out;
}

const cell = (s) => String(s).replace(/\s+/g, ' ').replace(/\|/g, '\\|').trim();
const docText = (sym, checker) => ts.displayPartsToString(sym.getDocumentationComment(checker));
const tagOf = (sym, name) => sym.getJsDocTags().find((t) => t.name === name);

/** The "## Props" section body for one component: a table of its props, and a line for the native attributes it passes on. */
export function propsSection(prog, c) {
  const checker = prog.getTypeChecker();
  const fn = c.decl && fnOf(c.decl);
  const param = fn?.parameters[0];
  if (!param) return 'It takes no props.';
  const type = checker.getTypeAtLocation(param);
  const defaults = defaultsOf(fn);
  const rows = [], native = new Set();
  const own = (decl) => !/[\\/]node_modules[\\/]/.test(decl.getSourceFile().fileName);
  const row = (name, sym, decl, def, opened) => {
    const optional = (sym.flags & ts.SymbolFlags.Optional) !== 0;
    let declared = (decl.type ? decl.type.getText() : checker.typeToString(checker.getTypeOfSymbolAtLocation(sym, param)))
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    /* An inline object opened into rows of its own is named by its shape here, not spelled out twice */
    if (opened && /^\(?\{/.test(declared.trim())) declared = opened.suffix === '[].' ? 'object[]' : 'object';
    rows.push(`| \`${name}\` | \`${cell(declared)}\` | ${def !== undefined ? '`' + cell(def) + '`' : optional ? '' : 'required'} | ${cell(docText(sym, checker))} |`);
  };
  /* An object a prop takes (or a list of them) is opened one level, so each of its fields has its row: `jobs[].title` */
  const inner = (sym) => {
    let t = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(sym, param));
    let suffix = '.';
    if (checker.isArrayType(t)) { t = checker.getTypeArguments(t)[0]; suffix = '[].'; }
    if (t.isUnion() || !(t.flags & ts.TypeFlags.Object) || t.getCallSignatures().length) return undefined;
    const fields = checker.getPropertiesOfType(t);
    if (!fields.length || fields.length > 16 || !fields.every((f) => f.declarations?.[0] && own(f.declarations[0]))) return undefined;
    return { suffix, fields };
  };
  for (const sym of checker.getPropertiesOfType(type)) {
    const decl = sym.declarations?.[0];
    if (!decl) continue;
    if (!own(decl)) { native.add(sym.getName()); continue; }
    const name = sym.getName();
    const fallback = tagOf(sym, 'default');
    const walk = (path, s, d, def, depth) => {
      const open = depth < 2 ? inner(s) : undefined;
      row(path, s, d, def, open);
      if (open) for (const f of open.fields) walk(path + open.suffix + f.getName(), f, f.declarations[0], undefined, depth + 1);
    };
    walk(name, sym, decl, defaults.get(name) ?? (fallback ? ts.displayPartsToString(fallback.text) : undefined), 0);
  }
  const lines = [];
  if (rows.length) lines.push('| Prop | Type | Default | What it does |', '|---|---|---|---|', ...rows);
  if (native.size) lines.push((rows.length ? '\n' : '') + 'Any other attribute of its root element (`aria-*`, `data-*`, `id`, event handlers) is passed on to it.');
  return lines.join('\n') || 'It takes no props.';
}

/** A README's sections by their "## " heading, in order, with what comes before the first one. */
export function sections(text) {
  const parts = text.split(/^(?=## )/m);
  const head = parts[0];
  return { head, list: parts.slice(1).map((p) => ({ heading: p.split('\n')[0].slice(3).trim(), body: p.slice(p.indexOf('\n') + 1) })) };
}

/** The README with its Props section's body replaced. */
export function withProps(text, body) {
  return text.replace(/^## Props\n[\s\S]*?(?=^## )/m, `## Props\n\n${body}\n\n`);
}
