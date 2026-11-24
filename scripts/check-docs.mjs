// Everything the package exports says what it is where an app reads it: in the editor's hover, from the shipped declarations. A
// component's doc carries its version, the README's "Version:" line, so the code, the README and the component list agree; every
// other export has a doc, and every member of an exported props or options type has one. Each component README keeps one shape, its
// Props table matches the declarations and its Example compiles. --list prints what is wrong, by file.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { components as readmeComponents, program as readmeProgram, propsSection, sections as readmeSections } from './readme-props.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entries = ['src/ui/index.ts', 'src/anicanonkit/index.ts'].map((f) => join(root, f));
const config = ts.getParsedCommandLineOfConfigFile(join(root, 'tsconfig.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram(entries, config.options);
const checker = program.getTypeChecker();
const list = process.argv.includes('--list');

const problems = [];
const seen = new Set();
const where = (node) => {
  const sf = node.getSourceFile(), { line } = sf.getLineAndCharacterOfPosition(node.getStart());
  return `${relative(root, sf.fileName)}:${line + 1}`;
};
const docOf = (node) => ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
const described = (node) => docOf(node).some((d) => typeof d.comment === 'string' ? d.comment.trim() : d.comment?.length);
const versionOf = (node) => {
  for (const d of docOf(node)) for (const t of d.tags || []) if (t.tagName.text === 'version') return String(t.comment || '').trim();
  return undefined;
};
const readmeVersion = (file) => {
  const readme = join(dirname(file), 'README.md');
  if (!existsSync(readme)) return undefined;
  return (readFileSync(readme, 'utf8').match(/^Version: (\S+)$/m) || [])[1];
};

/* The members a props or options type declares itself; inherited ones carry their own type's docs */
function members(decl) {
  if (ts.isInterfaceDeclaration(decl)) return decl.members;
  if (ts.isTypeAliasDeclaration(decl)) {
    const out = [];
    const walk = (t) => {
      if (ts.isTypeLiteralNode(t)) out.push(...t.members);
      else if (ts.isIntersectionTypeNode(t) || ts.isUnionTypeNode(t)) t.types.forEach(walk);
      else if (ts.isParenthesizedTypeNode(t)) walk(t.type);
    };
    walk(decl.type);
    return out;
  }
  return [];
}

function checkDecl(name, decl) {
  const key = decl.getSourceFile().fileName + ':' + decl.pos;
  if (seen.has(key)) return;
  seen.add(key);
  const file = decl.getSourceFile().fileName;
  if (file.includes('/node_modules/')) return;
  /* Sheet.Group = SheetGroup: a part hung on its component, documented as its own function */
  if (ts.isBinaryExpression(decl) || ts.isPropertyAccessExpression(decl) || ts.isIdentifier(decl)) return;
  const isType = ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl);
  /* A variable's doc sits on its statement */
  const docNode = ts.isVariableDeclaration(decl) ? decl.parent.parent : decl;
  if (!isType) {
    const component = /^[A-Z]/.test(name) && (ts.isFunctionDeclaration(decl) || ts.isVariableDeclaration(decl));
    if (!described(docNode)) problems.push(`${where(decl)} ${name} has no doc`);
    if (component) {
      const want = readmeVersion(file);
      const own = name === file.split('/').pop().replace(/\.tsx?$/, '');
      if (want && own) {
        const has = versionOf(docNode);
        if (has !== want) problems.push(`${where(decl)} ${name} says @version ${has ?? '(none)'}, its README ${want}`);
      }
    }
    return;
  }
  for (const m of members(decl)) {
    if (!(ts.isPropertySignature(m) || ts.isMethodSignature(m))) continue;
    if (!described(m)) problems.push(`${where(m)} ${name}.${m.name.getText()} has no doc`);
  }
}

for (const entry of entries) {
  const mod = checker.getSymbolAtLocation(program.getSourceFile(entry));
  for (const sym of checker.getExportsOfModule(mod)) {
    const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
    for (const decl of target.declarations || []) checkDecl(sym.getName(), decl);
  }
}

/* Every component README in one shape, so a reader (or a model) finds each thing in the same place: the title and one sentence,
   then When to use, How it works, Props, Example and Accessibility, then the Used on and Version lines. The Props table is what
   `npm run docs:props` writes from the declarations above, and the Example compiles against the package as an app imports it. */
const ORDER = ['When to use', 'How it works', 'Props', 'Example', 'Accessibility'];
const PACKAGES = /^(react|@anicanon\/sakuga\/(ui|anicanonkit))$/;
const readmeProg = readmeProgram();
const examples = {};
for (const c of readmeComponents(readmeProg)) {
  const rel = relative(root, join(c.dir, 'README.md'));
  const text = readFileSync(join(c.dir, 'README.md'), 'utf8');
  const { head, list } = readmeSections(text);
  const intro = head.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (intro[0] !== `# ${c.name}`) problems.push(`${rel}: starts "# ${c.name}"`);
  if (intro.length !== 2 || /^(#|- |\||```)/.test(intro[1] || '')) problems.push(`${rel}: one sentence under the title says what it is`);
  const headings = list.map((s) => s.heading);
  if (headings.join(' · ') !== ORDER.join(' · ')) problems.push(`${rel}: its sections are ${headings.join(' · ') || 'none'}, not ${ORDER.join(' · ')}`);
  const section = (h) => list.find((s) => s.heading === h)?.body.trim() ?? '';
  const tail = section('Accessibility').split('\n').filter((l) => l.trim());
  if (!/^Used on: /.test(tail.at(-2) || '') || !/^Version: \S+$/.test(tail.at(-1) || '')) problems.push(`${rel}: ends with its "Used on:" and "Version:" lines`);
  if (tail.length < 3) problems.push(`${rel}: Accessibility says how it is reached and read`);
  if (!/^Use it /m.test(section('When to use'))) problems.push(`${rel}: When to use opens "Use it for …"`);
  if (!section('How it works')) problems.push(`${rel}: How it works is empty`);
  if (section('Props') !== propsSection(readmeProg, c)) problems.push(`${rel}: its Props table differs from the declarations (npm run docs:props)`);
  const blocks = [...section('Example').matchAll(/```(\w*)\n([\s\S]*?)```/g)];
  if (blocks.length !== 1 || blocks[0][1] !== 'tsx') { problems.push(`${rel}: Example is one tsx block`); continue; }
  const code = blocks[0][2];
  for (const [, from] of code.matchAll(/^import [^'"]*['"]([^'"]+)['"]/gm)) if (!PACKAGES.test(from)) problems.push(`${rel}: its Example imports ${from}, not the package`);
  if (!code.includes(`from '${c.pkg}'`)) problems.push(`${rel}: its Example imports ${c.exportName} from ${c.pkg}`);
  examples[join(root, '.readme-examples', `${c.name}.tsx`)] = code;
}
const exampleProg = readmeProgram(examples);
for (const d of ts.getPreEmitDiagnostics(exampleProg)) {
  if (!d.file || !(d.file.fileName in examples)) continue;
  const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
  problems.push(`${relative(root, d.file.fileName).replace(/^\.readme-examples\/(\w+)\.tsx$/, 'the $1 README Example')}:${line + 1} ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
}

/* exitCode, not exit(): a long --list into a pipe would be cut off at exit */
if (problems.length) {
  if (list) console.log(problems.sort().join('\n'));
  console.error(`${problems.length} problems: an export or member with no doc, a component whose @version differs from its README's, or a README out of its shape${list ? '' : ' (--list shows them)'}`);
  process.exitCode = 1;
} else console.log('Every export has a doc, every component carries its README\'s version, and every README has its sections, its props and an Example that compiles');
