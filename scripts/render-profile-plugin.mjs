import ts from 'typescript';
import MagicString from 'magic-string';
import {relative} from 'node:path';

// Diagnostic-only transform. No wrappers/memoization or state updates are added
// to components; counters count invocations, including discarded render attempts.
export function instrumentRenders(code, id) {
 const ast=ts.createSourceFile(id,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const result=new MagicString(code),names=[];
 function visit(node) {
  if(ts.isFunctionDeclaration(node)||ts.isFunctionExpression(node)||ts.isArrowFunction(node)) {
   const name=node.name?.getText(ast) ?? (ts.isVariableDeclaration(node.parent)?node.parent.name.getText(ast):undefined);
   if(name&&/^[A-Z]\w*$/.test(name)&&node.body) {
    const label=`${id}:${name}`;names.push(label);
    const counter=`globalThis.__sakugaRenderCalls?.push(${JSON.stringify(label)})`;
    if(ts.isBlock(node.body)) {
     let at=node.body.getStart(ast)+1, directive=false;
     for(const statement of node.body.statements) {
      if(!ts.isExpressionStatement(statement)||!ts.isStringLiteral(statement.expression))break;
      at=statement.end;directive=true;
     }
     result.appendLeft(at,(directive?';':'')+counter+';');
    }
    else {result.prependLeft(node.body.getStart(ast),'('+counter+',');result.appendLeft(node.body.end,')');}
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(ast);
 return {code:result.toString(),map:result.generateMap({hires:true,source:id,includeContent:true}),names};
}
export function renderProfilePlugin() {
 return {name:'sakuga-render-profile',enforce:'pre',transform(code,id) {
  const file=relative(process.cwd(),id).replaceAll('\\','/');
  if(file==='src/internal/presence.ts') {
   const effect='useEffect(() => {';
   if(!code.includes(effect))throw Error('presence effect changed; update diagnostic trace');
   return {code:code.replace(effect,effect+`globalThis.__sakugaPresence?.push({event:'effect',open,shown});`)
    .replace('setShown(true);',`(globalThis.__sakugaPresence?.push({event:'setShown',value:true,open,shown}),setShown(true));`)
    .replace('() => setShown(false)',`() => {globalThis.__sakugaPresence?.push({event:'exit-complete',open,shown});setShown(false)}`),map:null};
  }
  if(!/^(src\/|\.ladle\/).*\.tsx$/.test(file))return;
  if(file==='.ladle/components.tsx') {
   code=`import {Profiler as RenderProfiler} from 'react';\n`+code;
   const target='<div data-sk-story style={{ display: \'flow-root\' }}>{children}</div>';
   if(!code.includes(target))throw Error('showcase stage changed; update profiling boundary');
   code=code.replace(target,`<div data-sk-story style={{ display: 'flow-root' }}><RenderProfiler id="sakuga-story" onRender={(id,phase,actualDuration,baseDuration,startTime,commitTime)=>globalThis.__sakugaCommits?.push({id,phase,actualDuration,baseDuration,startTime,commitTime})}>{children}</RenderProfiler></div>`);
  }
  return instrumentRenders(code,file);
 }};
}
